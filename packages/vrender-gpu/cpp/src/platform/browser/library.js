function makeAlert(text) {
  alert(text);
}

if (typeof mergeInto !== 'undefined')
  mergeInto(LibraryManager.library, {
    testExternalJSMethod: function () {
      alert('hello world, this is wasm');
    }
  });
