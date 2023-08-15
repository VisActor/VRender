var addon = require('bindings')('vrender-node');

// addon.createApplication(200, () => {
//   console.log('=============abc==============');
// });
const application = new addon.Application();
console.log(application);
application.CreateWindow(600, 600, '这是nodejs');
let frame = 0;
application.Start(
  100,
  () => {
    console.log('=============abc==============');
  },
  (a, b, c) => {
    console.log(a, b, c);
    application.SetClearColor(Math.random(), Math.random(), Math.random(), 1);
    return frame++ < 100;
  }
);
