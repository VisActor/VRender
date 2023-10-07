#version 330 core
out vec4 FragColor;

in vec3 Normal;
in vec2 TexCoord;
in vec3 FragPosition;

uniform vec4 u_color;
uniform float u_float;

uniform sampler2D texture0;
uniform int texture0Loaded;
uniform sampler2D texture1;
uniform int texture1Loaded;
uniform sampler2D texture2;
uniform int texture2Loaded;
//uniform sampler2D texture3;
//uniform int texture4Loaded;

void main() {
    float temp = step(0.5, texture0Loaded);
    vec4 ModelColor = (1.0-temp) * vec4(1.0, 1.0, 1.0, 1.0) + temp * (texture(texture0, TexCoord) + texture(texture1, TexCoord) + texture(texture2, TexCoord));
    FragColor = ModelColor * vec4(u_color.rgb, u_color.a);
//    FragColor = vec4(u_color.rgb, u_color.a);
//    FragColor = ModelColor;
//    FragColor = vec4(FragPosition, 1.0);
//    FragColor = vec4(TexCoord.xy, 0.0, 1.0);
}