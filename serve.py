"""
SAM – YOUR SECOND MIND
Production-grade Local HTTP Server
Supports Dual-Stack (IPv4 127.0.0.1 + IPv6 ::1 localhost)
Threading, Non-blocking, CORS-enabled, SPA-fallback
"""
import socket
import os
import sys
import mimetypes
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler

PORT = 3000
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

# Ensure common MIME types are registered
mimetypes.init()
mimetypes.add_type('text/javascript', '.js')
mimetypes.add_type('application/javascript', '.mjs')
mimetypes.add_type('text/css', '.css')
mimetypes.add_type('image/svg+xml', '.svg')
mimetypes.add_type('application/json', '.json')

class SAMRequestHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        super().end_headers()

    def do_GET(self):
        # Gracefully handle favicon requests
        if self.path == '/favicon.ico':
            favicon_path = os.path.join(DIRECTORY, 'favicon.ico')
            if not os.path.exists(favicon_path):
                self.send_response(204) # No Content
                self.end_headers()
                return

        # SPA fallback: if file does not exist, serve index.html
        path_without_query = self.path.split('?')[0].split('#')[0]
        local_path = os.path.join(DIRECTORY, path_without_query.lstrip('/'))
        if not os.path.exists(local_path) and not path_without_query.startswith('/src'):
            self.path = '/index.html'

        return super().do_GET()

    def log_message(self, format, *args):
        # Format friendly log output
        sys.stdout.write(f"[SAM Server] {self.address_string()} - {format % args}\n")
        sys.stdout.flush()

class DualStackServer(ThreadingHTTPServer):
    address_family = socket.AF_INET6
    daemon_threads = True

    def server_bind(self):
        # Allow IPv4 and IPv6 simultaneously on Windows/Linux/macOS
        try:
            self.socket.setsockopt(socket.IPPROTO_IPV6, socket.IPV6_V6ONLY, 0)
        except (AttributeError, OSError):
            pass
        self.socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        super().server_bind()

def run_server():
    os.chdir(DIRECTORY)
    server = None
    actual_port = PORT

    # Try dual-stack IPv6/IPv4 first
    for port in [3000, 3001, 8080, 8000]:
        try:
            server = DualStackServer(('', port), SAMRequestHandler)
            actual_port = port
            break
        except Exception:
            continue

    # If dual-stack socket fails on older setups, fallback to IPv4
    if not server:
        for port in [3000, 3001, 8080, 8000]:
            try:
                server = ThreadingHTTPServer(('0.0.0.0', port), SAMRequestHandler)
                actual_port = port
                break
            except Exception:
                continue

    if not server:
        print("[ERROR] Could not bind to ports 3000, 3001, 8080, or 8000.")
        sys.exit(1)

    url_localhost = f"http://localhost:{actual_port}"
    url_ip = f"http://127.0.0.1:{actual_port}"

    print("=" * 64, flush=True)
    print("  SAM – YOUR SECOND MIND (Server Ready)", flush=True)
    print("  'Your Mind Is for Living. SAM Is for Remembering.'", flush=True)
    print("-" * 64, flush=True)
    print(f"  Access via Localhost : {url_localhost}", flush=True)
    print(f"  Access via IP        : {url_ip}", flush=True)
    print(f"  Root Directory       : {DIRECTORY}", flush=True)
    print("=" * 64, flush=True)

    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n[SAM Server] Stopping gracefully...")
        server.server_close()

if __name__ == '__main__':
    run_server()
