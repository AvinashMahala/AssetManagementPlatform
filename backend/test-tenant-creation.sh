#!/bin/bash

echo "========================================"
echo "Testing Tenant Creation API"
echo "========================================"
echo ""

# Test credentials
ADMIN_EMAIL="admin@assetplatform.com"
ADMIN_PASSWORD="admin123"

echo "1. Logging in to get JWT token..."
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$ADMIN_EMAIL\",\"password\":\"$ADMIN_PASSWORD\"}")

# Extract token from response
TOKEN=$(echo $LOGIN_RESPONSE | python3 -c "import sys, json; d=json.load(sys.stdin); print(d.get('data', {}).get('tokens', {}).get('accessToken', '')) if d.get('success') else ''")

if [ -z "$TOKEN" ]; then
    echo "❌ Failed to login and get token"
    echo "Response: $LOGIN_RESPONSE"
    exit 1
fi

echo "✅ Login successful, got JWT token"

echo ""
echo "2. Testing tenant creation with minimal required fields..."

TENANT_DATA='{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe.test@example.com",
  "phone": "+91-9876543210",
  "currentAddress": {
    "street": "123 Test Street",
    "city": "Test City",
    "state": "Test State",
    "pincode": "123456"
  },
  "status": "active"
}'

CREATE_RESPONSE=$(curl -s -X POST http://localhost:5001/api/tenants \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "$TENANT_DATA")

echo "Response: $CREATE_RESPONSE"

# Check if creation was successful
SUCCESS=$(echo $CREATE_RESPONSE | python3 -c "import sys, json; d=json.load(sys.stdin); print('true' if d.get('success') else 'false')")

if [ "$SUCCESS" = "true" ]; then
    echo "✅ Tenant creation successful!"
    TENANT_ID=$(echo $CREATE_RESPONSE | python3 -c "import sys, json; d=json.load(sys.stdin); print(d.get('data', {}).get('id', ''))")
    echo "   Created tenant ID: $TENANT_ID"
else
    echo "❌ Tenant creation failed"
    ERROR=$(echo $CREATE_RESPONSE | python3 -c "import sys, json; d=json.load(sys.stdin); print(d.get('error') or d.get('message', 'Unknown error'))")
    echo "   Error: $ERROR"
fi

echo ""
echo "3. Testing tenant creation with permanent address (optional field)..."

TENANT_DATA_FULL='{
  "firstName": "Jane",
  "lastName": "Smith",
  "email": "jane.smith.test@example.com",
  "phone": "+91-9876543211",
  "alternatePhone": "+91-9876543212",
  "dateOfBirth": "1990-05-15",
  "gender": "female",
  "occupation": "Software Engineer",
  "companyName": "Tech Corp",
  "monthlyIncome": 75000,
  "currentAddress": {
    "street": "456 Current Street",
    "city": "Current City",
    "state": "Current State",
    "pincode": "654321"
  },
  "permanentAddress": {
    "street": "789 Permanent Street",
    "city": "Permanent City",
    "state": "Permanent State",
    "pincode": "987654"
  },
  "emergencyContact": {
    "name": "Emergency Contact",
    "relationship": "Brother",
    "phone": "+91-9876543213"
  },
  "status": "active"
}'

CREATE_RESPONSE_FULL=$(curl -s -X POST http://localhost:5001/api/tenants \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "$TENANT_DATA_FULL")

echo "Response: $CREATE_RESPONSE_FULL"

SUCCESS_FULL=$(echo $CREATE_RESPONSE_FULL | python3 -c "import sys, json; d=json.load(sys.stdin); print('true' if d.get('success') else 'false')")

if [ "$SUCCESS_FULL" = "true" ]; then
    echo "✅ Full tenant creation successful!"
    TENANT_ID_FULL=$(echo $CREATE_RESPONSE_FULL | python3 -c "import sys, json; d=json.load(sys.stdin); print(d.get('data', {}).get('id', ''))")
    echo "   Created tenant ID: $TENANT_ID_FULL"
else
    echo "❌ Full tenant creation failed"
    ERROR_FULL=$(echo $CREATE_RESPONSE_FULL | python3 -c "import sys, json; d=json.load(sys.stdin); print(d.get('error') or d.get('message', 'Unknown error'))")
    echo "   Error: $ERROR_FULL"
fi

echo ""
echo "========================================"