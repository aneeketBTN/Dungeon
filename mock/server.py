#!/usr/bin/env python3
"""Mock Portal server: static files + a tiny shared leaderboard API (stdlib only).

Run:  python server.py [port]      (argv, else $PORT, else 8099)
Serves the project root so the mock can use the approved output assets.
Leaderboard persists beside this file in leaderboard.json.

Endpoints:
  GET  /api/leaderboard        -> {"entries":[{name,best,test,plays}, ...]}
  POST /api/score  {name,test,pct,score,max}  -> updated leaderboard
Falls back gracefully: if this server isn't used, the front-end uses localStorage.
"""
import json, os, sys, threading
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import urlparse

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else int(os.environ.get("PORT") or 8099)
MOCK_ROOT = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(MOCK_ROOT)
LB_FILE = os.path.join(MOCK_ROOT, "leaderboard.json")
_lock = threading.Lock()


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

    def _send_json(self, obj, code=200):
        body = json.dumps(obj).encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Cache-Control", "no-store")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        path = urlparse(self.path).path
        if path == "/api/leaderboard":
            return self._send_json(_board())
        if path == "/":
            self.send_response(302)
            self.send_header("Location", "/mock/t6.html")
            self.end_headers()
            return
        return super().do_GET()

    def do_POST(self):
        if urlparse(self.path).path == "/api/score":
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
    ThreadingHTTPServer(("0.0.0.0", PORT), Handler).serve_forever()
