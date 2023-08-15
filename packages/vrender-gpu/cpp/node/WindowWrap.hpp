////
//// Created by ByteDance on 2023/8/15.
////
//
//#ifndef VRENDER_GPU_WINDOWWRAP_HPP
//#define VRENDER_GPU_WINDOWWRAP_HPP
//
//#include <napi.h>
//#include "Window.hpp"
//
//class WindowWrap: public Napi::ObjectWrap<WindowWrap> {
//public:
//    static Napi::Object Init(Napi::Env env, Napi::Object exports);
//    WindowWrap(const Napi::CallbackInfo &callbackInfo);
//    static Napi::Value CreateNewItem(const Napi::CallbackInfo& info);
//private:
//    Napi::Value SetClearColor(const Napi::CallbackInfo& info);
//    Napi::Value AddLayer(const Napi::CallbackInfo& info);
//    IWindow *mWindow;
//    int mError{};
//};
//
//#endif //VRENDER_GPU_WINDOWWRAP_HPP
