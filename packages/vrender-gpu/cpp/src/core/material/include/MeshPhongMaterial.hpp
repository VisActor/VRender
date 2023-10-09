//
// Created by ByteDance on 2023/10/8.
//

#ifndef VRENDER_GPU_MESHPHONGMATERIAL_HPP
#define VRENDER_GPU_MESHPHONGMATERIAL_HPP

#include "MeshBasicMaterial.hpp"
#include "Type.hpp"
#include "ILight.hpp"

class MeshPhongMaterial: public MeshBasicMaterial {
public:
    MeshPhongMaterial(): mAmbientStrength{.1f}, mDiffuseStrength{.8f}, mSpecularStrength{.8f}, mShininess{32.f}, MeshBasicMaterial{} {};
    ~MeshPhongMaterial() = default;
    void Init(std::shared_ptr<ResourceManager> resourceManager) override;
    void UpdateLightUniform(std::shared_ptr<ResourceManager> &resourceManager, std::vector<std::shared_ptr<ILight>> &lightArr) override;
protected:
    glm::vec3 mAmbientStrength;
    glm::vec3 mDiffuseStrength;
    glm::vec3 mSpecularStrength;
    float mShininess;

    static void AddAmbientLight(const glm::vec3 &color, const float &strength, const std::string &prefix, std::shared_ptr<Shader> &shader);
    static void AddDirectionLight(const glm::vec3 &color, const glm::vec3 &direction, const float &strength, const std::string &prefix, std::shared_ptr<Shader> &shader);
};

#endif //VRENDER_GPU_MESHPHONGMATERIAL_HPP
