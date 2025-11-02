#!/bin/bash

echo "================================"
echo "Testing Authentication Setup"
echo "================================"
echo ""

echo "Environment Variables:"
echo "DISABLE_AUTH=$(grep DISABLE_AUTH .env | cut -d '=' -f2)"
echo "DEV_USER_ID=$(grep DEV_USER_ID .env | cut -d '=' -f2)"
echo ""

echo "Testing API Endpoints:"
echo "----------------------"

echo -n "1. Properties: "
curl -s http://localhost:5001/api/properties | python3 -c "import sys, json; d=json.load(sys.stdin); print('✓ Success' if d.get('success') else '✗ Failed:', d.get('error', ''))" 2>/dev/null || echo "✗ Error"

echo -n "2. Tenants: "
curl -s http://localhost:5001/api/tenants | python3 -c "import sys, json; d=json.load(sys.stdin); print('✓ Success' if d.get('success') else '✗ Failed:', d.get('error', ''))" 2>/dev/null || echo "✗ Error"

echo -n "3. Units: "
curl -s http://localhost:5001/api/units | python3 -c "import sys, json; d=json.load(sys.stdin); print('✓ Success' if d.get('success') else '✗ Failed:', d.get('error', ''))" 2>/dev/null || echo "✗ Error"

echo -n "4. Leases: "
curl -s http://localhost:5001/api/leases | python3 -c "import sys, json; d=json.load(sys.stdin); print('✓ Success' if d.get('success') else '✗ Failed:', d.get('error', ''))" 2>/dev/null || echo "✗ Error"

echo -n "5. Payments: "
curl -s http://localhost:5001/api/rent-payments | python3 -c "import sys, json; d=json.load(sys.stdin); print('✓ Success' if d.get('success') else '✗ Failed:', d.get('error', ''))" 2>/dev/null || echo "✗ Error"

echo -n "6. Auth Profile: "
curl -s http://localhost:5001/api/auth/profile | python3 -c "import sys, json; d=json.load(sys.stdin); print('✓ Success -', d.get('data', {}).get('username', 'No username') if d.get('success') else '✗ Failed:', d.get('error', ''))" 2>/dev/null || echo "✗ Error"

echo ""
echo "================================"
