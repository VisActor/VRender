//
// Created by ByteDance on 2023/8/14.
//

#ifndef VRENDER_GPU_INIT_HPP
#define VRENDER_GPU_INIT_HPP

#include <napi.h>
using namespace Napi;
#include "Application.hpp"

class InitAsyncWork: public AsyncWorker {
public:
    InitAsyncWork(Function &callback, int value): AsyncWorker(callback), mApplication(nullptr) {}
    ~InitAsyncWork() override = default;

    void Execute() override {
        printf("this is execute");
    }

    void OnOK() override {
        HandleScope scope(Env());
        Callback().Call({Env().Null(), Number::New(Env(), 0)});
    }

    std::shared_ptr<IApplication> mApplication;
};

#endif //VRENDER_GPU_INIT_HPP
