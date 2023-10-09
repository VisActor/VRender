//
// Created by ByteDance on 2023/8/16.
//
#include "MeshBasicMaterial.hpp"
#include "ResourceManager.hpp"

void MeshBasicMaterial::Init(std::shared_ptr<ResourceManager> resourceManager) {
    mShader = resourceManager->LoadShader("basic");
}

std::shared_ptr<Shader> MeshBasicMaterial::GetShader(std::shared_ptr<ResourceManager> resourceManager) {
    // 尝试设置shader
    if (mShader == nullptr) {
        Init(resourceManager);
    }
    return mShader;
}

void MeshBasicMaterial::UpdateLightUniform(std::shared_ptr<ResourceManager> &resourceManager,
                                           std::vector<std::shared_ptr<ILight>> &light) {}

void MeshBasicMaterial::UpdateUniform() {
    mVec4UniformMap["u_color"] = {"u_color", mColor};
}

void MeshBasicMaterial::SetDefaultUniform() {
    if (!mShader) {
        return;
    }

    int count{int(mTextures.size())};

    mShader->InitTextureUniform(count);

    for (int i = 0; i < count; i++) {
        auto &texture = mTextures[i];
//        if (texture.type == "texture_diffuse") {
            std::cout<<i<<std::endl;
            glActiveTexture(GL_TEXTURE0 + i);
            texture.texture2D->Bind();
//        }
    }
}