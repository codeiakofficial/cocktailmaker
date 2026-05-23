#ifndef CONFIG_H
#define CONFIG_H

#include "config_local.h"

// Agent Configuration
#define AGENT_ID 1
#define AGENT_NAME "Drink Dispenser 1"

// MQTT Configuration
#define MQTT_BROKER_PORT 1883
#define MQTT_AGENT_ID    "dispenser-1"

// Hardware Pins
#define PUMP_1_PIN 16
#define PUMP_2_PIN 17
#define PUMP_3_PIN 18
#define PUMP_4_PIN 19
#define PUMP_5_PIN 21
#define PUMP_6_PIN 22
#define PUMP_7_PIN 23
#define PUMP_8_PIN 25
#define SENSOR_PIN 35

// Timing
#define CONNECT_TIMEOUT 10000  // 10 seconds
#define REQUEST_TIMEOUT 5000   // 5 seconds

#endif // CONFIG_H
