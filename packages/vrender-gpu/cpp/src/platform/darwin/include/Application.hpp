//
// Created by bytedance on 2021/3/6.
//

#ifndef GLRENDERER_APPLICATION_HPP
#define GLRENDERER_APPLICATION_HPP

#include "IApplication.hpp"
#include "Window.hpp"

class DarwinApplication final: public IApplication {
public:
    DarwinApplication(): IApplication{Platform::Darwin}, mExit{false}, mWindow{nullptr} {};
    ~DarwinApplication() override = default;
    int Init() override;
    void Destroy() override;
    IWindow* CreateWindow(const WindowConf &conf) override;
    void Start() override;

    DarwinWindow* mWindow;
private:
    bool mExit;
};

#endif //GLRENDERER_APPLICATION_HPP
