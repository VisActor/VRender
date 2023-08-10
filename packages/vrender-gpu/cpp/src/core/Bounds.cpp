//
// Created by ByteDance on 2023/8/10.
//
#include "Bounds.hpp"
#include "Tools.hpp"

void Bound::Calc(float x, float y, float w, float h, const glm::mat4 &matrix) {
    float &minX = mBound.x, &minY = mBound.y, &maxX = mBound.z, &maxY = mBound.w;
    minX = minY = std::numeric_limits<float>::max();
    maxX = maxY = -std::numeric_limits<float>::max();
    auto data = matrix * glm::vec4{x, y, 0, 1};
    GetMinMax(minX, minY, maxX, maxY, data);
    data = matrix * glm::vec4{x+w, y, 0, 1};
    GetMinMax(minX, minY, maxX, maxY, data);
    data = matrix * glm::vec4{x, y+h, 0, 1};
    GetMinMax(minX, minY, maxX, maxY, data);
    data = matrix * glm::vec4{x+w, y+h, 0, 1};
    GetMinMax(minX, minY, maxX, maxY, data);
}

void Bound::Calc(const glm::vec2 &pos, float w, float h, const glm::mat4 &matrix) {
    float &minX = mBound.x, &minY = mBound.y, &maxX = mBound.z, &maxY = mBound.w;
    minX = minY = std::numeric_limits<float>::max();
    maxX = maxY = -std::numeric_limits<float>::max();

    glm::vec2 nextPos{pos.x, pos.y};
    Multiple(nextPos, nextPos, matrix);
    GetMinMax(minX, minY, maxX, maxY, nextPos);
    nextPos.x = pos.x+w; nextPos.y = pos.y;
    Multiple(nextPos, nextPos, matrix);
    GetMinMax(minX, minY, maxX, maxY, nextPos);
    nextPos.x = pos.x; nextPos.y = pos.y + h;
    Multiple(nextPos, nextPos, matrix);
    GetMinMax(minX, minY, maxX, maxY, nextPos);
    nextPos.x = pos.x+w; nextPos.y = pos.y + h;
    Multiple(nextPos, nextPos, matrix);
    GetMinMax(minX, minY, maxX, maxY, nextPos);
}


void Bound::GetMinMax(float &minX, float &minY, float &maxX, float &maxY, const glm::vec4 &data) {
    if (data.x < minX) {
        minX = data.x;
    } else if (data.x > maxX) {
        maxX = data.x;
    }
    if (data.y < minY) {
        minY = data.y;
    } else if (data.y > maxY) {
        maxY = data.y;
    }
}

void Bound::GetMinMax(float &minX, float &minY, float &maxX, float &maxY, const glm::vec2 &data) {
    if (data.x < minX) {
        minX = data.x;
    } else if (data.x > maxX) {
        maxX = data.x;
    }
    if (data.y < minY) {
        minY = data.y;
    } else if (data.y > maxY) {
        maxY = data.y;
    }
}
