#ifndef MQTT_CLIENT_H
#define MQTT_CLIENT_H

#include <Arduino.h>
#include <WiFiClient.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>
#include "config.h"
#include "pump_controller.h"
#include "api_client.h"
#include "config_manager.h"

#define MQTT_STATUS_TOPIC  "cocktailmaker/agents/" MQTT_AGENT_ID "/status"
#define MQTT_COMMAND_TOPIC "cocktailmaker/agents/" MQTT_AGENT_ID "/command"
#define MQTT_CONFIG_TOPIC  "cocktailmaker/agents/" MQTT_AGENT_ID "/config"

class MqttClient {
private:
    WiFiClient      _wifi;
    PubSubClient    _client;
    PumpController& _pump;
    APIClient&      _api;
    ConfigManager&  _config;

    static MqttClient* _instance;

    static void onMessage(char* topic, byte* payload, unsigned int length) {
        if (_instance) _instance->handleMessage(topic, payload, length);
    }

    void handleMessage(char* topic, byte* payload, unsigned int length) {
        if (strcmp(topic, MQTT_CONFIG_TOPIC) == 0) {
            char buf[1024];
            unsigned int len = length < sizeof(buf) - 1 ? length : sizeof(buf) - 1;
            memcpy(buf, payload, len);
            buf[len] = '\0';
            Serial.println("[MQTT] Received config");
            _config.apply_config(buf);
            return;
        }

        if (strcmp(topic, MQTT_COMMAND_TOPIC) != 0) return;

        Serial.print("[MQTT] Command on topic: ");
        Serial.println(topic);

        JsonDocument doc;
        if (deserializeJson(doc, payload, length)) {
            Serial.println("[MQTT] JSON parse error");
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
        int positional_idx = 0;
        for (JsonObject ingredient : ingredients) {
            const char* name     = ingredient["name"];
            double      quantity = ingredient["quantity"];
            int         duration_ms = (int)(quantity * 1000);

            int pump_idx;
            if (_config.has_config()) {
                pump_idx = _config.pump_for_ingredient_name(name);
                if (pump_idx == -1) {
                    Serial.print("[PUMP] No pump mapped for: ");
                    Serial.println(name);
                    positional_idx++;
                    continue;
                }
            } else {
                pump_idx = _config.pump_for_ingredient_positional(positional_idx);
            }

            Serial.print("[PUMP] Dispensing ");
            Serial.print(name);
            Serial.print(" via pump ");
            Serial.print(pump_idx);
            Serial.print(": ");
            Serial.print(quantity);
            Serial.println(" ml");

            _pump.dispense(pump_idx, duration_ms);
            positional_idx++;
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
                _client.subscribe(MQTT_CONFIG_TOPIC);
                Serial.println("[MQTT] Subscribed to command and config topics");
            } else {
                Serial.print("[MQTT] Connection failed, rc=");
                Serial.println(_client.state());
                delay(5000);
            }
        }
    }

public:
    MqttClient(PumpController& pump, APIClient& api, ConfigManager& config)
        : _client(_wifi), _pump(pump), _api(api), _config(config) {}

    void begin() {
        _instance = this;
        _config.load_from_nvs();

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
            _client.subscribe(MQTT_COMMAND_TOPIC);
            _client.subscribe(MQTT_CONFIG_TOPIC);
            Serial.println("[MQTT] Subscribed to command and config topics");
        } else {
            Serial.print("[MQTT] Initial connection failed, rc=");
            Serial.println(_client.state());
        }
    }

    void loop() {
        if (!_client.connected()) reconnect();
        _client.loop();
    }
};

MqttClient* MqttClient::_instance = nullptr;

#endif // MQTT_CLIENT_H
