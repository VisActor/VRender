//
// Created by ByteDance on 2023/8/15.
//

#ifndef VRENDER_GPU_APPWRAP_HPP
#define VRENDER_GPU_APPWRAP_HPP

#include <napi.h>
#include "Application.hpp"
#include "WindowWrap.hpp"

class AppWrap: public Napi::ObjectWrap<AppWrap> {
public:
    static Napi::Object Init(Napi::Env env, Napi::Object exports);
    AppWrap(const Napi::CallbackInfo &callbackInfo);
    static Napi::Value CreateNewItem(const Napi::CallbackInfo& info);
private:
    Napi::Value CreateWindow(const Napi::CallbackInfo& info);
    Napi::Value Start(const Napi::CallbackInfo& info);
    Napi::Value RunFrame(const Napi::CallbackInfo& info);
    Napi::Value SetClearColor(const Napi::CallbackInfo &info);
    Napi::Value AddLayer(const Napi::CallbackInfo &info);
    std::shared_ptr<DarwinApplication> mApplication;
    int mError;
//    std::shared_ptr<WindowWrap> mWindowWrap;
};

#endif //VRENDER_GPU_APPWRAP_HPP
