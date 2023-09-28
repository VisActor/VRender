//
// Created by ByteDance on 2023/8/16.
//
#include "Mesh.hpp"
#include "Tools.hpp"
#include "Type.hpp"
#include "Bounds.hpp"
//#include <utility>

void Mesh::Init(std::shared_ptr<Geometry> geometry, std::shared_ptr<Material> material) {
    mGeometry = std::move(geometry);
    mMaterial = std::move(material);
}

void Mesh::GetAABBBounds(const glm::vec3 &position, const glm::vec3 &scale, const glm::mat4 &rotate, glm::vec3 &aabbMin,
                         glm::vec3 &aabbMax) {
    if (mShouldUpdate) {
        auto modelMatrix = GeneratorModelMatrix(position, scale, rotate);

        const auto maxFloat = std::numeric_limits<float>::max();
        aabbMin = glm::vec3{maxFloat, maxFloat, maxFloat};
        aabbMax = glm::vec3{-maxFloat, -maxFloat, -maxFloat};
        for (const auto &vertex : mGeometry->GetVertices()) {
            const auto &localP = vertex;
            glm::vec4 globalP = modelMatrix * glm::vec4(localP, 1.f);

            for (int i = 0; i < 3; i++) {
                aabbMin[i] = std::min(aabbMin[i], globalP[i]/globalP[3]);
                aabbMax[i] = std::max(aabbMax[i], globalP[i]/globalP[3]);
            }
        }
        mBoundingBoxType = BoundingBoxType::AABB;
        mBounds.aabbBounds = AABBBounds{aabbMin, aabbMax};
        mShouldUpdate = false;
    } else {
        aabbMin = mBounds.aabbBounds.mMin;
        aabbMax = mBounds.aabbBounds.mMax;
    }
}

void Mesh::GetBoundingSphere(const glm::vec3 &position, const glm::vec3 &scale, const glm::mat4 &rotate, glm::vec3 &center,
                        float &radius) {

}
