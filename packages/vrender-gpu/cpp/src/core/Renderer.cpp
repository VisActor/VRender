//
// Created by ByteDance on 2023/8/10.
//
#include <thread>
#include "Renderer.hpp"
#include "Tools.hpp"
#include "PerspectiveCamera.hpp"

void Renderer::Init() {
    mCamera = std::make_shared<PerspectiveCamera>(glm::radians(45.0f), 800.0f / 600.0f, 0.1f, 100.0f);
}

void Renderer::Render(std::vector<std::shared_ptr<Layer>> &layerList) {
    assert(layerList.size() == 1);
    ConsoleTime(true, "编译着色器 ");
    // Debug使用，用来移除着色器对耗时的影响，预编译
    Time(true);
    layerList[0]->PreCompileAllShader();
    mPerformance.compileShaderTime = std::max(Time(false), mPerformance.compileShaderTime);
    ConsoleTime(false, "编译着色器 ");
    ConsoleTime(true, "BuildLayer ");
    Time(true);
    BuildLayer(layerList[0]);
    mPerformance.buildLayerTime = std::max(Time(false), mPerformance.buildLayerTime);
    ConsoleTime(false, "BuildLayer ");
    ConsoleTime(true, "Draw ");
    Time(true);
    Draw(layerList[0]);
    mPerformance.drawTime = Time(false);
    ConsoleTime(false, "Draw ");
}

/**
 * 这个函数只能在主线程中调用
 * @param layerList
 */
void Renderer::RenderInThread(std::vector<std::shared_ptr<Layer>> &layerList) {
    assert(layerList.size() == 1);
    ConsoleTime(true, "并行build以及构建着色器");
    /* 并行支持 */
    // WASM使用自旋锁会产生忙等的情况，后续排查原因
    layerList[0]->BuildInThread(Layer::MUTEX_TYPE::HANG);
    // 着色器需要在主线程中编译
    layerList[0]->PreCompileAllShader();
    /* 并行支持 */
    layerList[0]->WaitForBuild(Layer::MUTEX_TYPE::HANG);
    ConsoleTime(false, "并行build以及构建着色器");

    Draw(layerList[0]);
}

void Renderer::BuildLayer(std::shared_ptr<Layer> &layer) {
    layer->Build();
}

void Renderer::Draw(std::shared_ptr<Layer> &layer) {
    layer->Draw(mCamera);
}
