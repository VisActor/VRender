//
// Created by ByteDance on 2023/8/17.
//

#ifndef VRENDER_GPU_MODEL_HPP
#define VRENDER_GPU_MODEL_HPP

#include "Pickable.hpp"
#include "Shader.hpp"
#include "Mesh.hpp"
#include "ICamera.hpp"

class Model: public Pickable {
public:
    Model(): Pickable{}, mMeshes{} {};
    ~Model() = default;
    void Init(std::vector<std::shared_ptr<Mesh>> meshes);
    void Init(const std::shared_ptr<Mesh>& mesh);

    void Build();
    void Draw(std::shared_ptr<ICamera> &camera, std::shared_ptr<ResourceManager> &resourceManager, const glm::mat4& modelMatrix);

    void GetAABBBounds(const glm::vec3 &position, const glm::vec3 &scale, const glm::mat4 &rotate, glm::vec3 &aabbMin, glm::vec3 &aabbMax) override;
    void GetBoundingSphere(const glm::vec3 &position, const glm::vec3 &scale, const glm::mat4 &rotate, glm::vec3 &center, float &radius) override;
protected:
    std::vector<std::shared_ptr<Mesh>> mMeshes;
};

#endif //VRENDER_GPU_MODEL_HPP
