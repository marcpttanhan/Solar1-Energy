"""Local preview server with HTTP Range support (needed for <video> seeking/streaming).

python3 -m http.server ignores Range headers, which stalls the second <video>
that seeks into hero.mp4. Production hosts handle Range; this mirrors that.
Usage: python3 .claude/serve.py [port]
"""
import errno
import os
import re
import sys
import time
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


class RangeHandler(SimpleHTTPRequestHandler):
    def send_head(self):
        m = re.fullmatch(r"bytes=(\d*)-(\d*)", self.headers.get("Range", ""))
        path = self.translate_path(self.path)
        if not m or not os.path.isfile(path):
            return super().send_head()
        size = os.path.getsize(path)
        start, end = m.groups()
        if start == "":
            start, end = max(size - int(end or 0), 0), size - 1
        else:
            start, end = int(start), min(int(end) if end else size - 1, size - 1)
        if start >= size or start > end:
            self.send_error(416)
            return None
        f = open(path, "rb")
        f.seek(start)
        self._remaining = end - start + 1
        self.send_response(206)
        self.send_header("Content-Type", self.guess_type(path))
        self.send_header("Content-Range", f"bytes {start}-{end}/{size}")
        self.send_header("Content-Length", str(self._remaining))
        self.send_header("Accept-Ranges", "bytes")
        self.end_headers()
        return f

    def copyfile(self, source, outputfile):
        remaining = getattr(self, "_remaining", None)
        if remaining is None:
            return super().copyfile(source, outputfile)
        while remaining > 0:
            chunk = source.read(min(64 * 1024, remaining))
            if not chunk:
                break
            outputfile.write(chunk)
            remaining -= len(chunk)

    def end_headers(self):
        if not self.headers.get("Range"):
            self.send_header("Accept-Ranges", "bytes")
        super().end_headers()


def bind(port, handler, retry_every=5):
    """Bind to 127.0.0.1:port, waiting (not failing) while another server holds it.

    Lets the systemd service take over the port whenever the desktop app's
    preview server stops, without either one killing the other.
    """
    waiting = False
    while True:
        try:
            return ThreadingHTTPServer(("127.0.0.1", port), handler)
        except OSError as e:
            if e.errno != errno.EADDRINUSE:
                raise
            if not waiting:
                print(f"port {port} busy; retrying every {retry_every}s", flush=True)
                waiting = True
            time.sleep(retry_every)


if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8080
    handler = partial(RangeHandler, directory=ROOT)
    server = bind(port, handler)
    print(f"serving {ROOT} on http://127.0.0.1:{port}", flush=True)
    server.serve_forever()
