//
// Created by ByteDance on 2023/8/7.
//
#include "ResourceManager.hpp"
#include <iostream>
#include <fstream>
#include <sstream>
#include <sys/stat.h>
#include <string>
#include <stb_image.h>

#ifdef BrowserEnv
std::string ResourceManager::sShaderPath{"/shader/"};
std::string ResourceManager::sTexturePath{"/"};
std::string ResourceManager::sFontPath{"/font/"};
#endif

#ifdef DarwinEnv
std::string ResourceManager::sShaderPath{SHADER_ROOT};
std::string ResourceManager::sFontPath{FONT_ROOT};
std::string ResourceManager::sTexturePath{SHADER_ROOT};
#endif

ResourceManager::ResourceManager(): mTextures{}, mShaders{}, mFontNameMapFileName{} {
    mFontNameMapFileName["STHeiti"] = "HuaWenHeiTi.ttf";
    mFontNameMapFileName["Noto Color Emoji"] = "NotoColorEmoji.ttf";
    mFontNameMapFileName["seguiemj"] = "seguiemj.ttf";
}

std::shared_ptr<Shader> ResourceManager::LoadShader(const GLchar *vShaderFile, const GLchar *fShaderFile, const GLchar *gShaderFile, const std::string &name) {
    auto iter = mShaders.find(name);
    if (iter != mShaders.end()) {
        return iter->second;
    }
    return mShaders[name] = LoadShaderFromFile(vShaderFile, fShaderFile, name, gShaderFile);
}

std::shared_ptr<Shader> ResourceManager::LoadShader(const std::string &shaderName, unsigned char type) {
    if ((type & ShaderType::GEOMETRY) == 0) {
        auto iter = mShaders.find(shaderName);
        if (iter != mShaders.end()) {
            return iter->second;
        }
        std::string vShaderFile{sShaderPath+shaderName+".vert"}, fShaderFile{sShaderPath+shaderName+".frag"};
//        return std::shared_ptr<Shader>();
        return mShaders[shaderName] = LoadShaderFromFile(vShaderFile.c_str(), fShaderFile.c_str(), shaderName, "");
    } else {
        std::cout<<"暂时只支持顶点着色器和片元着色器"<<std::endl;
        throw std::runtime_error("暂时只支持顶点着色器和片元着色器");
    }
}

std::shared_ptr<Shader> ResourceManager::GetShader(const std::string &name) {
    auto iter = mShaders.find(name);
    if (iter == mShaders.end()) {
        return nullptr;
    }
    return iter->second;
}

std::shared_ptr<Texture2D> ResourceManager::LoadTexture(const GLchar *file, GLboolean alpha, std::string name, bool flipVertical) {
    auto iter = mTextures.find(name);
    if (iter != mTextures.end()) {
        return iter->second;
    }
    return mTextures[name] = LoadTextureFromFile(file, alpha, flipVertical);
}

std::shared_ptr<Texture2D> ResourceManager::GetTexture(const std::string &name) {
    auto iter = mTextures.find(name);
    if (iter == mTextures.end()) {
        return nullptr;
    }
    return iter->second;
}

std::pair<std::shared_ptr<char>, size_t> ResourceManager::GetFontData(const std::string &name) {
    auto iter = mFontData.find(name);
    if (iter == mFontData.end()) {
        return std::pair(nullptr, 0);
    }
    return iter->second;
}

std::pair<std::shared_ptr<char>, size_t> ResourceManager::LoadFontData(const std::string &name) {
    auto data = GetFontData(name);
    if (data.first) return data;
    auto iter = mFontNameMapFileName.find(name);
    if (iter == mFontNameMapFileName.end()) return std::pair(nullptr, 0);
    return mFontData[name] = LoadFontFromFile(iter->second, name);
}

void ResourceManager::Clear() {
    for (auto &shader : mShaders) {
        shader.second->Dispose();
    }
    for (auto &texture : mTextures) {
        texture.second->Dispose();
    }
    mShaders.clear();
    mTextures.clear();
}

std::shared_ptr<Shader> ResourceManager::LoadShaderFromFile(const GLchar *vShaderFile, const GLchar *fShaderFile, const std::string &name, const GLchar *gShaderFile) {
    using std::string; using std::ifstream; using std::stringstream;
    string vertexCode, fragmentCode;

    std::cout<<vShaderFile<<fShaderFile<<std::endl;
    try {
        ifstream vertexShaderFile(vShaderFile);
        ifstream fragmentShaderFile(fShaderFile);
        stringstream vShaderStream, fShaderStream;

        vertexShaderFile.exceptions(ifstream::failbit | ifstream::badbit);
        fragmentShaderFile.exceptions(ifstream::failbit | ifstream::badbit);

        vShaderStream << vertexShaderFile.rdbuf();
        fShaderStream << fragmentShaderFile.rdbuf();
        vertexShaderFile.close();
        fragmentShaderFile.close();
        vertexCode = vShaderStream.str();
        fragmentCode = fShaderStream.str();
    } catch (ifstream::failure &e) {
        std::cout<<"【error】加载shader文件失败"<<std::endl;
        throw std::runtime_error("加载shader文件失败");
    }

    const GLchar *vShaderCode = vertexCode.c_str();
    const GLchar *fShaderCode = fragmentCode.c_str();

    auto shader = std::make_shared<Shader>(name);
    shader->Compile(vShaderCode, fShaderCode, nullptr);
    return shader;
}

std::shared_ptr<Texture2D> ResourceManager::LoadTextureFromFile(const GLchar *file, GLboolean alpha, bool flipVertical) {
    auto texture = std::make_shared<Texture2D>(file);
    if (alpha) {
        texture->mInternalFormat = GL_RGBA;
        texture->mImageFormat = GL_RGBA;
    }

    int width, height, channel;
    stbi_set_flip_vertically_on_load(flipVertical);
    unsigned char *image = stbi_load(file, &width, &height, &channel, alpha ? 4 : 3);
    if (image == nullptr) {
        std::cout<<"【error】加载图片失败"<<std::endl;
        throw std::runtime_error("加载图片失败");
    }

    texture->GenerateFromImage(width, height, image);
    stbi_image_free(image);
    return texture;
}

std::pair<std::shared_ptr<char>, size_t> ResourceManager::LoadFontFromFile(const std::string &fileName, const std::string &fontName) {
    static int fontId{0};
    struct stat results{};
    std::string filePath{sFontPath+fileName};
    if (stat(filePath.c_str(), &results) != 0) {
        throw std::runtime_error("读取字体文件失败");
    }
    std::fstream file{filePath, std::ios::in | std::ios::binary};
    char *data = new char[results.st_size];
    file.read(data, results.st_size);
    file.close();

    return std::pair(std::shared_ptr<char>(data), results.st_size);
}
