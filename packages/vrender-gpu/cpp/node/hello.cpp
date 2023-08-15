#include <napi.h>
#include "Application.hpp"
#include "Init.hpp"
#include "AppWrap.hpp"

int createApplication(InitAsyncWork *piWorker) {
    auto *application = new DarwinApplication();
    if (application->Init()) {
        std::cout<<"初始化application失败"<<std::endl;
    }
    auto *window = application->CreateWindow({1200, 600, "这是标题"});
    window->SetClearColor(1, 1, 1, 1);
    auto layer = window->AddLayer();
    application->mOnStart = [piWorker](IApplication * application) {
        piWorker->mApplication = std::shared_ptr<IApplication>(application);
        piWorker->Queue();
        return 0;
    };
    application->Start();
//    application->mOnStart = [](IApplication* application1){
//        auto *app = dynamic_cast<DarwinApplication *>(application1);
//        if (app != nullptr) {
//            app->mWindow->SetClearColor(Random(0.f, 1.f), Random(0.f, 1.f), Random(0.f, 1.f), 1.f);
//            app->mDrawInThisFrame = true;
//        }
////        window->SetClearColor(Random(0.f, 1.f), Random(0.f, 1.f), Random(0.f, 1.f), 1.f);
//        return 0;
//    };
//    while(true) {
//        if (window->IsDestroyed()) break;
//        window->SetClearColor(Random(0.f, 1.f), Random(0.f, 1.f), Random(0.f, 1.f), 1.f);
//        window->RenderAllLayer();
//        window->SwapFrame();
////        const auto &renderer = window->GetRenderer();
////        needUpdateLabel = false;
////        if (compileShaderTime != renderer.mPerformance.compileShaderTime) {
////            compileShaderTime = renderer.mPerformance.compileShaderTime;
////            needUpdateLabel = true;
////        }
////        if (buildLayerTime != renderer.mPerformance.buildLayerTime) {
////            buildLayerTime = renderer.mPerformance.buildLayerTime;
////            needUpdateLabel = true;
////        }
////        if (drawTime != renderer.mPerformance.drawTime) {
////            drawTime = renderer.mPerformance.drawTime;
////            needUpdateLabel = true;
////        }
////        label->SetText("机器语言，单线程，shader:" +
////            std::to_string(compileShaderTime) + "ms，build:" +
////            std::to_string(buildLayerTime) + "ms，render:" +
////            std::to_string(drawTime) + "ms");
//    }
    return 0;
}


Napi::Value AsyncDo(const Napi::CallbackInfo& info) {
  // Napi::Env is the opaque data structure containing the environment in which the request is being run. 
  // We will need this env when we want to create any new objects inside of the node.js environment
//  Napi::Env env = info.Env();
  int value = info[0].As<Napi::Number>().Uint32Value();
  Napi::Function callback = info[1].As<Napi::Function>();
  InitAsyncWork *piWorker = new InitAsyncWork(callback, value);
  createApplication(piWorker);
//  piWorker->Queue();

  return info.Env().Null();
  
//  // Create a C++ level variable
//  std::string helloWorld = "Hello, world!";
//
//  // Return a new javascript string that we copy-construct inside of the node.js environment
//  return Napi::String::New(env, helloWorld);
}

static Napi::Object Init(Napi::Env env, Napi::Object exports) {
  exports.Set(Napi::String::New(env, "createApplication"),
              Napi::Function::New(env, AsyncDo));
  AppWrap::Init(env, exports);
  return exports;
}

NODE_API_MODULE(VRENDER_NODE, Init)
