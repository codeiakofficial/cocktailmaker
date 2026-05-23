#ifndef API_CLIENT_H
#define API_CLIENT_H

#include <Arduino.h>
#include <WiFiClient.h>
#include <ArduinoJson.h>
#include "config.h"

class APIClient {
private:
    WiFiClient client;
    
public:
    APIClient() {}
    
    // Connect to backend API
    bool connect() {
        if (client.connect(API_HOST, API_PORT)) {
            return true;
        }
        return false;
    }
    
    // Send recipe request to backend
    // Returns JSON with recipe details: { name, recipeIngredients: [{name, quantity}] }
    bool get_recipe(int recipe_id, JsonDocument& response) {
        if (!connect()) {
            Serial.println("[API] Failed to connect to backend");
            return false;
        }
        
        String request = "GET /api/recipes/" + String(recipe_id) + " HTTP/1.1\r\n";
        request += "Host: " + String(API_HOST) + "\r\n";
        request += "Connection: close\r\n\r\n";
        
        client.print(request);
        
        // Read response headers
        while (client.connected()) {
            String line = client.readStringUntil('\n');
            if (line == "\r") break;
        }
        
        // Read and parse JSON body
        String json_str = client.readString();
        DeserializationError error = deserializeJson(response, json_str);
        
        client.stop();
        
        if (error) {
            Serial.print("[API] JSON parse error: ");
            Serial.println(error.c_str());
            return false;
        }
        
        return true;
    }
    
};
// Note: report_status() removed — agent status is now published via MQTT (see mqtt_client.h)

#endif // API_CLIENT_H
