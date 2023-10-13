//
// Created by ByteDance on 2023/10/13.
//

#ifndef VRENDER_GPU_ANIMATEINFO_HPP
#define VRENDER_GPU_ANIMATEINFO_HPP

#include <vector>
#include <string>

struct AnimateInfo {

};

struct MorphMeshChannelKeys {
    MorphMeshChannelKeys(): mTime{0}, mValues{}, mWeights{} {};
    float mTime; // start time
    std::vector<int> mValues;
    std::vector<float> mWeights;
};

struct MorphMeshChannel {
    MorphMeshChannel(): mName{}, mKeys{} {}
    explicit MorphMeshChannel(std::string name): mName{std::move(name)}, mKeys{} {}
    std::string mName;
    std::vector<MorphMeshChannelKeys> mKeys;
};

#endif //VRENDER_GPU_ANIMATEINFO_HPP
