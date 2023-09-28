//
// Created by ByteDance on 2023/8/7.
//

#ifndef VRENDER_GPU_SHADER_HPP
#define VRENDER_GPU_SHADER_HPP

#include "GL.hpp"
#include <string>
#include <vector>
#include <glm/glm.hpp>
#include "Tools.hpp"
#include "Struct.hpp"

class Shader {
public:
    enum class Type {
        VERTEX = 0,
        FRAGMENT,
        PROGRAM
    };

    explicit Shader(std::string name): mId{sId++}, mShaderName{std::move(name)}, mLastCommonUniformUpdateStamp{0} {}

    void Compile(const GLchar *vertexSource, const GLchar *fragmentSource, const GLchar *geometrySource = nullptr);
    Shader& Use();
    Shader& UnUse();

    void Dispose();

    // uniform工具函数
    // 设置shader中texture的uniform值
    void InitTextureUniform(int num);
    void SetInt(const GLchar *name, GLint value, GLboolean useShader = false);
    void SetBool(const GLchar *name, GLboolean value, GLboolean useShader = false);
    void SetFloat(const GLchar *name, GLfloat value, GLboolean useShader = false);
    void SetVector2f(const GLchar *name, GLfloat x, GLfloat y, GLboolean useShader = false);
    void SetVector2f(const GLchar *name, const glm::vec2 &value, GLboolean useShader = false);
    void SetVector2i(const GLchar *name, const glm::vec<2, int> &value, GLboolean useShader = false);
    void SetVector2i(const GLchar *name, GLint x, GLint y, GLboolean useShader = false);
    void SetVector3f(const GLchar *name, GLfloat x, GLfloat y, GLfloat z, GLboolean useShader = false);
    void SetVector3f(const GLchar *name, const glm::vec3 &value, GLboolean useShader = false);
    void SetVector4f(const GLchar *name, GLfloat x, GLfloat y, GLfloat z, GLfloat w, GLboolean useShader = false);
    void SetVector4f(const GLchar *name, const glm::vec4 &value, GLboolean useShader = false);
    void SetMatrix4(const GLchar *name, const glm::mat4 &value, GLboolean useShader = false);
    void SetFloatVector(const GLchar *name, const std::vector<float> &value, GLboolean useShader = false);

    [[nodiscard]] bool NeedUpdateCommonUniform(size_t stamp) const { return stamp >= mLastCommonUniformUpdateStamp; }
    void ResetLastCommonUniformUpdateStamp(size_t stamp) { mLastCommonUniformUpdateStamp = stamp; }

    // 检查是否编译或者链接错误，如果错误，打印出错误
    static void CheckCompileErrors(GLuint object, Type type);

    inline std::string GetShaderName() const { return mShaderName; }

    template<typename T>
    void SetUniform(UniformItem<T> &uniformItem, bool use = true) {
        if (use) {
            Use();
        }
        if constexpr (std::is_same<T, glm::vec2>::value) {
            SetVector2f(uniformItem.name.c_str(), uniformItem.data);
        }
        if constexpr (std::is_same<T, glm::vec3>::value) {
            SetVector3f(uniformItem.name.c_str(), uniformItem.data);
        }
        if constexpr (std::is_same<T, glm::vec4>::value) {
            SetVector4f(uniformItem.name.c_str(), uniformItem.data);
        }
        if constexpr (std::is_same<T, float>::value) {
            SetFloat(uniformItem.name.c_str(), uniformItem.data);
        }
        if constexpr (std::is_same<T, int>::value) {
            SetInt(uniformItem.name.c_str(), uniformItem.data);
        }
        if constexpr (std::is_same<T, glm::vec<2, int>>::value) {
            SetVector2i(uniformItem.name.c_str(), uniformItem.data);
        }
        if constexpr (std::is_same<T, std::vector<float>>::value) {
            SetFloatVector(uniformItem.name.c_str(), uniformItem.data);
        }
        if constexpr (std::is_same<T, glm::mat4>::value) {
            SetMatrix4(uniformItem.name.c_str(), uniformItem.data);
        }
    }

    GLuint mId;
private:
    static GLuint sId;
    std::string mShaderName;
    size_t mLastCommonUniformUpdateStamp; // 记录上次更新CommonUniform的stamp
};

#endif //VRENDER_GPU_SHADER_HPP
