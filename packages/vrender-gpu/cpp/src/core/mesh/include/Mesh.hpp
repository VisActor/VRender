//
// Created by ByteDance on 2023/8/16.
//

#ifndef VRENDER_GPU_MESH_HPP
#define VRENDER_GPU_MESH_HPP

#include <glm/glm.hpp>
#include "Pickable.hpp"
#include "Geometry.hpp"
#include "Material.hpp"

class Mesh: public Pickable {
public:
    Mesh(): Pickable{},
    mGeometry{nullptr}, mMaterial{nullptr},
    mVao{0}, mVbo{0}, mEbo{0}, mNormalPtr{0}, mTexCoordPtr{0}, mColorPtr{0} {};
    void Init(std::shared_ptr<Geometry> geometry, std::shared_ptr<Material> material);
    void GetAABBBounds(const glm::vec3 &position, const glm::vec3 &scale, const glm::mat4 &rotate, glm::vec3 &aabbMin, glm::vec3 &aabbMax) override;
    void GetBoundingSphere(const glm::vec3 &position, const glm::vec3 &scale, const glm::mat4 &rotate, glm::vec3 &center, float &radius) override;

    /* attribute相关 */
    inline void InitVao() {
        glGenVertexArrays(1, &mVao);
    }
    inline void BindVao() const {
        glBindVertexArray(mVao);
    }
    inline void UnBindVao() const {
        glBindVertexArray(0);
    }
    inline void InitVbo() {
        glGenBuffers(1, &mVbo);
    }
    inline void BindVbo() const {
        glBindBuffer(GL_ARRAY_BUFFER, mVbo);
    }
    inline void InitEbo() {
        glGenBuffers(1, &mEbo);
    }
    inline void BindEbo() const {
        glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, mEbo);
    }
    inline void UnBindEbo() const {
        glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, 0);
    }
    inline void InitTexCoordsPtr() {
        glGenBuffers(1, &mTexCoordPtr);
    }
    inline void BindTexCoordsPtr() const {
        glBindBuffer(GL_ARRAY_BUFFER, mTexCoordPtr);
    }
    inline void InitNormalPtr() {
        glGenBuffers(1, &mNormalPtr);
    }
    inline void BindNormalPtr() const {
        glBindBuffer(GL_ARRAY_BUFFER, mNormalPtr);
    }
    inline void InitColorPtr() {
        glGenBuffers(1, &mColorPtr);
    }
    inline void BindColorPtr() const {
        glBindBuffer(GL_ARRAY_BUFFER, mColorPtr);
    }
    static inline void CreateBuffer(GLuint &bufId) {
        glGenBuffers(1, &bufId);
    }
    static inline void BindBuffer(GLuint bufId) {
        glBindBuffer(GL_ARRAY_BUFFER, bufId);
    }
    static inline void BufferData(GLsizei size, const void *data) {
        glBufferData(GL_ARRAY_BUFFER, size, data, GL_STATIC_DRAW);
    }
    static inline void UnBindBuffer() {
        glBindBuffer(GL_ARRAY_BUFFER, 0);
    }
    /* attribute相关 */

    void BufferData();
    void UseShader(std::shared_ptr<ResourceManager> resourceManager);
    std::shared_ptr<Shader> GetShader(std::shared_ptr<ResourceManager> resourceManager);

    void SetUniformData();
    void SetLightUniform(std::shared_ptr<ResourceManager> &resourceManager, std::vector<std::shared_ptr<ILight>> &lightArr);

    virtual void Draw() {
        if (!mGeometry) {
            return;
        }
        BindVao();
        if (mGeometry->mUseIndices) {
            BindEbo();
            const auto &indices = mGeometry->GetIndices();
            if (indices.empty()) return;
            glDrawElements(GL_TRIANGLES, int(indices.size()) * 3, GL_UNSIGNED_INT, 0);
        } else {
            const auto &vertices = mGeometry->GetVertices();
            if (vertices.empty()) return;
            glDrawArrays(GL_TRIANGLES, 0, int(vertices.size()));
        }
    }

    ~Mesh() = default;
protected:
    std::shared_ptr<Geometry> mGeometry;
    std::shared_ptr<Material> mMaterial;

    GLuint mVao;
    GLuint mVbo;
    GLuint mEbo;

    GLuint mNormalPtr;
    GLuint mTexCoordPtr;
    GLuint mColorPtr;

    void _BufferData();
};

#endif //VRENDER_GPU_MESH_HPP
