//
// Created by ByteDance on 2023/8/17.
//

#ifndef VRENDER_GPU_MODEL_HPP
#define VRENDER_GPU_MODEL_HPP

#include <assimp/Importer.hpp>
#include <assimp/scene.h>
#include <assimp/postprocess.h>
#include "Pickable.hpp"
#include "Shader.hpp"
#include "Mesh.hpp"
#include "ICamera.hpp"
#include "ILight.hpp"
#include "Texture2D.hpp"
#include "Type.hpp"
#include "BufferGeometry.hpp"
#include "MeshPhongMaterial.hpp"

class Model: public Pickable {
public:
    Model(): Pickable{}, mMeshes{}, mModelDirectory{""} {};
    ~Model() = default;
    void Init(std::vector<std::shared_ptr<Mesh>> meshes);
    void Init(const std::shared_ptr<Mesh>& mesh);
    void Init(const std::string &path, std::shared_ptr<ResourceManager> &resourceManager);

    void Build();
    void Draw(std::shared_ptr<ICamera> &camera, std::shared_ptr<ResourceManager> &resourceManager, std::vector<std::shared_ptr<ILight>> &light, const glm::mat4& modelMatrix);

    void GetAABBBounds(const glm::vec3 &position, const glm::vec3 &scale, const glm::mat4 &rotate, glm::vec3 &aabbMin, glm::vec3 &aabbMax) override;
    void GetBoundingSphere(const glm::vec3 &position, const glm::vec3 &scale, const glm::mat4 &rotate, glm::vec3 &center, float &radius) override;
protected:
    std::vector<std::shared_ptr<Mesh>> mMeshes;

    void LoadModel(const std::string &path, std::shared_ptr<ResourceManager> &resourceManager);

    void ProcessNode(aiNode *node, const aiScene *scene, std::shared_ptr<ResourceManager> &resourceManager);

    std::shared_ptr<Mesh> ProcessMesh(aiMesh *mesh, const aiScene *scene, std::shared_ptr<ResourceManager> &resourceManager);

    std::vector<Texture> LoadMaterialTextures(aiMaterial *material, aiTextureType type, std::string typeName, std::shared_ptr<ResourceManager> &resourceManager);

    std::string mModelDirectory;
};

#endif //VRENDER_GPU_MODEL_HPP
