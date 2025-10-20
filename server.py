#!/usr/bin/env python3
"""
Simple HTTP server with proper cache control headers
to ensure the latest version of files is always served
"""

from http.server import HTTPServer, SimpleHTTPRequestHandler
import sys

class NoCacheHTTPRequestHandler(SimpleHTTPRequestHandler):
    """HTTP request handler with cache control headers"""
    
    def end_headers(self):
        # Prevent caching to ensure updated files are always loaded
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()

def run(port=5000):
    server_address = ('0.0.0.0', port)
    httpd = HTTPServer(server_address, NoCacheHTTPRequestHandler)
    print(f'Server running on http://0.0.0.0:{port}/')
    httpd.serve_forever()

if __name__ == '__main__':
    run()
