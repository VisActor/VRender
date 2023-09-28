//
// Created by ByteDance on 2023/8/15.
//

#ifndef VRENDER_GPU_ICAMERA_HPP
#define VRENDER_GPU_ICAMERA_HPP

#include <string>
#include <glm/glm.hpp>

class ICamera {
public:
    ~ICamera() = default;
    virtual void Init() = 0;

    virtual glm::mat4 GetViewMatrix() = 0;
    virtual glm::mat4 GetProjectionMatrix() = 0;

    virtual void SetPosition(float x, float y, float z) = 0;
    virtual void GetPosition(glm::vec3 &p) const = 0;
    virtual void GetWorldDirection(glm::vec3 &p) const = 0;
    virtual void SetWorldDirection(float x, float y, float z) = 0;

protected:
    int mId;

private:
    static int sId;
};

#endif //VRENDER_GPU_ICAMERA_HPP
