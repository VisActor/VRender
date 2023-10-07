//
// Created by ByteDance on 2023/8/11.
//
#include "Window.hpp"
#include <GLES2/gl2.h>
#include <vector>
#include <thread>

extern "C" {
//emscripten::val window = emscripten::val::global("window");
extern void createWindow(float x, float y, float w, float h, int id);
}

std::string BrowserWindow::sCanvasPrefix{"vrender_"};

int IWindow::sId = 0;

int BrowserWindow::Init(const WindowConf &conf) {
    createWindow(0, 0, conf.width, conf.height, mId);
    mWidth = conf.width;
    mHeight = conf.height;

    emscripten::val window = emscripten::val::global("window");
    mDpr = window["devicePixelRatio"].as<float>();
    mRenderer.Init();
    return 0;
}

int BrowserWindow::InitWithoutCreate(const WindowConf &conf) {
    mWidth = conf.width;
    mHeight = conf.height;
    emscripten::val window = emscripten::val::global("window");
    mDpr = window["devicePixelRatio"].as<float>();

    return 0;
}

void BrowserWindow::InitContext() {
    EmscriptenWebGLContextAttributes attrs{};
    attrs.explicitSwapControl = 0;
    attrs.depth = 1;
    attrs.stencil = 1;
    attrs.antialias = 1;
    attrs.majorVersion = 2;
    attrs.minorVersion = 0;

    std::cout<<mCanvasId.c_str()<<std::endl;
    std::string cid = "#"+mCanvasId;
    mContext = emscripten_webgl_create_context(cid.c_str(), &attrs);
    if (mContext == 0) {
        throw std::runtime_error("获取context发生错误");
    }
    MakeContextCurrent();

    InitResourceManager({"default"});

    glClearColor(mClearColor.r, mClearColor.g, mClearColor.b, mClearColor.a);
    glClear(GL_COLOR_BUFFER_BIT);
}

int BrowserWindow::InitResourceManager(const std::vector<std::string> &shaderLists) {
    for (const auto &shaderName : shaderLists) {
        mResourceManager->LoadShader(shaderName);
    }
    return 0;
}

void BrowserWindow::MakeContextCurrent() const {
    emscripten_webgl_make_context_current(mContext);
}

void BrowserWindow::Destroy() {
    mDestroyed = true;
}

void BrowserWindow::Resize(const int &width, const int &height) {
    mWidth = width; mHeight = height;
}

void BrowserWindow::GetSize(int *width, int *height) {
    *width = mWidth; *height = mHeight;
}

bool BrowserWindow::IsDestroyed() {
    return mDestroyed;
}

void BrowserWindow::SetClearColor(float r, float g, float b, float a) {
    std::cout<<r<<g<<b<<a<<std::endl;
    mClearColor.r = r;
    mClearColor.g = g;
    mClearColor.b = b;
    mClearColor.a = a;
}

int BrowserWindow::GetId() {
    return mId;
}

void BrowserWindow::SetId(const int &id) {
    mId = id;
}

void BrowserWindow::SetCanvasId(std::string canvasId) {
    mCanvasId = std::move(canvasId);
}

std::string BrowserWindow::GetCanvasId() {
    return mCanvasId;
}

void BrowserWindow::SwapFrame() {
    glClearColor(mClearColor.r, mClearColor.g, mClearColor.b, mClearColor.a);
    glClear(GL_COLOR_BUFFER_BIT);
}

void BrowserWindow::ApplyEvent() {
    return;
}

std::shared_ptr<Layer> BrowserWindow::AddLayer() {
    auto layer = std::make_shared<Layer>(mWidth, mHeight, mResourceManager);
    layer->SetDpr(GetDpr());
    layer->SetRenderDpr(GetRenderDpr());
    mLayerList.push_back(layer);
    return layer;
}

void BrowserWindow::RenderAllLayer() {
//    mRenderer.RenderInThread(mLayerList);
    mRenderer.Render(mLayerList);
}

float BrowserWindow::GetDpr() {
    return mDpr;
}

float BrowserWindow::GetRenderDpr() {
    return mDpr;
}

const Renderer & BrowserWindow::GetRenderer() const {
    return mRenderer;
}