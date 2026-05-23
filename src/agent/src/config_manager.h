#ifndef CONFIG_MANAGER_H
#define CONFIG_MANAGER_H

#include <ArduinoJson.h>
#include <Preferences.h>
#include <string.h>

#define PUMP_COUNT 8

struct PumpEntry {
    int  ingredient_id = -1;
    char ingredient_name[64] = "";
};

class ConfigManager {
private:
    PumpEntry   _map[PUMP_COUNT];
    Preferences _prefs;
    bool        _has_config = false;

public:
    ConfigManager() {}

    void apply_config(const char* payload) {
        JsonDocument doc;
        if (deserializeJson(doc, payload)) return;

        for (int i = 0; i < PUMP_COUNT; i++) {
            _map[i].ingredient_id = -1;
            _map[i].ingredient_name[0] = '\0';
        }

        for (JsonObject slot : doc.as<JsonArray>()) {
            int         pump_index    = slot["pumpIndex"] | -1;
            int         ingredient_id = slot["ingredientId"] | -1;
            const char* name          = slot["ingredientName"] | "";
            if (pump_index >= 0 && pump_index < PUMP_COUNT) {
                _map[pump_index].ingredient_id = ingredient_id;
                strncpy(_map[pump_index].ingredient_name, name, 63);
                _map[pump_index].ingredient_name[63] = '\0';
            }
        }

        _has_config = true;
        save_to_nvs();
    }

    int ingredient_for_pump(int pump_index) const {
        if (pump_index < 0 || pump_index >= PUMP_COUNT) return -1;
        return _map[pump_index].ingredient_id;
    }

    int pump_for_ingredient(int ingredient_id) const {
        for (int i = 0; i < PUMP_COUNT; i++) {
            if (_map[i].ingredient_id == ingredient_id) return i;
        }
        return -1;
    }

    int pump_for_ingredient_name(const char* name) const {
        for (int i = 0; i < PUMP_COUNT; i++) {
            if (strcmp(_map[i].ingredient_name, name) == 0) return i;
        }
        return -1;
    }

    int pump_for_ingredient_positional(int pos) const { return pos; }

    bool has_config() const { return _has_config; }

    void save_to_nvs() {
        _prefs.begin("pump");
        for (int i = 0; i < PUMP_COUNT; i++) {
            char key[8];
            snprintf(key, sizeof(key), "pump_%d", i);
            _prefs.putInt(key, _map[i].ingredient_id);
        }
        _prefs.end();
    }

    void load_from_nvs() {
        _prefs.begin("pump", true);
        for (int i = 0; i < PUMP_COUNT; i++) {
            char key[8];
            snprintf(key, sizeof(key), "pump_%d", i);
            int val = _prefs.getInt(key, -1);
            if (val != -1) {
                _map[i].ingredient_id = val;
                _has_config = true;
            }
        }
        _prefs.end();
    }
};

#endif // CONFIG_MANAGER_H
