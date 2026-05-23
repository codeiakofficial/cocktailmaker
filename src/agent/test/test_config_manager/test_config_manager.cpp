#include <unity.h>
#include "../src/config_manager.h"

// ConfigManager: parses retained MQTT config payload, stores pump-ingredient
// mappings in NVS, and resolves which pump index to use for a given ingredient.

void setUp() {}
void tearDown() {}

// --- PUMP_COUNT 8 ---

void test_pump_count_is_8() {
    TEST_ASSERT_EQUAL(8, PUMP_COUNT);
}

// --- Config parsing ---

void test_parse_config_stores_pump_mapping() {
    ConfigManager mgr;
    const char* payload =
        "[{\"pumpIndex\":0,\"ingredientId\":1,\"ingredientName\":\"Rum\"},"
        " {\"pumpIndex\":1,\"ingredientId\":2,\"ingredientName\":\"Cola\"}]";

    mgr.apply_config(payload);

    TEST_ASSERT_EQUAL(1, mgr.ingredient_for_pump(0));
    TEST_ASSERT_EQUAL(2, mgr.ingredient_for_pump(1));
}

void test_parse_config_unassigned_pump_returns_minus1() {
    ConfigManager mgr;
    // Only pump 0 assigned
    const char* payload =
        "[{\"pumpIndex\":0,\"ingredientId\":1,\"ingredientName\":\"Rum\"}]";

    mgr.apply_config(payload);

    TEST_ASSERT_EQUAL(-1, mgr.ingredient_for_pump(1));
    TEST_ASSERT_EQUAL(-1, mgr.ingredient_for_pump(7));
}

// --- Pump lookup by ingredient ---

void test_pump_for_ingredient_returns_correct_pump() {
    ConfigManager mgr;
    const char* payload =
        "[{\"pumpIndex\":3,\"ingredientId\":5,\"ingredientName\":\"Gin\"}]";

    mgr.apply_config(payload);

    TEST_ASSERT_EQUAL(3, mgr.pump_for_ingredient(5));
}

void test_pump_for_ingredient_returns_minus1_if_not_mapped() {
    ConfigManager mgr;
    TEST_ASSERT_EQUAL(-1, mgr.pump_for_ingredient(99));
}

// --- NVS persistence ---

void test_apply_config_persists_to_nvs() {
    ConfigManager mgr;
    const char* payload =
        "[{\"pumpIndex\":2,\"ingredientId\":7,\"ingredientName\":\"Tonic\"}]";

    mgr.apply_config(payload);

    // Create a fresh manager sharing the same underlying Preferences mock
    // by loading from it — ingredient 7 should still be on pump 2
    mgr.load_from_nvs();
    TEST_ASSERT_EQUAL(2, mgr.pump_for_ingredient(7));
}

// --- First-boot fallback (no NVS config) ---

void test_pump_for_ingredient_fallback_positional() {
    ConfigManager mgr;
    // No config applied — fallback: ingredient at list position i -> pump i
    // pump_for_ingredient with positional fallback takes (ingredient_id, list_position)
    TEST_ASSERT_EQUAL(0, mgr.pump_for_ingredient_positional(0));
    TEST_ASSERT_EQUAL(3, mgr.pump_for_ingredient_positional(3));
    TEST_ASSERT_EQUAL(7, mgr.pump_for_ingredient_positional(7));
}

int main() {
    UNITY_BEGIN();
    RUN_TEST(test_pump_count_is_8);
    RUN_TEST(test_parse_config_stores_pump_mapping);
    RUN_TEST(test_parse_config_unassigned_pump_returns_minus1);
    RUN_TEST(test_pump_for_ingredient_returns_correct_pump);
    RUN_TEST(test_pump_for_ingredient_returns_minus1_if_not_mapped);
    RUN_TEST(test_apply_config_persists_to_nvs);
    RUN_TEST(test_pump_for_ingredient_fallback_positional);
    return UNITY_END();
}
