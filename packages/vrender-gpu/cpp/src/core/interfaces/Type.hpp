//
// Created by ByteDance on 2023/8/4.
//

#ifndef VRENDER_GPU_TYPE_HPP
#define VRENDER_GPU_TYPE_HPP

#include <string>

enum class Platform {
    Darwin = 0,
    Browser,
    Android,
};

struct WindowConf {
    float width;
    float height;
    std::string title;
};

enum class BoundingBoxType {
    AABB,
    Sphere
};

// 计算光照
enum class CalcLight {
    DEFAULT=0,
    LIGHT,
};

// 绘制点线面
enum class DrawMode {
    DEFAULT,
    TRIANGLE,
    POINT,
    LINE
};

// 投影矩阵
enum class ProjectionMode {
    DEFAULT,
    ORTHGRAPHIC,
    PERSPECTIVE
};

#endif //VRENDER_GPU_TYPE_HPP
