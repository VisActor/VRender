//
// Created by ByteDance on 2023/7/1.
//
#include "Bezier.hpp"

std::vector<Vec2f> Curve::Simplify(int n) const {
    const auto step{1.f / float(n)};
    std::vector<Vec2f> out{};
    out.push_back(p1_);
    for (int i = 0; i < n; i++) {
        out.emplace_back(GetPointAt((float(i) * step)));
    }

    return out;
}

// TODO 内存优化
void Quadratic::Split(float t, Quadratic &left, Quadratic &right) const {
    const Vec2f &&lp2 = (1.f - t) * p1_ + t * p2_;
    const Vec2f &&rp2 = (1.f - t) * p2_ + t * p3_;
    const Vec2f &&mp = (1.f - t) * lp2 + t * rp2;
    left.FromPoints(p1_, lp2, mp);
    right.FromPoints(mp, rp2, p3_);
}

std::array<Quadratic, 2> Quadratic::Split(float t) const {
    static Quadratic left{{}, {}, {}};
    static Quadratic right{{}, {}, {}};
    Split(t, left, right);
    return std::array<Quadratic, 2>{left, right};
}

// TODO 内存优化
void Cubic::Split(float t, Cubic &left, Cubic &right) const {
    const Vec2f &&lp2 = (1.f - t) * p1_ + t * p2_;
    const Vec2f &&rp3 = (1.f - t) * p3_ + t * p4_;
    const Vec2f &&tp = (1.f - t) * p2_ + t * p3_;
    const Vec2f &&lp3 = (1.f - t) * lp2 + t * tp;
    const Vec2f &&rp2 = (1.f - t) * tp + t * rp3;
    const Vec2f &&mp = (1.f - t) * lp3 + t * rp2;
    left.FromPoints(p1_, lp2, lp3, mp);
    right.FromPoints(mp, rp2, rp3, p4_);
}

std::array<Cubic, 2> Cubic::Split(float t) const {
    static Cubic left{{}, {}, {}, {}};
    static Cubic right{{}, {}, {}, {}};
    Split(t, left, right);
    return std::array<Cubic, 2>{left, right};
}