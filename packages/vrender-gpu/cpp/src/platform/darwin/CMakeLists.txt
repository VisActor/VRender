set(glad_path ${PROJECT_SOURCE_DIR}/src/platform/libs/glad)
set(glfw_path ${PROJECT_SOURCE_DIR}/src/platform/libs/glfw-3.3.8)

add_subdirectory(${glfw_path} glfw)

include_directories(${glad_path}/include)
include_directories(${glfw_path}/include)
include_directories(include)

add_library(vrender_darwin ${PROJECT_SOURCE_DIR}/src/platform/libs/glad/src/glad.c Application.cpp Window.cpp
        include/Application.hpp include/Window.hpp)
target_link_libraries(vrender_darwin glfw)
target_link_libraries(vrender_darwin core)

set_target_properties(vrender_darwin
       PROPERTIES
       POSITION_INDEPENDENT_CODE 1
       ARCHIVE_OUTPUT_NAME "render_lib_darwin"
       DEBUG_POSTFIX "_sd"
       RELEASE_POSTFIX ""
       PUBLIC_HEADER "include/Application.hpp;include/Window.hpp;"
       )
install (TARGETS vrender_darwin
        RUNTIME DESTINATION bin
        LIBRARY DESTINATION lib
        ARCHIVE DESTINATION lib
        PUBLIC_HEADER DESTINATION include
        )

#target_link_libraries(render_lib_darwin vrender-font_lib)

add_executable(vrender_exe_darwin main.cpp)
target_link_libraries(vrender_exe_darwin vrender_darwin)