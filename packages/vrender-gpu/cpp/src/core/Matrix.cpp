//
// Created by ByteDance on 2023/8/10.
//
#include <glm/gtc/matrix_transform.hpp>
#include "Matrix.hpp"
#include "Tools.hpp"

const glm::mat4 & Matrix2D::Translate(float x, float y) {
    glm::translate(mMatrix, {x, y, 0.f});
    return mMatrix;
}

const glm::mat4 & Matrix2D::Translate(const glm::vec2 &pos) {
    glm::translate(mMatrix, {pos.x, pos.y, 0.f});
    return mMatrix;
}

const glm::mat4 & Matrix2D::Rotate(float angle) {
    glm::rotate(mMatrix, angle, {0.f, 0.f, 0.f});
    return mMatrix;
}

const glm::mat4 & Matrix2D::Rotate(float angle, const glm::vec3 &rotateCenter) {
    glm::rotate(mMatrix, angle, rotateCenter);
    return mMatrix;
}

const glm::mat4 & Matrix2D::Scale(float x, float y) {
    glm::scale(mMatrix, {x, y, 1});
    return mMatrix;
}

const glm::mat4 & Matrix2D::Scale(const glm::vec2 &scale) {
    glm::scale(mMatrix, {scale.x, scale.y, 1});
    return mMatrix;
}

const glm::mat4 & Matrix2D::Transform(const glm::vec2 &pos, const glm::vec2 &scale, const float &angle,
                                      const glm::vec2 &rotateCenter) {
    Transform2D(mMatrix, mMatrix, pos, scale, angle, rotateCenter);
    return mMatrix;
}

const glm::mat4 & Matrix2D::Copy(const Matrix2D &matrix2D) {
    for (int i = 0; i < 4; i++) {
        for (int j = 0; j < 4; j++) {
            mMatrix[i][j] = matrix2D.mMatrix[i][j];
        }
    }
    return mMatrix;
}

const glm::mat4 & Matrix2D::Copy(glm::mat4 &matrix) {
    for (int i = 0; i < 4; i++) {
        for (int j = 0; j < 4; j++) {
            mMatrix[i][j] = matrix[i][j];
        }
    }
    return mMatrix;
}

// todo 后面再判断是否需要考虑精度问题
bool Matrix2D::WithOutScaleAndRotate() const {
    return (mMatrix[0][0] == 1.f) && (mMatrix[0][1] == 0.f) && (mMatrix[1][0] == 0.f) && (mMatrix[1][1] == 1.f);
}