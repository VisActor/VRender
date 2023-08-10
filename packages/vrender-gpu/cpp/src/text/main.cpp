//
// Created by bytedance on 2021/7/8.
//
#include "iostream"
#include <sys/stat.h>
#include "Font.hpp"
#include "sstream"
#include "fstream"

int main() {
    std::cout<<"abc"<<std::endl;
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
    long x, y, z, w;
}
