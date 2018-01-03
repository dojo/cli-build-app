/*!
 * 
 * [Dojo](https://dojo.io/)
 * Copyright [JS Foundation](https://js.foundation/) & contributors
 * [New BSD license](https://github.com/dojo/meta/blob/master/LICENSE)
 * All rights reserved
 * 
 */
!function(e,t){"object"==typeof exports&&"object"==typeof module?module.exports=t():"function"==typeof define&&define.amd?define("main",[],t):"object"==typeof exports?exports.main=t():e.main=t()}(this,function(){return dojoWebpackJsonptest_app(["main"],{"./node_modules/@dojo/has/has.js":function(e,t,n){"use strict";(function(e,n){Object.defineProperty(t,"__esModule",{value:!0});t.testCache={},t.testFunctions={};var o={},r="undefined"!=typeof window?window:void 0!==e?e:"undefined"!=typeof self?self:{},i=(r.DojoHasEnvironment||{}).staticFeatures;"DojoHasEnvironment"in r&&delete r.DojoHasEnvironment;var s,c=i?(s=i,"function"==typeof s?i.apply(r):i):{};t.load=function(e,t,n,o){e?t([e],n):n()};t.normalize=function(e,t){var n=e.match(/[\?:]|[^:\?]*/g)||[],o=0,r=function e(t){var r=n[o++];return":"===r?null:"?"===n[o++]?!t&&l(r)?e():(e(!0),e(t)):r}();return r&&t(r)};function u(e){var n=e.toLowerCase();return Boolean(n in c||n in t.testCache||t.testFunctions[n])}t.exists=u;function a(e,n,r){void 0===r&&(r=!1);var i=e.toLowerCase();if(u(i)&&!r&&!(i in c))throw new TypeError('Feature "'+e+'" exists and overwrite not true.');"function"==typeof n?t.testFunctions[i]=n:(s=n)&&s.then?o[e]=n.then(function(n){t.testCache[e]=n,delete o[e]},function(){delete o[e]}):(t.testCache[i]=n,delete t.testFunctions[i]);var s}t.add=a;function l(e){var n,r=e.toLowerCase();if(r in c)n=c[r];else if(t.testFunctions[r])n=t.testCache[r]=t.testFunctions[r].call(null),delete t.testFunctions[r];else{if(!(r in t.testCache)){if(e in o)return!1;throw new TypeError('Attempt to detect unregistered has feature "'+e+'"')}n=t.testCache[r]}return n}t.default=l,a("debug",!0),a("host-browser","undefined"!=typeof document&&"undefined"!=typeof location),a("host-node",function(){if("object"==typeof n&&n.versions&&n.versions.node)return n.versions.node})}).call(t,n("./node_modules/webpack/buildin/global.js"),n("./node_modules/process/browser.js"))},"./node_modules/@dojo/webpack-contrib/promise-loader/index.js?global,src/Foo!./src/Foo.ts":function(e,t,n){e.exports=function(){return new Promise(function(e){n.e("src/Foo").then(function(t){e(n('./node_modules/@dojo/webpack-contrib/static-build-loader/index.js?{"features":{"foo":true,"bar":false}}!./node_modules/umd-compat-loader/index.js?{}!./node_modules/ts-loader/index.js?{"onlyCompileBundledFiles":true,"instance":"dojo"}!./node_modules/@dojo/webpack-contrib/css-module-dts-loader/index.js?type=ts&instanceName=0_dojo!./src/Foo.ts'))}.bind(null,n)).catch(n.oe)})}},"./node_modules/@dojo/webpack-contrib/promise-loader/index.js?global,widgets!./src/Bar.ts":function(e,t,n){e.exports=function(){return new Promise(function(e){n.e("widgets").then(function(t){e(n('./node_modules/@dojo/webpack-contrib/static-build-loader/index.js?{"features":{"foo":true,"bar":false}}!./node_modules/umd-compat-loader/index.js?{}!./node_modules/ts-loader/index.js?{"onlyCompileBundledFiles":true,"instance":"dojo"}!./node_modules/@dojo/webpack-contrib/css-module-dts-loader/index.js?type=ts&instanceName=0_dojo!./src/Bar.ts'))}.bind(null,n)).catch(n.oe)})}},"./node_modules/@dojo/webpack-contrib/promise-loader/index.js?global,widgets!./src/Baz.ts":function(e,t,n){e.exports=function(){return new Promise(function(e){n.e("widgets").then(function(t){e(n('./node_modules/@dojo/webpack-contrib/static-build-loader/index.js?{"features":{"foo":true,"bar":false}}!./node_modules/umd-compat-loader/index.js?{}!./node_modules/ts-loader/index.js?{"onlyCompileBundledFiles":true,"instance":"dojo"}!./node_modules/@dojo/webpack-contrib/css-module-dts-loader/index.js?type=ts&instanceName=0_dojo!./src/Baz.ts'))}.bind(null,n)).catch(n.oe)})}},"./node_modules/process/browser.js":function(e,t){var n,o,r=e.exports={};function i(){throw new Error("setTimeout has not been defined")}function s(){throw new Error("clearTimeout has not been defined")}!function(){try{n="function"==typeof setTimeout?setTimeout:i}catch(e){n=i}try{o="function"==typeof clearTimeout?clearTimeout:s}catch(e){o=s}}();function c(e){if(n===setTimeout)return setTimeout(e,0);if((n===i||!n)&&setTimeout)return n=setTimeout,setTimeout(e,0);try{return n(e,0)}catch(t){try{return n.call(null,e,0)}catch(t){return n.call(this,e,0)}}}var u,a=[],l=!1,d=-1;function f(){l&&u&&(l=!1,u.length?a=u.concat(a):d=-1,a.length&&p())}function p(){if(!l){var e=c(f);l=!0;for(var t=a.length;t;){for(u=a,a=[];++d<t;)u&&u[d].run();d=-1,t=a.length}u=null,l=!1,function(e){if(o===clearTimeout)return clearTimeout(e);if((o===s||!o)&&clearTimeout)return o=clearTimeout,clearTimeout(e);try{o(e)}catch(t){try{return o.call(null,e)}catch(t){return o.call(this,e)}}}(e)}}r.nextTick=function(e){var t=new Array(arguments.length-1);if(arguments.length>1)for(var n=1;n<arguments.length;n++)t[n-1]=arguments[n];a.push(new m(e,t)),1!==a.length||l||c(p)};function m(e,t){this.fun=e,this.array=t}m.prototype.run=function(){this.fun.apply(null,this.array)},r.title="browser",r.browser=!0,r.env={},r.argv=[],r.version="",r.versions={};function h(){}r.on=h,r.addListener=h,r.once=h,r.off=h,r.removeListener=h,r.removeAllListeners=h,r.emit=h,r.prependListener=h,r.prependOnceListener=h,r.listeners=function(e){return[]},r.binding=function(e){throw new Error("process.binding is not supported")},r.cwd=function(){return"/"},r.chdir=function(e){throw new Error("process.chdir is not supported")},r.umask=function(){return 0}},"./node_modules/tslib/tslib.es6.js":function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.__extends=function(e,t){o(e,t);function n(){this.constructor=e}e.prototype=null===t?Object.create(t):(n.prototype=t.prototype,new n)},n.d(t,"__assign",function(){return r}),t.__rest=function(e,t){var n={};for(var o in e)Object.prototype.hasOwnProperty.call(e,o)&&t.indexOf(o)<0&&(n[o]=e[o]);if(null!=e&&"function"==typeof Object.getOwnPropertySymbols)for(var r=0,o=Object.getOwnPropertySymbols(e);r<o.length;r++)t.indexOf(o[r])<0&&(n[o[r]]=e[o[r]]);return n},t.__decorate=function(e,t,n,o){var r,i=arguments.length,s=i<3?t:null===o?o=Object.getOwnPropertyDescriptor(t,n):o;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)s=Reflect.decorate(e,t,n,o);else for(var c=e.length-1;c>=0;c--)(r=e[c])&&(s=(i<3?r(s):i>3?r(t,n,s):r(t,n))||s);return i>3&&s&&Object.defineProperty(t,n,s),s},t.__param=function(e,t){return function(n,o){t(n,o,e)}},t.__metadata=function(e,t){if("object"==typeof Reflect&&"function"==typeof Reflect.metadata)return Reflect.metadata(e,t)},t.__awaiter=function(e,t,n,o){return new(n||(n=Promise))(function(r,i){function s(e){try{u(o.next(e))}catch(e){i(e)}}function c(e){try{u(o.throw(e))}catch(e){i(e)}}function u(e){e.done?r(e.value):new n(function(t){t(e.value)}).then(s,c)}u((o=o.apply(e,t||[])).next())})},t.__generator=function(e,t){var n,o,r,i,s={label:0,sent:function(){if(1&r[0])throw r[1];return r[1]},trys:[],ops:[]};return i={next:c(0),throw:c(1),return:c(2)},"function"==typeof Symbol&&(i[Symbol.iterator]=function(){return this}),i;function c(i){return function(c){return function(i){if(n)throw new TypeError("Generator is already executing.");for(;s;)try{if(n=1,o&&(r=o[2&i[0]?"return":i[0]?"throw":"next"])&&!(r=r.call(o,i[1])).done)return r;switch(o=0,r&&(i=[0,r.value]),i[0]){case 0:case 1:r=i;break;case 4:return s.label++,{value:i[1],done:!1};case 5:s.label++,o=i[1],i=[0];continue;case 7:i=s.ops.pop(),s.trys.pop();continue;default:if(!(r=(r=s.trys).length>0&&r[r.length-1])&&(6===i[0]||2===i[0])){s=0;continue}if(3===i[0]&&(!r||i[1]>r[0]&&i[1]<r[3])){s.label=i[1];break}if(6===i[0]&&s.label<r[1]){s.label=r[1],r=i;break}if(r&&s.label<r[2]){s.label=r[2],s.ops.push(i);break}r[2]&&s.ops.pop(),s.trys.pop();continue}i=t.call(e,s)}catch(e){i=[6,e],o=0}finally{n=r=0}if(5&i[0])throw i[1];return{value:i[0]?i[1]:void 0,done:!0}}([i,c])}}},t.__exportStar=function(e,t){for(var n in e)t.hasOwnProperty(n)||(t[n]=e[n])},t.__values=i,t.__read=s,t.__spread=function(){for(var e=[],t=0;t<arguments.length;t++)e=e.concat(s(arguments[t]));return e},t.__await=c,t.__asyncGenerator=function(e,t,n){if(!Symbol.asyncIterator)throw new TypeError("Symbol.asyncIterator is not defined.");var o,r=n.apply(e,t||[]),i=[];return o={},s("next"),s("throw"),s("return"),o[Symbol.asyncIterator]=function(){return this},o;function s(e){r[e]&&(o[e]=function(t){return new Promise(function(n,o){i.push([e,t,n,o])>1||u(e,t)})})}function u(e,t){try{(n=r[e](t)).value instanceof c?Promise.resolve(n.value.v).then(a,l):d(i[0][2],n)}catch(e){d(i[0][3],e)}var n}function a(e){u("next",e)}function l(e){u("throw",e)}function d(e,t){e(t),i.shift(),i.length&&u(i[0][0],i[0][1])}},t.__asyncDelegator=function(e){var t,n;return t={},o("next"),o("throw",function(e){throw e}),o("return"),t[Symbol.iterator]=function(){return this},t;function o(o,r){e[o]&&(t[o]=function(t){return(n=!n)?{value:c(e[o](t)),done:"return"===o}:r?r(t):t})}},t.__asyncValues=function(e){if(!Symbol.asyncIterator)throw new TypeError("Symbol.asyncIterator is not defined.");var t=e[Symbol.asyncIterator];return t?t.call(e):i(e)},t.__makeTemplateObject=function(e,t){Object.defineProperty?Object.defineProperty(e,"raw",{value:t}):e.raw=t;return e};
/*! *****************************************************************************
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */
var o=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(e,t){e.__proto__=t}||function(e,t){for(var n in t)t.hasOwnProperty(n)&&(e[n]=t[n])};var r=Object.assign||function(e){for(var t,n=1,o=arguments.length;n<o;n++){t=arguments[n];for(var r in t)Object.prototype.hasOwnProperty.call(t,r)&&(e[r]=t[r])}return e};function i(e){var t="function"==typeof Symbol&&e[Symbol.iterator],n=0;return t?t.call(e):{next:function(){return e&&n>=e.length&&(e=void 0),{value:e&&e[n++],done:!e}}}}function s(e,t){var n="function"==typeof Symbol&&e[Symbol.iterator];if(!n)return e;var o,r,i=n.call(e),s=[];try{for(;(void 0===t||t-- >0)&&!(o=i.next()).done;)s.push(o.value)}catch(e){r={error:e}}finally{try{o&&!o.done&&(n=i.return)&&n.call(i)}finally{if(r)throw r.error}}return s}function c(e){return this instanceof c?(this.v=e,this):new c(e)}},"./node_modules/webpack/buildin/global.js":function(e,t){var n;n=function(){return this}();try{n=n||Function("return this")()||(0,eval)("this")}catch(e){"object"==typeof window&&(n=window)}e.exports=n},"./src/App.ts":function(e,t,n){"use strict";var o="object"==typeof e&&"object"==typeof e.exports;Object.defineProperty(t,"__esModule",{value:!0});var r=n("./node_modules/tslib/tslib.es6.js"),i=n("./src/app.m.css"),s=function(){return r.__awaiter(this,void 0,void 0,function(){return r.__generator(this,function(e){switch(e.label){case 0:return[4,!!o&&Promise.resolve().then(function(){return n("./node_modules/@dojo/webpack-contrib/promise-loader/index.js?global,src/Foo!./src/Foo.ts")()})];case 1:return[2,e.sent().default]}})})},c=function(){return r.__awaiter(this,void 0,void 0,function(){return r.__generator(this,function(e){switch(e.label){case 0:return[4,!!o&&Promise.resolve().then(function(){return n("./node_modules/@dojo/webpack-contrib/promise-loader/index.js?global,widgets!./src/Bar.ts")()})];case 1:return[2,e.sent().default]}})})},u=function(){return r.__awaiter(this,void 0,void 0,function(){return r.__generator(this,function(e){switch(e.label){case 0:return[4,!!o&&Promise.resolve().then(function(){return n("./node_modules/@dojo/webpack-contrib/promise-loader/index.js?global,widgets!./src/Baz.ts")()})];case 1:return[2,e.sent().default]}})})};t.default=function(){return r.__awaiter(this,void 0,void 0,function(){var e,t;return r.__generator(this,function(n){switch(n.label){case 0:return console.log(i),[4,c()];case 1:return e=n.sent(),[4,u()];case 2:return t=n.sent(),e(),t(),[2,s()]}})})}},"./src/app.m.css":function(e,t){e.exports={" _key":"app",root:"YxttPEx-"}},"./src/main.css":function(e,t){e.exports={" _key":"main.css",app:"QHEFgSeI"}},"./src/main.ts":function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0});var o=n("./src/App.ts"),r=n("./src/app.m.css");n("./node_modules/@dojo/has/has.js");console.log("foo"),o.default().then(function(e){console.log(e());var t=document.createElement("div");t.classList.add(r.root),document.body.appendChild(t)})},0:function(e,t,n){n("./src/main.css"),e.exports=n("./src/main.ts")}},[0])});
//# sourceMappingURL=main.1d7e829ff81a52e0736b.bundle.js.map