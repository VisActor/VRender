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

IWindow * DarwinApplication::CreateWindow(const WindowConf &conf) {
    mWindow = new DarwinWindow();
    mWindow->Init(conf);
    return mWindow;
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
        if (mDrawInThisFrame) {
            mWindow->RenderAllLayer();
            mWindow->SwapFrame();
        } else {
            mWindow->ApplyEvent();
        }
        mDrawInThisFrame = false;
    }
}
