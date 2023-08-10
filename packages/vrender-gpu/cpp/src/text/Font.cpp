//
// Created by bytedance on 2021/7/8.
//
#include "Font.hpp"
#include <freetype/ftoutln.h>
#include <freetype/ftcolor.h>
#ifndef FT_LOAD_COLOR
#    define FT_LOAD_COLOR ( 1L << 20 )
#    define FT_PIXEL_MODE_BGRA 7
#endif

int Font::sId = 0;

inline bool samePoint(const float &x0, const float &y0, const float &x1, const float &y1) {
    return abs(x1 - x0) < 0.0000001 && abs(y1 - y0) < 0.0000001;
}

Font::Font(std::string name, unsigned char *data, const size_t &size, const int &colBandNum, const int &rowBandNum,
           const int &curveImageSize, const int &dimImageSize, const int &cellImageSize):
        mId{sId++}, mFontName{std::move(name)}, mGlyphCacheMap{}, mFtHandle{}, mFaceHandle{},
        mColBandNum{colBandNum}, mRowBandNum{rowBandNum}, mCurveImageSize{curveImageSize}, mDimImageSize{dimImageSize}, mCellImageSize{cellImageSize},
        mCurvePacker{curveImageSize, curveImageSize}, mRowDimPacker{dimImageSize, dimImageSize}, mRowCellPacker{cellImageSize, cellImageSize},
        mColDimPacker{dimImageSize, dimImageSize}, mColCellPacker{cellImageSize, cellImageSize}, mColorLayered{false} {
    // 初始化freetype
    if (FT_Init_FreeType(&mFtHandle)) {
        throw std::runtime_error("初始化freetype失败");
    }
    // 初始化字体
    auto error = FT_New_Memory_Face(mFtHandle, data, size, 0, &mFaceHandle);
    if (error) {
        throw std::runtime_error("解析字体数据失败");
    }
    // 判断是否是emoji
    mColorLayered = FT_HAS_COLOR(mFaceHandle);
}

void Font::GetScaleByFontSize(const float &fontSize, float *scale) const {
    *scale = fontSize / float(mFaceHandle->units_per_EM);
}

std::shared_ptr<GlyphCacheItem> Font::GetGlyphCacheItem(const wchar_t &c, int flag) {
    const auto &iter = mGlyphCacheMap.find(c);
    std::shared_ptr<GlyphCacheItem> glyphCacheItem;
    if (iter == mGlyphCacheMap.end()) {
        glyphCacheItem = std::make_shared<GlyphCacheItem>(nullptr, 0, nullptr, nullptr, nullptr);
    } else {
        glyphCacheItem = iter->second;
    }
    if (flag == 0) return glyphCacheItem;
    // 获取glyph index
    if (glyphCacheItem->mGlyphIndex <= 0) {
        glyphCacheItem->mGlyphIndex = FT_Get_Char_Index(mFaceHandle, c);
        // 添加到map
        if (glyphCacheItem->mGlyphIndex > 0) {
            mGlyphCacheMap[c] = glyphCacheItem;
        }
    }
    if (glyphCacheItem->mGlyphIndex <= 0) return nullptr;
    // 加载metrics和outline
    if (!(glyphCacheItem->mMetrics && glyphCacheItem->mOutline)) {
        auto error = FT_Load_Glyph(mFaceHandle, glyphCacheItem->mGlyphIndex, FT_LOAD_NO_SCALE);
        if (error) throw std::runtime_error("加载glyph发生错误");
        if ((flag & GetGlyphCacheItemFlag::INIT_METRICS) == GetGlyphCacheItemFlag::INIT_METRICS) {
            auto metrics = new Metrics{};
            std::memcpy(metrics, &mFaceHandle->glyph->metrics, sizeof(Metrics));
            glyphCacheItem->mMetrics = std::unique_ptr<Metrics>(metrics);
        }
        if ((flag & GetGlyphCacheItemFlag::INIT_OUTLINE) == GetGlyphCacheItemFlag::INIT_OUTLINE) {
            auto outline = new Outline{};
            std::memcpy(outline, &mFaceHandle->glyph->outline, sizeof(Outline));
            // 拷贝outline内部的所有的指针
            auto points = new FT_Vector[outline->n_points];
            std::memcpy(points, outline->points, sizeof(FT_Vector) * outline->n_points);
            outline->points = points;
            auto tags = new char[outline->n_points];
            std::memcpy(tags, outline->tags, sizeof(char) * outline->n_points);
            outline->tags = tags;
            auto contours = new short[outline->n_contours];
            std::memcpy(contours, outline->contours, sizeof(short) * outline->n_contours);
            outline->contours = contours;
            if (error) throw std::runtime_error("拷贝outline发生错误");
            glyphCacheItem->mOutline = std::unique_ptr<Outline>(outline);
        }
    }
    // 设置boundingBox
    if (((flag & GetGlyphCacheItemFlag::INIT_BOUNDING_BOX) == GetGlyphCacheItemFlag::INIT_BOUNDING_BOX) && !glyphCacheItem->mBoundingBox) {
        glyphCacheItem->mBoundingBox = std::make_shared<BoundingBox>();
        auto &metrics = glyphCacheItem->mMetrics;
        auto &bbox = glyphCacheItem->mBoundingBox;
        bbox->xMin = metrics->horiBearingX; bbox->yMin = metrics->horiBearingY - metrics->height;
        bbox->xMax = metrics->horiBearingX + metrics->width; bbox->yMax = metrics->horiBearingY;
    }
    return glyphCacheItem;
}

void Font::MeasureCharBbox(wchar_t c, long *xMin, long *yMin, long *xMax, long *yMax) {
    const auto &glyphCacheItem = GetGlyphCacheItem(c, GetGlyphCacheItemFlag::INIT_BOUNDING_BOX);
    if (!glyphCacheItem) return;

    // 到这里说明之前bbox不存在，需要创建一个bbox
    glyphCacheItem->mBoundingBox = std::make_shared<BoundingBox>();
    auto &metrics = glyphCacheItem->mMetrics;
    auto &bbox = glyphCacheItem->mBoundingBox;
    *xMin = bbox->xMin = metrics->horiBearingX; *yMin = bbox->yMin = metrics->horiBearingY - metrics->height;
    *xMax = bbox->xMax = metrics->horiBearingX + metrics->width; *yMax = bbox->yMax = metrics->horiBearingY;
}
void Font::MeasureCharBbox(wchar_t c, long *xMin, long *yMin, long *xMax, long *yMax, long *advanceWidth) {
    const auto &glyphCacheItem = GetGlyphCacheItem(c, GetGlyphCacheItemFlag::INIT_BOUNDING_BOX);
    if (!glyphCacheItem) return;

    // 到这里说明之前bbox不存在，需要创建一个bbox
    glyphCacheItem->mBoundingBox = std::make_shared<BoundingBox>();
    auto &metrics = glyphCacheItem->mMetrics;
    auto &bbox = glyphCacheItem->mBoundingBox;
    *xMin = bbox->xMin = metrics->horiBearingX; *yMin = bbox->yMin = -metrics->horiBearingY;
    *xMax = bbox->xMax = metrics->horiBearingX + metrics->width; *yMax = bbox->yMax = metrics->height - metrics->horiBearingY;
    *advanceWidth = glyphCacheItem->mMetrics->horiAdvance;
}

void Font::LayoutLine(const std::wstring &str, unsigned int fontSize,
                      std::vector<std::shared_ptr<LayoutLineItem>> &layoutList) {
    static float penX{0};
    static long xMin, xMax, yMin, yMax;
    static float scale, w, h;
    penX = 0;
    // 获取scale
    GetScaleByFontSize(float(fontSize), &scale);
    // 计算布局，暂时不需要leftSideBearing，因为包围盒xMin, xMax, yMin, yMax足够表示这个字符的位置了
    for (const auto &c : str) {
        const auto &glyphCacheItem = GetGlyphCacheItem(c, GetGlyphCacheItemFlag::INIT_METRICS);
        if (!glyphCacheItem) continue;
        const auto &metrics = glyphCacheItem->mMetrics;
        xMin = metrics->horiBearingX; yMin = metrics->horiBearingY - metrics->height;
        xMax = metrics->horiBearingX + metrics->width; yMax = metrics->horiBearingY;

        auto &advance = metrics->horiAdvance;
        layoutList.push_back(std::make_shared<LayoutLineItem>(penX + float(xMin) * scale, float(yMin) * scale, float(xMax - xMin) * scale, penX + float(yMax - yMin) * scale));

        penX += float(advance) * scale;
    }
}

void Font::MeasureString(const std::wstring &str, unsigned int fontSize, float *width) {
    static long penX;
    static float scale;
    penX = 0;
    // 获取scale
    GetScaleByFontSize(float(fontSize), &scale);
    std::shared_ptr<GlyphCacheItem> glyphCacheItem;
    for (const auto &c : str) {
        glyphCacheItem = GetGlyphCacheItem(c, GetGlyphCacheItemFlag::INIT_METRICS);
        if (!glyphCacheItem) continue;
        const auto &metrics = glyphCacheItem->mMetrics;

        const auto &advance = glyphCacheItem->mMetrics->horiAdvance;
        penX += advance;
    }
    // todo 最后乘以scale
    penX = penX - glyphCacheItem->mMetrics->horiAdvance + glyphCacheItem->mMetrics->width;
    *width = float(penX) * scale;
}

std::shared_ptr<GlyphGPUCacheItem> Font::AddCharCPUCache(const wchar_t &c) {
    if (mColorLayered) {
        return AddEmojiCharCPUCache(c);
    }
    return AddNormalCharCPUCache(c);
}
std::shared_ptr<GlyphGPUCacheItem> Font::AddEmojiCharCPUCache(const wchar_t &c) {
    // 从map中查找
    const auto &iter = mGlyphGPUMap.find(c);
    if (iter != mGlyphGPUMap.end()) {
        return iter->second;
    }

    // 查找字形缓存
    const auto glyphCacheItem = GetGlyphCacheItem(c, GetGlyphCacheItemFlag::INIT_BOUNDING_BOX);

    return nullptr;
}
std::shared_ptr<GlyphGPUCacheItem> Font::AddNormalCharCPUCache(const wchar_t &c) {
    static long xMin, xMax, yMin, yMax;
    static float width, height;
    static bool isNextContour;

    /* 用于缓存信息 */
    static std::vector<CurveItem> curveList{};
    static std::vector<std::vector<int>> colList{size_t(mColBandNum)};
    static std::vector<std::vector<int>> rowList{size_t(mRowBandNum)};
    /* 用于缓存信息 */

    // 从map中查找
    const auto &iter = mGlyphGPUMap.find(c);
    if (iter != mGlyphGPUMap.end()) {
        return iter->second;
    }

    // 初始化变量
    curveList.clear();
    for (auto &col : colList) col.clear();
    for (auto &row : rowList) row.clear();

    // 查找字形缓存
    const auto glyphCacheItem = GetGlyphCacheItem(c, GetGlyphCacheItemFlag::INIT_METRICS | GetGlyphCacheItemFlag::INIT_OUTLINE);

    const auto &metrics = glyphCacheItem->mMetrics;
    width = float(metrics->width);
    height = float(metrics->height);
    xMin = metrics->horiBearingX; yMin = metrics->horiBearingY - metrics->height;
    xMax = metrics->horiBearingX + metrics->width; yMax = metrics->horiBearingY;

    // 开始获取字形顶点数据
    if (glyphCacheItem->mOutline->n_points == 0) {
        return mGlyphGPUMap[c] = std::make_shared<GlyphGPUCacheItem>(
                c, nullptr, nullptr, nullptr, nullptr, nullptr, 0, 0
                );
    }

    static float x0, y0, xs, ys, x1, y1, cx, cy, mx, my;

    x0 = y0 = x1 = y1 = cx = cy = mx = my = std::numeric_limits<float>::max();
    xs = ys = x0 - 200.f; // 让xs和x0的初始值不同
    isNextContour = false;
    FT_Outline_Funcs callbacks{};

    FT_Vector *startVector;
    callbacks.move_to = [](const FT_Vector *to, void *user) {
        x1 = float(to->x - xMin) / width;
        y1 = float(to->y - yMin) / height;

        if (samePoint(x0, y0, x1, y1)) return 0;

        if (isNextContour) { // 表示开始下一块contour了
            isNextContour = false;
            // 因为每次只添加起始点和控制点，所以在开始下一块contour之前需要完成当前的这个contour
            // 也就是需要添加这个contour的终点
            // 如果上一个curve的终止点和整个contour的起始点相同，那么说明这个区域闭合了，那么就直接添加终止点即可
            if (samePoint(x0, y0, xs, ys)) {
                // 后面两个参数随便填，用不上
                curveList.emplace_back(CurveItem{x0, y0, 0, 0});
            } else {
                // todo 我们认为所有contour都是闭合的，所以即使没有这个contour的首尾不同，我们也要强行闭合
                // 否则的话我们需要手动将终止点和contour的起始点连接起来
                cx = (x0 + xs) / 2; cy = (y0 + ys) / 2;
                const auto &&minmaxX = std::minmax(x0, xs);
                const auto &&minmaxY = std::minmax(y0, ys);
                AddCurveToCache(x0, y0, cx, cy, minmaxX.first, minmaxX.second, minmaxY.first, minmaxY.second, curveList, colList, rowList);
            }
        }

#ifdef DEBUG
//        std::cout<<"M"<<to->x<<" "<<to->y<<" ";
#endif
        // 这个contour的起点为这个move的x和y
        xs = x1; ys = y1;
        // 将这个curve的终点赋值给下一个curve起点
        x0 = x1; y0 = y1;
        return 0;
    };
    callbacks.line_to = [](const FT_Vector *to, void *user) {
        x1 = float(to->x - xMin) / width;
        y1 = float(to->y - yMin) / height;

        if (samePoint(x0, y0, x1, y1)) return 0;

        // 将线段也转化为bezier，其中控制点为中点
        mx = (x0 + x1) / 2; my = (y0 + y1) / 2;
        // 计算最小值和最大值
        const auto &&minmaxX = std::minmax(x0, x1);
        const auto &&minmaxY = std::minmax(y0, y1);
        AddCurveToCache(x0, y0, mx, my, minmaxX.first, minmaxX.second, minmaxY.first, minmaxY.second, curveList, colList, rowList);
#ifdef DEBUG
//        std::cout<<"L"<<to->x<<" "<<to->y<<" ";
#endif
        // 将这个curve的终点赋值给下一个curve起点
        x0 = x1; y0 = y1;
        isNextContour = true;
        return 0;
    };
    callbacks.conic_to = [](const FT_Vector *control1, const FT_Vector *to, void *user) {
        x1 = float(to->x - xMin) / width;
        y1 = float(to->y - yMin) / height;

        if (samePoint(x0, y0, x1, y1)) return 0;

        cx = float(control1->x - xMin) / width;
        cy = float(control1->y - yMin) / height;
        // 计算最小值和最大值
        const auto &&minmaxX = minmax(x0, x1, cx);
        const auto &&minmaxY = minmax(y0, y1, cy);
        AddCurveToCache(x0, y0, cx, cy, minmaxX.first, minmaxX.second, minmaxY.first, minmaxY.second, curveList, colList, rowList);
#ifdef DEBUG
//        std::cout<<"Q"<<control1->x<<" "<<control1->y<<" "<<to->x<<" "<<to->y<<" ";
#endif
        // 将这个curve的终点赋值给下一个curve起点
        x0 = x1; y0 = y1;
        isNextContour = true;
        return 0;
    };
    callbacks.cubic_to = [](const FT_Vector *control1, const FT_Vector *control2, const FT_Vector *to, void *user) {
        throw std::runtime_error("不支持三次贝塞尔");
        return 0;
    };

    // 解析command
    auto error = FT_Outline_Decompose(glyphCacheItem->mOutline.get(), &callbacks, this);
    if (error) {
        throw std::runtime_error("解析command出错");
    }
    // 为最后的那个contour添加结尾
    if (isNextContour) {
        curveList.emplace_back(CurveItem{x0, y0, 0, 0});
    }

    // 添加到curves的image内
    const auto curvesLen = curveList.size();
    auto *curveImage = mCurvePacker.FindImage(curvesLen);
    const auto startIdx = curveImage->mTail;

    for (int i = 0; i < curvesLen; i++) {
        const auto &curve = curveList[i];
        curveImage->mImageData->SetColor(
                startIdx + i,
                uint8_t(round(curve.x * 255)),
                uint8_t(round(curve.y * 255)),
                uint8_t(round(curve.cx * 255)),
                uint8_t(round(curve.cy * 255))
//                uint8_t(std::clamp(int(round(curve.x * 255)), int(0), int(255))),
//                uint8_t(std::clamp(int(round(curve.y * 255)), int(0), int(255))),
//                uint8_t(std::clamp(int(round(curve.cx * 255)), int(0), int(255))),
//                uint8_t(std::clamp(int(round(curve.cy * 255)), int(0), int(255)))
        );
    }
    curveImage->mTail += curvesLen;

    // 设置dim和cell数据
    size_t rowDimOffset{};
    ImageRec *rowDimImage, *rowCellImage;
    SetDimAndCellData(rowList, mRowDimPacker, mRowCellPacker, startIdx, rowDimOffset, rowDimImage, rowCellImage);
    size_t colDimOffset{};
    ImageRec *colDimImage, *colCellImage;
    SetDimAndCellData(colList, mColDimPacker, mColCellPacker, startIdx, colDimOffset, colDimImage, colCellImage);

    return glyphCacheItem->mGlyphGpuCache = mGlyphGPUMap[c] = std::make_shared<GlyphGPUCacheItem>(c, curveImage, rowDimImage, rowCellImage, colDimImage, colCellImage, rowDimOffset, colDimOffset);

#ifdef DEBUG
    std::cout<<(rowDimImage == colDimImage)<<", "<<(rowCellImage == colCellImage)<<std::endl;
    std::cout<<"rowDim"<<std::endl;
    rowDimImage->mImageData->PrintColor(0, rowDimImage->mTail);
    std::cout<<"rowCell"<<std::endl;
    rowCellImage->mImageData->PrintColor(0, rowCellImage->mTail);
    std::cout<<"colDim"<<std::endl;
    colDimImage->mImageData->PrintColor(0, rowDimImage->mTail);
    std::cout<<"colCell"<<std::endl;
    colCellImage->mImageData->PrintColor(0, rowCellImage->mTail);
#endif

    return nullptr;
}

bool Font::SupportChar(const wchar_t &c) {
    return GetGlyphCacheItem(c, GetGlyphCacheItemFlag::INIT_INDEX) != nullptr;
}

bool Font::SupportString(const std::wstring &str) {
    return std::all_of(str.begin(), str.end(),
                       [this](const wchar_t &c){ return SupportChar(c); });
}
bool Font::IsColorLayered() const {
    return mColorLayered;
}

void Font::AddCurveToCache(
        const float &x0, const float &y0, const float &cx, const float &cy,
        const float &minX, const float &maxX, const float &minY, const float &maxY, std::vector<CurveItem> &curveList,
        std::vector<std::vector<int>> &cols, std::vector<std::vector<int>> &rows
) {
    static size_t curveIdx;
    // 获取这个curve的idx
    curveIdx = curveList.size();
    curveList.push_back(CurveItem{x0, y0, cx, cy});
    const auto &&colBandNum = cols.size();
    // 计算col band的范围
    const int minColBandIdx = std::max(0, int(floor(minX * float(colBandNum))));
    const int maxColBandIdx = std::min(int(colBandNum), int(ceil(maxX * float(colBandNum))));
    // 将这个curve添加到所相交的band范围内
    for (int i = minColBandIdx; i < maxColBandIdx; i++) cols[i].push_back(int(curveIdx));

    const auto &&rowBandNum = rows.size();
    // 计算row band的范围
    const int minRowBandIdx = std::max(0, int(floor(minY * float(rowBandNum))));
    const int maxRowBandIdx = std::min(int(rowBandNum), int(ceil(maxY * float(rowBandNum))));
    // 将这个curve添加到所相交的band范围内
    for (int i = minRowBandIdx; i < maxRowBandIdx; i++) rows[i].push_back(int(curveIdx));
}

void Font::SetDimAndCellData(
        std::vector<std::vector<int> > &dimData, Packer &dimPacker, Packer &cellPacker, const size_t &curveOffset, size_t &dimOffset,
        ImageRec *&dimImage, ImageRec *&cellImage
) {
    const auto dimLen = dimData.size();
    dimImage = dimPacker.FindImage(dimLen);
    dimOffset = dimImage->mTail;

    // 分配cell image
    int totalStrokes{0};
    for (const auto &dimItem : dimData) {
        totalStrokes += dimItem.size();
    }
    cellImage = cellPacker.FindImage(totalStrokes);

    // 遍历dim，设置dim以及dim对应的cell
    for (int i = 0; i < dimLen; i++) {
        const auto &dimItem = dimData[i];
        const auto curvesLen = dimItem.size();
        dimImage->mImageData->SetColor(
                dimOffset + i,
                uint8_t(cellImage->mTail >> 7),
                uint8_t(cellImage->mTail & 0x7F),
                uint8_t(curvesLen >> 7),
                uint8_t(curvesLen & 0x7F)
        );

        for (int j = 0; j < curvesLen; j++) {
            const auto &&curveIdx = curveOffset + dimItem[j];
            cellImage->mImageData->SetColor(
                    cellImage->mTail + j,
                    uint8_t(curveIdx >> 7),
                    uint8_t(curveIdx & 0x7F),
                    0, 0
            );
        }

        cellImage->mTail += curvesLen;
    }


    dimImage->mTail += dimLen;
}

/**
 * 静态函数，用于布局不同font的字符串
 * @param str
 * @param fontSize
 * @param layoutRes
 * @param charMapFont
 * @param width 字符串的宽度
 */
void Font::LayoutWString(const std::wstring &str, const float &fontSize, std::vector<LayoutDataItem> &layoutRes,
                         const std::unordered_map<wchar_t, std::shared_ptr<Font>> &charMapFont, float *width) {
    static float penX{0};
    static long xMin, xMax, yMin, yMax, advanceWidth;
    static float scale;
    penX = 0;

    // todo 性能后续优化
    // 计算布局，暂时不需要leftSideBearing，因为包围盒xMin, xMax, yMin, yMax足够表示这个字符的位置了
    for (const auto &c : str) {
        auto iter = charMapFont.find(c);
        // todo 这里字符需要标识出来
        if (iter == charMapFont.end()) continue;
        auto &font = iter->second;
        font->GetScaleByFontSize(fontSize, &scale);
        font->MeasureCharBbox(c, &xMin, &yMin, &xMax, &yMax, &advanceWidth);
        layoutRes.push_back(LayoutDataItem{
                LayoutLineItem{penX + float(xMin) * scale, float(yMin) * scale, float(xMax - xMin) * scale, float(yMax - yMin) * scale},
                c,
                font
        });
        penX += float(advanceWidth) * scale;
    }
    *width = penX - float(advanceWidth) * scale + float(xMax - xMin) * scale;
}
