//
// Created by ByteDance on 2023/8/16.
//

#ifndef VRENDER_GPU_BOXGEOMETRY_HPP
#define VRENDER_GPU_BOXGEOMETRY_HPP

#include "Geometry.hpp"

class BoxGeometry: public Geometry {
public:
    BoxGeometry(): Geometry() {
        mUpdateIndices = false;
        mUseIndices = false;
    };
    void InIt(float size) override;
private:
    static std::vector<glm::vec<3, float>> sCommonVertices;
    static std::vector<glm::vec<3, float>> sCommonNormals;
    static std::vector<glm::vec<2, float>> sTextureCoords;
//    static std::vector<glm::vec<3, unsigned int>> sCommonIndices;
};

#endif //VRENDER_GPU_BOXGEOMETRY_HPP
