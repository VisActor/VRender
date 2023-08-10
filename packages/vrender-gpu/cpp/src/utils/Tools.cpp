//
// Created by ByteDance on 2023/6/29.
//
#include <iostream>
#include <random>
#include <glm/glm.hpp>
#include <array>
#include <codecvt>
#include <glm/gtc/matrix_transform.hpp>
#include <chrono>
#include "Tools.hpp"

double Random(double left, double right)  {
    if (left > right) {
        std::swap(left, right);
    }
    static bool init = false;
    static std::random_device rd;
    static std::mt19937 mt{rd()};
    std::uniform_real_distribution<double> dist{left, right};
    return dist(mt);
}

glm::vec2 Random(glm::vec2 left, glm::vec2 right) {
    return glm::vec2{Random(left.x, right.x), Random(left.y, right.y)};
}

glm::vec3 Random(glm::vec3 left, glm::vec3 right) {
    return glm::vec3{Random(left.x, right.x), Random(left.y, right.y), Random(left.z, right.z)};
}

std::wstring StrToWStr(const std::string &str) {
    std::wstring_convert <std::codecvt_utf8 <wchar_t>, wchar_t> convert;
    return convert.from_bytes (str);
}

std::string WStrToStr(const std::wstring &wstr) {
    using convert_typeX = std::codecvt_utf8<wchar_t>;
    std::wstring_convert<convert_typeX, wchar_t> converterX;

    return converterX.to_bytes(wstr);
}

void CstrToUnicode(wchar_t *buff, const char *str) {
    wchar_t *wp = buff;
    const char *cp = str;
}

void StrToUnicode(const std::wstring &str, int *data, int *num) {
    std::cout<<str.length()<<std::endl;
}

// 点到平面距离
float PointToPlaneDistance(const std::array<glm::vec3, 3> &plane, glm::vec3 point) {
    auto A = plane[0];
    auto B = plane[1];
    auto C = plane[2];

    auto normal = glm::cross(B - A, C - A);
    normal = glm::normalize(normal);

    float distance = glm::dot(normal, point - A);
    distance = abs(distance);

    return distance;
}

bool PointAbovePlane(const std::array<glm::vec3, 3> &plane, glm::vec3 point) {
    auto A = plane[0];
    auto B = plane[1];
    auto C = plane[2];

    auto normal = glm::cross(B - A, C - A);

    return glm::dot(point - A, normal) > 0;
}

glm::mat4 GeneratorModelMatrix(const glm::vec3 &position, const glm::vec3 &scale,
                               const glm::mat4 &rotate) {
    // 当试图在一个场景中用旋转矩阵和缩放矩阵放置一个对象的时候，建议是首先做缩放变换，再旋转，最后才是位移变换。
    // 因为矩阵乘法是从右向左执行的，所以我们变换的矩阵顺序是相反的：移动，旋转，缩放。
    glm::mat4 model{1.0f};
    model = glm::translate(model, position); // 移动
    model = glm::translate(model, glm::vec3{.5f} * scale); // 设置锚点为左上角
    model *= rotate;
    model = glm::translate(model, glm::vec3{-.5f} * scale); // 设置锚点为矩形中心
    model = glm::scale(model, scale); // 缩放

    return model;
}

void Transform2D(glm::mat4 &out, const glm::mat4 &origin, const glm::vec2 &translate, const glm::vec2 &scale,
                 const float &rotate, const glm::vec2 &rotateCenter) {
    static float a1{}, b1{}, c1{}, d1{}, cosTheta{}, sinTheta{}, offsetX{}, offsetY{};
    static float a{}, b{}, c{}, d{};
    cosTheta = std::cos(rotate); sinTheta = std::sin(rotate);
    offsetX = rotateCenter.x - translate.x; offsetY = rotateCenter.y - translate.y;
    a = origin[0][0], b = origin[0][1], c = origin[1][0], d = origin[1][1];

    a1 = a * cosTheta + c * sinTheta;
    b1 = b * cosTheta + d * sinTheta;
    c1 = c * cosTheta - a * sinTheta;
    d1 = d * cosTheta - b * sinTheta;

    out[0][0] = scale.x * a1;
    out[0][1] = scale.x * b1;
    out[1][0] = scale.y * c1;
    out[1][1] = scale.y * d1;

    out[3][0] = origin[3][0] + a * rotateCenter.x + c * rotateCenter.y - a1 * offsetX - c1 * offsetY;
    out[3][1] = origin[3][1] + b * rotateCenter.x + d * rotateCenter.y - b1 * offsetX - d1 * offsetY;
}

float Time(bool start) {
    static std::vector<std::chrono::time_point<std::chrono::steady_clock>> startTimeList;
    float time{-1.f};
    if (start) {
        startTimeList.push_back(std::chrono::steady_clock::now());
    } else {
        time = std::chrono::duration <float, std::milli> (std::chrono::steady_clock::now() - startTimeList[startTimeList.size()-1]).count();
        startTimeList.pop_back();
    }
    start = !start;
    return time;
}
void ConsoleTime(bool start, const std::string& tag) {
    static std::vector<std::pair<std::chrono::time_point<std::chrono::steady_clock>, std::string>> startTimeList;
    float time{-1.f};
    if (start) {
        startTimeList.emplace_back(std::pair(std::chrono::steady_clock::now(), tag));
    } else {
        auto data = startTimeList[startTimeList.size()-1];
        time = std::chrono::duration <float, std::milli> (std::chrono::steady_clock::now() - data.first).count();
        startTimeList.pop_back();
        std::cout<<data.second + "time: "<<time<<std::endl;
    }
    start = !start;
}
