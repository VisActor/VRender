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
    Mesh(): Pickable{}, mGeometry{nullptr}, mMaterial{nullptr} {};
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

    virtual void Draw(bool useIndices) {
        BindVao();
        if (useIndices) {
            BindEbo();
            const auto &indices = mGeometry->GetIndices();
            if (indices.empty()) return;
            glDrawElements(GL_TRIANGLES, indices.size() * 3, GL_UNSIGNED_INT, 0);
        } else {
            const auto &vertices = mGeometry->GetVertices();
            if (vertices.empty()) return;
            glDrawArrays(GL_TRIANGLES, 0, vertices.size());
        }
    }

    ~Mesh() = default;
protected:
    std::shared_ptr<Geometry> mGeometry;
    std::shared_ptr<Material> mMaterial;

    std::unordered_map<std::string, Vec2UniformItem> mVec2UniformMap;
    std::unordered_map<std::string, Vec2iUniformItem> mVec2iUniformMap;
    std::unordered_map<std::string, Vec3UniformItem> mVec3UniformMap;
    std::unordered_map<std::string, Vec4UniformItem> mVec4UniformMap;
    std::unordered_map<std::string, FloatUniformItem> mFloatUniformMap;
    std::unordered_map<std::string, IntUniformItem> mIntUniformMap;
    std::unordered_map<std::string, FloatArrUniformItem> mFloatArrUniformMap;

    GLuint mVao;
    GLuint mVbo;
    GLuint mEbo;
};

#endif //VRENDER_GPU_MESH_HPP
