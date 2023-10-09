//
// Created by ByteDance on 2023/8/16.
//

#ifndef VRENDER_GPU_MATERIAL_HPP
#define VRENDER_GPU_MATERIAL_HPP

#include <iostream>
#include "Shader.hpp"
#include "ResourceManager.hpp"
#include "ILight.hpp"

class Material {
public:
    virtual std::shared_ptr<Shader> GetShader(std::shared_ptr<ResourceManager> resourceManager) = 0;
    virtual void Init(std::shared_ptr<ResourceManager> resourceManager) = 0;
    virtual void UpdateUniform() = 0;
    virtual void UpdateLightUniform(std::shared_ptr<ResourceManager> &resourceManager, std::vector<std::shared_ptr<ILight>> &lightArr) = 0;

    /**
     * 添加uniform，会判断是否重复
     * @tparam T
     * @param uniformItem
     */
    template<typename T>
    void AddUniformData(const UniformItem<T> &uniformItem) {
        if (!HasUniform<T>(uniformItem)) {
            if constexpr (std::is_same<T, glm::vec2>::value) {
                mVec2UniformMap[uniformItem.name] = uniformItem;
            }
            if constexpr (std::is_same<T, glm::vec3>::value) {
                mVec3UniformMap[uniformItem.name] = uniformItem;
            }
            if constexpr (std::is_same<T, glm::vec4>::value) {
                mVec4UniformMap[uniformItem.name] = uniformItem;
            }
            if constexpr (std::is_same<T, float>::value) {
                mFloatUniformMap[uniformItem.name] = uniformItem;
            }
            if constexpr (std::is_same<T, int>::value) {
                mIntUniformMap[uniformItem.name] = uniformItem;
            }
            if constexpr (std::is_same<T, glm::vec<2, int>>::value) {
                mVec2iUniformMap[uniformItem.name] = uniformItem;
            }
            if constexpr (std::is_same<T, std::vector<float>>::value) {
                mFloatArrUniformMap[uniformItem.name] = uniformItem;
            }
        }
    }

    /**
     * 添加或更新uniform
     * @tparam T
     * @param uniformItem
     */
    template <typename T>
    void AddOrUpdateUniformData(UniformItem<T> uniformItem) {
        DeleteUniformData<T>(uniformItem.name);
        AddUniformData<T>(uniformItem);
    }

    /**
     * 删除uniform，传入空字符串就删除所有这个类型的uniform
     * @tparam T
     * @param name
     */
    template <typename T>
    void DeleteUniformData(const std::string &name) {
        if (IsVec2<T>()) {
            if (name.empty()) mVec2UniformMap.clear();
            mVec2UniformMap.erase(name);
        } else if (IsVec3<T>()) {
            if (name.empty()) mVec3UniformMap.clear();
            mVec3UniformMap.erase(name);
        } else if (IsVec4<T>()) {
            if (name.empty()) mVec4UniformMap.clear();
            mVec4UniformMap.erase(name);
        } else if (IsFloat<T>()) {
            if (name.empty()) mFloatUniformMap.clear();
            mFloatUniformMap.erase(name);
        } else if (IsInt<T>()) {
            if (name.empty()) mIntUniformMap.clear();
            mIntUniformMap.erase(name);
        } else if (IsVec2i<T>()) {
            if (name.empty()) mVec2iUniformMap.clear();
            mVec2iUniformMap.erase(name);
        } else if (IsFloatVector<T>()) {
            if (name.empty()) mFloatArrUniformMap.clear();
            mFloatArrUniformMap.erase(name);
        } else {
            std::cout<<"类型不支持"<<std::endl;
        }
    }

    /**
     * 判断这个uniform是否已经存在了
     * @tparam T
     * @param uniformItem
     * @return
     */
    template <typename T>
    bool HasUniform(const UniformItem<T> &uniformItem) {
        if (IsVec2<T>()) {
            auto iter = mVec2UniformMap.find(uniformItem.name);
            return iter != mVec2UniformMap.end();
        } else if (IsVec3<T>()) {
            auto iter = mVec3UniformMap.find(uniformItem.name);
            return iter != mVec3UniformMap.end();
        } else if (IsVec4<T>()) {
            auto iter = mVec4UniformMap.find(uniformItem.name);
            return iter != mVec4UniformMap.end();
        } else if (IsFloat<T>()) {
            auto iter = mFloatUniformMap.find(uniformItem.name);
            return iter != mFloatUniformMap.end();
        } else if (IsInt<T>()) {
            auto iter = mIntUniformMap.find(uniformItem.name);
            return iter != mIntUniformMap.end();
        } else if (IsVec2i<T>()) {
            auto iter = mVec2iUniformMap.find(uniformItem.name);
            return iter != mVec2iUniformMap.end();
        } else if (IsFloatVector<T>()) {
            auto iter = mFloatArrUniformMap.find(uniformItem.name);
            return iter != mFloatArrUniformMap.end();
        } else {
            std::cout<<"类型不支持"<<std::endl;
        }
        return false;
    }
    /**
     * 判断这个uniform是否已经存在了
     * @tparam T
     * @param uniformItem
     * @return
     */
    template <typename T>
    bool HasUniform(const std::string &name) {
        if (IsVec2<T>()) {
            auto iter = mVec2UniformMap.find(name);
            return iter != mVec2UniformMap.end();
        } else if (IsVec3<T>()) {
            auto iter = mVec3UniformMap.find(name);
            return iter != mVec3UniformMap.end();
        } else if (IsVec4<T>()) {
            auto iter = mVec4UniformMap.find(name);
            return iter != mVec4UniformMap.end();
        } else if (IsFloat<T>()) {
            auto iter = mFloatUniformMap.find(name);
            return iter != mFloatUniformMap.end();
        } else if (IsInt<T>()) {
            auto iter = mIntUniformMap.find(name);
            return iter != mIntUniformMap.end();
        } else if (IsVec2i<T>()) {
            auto iter = mVec2iUniformMap.find(name);
            return iter != mVec2iUniformMap.end();
        } else if (IsFloatVector<T>()) {
            auto iter = mFloatArrUniformMap.find(name);
            return iter != mFloatArrUniformMap.end();
        } else {
            std::cout<<"类型不支持"<<std::endl;
        }
        return false;
    }

    void SetUniformData() {
        for (const auto &uniform : mVec2UniformMap) {
            mShader->SetVector2f(uniform.second.name.c_str(), uniform.second.data);
        }
        for (const auto &uniform : mVec3UniformMap) {
            mShader->SetVector3f(uniform.second.name.c_str(), uniform.second.data);
        }
        for (const auto &uniform : mVec4UniformMap) {
            mShader->SetVector4f(uniform.second.name.c_str(), uniform.second.data);
        }
        for (const auto &uniform : mFloatUniformMap) {
            mShader->SetFloat(uniform.second.name.c_str(), uniform.second.data);
        }
        for (const auto &uniform : mIntUniformMap) {
            mShader->SetInt(uniform.second.name.c_str(), uniform.second.data);
        }
        for (const auto &uniform : mVec2iUniformMap) {
            mShader->SetVector2i(uniform.second.name.c_str(), uniform.second.data);
        }
        for (const auto &uniform : mFloatArrUniformMap) {
            mShader->SetFloatVector(uniform.second.name.c_str(), uniform.second.data);
        }

        SetDefaultUniform();
    }

    bool mWireframe;

protected:
    Material(): mWireframe{false} {};
    ~Material() = default;
    std::shared_ptr<Shader> mShader;

    std::unordered_map<std::string, Vec2UniformItem> mVec2UniformMap;
    std::unordered_map<std::string, Vec2iUniformItem> mVec2iUniformMap;
    std::unordered_map<std::string, Vec3UniformItem> mVec3UniformMap;
    std::unordered_map<std::string, Vec4UniformItem> mVec4UniformMap;
    std::unordered_map<std::string, FloatUniformItem> mFloatUniformMap;
    std::unordered_map<std::string, IntUniformItem> mIntUniformMap;
    std::unordered_map<std::string, FloatArrUniformItem> mFloatArrUniformMap;

    virtual void SetDefaultUniform() = 0;
};

#endif //VRENDER_GPU_MATERIAL_HPP
