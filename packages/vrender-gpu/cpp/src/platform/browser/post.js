// Module.isInitialized = isInitialized;
// Module.addInitializationCb = addInitializationCb;
Module['isInitialized'] = isInitialized;
Module['addInitializationCb'] = addInitializationCb;
Module['onRuntimeInitialized'] = onRuntimeInitialized;
Module['onRuntimeFailed'] = onRuntimeFailed;
Module['addFailCb'] = addFailCb;

if (typeof exports === 'object') {
	exports.Module = Module;
  exports.ccall = ccall;
  exports.getValue = getValue;
  exports._getNum = _getNum;
  exports._createBuffer = _createBuffer;
  exports._freeBuffer = _freeBuffer;
  exports._callJS = _callJS;

  exports._addInitializationCb = addInitializationCb;
  exports._isInitialized = isInitialized;
  exports._addFailCb = addFailCb;
  
  // 定义模块导出属性
  exports.Module = Module
}

// (function(global, factory) {

// 	"use strict";

// 	if ( typeof module === "object" && typeof module.exports === "object" ) {

// 		// For CommonJS and CommonJS-like environments where a proper `window`
// 		// is present, execute the factory and get jQuery.
// 		// For environments that do not have a `window` with a `document`
// 		// (such as Node.js), expose a factory as module.exports.
// 		// This accentuates the need for the creation of a real `window`.
// 		// e.g. var jQuery = require("jquery")(window);
// 		// See ticket #14549 for more info.
// 		module.exports = global.document ?
// 			factory(global, true) :
// 			function(w) {
// 				if (!w.document) {
// 					throw new Error( "jQuery requires a window with a document" );
// 				}
// 				return factory(w);
// 			};
// 	} else {
// 		factory(global);
// 	}

// // Pass this if window is not defined yet
// })(typeof window !== "undefined" ? window : this, function(exports, noGlobal) {
//   exports.Module = Module;
//   exports.ccall = ccall;
//   exports.getValue = getValue;
//   exports._getNum = _getNum;
//   exports._createBuffer = _createBuffer;
//   exports._freeBuffer = _freeBuffer;
//   exports._callJS = _callJS;

//   exports._addInitializationCb = addInitializationCb;
//   exports._isInitialized = isInitialized;
//   exports._addFailCb = addFailCb;
  
//   // 定义模块导出属性
//   exports.Module = Module
// });
