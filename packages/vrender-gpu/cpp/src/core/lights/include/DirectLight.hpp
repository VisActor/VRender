//
// Created by ByteDance on 2023/10/8.
//

#ifndef VRENDER_GPU_DIRECTLIGHT_HPP
#define VRENDER_GPU_DIRECTLIGHT_HPP

#include <string>
#include <glm/glm.hpp>
#include "ILight.hpp"

class DirectLight: public ILight {
public:
    DirectLight(): mColor{glm::vec3{1.f}},
                   mName{"DirectLight"}, mType{LightType::DIRECT_LIGHT}, mStrength{.3f}, mDirection{glm::vec3{1.f, 1.f, 1.f}} {};

    ~DirectLight() override = default;
    [[nodiscard]] inline glm::vec3 GetColor() const override { return mColor; }
    [[nodiscard]] inline CommonLightAttr GetLightAttr() const override { return CommonLightAttr{mType, {mColor, mStrength, mDirection}}; }

private:
    glm::vec3 mColor;
    std::string mName;
    float mStrength;
    LightType mType;
    glm::vec3 mDirection;
};

#endif //VRENDER_GPU_DIRECTLIGHT_HPP
