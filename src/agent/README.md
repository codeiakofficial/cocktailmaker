# ESP32 Drink Dispenser Agent

This is the firmware for the ESP32 microcontroller that physically dispenses drinks.

## Setup

### Prerequisites
- **VSCode with PlatformIO extension** (install from VSCode Extensions)
- **Arduino IDE knowledge** (optional, but helpful)
- **ESP32 DevKit** (or compatible board)

### Installation

1. **Install PlatformIO Extension in VSCode**
   - Open VSCode
   - Go to Extensions (Cmd+Shift+X)
   - Search "PlatformIO IDE"
   - Click Install

2. **Update configuration**
   - Edit `src/config.h` with your WiFi SSID/password
   - Set `API_HOST` and `API_PORT` to match your backend
   - Configure `PUMP_X_PIN` for your hardware pins

3. **Upload to ESP32**
   - Connect ESP32 via USB
   - In VSCode, click PlatformIO icon on left sidebar
   - Select your environment (esp32devkitc or similar)
   - Click "Upload and Monitor"

## Project Structure

```
agent/
├── src/
│   ├── main.cpp              # Main firmware entry point
│   ├── config.h              # Configuration & pins
│   ├── pump_controller.h     # Hardware control logic
│   └── api_client.h          # Backend communication
├── test/                     # Unit tests (run on your PC)
│   └── test_pump_logic.cpp
├── mock/                     # Mock agent for testing
│   └── mock_agent.py         # Simulates ESP32 behavior
├── platformio.ini            # PlatformIO config
└── README.md
```

## Testing (Without Hardware)

### Option 1: Run Mock Agent Locally

```bash
cd src/agent
python mock/mock_agent.py 5001
```

Then test the API:
```bash
curl http://localhost:5001/status
curl -X POST http://localhost:5001/dispense \
  -H "Content-Type: application/json" \
  -d '{"pump_id": 0, "duration_ms": 500}'
```

### Option 2: Full Stack Testing with Docker

```bash
cd src/agent
docker-compose -f docker-compose.test.yml up
```

This starts:
- Backend on `http://localhost:8080`
- Mock Agent on `http://localhost:5001`

### Option 3: Unit Tests

```bash
cd src/agent
pio test
```

## Communication Protocol

### Agent ↔ Backend API

**Get Recipe:**
```
GET /api/recipe/:id
Response: { name, recipeIngredients: [{name, quantity, unit}] }
```

**Report Status:**
```
POST /api/agent/:id
Body: { id, name, isReady, message }
```

### Frontend ↔ Agent (Optional Direct Control)

You could also add direct agent control from the frontend:

```
GET /api/agent/:id/status     → get current status
POST /api/agent/:id/dispense  → dispense recipe
```

## Hardware Wiring

### Pins (default configuration)
- **Pump 1:** GPIO 16 → Relay 1
- **Pump 2:** GPIO 17 → Relay 2
- **Pump 3:** GPIO 18 → Relay 3
- **Pump 4:** GPIO 19 → Relay 4
- **Sensor (optional):** GPIO 35 → Input

### Relay Module Connection
```
ESP32       Relay Module
GPIO        IN
GND         GND
5V          VCC
Output Pins → Pump/Valve
```

## Workflow: Backend → Agent → Dispense

1. **Frontend** selects a recipe and clicks "Dispense"
2. **Backend** creates an agent command (or frontend calls agent directly)
3. **Agent firmware** receives the request via `/dispense` endpoint
4. **Agent** uses `PumpController` to activate pumps with calculated timing
5. **Drinks** are dispensed! 🍹

## Development Tips

- Edit `src/config.h` to switch between WiFi networks without recompiling
- Use `Serial.println()` for debugging (view in PlatformIO's Serial Monitor)
- The `PumpController` is hardware-agnostic and can be unit tested on your PC
- Mock agent is useful for frontend/backend testing without ESP32

## Next Steps

- [ ] Integrate Backend API call to fetch recipes
- [ ] Add pump calibration (timing per ml)
- [ ] Implement error detection (flow sensors)
- [ ] Add OTA (Over-The-Air) updates
- [ ] Create mobile app direct control

## Resources

- [PlatformIO Documentation](https://docs.platformio.org/)
- [ESP32 Arduino Framework](https://github.com/espressif/arduino-esp32)
- [ArduinoJson Documentation](https://arduinojson.org/)
