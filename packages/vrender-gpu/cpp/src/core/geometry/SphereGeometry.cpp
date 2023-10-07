//
// Created by ByteDance on 2023/10/7.
//
#include "SphereGeometry.hpp"

void SphereGeometry::InIt(float size) {
    const float PI = 3.14159;
    float radius = 2.f;
    float x, y, z; // position
    int rowNum = 60, columnNum = 60; // 行数列数
    float rowAngleStep = 2 * PI / float(rowNum), columnAngleStep = PI / float(columnNum); // 行列步长
    float rowAngle{0.f}, columnAngle{0.f};

    float _radiusMultiplyCosColumnAngle;
    float _radiusMultiplySinColumnAngle;

    for (int i = 0; i <= columnNum; i++) {
        columnAngle = PI/2 - i * columnAngleStep; // PI/2 到 -PI/2
        _radiusMultiplyCosColumnAngle = radius * cos(columnAngle);
        _radiusMultiplySinColumnAngle = radius * sin(columnAngle);

        for (int j = 0; j <= rowNum; j++) {
            rowAngle = j * rowAngleStep; // 0到2*PI
            x = _radiusMultiplyCosColumnAngle * cos(rowAngle);
            y = _radiusMultiplyCosColumnAngle * sin(rowAngle);
            z = _radiusMultiplySinColumnAngle;
            auto position = glm::vec3{x, y, z};
            auto normal = glm::vec3{x, y, z};
            auto texCoords = glm::vec2{j/float(rowNum), i/float(columnNum)};
            mVertices.emplace_back(position);
            mNormals.emplace_back(normal);
            mTextureCoords.emplace_back(texCoords);
        }
    }

    for (int i = 0; i < columnNum; i++) {
        int currentIndex = i * (rowNum + 1);
        int bottomIndex = currentIndex + rowNum + 1;

        for (int j = 0; j < rowNum; j++) {
            if (i != 0) {
                mIndices.emplace_back(currentIndex, bottomIndex, currentIndex+1);
            }
            if (i != columnNum - 1) {
                mIndices.emplace_back(currentIndex+1, bottomIndex, bottomIndex+1);
            }
            currentIndex++;
            bottomIndex++;
        }
    }
}