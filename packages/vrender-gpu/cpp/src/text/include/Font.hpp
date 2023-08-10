//
// Created by bytedance on 2021/7/8.
//

#ifndef GLRENDERER_FONT_HPP
#define GLRENDERER_FONT_HPP

#include <iostream>
#include <exception>
#include <unordered_map>
#include <vector>
#include <ft2build.h>
#include FT_FREETYPE_H
#include FT_GLYPH_H
#include "Packer.hpp"

typedef FT_BBox BoundingBox;
typedef FT_Glyph Glyph;
typedef FT_Glyph_Metrics Metrics;
typedef FT_Outline Outline;

union LayoutLineItem {
    LayoutLineItem(float x, float y, float w, float h): data{x, y, w, h} {}
    float data[4];
    struct {
        float x;
        float y;
        float w;
        float h;
    };
};

class Font;
struct LayoutDataItem {
    LayoutLineItem layout;
    wchar_t c;
    std::shared_ptr<Font> font;
};

typedef struct {
    float x;
    float y;
    float cx;
    float cy;
} CurveItem;

typedef struct GlyphGPUCacheItem {
    GlyphGPUCacheItem(int codePoint, ImageRec *curveImage, ImageRec *rowDimImage,
                   ImageRec *rowCellImage, ImageRec *colDimImage, ImageRec *colCellImage, size_t rowDimOffset, size_t colDimOffset):
            mCodePoint{codePoint}, mCurveImage{curveImage}, mRowDimImage{rowDimImage}, mRowCellImage{rowCellImage},
            mColDimImage{colDimImage}, mColCellImage{colCellImage}, mRowDimOffset{rowDimOffset}, mColDimOffset{colDimOffset} {}
    int mCodePoint;
    ImageRec *mCurveImage;
    ImageRec *mRowDimImage;
    ImageRec *mRowCellImage;
    ImageRec *mColDimImage;
    ImageRec *mColCellImage;
    size_t mRowDimOffset;
    size_t mColDimOffset;
} GlyphGPUCacheItem;


typedef struct GlyphCacheItem {
    GlyphCacheItem(std::shared_ptr<BoundingBox> bbox, unsigned int index, std::shared_ptr<GlyphGPUCacheItem> glyphCache, std::unique_ptr<Metrics> metrics, std::unique_ptr<Outline> outline):
    mBoundingBox{std::move(bbox)}, mGlyphIndex{index}, mGlyphGpuCache{std::move(glyphCache)}, mMetrics{std::move(metrics)}, mOutline{std::move(outline)} {};
    std::shared_ptr<BoundingBox> mBoundingBox;
    unsigned int mGlyphIndex;
    std::shared_ptr<GlyphGPUCacheItem> mGlyphGpuCache;
    std::unique_ptr<Metrics> mMetrics;
    std::unique_ptr<Outline> mOutline;
    ~GlyphCacheItem() {
        // 销毁所有的outline指针
        if (mOutline) {
            delete mOutline->contours;
            delete mOutline->points;
            delete mOutline->tags;
        }
    }
} GlyphCacheItem;

/**
 * 字体模块
 * todo 支持多线程
 */
class Font {
public:
    Font(std::string name, unsigned char *data, const size_t &size, const int &colBandNum, const int &rowBandNum, const int &curveImageSize, const int &dimImageSize, const int &cellImageSize);
    /**
     * 根据unitsPerEm获取包围盒
     * @param codePoint
     * @param xMin
     * @param yMin
     * @param xMax
     * @param yMax
     */
    void MeasureCharBbox(wchar_t codePoint, long *xMin, long *yMin, long *xMax, long *yMax);
    void MeasureCharBbox(wchar_t codePoint, long *xMin, long *yMin, long *xMax, long *yMax, long *advanceWidth);
    /**
     * 基于fontSize计算scale，用于将unitsPerEm转换成px
     * fontSize / unitsPerEm
     * @param fontSize
     * @param scale
     */
    void GetScaleByFontSize(const float &fontSize, float *scale) const;
    /**
     * 布局一行字符串
     * @param str
     * @param fontSize
     * @param layoutList
     */
    void LayoutLine(const std::wstring &str, unsigned int fontSize, std::vector<std::shared_ptr<LayoutLineItem>> &layoutList);
    /**
     * 测量字符串宽度
     * @param str
     * @param fontSize
     * @param width
     */
    void MeasureString(const std::wstring &str, unsigned int fontSize, float *width);

    std::shared_ptr<GlyphGPUCacheItem> AddCharCPUCache(const wchar_t &c);

    bool SupportChar(const wchar_t &c);
    bool SupportString(const std::wstring &str);
    [[nodiscard]] bool IsColorLayered() const;

    /**
     * 布局字符串，跨font布局
     * @param str
     * @param fontSize
     * @param layoutRes
     * @param charMapFont
     */
    static void LayoutWString(const std::wstring &str, const float &fontSize, std::vector<LayoutDataItem> &layoutRes, const std::unordered_map<wchar_t, std::shared_ptr<Font>> &charMapFont, float *width);

private:
    int mId;
    bool mColorLayered;
//    unsigned char *mData; // 字体数据
    std::string mFontName;
    FT_Library mFtHandle;
    FT_Face mFaceHandle;
    std::unordered_map<uint16_t, std::shared_ptr<GlyphCacheItem>> mGlyphCacheMap; // 通用的glyph缓存
//    std::unordered_map<uint16_t , BoundingBox> mBBoxMap;
//    std::unordered_map<uint16_t, unsigned int>mCodePointMapGlyphIndex;
    std::unordered_map<uint16_t, std::shared_ptr<GlyphGPUCacheItem>> mGlyphGPUMap; // GPU的glyph缓存

    int mColBandNum;
    int mRowBandNum;
    int mCurveImageSize;
    int mDimImageSize;
    int mCellImageSize;

    // 保存图片
    Packer mCurvePacker;
    Packer mRowDimPacker;
    Packer mRowCellPacker;
    Packer mColDimPacker;
    Packer mColCellPacker;

    std::shared_ptr<GlyphCacheItem> GetGlyphCacheItem(const wchar_t &c, int flag);
    enum GetGlyphCacheItemFlag {
        INIT_INDEX =             0b0000001,
        INIT_METRICS =           0b0000011,
        INIT_OUTLINE =           0b0000101,
        INIT_BOUNDING_BOX =      0b0001011,
    };

    std::shared_ptr<GlyphGPUCacheItem> AddNormalCharCPUCache(const wchar_t &c);
    std::shared_ptr<GlyphGPUCacheItem> AddEmojiCharCPUCache(const wchar_t &c);
    /**
     * 添加curve，并添加该curve到对应的row数组和col数组中
     * @param x0 curve参数
     * @param y0 curve参数
     * @param cx curve参数
     * @param cy curve参数
     * @param minX curve的最小x，用于计算curve覆盖的row和col
     * @param maxX curve的最大x，用于计算curve覆盖的row和col
     * @param minY curve的最小y，用于计算curve覆盖的row和col
     * @param maxY curve的最大y，用于计算curve覆盖的row和col
     * @param curveList
     */
    static void AddCurveToCache(const float &x0, const float &y0, const float &cx, const float &cy,
                                const float &minX, const float &maxX, const float &minY, const float &maxY,
                                std::vector<CurveItem> &curveList, std::vector<std::vector<int>> &cols, std::vector<std::vector<int>> &rows);
    static void SetDimAndCellData(
            std::vector<std::vector<int>> &dimData, Packer &dimPacker, Packer &cellPacker, const size_t &curveOffset, size_t &dimOffset,
            ImageRec *&dimImage, ImageRec *&cellImage
    );
    static int sId;
};

#endif //GLRENDERER_FONT_HPP
