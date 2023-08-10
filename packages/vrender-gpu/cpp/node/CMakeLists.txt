option(BUILD_SHARED_LIBS "Build shared library" ON)

set(glad_path ${PROJECT_SOURCE_DIR}/src/platform/libs/glad)
set(glfw_path ${PROJECT_SOURCE_DIR}/src/platform/libs/glfw-3.3.8)
include_directories(${CMAKE_JS_INC})
include_directories(${glad_path}/include)
include_directories(${glfw_path}/include)
include_directories(${FREETYPE_DIRECTORY}/include)
# 根据环境选择不同的适配
include_directories(${PROJECT_SOURCE_DIR}/src/platform/darwin/include)
add_library(vrender-node SHARED hello.cpp ${CMAKE_JS_SRC})

set_target_properties(vrender-node PROPERTIES PREFIX "" SUFFIX ".node")
target_link_libraries(vrender-node ${CMAKE_JS_LIB})
target_link_libraries(vrender-node vrender_darwin)

# Include Node-API wrappers
execute_process(COMMAND node -p "require('node-addon-api').include"
        WORKING_DIRECTORY ${CMAKE_SOURCE_DIR}
        OUTPUT_VARIABLE NODE_ADDON_API_DIR
        )
string(REGEX REPLACE "[\r\n\"]" "" NODE_ADDON_API_DIR ${NODE_ADDON_API_DIR})

target_include_directories(vrender-node PRIVATE ${NODE_ADDON_API_DIR})

# define NAPI_VERSION
add_definitions(-DNAPI_VERSION=3)