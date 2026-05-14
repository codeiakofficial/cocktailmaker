#include <Arduino.h>
#include <WiFi.h>
#include <ArduinoJson.h>
#include "config.h"
#include "pump_controller.h"
#include "api_client.h"
#include "mqtt_client.h"

PumpController pump;
APIClient api;
MqttClient mqtt(pump, api);

void setup() {
    Serial.begin(115200);
    delay(100);
    
    Serial.println("\n\n[AGENT] Starting Drink Dispenser Agent...");
    Serial.printf("[AGENT] ID: %d, Name: %s\n", AGENT_ID, AGENT_NAME);
    
    // Connect to WiFi
    Serial.printf("[WiFi] Connecting to SSID: %s\n", WIFI_SSID);
    WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
    
    int attempts = 0;
    while (WiFi.status() != WL_CONNECTED && attempts < 20) {
        delay(500);
        Serial.print(".");
        attempts++;
    }
    
    if (WiFi.status() == WL_CONNECTED) {
        Serial.println();
        Serial.print("[WiFi] Connected! IP: ");
        Serial.println(WiFi.localIP());
    } else {
        Serial.println();
        Serial.println("[WiFi] Failed to connect!");
    }

    // Connect to MQTT broker and publish online status
    mqtt.begin();
}

void loop() {
    if (WiFi.status() != WL_CONNECTED) {
        Serial.println("[WiFi] Reconnecting...");
        WiFi.reconnect();
        delay(5000);
        return;
    }
    
    // Drive MQTT keep-alive and handle reconnects
    mqtt.loop();
}
