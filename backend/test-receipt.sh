#!/bin/bash

echo "========================================"
echo "Testing Receipt Generation API"
echo "========================================"
echo ""

# Test data from database
ADMIN_EMAIL="admin@assetplatform.com"
ADMIN_PASSWORD="admin123"

echo "1. Testing Admin Login:"
echo "   Email: $ADMIN_EMAIL"
echo "   Password: $ADMIN_PASSWORD"
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$ADMIN_EMAIL\",\"password\":\"$ADMIN_PASSWORD\"}")

echo "   Raw response: $LOGIN_RESPONSE"
echo "$LOGIN_RESPONSE" | python3 -c "
import sys, json
try:
    d = json.load(sys.stdin)
    print('   Parsed response:', d)
    if d.get('success'):
        print('   Result: SUCCESS ✓')
        token = d.get('data', {}).get('tokens', {}).get('accessToken')
        if token:
            print('   Token obtained')
            # Save token for later use
            with open('/tmp/auth_token.txt', 'w') as f:
                f.write(token)
        else:
            print('   No token in response')
            print('   Tokens keys:', list(d.get('data', {}).get('tokens', {}).keys()) if d.get('data', {}).get('tokens') else 'No tokens')
    else:
        print('   Result: FAILED ✗')
        print('   Message:', d.get('message') or d.get('error'))
except Exception as e:
    print('   Result: FAILED ✗ - Invalid JSON response')
    print('   Error:', str(e))
"

echo ""
echo "2. Getting a Payment ID:"
# Try to get payments from the API
PAYMENTS_RESPONSE=$(curl -s -X GET http://localhost:5001/api/rent-payments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $(cat /tmp/auth_token.txt 2>/dev/null || echo '')")

echo "$PAYMENTS_RESPONSE" | python3 -c "
import sys, json
try:
    d = json.load(sys.stdin)
    if d.get('success') and d.get('data'):
        payments = d.get('data', [])
        if payments:
            payment_id = payments[0].get('id')
            print('   Found payment ID:', payment_id)
            # Save payment ID for later use
            with open('/tmp/payment_id.txt', 'w') as f:
                f.write(payment_id)
        else:
            print('   No payments found')
    else:
        print('   Failed to get payments')
        print('   Message:', d.get('message') or d.get('error'))
except:
    print('   Failed to parse payments response')
    print('   Raw response:', sys.stdin.read().strip())
"

echo ""
echo "3. Testing Receipt Generation:"
PAYMENT_ID=$(cat /tmp/payment_id.txt 2>/dev/null || echo '')
if [ -n "$PAYMENT_ID" ]; then
    echo "   Using payment ID: $PAYMENT_ID"
    RECEIPT_RESPONSE=$(curl -s -X POST http://localhost:5001/api/receipts/generate \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer $(cat /tmp/auth_token.txt 2>/dev/null || echo '')" \
      -d "{\"paymentId\":\"$PAYMENT_ID\"}")

    echo "$RECEIPT_RESPONSE" | python3 -c "
import sys, json
try:
    d = json.load(sys.stdin)
    if d.get('success'):
        print('   Result: SUCCESS ✓')
        receipt = d.get('data', {})
        print('   Receipt generated with ID:', receipt.get('id'))
        print('   Receipt number:', receipt.get('receiptNumber'))
    else:
        print('   Result: FAILED ✗')
        print('   Message:', d.get('message') or d.get('error'))
        if d.get('error'):
            print('   Error details:', d.get('error'))
        # Print the full response for debugging
        print('   Full response:', d)
except Exception as e:
    print('   Result: FAILED ✗ - Invalid JSON response')
    print('   Error:', str(e))
    print('   Raw response:', sys.stdin.read().strip())
"
else
    echo "   No payment ID available - skipping receipt generation test"
fi

echo ""
echo "========================================"

# Clean up temp files
rm -f /tmp/auth_token.txt /tmp/payment_id.txt