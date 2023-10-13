//
// Created by ByteDance on 2023/10/13.
//

#ifndef VRENDER_GPU_ANIMATESLICE_HPP
#define VRENDER_GPU_ANIMATESLICE_HPP

#include <assimp/anim.h>
#include "AnimateInfo.hpp"

class AnimateSlice {
public:
    AnimateSlice(): mDuring{0}, mTicksPerSecond{0}, mMorphMeshChannels{} {};
    ~AnimateSlice() = default;
    void Init(const aiAnimation * anim);

    void Interpolate(double t, double delta);
protected:
    float mDuring;
    float mTicksPerSecond;

    std::vector<MorphMeshChannel> mMorphMeshChannels;
};

#endif //VRENDER_GPU_ANIMATESLICE_HPP
