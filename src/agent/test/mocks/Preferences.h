#pragma once
#include <map>
#include <string>

// Minimal mock for ESP32 NVS Preferences library
class Preferences {
public:
    std::map<std::string, int> _int_store;

    bool begin(const char* /*ns*/, bool /*read_only*/ = false) { return true; }
    void end() {}

    void putInt(const char* key, int value) { _int_store[key] = value; }
    int  getInt(const char* key, int def = -1) {
        auto it = _int_store.find(key);
        return it != _int_store.end() ? it->second : def;
    }
    void clear() { _int_store.clear(); }
};
