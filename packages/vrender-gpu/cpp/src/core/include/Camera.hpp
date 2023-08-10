//
// Created by ByteDance on 2023/8/10.
//

#ifndef VRENDER_GPU_CAMERA_HPP
#define VRENDER_GPU_CAMERA_HPP

#include "Matrix.hpp"

class Camera {
public:
    Camera(float left, float right, float top, float bottom): mLeft{left}, mRight{right}, mTop{top}, mBottom{bottom}, mMatrix{} {
        ForceGetProjectionMatrix();
    };

    inline void SetParams(float left, float right, float top, float bottom);

    const Matrix2D& ForceGetProjectionMatrix();
    inline const Matrix2D& GetProjectionMatrix() { return mMatrix; };
private:
    float mLeft;
    float mRight;
    float mTop;
    float mBottom;
    Matrix2D mMatrix;
};

#endif //VRENDER_GPU_CAMERA_HPP
