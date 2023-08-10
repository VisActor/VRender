//
// Created by ByteDance on 2023/8/10.
//

#ifndef VRENDER_GPU_MATRIX_HPP
#define VRENDER_GPU_MATRIX_HPP

#include <glm/glm.hpp>

class Matrix2D {
public:
    Matrix2D(): mMatrix{1.f} {};
    const glm::mat4& Translate(const glm::vec2 &pos);
    const glm::mat4& Translate(float x, float y);
    const glm::mat4& Rotate(float angle);
    const glm::mat4& Rotate(float angle, const glm::vec3 &rotateCenter);
    const glm::mat4& Scale(const glm::vec2 &scale);
    const glm::mat4& Scale(float x, float y);
    const glm::mat4& Transform(const glm::vec2 &pos, const glm::vec2 &scale, const float &angle, const glm::vec2 &rotateCenter);
    const glm::mat4& Copy(const Matrix2D &matrix2D);
    const glm::mat4& Copy(glm::mat4 &matrix);
    bool WithOutScaleAndRotate() const;

    [[nodiscard]] inline const glm::mat4& GetMatrix() const { return mMatrix; }
    [[nodiscard]] inline glm::mat4& GetWritableMatrix() { return mMatrix; }
private:
    glm::mat4 mMatrix;
};

#endif //VRENDER_GPU_MATRIX_HPP
