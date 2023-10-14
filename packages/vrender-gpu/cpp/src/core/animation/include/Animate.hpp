//
// Created by ByteDance on 2023/10/12.
//

#ifndef VRENDER_GPU_ANIMATE_HPP
#define VRENDER_GPU_ANIMATE_HPP

#include <assimp/mesh.h>
#include <assimp/scene.h>
#include <vector>
#include "BufferGeometry.hpp"
#include "AnimateInfo.hpp"
#include "AnimateSlice.hpp"
#include "Shader.hpp"
#include "Texture2D.hpp"

class Animate {
public:
    Animate(): mGeometry{nullptr}, mAnimateSlice{}, mGeometries{}, mSize{}, mTexture{nullptr, "texture_diffuse"} {}
    ~Animate() = default;
    void Init(std::shared_ptr<BufferGeometry> &geo, const aiMesh *mesh, const aiScene *aScene);
    void Interpolate(double t, double delta);
    void Build(double time, double deltaTime);
    inline const glm::vec<2, unsigned int>& GetSize() { return mSize; }
    inline const std::vector<std::shared_ptr<BufferGeometry>>& GetGeometries() {return mGeometries;}

    void SetUniformData(std::shared_ptr<Shader> shader);
protected:
    std::shared_ptr<BufferGeometry> mGeometry;
    std::vector<std::shared_ptr<BufferGeometry>> mGeometries;
    std::vector<std::shared_ptr<AnimateSlice>> mAnimateSlice;
    Texture mTexture;
    glm::vec<2, unsigned int> mSize;

    void LoadGeometries(const aiMesh *mesh);
    void LoadAnimateInfo(const aiMesh *mesh, const aiScene *aScene);
    void BuildTexture();
};

#endif //VRENDER_GPU_ANIMATE_HPP
