#version 330 core
layout (location = 0) in vec3 aPos;
layout (location = 1) in vec3 aNormal;
layout (location = 2) in vec2 aTexCoord;
layout (location = 3) in vec4 aColor;

#define MORPHTARGETS_COUNT 20

out vec3 Normal;
out vec2 TexCoord;
out vec3 FragPosition;
out vec4 Color;

uniform mat4 u_model;
uniform mat4 u_view;
uniform mat4 u_projection;
uniform float u_morphTargetInfluences[MORPHTARGETS_COUNT];
uniform ivec2 u_morphTargetSize;
uniform sampler2D u_morphTargetsTexture;

void main() {
    Normal = mat3(transpose(inverse(u_model))) * aNormal;
    TexCoord = aTexCoord;
    FragPosition = vec3(u_model * vec4(aPos, 1.0));
    Color = vec4(aColor.xyz, 1.0);
    // TODO 条件语句
    if (u_morphTargetSize.x > 0) {
        gl_Position = u_projection * u_view * u_model * vec4(aPos, 1.0) + 10.1;
    } else {
        gl_Position = u_projection * u_view * u_model * vec4(aPos, 1.0);
    }
    vec3 transform = vec3(0.0, 0.0, 0.0);
    for (int i = 0; i < MORPHTARGETS_COUNT; i++) {
        if (i > u_morphTargetSize.y) {
            break;
        }
        vec4 p = texelFetch(u_morphTargetsTexture, ivec2(gl_VertexID, i), 0);
        transform = transform + vec3(p.xyz) * u_morphTargetInfluences[i];
    }
    float useTextureVert = step(0.5, u_morphTargetSize.x);
    vec3 position = useTextureVert * transform + (1.0 - useTextureVert) * aPos;
    gl_Position = u_projection * u_view * u_model * vec4(position, 1.0);
}
