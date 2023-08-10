include_directories(${PROJECT_SOURCE_DIR}/src/bezier)
include_directories(${PROJECT_SOURCE_DIR}/src/utils)

link_libraries(core utils bezier)
add_executable(ToolsTest Tools.test.cpp)
add_executable(BezierTest Bezier.test.cpp)