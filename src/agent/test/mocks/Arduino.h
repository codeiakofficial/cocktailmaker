#pragma once

#include <cstdio>

#define OUTPUT 0
#define INPUT  1
#define HIGH   1
#define LOW    0

static int _pin_states[40] = {0};

inline void pinMode(int, int) {}
inline void digitalWrite(int pin, int val) { _pin_states[pin] = val; }
inline int  digitalRead(int pin) { return _pin_states[pin]; }
inline void delay(int) {}

struct _Serial {
    void begin(int) {}
    void println(const char* s) { printf("%s\n", s); }
    void print(const char* s)   { printf("%s", s); }
};
static _Serial Serial;
