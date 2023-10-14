//
// Created by ByteDance on 2023/8/7.
//
#include <string>
#include "Texture2D.hpp"

Texture2D::Texture2D(std::string name): mWidth{0}, mHeight{0}, mInternalFormat{GL_RGB}, mImageFormat{GL_RGB}, mName{std::move(name)},
                                        mWrapS{GL_REPEAT}, mWrapT{GL_REPEAT}, mId{0}, mFilterMin{GL_NEAREST}, mFilterMax{GL_LINEAR}, mShouldUpdate{false} {
    // 生成纹理
    glGenTextures(1, &mId);
}

void Texture2D::Init() {
    glGenTextures(1, &mId);
}

void Texture2D::GenerateFromImage(unsigned int width, unsigned int height, unsigned char *data) {
    mWidth = width; mHeight = height;

    glBindTexture(GL_TEXTURE_2D, mId);
    // 第一个参数表示写入到当前绑定的纹理上
    // 第二个参数表示多级渐远纹理级别为基本级别
    // 第三个参数表示将纹理存储为何种格式
    // 第四第五个参数表示纹理宽高
    // 第六个参数是0（历史遗留问题）
    // 第七第八各参数表示源图像的数据格式
    // 第九个参数是图像数据
    glTexImage2D(GL_TEXTURE_2D, 0, mInternalFormat, width, height, 0, mImageFormat, GL_UNSIGNED_BYTE, data);
    // 设置纹理环绕方式和过滤方式
    glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_S, mWrapS);
    glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_T, mWrapT);
    glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, mFilterMin);
    glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, mFilterMax);

    // unbind
    glBindTexture(GL_TEXTURE_2D, 0);
}

void Texture2D::GenerateGPUTextTexture(unsigned int width, unsigned int height, unsigned char *data) {
    mWidth = width; mHeight = height;
    mWrapS = GL_CLAMP_TO_EDGE; mWrapT = GL_CLAMP_TO_EDGE;
    mInternalFormat = GL_RGBA; mImageFormat = GL_RGBA;

    glBindTexture(GL_TEXTURE_2D, mId);
    // 第一个参数表示写入到当前绑定的纹理上
    // 第二个参数表示多级渐远纹理级别为基本级别
    // 第三个参数表示将纹理存储为何种格式
    // 第四第五个参数表示纹理宽高
    // 第六个参数是0（历史遗留问题）
    // 第七第八各参数表示源图像的数据格式
    // 第九个参数是图像数据
    glTexImage2D(GL_TEXTURE_2D, 0, mInternalFormat, width, height, 0, mImageFormat, GL_UNSIGNED_BYTE, data);
    // 设置纹理环绕方式和过滤方式
    glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_S, mWrapS);
    glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_T, mWrapT);
    glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, mFilterMin);
    glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, mFilterMax);

    // unbind
    glBindTexture(GL_TEXTURE_2D, 0);
}

void Texture2D::GenerateFloatTexture(unsigned int width, unsigned int height, float *data) {
    mWidth = width; mHeight = height;
    mWrapS = GL_CLAMP_TO_EDGE; mWrapT = GL_CLAMP_TO_EDGE;
    mInternalFormat = GL_RGBA16F; mImageFormat = GL_RGBA;

    glBindTexture(GL_TEXTURE_2D, mId);
    // 第一个参数表示写入到当前绑定的纹理上
    // 第二个参数表示多级渐远纹理级别为基本级别
    // 第三个参数表示将纹理存储为何种格式
    // 第四第五个参数表示纹理宽高
    // 第六个参数是0（历史遗留问题）
    // 第七第八各参数表示源图像的数据格式
    // 第九个参数是图像数据
    glTexImage2D(GL_TEXTURE_2D, 0, mInternalFormat, width, height, 0, mImageFormat, GL_FLOAT, data);
    // 设置纹理环绕方式和过滤方式
    glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_S, mWrapS);
    glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_T, mWrapT);
    glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, mFilterMin);
    glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, mFilterMax);

    // unbind
    glBindTexture(GL_TEXTURE_2D, 0);
}

void Texture2D::UpdateTexture(int width, int height, unsigned char *data) {
    glBindTexture(GL_TEXTURE_2D, mId);

    if (width == mWidth && height == mHeight) {
        glTexSubImage2D(GL_TEXTURE_2D, 0, 0, 0, width, height, mImageFormat, GL_UNSIGNED_BYTE, (void*)data);
    } else {
        glTexImage2D(GL_TEXTURE_2D, 0, mInternalFormat, width, height, 0, mImageFormat, GL_UNSIGNED_BYTE, (void*)data);
        mWidth = width; mHeight = height;
    }

    glBindTexture(GL_TEXTURE_2D, 0);
}

void Texture2D::Bind() const {
    glBindTexture(GL_TEXTURE_2D, mId);
}

void Texture2D::BindAndActive(int i) const {
    glActiveTexture(GL_TEXTURE0+i);
    glBindTexture(GL_TEXTURE_2D, mId);
}

void Texture2D::UnBindAndActive(int i) const {
    glActiveTexture(GL_TEXTURE0+i);
    glBindTexture(GL_TEXTURE_2D, 0);
}

void Texture2D::Dispose() {
    glDeleteTextures(1, &mId);
}
