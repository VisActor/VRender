//
// Created by bytedance on 2021/3/6.
//

#ifndef GLRENDERER_APPLICATION_HPP
#define GLRENDERER_APPLICATION_HPP

#include "IApplication.hpp"
#include "Window.hpp"

class BrowserApplication final: public IApplication {
public:
    BrowserApplication(): IApplication{Platform::Darwin}, mExit{false}, mWindow{nullptr} {};
    ~BrowserApplication() override = default;
    int Init() override;
    void Destroy() override;
    IWindow* CreateWindow(const WindowConf &conf) override;
    void Start() override;
    bool RunFrame() override;
    std::shared_ptr<ResourceManager> GetResourceManager() override;

    BrowserWindow* mWindow;
private:
    bool mExit;
};

#endif //GLRENDERER_APPLICATION_HPP
