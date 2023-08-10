#include <napi.h>
#include "Application.hpp"

int abc() {
    auto *application = new DarwinApplication();
    if (application->Init()) {
        std::cout<<"初始化application失败"<<std::endl;
    }
    auto *window = application->CreateWindow({1200, 600, "这是标题"});
    window->SetClearColor(1, 1, 1, 1);
    auto layer = window->AddLayer();
    while(true) {
        if (window->IsDestroyed()) break;
        window->SetClearColor(Random(0.f, 1.f), Random(0.f, 1.f), Random(0.f, 1.f), 1.f);
        window->RenderAllLayer();
        window->SwapFrame();
//        const auto &renderer = window->GetRenderer();
//        needUpdateLabel = false;
//        if (compileShaderTime != renderer.mPerformance.compileShaderTime) {
//            compileShaderTime = renderer.mPerformance.compileShaderTime;
//            needUpdateLabel = true;
//        }
//        if (buildLayerTime != renderer.mPerformance.buildLayerTime) {
//            buildLayerTime = renderer.mPerformance.buildLayerTime;
//            needUpdateLabel = true;
//        }
//        if (drawTime != renderer.mPerformance.drawTime) {
//            drawTime = renderer.mPerformance.drawTime;
//            needUpdateLabel = true;
//        }
//        label->SetText("机器语言，单线程，shader:" +
//            std::to_string(compileShaderTime) + "ms，build:" +
//            std::to_string(buildLayerTime) + "ms，render:" +
//            std::to_string(drawTime) + "ms");
    }
    return 0;
}


static Napi::String Method(const Napi::CallbackInfo& info) {
  // Napi::Env is the opaque data structure containing the environment in which the request is being run. 
  // We will need this env when we want to create any new objects inside of the node.js environment
  Napi::Env env = info.Env();
  
  // Create a C++ level variable
  std::string helloWorld = "Hello, world!";
  
  // Return a new javascript string that we copy-construct inside of the node.js environment
  return Napi::String::New(env, helloWorld);
}

static Napi::Object Init(Napi::Env env, Napi::Object exports) {
  exports.Set(Napi::String::New(env, "hello"),
              Napi::Function::New(env, Method));
  abc();
  return exports;
}

NODE_API_MODULE(hello, Init)