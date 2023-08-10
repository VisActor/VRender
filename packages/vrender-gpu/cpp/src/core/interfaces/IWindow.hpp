//
// Created by ByteDance on 2023/8/4.
//

#ifndef VRENDER_GPU_IWINDOW_HPP
#define VRENDER_GPU_IWINDOW_HPP

#include "Type.hpp"
#include "Layer.hpp"
#include "Renderer.hpp"

class IWindow {
public:
    IWindow(): mId{sId++} {}
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


protected:
    int mId;
private:
    static int sId;
};

#endif //VRENDER_GPU_IWINDOW_HPP
