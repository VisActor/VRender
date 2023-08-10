#set(PC_HARFBUZZ_INCLUDEDIR ${PROJECT_SOURCE_DIR}/src/text2/libs/harfbuzz-1.3.0/src)

#freetype
set(FREETYPE_DIRECTORY libs/freetype2)
add_subdirectory(${FREETYPE_DIRECTORY})
include_directories(${FREETYPE_DIRECTORY}/include)

add_library(font_lib Font.cpp Packer.cpp ImageData.cpp Common.cpp)
target_link_libraries(font_lib freetype)
target_include_directories(font_lib PUBLIC
        "${CMAKE_CURRENT_LIST_DIR}"
        "${CMAKE_CURRENT_LIST_DIR}/include")

#add_executable(font_exe main.cpp)
#target_link_libraries(font_exe font_lib)
#target_include_directories(font_exe PUBLIC
#        "${CMAKE_CURRENT_LIST_DIR}"
#        "${CMAKE_CURRENT_LIST_DIR}/include")


add_subdirectory(test)
enable_testing()