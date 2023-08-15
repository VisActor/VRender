add_custom_target(copy_shader COMMAND ${CMAKE_COMMAND} -E copy_directory ${PROJECT_SOURCE_DIR}/src/shader ${CMAKE_CURRENT_BINARY_DIR}/shader)
add_custom_target(copy_font COMMAND ${CMAKE_COMMAND} -E copy_directory ${PROJECT_SOURCE_DIR}/src/font ${CMAKE_CURRENT_BINARY_DIR}/font)

add_subdirectory(utils)
add_subdirectory(text)
# add_subdirectory(bezier)
add_subdirectory(core)
add_subdirectory(platform)

add_dependencies(core copy_shader copy_font)

# 这个执行文件是跨平台的，会根据平台选择对应的library
#add_executable(vrender-gpu main.cpp)

#if (CMAKE_SYSTEM_NAME STREQUAL Emscripten)
#    #    add_subdirectory(browser)
#elseif(APPLE)
#    target_link_libraries(vrender-gpu render_lib_darwin)
#endif()

if (NOT CMAKE_SYSTEM_NAME STREQUAL Emscripten)
    enable_testing()
    add_subdirectory(test)
endif()
