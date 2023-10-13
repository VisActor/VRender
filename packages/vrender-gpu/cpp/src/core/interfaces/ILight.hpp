//
// Created by ByteDance on 2023/10/8.
//

#ifndef VRENDER_GPU_ILIGHT_HPP
#define VRENDER_GPU_ILIGHT_HPP

#include <glm/glm.hpp>
#include "ICamera.hpp"

/**
 * 距离	    常数项	一次项	二次项
    7	    1.0	    0.7	    1.8
    13	    1.0	    0.35	0.44
    20	    1.0	    0.22	0.20
    32	    1.0	    0.14	0.07
    50	    1.0	    0.09	0.032
    65	    1.0	    0.07	0.017
    100	    1.0	    0.045	0.0075
    160	    1.0	    0.027	0.0028
    200	    1.0	    0.022	0.0019
    325	    1.0	    0.014	0.0007
    600	    1.0	    0.007	0.0002
    3250	1.0	    0.0014	0.000007
*/

enum class LightType {
    AMBIENT_LIGHT,
    POINT_LIGHT,
    DIRECT_LIGHT,
    SPOT_LIGHT
};

struct CommonLightAttr {
    LightType lightType;
    union Data {
        struct Direction {
            glm::vec3 color;
            float strength;
            glm::vec3 direction;
        } direction;

        struct Ambient {
            glm::vec3 color;
            float strength;
        } ambient;
    } data;
};

//struct CommonLightAttr {
//    glm::vec3 position;
//    glm::vec3 color;
//    LightType lightType;
//    float strength;
//};

struct AttenuationAttr {
    float constant;
    float linear;
    float quadratic;
};

struct LightStrengthAttr {
    glm::vec3 m_ambient;
    glm::vec3 m_diffuse;
    glm::vec3 m_specular;
};

class ILight {
public:
    ILight(): mColor{glm::vec3{1.f}}, mStrength{} {}
    virtual ~ILight() = default;
    inline void SetStrength(float s) { mStrength = s; }
    [[nodiscard]] inline float GetStrength() const { return mStrength; }
    inline void SetColor(const glm::vec3 &color) { mColor = color; }
    [[nodiscard]] inline glm::vec3 GetColor() const { return mColor; }
    [[nodiscard]] virtual CommonLightAttr GetLightAttr() const = 0;
protected:
    glm::vec3 mColor;
    float mStrength;
};

#endif //VRENDER_GPU_ILIGHT_HPP
