//
// Created by ByteDance on 2023/8/10.
//

#ifndef VRENDER_GPU_NODE_HPP
#define VRENDER_GPU_NODE_HPP

#include "ITuple.hpp"

class Container;

class Node: public ITuple {
public:
    enum class NodeType {
        NODE = 1,
        CONTAINER = 2,
        LAYER = 3,
    };
    Container* GetContainer() { return mContainer; }

    // 判断当前节点是否是node的后代节点
    bool IsDescendantsOf(const Container *c) const;
    // 判断当前节点是否是node的子节点
    bool IsChildOf(const Container *c) const;
    // 获取节点数量（包括自身）
    [[nodiscard]] inline int GetNodeCount() const { return mCount; }

    [[nodiscard]] virtual inline int GetIndex() const { return mIndex; }
    inline virtual void SetIndex(int index) { mIndex = index; }

    friend class Container;

    inline int ID() override { return mId; }

    const int mId;
    NodeType mType;
    const bool mIsContainer = false;
protected:
    Node(): mId{sId++}, mType{NodeType::NODE}, mContainer{nullptr}, mRoot{nullptr}, mCount{1}, mIndex{0} {}
    virtual ~Node() = default;
    Container *mContainer;
    Container *mRoot;
    int mCount; // 总节点数，包括自身
    int mIndex;
private:
    static int sId;
};

#endif //VRENDER_GPU_NODE_HPP
