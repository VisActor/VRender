//
// Created by ByteDance on 2023/8/4.
//

#ifndef VRENDER_GPU_IWINDOW_HPP
#define VRENDER_GPU_IWINDOW_HPP

#include "Type.hpp"
#include "Layer.hpp"
#include "Renderer.hpp"
#include "ILight.hpp"

class IWindow {
public:
    virtual ~IWindow() = default;
    virtual int Init(const WindowConf &conf) = 0;
    virtual void Destroy() = 0;
    virtual void Resize(const int &width, const int &height) = 0;
    virtual void GetSize(int *width, int *height) = 0;
    virtual void SwapFrame() = 0;
    virtual void ApplyEvent() = 0;
    virtual bool IsDestroyed() = 0;
    virtual int GetId() = 0;
    virtual void SetId(const int &id) = 0;
    virtual void SetClearColor(float r, float g, float b, float a) = 0;

    virtual std::shared_ptr<Layer> AddLayer() = 0;
    virtual void RenderAllLayer() = 0;
    virtual float GetDpr() = 0; // 获取dpr
    virtual float GetRenderDpr() = 0; // 获取dpr
    [[nodiscard]] virtual const Renderer& GetRenderer() const = 0;

    // 光源
    inline void AddLight(const std::shared_ptr<ILight> &light) { mLights.push_back(light); };
    inline std::vector<std::shared_ptr<ILight>> GetLights() { return mLights; }

    // 摄像机
    inline void SetCamera(const std::shared_ptr<ICamera> &camera) { mCamera = camera; };
    inline std::shared_ptr<ICamera> GetCamera() { return mCamera; };

    glm::vec4 mClearColor;

protected:
    IWindow(): mId{sId++}, mLights{}, mClearColor{1.f}, mCamera{nullptr} {}
    int mId;
    std::vector<std::shared_ptr<ILight>> mLights;
    std::shared_ptr<ICamera> mCamera;

private:
    static int sId;
};

#endif //VRENDER_GPU_IWINDOW_HPP
