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
    AmbientLight(): ILight(), mName{"AmbientLight"}, mType(LightType::AMBIENT_LIGHT) {
        mStrength = .3f;
    };
    ~AmbientLight() override = default;
    [[nodiscard]] inline CommonLightAttr GetLightAttr() const override { return CommonLightAttr{mType, {mColor, mStrength}}; }

private:
    std::string mName;
    LightType mType;
};

#endif //VRENDER_GPU_AMBIENTLIGHT_HPP
