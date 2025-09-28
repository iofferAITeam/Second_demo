#!/usr/bin/env python3
"""
Run server and client test together to see both outputs
"""

import asyncio
import subprocess
import time
import signal
import os

async def run_test_after_delay():
    """Wait for server to start, then run the test"""
    await asyncio.sleep(5)  # Wait for server to start
    
    print("🚀 Starting client test...")
    try:
        # Run the client test
        result = subprocess.run([
            "uv", "run", "python", "test_debug_final.py"
        ], capture_output=True, text=True, timeout=120)
        
        print("📤 CLIENT OUTPUT:")
        print(result.stdout)
        if result.stderr:
            print("📤 CLIENT STDERR:")
            print(result.stderr)
            
    except subprocess.TimeoutExpired:
        print("⏰ Client test timed out")
    except Exception as e:
        print(f"❌ Client test error: {e}")

async def main():
    print("🔧 Starting server with output capture...")
    
    # Start server process
    server_process = subprocess.Popen([
        "uv", "run", "uvicorn", "api_server:app", 
        "--host", "127.0.0.1", "--port", "8010"
    ], stdout=subprocess.PIPE, stderr=subprocess.STDOUT, 
       text=True, bufsize=1, universal_newlines=True)
    
    try:
        # Start the client test in background
        client_task = asyncio.create_task(run_test_after_delay())
        
        # Read server output line by line
        print("📺 SERVER OUTPUT:")
        timeout_count = 0
        while True:
            try:
                # Check if client test is done
                if client_task.done():
                    print("✅ Client test completed")
                    break
                
                # Read server output with timeout
                if server_process.poll() is not None:
                    print("❌ Server process ended")
                    break
                
                # Non-blocking read attempt
                line = server_process.stdout.readline()
                if line:
                    print(f"[SERVER] {line.strip()}")
                    timeout_count = 0
                else:
                    await asyncio.sleep(0.1)
                    timeout_count += 1
                    if timeout_count > 100:  # 10 seconds of no output
                        print("⏰ No server output for 10 seconds...")
                        timeout_count = 0
                        
            except Exception as e:
                print(f"❌ Error reading server output: {e}")
                break
                
        # Wait for client task to complete
        await client_task
        
    finally:
        # Clean up
        print("🧹 Cleaning up...")
        try:
            server_process.terminate()
            server_process.wait(timeout=5)
        except subprocess.TimeoutExpired:
            server_process.kill()
        except Exception as e:
            print(f"⚠️ Error cleaning up server: {e}")

if __name__ == "__main__":
    asyncio.run(main())