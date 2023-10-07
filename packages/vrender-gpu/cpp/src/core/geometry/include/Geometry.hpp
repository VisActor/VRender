//
// Created by ByteDance on 2023/8/16.
//

#ifndef VRENDER_GPU_GEOMETRY_HPP
#define VRENDER_GPU_GEOMETRY_HPP

#include <glm/glm.hpp>
#include <vector>

class Geometry {
public:
    virtual void InIt(float size) = 0;

    [[nodiscard]] const std::vector<glm::vec<3, float>>& GetVertices() const { return mVertices; }
    [[nodiscard]] const std::vector<glm::vec<3, float>>& GetNormals() const { return mNormals; }
    [[nodiscard]] const std::vector<glm::vec<2, float>>& GetTextureCoords() const { return mTextureCoords; }
    [[nodiscard]] const std::vector<glm::vec<3, unsigned int>>& GetIndices() const { return mIndices; }

    bool mUpdateVertices;
    bool mUpdateIndices;
    bool mUpdateTexCoords;
    bool mUseIndices;

protected:
    Geometry(): mVertices{}, mNormals{}, mTextureCoords{}, mIndices{}, mUpdateIndices{false}, mUseIndices{false}, mUpdateVertices{true}, mUpdateTexCoords{true} {
    };
    virtual ~Geometry() = default;
    std::vector<glm::vec<3, float>> mVertices;
    std::vector<glm::vec<3, float>> mNormals;
    std::vector<glm::vec<2, float>> mTextureCoords;
    std::vector<glm::vec<3, unsigned int>> mIndices;
};

#endif //VRENDER_GPU_GEOMETRY_HPP
