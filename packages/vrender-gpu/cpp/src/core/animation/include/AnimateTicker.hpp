//
// Created by ByteDance on 2023/10/12.
//

#ifndef VRENDER_GPU_ANIMATETICKER_HPP
#define VRENDER_GPU_ANIMATETICKER_HPP

#include <vector>

class AnimateTicker {
public:
    AnimateTicker(): mTime{-1.f}, mLastTime{-1.f}, mFrameCount{0} {};
    ~AnimateTicker() = default;
    void Tick(double time);
    inline double GetTime() const { return mTime; }
    inline double GetDeltaTime() const { return mLastTime < 0 ? 0 : mTime - mLastTime; }
protected:
    double mTime;
    double mLastTime;
    unsigned int mFrameCount;
};

#endif //VRENDER_GPU_ANIMATETICKER_HPP
