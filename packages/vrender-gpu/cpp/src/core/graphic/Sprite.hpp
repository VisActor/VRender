//
// Created by ByteDance on 2023/8/17.
//

#ifndef VRENDER_GPU_SPRITE_HPP
#define VRENDER_GPU_SPRITE_HPP

#include <iostream>
#include <glm/glm.hpp>
#include "Node.hpp"
#include "Model.hpp"
#include "ResourceManager.hpp"
#include "ICamera.hpp"

class Sprite: public Node {
public:
    Sprite(): UPDATE_TYPE{}, mPosition{}, mSize{}, mRotate{}, mScale{1.f, 1.f, 1.f}, mModelMatrix{}, mModel{}, mUpdateType{0}, mUpdateTypeBeforeDraw{0} {};
    ~Sprite() override = default;
    void Init(std::shared_ptr<Model> model);
    typedef struct RotateType {
        float x;
        float y;
        float z;
    }RotateType;

    [[nodiscard]] inline glm::vec3 GetPosition() const { return mPosition; };
    inline void SetPosition(const glm::vec3 &position) { mPosition = position; };

    [[nodiscard]] inline glm::vec3 GetSize() const { return mSize; };
    inline void SetSize(const glm::vec3 &size) { mSize = size; };

    [[nodiscard]] inline RotateType GetRotate() const { return mRotate; };
    inline void SetRotate(const RotateType &rotate) { mRotate = rotate; };
    inline void SetRotate(const RotateType &&rotate) { mRotate = rotate; };
    [[nodiscard]] inline float GetRotateX() const { return mRotate.x; }
    inline void SetRotateX(float rotate) { mRotate.x = rotate; }
    [[nodiscard]] inline float GetRotateY() const { return mRotate.y; }
    inline void SetRotateY(float rotate) { mRotate.y = rotate; }
    [[nodiscard]] inline float GetRotateZ() const { return mRotate.z; }
    inline void SetRotateZ(float rotate) { mRotate.z = rotate; }

    void Build(std::shared_ptr<ResourceManager> &resourceManager);
    void Draw(std::shared_ptr<ICamera> &camera, std::shared_ptr<ResourceManager> &resourceManager);

    enum UPDATE_TYPE {
        NONE            = 0b000000000, // 没有变化
        ADD             = 0b000000001, // 被添加到树结构中
        REM             = 0b000000010, // 发生了删除
        MODIFY          = 0b000000100, // 发生了修改（修改包括zIndex、NORMAL_ATTR、GEO_ATTR、POS_ATTR）
        ZINDEX          = 0b000001000, // ZIndex发生变化
        // 如果存在modify，描述具体的modify
//        NORMAL_ATTR     = 0b000010000, // 普通属性发生变化（影响uniform）
//        GEO_ATTR        = 0b000100000, // 几何属性发生变化（影响attribute）
        POS_ATTR        = 0b001000000, // 位置属性发生变化
        INIT            = 0b001001001, // init包含pos，geo，normal_attr，zindex
    } UPDATE_TYPE;

    void UpdatePosMatrix();
    const glm::mat4& GetModelMatrix();
protected:
    unsigned int mUpdateType; // 描述当前Sprite的更新状态，在build结束后会清除
    unsigned int mUpdateTypeBeforeDraw; // 由于draw和build分离，所以有些操作需要在draw阶段进行，这里就是保存build的时候的更新状态避免更新状态丢失
    glm::vec3 mPosition;
    glm::vec3 mSize;
    RotateType mRotate;
    glm::vec3 mScale;
    glm::mat4 mModelMatrix;

    std::shared_ptr<Model> mModel;
};

#endif //VRENDER_GPU_SPRITE_HPP
