//
// Created by ByteDance on 2023/8/10.
//

#ifndef VRENDER_GPU_FONTMANAGER_HPP
#define VRENDER_GPU_FONTMANAGER_HPP

#include <unordered_map>
#include <string>
#include <Font.hpp>
#include "ResourceManager.hpp"

#define ROW_BAND_NUM 9
#define COL_BAND_NUM 9
// 内存分配过多会导致耗时增加
#define CURVE_IMAGE_SIZE 1024
#define DIM_IMAGE_SIZE 1024
#define CELL_IMAGE_SIZE 1024

class FontManager {
public:
    explicit FontManager(std::shared_ptr<ResourceManager> resourceManager);

    std::shared_ptr<Font> GetFontData(const std::string &fontName);
    std::shared_ptr<Font> LoadFontData(const std::string &fontName);
private:
    std::shared_ptr<ResourceManager> mResourceManager;
    std::unordered_map<std::string, std::shared_ptr<Font>> mFonts;

    std::shared_ptr<Font> LoadFontFromResourceManager(const std::string &fontName);
};

#endif //VRENDER_GPU_FONTMANAGER_HPP
