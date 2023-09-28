//
// Created by ByteDance on 2023/8/7.
//
#include "Shader.hpp"
#include <glm/gtc/type_ptr.hpp>
#include <iostream>
#include <exception>

GLuint Shader::sId = 0;

Shader& Shader::Use() {
    glUseProgram(mId);
    return *this;
}
Shader& Shader::UnUse() {
    glUseProgram(0);
    return *this;
}

void Shader::Dispose() {
    glDeleteProgram(mId);
}

/**
 * 编译着色器，不会释放着色器代码，请外部释放着色器代码
 * @param vertexSource
 * @param fragmentSource
 * @param geometrySource
 */
void Shader::Compile(const GLchar *vertexSource, const GLchar *fragmentSource, const GLchar *geometrySource) {
    GLuint vShader, fShader, gShader;

    // 顶点着色器
    vShader = glCreateShader(GL_VERTEX_SHADER);
    glShaderSource(vShader, 1, &vertexSource, nullptr);
    glCompileShader(vShader);
#ifdef DEBUG
    CheckCompileErrors(vShader, Type::VERTEX);
#endif

    // 片元着色器
    fShader = glCreateShader(GL_FRAGMENT_SHADER);
    glShaderSource(fShader, 1, &fragmentSource, nullptr);
    glCompileShader(fShader);
#ifdef DEBUG
    CheckCompileErrors(vShader, Type::FRAGMENT);
#endif

    mId = glCreateProgram();
    glAttachShader(mId, vShader);
    glAttachShader(mId, fShader);
    glLinkProgram(mId);
#ifdef DEBUG
    CheckCompileErrors(mId, Type::PROGRAM);
#endif

    // 清理内存
    glDeleteShader(vShader);
    glDeleteShader(fShader);
}

/* ------------ 工具函数 ------------- */

void Shader::InitTextureUniform(int num) {
    std::string name;
    for (int i = 0; i < num; i++) {
        name = "texture"+std::to_string(i);
        SetInt(name.c_str(), i);
    }
}

void Shader::SetInt(const GLchar *name, GLint value, GLboolean useShader) {
    if (useShader) Use();
    glUniform1i(glGetUniformLocation(mId, name), value);
}

void Shader::SetBool(const GLchar *name, GLboolean value, GLboolean useShader) {
    if (useShader) Use();
    glUniform1i(glGetUniformLocation(mId, name), GLint(value));
}

void Shader::SetFloat(const GLchar *name, GLfloat value, GLboolean useShader) {
    if (useShader) Use();
    glUniform1f(glGetUniformLocation(mId, name), value);
}

void Shader::SetVector2f(const GLchar *name, GLfloat x, GLfloat y, GLboolean useShader) {
    if (useShader) Use();
    glUniform2f(glGetUniformLocation(mId, name), x, y);
}

void Shader::SetVector2f(const GLchar *name, const glm::vec2 &value, GLboolean useShader) {
    if (useShader) Use();
    glUniform2f(glGetUniformLocation(mId, name), value.x, value.y);
}

void Shader::SetVector2i(const GLchar *name, GLint x, GLint y, GLboolean useShader) {
    if (useShader) Use();
    glUniform2i(glGetUniformLocation(mId, name), x, y);
}

void Shader::SetVector2i(const GLchar *name, const glm::vec<2, int> &value, GLboolean useShader) {
    if (useShader) Use();
    glUniform2i(glGetUniformLocation(mId, name), value.x, value.y);
}

void Shader::SetVector3f(const GLchar *name, GLfloat x, GLfloat y, GLfloat z, GLboolean useShader) {
    if (useShader) Use();
    glUniform3f(glGetUniformLocation(mId, name), x, y, z);
}

void Shader::SetVector3f(const GLchar *name, const glm::vec3 &value, GLboolean useShader) {
    if (useShader) Use();
    glUniform3f(glGetUniformLocation(mId, name), value.x, value.y, value.z);
}

void Shader::SetVector4f(const GLchar *name, GLfloat x, GLfloat y, GLfloat z, GLfloat w, GLboolean useShader) {
    if (useShader) Use();
    glUniform4f(glGetUniformLocation(mId, name), x, y, z, w);
}

void Shader::SetVector4f(const GLchar *name, const glm::vec4 &value, GLboolean useShader) {
    if (useShader) Use();
    glUniform4f(glGetUniformLocation(mId, name), value.x, value.y, value.z, value.w);
}

void Shader::SetMatrix4(const GLchar *name, const glm::mat4 &value, GLboolean useShader) {
    if (useShader) Use();
    glUniformMatrix4fv(glGetUniformLocation(mId, name), 1, GL_FALSE, glm::value_ptr(value));
}

void Shader::SetFloatVector(const GLchar *name, const std::vector<float> &value, GLboolean useShader) {
    if (useShader) Use();
    glUniform1fv(glGetUniformLocation(mId, name), value.size(), &value[0]);
}

// 错误捕获函数
void Shader::CheckCompileErrors(GLuint object, Type type) {
    GLint success;
    GLchar infoLog[1024];
    if (type != Type::PROGRAM) {
        glGetShaderiv(object, GL_COMPILE_STATUS, &success);
        if (!success) {
            glGetShaderInfoLog(object, 1024, nullptr, infoLog);
            std::cout << "| ERROR::SHADER: Compile-time error: Type: " << int(type) << "\n"
                      << infoLog << "\n -- --------------------------------------------------- -- "
                      << std::endl;
            throw std::runtime_error("构建shader发生错误");
        }
    } else {
        glGetProgramiv(object, GL_LINK_STATUS, &success);
        if (!success) {
            glGetProgramInfoLog(object, 1024, nullptr, infoLog);
            std::cout << "| ERROR::Shader: Link-time error: Type: " << int(type) << "\n"
                      << infoLog << "\n -- --------------------------------------------------- -- "
                      << std::endl;
            throw std::runtime_error("链接shader发生错误");
        }
    }
}