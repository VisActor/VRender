//
// Created by bytedance on 2021/3/2.
//

#ifndef CANOPUS_FONT_WASM_PACKER_HPP
#define CANOPUS_FONT_WASM_PACKER_HPP

#include <vector>
#include "ImageData.hpp"
#include "Common.hpp"

struct ImageRec {
    int mId;
    int mTail; // 尾部的标志
    int mTotalLen;
    ImageData *mImageData;
    explicit ImageRec(ImageData *imageData):
        mTail{0}, mImageData{imageData}, mTotalLen{imageData->Size()}, mId{IdGenerator::GetId()} {}

    ~ImageRec() { delete mImageData; }
};

class Packer {
public:
    Packer(const int &width, const int &height): mWidth{width}, mHeight{height}, mTotalLen{width * height}, mImages{} {};

    ~Packer() {
        for (auto *image : mImages) {
            delete image;
        }
    }

    /**
     * 查找有空闲space的image，注意这个方法不会主动递增mTail，需要手动递增mTail
     * @param space
     * @return
     */
    ImageRec* FindImage(const int &space);
private:
    int mWidth;
    int mHeight;
    int mTotalLen;
    std::vector<ImageRec*> mImages;
};

#endif //CANOPUS_FONT_WASM_PACKER_HPP
