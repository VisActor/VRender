//
// Created by bytedance on 2021/3/6.
//
#include "GL.hpp"
#include <GLFW/glfw3.h>
#include <iostream>
#include "Window.hpp"

int IWindow::sId = 0;

void framebuffer_size_callback(GLFWwindow* window, int width, int height) {
    glViewport(0, 0, width, height);
}

int DarwinWindow::Init(const WindowConf &conf) {

    if (!glfwInit()) {
        std::cout<<"初始化glfw失败\n";
        return -1;
    }

    mWidth = conf.width;
    mHeight = conf.height;
    mTitle = conf.title;

    glfwWindowHint(GLFW_CONTEXT_VERSION_MAJOR, 3);
    glfwWindowHint(GLFW_CONTEXT_VERSION_MINOR, 3);
    glfwWindowHint(GLFW_OPENGL_PROFILE, GLFW_OPENGL_CORE_PROFILE);
    glfwWindowHint(GLFW_OPENGL_FORWARD_COMPAT, GL_TRUE); // uncomment this statement to fix compilation on OS X

    // 创建window
    auto window = glfwCreateWindow(conf.width, conf.height, conf.title.c_str(), nullptr, nullptr);

    if (window == nullptr) {
        std::cout<<"window创建失败";
        glfwTerminate();
        return -2;
    }

    glfwMakeContextCurrent(window);
    glfwSetFramebufferSizeCallback(window, framebuffer_size_callback);
//    glfwSetInputMode(window, GLFW_CURSOR, GLFW_CURSOR_DISABLED);

    InitGlad();

    // 初始化资源
    InitResourceManager({});

    // 获取dpr
    int physicalWidth, physicalHeight;
    GLFWmonitor* primary = glfwGetPrimaryMonitor();
    glfwGetMonitorPhysicalSize(primary, &physicalWidth, &physicalHeight);
    mDpr = float(mWidth) / float(physicalWidth);

    mGLFWWindow = window;
    mInited = true;

    mRenderer.Init();

    return 0;
}

void DarwinWindow::Destroy() {
//    glfwSetWindowShouldClose(mGLFWWindow, true);
    glfwDestroyWindow(mGLFWWindow);
    mDestroyed = true;
}

void DarwinWindow::Resize(const int &width, const int &height) {
    glfwSetWindowSize(mGLFWWindow, width, height);
    mWidth = width; mHeight = height;
}

void DarwinWindow::GetSize(int *width, int *height) {
    *width = mWidth; *height = mHeight;
}

void DarwinWindow::SwapFrame() {
    // glClearColor(mClearColor.r, mClearColor.g, mClearColor.b, mClearColor.a);
    // glClear(GL_COLOR_BUFFER_BIT);

    glfwSwapBuffers(mGLFWWindow);
    glfwPollEvents();
}

void DarwinWindow::ApplyEvent() {
    glfwPollEvents();
}

bool DarwinWindow::IsDestroyed() {
    if (glfwWindowShouldClose(mGLFWWindow)) {
        Destroy();
    }
    return mDestroyed;
}

void DarwinWindow::SetClearColor(float r, float g, float b, float a) {
    mClearColor.r = r;
    mClearColor.g = g;
    mClearColor.b = b;
    mClearColor.a = a;
}

int DarwinWindow::GetId() {
    return mId;
}

void DarwinWindow::SetId(const int &id) {
    mId = id;
}

int DarwinWindow::InitGlad() {
    if (!gladLoadGLLoader((GLADloadproc)glfwGetProcAddress)) {
#ifdef DEBUG
        throw std::runtime_error("Failed to initialize GLAD");
#else
        return -1;
#endif
    }
    return 0;
}

int DarwinWindow::InitResourceManager(const std::vector<std::string> &shaderLists) {
    if (!mResourceManager) throw std::runtime_error("资源管理模块不存在");
    for (const auto &shaderName : shaderLists) {
        mResourceManager->LoadShader(shaderName);
    }
    return 0;
}

std::shared_ptr<Layer> DarwinWindow::AddLayer() {
    auto layer = std::make_shared<Layer>(mWidth, mHeight, mResourceManager);
    layer->SetClearColor(mClearColor);
    layer->SetDpr(GetDpr());
    layer->SetRenderDpr(GetRenderDpr());
    mLayerList.push_back(layer);
    return layer;
}

void DarwinWindow::RenderAllLayer() {
//    mRenderer.RenderInThread(mLayerList);
    mRenderer.Render(mLayerList);
}

float DarwinWindow::GetDpr() {
    return mDpr;
}
float DarwinWindow::GetRenderDpr() {
    return 1.2;
}

const Renderer & DarwinWindow::GetRenderer() const {
    return mRenderer;
}
