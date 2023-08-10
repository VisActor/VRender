//
// Created by ByteDance on 2023/6/29.
//

#ifndef NBEZIER_VECTOR_HPP
#define NBEZIER_VECTOR_HPP

#include <glm/glm.hpp>
//#include <array>

//template<typename T>
//union Vec2 {
//    std::array<T, 2> data;
//    struct {
//        T x;
//        T y;
//    };
//    Vec2(): x{0}, y{0} {}
//    explicit Vec2(T d): x{d}, y{d} {}
//    Vec2(T _x, T _y): x{_x}, y{_y} {}
//
//    Vec2<T> operator+(const T &num) const { return Vec2<T>{x+num, y+num}; }
//    Vec2<T> operator+(const Vec2<T> &v) const { return Vec2<T>{x+v.x, y+v.y}; }
//    friend Vec2<T> operator+(const T &num, const Vec2<T> &v) { return Vec2<T>{v.x+num, v.y+num}; }
//    Vec2<T>& operator+=(const T &num) { x+=num; y+=num; return *this; }
//    Vec2<T>& operator+=(const Vec2<T> &v) { x+=v.x; y+=v.y; return *this; }
//
//    Vec2<T> operator-(const T &num) const { return Vec2<T>{x-num, y-num}; }
//    Vec2<T> operator-(const Vec2<T> &v) const { return Vec2<T>{x-v.x, y-v.y}; }
//    friend Vec2<T> operator-(const T &num, const Vec2<T> &v) { return Vec2<T>{num-v.x, num-v.y}; }
//    Vec2<T>& operator-=(const T &num) { x-=num; y-=num; return *this; }
//    Vec2<T>& operator-=(const Vec2<T> &v) { x-=v.x; y-=v.y; return *this; }
//
//    Vec2<T> operator*(const T &num) const { return Vec2<T>{x*num, y*num}; }
//    Vec2<T> operator*(const Vec2<T> &v) const { return Vec2<T>{x*v.x, y*v.y}; }
//    friend Vec2<T> operator*(const T &num, const Vec2<T> &v) { return Vec2<T>{num*v.x, num*v.y}; }
//    Vec2<T>& operator*=(const T &num) { x*=num; y*=num; return *this; }
//    Vec2<T>& operator*=(const Vec2<T> &v) { x*=v.x; y*=v.y; return *this; }
//
//    Vec2<T> operator/(const T &num) const { return Vec2<T>{x/num, y/num}; }
//    Vec2<T> operator/(const Vec2<T> &v) const { return Vec2<T>{x/v.x, y/v.y}; }
//    friend Vec2<T> operator/(const T &num, const Vec2<T> &v) { return Vec2<T>{num/v.x, num/v.y}; }
//    Vec2<T>& operator/=(const T &num) { x/=num; y/=num; return *this; }
//    Vec2<T>& operator/=(const Vec2<T> &v) { x/=v.x; y/=v.y; return *this; }
//
//    bool operator==(const Vec2<T>& target) {
//        return x == target.x && y == target.y;
//    }
//};
//
//template<typename T>
//union Vec3 {
//    std::array<T, 3> data;
//    struct {
//        T x;
//        T y;
//        T z;
//    };
//    struct {
//        T r;
//        T g;
//        T b;
//    };
//    Vec3(): x{0}, y{0}, z{0} {}
//    explicit Vec3(T d): x{d}, y{d}, z{d} {}
//    Vec3(T _x, T _y, T _z): x{_x}, y{_y}, z{_z} {}
//
//    Vec3<T> operator+(const T &num) const { return Vec3<T>{x+num, y+num, z+num}; }
//    Vec3<T> operator+(const Vec3<T> &v) const { return Vec3<T>{x+v.x, y+v.y, z+v.z}; }
//    friend Vec3<T> operator+(const T &num, const Vec3<T> &v) { return Vec3<T>{v.x+num, v.y+num, v.z+num}; }
//    Vec3<T>& operator+=(const T &num) { x+=num; y+=num; z+=num; return *this; }
//    Vec3<T>& operator+=(const Vec3<T> &v) { x+=v.x; y+=v.y; z+=v.z; return *this; }
//
//    Vec3<T> operator-(const T &num) const { return Vec3<T>{x-num, y-num, z-num}; }
//    Vec3<T> operator-(const Vec3<T> &v) const { return Vec3<T>{x-v.x, y-v.y, z-v.z}; }
//    friend Vec3<T> operator-(const T &num, const Vec3<T> &v) { return Vec3<T>{num-v.x, num-v.y, num-v.z}; }
//    Vec3<T>& operator-=(const T &num) { x-=num; y-=num; z-=num; return *this; }
//    Vec3<T>& operator-=(const Vec3<T> &v) { x-=v.x; y-=v.y; z-=v.z; return *this; }
//
//    Vec3<T> operator*(const T &num) const { return Vec3<T>{x*num, y*num, z*num}; }
//    Vec3<T> operator*(const Vec3<T> &v) const { return Vec3<T>{x*v.x, y*v.y, z*v.z}; }
//    friend Vec3<T> operator*(const T &num, const Vec3<T> &v) { return Vec3<T>{num*v.x, num*v.y, num*v.z}; }
//    Vec3<T>& operator*=(const T &num) { x*=num; y*=num; z*=num; return *this; }
//    Vec3<T>& operator*=(const Vec3<T> &v) { x*=v.x; y*=v.y; z*=v.z; return *this; }
//
//    Vec3<T> operator/(const T &num) const { return Vec3<T>{x/num, y/num, z/num}; }
//    Vec3<T> operator/(const Vec3<T> &v) const { return Vec3<T>{x/v.x, y/v.y, z/v.z}; }
//    friend Vec3<T> operator/(const T &num, const Vec3<T> &v) { return Vec3<T>{num/v.x, num/v.y, num/v.z}; }
//    Vec3<T>& operator/=(const T &num) { x/=num; y/=num; z/=num; return *this; }
//    Vec3<T>& operator/=(const Vec3<T> &v) { x/=v.x; y/=v.y; z/=v.z; return *this; }
//
//    bool operator==(const Vec2<T>& target) {
//        return x == target.x && y == target.y && z == target.z;
//    }
//};
//
//template<typename T>
//union Vec4 {
//    std::array<T, 4> data;
//    struct {
//        T x;
//        T y;
//        T z;
//        T w;
//    };
//    struct {
//        T r;
//        T g;
//        T b;
//        T a;
//    };
//    Vec4(): x{0}, y{0}, z{0}, w{0} {}
//    explicit Vec4(T d): x{d}, y{d}, z{d}, w{d} {}
//    Vec4(T _x, T _y, T _z, T _w): x{_x}, y{_y}, z{_z}, w{_w} {}
//
//    Vec4<T> operator+(const T &num) const { return Vec4<T>{x+num, y+num, z+num, w+num}; }
//    Vec4<T> operator+(const Vec4<T> &v) const { return Vec4<T>{x+v.x, y+v.y, z+v.z, w+v.w}; }
//    friend Vec4<T> operator+(const T &num, const Vec4<T> &v) { return Vec4<T>{v.x+num, v.y+num, v.z+num, v.w+num}; }
//    Vec4<T>& operator+=(const T &num) { x+=num; y+=num; z+=num; w+=num; return *this; }
//    Vec4<T>& operator+=(const Vec4<T> &v) { x+=v.x; y+=v.y; z+=v.z; w+=v.w; return *this; }
//
//    Vec4<T> operator-(const T &num) const { return Vec4<T>{x-num, y-num, z-num, w-num}; }
//    Vec4<T> operator-(const Vec4<T> &v) const { return Vec4<T>{x-v.x, y-v.y, z-v.z, w-v.w}; }
//    friend Vec4<T> operator-(const T &num, const Vec4<T> &v) { return Vec4<T>{num-v.x, num-v.y, num-v.z, num-v.w}; }
//    Vec4<T>& operator-=(const T &num) { x-=num; y-=num; z-=num; w-=num; return *this; }
//    Vec4<T>& operator-=(const Vec4<T> &v) { x-=v.x; y-=v.y; z-=v.z; w-=v.w; return *this; }
//
//    Vec4<T> operator*(const T &num) const { return Vec4<T>{x*num, y*num, z*num, w*num}; }
//    Vec4<T> operator*(const Vec4<T> &v) const { return Vec4<T>{x*v.x, y*v.y, z*v.z, w*v.w}; }
//    friend Vec4<T> operator*(const T &num, const Vec4<T> &v) { return Vec4<T>{num*v.x, num*v.y, num*v.z, num*v.w}; }
//    Vec4<T>& operator*=(const T &num) { x*=num; y*=num; z*=num; w*=num; return *this; }
//    Vec4<T>& operator*=(const Vec4<T> &v) { x*=v.x; y*=v.y; z*=v.z; w*=v.w; return *this; }
//
//    Vec4<T> operator/(const T &num) const { return Vec4<T>{x/num, y/num, z/num, w/num}; }
//    Vec4<T> operator/(const Vec4<T> &v) const { return Vec4<T>{x/v.x, y/v.y, z/v.z, w/v.w}; }
//    friend Vec4<T> operator/(const T &num, const Vec4<T> &v) { return Vec4<T>{num/v.x, num/v.y, num/v.z, num/v.w}; }
//    Vec4<T>& operator/=(const T &num) { x/=num; y/=num; z/=num; w/=num; return *this; }
//    Vec4<T>& operator/=(const Vec4<T> &v) { x/=v.x; y/=v.y; z/=v.z; w/=v.w; return *this; }
//
//    bool operator==(const Vec2<T>& target) {
//        return x == target.x && y == target.y && z == target.z && w == target.w;
//    }
//};

typedef glm::vec2 Vec2f;
typedef glm::vec<2, int> Vec2i;

typedef glm::vec3 Vec3f;
typedef glm::vec<3, int> Vec3i;

typedef glm::vec4 Vec4f;
typedef glm::vec<4, int> Vec4i;

#endif //WASM_EMSCRIPTEN_TEMPLATE_VECTOR_HPP
