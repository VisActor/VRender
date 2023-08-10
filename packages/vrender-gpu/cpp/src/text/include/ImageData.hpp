//
// Created by bytedance on 2021/3/2.
//

#ifndef CANOPUS_FONT_WASM_IMAGEDATA_HPP
#define CANOPUS_FONT_WASM_IMAGEDATA_HPP

#include <iostream>

class ImageData {
public:
    ImageData(const int &width, const int &height): mWidth{width}, mHeight{height}, mSize{width * height * 4}, mData{new unsigned char[width * height * 4]}, mEdit{true} {
    }

    inline void SetColor(const size_t &x, const size_t &y, const unsigned char &r, const unsigned char &g, const unsigned char &b, const unsigned char &a) {
        size_t index = (y * mWidth + x) * 4;
        mData[index] = r; mData[index + 1] = g; mData[index + 2] = b; mData[index + 3] = a;
        mEdit = true;
    }
    inline void SetColor(const size_t &i, const unsigned char &r, const unsigned char &g, const unsigned char &b, const unsigned char &a) {
        const auto index = i * 4;
        mData[index] = r; mData[index + 1] = g; mData[index + 2] = b; mData[index + 3] = a;
        mEdit = true;
    }
    inline void SetColor(const size_t &i, const unsigned char &&r, const unsigned char &&g, const unsigned char &&b, const unsigned char &&a) {
        const auto &&index = i * 4;
        mData[index] = r; mData[index + 1] = g; mData[index + 2] = b; mData[index + 3] = a;
        mEdit = true;
    }

    inline void SetR(const int &x, const int &y, const unsigned char &r) {
        mData[(y * mWidth + x) * 4] = r;
        mEdit = true;
    }
    inline void SetG(const int &x, const int &y, const unsigned char &g) {
        mData[(y * mWidth + x) * 4 + 1] = g;
        mEdit = true;
    }
    inline void SetB(const int &x, const int &y, const unsigned char &b) {
        mData[(y * mWidth + x) * 4 + 2] = b;
        mEdit = true;
    }
    inline void SetA(const int &x, const int &y, const unsigned char &a) {
        mData[(y * mWidth + x) * 4 + 3] = a;
        mEdit = true;
    }

    [[nodiscard]] inline int Size() const {
      return mWidth * mHeight;
    }

    [[nodiscard]] inline int Width() const { return mWidth; }
    [[nodiscard]] inline int Height() const { return mHeight; }

    unsigned char& operator[](const size_t &index) { return mData[index]; }
    unsigned char operator[](const size_t &index) const { return mData[index]; }

    friend std::ostream& operator<< (std::ostream &os, ImageData &imageData) {
        for (int i = 0; i < 180; i += 4) {
            os<<int(imageData.mData[i])<<", "<<int(imageData.mData[i+1])<<", "<<int(imageData.mData[i+2])<<", "<<int(imageData.mData[i+3])<<std::endl;
        }
        return os;
    }

    void PrintColor(const int &fromIdx, const int &endIdx) const {
        for (int i = fromIdx; i < endIdx; i++) {
            const int index = i * 4;
            std::cout<<int(mData[index])<<", "<<int(mData[index+1])<<", "<<int(mData[index+2])<<", "<<int(mData[index+3])<<std::endl;
        }
    }

    unsigned char *mData;
    bool mEdit;

private:
    int mWidth;
    int mHeight;
    int mSize;
};

#endif //CANOPUS_FONT_WASM_IMAGEDATA_HPP
