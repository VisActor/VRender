//
// Created by bytedance on 2021/3/6.
//
#include "GL.hpp"
#include <GLFW/glfw3.h>
#include "Application.hpp"

int DarwinApplication::Init() {
    if (mOnInit != nullptr) {
        mOnInit(this);
    }
    mResourceManager = std::make_shared<ResourceManager>();
    mAnimateTicker = std::make_shared<AnimateTicker>();
    return 0;
}

void DarwinApplication::Destroy() {
    if (mWindow) {
        if (mOnRelease) {
            mOnRelease(this);
        }
        mWindow->Destroy();
        glfwTerminate(); // 销毁所有的窗口
    }
}

std::shared_ptr<ResourceManager> DarwinApplication::GetResourceManager() {
    return mResourceManager;
}

IWindow * DarwinApplication::CreateWindow(const WindowConf &conf) {
    mWindow = new DarwinWindow();
    mWindow->Init(conf);
    mWindow->SetTicker(mAnimateTicker);
    return mWindow;
}

bool DarwinApplication::RunFrame() {
    if (mWindow->IsDestroyed()) return false;
    mAnimateTicker->Tick(glfwGetTime() * 1000);
    mWindow->RenderAllLayer();
    mWindow->SwapFrame();
    return true;
}

void DarwinApplication::Start() {
    if (mOnStart) {
        mOnStart(this);
    }
    while(!mExit) {
        if (mOnUpdate) {
            mOnUpdate(this);
        }
        if (mWindow->IsDestroyed()) break;
        mAnimateTicker->Tick(glfwGetTime() * 1000);
        if (mDrawInThisFrame) {
            mWindow->RenderAllLayer();
            mWindow->SwapFrame();
        } else {
            mWindow->ApplyEvent();
        }
        mDrawInThisFrame = false;
    }
}
