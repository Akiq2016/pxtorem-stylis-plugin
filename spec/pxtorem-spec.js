// Jasmine unit tests
// To run tests, run these commands from the project root:
// 1. `npm install -g jasmine-node`
// 2. `jasmine-node spec`

/* global describe, it, expect */

'use strict';

var stylis = require('stylis')

var pxtorem = require('..');
var basicCSS = '.rule { font-size: 15px }';
var filterPropList = require('../lib/filter-prop-list');

var stylisOptions = {prefix:false};

var proccessor;
var processExpected =  new stylis(stylisOptions);

describe('pxtorem', function () {
    
    beforeEach(function (){
 
        proccessor = new stylis(stylisOptions);
        
        proccessor.use({})
    });

    it('should work on the readme example', function () {
        proccessor.use(pxtorem());
        
        var input = 'h1 { margin: 0 0 20px; font-size: 32px; line-height: 1.2; letter-spacing: 1px; }';
        var output = 'h1 { margin: 0 0 20px; font-size: 2rem; line-height: 1.2; letter-spacing: 0.0625rem; }';
        
        var processed = proccessor('',input);
        var expected = processExpected('', output)
        expect(processed).toBe(expected);
    });

    it('should replace the px unit with rem', function () {
        proccessor.use(pxtorem());
        
        var processed = proccessor('',basicCSS);
        var expected = processExpected('','.rule { font-size: 0.9375rem }');

        expect(processed).toBe(expected);
    });

    it('should ignore non px properties', function () {
        proccessor.use(pxtorem());

        var expected = processExpected('','.rule { font-size: 2em }');
        var processed = proccessor('',expected);

        expect(processed).toBe(expected);
    });

    it('should handle < 1 values and values without a leading 0 - legacy', function () {
        var rules = '.rule { margin: 0.5rem .5px -0.2px -.2em }';
        var expected = processExpected('','.rule { margin: 0.5rem 0.03125rem -0.0125rem -.2em }');
        var options = {
            propWhiteList: ['margin']
        };
        
        proccessor.use(pxtorem(options)); 
        var processed = proccessor('',rules);

        expect(processed).toBe(expected);
    });

    it('should handle < 1 values and values without a leading 0', function () {
        var rules = '.rule { margin: 0.5rem .5px -0.2px -.2em }';
        var expected = processExpected('','.rule { margin: 0.5rem 0.03125rem -0.0125rem -.2em }');
        var options = {
            propList: ['margin']
        };
     
        proccessor.use(pxtorem(options)); 
        var processed = proccessor('',rules);

        expect(processed).toBe(expected);
    });
/*
    This would require a whole lot more work. 
    it('should not add properties that already exist', function () {
        stylis.use(pxtorem({}));

        var expected = processExpected('','.rule { font-size: 16px; font-size: 1rem; }');
        var processed = stylis('',expected);

        expect(processed).toBe(expected);
    });
*/
    it('should remain unitless if 0', function () {
        proccessor.use(pxtorem({}));

        var input = '.rule { font-size: 0px; font-size: 0; }'
        var expected = processExpected('',input);
        var processed = proccessor('',input);

        expect(processed).toBe(expected);
    });
});

describe('value parsing', function () {
    
    beforeEach(function (){
        proccessor = new stylis(stylisOptions);
    });


    it('should not replace values in double quotes or single quotes', function () {
        var options = {
            propList: ['*']
        };
        var rules = '.rule { content: \'16px\'; font-family: "16px"; font-size: 16px; }';
        var expected = processExpected('','.rule { content: \'16px\'; font-family: "16px"; font-size: 1rem; }');
        
        proccessor.use(pxtorem(options));
        var processed = proccessor('',rules);

        expect(processed).toBe(expected);
    });

    it('should not replace values in `url()`', function () {
        var options = {
            propList: ['*']
        };
        var rules = '.rule { background: url(16px.jpg); font-size: 16px; }';
        var expected = processExpected('','.rule { background: url(16px.jpg); font-size: 1rem; }');
        proccessor.use(pxtorem(options)); 
        var processed = proccessor('',rules);

        expect(processed).toBe(expected);
    });

    it('should not replace values with an uppercase P or X', function () {
        var options = {
            propList: ['*']
        };
        var rules = '.rule { margin: 12px calc(100% - 14PX); height: calc(100% - 20px); font-size: 12Px; line-height: 16px; }';
        var expected = processExpected('','.rule { margin: 0.75rem calc(100% - 14PX); height: calc(100% - 1.25rem); font-size: 12Px; line-height: 1rem; }');
        proccessor.use(pxtorem(options)); 
        var processed = proccessor('',rules);

        expect(processed).toBe(expected);
    });
});
describe('rootValue', function () {
    beforeEach(function (){
        proccessor = new stylis(stylisOptions);
    });

    it('should replace using a root value of 10', function () {
        
        var expected = processExpected('','.rule { font-size: 1.5rem }');
        var options = {
            rootValue: 10
        };
        proccessor.use(pxtorem(options)); 
         var processed = proccessor('',basicCSS);

        expect(processed).toBe(expected);
    });
});

describe('unitPrecision', function () {
    beforeEach(function (){
        proccessor = new stylis(stylisOptions);
    });

    it('should replace using a decimal of 2 places', function () {
        var expected =processExpected('', '.rule { font-size: 0.94rem }');
        var options = {
            unitPrecision: 2
        };
        proccessor.use(pxtorem(options)); var processed = proccessor('',basicCSS);

        expect(processed).toBe(expected);
    });
});

describe('propWhiteList', function () {
    beforeEach(function (){
        proccessor = new stylis(stylisOptions);
    });

 

    it('should only replace properties in the prop list', function () {
        var css = '.rule { font-size: 16px; margin: 16px; margin-left: 5px; padding: 5px; padding-right: 16px }';
        var expected = processExpected('','.rule { font-size: 1rem; margin: 1rem; margin-left: 5px; padding: 5px; padding-right: 1rem }');
        var options = {
            propWhiteList: ['*font*', 'margin*', '!margin-left', '*-right', 'pad']
        };
       proccessor.use(pxtorem(options));  var processed = proccessor('',css);
console.log(processed)
console.log(expected)
        expect(processed).toBe(expected);
    });

    it('should only replace properties in the prop list with wildcard', function () {
        var css = '.rule { font-size: 16px; margin: 16px; margin-left: 5px; padding: 5px; padding-right: 16px }';
        var expected =processExpected('', '.rule { font-size: 16px; margin: 1rem; margin-left: 5px; padding: 5px; padding-right: 16px }');
        var options = {
            propWhiteList: ['*', '!margin-left', '!*padding*', '!font*']
        };
       proccessor.use(pxtorem(options));  var processed = proccessor('',css);

        expect(processed).toBe(expected);
    });

    it('should replace all properties when white list is empty', function () {
        var rules = '.rule { margin: 16px; font-size: 15px }';
        var expected = processExpected('','.rule { margin: 1rem; font-size: 0.9375rem }');
        var options = {
            propWhiteList: []
        };
        proccessor.use(pxtorem(options));  var processed = proccessor('',rules);

        expect(processed).toBe(expected);
    });
});

describe('selectorBlackList', function () {
    beforeEach(function (){
        proccessor = new stylis(stylisOptions);
    });

    it('should ignore selectors in the selector black list', function () {
        var rules = '.rule { font-size: 15px } .rule2 { font-size: 15px }';
        var expected = processExpected('','.rule { font-size: 0.9375rem } .rule2 { font-size: 15px }');
        var options = {
            selectorBlackList: ['.rule2']
        };
        proccessor.use(pxtorem(options));  var processed = proccessor('',rules);

        expect(processed).toBe(expected);
    });

    it('should ignore every selector with `body$`', function () {
        var rules = 'body { font-size: 16px; } .class-body$ { font-size: 16px; } .simple-class { font-size: 16px; }';
        var expected = processExpected('','body { font-size: 1rem; } .class-body$ { font-size: 16px; } .simple-class { font-size: 1rem; }')
        var options = {
            selectorBlackList: ['body$']
        };
        proccessor.use(pxtorem(options));  var processed = proccessor('',rules);

        expect(processed).toBe(expected);
    });

    it('should only ignore exactly `body`', function () {
        var rules = 'body { font-size: 16px; } .class-body { font-size: 16px; } .simple-class { font-size: 16px; }';
        var expected = processExpected('', 'body { font-size: 16px; } .class-body { font-size: 1rem; } .simple-class { font-size: 1rem; }')
        var options = {
            selectorBlackList: [/^body$/]
        };
        proccessor.use(pxtorem(options));  var processed = proccessor('',rules);

        expect(processed).toBe(expected);
    });
});

describe('replace', function () {
    beforeEach(function (){
        proccessor = new stylis(stylisOptions);
    });
    it('should leave fallback pixel unit with root em value', function () {
        var options = {
            replace: false
        };
        proccessor.use(pxtorem(options));  var processed = proccessor('',basicCSS);
        var expected = processExpected('', '.rule { font-size: 15px; font-size: 0.9375rem }')

        expect(processed).toBe(expected);
    });
});

describe('mediaQuery', function () {
    beforeEach(function (){
        proccessor = new stylis(stylisOptions);
    });

    it('should replace px in media queries', function () {
        var options = {
            mediaQuery: true
        };
        proccessor.use(pxtorem(options));  var processed = proccessor('','@media (min-width: 500px) { .rule { font-size: 16px } }');
        var expected = processExpected('', '@media (min-width: 31.25rem) { .rule { font-size: 1rem } }')

        expect(processed).toBe(expected);
    });
});

describe('minPixelValue', function () {
    it('should not replace values below minPixelValue', function () {
        var options = {
            propWhiteList: [],
            minPixelValue: 2
        };
        var rules = '.rule { border: 1px solid #000; font-size: 16px; margin: 1px 10px; }';
        var expected = processExpected('', '.rule { border: 1px solid #000; font-size: 1rem; margin: 1px 0.625rem; }')
        proccessor.use(pxtorem(options));  var processed = proccessor('',rules);

        expect(processed).toBe(expected);
    });
});

describe('filter-prop-list', function () {
    it('should find "exact" matches from propList', function () {
        var propList = ['font-size', 'margin', '!padding', '*border*', '*', '*y', '!*font*'];
        var expected = 'font-size,margin';
        expect(filterPropList.exact(propList).join()).toBe(expected);
    });

    it('should find "contain" matches from propList and reduce to string', function () {
        var propList = ['font-size', '*margin*', '!padding', '*border*', '*', '*y', '!*font*'];
        var expected = 'margin,border';
        expect(filterPropList.contain(propList).join()).toBe(expected);
    });

    it('should find "start" matches from propList and reduce to string', function () {
        var propList = ['font-size', '*margin*', '!padding', 'border*', '*', '*y', '!*font*'];
        var expected = 'border';
        expect(filterPropList.startWith(propList).join()).toBe(expected);
    });

    it('should find "end" matches from propList and reduce to string', function () {
        var propList = ['font-size', '*margin*', '!padding', 'border*', '*', '*y', '!*font*'];
        var expected = 'y';
        expect(filterPropList.endWith(propList).join()).toBe(expected);
    });

    it('should find "not" matches from propList and reduce to string', function () {
        var propList = ['font-size', '*margin*', '!padding', 'border*', '*', '*y', '!*font*'];
        var expected = 'padding';
        expect(filterPropList.notExact(propList).join()).toBe(expected);
    });

    it('should find "not contain" matches from propList and reduce to string', function () {
        var propList = ['font-size', '*margin*', '!padding', '!border*', '*', '*y', '!*font*'];
        var expected = 'font';
        expect(filterPropList.notContain(propList).join()).toBe(expected);
    });

    it('should find "not start" matches from propList and reduce to string', function () {
        var propList = ['font-size', '*margin*', '!padding', '!border*', '*', '*y', '!*font*'];
        var expected = 'border';
        expect(filterPropList.notStartWith(propList).join()).toBe(expected);
    });

    it('should find "not end" matches from propList and reduce to string', function () {
        var propList = ['font-size', '*margin*', '!padding', '!border*', '*', '!*y', '!*font*'];
        var expected = 'y';
        expect(filterPropList.notEndWith(propList).join()).toBe(expected);
    });
});
