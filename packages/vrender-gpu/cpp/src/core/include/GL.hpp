//
// Created by ByteDance on 2023/8/11.
//

#ifndef VRENDER_GPU_GL_HPP
#define VRENDER_GPU_GL_HPP

#ifdef BrowserEnv
#include <GLES3/gl3.h>
#define glClearDepth glClearDepthf
#endif

#ifdef DarwinEnv
#include <glad/glad.h>
#endif

#endif //VRENDER_GPU_GL_HPP
