#!/bin/bash
# Integration test script - tests backend API endpoints used by the ESP32 agent
# Usage: bash test_integration.sh

set -e

BACKEND_URL="http://localhost:8080"

echo "=== Cocktail Maker Integration Test ==="
echo ""

# Check if backend is running
echo "1. Checking Backend..."
if curl -sf "$BACKEND_URL/api/recipe" > /dev/null; then
    echo "✓ Backend is running"
else
    echo "✗ Backend is not running on $BACKEND_URL"
    exit 1
fi

# Get recipes from backend
echo "2. Fetching recipes from backend..."
RECIPES=$(curl -sf "$BACKEND_URL/api/recipe")
RECIPE_ID=$(echo "$RECIPES" | grep -o '"id":[0-9]*' | head -1 | grep -o '[0-9]*')

if [ -z "$RECIPE_ID" ]; then
    echo "✗ No recipes found in backend"
    exit 1
fi
echo "✓ Found recipe with ID: $RECIPE_ID"

# Get recipe details (mirrors what the ESP32 fetches before dispensing)
echo "3. Fetching recipe details..."
RECIPE=$(curl -sf "$BACKEND_URL/api/recipe/$RECIPE_ID")
RECIPE_NAME=$(echo "$RECIPE" | grep -o '"name":"[^"]*' | head -1 | cut -d'"' -f4)
echo "✓ Recipe: $RECIPE_NAME"

# Get agents from backend
echo "4. Fetching agents from backend..."
AGENTS=$(curl -sf "$BACKEND_URL/api/agent")
AGENT_COUNT=$(echo "$AGENTS" | grep -o '"id":[0-9]*' | wc -l | tr -d ' ')
if [ "$AGENT_COUNT" -eq 0 ]; then
    echo "✗ No agents found in backend"
    exit 1
fi
echo "✓ Found $AGENT_COUNT agent(s)"

echo ""
echo "=== All Tests Passed! ==="
