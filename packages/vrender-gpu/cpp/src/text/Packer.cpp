//
// Created by bytedance on 2021/3/2.
//
#include "Packer.hpp"

ImageRec* Packer::FindImage(const int &space) {
    if (space > mTotalLen) return nullptr;

    // 从后往前查找
    for (auto i = int(mImages.size()) - 1; i >= 0; i--) {
        auto &image = mImages[i];
        if (image->mTail + space < mTotalLen) {
            return image;
        }
    }

    // 创建image
    auto *imageData = new ImageData{mWidth, mHeight};
    auto *image = new ImageRec{imageData};
    mImages.push_back(image);
    return image;
}
