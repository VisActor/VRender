include_directories(../include)
add_executable(fontTest font.test.cpp)
target_link_libraries(fontTest font_lib)