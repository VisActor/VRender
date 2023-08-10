//
// Created by ByteDance on 2023/8/10.
//
#include "Node.hpp"
#include "Container.hpp"

int Node::sId = 0;

bool Node::IsDescendantsOf(const Container *c) const {
    auto *container = mContainer;
    if (container == nullptr) return false;
    do {
        if (container->mId == c->mId) return true;
        container = container->mContainer;
    } while (container != nullptr);

    return false;
}

bool Node::IsChildOf(const Container *c) const {
    if (mContainer == nullptr) return false;
    return c->mId == mContainer->mId;
}
