//
// Created by ByteDance on 2023/8/17.
//

#ifndef VRENDER_GPU_LIGHT_HPP
#define VRENDER_GPU_LIGHT_HPP

#include <glm/glm.hpp>

enum class LightType {
    AMBIENT_LIGHT,
    POINT_LIGHT,
    DIRECT_LIGHT,
    SPOT_LIGHT
};

struct CommonLightAttr {
    glm::vec3 position;
    glm::vec3 color;
    LightType lightType;
    float strength;
};

class Light {
public:
    virtual glm::vec3 GetColor() const = 0;
    virtual glm::vec3 GetPosition() const = 0;
    virtual CommonLightAttr GetLightAttr() const = 0;
protected:
    ~Light() = default;
};

#endif //VRENDER_GPU_LIGHT_HPP
