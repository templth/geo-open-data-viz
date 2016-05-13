"use strict";
function getPropertyValue(obj) {
    var keys = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        keys[_i - 1] = arguments[_i];
    }
    var current = obj;
    /*console.log('keys');
    console.log(keys);
    console.log('obj');
    console.log(obj);*/
    keys.forEach(function (elt) {
        if (current) {
            current = current[elt];
        }
    });
    return current;
}
exports.getPropertyValue = getPropertyValue;
;
//# sourceMappingURL=properties.utils.js.map