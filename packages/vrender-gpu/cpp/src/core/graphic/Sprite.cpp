//
// Created by ByteDance on 2023/8/17.
//
#include "Sprite.hpp"

#include <utility>

void Sprite::Init(std::shared_ptr<Model> model) {
    mModel = std::move(model);
}