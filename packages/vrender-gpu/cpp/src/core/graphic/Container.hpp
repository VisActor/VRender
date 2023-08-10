//
// Created by ByteDance on 2023/8/10.
//

#ifndef VRENDER_GPU_CONTAINER_HPP
#define VRENDER_GPU_CONTAINER_HPP

#include <iostream>
#include <vector>
#include "Node.hpp"

class Container: public Node {
public:
    // append
    virtual void AppendChild(const std::shared_ptr<Node> &node);
    // insert
    virtual void InsertChildAt(int i, const std::shared_ptr<Node> &node);
    virtual void InsertChildBefore(const std::shared_ptr<Node> &before, const std::shared_ptr<Node> &node);
    // find
    std::shared_ptr<Node> GetChildByIdx(int i);
    std::shared_ptr<Node> GetChildById(int i);
    // remove
    virtual std::shared_ptr<Node> RemoveChildById(int i);
    virtual std::shared_ptr<Node> RemoveChildByIdx(int i);

    // 判断当前节点是否是node的祖先节点
    bool IsAncestorsOf(Node *node) const;
    // 判断当前节点是否是node的父节点
    bool IsParentOf(Node *node) const;
    // 设置当该节点的count
    int SetCount(int deltaCount);
    // 设置所有后代节点的root
    void SetAllDescendantsRootNode();

    inline void SetIndex(int i) override {
        if (i != mIndex) {
            mContainer->mTreeStructUpdateType |= TREE_STRUCT_UPDATE_TYPE::CHILD_ZINDEX;
        }
        Node::SetIndex(i);
    }
    [[nodiscard]] inline int GetIndex() const override { return Node::GetIndex(); }

    std::vector<std::shared_ptr<Node>> mChildren;

    const bool mIsContainer = true;
protected:
    Container(): Node{}, mChildren{}, mTreeStructUpdateType{NONE}, mLastStructUpdateTypeBeforeDraw{NONE} {
        mType = NodeType::CONTAINER;
    }
    ~Container() override = default;
    enum TREE_STRUCT_UPDATE_TYPE {
        NONE                  = 0b00000000,
        ADD_CHILD             = 0b00000001, // 子元素发生了添加
        REM_CHILD             = 0b00000010, // 子元素发生了删除
        CHILD_ZINDEX          = 0b00000100, // 子元素中有元素的zindex发生了变化
    };
    unsigned int mTreeStructUpdateType;
    unsigned int mLastStructUpdateTypeBeforeDraw;
};


#endif //VRENDER_GPU_CONTAINER_HPP
