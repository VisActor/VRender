#version 330 core
out vec4 FragColor;

in vec3 Normal;
in vec2 TexCoord;
in vec3 FragPosition;
in vec4 Color;

// spotLight数量
const int AMBIENT_NUM = 1;
const int SPOTLIGHT_NUM = 6;
const int POINTLIGHT_NUM = 6;
const int DIRECTLIGHT_NUM = 6;

/* 材质 */
struct Material {
    vec3 ambient;
    vec3 diffuse;
    vec3 specular;
    float shininess;
};
/* 材质 */

/* 光照 */

struct LightAttenuation {
    float constant;
    float linear;
    float quadratic;
};

struct BlinnPhongParams {
    vec3 ambient;
    vec3 diffuse;
    vec3 specular;
    float attenuation;
};

struct AmbientLightItem {
    vec3 lightColor;
    float strength;
};

struct PointLightItem {
    vec3 lightPosition;
    vec3 lightColor;
    vec3 ambient;
    vec3 diffuse;
    vec3 specular;

    LightAttenuation lightAttenuation;
};
struct SpotLightItem {
    vec3 lightPosition;
    vec3 lightColor;
    vec3 ambient;
    vec3 diffuse;
    vec3 specular;

    LightAttenuation lightAttenuation;

    vec3 direction;
    float cutOff;
    float outCutOff;
};
struct DirectLightItem {
    vec3 lightDirection;
    vec3 lightColor;
    float strength;
};

/* 光照 */

uniform AmbientLightItem ambientLightArr[AMBIENT_NUM];
uniform PointLightItem pointLightArr[POINTLIGHT_NUM];
uniform SpotLightItem spotLightArr[SPOTLIGHT_NUM];
uniform DirectLightItem directLightArr[DIRECTLIGHT_NUM];
uniform int ambientLightArrLength;
uniform int pointLightArrLength;
uniform int spotLightArrLength;
uniform int directLightArrLength;

uniform vec3 cameraPosition;

uniform Material material;

uniform sampler2D texture0;
uniform int texture0Loaded;
uniform sampler2D texture1;
uniform int texture1Loaded;
uniform sampler2D texture2;
uniform int texture2Loaded;
uniform sampler2D texture3;
uniform int texture3Loaded;

BlinnPhongParams calcBlinnPhong(vec3 lightDirection, vec3 lightPosition, vec3 cameraPosition, vec3 lightColor);
BlinnPhongParams calcBlinnPhong(vec3 lightDirection, vec3 lightPosition, vec3 cameraPosition, vec3 lightColor, LightAttenuation lightAttenuation, bool attenuation);
BlinnPhongParams calcBlinnPhong(vec3 lightPosition, vec3 cameraPosition, vec3 lightColor);
BlinnPhongParams calcBlinnPhong(vec3 lightPosition, vec3 cameraPosition, vec3 lightColor, LightAttenuation lightAttenuation, bool attenuation);

/*
  计算BlinnPhong光照模型
*/
BlinnPhongParams calcBlinnPhong(vec3 lightDirection, vec3 lightPosition, vec3 cameraPosition, vec3 lightColor) {
    vec3 viewDirection = normalize(cameraPosition - FragPosition);

/* 环境光 */
    vec3 ambient = material.ambient * lightColor;
/* 环境光 */

/* 漫反射 */
    vec3 norm = normalize(Normal);
    vec3 diffuse = max(dot(norm, lightDirection), 0.0) * lightColor * material.diffuse;
/* 漫反射 */

/* 镜面反射 */
    vec3 halfWayDirection = normalize(lightDirection + viewDirection);
    float spec = pow(max(dot(norm, halfWayDirection), 0.0), material.shininess);
    vec3 specular = material.specular * spec * lightColor;
/* 镜面反射 */

    return BlinnPhongParams(ambient, diffuse, specular, 1.0);
}

BlinnPhongParams calcBlinnPhong(vec3 lightDirection, vec3 lightPosition, vec3 cameraPosition, vec3 lightColor, LightAttenuation lightAttenuation, bool attenuation) {

    BlinnPhongParams blinnPhongParams = calcBlinnPhong(lightDirection, lightPosition, cameraPosition, lightColor);

    if (attenuation) {
    /*衰减分量*/
        float distance = length(lightPosition - FragPosition);
        float attenuation = 1.0 / (lightAttenuation.constant + lightAttenuation.linear * distance + lightAttenuation.quadratic * distance * distance);
    /*衰减分量*/

        blinnPhongParams.attenuation = attenuation;
    }
    return blinnPhongParams;
}

BlinnPhongParams calcBlinnPhong(vec3 lightPosition, vec3 cameraPosition, vec3 lightColor) {
    vec3 lightDirection = normalize(lightPosition - FragPosition);
    return calcBlinnPhong(lightDirection, lightPosition, cameraPosition, lightColor);
}

BlinnPhongParams calcBlinnPhong(vec3 lightPosition, vec3 cameraPosition, vec3 lightColor, LightAttenuation lightAttenuation, bool attenuation) {
    vec3 lightDirection = normalize(lightPosition - FragPosition);
    return calcBlinnPhong(lightDirection, lightPosition, cameraPosition, lightColor, lightAttenuation, attenuation);
}


/*--------------------------------------------------ambient light--------------------------------------------------*/
vec3 calcAmbientLight(AmbientLightItem ambientLightItem) {
    return ambientLightItem.lightColor * ambientLightItem.strength;
}
/*--------------------------------------------------ambient light--------------------------------------------------*/

/*--------------------------------------------------点光源--------------------------------------------------*/

vec3 calcPointLight(PointLightItem pointLightItem) {
    LightAttenuation lightAttenuation = pointLightItem.lightAttenuation;
    BlinnPhongParams params = calcBlinnPhong(pointLightItem.lightPosition, cameraPosition, pointLightItem.lightColor, lightAttenuation, true);
    return params.ambient * pointLightItem.ambient + (params.diffuse * pointLightItem.diffuse + params.specular * pointLightItem.specular) * params.attenuation;
}
/*--------------------------------------------------点光源--------------------------------------------------*/

/*--------------------------------------------------spot light--------------------------------------------------*/
vec3 calcSpotLight(SpotLightItem spotLightItem) {
    LightAttenuation lightAttenuation = spotLightItem.lightAttenuation;
    BlinnPhongParams params = calcBlinnPhong(spotLightItem.lightPosition, cameraPosition, spotLightItem.lightColor, lightAttenuation, true);

    vec3 lightDirection = normalize(spotLightItem.lightPosition - FragPosition);
/* spotLight计算 */
    float theta = dot(lightDirection, normalize(-spotLightItem.direction));
    // 在cutOff和outCutOff中插值
    float strength = clamp((theta - spotLightItem.outCutOff) / (spotLightItem.cutOff - spotLightItem.outCutOff), 0.0, 1.0);
/* spotLight计算 */
    return params.ambient * spotLightItem.ambient + (params.diffuse * spotLightItem.diffuse + params.specular * spotLightItem.specular) * params.attenuation * strength;
}
/*--------------------------------------------------spot light--------------------------------------------------*/
/*--------------------------------------------------direction light--------------------------------------------------*/
vec3 calcDirectLight(BlinnPhongParams params) {
    return params.ambient + params.diffuse + params.specular;
}
vec3 calcDirectLight(DirectLightItem directLightItem) {
    BlinnPhongParams params = calcBlinnPhong(directLightItem.lightDirection, vec3(0.0, 0.0, 0.0), cameraPosition, directLightItem.lightColor);
    return calcDirectLight(params) * directLightItem.strength;
}
/*--------------------------------------------------direction light--------------------------------------------------*/

// 含光照
void main() {
/* Blinn-Phong 光照 */
    // AmbientLight
    vec3 lightWeight = vec3(0.04, 0.04, 0.04);
    // ambientLight
    for (int i = 0; i < ambientLightArrLength; i++) {
        AmbientLightItem ambientLightItem = ambientLightArr[i];
        lightWeight += calcAmbientLight(ambientLightItem);
    }

//    // pointLight
//    for (int i = 0; i < pointLightArrLength; i++) {
//        PointLightItem pointLightItem = pointLightArr[i];
//        lightWeight += calcPointLight(pointLightItem);
//    }
//
//    // spotLight
//    for (int i = 0; i < spotLightArrLength; i++) {
//        SpotLightItem spotLightItem = spotLightArr[i];
//        lightWeight += calcSpotLight(spotLightItem);
//    }
//
    // directLight
    for (int i = 0; i < directLightArrLength; i++) {
        DirectLightItem directLightItem = directLightArr[i];
        lightWeight += calcDirectLight(directLightItem);
    }

/* Blinn-Phong 光照 */

    float texture0Operator = step(0.5, texture0Loaded);
    float texture1Operator = step(0.5, texture1Loaded);
    float texture2Operator = step(0.5, texture2Loaded);
    float texture3Operator = step(0.5, texture3Loaded);
    vec4 ModelColor = texture0Operator * texture(texture0, TexCoord) + texture1Operator * texture(texture1, TexCoord) + texture2Operator * texture(texture2, TexCoord) + texture3Operator * texture(texture3, TexCoord);
//    vec4 ModelColor = texture(texture0, TexCoord) + texture(texture1, TexCoord);
    FragColor = (ModelColor + Color) * vec4(lightWeight, 1.0);
//    FragColor = vec4(1.0, 0.0, 0.0, 1.0);
//    FragColor = vec4(directLightArr[0].lightDirection.x, 0.0, 0.0, 1.0)
//    FragColor = vec4(abs(Normal), 1.0);
//    FragColor = texture(texture0, TexCoord);
//    FragColor = vec4(texture0Operator, 0.0, 0.0, 1.0);
}