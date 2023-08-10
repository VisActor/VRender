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

#endif //VRENDER_GPU_TYPE_HPP
