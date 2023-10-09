//
// Created by ByteDance on 2023/8/17.
//

#ifndef VRENDER_GPU_AMBIENTLIGHT_HPP
#define VRENDER_GPU_AMBIENTLIGHT_HPP

#include <string>
#include <glm/glm.hpp>
#include "ILight.hpp"

class AmbientLight: public ILight {
public:
    AmbientLight(): mColor{glm::vec3{1.f}}, mPosition{glm::vec3{.5f}}, mName{"AmbientLight"}, mType(LightType::AMBIENT_LIGHT), mStrength(.1f) {};
    ~AmbientLight() override = default;
    [[nodiscard]] inline glm::vec3 GetColor() const override { return mColor; }
    [[nodiscard]] inline CommonLightAttr GetLightAttr() const override { return CommonLightAttr{mType, {mColor, mStrength}}; }

private:
    glm::vec3 mColor;
    std::string mName;
    float mStrength;
    LightType mType;

    glm::vec3 mPosition;
};

#endif //VRENDER_GPU_AMBIENTLIGHT_HPP
