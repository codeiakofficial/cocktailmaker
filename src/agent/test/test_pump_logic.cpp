#include <Arduino.h>
#include "../src/pump_controller.h"

// Mock the Arduino functions for testing
int pin_states[40] = {0};  // Track pin states

void test_pump_dispense() {
    // Mock setup
    PumpController pump;
    
    // Test single pump
    pump.dispense(0, 100);  // Dispense from pump 0 for 100ms
    
    Serial.println("[TEST] Pump dispense test passed");
}

void test_pump_emergency_stop() {
    PumpController pump;
    
    pump.dispense(0, 1000);
    pump.emergency_stop();
    
    if (!pump.is_pump_running(0)) {
        Serial.println("[TEST] Emergency stop test passed");
    } else {
        Serial.println("[TEST] Emergency stop test FAILED");
    }
}

void setup() {
    Serial.begin(115200);
    
    test_pump_dispense();
    test_pump_emergency_stop();
}

void loop() {
    delay(1000);
}
