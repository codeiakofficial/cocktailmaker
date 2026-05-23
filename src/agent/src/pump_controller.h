#ifndef PUMP_CONTROLLER_H
#define PUMP_CONTROLLER_H

#include <Arduino.h>
#include "config.h"
#include "config_manager.h"

class PumpController {
private:
    const int pins[PUMP_COUNT] = {
        PUMP_1_PIN, PUMP_2_PIN, PUMP_3_PIN, PUMP_4_PIN,
        PUMP_5_PIN, PUMP_6_PIN, PUMP_7_PIN, PUMP_8_PIN,
    };

public:
    PumpController() {
        for (int i = 0; i < PUMP_COUNT; i++) {
            pinMode(pins[i], OUTPUT);
            digitalWrite(pins[i], LOW);
        }
    }

    void dispense(int pump_id, int duration_ms) {
        if (pump_id < 0 || pump_id >= PUMP_COUNT) return;
        digitalWrite(pins[pump_id], HIGH);
        delay(duration_ms);
        digitalWrite(pins[pump_id], LOW);
    }

    void emergency_stop() {
        for (int i = 0; i < PUMP_COUNT; i++) {
            digitalWrite(pins[i], LOW);
        }
    }

    bool is_pump_running(int pump_id) {
        if (pump_id < 0 || pump_id >= PUMP_COUNT) return false;
        return digitalRead(pins[pump_id]) == HIGH;
    }
};

#endif // PUMP_CONTROLLER_H
