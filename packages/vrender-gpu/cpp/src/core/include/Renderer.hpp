//
// Created by ByteDance on 2023/8/10.
//

#ifndef VRENDER_GPU_RENDER_HPP
#define VRENDER_GPU_RENDER_HPP

#include "Layer.hpp"
#include "PerspectiveCamera.hpp"
#include "ILight.hpp"
#include "AnimateTicker.hpp"

struct Performance {
    float compileShaderTime{0.f};
    float buildLayerTime{0.f};
    float drawTime{0.f};
};

class Renderer {
public:
    Renderer() {};
    void Init();
    void Render(std::vector<std::shared_ptr<Layer>> &layerList, std::shared_ptr<ICamera> &camera, std::vector<std::shared_ptr<ILight>> &light, const std::shared_ptr<AnimateTicker> &ticker);
    void RenderInThread(std::vector<std::shared_ptr<Layer>> &layerList, std::shared_ptr<ICamera> &camera, std::vector<std::shared_ptr<ILight>> &light, const std::shared_ptr<AnimateTicker> &ticker);

    Performance mPerformance{};

private:
    void BuildLayer(std::shared_ptr<Layer> &layer, const std::shared_ptr<AnimateTicker> &ticker);
//    std::thread BuildLayerInThread(std::shared_ptr<Layer> &layer);
    void Draw(std::shared_ptr<Layer> &layer, std::shared_ptr<ICamera> &camera, std::vector<std::shared_ptr<ILight>> &light, const std::shared_ptr<AnimateTicker> &ticker);

};

#endif //VRENDER_GPU_RENDER_HPP
