//
// Created by ByteDance on 2023/8/10.
//
#include <glm/gtc/matrix_transform.hpp>
#include "GL.hpp"
#include "Layer.hpp"
#include "Sprite.hpp"

int Layer::sListId{0};

void Layer::Build(const std::shared_ptr<AnimateTicker> &ticker) {
    for (auto &child : mChildren) {
        std::dynamic_pointer_cast<Sprite>(child)->Build(mResourceManager, ticker);
//        if (child->mType == NodeType::GROUP) {
//            std::dynamic_pointer_cast<Group>(child)->Build(Group::UPDATE_TYPE::NONE, mResourceManager, mFontManager, mInsMeshQueue);
//        } else {
//            // 其他所有类型都默认使用sprite的build
//            std::dynamic_pointer_cast<Sprite>(child)->Build(Sprite::UPDATE_TYPE::NONE, mResourceManager, mFontManager, mInsMeshQueue);
//        }
    }
}

void Layer::SetClearColor(const glm::vec4 &c) {
    mClearColor.r = c.r;
    mClearColor.g = c.g;
    mClearColor.b = c.b;
    mClearColor.a = c.a;
}

void Layer::Draw(std::shared_ptr<ICamera> camera, std::vector<std::shared_ptr<ILight>> &light, const std::shared_ptr<AnimateTicker> &ticker) {
    mStamp++;
    // 背景色
    glClearColor(mClearColor.r, mClearColor.g, mClearColor.b, mClearColor.a);
    if (mEnableDepth) {
//        glClearDepth(-10.f);
        glDepthMask(true);
        glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
    } else {
        glClear(GL_COLOR_BUFFER_BIT);
    }
    // 颜色混合
    if (mBlendOptions.mEnable) {
        glEnable(GL_BLEND);
        glBlendFunc(GL_SRC_ALPHA, GL_ONE_MINUS_SRC_ALPHA);
        if (mBlendOptions.mUseSeparate) {
            auto &functionSeparate = mBlendOptions.mOptions.mFunctionSeparate;
            glBlendFuncSeparate(functionSeparate.mSrcRGB, functionSeparate.mDstRGB, functionSeparate.mSrcAlpha, functionSeparate.mDstAlpha);
        }
    }
    // 深度测试
    if (mDepthOptions.mEnableDepth) {
        glEnable(GL_DEPTH_TEST);
    } else {
        glDisable(GL_DEPTH_TEST);
    }
    // 绘制所有instance mesh
//    DrawInstanceMesh(mStamp);
    // 绘制所有mark
    for (auto &child : mChildren) {
        std::dynamic_pointer_cast<Sprite>(child)->Draw(camera, mResourceManager, light, ticker);
//        if (child->mType == NodeType::GROUP) {
//            std::dynamic_pointer_cast<Group>(child)->Draw(mCamera, mResourceManager);
//        } else {
//            // 其他所有类型都默认使用sprite的build
//            std::dynamic_pointer_cast<Sprite>(child)->Draw(mCamera, mResourceManager);
//        }
    }
}

//void Layer::DrawInstanceMesh(int stamp) {
//    ConsoleTime(true, "layer绘制实例mesh");
//    DrawInsFillRectMesh(stamp);
//    DrawInsStrokeRectMesh(stamp);
//    ConsoleTime(false, "layer绘制实例mesh");
//}
//
//void Layer::DrawInsFillRectMesh(int stamp) {
//    static const std::string shaderName{"insRect"};
////    auto &rectMeshList = mInsMeshQueue.GetFillRectMeshList();
////    for (auto &rectMesh : rectMeshList) {
////        if (rectMesh->NeedSetShader()) {
////            auto shader = mResourceManager->GetShader(shaderName);
////            if (!shader) {
////                shader = mResourceManager->LoadShader(shaderName, ResourceManager::ShaderType::VERTEX | ResourceManager::ShaderType::FRAGMENT);
////            }
////            if (!shader) throw std::runtime_error("获取shader"+shaderName+"失败");
////            rectMesh->SetShader(shader);
////        }
////        rectMesh->UseShader();
////        const auto &rectShader = rectMesh->GetShader();
////        rectShader->SetMatrix4("projectionMatrix", mCamera.GetProjectionMatrix().GetMatrix(), false);
////        if (rectShader->NeedUpdateCommonUniform(mCommonUniformStore.mStamp)) {
////            rectShader->SetMatrix4("u_preModelMatrix", mCommonUniformStore.mPreModelMatrixUniform.data);
////            rectShader->ResetLastCommonUniformUpdateStamp(mCommonUniformStore.mStamp);
////        }
////        rectMesh->BufferData(nullptr, nullptr);
////        rectMesh->SetUniformData();
////        rectMesh->Draw(true);
////    }
//}
//
//void Layer::DrawInsStrokeRectMesh(int stamp) {
//    static const std::string shaderName{"insStrokeRect"};
////    auto &rectMeshList = mInsMeshQueue.GetStrokeRectMeshList();
////    for (auto &rectMesh : rectMeshList) {
////        if (rectMesh->NeedSetShader()) {
////            auto shader = mResourceManager->GetShader(shaderName);
////            if (!shader) {
////                shader = mResourceManager->LoadShader(shaderName, ResourceManager::ShaderType::VERTEX | ResourceManager::ShaderType::FRAGMENT);
////            }
////            if (!shader) throw std::runtime_error("获取shader"+shaderName+"失败");
////            rectMesh->SetShader(shader);
////        }
////        rectMesh->UseShader();
////        const auto &rectShader = rectMesh->GetShader();
////        rectShader->SetMatrix4("projectionMatrix",  mCamera.GetProjectionMatrix().GetMatrix(), false);
////        if (rectShader->NeedUpdateCommonUniform(mCommonUniformStore.mStamp)) {
////            rectShader->SetUniform<glm::mat4>(mCommonUniformStore.mPreModelMatrixUniform);
////            rectShader->ResetLastCommonUniformUpdateStamp(mCommonUniformStore.mStamp);
////        }
////        rectMesh->BufferData(nullptr, nullptr);
////        rectMesh->SetUniformData();
////        rectMesh->Draw(true);
////    }
//}

void Layer::PreCompileAllShader() {
//    const auto rectShader = mResourceManager->LoadShader("rect", ResourceManager::ShaderType::VERTEX | ResourceManager::ShaderType::FRAGMENT);
//    if (rectShader->NeedUpdateCommonUniform(mCommonUniformStore.mStamp)) {
//        rectShader->SetUniform<glm::mat4>(mCommonUniformStore.mPreModelMatrixUniform);
//        rectShader->ResetLastCommonUniformUpdateStamp(mCommonUniformStore.mStamp);
//    }
//    const auto insRectShader = mResourceManager->LoadShader("insRect", ResourceManager::ShaderType::VERTEX | ResourceManager::ShaderType::FRAGMENT);
//    const auto strokeRectShader = mResourceManager->LoadShader("strokeRect", ResourceManager::ShaderType::VERTEX | ResourceManager::ShaderType::FRAGMENT);
//    if (strokeRectShader->NeedUpdateCommonUniform(mCommonUniformStore.mStamp)) {
//        strokeRectShader->SetUniform<glm::mat4>(mCommonUniformStore.mPreModelMatrixUniform);
//        strokeRectShader->ResetLastCommonUniformUpdateStamp(mCommonUniformStore.mStamp);
//    }
//    const auto insStrokeShader = mResourceManager->LoadShader("insStrokeRect", ResourceManager::ShaderType::VERTEX | ResourceManager::ShaderType::FRAGMENT);
//    const auto lineShader = mResourceManager->LoadShader("line", ResourceManager::ShaderType::VERTEX | ResourceManager::ShaderType::FRAGMENT);
//    if (lineShader->NeedUpdateCommonUniform(mCommonUniformStore.mStamp)) {
//        lineShader->SetUniform<glm::mat4>(mCommonUniformStore.mPreModelMatrixUniform);
//        lineShader->ResetLastCommonUniformUpdateStamp(mCommonUniformStore.mStamp);
//    }
//    const auto gpuTextShader = mResourceManager->LoadShader("gputext", ResourceManager::ShaderType::VERTEX | ResourceManager::ShaderType::FRAGMENT);
//    if (gpuTextShader->NeedUpdateCommonUniform(mCommonUniformStore.mStamp)) {
//        gpuTextShader->SetUniform<glm::mat4>(mCommonUniformStore.mPreModelMatrixUniform);
//        gpuTextShader->ResetLastCommonUniformUpdateStamp(mCommonUniformStore.mStamp);
//    }
}

void Layer::BuildInThread(MUTEX_TYPE type, const std::shared_ptr<AnimateTicker> &ticker) {
    std::lock_guard guard(mBuildMutex);
    if (type == MUTEX_TYPE::SPIN) {
        mBuildSpinMutex.UnLock();
        mBuildSpinMutex.Lock();
    }
    // 自动线程转移~
    mBuildThread = std::thread([this, type, ticker]() {
        ConsoleTime(true, "构建Layer");
        try {
            Build(ticker);
        } catch (std::runtime_error &err) {
            std::cout<<err.what()<<std::endl;
        }
        ConsoleTime(false, "构建Layer");
        if (type == MUTEX_TYPE::SPIN) mBuildSpinMutex.UnLock();
    });
    if (type == MUTEX_TYPE::SPIN) mBuildThread.detach();
}

void Layer::WaitForBuild(MUTEX_TYPE type, const std::shared_ptr<AnimateTicker> &ticker) {
    if (type == MUTEX_TYPE::SPIN) {
        mBuildSpinMutex.Lock();
    } else if (type == MUTEX_TYPE::HANG) {
        mBuildThread.join();
    }
}

void Layer::SetDpr(float dpr) {
    mDpr = dpr;
}
void Layer::SetRenderDpr(float dpr) {
    mRenderDpr = dpr;
    mCommonUniformStore.mStamp = mStamp;
    mCommonUniformStore.mPreModelMatrixUniform.data = glm::scale(glm::mat4{1.f}, glm::vec3{dpr, dpr, 1.f});
}
