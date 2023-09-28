//
// Created by ByteDance on 2023/8/16.
//

#ifndef VRENDER_GPU_MATERIAL_HPP
#define VRENDER_GPU_MATERIAL_HPP

#include <iostream>
#include "Shader.hpp"
#include "ResourceManager.hpp"

class Material {
public:
    virtual std::shared_ptr<Shader> GetShader(std::shared_ptr<ResourceManager> &resourceManager) = 0;
    virtual void Init() = 0;
protected:
    Material() = default;
    ~Material() = default;
    std::shared_ptr<Shader> mShader;
};

#endif //VRENDER_GPU_MATERIAL_HPP
