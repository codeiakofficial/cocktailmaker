#include <unity.h>
#include "../src/pump_controller.h"

void setUp() {}
void tearDown() {}

void test_pump_dispense() {
    PumpController pump;
    pump.dispense(0, 100);
    TEST_ASSERT_FALSE(pump.is_pump_running(0));
}

void test_pump_emergency_stop() {
    PumpController pump;
    pump.dispense(0, 1000);
    pump.emergency_stop();
    TEST_ASSERT_FALSE(pump.is_pump_running(0));
}

int main() {
    UNITY_BEGIN();
    RUN_TEST(test_pump_dispense);
    RUN_TEST(test_pump_emergency_stop);
    return UNITY_END();
}
