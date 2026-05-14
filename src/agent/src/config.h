#ifndef CONFIG_H
#define CONFIG_H

// WiFi Configuration
#define WIFI_SSID "YOUR_SSID"
#define WIFI_PASSWORD "YOUR_PASSWORD"

// API Configuration
#define API_HOST "localhost"
#define API_PORT 8080
#define API_BASE_URL "http://localhost:8080/api"

// Agent Configuration
#define AGENT_ID 1
#define AGENT_NAME "Drink Dispenser 1"

// MQTT Configuration
#define MQTT_BROKER_HOST API_HOST   // same host as the REST API
#define MQTT_BROKER_PORT 1883
#define MQTT_AGENT_ID    "dispenser-1"

// Hardware Pins
#define PUMP_1_PIN 16
#define PUMP_2_PIN 17
#define PUMP_3_PIN 18
#define PUMP_4_PIN 19
#define SENSOR_PIN 35

// Timing
#define CONNECT_TIMEOUT 10000  // 10 seconds
#define REQUEST_TIMEOUT 5000   // 5 seconds

#endif // CONFIG_H
