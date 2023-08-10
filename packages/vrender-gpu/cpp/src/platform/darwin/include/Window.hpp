//
// Created by bytedance on 2021/3/6.
//

#ifndef GLRENDERER_WINDOW_HPP
#define GLRENDERER_WINDOW_HPP

// 注：glad必须放在GLFW的上面
#include "GL.hpp"
#include <glm/vec4.hpp>
#include <GLFW/glfw3.h>
#include <Layer.hpp>
#include "Renderer.hpp"
#include "ResourceManager.hpp"
#include "IWindow.hpp"

class DarwinWindow final: public IWindow {
public:
    DarwinWindow(): IWindow{}, mGLFWWindow{nullptr}, mInited{false}, mWidth{0}, mHeight{0}, mDpr{1.f},
        mDestroyed{false}, mClearColor({1.f, 1.f, 1.f, 1.f}), mRenderThisFrame{true},
        mResourceManager{std::make_shared<ResourceManager>()} {
    };
    ~DarwinWindow() override = default;
    int Init(const WindowConf &conf) override;
    void Destroy() override;
    void Resize(const int &width, const int &height) override;
    void GetSize(int *width, int *height) override;
    void SwapFrame() override;
    void ApplyEvent() override;
    int GetId() override;
    void SetId(const int &id) override;
    bool IsDestroyed() override;
    void SetClearColor(float r, float g, float b, float a) override;
    std::shared_ptr<Layer> AddLayer() override;
    void RenderAllLayer() override;
    float GetDpr() override;
    float GetRenderDpr() override;

    [[nodiscard]] const Renderer& GetRenderer() const override;

private:
    int InitResourceManager(const std::vector<std::string> &shaderLists);
    GLFWwindow *mGLFWWindow;
    float mWidth;
    float mHeight;
    float mDpr;
    std::string mTitle;
    bool mInited;
    bool mDestroyed;
    glm::vec4 mClearColor;
    bool mRenderThisFrame;

    Renderer mRenderer;
    std::shared_ptr<ResourceManager> mResourceManager;

    // layer列表
    std::vector<std::shared_ptr<Layer>> mLayerList;

    int InitGlad();
};

#endif //GLRENDERER_WINDOW_HPP
