/*!
 * 
 * [Dojo](https://dojo.io/)
 * Copyright [JS Foundation](https://js.foundation/) & contributors
 * [New BSD license](https://github.com/dojo/meta/blob/master/LICENSE)
 * All rights reserved
 * 
 */
(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define("unit", [], factory);
	else if(typeof exports === 'object')
		exports["unit"] = factory();
	else
		root["unit"] = factory();
})(this, function() {
return dojoWebpackJsonptest_app(["unit"],{

/***/ "./tests/unit/main.ts":
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var _a = intern.getInterface('bdd'), describe = _a.describe, it = _a.it;
var assert = intern.getPlugin('chai').assert;
var App_1 = __webpack_require__("./src/App.ts");
describe('functional test', function () {
    it('my functional test', function () {
        return App_1.default().then(function (foo) {
            assert.strictEqual(foo(), 'foo');
        });
    });
});


/***/ }),

/***/ 0:
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__("./tests/unit/main.ts");


/***/ })

},[0]);
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay91bml2ZXJzYWxNb2R1bGVEZWZpbml0aW9uIiwid2VicGFjazovLy8uL3Rlc3RzL3VuaXQvbWFpbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7OztBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLENBQUM7QUFDRCxPOzs7Ozs7OztBQ1ZNLG1DQUE2QyxFQUEzQyxzQkFBUSxFQUFFLFVBQUU7QUFDWiw0Q0FBTTtBQUNkO0FBRUEsUUFBUSxDQUFDLGlCQUFpQixFQUFFO0lBQzNCLEVBQUUsQ0FBQyxvQkFBb0IsRUFBRTtRQUN4QixPQUFPLGFBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxVQUFDLEdBQUc7WUFDckIsTUFBTSxDQUFDLFdBQVcsQ0FBQyxHQUFHLEVBQUUsRUFBRSxLQUFLLENBQUM7UUFDakMsQ0FBQyxDQUFDO0lBQ0gsQ0FBQyxDQUFDO0FBQ0gsQ0FBQyxDQUFDIiwiZmlsZSI6InVuaXQuanMiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gd2VicGFja1VuaXZlcnNhbE1vZHVsZURlZmluaXRpb24ocm9vdCwgZmFjdG9yeSkge1xuXHRpZih0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcgJiYgdHlwZW9mIG1vZHVsZSA9PT0gJ29iamVjdCcpXG5cdFx0bW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KCk7XG5cdGVsc2UgaWYodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKVxuXHRcdGRlZmluZShcInVuaXRcIiwgW10sIGZhY3RvcnkpO1xuXHRlbHNlIGlmKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0Jylcblx0XHRleHBvcnRzW1widW5pdFwiXSA9IGZhY3RvcnkoKTtcblx0ZWxzZVxuXHRcdHJvb3RbXCJ1bml0XCJdID0gZmFjdG9yeSgpO1xufSkodGhpcywgZnVuY3Rpb24oKSB7XG5yZXR1cm4gXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIHdlYnBhY2svdW5pdmVyc2FsTW9kdWxlRGVmaW5pdGlvbiIsImNvbnN0IHsgZGVzY3JpYmUsIGl0IH0gPSBpbnRlcm4uZ2V0SW50ZXJmYWNlKCdiZGQnKTtcbmNvbnN0IHsgYXNzZXJ0IH0gPSBpbnRlcm4uZ2V0UGx1Z2luKCdjaGFpJyk7XG5pbXBvcnQgQXBwIGZyb20gJy4uLy4uL3NyYy9BcHAnO1xuXG5kZXNjcmliZSgnZnVuY3Rpb25hbCB0ZXN0JywgKCkgPT4ge1xuXHRpdCgnbXkgZnVuY3Rpb25hbCB0ZXN0JywgKCkgPT4ge1xuXHRcdHJldHVybiBBcHAoKS50aGVuKChmb28pID0+IHtcblx0XHRcdGFzc2VydC5zdHJpY3RFcXVhbChmb28oKSwgJ2ZvbycpO1xuXHRcdH0pO1xuXHR9KTtcbn0pO1xuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vbm9kZV9tb2R1bGVzL0Bkb2pvL3dlYnBhY2stY29udHJpYi9jc3MtbW9kdWxlLWR0cy1sb2FkZXI/dHlwZT10cyZpbnN0YW5jZU5hbWU9MF9kb2pvIS4vdGVzdHMvdW5pdC9tYWluLnRzIl0sInNvdXJjZVJvb3QiOiIifQ==