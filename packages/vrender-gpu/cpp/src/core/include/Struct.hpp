//
// Created by ByteDance on 2023/8/7.
//

#ifndef VRENDER_GPU_STRUCT_HPP
#define VRENDER_GPU_STRUCT_HPP

#include <string>
#include <glm/glm.hpp>

template <typename T>
struct UniformItem {
    std::string name;
    T data;
};

typedef UniformItem<int> IntUniformItem;
typedef UniformItem<float> FloatUniformItem;
typedef UniformItem<bool> BoolUniformItem;
typedef UniformItem<glm::vec2> Vec2UniformItem;
typedef UniformItem<glm::vec<2, int>> Vec2iUniformItem;
typedef UniformItem<glm::vec3> Vec3UniformItem;
typedef UniformItem<glm::vec4> Vec4UniformItem;
typedef UniformItem<glm::mat4> Mat4UniformItem;
typedef UniformItem<std::vector<float>> FloatArrUniformItem;

enum class LineCap {
    BUTT = 0,
    ROUND,
    SQUARE
};

enum class LineJoin {
    BEVEL = 0,
    ROUND,
    MITER
};

enum class CurveType {
    LINEAR = 0,
    BASIS = 1,
    BASIS_CLOSE = 2,
    MONOTONE_X = 3,
    MONOTONE_Y = 4,
    STEP = 5,
    STEP_BEFORE = 6,
    STEP_AFTER = 7,
};

typedef glm::vec2 Point;

struct Point2: public glm::vec2 {
    Point2(float x, float y, bool defined = true): glm::vec2{x, y}, mDefined{defined} {};
    bool mDefined;
};

#endif //VRENDER_GPU_STRUCT_HPP
