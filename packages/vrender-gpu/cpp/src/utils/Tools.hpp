//
// Created by ByteDance on 2023/6/29.
//

#ifndef NBEZIER_TOOLS_HPP
#define NBEZIER_TOOLS_HPP

#include <iostream>
#include <numeric>
#include <type_traits>
#include "Vector.hpp"

#define PI 3.1415926f

extern double Random(double left, double right);
extern glm::vec2 Random(glm::vec2 left, glm::vec2 right);
extern glm::vec3 Random(glm::vec3 left, glm::vec3 right);

extern std::wstring StrToWStr(const std::string &str);
extern std::string WStrToStr(const std::wstring &wstr);
extern void StrToUnicode(const std::wstring &str, int *data, int *num);
extern void CstrToUnicode(wchar_t *buff, const char *str);
extern float PointToPlaneDistance(const std::array<glm::vec3, 3> &plane, glm::vec3 point);
extern bool PointAbovePlane(const std::array<glm::vec3, 3> &plane, glm::vec3 point);
extern glm::mat4 GeneratorModelMatrix(const glm::vec3 &position, const glm::vec3 &scale,
                                      const glm::mat4 &rotate);
extern void Transform2D(glm::mat4 &out, const glm::mat4 &origin, const glm::vec2 &translate, const glm::vec2 &scale,
                        const float &rotate, const glm::vec2 &rotateCenter);
extern float Time(bool start);
extern void ConsoleTime(bool start, const std::string& tag = "");
inline void CopyVec2(glm::vec2 &out, const glm::vec2 &from) {
    out[0] = from[0]; out[1] = from[1];
}
inline void CopyVec3(glm::vec3 &out, const glm::vec3 &from) {
    out[0] = from[0]; out[1] = from[1]; out[2] = from[2];
}
inline void CopyVec4(glm::vec4 &out, const glm::vec4 &from) {
    out[0] = from[0]; out[1] = from[1];
    out[2] = from[2]; out[3] = from[3];
}
inline void Multiple(glm::vec2 &out, const glm::vec2 &pos, const glm::mat4 &matrix) {
    float outX = matrix[0][0] * pos[0] + matrix[1][0] * pos[1] + matrix[3][0];
    out[1] = matrix[0][1] * pos[0] + matrix[1][1] * pos[1] + matrix[3][1];
    out[0] = outX; // 避免提前修改属性
}
inline void Normalize(glm::vec2 &out) {
    float length = std::sqrt(out.x * out.x + out.y * out.y);
    out.x /= length;
    out.y /= length;
}

template <typename T>
T TexcoordTransformToIndex(T x, T y, T w) {
    return x + y * w;
}

template<typename T1, typename T2>
struct IsSameType {
    explicit operator bool() {
        return false;
    }
};
template <typename T>
struct IsSameType<T, T> {
    explicit operator bool() {
        return true;
    }
};

template <typename T>
struct IsVec2 {
    explicit operator bool() {
        return false;
    }
};
template <>
struct IsVec2<Vec2f> {
    explicit operator bool() {
        return true;
    }
};

template <typename T>
struct IsVec3 {
    explicit operator bool() {
        return false;
    }
};
template <>
struct IsVec3<Vec3f> {
    explicit operator bool() {
        return true;
    }
};

template <typename T>
struct IsVec4 {
    explicit operator bool() {
        return false;
    }
};
template <>
struct IsVec4<Vec4f> {
    explicit operator bool() {
        return true;
    }
};

template <typename T>
struct IsFloat {
    explicit operator bool() {
        return false;
    }
};
template <>
struct IsFloat<float> {
    explicit operator bool() {
        return true;
    }
};

template <typename T>
struct IsDouble {
    explicit operator bool() {
        return false;
    }
};
template <>
struct IsDouble<double> {
    explicit operator bool() {
        return true;
    }
};

template <typename T>
struct IsFloatOrDouble {
    explicit operator bool() {
        return false;
    }
};
template <>
struct IsFloatOrDouble<float> {
    explicit operator bool() {
        return true;
    }
};
template <>
struct IsFloatOrDouble<double> {
    explicit operator bool() {
        return true;
    }
};

template <typename T>
struct IsInt {
    explicit operator bool() {
        return false;
    }
};
template <>
struct IsInt<int> {
    explicit operator bool() {
        return true;
    }
};

// 牛顿-拉夫逊算法
template<typename T>
struct NewtonRapson {
    typedef std::function<T(T)> Func; // 函数
    typedef std::function<T(T)> FuncDaoshu; // 函数的导函数
    static inline T Solve(T x, Func func, FuncDaoshu funcDaoshu) {
        T x1, x2 = x;
        do {
            x1 = x2;
            T value = func(x1);
            T k = funcDaoshu(x1);
            x2 = x1 - (value / k);
        } while(std::abs(x2 - x1) >= 10E-6);

        return x2;
    }
};

template <typename T>
T linearBezier(const T &p1, const T &p2, const float &t) {
    return (1.f - t) * p1 + t * p2;
}

template <typename T>
inline T quadraticBezier(const T &p1, const T &p2, const T &p3, const float &t) {
    // return (1.f - t) * linearBezier(p1, p2, t) + t * linearBezier(p2, p3, t);
    // 拆分，性能
    const auto mt = 1.f - t;
    return p1 * mt * mt + 2.f * mt * t * p2 + p3 * t * t;
}

template <typename T>
inline T cubicBezier(const T &p1, const T &p2, const T &p3, const T &p4, const float &t) {
    // return (1.f - t) * quadraticBezier(p1, p2, p3, t) + t * quadraticBezier(p2, p3, p4, t);
    const auto mt = 1.f - t;
    const auto mt2 = mt * mt;
    const auto mt3 = mt2 * mt;
    const auto t2 = t * t;
    const auto t3 = t2 * t;
    return p1 * mt3 + 3.f * p2 * mt2 * t + 3.f * p3 * mt * t2 + p4 * t3;
}

template <typename T>
T bezier(std::vector<T> pList, const float &t) {
    if (pList.size() == 1) return pList[0];

    std::vector<T> _pList{};
    for (int i = 0; i < pList.size()-1; i++) {
        _pList.push_back(linearBezier(pList[i], pList[i+1], t));
    }
    return bezier(_pList, t);
}

template<typename T>
typename std::enable_if<!std::numeric_limits<T>::is_integer, bool>::type IsNumberEqual(T x, T y, unsigned int ulp=2) {
    return std::fabs(x-y) < std::numeric_limits<T>::epsilon() * ulp
           || std::fabs(x-y) < std::numeric_limits<T>::min();
}

#endif //NBEZIER_TOOLS_HPP
