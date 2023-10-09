//
// Created by bytedance on 2021/3/7.
//

#include <iostream>
#include "Application.hpp"
#include "BoxGeometry.hpp"
#include "SphereGeometry.hpp"
#include "MeshBasicMaterial.hpp"
#include "MeshPhongMaterial.hpp"
#include "Mesh.hpp"
#include "Model.hpp"
#include "Sprite.hpp"
#include "DirectLight.hpp"
#include "AmbientLight.hpp"
//#include "Group.hpp"
//#include "Rect.hpp"
//#include "Text.hpp"
//#include "Line.hpp"

int main() {
    auto *application = new DarwinApplication();
    if (application->Init()) {
        std::cout<<"初始化application失败"<<std::endl;
    }
    auto *window = application->CreateWindow({1200, 600, "这是标题"});
    window->SetClearColor(0, 0, 1, 1);
    auto camera = std::make_shared<PerspectiveCamera>(glm::radians(45.0f), 800.0f / 600.0f, 0.1f, 100.0f);
    camera->SetPosition(0.f, 0.f, 10.f);
    window->SetCamera(camera);

    auto phongMaterial = std::make_shared<MeshPhongMaterial>();
    phongMaterial->Init(application->GetResourceManager());
//    phongMaterial->mColor.r = 1.f;
//    phongMaterial->mColor.g = 1.f;
//    phongMaterial->mColor.b = 0.f;

    auto material = std::make_shared<MeshBasicMaterial>();
    material->Init(application->GetResourceManager());
//    material->mColor.r = 1.f;
//    material->mColor.g = 1.f;
//    material->mColor.b = 1.f;

    auto resourceManager = application->GetResourceManager();
    auto texture = resourceManager->LoadTexture("../../resources/image/world-map.jpg", true, "worldmap", false);
    material->mTextures.push_back({texture, "texture_diffuse"});
    phongMaterial->mTextures.push_back({texture, "texture_diffuse"});

    auto layer = window->AddLayer();
    auto sphereGeo = std::make_shared<SphereGeometry>();
    sphereGeo->InIt(10);


    auto mesh1 = std::make_shared<Mesh>();
    mesh1->Init(sphereGeo, phongMaterial);
    auto model1 = std::make_shared<Model>();
    model1->Init(mesh1);
    auto sphereSprite = std::make_shared<Sprite>();
    sphereSprite->Init(model1);
    layer->AppendChild(sphereSprite);
    sphereSprite->SetRotateX(-90);
    sphereSprite->SetPosition({-10.f, 0.f, -20.f});

    auto cubeGeo = std::make_shared<BoxGeometry>();
    cubeGeo->InIt(10);
    auto mesh2 = std::make_shared<Mesh>();
    mesh2->Init(cubeGeo, phongMaterial);
    auto model2 = std::make_shared<Model>();
    model2->Init(mesh2);
    auto cubeSprite = std::make_shared<Sprite>();
    cubeSprite->Init(model2);
    cubeSprite->SetPosition({2.f, 0.f, 0.f});
    layer->AppendChild(cubeSprite);


    auto model3 = std::make_shared<Model>();
//    model3->Init("../../resources/model/obj/female02/female02.obj", resourceManager);
//    model3->Init("../../resources/model/obj/male02/male02.obj", resourceManager);
//    model3->Init("../../resources/model/glb/LittlestTokyo.glb", resourceManager);
//    model3->Init("../../resources/model/glb/ferrari.glb", resourceManager);
    model3->Init("../../resources/model/glb/Parrot.glb", resourceManager);
    auto modelSprite = std::make_shared<Sprite>();
    modelSprite->Init(model3);
    modelSprite->SetPosition({0.f, 0.f, 0.f});
    modelSprite->SetScale(glm::vec3{.03f});
    modelSprite->SetRotateX(90.f);
    layer->AppendChild(modelSprite);

    auto ambientLight = std::make_shared<AmbientLight>();
    auto directLight = std::make_shared<DirectLight>();

    window->AddLight(ambientLight);
    window->AddLight(directLight);
//    auto group = std::make_shared<Group>(0, 0);
//    auto rect1 = std::make_shared<Rect>(200, 200, 100, 100);
//    rect1->SetBorderRadius(20, 30, 20, 30);
//    rect1->SetFillColor(1.0, 0.6, 0.2, 0.6);
//    auto rect2 = std::make_shared<Rect>(20, 20, 60, 60);
//    rect2->SetBorderRadius(6, 8, 9, 8);
//    rect2->SetFillColor(0.2, 0.8, 0.7, 1.0);
//    rect2->SetStrokeColor(1.0, 0.8, 0.2, 1.0);
//    rect2->SetStrokeWidth(12.f);
//    rect2->SetStroke(true);
//    rect2->SetFill(true);
//    layer->AppendChild(group);
//    group->AppendChild(rect2);
//    group->AppendChild(rect1);
//    std::vector<std::shared_ptr<Rect>> rectList{};
//    auto label = std::make_shared<Text>(0, 20, "机器语言，单线程");
//    label->SetFontSize(26);
//    group->AppendChild(label);
//    auto line = std::make_shared<Line>(0.f, 0.f);
//    line->AddPoint({20.f, 20.f});
//    line->AddPoint({20.f, 60.f});
//    line->AddPoint({120.f, 10.f});
//    line->AddPoint({80.f, 200.f});
//    line->AddPoint({76.f, 60.f});
//    line->SetStroke(true);
//    line->SetClose(false);
//    line->SetLineDash({2.f, 2.f});
//    line->SetStrokeColor(.6f, .2f, .8f, 1.f);
//    line->SetStrokeWidth(6.f);
//    group->AppendChild(line);
//
//    for (int i = 0; i < 100000; i++) {
//        auto x = Random(0.f, 1200.f), y = Random(0.f, 1200.f);
//        auto w = Random(10.f, 30.f), h = Random(10.f, 30.f);
//        auto rect = std::make_shared<Rect>(x, y, w, h);
//        rect->SetFillColor(.6f, 0.f, .2f, 1.f);
//        rect->SetStrokeColor(1.f, 0.f, 0.f, 1.f);
//        rect->SetStrokeWidth(Random(0, 2));
//        rect->SetStroke(true);
//        rect->SetBorderRadius(Random(0, 2), Random(0, 2), Random(0, 2), Random(0, 2));
//        group->AppendChild(rect);
//        rectList.push_back(rect);
//    }

//    application->mOnStart = [](IApplication* application1) {
//        // 创建一个box
//        const auto geometry = std::make_shared<BoxGeometry>();
//        geometry->InIt(10);
//        const auto material = std::make_shared<MeshBasicMaterial>();
//        material->Init();
//        const auto mesh = std::make_shared<Mesh>();
//        mesh->Init(geometry, material);
//        const auto model = std::make_shared<Model>();
//        model->Init(mesh);
//        const auto sprite = std::make_shared<Sprite>();
//        sprite->Init(model);
//        return 0;
//    };
    int i = 0;
    application->mOnUpdate = [&](IApplication* application1){
        auto *app = dynamic_cast<DarwinApplication *>(application1);
        if (app != nullptr) {
            i++;
            sphereSprite->SetRotateZ(i * 0.1);
            cubeSprite->SetRotateZ(i * 0.1);
            cubeSprite->SetRotateX(i * 0.1);
            modelSprite->SetRotateX(i * 0.1);
            modelSprite->SetRotateY(i * 0.1);
            modelSprite->SetRotateZ(i * 0.1);
//            cubeSprite->SetPosition({i * 0.001, 0, 0});
//            material->mColor.r = Random(0.f, 1.f);
//            material->mColor.g = Random(0.f, 1.f);
//            material->mColor.b = Random(0.f, 1.f);
            app->mWindow->SetClearColor(Random(0.f, 1.f), Random(0.f, 1.f), Random(0.f, 1.f), 1.f);
            app->mDrawInThisFrame = true;
        }
//        window->SetClearColor(Random(0.f, 1.f), Random(0.f, 1.f), Random(0.f, 1.f), 1.f);
        return 0;
    };
    application->Start();
//    bool needUpdateLabel{false};
//    float compileShaderTime{0.f}, buildLayerTime{0.f}, drawTime{0.f};
//    while(true) {
//        if (window->IsDestroyed()) break;
//        window->SetClearColor(Random(0.f, 1.f), Random(0.f, 1.f), Random(0.f, 1.f), 1.f);
//        window->RenderAllLayer();
//        window->SwapFrame();
////        const auto &renderer = window->GetRenderer();
////        needUpdateLabel = false;
////        if (compileShaderTime != renderer.mPerformance.compileShaderTime) {
////            compileShaderTime = renderer.mPerformance.compileShaderTime;
////            needUpdateLabel = true;
////        }
////        if (buildLayerTime != renderer.mPerformance.buildLayerTime) {
////            buildLayerTime = renderer.mPerformance.buildLayerTime;
////            needUpdateLabel = true;
////        }
////        if (drawTime != renderer.mPerformance.drawTime) {
////            drawTime = renderer.mPerformance.drawTime;
////            needUpdateLabel = true;
////        }
////        label->SetText("机器语言，单线程，shader:" +
////            std::to_string(compileShaderTime) + "ms，build:" +
////            std::to_string(buildLayerTime) + "ms，render:" +
////            std::to_string(drawTime) + "ms");
////        for (auto &r : rectList) {
////            r->SetFillColor(Random(0.f, 1.f), Random(0.f, 1.f), Random(0.f, 1.f), 1.f);
////            r->SetStrokeColor(Random(0.f, 1.f), Random(0.f, 1.f), Random(0.f, 1.f), 1.f);
////        }
////        rect1->SetFillColor(Random(0.f, 1.f), Random(0.f, 1.f), Random(0.f, 1.f), 1.f);
////        rect1->SetStrokeColor(Random(0.f, 1.f), Random(0.f, 1.f), Random(0.f, 1.f), 1.f);
////        rect2->SetFillColor(Random(0.f, 1.f), Random(0.f, 1.f), Random(0.f, 1.f), 1.f);
////        rect2->SetStrokeColor(Random(0.f, 1.f), Random(0.f, 1.f), Random(0.f, 1.f), 1.f);
//    }
    return 0;
}