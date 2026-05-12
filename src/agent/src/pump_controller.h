#ifndef PUMP_CONTROLLER_H
#define PUMP_CONTROLLER_H

#include <Arduino.h>
#include "config.h"

class PumpController {
private:
    const int pins[4] = {PUMP_1_PIN, PUMP_2_PIN, PUMP_3_PIN, PUMP_4_PIN};
    
public:
    PumpController() {
        for (int i = 0; i < 4; i++) {
            pinMode(pins[i], OUTPUT);
            digitalWrite(pins[i], LOW);
        }
    }
    
    // Dispense from pump (index 0-3) for duration_ms milliseconds
    void dispense(int pump_id, int duration_ms) {
        if (pump_id < 0 || pump_id >= 4) return;
        
        digitalWrite(pins[pump_id], HIGH);
        delay(duration_ms);
        digitalWrite(pins[pump_id], LOW);
    }
    
    // Emergency stop - turn off all pumps
    void emergency_stop() {
        for (int i = 0; i < 4; i++) {
            digitalWrite(pins[i], LOW);
        }
    }
    
    bool is_pump_running(int pump_id) {
        if (pump_id < 0 || pump_id >= 4) return false;
        return digitalRead(pins[pump_id]) == HIGH;
    }
};

#endif // PUMP_CONTROLLER_H
