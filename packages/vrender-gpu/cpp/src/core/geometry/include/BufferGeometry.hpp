//
// Created by ByteDance on 2023/10/9.
//

#ifndef VRENDER_GPU_BUFFERGEOMETRY_HPP
#define VRENDER_GPU_BUFFERGEOMETRY_HPP

#include "Geometry.hpp"

class BufferGeometry: public Geometry {
public:
    BufferGeometry(): Geometry() {
        mUpdateIndices = false;
        mUseIndices = false;
    };
    ~BufferGeometry() override = default;
    void InIt(float size) override;
private:
    static std::vector<glm::vec<3, float>> sCommonVertices;
    static std::vector<glm::vec<3, float>> sCommonNormals;
    static std::vector<glm::vec<2, float>> sTextureCoords;
//    static std::vector<glm::vec<3, unsigned int>> sCommonIndices;
};

#endif //VRENDER_GPU_BUFFERGEOMETRY_HPP
