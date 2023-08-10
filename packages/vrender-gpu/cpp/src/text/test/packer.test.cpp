//
// Created by bytedance on 2021/3/2.
//
#include <iostream>
#include "Packer.hpp"

int main() {
    const int width{36}, height{36};
    Packer packer{width, height};
    int spaceArr[]{300, 120, 296, 324, 546, 876, 789, 786};
    int size = sizeof spaceArr / sizeof spaceArr[0];
    for (int i = 0; i < size; i++) {
        std::cout<<packer.FindImage(spaceArr[i])<<std::endl;
    }
}
