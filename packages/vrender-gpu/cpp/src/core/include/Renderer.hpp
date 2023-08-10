//
// Created by ByteDance on 2023/8/10.
//

#ifndef VRENDER_GPU_RENDER_HPP
#define VRENDER_GPU_RENDER_HPP

#include "Layer.hpp"

struct Performance {
    float compileShaderTime{0.f};
    float buildLayerTime{0.f};
    float drawTime{0.f};
};

class Renderer {
public:
    void Render(std::vector<std::shared_ptr<Layer>> &layerList);
    void RenderInThread(std::vector<std::shared_ptr<Layer>> &layerList);

    Performance mPerformance{};

private:
    void BuildLayer(std::shared_ptr<Layer> &layer);
//    std::thread BuildLayerInThread(std::shared_ptr<Layer> &layer);
    void Draw(std::shared_ptr<Layer> &layer);
};

#endif //VRENDER_GPU_RENDER_HPP
