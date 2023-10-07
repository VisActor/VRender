//
// Created by ByteDance on 2023/8/17.
//
#include "Model.hpp"
#include "Type.hpp"

void Model::Init(std::vector<std::shared_ptr<Mesh>> meshes) {
    mMeshes = std::move(meshes);
}

void Model::Init(const std::shared_ptr<Mesh>& mesh) {
    mMeshes.push_back(mesh);
}

void Model::Build() {
    for (auto mesh : mMeshes) {

    }
}

void Model::Draw(std::shared_ptr<ICamera> &camera, std::shared_ptr<ResourceManager> &resourceManager, const glm::mat4& modelMatrix) {
    for (auto mesh : mMeshes) {
        mesh->UseShader(resourceManager);

        const auto &shader = mesh->GetShader(resourceManager);
        shader->SetMatrix4("u_model", modelMatrix, false);
        shader->SetMatrix4("u_view", camera->GetViewMatrix(), false);
        shader->SetMatrix4("u_projection", camera->GetProjectionMatrix(), false);
//        if (shader->NeedUpdateCommonUniform(mCommonUniformStore.mStamp)) {
//            shader->SetMatrix4("u_preModelMatrix", mCommonUniformStore.mPreModelMatrixUniform.data);
//            shader->ResetLastCommonUniformUpdateStamp(mCommonUniformStore.mStamp);
//        }

        mesh->BufferData();
        mesh->SetUniformData();
        // 设置绘制模式
        glPolygonMode(GL_FRONT_AND_BACK, GL_FILL);
        mesh->Draw();
    }
}

void Model::GetAABBBounds(const glm::vec3 &position, const glm::vec3 &scale, const glm::mat4 &rotate, glm::vec3 &aabbMin,
                     glm::vec3 &aabbMax) {
    if (mShouldUpdate) {
        mBoundingBoxType = BoundingBoxType::AABB;
        const auto maxFloat = std::numeric_limits<float>::max();
        aabbMin = glm::vec3{maxFloat, maxFloat, maxFloat};
        aabbMax = glm::vec3{-maxFloat, -maxFloat, -maxFloat};

        glm::vec3 minPos, maxPos;
        for (auto &mesh : mMeshes) {
            mesh->GetAABBBounds(position, scale, rotate, minPos, maxPos);
            for (int i = 0; i < 3; i++) {
                aabbMin[i] = std::min(aabbMin[i], minPos[i]);
                aabbMax[i] = std::max(aabbMax[i], maxPos[i]);
            }
        }
        mBounds.aabbBounds = AABBBounds{
                aabbMin,
                aabbMax
        };
        mShouldUpdate = false;
    } else {
        aabbMin = mBounds.aabbBounds.mMin;
        aabbMax = mBounds.aabbBounds.mMax;
    }
}

void Model::GetBoundingSphere(const glm::vec3 &position, const glm::vec3 &scale, const glm::mat4 &rotate, glm::vec3 &center,
                         float &radius) {
    mBoundingBoxType = BoundingBoxType::Sphere;
    glm::vec3 aabbMin, aabbMax;
    GetAABBBounds(position, scale, rotate, aabbMin, aabbMax);
    glm::vec3 t = aabbMax - aabbMin;
    center = t / 2.f;
    radius = glm::length(t) / 2.f;

    mBounds.sphereBounds = SphereBounds{
            center,
            radius
    };
}
