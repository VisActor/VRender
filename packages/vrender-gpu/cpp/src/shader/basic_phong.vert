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
uniform int u_morphTargetCount;

void main() {
    vec3 position = aPos;
    Normal = mat3(transpose(inverse(u_model))) * aNormal;
    TexCoord = aTexCoord;
    FragPosition = vec3(u_model * vec4(aPos, 1.0));
    Color = vec4(aColor.xyz, 1.0);
    gl_Position = u_projection * u_view * u_model * vec4(aPos, 1.0);
}
