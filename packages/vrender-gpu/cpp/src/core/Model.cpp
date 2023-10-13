//
// Created by ByteDance on 2023/8/17.
//
#include "Model.hpp"
#include "Type.hpp"

void Model::Init(std::vector<std::shared_ptr<Mesh>> meshes) {
    mMeshes = std::move(meshes);
}

void Model::Init(const std::shared_ptr<Mesh>& mesh) {
    mMeshes.push_back(mesh);
}

void Model::Init(const std::string &path, std::shared_ptr<ResourceManager> &resourceManager) {
    LoadModel(path, resourceManager);
}

void Model::LoadModel(const std::string &path, std::shared_ptr<ResourceManager> &resourceManager) {
    Assimp::Importer importer;
    const auto *scene = importer.ReadFile(path, aiProcess_Triangulate | aiProcess_FindInstances | aiProcess_GenNormals);

    if (scene == nullptr || scene->mFlags & AI_SCENE_FLAGS_INCOMPLETE || !scene->mRootNode) {
        std::cout<<"load model: "<<importer.GetErrorString()<<std::endl;
        return;
    }

    mModelDirectory = path.substr(0, path.find_last_of('/'));

    ProcessNode(scene->mRootNode, scene, resourceManager);
}

void Model::ProcessNode(aiNode *node, const aiScene *scene, std::shared_ptr<ResourceManager> &resourceManager) {
    for (int i = 0; i < node->mNumMeshes; i++) {
        auto *mesh = scene->mMeshes[node->mMeshes[i]];
        mMeshes.push_back(ProcessMesh(mesh, scene, resourceManager));
    }

    for (int i = 0; i < node->mNumChildren; i++) {
        ProcessNode(node->mChildren[i], scene, resourceManager);
    }
}

std::shared_ptr<Mesh> Model::ProcessMesh(aiMesh *mesh, const aiScene *scene, std::shared_ptr<ResourceManager> &resourceManager) {
    static std::vector<glm::vec<3, float>> _vertices;
    static std::vector<glm::vec<3, float>> _normals;
    static std::vector<glm::vec<2, float>> _texCoords;
    static std::vector<glm::vec<4, float>> _colors;
    static std::vector<glm::vec<3, unsigned int>> _indices;

    _vertices.clear();
    _normals.clear();
    _texCoords.clear();
    _indices.clear();
    _colors.clear();

    auto outMesh = std::make_shared<Mesh>();
    auto outBufferGeometry = std::make_shared<BufferGeometry>();
    outBufferGeometry->InIt(10);
    auto outMaterial = std::make_shared<MeshPhongMaterial>();
    outMaterial->Init(resourceManager);

    // mesh
    for (int i = 0; i < mesh->mNumVertices; i++) {
        glm::vec3 position{};
        const auto &v = mesh->mVertices[i];
        position.x = v.x;
        position.y = v.y;
        position.z = v.z;
        _vertices.emplace_back(position);

        if (mesh->HasNormals()) {
            glm::vec3 normal{};
            const auto &n = mesh->mNormals[i];
            normal.x = n.x;
            normal.y = n.y;
            normal.z = n.z;
            _normals.emplace_back(normal);
        }

        if (mesh->HasTextureCoords(0)) {
            glm::vec2 texCoords{};
            const auto &t = mesh->mTextureCoords[0][i];
            texCoords.x = t.x;
            texCoords.y = t.y;
            _texCoords.emplace_back(texCoords);
        }

        if (mesh->HasVertexColors(0)) {
            glm::vec4 colors{};
            const auto &c = mesh->mColors[0][i];
            colors.r = c.r;
            colors.g = c.g;
            colors.b = c.b;
            colors.a = c.a;
            _colors.emplace_back(colors);
        }
    }

    // indices
    for (int i = 0; i < mesh->mNumFaces; i++) {
        const auto &face = mesh->mFaces[i];
        for (int j = 0; j < face.mNumIndices; j += 3) {
            _indices.emplace_back(face.mIndices[j], face.mIndices[j+1], face.mIndices[j+2]);
        }
    }

    // texture
    if (mesh->mMaterialIndex >= 0) {
        auto &textures = outMaterial->mTextures;
        aiMaterial *material = scene->mMaterials[mesh->mMaterialIndex];

        // we assume a convention for sampler names in the shaders. Each diffuse texture should be named
        // as 'texture_diffuseN' where N is a sequential number ranging from 1 to MAX_SAMPLER_NUMBER.
        // Same applies to other texture as the following list summarizes:
        // diffuse: texture_diffuseN
        // specular: texture_specularN
        // normal: texture_normalN

        // 1. diffuse maps
        auto diffuseMaps = LoadMaterialTextures(material, aiTextureType_DIFFUSE, "texture_diffuse", resourceManager);
        textures.insert(textures.end(), diffuseMaps.begin(), diffuseMaps.end());
        // 2. specular maps
        auto specularMaps = LoadMaterialTextures(material, aiTextureType_SPECULAR, "texture_specular", resourceManager);
        textures.insert(textures.end(), specularMaps.begin(), specularMaps.end());
        // 3. normal maps
        auto normalMaps = LoadMaterialTextures(material, aiTextureType_HEIGHT, "texture_normal", resourceManager);
        textures.insert(textures.end(), normalMaps.begin(), normalMaps.end());
        // 4. height maps
        auto heightMaps = LoadMaterialTextures(material, aiTextureType_AMBIENT, "texture_height", resourceManager);
        textures.insert(textures.end(), heightMaps.begin(), heightMaps.end());

//        for (int i = 0; i <= aiTextureType_TRANSMISSION; i++) {
//            auto maps = LoadMaterialTextures(material, aiTextureType_AMBIENT, "texture_diffuse", resourceManager);
//            textures.insert(textures.end(), maps.begin(), maps.end());
//        }
    }

    if (_indices.empty()) {
        outBufferGeometry->mUseIndices = false;
        outBufferGeometry->mUpdateIndices = false;
    } else {
        outBufferGeometry->SetIndices(_indices);
    }
    outBufferGeometry->SetVertices(_vertices);
    if (_normals.empty()) {
        outBufferGeometry->mUpdateNormals = false;
    } else {
        outBufferGeometry->SetNormals(_normals);
    }
    outBufferGeometry->SetTextureCoords(_texCoords);
    if (_colors.empty()) {
        outBufferGeometry->mUseColors = false;
        outBufferGeometry->mUpdateColors = false;
    } else {
        outBufferGeometry->SetColors(_colors);
    }

    outMesh->Init(outBufferGeometry, outMaterial);

    if (mesh->mAnimMeshes) {
        outMesh->SetAnimate(mesh, scene);
    }
    return outMesh;
}
//
//void Model::ProcessAnim(const aiScene *scene, std::shared_ptr<ResourceManager> &resourceManager) {
//    if(scene->mNumAnimations) {
//        for (int i = 0; i < scene->mNumAnimations; i++) {
//            auto &anim = scene->mAnimations[i];
//            mAnimateInfo.mDuration = anim->mDuration;
//            mAnimateInfo.mTickPerSecond = anim->mTicksPerSecond;
//
//            ProcessMorphAnim(anim, resourceManager);
//        }
//    }
//}
//
//void Model::ProcessMorphAnim(const aiAnimation *animation, std::shared_ptr<ResourceManager> &resourceManager) {
//    auto numMorphChannel = animation->mNumMorphMeshChannels;
//    for (int i = 0; i < numMorphChannel; i++) {
//        auto channel = animation->mMorphMeshChannels[i];
//        if (channel->mNumKeys) {
//            MorphInfo morphInfo{};
//            auto &key = channel->mKeys[i];
//            morphInfo.mNumValuesAndWeights = key.mNumValuesAndWeights;
//            morphInfo.mTime = key.mTime;
//
//        }
//    }
//}

std::vector<Texture>
Model::LoadMaterialTextures(aiMaterial *material, aiTextureType type, std::string typeName, std::shared_ptr<ResourceManager> &resourceManager) {
    std::vector<Texture> textures{};
    for (int i = 0; i < material->GetTextureCount(type); i++) {
        aiString path;
        material->GetTexture(type, i, &path);
        std::string filepath = mModelDirectory + "/" + path.C_Str();
        auto texture2D = resourceManager->LoadTexture(filepath.c_str(), true, filepath, false);
        textures.push_back({
            texture2D,
            typeName
        });
    }
    return textures;
}

void Model::Build(const std::shared_ptr<AnimateTicker> &ticker) {
    for (auto mesh : mMeshes) {
        mesh->Build(ticker->GetTime(), ticker->GetDeltaTime());
    }
}

void Model::Draw(std::shared_ptr<ICamera> &camera, std::shared_ptr<ResourceManager> &resourceManager, std::vector<std::shared_ptr<ILight>> &lightArr, const glm::mat4& modelMatrix, const std::shared_ptr<AnimateTicker> &ticker) {
    for (auto mesh : mMeshes) {
        mesh->UseShader(resourceManager);

        const auto &shader = mesh->GetShader(resourceManager);
        shader->SetMatrix4("u_model", modelMatrix, false);
        shader->SetMatrix4("u_view", camera->GetViewMatrix(), false);
        shader->SetMatrix4("u_projection", camera->GetProjectionMatrix(), false);
//        if (shader->NeedUpdateCommonUniform(mCommonUniformStore.mStamp)) {
//            shader->SetMatrix4("u_preModelMatrix", mCommonUniformStore.mPreModelMatrixUniform.data);
//            shader->ResetLastCommonUniformUpdateStamp(mCommonUniformStore.mStamp);
//        }

        mesh->BufferData();
        mesh->SetUniformData(resourceManager);
        mesh->SetLightUniform(resourceManager, lightArr);
        mesh->PreDraw(ticker->GetTime(), ticker->GetDeltaTime());
        // 设置绘制模式
        glPolygonMode(GL_FRONT_AND_BACK, GL_FILL);
        mesh->Draw();
    }
}

void Model::GetAABBBounds(const glm::vec3 &position, const glm::vec3 &scale, const glm::mat4 &rotate, glm::vec3 &aabbMin,
                     glm::vec3 &aabbMax) {
    if (mShouldUpdate) {
        mBoundingBoxType = BoundingBoxType::AABB;
        const auto maxFloat = std::numeric_limits<float>::max();
        aabbMin = glm::vec3{maxFloat, maxFloat, maxFloat};
        aabbMax = glm::vec3{-maxFloat, -maxFloat, -maxFloat};

        glm::vec3 minPos, maxPos;
        for (auto &mesh : mMeshes) {
            mesh->GetAABBBounds(position, scale, rotate, minPos, maxPos);
            for (int i = 0; i < 3; i++) {
                aabbMin[i] = std::min(aabbMin[i], minPos[i]);
                aabbMax[i] = std::max(aabbMax[i], maxPos[i]);
            }
        }
        mBounds.aabbBounds = AABBBounds{
                aabbMin,
                aabbMax
        };
        mShouldUpdate = false;
    } else {
        aabbMin = mBounds.aabbBounds.mMin;
        aabbMax = mBounds.aabbBounds.mMax;
    }
}

void Model::GetBoundingSphere(const glm::vec3 &position, const glm::vec3 &scale, const glm::mat4 &rotate, glm::vec3 &center,
                         float &radius) {
    mBoundingBoxType = BoundingBoxType::Sphere;
    glm::vec3 aabbMin, aabbMax;
    GetAABBBounds(position, scale, rotate, aabbMin, aabbMax);
    glm::vec3 t = aabbMax - aabbMin;
    center = t / 2.f;
    radius = glm::length(t) / 2.f;

    mBounds.sphereBounds = SphereBounds{
            center,
            radius
    };
}
