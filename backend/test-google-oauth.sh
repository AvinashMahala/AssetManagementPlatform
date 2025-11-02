#!/bin/bash

echo "========================================"
echo "Testing Google OAuth Integration"
echo "========================================"
echo ""

echo "Simulating Google OAuth Login:"
echo "-------------------------------"
curl -s -X POST http://localhost:5001/api/auth/google-auth \
  -H "Content-Type: application/json" \
  -d '{
    "id": "108234567890123456789",
    "email": "testuser@gmail.com",
    "name": "Test User from Google",
    "picture": "https://lh3.googleusercontent.com/a/default-user",
    "verified_email": true
  }' | python3 -c "
import sys, json
try:
    d = json.load(sys.stdin)
    if d.get('success'):
        print('✅ Google OAuth SUCCESS')
        print('   User:', d['data']['user'].get('username'))
        print('   Email:', d['data']['user'].get('email'))
        print('   Name:', d['data']['user'].get('name'))
        print('   Email Verified:', d['data']['user'].get('isEmailVerified'))
        print('   Access Token:', d['data']['tokens']['accessToken'][:50] + '...')
    else:
        print('❌ Google OAuth FAILED')
        print('   Error:', d.get('error') or d.get('message'))
except Exception as e:
    print('❌ Error:', str(e))
"

echo ""
echo "========================================"
