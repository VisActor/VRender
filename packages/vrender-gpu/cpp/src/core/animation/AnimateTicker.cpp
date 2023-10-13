//
// Created by ByteDance on 2023/10/12.
//
#include "AnimateTicker.hpp"

void AnimateTicker::Tick(double time) {
    mLastTime = mTime;
    mTime = time;
}