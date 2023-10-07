//
// Created by bytedance on 2021/3/6.
//
#include "GL.hpp"
#include <GLFW/glfw3.h>
#include "Application.hpp"

int BrowserApplication::Init() {
    if (mOnInit != nullptr) {
        mOnInit(this);
    }
    mResourceManager = std::make_shared<ResourceManager>();
    return 0;
}

void BrowserApplication::Destroy() {
    if (mWindow) {
        if (mOnRelease) {
            mOnRelease(this);
        }
        mWindow->Destroy();
        glfwTerminate(); // 销毁所有的窗口
    }
}

IWindow * BrowserApplication::CreateWindow(const WindowConf &conf) {
    mWindow = new BrowserWindow();
    mWindow->Init(conf);
    return mWindow;
}

bool BrowserApplication::RunFrame() {
    if (mWindow->IsDestroyed()) return false;
    mWindow->RenderAllLayer();
    mWindow->SwapFrame();
    return true;
}

void BrowserApplication::Start() {
    if (mOnStart) {
        mOnStart(this);
    }
    while(!mExit) {
        if (mOnUpdate) {
            mOnUpdate(this);
        }
        if (mWindow->IsDestroyed()) break;
        if (mDrawInThisFrame) {
            mWindow->RenderAllLayer();
            mWindow->SwapFrame();
        } else {
            mWindow->ApplyEvent();
        }
        mDrawInThisFrame = false;
    }
}

std::shared_ptr<ResourceManager> BrowserApplication::GetResourceManager() {
    return mResourceManager;
}
