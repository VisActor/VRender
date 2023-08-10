//
// Created by bytedance on 2021/3/2.
//

#ifndef CANOPUS_FONT_WASM_COMMON_HPP
#define CANOPUS_FONT_WASM_COMMON_HPP

#include <iostream>

struct IdGenerator{
    static int sId;
    static inline int GetId() { return sId++; }
};

union vec2f {
    float data[2];
    struct {
        float x;
        float y;
    };
};

template<typename T>
std::pair<const T, const T> minmax(const T &a, const T &b, const T &c) {
    T min = T{999999.0}, max = T{-999999.0};
    if (a < b) {
        min = a; max = b;
    } else {
        min = b; max = a;
    }
    if (min > c) min = c;
    if (max < c) max = c;
    return std::pair<const T, const T>(std::move(min), std::move(max));
}

#endif //CANOPUS_FONT_WASM_COMMON_HPP
