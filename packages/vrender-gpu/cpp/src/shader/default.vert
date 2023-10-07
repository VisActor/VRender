#version 330 core
layout (location = 0) in vec3 aPos;
//layout (location = 1) in vec2 aTexCoord;

out vec2 TexCoord;

uniform mat4 u_model;
uniform mat4 u_view;
uniform mat4 u_projection;

void main() {
//    gl_Position = vec4(aPos.x, aPos.y, aPos.z, 1.0);
    gl_Position = u_projection * u_view * u_model * vec4(aPos, 1.0);
//    TexCoord = aTexCoord;
}
