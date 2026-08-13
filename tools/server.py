#!/usr/bin/env python3
"""Dungeon local server: static files, legacy leaderboard, and optional local grader.

Run:  python server.py [port]      (argv, else $PORT, else 8099)
Serves the project root so the mock can use the approved output assets.
Leaderboard persists beside this file in leaderboard.json.

Endpoints:
  GET  /api/leaderboard        -> {"entries":[{name,best,test,plays}, ...]}
  POST /api/score  {name,test,pct,score,max}  -> updated leaderboard
  GET  /api/written-authority/health
  POST /api/written-authority/prepare|grade|coach
Falls back gracefully: if this server isn't used, the front-end uses localStorage.
"""
import json, os, sys, threading, time
import ipaddress
import shutil
import subprocess
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import urlparse

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else int(os.environ.get("PORT") or 8099)
SERVER_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(SERVER_DIR)
LB_FILE = os.path.join(SERVER_DIR, "leaderboard.json")
_lock = threading.Lock()
_grader_slot = threading.BoundedSemaphore(1)
_prepare_slot = threading.BoundedSemaphore(1)
_prepared_lock = threading.Lock()
_prepared_evidence = {}
CONFIGURED_GRADER_MODEL = os.environ.get("DUNGEON_GRADER_MODEL", "")
APPROVED_GRADER_MODEL = os.environ.get("DUNGEON_GRADER_APPROVED_MODEL", "")
LOCAL_GRADER_ENABLED = (
    os.environ.get("DUNGEON_LOCAL_GRADER", "").lower() in ("1", "on", "true", "yes")
    and bool(CONFIGURED_GRADER_MODEL)
    and APPROVED_GRADER_MODEL == CONFIGURED_GRADER_MODEL
)
LOCAL_GRADER_TOOL = os.path.join(SERVER_DIR, "local-grader.mjs")
MAX_GRADE_BODY = 32 * 1024


def _load():
    try:
        with open(LB_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return {}


def _save(d):
    tmp = LB_FILE + ".tmp"
    with open(tmp, "w", encoding="utf-8") as f:
        json.dump(d, f)
    os.replace(tmp, LB_FILE)


def _board():
    with _lock:
        d = _load()
    entries = [
        {"name": k, "best": v.get("best", 0), "test": v.get("test", ""),
         "plays": v.get("plays", 0)}
        for k, v in d.items()
    ]
    entries.sort(key=lambda e: (-e["best"], e["name"].lower()))
    return {"entries": entries[:100]}


def _record(data):
    name = (str(data.get("name", "")).strip() or "anon")[:24]
    try:
        pct = float(data.get("pct", 0))
    except (TypeError, ValueError):
        pct = 0.0
    test = str(data.get("test", ""))[:48]
    with _lock:
        d = _load()
        rec = d.get(name, {"best": 0, "test": "", "plays": 0})
        rec["plays"] = rec.get("plays", 0) + 1
        if pct > rec.get("best", 0):
            rec["best"] = round(pct, 1)
            rec["test"] = test
        d[name] = rec
        _save(d)


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *a, **k):
        super().__init__(*a, directory=PROJECT_ROOT, **k)

    def _send_json(self, obj, code=200, cors=True):
        body = json.dumps(obj).encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        if cors:
            self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Cache-Control", "no-store")
        self.send_header("X-Content-Type-Options", "nosniff")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def _is_loopback(self):
        try:
            address = str(self.client_address[0]).split("%", 1)[0]
            if address.startswith("::ffff:"):
                address = address.rsplit(":", 1)[-1]
            return ipaddress.ip_address(address).is_loopback
        except ValueError:
            return False

    def _local_grader_allowed(self):
        return LOCAL_GRADER_ENABLED and self._is_loopback()

    def _same_origin_or_cli(self):
        origin = self.headers.get("Origin")
        if not origin:
            return True
        try:
            parsed = urlparse(origin)
            host = parsed.hostname or ""
            return parsed.scheme in ("http", "https") and host in ("localhost", "127.0.0.1", "::1") and parsed.netloc == self.headers.get("Host")
        except ValueError:
            return False

    def _run_grader(self, mode, payload=None, timeout=300):
        node = shutil.which("node")
        if not node:
            raise RuntimeError("Node.js is required for the local grader.")
        completed = subprocess.run(
            [node, LOCAL_GRADER_TOOL, mode],
            input=json.dumps(payload) if payload is not None else None,
            text=True,
            encoding="utf-8",
            errors="strict",
            capture_output=True,
            cwd=PROJECT_ROOT,
            timeout=timeout,
            check=False,
        )
        if completed.returncode != 0:
            message = (completed.stderr or "Local grader failed.").strip().splitlines()[0]
            raise RuntimeError(message[:240])
        return json.loads(completed.stdout or "{}")

    def do_GET(self):
        path = urlparse(self.path).path
        if path == "/api/leaderboard":
            return self._send_json(_board())
        if path in ("/api/local-grader/health", "/api/written-authority/health"):
            if not self._local_grader_allowed():
                return self._send_json({"available": False}, 404, cors=False)
            try:
                status = self._run_grader("--health", timeout=20)
                return self._send_json(status, 200 if status.get("available") else 503, cors=False)
            except Exception as error:
                return self._send_json({"available": False, "reason": str(error)}, 503, cors=False)
        if path == "/":
            self.send_response(302)
            self.send_header("Location", "/app/t6.html")
            self.end_headers()
            return
        return super().do_GET()

    def do_POST(self):
        path = urlparse(self.path).path
        if path in ("/api/local-grade", "/api/written-authority/prepare", "/api/written-authority/grade", "/api/written-authority/coach"):
            if not self._local_grader_allowed():
                return self._send_json({"error": "Local grader is not available."}, 404, cors=False)
            if not self._same_origin_or_cli():
                return self._send_json({"error": "Cross-origin local grading is not allowed."}, 403, cors=False)
            try:
                length = int(self.headers.get("Content-Length", 0))
            except (TypeError, ValueError):
                length = 0
            if length <= 0 or length > MAX_GRADE_BODY:
                return self._send_json({"error": "Invalid request size."}, 413, cors=False)
            slot = _prepare_slot if path == "/api/written-authority/prepare" else _grader_slot
            if not slot.acquire(blocking=False):
                return self._send_json({"error": "Dungeon is already preparing or checking a response."}, 429, cors=False)
            try:
                data = json.loads(self.rfile.read(length) or b"{}")
                if not isinstance(data, dict):
                    raise ValueError("Request body must be an object.")
                # The endpoint selects the operation; candidate-controlled JSON cannot
                # turn a coaching request into a rubric mark (or vice versa).
                data.pop("_preparedEvidence", None)
                if path == "/api/written-authority/prepare":
                    data["kind"] = "prepare"
                    result = self._run_grader("--stdin", data, timeout=60)
                    key = (str(data.get("courseId", "")), str(data.get("questionId", "")))
                    with _prepared_lock:
                        _prepared_evidence[key] = {"at": time.monotonic(), "evidence": result.get("evidence", [])}
                        if len(_prepared_evidence) > 64:
                            oldest = min(_prepared_evidence, key=lambda item: _prepared_evidence[item]["at"])
                            _prepared_evidence.pop(oldest, None)
                    return self._send_json({"ready": True}, 200, cors=False)
                data["kind"] = "coach" if path == "/api/written-authority/coach" else "grade"
                if data["kind"] == "grade":
                    key = (str(data.get("courseId", "")), str(data.get("questionId", "")))
                    with _prepared_lock:
                        cached = _prepared_evidence.get(key)
                        if cached and time.monotonic() - cached["at"] <= 900:
                            data["_preparedEvidence"] = cached["evidence"]
                result = self._run_grader("--stdin", data, timeout=360)
                return self._send_json(result, 200, cors=False)
            except subprocess.TimeoutExpired:
                return self._send_json({"error": "The local model timed out."}, 504, cors=False)
            except Exception as error:
                return self._send_json({"error": str(error)}, 400, cors=False)
            finally:
                slot.release()
        if path == "/api/score":
            try:
                n = int(self.headers.get("Content-Length", 0))
                data = json.loads(self.rfile.read(n) or b"{}")
                _record(data)
                return self._send_json(_board())
            except Exception as e:
                return self._send_json({"error": str(e)}, 400)
        self.send_error(404)

    def end_headers(self):
        # don't cache the static prototype while it is being revised
        if self.path.endswith((".html", ".js", ".css", "/")):
            self.send_header("Cache-Control", "no-cache")
        super().end_headers()

    def log_message(self, *a):
        pass


if __name__ == "__main__":
    print("Term 6 revision dashboard on http://localhost:%d/" % PORT)
    if LOCAL_GRADER_ENABLED:
        print("Approved local written-response grader enabled for loopback requests only")
    ThreadingHTTPServer(("0.0.0.0", PORT), Handler).serve_forever()
