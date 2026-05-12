#!/bin/bash

# Mock Agent - Simulates ESP32 for testing
# This is a lightweight HTTP server that acts like the agent

PORT=${1:-5001}
BACKEND_URL="http://localhost:8080"

echo "Starting Mock Agent on port $PORT"
echo "Backend URL: $BACKEND_URL"

# Start a simple HTTP server that responds to agent requests
python3 << 'PYTHON_EOF'
import http.server
import socketserver
import json
import sys
import time

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 5001

class MockAgentHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path == "/status":
            self.send_response(200)
            self.send_header("Content-type", "application/json")
            self.end_headers()
            response = {
                "id": 1,
                "name": "Mock Drink Dispenser",
                "status": "ready",
                "pumps": [
                    {"id": 0, "running": False},
                    {"id": 1, "running": False},
                    {"id": 2, "running": False},
                    {"id": 3, "running": False}
                ]
            }
            self.wfile.write(json.dumps(response).encode())
        else:
            self.send_response(404)
            self.end_headers()
    
    def do_POST(self):
        content_length = int(self.headers['Content-Length'])
        body = self.rfile.read(content_length)
        
        if self.path == "/dispense":
            try:
                data = json.loads(body)
                pump_id = data.get('pump_id', 0)
                duration = data.get('duration_ms', 100)
                
                print(f"[MOCK_AGENT] Dispensing from pump {pump_id} for {duration}ms")
                
                self.send_response(200)
                self.send_header("Content-type", "application/json")
                self.end_headers()
                response = {"success": True, "pump_id": pump_id, "duration_ms": duration}
                self.wfile.write(json.dumps(response).encode())
            except Exception as e:
                self.send_response(400)
                self.end_headers()
        else:
            self.send_response(404)
            self.end_headers()
    
    def log_message(self, format, *args):
        print(f"[MOCK_AGENT] {format % args}")

if __name__ == "__main__":
    with socketserver.TCPServer(("", PORT), MockAgentHandler) as httpd:
        print(f"Mock Agent running on port {PORT}")
        print("Endpoints:")
        print(f"  GET  http://localhost:{PORT}/status")
        print(f"  POST http://localhost:{PORT}/dispense")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nMock Agent stopped")
PYTHON_EOF
