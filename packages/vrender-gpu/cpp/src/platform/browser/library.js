function makeAlert(text) {
  alert(text);
}

if (typeof mergeInto !== 'undefined') mergeInto(LibraryManager.library, {
  testExternalJSMethod: function() {
    // makeAlert("Hello world");
  },
  createWindow: function(x, y, w, h, id) {
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    canvas.id = 'vrender_' + id;
    document.body.appendChild(canvas);
    const dpr = window.devicePixelRatio;
    canvas.style.width = `${w / dpr}px`;
    canvas.style.height = `${h / dpr}px`;
    // const context = canvas.getContext("webgl2");
  }
});