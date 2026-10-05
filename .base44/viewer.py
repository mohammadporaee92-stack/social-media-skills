import os, html, re
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
ROOT = "/app/skills"
def page(title, body):
    return f"<!doctype html><meta charset=utf-8><title>{html.escape(title)}</title><body style='font:16px system-ui;max-width:860px;margin:2rem auto;padding:0 1rem'><h1>{html.escape(title)}</h1>{body}</body>".encode()
class H(BaseHTTPRequestHandler):
    def do_GET(self):
        name = self.path.strip("/")
        if name == "":
            items = "".join(f"<li><a href='/{d}'>{d}</a></li>" for d in sorted(os.listdir(ROOT)) if os.path.isdir(f"{ROOT}/{d}"))
            out = page("Social Media Skills", f"<ul>{items}</ul>")
        elif re.fullmatch(r"[\w-]+", name) and os.path.exists(f"{ROOT}/{name}/SKILL.md"):
            txt = open(f"{ROOT}/{name}/SKILL.md").read()
            out = page(name, f"<p><a href='/'>&larr; all skills</a></p><pre style='white-space:pre-wrap'>{html.escape(txt)}</pre>")
        else:
            self.send_response(404); self.end_headers(); return
        self.send_response(200); self.send_header("Content-Type","text/html"); self.end_headers(); self.wfile.write(out)
ThreadingHTTPServer(("0.0.0.0", 3000), H).serve_forever()
