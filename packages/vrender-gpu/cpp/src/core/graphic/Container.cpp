//
// Created by ByteDance on 2023/8/10.
//
#include "Container.hpp"

void Container::AppendChild(const std::shared_ptr<Node> &node) {
//    if (node->mId == mId) return;
    mChildren.push_back(node);
    node->mContainer = this;
    node->mRoot = mRoot == nullptr ? this : mRoot;
    // 节点数量+mCount
    SetCount(node->mCount);
    if (node->mIsContainer) {
        std::shared_ptr<Container> c = std::dynamic_pointer_cast<Container>(node);
        // 设置所有子节点的root
        c->SetAllDescendantsRootNode();
    }
}

void Container::InsertChildAt(int i, const std::shared_ptr<Node> &node) {
//    if (node->mId == mId) return;
    mChildren.insert(mChildren.begin() + i, node);
    node->mContainer = this;
    node->mRoot = mRoot == nullptr ? this : mRoot;
    // 节点数量+1
    SetCount(node->mCount);
    if (node->mIsContainer) {
        std::shared_ptr<Container> c = std::dynamic_pointer_cast<Container>(node);
        // 设置所有子节点的root
        c->SetAllDescendantsRootNode();
    }
}

void Container::InsertChildBefore(const std::shared_ptr<Node> &before, const std::shared_ptr<Node> &node) {
    for (auto &&iter = mChildren.begin(); iter != mChildren.end(); iter++) {
        if ((*iter)->mId == before->mId) {
            mChildren.insert(iter, node);
            node->mContainer = this;
            node->mRoot = mRoot == nullptr ? this : mRoot;
            // 节点数量+mCount
            SetCount(node->mCount);
            if (node->mIsContainer) {
                std::shared_ptr<Container> c = std::dynamic_pointer_cast<Container>(node);
                // 设置所有子节点的root
                c->SetAllDescendantsRootNode();
            }
            return;
        }
    }
}

std::shared_ptr<Node> Container::GetChildByIdx(int i) {
    if (i >= mChildren.size()) return nullptr;
    return mChildren[i];
}

std::shared_ptr<Node> Container::GetChildById(int i) {
    for (const auto &child : mChildren) {
        if (child->mId == i) {
            return child;
        }
    }
    return nullptr;
}

std::shared_ptr<Node> Container::RemoveChildById(int i) {
    if (i >= mChildren.size()) return nullptr;
    const auto &node = mChildren[i];
    mChildren.erase(mChildren.begin() + i++, mChildren.begin() + i);
    node->mContainer = nullptr;
    node->mRoot = nullptr;
    // 节点数量-mCount
    SetCount(-node->mCount);
    if (node->mIsContainer) {
        std::shared_ptr<Container> c = std::dynamic_pointer_cast<Container>(node);
        // 设置所有子节点的root
        c->SetAllDescendantsRootNode();
    }
    return node;
}

std::shared_ptr<Node> Container::RemoveChildByIdx(int i) {
    for (auto &&iter = mChildren.begin(); iter != mChildren.end(); iter++) {
        if ((*iter)->mId == i) {
            const auto &node = (*iter);
            mChildren.erase(iter, iter + 1);
            node->mContainer = nullptr;
            node->mRoot = nullptr;
            // 节点数量-mCount
            SetCount(-node->mCount);
            if (node->mIsContainer) {
                std::shared_ptr<Container> c = std::dynamic_pointer_cast<Container>(node);
                // 设置所有子节点的root
                c->SetAllDescendantsRootNode();
            }
            return node;
        }
    }
    return nullptr;
}

bool Container::IsAncestorsOf(Node *node) const {
    return node->IsDescendantsOf(this);
}

bool Container::IsParentOf(Node *node) const {
    return node->IsChildOf(this);
}

int Container::SetCount(int deltaCount) {
    mCount += deltaCount;
    auto *parent = mContainer;
    if (parent == nullptr) return mCount;
    do {
        parent->mCount += deltaCount;
        parent = parent->mContainer;
    } while (parent != nullptr);
    return mCount;
}

void Container::SetAllDescendantsRootNode() {
    for (auto &child : mChildren) {
        child->mRoot = mRoot;
        if (child->mIsContainer) {
            std::dynamic_pointer_cast<Container>(child)->SetAllDescendantsRootNode();
        }
    }
}
