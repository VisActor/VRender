//
// Created by bytedance on 2021/3/7.
//

#include <iostream>
#include "Application.hpp"
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
    window->SetClearColor(1, 0, 0, 1);
    auto layer = window->AddLayer();
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

    application->mOnUpdate = [](IApplication* application1){
        auto *app = dynamic_cast<DarwinApplication *>(application1);
        if (app != nullptr) {
            app->mWindow->SetClearColor(Random(0.f, 1.f), Random(0.f, 1.f), Random(0.f, 1.f), 1.f);
            app->mDrawInThisFrame = true;
        }
//        window->SetClearColor(Random(0.f, 1.f), Random(0.f, 1.f), Random(0.f, 1.f), 1.f);
        return 0;
    };
    application->Start();
    bool needUpdateLabel{false};
    float compileShaderTime{0.f}, buildLayerTime{0.f}, drawTime{0.f};
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