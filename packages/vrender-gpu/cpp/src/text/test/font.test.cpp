//
// Created by bytedance on 2021/7/12.
//
#include "iostream"
#include <vector>
#include <array>
#include <sys/stat.h>
#include <cassert>
#include "Font.hpp"
#include "sstream"
#include "fstream"

extern void testColCellImage(ImageData *imageData, size_t tail);
extern void testColDimImage(ImageData *imageData, size_t tail);
extern void testRowCellImage(ImageData *imageData, size_t tail);
extern void testRowDimImage(ImageData *imageData, size_t tail);
extern void testCurveImage(ImageData *imageData, size_t tail);

void _print(std:: string name, ImageData *imageData, size_t tail) {
    std::cout<<std::endl<<name<<std::endl;
    for (int i = 0; i < tail; i++) {
        std::cout<<int(imageData->mData[i])<<", ";
    }
}

int main() {
    struct stat results{};
    if (stat("/Users/bytedance/dev/github/vrender-webgpu/packages/vrender-gpu/cpp/src/font/HuaWenHeiTi.ttf", &results) == 0) {
        std::cout<<"文件大小："<<results.st_size<<std::endl;
    } else {
        std::cout<<"读取文件信息失败"<<std::endl;
    }

    // 读取文件
    std::fstream file{"/Users/bytedance/dev/github/vrender-webgpu/packages/vrender-gpu/cpp/src/font/HuaWenHeiTi.ttf", std::ios::in | std::ios::binary};
    char *data = new char[results.st_size];
    file.read(data, results.st_size);
    file.close();

    Font font{"abc", (unsigned char*)data, results.st_size, 9, 9, 64, 64, 64};
    long x, y, x1, y1;
    std::wstring str{L"这是中文字符串abc"};
    std::vector<std::array<int, 4>> testBoxList{{57,-70,892,904,},{65,-96,871,877,},{133,-89,745,908,},{75,-49,896,863,},{76,-95,868,917,},{59,-101,885,915,},{116,-111,764,933,},{52,42,553,563,},{81,42,553,754,},{90,42,541,563,}};
    // 测试measureBox
    int i = 0;
    for (auto c : str) {
        font.MeasureCharBbox(c, &x, &y, &x1, &y1);
        assert(x == testBoxList[i][0]);
        assert(y == testBoxList[i][1]);
        assert(x1 == testBoxList[i][0] + testBoxList[i][2]);
        assert(y1 == testBoxList[i][1] + testBoxList[i][3]);
        i++;
    }

    // 测试layout
    std::vector<std::shared_ptr<LayoutLineItem>> layout;
    font.LayoutLine(str, 16, layout);
    std::vector<std::array<float, 4>> testLayoutList{{0.912, -1.12, 14.272, 14.464},{17.04, -1.536, 13.936, 30.032},{34.128, -1.424, 11.92, 46.528},{49.2, -0.784, 14.336, 61.808},{65.216, -1.52, 13.888, 78.672},{80.944, -1.616, 14.16, 94.64},{97.856, -1.776, 12.224, 110.928},{112.832, 0.672, 8.848, 121.008},{124.224, 0.672, 8.848, 134.992},{135.28, 0.672, 8.656, 142.848}};
    i = 0;
    for (auto &item : layout) {
        assert(std::abs(item->x - testLayoutList[i][0]) < 0.001);
        assert(std::abs(item->y - testLayoutList[i][1]) < 0.001);
        assert(std::abs(item->w - testLayoutList[i][2]) < 0.001);
        assert(std::abs(item->h - testLayoutList[i][3]) < 0.001);
        i++;
//        std::cout<<item->x<<", "<<item->y<<", "<<item->w<<", "<<item->h<<std::endl;
    }

    // 测试measureString
    float width;
    font.MeasureString(L"这是中文字符串abc", 16, &width);
    assert(std::abs(width - 142.496) < 0.001);

    const auto &cache = font.AddCharCPUCache('a');

//    _print("ColCellImage", cache->mColCellImage->mImageData, cache->mColCellImage->mTail * 4);
    testColCellImage(cache->mColCellImage->mImageData, cache->mColCellImage->mTail * 4);
//    _print("ColDimImage", cache->mColDimImage->mImageData, cache->mColDimImage->mTail * 4);
    testColDimImage(cache->mColDimImage->mImageData, cache->mColDimImage->mTail * 4);
//    _print("RowCellImage", cache->mRowCellImage->mImageData, cache->mRowCellImage->mTail * 4);
    testRowCellImage(cache->mRowCellImage->mImageData, cache->mRowCellImage->mTail * 4);
//    _print("RowDimImage", cache->mRowDimImage->mImageData, cache->mRowDimImage->mTail * 4);
    testRowDimImage(cache->mRowDimImage->mImageData, cache->mRowDimImage->mTail * 4);
//    _print("CurveImage", cache->mCurveImage->mImageData, cache->mCurveImage->mTail * 4);
    testCurveImage(cache->mCurveImage->mImageData, cache->mCurveImage->mTail * 4);
    std::cout<<cache->mColDimOffset<<", "<<cache->mRowDimOffset<<std::endl;
}

void testColCellImage(ImageData *imageData, size_t tail) {
    static std::vector<int> data{0, 5, 0, 0, 0, 6, 0, 0, 0, 4, 0, 0, 0, 5, 0, 0, 0, 6, 0, 0, 0, 7, 0, 0, 0, 15, 0, 0, 0, 16, 0, 0, 0, 4, 0, 0, 0, 7, 0, 0, 0, 14, 0, 0, 0, 15, 0, 0, 0, 16, 0, 0, 0, 17, 0, 0, 0, 4, 0, 0, 0, 7, 0, 0, 0, 14, 0, 0, 0, 17, 0, 0, 0, 3, 0, 0, 0, 4, 0, 0, 0, 7, 0, 0, 0, 8, 0, 0, 0, 13, 0, 0, 0, 14, 0, 0, 0, 17, 0, 0, 0, 18, 0, 0, 0, 3, 0, 0, 0, 8, 0, 0, 0, 13, 0, 0, 0, 18, 0, 0, 0, 3, 0, 0, 0, 8, 0, 0, 0, 12, 0, 0, 0, 13, 0, 0, 0, 18, 0, 0, 0, 19, 0, 0, 0, 1, 0, 0, 0, 2, 0, 0, 0, 3, 0, 0, 0, 8, 0, 0, 0, 9, 0, 0, 0, 10, 0, 0, 0, 12, 0, 0, 0, 19, 0, 0, 0, 1, 0, 0, 0, 10, 0, 0};
    for (int i = 0; i < tail; i++) {
        assert(imageData->mData[i] == data[i]);
    }
}
void testColDimImage(ImageData *imageData, size_t tail) {
    static std::vector<int> data{0, 0, 0, 2, 0, 2, 0, 6, 0, 8, 0, 6, 0, 14, 0, 4, 0, 18, 0, 8, 0, 26, 0, 4, 0, 30, 0, 6, 0, 36, 0, 8, 0, 44, 0, 2};
    for (int i = 0; i < tail; i++) {
        assert(imageData->mData[i] == data[i]);
    }
}
void testRowCellImage(ImageData *imageData, size_t tail) {
    static std::vector<int> data{0, 0, 0, 0, 0, 1, 0, 0, 0, 2, 0, 0, 0, 3, 0, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 3, 0, 0, 0, 4, 0, 0, 0, 5, 0, 0, 0, 17, 0, 0, 0, 18, 0, 0, 0, 19, 0, 0, 0, 0, 0, 0, 0, 5, 0, 0, 0, 16, 0, 0, 0, 17, 0, 0, 0, 19, 0, 0, 0, 0, 0, 0, 0, 5, 0, 0, 0, 16, 0, 0, 0, 19, 0, 0, 0, 0, 0, 0, 0, 5, 0, 0, 0, 6, 0, 0, 0, 12, 0, 0, 0, 15, 0, 0, 0, 16, 0, 0, 0, 19, 0, 0, 0, 0, 0, 0, 0, 6, 0, 0, 0, 12, 0, 0, 0, 15, 0, 0, 0, 0, 0, 0, 0, 6, 0, 0, 0, 12, 0, 0, 0, 13, 0, 0, 0, 14, 0, 0, 0, 15, 0, 0, 0, 0, 0, 0, 0, 6, 0, 0, 0, 7, 0, 0, 0, 8, 0, 0, 0, 9, 0, 0, 0, 13, 0, 0, 0, 14, 0, 0, 0, 0, 0, 0, 0, 7, 0, 0, 0, 8, 0, 0, 0, 9, 0, 0, 0, 10, 0, 0};
    for (int i = 0; i < tail; i++) {
        assert(imageData->mData[i] == data[i]);
    }
}
void testRowDimImage(ImageData *imageData, size_t tail) {
    static std::vector<int> data{0, 0, 0, 5, 0, 5, 0, 8, 0, 13, 0, 5, 0, 18, 0, 4, 0, 22, 0, 7, 0, 29, 0, 4, 0, 33, 0, 6, 0, 39, 0, 7, 0, 46, 0, 5};
    for (int i = 0; i < tail; i++) {
        assert(imageData->mData[i] == data[i]);
    }
}
void testCurveImage(ImageData *imageData, size_t tail) {
    static std::vector<int> data{255, 249, 255, 128, 255, 8, 240, 8, 224, 8, 224, 29, 224, 49, 182, 0, 128, 0, 74, 0, 37, 38, 0, 76, 0, 128, 0, 180, 37, 217, 75, 255, 127, 255, 187, 255, 224, 205, 224, 227, 224, 249, 240, 249, 255, 249, 0, 0, 226, 127, 226, 168, 198, 197, 170, 225, 129, 225, 88, 225, 60, 196, 32, 167, 32, 127, 32, 87, 60, 58, 89, 29, 129, 29, 169, 29, 197, 57, 226, 85, 226, 127, 0, 0, 0, 0};
    for (int i = 0; i < tail; i++) {
        assert(imageData->mData[i] == data[i]);
    }
}
