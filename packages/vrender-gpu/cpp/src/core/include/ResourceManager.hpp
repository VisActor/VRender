//
// Created by ByteDance on 2023/8/7.
//

#ifndef VRENDER_GPU_RESOURCEMANAGER_HPP
#define VRENDER_GPU_RESOURCEMANAGER_HPP

#include "GL.hpp"
#include <unordered_map>
#include "Shader.hpp"
#include "Texture2D.hpp"

class ResourceManager {
public:
    ResourceManager();

    enum ShaderType {
        VERTEX =   0b000001,
        FRAGMENT = 0b000010,
        GEOMETRY = 0b000100
    };

    // 加载
    std::shared_ptr<Shader> LoadShader(const GLchar *vShaderFile, const GLchar *fShaderFile, const GLchar *gShaderFile, const std::string &name);
    std::shared_ptr<Shader> LoadShader(const std::string &shaderName, unsigned char type = 0b000011);
    std::shared_ptr<Shader> GetShader(const std::string &name);
    std::shared_ptr<Texture2D> LoadTexture(const GLchar *file, GLboolean alpha, std::string name, bool flipVertical=true);
    std::shared_ptr<Texture2D> GetTexture(const std::string &name);
    std::pair<std::shared_ptr<char>, size_t> GetFontData(const std::string &name);
    std::pair<std::shared_ptr<char>, size_t> LoadFontData(const std::string &name);
    void Clear();
private:
    // 加载和生成shader
    static std::shared_ptr<Shader> LoadShaderFromFile(const GLchar *vShaderFile, const GLchar *fShaderFile, const std::string &name, const GLchar *gShaderFile = nullptr);
    // 从文件中加载单个纹理
    static std::shared_ptr<Texture2D> LoadTextureFromFile(const GLchar *file, GLboolean alpha, bool flipVertical);
    // 从文件中加载字体
    static std::pair<std::shared_ptr<char>, size_t> LoadFontFromFile(const std::string &fileName, const std::string &fontName);

    std::unordered_map<std::string, std::shared_ptr<Shader>> mShaders;
    std::unordered_map<std::string, std::shared_ptr<Texture2D>> mTextures;
    std::unordered_map<std::string, std::pair<std::shared_ptr<char>, size_t>> mFontData;
    std::unordered_map<std::string, std::string> mFontNameMapFileName;

    static std::string sShaderPath;
    static std::string sFontPath;
    static std::string sTexturePath;
};

#endif //VRENDER_GPU_RESOURCEMANAGER_HPP
