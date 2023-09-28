//
// Created by ByteDance on 2023/8/16.
//
#include "MeshBasicMaterial.hpp"
#include "ResourceManager.hpp"

void MeshBasicMaterial::Init() {
    
}

std::shared_ptr<Shader> MeshBasicMaterial::GetShader(std::shared_ptr<ResourceManager> &resourceManager) {
    // 尝试设置shader
}