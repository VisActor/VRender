//
// Created by ByteDance on 2023/10/12.
//
#include "Animate.hpp"
#include <iostream>

void Animate::Init(std::shared_ptr<BufferGeometry> &geo, const aiMesh *mesh, const aiScene *scene) {
    mGeometry = geo;
    LoadGeometries(mesh);
    LoadAnimateInfo(mesh, scene);
}

void Animate::Build(double time, double deltaTime) {

}

void Animate::LoadAnimateInfo(const aiMesh *mesh, const aiScene *aScene) {
    if (!aScene) return;
    if (aScene->mNumAnimations == 0) return;

    for (int i = 0; i < aScene->mNumAnimations; i++) {
        const auto *animation = aScene->mAnimations[i];
        auto animateSlice = std::make_shared<AnimateSlice>();
        animateSlice->Init(animation);
        mAnimateSlice.push_back(animateSlice);
    }
}

void Animate::LoadGeometries(const aiMesh *aMesh) {
    if (!aMesh) return;
    if (aMesh->mNumAnimMeshes <= 0) return;

    for (int j = 0; j < aMesh->mNumAnimMeshes; j++) {
        const auto *mesh = aMesh->mAnimMeshes[j];
        auto geo = std::make_shared<BufferGeometry>();
        std::vector<glm::vec<3,float>> _vertices{};
        std::vector<glm::vec<3, float>> _normals{};
        for (int i = 0; i < mesh->mNumVertices; i++) {
            glm::vec3 position{};
            const auto &v = mesh->mVertices[i];
            position.x = v.x;
            position.y = v.y;
            position.z = v.z;

            _vertices.emplace_back(position);

            if (mesh->HasNormals()) {
                glm::vec3 normal{};
                const auto &n = mesh->mNormals[i];
                normal.x = n.x;
                normal.y = n.y;
                normal.z = n.z;
                _normals.emplace_back(normal);
            }
        }
        geo->SetVertices(_vertices);
        geo->SetNormals(_normals);
        mGeometries.push_back(geo);
    }
}

void Animate::SetUniformData(std::shared_ptr<Shader> shader) {

}

void Animate::Interpolate(double t, double delta) {
    for (auto &as : mAnimateSlice) {
        as->Interpolate(t, delta);
    }
}