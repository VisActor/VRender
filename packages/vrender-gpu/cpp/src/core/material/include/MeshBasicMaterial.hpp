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
    MeshBasicMaterial(): Material{}, mColor{1, 0, 0, 1}, mTextures{} {};
    std::shared_ptr<Shader> GetShader(std::shared_ptr<ResourceManager> resourceManager) override;
    void Init(std::shared_ptr<ResourceManager> resourceManager) override;
    void UpdateUniform() override;
    glm::vec4 mColor;
    typedef struct {
        std::shared_ptr<Texture2D> texture2D;
        std::string type; // texture_diffuse | texture_specular
    } Texture;

    std::vector<Texture> mTextures;
protected:
    void SetDefaultUniform() override;
};

#endif //VRENDER_GPU_MESHBASICMATERIAL_HPP
