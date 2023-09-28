//
// Created by ByteDance on 2023/8/15.
//

#ifndef VRENDER_GPU_PERSPECTIVECAMERA_HPP
#define VRENDER_GPU_PERSPECTIVECAMERA_HPP

#include <glm/glm.hpp>
#include "ICamera.hpp"

class PerspectiveCamera final: public ICamera {
public:
    PerspectiveCamera(float fov, float aspect, float near, float far):
        mFov{fov}, mAspect{aspect}, mNear{near}, mFar{far}, mShouldUpdate{UPDATE_TYPE::UPDATE_ALL},
        mPosition{}, mDirection{}, mUp{}, mRight{}, mViewMatrix{}, mProjectionMatrix{} {}
    ~PerspectiveCamera() = default;

    inline void SetPosition(float x, float y, float z) override {
        mPosition.x = x;
        mPosition.y = y;
        mPosition.z = z;
    }
    inline void GetPosition(glm::vec3 &p) const override {
        p.x = mPosition.x;
        p.y = mPosition.y;
        p.z = mPosition.z;
    }

    inline void SetWorldDirection(float x, float y, float z) override {
        mDirection.x = x;
        mDirection.y = y;
        mDirection.z = z;
    }

    inline void GetWorldDirection(glm::vec3 &p) const override {
        p.x = mDirection.x;
        p.y = mDirection.y;
        p.z = mDirection.z;
    }

    void Init() override;

    glm::mat4 GetViewMatrix() override;
    glm::mat4 GetProjectionMatrix() override;

private:
    enum UPDATE_TYPE {
        NONE =              0b0000,
        UPDATE_VIEW =       0b0001,
        UPDATE_PROJECT =    0b0010,
        UPDATE_ALL =        0b0011
    };
    int mShouldUpdate;
    float mFov;
    float mAspect;
    float mNear;
    float mFar;

    glm::vec3 mPosition;
    glm::vec3 mDirection;
    glm::vec3 mUp;
    glm::vec3 mRight;

    glm::mat4 mViewMatrix;
    glm::mat4 mProjectionMatrix;
};

#endif //VRENDER_GPU_PERSPECTIVECAMERA_HPP
