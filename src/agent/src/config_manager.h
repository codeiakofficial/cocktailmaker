#ifndef CONFIG_MANAGER_H
#define CONFIG_MANAGER_H

// Stub — not yet implemented; tests will fail until commit 9
#define PUMP_COUNT 4

class ConfigManager {
public:
    void apply_config(const char* /*payload*/) {}
    int  ingredient_for_pump(int /*pump_index*/) { return -1; }
    int  pump_for_ingredient(int /*ingredient_id*/) { return -1; }
    void load_from_nvs() {}
    int  pump_for_ingredient_positional(int pos) { return pos; }
};

#endif // CONFIG_MANAGER_H
