//
// Created by ByteDance on 2023/8/7.
//

#ifndef VRENDER_GPU_TEXTURE2D_HPP
#define VRENDER_GPU_TEXTURE2D_HPP

#include "GL.hpp"
#include <string>

class Texture2D {
public:
    Texture2D(std::string name);

    void Init();

    // 从图像数据生成纹理
    void GenerateFromImage(unsigned int width, unsigned int height, unsigned char* data);
    void GenerateGPUTextTexture(unsigned int width, unsigned int height, unsigned char* data);
    void Bind() const;
    void BindAndActive(int i) const;
    void UnBindAndActive(int i) const;
    void UpdateTexture(int width, int height, unsigned char *data);

    void Dispose();

    inline unsigned int GetID() const { return mId; }
    inline bool ShouldUpdate() { return mShouldUpdate; }

    unsigned int mWidth, mHeight;

    GLint mInternalFormat;
    GLint mImageFormat;

    GLint mWrapS, mWrapT;
    GLint mFilterMin, mFilterMax;
    const std::string mName;

private:
//    struct TextureData {
//        int width;
//        int height;
//        unsigned char *data;
//    };

    GLuint mId;
    bool mShouldUpdate;
//    TextureData mTextureData;
};

#endif //VRENDER_GPU_TEXTURE2D_HPP
