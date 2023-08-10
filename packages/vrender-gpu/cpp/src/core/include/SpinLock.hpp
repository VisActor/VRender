//
// Created by ByteDance on 2023/8/10.
//

#ifndef VRENDER_GPU_SPINLOCK_HPP
#define VRENDER_GPU_SPINLOCK_HPP

#include <atomic>

class SpinLockMutex {
public:
    SpinLockMutex(): mFlag{ATOMIC_FLAG_INIT} {}
    void Lock() { while (mFlag.test_and_set()); }
    void UnLock() { mFlag.clear(); }
private:
    std::atomic_flag mFlag;
};

#endif //VRENDER_GPU_SPINLOCK_HPP
