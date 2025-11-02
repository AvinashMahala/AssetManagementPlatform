#!/bin/bash

echo "========================================"
echo "Testing User Authentication"
echo "========================================"
echo ""

# Test data from database
ADMIN_EMAIL="admin@assetplatform.com"
ADMIN_PASSWORD="admin123"  # This is likely the original password

JOHN_EMAIL="john.doe@example.com"
JOHN_PASSWORD="password123"

echo "1. Testing Admin Login:"
echo "   Email: $ADMIN_EMAIL"
echo "   Password: $ADMIN_PASSWORD"
curl -s -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$ADMIN_EMAIL\",\"password\":\"$ADMIN_PASSWORD\"}" | python3 -c "import sys, json; d=json.load(sys.stdin); print('   Result:', 'SUCCESS ✓' if d.get('success') else 'FAILED ✗'); print('   Message:', d.get('message') or d.get('error'))"

echo ""
echo "2. Testing John Owner Login:"
echo "   Email: $JOHN_EMAIL"
echo "   Password: $JOHN_PASSWORD"
curl -s -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$JOHN_EMAIL\",\"password\":\"$JOHN_PASSWORD\"}" | python3 -c "import sys, json; d=json.load(sys.stdin); print('   Result:', 'SUCCESS ✓' if d.get('success') else 'FAILED ✗'); print('   Message:', d.get('message') or d.get('error'))"

echo ""
echo "3. Testing Invalid Credentials:"
echo "   Email: test@test.com"
curl -s -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"test@test.com\",\"password\":\"wrong\"}" | python3 -c "import sys, json; d=json.load(sys.stdin); print('   Result:', 'SUCCESS ✓' if d.get('success') else 'FAILED ✗ (Expected)'); print('   Message:', d.get('message') or d.get('error'))"

echo ""
echo "========================================"
