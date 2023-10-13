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
    DirectLight(): ILight(),
                   mName{"DirectLight"}, mType{LightType::DIRECT_LIGHT}, mDirection{glm::vec3{1.f, 1.f, 1.f}} {
        mStrength = .6f;
    };

    ~DirectLight() override = default;
    [[nodiscard]] inline CommonLightAttr GetLightAttr() const override { return CommonLightAttr{mType, {mColor, mStrength, mDirection}}; }

protected:
    std::string mName;
    LightType mType;
    glm::vec3 mDirection;
};

#endif //VRENDER_GPU_DIRECTLIGHT_HPP
