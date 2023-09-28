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
#include "Camera.hpp"

class Sprite: public Node {
public:
    Sprite(): mPosition{}, mSize{}, mRotate{}, mScale{} {};
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
    void Draw(std::shared_ptr<Camera> &camera, std::shared_ptr<ResourceManager> &resourceManager);

protected:
    glm::vec3 mPosition;
    glm::vec3 mSize;
    RotateType mRotate;
    glm::vec3 mScale;

    std::shared_ptr<Model> mModel;
};

#endif //VRENDER_GPU_SPRITE_HPP
