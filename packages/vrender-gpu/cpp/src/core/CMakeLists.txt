set(glad_path ${PROJECT_SOURCE_DIR}/src/platform/libs/glad)

include_directories(include)
include_directories(${glad_path}/include)
include_directories(algorithm/include)
include_directories(geometry/include)
include_directories(material/include)
include_directories(mesh/include)
include_directories(lights/include)
#include_directories(Mark/include)
#include_directories(render/include)

add_library(core
        PerspectiveCamera.cpp
        material/Material.cpp material/MeshBasicMaterial.cpp
        mesh/Mesh.cpp
        lights/AmbientLight.cpp
        Model.cpp
        ResourceManager.cpp FontManager.cpp Shader.cpp Texture2D.cpp stb_image.cpp
        graphic/Node.cpp graphic/Container.cpp graphic/Sprite.cpp Layer.cpp
        Matrix.cpp Bounds.cpp
        Camera.cpp SpinLock.cpp Renderer.cpp algorithm/Bezier.cpp
        geometry/Geometry.cpp geometry/BoxGeometry.cpp geometry/SphereGeometry.cpp)

#add_library(core
#        stb_image.cpp Shader.cpp Texture2D.cpp ResourceManager.cpp Mesh.cpp Geometry.cpp Tools.cpp
#        Camera.cpp FontManager.cpp algorithm/Bezier.cpp
#        Geometry2D/FillRectGeo.cpp Geometry2D/InsFillRectGeo.cpp Geometry2D/InsMeshQueue.cpp
#        Geometry2D/StrokeRectGeo.cpp Geometry2D/InsStrokeRectGeo.cpp Geometry2D/LineGeo.cpp
#        Geometry2D/InsTextGeo.cpp
#        common/Node.cpp common/Container.cpp common/Group.cpp common/Sprite.cpp common/Layer.cpp
#        common/Matrix.cpp common/Bound.cpp
#        thread/SpinLock.cpp
#        Mark/Rect.cpp Mark/Text.cpp Mark/Line.cpp Mark/LineCollection.cpp Mark/Shape.cpp
#        render/Renderer.cpp
#        )
set_target_properties(core PROPERTIES
        LINK_FLAGS "-pthread")
target_link_libraries(core font_lib utils)
add_subdirectory(test)
enable_testing()