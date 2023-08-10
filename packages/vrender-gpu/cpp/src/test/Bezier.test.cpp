//
// Created by ByteDance on 2023/7/1.
//
#include "Bezier.hpp"
#include "Output.hpp"
#include <iostream>

void get_point() {
    INFO_PRINT("========start test: get point at");

    Quadratic quadratic{{0.f, 0.f}, {75.f, 25.f}, {100.f, 100.f}};
    auto p = quadratic.GetPointAt(0.5);
    assert(p.x == 62.5);
    assert(p.y == 37.5);

    Cubic cubic{{0.f, 0.f}, {30.f, 60.f}, {75.f, 25.f}, {100.f, 100.f}};
    p = cubic.GetPointAt(0.5);
    assert(p.x == 51.875);
    assert(p.y == 44.375);

    SUCCESS_PRINT("========test success: get point at");
}

void split() {
    INFO_PRINT("========start test: split");

    Quadratic quadratic{{0.f, 0.f}, {75.f, 25.f}, {100.f, 100.f}};
    auto quadraticSplitArray = quadratic.Split(0.5);
    Quadratic left1{{0.f, 0.f}, {37.5, 12.5}, {62.5, 37.5}};
    Quadratic right1{{62.5, 37.5},{ 87.5, 62.5 },{ 100.f, 100.f }};
    assert(quadraticSplitArray[0].EqualTo(left1));
    assert(quadraticSplitArray[1].EqualTo(right1));

    Cubic cubic{{0.f, 0.f}, {30.f, 60.f}, {75.f, 25.f}, {100.f, 100.f}};
    auto cubicSplitArray = cubic.Split(0.5);
    Cubic left2{{0.f, 0.f}, {15.f, 30.f}, {33.75, 36.25}, {51.875, 44.375}};
    Cubic right2{{ 51.875, 44.375 },
                { 70.f, 52.5 },
                { 87.5, 62.5 },
                { 100.f, 100.f }};
    assert(cubicSplitArray[0].EqualTo(left2));
    assert(cubicSplitArray[1].EqualTo(right2));
//    assert(p.x == 51.875);
//    assert(p.y == 44.375);

    SUCCESS_PRINT("========test success: split");
}

int main() {
    get_point();
    split();
}
