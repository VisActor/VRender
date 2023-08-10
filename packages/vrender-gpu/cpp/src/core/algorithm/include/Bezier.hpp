// https://github.com/Samsung/thorvg
/* Copyright © 2018 Øystein Myrmo (oystein.myrmo@gmail.com)
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
// https://github.com/mattdesl/adaptive-quadratic-curve
/**
 * The MIT License (MIT)
 * Copyright (c) 2014 Matt DesLauriers
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
 * IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
 * DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
 * OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE
 * OR OTHER DEALINGS IN THE SOFTWARE.
 */
// https://github.com/mattdesl/adaptive-bezier-curve
/**
 * Modified BSD License
 * ====================================================
 * Anti-Grain Geometry - Version 2.4
 * Copyright (C) 2002-2005 Maxim Shemanarev (McSeem)
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions
 * are met:
 *
 *   1. Redistributions of source code must retain the above copyright
 *      notice, this list of conditions and the following disclaimer.
 *
 *   2. Redistributions in binary form must reproduce the above copyright
 *      notice, this list of conditions and the following disclaimer in
 *      the documentation and/or other materials provided with the
 *      distribution.
 *
 *   3. The name of the author may not be used to endorse or promote
 *      products derived from this software without specific prior
 *      written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE AUTHOR ``AS IS'' AND ANY EXPRESS OR
 * IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
 * ARE DISCLAIMED. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY DIRECT,
 * INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION)
 * HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT,
 * STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING
 * IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 * POSSIBILITY OF SUCH DAMAGE.
 */


#ifndef GLRENDERER_BEZIER_HPP
#define GLRENDERER_BEZIER_HPP

#include <cmath>
#include <vector>
#include <limits>
#include <algorithm>
#include <array>
#include <glm/glm.hpp>

typedef glm::vec2 Point;
typedef glm::vec2 Dir;

#define _USE_MATH_DEFINES
#define BEZIER_FUZZY_EPSILON 0.0001

// 为了更清晰的理解代码逻辑，建议阅读：
// 伯恩斯坦多项式与贝塞尔曲线：https://zymin.cn/arcticle/Bernstein%20polynomial
// 贝塞尔曲线中的伯恩斯坦多项式（Bernstein Polynomial）：https://zhuanlan.zhihu.com/p/366082920
// 采样参考：https://www.cnblogs.com/muxue/archive/2010/07/04/1771034.html
namespace Bezier {
    namespace Math {
        // 二项分布的概率
        inline size_t binomial(size_t n, size_t k) {
            size_t val = 1;
            for (size_t i = 1; i <= k; i++) {
                val *= n + 1 - i;
                val /= i;
            }
            return val;
        }

        // x在[0, 1]区间
        inline bool isWithinZeroAndOne(float x) {
            return x >= -BEZIER_FUZZY_EPSILON && x <= (1.0 + BEZIER_FUZZY_EPSILON);
        }
    }

    // 计算N阶伯恩斯坦多项式中的k
    // k = n! / i!(n-i)!
    template<int N>
    class BinomialCoefficients {
    public:
        BinomialCoefficients() {
            size_t center = N / 2;
            size_t k = 0;
            while (k <= center) {
                mCoefficients[k] = Math::binomial(N, k);
                k++;
            }
        }
        static constexpr size_t size() {
            return N + 1;
        }
        size_t operator [](size_t idx) const {
            return mCoefficients[idx];
        }
    private:
        int mCoefficients[size()]{0};
    };

    // 计算 (1-t)^(N-i) * t^i
    struct PolynomialPair {
        size_t mI = 0;
        size_t mNMinusI = 0;

        [[nodiscard]] float valueAt(float t) const {
            return float(pow(1.0f - t, mNMinusI) * pow(t, mI));
        }
    };

    // 计算N阶伯恩斯坦多项式的概率部分
    template<int N>
    class PolynomialCoefficients {
    public:
        PolynomialCoefficients() {
            for (auto i = 0; i <= N; i++) {
                mPolynomialPairs[i].mI = i;
                mPolynomialPairs[i].mNMinusI = N - i;
            }
        }

        [[nodiscard]] float valueAt(size_t pos, float t) const {
            return mPolynomialPairs[pos].valueAt(t);
        }

        static constexpr size_t size() {
            return N + 1;
        }

        const PolynomialPair& operator [](size_t idx) const {
            return mPolynomialPairs[idx];
        }

    private:
        PolynomialPair mPolynomialPairs[size()];
    };

    template<size_t N>
    class Bezier {
    public:
        Bezier(): mControlPoints{} {}
        explicit Bezier(std::array<Point, N+1> controlPoints): mControlPoints{} {
            mControlPoints.swap(controlPoints);
        }

        [[nodiscard]] size_t Order() const { return N; }
        [[nodiscard]] size_t Size() const { return N+1; }

        // https://pages.mtu.edu/~shene/COURSES/cs3621/NOTES/spline/Bezier/bezier-der.html
        // 求贝塞尔曲线的导数方程
        [[nodiscard]] Bezier<N-1> Derivative() const {
            // Note: derivative weights/control points are not actual control points.
            std::array<Point, N> derivativeWeights{};
            for (auto i = 0; i < N; i++) {
                derivativeWeights[i] = (mControlPoints[i+1] - mControlPoints[i]);
                derivativeWeights[i] *= N;
            }
            return Bezier<N-1>(derivativeWeights);
        }

        /**
         * 求这个贝塞尔曲线在t时刻的值
         * @param t
         * @param axis 哪个维度
         * @return
         */
        [[nodiscard]] float ValueAt(float t, size_t axis) const {
            float sum{0.f};
            for (auto i = 0; i < N+1; i++) {
                sum += sBinomialCoefficients[i] * sPolynomialCoefficients[i].valueAt(t) * mControlPoints[i][axis];
            }
            return sum;
        }

        /**
         * 求这个贝塞尔曲线在t时刻的值
         * @param t
         * @return
         */
        [[nodiscard]] Point ValueAt(float t) const {
            return Point{
                    ValueAt(t, 0),
                    ValueAt(t, 1)
            };
        }

        /**
         * 求t处的切线
         * @param t
         * @param normalize
         * @return
         */
        [[nodiscard]] Dir TangentAt(float t, bool normalize = true) const {
            // 求导函数
            Bezier<N-1> derivative = Derivative();
            auto p = derivative.ValueAt(t);
            if (normalize) p = glm::normalize(p);
            return p;
        }

        /**
         * 求t处的法线
         * @param t
         * @param normalize
         * @return
         */
        [[nodiscard]] Dir NormalAt(float t, bool normalize = true) const {
            auto p = TangentAt(t, normalize);
            return Point{-p.y, p.x};
        }

        void Translate(const glm::vec2 &dir) {
            for (auto i = 0; i < N+1; i++) {
                mControlPoints[i] += dir;
            }
        }
        void Translate(float dx, float dy) {
            for (auto i = 0; i < N+1; i++) {
                mControlPoints[i][0] += dx;
                mControlPoints[i][1] += dy;
            }
        }

        void Rotate(float angle, const glm::vec2 &anchor) {
            throw std::runtime_error("暂不支持rotate");
        }

        /**
         * 计算贝塞尔曲线的长度
         * todo 优化
         * @param intervals
         * @return
         */
        [[nodiscard]] float Length(int intervals = 100) const {
            float length = 0.f;
            if (intervals < 0) return length;
            float t = 0.f;
            const float dt = 1.f / float(intervals);
            Point p1{ValueAt(t)}, p2{};
            for (auto i = 0; i < intervals; i++) {
                p2 = ValueAt(t + dt);
                float x = p2.x - p1.x;
                float y = p2.y - p1.y;
                length += sqrt(x * x + y * y);
                p1 = p2;
                t += dt;
            }

            return length;
        }

        /**
         * 切分贝塞尔为两段
         * @param t
         * @param left
         * @param right
         */
        void Split(float t, Bezier<N> &left, Bezier<N> &right) const {
            static std::array<Point, N+1> curr{};
            static std::array<Point, N+1> prev{};

            left[0] = mControlPoints[0];
            right[0] = mControlPoints[N];
            std::memcpy(&prev, &mControlPoints, sizeof(mControlPoints[0]) * mControlPoints.size());

            // de Casteljau: https://pomax.github.io/bezierinfo/#splitting
            for (int subs = 0; subs < N; subs++) {
                for (int i = 0; i < N - subs; i++) {
                    curr[i][0] = (1.f - t) * prev[i][0] + t * prev[i+1][0];
                    curr[i][1] = (1.f - t) * prev[i][1] + t * prev[i+1][1];
                    if (i == 0) {
                        left[subs+1] = curr[i];
                    }
                    if (i == (N - subs - 1)) {
                        right[subs+1] = curr[i];
                    }
                }
                std::swap(prev, curr);
            }
        }

        void Split(Bezier<N> &left, Bezier<N> &right) {
            return Split(.5f, left, right);
        }

        /**
         * 计算长度中点的位置
         * todo 优化性能
         * @param epsilon
         * @param maxDepth
         * @return
         */
        float ArchMidPoint(const float epsilon = 0.001f, const size_t maxDepth = 100) {
            float t = .5f, s = .5f;
            static Bezier<N-1> left, right;

            for (auto i = 0; i < maxDepth; i++) {
                Split(t, left, right);
                float low = left.length();
                float high = right.length();
                float diff = std::abs(high - low);

                if (diff <= epsilon) break;

                s *= 0.5f;
                t += (high > low ? -1.f : 1.f) * s;
            }
            return t;
        }

        Point& operator [](size_t idx) {
            return mControlPoints[idx];
        }

        Point operator [](size_t idx) const {
            return mControlPoints[idx];
        }

        static const BinomialCoefficients<N> sBinomialCoefficients;
        static const PolynomialCoefficients<N> sPolynomialCoefficients;
    protected:
        std::array<Point, N+1> mControlPoints;
    };

    template<size_t N>
    const BinomialCoefficients<N> Bezier<N>::sBinomialCoefficients = BinomialCoefficients<N>();

    template<size_t N>
    const PolynomialCoefficients<N> Bezier<N>::sPolynomialCoefficients = PolynomialCoefficients<N>();

    class CubicBezier final : public Bezier<3> {
    public:
        CubicBezier(): Bezier<3>{}, mAngleTolerance{0.f}, mCuspLimit{0.f} {}
        explicit CubicBezier(std::array<Point, 4> pointList): Bezier<3>{pointList}, mAngleTolerance{0.f}, mCuspLimit{0.f} {}

        void Sample(std::vector<Point> &pointList, float scale = 1.f) {
            float distanceTolerance = sPathDistanceEpsilon / scale;
            distanceTolerance *= distanceTolerance;
            pointList.push_back(mControlPoints[0]);
            RecursiveSample(pointList, mControlPoints[0], mControlPoints[1], mControlPoints[2], mControlPoints[3], distanceTolerance, 0);
            pointList.push_back(mControlPoints[3]);
        }

    private:
        float mAngleTolerance; // 自适应采样的标志位，当这个标志位小于某个值的时候，就不在细分了
        float mCuspLimit; // 三次贝塞尔曲线产生的尖端
        constexpr const static float sPathDistanceEpsilon{1.f}; // 用于估计曲线的平坦程度
        constexpr const static int sRecursionLimit{8}; // 最多递归8次
        constexpr const static float sCurveAngleToleranceEpsilon{0.1};

        void RecursiveSample(std::vector<Point> &pointList, const Point &start, const Point &control1, const Point &control2, const Point &end, float distanceTolerance, int level) const {
            if (level > sRecursionLimit) return;
            const float &x1 = start[0], &y1 = start[1];
            const float &x2 = control1[0], &y2 = control1[1];
            const float &x3 = control2[0], &y3 = control2[1];
            const float &x4 = end[0], &y4 = end[1];

            // 计算所有中点
            float x12 = (x1 + x2) / 2.f;
            float y12 = (y1 + y2) / 2.f;
            float x23 = (x2 + x3) / 2.f;
            float y23 = (y2 + y3) / 2.f;
            float x34 = (x3 + x4) / 2.f;
            float y34 = (y3 + y4) / 2.f;
            float x123 = (x12 + x23) / 2.f;
            float y123 = (y12 + y23) / 2.f;
            float x234 = (x23 + x34) / 2.f;
            float y234 = (y23 + y34) / 2.f;
            float x1234 = (x123 + x234) / 2.f;
            float y1234 = (y123 + y234) / 2.f;

            float dx = x4 - x1;
            float dy = y4 - y1;
            float d2 = std::abs((x2 - x4) * dy - (y2 - y4) * dx);
            float d3 = std::abs((x3 - x4) * dy - (y3 - y4) * dx);
            float da1, da2;

            if (d2 > FLT_EPSILON && d3 > FLT_EPSILON) {
                if((d2 + d3)*(d2 + d3) <= distanceTolerance * (dx*dx + dy*dy)) {
                    if(mAngleTolerance < sCurveAngleToleranceEpsilon) {
                        pointList.emplace_back(x1234, y1234);
                        return;
                    }

                    float a23 = atan2(y3 - y2, x3 - x2);
                    da1 = fabs(a23 - atan2(y2 - y1, x2 - x1));
                    da2 = fabs(atan2(y4 - y3, x4 - x3) - a23);
                    if(da1 >= M_PI) da1 = 2.f * M_PI - da1;
                    if(da2 >= M_PI) da2 = 2.f * M_PI - da2;

                    if(da1 + da2 < mAngleTolerance) {
                        pointList.emplace_back(x1234, y1234);
                        return;
                    }

                    if(mCuspLimit != 0.f) {
                        if(da1 > mCuspLimit) {
                            pointList.emplace_back(x2, y2);
                            return;
                        }

                        if(da2 > mCuspLimit) {
                            pointList.emplace_back(x3, y3);
                            return;
                        }
                    }
                }
            } else if (d2 > FLT_EPSILON) {
                // p1,p3,p4共线
                if(d2 * d2 <= distanceTolerance * (dx*dx + dy*dy)) {
                    if(mAngleTolerance < sCurveAngleToleranceEpsilon) {
                        pointList.emplace_back(x1234, y1234);
                        return;
                    }

                    da1 = fabs(atan2(y3 - y2, x3 - x2) - atan2(y2 - y1, x2 - x1));
                    if(da1 >= M_PI) da1 = 2.f * M_PI - da1;

                    if(da1 < mAngleTolerance) {
                        pointList.emplace_back(x2, y2);
                        pointList.emplace_back(x3, y3);
                        return;
                    }

                    if(mCuspLimit != 0.f) {
                        if(da1 > mCuspLimit) {
                            pointList.emplace_back(x2, y2);
                            return;
                        }
                    }
                }
            } else if (d3 > FLT_EPSILON) {
                // p1,p2,p4共线
                if(d3 * d3 <= distanceTolerance * (dx*dx + dy*dy)) {
                    if(mAngleTolerance < sCurveAngleToleranceEpsilon) {
                        pointList.emplace_back(x1234, y1234);
                        return;
                    }

                    da1 = fabs(atan2(y4 - y3, x4 - x3) - atan2(y3 - y2, x3 - x2));
                    if(da1 >= M_PI) da1 = 2.f * M_PI - da1;

                    if(da1 < mAngleTolerance) {
                        pointList.emplace_back(x2, y2);
                        pointList.emplace_back(x3, y3);
                        return;
                    }

                    if(mCuspLimit != 0.f) {
                        if(da1 > mCuspLimit) {
                            pointList.emplace_back(x3, y3);
                            return;
                        }
                    }
                }
            } else {
                // 共线
                dx = x1234 - (x1 + x4) / 2;
                dy = y1234 - (y1 + y4) / 2;
                if(dx*dx + dy*dy <= distanceTolerance) {
                    pointList.emplace_back(x1234, y1234);
                    return;
                }
            }

            const Point &lStart = start;
            const Point lControl1{x12, y12};
            const Point lControl2{x123, y123};
            const Point lEnd{x1234, y1234};
            const Point &rStart = lEnd;
            const Point rControl1{x234, y234};
            const Point rControl2{x34, y34};
            const Point &rEnd = end;

            RecursiveSample(pointList, lStart, lControl1, lControl2, lEnd, distanceTolerance, level+1);
            RecursiveSample(pointList, rStart, rControl1, rControl2, rEnd, distanceTolerance, level+1);
        }
    };

    class QuadBezier final : public Bezier<2> {
    public:
        QuadBezier(): Bezier<2>{}, mAngleTolerance{0.f} {}
        explicit QuadBezier(std::array<Point, 3> pointList): Bezier<2>{pointList}, mAngleTolerance{0.f} {}

        /**
         * 自适应的采样函数
         * @param pointList
         * @param scale
         */
        void Sample(std::vector<Point> &pointList, float scale = 1.f) {
            float distanceTolerance = sPathDistanceEpsilon / scale;
            distanceTolerance *= distanceTolerance;
            pointList.push_back(mControlPoints[0]);
            RecursiveSample(pointList, mControlPoints[0], mControlPoints[1], mControlPoints[2], distanceTolerance, 0);
            pointList.push_back(mControlPoints[2]);
        }

    private:
        float mAngleTolerance; // 自适应采样的标志位，当这个标志位小于某个值的时候，就不在细分了
        constexpr const static float sPathDistanceEpsilon{1.f}; // 用于估计曲线的平坦程度
        constexpr const static int sRecursionLimit{8}; // 最多递归8次
        constexpr const static float sCurveAngleToleranceEpsilon{0.1};

        void RecursiveSample(std::vector<Point> &pointList, const Point &start, const Point &control, const Point &end, float distanceTolerance, int level) const {
            if (level > sRecursionLimit) return;

            // 计算所有中点
            float x12 = (start[0] + control[0]) / 2.f;
            float y12 = (start[1] + control[1]) / 2.f;
            float x23 = (control[0] + end[0]) / 2.f;
            float y23 = (control[1] + end[1]) / 2.f;
            float x123 = (x12 + x23) / 2.f;
            float y123 = (y12 + y23) / 2.f;

            float dx = end[0] - start[0];
            float dy = end[1] - start[1];
            float d = fabs(((control[0] - end[0]) * dy - (control[1] - end[1]) * dx));
            float da;

            if (d > FLT_EPSILON) {
                if (d * d <= distanceTolerance * (dx * dx + dy * dy)) {
                    // 如果曲率不超过distanceTolerance，就完成细分
                    if (mAngleTolerance < sCurveAngleToleranceEpsilon) {
                        pointList.emplace_back(x123, y123);
                        return;
                    }

                    da = fabs(atan2(end[1] - control[1], end[0] - control[0]) - atan2(control[1] - start[1], control[0] - start[0]));
                    if(da >= M_PI) da = 2.f * M_PI - da;

                    if(da < mAngleTolerance) {
                        pointList.emplace_back(x123, y123);
                        return;
                    }
                }
            } else {
                // 共线
                dx = x123 - (start[0] + end[0]) / 2.f;
                dy = y123 - (start[1] + end[1]) / 2.f;
                if(dx*dx + dy*dy <= distanceTolerance) {
                    pointList.emplace_back(x123, y123);
                    return;
                }
            }

            const Point &lStart = start;
            const Point lControl{x12, y12};
            const Point lEnd{x123, y123};

            const Point &rStart = lEnd;
            const Point rControl{x23, y23};
            const Point &rEnd = end;

            RecursiveSample(pointList, lStart, lControl, lEnd, distanceTolerance, level + 1);
            RecursiveSample(pointList, rStart, rControl, rEnd, distanceTolerance, level + 1);
        }
    };
}

#endif //GLRENDERER_BEZIER_HPP
