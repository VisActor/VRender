//
// Created by ByteDance on 2023/8/15.
//
#include <iostream>
#include "AppWrap.hpp"
#include "Init.hpp"

Napi::Object AppWrap::Init(Napi::Env env, Napi::Object exports) {
    // This method is used to hook the accessor and method callbacks
    Napi::Function func = DefineClass(env, "Application", {
            InstanceMethod<&AppWrap::CreateWindow>("CreateWindow", static_cast<napi_property_attributes>(napi_writable | napi_configurable)),
            InstanceMethod<&AppWrap::SetClearColor>("SetClearColor", static_cast<napi_property_attributes>(napi_writable | napi_configurable)),
            InstanceMethod<&AppWrap::AddLayer>("AddLayer", static_cast<napi_property_attributes>(napi_writable | napi_configurable)),
            InstanceMethod<&AppWrap::Start>("Start", static_cast<napi_property_attributes>(napi_writable | napi_configurable)),
    });

    Napi::FunctionReference *constructor = new Napi::FunctionReference();

    // Create a persistent reference to the class constructor. This will allow
    // a function called on a class prototype and a function
    // called on instance of a class to be distinguished from each other.
    *constructor = Napi::Persistent(func);
    exports.Set("Application", func);

    // Store the constructor as the add-on instance data. This will allow this
    // add-on to support multiple instances of itself running on multiple worker
    // threads, as well as multiple instances of itself running in different
    // contexts on the same thread.
    //
    // By default, the value set on the environment here will be destroyed when
    // the add-on is unloaded using the `delete` operator, but it is also
    // possible to supply a custom deleter.
    env.SetInstanceData<Napi::FunctionReference>(constructor);

    return exports;
}

AppWrap::AppWrap(const Napi::CallbackInfo &callbackInfo):
    ObjectWrap{callbackInfo}, mApplication{nullptr}, mError{0} {
    mApplication = std::make_shared<DarwinApplication>();
    if (mApplication->Init()) {
        std::cout<<"初始化application失败"<<std::endl;
        mError = 1;
    }
    mError = 0;
}

// Create a new item using the constructor stored during Init.
Napi::Value AppWrap::CreateNewItem(const Napi::CallbackInfo &info) {
    // Retrieve the instance data we stored during `Init()`. We only stored the
    // constructor there, so we retrieve it here to create a new instance of the
    // JS class the constructor represents.
    Napi::FunctionReference* constructor =
            info.Env().GetInstanceData<Napi::FunctionReference>();
    return constructor->New({});
}

Napi::Value AppWrap::CreateWindow(const Napi::CallbackInfo &info) {
    auto arg1 = info[0].As<Napi::Number>();
    auto arg2 = info[1].As<Napi::Number>();
    auto arg3 = info[2].As<Napi::String>();
    float width = arg1.FloatValue();
    float height = arg2.FloatValue();
    std::string title = arg3.Utf8Value();
    auto window = mApplication->CreateWindow({width, height, title});
    auto layer = window->AddLayer();
}

Napi::Value AppWrap::Start(const Napi::CallbackInfo &info) {
    if (mApplication == nullptr) {
        std::cout<<"发生错误，找不到application"<<std::endl;
    }
    std::cout<<"start!"<<std::endl;
    int value = info[0].As<Napi::Number>().Uint32Value();
    Napi::Function onStartCb = info[1].As<Napi::Function>();
    Napi::Function onUpdateCb = info[2].As<Napi::Function>();
    mApplication->mOnStart = [&](IApplication *application) {
        onStartCb.Call({Env().Null(), Number::New(Env(), 100)});
        return 0;
    };
    mApplication->mOnUpdate = [&](IApplication *application) {
        Napi::Value ret = onUpdateCb.Call({Env().Null(), Number::New(Env(), 123)});
        if (ret.IsBoolean() && ret.As<Napi::Boolean>().Value()) {
            mApplication->mDrawInThisFrame = true;
        }
        return 0;
    };
//    InitAsyncWork *piWorker = new InitAsyncWork(callback, value);
//    mApplication->mOnStart = [piWorker](IApplication * application) {
//        piWorker->mApplication = std::shared_ptr<IApplication>(application);
//        piWorker->Queue();
//        return 0;
//    };
    mApplication->Start();
}

Napi::Value AppWrap::SetClearColor(const Napi::CallbackInfo &info) {
    auto r = info[0].As<Napi::Number>().FloatValue();
    auto g = info[1].As<Napi::Number>().FloatValue();
    auto b = info[2].As<Napi::Number>().FloatValue();
    auto a = info[3].As<Napi::Number>().FloatValue();
    mApplication->mWindow->SetClearColor(r, g, b, a);
}

Napi::Value AppWrap::AddLayer(const Napi::CallbackInfo &info) {
    mApplication->mWindow->AddLayer();
}
