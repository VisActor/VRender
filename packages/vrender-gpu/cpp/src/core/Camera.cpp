//
// Created by ByteDance on 2023/8/10.
//
#include <glm/gtc/matrix_transform.hpp>
#include "Camera.hpp"

const Matrix2D & Camera::ForceGetProjectionMatrix() {
    auto &&matrix = glm::ortho(mLeft, mRight, mBottom, mTop, 0.f, -2000000.f);
    mMatrix.Copy(matrix);
    return mMatrix;
}

void Camera::SetParams(float left, float right, float top, float bottom) {
    mLeft = left; mRight = right;
    mTop = top; mBottom = bottom;

    ForceGetProjectionMatrix();
}
