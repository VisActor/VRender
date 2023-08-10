//
// Created by ByteDance on 2023/8/10.
//
#include "FontManager.hpp"

FontManager::FontManager(std::shared_ptr<ResourceManager> resourceManager): mResourceManager{std::move(resourceManager)} {}

std::shared_ptr<Font> FontManager::LoadFontData(const std::string &fontName) {
    auto data = GetFontData(fontName);
    if (data) return data;
    return mFonts[fontName] = LoadFontFromResourceManager(fontName);
}

std::shared_ptr<Font> FontManager::GetFontData(const std::string &fontName) {
    auto iter = mFonts.find(fontName);
    if (iter == mFonts.end()) {
        return nullptr;
    }
    return iter->second;
}

std::shared_ptr<Font> FontManager::LoadFontFromResourceManager(const std::string &fontName) {
    const auto data = mResourceManager->LoadFontData(fontName);

    std::shared_ptr<Font> font{std::make_shared<Font>(
            fontName, (unsigned char*)data.first.get(), data.second, COL_BAND_NUM, ROW_BAND_NUM, CURVE_IMAGE_SIZE, DIM_IMAGE_SIZE, CELL_IMAGE_SIZE
    )};
    return font;
}
