//
// Created by ByteDance on 2023/8/16.
//

#ifndef VRENDER_GPU_PICKABLE_HPP
#define VRENDER_GPU_PICKABLE_HPP

#include <glm/glm.hpp>
#include "Type.hpp"
#include "Bounds.hpp"

class Pickable {
public:
    union BBoxType {
        AABBBounds aabbBounds;
        SphereBounds sphereBounds;
    };
    virtual void GetAABBBounds(const glm::vec3 &position, const glm::vec3 &scale, const glm::mat4 &rotate, glm::vec3 &aabbMin, glm::vec3 &aabbMax) = 0;
    virtual void GetBoundingSphere(const glm::vec3 &position, const glm::vec3 &scale, const glm::mat4 &rotate, glm::vec3 &center, float &radius) = 0;
#ifdef DEBUGHITABLE
    virtual void RenderAABB(const glm::vec3 &position, const glm::vec3 &scale, const glm::mat4 &rotate, ICamera *i_camera, int sceneWidth, int sceneHeight) = 0;
#endif
protected:
    Pickable(): mBounds{{glm::vec3{}, glm::vec3{}}}, mBoundingBoxType{BoundingBoxType::AABB}, mShouldUpdate{true} {};
    ~Pickable() = default;
    BoundingBoxType mBoundingBoxType;
    bool mShouldUpdate;
    BBoxType mBounds;
};

#endif //VRENDER_GPU_PICKABLE_HPP
