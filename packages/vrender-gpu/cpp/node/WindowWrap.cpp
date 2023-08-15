////
//// Created by ByteDance on 2023/8/15.
////
//#include "WindowWrap.hpp"
//
//Napi::Object WindowWrap::Init(Napi::Env env, Napi::Object exports) {
//    // This method is used to hook the accessor and method callbacks
//    Napi::Function func = DefineClass(env, "Window", {
//            InstanceMethod<&WindowWrap::SetClearColor>("SetClearColor", static_cast<napi_property_attributes>(napi_writable | napi_configurable)),
//            InstanceMethod<&WindowWrap::AddLayer>("AddLayer", static_cast<napi_property_attributes>(napi_writable | napi_configurable)),
//            StaticMethod<&WindowWrap::CreateNewItem>("CreateNewItem", static_cast<napi_property_attributes>(napi_writable | napi_configurable)),
//    });
//
//    Napi::FunctionReference *constructor = new Napi::FunctionReference();
//
//    // Create a persistent reference to the class constructor. This will allow
//    // a function called on a class prototype and a function
//    // called on instance of a class to be distinguished from each other.
//    *constructor = Napi::Persistent(func);
//
//    // Store the constructor as the add-on instance data. This will allow this
//    // add-on to support multiple instances of itself running on multiple worker
//    // threads, as well as multiple instances of itself running in different
//    // contexts on the same thread.
//    //
//    // By default, the value set on the environment here will be destroyed when
//    // the add-on is unloaded using the `delete` operator, but it is also
//    // possible to supply a custom deleter.
//    env.SetInstanceData<Napi::FunctionReference>(constructor);
//
//    return exports;
//}
//
//WindowWrap::WindowWrap(const Napi::CallbackInfo &callbackInfo)
//        : ObjectWrap{callbackInfo}, mError{0} {
//
//}
//
//Napi::Value WindowWrap::CreateNewItem(const Napi::CallbackInfo &info) {
//    // Retrieve the instance data we stored during `Init()`. We only stored the
//    // constructor there, so we retrieve it here to create a new instance of the
//    // JS class the constructor represents.
//    Napi::FunctionReference* constructor =
//            info.Env().GetInstanceData<Napi::FunctionReference>();
//    return constructor->New({ window });
//}
//
//Napi::Value WindowWrap::SetClearColor(const Napi::CallbackInfo &info) {
//    auto r = info[0].As<Napi::Number>();
//    auto g = info[1].As<Napi::Number>();
//    auto b = info[2].As<Napi::Number>();
//    auto a = info[3].As<Napi::Number>();
//    mWindow->SetClearColor(r, g, b, a);
//}
//
//Napi::Value WindowWrap::AddLayer(const Napi::CallbackInfo &info) {
//    mWindow->AddLayer();
//}
