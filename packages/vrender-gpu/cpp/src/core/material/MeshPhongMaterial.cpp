//
// Created by ByteDance on 2023/10/8.
//
#include "MeshPhongMaterial.hpp"

void MeshPhongMaterial::Init(std::shared_ptr<ResourceManager> resourceManager) {
    mShader = resourceManager->LoadShader("basic_phong");
}

void MeshPhongMaterial::AddAmbientLight(const glm::vec3 &color, const float &strength, const std::string &prefix,
                            std::shared_ptr<Shader> &shader) {
    shader->SetVector3f((prefix + "lightColor").c_str(), color);
    shader->SetFloat((prefix + "strength").c_str(), strength);
}

void MeshPhongMaterial::AddDirectionLight(const glm::vec3 &color, const glm::vec3 &direction, const float &strength,
                              const std::string &prefix, std::shared_ptr<Shader> &shader) {
    shader->SetVector3f((prefix + "lightDirection").c_str(), direction);
    shader->SetVector3f((prefix + "lightColor").c_str(), color);
    shader->SetFloat((prefix + "strength").c_str(), strength);
}

void MeshPhongMaterial::UpdateLightUniform(std::shared_ptr<ResourceManager> &resourceManager, std::vector<std::shared_ptr<ILight>> &lightArr) {
    int ambientLightArrIndex{0}, pointLightArrIndex{0}, spotLightArrIndex{0}, directLightArrIndex{0};
    auto shader = GetShader(resourceManager);
    // 光照uniform
    for (auto &light : lightArr) {
        const auto lightAttr = light->GetLightAttr();
        if (lightAttr.lightType == LightType::AMBIENT_LIGHT) {
            // ambient light
            std::string prefix = "ambientLightArr[" + std::to_string(ambientLightArrIndex) + "].";
            AddAmbientLight(lightAttr.data.ambient.color, lightAttr.data.ambient.strength, prefix, shader);
            ambientLightArrIndex++;
        } else if (lightAttr.lightType == LightType::POINT_LIGHT) {
//            // point light
//            std::string prefix = "pointLightArr[" + std::to_string(pointLightArrIndex) + "].";
//            const auto lightStrengthAttr = ((PointLight*)light)->GetLightStrengthAttr();
//            const auto attenuationAttr = ((PointLight*)light)->GetAttenuationAttr();
//
//            AddPointLight(lightAttr.position, lightAttr.color, lightStrengthAttr, attenuationAttr, prefix);
//
//            pointLightArrIndex++;
        } else if (lightAttr.lightType == LightType::SPOT_LIGHT) {
//            // spotLight
//            std::string prefix = "spotLightArr[" + std::to_string(spotLightArrIndex) + "].";
//            const auto lightStrengthAttr = ((SpotLight*)light)->GetLightStrengthAttr();
//            const auto attenuationAttr = ((SpotLight*)light)->GetAttenuationAttr();
//            const auto spotAttr = ((SpotLight*)light)->GetSpotLightAttr();
//
//            AddSpotLight(lightAttr.position, lightAttr.color, lightStrengthAttr, attenuationAttr, spotAttr, i_camera->GetDirection(), prefix);
//
//            spotLightArrIndex++;
        } else if (lightAttr.lightType == LightType::DIRECT_LIGHT) {
            // direct light
            std::string prefix = "directLightArr[" + std::to_string(directLightArrIndex) + "].";

            AddDirectionLight(lightAttr.data.direction.color, lightAttr.data.direction.direction, lightAttr.data.direction.strength, prefix, shader);

            directLightArrIndex++;
        }
    }

    shader->SetInt("ambientLightArrLength", ambientLightArrIndex);
    shader->SetInt("pointLightArrLength", pointLightArrIndex);
    shader->SetInt("spotLightArrLength", spotLightArrIndex);
    shader->SetInt("directLightArrLength", directLightArrIndex);

    shader->SetVector3f("material.ambient", mAmbientStrength);
    shader->SetVector3f("material.diffuse", mDiffuseStrength);
    shader->SetVector3f("material.specular", mSpecularStrength);
    shader->SetFloat("material.shininess", mShininess);
}