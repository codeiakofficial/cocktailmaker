#ifndef MQTT_CLIENT_H
#define MQTT_CLIENT_H

#include <Arduino.h>
#include <WiFiClient.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>
#include "config.h"
#include "pump_controller.h"
#include "api_client.h"

#define MQTT_STATUS_TOPIC  "cocktailmaker/agents/" MQTT_AGENT_ID "/status"
#define MQTT_COMMAND_TOPIC "cocktailmaker/agents/" MQTT_AGENT_ID "/command"

class MqttClient {
private:
    WiFiClient      _wifi;
    PubSubClient    _client;
    PumpController& _pump;
    APIClient&      _api;

    static MqttClient* _instance;

    static void onMessage(char* topic, byte* payload, unsigned int length) {
        if (_instance) {
            _instance->handleCommand(topic, payload, length);
        }
    }

    void handleCommand(char* topic, byte* payload, unsigned int length) {
        Serial.print("[MQTT] Message on topic: ");
        Serial.println(topic);

        JsonDocument doc;
        DeserializationError err = deserializeJson(doc, payload, length);
        if (err) {
            Serial.print("[MQTT] JSON parse error: ");
            Serial.println(err.c_str());
            return;
        }

        int recipeId = doc["recipeId"];
        Serial.print("[MQTT] Fetching recipe id=");
        Serial.println(recipeId);

        JsonDocument recipeDoc;
        if (!_api.get_recipe(recipeId, recipeDoc)) {
            Serial.println("[MQTT] Failed to fetch recipe");
            return;
        }

        JsonArray ingredients = recipeDoc["recipeIngredients"].as<JsonArray>();
        int idx = 0;
        for (JsonObject ingredient : ingredients) {
            if (idx > 3) break;

            const char* name     = ingredient["name"];
            double      quantity = ingredient["quantity"];  // ml
            const char* unit     = ingredient["unit"];

            int duration_ms = (int)(quantity * 1000);

            Serial.print("[PUMP] Dispensing ");
            Serial.print(name);
            Serial.print(" via pump ");
            Serial.print(idx);
            Serial.print(": ");
            Serial.print(quantity);
            Serial.print(" ml (");
            Serial.print(duration_ms);
            Serial.println(" ms)");

            _pump.dispense(idx, duration_ms);
            idx++;
        }

        Serial.println("[MQTT] Dispense sequence complete");
    }

    void reconnect() {
        while (!_client.connected()) {
            Serial.println("[MQTT] Connecting...");
            if (_client.connect(MQTT_AGENT_ID)) {
                Serial.println("[MQTT] Connected");
                _client.publish(MQTT_STATUS_TOPIC, "online", /*retain=*/true);
                _client.subscribe(MQTT_COMMAND_TOPIC);
                Serial.println("[MQTT] Subscribed to command topic");
            } else {
                Serial.print("[MQTT] Connection failed, rc=");
                Serial.println(_client.state());
                delay(5000);
            }
        }
    }

public:
    MqttClient(PumpController& pump, APIClient& api)
        : _client(_wifi), _pump(pump), _api(api) {}

    void begin() {
        _instance = this;
        _client.setServer(MQTT_BROKER_HOST, MQTT_BROKER_PORT);
        _client.setKeepAlive(60);
        _client.setCallback(onMessage);

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
            _client.subscribe(MQTT_COMMAND_TOPIC);
            Serial.println("[MQTT] Subscribed to command topic");
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

MqttClient* MqttClient::_instance = nullptr;

#endif // MQTT_CLIENT_H
