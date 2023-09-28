//
// Created by ByteDance on 2023/8/10.
//

#ifndef VRENDER_GPU_BOUNDS_HPP
#define VRENDER_GPU_BOUNDS_HPP

#include <vector>
#include <glm/glm.hpp>
#include "Struct.hpp"

class Bound2D {
public:
    Bound2D(): mBound{0, 0, 0, 0} {};
    inline float Width() { return mBound[2] - mBound[0]; }
    inline float Height() { return mBound[3] - mBound[1]; }
    inline void SetBound(float x1, float y1, float x2, float y2) { mBound[0] = x1; mBound[1] = y1; mBound[2] = x2; mBound[3] = y2; }
    inline bool Contains(const Point &point) {
        return point.x > mBound[0] && point.x < mBound[2] && point.y > mBound[1] && point.y < mBound[3];
    }
    inline void Calc(float x, float y, float w, float h) { mBound.x = x; mBound.y = y; mBound.z = x + w; mBound.w = y + h; }
    void Calc(float x, float y, float w, float h, const glm::mat4 &matrix);
    inline void Calc(const glm::vec2 &pos, float w, float h) { mBound.x = pos.x, mBound.y = pos.y; mBound.z = pos.x + w; mBound.w = pos.y + h; };
    void Calc(const glm::vec2 &pos, float w, float h, const glm::mat4 &matrix);

    template<typename T, typename = std::enable_if<std::is_base_of_v<glm::vec2, T>>>
    void Calc(const std::vector<T> &points) {
        float &minX = mBound.x, &minY = mBound.y, &maxX = mBound.z, &maxY = mBound.w;
        minX = minY = std::numeric_limits<float>::max();
        maxX = maxY = -std::numeric_limits<float>::max();

        for (const auto &p : points) {
            GetMinMax(minX, minY, maxX, maxY, p);
        }
    }

    template<typename T, typename = std::enable_if<std::is_base_of_v<glm::vec2, T>>>
    void Calc(const std::vector<T> &points, const glm::mat4 &matrix) {
        float &minX = mBound.x, &minY = mBound.y, &maxX = mBound.z, &maxY = mBound.w;
        minX = minY = std::numeric_limits<float>::max();
        maxX = maxY = -std::numeric_limits<float>::max();
        glm::vec2 nextPos{};

        for (const auto &p : points) {
            Multiple(nextPos, p, matrix);
            GetMinMax(minX, minY, maxX, maxY, nextPos);
        }
    }

    [[nodiscard]] inline const glm::vec4& GetBound() const { return mBound; }
private:
    glm::vec4 mBound;
    static void GetMinMax(float &minX, float &minY, float &maxX, float &maxY, const glm::vec4 &data);
    static void GetMinMax(float &minX, float &minY, float &maxX, float &maxY, const glm::vec2 &data);
};

class AABBBounds {
public:
    AABBBounds(const glm::vec3 &min, const glm::vec3 &max): mMin{min}, mMax{max} {}
    glm::vec3 mMin;
    glm::vec3 mMax;
};

class SphereBounds {
public:
    SphereBounds(const glm::vec3 &center, float r): mCenter{center}, mRadius{r} {}
    glm::vec3 mCenter;
    float mRadius;
};

#endif //VRENDER_GPU_BOUNDS_HPP
