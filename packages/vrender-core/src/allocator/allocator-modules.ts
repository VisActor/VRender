// import { DefaultCanvasAllocate } from './canvas-allocate';
// import {
//   DefaultRectAllocate,
//   DefaultArcAllocate,
//   DefaultAreaAllocate,
//   DefaultLineAllocate,
//   DefaultPathAllocate,
//   DefaultSymbolAllocate,
//   DefaultTextAllocate,
//   DefaultCircleAllocate
// } from './graphic-allocate';
// import {
//   CanvasAllocate,
//   RectAllocate,
//   ArcAllocate,
//   AreaAllocate,
//   LineAllocate,
//   PathAllocate,
//   SymbolAllocate,
//   TextAllocate,
//   CircleAllocate
// } from './constants';
// import { DefaultMat4Allocate, DefaultMatrixAllocate, Mat4Allocate, MatrixAllocate } from './matrix-allocate';

// export default new ContainerModule(bind => {
//   bind(DefaultMatrixAllocate).toSelf().inSingletonScope();
//   bind(MatrixAllocate).toService(DefaultMatrixAllocate);

//   bind(DefaultMat4Allocate).toSelf().inSingletonScope();
//   bind(Mat4Allocate).toService(DefaultMat4Allocate);

//   bind(DefaultCanvasAllocate).toSelf().inSingletonScope();
//   bind(CanvasAllocate).toService(DefaultCanvasAllocate);

//   bind(DefaultRectAllocate).toSelf().inSingletonScope();
//   bind(RectAllocate).toService(DefaultRectAllocate);

//   bind(DefaultCircleAllocate).toSelf().inSingletonScope();
//   bind(CircleAllocate).toService(DefaultCircleAllocate);

//   bind(DefaultArcAllocate).toSelf().inSingletonScope();
//   bind(ArcAllocate).toService(DefaultArcAllocate);

//   bind(DefaultAreaAllocate).toSelf().inSingletonScope();
//   bind(AreaAllocate).toService(DefaultAreaAllocate);

//   bind(DefaultLineAllocate).toSelf().inSingletonScope();
//   bind(LineAllocate).toService(DefaultLineAllocate);

//   bind(DefaultPathAllocate).toSelf().inSingletonScope();
//   bind(PathAllocate).toService(DefaultPathAllocate);

//   bind(DefaultSymbolAllocate).toSelf().inSingletonScope();
//   bind(SymbolAllocate).toService(DefaultSymbolAllocate);

//   bind(DefaultTextAllocate).toSelf().inSingletonScope();
//   bind(TextAllocate).toService(DefaultTextAllocate);
// });
