#!/bin/bash
# Integration test script - tests full stack communication
# Usage: bash test_integration.sh

set -e

BACKEND_URL="http://localhost:8080"
AGENT_URL="http://localhost:5001"

echo "=== Cocktail Maker Integration Test ==="
echo ""

# Check if backend is running
echo "1. Checking Backend..."
if curl -s "$BACKEND_URL/api/recipe" > /dev/null 2>&1; then
    echo "✓ Backend is running"
else
    echo "✗ Backend is not running on $BACKEND_URL"
    exit 1
fi

# Check if mock agent is running
echo "2. Checking Mock Agent..."
if curl -s "$AGENT_URL/status" > /dev/null 2>&1; then
    echo "✓ Mock Agent is running"
else
    echo "✗ Mock Agent is not running on $AGENT_URL"
    exit 1
fi

# Get recipes from backend
echo "3. Fetching recipes from backend..."
RECIPES=$(curl -s "$BACKEND_URL/api/recipe")
RECIPE_ID=$(echo "$RECIPES" | grep -o '"id":[0-9]*' | head -1 | grep -o '[0-9]*')

if [ -z "$RECIPE_ID" ]; then
    echo "✗ No recipes found in backend"
    exit 1
fi
echo "✓ Found recipe with ID: $RECIPE_ID"

# Get recipe details
echo "4. Fetching recipe details..."
RECIPE=$(curl -s "$BACKEND_URL/api/recipe/$RECIPE_ID")
RECIPE_NAME=$(echo "$RECIPE" | grep -o '"name":"[^"]*' | cut -d'"' -f4)
echo "✓ Recipe name: $RECIPE_NAME"

# Test agent status
echo "5. Getting agent status..."
AGENT_STATUS=$(curl -s "$AGENT_URL/status")
echo "✓ Agent status: $AGENT_STATUS"

# Send dispense command to agent
echo "6. Testing dispense command..."
DISPENSE_RESPONSE=$(curl -s -X POST "$AGENT_URL/dispense" \
  -H "Content-Type: application/json" \
  -d '{"pump_id": 0, "duration_ms": 500}')
echo "✓ Dispense response: $DISPENSE_RESPONSE"

echo ""
echo "=== All Tests Passed! ==="
echo "System is ready for drink dispensing 🍹"
