//
// Created by ByteDance on 2023/7/1.
//

#ifndef NBEZIER_BEZIER_HPP
#define NBEZIER_BEZIER_HPP

#include "Vector.hpp"
#include "Tools.hpp"
#include <vector>
#include <array>

class Curve {
public:
    [[nodiscard]] std::vector<Vec2f> Simplify(int n) const;

    [[nodiscard]] virtual Vec2f GetPointAt(float t) const = 0;
    [[nodiscard]] virtual float GetXAt(float t) const = 0;
    [[nodiscard]] virtual float GetYAt(float t) const = 0;

    [[nodiscard]] virtual const Vec2f& StartPoint() const = 0;
    [[nodiscard]] virtual const Vec2f& EndPoint() const = 0;
protected:
    Curve(const Vec2f &p1, const Vec2f &p2): p1_{p1}, p2_{p2} {}
    Vec2f p1_;
    Vec2f p2_;
};

class Quadratic: public Curve {
public:
    Quadratic(const Vec2f &p1, const Vec2f &p2, const Vec2f &p3): Curve(p1, p2), p3_{p3} {}

//    std::vector<Vec2f> Simplify(int n) override;

    [[nodiscard]] inline Vec2f GetPointAt(float t) const override {
        return Vec2f{GetXAt(t), GetYAt(t)};
    }
    [[nodiscard]] inline float GetXAt(float t) const override {
        return quadraticBezier(p1_.x, p2_.x, p3_.x, t);
    }
    [[nodiscard]] float GetYAt(float t) const override {
        return quadraticBezier(p1_.y, p2_.y, p3_.y, t);
    }

    [[nodiscard]] inline const Vec2f& StartPoint() const override {
        return p1_;
    }
    [[nodiscard]] inline const Vec2f & EndPoint() const override {
        return p3_;
    }

    inline void FromPoints(const Vec2f &p1, const Vec2f &p2, const Vec2f &p3) {
        p1_ = p1;
        p2_ = p2;
        p3_ = p3;
    }

    void Split(float t, Quadratic &left, Quadratic &right) const;
    [[nodiscard]] std::array<Quadratic, 2> Split(float t) const;

    inline bool EqualTo(Quadratic &target) {
        return p1_ == target.p1_ && p2_ == target.p2_ && p3_ == target.p3_;
    }
protected:
    Vec2f p3_;
};

class Cubic: public Curve {
public:
    Cubic(const Vec2f &p1, const Vec2f &p2, const Vec2f &p3, const Vec2f &p4): Curve(p1, p2), p3_{p3}, p4_{p4} {}

//    std::vector<Vec2f> Simplify(int n) override;

    [[nodiscard]] inline Vec2f GetPointAt(float t) const override {
        return Vec2f{GetXAt(t), GetYAt(t)};
    }
    [[nodiscard]] inline float GetXAt(float t) const override {
        return cubicBezier(p1_.x, p2_.x, p3_.x, p4_.x, t);
    }
    [[nodiscard]] float GetYAt(float t) const override {
        return cubicBezier(p1_.y, p2_.y, p3_.y, p4_.y, t);
    }

    [[nodiscard]] inline const Vec2f& StartPoint() const override {
        return p1_;
    }
    [[nodiscard]] inline const Vec2f & EndPoint() const override {
        return p4_;
    }

    inline void FromPoints(const Vec2f &p1, const Vec2f &p2, const Vec2f &p3, const Vec2f &p4) {
        p1_ = p1;
        p2_ = p2;
        p3_ = p3;
        p4_ = p4;
    }

    void Split(float t, Cubic &left, Cubic &right) const;
    [[nodiscard]] std::array<Cubic, 2> Split(float t) const;

    inline bool EqualTo(Cubic &target) {
        return p1_ == target.p1_ && p2_ == target.p2_ && p3_ == target.p3_ && p4_ == target.p4_;
    }
protected:
    Vec2f p3_;
    Vec2f p4_;
};

#endif //NBEZIER_BEZIER_HPP
