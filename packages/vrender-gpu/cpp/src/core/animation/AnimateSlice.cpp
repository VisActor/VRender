//
// Created by ByteDance on 2023/10/13.
//
#include "AnimateSlice.hpp"
#include <iostream>
#include <set>
#include <unordered_map>
#include <limits>

void AnimateSlice::Interpolate(double t, double pTime) {
    if (mMorphMeshChannels.empty()) return;

    auto time{t};
    while (time > mDuring) {
        time -= mDuring;
    }

    for (auto &c : mMorphMeshChannels) {
        unsigned int frame{0};
        for (auto &k : c.mKeys) {
            if (time < k.mTime) break;
            frame++;
        }
        frame -= 1;
        auto nextFrame{(frame + 1) % c.mKeys.size()};

        auto &curKey = c.mKeys[frame];
        auto &nextKey = c.mKeys[nextFrame];

        auto deltaTime = nextKey.mTime - curKey.mTime;
        if (deltaTime < std::numeric_limits<float>::epsilon()) {
            deltaTime += mDuring;
        }
        // interpolate
        auto &&k = (time - curKey.mTime) / deltaTime;

        std::set<unsigned int> values;
        std::vector<float> morphTargetInfluences{};

        for (int i = 0, n = curKey.mValues.size(); i < n; i++) {
            auto curValue = curKey.mWeights[i];
            auto nextValue = nextKey.mWeights[i];
            morphTargetInfluences.push_back(curValue + (nextValue - curValue) * k);
        }
    }
}

void AnimateSlice::Init(const aiAnimation *anim) {
    if (!anim) return;
    mDuring = anim->mDuration;
    mTicksPerSecond = anim->mTicksPerSecond;

    for (int i = 0; i < anim->mNumChannels; i++) {
        const auto *channel = anim->mChannels[i];
        if (!channel) continue;
    }

    for (int i = 0; i < anim->mNumMorphMeshChannels; i++) {
        const auto *channel = anim->mMorphMeshChannels[i];
        if (!channel) continue;

        MorphMeshChannel morphMeshChannel{channel->mName.C_Str()};
        for (int j = 0; j < channel->mNumKeys; j++) {
            const auto &keys = channel->mKeys[j];
            MorphMeshChannelKeys morphMeshChannelKeys{};
            morphMeshChannelKeys.mTime = keys.mTime;
            for (int n = 0; n < keys.mNumValuesAndWeights; n++) {
                morphMeshChannelKeys.mValues.push_back(keys.mValues[n]);
                morphMeshChannelKeys.mWeights.push_back(keys.mWeights[n]);
            }
            morphMeshChannel.mKeys.emplace_back(morphMeshChannelKeys);
        }
        mMorphMeshChannels.emplace_back(morphMeshChannel);
    }
}