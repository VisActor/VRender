//
// Created by ByteDance on 2023/8/15.
//
#include <glm/gtc/matrix_transform.hpp>
#include "PerspectiveCamera.hpp"

void PerspectiveCamera::Init() {
}

glm::mat4 PerspectiveCamera::GetViewMatrix() {
    if (mShouldUpdate & UPDATE_TYPE::UPDATE_VIEW) {
        mViewMatrix = glm::lookAt(mPosition, mPosition + mDirection, mUp);
        mShouldUpdate &= ~UPDATE_TYPE::UPDATE_VIEW;
    }
    return mViewMatrix;
}

glm::mat4 PerspectiveCamera::GetProjectionMatrix() {
    if (mShouldUpdate & UPDATE_TYPE::UPDATE_PROJECT) {
        mProjectionMatrix = glm::perspective(mFov, mAspect, mNear, mFar);
        mShouldUpdate &= ~UPDATE_TYPE::UPDATE_PROJECT;
    }
    return mProjectionMatrix;
}
