//
// Created by ByteDance on 2023/8/11.
//
#ifndef EM_PORT_API
#   if defined(__EMSCRIPTEN__)
#       include <emscripten.h>

#       if defined(__cplusplus)
#           define EM_PORT_API(rettype) extern "C" rettype EMSCRIPTEN_KEEPALIVE
#       else
#           define EM_PORT_API(rettype) rettype EMSCRIPTEN_KEEPALIVE
#       endif
#   else
#       if defined(__cplusplus)
#           define EM_PORT_API(rettype) extern "C" rettype
#       else
#           define EM_PORT_API(rettype) rettype
#       endif
#   endif
#endif
#include <cstddef>
#include <cstdlib>

extern "C" {
EM_PORT_API(int) getNum();
EM_PORT_API(unsigned char*) createBuffer(size_t size);
EM_PORT_API(void) freeBuffer(void *ptr);
EM_PORT_API(void) callJS(void);
extern void testExternalJSMethod();
}

extern "C" {
EM_PORT_API(int) getNum() {
    return 2;
}
EM_PORT_API(unsigned char*) createBuffer(size_t size) {
    return (unsigned char*)malloc(size);
}
EM_PORT_API(void) freeBuffer(void *ptr) {
    return free(ptr);
}
EM_PORT_API(void) callJS(void) {
    testExternalJSMethod();
}
}