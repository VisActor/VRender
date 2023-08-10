# 搭建Clion开发环境
## 1. 配置emscripten环境
在根目录中执行npm run init，会安装emscripten环境
## 2. 在Clion中配置ToolChain和CMake
### 配置ToolChain
ToolChain是CMake中用于设置对应的编译器等的配置，我们这里选择emscripten中的ToolChain
* 打开Clion的perferences -> Build,Execution,Deployment，找到Toolchains目录
* 左侧点击添加，name输入Emscripten，C Compiler选择emsdk/upstream/emscripten/emcc；C++ Compiler选择emsdk/upstream/emscripten/em++
### 配置CMake
CMake中左侧点击添加，name输入wasm，Toolchain选择刚才添加的Emscripten，CMakeOptions输入
```shell
-DCMAKE_TOOLCHAIN_FILE={项目路径}/emsdk/upstream/emscripten/cmake/Modules/Platform/Emscripten.cmake
-DCMAKE_CROSSCOMPILING_EMULATOR={项目路径}/emsdk/node/14.18.2_64bit/bin/node
-DCMAKE_BUILD_TYPE=Release
```
Environment输入`EMCC_DEBUG=0;WASMENV=1`，然后选择ok

## 3. 运行