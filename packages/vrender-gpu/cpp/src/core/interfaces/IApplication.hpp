//
// Created by ByteDance on 2023/8/4.
//

#ifndef VRENDER_GPU_IAPPLICATION_HPP
#define VRENDER_GPU_IAPPLICATION_HPP

#include "Type.hpp"
#include "IWindow.hpp"

class IApplication;
typedef std::function<int (IApplication*)> OnInit;
typedef std::function<int (IApplication*)> OnStart;
typedef std::function<int (IApplication*)> OnUpdate;
typedef std::function<int (IApplication*)> OnRelease;
//typedef int (*OnInit)(IApplication*);
//typedef int (*OnStart)(IApplication*);
//typedef int (*OnUpdate)(IApplication*);
//typedef int (*OnRelease)(IApplication*);

class IApplication {
public:
    explicit IApplication(Platform platform): mPlatform{platform},
        mOnInit{nullptr}, mOnStart{nullptr}, mOnUpdate{nullptr}, mOnRelease{nullptr},
        mDrawInThisFrame{true} {};
    virtual ~IApplication() = default;
    virtual int Init() = 0;
    virtual void Destroy() = 0;
    virtual IWindow* CreateWindow(const WindowConf &conf) = 0;
    virtual void Start() = 0;
    virtual bool RunFrame() = 0;
    virtual std::shared_ptr<ResourceManager> GetResourceManager() = 0;
    bool mDrawInThisFrame;

    OnInit mOnInit;
    OnStart mOnStart;
    OnUpdate mOnUpdate;
    OnRelease mOnRelease;
protected:
    Platform mPlatform;
    std::shared_ptr<ResourceManager> mResourceManager;
};

#endif //VRENDER_GPU_IAPPLICATION_HPP
