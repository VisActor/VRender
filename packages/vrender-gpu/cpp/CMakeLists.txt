cmake_minimum_required(VERSION 3.16)
cmake_policy(SET CMP0042 NEW)
project(vrender-gpu)

set(CMAKE_CXX_STANDARD 17)

# wasm所有文件开启线程支持
if ($ENV{WASMENV})
    SET(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} --bind -O3 -pthread")
    SET(CMAKE_C_FLAGS "${CMAKE_C_FLAGS} --bind -O3 -pthread")
else()
    SET(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -O3 -DGL_GLEXT_PROTOTYPES")
    SET(CMAKE_C_FLAGS "${CMAKE_C_FLAGS} -O3 -DGL_GLEXT_PROTOTYPES")
endif()

add_definitions(-DGL_SILENCE_DEPRECATION -DDEBUG -DSTABLE)

# 定义环境变量相关的宏，用于项目中环境判断，定义shader和font文件夹的位置
if ($ENV{WASMENV})
    add_definitions(-DBrowserEnv)
else()
    if ($ENV{NODEJS})
        add_definitions(-DDarwinEnv -DSHADER_ROOT="./build/src/shader/" -DFONT_ROOT="./build/src/font/") # node-addon
    else()
        add_definitions(-DDarwinEnv -DSHADER_ROOT="../../shader/" -DFONT_ROOT="../../font/") # native
    endif()
endif()

add_subdirectory(${PROJECT_SOURCE_DIR}/libs/glm/glm)
include_directories(${PROJECT_SOURCE_DIR}/libs/glm)

set(VRENDER_GPU_ROOT_PATH ${PROJECT_SOURCE_DIR}/)
string(REGEX REPLACE "(.*)/(.*)" "\\1" VRENDER_GPU_ROOT_PATH  ${PROJECT_SOURCE_DIR})
#message(${VRENDER_GPU_ROOT_PATH})

# 设置输出目录
if ($ENV{WASMENV})
    SET(CMAKE_ARCHIVE_OUTPUT_DIRECTORY ${VRENDER_GPU_ROOT_PATH}/dist-wasm)
    SET(CMAKE_LIBRARY_OUTPUT_DIRECTORY ${VRENDER_GPU_ROOT_PATH}/dist-wasm)
    SET(CMAKE_RUNTIME_OUTPUT_DIRECTORY ${VRENDER_GPU_ROOT_PATH}/dist-wasm)
endif()

# # 设置编译参数
# if ($ENV{WASMENV})
#     SET(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -O3")
#     SET(CMAKE_C_FLAGS "${CMAKE_C_FLAGS} -O3")
# endif()

include_directories(
        ${PROJECT_SOURCE_DIR}/src/core/interfaces
        ${PROJECT_SOURCE_DIR}/src/core/include
        ${PROJECT_SOURCE_DIR}/src/core/graphic
        ${PROJECT_SOURCE_DIR}/src/utils
        ${PROJECT_SOURCE_DIR}/src/platform
        ${PROJECT_SOURCE_DIR}/src/platform/libs/glad/include
        ${PROJECT_SOURCE_DIR}/src/text/include
)

add_subdirectory(src)

if ($ENV{NODEJS})
  add_subdirectory(node)
endif()