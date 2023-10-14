//
// Created by ByteDance on 2023/10/13.
//

#ifndef VRENDER_GPU_ANIMATESLICE_HPP
#define VRENDER_GPU_ANIMATESLICE_HPP

#include <assimp/anim.h>
#include "AnimateInfo.hpp"

class AnimateSlice {
public:
    AnimateSlice(): mDuring{0}, mTicksPerSecond{0}, mMorphMeshChannels{}, mMorphTargetInfluences{} {};
    ~AnimateSlice() = default;
    void Init(const aiAnimation * anim);

    void Interpolate(double t, double delta);

    const std::vector<float>& GetMorphTargetInfluences() { return mMorphTargetInfluences; }
protected:
    float mDuring;
    float mTicksPerSecond;

    std::vector<MorphMeshChannel> mMorphMeshChannels;
    std::vector<float> mMorphTargetInfluences;
};

#endif //VRENDER_GPU_ANIMATESLICE_HPP
