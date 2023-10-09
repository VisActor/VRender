//
// Created by ByteDance on 2023/10/7.
//

#ifndef VRENDER_GPU_SPHEREGEOMETRY_HPP
#define VRENDER_GPU_SPHEREGEOMETRY_HPP

#include "Geometry.hpp"

class SphereGeometry: public Geometry {
public:
    SphereGeometry(): Geometry() {
        mUpdateIndices = true;
        mUseIndices = true;
    };
    ~SphereGeometry() override = default;
    void InIt(float size) override;
private:
//    static std::vector<glm::vec<3, float>> sCommonVertices;
//    static std::vector<glm::vec<3, float>> sCommonNormals;
//    static std::vector<glm::vec<2, float>> sTextureCoords;
//    static std::vector<glm::vec<3, unsigned int>> sCommonIndices;
};
#endif //VRENDER_GPU_SPHEREGEOMETRY_HPP
