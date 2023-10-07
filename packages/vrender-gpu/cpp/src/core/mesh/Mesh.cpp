//
// Created by ByteDance on 2023/8/16.
//
#include "Mesh.hpp"

#include <utility>
#include "Tools.hpp"
#include "Type.hpp"
#include "Bounds.hpp"
//#include <utility>

void Mesh::Init(std::shared_ptr<Geometry> geometry, std::shared_ptr<Material> material) {
    mGeometry = std::move(geometry);
    mMaterial = std::move(material);
}

void Mesh::UseShader(std::shared_ptr<ResourceManager> resourceManager) {
    auto shader = mMaterial->GetShader(std::move(resourceManager));
    if (!shader) {
        return;
    }
    shader->Use();
}

std::shared_ptr<Shader> Mesh::GetShader(std::shared_ptr<ResourceManager> resourceManager) {
    return mMaterial->GetShader(std::move(resourceManager));
}

void Mesh::SetUniformData() {
    mMaterial->UpdateUniform();
    mMaterial->SetUniformData();
}

void Mesh::BufferData() {
    if (!mVao) {
        InitVao();
    }
    BindVao();

    _BufferData();

    UnBindVao();
}

void Mesh::_BufferData() {
    // vbo
    if (mGeometry->mUpdateVertices) {
        if (!mVbo) InitVbo();
        BindVbo();
        const auto &vertices =  mGeometry->GetVertices();
        GLsizei sizePerLine = 3 * sizeof(float);
        if (!vertices.empty()) {
            glBufferData(GL_ARRAY_BUFFER, vertices.size() * sizePerLine, &vertices[0], GL_STATIC_DRAW);
            glEnableVertexAttribArray(0);
            glVertexAttribPointer(0, 3, GL_FLOAT, GL_FALSE, sizePerLine, nullptr);
        }
        const auto &textureCoords = mGeometry->GetTextureCoords();
        mGeometry->mUpdateVertices = false;
    }
    // ebo
    if (mGeometry->mUpdateIndices) {
        if (!mEbo) InitEbo();
        BindEbo();
        const auto &indices = mGeometry->GetIndices();
        GLsizei sizePerLine = 3 * sizeof(unsigned int);
        glBufferData(GL_ELEMENT_ARRAY_BUFFER, indices.size() * sizePerLine, &indices[0], GL_STATIC_DRAW);
        mGeometry->mUpdateIndices = false;
    }
    // texture
    if (mGeometry->mUpdateTexCoords) {
        if (!mTexCoordPtr) InitTexCoordsPtr();
        BindTexCoordsPtr();
        const auto &texCoords = mGeometry->GetTextureCoords();
        GLsizei sizePerLine = 2 * sizeof(float);
        if (!texCoords.empty()) {
            glBufferData(GL_ARRAY_BUFFER, texCoords.size() * sizePerLine, &texCoords[0], GL_STATIC_DRAW);
            glEnableVertexAttribArray(2);
            glVertexAttribPointer(2, 2, GL_FLOAT, GL_FALSE, sizePerLine, nullptr);
        }
        mGeometry->mUpdateTexCoords = false;
    }
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
