module.exports = (function() {
var __MODS__ = {};
var __DEFINE__ = function(modId, func, req) { var m = { exports: {}, _tempexports: {} }; __MODS__[modId] = { status: 0, func: func, req: req, m: m }; };
var __REQUIRE__ = function(modId, source) { if(!__MODS__[modId]) return require(source); if(!__MODS__[modId].status) { var m = __MODS__[modId].m; m._exports = m._tempexports; var desp = Object.getOwnPropertyDescriptor(m, "exports"); if (desp && desp.configurable) Object.defineProperty(m, "exports", { set: function (val) { if(typeof val === "object" && val !== m._exports) { m._exports.__proto__ = val.__proto__; Object.keys(val).forEach(function (k) { m._exports[k] = val[k]; }); } m._tempexports = val }, get: function () { return m._tempexports; } }); __MODS__[modId].status = 1; __MODS__[modId].func(__MODS__[modId].req, m, m.exports); } return __MODS__[modId].m.exports; };
var __REQUIRE_WILDCARD__ = function(obj) { if(obj && obj.__esModule) { return obj; } else { var newObj = {}; if(obj != null) { for(var k in obj) { if (Object.prototype.hasOwnProperty.call(obj, k)) newObj[k] = obj[k]; } } newObj.default = obj; return newObj; } };
var __REQUIRE_DEFAULT__ = function(obj) { return obj && obj.__esModule ? obj.default : obj; };
__DEFINE__(1689069768004, function(require, module, exports) {


var __createBinding = this && this.__createBinding || (Object.create ? function(o, m, k, k2) {
    void 0 === k2 && (k2 = k);
    var desc = Object.getOwnPropertyDescriptor(m, k);
    desc && !("get" in desc ? !m.__esModule : desc.writable || desc.configurable) || (desc = {
        enumerable: !0,
        get: function() {
            return m[k];
        }
    }), Object.defineProperty(o, k2, desc);
} : function(o, m, k, k2) {
    void 0 === k2 && (k2 = k), o[k2] = m[k];
}), __setModuleDefault = this && this.__setModuleDefault || (Object.create ? function(o, v) {
    Object.defineProperty(o, "default", {
        enumerable: !0,
        value: v
    });
} : function(o, v) {
    o.default = v;
}), __exportStar = this && this.__exportStar || function(m, exports) {
    for (var p in m) "default" === p || Object.prototype.hasOwnProperty.call(exports, p) || __createBinding(exports, m, p);
}, __importStar = this && this.__importStar || function(mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (null != mod) for (var k in mod) "default" !== k && Object.prototype.hasOwnProperty.call(mod, k) && __createBinding(result, mod, k);
    return __setModuleDefault(result, mod), result;
}, __importDefault = this && this.__importDefault || function(mod) {
    return mod && mod.__esModule ? mod : {
        default: mod
    };
};

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.Logger = exports.ColorUtil = exports.EventEmitter = void 0;

const eventemitter3_1 = __importDefault(require("eventemitter3"));

exports.EventEmitter = eventemitter3_1.default, __exportStar(require("./common"), exports), 
__exportStar(require("./data-structure"), exports), __exportStar(require("./lru"), exports), 
__exportStar(require("./math"), exports), __exportStar(require("./angle"), exports), 
exports.ColorUtil = __importStar(require("./color")), __exportStar(require("./graphics"), exports), 
__exportStar(require("./type"), exports), exports.Logger = __importStar(require("./logger")), 
__exportStar(require("./padding"), exports), __exportStar(require("./time"), exports), 
__exportStar(require("./dom"), exports), __exportStar(require("./geo"), exports);
//# sourceMappingURL=index.js.map
}, function(modId) {var map = {"./common":1689069768005,"./data-structure":1689069768064,"./lru":1689069768071,"./math":1689069768067,"./angle":1689069768070,"./color":1689069768072,"./graphics":1689069768079,"./type":1689069768094,"./logger":1689069768095,"./padding":1689069768096,"./time":1689069768097,"./dom":1689069768100,"./geo":1689069768101}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1689069768005, function(require, module, exports) {


var __createBinding = this && this.__createBinding || (Object.create ? function(o, m, k, k2) {
    void 0 === k2 && (k2 = k);
    var desc = Object.getOwnPropertyDescriptor(m, k);
    desc && !("get" in desc ? !m.__esModule : desc.writable || desc.configurable) || (desc = {
        enumerable: !0,
        get: function() {
            return m[k];
        }
    }), Object.defineProperty(o, k2, desc);
} : function(o, m, k, k2) {
    void 0 === k2 && (k2 = k), o[k2] = m[k];
}), __exportStar = this && this.__exportStar || function(m, exports) {
    for (var p in m) "default" === p || Object.prototype.hasOwnProperty.call(exports, p) || __createBinding(exports, m, p);
}, __importDefault = this && this.__importDefault || function(mod) {
    return mod && mod.__esModule ? mod : {
        default: mod
    };
};

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.lowerFirst = exports.toValidNumber = exports.toNumber = exports.toDate = exports.throttle = exports.debounce = exports.clamper = exports.clampRange = exports.clamp = exports.uuid = exports.truncate = exports.pad = exports.constant = exports.tickStep = exports.variance = exports.median = exports.deviation = exports.bisect = exports.ascending = exports.range = exports.isShallowEqual = exports.isEqual = exports.pickWithout = exports.pick = exports.merge = exports.cloneDeep = exports.clone = exports.has = exports.get = exports.isEmpty = exports.isBase64 = exports.isRegExp = exports.isValidUrl = exports.isValidNumber = exports.isNumeric = exports.isNumber = exports.isDate = exports.isArrayLike = exports.isArray = exports.isString = exports.isUndefined = exports.isType = exports.isPlainObject = exports.isObjectLike = exports.isObject = exports.isValid = exports.isNull = exports.isNil = exports.isFunction = exports.isBoolean = void 0, 
exports.upperFirst = void 0;

var isBoolean_1 = require("./isBoolean");

Object.defineProperty(exports, "isBoolean", {
    enumerable: !0,
    get: function() {
        return __importDefault(isBoolean_1).default;
    }
});

var isFunction_1 = require("./isFunction");

Object.defineProperty(exports, "isFunction", {
    enumerable: !0,
    get: function() {
        return __importDefault(isFunction_1).default;
    }
});

var isNil_1 = require("./isNil");

Object.defineProperty(exports, "isNil", {
    enumerable: !0,
    get: function() {
        return __importDefault(isNil_1).default;
    }
});

var isNull_1 = require("./isNull");

Object.defineProperty(exports, "isNull", {
    enumerable: !0,
    get: function() {
        return __importDefault(isNull_1).default;
    }
});

var isValid_1 = require("./isValid");

Object.defineProperty(exports, "isValid", {
    enumerable: !0,
    get: function() {
        return __importDefault(isValid_1).default;
    }
});

var isObject_1 = require("./isObject");

Object.defineProperty(exports, "isObject", {
    enumerable: !0,
    get: function() {
        return __importDefault(isObject_1).default;
    }
});

var isObjectLike_1 = require("./isObjectLike");

Object.defineProperty(exports, "isObjectLike", {
    enumerable: !0,
    get: function() {
        return __importDefault(isObjectLike_1).default;
    }
});

var isPlainObject_1 = require("./isPlainObject");

Object.defineProperty(exports, "isPlainObject", {
    enumerable: !0,
    get: function() {
        return __importDefault(isPlainObject_1).default;
    }
});

var isType_1 = require("./isType");

Object.defineProperty(exports, "isType", {
    enumerable: !0,
    get: function() {
        return __importDefault(isType_1).default;
    }
});

var isUndefined_1 = require("./isUndefined");

Object.defineProperty(exports, "isUndefined", {
    enumerable: !0,
    get: function() {
        return __importDefault(isUndefined_1).default;
    }
});

var isString_1 = require("./isString");

Object.defineProperty(exports, "isString", {
    enumerable: !0,
    get: function() {
        return __importDefault(isString_1).default;
    }
});

var isArray_1 = require("./isArray");

Object.defineProperty(exports, "isArray", {
    enumerable: !0,
    get: function() {
        return __importDefault(isArray_1).default;
    }
});

var isArrayLike_1 = require("./isArrayLike");

Object.defineProperty(exports, "isArrayLike", {
    enumerable: !0,
    get: function() {
        return __importDefault(isArrayLike_1).default;
    }
});

var isDate_1 = require("./isDate");

Object.defineProperty(exports, "isDate", {
    enumerable: !0,
    get: function() {
        return __importDefault(isDate_1).default;
    }
});

var isNumber_1 = require("./isNumber");

Object.defineProperty(exports, "isNumber", {
    enumerable: !0,
    get: function() {
        return __importDefault(isNumber_1).default;
    }
});

var isNumeric_1 = require("./isNumeric");

Object.defineProperty(exports, "isNumeric", {
    enumerable: !0,
    get: function() {
        return __importDefault(isNumeric_1).default;
    }
});

var isValidNumber_1 = require("./isValidNumber");

Object.defineProperty(exports, "isValidNumber", {
    enumerable: !0,
    get: function() {
        return __importDefault(isValidNumber_1).default;
    }
});

var isValidUrl_1 = require("./isValidUrl");

Object.defineProperty(exports, "isValidUrl", {
    enumerable: !0,
    get: function() {
        return __importDefault(isValidUrl_1).default;
    }
});

var isRegExp_1 = require("./isRegExp");

Object.defineProperty(exports, "isRegExp", {
    enumerable: !0,
    get: function() {
        return __importDefault(isRegExp_1).default;
    }
});

var isBase64_1 = require("./isBase64");

Object.defineProperty(exports, "isBase64", {
    enumerable: !0,
    get: function() {
        return __importDefault(isBase64_1).default;
    }
});

var isEmpty_1 = require("./isEmpty");

Object.defineProperty(exports, "isEmpty", {
    enumerable: !0,
    get: function() {
        return __importDefault(isEmpty_1).default;
    }
});

var get_1 = require("./get");

Object.defineProperty(exports, "get", {
    enumerable: !0,
    get: function() {
        return __importDefault(get_1).default;
    }
});

var has_1 = require("./has");

Object.defineProperty(exports, "has", {
    enumerable: !0,
    get: function() {
        return __importDefault(has_1).default;
    }
});

var clone_1 = require("./clone");

Object.defineProperty(exports, "clone", {
    enumerable: !0,
    get: function() {
        return __importDefault(clone_1).default;
    }
});

var cloneDeep_1 = require("./cloneDeep");

Object.defineProperty(exports, "cloneDeep", {
    enumerable: !0,
    get: function() {
        return __importDefault(cloneDeep_1).default;
    }
});

var merge_1 = require("./merge");

Object.defineProperty(exports, "merge", {
    enumerable: !0,
    get: function() {
        return __importDefault(merge_1).default;
    }
});

var pick_1 = require("./pick");

Object.defineProperty(exports, "pick", {
    enumerable: !0,
    get: function() {
        return __importDefault(pick_1).default;
    }
});

var pickWithout_1 = require("./pickWithout");

Object.defineProperty(exports, "pickWithout", {
    enumerable: !0,
    get: function() {
        return __importDefault(pickWithout_1).default;
    }
});

var isEqual_1 = require("./isEqual");

Object.defineProperty(exports, "isEqual", {
    enumerable: !0,
    get: function() {
        return isEqual_1.isEqual;
    }
});

var isShallowEqual_1 = require("./isShallowEqual");

Object.defineProperty(exports, "isShallowEqual", {
    enumerable: !0,
    get: function() {
        return isShallowEqual_1.isShallowEqual;
    }
}), __exportStar(require("./mixin"), exports), __exportStar(require("./array"), exports);

var range_1 = require("./range");

Object.defineProperty(exports, "range", {
    enumerable: !0,
    get: function() {
        return range_1.range;
    }
});

var ascending_1 = require("./ascending");

Object.defineProperty(exports, "ascending", {
    enumerable: !0,
    get: function() {
        return ascending_1.ascending;
    }
}), __exportStar(require("./quantileSorted"), exports);

var bisect_1 = require("./bisect");

Object.defineProperty(exports, "bisect", {
    enumerable: !0,
    get: function() {
        return bisect_1.bisect;
    }
});

var deviation_1 = require("./deviation");

Object.defineProperty(exports, "deviation", {
    enumerable: !0,
    get: function() {
        return deviation_1.deviation;
    }
});

var median_1 = require("./median");

Object.defineProperty(exports, "median", {
    enumerable: !0,
    get: function() {
        return median_1.median;
    }
});

var variance_1 = require("./variance");

Object.defineProperty(exports, "variance", {
    enumerable: !0,
    get: function() {
        return variance_1.variance;
    }
});

var tickStep_1 = require("./tickStep");

Object.defineProperty(exports, "tickStep", {
    enumerable: !0,
    get: function() {
        return tickStep_1.tickStep;
    }
}), __exportStar(require("./number"), exports);

var constant_1 = require("./constant");

Object.defineProperty(exports, "constant", {
    enumerable: !0,
    get: function() {
        return __importDefault(constant_1).default;
    }
});

var pad_1 = require("./pad");

Object.defineProperty(exports, "pad", {
    enumerable: !0,
    get: function() {
        return __importDefault(pad_1).default;
    }
});

var truncate_1 = require("./truncate");

Object.defineProperty(exports, "truncate", {
    enumerable: !0,
    get: function() {
        return __importDefault(truncate_1).default;
    }
});

var uuid_1 = require("./uuid");

Object.defineProperty(exports, "uuid", {
    enumerable: !0,
    get: function() {
        return __importDefault(uuid_1).default;
    }
});

var clamp_1 = require("./clamp");

Object.defineProperty(exports, "clamp", {
    enumerable: !0,
    get: function() {
        return __importDefault(clamp_1).default;
    }
});

var clampRange_1 = require("./clampRange");

Object.defineProperty(exports, "clampRange", {
    enumerable: !0,
    get: function() {
        return __importDefault(clampRange_1).default;
    }
});

var clamper_1 = require("./clamper");

Object.defineProperty(exports, "clamper", {
    enumerable: !0,
    get: function() {
        return clamper_1.clamper;
    }
});

var debounce_1 = require("./debounce");

Object.defineProperty(exports, "debounce", {
    enumerable: !0,
    get: function() {
        return __importDefault(debounce_1).default;
    }
});

var throttle_1 = require("./throttle");

Object.defineProperty(exports, "throttle", {
    enumerable: !0,
    get: function() {
        return __importDefault(throttle_1).default;
    }
}), __exportStar(require("./interpolate"), exports);

var toDate_1 = require("./toDate");

Object.defineProperty(exports, "toDate", {
    enumerable: !0,
    get: function() {
        return toDate_1.toDate;
    }
});

var toNumber_1 = require("./toNumber");

Object.defineProperty(exports, "toNumber", {
    enumerable: !0,
    get: function() {
        return toNumber_1.toNumber;
    }
});

var toValidNumber_1 = require("./toValidNumber");

Object.defineProperty(exports, "toValidNumber", {
    enumerable: !0,
    get: function() {
        return toValidNumber_1.toValidNumber;
    }
});

var lowerFirst_1 = require("./lowerFirst");

Object.defineProperty(exports, "lowerFirst", {
    enumerable: !0,
    get: function() {
        return __importDefault(lowerFirst_1).default;
    }
});

var upperFirst_1 = require("./upperFirst");

Object.defineProperty(exports, "upperFirst", {
    enumerable: !0,
    get: function() {
        return __importDefault(upperFirst_1).default;
    }
});
//# sourceMappingURL=index.js.map
}, function(modId) { var map = {"./isBoolean":1689069768006,"./isFunction":1689069768008,"./isNil":1689069768009,"./isNull":1689069768010,"./isValid":1689069768011,"./isObject":1689069768012,"./isObjectLike":1689069768013,"./isPlainObject":1689069768014,"./isType":1689069768007,"./isUndefined":1689069768015,"./isString":1689069768016,"./isArray":1689069768017,"./isArrayLike":1689069768018,"./isDate":1689069768019,"./isNumber":1689069768020,"./isNumeric":1689069768021,"./isValidNumber":1689069768022,"./isValidUrl":1689069768023,"./isRegExp":1689069768024,"./isBase64":1689069768025,"./isEmpty":1689069768026,"./get":1689069768029,"./has":1689069768030,"./clone":1689069768031,"./cloneDeep":1689069768032,"./merge":1689069768033,"./pick":1689069768034,"./pickWithout":1689069768035,"./isEqual":1689069768036,"./isShallowEqual":1689069768037,"./mixin":1689069768038,"./array":1689069768039,"./range":1689069768040,"./ascending":1689069768041,"./quantileSorted":1689069768042,"./bisect":1689069768044,"./deviation":1689069768045,"./median":1689069768047,"./variance":1689069768046,"./tickStep":1689069768048,"./number":1689069768049,"./constant":1689069768050,"./pad":1689069768051,"./truncate":1689069768052,"./uuid":1689069768053,"./clamp":1689069768054,"./clampRange":1689069768055,"./clamper":1689069768056,"./debounce":1689069768057,"./throttle":1689069768058,"./interpolate":1689069768059,"./toDate":1689069768060,"./toNumber":1689069768043,"./toValidNumber":1689069768061,"./lowerFirst":1689069768062,"./upperFirst":1689069768063}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1689069768006, function(require, module, exports) {


var __importDefault = this && this.__importDefault || function(mod) {
    return mod && mod.__esModule ? mod : {
        default: mod
    };
};

Object.defineProperty(exports, "__esModule", {
    value: !0
});

const isType_1 = __importDefault(require("./isType")), isBoolean = (value, fuzzy = !1) => fuzzy ? "boolean" == typeof value : !0 === value || !1 === value || (0, 
isType_1.default)(value, "Boolean");

exports.default = isBoolean;
//# sourceMappingURL=isBoolean.js.map
}, function(modId) { var map = {"./isType":1689069768007}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1689069768007, function(require, module, exports) {


Object.defineProperty(exports, "__esModule", {
    value: !0
});

const isType = (value, type) => toString.call(value) === `[object ${type}]`;

exports.default = isType;
//# sourceMappingURL=isType.js.map
}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1689069768008, function(require, module, exports) {


Object.defineProperty(exports, "__esModule", {
    value: !0
});

const isFunction = value => "function" == typeof value;

exports.default = isFunction;
//# sourceMappingURL=isFunction.js.map
}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1689069768009, function(require, module, exports) {


Object.defineProperty(exports, "__esModule", {
    value: !0
});

const isNil = value => null == value;

exports.default = isNil;
//# sourceMappingURL=isNil.js.map
}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1689069768010, function(require, module, exports) {


Object.defineProperty(exports, "__esModule", {
    value: !0
});

const isNull = value => null === value;

exports.default = isNull;
//# sourceMappingURL=isNull.js.map
}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1689069768011, function(require, module, exports) {


Object.defineProperty(exports, "__esModule", {
    value: !0
});

const isValid = value => null != value;

exports.default = isValid;
//# sourceMappingURL=isValid.js.map
}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1689069768012, function(require, module, exports) {


Object.defineProperty(exports, "__esModule", {
    value: !0
});

const isObject = value => {
    const type = typeof value;
    return null !== value && "object" === type || "function" === type;
};

exports.default = isObject;
//# sourceMappingURL=isObject.js.map
}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1689069768013, function(require, module, exports) {


Object.defineProperty(exports, "__esModule", {
    value: !0
});

const isObjectLike = value => "object" == typeof value && null !== value;

exports.default = isObjectLike;
//# sourceMappingURL=isObjectLike.js.map
}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1689069768014, function(require, module, exports) {


var __importDefault = this && this.__importDefault || function(mod) {
    return mod && mod.__esModule ? mod : {
        default: mod
    };
};

Object.defineProperty(exports, "__esModule", {
    value: !0
});

const isObjectLike_1 = __importDefault(require("./isObjectLike")), isType_1 = __importDefault(require("./isType")), isPlainObject = function(value) {
    if (!(0, isObjectLike_1.default)(value) || !(0, isType_1.default)(value, "Object")) return !1;
    if (null === Object.getPrototypeOf(value)) return !0;
    let proto = value;
    for (;null !== Object.getPrototypeOf(proto); ) proto = Object.getPrototypeOf(proto);
    return Object.getPrototypeOf(value) === proto;
};

exports.default = isPlainObject;
//# sourceMappingURL=isPlainObject.js.map
}, function(modId) { var map = {"./isObjectLike":1689069768013,"./isType":1689069768007}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1689069768015, function(require, module, exports) {


Object.defineProperty(exports, "__esModule", {
    value: !0
});

const isUndefined = value => void 0 === value;

exports.default = isUndefined;
//# sourceMappingURL=isUndefined.js.map
}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1689069768016, function(require, module, exports) {


var __importDefault = this && this.__importDefault || function(mod) {
    return mod && mod.__esModule ? mod : {
        default: mod
    };
};

Object.defineProperty(exports, "__esModule", {
    value: !0
});

const isType_1 = __importDefault(require("./isType")), isString = (value, fuzzy = !1) => {
    const type = typeof value;
    return fuzzy ? "string" === type : "string" === type || (0, isType_1.default)(value, "String");
};

exports.default = isString;
//# sourceMappingURL=isString.js.map
}, function(modId) { var map = {"./isType":1689069768007}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1689069768017, function(require, module, exports) {


var __importDefault = this && this.__importDefault || function(mod) {
    return mod && mod.__esModule ? mod : {
        default: mod
    };
};

Object.defineProperty(exports, "__esModule", {
    value: !0
});

const isType_1 = __importDefault(require("./isType")), isArray = value => Array.isArray ? Array.isArray(value) : (0, 
isType_1.default)(value, "Array");

exports.default = isArray;
//# sourceMappingURL=isArray.js.map
}, function(modId) { var map = {"./isType":1689069768007}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1689069768018, function(require, module, exports) {


Object.defineProperty(exports, "__esModule", {
    value: !0
});

const isArrayLike = function(value) {
    return null !== value && "function" != typeof value && Number.isFinite(value.length);
};

exports.default = isArrayLike;
}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1689069768019, function(require, module, exports) {


var __importDefault = this && this.__importDefault || function(mod) {
    return mod && mod.__esModule ? mod : {
        default: mod
    };
};

Object.defineProperty(exports, "__esModule", {
    value: !0
});

const isType_1 = __importDefault(require("./isType")), isDate = value => (0, isType_1.default)(value, "Date");

exports.default = isDate;
//# sourceMappingURL=isDate.js.map
}, function(modId) { var map = {"./isType":1689069768007}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1689069768020, function(require, module, exports) {


var __importDefault = this && this.__importDefault || function(mod) {
    return mod && mod.__esModule ? mod : {
        default: mod
    };
};

Object.defineProperty(exports, "__esModule", {
    value: !0
});

const isType_1 = __importDefault(require("./isType")), isNumber = (value, fuzzy = !1) => {
    const type = typeof value;
    return fuzzy ? "number" === type : "number" === type || (0, isType_1.default)(value, "Number");
};

exports.default = isNumber;
//# sourceMappingURL=isNumber.js.map
}, function(modId) { var map = {"./isType":1689069768007}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1689069768021, function(require, module, exports) {


Object.defineProperty(exports, "__esModule", {
    value: !0
});

const isNumeric = value => "string" == typeof value && (!isNaN(Number(value)) && !isNaN(parseFloat(value)));

exports.default = isNumeric;
//# sourceMappingURL=isNumeric.js.map
}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1689069768022, function(require, module, exports) {


var __importDefault = this && this.__importDefault || function(mod) {
    return mod && mod.__esModule ? mod : {
        default: mod
    };
};

Object.defineProperty(exports, "__esModule", {
    value: !0
});

const isNumber_1 = __importDefault(require("./isNumber")), isValidNumber = value => (0, 
isNumber_1.default)(value) && Number.isFinite(value);

exports.default = isValidNumber;
//# sourceMappingURL=isValidNumber.js.map
}, function(modId) { var map = {"./isNumber":1689069768020}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1689069768023, function(require, module, exports) {


Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.isValidUrl = void 0;

const isValidUrl = value => new RegExp(/^(http(s)?:\/\/)\w+[^\s]+(\.[^\s]+){1,}$/).test(value);

exports.isValidUrl = isValidUrl, exports.default = exports.isValidUrl;
//# sourceMappingURL=isValidUrl.js.map
}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1689069768024, function(require, module, exports) {


var __importDefault = this && this.__importDefault || function(mod) {
    return mod && mod.__esModule ? mod : {
        default: mod
    };
};

Object.defineProperty(exports, "__esModule", {
    value: !0
});

const isType_1 = __importDefault(require("./isType")), isRegExp = value => (0, isType_1.default)(value, "RegExp");

exports.default = isRegExp;
//# sourceMappingURL=isRegExp.js.map
}, function(modId) { var map = {"./isType":1689069768007}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1689069768025, function(require, module, exports) {


Object.defineProperty(exports, "__esModule", {
    value: !0
});

const isBase64 = value => new RegExp(/^data:image\/(?:gif|png|jpeg|bmp|webp)(?:;charset=utf-8)?;base64,(?:[A-Za-z0-9]|[+/])+={0,2}/g).test(value);

exports.default = isBase64;
//# sourceMappingURL=isBase64.js.map
}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1689069768026, function(require, module, exports) {


var __importDefault = this && this.__importDefault || function(mod) {
    return mod && mod.__esModule ? mod : {
        default: mod
    };
};

Object.defineProperty(exports, "__esModule", {
    value: !0
});

const isNil_1 = __importDefault(require("./isNil")), isArrayLike_1 = __importDefault(require("./isArrayLike")), getType_1 = __importDefault(require("./getType")), isPrototype_1 = __importDefault(require("./isPrototype")), hasOwnProperty = Object.prototype.hasOwnProperty;

function isEmpty(value) {
    if ((0, isNil_1.default)(value)) return !0;
    if ((0, isArrayLike_1.default)(value)) return !value.length;
    const type = (0, getType_1.default)(value);
    if ("Map" === type || "Set" === type) return !value.size;
    if ((0, isPrototype_1.default)(value)) return !Object.keys(value).length;
    for (const key in value) if (hasOwnProperty.call(value, key)) return !1;
    return !0;
}

exports.default = isEmpty;
//# sourceMappingURL=isEmpty.js.map
}, function(modId) { var map = {"./isNil":1689069768009,"./isArrayLike":1689069768018,"./getType":1689069768027,"./isPrototype":1689069768028}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1689069768027, function(require, module, exports) {


Object.defineProperty(exports, "__esModule", {
    value: !0
});

const getType = value => ({}.toString.call(value).replace(/^\[object /, "").replace(/]$/, ""));

exports.default = getType;
//# sourceMappingURL=getType.js.map
}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1689069768028, function(require, module, exports) {


Object.defineProperty(exports, "__esModule", {
    value: !0
});

const objectProto = Object.prototype, isPrototype = function(value) {
    const Ctor = value && value.constructor;
    return value === ("function" == typeof Ctor && Ctor.prototype || objectProto);
};

exports.default = isPrototype;
//# sourceMappingURL=isPrototype.js.map
}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1689069768029, function(require, module, exports) {


var __importDefault = this && this.__importDefault || function(mod) {
    return mod && mod.__esModule ? mod : {
        default: mod
    };
};

Object.defineProperty(exports, "__esModule", {
    value: !0
});

const isString_1 = __importDefault(require("./isString")), get = (obj, path, defaultValue) => {
    const paths = (0, isString_1.default)(path) ? path.split(".") : path;
    for (let p = 0; p < paths.length; p++) obj = obj ? obj[paths[p]] : void 0;
    return void 0 === obj ? defaultValue : obj;
};

exports.default = get;
//# sourceMappingURL=get.js.map
}, function(modId) { var map = {"./isString":1689069768016}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1689069768030, function(require, module, exports) {


Object.defineProperty(exports, "__esModule", {
    value: !0
});

const hasOwnProperty = Object.prototype.hasOwnProperty, has = (object, key) => null != object && hasOwnProperty.call(object, key);

exports.default = has;
//# sourceMappingURL=has.js.map
}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1689069768031, function(require, module, exports) {


var __importDefault = this && this.__importDefault || function(mod) {
    return mod && mod.__esModule ? mod : {
        default: mod
    };
};

Object.defineProperty(exports, "__esModule", {
    value: !0
});

const isArray_1 = __importDefault(require("./isArray")), isDate_1 = __importDefault(require("./isDate")), isRegExp_1 = __importDefault(require("./isRegExp"));

function getRegExpFlags(re) {
    let flags = "";
    return re.global && (flags += "g"), re.ignoreCase && (flags += "i"), re.multiline && (flags += "m"), 
    flags;
}

function clone(parent, circular = !1, depth = 0, prototype = void 0) {
    const allParents = [], allChildren = [];
    return void 0 === circular && (circular = !0), void 0 === depth && (depth = 1 / 0), 
    function _clone(parent, depth) {
        if (null === parent) return null;
        if (0 === depth) return parent;
        let child;
        if ("object" != typeof parent) return parent;
        if ((0, isArray_1.default)(parent) ? child = [] : (0, isRegExp_1.default)(parent) ? (child = new RegExp(parent.source, getRegExpFlags(parent)), 
        parent.lastIndex && (child.lastIndex = parent.lastIndex)) : child = (0, isDate_1.default)(parent) ? new Date(parent.getTime()) : void 0 === prototype ? Object.create(Object.getPrototypeOf(parent)) : Object.create(prototype), 
        circular) {
            const index = allParents.indexOf(parent);
            if (-1 !== index) return allChildren[index];
            allParents.push(parent), allChildren.push(child);
        }
        for (const i in parent) child[i] = _clone(parent[i], depth - 1);
        return child;
    }(parent, depth);
}

exports.default = clone;
//# sourceMappingURL=clone.js.map
}, function(modId) { var map = {"./isArray":1689069768017,"./isDate":1689069768019,"./isRegExp":1689069768024}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1689069768032, function(require, module, exports) {


var __importDefault = this && this.__importDefault || function(mod) {
    return mod && mod.__esModule ? mod : {
        default: mod
    };
};

Object.defineProperty(exports, "__esModule", {
    value: !0
});

const isArray_1 = __importDefault(require("./isArray")), isBoolean_1 = __importDefault(require("./isBoolean")), isDate_1 = __importDefault(require("./isDate")), isNumber_1 = __importDefault(require("./isNumber")), isString_1 = __importDefault(require("./isString")), isValid_1 = __importDefault(require("./isValid"));

function cloneDeep(value) {
    let result;
    if (!(0, isValid_1.default)(value) || "object" != typeof value) return value;
    const isArr = (0, isArray_1.default)(value), length = value.length;
    result = isArr ? new Array(length) : "object" == typeof value ? {} : (0, isBoolean_1.default)(value) || (0, 
    isNumber_1.default)(value) || (0, isString_1.default)(value) ? value : (0, isDate_1.default)(value) ? new Date(+value) : void 0;
    const props = isArr ? void 0 : Object.keys(Object(value));
    let index = -1;
    if (result) for (;++index < (props || value).length; ) {
        const key = props ? props[index] : index, subValue = value[key];
        result[key] = cloneDeep(subValue);
    }
    return result;
}

exports.default = cloneDeep;
//# sourceMappingURL=cloneDeep.js.map
}, function(modId) { var map = {"./isArray":1689069768017,"./isBoolean":1689069768006,"./isDate":1689069768019,"./isNumber":1689069768020,"./isString":1689069768016,"./isValid":1689069768011}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1689069768033, function(require, module, exports) {


var __importDefault = this && this.__importDefault || function(mod) {
    return mod && mod.__esModule ? mod : {
        default: mod
    };
};

Object.defineProperty(exports, "__esModule", {
    value: !0
});

const isArray_1 = __importDefault(require("./isArray")), isArrayLike_1 = __importDefault(require("./isArrayLike")), isPlainObject_1 = __importDefault(require("./isPlainObject")), isValid_1 = __importDefault(require("./isValid"));

function baseMerge(target, source, shallowArray = !1) {
    if (source) {
        if (target === source) return;
        if ((0, isValid_1.default)(source) && "object" == typeof source) {
            const iterable = Object(source), props = [];
            for (const key in iterable) props.push(key);
            let {length: length} = props, propIndex = -1;
            for (;length--; ) {
                const key = props[++propIndex];
                (0, isValid_1.default)(iterable[key]) && "object" == typeof iterable[key] ? baseMergeDeep(target, source, key, shallowArray) : assignMergeValue(target, key, iterable[key]);
            }
        }
    }
}

function baseMergeDeep(target, source, key, shallowArray = !1) {
    const objValue = target[key], srcValue = source[key];
    let newValue = source[key], isCommon = !0;
    if ((0, isArray_1.default)(srcValue)) {
        if (shallowArray) newValue = []; else if ((0, isArray_1.default)(objValue)) newValue = objValue; else if ((0, 
        isArrayLike_1.default)(objValue)) {
            newValue = new Array(objValue.length);
            let index = -1;
            const length = objValue.length;
            for (;++index < length; ) newValue[index] = objValue[index];
        }
    } else (0, isPlainObject_1.default)(srcValue) ? (newValue = objValue, "function" != typeof objValue && "object" == typeof objValue || (newValue = {})) : isCommon = !1;
    isCommon && baseMerge(newValue, srcValue, shallowArray), assignMergeValue(target, key, newValue);
}

function assignMergeValue(target, key, value) {
    (void 0 !== value && !eq(target[key], value) || void 0 === value && !(key in target)) && (target[key] = value);
}

function eq(value, other) {
    return value === other || Number.isNaN(value) && Number.isNaN(other);
}

function merge(target, ...sources) {
    let sourceIndex = -1;
    const length = sources.length;
    for (;++sourceIndex < length; ) {
        baseMerge(target, sources[sourceIndex], !0);
    }
    return target;
}

exports.default = merge;
//# sourceMappingURL=merge.js.map

}, function(modId) { var map = {"./isArray":1689069768017,"./isArrayLike":1689069768018,"./isPlainObject":1689069768014,"./isValid":1689069768011}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1689069768034, function(require, module, exports) {


var __importDefault = this && this.__importDefault || function(mod) {
    return mod && mod.__esModule ? mod : {
        default: mod
    };
};

Object.defineProperty(exports, "__esModule", {
    value: !0
});

const isPlainObject_1 = __importDefault(require("./isPlainObject")), hasOwnProperty = Object.prototype.hasOwnProperty;

function pick(obj, keys) {
    if (!obj || !(0, isPlainObject_1.default)(obj)) return obj;
    const result = {};
    return keys.forEach((k => {
        hasOwnProperty.call(obj, k) && (result[k] = obj[k]);
    })), result;
}

exports.default = pick;
//# sourceMappingURL=pick.js.map

}, function(modId) { var map = {"./isPlainObject":1689069768014}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1689069768035, function(require, module, exports) {


var __importDefault = this && this.__importDefault || function(mod) {
    return mod && mod.__esModule ? mod : {
        default: mod
    };
};

Object.defineProperty(exports, "__esModule", {
    value: !0
});

const isPlainObject_1 = __importDefault(require("./isPlainObject")), isString_1 = __importDefault(require("./isString"));

function pickWithout(obj, keys) {
    if (!obj || !(0, isPlainObject_1.default)(obj)) return obj;
    const result = {};
    return Object.keys(obj).forEach((k => {
        const v = obj[k];
        let match = !1;
        keys.forEach((itKey => {
            ((0, isString_1.default)(itKey) && itKey === k || itKey instanceof RegExp && k.match(itKey)) && (match = !0);
        })), match || (result[k] = v);
    })), result;
}

exports.default = pickWithout;
//# sourceMappingURL=pickWithout.js.map

}, function(modId) { var map = {"./isPlainObject":1689069768014,"./isString":1689069768016}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1689069768036, function(require, module, exports) {


var __importDefault = this && this.__importDefault || function(mod) {
    return mod && mod.__esModule ? mod : {
        default: mod
    };
};

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.isEqual = void 0;

const isArray_1 = __importDefault(require("./isArray")), isFunction_1 = __importDefault(require("./isFunction")), isPlainObject_1 = __importDefault(require("./isPlainObject"));

function objToString(obj) {
    return Object.prototype.toString.call(obj);
}

function objectKeys(obj) {
    return Object.keys(obj);
}

function isEqual(a, b) {
    if (a === b) return !0;
    if (typeof a != typeof b) return !1;
    if (null == a || null == b) return !1;
    if (Number.isNaN(a) && Number.isNaN(b)) return !0;
    if (objToString(a) !== objToString(b)) return !1;
    if ((0, isFunction_1.default)(a)) return !1;
    if ("object" != typeof a) return !1;
    if ((0, isArray_1.default)(a)) {
        if (a.length !== b.length) return !1;
        for (let i = a.length - 1; i >= 0; i--) if (!isEqual(a[i], b[i])) return !1;
        return !0;
    }
    if (!(0, isPlainObject_1.default)(a)) return !1;
    const ka = objectKeys(a), kb = objectKeys(b);
    if (ka.length !== kb.length) return !1;
    ka.sort(), kb.sort();
    for (let i = ka.length - 1; i >= 0; i--) if (ka[i] != kb[i]) return !1;
    for (let i = ka.length - 1; i >= 0; i--) {
        const key = ka[i];
        if (!isEqual(a[key], b[key])) return !1;
    }
    return !0;
}

exports.isEqual = isEqual;
//# sourceMappingURL=isEqual.js.map
}, function(modId) { var map = {"./isArray":1689069768017,"./isFunction":1689069768008,"./isPlainObject":1689069768014}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1689069768037, function(require, module, exports) {


var __importDefault = this && this.__importDefault || function(mod) {
    return mod && mod.__esModule ? mod : {
        default: mod
    };
};

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.isShallowEqual = void 0;

const isArray_1 = __importDefault(require("./isArray")), isObject_1 = __importDefault(require("./isObject"));

function is(x, y) {
    return x === y ? 0 !== x || 0 !== y || 1 / x == 1 / y : x != x && y != y;
}

function length(obj) {
    return (0, isArray_1.default)(obj) ? obj.length : (0, isObject_1.default)(obj) ? Object.keys(obj).length : 0;
}

function isShallowEqual(objA, objB) {
    if (is(objA, objB)) return !0;
    if ("object" != typeof objA || null === objA || "object" != typeof objB || null === objB) return !1;
    if ((0, isArray_1.default)(objA) !== (0, isArray_1.default)(objB)) return !1;
    if (length(objA) !== length(objB)) return !1;
    let ret = !0;
    return Object.keys(objA).forEach((k => !!is(objA[k], objB[k]) || (ret = !1, ret))), 
    ret;
}

exports.isShallowEqual = isShallowEqual;
}, function(modId) { var map = {"./isArray":1689069768017,"./isObject":1689069768012}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1689069768038, function(require, module, exports) {


function keys(obj) {
    if (!obj) return [];
    if (Object.keys) return Object.keys(obj);
    const keyList = [];
    for (const key in obj) obj.hasOwnProperty(key) && keyList.push(key);
    return keyList;
}

function defaults(target, source, overlay) {
    const keysArr = keys(source);
    for (let i = 0; i < keysArr.length; i++) {
        const key = keysArr[i];
        (overlay ? null != source[key] : null == target[key]) && (target[key] = source[key]);
    }
    return target;
}

function mixin(target, source, override = !0) {
    if (target = "prototype" in target ? target.prototype : target, source = "prototype" in source ? source.prototype : source, 
    Object.getOwnPropertyNames) {
        const keyList = Object.getOwnPropertyNames(source);
        for (let i = 0; i < keyList.length; i++) {
            const key = keyList[i];
            "constructor" !== key && (override ? null != source[key] : null == target[key]) && (target[key] = source[key]);
        }
    } else defaults(target, source, override);
}

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.mixin = exports.defaults = exports.keys = void 0, exports.keys = keys, 
exports.defaults = defaults, exports.mixin = mixin;
//# sourceMappingURL=mixin.js.map

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1689069768039, function(require, module, exports) {


var __importDefault = this && this.__importDefault || function(mod) {
    return mod && mod.__esModule ? mod : {
        default: mod
    };
};

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.flattenArray = exports.shuffleArray = exports.uniqArray = exports.arrayEqual = exports.minInArray = exports.maxInArray = exports.span = exports.last = exports.array = void 0;

const isArray_1 = __importDefault(require("./isArray")), isArrayLike_1 = __importDefault(require("./isArrayLike")), isValid_1 = __importDefault(require("./isValid"));

function array(arr) {
    return (0, isValid_1.default)(arr) ? (0, isArray_1.default)(arr) ? arr : [ arr ] : [];
}

function last(val) {
    if ((0, isArrayLike_1.default)(val)) {
        return val[val.length - 1];
    }
}

exports.array = array, exports.last = last;

const span = arr => arr.length <= 1 ? 0 : last(arr) - arr[0];

function maxInArray(arr) {
    if (arr && (0, isArray_1.default)(arr)) return arr.reduce(((prev, curr) => Math.max(prev, curr)), -1 / 0);
}

function minInArray(arr) {
    if (arr && (0, isArray_1.default)(arr)) return arr.reduce(((prev, curr) => Math.min(prev, curr)), 1 / 0);
}

function arrayEqual(a, b) {
    if (!(0, isArray_1.default)(a) || !(0, isArray_1.default)(b)) return !1;
    if (a.length !== b.length) return !1;
    for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return !1;
    return !0;
}

function uniqArray(arr) {
    return arr && (0, isArray_1.default)(arr) ? Array.from(new Set(array(arr))) : arr;
}

function shuffleArray(arr, random = Math.random) {
    let j, x, i = arr.length;
    for (;i; ) j = Math.floor(random() * i), x = arr[--i], arr[i] = arr[j], arr[j] = x;
    return arr;
}

function flattenArray(arr) {
    if (!(0, isArray_1.default)(arr)) return [ arr ];
    const result = [];
    for (const value of arr) result.push(...flattenArray(value));
    return result;
}

exports.span = span, exports.maxInArray = maxInArray, exports.minInArray = minInArray, 
exports.arrayEqual = arrayEqual, exports.uniqArray = uniqArray, exports.shuffleArray = shuffleArray, 
exports.flattenArray = flattenArray;
//# sourceMappingURL=array.js.map
}, function(modId) { var map = {"./isArray":1689069768017,"./isArrayLike":1689069768018,"./isValid":1689069768011}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1689069768040, function(require, module, exports) {


var __importDefault = this && this.__importDefault || function(mod) {
    return mod && mod.__esModule ? mod : {
        default: mod
    };
};

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.range = void 0;

const isValid_1 = __importDefault(require("./isValid"));

function range(start, stop, step) {
    (0, isValid_1.default)(stop) || (stop = start, start = 0), (0, isValid_1.default)(step) || (step = 1);
    let i = -1;
    const n = 0 | Math.max(0, Math.ceil((stop - start) / step)), range = new Array(n);
    for (;++i < n; ) range[i] = start + i * step;
    return range;
}

exports.range = range;
//# sourceMappingURL=range.js.map

}, function(modId) { var map = {"./isValid":1689069768011}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1689069768041, function(require, module, exports) {


function ascending(a, b) {
    return a < b ? -1 : a > b ? 1 : a >= b ? 0 : NaN;
}

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.ascending = void 0, exports.ascending = ascending;
}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1689069768042, function(require, module, exports) {


Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.quantileSorted = void 0;

const toNumber_1 = require("./toNumber");

function quantileSorted(values, percent, valueof = toNumber_1.toNumber) {
    const n = values.length;
    if (!n) return;
    if (percent <= 0 || n < 2) return valueof(values[0], 0, values);
    if (percent >= 1) return valueof(values[n - 1], n - 1, values);
    const i = (n - 1) * percent, i0 = Math.floor(i), value0 = valueof(values[i0], i0, values);
    return value0 + (valueof(values[i0 + 1], i0 + 1, values) - value0) * (i - i0);
}

exports.quantileSorted = quantileSorted;
//# sourceMappingURL=quantileSorted.js.map

}, function(modId) { var map = {"./toNumber":1689069768043}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1689069768043, function(require, module, exports) {


function toNumber(a) {
    return Number(a);
}

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.toNumber = void 0, exports.toNumber = toNumber;
//# sourceMappingURL=toNumber.js.map

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1689069768044, function(require, module, exports) {


var __importDefault = this && this.__importDefault || function(mod) {
    return mod && mod.__esModule ? mod : {
        default: mod
    };
};

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.bisect = void 0;

const ascending_1 = require("./ascending"), isNil_1 = __importDefault(require("./isNil"));

function bisect(a, x, lo = 0, hi) {
    for ((0, isNil_1.default)(hi) && (hi = a.length); lo < hi; ) {
        const mid = lo + hi >>> 1;
        (0, ascending_1.ascending)(a[mid], x) > 0 ? hi = mid : lo = mid + 1;
    }
    return lo;
}

exports.bisect = bisect;
//# sourceMappingURL=bisect.js.map
}, function(modId) { var map = {"./ascending":1689069768041,"./isNil":1689069768009}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1689069768045, function(require, module, exports) {


Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.deviation = void 0;

const variance_1 = require("./variance");

function deviation(values, valueof) {
    const v = (0, variance_1.variance)(values, valueof);
    return v ? Math.sqrt(v) : v;
}

exports.deviation = deviation;
//# sourceMappingURL=deviation.js.map
}, function(modId) { var map = {"./variance":1689069768046}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1689069768046, function(require, module, exports) {


function variance(values, valueof) {
    let delta, count = 0, mean = 0, sum = 0;
    if (void 0 === valueof) for (let value of values) null != value && (value = +value) >= value && (delta = value - mean, 
    mean += delta / ++count, sum += delta * (value - mean)); else {
        let index = -1;
        for (let value of values) null != (value = valueof(value, ++index, values)) && (value = +value) >= value && (delta = value - mean, 
        mean += delta / ++count, sum += delta * (value - mean));
    }
    return count > 1 ? sum / (count - 1) : 0;
}

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.variance = void 0, exports.variance = variance;
//# sourceMappingURL=variance.js.map

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1689069768047, function(require, module, exports) {


Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.median = void 0;

const ascending_1 = require("./ascending"), quantileSorted_1 = require("./quantileSorted"), median = (values, isSorted) => {
    let sorted = values;
    return !0 !== isSorted && (sorted = values.sort(ascending_1.ascending)), (0, quantileSorted_1.quantileSorted)(sorted, .5);
};

exports.median = median;
//# sourceMappingURL=median.js.map

}, function(modId) { var map = {"./ascending":1689069768041,"./quantileSorted":1689069768042}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1689069768048, function(require, module, exports) {


Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.tickStep = void 0;

const e10 = Math.sqrt(50), e5 = Math.sqrt(10), e2 = Math.sqrt(2);

function tickStep(start, stop, count) {
    const step0 = Math.abs(stop - start) / Math.max(0, count);
    let step1 = Math.pow(10, Math.floor(Math.log(step0) / Math.LN10));
    const error = step0 / step1;
    return error >= e10 ? step1 *= 10 : error >= e5 ? step1 *= 5 : error >= e2 && (step1 *= 2), 
    stop < start ? -step1 : step1;
}

exports.tickStep = tickStep;
//# sourceMappingURL=tickStep.js.map

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1689069768049, function(require, module, exports) {


Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.isLess = exports.isGreater = exports.isNumberClose = void 0;

const DEFAULT_ABSOLUTE_TOLERATE = 1e-10, DEFAULT_RELATIVE_TOLERATE = 1e-10;

function isNumberClose(a, b, relTol = DEFAULT_RELATIVE_TOLERATE, absTol = DEFAULT_ABSOLUTE_TOLERATE) {
    const abs = absTol, rel = relTol * Math.max(a, b);
    return Math.abs(a - b) <= Math.max(abs, rel);
}

function isGreater(a, b, relTol, absTol) {
    return a > b && !isNumberClose(a, b, relTol, absTol);
}

function isLess(a, b, relTol, absTol) {
    return a < b && !isNumberClose(a, b, relTol, absTol);
}

exports.isNumberClose = isNumberClose, exports.isGreater = isGreater, exports.isLess = isLess;
//# sourceMappingURL=number.js.map

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1689069768050, function(require, module, exports) {


var __importDefault = this && this.__importDefault || function(mod) {
    return mod && mod.__esModule ? mod : {
        default: mod
    };
};

Object.defineProperty(exports, "__esModule", {
    value: !0
});

const isFunction_1 = __importDefault(require("./isFunction")), constant = value => (0, 
isFunction_1.default)(value) ? value : () => value;

exports.default = constant;
//# sourceMappingURL=constant.js.map
}, function(modId) { var map = {"./isFunction":1689069768008}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1689069768051, function(require, module, exports) {


Object.defineProperty(exports, "__esModule", {
    value: !0
});

const repeat = (str, repeatCount = 0) => {
    let s = "", i = repeatCount - 1;
    for (;i >= 0; ) s = `${s}${str}`, i -= 1;
    return s;
}, pad = (str, length, padChar = " ", align = "right") => {
    const c = padChar, s = str + "", n = length - s.length;
    return n <= 0 ? s : "left" === align ? repeat(c, n) + s : "center" === align ? repeat(c, Math.floor(n / 2)) + s + repeat(c, Math.ceil(n / 2)) : s + repeat(c, n);
};

exports.default = pad;
//# sourceMappingURL=pad.js.map

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1689069768052, function(require, module, exports) {


var __importDefault = this && this.__importDefault || function(mod) {
    return mod && mod.__esModule ? mod : {
        default: mod
    };
};

Object.defineProperty(exports, "__esModule", {
    value: !0
});

const isNil_1 = __importDefault(require("./isNil")), truncate = (str, length, align = "right", ellipsis) => {
    const e = (0, isNil_1.default)(ellipsis) ? "…" : ellipsis, s = str + "", n = s.length, l = Math.max(0, length - e.length);
    return n <= length ? s : "left" === align ? e + s.slice(n - l) : "center" === align ? s.slice(0, Math.ceil(l / 2)) + e + s.slice(n - Math.floor(l / 2)) : s.slice(0, l) + e;
};

exports.default = truncate;
//# sourceMappingURL=truncate.js.map

}, function(modId) { var map = {"./isNil":1689069768009}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1689069768053, function(require, module, exports) {


Object.defineProperty(exports, "__esModule", {
    value: !0
});

const uuid = (len, radix) => {
    const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz".split(""), uuid = [];
    let i;
    if (radix = radix || chars.length, len) for (i = 0; i < len; i++) uuid[i] = chars[0 | Math.random() * radix]; else {
        let r;
        for (uuid[8] = uuid[13] = uuid[18] = uuid[23] = "-", uuid[14] = "4", i = 0; i < 36; i++) uuid[i] || (r = 0 | 16 * Math.random(), 
        uuid[i] = chars[19 === i ? 3 & r | 8 : r]);
    }
    return uuid.join("");
};

exports.default = uuid;
//# sourceMappingURL=uuid.js.map

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1689069768054, function(require, module, exports) {


Object.defineProperty(exports, "__esModule", {
    value: !0
});

const clamp = function(input, min, max) {
    return input < min ? min : input > max ? max : input;
};

exports.default = clamp;
//# sourceMappingURL=clamp.js.map
}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1689069768055, function(require, module, exports) {


Object.defineProperty(exports, "__esModule", {
    value: !0
});

const clampRange = (range, min, max) => {
    let [lowValue, highValue] = range;
    highValue < lowValue && (lowValue = range[1], highValue = range[0]);
    const span = highValue - lowValue;
    return span >= max - min ? [ min, max ] : (lowValue = Math.min(Math.max(lowValue, min), max - span), 
    [ lowValue, lowValue + span ]);
};

exports.default = clampRange;
//# sourceMappingURL=clampRange.js.map
}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1689069768056, function(require, module, exports) {


function clamper(a, b) {
    let t;
    return a > b && (t = a, a = b, b = t), x => Math.max(a, Math.min(b, x));
}

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.clamper = void 0, exports.clamper = clamper;
//# sourceMappingURL=clamper.js.map
}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1689069768057, function(require, module, exports) {


var __importDefault = this && this.__importDefault || function(mod) {
    return mod && mod.__esModule ? mod : {
        default: mod
    };
};

Object.defineProperty(exports, "__esModule", {
    value: !0
});

const isObject_1 = __importDefault(require("./isObject")), isValidNumber_1 = __importDefault(require("./isValidNumber"));

let hasRaf = !1;

try {
    hasRaf = "function" == typeof requestAnimationFrame && "function" == typeof cancelAnimationFrame;
} catch (err) {
    hasRaf = !1;
}

function debounce(func, wait, options) {
    let lastArgs, lastThis, maxWait, result, timerId, lastCallTime, lastInvokeTime = 0, leading = !1, maxing = !1, trailing = !0;
    const useRAF = !wait && 0 !== wait && hasRaf;
    if ("function" != typeof func) throw new TypeError("Expected a function");
    function invokeFunc(time) {
        const args = lastArgs, thisArg = lastThis;
        return lastArgs = lastThis = void 0, lastInvokeTime = time, result = func.apply(thisArg, args), 
        result;
    }
    function startTimer(pendingFunc, wait) {
        return useRAF ? (cancelAnimationFrame(timerId), requestAnimationFrame(pendingFunc)) : setTimeout(pendingFunc, wait);
    }
    function shouldInvoke(time) {
        const timeSinceLastCall = time - lastCallTime;
        return void 0 === lastCallTime || timeSinceLastCall >= wait || timeSinceLastCall < 0 || maxing && time - lastInvokeTime >= maxWait;
    }
    function timerExpired() {
        const time = Date.now();
        if (shouldInvoke(time)) return trailingEdge(time);
        timerId = startTimer(timerExpired, function(time) {
            const timeSinceLastInvoke = time - lastInvokeTime, timeWaiting = wait - (time - lastCallTime);
            return maxing ? Math.min(timeWaiting, maxWait - timeSinceLastInvoke) : timeWaiting;
        }(time));
    }
    function trailingEdge(time) {
        return timerId = void 0, trailing && lastArgs ? invokeFunc(time) : (lastArgs = lastThis = void 0, 
        result);
    }
    function debounced(...args) {
        const time = Date.now(), isInvoking = shouldInvoke(time);
        if (lastArgs = args, lastThis = this, lastCallTime = time, isInvoking) {
            if (void 0 === timerId) return function(time) {
                return lastInvokeTime = time, timerId = startTimer(timerExpired, wait), leading ? invokeFunc(time) : result;
            }(lastCallTime);
            if (maxing) return timerId = startTimer(timerExpired, wait), invokeFunc(lastCallTime);
        }
        return void 0 === timerId && (timerId = startTimer(timerExpired, wait)), result;
    }
    return wait = +wait || 0, (0, isObject_1.default)(options) && (leading = !!options.leading, 
    maxing = "maxWait" in options, maxing && (maxWait = Math.max((0, isValidNumber_1.default)(options.maxWait) ? options.maxWait : 0, wait)), 
    trailing = "trailing" in options ? !!options.trailing : trailing), debounced.cancel = function() {
        void 0 !== timerId && function(id) {
            if (useRAF) return cancelAnimationFrame(id);
            clearTimeout(id);
        }(timerId), lastInvokeTime = 0, lastArgs = lastCallTime = lastThis = timerId = void 0;
    }, debounced.flush = function() {
        return void 0 === timerId ? result : trailingEdge(Date.now());
    }, debounced.pending = function() {
        return void 0 !== timerId;
    }, debounced;
}

hasRaf = !1, exports.default = debounce;
//# sourceMappingURL=debounce.js.map
}, function(modId) { var map = {"./isObject":1689069768012,"./isValidNumber":1689069768022}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1689069768058, function(require, module, exports) {


var __importDefault = this && this.__importDefault || function(mod) {
    return mod && mod.__esModule ? mod : {
        default: mod
    };
};

Object.defineProperty(exports, "__esModule", {
    value: !0
});

const debounce_1 = __importDefault(require("./debounce")), isObject_1 = __importDefault(require("./isObject"));

function throttle(func, wait, options) {
    let leading = !0, trailing = !0;
    if ("function" != typeof func) throw new TypeError("Expected a function");
    return (0, isObject_1.default)(options) && (leading = "leading" in options ? !!options.leading : leading, 
    trailing = "trailing" in options ? !!options.trailing : trailing), (0, debounce_1.default)(func, wait, {
        leading: leading,
        trailing: trailing,
        maxWait: wait
    });
}

exports.default = throttle;
//# sourceMappingURL=throttle.js.map

}, function(modId) { var map = {"./debounce":1689069768057,"./isObject":1689069768012}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1689069768059, function(require, module, exports) {


function interpolateNumber(a, b) {
    return t => a * (1 - t) + b * t;
}

function interpolateNumberRound(a, b) {
    return function(t) {
        return Math.round(a * (1 - t) + b * t);
    };
}

function interpolateDate(a, b) {
    const aVal = a.valueOf(), bVal = b.valueOf(), d = new Date;
    return t => (d.setTime(aVal * (1 - t) + bVal * t), d);
}

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.interpolateString = exports.interpolateDate = exports.interpolateNumberRound = exports.interpolateNumber = void 0, 
exports.interpolateNumber = interpolateNumber, exports.interpolateNumberRound = interpolateNumberRound, 
exports.interpolateDate = interpolateDate;

const reA = /[-+]?(?:\d+\.?\d*|\.?\d+)(?:[eE][-+]?\d+)?/g, reB = new RegExp(reA.source, "g");

function zero(b) {
    return function() {
        return b;
    };
}

function one(b) {
    return function(t) {
        return b(t) + "";
    };
}

function interpolateString(a, b) {
    let am, bm, bs, bi = reA.lastIndex = reB.lastIndex = 0, i = -1;
    const s = [], q = [];
    for (a += "", b += ""; (am = reA.exec(a)) && (bm = reB.exec(b)); ) (bs = bm.index) > bi && (bs = b.slice(bi, bs), 
    s[i] ? s[i] += bs : s[++i] = bs), (am = am[0]) === (bm = bm[0]) ? s[i] ? s[i] += bm : s[++i] = bm : (s[++i] = null, 
    q.push({
        i: i,
        x: interpolateNumber(am, bm)
    })), bi = reB.lastIndex;
    return bi < b.length && (bs = b.slice(bi), s[i] ? s[i] += bs : s[++i] = bs), s.length < 2 ? q[0] ? one(q[0].x) : zero(b) : (b = q.length, 
    function(t) {
        for (let o, i = 0; i < b; ++i) s[(o = q[i]).i] = o.x(t);
        return s.join("");
    });
}

exports.interpolateString = interpolateString;
//# sourceMappingURL=interpolate.js.map
}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1689069768060, function(require, module, exports) {


var __importDefault = this && this.__importDefault || function(mod) {
    return mod && mod.__esModule ? mod : {
        default: mod
    };
};

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.toDate = void 0;

const isNil_1 = __importDefault(require("./isNil")), isString_1 = __importDefault(require("./isString")), TIME_REG = /^(?:(\d{4})(?:[-\/](\d{1,2})(?:[-\/](\d{1,2})(?:[T ](\d{1,2})(?::(\d{1,2})(?::(\d{1,2})(?:[.,](\d+))?)?)?(Z|[\+\-]\d\d:?\d\d)?)?)?)?)?$/;

function toDate(val) {
    if (val instanceof Date) return val;
    if ((0, isString_1.default)(val)) {
        const match = TIME_REG.exec(val);
        if (!match) return new Date(NaN);
        if (!match[8]) return new Date(+match[1], +(match[2] || 1) - 1, +match[3] || 1, +match[4] || 0, +(match[5] || 0), +match[6] || 0, match[7] ? +match[7].substring(0, 3) : 0);
        let hour = +match[4] || 0;
        return "Z" !== match[8].toUpperCase() && (hour -= +match[8].slice(0, 3)), new Date(Date.UTC(+match[1], +(match[2] || 1) - 1, +match[3] || 1, hour, +(match[5] || 0), +match[6] || 0, match[7] ? +match[7].substring(0, 3) : 0));
    }
    return (0, isNil_1.default)(val) ? new Date(NaN) : new Date(Math.round(val));
}

exports.toDate = toDate;
//# sourceMappingURL=toDate.js.map

}, function(modId) { var map = {"./isNil":1689069768009,"./isString":1689069768016}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1689069768061, function(require, module, exports) {


var __importDefault = this && this.__importDefault || function(mod) {
    return mod && mod.__esModule ? mod : {
        default: mod
    };
};

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.toValidNumber = void 0;

const isValidNumber_1 = __importDefault(require("./isValidNumber"));

function toValidNumber(v) {
    if ((0, isValidNumber_1.default)(v)) return v;
    const value = +v;
    return (0, isValidNumber_1.default)(value) ? value : 0;
}

exports.toValidNumber = toValidNumber;
//# sourceMappingURL=toValidNumber.js.map

}, function(modId) { var map = {"./isValidNumber":1689069768022}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1689069768062, function(require, module, exports) {


Object.defineProperty(exports, "__esModule", {
    value: !0
});

const lowerFirst = function(str) {
    return str.charAt(0).toLowerCase() + str.substring(1);
};

exports.default = lowerFirst;
//# sourceMappingURL=lowerFirst.js.map
}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1689069768063, function(require, module, exports) {


Object.defineProperty(exports, "__esModule", {
    value: !0
});

const upperFirst = function(str) {
    return str.charAt(0).toUpperCase() + str.substring(1);
};

exports.default = upperFirst;
//# sourceMappingURL=upperFirst.js.map

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1689069768064, function(require, module, exports) {


var __createBinding = this && this.__createBinding || (Object.create ? function(o, m, k, k2) {
    void 0 === k2 && (k2 = k);
    var desc = Object.getOwnPropertyDescriptor(m, k);
    desc && !("get" in desc ? !m.__esModule : desc.writable || desc.configurable) || (desc = {
        enumerable: !0,
        get: function() {
            return m[k];
        }
    }), Object.defineProperty(o, k2, desc);
} : function(o, m, k, k2) {
    void 0 === k2 && (k2 = k), o[k2] = m[k];
}), __exportStar = this && this.__exportStar || function(m, exports) {
    for (var p in m) "default" === p || Object.prototype.hasOwnProperty.call(exports, p) || __createBinding(exports, m, p);
};

Object.defineProperty(exports, "__esModule", {
    value: !0
}), __exportStar(require("./hashTable"), exports), __exportStar(require("./point"), exports), 
__exportStar(require("./bounds"), exports), __exportStar(require("./matrix"), exports);
//# sourceMappingURL=index.js.map

}, function(modId) { var map = {"./hashTable":1689069768065,"./point":1689069768066,"./bounds":1689069768068,"./matrix":1689069768069}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1689069768065, function(require, module, exports) {


Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.HashTable = exports.HashValue = void 0;

class HashValue {}

exports.HashValue = HashValue;

class HashTable {
    constructor() {
        this.items = {}, this.itemList = [];
    }
    get type() {
        return "xhHashTable";
    }
    set(key, value) {
        const vl = new HashValue;
        vl.key = key, vl.value = value;
        let index = this.itemList.length;
        return this.has(key) && (index = this.items[key].index), vl.index = index, this.itemList[index] = vl, 
        this.items[key] = vl, vl;
    }
    clear() {
        this.items = {}, this.itemList = [];
    }
    del(key) {
        if (this.has(key)) {
            const index = this.items[key].index;
            index > -1 && this.itemList.splice(index, 1), delete this.items[key], this.resetIndex();
        }
    }
    delFrom(index) {
        for (let i = index + 1; i < this.count(); i++) {
            const key = this.itemList[i].key;
            delete this.items[key];
        }
        this.itemList.splice(index + 1, this.count() - index), this.resetIndex();
    }
    resetIndex() {
        this.foreachHashv(((k, v) => {
            const index = this.itemList.indexOf(v);
            this.items[k].index = index;
        }));
    }
    has(key) {
        return key in this.items;
    }
    get(key) {
        return this.has(key) ? this.items[key].value : null;
    }
    count() {
        return this.itemList.length;
    }
    all() {
        return this.itemList.map((vl => vl.value));
    }
    first() {
        return this.itemList[0].value;
    }
    last() {
        return this.itemList[this.itemList.length - 1].value;
    }
    getByIndex(index) {
        return this.itemList[index].value;
    }
    getKeyByIndex(index) {
        return this.itemList[index].key;
    }
    foreach(callback) {
        for (const key in this.items) {
            if (!1 === callback(key, this.items[key].value)) return !1;
        }
        return !0;
    }
    foreachHashv(callback) {
        for (const key in this.items) {
            if (!1 === callback(key, this.items[key])) return !1;
        }
        return !0;
    }
    hasValue(value) {
        for (const key in this.items) if (this.items[key].value === value) return !0;
        return !1;
    }
    indexOf(key) {
        return this.has(key) ? this.items[key].index : -1;
    }
    insertAt(index, value, key) {
        const hashV = new HashValue;
        hashV.index = index, hashV.key = key, hashV.value = value, this.itemList.splice(index, 0, hashV), 
        this.items[key] = hashV, this.resetIndex();
    }
    sort(callback) {
        return this.itemList.sort(((a, b) => callback(a.value, b.value)));
    }
    toArray() {
        return this.itemList.slice(0, this.itemList.length).map((vl => vl.value));
    }
    push(lists) {
        lists.foreach(((key, value) => {
            this.set(key, value);
        }));
    }
    mapKey() {
        const returnArr = [];
        for (const key in this.items) returnArr.push(key);
        return returnArr;
    }
    toImmutableMap() {}
}

exports.HashTable = HashTable;
//# sourceMappingURL=hashTable.js.map

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1689069768066, function(require, module, exports) {


var __importDefault = this && this.__importDefault || function(mod) {
    return mod && mod.__esModule ? mod : {
        default: mod
    };
};

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.PolarPoint = exports.PointService = exports.Point = void 0;

const isNumber_1 = __importDefault(require("../common/isNumber")), math_1 = require("../math");

class Point {
    constructor(x = 0, y = 0, x1, y1) {
        this.x = 0, this.y = 0, this.x = x, this.y = y, this.x1 = x1, this.y1 = y1;
    }
    clone() {
        return new Point(this.x, this.y);
    }
    copyFrom(p) {
        return this.x = p.x, this.y = p.y, this.x1 = p.x1, this.y1 = p.y1, this.defined = p.defined, 
        this.context = p.context, this;
    }
    set(x, y) {
        return this.x = x, this.y = y, this;
    }
    add(point) {
        return (0, isNumber_1.default)(point) ? (this.x += point, void (this.y += point)) : (this.x += point.x, 
        this.y += point.y, this);
    }
    sub(point) {
        return (0, isNumber_1.default)(point) ? (this.x -= point, void (this.y -= point)) : (this.x -= point.x, 
        this.y -= point.y, this);
    }
    multi(point) {
        throw new Error("暂不支持");
    }
    div(point) {
        throw new Error("暂不支持");
    }
}

exports.Point = Point;

class PointService {
    static distancePP(p1, p2) {
        return (0, math_1.sqrt)((0, math_1.pow)(p1.x - p2.x, 2) + (0, math_1.pow)(p1.y - p2.y, 2));
    }
    static distanceNN(x, y, x1, y1) {
        return (0, math_1.sqrt)((0, math_1.pow)(x - x1, 2) + (0, math_1.pow)(y - y1, 2));
    }
    static distancePN(point, x, y) {
        return (0, math_1.sqrt)((0, math_1.pow)(x - point.x, 2) + (0, math_1.pow)(y - point.y, 2));
    }
    static pointAtPP(p1, p2, t) {
        return new Point((p2.x - p1.x) * t + p1.x, (p2.y - p1.y) * t + p1.y);
    }
}

exports.PointService = PointService;

class PolarPoint {
    constructor(r = 0, theta = 0, r1, theta1) {
        this.r = 0, this.theta = 0, this.r = r, this.theta = theta, this.r1 = r1, this.theta1 = theta1;
    }
    clone() {
        return new PolarPoint(this.r, this.theta);
    }
    copyFrom(p) {
        return this.r = p.r, this.theta = p.theta, this.r1 = p.r1, this.theta1 = p.theta1, 
        this.defined = p.defined, this.context = p.context, this;
    }
    set(r, theta) {
        return this.r = r, this.theta = theta, this;
    }
}

exports.PolarPoint = PolarPoint;
//# sourceMappingURL=point.js.map

}, function(modId) { var map = {"../common/isNumber":1689069768020,"../math":1689069768067}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1689069768067, function(require, module, exports) {


function acos(x) {
    return x > 1 ? 0 : x < -1 ? exports.pi : Math.acos(x);
}

function asin(x) {
    return x >= 1 ? exports.halfPi : x <= -1 ? -exports.halfPi : Math.asin(x);
}

function pointAt(x1, y1, x2, y2, t) {
    let x, y;
    return "number" == typeof x1 && "number" == typeof x2 && (x = (1 - t) * x1 + t * x2), 
    "number" == typeof y1 && "number" == typeof y2 && (y = (1 - t) * y1 + t * y2), {
        x: x,
        y: y
    };
}

function lengthFromPointToLine(point, point1, point2) {
    const dir1X = point2.x - point1.x, dir1Y = point2.y - point1.y, dir2X = point.x - point1.x, dir2Y = point.y - point1.y;
    return Math.abs(dir1X * dir2Y - dir2X * dir1Y) / Math.sqrt(dir1X * dir1X + dir1Y * dir1Y);
}

function crossProduct(dir1, dir2) {
    return dir1[0] * dir2[1] - dir1[1] * dir2[0];
}

function crossProductPoint(dir1, dir2) {
    return dir1.x * dir2.y - dir1.y * dir2.x;
}

function fuzzyEqualNumber(a, b) {
    return (0, exports.abs)(a - b) < exports.epsilon;
}

function fuzzyEqualVec(a, b) {
    return (0, exports.abs)(a[0] - b[0]) + (0, exports.abs)(a[1] - b[1]) < exports.epsilon;
}

function fixPrecision(num, precision = 10) {
    return Math.round(num * precision) / precision;
}

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.fixPrecision = exports.fuzzyEqualVec = exports.fuzzyEqualNumber = exports.crossProductPoint = exports.crossProduct = exports.lengthFromPointToLine = exports.pointAt = exports.asin = exports.acos = exports.pow = exports.sqrt = exports.sin = exports.min = exports.max = exports.cos = exports.atan2 = exports.abs = exports.pi2 = exports.SUBDIVISION_MAX_ITERATIONS = exports.SUBDIVISION_PRECISION = exports.NEWTON_MIN_SLOPE = exports.NEWTON_ITERATIONS = exports.tau = exports.halfPi = exports.pi = exports.epsilon = void 0, 
exports.epsilon = 1e-12, exports.pi = Math.PI, exports.halfPi = exports.pi / 2, 
exports.tau = 2 * exports.pi, exports.NEWTON_ITERATIONS = 4, exports.NEWTON_MIN_SLOPE = .001, 
exports.SUBDIVISION_PRECISION = 1e-7, exports.SUBDIVISION_MAX_ITERATIONS = 10, exports.pi2 = 2 * Math.PI, 
exports.abs = Math.abs, exports.atan2 = Math.atan2, exports.cos = Math.cos, exports.max = Math.max, 
exports.min = Math.min, exports.sin = Math.sin, exports.sqrt = Math.sqrt, exports.pow = Math.pow, 
exports.acos = acos, exports.asin = asin, exports.pointAt = pointAt, exports.lengthFromPointToLine = lengthFromPointToLine, 
exports.crossProduct = crossProduct, exports.crossProductPoint = crossProductPoint, 
exports.fuzzyEqualNumber = fuzzyEqualNumber, exports.fuzzyEqualVec = fuzzyEqualVec, 
exports.fixPrecision = fixPrecision;
//# sourceMappingURL=math.js.map
}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1689069768068, function(require, module, exports) {


Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.OBBBounds = exports.AABBBounds = exports.Bounds = exports.transformBounds = exports.transformBoundsWithMatrix = void 0;

const common_1 = require("../common"), math_1 = require("../math");

function transformBoundsWithMatrix(out, bounds, matrix) {
    const {x1: x1, y1: y1, x2: x2, y2: y2} = bounds;
    return matrix.onlyTranslate() ? (out !== bounds && out.setValue(bounds.x1, bounds.y1, bounds.x2, bounds.y2), 
    out.translate(matrix.e, matrix.f), bounds) : (out.clear(), out.add(matrix.a * x1 + matrix.c * y1 + matrix.e, matrix.b * x1 + matrix.d * y1 + matrix.f), 
    out.add(matrix.a * x2 + matrix.c * y1 + matrix.e, matrix.b * x2 + matrix.d * y1 + matrix.f), 
    out.add(matrix.a * x2 + matrix.c * y2 + matrix.e, matrix.b * x2 + matrix.d * y2 + matrix.f), 
    out.add(matrix.a * x1 + matrix.c * y2 + matrix.e, matrix.b * x1 + matrix.d * y2 + matrix.f), 
    bounds);
}

function transformBounds(bounds, x, y, scaleX, scaleY, angle, rotateCenter) {
    if (!((0, math_1.abs)(scaleX) <= math_1.epsilon || (0, math_1.abs)(scaleY) <= math_1.epsilon)) {
        if (1 !== scaleX && bounds.scaleX(scaleX), 1 !== scaleY && bounds.scaleY(scaleY), 
        isFinite(angle) && Math.abs(angle) > math_1.epsilon) {
            let rx = 0, ry = 0;
            void 0 !== rotateCenter && (rx = rotateCenter[0], ry = rotateCenter[1]), bounds.rotate(angle, rx, ry);
        }
        bounds.translate(x, y);
    }
}

exports.transformBoundsWithMatrix = transformBoundsWithMatrix, exports.transformBounds = transformBounds;

class Bounds {
    constructor(bounds) {
        bounds ? this.setValue(bounds.x1, bounds.y1, bounds.x2, bounds.y2) : this.clear();
    }
    clone() {
        return new Bounds(this);
    }
    clear() {
        return this.x1 = +Number.MAX_VALUE, this.y1 = +Number.MAX_VALUE, this.x2 = -Number.MAX_VALUE, 
        this.y2 = -Number.MAX_VALUE, this;
    }
    empty() {
        return this.x1 === +Number.MAX_VALUE && this.y1 === +Number.MAX_VALUE && this.x2 === -Number.MAX_VALUE && this.y2 === -Number.MAX_VALUE;
    }
    equals(b) {
        return this.x1 === b.x1 && this.y1 === b.y1 && this.x2 === b.x2 && this.y2 === b.y2;
    }
    setValue(x1 = 0, y1 = 0, x2 = 0, y2 = 0) {
        return this.x1 = x1, this.y1 = y1, this.x2 = x2, this.y2 = y2, this;
    }
    set(x1 = 0, y1 = 0, x2 = 0, y2 = 0) {
        return x2 < x1 ? (this.x2 = x1, this.x1 = x2) : (this.x1 = x1, this.x2 = x2), y2 < y1 ? (this.y2 = y1, 
        this.y1 = y2) : (this.y1 = y1, this.y2 = y2), this;
    }
    add(x = 0, y = 0) {
        return x < this.x1 && (this.x1 = x), y < this.y1 && (this.y1 = y), x > this.x2 && (this.x2 = x), 
        y > this.y2 && (this.y2 = y), this;
    }
    expand(d = 0) {
        return (0, common_1.isArray)(d) ? (this.y1 -= d[0], this.x2 += d[1], this.y2 += d[2], 
        this.x1 -= d[3]) : (this.x1 -= d, this.y1 -= d, this.x2 += d, this.y2 += d), this;
    }
    round() {
        return this.x1 = Math.floor(this.x1), this.y1 = Math.floor(this.y1), this.x2 = Math.ceil(this.x2), 
        this.y2 = Math.ceil(this.y2), this;
    }
    translate(dx = 0, dy = 0) {
        return this.x1 += dx, this.x2 += dx, this.y1 += dy, this.y2 += dy, this;
    }
    rotate(angle = 0, x = 0, y = 0) {
        const p = this.rotatedPoints(angle, x, y);
        return this.clear().add(p[0], p[1]).add(p[2], p[3]).add(p[4], p[5]).add(p[6], p[7]);
    }
    scale(sx = 0, sy = 0, x = 0, y = 0) {
        const p = this.scalePoints(sx, sy, x, y);
        return this.clear().add(p[0], p[1]).add(p[2], p[3]);
    }
    union(b) {
        return b.x1 < this.x1 && (this.x1 = b.x1), b.y1 < this.y1 && (this.y1 = b.y1), b.x2 > this.x2 && (this.x2 = b.x2), 
        b.y2 > this.y2 && (this.y2 = b.y2), this;
    }
    intersect(b) {
        return b.x1 > this.x1 && (this.x1 = b.x1), b.y1 > this.y1 && (this.y1 = b.y1), b.x2 < this.x2 && (this.x2 = b.x2), 
        b.y2 < this.y2 && (this.y2 = b.y2), this;
    }
    encloses(b) {
        return b && this.x1 <= b.x1 && this.x2 >= b.x2 && this.y1 <= b.y1 && this.y2 >= b.y2;
    }
    alignsWith(b) {
        return b && (this.x1 === b.x1 || this.x2 === b.x2 || this.y1 === b.y1 || this.y2 === b.y2);
    }
    intersects(b) {
        return b && !(this.x2 < b.x1 || this.x1 > b.x2 || this.y2 < b.y1 || this.y1 > b.y2);
    }
    contains(x = 0, y = 0) {
        return !(x < this.x1 || x > this.x2 || y < this.y1 || y > this.y2);
    }
    containsPoint(p) {
        return !(p.x < this.x1 || p.x > this.x2 || p.y < this.y1 || p.y > this.y2);
    }
    width() {
        return this.empty() ? 0 : this.x2 - this.x1;
    }
    height() {
        return this.empty() ? 0 : this.y2 - this.y1;
    }
    scaleX(s = 0) {
        return this.x1 *= s, this.x2 *= s, this;
    }
    scaleY(s = 0) {
        return this.y1 *= s, this.y2 *= s, this;
    }
    transformWithMatrix(matrix) {
        return transformBoundsWithMatrix(this, this, matrix), this;
    }
    copy(b) {
        return this.x1 = b.x1, this.y1 = b.y1, this.x2 = b.x2, this.y2 = b.y2, this;
    }
    rotatedPoints(angle, x, y) {
        const {x1: x1, y1: y1, x2: x2, y2: y2} = this, cos = Math.cos(angle), sin = Math.sin(angle), cx = x - x * cos + y * sin, cy = y - x * sin - y * cos;
        return [ cos * x1 - sin * y1 + cx, sin * x1 + cos * y1 + cy, cos * x1 - sin * y2 + cx, sin * x1 + cos * y2 + cy, cos * x2 - sin * y1 + cx, sin * x2 + cos * y1 + cy, cos * x2 - sin * y2 + cx, sin * x2 + cos * y2 + cy ];
    }
    scalePoints(sx, sy, x, y) {
        const {x1: x1, y1: y1, x2: x2, y2: y2} = this;
        return [ sx * x1 + (1 - sx) * x, sy * y1 + (1 - sy) * y, sx * x2 + (1 - sx) * x, sy * y2 + (1 - sy) * y ];
    }
}

exports.Bounds = Bounds;

class AABBBounds extends Bounds {}

exports.AABBBounds = AABBBounds;

class OBBBounds extends Bounds {}

exports.OBBBounds = OBBBounds;
//# sourceMappingURL=bounds.js.map

}, function(modId) { var map = {"../common":1689069768005,"../math":1689069768067}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1689069768069, function(require, module, exports) {


Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.normalTransform = exports.Matrix = void 0;

const angle_1 = require("../angle"), math_1 = require("../math");

class Matrix {
    constructor(a = 1, b = 0, c = 0, d = 1, e = 0, f = 0) {
        this.a = a, this.b = b, this.c = c, this.d = d, this.e = e, this.f = f;
    }
    equalToMatrix(m2) {
        return !(this.e !== m2.e || this.f !== m2.f || this.a !== m2.a || this.d !== m2.d || this.b !== m2.b || this.c !== m2.c);
    }
    equalTo(a, b, c, d, e, f) {
        return !(this.e !== e || this.f !== f || this.a !== a || this.d !== d || this.b !== b || this.c !== c);
    }
    setValue(a, b, c, d, e, f) {
        return this.a = a, this.b = b, this.c = c, this.d = d, this.e = e, this.f = f, this;
    }
    reset() {
        return this.a = 1, this.b = 0, this.c = 0, this.d = 1, this.e = 0, this.f = 0, this;
    }
    getInverse() {
        const a = this.a, b = this.b, c = this.c, d = this.d, e = this.e, f = this.f, m = new Matrix, dt = a * d - b * c;
        return m.a = d / dt, m.b = -b / dt, m.c = -c / dt, m.d = a / dt, m.e = (c * f - d * e) / dt, 
        m.f = -(a * f - b * e) / dt, m;
    }
    rotate(rad) {
        const c = Math.cos(rad), s = Math.sin(rad), m11 = this.a * c + this.c * s, m12 = this.b * c + this.d * s, m21 = this.a * -s + this.c * c, m22 = this.b * -s + this.d * c;
        return this.a = m11, this.b = m12, this.c = m21, this.d = m22, this;
    }
    rotateByCenter(rad, cx, cy) {
        const cos = Math.cos(rad), sin = Math.sin(rad), rotateM13 = (1 - cos) * cx + sin * cy, rotateM23 = (1 - cos) * cy - sin * cx, m11 = cos * this.a - sin * this.b, m21 = sin * this.a + cos * this.b, m12 = cos * this.c - sin * this.d, m22 = sin * this.c + cos * this.d, m13 = cos * this.e - sin * this.f + rotateM13, m23 = sin * this.e + cos * this.f + rotateM23;
        return this.a = m11, this.b = m21, this.c = m12, this.d = m22, this.e = m13, this.f = m23, 
        this;
    }
    scale(sx, sy) {
        return this.a *= sx, this.b *= sx, this.c *= sy, this.d *= sy, this;
    }
    setScale(sx, sy) {
        return this.b = this.b / this.a * sx, this.c = this.c / this.d * sy, this.a = sx, 
        this.d = sy, this;
    }
    transform(a, b, c, d, e, f) {
        return this.multiply(a, b, c, d, e, f), this;
    }
    translate(x, y) {
        return this.e += this.a * x + this.c * y, this.f += this.b * x + this.d * y, this;
    }
    transpose() {
        const {a: a, b: b, c: c, d: d, e: e, f: f} = this;
        return this.a = b, this.b = a, this.c = d, this.d = c, this.e = f, this.f = e, this;
    }
    multiply(a2, b2, c2, d2, e2, f2) {
        const a1 = this.a, b1 = this.b, c1 = this.c, d1 = this.d, m11 = a1 * a2 + c1 * b2, m12 = b1 * a2 + d1 * b2, m21 = a1 * c2 + c1 * d2, m22 = b1 * c2 + d1 * d2, dx = a1 * e2 + c1 * f2 + this.e, dy = b1 * e2 + d1 * f2 + this.f;
        return this.a = m11, this.b = m12, this.c = m21, this.d = m22, this.e = dx, this.f = dy, 
        this;
    }
    interpolate(m2, t) {
        const m = new Matrix;
        return m.a = this.a + (m2.a - this.a) * t, m.b = this.b + (m2.b - this.b) * t, m.c = this.c + (m2.c - this.c) * t, 
        m.d = this.d + (m2.d - this.d) * t, m.e = this.e + (m2.e - this.e) * t, m.f = this.f + (m2.f - this.f) * t, 
        m;
    }
    transformPoint(source, target) {
        const {a: a, b: b, c: c, d: d, e: e, f: f} = this, dt = a * d - b * c, nextA = d / dt, nextB = -b / dt, nextC = -c / dt, nextD = a / dt, nextE = (c * f - d * e) / dt, nextF = -(a * f - b * e) / dt, {x: x, y: y} = source;
        target.x = x * nextA + y * nextC + nextE, target.y = x * nextB + y * nextD + nextF;
    }
    onlyTranslate(scale = 1) {
        return this.a === scale && 0 === this.b && 0 === this.c && this.d === scale;
    }
    clone() {
        return new Matrix(this.a, this.b, this.c, this.d, this.e, this.f);
    }
    toTransformAttrs() {
        const a = this.a, b = this.b, c = this.c, d = this.d, delta = a * d - b * c, result = {
            x: this.e,
            y: this.f,
            rotateDeg: 0,
            scaleX: 0,
            scaleY: 0,
            skewX: 0,
            skewY: 0
        };
        if (0 !== a || 0 !== b) {
            const r = Math.sqrt(a * a + b * b);
            result.rotateDeg = b > 0 ? Math.acos(a / r) : -Math.acos(a / r), result.scaleX = r, 
            result.scaleY = delta / r, result.skewX = (a * c + b * d) / delta, result.skewY = 0;
        } else if (0 !== c || 0 !== d) {
            const s = Math.sqrt(c * c + d * d);
            result.rotateDeg = Math.PI / 2 - (d > 0 ? Math.acos(-c / s) : -Math.acos(c / s)), 
            result.scaleX = delta / s, result.scaleY = s, result.skewX = 0, result.skewY = (a * c + b * d) / delta;
        }
        return result.rotateDeg = (0, angle_1.radianToDegree)(result.rotateDeg), result;
    }
}

function normalTransform(out, origin, x, y, scaleX, scaleY, angle, rotateCenter) {
    const oa = origin.a, ob = origin.b, oc = origin.c, od = origin.d, oe = origin.e, of = origin.f, cosTheta = (0, 
    math_1.cos)(angle), sinTheta = (0, math_1.sin)(angle);
    let rotateCenterX, rotateCenterY;
    rotateCenter ? (rotateCenterX = rotateCenter[0], rotateCenterY = rotateCenter[1]) : (rotateCenterX = x, 
    rotateCenterY = y);
    const offsetX = rotateCenterX - x, offsetY = rotateCenterY - y, a1 = oa * cosTheta + oc * sinTheta, b1 = ob * cosTheta + od * sinTheta, c1 = oc * cosTheta - oa * sinTheta, d1 = od * cosTheta - ob * sinTheta;
    out.a = scaleX * a1, out.b = scaleX * b1, out.c = scaleY * c1, out.d = scaleY * d1, 
    out.e = oe + oa * rotateCenterX + oc * rotateCenterY - a1 * offsetX - c1 * offsetY, 
    out.f = of + ob * rotateCenterX + od * rotateCenterY - b1 * offsetX - d1 * offsetY;
}

exports.Matrix = Matrix, exports.normalTransform = normalTransform;
//# sourceMappingURL=matrix.js.map

}, function(modId) { var map = {"../angle":1689069768070,"../math":1689069768067}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1689069768070, function(require, module, exports) {


Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.getAngleByPoint = exports.polarToCartesian = exports.clampAngleByDegree = exports.clampDegree = exports.clampAngleByRadian = exports.clampRadian = exports.radianToDegree = exports.degreeToRadian = void 0;

const math_1 = require("./math");

function degreeToRadian(degree) {
    return degree * (Math.PI / 180);
}

function radianToDegree(radian) {
    return 180 * radian / Math.PI;
}

exports.degreeToRadian = degreeToRadian, exports.radianToDegree = radianToDegree;

const clampRadian = (angle = 0) => {
    if (angle < 0) for (;angle < -math_1.tau; ) angle += math_1.tau; else if (angle > 0) for (;angle > math_1.tau; ) angle -= math_1.tau;
    return angle;
};

exports.clampRadian = clampRadian, exports.clampAngleByRadian = exports.clampRadian;

const clampDegree = (a = 0) => a > 360 || a < -360 ? a % 360 : a;

function polarToCartesian(center, radius, angleInRadian) {
    return {
        x: center.x + radius * Math.cos(angleInRadian),
        y: center.y + radius * Math.sin(angleInRadian)
    };
}

function getAngleByPoint(center, point) {
    return Math.atan2(point.y - center.y, point.x - center.x);
}

exports.clampDegree = clampDegree, exports.clampAngleByDegree = exports.clampDegree, 
exports.polarToCartesian = polarToCartesian, exports.getAngleByPoint = getAngleByPoint;
}, function(modId) { var map = {"./math":1689069768067}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1689069768071, function(require, module, exports) {


Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.LRU = void 0;

class LRU {
    static clearCache(cache, params) {
        const {CLEAN_THRESHOLD: CLEAN_THRESHOLD = LRU.CLEAN_THRESHOLD, L_TIME: L_TIME = LRU.L_TIME, R_COUNT: R_COUNT = LRU.R_COUNT} = params;
        if (cache.size < CLEAN_THRESHOLD) return 0;
        let clearNum = 0;
        const clear = key => {
            clearNum++, cache.delete(key);
        }, now = Date.now();
        return cache.forEach(((item, key) => {
            if (item.timestamp.length < R_COUNT) return clear(key);
            let useCount = 0;
            for (;now - item.timestamp[item.timestamp.length - 1 - useCount] < L_TIME && (useCount++, 
            !(useCount >= R_COUNT)); ) ;
            if (useCount < R_COUNT) return clear(key);
            for (;now - item.timestamp[0] > L_TIME; ) item.timestamp.shift();
        })), clearNum;
    }
    static addLimitedTimestamp(cacheItem, t, params) {
        const {R_TIMESTAMP_MAX_SIZE: R_TIMESTAMP_MAX_SIZE = LRU.R_TIMESTAMP_MAX_SIZE} = params;
        cacheItem.timestamp.length > R_TIMESTAMP_MAX_SIZE && cacheItem.timestamp.shift(), 
        cacheItem.timestamp.push(t);
    }
    static clearTimeStamp(cache, params) {
        const {L_TIME: L_TIME = LRU.L_TIME} = params, now = Date.now();
        cache.forEach((item => {
            for (;now - item.timestamp[0] > L_TIME; ) item.timestamp.shift();
        }));
    }
    static clearItemTimestamp(cacheItem, params) {
        const {L_TIME: L_TIME = LRU.L_TIME} = params, now = Date.now();
        for (;now - cacheItem.timestamp[0] > L_TIME; ) cacheItem.timestamp.shift();
    }
}

exports.LRU = LRU, LRU.CLEAN_THRESHOLD = 1e3, LRU.L_TIME = 1e3, LRU.R_COUNT = 1, 
LRU.R_TIMESTAMP_MAX_SIZE = 20;
//# sourceMappingURL=lru.js.map
}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1689069768072, function(require, module, exports) {


var __createBinding = this && this.__createBinding || (Object.create ? function(o, m, k, k2) {
    void 0 === k2 && (k2 = k);
    var desc = Object.getOwnPropertyDescriptor(m, k);
    desc && !("get" in desc ? !m.__esModule : desc.writable || desc.configurable) || (desc = {
        enumerable: !0,
        get: function() {
            return m[k];
        }
    }), Object.defineProperty(o, k2, desc);
} : function(o, m, k, k2) {
    void 0 === k2 && (k2 = k), o[k2] = m[k];
}), __exportStar = this && this.__exportStar || function(m, exports) {
    for (var p in m) "default" === p || Object.prototype.hasOwnProperty.call(exports, p) || __createBinding(exports, m, p);
}, __importDefault = this && this.__importDefault || function(mod) {
    return mod && mod.__esModule ? mod : {
        default: mod
    };
};

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.rgbToHsl = exports.rgbToHex = exports.hslToRgb = exports.hexToRgb = exports.DEFAULT_COLORS = exports.RGB = exports.Color = void 0;

var Color_1 = require("./Color");

Object.defineProperty(exports, "Color", {
    enumerable: !0,
    get: function() {
        return Color_1.Color;
    }
}), Object.defineProperty(exports, "RGB", {
    enumerable: !0,
    get: function() {
        return Color_1.RGB;
    }
}), Object.defineProperty(exports, "DEFAULT_COLORS", {
    enumerable: !0,
    get: function() {
        return Color_1.DEFAULT_COLORS;
    }
});

var hexToRgb_1 = require("./hexToRgb");

Object.defineProperty(exports, "hexToRgb", {
    enumerable: !0,
    get: function() {
        return __importDefault(hexToRgb_1).default;
    }
});

var hslToRgb_1 = require("./hslToRgb");

Object.defineProperty(exports, "hslToRgb", {
    enumerable: !0,
    get: function() {
        return __importDefault(hslToRgb_1).default;
    }
});

var rgbToHex_1 = require("./rgbToHex");

Object.defineProperty(exports, "rgbToHex", {
    enumerable: !0,
    get: function() {
        return __importDefault(rgbToHex_1).default;
    }
});

var rgbToHsl_1 = require("./rgbToHsl");

Object.defineProperty(exports, "rgbToHsl", {
    enumerable: !0,
    get: function() {
        return __importDefault(rgbToHsl_1).default;
    }
}), __exportStar(require("./interpolate"), exports);
//# sourceMappingURL=index.js.map
}, function(modId) { var map = {"./Color":1689069768073,"./hexToRgb":1689069768076,"./hslToRgb":1689069768074,"./rgbToHex":1689069768077,"./rgbToHsl":1689069768075,"./interpolate":1689069768078}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1689069768073, function(require, module, exports) {


var __importDefault = this && this.__importDefault || function(mod) {
    return mod && mod.__esModule ? mod : {
        default: mod
    };
};

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.RGB = exports.Color = exports.DEFAULT_COLORS = void 0;

const common_1 = require("../common"), hslToRgb_1 = __importDefault(require("./hslToRgb")), rgbToHsl_1 = __importDefault(require("./rgbToHsl")), REG_HEX = /^#([0-9a-f]{3,8})$/, DEFAULT_COLORS_OPACITY = {
    transparent: 4294967040
};

function hex(value) {
    return ((value = Math.max(0, Math.min(255, Math.round(value) || 0))) < 16 ? "0" : "") + value.toString(16);
}

function rgb(value) {
    return (0, common_1.isNumber)(value) ? new RGB(value >> 16, value >> 8 & 255, 255 & value, 1) : (0, 
    common_1.isArray)(value) ? new RGB(value[0], value[1], value[2]) : new RGB(255, 255, 255);
}

function rgba(value) {
    return (0, common_1.isNumber)(value) ? new RGB(value >>> 24, value >>> 16 & 255, value >>> 8 & 255, 255 & value) : (0, 
    common_1.isArray)(value) ? new RGB(value[0], value[1], value[2], value[3]) : new RGB(255, 255, 255, 1);
}

exports.DEFAULT_COLORS = {
    aliceblue: 15792383,
    antiquewhite: 16444375,
    aqua: 65535,
    aquamarine: 8388564,
    azure: 15794175,
    beige: 16119260,
    bisque: 16770244,
    black: 0,
    blanchedalmond: 16772045,
    blue: 255,
    blueviolet: 9055202,
    brown: 10824234,
    burlywood: 14596231,
    cadetblue: 6266528,
    chartreuse: 8388352,
    chocolate: 13789470,
    coral: 16744272,
    cornflowerblue: 6591981,
    cornsilk: 16775388,
    crimson: 14423100,
    cyan: 65535,
    darkblue: 139,
    darkcyan: 35723,
    darkgoldenrod: 12092939,
    darkgray: 11119017,
    darkgreen: 25600,
    darkgrey: 11119017,
    darkkhaki: 12433259,
    darkmagenta: 9109643,
    darkolivegreen: 5597999,
    darkorange: 16747520,
    darkorchid: 10040012,
    darkred: 9109504,
    darksalmon: 15308410,
    darkseagreen: 9419919,
    darkslateblue: 4734347,
    darkslategray: 3100495,
    darkslategrey: 3100495,
    darkturquoise: 52945,
    darkviolet: 9699539,
    deeppink: 16716947,
    deepskyblue: 49151,
    dimgray: 6908265,
    dimgrey: 6908265,
    dodgerblue: 2003199,
    firebrick: 11674146,
    floralwhite: 16775920,
    forestgreen: 2263842,
    fuchsia: 16711935,
    gainsboro: 14474460,
    ghostwhite: 16316671,
    gold: 16766720,
    goldenrod: 14329120,
    gray: 8421504,
    green: 32768,
    greenyellow: 11403055,
    grey: 8421504,
    honeydew: 15794160,
    hotpink: 16738740,
    indianred: 13458524,
    indigo: 4915330,
    ivory: 16777200,
    khaki: 15787660,
    lavender: 15132410,
    lavenderblush: 16773365,
    lawngreen: 8190976,
    lemonchiffon: 16775885,
    lightblue: 11393254,
    lightcoral: 15761536,
    lightcyan: 14745599,
    lightgoldenrodyellow: 16448210,
    lightgray: 13882323,
    lightgreen: 9498256,
    lightgrey: 13882323,
    lightpink: 16758465,
    lightsalmon: 16752762,
    lightseagreen: 2142890,
    lightskyblue: 8900346,
    lightslategray: 7833753,
    lightslategrey: 7833753,
    lightsteelblue: 11584734,
    lightyellow: 16777184,
    lime: 65280,
    limegreen: 3329330,
    linen: 16445670,
    magenta: 16711935,
    maroon: 8388608,
    mediumaquamarine: 6737322,
    mediumblue: 205,
    mediumorchid: 12211667,
    mediumpurple: 9662683,
    mediumseagreen: 3978097,
    mediumslateblue: 8087790,
    mediumspringgreen: 64154,
    mediumturquoise: 4772300,
    mediumvioletred: 13047173,
    midnightblue: 1644912,
    mintcream: 16121850,
    mistyrose: 16770273,
    moccasin: 16770229,
    navajowhite: 16768685,
    navy: 128,
    oldlace: 16643558,
    olive: 8421376,
    olivedrab: 7048739,
    orange: 16753920,
    orangered: 16729344,
    orchid: 14315734,
    palegoldenrod: 15657130,
    palegreen: 10025880,
    paleturquoise: 11529966,
    palevioletred: 14381203,
    papayawhip: 16773077,
    peachpuff: 16767673,
    peru: 13468991,
    pink: 16761035,
    plum: 14524637,
    powderblue: 11591910,
    purple: 8388736,
    rebeccapurple: 6697881,
    red: 16711680,
    rosybrown: 12357519,
    royalblue: 4286945,
    saddlebrown: 9127187,
    salmon: 16416882,
    sandybrown: 16032864,
    seagreen: 3050327,
    seashell: 16774638,
    sienna: 10506797,
    silver: 12632256,
    skyblue: 8900331,
    slateblue: 6970061,
    slategray: 7372944,
    slategrey: 7372944,
    snow: 16775930,
    springgreen: 65407,
    steelblue: 4620980,
    tan: 13808780,
    teal: 32896,
    thistle: 14204888,
    tomato: 16737095,
    turquoise: 4251856,
    violet: 15631086,
    wheat: 16113331,
    white: 16777215,
    whitesmoke: 16119285,
    yellow: 16776960,
    yellowgreen: 10145074
};

class Color {
    static Brighter(source, b = 1) {
        return 1 === b ? source : new Color(source).brighter(b).toRGBA();
    }
    static SetOpacity(source, o = 1) {
        return 1 === o ? source : new Color(source).setOpacity(o).toRGBA();
    }
    static getColorBrightness(source, model = "hsl") {
        const color = source instanceof Color ? source : new Color(source);
        switch (model) {
          case "hsv":
          default:
            return color.getHSVBrightness();

          case "hsl":
            return color.getHSLBrightness();

          case "lum":
            return color.getLuminance();

          case "lum2":
            return color.getLuminance2();

          case "lum3":
            return color.getLuminance3();
        }
    }
    static parseColorString(value) {
        if ((0, common_1.isValid)(DEFAULT_COLORS_OPACITY[value])) return rgba(DEFAULT_COLORS_OPACITY[value]);
        if ((0, common_1.isValid)(exports.DEFAULT_COLORS[value])) return rgb(exports.DEFAULT_COLORS[value]);
        const formatValue = `${value}`.trim().toLowerCase(), isHex = REG_HEX.exec(formatValue);
        if (isHex) {
            const hex = parseInt(isHex[1], 16), hexLength = isHex[1].length;
            return 3 === hexLength ? new RGB((hex >> 8 & 15) + ((hex >> 8 & 15) << 4), (hex >> 4 & 15) + ((hex >> 4 & 15) << 4), (15 & hex) + ((15 & hex) << 4), 1) : 6 === hexLength ? rgb(hex) : 8 === hexLength ? new RGB(hex >> 24 & 255, hex >> 16 & 255, hex >> 8 & 255, (255 & hex) / 255) : void 0;
        }
        if (/^(rgb|RGB|rgba|RGBA)/.test(formatValue)) {
            const aColor = formatValue.replace(/(?:\(|\)|rgba|RGBA|rgb|RGB)*/g, "").split(",");
            return new RGB(parseInt(aColor[0], 10), parseInt(aColor[1], 10), parseInt(aColor[2], 10), parseFloat(aColor[3]));
        }
        if (/^(hsl|HSL|hsla|HSLA)/.test(formatValue)) {
            const aColor = formatValue.replace(/(?:\(|\)|hsla|HSLA|hsl|HSL)*/g, "").split(","), rgb = (0, 
            hslToRgb_1.default)(parseInt(aColor[0], 10), parseInt(aColor[1], 10), parseInt(aColor[2], 10));
            return new RGB(rgb.r, rgb.g, rgb.b, parseFloat(aColor[3]));
        }
    }
    constructor(value) {
        const color = Color.parseColorString(value);
        color ? this.color = color : (console.warn(`Warn: 传入${value}无法解析为Color`), this.color = new RGB(255, 255, 255));
    }
    toRGBA() {
        return this.color.formatRgb();
    }
    toString() {
        return this.color.formatRgb();
    }
    toHex() {
        return this.color.formatHex();
    }
    toHsl() {
        return this.color.formatHsl();
    }
    setOpacity(o = 1) {
        return this.color.opacity = o, this;
    }
    brighter(k) {
        const {r: r, g: g, b: b} = this.color;
        return this.color.r = Math.max(0, Math.min(255, Math.floor(r * k))), this.color.g = Math.max(0, Math.min(255, Math.floor(g * k))), 
        this.color.b = Math.max(0, Math.min(255, Math.floor(b * k))), this;
    }
    getHSVBrightness() {
        return Math.max(this.color.r, this.color.g, this.color.b) / 255;
    }
    getHSLBrightness() {
        return .5 * (Math.max(this.color.r, this.color.g, this.color.b) / 255 + Math.min(this.color.r, this.color.g, this.color.b) / 255);
    }
    setHsl(h, s, l) {
        const opacity = this.color.opacity, hsl = (0, rgbToHsl_1.default)(this.color.r, this.color.g, this.color.b), rgb = (0, 
        hslToRgb_1.default)((0, common_1.isNil)(h) ? hsl.h : (0, common_1.clamp)(h, 0, 360), (0, 
        common_1.isNil)(s) ? hsl.s : s >= 0 && s <= 1 ? 100 * s : s, (0, common_1.isNil)(l) ? hsl.l : l <= 1 && l >= 0 ? 100 * l : l);
        return this.color = new RGB(rgb.r, rgb.g, rgb.b, opacity), this;
    }
    getLuminance() {
        return (.2126 * this.color.r + .7152 * this.color.g + .0722 * this.color.b) / 255;
    }
    getLuminance2() {
        return (.2627 * this.color.r + .678 * this.color.g + .0593 * this.color.b) / 255;
    }
    getLuminance3() {
        return (.299 * this.color.r + .587 * this.color.g + .114 * this.color.b) / 255;
    }
}

exports.Color = Color;

class RGB {
    constructor(r, g, b, opacity) {
        this.r = isNaN(+r) ? 255 : Math.max(0, Math.min(255, +r)), this.g = isNaN(+g) ? 255 : Math.max(0, Math.min(255, +g)), 
        this.b = isNaN(+b) ? 255 : Math.max(0, Math.min(255, +b)), (0, common_1.isValid)(opacity) ? this.opacity = isNaN(+opacity) ? 1 : Math.max(0, Math.min(1, +opacity)) : this.opacity = 1;
    }
    formatHex() {
        return `#${hex(this.r) + hex(this.g) + hex(this.b) + (1 === this.opacity ? "" : hex(255 * this.opacity))}`;
    }
    formatRgb() {
        const opacity = this.opacity;
        return `${1 === opacity ? "rgb(" : "rgba("}${this.r},${this.g},${this.b}${1 === opacity ? ")" : `,${opacity})`}`;
    }
    formatHsl() {
        const opacity = this.opacity, {h: h, s: s, l: l} = (0, rgbToHsl_1.default)(this.r, this.g, this.b);
        return `${1 === opacity ? "hsl(" : "hsla("}${h},${s}%,${l}%${1 === opacity ? ")" : `,${opacity})`}`;
    }
    toString() {
        return this.formatHex();
    }
}

exports.RGB = RGB;
//# sourceMappingURL=Color.js.map
}, function(modId) { var map = {"../common":1689069768005,"./hslToRgb":1689069768074,"./rgbToHsl":1689069768075}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1689069768074, function(require, module, exports) {


function hslToRgb(h, s, l) {
    s /= 100, l /= 100;
    const c = (1 - Math.abs(2 * l - 1)) * s, x = c * (1 - Math.abs(h / 60 % 2 - 1)), m = l - c / 2;
    let r = 0, g = 0, b = 0;
    return 0 <= h && h < 60 ? (r = c, g = x, b = 0) : 60 <= h && h < 120 ? (r = x, g = c, 
    b = 0) : 120 <= h && h < 180 ? (r = 0, g = c, b = x) : 180 <= h && h < 240 ? (r = 0, 
    g = x, b = c) : 240 <= h && h < 300 ? (r = x, g = 0, b = c) : 300 <= h && h < 360 && (r = c, 
    g = 0, b = x), r = Math.round(255 * (r + m)), g = Math.round(255 * (g + m)), b = Math.round(255 * (b + m)), 
    {
        r: r,
        g: g,
        b: b
    };
}

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.default = hslToRgb;
//# sourceMappingURL=hslToRgb.js.map
}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1689069768075, function(require, module, exports) {


function rgbToHsl(r, g, b) {
    r /= 255, g /= 255, b /= 255;
    const cMin = Math.min(r, g, b), cMax = Math.max(r, g, b), delta = cMax - cMin;
    let h = 0, s = 0, l = 0;
    return h = 0 === delta ? 0 : cMax === r ? (g - b) / delta % 6 : cMax === g ? (b - r) / delta + 2 : (r - g) / delta + 4, 
    h = Math.round(60 * h), h < 0 && (h += 360), l = (cMax + cMin) / 2, s = 0 === delta ? 0 : delta / (1 - Math.abs(2 * l - 1)), 
    s = +(100 * s).toFixed(1), l = +(100 * l).toFixed(1), {
        h: h,
        s: s,
        l: l
    };
}

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.default = rgbToHsl;
//# sourceMappingURL=rgbToHsl.js.map
}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1689069768076, function(require, module, exports) {


function hexToRgb(str) {
    let r = "", g = "", b = "";
    const strtIndex = "#" === str[0] ? 1 : 0;
    for (let i = strtIndex; i < str.length; i++) "#" !== str[i] && (i < strtIndex + 2 ? r += str[i] : i < strtIndex + 4 ? g += str[i] : i < strtIndex + 6 && (b += str[i]));
    return [ parseInt(r, 16), parseInt(g, 16), parseInt(b, 16) ];
}

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.default = hexToRgb;
//# sourceMappingURL=hexToRgb.js.map
}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1689069768077, function(require, module, exports) {


function rgbToHex(r, g, b) {
    return Number((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.default = rgbToHex;
//# sourceMappingURL=rgbToHex.js.map
}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1689069768078, function(require, module, exports) {


Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.interpolateRgb = void 0;

const Color_1 = require("./Color");

function interpolateRgb(colorA, colorB) {
    const redA = colorA.r, redB = colorB.r, greenA = colorA.g, greenB = colorB.g, blueA = colorA.b, blueB = colorB.b, opacityA = colorA.opacity, opacityB = colorB.opacity;
    return t => {
        const r = Math.round(redA * (1 - t) + redB * t), g = Math.round(greenA * (1 - t) + greenB * t), b = Math.round(blueA * (1 - t) + blueB * t), opacity = opacityA * (1 - t) + opacityB * t;
        return new Color_1.RGB(r, g, b, opacity);
    };
}

exports.interpolateRgb = interpolateRgb;
//# sourceMappingURL=interpolate.js.map
}, function(modId) { var map = {"./Color":1689069768073}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1689069768079, function(require, module, exports) {


var __createBinding = this && this.__createBinding || (Object.create ? function(o, m, k, k2) {
    void 0 === k2 && (k2 = k);
    var desc = Object.getOwnPropertyDescriptor(m, k);
    desc && !("get" in desc ? !m.__esModule : desc.writable || desc.configurable) || (desc = {
        enumerable: !0,
        get: function() {
            return m[k];
        }
    }), Object.defineProperty(o, k2, desc);
} : function(o, m, k, k2) {
    void 0 === k2 && (k2 = k), o[k2] = m[k];
}), __exportStar = this && this.__exportStar || function(m, exports) {
    for (var p in m) "default" === p || Object.prototype.hasOwnProperty.call(exports, p) || __createBinding(exports, m, p);
};

Object.defineProperty(exports, "__esModule", {
    value: !0
}), __exportStar(require("./image"), exports), __exportStar(require("./algorithm"), exports), 
__exportStar(require("./graph-util"), exports), __exportStar(require("./polygon"), exports), 
__exportStar(require("./text"), exports);
//# sourceMappingURL=index.js.map

}, function(modId) { var map = {"./image":1689069768080,"./algorithm":1689069768081,"./graph-util":1689069768085,"./polygon":1689069768086,"./text":1689069768087}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1689069768080, function(require, module, exports) {


Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.parseUint8ToImageData = void 0;

const parseUint8ToImageData = (buffer, width, height) => {
    const clampBuffer = new Uint8ClampedArray(buffer), flipClampBuffer = new Uint8ClampedArray(buffer.length);
    for (let i = height - 1; i >= 0; i--) for (let j = 0; j < width; j++) {
        const sourceIdx = i * width * 4 + 4 * j, targetIdx = (height - i) * width * 4 + 4 * j;
        flipClampBuffer[targetIdx] = clampBuffer[sourceIdx], flipClampBuffer[targetIdx + 1] = clampBuffer[sourceIdx + 1], 
        flipClampBuffer[targetIdx + 2] = clampBuffer[sourceIdx + 2], flipClampBuffer[targetIdx + 3] = clampBuffer[sourceIdx + 3];
    }
    return new ImageData(flipClampBuffer, width, height);
};

exports.parseUint8ToImageData = parseUint8ToImageData;
//# sourceMappingURL=image.js.map

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1689069768081, function(require, module, exports) {


var __createBinding = this && this.__createBinding || (Object.create ? function(o, m, k, k2) {
    void 0 === k2 && (k2 = k);
    var desc = Object.getOwnPropertyDescriptor(m, k);
    desc && !("get" in desc ? !m.__esModule : desc.writable || desc.configurable) || (desc = {
        enumerable: !0,
        get: function() {
            return m[k];
        }
    }), Object.defineProperty(o, k2, desc);
} : function(o, m, k, k2) {
    void 0 === k2 && (k2 = k), o[k2] = m[k];
}), __exportStar = this && this.__exportStar || function(m, exports) {
    for (var p in m) "default" === p || Object.prototype.hasOwnProperty.call(exports, p) || __createBinding(exports, m, p);
};

Object.defineProperty(exports, "__esModule", {
    value: !0
}), __exportStar(require("./intersect"), exports), __exportStar(require("./aabb"), exports), 
__exportStar(require("./obb"), exports);
//# sourceMappingURL=index.js.map

}, function(modId) { var map = {"./intersect":1689069768082,"./aabb":1689069768083,"./obb":1689069768084}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1689069768082, function(require, module, exports) {


Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.isRotateAABBIntersect = exports.pointInRect = exports.isRectIntersect = exports.rectInsideAnotherRect = exports.InnerBBox = exports.getRectIntersect = exports.getIntersectPoint = exports.isIntersect = void 0;

const math_1 = require("../../math");

function sub(out, v1, v2) {
    out[0] = v1[0] - v2[0], out[1] = v1[1] - v2[1];
}

let x11, x12, y11, y12, x21, x22, y21, y22;

function isIntersect(left1, right1, left2, right2) {
    let _temp, min1 = left1[0], max1 = right1[0], min2 = left2[0], max2 = right2[0];
    return max1 < min1 && (_temp = max1, max1 = min1, min1 = _temp), max2 < min2 && (_temp = max2, 
    max2 = min2, min2 = _temp), !(max1 < min2 || max2 < min1) && (min1 = left1[1], max1 = right1[1], 
    min2 = left2[1], max2 = right2[1], max1 < min1 && (_temp = max1, max1 = min1, min1 = _temp), 
    max2 < min2 && (_temp = max2, max2 = min2, min2 = _temp), !(max1 < min2 || max2 < min1));
}

function getIntersectPoint(left1, right1, left2, right2) {
    if (!isIntersect(left1, right1, left2, right2)) return !1;
    const dir1 = [ 0, 0 ], dir2 = [ 0, 0 ], tempVec = [ 0, 0 ];
    if (sub(dir1, right1, left1), sub(dir2, right2, left2), (0, math_1.fuzzyEqualVec)(dir1, dir2)) return !0;
    sub(tempVec, left2, left1);
    const t = (0, math_1.crossProduct)(tempVec, dir2) / (0, math_1.crossProduct)(dir1, dir2);
    return t >= 0 && t <= 1 && [ left1[0] + dir1[0] * t, left1[1] + dir1[1] * t ];
}

function getRectIntersect(bbox1, bbox2, format) {
    return null === bbox1 ? bbox2 : null === bbox2 ? bbox1 : (x11 = bbox1.x1, x12 = bbox1.x2, 
    y11 = bbox1.y1, y12 = bbox1.y2, x21 = bbox2.x1, x22 = bbox2.x2, y21 = bbox2.y1, 
    y22 = bbox2.y2, format && (x11 > x12 && ([x11, x12] = [ x12, x11 ]), y11 > y12 && ([y11, y12] = [ y12, y11 ]), 
    x21 > x22 && ([x21, x22] = [ x22, x21 ]), y21 > y22 && ([y21, y22] = [ y22, y21 ])), 
    x11 >= x22 || x12 <= x21 || y11 >= y22 || y12 <= y21 ? {
        x1: 0,
        y1: 0,
        x2: 0,
        y2: 0
    } : {
        x1: Math.max(x11, x21),
        y1: Math.max(y11, y21),
        x2: Math.min(x12, x22),
        y2: Math.min(y12, y22)
    });
}

var InnerBBox;

function rectInsideAnotherRect(bbox1, bbox2, format) {
    return bbox1 && bbox2 ? (x11 = bbox1.x1, x12 = bbox1.x2, y11 = bbox1.y1, y12 = bbox1.y2, 
    x21 = bbox2.x1, x22 = bbox2.x2, y21 = bbox2.y1, y22 = bbox2.y2, format && (x11 > x12 && ([x11, x12] = [ x12, x11 ]), 
    y11 > y12 && ([y11, y12] = [ y12, y11 ]), x21 > x22 && ([x21, x22] = [ x22, x21 ]), 
    y21 > y22 && ([y21, y22] = [ y22, y21 ])), x11 > x21 && x12 < x22 && y11 > y21 && y12 < y22 ? InnerBBox.BBOX1 : x21 > x11 && x22 < x12 && y21 > y11 && y22 < y12 ? InnerBBox.BBOX2 : InnerBBox.NONE) : InnerBBox.NONE;
}

function isRectIntersect(bbox1, bbox2, format) {
    return !bbox1 || !bbox2 || (format ? (x11 = bbox1.x1, x12 = bbox1.x2, y11 = bbox1.y1, 
    y12 = bbox1.y2, x21 = bbox2.x1, x22 = bbox2.x2, y21 = bbox2.y1, y22 = bbox2.y2, 
    x11 > x12 && ([x11, x12] = [ x12, x11 ]), y11 > y12 && ([y11, y12] = [ y12, y11 ]), 
    x21 > x22 && ([x21, x22] = [ x22, x21 ]), y21 > y22 && ([y21, y22] = [ y22, y21 ]), 
    !(x11 > x22 || x12 < x21 || y11 > y22 || y12 < y21)) : !(bbox1.x1 > bbox2.x2 || bbox1.x2 < bbox2.x1 || bbox1.y1 > bbox2.y2 || bbox1.y2 < bbox2.y1));
}

function pointInRect(point, bbox, format) {
    return !bbox || (format ? (x11 = bbox.x1, x12 = bbox.x2, y11 = bbox.y1, y12 = bbox.y2, 
    x11 > x12 && ([x11, x12] = [ x12, x11 ]), y11 > y12 && ([y11, y12] = [ y12, y11 ]), 
    point.x >= x11 && point.x <= x12 && point.y >= y11 && point.y <= y12) : point.x >= bbox.x1 && point.x <= bbox.x2 && point.y >= bbox.y1 && point.y <= bbox.y2);
}

function getProjectionRadius(checkAxis, axis) {
    return Math.abs(axis[0] * checkAxis[0] + axis[1] * checkAxis[1]);
}

function rotate({x: x, y: y}, deg, origin = {
    x: 0,
    y: 0
}) {
    return {
        x: (x - origin.x) * Math.cos(deg) + (y - origin.y) * Math.sin(deg) + origin.x,
        y: (x - origin.x) * Math.sin(deg) + (origin.y - y) * Math.cos(deg) + origin.y
    };
}

function toDeg(angle) {
    return angle / 180 * Math.PI;
}

function getCenterPoint(box) {
    return {
        x: (box.x1 + box.x2) / 2,
        y: (box.y1 + box.y2) / 2
    };
}

function toRect(box, isDeg) {
    const deg = isDeg ? box.angle : toDeg(box.angle), cp = getCenterPoint(box);
    return [ rotate({
        x: box.x1,
        y: box.y1
    }, deg, cp), rotate({
        x: box.x2,
        y: box.y1
    }, deg, cp), rotate({
        x: box.x2,
        y: box.y2
    }, deg, cp), rotate({
        x: box.x1,
        y: box.y2
    }, deg, cp) ];
}

function isRotateAABBIntersect(box1, box2, isDeg = !1, ctx) {
    const rect1 = toRect(box1, isDeg), rect2 = toRect(box2, isDeg), vector = (start, end) => [ end.x - start.x, end.y - start.y ];
    ctx && (ctx.save(), ctx.fillStyle = "red", ctx.globalAlpha = .6, rect1.forEach(((item, index) => {
        0 === index ? ctx.moveTo(item.x, item.y) : ctx.lineTo(item.x, item.y);
    })), ctx.fill(), ctx.restore(), ctx.save(), ctx.fillStyle = "green", ctx.globalAlpha = .6, 
    rect2.forEach(((item, index) => {
        0 === index ? ctx.moveTo(item.x, item.y) : ctx.lineTo(item.x, item.y);
    })), ctx.fill(), ctx.restore());
    const p1 = getCenterPoint(box1), p2 = getCenterPoint(box2);
    ctx && ctx.fillRect(p1.x, p1.y, 2, 2), ctx && ctx.fillRect(p2.x, p2.y, 2, 2);
    const vp1p2 = vector(p1, p2), AB = vector(rect1[0], rect1[1]), BC = vector(rect1[1], rect1[2]), A1B1 = vector(rect2[0], rect2[1]), B1C1 = vector(rect2[1], rect2[2]), deg11 = isDeg ? box1.angle : toDeg(box1.angle);
    let deg12 = isDeg ? box1.angle + math_1.halfPi : toDeg(90 - box1.angle);
    const deg21 = isDeg ? box2.angle : toDeg(box2.angle);
    let deg22 = isDeg ? box2.angle + math_1.halfPi : toDeg(90 - box2.angle);
    deg12 > math_1.pi2 && (deg12 -= math_1.pi2), deg22 > math_1.pi2 && (deg22 -= math_1.pi2);
    const isCover = (checkAxisRadius, deg, targetAxis1, targetAxis2) => {
        const checkAxis = [ Math.cos(deg), Math.sin(deg) ];
        return checkAxisRadius + (getProjectionRadius(checkAxis, targetAxis1) + getProjectionRadius(checkAxis, targetAxis2)) / 2 > getProjectionRadius(checkAxis, vp1p2);
    };
    return isCover((box1.x2 - box1.x1) / 2, deg11, A1B1, B1C1) && isCover((box1.y2 - box1.y1) / 2, deg12, A1B1, B1C1) && isCover((box2.x2 - box2.x1) / 2, deg21, AB, BC) && isCover((box2.y2 - box2.y1) / 2, deg22, AB, BC);
}

exports.isIntersect = isIntersect, exports.getIntersectPoint = getIntersectPoint, 
exports.getRectIntersect = getRectIntersect, function(InnerBBox) {
    InnerBBox[InnerBBox.NONE = 0] = "NONE", InnerBBox[InnerBBox.BBOX1 = 1] = "BBOX1", 
    InnerBBox[InnerBBox.BBOX2 = 2] = "BBOX2";
}(InnerBBox = exports.InnerBBox || (exports.InnerBBox = {})), exports.rectInsideAnotherRect = rectInsideAnotherRect, 
exports.isRectIntersect = isRectIntersect, exports.pointInRect = pointInRect, exports.isRotateAABBIntersect = isRotateAABBIntersect;
//# sourceMappingURL=intersect.js.map

}, function(modId) { var map = {"../../math":1689069768067}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1689069768083, function(require, module, exports) {


Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.mergeAABB = exports.unionAABB = exports.pointInAABB = exports.getAABBFromPoints = void 0;

const intersect_1 = require("./intersect");

let x1, y1, x2, y2;

function getAABBFromPoints(points) {
    return x1 = 1 / 0, y1 = 1 / 0, x2 = -1 / 0, y2 = -1 / 0, points.forEach((point => {
        x1 > point.x && (x1 = point.x), x2 < point.x && (x2 = point.x), y1 > point.y && (y1 = point.y), 
        y2 < point.y && (y2 = point.y);
    })), {
        x1: x1,
        y1: y1,
        x2: x2,
        y2: y2
    };
}

function pointInAABB(point, aabb) {
    return (0, intersect_1.pointInRect)(point, aabb, !1);
}

function unionAABB(bounds1, bounds2, buffer = 3, format = !1) {
    let x11 = bounds1.x1, x12 = bounds1.x2, y11 = bounds1.y1, y12 = bounds1.y2, x21 = bounds2.x1, x22 = bounds2.x2, y21 = bounds2.y1, y22 = bounds2.y2;
    if (format) {
        let temp;
        x11 > x12 && (temp = x11, x11 = x12, x12 = temp), y11 > y12 && (temp = y11, y11 = y12, 
        y12 = temp), x21 > x22 && (temp = x21, x21 = x22, x22 = temp), y21 > y22 && (temp = y21, 
        y21 = y22, y22 = temp);
    }
    if (x11 >= x22 || x12 <= x21 || y11 >= y22 || y12 <= y21) return [ bounds1, bounds2 ];
    const area1 = (x12 - x11 + 2 * buffer) * (y12 - y11 + 2 * buffer), area2 = (x22 - x21 + 2 * buffer) * (y22 - y21 + 2 * buffer), x1 = Math.min(x11, x21), y1 = Math.min(y11, y21), x2 = Math.max(x12, x22), y2 = Math.max(y12, y22);
    return area1 + area2 > (x2 - x1) * (y2 - y1) ? [ {
        x1: x1,
        x2: x2,
        y1: y1,
        y2: y2
    } ] : [ bounds1, bounds2 ];
}

function mergeAABB(boundsList) {
    const nextList = [];
    return function _merge(baseBound, list) {
        const l = [];
        list.forEach((b => {
            let arr;
            (arr = unionAABB(baseBound, b)).length > 1 ? l.push(b) : baseBound = arr[0];
        })), nextList.push(baseBound), l.length && _merge(l[0], l.slice(1));
    }(boundsList[0], boundsList.slice(1)), nextList;
}

exports.getAABBFromPoints = getAABBFromPoints, exports.pointInAABB = pointInAABB, 
exports.unionAABB = unionAABB, exports.mergeAABB = mergeAABB;
//# sourceMappingURL=aabb.js.map

}, function(modId) { var map = {"./intersect":1689069768082}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1689069768084, function(require, module, exports) {


Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.pointBetweenLine = exports.pointInLine = exports.pointInOBB = exports.getOBBFromLine = void 0;

const math_1 = require("../../math");

let dirX, dirY, normalX, normalY, len, lineWidthDiv2, width, height;

function getOBBFromLine(point1, point2, lineWidth) {
    dirX = point2.x - point1.x, dirY = point2.y - point1.y, normalX = dirY, normalY = -dirX, 
    width = len = Math.sqrt(normalX * normalX + normalY * normalY), height = lineWidth, 
    normalX /= len, normalY /= len, lineWidthDiv2 = lineWidth / 2, dirX = lineWidthDiv2 * normalX, 
    dirY = lineWidthDiv2 * normalY;
    return {
        point1: {
            x: point1.x + dirX,
            y: point1.y + dirY
        },
        point2: {
            x: point1.x - dirX,
            y: point1.y - dirY
        },
        point3: {
            x: point2.x + dirX,
            y: point2.y + dirY
        },
        point4: {
            x: point2.x - dirX,
            y: point2.y - dirY
        },
        width: width,
        height: height,
        left: Math.min(point1.x, point2.x) - Math.abs(dirX),
        top: Math.min(point1.y, point2.y) - Math.abs(dirY)
    };
}

exports.getOBBFromLine = getOBBFromLine;

const point1 = {
    x: 0,
    y: 0
}, point2 = {
    x: 0,
    y: 0
};

function pointInOBB(point, obb) {
    return point1.x = (obb.point1.x + obb.point2.x) / 2, point1.y = (obb.point1.y + obb.point2.y) / 2, 
    point2.x = (obb.point3.x + obb.point4.x) / 2, point2.y = (obb.point3.y + obb.point4.y) / 2, 
    pointInLine(point, point1, point2, obb.height);
}

function pointInLine(point, point1, point2, lineWidth) {
    return (0, math_1.lengthFromPointToLine)(point, point1, point2) <= lineWidth / 2 && pointBetweenLine(point, point1, point2);
}

exports.pointInOBB = pointInOBB, exports.pointInLine = pointInLine;

const dir1 = {
    x: 0,
    y: 0
}, dir2 = {
    x: 0,
    y: 0
}, normal = {
    x: 0,
    y: 0
};

function pointBetweenLine(point, point1, point2) {
    return dir1.x = point1.x - point.x, dir1.y = point1.y - point.y, dir2.x = point2.x - point.x, 
    dir2.y = point2.y - point.y, normal.x = point1.y - point2.y, normal.y = point2.x - point1.x, 
    (0, math_1.crossProductPoint)(dir1, normal) * (0, math_1.crossProductPoint)(dir2, normal) < 0;
}

exports.pointBetweenLine = pointBetweenLine;
//# sourceMappingURL=obb.js.map

}, function(modId) { var map = {"../../math":1689069768067}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1689069768085, function(require, module, exports) {


function getContextFont({fontStyle: fontStyle, fontVariant: fontVariant, fontWeight: fontWeight, fontSize: fontSize, fontFamily: fontFamily}) {
    return (fontStyle ? fontStyle + " " : "") + (fontVariant ? fontVariant + " " : "") + (fontWeight ? fontWeight + " " : "") + (fontSize || 12) + "px " + (fontFamily || "sans-serif");
}

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.GraphicUtil = void 0;

class GraphicUtil {
    constructor(canvas) {
        this.canvas = canvas, canvas && (this.ctx = canvas.getContext("2d"));
    }
    setCanvas(canvas) {
        this.canvas = canvas, canvas && (this.ctx = canvas.getContext("2d"));
    }
    measureText(tc) {
        return this.canvas ? this.measureTextByCanvas(tc) : (console.warn("[warn] no canvas, measureText might be not accurate"), 
        this.estimate(tc));
    }
    measureTextByCanvas(tc) {
        return this.ctx ? (this.ctx.font = getContextFont(tc), {
            width: this.ctx.measureText(tc.text).width,
            height: tc.fontSize
        }) : (console.error("[error!!!]measureTextByCanvas can not be called without canvas"), 
        {
            width: -1,
            height: tc.fontSize
        });
    }
    estimate({text: text, fontSize: fontSize}) {
        let eCharLen = 0, cCharLen = 0;
        for (let i = 0; i < text.length; i++) text.charCodeAt(i) < 128 ? eCharLen++ : cCharLen++;
        return {
            width: ~~(.8 * eCharLen * fontSize + cCharLen * fontSize),
            height: fontSize
        };
    }
    static getDefaultUtils(canvas) {
        return GraphicUtil.instance || (GraphicUtil.instance = new GraphicUtil(canvas)), 
        GraphicUtil.instance;
    }
}

exports.GraphicUtil = GraphicUtil;
//# sourceMappingURL=graph-util.js.map

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1689069768086, function(require, module, exports) {


Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.polygonIntersectPolygon = exports.isPointInLine = exports.polygonContainPoint = exports.lineIntersectPolygon = void 0;

const algorithm_1 = require("./algorithm"), EPSILON = 1e-8;

function lineIntersectPolygon(a1x, a1y, a2x, a2y, points) {
    for (let i = 0, p2 = points[points.length - 1]; i < points.length; i++) {
        const p = points[i];
        if ((0, algorithm_1.isIntersect)([ a1x, a1y ], [ a2x, a2y ], [ p.x, p.y ], [ p2.x, p2.y ])) return !0;
        p2 = p;
    }
    return !1;
}

function polygonContainPoint(points, x, y) {
    let w = 0, p = points[0];
    if (!p) return !1;
    for (let i = 1; i < points.length; i++) {
        const p2 = points[i];
        w += isPointInLine(p.x, p.y, p2.x, p2.y, x, y), p = p2;
    }
    const p0 = points[0];
    return isAroundEqual(p.x, p0.x) && isAroundEqual(p.y, p0.y) || (w += isPointInLine(p.x, p.y, p0.x, p0.y, x, y)), 
    0 !== w;
}

function isPointInLine(x0, y0, x1, y1, x, y) {
    if (y > y0 && y > y1 || y < y0 && y < y1) return 0;
    if (y1 === y0) return 0;
    const t = (y - y0) / (y1 - y0);
    let dir = y1 < y0 ? 1 : -1;
    1 !== t && 0 !== t || (dir = y1 < y0 ? .5 : -.5);
    const x_ = t * (x1 - x0) + x0;
    return x_ === x ? 1 / 0 : x_ > x ? dir : 0;
}

function isAroundEqual(a, b) {
    return Math.abs(a - b) < EPSILON;
}

function polygonIntersectPolygon(pointsA, pointsB) {
    for (let i = 0; i < pointsB.length; i++) {
        if (polygonContainPoint(pointsA, pointsB[i].x, pointsB[i].y)) return !0;
        if (i > 0 && lineIntersectPolygon(pointsB[i - 1].x, pointsB[i - 1].y, pointsB[i].x, pointsB[i].y, pointsA)) return !0;
    }
    return !1;
}

exports.lineIntersectPolygon = lineIntersectPolygon, exports.polygonContainPoint = polygonContainPoint, 
exports.isPointInLine = isPointInLine, exports.polygonIntersectPolygon = polygonIntersectPolygon;
//# sourceMappingURL=polygon.js.map

}, function(modId) { var map = {"./algorithm":1689069768081}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1689069768087, function(require, module, exports) {


var __createBinding = this && this.__createBinding || (Object.create ? function(o, m, k, k2) {
    void 0 === k2 && (k2 = k);
    var desc = Object.getOwnPropertyDescriptor(m, k);
    desc && !("get" in desc ? !m.__esModule : desc.writable || desc.configurable) || (desc = {
        enumerable: !0,
        get: function() {
            return m[k];
        }
    }), Object.defineProperty(o, k2, desc);
} : function(o, m, k, k2) {
    void 0 === k2 && (k2 = k), o[k2] = m[k];
}), __exportStar = this && this.__exportStar || function(m, exports) {
    for (var p in m) "default" === p || Object.prototype.hasOwnProperty.call(exports, p) || __createBinding(exports, m, p);
}, __importDefault = this && this.__importDefault || function(mod) {
    return mod && mod.__esModule ? mod : {
        default: mod
    };
};

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.eastAsianCharacterInfo = exports.stringWidth = void 0;

var stringWidth_1 = require("./stringWidth");

Object.defineProperty(exports, "stringWidth", {
    enumerable: !0,
    get: function() {
        return __importDefault(stringWidth_1).default;
    }
}), Object.defineProperty(exports, "eastAsianCharacterInfo", {
    enumerable: !0,
    get: function() {
        return stringWidth_1.eastAsianCharacterInfo;
    }
}), __exportStar(require("./measure"), exports);
//# sourceMappingURL=index.js.map

}, function(modId) { var map = {"./stringWidth":1689069768088,"./measure":1689069768089}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1689069768088, function(require, module, exports) {


function stringWidth(string, ambiguousCharacterIsNarrow = !0) {
    if ("string" != typeof string || 0 === string.length) return 0;
    if (0 === (string = stripAnsi(string)).length) return 0;
    string = string.replace(emojiRegex(), "  ");
    const ambiguousCharacterWidth = ambiguousCharacterIsNarrow ? 1 : 2;
    let width = 0;
    for (const character of string) {
        const codePoint = character.codePointAt(0);
        if (codePoint <= 31 || codePoint >= 127 && codePoint <= 159) continue;
        if (codePoint >= 768 && codePoint <= 879) continue;
        switch ((0, exports.eastAsianCharacterInfo)(character)) {
          case "F":
          case "W":
            width += 2;
            break;

          case "A":
            width += ambiguousCharacterWidth;
            break;

          default:
            width += 1;
        }
    }
    return width;
}

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.eastAsianCharacterInfo = void 0, exports.default = stringWidth;

const stripAnsi = string => {
    if ("string" != typeof string) throw new TypeError(`Expected a \`string\`, got \`${typeof string}\``);
    return string.replace(ansiRegex(), "");
}, ansiRegex = ({onlyFirst: onlyFirst = !1} = {}) => {
    const pattern = [ "[\\u001B\\u009B][[\\]()#;?]*(?:(?:(?:(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]+)*|[a-zA-Z\\d]+(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]*)*)?\\u0007)", "(?:(?:\\d{1,4}(?:;\\d{0,4})*)?[\\dA-PR-TZcf-nq-uy=><~]))" ].join("|");
    return new RegExp(pattern, onlyFirst ? void 0 : "g");
}, eastAsianCharacterInfo = character => {
    let x = character.charCodeAt(0), y = 2 === character.length ? character.charCodeAt(1) : 0, codePoint = x;
    return 55296 <= x && x <= 56319 && 56320 <= y && y <= 57343 && (x &= 1023, y &= 1023, 
    codePoint = x << 10 | y, codePoint += 65536), 12288 === codePoint || 65281 <= codePoint && codePoint <= 65376 || 65504 <= codePoint && codePoint <= 65510 ? "F" : 8361 === codePoint || 65377 <= codePoint && codePoint <= 65470 || 65474 <= codePoint && codePoint <= 65479 || 65482 <= codePoint && codePoint <= 65487 || 65490 <= codePoint && codePoint <= 65495 || 65498 <= codePoint && codePoint <= 65500 || 65512 <= codePoint && codePoint <= 65518 ? "H" : 4352 <= codePoint && codePoint <= 4447 || 4515 <= codePoint && codePoint <= 4519 || 4602 <= codePoint && codePoint <= 4607 || 9001 <= codePoint && codePoint <= 9002 || 11904 <= codePoint && codePoint <= 11929 || 11931 <= codePoint && codePoint <= 12019 || 12032 <= codePoint && codePoint <= 12245 || 12272 <= codePoint && codePoint <= 12283 || 12289 <= codePoint && codePoint <= 12350 || 12353 <= codePoint && codePoint <= 12438 || 12441 <= codePoint && codePoint <= 12543 || 12549 <= codePoint && codePoint <= 12589 || 12593 <= codePoint && codePoint <= 12686 || 12688 <= codePoint && codePoint <= 12730 || 12736 <= codePoint && codePoint <= 12771 || 12784 <= codePoint && codePoint <= 12830 || 12832 <= codePoint && codePoint <= 12871 || 12880 <= codePoint && codePoint <= 13054 || 13056 <= codePoint && codePoint <= 19903 || 19968 <= codePoint && codePoint <= 42124 || 42128 <= codePoint && codePoint <= 42182 || 43360 <= codePoint && codePoint <= 43388 || 44032 <= codePoint && codePoint <= 55203 || 55216 <= codePoint && codePoint <= 55238 || 55243 <= codePoint && codePoint <= 55291 || 63744 <= codePoint && codePoint <= 64255 || 65040 <= codePoint && codePoint <= 65049 || 65072 <= codePoint && codePoint <= 65106 || 65108 <= codePoint && codePoint <= 65126 || 65128 <= codePoint && codePoint <= 65131 || 110592 <= codePoint && codePoint <= 110593 || 127488 <= codePoint && codePoint <= 127490 || 127504 <= codePoint && codePoint <= 127546 || 127552 <= codePoint && codePoint <= 127560 || 127568 <= codePoint && codePoint <= 127569 || 131072 <= codePoint && codePoint <= 194367 || 177984 <= codePoint && codePoint <= 196605 || 196608 <= codePoint && codePoint <= 262141 ? "W" : 32 <= codePoint && codePoint <= 126 || 162 <= codePoint && codePoint <= 163 || 165 <= codePoint && codePoint <= 166 || 172 === codePoint || 175 === codePoint || 10214 <= codePoint && codePoint <= 10221 || 10629 <= codePoint && codePoint <= 10630 ? "Na" : 161 === codePoint || 164 === codePoint || 167 <= codePoint && codePoint <= 168 || 170 === codePoint || 173 <= codePoint && codePoint <= 174 || 176 <= codePoint && codePoint <= 180 || 182 <= codePoint && codePoint <= 186 || 188 <= codePoint && codePoint <= 191 || 198 === codePoint || 208 === codePoint || 215 <= codePoint && codePoint <= 216 || 222 <= codePoint && codePoint <= 225 || 230 === codePoint || 232 <= codePoint && codePoint <= 234 || 236 <= codePoint && codePoint <= 237 || 240 === codePoint || 242 <= codePoint && codePoint <= 243 || 247 <= codePoint && codePoint <= 250 || 252 === codePoint || 254 === codePoint || 257 === codePoint || 273 === codePoint || 275 === codePoint || 283 === codePoint || 294 <= codePoint && codePoint <= 295 || 299 === codePoint || 305 <= codePoint && codePoint <= 307 || 312 === codePoint || 319 <= codePoint && codePoint <= 322 || 324 === codePoint || 328 <= codePoint && codePoint <= 331 || 333 === codePoint || 338 <= codePoint && codePoint <= 339 || 358 <= codePoint && codePoint <= 359 || 363 === codePoint || 462 === codePoint || 464 === codePoint || 466 === codePoint || 468 === codePoint || 470 === codePoint || 472 === codePoint || 474 === codePoint || 476 === codePoint || 593 === codePoint || 609 === codePoint || 708 === codePoint || 711 === codePoint || 713 <= codePoint && codePoint <= 715 || 717 === codePoint || 720 === codePoint || 728 <= codePoint && codePoint <= 731 || 733 === codePoint || 735 === codePoint || 768 <= codePoint && codePoint <= 879 || 913 <= codePoint && codePoint <= 929 || 931 <= codePoint && codePoint <= 937 || 945 <= codePoint && codePoint <= 961 || 963 <= codePoint && codePoint <= 969 || 1025 === codePoint || 1040 <= codePoint && codePoint <= 1103 || 1105 === codePoint || 8208 === codePoint || 8211 <= codePoint && codePoint <= 8214 || 8216 <= codePoint && codePoint <= 8217 || 8220 <= codePoint && codePoint <= 8221 || 8224 <= codePoint && codePoint <= 8226 || 8228 <= codePoint && codePoint <= 8231 || 8240 === codePoint || 8242 <= codePoint && codePoint <= 8243 || 8245 === codePoint || 8251 === codePoint || 8254 === codePoint || 8308 === codePoint || 8319 === codePoint || 8321 <= codePoint && codePoint <= 8324 || 8364 === codePoint || 8451 === codePoint || 8453 === codePoint || 8457 === codePoint || 8467 === codePoint || 8470 === codePoint || 8481 <= codePoint && codePoint <= 8482 || 8486 === codePoint || 8491 === codePoint || 8531 <= codePoint && codePoint <= 8532 || 8539 <= codePoint && codePoint <= 8542 || 8544 <= codePoint && codePoint <= 8555 || 8560 <= codePoint && codePoint <= 8569 || 8585 === codePoint || 8592 <= codePoint && codePoint <= 8601 || 8632 <= codePoint && codePoint <= 8633 || 8658 === codePoint || 8660 === codePoint || 8679 === codePoint || 8704 === codePoint || 8706 <= codePoint && codePoint <= 8707 || 8711 <= codePoint && codePoint <= 8712 || 8715 === codePoint || 8719 === codePoint || 8721 === codePoint || 8725 === codePoint || 8730 === codePoint || 8733 <= codePoint && codePoint <= 8736 || 8739 === codePoint || 8741 === codePoint || 8743 <= codePoint && codePoint <= 8748 || 8750 === codePoint || 8756 <= codePoint && codePoint <= 8759 || 8764 <= codePoint && codePoint <= 8765 || 8776 === codePoint || 8780 === codePoint || 8786 === codePoint || 8800 <= codePoint && codePoint <= 8801 || 8804 <= codePoint && codePoint <= 8807 || 8810 <= codePoint && codePoint <= 8811 || 8814 <= codePoint && codePoint <= 8815 || 8834 <= codePoint && codePoint <= 8835 || 8838 <= codePoint && codePoint <= 8839 || 8853 === codePoint || 8857 === codePoint || 8869 === codePoint || 8895 === codePoint || 8978 === codePoint || 9312 <= codePoint && codePoint <= 9449 || 9451 <= codePoint && codePoint <= 9547 || 9552 <= codePoint && codePoint <= 9587 || 9600 <= codePoint && codePoint <= 9615 || 9618 <= codePoint && codePoint <= 9621 || 9632 <= codePoint && codePoint <= 9633 || 9635 <= codePoint && codePoint <= 9641 || 9650 <= codePoint && codePoint <= 9651 || 9654 <= codePoint && codePoint <= 9655 || 9660 <= codePoint && codePoint <= 9661 || 9664 <= codePoint && codePoint <= 9665 || 9670 <= codePoint && codePoint <= 9672 || 9675 === codePoint || 9678 <= codePoint && codePoint <= 9681 || 9698 <= codePoint && codePoint <= 9701 || 9711 === codePoint || 9733 <= codePoint && codePoint <= 9734 || 9737 === codePoint || 9742 <= codePoint && codePoint <= 9743 || 9748 <= codePoint && codePoint <= 9749 || 9756 === codePoint || 9758 === codePoint || 9792 === codePoint || 9794 === codePoint || 9824 <= codePoint && codePoint <= 9825 || 9827 <= codePoint && codePoint <= 9829 || 9831 <= codePoint && codePoint <= 9834 || 9836 <= codePoint && codePoint <= 9837 || 9839 === codePoint || 9886 <= codePoint && codePoint <= 9887 || 9918 <= codePoint && codePoint <= 9919 || 9924 <= codePoint && codePoint <= 9933 || 9935 <= codePoint && codePoint <= 9953 || 9955 === codePoint || 9960 <= codePoint && codePoint <= 9983 || 10045 === codePoint || 10071 === codePoint || 10102 <= codePoint && codePoint <= 10111 || 11093 <= codePoint && codePoint <= 11097 || 12872 <= codePoint && codePoint <= 12879 || 57344 <= codePoint && codePoint <= 63743 || 65024 <= codePoint && codePoint <= 65039 || 65533 === codePoint || 127232 <= codePoint && codePoint <= 127242 || 127248 <= codePoint && codePoint <= 127277 || 127280 <= codePoint && codePoint <= 127337 || 127344 <= codePoint && codePoint <= 127386 || 917760 <= codePoint && codePoint <= 917999 || 983040 <= codePoint && codePoint <= 1048573 || 1048576 <= codePoint && codePoint <= 1114109 ? "A" : "N";
};

exports.eastAsianCharacterInfo = eastAsianCharacterInfo;

const emojiRegex = () => /[#*0-9]\uFE0F?\u20E3|[\xA9\xAE\u203C\u2049\u2122\u2139\u2194-\u2199\u21A9\u21AA\u231A\u231B\u2328\u23CF\u23ED-\u23EF\u23F1\u23F2\u23F8-\u23FA\u24C2\u25AA\u25AB\u25B6\u25C0\u25FB\u25FC\u25FE\u2600-\u2604\u260E\u2611\u2614\u2615\u2618\u2620\u2622\u2623\u2626\u262A\u262E\u262F\u2638-\u263A\u2640\u2642\u2648-\u2653\u265F\u2660\u2663\u2665\u2666\u2668\u267B\u267E\u267F\u2692\u2694-\u2697\u2699\u269B\u269C\u26A0\u26A7\u26AA\u26B0\u26B1\u26BD\u26BE\u26C4\u26C8\u26CF\u26D1\u26D3\u26E9\u26F0-\u26F5\u26F7\u26F8\u26FA\u2702\u2708\u2709\u270F\u2712\u2714\u2716\u271D\u2721\u2733\u2734\u2744\u2747\u2757\u2763\u27A1\u2934\u2935\u2B05-\u2B07\u2B1B\u2B1C\u2B55\u3030\u303D\u3297\u3299]\uFE0F?|[\u261D\u270C\u270D](?:\uFE0F|\uD83C[\uDFFB-\uDFFF])?|[\u270A\u270B](?:\uD83C[\uDFFB-\uDFFF])?|[\u23E9-\u23EC\u23F0\u23F3\u25FD\u2693\u26A1\u26AB\u26C5\u26CE\u26D4\u26EA\u26FD\u2705\u2728\u274C\u274E\u2753-\u2755\u2795-\u2797\u27B0\u27BF\u2B50]|\u26F9(?:\uFE0F|\uD83C[\uDFFB-\uDFFF])?(?:\u200D[\u2640\u2642]\uFE0F?)?|\u2764\uFE0F?(?:\u200D(?:\uD83D\uDD25|\uD83E\uDE79))?|\uD83C(?:[\uDC04\uDD70\uDD71\uDD7E\uDD7F\uDE02\uDE37\uDF21\uDF24-\uDF2C\uDF36\uDF7D\uDF96\uDF97\uDF99-\uDF9B\uDF9E\uDF9F\uDFCD\uDFCE\uDFD4-\uDFDF\uDFF5\uDFF7]\uFE0F?|[\uDF85\uDFC2\uDFC7](?:\uD83C[\uDFFB-\uDFFF])?|[\uDFC3\uDFC4\uDFCA](?:\uD83C[\uDFFB-\uDFFF])?(?:\u200D[\u2640\u2642]\uFE0F?)?|[\uDFCB\uDFCC](?:\uFE0F|\uD83C[\uDFFB-\uDFFF])?(?:\u200D[\u2640\u2642]\uFE0F?)?|[\uDCCF\uDD8E\uDD91-\uDD9A\uDE01\uDE1A\uDE2F\uDE32-\uDE36\uDE38-\uDE3A\uDE50\uDE51\uDF00-\uDF20\uDF2D-\uDF35\uDF37-\uDF7C\uDF7E-\uDF84\uDF86-\uDF93\uDFA0-\uDFC1\uDFC5\uDFC6\uDFC8\uDFC9\uDFCF-\uDFD3\uDFE0-\uDFF0\uDFF8-\uDFFF]|\uDDE6\uD83C[\uDDE8-\uDDEC\uDDEE\uDDF1\uDDF2\uDDF4\uDDF6-\uDDFA\uDDFC\uDDFD\uDDFF]|\uDDE7\uD83C[\uDDE6\uDDE7\uDDE9-\uDDEF\uDDF1-\uDDF4\uDDF6-\uDDF9\uDDFB\uDDFC\uDDFE\uDDFF]|\uDDE8\uD83C[\uDDE6\uDDE8\uDDE9\uDDEB-\uDDEE\uDDF0-\uDDF5\uDDF7\uDDFA-\uDDFF]|\uDDE9\uD83C[\uDDEA\uDDEC\uDDEF\uDDF0\uDDF2\uDDF4\uDDFF]|\uDDEA\uD83C[\uDDE6\uDDE8\uDDEA\uDDEC\uDDED\uDDF7-\uDDFA]|\uDDEB\uD83C[\uDDEE-\uDDF0\uDDF2\uDDF4\uDDF7]|\uDDEC\uD83C[\uDDE6\uDDE7\uDDE9-\uDDEE\uDDF1-\uDDF3\uDDF5-\uDDFA\uDDFC\uDDFE]|\uDDED\uD83C[\uDDF0\uDDF2\uDDF3\uDDF7\uDDF9\uDDFA]|\uDDEE\uD83C[\uDDE8-\uDDEA\uDDF1-\uDDF4\uDDF6-\uDDF9]|\uDDEF\uD83C[\uDDEA\uDDF2\uDDF4\uDDF5]|\uDDF0\uD83C[\uDDEA\uDDEC-\uDDEE\uDDF2\uDDF3\uDDF5\uDDF7\uDDFC\uDDFE\uDDFF]|\uDDF1\uD83C[\uDDE6-\uDDE8\uDDEE\uDDF0\uDDF7-\uDDFB\uDDFE]|\uDDF2\uD83C[\uDDE6\uDDE8-\uDDED\uDDF0-\uDDFF]|\uDDF3\uD83C[\uDDE6\uDDE8\uDDEA-\uDDEC\uDDEE\uDDF1\uDDF4\uDDF5\uDDF7\uDDFA\uDDFF]|\uDDF4\uD83C\uDDF2|\uDDF5\uD83C[\uDDE6\uDDEA-\uDDED\uDDF0-\uDDF3\uDDF7-\uDDF9\uDDFC\uDDFE]|\uDDF6\uD83C\uDDE6|\uDDF7\uD83C[\uDDEA\uDDF4\uDDF8\uDDFA\uDDFC]|\uDDF8\uD83C[\uDDE6-\uDDEA\uDDEC-\uDDF4\uDDF7-\uDDF9\uDDFB\uDDFD-\uDDFF]|\uDDF9\uD83C[\uDDE6\uDDE8\uDDE9\uDDEB-\uDDED\uDDEF-\uDDF4\uDDF7\uDDF9\uDDFB\uDDFC\uDDFF]|\uDDFA\uD83C[\uDDE6\uDDEC\uDDF2\uDDF3\uDDF8\uDDFE\uDDFF]|\uDDFB\uD83C[\uDDE6\uDDE8\uDDEA\uDDEC\uDDEE\uDDF3\uDDFA]|\uDDFC\uD83C[\uDDEB\uDDF8]|\uDDFD\uD83C\uDDF0|\uDDFE\uD83C[\uDDEA\uDDF9]|\uDDFF\uD83C[\uDDE6\uDDF2\uDDFC]|\uDFF3\uFE0F?(?:\u200D(?:\u26A7\uFE0F?|\uD83C\uDF08))?|\uDFF4(?:\u200D\u2620\uFE0F?|\uDB40\uDC67\uDB40\uDC62\uDB40(?:\uDC65\uDB40\uDC6E\uDB40\uDC67|\uDC73\uDB40\uDC63\uDB40\uDC74|\uDC77\uDB40\uDC6C\uDB40\uDC73)\uDB40\uDC7F)?)|\uD83D(?:[\uDC08\uDC26](?:\u200D\u2B1B)?|[\uDC3F\uDCFD\uDD49\uDD4A\uDD6F\uDD70\uDD73\uDD76-\uDD79\uDD87\uDD8A-\uDD8D\uDDA5\uDDA8\uDDB1\uDDB2\uDDBC\uDDC2-\uDDC4\uDDD1-\uDDD3\uDDDC-\uDDDE\uDDE1\uDDE3\uDDE8\uDDEF\uDDF3\uDDFA\uDECB\uDECD-\uDECF\uDEE0-\uDEE5\uDEE9\uDEF0\uDEF3]\uFE0F?|[\uDC42\uDC43\uDC46-\uDC50\uDC66\uDC67\uDC6B-\uDC6D\uDC72\uDC74-\uDC76\uDC78\uDC7C\uDC83\uDC85\uDC8F\uDC91\uDCAA\uDD7A\uDD95\uDD96\uDE4C\uDE4F\uDEC0\uDECC](?:\uD83C[\uDFFB-\uDFFF])?|[\uDC6E\uDC70\uDC71\uDC73\uDC77\uDC81\uDC82\uDC86\uDC87\uDE45-\uDE47\uDE4B\uDE4D\uDE4E\uDEA3\uDEB4-\uDEB6](?:\uD83C[\uDFFB-\uDFFF])?(?:\u200D[\u2640\u2642]\uFE0F?)?|[\uDD74\uDD90](?:\uFE0F|\uD83C[\uDFFB-\uDFFF])?|[\uDC00-\uDC07\uDC09-\uDC14\uDC16-\uDC25\uDC27-\uDC3A\uDC3C-\uDC3E\uDC40\uDC44\uDC45\uDC51-\uDC65\uDC6A\uDC79-\uDC7B\uDC7D-\uDC80\uDC84\uDC88-\uDC8E\uDC90\uDC92-\uDCA9\uDCAB-\uDCFC\uDCFF-\uDD3D\uDD4B-\uDD4E\uDD50-\uDD67\uDDA4\uDDFB-\uDE2D\uDE2F-\uDE34\uDE37-\uDE44\uDE48-\uDE4A\uDE80-\uDEA2\uDEA4-\uDEB3\uDEB7-\uDEBF\uDEC1-\uDEC5\uDED0-\uDED2\uDED5-\uDED7\uDEDC-\uDEDF\uDEEB\uDEEC\uDEF4-\uDEFC\uDFE0-\uDFEB\uDFF0]|\uDC15(?:\u200D\uD83E\uDDBA)?|\uDC3B(?:\u200D\u2744\uFE0F?)?|\uDC41\uFE0F?(?:\u200D\uD83D\uDDE8\uFE0F?)?|\uDC68(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D\uD83D(?:\uDC8B\u200D\uD83D)?\uDC68|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D(?:[\uDC68\uDC69]\u200D\uD83D(?:\uDC66(?:\u200D\uD83D\uDC66)?|\uDC67(?:\u200D\uD83D[\uDC66\uDC67])?)|[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uDC66(?:\u200D\uD83D\uDC66)?|\uDC67(?:\u200D\uD83D[\uDC66\uDC67])?)|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C(?:\uDFFB(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D\uD83D(?:\uDC8B\u200D\uD83D)?\uDC68\uD83C[\uDFFB-\uDFFF]|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E(?:[\uDDAF-\uDDB3\uDDBC\uDDBD]|\uDD1D\u200D\uD83D\uDC68\uD83C[\uDFFC-\uDFFF])))?|\uDFFC(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D\uD83D(?:\uDC8B\u200D\uD83D)?\uDC68\uD83C[\uDFFB-\uDFFF]|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E(?:[\uDDAF-\uDDB3\uDDBC\uDDBD]|\uDD1D\u200D\uD83D\uDC68\uD83C[\uDFFB\uDFFD-\uDFFF])))?|\uDFFD(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D\uD83D(?:\uDC8B\u200D\uD83D)?\uDC68\uD83C[\uDFFB-\uDFFF]|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E(?:[\uDDAF-\uDDB3\uDDBC\uDDBD]|\uDD1D\u200D\uD83D\uDC68\uD83C[\uDFFB\uDFFC\uDFFE\uDFFF])))?|\uDFFE(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D\uD83D(?:\uDC8B\u200D\uD83D)?\uDC68\uD83C[\uDFFB-\uDFFF]|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E(?:[\uDDAF-\uDDB3\uDDBC\uDDBD]|\uDD1D\u200D\uD83D\uDC68\uD83C[\uDFFB-\uDFFD\uDFFF])))?|\uDFFF(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D\uD83D(?:\uDC8B\u200D\uD83D)?\uDC68\uD83C[\uDFFB-\uDFFF]|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E(?:[\uDDAF-\uDDB3\uDDBC\uDDBD]|\uDD1D\u200D\uD83D\uDC68\uD83C[\uDFFB-\uDFFE])))?))?|\uDC69(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D\uD83D(?:\uDC8B\u200D\uD83D)?[\uDC68\uDC69]|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D(?:[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uDC66(?:\u200D\uD83D\uDC66)?|\uDC67(?:\u200D\uD83D[\uDC66\uDC67])?|\uDC69\u200D\uD83D(?:\uDC66(?:\u200D\uD83D\uDC66)?|\uDC67(?:\u200D\uD83D[\uDC66\uDC67])?))|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C(?:\uDFFB(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D\uD83D(?:[\uDC68\uDC69]|\uDC8B\u200D\uD83D[\uDC68\uDC69])\uD83C[\uDFFB-\uDFFF]|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E(?:[\uDDAF-\uDDB3\uDDBC\uDDBD]|\uDD1D\u200D\uD83D[\uDC68\uDC69]\uD83C[\uDFFC-\uDFFF])))?|\uDFFC(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D\uD83D(?:[\uDC68\uDC69]|\uDC8B\u200D\uD83D[\uDC68\uDC69])\uD83C[\uDFFB-\uDFFF]|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E(?:[\uDDAF-\uDDB3\uDDBC\uDDBD]|\uDD1D\u200D\uD83D[\uDC68\uDC69]\uD83C[\uDFFB\uDFFD-\uDFFF])))?|\uDFFD(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D\uD83D(?:[\uDC68\uDC69]|\uDC8B\u200D\uD83D[\uDC68\uDC69])\uD83C[\uDFFB-\uDFFF]|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E(?:[\uDDAF-\uDDB3\uDDBC\uDDBD]|\uDD1D\u200D\uD83D[\uDC68\uDC69]\uD83C[\uDFFB\uDFFC\uDFFE\uDFFF])))?|\uDFFE(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D\uD83D(?:[\uDC68\uDC69]|\uDC8B\u200D\uD83D[\uDC68\uDC69])\uD83C[\uDFFB-\uDFFF]|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E(?:[\uDDAF-\uDDB3\uDDBC\uDDBD]|\uDD1D\u200D\uD83D[\uDC68\uDC69]\uD83C[\uDFFB-\uDFFD\uDFFF])))?|\uDFFF(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D\uD83D(?:[\uDC68\uDC69]|\uDC8B\u200D\uD83D[\uDC68\uDC69])\uD83C[\uDFFB-\uDFFF]|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E(?:[\uDDAF-\uDDB3\uDDBC\uDDBD]|\uDD1D\u200D\uD83D[\uDC68\uDC69]\uD83C[\uDFFB-\uDFFE])))?))?|\uDC6F(?:\u200D[\u2640\u2642]\uFE0F?)?|\uDD75(?:\uFE0F|\uD83C[\uDFFB-\uDFFF])?(?:\u200D[\u2640\u2642]\uFE0F?)?|\uDE2E(?:\u200D\uD83D\uDCA8)?|\uDE35(?:\u200D\uD83D\uDCAB)?|\uDE36(?:\u200D\uD83C\uDF2B\uFE0F?)?)|\uD83E(?:[\uDD0C\uDD0F\uDD18-\uDD1F\uDD30-\uDD34\uDD36\uDD77\uDDB5\uDDB6\uDDBB\uDDD2\uDDD3\uDDD5\uDEC3-\uDEC5\uDEF0\uDEF2-\uDEF8](?:\uD83C[\uDFFB-\uDFFF])?|[\uDD26\uDD35\uDD37-\uDD39\uDD3D\uDD3E\uDDB8\uDDB9\uDDCD-\uDDCF\uDDD4\uDDD6-\uDDDD](?:\uD83C[\uDFFB-\uDFFF])?(?:\u200D[\u2640\u2642]\uFE0F?)?|[\uDDDE\uDDDF](?:\u200D[\u2640\u2642]\uFE0F?)?|[\uDD0D\uDD0E\uDD10-\uDD17\uDD20-\uDD25\uDD27-\uDD2F\uDD3A\uDD3F-\uDD45\uDD47-\uDD76\uDD78-\uDDB4\uDDB7\uDDBA\uDDBC-\uDDCC\uDDD0\uDDE0-\uDDFF\uDE70-\uDE7C\uDE80-\uDE88\uDE90-\uDEBD\uDEBF-\uDEC2\uDECE-\uDEDB\uDEE0-\uDEE8]|\uDD3C(?:\u200D[\u2640\u2642]\uFE0F?|\uD83C[\uDFFB-\uDFFF])?|\uDDD1(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\uD83C[\uDF3E\uDF73\uDF7C\uDF84\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E(?:[\uDDAF-\uDDB3\uDDBC\uDDBD]|\uDD1D\u200D\uD83E\uDDD1))|\uD83C(?:\uDFFB(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D(?:\uD83D\uDC8B\u200D)?\uD83E\uDDD1\uD83C[\uDFFC-\uDFFF]|\uD83C[\uDF3E\uDF73\uDF7C\uDF84\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E(?:[\uDDAF-\uDDB3\uDDBC\uDDBD]|\uDD1D\u200D\uD83E\uDDD1\uD83C[\uDFFB-\uDFFF])))?|\uDFFC(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D(?:\uD83D\uDC8B\u200D)?\uD83E\uDDD1\uD83C[\uDFFB\uDFFD-\uDFFF]|\uD83C[\uDF3E\uDF73\uDF7C\uDF84\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E(?:[\uDDAF-\uDDB3\uDDBC\uDDBD]|\uDD1D\u200D\uD83E\uDDD1\uD83C[\uDFFB-\uDFFF])))?|\uDFFD(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D(?:\uD83D\uDC8B\u200D)?\uD83E\uDDD1\uD83C[\uDFFB\uDFFC\uDFFE\uDFFF]|\uD83C[\uDF3E\uDF73\uDF7C\uDF84\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E(?:[\uDDAF-\uDDB3\uDDBC\uDDBD]|\uDD1D\u200D\uD83E\uDDD1\uD83C[\uDFFB-\uDFFF])))?|\uDFFE(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D(?:\uD83D\uDC8B\u200D)?\uD83E\uDDD1\uD83C[\uDFFB-\uDFFD\uDFFF]|\uD83C[\uDF3E\uDF73\uDF7C\uDF84\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E(?:[\uDDAF-\uDDB3\uDDBC\uDDBD]|\uDD1D\u200D\uD83E\uDDD1\uD83C[\uDFFB-\uDFFF])))?|\uDFFF(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D(?:\uD83D\uDC8B\u200D)?\uD83E\uDDD1\uD83C[\uDFFB-\uDFFE]|\uD83C[\uDF3E\uDF73\uDF7C\uDF84\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E(?:[\uDDAF-\uDDB3\uDDBC\uDDBD]|\uDD1D\u200D\uD83E\uDDD1\uD83C[\uDFFB-\uDFFF])))?))?|\uDEF1(?:\uD83C(?:\uDFFB(?:\u200D\uD83E\uDEF2\uD83C[\uDFFC-\uDFFF])?|\uDFFC(?:\u200D\uD83E\uDEF2\uD83C[\uDFFB\uDFFD-\uDFFF])?|\uDFFD(?:\u200D\uD83E\uDEF2\uD83C[\uDFFB\uDFFC\uDFFE\uDFFF])?|\uDFFE(?:\u200D\uD83E\uDEF2\uD83C[\uDFFB-\uDFFD\uDFFF])?|\uDFFF(?:\u200D\uD83E\uDEF2\uD83C[\uDFFB-\uDFFE])?))?)/g;
//# sourceMappingURL=stringWidth.js.map

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1689069768089, function(require, module, exports) {


var __createBinding = this && this.__createBinding || (Object.create ? function(o, m, k, k2) {
    void 0 === k2 && (k2 = k);
    var desc = Object.getOwnPropertyDescriptor(m, k);
    desc && !("get" in desc ? !m.__esModule : desc.writable || desc.configurable) || (desc = {
        enumerable: !0,
        get: function() {
            return m[k];
        }
    }), Object.defineProperty(o, k2, desc);
} : function(o, m, k, k2) {
    void 0 === k2 && (k2 = k), o[k2] = m[k];
}), __exportStar = this && this.__exportStar || function(m, exports) {
    for (var p in m) "default" === p || Object.prototype.hasOwnProperty.call(exports, p) || __createBinding(exports, m, p);
};

Object.defineProperty(exports, "__esModule", {
    value: !0
}), __exportStar(require("./textMeasure"), exports), __exportStar(require("./interface"), exports), 
__exportStar(require("./test"), exports), __exportStar(require("./util"), exports);
//# sourceMappingURL=index.js.map

}, function(modId) { var map = {"./textMeasure":1689069768090,"./interface":1689069768092,"./test":1689069768093,"./util":1689069768091}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1689069768090, function(require, module, exports) {


Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.TextMeasure = void 0;

const common_1 = require("../../../common"), stringWidth_1 = require("../stringWidth"), util_1 = require("./util");

class TextMeasure {
    constructor(option, textSpec) {
        this._numberCharSize = null, this._fullCharSize = null, this._letterCharSize = null, 
        this._specialCharSizeMap = {}, this._canvas = null, this._context = null, this._contextSaved = !1, 
        this._notSupportCanvas = !1, this._notSupportCanopus = !1, this._userSpec = {}, 
        this.specialCharSet = "-/: .,@%'\"~", this._option = option, this._userSpec = null != textSpec ? textSpec : {}, 
        this.textSpec = this._initSpec(), (0, common_1.isValid)(option.specialCharSet) && (this.specialCharSet = option.specialCharSet), 
        this._standardMethod = (0, common_1.isValid)(option.getTextBounds) ? this.fullMeasure.bind(this) : this.measureWithNaiveCanvas.bind(this);
    }
    initContext() {
        if (this._notSupportCanvas) return !1;
        if ((0, common_1.isNil)(this._canvas) && ((0, common_1.isValid)(this._option.getCanvasForMeasure) && (this._canvas = this._option.getCanvasForMeasure()), 
        (0, common_1.isNil)(this._canvas) && (0, common_1.isValid)(globalThis.document) && (this._canvas = globalThis.document.createElement("canvas"))), 
        (0, common_1.isNil)(this._context) && (0, common_1.isValid)(this._canvas)) {
            const context = this._canvas.getContext("2d");
            (0, common_1.isValid)(context) && (context.save(), context.font = (0, util_1.getContextFont)(this.textSpec), 
            this._contextSaved = !0, this._context = context);
        }
        return !(0, common_1.isNil)(this._context) || (this._notSupportCanvas = !0, !1);
    }
    _initSpec() {
        var _a, _b, _c;
        const {defaultFontParams: defaultFontParams = {}} = this._option, {fontStyle: fontStyle = defaultFontParams.fontStyle, fontVariant: fontVariant = defaultFontParams.fontVariant, fontWeight: fontWeight = (null !== (_a = defaultFontParams.fontWeight) && void 0 !== _a ? _a : "normal"), fontSize: fontSize = (null !== (_b = defaultFontParams.fontSize) && void 0 !== _b ? _b : 12), fontFamily: fontFamily = (null !== (_c = defaultFontParams.fontFamily) && void 0 !== _c ? _c : "sans-serif"), align: align, textAlign: textAlign = (null != align ? align : "center"), baseline: baseline, textBaseline: textBaseline = (null != baseline ? baseline : "middle"), ellipsis: ellipsis, limit: limit, lineHeight: lineHeight = fontSize} = this._userSpec;
        return {
            fontStyle: fontStyle,
            fontVariant: fontVariant,
            fontFamily: fontFamily,
            fontSize: fontSize,
            fontWeight: fontWeight,
            textAlign: textAlign,
            textBaseline: textBaseline,
            ellipsis: ellipsis,
            limit: limit,
            lineHeight: lineHeight
        };
    }
    measure(text, method) {
        switch (method) {
          case "canopus":
            return this.fullMeasure(text);

          case "canvas":
            return this.measureWithNaiveCanvas(text);

          case "simple":
            return this.quickMeasureWithoutCanvas(text);

          default:
            return this.quickMeasure(text);
        }
    }
    fullMeasure(text) {
        if ((0, common_1.isNil)(text)) return {
            width: 0,
            height: 0
        };
        if ((0, common_1.isNil)(this._option.getTextBounds) || !this._notSupportCanopus) return this.measureWithNaiveCanvas(text);
        const {fontFamily: fontFamily, fontSize: fontSize, fontWeight: fontWeight, textAlign: textAlign, textBaseline: textBaseline, ellipsis: ellipsis, limit: limit, lineHeight: lineHeight} = this.textSpec;
        let size;
        try {
            const bounds = this._option.getTextBounds({
                text: text,
                fontFamily: fontFamily,
                fontSize: fontSize,
                fontWeight: fontWeight,
                textAlign: textAlign,
                textBaseline: textBaseline,
                ellipsis: !!ellipsis,
                maxLineWidth: limit || 1 / 0,
                lineHeight: lineHeight
            });
            size = {
                width: bounds.width(),
                height: bounds.height()
            };
        } catch (e) {
            this._notSupportCanopus = !0, size = this.measureWithNaiveCanvas(text);
        }
        return size;
    }
    measureWithNaiveCanvas(text) {
        return this._measureReduce(text, this._measureWithNaiveCanvas.bind(this));
    }
    _measureWithNaiveCanvas(text) {
        if (!this.initContext()) return this._quickMeasureWithoutCanvas(text);
        const metrics = this._context.measureText(text), {fontSize: fontSize, lineHeight: lineHeight} = this.textSpec;
        return {
            width: metrics.width,
            height: null != lineHeight ? lineHeight : fontSize
        };
    }
    quickMeasure(text) {
        return this._measureReduce(text, this._quickMeasure.bind(this));
    }
    _quickMeasure(text) {
        const totalSize = {
            width: 0,
            height: 0
        };
        for (let i = 0; i < text.length; i++) {
            const char = text[i];
            let size = this._measureSpecialChar(char);
            (0, common_1.isNil)(size) && TextMeasure.NUMBERS_CHAR_SET.includes(char) && (size = this._measureNumberChar()), 
            (0, common_1.isNil)(size) && [ "F", "W" ].includes((0, stringWidth_1.eastAsianCharacterInfo)(char)) && (size = this._measureFullSizeChar()), 
            (0, common_1.isNil)(size) && (size = this._measureLetterChar()), totalSize.width += size.width, 
            totalSize.height = Math.max(totalSize.height, size.height);
        }
        return totalSize;
    }
    quickMeasureWithoutCanvas(text) {
        return this._measureReduce(text, this._quickMeasureWithoutCanvas.bind(this));
    }
    _quickMeasureWithoutCanvas(text) {
        const totalSize = {
            width: 0,
            height: 0
        }, {fontSize: fontSize, lineHeight: lineHeight} = this.textSpec;
        for (let i = 0; i < text.length; i++) {
            const char = text[i], size = [ "F", "W" ].includes((0, stringWidth_1.eastAsianCharacterInfo)(char)) ? 1 : .53;
            totalSize.width += size * fontSize;
        }
        return totalSize.height = null != lineHeight ? lineHeight : fontSize, totalSize;
    }
    _measureReduce(text, processor) {
        const {fontSize: fontSize, lineHeight: lineHeight} = this.textSpec, defaultResult = {
            width: 0,
            height: 0
        };
        if ((0, common_1.isNil)(text)) return defaultResult;
        if ((0, common_1.isArray)(text)) {
            const textArr = text.filter(common_1.isValid).map((s => s.toString()));
            return 0 === textArr.length ? defaultResult : 1 === textArr.length ? processor(textArr[0]) : {
                width: textArr.reduce(((maxWidth, cur) => Math.max(maxWidth, processor(cur).width)), 0),
                height: textArr.length * ((null != lineHeight ? lineHeight : fontSize) + 1) + 1
            };
        }
        return processor(text.toString());
    }
    _measureNumberChar() {
        if ((0, common_1.isNil)(this._numberCharSize)) {
            const numberBounds = this._standardMethod(TextMeasure.NUMBERS_CHAR_SET);
            this._numberCharSize = {
                width: numberBounds.width / TextMeasure.NUMBERS_CHAR_SET.length,
                height: numberBounds.height
            };
        }
        return this._numberCharSize;
    }
    _measureFullSizeChar() {
        return (0, common_1.isNil)(this._fullCharSize) && (this._fullCharSize = this._standardMethod(TextMeasure.FULL_SIZE_CHAR)), 
        this._fullCharSize;
    }
    _measureLetterChar() {
        if ((0, common_1.isNil)(this._letterCharSize)) {
            const alphabetBounds = this._standardMethod(TextMeasure.ALPHABET_CHAR_SET);
            this._letterCharSize = {
                width: alphabetBounds.width / TextMeasure.ALPHABET_CHAR_SET.length,
                height: alphabetBounds.height
            };
        }
        return this._letterCharSize;
    }
    _measureSpecialChar(char) {
        return (0, common_1.isValid)(this._specialCharSizeMap[char]) ? this._specialCharSizeMap[char] : this.specialCharSet.includes(char) ? (this._specialCharSizeMap[char] = this._standardMethod(char), 
        this._specialCharSizeMap[char]) : null;
    }
    release() {
        (0, common_1.isValid)(this._canvas) && (this._canvas = null), (0, common_1.isValid)(this._context) && (this._contextSaved && (this._context.restore(), 
        this._contextSaved = !1), this._context = null);
    }
}

exports.TextMeasure = TextMeasure, TextMeasure.ALPHABET_CHAR_SET = "abcdefghijklmnopqrstuvwxyz", 
TextMeasure.NUMBERS_CHAR_SET = "0123456789", TextMeasure.FULL_SIZE_CHAR = "字";
//# sourceMappingURL=textMeasure.js.map

}, function(modId) { var map = {"../../../common":1689069768005,"../stringWidth":1689069768088,"./util":1689069768091}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1689069768091, function(require, module, exports) {


function getContextFont(text, defaultAttr = {}) {
    const {fontStyle: fontStyle = defaultAttr.fontStyle, fontVariant: fontVariant = defaultAttr.fontVariant, fontWeight: fontWeight = defaultAttr.fontWeight, fontSize: fontSize = defaultAttr.fontSize, fontFamily: fontFamily = defaultAttr.fontFamily} = text;
    return (fontStyle ? fontStyle + " " : "") + (fontVariant ? fontVariant + " " : "") + (fontWeight ? fontWeight + " " : "") + fontSize + "px " + (fontFamily || "sans-serif");
}

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.getContextFont = void 0, exports.getContextFont = getContextFont;
//# sourceMappingURL=util.js.map

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1689069768092, function(require, module, exports) {


Object.defineProperty(exports, "__esModule", {
    value: !0
});
//# sourceMappingURL=interface.js.map

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1689069768093, function(require, module, exports) {


Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.TestTextMeasure = exports.getTestWord = exports.getTestNumbers = void 0;

const common_1 = require("../../../common"), textMeasure_1 = require("./textMeasure"), getNumberChar = () => TestTextMeasure.NUMBERS_CHAR_SET[Math.floor(Math.random() * TestTextMeasure.NUMBERS_CHAR_SET.length)], getTestNumbers = length => Array(length).fill(0).map(getNumberChar).join("");

exports.getTestNumbers = getTestNumbers;

const getLetterChar = () => TestTextMeasure.ALPHABET_CHAR_SET[Math.floor(Math.random() * TestTextMeasure.ALPHABET_CHAR_SET.length)], getTestWord = length => Array(length).fill(0).map(getLetterChar).join("");

exports.getTestWord = getTestWord;

class TestTextMeasure extends textMeasure_1.TextMeasure {
    test(methods, getStrCallback, count) {
        const mean = numbers => (numbers => numbers.reduce(((sum, cur) => sum + cur), 0))(numbers) / numbers.length, variance = numbers => {
            const m = mean(numbers);
            return mean(numbers.map((num => Math.pow(num - m, 2))));
        }, callback = null != getStrCallback ? getStrCallback : () => `测试${(0, exports.getTestWord)(8)} ${(0, 
        exports.getTestNumbers)(4)}/${(0, exports.getTestNumbers)(2)}-${(0, exports.getTestNumbers)(2)}`, textArr = Array(null != count ? count : 1e5).fill(0).map(callback), methodMap = {
            canopus: this.fullMeasure.bind(this),
            canvas: this.measureWithNaiveCanvas.bind(this),
            simple: this.quickMeasureWithoutCanvas.bind(this),
            quick: this.quickMeasure.bind(this),
            old: text => {
                if ((0, common_1.isNil)(text)) return {
                    width: 0,
                    height: 0
                };
                const str = text.toString(), {fontSize: fontSize} = this.textSpec;
                return {
                    width: .8 * fontSize * str.length,
                    height: fontSize
                };
            }
        }, methodList = null != methods ? methods : Object.keys(methodMap), report = {}, timetmp = performance.now(), standardResult = textArr.map(this._standardMethod), standardTime = performance.now() - timetmp;
        return report.standard = {
            time: standardTime
        }, methodList.forEach((method => {
            const testMethod = methodMap[method];
            if (testMethod) {
                const timetmp = performance.now(), testResult = textArr.map(testMethod), testTime = performance.now() - timetmp, errList = textArr.map(((_, i) => ({
                    width: testResult[i].width - standardResult[i].width,
                    height: testResult[i].height - standardResult[i].height
                })));
                report[method] = {
                    errMean: {
                        width: mean(errList.map((e => e.width))),
                        height: mean(errList.map((e => e.height)))
                    },
                    errVar: {
                        width: variance(errList.map((e => e.width))),
                        height: variance(errList.map((e => e.height)))
                    },
                    time: testTime
                };
            }
        })), {
            report: report,
            textArr: textArr
        };
    }
}

exports.TestTextMeasure = TestTextMeasure;
//# sourceMappingURL=test.js.map

}, function(modId) { var map = {"../../../common":1689069768005,"./textMeasure":1689069768090}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1689069768094, function(require, module, exports) {


Object.defineProperty(exports, "__esModule", {
    value: !0
});
//# sourceMappingURL=type.js.map
}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1689069768095, function(require, module, exports) {


function log(method, level, input) {
    if ("undefined" != typeof console) {
        const args = [ level ].concat([].slice.call(input));
        console[method].apply(console, args);
    }
}

function logger(logLevel, method) {
    let level = logLevel || exports.None;
    return {
        level(levelValue) {
            return arguments.length ? (level = +levelValue, this) : level;
        },
        error(...args) {
            return level >= exports.Error && log(method || "error", "ERROR", args), this;
        },
        warn(...args) {
            return level >= exports.Warn && log(method || "warn", "WARN", args), this;
        },
        info(...args) {
            return level >= exports.Info && log(method || "log", "INFO", args), this;
        },
        debug(...args) {
            return level >= exports.Debug && log(method || "log", "DEBUG", args), this;
        }
    };
}

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.logger = exports.Debug = exports.Info = exports.Warn = exports.Error = exports.None = void 0, 
exports.None = 0, exports.Error = 1, exports.Warn = 2, exports.Info = 3, exports.Debug = 4, 
exports.logger = logger;
//# sourceMappingURL=logger.js.map
}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1689069768096, function(require, module, exports) {


var __importDefault = this && this.__importDefault || function(mod) {
    return mod && mod.__esModule ? mod : {
        default: mod
    };
};

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.normalizePadding = void 0;

const isValidNumber_1 = __importDefault(require("./common/isValidNumber")), isArray_1 = __importDefault(require("./common/isArray")), isObject_1 = __importDefault(require("./common/isObject"));

function normalizePadding(padding) {
    if ((0, isValidNumber_1.default)(padding)) return [ padding, padding, padding, padding ];
    if ((0, isArray_1.default)(padding)) {
        const length = padding.length;
        if (1 === length) {
            const paddingValue = padding[0];
            return [ paddingValue, paddingValue, paddingValue, paddingValue ];
        }
        if (2 === length) {
            const [vertical, horizontal] = padding;
            return [ vertical, horizontal, vertical, horizontal ];
        }
        if (3 === length) {
            const [top, horizontal, bottom] = padding;
            return [ top, horizontal, bottom, horizontal ];
        }
        if (4 === length) return padding;
    }
    if ((0, isObject_1.default)(padding)) {
        const {top: top = 0, right: right = 0, bottom: bottom = 0, left: left = 0} = padding;
        return [ top, right, bottom, left ];
    }
    return [ 0, 0, 0, 0 ];
}

exports.normalizePadding = normalizePadding;
//# sourceMappingURL=padding.js.map
}, function(modId) { var map = {"./common/isValidNumber":1689069768022,"./common/isArray":1689069768017,"./common/isObject":1689069768012}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1689069768097, function(require, module, exports) {


var __createBinding = this && this.__createBinding || (Object.create ? function(o, m, k, k2) {
    void 0 === k2 && (k2 = k);
    var desc = Object.getOwnPropertyDescriptor(m, k);
    desc && !("get" in desc ? !m.__esModule : desc.writable || desc.configurable) || (desc = {
        enumerable: !0,
        get: function() {
            return m[k];
        }
    }), Object.defineProperty(o, k2, desc);
} : function(o, m, k, k2) {
    void 0 === k2 && (k2 = k), o[k2] = m[k];
}), __exportStar = this && this.__exportStar || function(m, exports) {
    for (var p in m) "default" === p || Object.prototype.hasOwnProperty.call(exports, p) || __createBinding(exports, m, p);
};

Object.defineProperty(exports, "__esModule", {
    value: !0
}), __exportStar(require("./formatUtils"), exports), __exportStar(require("./interval"), exports);
//# sourceMappingURL=index.js.map

}, function(modId) { var map = {"./formatUtils":1689069768098,"./interval":1689069768099}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1689069768098, function(require, module, exports) {


var __importDefault = this && this.__importDefault || function(mod) {
    return mod && mod.__esModule ? mod : {
        default: mod
    };
};

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.getTimeFormatter = exports.getFormatFromValue = exports.millisecondsSetterName = exports.secondsSetterName = exports.minutesSetterName = exports.hoursSetterName = exports.dateSetterName = exports.monthSetterName = exports.fullYearSetterName = exports.millisecondsGetterName = exports.secondsGetterName = exports.minutesGetterName = exports.hoursGetterName = exports.dateGetterName = exports.monthGetterName = exports.fullYearGetterName = void 0;

const pad_1 = __importDefault(require("../common/pad")), toDate_1 = require("../common/toDate");

function fullYearGetterName(isUTC) {
    return isUTC ? "getUTCFullYear" : "getFullYear";
}

function monthGetterName(isUTC) {
    return isUTC ? "getUTCMonth" : "getMonth";
}

function dateGetterName(isUTC) {
    return isUTC ? "getUTCDate" : "getDate";
}

function hoursGetterName(isUTC) {
    return isUTC ? "getUTCHours" : "getHours";
}

function minutesGetterName(isUTC) {
    return isUTC ? "getUTCMinutes" : "getMinutes";
}

function secondsGetterName(isUTC) {
    return isUTC ? "getUTCSeconds" : "getSeconds";
}

function millisecondsGetterName(isUTC) {
    return isUTC ? "getUTCMilliseconds" : "getMilliseconds";
}

function fullYearSetterName(isUTC) {
    return isUTC ? "setUTCFullYear" : "setFullYear";
}

function monthSetterName(isUTC) {
    return isUTC ? "setUTCMonth" : "setMonth";
}

function dateSetterName(isUTC) {
    return isUTC ? "setUTCDate" : "setDate";
}

function hoursSetterName(isUTC) {
    return isUTC ? "setUTCHours" : "setHours";
}

function minutesSetterName(isUTC) {
    return isUTC ? "setUTCMinutes" : "setMinutes";
}

function secondsSetterName(isUTC) {
    return isUTC ? "setUTCSeconds" : "setSeconds";
}

function millisecondsSetterName(isUTC) {
    return isUTC ? "setUTCMilliseconds" : "setMilliseconds";
}

function getFormatFromValue(value, isUTC) {
    const date = (0, toDate_1.toDate)(value), M = date[monthGetterName(isUTC)]() + 1, d = date[dateGetterName(isUTC)](), h = date[hoursGetterName(isUTC)](), m = date[minutesGetterName(isUTC)](), s = date[secondsGetterName(isUTC)](), isSecond = 0 === date[millisecondsGetterName(isUTC)](), isMinute = isSecond && 0 === s, isHour = isMinute && 0 === m, isDay = isHour && 0 === h, isMonth = isDay && 1 === d;
    return isMonth && 1 === M ? "YYYY" : isMonth ? "YYYY-MM" : isDay ? "YYYY-MM-DD" : isHour ? "HH" : isMinute ? "HH:mm" : isSecond ? "HH:mm:ss" : "HH:mm:ss SSS";
}

function getTimeFormatter(template, isUTC) {
    return time => {
        const date = (0, toDate_1.toDate)(time), y = date[fullYearGetterName(isUTC)](), M = date[monthGetterName(isUTC)]() + 1, q = Math.floor((M - 1) / 3) + 1, d = date[dateGetterName(isUTC)](), e = date["get" + (isUTC ? "UTC" : "") + "Day"](), H = date[hoursGetterName(isUTC)](), h = (H - 1) % 12 + 1, m = date[minutesGetterName(isUTC)](), s = date[secondsGetterName(isUTC)](), S = date[millisecondsGetterName(isUTC)]();
        return (template || "").replace(/YYYY/g, (0, pad_1.default)(y + "", 4, "0", "left")).replace(/yyyy/g, y + "").replace(/yy/g, y % 100 + "").replace(/Q/g, q + "").replace(/MM/g, (0, 
        pad_1.default)(M, 2, "0", "left")).replace(/M/g, M + "").replace(/dd/g, (0, pad_1.default)(d, 2, "0", "left")).replace(/d/g, d + "").replace(/e/g, e + "").replace(/HH/g, (0, 
        pad_1.default)(H, 2, "0", "left")).replace(/H/g, H + "").replace(/hh/g, (0, pad_1.default)(h + "", 2, "0", "left")).replace(/h/g, h + "").replace(/mm/g, (0, 
        pad_1.default)(m, 2, "0", "left")).replace(/m/g, m + "").replace(/ss/g, (0, pad_1.default)(s, 2, "0", "left")).replace(/s/g, s + "").replace(/SSS/g, (0, 
        pad_1.default)(S, 3, "0", "left")).replace(/S/g, S + "");
    };
}

exports.fullYearGetterName = fullYearGetterName, exports.monthGetterName = monthGetterName, 
exports.dateGetterName = dateGetterName, exports.hoursGetterName = hoursGetterName, 
exports.minutesGetterName = minutesGetterName, exports.secondsGetterName = secondsGetterName, 
exports.millisecondsGetterName = millisecondsGetterName, exports.fullYearSetterName = fullYearSetterName, 
exports.monthSetterName = monthSetterName, exports.dateSetterName = dateSetterName, 
exports.hoursSetterName = hoursSetterName, exports.minutesSetterName = minutesSetterName, 
exports.secondsSetterName = secondsSetterName, exports.millisecondsSetterName = millisecondsSetterName, 
exports.getFormatFromValue = getFormatFromValue, exports.getTimeFormatter = getTimeFormatter;
//# sourceMappingURL=formatUtils.js.map

}, function(modId) { var map = {"../common/pad":1689069768051,"../common/toDate":1689069768060}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1689069768099, function(require, module, exports) {


Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.utcSecondOffset = exports.utcSecondFloor = exports.secondField = exports.secondCount = exports.secondOffset = exports.secondFloor = exports.utcMinuteField = exports.utcMinuteOffset = exports.utcMinuteFloor = exports.minuteField = exports.minuteCount = exports.minuteOffset = exports.minuteFloor = exports.utcHourField = exports.utcHourOffset = exports.utcHourFloor = exports.hourField = exports.hourCount = exports.hourOffset = exports.hourFloor = exports.utcDayField = exports.utcDayCount = exports.utcDayOffset = exports.utcDayFloor = exports.dayField = exports.dayCount = exports.dayOffset = exports.dayFloor = exports.utcMonthField = exports.utcMonthCount = exports.utcMonthOffset = exports.utcMonthFloor = exports.monthField = exports.monthCount = exports.monthOffset = exports.monthFloor = exports.utcYearField = exports.utcYearCount = exports.utcYearOffset = exports.utcYearFloor = exports.yearField = exports.yearCount = exports.yearOffset = exports.yearFloor = exports.YEAR = exports.MONTH = exports.DAY = exports.HOUR = exports.MINUTE = exports.SECOND = void 0, 
exports.getIntervalOptions = exports.generateStepInterval = exports.generateCount = exports.generateCeil = exports.millisecondsCount = exports.millisecondsOffset = exports.millisecondsFloor = exports.utcSecondField = void 0, 
exports.SECOND = 1e3, exports.MINUTE = 60 * exports.SECOND, exports.HOUR = 60 * exports.MINUTE, 
exports.DAY = 24 * exports.HOUR, exports.MONTH = 31 * exports.DAY, exports.YEAR = 365 * exports.DAY;

const yearFloor = date => (date.setMonth(0, 1), date.setHours(0, 0, 0, 0), date);

exports.yearFloor = yearFloor;

const yearOffset = (date, step) => (date.setFullYear(date.getFullYear() + step), 
date);

exports.yearOffset = yearOffset;

const yearCount = (start, end) => end.getFullYear() - start.getFullYear();

exports.yearCount = yearCount;

const yearField = date => date.getFullYear();

exports.yearField = yearField;

const utcYearFloor = date => (date.setUTCMonth(0, 1), date.setUTCHours(0, 0, 0, 0), 
date);

exports.utcYearFloor = utcYearFloor;

const utcYearOffset = (date, step) => (date.setUTCFullYear(date.getUTCFullYear() + step), 
date);

exports.utcYearOffset = utcYearOffset;

const utcYearCount = (start, end) => end.getUTCFullYear() - start.getUTCFullYear();

exports.utcYearCount = utcYearCount;

const utcYearField = date => date.getUTCFullYear();

exports.utcYearField = utcYearField;

const monthFloor = date => (date.setDate(1), date.setHours(0, 0, 0, 0), date);

exports.monthFloor = monthFloor;

const monthOffset = (date, step) => (date.setMonth(date.getMonth() + step), date);

exports.monthOffset = monthOffset;

const monthCount = (start, end) => end.getMonth() - start.getMonth() + 12 * (end.getFullYear() - start.getFullYear());

exports.monthCount = monthCount;

const monthField = date => date.getMonth();

exports.monthField = monthField;

const utcMonthFloor = date => (date.setUTCDate(1), date.setUTCHours(0, 0, 0, 0), 
date);

exports.utcMonthFloor = utcMonthFloor;

const utcMonthOffset = (date, step) => (date.setUTCMonth(date.getUTCMonth() + step), 
date);

exports.utcMonthOffset = utcMonthOffset;

const utcMonthCount = (start, end) => end.getUTCMonth() - start.getUTCMonth() + 12 * (end.getUTCFullYear() - start.getUTCFullYear());

exports.utcMonthCount = utcMonthCount;

const utcMonthField = date => date.getUTCMonth();

exports.utcMonthField = utcMonthField;

const dayFloor = date => (date.setHours(0, 0, 0, 0), date);

exports.dayFloor = dayFloor;

const dayOffset = (date, step) => (date.setDate(date.getDate() + step), date);

exports.dayOffset = dayOffset;

const dayCount = (start, end) => (+end - +start - (end.getTimezoneOffset() - start.getTimezoneOffset()) * exports.MINUTE) / exports.DAY;

exports.dayCount = dayCount;

const dayField = date => date.getDate() - 1;

exports.dayField = dayField;

const utcDayFloor = date => (date.setUTCHours(0, 0, 0, 0), date);

exports.utcDayFloor = utcDayFloor;

const utcDayOffset = (date, step) => (date.setUTCDate(date.getUTCDate() + step), 
date);

exports.utcDayOffset = utcDayOffset;

const utcDayCount = (start, end) => (+end - +start) / exports.DAY;

exports.utcDayCount = utcDayCount;

const utcDayField = date => date.getUTCDate() - 1;

exports.utcDayField = utcDayField;

const hourFloor = date => (date.setTime(+date - date.getMilliseconds() - date.getSeconds() * exports.SECOND - date.getMinutes() * exports.MINUTE), 
date);

exports.hourFloor = hourFloor;

const hourOffset = (date, step) => (date.setHours(date.getHours() + step), date);

exports.hourOffset = hourOffset;

const hourCount = (start, end) => (+end - +start) / exports.HOUR;

exports.hourCount = hourCount;

const hourField = date => date.getHours();

exports.hourField = hourField;

const utcHourFloor = date => (date.setTime(+date - date.getUTCMilliseconds() - date.getUTCSeconds() * exports.SECOND - date.getUTCMinutes() * exports.MINUTE), 
date);

exports.utcHourFloor = utcHourFloor;

const utcHourOffset = (date, step) => (date.setUTCHours(date.getUTCHours() + step), 
date);

exports.utcHourOffset = utcHourOffset;

const utcHourField = date => date.getUTCHours();

exports.utcHourField = utcHourField;

const minuteFloor = date => (date.setTime(+date - date.getMilliseconds() - date.getSeconds() * exports.SECOND), 
date);

exports.minuteFloor = minuteFloor;

const minuteOffset = (date, step) => (date.setMinutes(date.getMinutes() + step), 
date);

exports.minuteOffset = minuteOffset;

const minuteCount = (start, end) => (+end - +start) / exports.MINUTE;

exports.minuteCount = minuteCount;

const minuteField = date => date.getMinutes();

exports.minuteField = minuteField;

const utcMinuteFloor = date => (date.setTime(+date - date.getUTCMilliseconds() - date.getUTCSeconds() * exports.SECOND), 
date);

exports.utcMinuteFloor = utcMinuteFloor;

const utcMinuteOffset = (date, step) => (date.setUTCMinutes(date.getUTCMinutes() + step), 
date);

exports.utcMinuteOffset = utcMinuteOffset;

const utcMinuteField = date => date.getUTCMinutes();

exports.utcMinuteField = utcMinuteField;

const secondFloor = date => (date.setTime(+date - date.getMilliseconds()), date);

exports.secondFloor = secondFloor;

const secondOffset = (date, step) => (date.setSeconds(date.getSeconds() + step), 
date);

exports.secondOffset = secondOffset;

const secondCount = (start, end) => (+end - +start) / exports.SECOND;

exports.secondCount = secondCount;

const secondField = date => date.getSeconds();

exports.secondField = secondField;

const utcSecondFloor = date => (date.setTime(+date - date.getUTCMilliseconds()), 
date);

exports.utcSecondFloor = utcSecondFloor;

const utcSecondOffset = (date, step) => (date.setUTCSeconds(date.getUTCSeconds() + step), 
date);

exports.utcSecondOffset = utcSecondOffset;

const utcSecondField = date => date.getUTCSeconds();

exports.utcSecondField = utcSecondField;

const millisecondsFloor = date => date;

exports.millisecondsFloor = millisecondsFloor;

const millisecondsOffset = (date, step) => (date.setTime(+date + step), date);

exports.millisecondsOffset = millisecondsOffset;

const millisecondsCount = (start, end) => +end - +start;

exports.millisecondsCount = millisecondsCount;

const generateCeil = (floor, offset) => date => {
    const n = new Date(+date - 1);
    return offset(n, 1), floor(n), n;
};

exports.generateCeil = generateCeil;

const generateCount = (floor, count) => (start, end) => {
    const a = new Date, b = new Date;
    return a.setTime(+start), b.setTime(+end), floor(a), floor(b), Math.floor(count(a, b));
};

exports.generateCount = generateCount;

const generateStepInterval = (step, {floor: floor, offset: offset, field: field, count: count}) => {
    const s = Math.floor(step);
    if (!Number.isFinite(s) || s <= 0) return null;
    if (s <= 1) return {
        floor: floor,
        offset: offset,
        ceil: (0, exports.generateCeil)(floor, offset)
    };
    const stepCount = (0, exports.generateCount)(floor, count), testFunc = field ? d => field(d) % s == 0 : d => stepCount(0, d) % s == 0, stepFloor = date => {
        if (!Number.isNaN(+date)) for (floor(date); !testFunc(date); ) date.setTime(+date - 1), 
        floor(date);
        return date;
    }, stepOffset = (date, stepCount) => {
        if (!Number.isNaN(+date)) if (s < 0) for (;++stepCount <= 0; ) for (offset(date, -1); !testFunc(date); ) offset(date, -1); else for (;--stepCount >= 0; ) for (offset(date, 1); !testFunc(date); ) offset(date, 1);
        return date;
    };
    return {
        floor: stepFloor,
        offset: stepOffset,
        ceil: (0, exports.generateCeil)(stepFloor, stepOffset)
    };
};

exports.generateStepInterval = generateStepInterval;

const getIntervalOptions = (type, isUTC) => "year" === type && isUTC ? {
    floor: exports.utcYearFloor,
    offset: exports.utcYearOffset,
    count: exports.utcYearCount,
    field: exports.utcYearField
} : "month" === type && isUTC ? {
    floor: exports.utcMonthFloor,
    offset: exports.utcMonthOffset,
    count: exports.utcMonthCount,
    field: exports.utcMonthField
} : "day" === type && isUTC ? {
    floor: exports.utcDayFloor,
    offset: exports.utcDayOffset,
    count: exports.utcDayCount,
    field: exports.utcDayField
} : "hour" === type && isUTC ? {
    floor: exports.utcHourFloor,
    offset: exports.utcHourOffset,
    count: exports.hourCount,
    field: exports.utcHourField
} : "minute" === type && isUTC ? {
    floor: exports.utcMinuteFloor,
    offset: exports.utcMinuteOffset,
    count: exports.minuteCount,
    field: exports.utcMinuteField
} : "second" === type && isUTC ? {
    floor: exports.utcSecondFloor,
    offset: exports.utcSecondOffset,
    count: exports.secondCount,
    field: exports.utcSecondField
} : "year" === type ? {
    floor: exports.yearFloor,
    offset: exports.yearOffset,
    count: exports.yearCount,
    field: exports.yearField
} : "month" === type ? {
    floor: exports.monthFloor,
    offset: exports.monthOffset,
    count: exports.monthCount,
    field: exports.monthField
} : "day" === type ? {
    floor: exports.dayFloor,
    offset: exports.dayOffset,
    count: exports.dayCount,
    field: exports.dayField
} : "hour" === type ? {
    floor: exports.hourFloor,
    offset: exports.hourOffset,
    count: exports.hourCount,
    field: exports.hourField
} : "minute" === type ? {
    floor: exports.minuteFloor,
    offset: exports.minuteOffset,
    count: exports.minuteCount,
    field: exports.minuteField
} : "second" === type ? {
    floor: exports.secondFloor,
    offset: exports.secondOffset,
    count: exports.secondCount,
    field: exports.secondField
} : {
    floor: exports.millisecondsFloor,
    offset: exports.millisecondsOffset,
    count: exports.millisecondsCount
};

exports.getIntervalOptions = getIntervalOptions;
//# sourceMappingURL=interval.js.map

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1689069768100, function(require, module, exports) {


function getContainerSize(el, defaultWidth = 0, defaultHeight = 0) {
    if (!el) return {
        width: defaultWidth,
        height: defaultHeight
    };
    let getComputedStyle;
    try {
        getComputedStyle = null === window || void 0 === window ? void 0 : window.getComputedStyle;
    } catch (e) {
        getComputedStyle = () => ({});
    }
    const style = getComputedStyle(el), computedWidth = parseFloat(style.width) - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight) || el.clientWidth - 1, computedHeight = parseFloat(style.height) - parseFloat(style.paddingTop) - parseFloat(style.paddingBottom) || el.clientHeight - 1;
    return {
        width: computedWidth <= 0 ? defaultWidth : computedWidth,
        height: computedHeight <= 0 ? defaultHeight : computedHeight
    };
}

function getElementAbsolutePosition(element) {
    let actualLeft = element.offsetLeft, current = element.offsetParent;
    for (;current; ) actualLeft += current.offsetLeft, current = current.offsetParent;
    let actualTop = element.offsetTop;
    for (current = element.offsetParent; current; ) actualTop += current.offsetTop + current.clientTop, 
    current = current.offsetParent;
    return {
        x: actualLeft,
        y: actualTop
    };
}

function getElementRelativePosition(element, base) {
    const posElement = getElementAbsolutePosition(element), posBase = getElementAbsolutePosition(base);
    return {
        x: posElement.x - posBase.x,
        y: posElement.y - posBase.y
    };
}

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.hasParentElement = exports.getElementRelativeScrollOffset = exports.getElementAbsoluteScrollOffset = exports.getElementRelativePosition = exports.getElementAbsolutePosition = exports.getContainerSize = void 0, 
exports.getContainerSize = getContainerSize, exports.getElementAbsolutePosition = getElementAbsolutePosition, 
exports.getElementRelativePosition = getElementRelativePosition;

const getScrollLeft = element => {
    var _a, _b, _c;
    return element === (null === (_a = null === globalThis || void 0 === globalThis ? void 0 : globalThis.document) || void 0 === _a ? void 0 : _a.body) ? (null === (_c = null === (_b = null === globalThis || void 0 === globalThis ? void 0 : globalThis.document) || void 0 === _b ? void 0 : _b.documentElement) || void 0 === _c ? void 0 : _c.scrollLeft) || element.scrollLeft : "html" === element.tagName.toLowerCase() ? 0 : element.scrollLeft;
}, getScrollTop = element => {
    var _a, _b, _c;
    return element === (null === (_a = null === globalThis || void 0 === globalThis ? void 0 : globalThis.document) || void 0 === _a ? void 0 : _a.body) ? (null === (_c = null === (_b = null === globalThis || void 0 === globalThis ? void 0 : globalThis.document) || void 0 === _b ? void 0 : _b.documentElement) || void 0 === _c ? void 0 : _c.scrollTop) || element.scrollTop : "html" === element.tagName.toLowerCase() ? 0 : element.scrollTop;
};

function getElementAbsoluteScrollOffset(element) {
    let actualLeft = getScrollLeft(element), current = element.parentElement;
    for (;current; ) actualLeft += getScrollLeft(current), current = current.parentElement;
    let actualTop = getScrollTop(element);
    for (current = element.parentElement; current; ) actualTop += getScrollTop(current), 
    current = current.parentElement;
    return {
        x: actualLeft,
        y: actualTop
    };
}

function getElementRelativeScrollOffset(element, base) {
    const posElement = getElementAbsoluteScrollOffset(element), posBase = getElementAbsoluteScrollOffset(base);
    return {
        x: posElement.x - posBase.x,
        y: posElement.y - posBase.y
    };
}

function hasParentElement(element, target) {
    let parent = element.parentNode;
    for (;null !== parent; ) {
        if (parent === target) return !0;
        parent = parent.parentNode;
    }
    return !1;
}

exports.getElementAbsoluteScrollOffset = getElementAbsoluteScrollOffset, exports.getElementRelativeScrollOffset = getElementRelativeScrollOffset, 
exports.hasParentElement = hasParentElement;
//# sourceMappingURL=dom.js.map
}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1689069768101, function(require, module, exports) {


var __createBinding = this && this.__createBinding || (Object.create ? function(o, m, k, k2) {
    void 0 === k2 && (k2 = k);
    var desc = Object.getOwnPropertyDescriptor(m, k);
    desc && !("get" in desc ? !m.__esModule : desc.writable || desc.configurable) || (desc = {
        enumerable: !0,
        get: function() {
            return m[k];
        }
    }), Object.defineProperty(o, k2, desc);
} : function(o, m, k, k2) {
    void 0 === k2 && (k2 = k), o[k2] = m[k];
}), __exportStar = this && this.__exportStar || function(m, exports) {
    for (var p in m) "default" === p || Object.prototype.hasOwnProperty.call(exports, p) || __createBinding(exports, m, p);
};

Object.defineProperty(exports, "__esModule", {
    value: !0
}), __exportStar(require("./invariant"), exports), __exportStar(require("./interface"), exports);
//# sourceMappingURL=index.js.map

}, function(modId) { var map = {"./invariant":1689069768102,"./interface":1689069768103}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1689069768102, function(require, module, exports) {


Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.destination = exports.isPointInPolygon = void 0;

const helpers_1 = require("@turf/helpers"), graphics_1 = require("../graphics"), angle_1 = require("../angle");

function getGeom(geojson) {
    return "Feature" === geojson.type ? geojson.geometry : geojson;
}

function isPointInPolygon(point, polygon) {
    if (!point) return !1;
    if (!polygon) return !1;
    const geom = getGeom(polygon), type = geom.type, bbox = polygon.bbox;
    let polys = geom.coordinates;
    if (bbox && !0 === (0, graphics_1.pointInRect)(point, {
        x1: bbox[0],
        x2: bbox[1],
        y1: bbox[1],
        y2: bbox[3]
    }, !0)) return !1;
    "Polygon" === type && (polys = [ polys ]);
    let result = !1;
    for (let i = 0; i < polys.length; ++i) for (let j = 0; j < polys[i].length; ++j) {
        if ((0, graphics_1.polygonContainPoint)(polys[i][j].map((p => ({
            x: p[0],
            y: p[1]
        }))), point.x, point.y)) return result = !0, result;
    }
    return result;
}

function destination(point, distance, bearing, options = {}) {
    const longitude1 = (0, angle_1.degreeToRadian)(point[0]), latitude1 = (0, angle_1.degreeToRadian)(point[1]), bearingRad = (0, 
    angle_1.degreeToRadian)(bearing), radians = (0, helpers_1.lengthToRadians)(distance, options.units), latitude2 = Math.asin(Math.sin(latitude1) * Math.cos(radians) + Math.cos(latitude1) * Math.sin(radians) * Math.cos(bearingRad)), longitude2 = longitude1 + Math.atan2(Math.sin(bearingRad) * Math.sin(radians) * Math.cos(latitude1), Math.cos(radians) - Math.sin(latitude1) * Math.sin(latitude2));
    return {
        x: (0, angle_1.radianToDegree)(longitude2),
        y: (0, angle_1.radianToDegree)(latitude2)
    };
}

exports.isPointInPolygon = isPointInPolygon, exports.destination = destination;
//# sourceMappingURL=invariant.js.map

}, function(modId) { var map = {"../graphics":1689069768079,"../angle":1689069768070}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1689069768103, function(require, module, exports) {


Object.defineProperty(exports, "__esModule", {
    value: !0
});
//# sourceMappingURL=interface.js.map

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
return __REQUIRE__(1689069768004);
})()
//miniprogram-npm-outsideDeps=["eventemitter3","@turf/helpers"]
//# sourceMappingURL=index.js.map