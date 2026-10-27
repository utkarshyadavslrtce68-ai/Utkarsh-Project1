"""
Zero-Dependency HTTP API Server for NLP Spelling and Grammar Checker
Built with Python's standard library `http.server`. Supports JSON API and CORS.
"""

import sys
import os
import json
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs

# Add root directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from python.nlp_pipeline import NLPPipeline
from python.edit_distance import levenshtein_matrix, backtrack_alignment


pipeline = NLPPipeline()


class NLPRequestHandler(BaseHTTPRequestHandler):
    def _send_cors_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")

    def do_OPTIONS(self):
        self.send_response(200)
        self._send_cors_headers()
        self.end_headers()

    def do_GET(self):
        parsed = urlparse(self.path)
        path = parsed.path

        if path == "/api/health":
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self._send_cors_headers()
            self.end_headers()
            self.wfile.write(json.dumps({"status": "healthy", "engine": "NLP-LexiCheck-1.0"}).encode("utf-8"))
            return

        if path == "/api/matrix":
            params = parse_qs(parsed.query)
            w1 = params.get("w1", [""])[0]
            w2 = params.get("w2", [""])[0]
            dist, dp = levenshtein_matrix(w1, w2)
            ops = backtrack_alignment(w1, w2, dp)

            response = {
                "source": w1,
                "target": w2,
                "distance": dist,
                "matrix": dp,
                "operations": ops
            }
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self._send_cors_headers()
            self.end_headers()
            self.wfile.write(json.dumps(response).encode("utf-8"))
            return

        self.send_response(404)
        self.end_headers()

    def do_POST(self):
        parsed = urlparse(self.path)
        if parsed.path == "/api/check":
            content_length = int(self.headers.get("Content-Length", 0))
            body = self.rfile.read(content_length).decode("utf-8")
            try:
                data = json.loads(body)
                text = data.get("text", "")
                result = pipeline.process(text)

                self.send_response(200)
                self.send_header("Content-Type", "application/json")
                self._send_cors_headers()
                self.end_headers()
                self.wfile.write(json.dumps(result).encode("utf-8"))
            except Exception as e:
                self.send_response(400)
                self.send_header("Content-Type", "application/json")
                self._send_cors_headers()
                self.end_headers()
                self.wfile.write(json.dumps({"error": str(e)}).encode("utf-8"))
            return

        self.send_response(404)
        self.end_headers()


def run_server(port=8000):
    server_address = ("", port)
    httpd = HTTPServer(server_address, NLPRequestHandler)
    print(f"[LexiCheck NLP Server] Running at http://127.0.0.1:{port}")
    print("Endpoints:")
    print(f"  * POST http://127.0.0.1:{port}/api/check")
    print(f"  * GET  http://127.0.0.1:{port}/api/matrix?w1=word1&w2=word2")
    print(f"  * GET  http://127.0.0.1:{port}/api/health")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nStopping server.")
        httpd.server_close()


if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
    run_server(port)
