//
// Created by ByteDance on 2023/8/11.
//
#ifndef EM_PORT_API
#   if defined(__EMSCRIPTEN__)
#       include <emscripten.h>

#       if defined(__cplusplus)
#           define EM_PORT_API(rettype) extern "C" rettype EMSCRIPTEN_KEEPALIVE
#       else
#           define EM_PORT_API(rettype) rettype EMSCRIPTEN_KEEPALIVE
#       endif
#   else
#       if defined(__cplusplus)
#           define EM_PORT_API(rettype) extern "C" rettype
#       else
#           define EM_PORT_API(rettype) rettype
#       endif
#   endif
#endif
#include <cstddef>
#include <cstdlib>
#include "Window.hpp"
#include "Layer.hpp"

extern "C" {
EM_PORT_API(int) getNum();
EM_PORT_API(unsigned char*) createBuffer(size_t size);
EM_PORT_API(void) freeBuffer(void *ptr);
EM_PORT_API(void) callJS(void);
extern void testExternalJSMethod();

/* window API */
// 创建一个浏览器窗口，会自动创建一个canvas
EM_PORT_API(BrowserWindow*) createBrowserWindow(float x, float y, float w, float h);
// 使用已有的canvas创建一个Window对象
EM_PORT_API(BrowserWindow*) createBrowserWindowWithCanvas(BrowserWindow *window, float w, float h, const char *id);
// 初始化上下文，会设置clearColor
EM_PORT_API(void) initContext(BrowserWindow *window, const char *id);
// 激活当前的window，也就是将上下文设置到当前window上（这个逻辑和OpenGL类似emscripten_webgl_make_context_current，和WebGL逻辑不同）
EM_PORT_API(void) active(BrowserWindow *window);
// 设置window的ClearColor
EM_PORT_API(void) setClearColor(BrowserWindow *window, float r, float g, float b, float a);
/* window API */

/* layer API */
// 创建一个layer
EM_PORT_API(Layer*) addLayer(BrowserWindow* window);
EM_PORT_API(int) testLayer(Layer* layer);
/* layer API */

/* render API */
EM_PORT_API(void) drawWindow(BrowserWindow *window);
/* render API */
}

extern "C" {
EM_PORT_API(int) getNum() {
    return 2;
}
EM_PORT_API(unsigned char*) createBuffer(size_t size) {
    return (unsigned char*)malloc(size);
}
EM_PORT_API(void) freeBuffer(void *ptr) {
    return free(ptr);
}
EM_PORT_API(void) callJS(void) {
    testExternalJSMethod();
}

EM_PORT_API(BrowserWindow*) createBrowserWindow(float x, float y, float w, float h) {
    auto *window = new BrowserWindow();
    window->Init({ w, h, "这是标题" });
    return window;
}

EM_PORT_API(BrowserWindow*) createBrowserWindowWithCanvas(BrowserWindow *window, float w, float h, const char *id) {
    window->InitWithoutCreate({w, h, "这是标题"});
    window->SetCanvasId(std::string(id));
}

EM_PORT_API(void) initContext(BrowserWindow *window, const char *id) {
    if (id != nullptr) {
        window->SetCanvasId(std::string(id));
    }
    window->InitContext();
}

EM_PORT_API(void) active(BrowserWindow *window) {
    window->MakeContextCurrent();
}

EM_PORT_API(void) setClearColor(BrowserWindow *window, float r, float g, float b, float a) {
    window->SetClearColor(r, g, b, a);
}

EM_PORT_API(Layer*) addLayer(BrowserWindow* window) {
    auto layer = window->AddLayer();
    return layer.get();
}
EM_PORT_API(int) testLayer(Layer* layer) {
    return layer->ID() + 10086;
}
EM_PORT_API(void) drawWindow(BrowserWindow *window) {
    if (window->IsDestroyed()) return;
    window->SwapFrame();
    window->RenderAllLayer();
}
}