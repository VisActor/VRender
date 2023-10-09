//
// Created by ByteDance on 2023/8/16.
//

#ifndef VRENDER_GPU_GEOMETRY_HPP
#define VRENDER_GPU_GEOMETRY_HPP

#include <glm/glm.hpp>
#include <utility>
#include <vector>

class Geometry {
public:
    virtual void InIt(float size) = 0;

    [[nodiscard]] const std::vector<glm::vec<3, float>>& GetVertices() const { return mVertices; }
    void SetVertices(std::vector<glm::vec<3, float>> vertices) {
        mVertices = std::move(vertices);
        mUpdateVertices = true;
    }
    [[nodiscard]] const std::vector<glm::vec<3, float>>& GetNormals() const { return mNormals; }
    void SetNormals(std::vector<glm::vec<3, float>> normals) {
        mNormals = std::move(normals);
        mUpdateNormals = true;
    }
    [[nodiscard]] const std::vector<glm::vec<4, float>>& GetColors() const { return mColors; }
    void SetColors(std::vector<glm::vec<4, float>> colors) {
        mColors = std::move(colors);
        mUseColors = true;
        mUpdateColors = true;
    }
    [[nodiscard]] const std::vector<glm::vec<2, float>>& GetTextureCoords() const { return mTextureCoords; }
    void SetTextureCoords(std::vector<glm::vec<2, float>> texCoords) {
        mTextureCoords = std::move(texCoords);
        mUpdateTexCoords = true;
    }
    [[nodiscard]] const std::vector<glm::vec<3, unsigned int>>& GetIndices() const { return mIndices; }
    void SetIndices(std::vector<glm::vec<3, unsigned int>> indices) {
        mIndices = std::move(indices);
        mUpdateIndices = true;
        mUseIndices = true;
    }

    bool mUpdateVertices;
    bool mUpdateIndices;
    bool mUpdateTexCoords;
    bool mUpdateColors;
    bool mUpdateNormals;
    bool mUseIndices;
    bool mUseColors;

protected:
    Geometry(): mVertices{}, mNormals{}, mTextureCoords{}, mIndices{}, mColors{},
        mUpdateIndices{false}, mUseIndices{false}, mUseColors{false}, mUpdateColors{false},
        mUpdateVertices{true}, mUpdateTexCoords{true}, mUpdateNormals{true} {
    };
    virtual ~Geometry() = default;
    std::vector<glm::vec<3, float>> mVertices;
    std::vector<glm::vec<3, float>> mNormals;
    std::vector<glm::vec<2, float>> mTextureCoords;
    std::vector<glm::vec<3, unsigned int>> mIndices;
    std::vector<glm::vec<4, float>> mColors;
};

#endif //VRENDER_GPU_GEOMETRY_HPP
