//
// Created by ByteDance on 2023/8/16.
//

#ifndef VRENDER_GPU_MESHBASICMATERIAL_HPP
#define VRENDER_GPU_MESHBASICMATERIAL_HPP

#include <glm/glm.hpp>
#include "Material.hpp"
#include "Shader.hpp"
#include "Type.hpp"

class MeshBasicMaterial: public Material {
public:
    MeshBasicMaterial(): Material{}, mColor{1, 0, 0, 1}, mTextures{} {};
    ~MeshBasicMaterial() = default;
    std::shared_ptr<Shader> GetShader(std::shared_ptr<ResourceManager> resourceManager) override;
    void Init(std::shared_ptr<ResourceManager> resourceManager) override;
    void UpdateUniform() override;
    void UpdateLightUniform(std::shared_ptr<ResourceManager> &resourceManager, std::vector<std::shared_ptr<ILight>> &light) override;
    glm::vec4 mColor;

    std::vector<Texture> mTextures;

protected:
    void SetDefaultUniform() override;
};

#endif //VRENDER_GPU_MESHBASICMATERIAL_HPP
