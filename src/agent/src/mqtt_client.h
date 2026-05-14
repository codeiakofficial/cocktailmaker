#ifndef MQTT_CLIENT_H
#define MQTT_CLIENT_H

#include <Arduino.h>
#include <WiFiClient.h>
#include <PubSubClient.h>
#include "config.h"

#define MQTT_STATUS_TOPIC "cocktailmaker/agents/" MQTT_AGENT_ID "/status"

class MqttClient {
private:
    WiFiClient   _wifi;
    PubSubClient _client;

    void reconnect() {
        while (!_client.connected()) {
            Serial.println("[MQTT] Connecting...");
            if (_client.connect(MQTT_AGENT_ID)) {
                Serial.println("[MQTT] Connected");
                _client.publish(MQTT_STATUS_TOPIC, "online", /*retain=*/true);
            } else {
                Serial.print("[MQTT] Connection failed, rc=");
                Serial.println(_client.state());
                delay(5000);
            }
        }
    }

public:
    MqttClient() : _client(_wifi) {}

    void begin() {
        _client.setServer(MQTT_BROKER_HOST, MQTT_BROKER_PORT);

        // Set Last Will and Testament before connecting
        _client.setKeepAlive(60);
        // Will is configured via connect() overload below
        const char* willTopic   = MQTT_STATUS_TOPIC;
        const char* willPayload = "offline";
        bool        willRetain  = true;
        uint8_t     willQos     = 0;

        Serial.println("[MQTT] Connecting with LWT...");
        if (_client.connect(MQTT_AGENT_ID,
                            /*user*/nullptr, /*pass*/nullptr,
                            willTopic, willQos, willRetain, willPayload)) {
            Serial.println("[MQTT] Connected");
            _client.publish(MQTT_STATUS_TOPIC, "online", /*retain=*/true);
            Serial.println("[MQTT] Published: online");
        } else {
            Serial.print("[MQTT] Initial connection failed, rc=");
            Serial.println(_client.state());
        }
    }

    void loop() {
        if (!_client.connected()) {
            reconnect();
        }
        _client.loop();
    }
};

#endif // MQTT_CLIENT_H
