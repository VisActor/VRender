//
// Created by ByteDance on 2023/8/17.
//
#include "Sprite.hpp"
#include <glm/gtx/quaternion.hpp>
#include "Tools.hpp"
#include <utility>

void Sprite::Init(std::shared_ptr<Model> model) {
    mModel = std::move(model);
}

void Sprite::Build(std::shared_ptr<ResourceManager> &resourceManager, const std::shared_ptr<AnimateTicker> &ticker) {
    // 位置属性变化
    bool skipBuild{false};
    mUpdateTypeBeforeDraw = mUpdateType;
    UpdatePosMatrix();
    mModel->Build(ticker);
//    if (flag == UPDATE_TYPE::NONE && mUpdateType == UPDATE_TYPE::NONE) skipBuild = true;
//    if (!skipBuild) {
//        // 如果父子位置属性任意一个变化，就需要重新计算位置
//        if (mUpdateType & UPDATE_TYPE::POS_ATTR || flag & UPDATE_TYPE::POS_ATTR) {
//            UpdatePosMatrix();
//            mUpdateType &= ~UPDATE_TYPE::POS_ATTR;
//        }
//    }
}

void Sprite::Draw(std::shared_ptr<ICamera> &camera, std::shared_ptr<ResourceManager> &resourceManager, std::vector<std::shared_ptr<ILight>> &light, const std::shared_ptr<AnimateTicker> &ticker) {
    static std::vector<std::shared_ptr<ILight>> _null{};
    if (mCalcLight == CalcLight::LIGHT) {
        mModel->Draw(camera, resourceManager, light, GetModelMatrix(), ticker);
    } else {
        mModel->Draw(camera, resourceManager, _null, GetModelMatrix(), ticker);
    }
}

void Sprite::UpdatePosMatrix() {
    // TODO 基于父节点的变化
    /* 计算rotate */
    glm::mat4 rotateMatrix{1.f};
    rotateMatrix = glm::rotate(rotateMatrix, mRotate.x/180.f*PI, glm::vec3{1.f, 0.f, 0.f});
    rotateMatrix = glm::rotate(rotateMatrix, mRotate.y/180.f*PI, glm::vec3{0.f, 1.f, 0.f});
    rotateMatrix = glm::rotate(rotateMatrix, mRotate.z/180.f*PI, glm::vec3{0.f, 0.f, 1.f});

    mModelMatrix = GeneratorModelMatrix(mPosition, mScale, rotateMatrix);
}

const glm::mat4 &Sprite::GetModelMatrix() {
    UpdatePosMatrix();
    return mModelMatrix;
}