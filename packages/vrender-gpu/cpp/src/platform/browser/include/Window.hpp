//
// Created by ByteDance on 2023/8/11.
//

#ifndef VRENDER_GPU_WINDOW_HPP
#define VRENDER_GPU_WINDOW_HPP

#include <vector>
#include <emscripten.h>
//#include <emscripten/val.h>
#include <emscripten/html5.h>
#include <emscripten/bind.h>
#include "IWindow.hpp"
#include "glm/vec4.hpp"
#include "IWindow.hpp"
#include "ResourceManager.hpp"
#include "Renderer.hpp"

class BrowserWindow final: public IWindow {
public:
    BrowserWindow(): IWindow(), mInited{false}, mWidth{0.f}, mHeight{0.f}, mDestroyed{false}, mContext{0}, mResourceManager{std::make_shared<ResourceManager>()},
                     mClearColor({1.f, 1.f, 1.f, 1.f}), mCanvasId{sCanvasPrefix+std::to_string(mId)}, mDpr{1.f},
                     mRenderer{} {};
    ~BrowserWindow() override = default;
    int Init(const WindowConf &conf) override; // 会初始化并创建canvas
    int InitWithoutCreate(const WindowConf &conf); // 并不创建canvas，只是绑定canvas
    void Destroy() override;
    void Resize(const int &width, const int &height) override;
    void GetSize(int *width, int *height) override;
    inline int GetId() override;
    inline void SetId(const int &id) override;
    void SwapFrame() override;
    void ApplyEvent() override;
    inline bool IsDestroyed() override;
    void SetClearColor(float r, float g, float b, float a) override;

    inline std::string GetCanvasId();
    void SetCanvasId(std::string canvasId);

    void InitContext();
    void MakeContextCurrent() const;

    void RenderAllLayer() override;
    std::shared_ptr<Layer> AddLayer() override;

    float GetDpr() override;
    float GetRenderDpr() override;
    const Renderer & GetRenderer() const override;

    glm::vec4 mClearColor;

private:
    int InitResourceManager(const std::vector<std::string> &shaderLists);
    float mWidth;
    float mHeight;
    float mDpr;
    std::string mTitle;
    bool mInited;
    bool mDestroyed;
    EMSCRIPTEN_WEBGL_CONTEXT_HANDLE mContext;
    std::string mCanvasId;

    Renderer mRenderer;
    std::shared_ptr<ResourceManager> mResourceManager;

    // layer列表
    std::vector<std::shared_ptr<Layer>> mLayerList;

    static std::string sCanvasPrefix;
};

#endif //VRENDER_GPU_WINDOW_HPP
