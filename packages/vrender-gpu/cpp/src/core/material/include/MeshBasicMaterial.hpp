//
// Created by ByteDance on 2023/8/16.
//

#ifndef VRENDER_GPU_MESHBASICMATERIAL_HPP
#define VRENDER_GPU_MESHBASICMATERIAL_HPP

#include <glm/glm.hpp>
#include "Material.hpp"
#include "Shader.hpp"

class MeshBasicMaterial: public Material {
public:
    MeshBasicMaterial(): Material{}, mColor{1, 0, 0, 1} {};
    std::shared_ptr<Shader> GetShader(std::shared_ptr<ResourceManager> &resourceManager) override;
    void Init() override;
protected:
    glm::vec4 mColor;
};

#endif //VRENDER_GPU_MESHBASICMATERIAL_HPP
