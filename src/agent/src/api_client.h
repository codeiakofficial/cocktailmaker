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
        
        String request = "GET /api/recipe/" + String(recipe_id) + " HTTP/1.1\r\n";
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
    
    // Report agent status to backend
    bool report_status(bool is_ready, const String& message = "") {
        if (!connect()) {
            Serial.println("[API] Failed to connect to backend");
            return false;
        }
        
        JsonDocument payload;
        payload["id"] = AGENT_ID;
        payload["name"] = AGENT_NAME;
        payload["isReady"] = is_ready;
        payload["message"] = message;
        
        String json_str;
        serializeJson(payload, json_str);
        
        String request = "POST /api/agent/" + String(AGENT_ID) + " HTTP/1.1\r\n";
        request += "Host: " + String(API_HOST) + "\r\n";
        request += "Content-Type: application/json\r\n";
        request += "Content-Length: " + String(json_str.length()) + "\r\n";
        request += "Connection: close\r\n\r\n";
        request += json_str;
        
        client.print(request);
        
        // Read response
        while (client.connected()) {
            String line = client.readStringUntil('\n');
        }
        
        client.stop();
        return true;
    }
};

#endif // API_CLIENT_H
