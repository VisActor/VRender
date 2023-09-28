//
// Created by ByteDance on 2023/8/17.
//

#ifndef VRENDER_GPU_MODEL_HPP
#define VRENDER_GPU_MODEL_HPP

#include "Pickable.hpp"
#include "Shader.hpp"
#include "Mesh.hpp"

class Model: public Pickable {
public:
    Model(): Pickable{}, mMeshes{} {};
    ~Model() = default;
    void Init(std::vector<std::shared_ptr<Mesh>> meshes);
    void Init(const std::shared_ptr<Mesh>& mesh);

    void GetAABBBounds(const glm::vec3 &position, const glm::vec3 &scale, const glm::mat4 &rotate, glm::vec3 &aabbMin, glm::vec3 &aabbMax) override;
    void GetBoundingSphere(const glm::vec3 &position, const glm::vec3 &scale, const glm::mat4 &rotate, glm::vec3 &center, float &radius) override;
protected:
    std::vector<std::shared_ptr<Mesh>> mMeshes;
};

#endif //VRENDER_GPU_MODEL_HPP
