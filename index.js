"use strict";

var objectAssign = require("object-assign");
var pxRegex = require("./lib/pixel-unit-regex");
var filterPropList = require("./lib/filter-prop-list");

var defaults = {
    rootValue: 16,
    unitPrecision: 5,
    selectorBlackList: [],
    propList: ["font", "font-size", "line-height", "letter-spacing"],
    replace: true,
    mediaQuery: false,
    minPixelValue: 0
};

module.exports = function(options) {
    var opts = objectAssign({}, defaults, options);
    var pxReplace = createPxReplace(
        opts.rootValue,
        opts.unitPrecision,
        opts.minPixelValue
    );

    var satisfyPropList = createPropListMatcher(opts.propList);

    return function(context, content, selectors, parent, line, column, length) {
        switch (context) {
            case 1: {
                // This should be the fastest test and will remove most declarations
                if (content.indexOf("px") === -1) {
                    return;
                }
                var property = content.match(/(.*):.*/)[1]; //

                if (!satisfyPropList(property)) {
                    return;
                }

                if (blacklistedSelector(opts.selectorBlackList, selectors))
                    return;

                return opts.replace
                    ? content.replace(pxRegex, pxReplace)
                    : content + ";" + content.replace(pxRegex, pxReplace);

                // if rem unit already exists, do not add or replace
                // if (declarationExists(decl.parent, decl.prop, value)) return;
            }
            case -1: {
                if (!opts.mediaQuery) return;
                if (content.indexOf("@media") === -1) return;
                if (content.indexOf("px") === -1) return;
                return content.replace(/@media.*{/g, function(mq) {
                    return mq.replace(pxRegex, pxReplace);
                });
            }
        }
    };
};

function createPxReplace(rootValue, unitPrecision, minPixelValue) {
    return function(m, $1) {
        if (!$1) {
            return m;
        }
        var pixels = parseFloat($1);
        if (pixels < minPixelValue) {
            return m;
        }
        var fixedVal = toFixed(pixels / rootValue, unitPrecision);
        return fixedVal === 0 ? "0" : fixedVal + "rem";
    };
}

function toFixed(number, precision) {
    var multiplier = Math.pow(10, precision + 1),
        wholeNumber = Math.floor(number * multiplier);
    return Math.round(wholeNumber / 10) * 10 / multiplier;
}

function declarationExists(decls, prop, value) {
    return decls.some(function(decl) {
        return decl.prop === prop && decl.value === value;
    });
}

function blacklistedSelector(blacklist, selectors) {
    return selectors.some(function(selector) {
        if (typeof selector !== "string") {
            return false;
        }
        return blacklist.some(function(regex) {
            if (typeof regex === "string") {
                return selector.indexOf(regex) !== -1;
            }
            return selector.match(regex);
        });
    });
}

function createPropListMatcher(propList) {
    var hasWild = propList.indexOf("*") > -1;
    var matchAll = hasWild && propList.length === 1;
    var lists = {
        exact: filterPropList.exact(propList),
        contain: filterPropList.contain(propList),
        startWith: filterPropList.startWith(propList),
        endWith: filterPropList.endWith(propList),
        notExact: filterPropList.notExact(propList),
        notContain: filterPropList.notContain(propList),
        notStartWith: filterPropList.notStartWith(propList),
        notEndWith: filterPropList.notEndWith(propList)
    };
    return function(prop) {
        if (matchAll) {
            return true;
        }
        return (
            (hasWild ||
                lists.exact.indexOf(prop) > -1 ||
                lists.contain.some(function(m) {
                    return prop.indexOf(m) > -1;
                }) ||
                lists.startWith.some(function(m) {
                    return prop.indexOf(m) === 0;
                }) ||
                lists.endWith.some(function(m) {
                    return prop.indexOf(m) === prop.length - m.length;
                })) &&
            !(
                lists.notExact.indexOf(prop) > -1 ||
                lists.notContain.some(function(m) {
                    return prop.indexOf(m) > -1;
                }) ||
                lists.notStartWith.some(function(m) {
                    return prop.indexOf(m) === 0;
                }) ||
                lists.notEndWith.some(function(m) {
                    return prop.indexOf(m) === prop.length - m.length;
                })
            )
        );
    };
}
