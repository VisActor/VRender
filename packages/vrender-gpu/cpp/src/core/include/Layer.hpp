//
// Created by ByteDance on 2023/8/10.
//

#ifndef VRENDER_GPU_LAYER_HPP
#define VRENDER_GPU_LAYER_HPP

#include <thread>
#include "Container.hpp"
#include "Node.hpp"
#include "ResourceManager.hpp"
#include "Camera.hpp"
#include "SpinLock.hpp"
#include "FontManager.hpp"

typedef struct CommonUniformStore {
    CommonUniformStore(): mStamp{0}, mPreModelMatrixUniform{ "u_preModelMatrix", glm::mat4{1.f} } {};
    UniformItem<glm::mat4> mPreModelMatrixUniform;
    size_t mStamp;
} CommonUniformStore;

class Layer final: public Container {
public:
    Layer(float w, float h, std::shared_ptr<ResourceManager> resourceManager = nullptr):
            Container{}, mWidth{w}, mHeight{h}, mType{NodeType::LAYER}, mBuildMutex{}, mBuildThread{}, mBuildSpinMutex{}, mDpr{1.f}, mCommonUniformStore{},
            mRoot{this}, mResourceManager{resourceManager}, mCamera{0, float(w), 0, float(h)}, mFontManager{std::make_shared<FontManager>(resourceManager)},
            mClearColor{1.f, 1.f, 1.f, 1.f}, mEnableDepth{true}, mDepthOptions{false}, mRenderDpr{1.f}, mStamp{0},
            mBlendOptions{true, true, {GL_SRC_ALPHA, GL_ONE_MINUS_SRC_ALPHA, GL_ONE, GL_ONE_MINUS_SRC_ALPHA}} {
    };

    ~Layer() override = default;

    enum class MUTEX_TYPE {
        SPIN = 0, // 自旋锁
        HANG = 1, // 挂起线程
    };

    // 预编译所有的着色器，只能在主线程运行
    void PreCompileAllShader();

    void BuildInThread(MUTEX_TYPE type);
    void Build();
    void WaitForBuild(MUTEX_TYPE type);
    void Draw();
    void SetDpr(float dpr);
    void SetRenderDpr(float dpr);

    const NodeType mType;
    float mWidth;
    float mHeight;
    float mDpr;
    float mRenderDpr;
    CommonUniformStore mCommonUniformStore;
    bool mEnableDepth;
    size_t mStamp;
private:
    Container *mRoot;
    static int sListId;
//    InsMeshQueue mInsMeshQueue;
    glm::vec4 mClearColor;
    std::shared_ptr<ResourceManager> mResourceManager; // 所有layer共用
    std::shared_ptr<FontManager> mFontManager; // 每个layer都有自己的fontManager
    Camera mCamera;
    SpinLockMutex mBuildSpinMutex;
    std::thread mBuildThread;
    std::mutex mBuildMutex;
    struct {
        bool mEnable;
        bool mUseSeparate;
        union {
            struct {
                GLuint mSrcRGB;
                GLuint mDstRGB;
                GLuint mSrcAlpha;
                GLuint mDstAlpha;
            } mFunctionSeparate;
            struct {
                GLuint mSfactor;
                GLuint mDfactor;
            } mNormal;
        } mOptions;
    } mBlendOptions;
    struct {
        bool mEnableDepth;
    } mDepthOptions;

    void DrawInstanceMesh(int stamp);
    void DrawInsFillRectMesh(int stamp);
    void DrawInsStrokeRectMesh(int stamp);
};

#endif //VRENDER_GPU_LAYER_HPP
