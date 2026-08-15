"""Verification-only launcher that enables tools/server.py against the fake LM endpoint."""
import base64
import os
import runpy
import sys

if len(sys.argv) not in (3, 4):
    raise SystemExit("usage: start-local-grader-server.py PORT BASE64_TRANSCRIPT_ROOT [APPROVED_MODEL]")

port, encoded_root = sys.argv[1:3]
approved_model = sys.argv[3] if len(sys.argv) == 4 else "fake-qwen-verification"
transcript_root = base64.b64decode(encoded_root).decode("utf-8")
os.environ["DUNGEON_LOCAL_GRADER"] = "on"
os.environ["DUNGEON_TRANSCRIPTS"] = transcript_root
os.environ["DUNGEON_GRADER_MODEL"] = "fake-qwen-verification"
os.environ["DUNGEON_GRADER_APPROVED_MODEL"] = approved_model
os.environ["LM_STUDIO_BASE_URL"] = "http://127.0.0.1:12345/v1"
sys.argv = ["tools/server.py", port]
runpy.run_path("tools/server.py", run_name="__main__")
