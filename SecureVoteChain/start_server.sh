#!/bin/bash

echo "========================================"
echo " SecureVoteChain - Starting Server"
echo "========================================"
echo ""
echo "Server will run on http://localhost:5000"
echo "Frontend: http://localhost:3000 (if applicable)"
echo "Backend: http://localhost:5000"
echo ""
echo "CORS configured for localhost only (NOT 0.0.0.0)"
echo ""

cd "$(dirname "$0")"
python3 main.py
