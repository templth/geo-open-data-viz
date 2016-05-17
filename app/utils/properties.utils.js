"use strict";
function getPropertyValue(obj, keys, defaultValue) {
    var current = obj;
    keys.forEach(function (elt) {
        if (current) {
            current = current[elt];
        }
    });
    return current || defaultValue;
}
exports.getPropertyValue = getPropertyValue;
;
function hasProperty(obj, keys) {
    var current = obj;
    keys.forEach(function (elt) {
        if (current) {
            current = current[elt];
        }
    });
    return (current != null);
}
exports.hasProperty = hasProperty;
;
//# sourceMappingURL=properties.utils.js.map