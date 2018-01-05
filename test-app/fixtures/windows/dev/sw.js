var __wpo = {
  "assets": {
    "main": [
      "./main.js",
      "./runtime.js",
      "./src/Foo.js",
      "./widgets.js",
      "./main.css",
      "./manifest.json",
      "./manifest.67922f9d41b46aafda3d4e88ab6f5b6a.json",
      "./"
    ],
    "additional": [],
    "optional": []
  },
  "externals": [],
  "hashesMap": {
    "368a7d5070960e0121c961b43c38475956a58ebe": "./main.js",
    "efe7504dcf70b4274ec1842f58680227a9082c68": "./runtime.js",
    "ae227bead89034445995734e78de7e36c9ce9637": "./src/Foo.js",
    "3e12ab06b71019b4e615b2b1ef5abae644ced724": "./widgets.js",
    "04013a068bcab7241c0bba8158e0b979a911213b": "./main.css",
    "e51e7554246ef0ce16b90cd07a16db927cd93447": "./manifest.json",
    "c62e33fe295582acdf84bb0fdde50967b1b3be71": "./manifest.67922f9d41b46aafda3d4e88ab6f5b6a.json",
    "874cec9173aae47cfe2929995c7849dc684da98a": "./"
  },
  "strategy": "changed",
  "responseStrategy": "cache-first",
  "version": "2018-1-8 09:52:22",
  "name": "webpack-offline",
  "pluginVersion": "4.9.0",
  "relativePaths": true
};

/*!
 * 
 * [Dojo](https://dojo.io/)
 * Copyright [JS Foundation](https://js.foundation/) & contributors
 * [New BSD license](https://github.com/dojo/meta/blob/master/LICENSE)
 * All rights reserved
 * 
 */
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./node_modules/offline-plugin/lib/misc/sw-loader.js?json=%7B%22data_var_name%22%3A%22__wpo%22%2C%22loaders%22%3A%5B%5D%2C%22cacheMaps%22%3A%5B%5D%2C%22navigationPreload%22%3A%22false%22%7D!./node_modules/@dojo/cli-build-app/service-worker.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./node_modules/@dojo/cli-build-app/service-worker.js":
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var toolbox = __webpack_require__("./node_modules/sw-toolbox/lib/sw-toolbox.js");
var routes = [{"method":"get","path":"/","strategy":"fastest"}] || [];
var strategies = {
    cacheFirst: toolbox.cacheFirst,
    cacheOnly: toolbox.cacheOnly,
    fastest: toolbox.fastest,
    networkFirst: toolbox.networkFirst,
    networkOnly: toolbox.networkOnly
};
routes.forEach(function (_a) {
    var method = _a.method, path = _a.path, strategy = _a.strategy, origin = _a.origin;
    var options = {};
    if (origin) {
        options.origin = origin;
    }
    toolbox.router[method](path, strategies[strategy], options);
});
//# sourceMappingURL=service-worker.js.map

/***/ }),

/***/ "./node_modules/isarray/index.js":
/***/ (function(module, exports) {

var toString = {}.toString;

module.exports = Array.isArray || function (arr) {
  return toString.call(arr) == '[object Array]';
};


/***/ }),

/***/ "./node_modules/offline-plugin/lib/misc/sw-loader.js?json=%7B%22data_var_name%22%3A%22__wpo%22%2C%22loaders%22%3A%5B%5D%2C%22cacheMaps%22%3A%5B%5D%2C%22navigationPreload%22%3A%22false%22%7D!./node_modules/@dojo/cli-build-app/service-worker.js":
/***/ (function(module, exports, __webpack_require__) {

"use strict";


(function () {
  var waitUntil = ExtendableEvent.prototype.waitUntil;
  var respondWith = FetchEvent.prototype.respondWith;
  var promisesMap = new WeakMap();

  ExtendableEvent.prototype.waitUntil = function (promise) {
    var extendableEvent = this;
    var promises = promisesMap.get(extendableEvent);

    if (promises) {
      promises.push(Promise.resolve(promise));
      return;
    }

    promises = [Promise.resolve(promise)];
    promisesMap.set(extendableEvent, promises);

    // call original method
    return waitUntil.call(extendableEvent, Promise.resolve().then(function processPromises() {
      var len = promises.length;

      // wait for all to settle
      return Promise.all(promises.map(function (p) {
        return p["catch"](function () {});
      })).then(function () {
        // have new items been added? If so, wait again
        if (promises.length != len) return processPromises();
        // we're done!
        promisesMap["delete"](extendableEvent);
        // reject if one of the promises rejected
        return Promise.all(promises);
      });
    }));
  };

  FetchEvent.prototype.respondWith = function (promise) {
    this.waitUntil(promise);
    return respondWith.call(this, promise);
  };
})();;
        'use strict';

if (typeof DEBUG === 'undefined') {
  var DEBUG = false;
}

function WebpackServiceWorker(params, helpers) {
  var loaders = helpers.loaders;
  var cacheMaps = helpers.cacheMaps;
  // navigationPreload: true, { map: (URL) => URL, test: (URL) => boolean }
  var navigationPreload = helpers.navigationPreload;

  // (update)strategy: changed, all
  var strategy = params.strategy;
  // responseStrategy: cache-first, network-first
  var responseStrategy = params.responseStrategy;

  var assets = params.assets;
  var loadersMap = params.loaders || {};

  var hashesMap = params.hashesMap;
  var externals = params.externals;

  var CACHE_PREFIX = params.name;
  var CACHE_TAG = params.version;
  var CACHE_NAME = CACHE_PREFIX + ':' + CACHE_TAG;

  var PRELOAD_CACHE_NAME = CACHE_PREFIX + '$preload';
  var STORED_DATA_KEY = '__offline_webpack__data';

  mapAssets();

  var allAssets = [].concat(assets.main, assets.additional, assets.optional);

  // Deprecated {
  var navigateFallbackURL = params.navigateFallbackURL;
  var navigateFallbackForRedirects = params.navigateFallbackForRedirects;
  // }

  self.addEventListener('install', function (event) {
    console.log('[SW]:', 'Install event');

    var installing = undefined;

    if (strategy === 'changed') {
      installing = cacheChanged('main');
    } else {
      installing = cacheAssets('main');
    }

    event.waitUntil(installing);
  });

  self.addEventListener('activate', function (event) {
    console.log('[SW]:', 'Activate event');

    var activation = cacheAdditional();

    // Delete all assets which name starts with CACHE_PREFIX and
    // is not current cache (CACHE_NAME)
    activation = activation.then(storeCacheData);
    activation = activation.then(deleteObsolete);
    activation = activation.then(function () {
      if (self.clients && self.clients.claim) {
        return self.clients.claim();
      }
    });

    if (navigationPreload && self.registration.navigationPreload) {
      activation = Promise.all([activation, self.registration.navigationPreload.enable()]);
    }

    event.waitUntil(activation);
  });

  function cacheAdditional() {
    if (!assets.additional.length) {
      return Promise.resolve();
    }

    if (DEBUG) {
      console.log('[SW]:', 'Caching additional');
    }

    var operation = undefined;

    if (strategy === 'changed') {
      operation = cacheChanged('additional');
    } else {
      operation = cacheAssets('additional');
    }

    // Ignore fail of `additional` cache section
    return operation['catch'](function (e) {
      console.error('[SW]:', 'Cache section `additional` failed to load');
    });
  }

  function cacheAssets(section) {
    var batch = assets[section];

    return caches.open(CACHE_NAME).then(function (cache) {
      return addAllNormalized(cache, batch, {
        bust: params.version,
        request: params.prefetchRequest
      });
    }).then(function () {
      logGroup('Cached assets: ' + section, batch);
    })['catch'](function (e) {
      console.error(e);
      throw e;
    });
  }

  function cacheChanged(section) {
    return getLastCache().then(function (args) {
      if (!args) {
        return cacheAssets(section);
      }

      var lastCache = args[0];
      var lastKeys = args[1];
      var lastData = args[2];

      var lastMap = lastData.hashmap;
      var lastVersion = lastData.version;

      if (!lastData.hashmap || lastVersion === params.version) {
        return cacheAssets(section);
      }

      var lastHashedAssets = Object.keys(lastMap).map(function (hash) {
        return lastMap[hash];
      });

      var lastUrls = lastKeys.map(function (req) {
        var url = new URL(req.url);
        url.search = '';
        url.hash = '';

        return url.toString();
      });

      var sectionAssets = assets[section];
      var moved = [];
      var changed = sectionAssets.filter(function (url) {
        if (lastUrls.indexOf(url) === -1 || lastHashedAssets.indexOf(url) === -1) {
          return true;
        }

        return false;
      });

      Object.keys(hashesMap).forEach(function (hash) {
        var asset = hashesMap[hash];

        // Return if not in sectionAssets or in changed or moved array
        if (sectionAssets.indexOf(asset) === -1 || changed.indexOf(asset) !== -1 || moved.indexOf(asset) !== -1) return;

        var lastAsset = lastMap[hash];

        if (lastAsset && lastUrls.indexOf(lastAsset) !== -1) {
          moved.push([lastAsset, asset]);
        } else {
          changed.push(asset);
        }
      });

      logGroup('Changed assets: ' + section, changed);
      logGroup('Moved assets: ' + section, moved);

      var movedResponses = Promise.all(moved.map(function (pair) {
        return lastCache.match(pair[0]).then(function (response) {
          return [pair[1], response];
        });
      }));

      return caches.open(CACHE_NAME).then(function (cache) {
        var move = movedResponses.then(function (responses) {
          return Promise.all(responses.map(function (pair) {
            return cache.put(pair[0], pair[1]);
          }));
        });

        return Promise.all([move, addAllNormalized(cache, changed, {
          bust: params.version,
          request: params.prefetchRequest
        })]);
      });
    });
  }

  function deleteObsolete() {
    return caches.keys().then(function (keys) {
      var all = keys.map(function (key) {
        if (key.indexOf(CACHE_PREFIX) !== 0 || key.indexOf(CACHE_NAME) === 0) return;

        console.log('[SW]:', 'Delete cache:', key);
        return caches['delete'](key);
      });

      return Promise.all(all);
    });
  }

  function getLastCache() {
    return caches.keys().then(function (keys) {
      var index = keys.length;
      var key = undefined;

      while (index--) {
        key = keys[index];

        if (key.indexOf(CACHE_PREFIX) === 0) {
          break;
        }
      }

      if (!key) return;

      var cache = undefined;

      return caches.open(key).then(function (_cache) {
        cache = _cache;
        return _cache.match(new URL(STORED_DATA_KEY, location).toString());
      }).then(function (response) {
        if (!response) return;

        return Promise.all([cache, cache.keys(), response.json()]);
      });
    });
  }

  function storeCacheData() {
    return caches.open(CACHE_NAME).then(function (cache) {
      var data = new Response(JSON.stringify({
        version: params.version,
        hashmap: hashesMap
      }));

      return cache.put(new URL(STORED_DATA_KEY, location).toString(), data);
    });
  }

  self.addEventListener('fetch', function (event) {
    var url = new URL(event.request.url);
    url.hash = '';

    var urlString = url.toString();

    // Not external, so search part of the URL should be stripped,
    // if it's external URL, the search part should be kept
    if (externals.indexOf(urlString) === -1) {
      url.search = '';
      urlString = url.toString();
    }

    // Handle only GET requests
    var isGET = event.request.method === 'GET';
    var assetMatches = allAssets.indexOf(urlString) !== -1;
    var cacheUrl = urlString;

    if (!assetMatches) {
      var cacheRewrite = matchCacheMap(event.request);

      if (cacheRewrite) {
        cacheUrl = cacheRewrite;
        assetMatches = true;
      }
    }

    if (!assetMatches && isGET) {
      // If isn't a cached asset and is a navigation request,
      // perform network request and fallback to navigateFallbackURL if available.
      //
      // Requesting with fetchWithPreload().
      // Preload is used only if navigationPreload is enabled and
      // navigationPreload mapping is not used.
      if (navigateFallbackURL && isNavigateRequest(event.request)) {
        event.respondWith(handleNavigateFallback(fetchWithPreload(event)));

        return;
      }

      if (navigationPreload === true) {
        event.respondWith(fetchWithPreload(event));
        return;
      }

      // Something else, positive, but not `true`
      if (navigationPreload) {
        var preloadedResponse = retrivePreloadedResponse(event);

        if (preloadedResponse) {
          event.respondWith(preloadedResponse);
          return;
        }
      }

      // Logic exists here if no cache match, or no preload
      return;
    }

    if (!assetMatches || !isGET) {
      // Fix for https://twitter.com/wanderview/status/696819243262873600
      if (url.origin !== location.origin && navigator.userAgent.indexOf('Firefox/44.') !== -1) {
        event.respondWith(fetch(event.request));
      }

      // Logic exists here if no cache match
      return;
    }

    // Cache handling/storing/fetching starts here

    var resource = undefined;

    if (responseStrategy === 'network-first') {
      resource = networkFirstResponse(event, urlString, cacheUrl);
    }
    // 'cache-first' otherwise
    // (responseStrategy has been validated before)
    else {
        resource = cacheFirstResponse(event, urlString, cacheUrl);
      }

    if (navigateFallbackURL && isNavigateRequest(event.request)) {
      resource = handleNavigateFallback(resource);
    }

    event.respondWith(resource);
  });

  self.addEventListener('message', function (e) {
    var data = e.data;
    if (!data) return;

    switch (data.action) {
      case 'skipWaiting':
        {
          if (self.skipWaiting) self.skipWaiting();
        }break;
    }
  });

  function cacheFirstResponse(event, urlString, cacheUrl) {
    handleNavigationPreload(event);

    return cachesMatch(cacheUrl, CACHE_NAME).then(function (response) {
      if (response) {
        if (DEBUG) {
          console.log('[SW]:', 'URL [' + cacheUrl + '](' + urlString + ') from cache');
        }

        return response;
      }

      // Load and cache known assets
      var fetching = fetch(event.request).then(function (response) {
        if (!response.ok) {
          if (DEBUG) {
            console.log('[SW]:', 'URL [' + urlString + '] wrong response: [' + response.status + '] ' + response.type);
          }

          return response;
        }

        if (DEBUG) {
          console.log('[SW]:', 'URL [' + urlString + '] from network');
        }

        if (cacheUrl === urlString) {
          (function () {
            var responseClone = response.clone();
            var storing = caches.open(CACHE_NAME).then(function (cache) {
              return cache.put(urlString, responseClone);
            }).then(function () {
              console.log('[SW]:', 'Cache asset: ' + urlString);
            });

            event.waitUntil(storing);
          })();
        }

        return response;
      });

      return fetching;
    });
  }

  function networkFirstResponse(event, urlString, cacheUrl) {
    return fetchWithPreload(event).then(function (response) {
      if (response.ok) {
        if (DEBUG) {
          console.log('[SW]:', 'URL [' + urlString + '] from network');
        }

        return response;
      }

      // Throw to reach the code in the catch below
      throw new Error('Response is not ok');
    })
    // This needs to be in a catch() and not just in the then() above
    // cause if your network is down, the fetch() will throw
    ['catch'](function () {
      if (DEBUG) {
        console.log('[SW]:', 'URL [' + urlString + '] from cache if possible');
      }

      return cachesMatch(cacheUrl, CACHE_NAME);
    });
  }

  function handleNavigationPreload(event) {
    if (navigationPreload && typeof navigationPreload.map === 'function' &&
    // Use request.mode === 'navigate' instead of isNavigateRequest
    // because everything what supports navigationPreload supports
    // 'navigate' request.mode
    event.preloadResponse && event.request.mode === 'navigate') {
      var mapped = navigationPreload.map(new URL(event.request.url), event.request);

      if (mapped) {
        storePreloadedResponse(mapped, event);
      }
    }
  }

  // Temporary in-memory store for faster access
  var navigationPreloadStore = new Map();

  function storePreloadedResponse(_url, event) {
    var url = new URL(_url, location);
    var preloadResponsePromise = event.preloadResponse;

    navigationPreloadStore.set(preloadResponsePromise, {
      url: url,
      response: preloadResponsePromise
    });

    var isSamePreload = function isSamePreload() {
      return navigationPreloadStore.has(preloadResponsePromise);
    };

    var storing = preloadResponsePromise.then(function (res) {
      // Return if preload isn't enabled or hasn't happened
      if (!res) return;

      // If navigationPreloadStore already consumed
      // or navigationPreloadStore already contains another preload,
      // then do not store anything and return
      if (!isSamePreload()) {
        return;
      }

      var clone = res.clone();

      // Storing the preload response for later consume (hasn't yet been consumed)
      return caches.open(PRELOAD_CACHE_NAME).then(function (cache) {
        if (!isSamePreload()) return;

        return cache.put(url, clone).then(function () {
          if (!isSamePreload()) {
            return caches.open(PRELOAD_CACHE_NAME).then(function (cache) {
              return cache['delete'](url);
            });
          }
        });
      });
    });

    event.waitUntil(storing);
  }

  function retriveInMemoryPreloadedResponse(url) {
    if (!navigationPreloadStore) {
      return;
    }

    var foundResponse = undefined;
    var foundKey = undefined;

    navigationPreloadStore.forEach(function (store, key) {
      if (store.url.href === url.href) {
        foundResponse = store.response;
        foundKey = key;
      }
    });

    if (foundResponse) {
      navigationPreloadStore['delete'](foundKey);
      return foundResponse;
    }
  }

  function retrivePreloadedResponse(event) {
    var url = new URL(event.request.url);

    if (self.registration.navigationPreload && navigationPreload && navigationPreload.test && navigationPreload.test(url, event.request)) {} else {
      return;
    }

    var fromMemory = retriveInMemoryPreloadedResponse(url);
    var request = event.request;

    if (fromMemory) {
      event.waitUntil(caches.open(PRELOAD_CACHE_NAME).then(function (cache) {
        return cache['delete'](request);
      }));

      return fromMemory;
    }

    return cachesMatch(request, PRELOAD_CACHE_NAME).then(function (response) {
      if (response) {
        event.waitUntil(caches.open(PRELOAD_CACHE_NAME).then(function (cache) {
          return cache['delete'](request);
        }));
      }

      return response || fetch(event.request);
    });
  }

  function handleNavigateFallback(fetching) {
    return fetching['catch'](function () {}).then(function (response) {
      var isOk = response && response.ok;
      var isRedirect = response && response.type === 'opaqueredirect';

      if (isOk || isRedirect && !navigateFallbackForRedirects) {
        return response;
      }

      if (DEBUG) {
        console.log('[SW]:', 'Loading navigation fallback [' + navigateFallbackURL + '] from cache');
      }

      return cachesMatch(navigateFallbackURL, CACHE_NAME);
    });
  }

  function mapAssets() {
    Object.keys(assets).forEach(function (key) {
      assets[key] = assets[key].map(function (path) {
        var url = new URL(path, location);

        url.hash = '';

        if (externals.indexOf(path) === -1) {
          url.search = '';
        }

        return url.toString();
      });
    });

    Object.keys(loadersMap).forEach(function (key) {
      loadersMap[key] = loadersMap[key].map(function (path) {
        var url = new URL(path, location);

        url.hash = '';

        if (externals.indexOf(path) === -1) {
          url.search = '';
        }

        return url.toString();
      });
    });

    hashesMap = Object.keys(hashesMap).reduce(function (result, hash) {
      var url = new URL(hashesMap[hash], location);
      url.search = '';
      url.hash = '';

      result[hash] = url.toString();
      return result;
    }, {});

    externals = externals.map(function (path) {
      var url = new URL(path, location);
      url.hash = '';

      return url.toString();
    });
  }

  function addAllNormalized(cache, requests, options) {
    var allowLoaders = options.allowLoaders !== false;
    var bustValue = options && options.bust;
    var requestInit = options.request || {
      credentials: 'omit',
      mode: 'cors'
    };

    return Promise.all(requests.map(function (request) {
      if (bustValue) {
        request = applyCacheBust(request, bustValue);
      }

      return fetch(request, requestInit).then(fixRedirectedResponse);
    })).then(function (responses) {
      if (responses.some(function (response) {
        return !response.ok;
      })) {
        return Promise.reject(new Error('Wrong response status'));
      }

      var extracted = [];
      var addAll = responses.map(function (response, i) {
        if (allowLoaders) {
          extracted.push(extractAssetsWithLoaders(requests[i], response));
        }

        return cache.put(requests[i], response);
      });

      if (extracted.length) {
        (function () {
          var newOptions = copyObject(options);
          newOptions.allowLoaders = false;

          var waitAll = addAll;

          addAll = Promise.all(extracted).then(function (all) {
            var extractedRequests = [].concat.apply([], all);

            if (requests.length) {
              waitAll = waitAll.concat(addAllNormalized(cache, extractedRequests, newOptions));
            }

            return Promise.all(waitAll);
          });
        })();
      } else {
        addAll = Promise.all(addAll);
      }

      return addAll;
    });
  }

  function extractAssetsWithLoaders(request, response) {
    var all = Object.keys(loadersMap).map(function (key) {
      var loader = loadersMap[key];

      if (loader.indexOf(request) !== -1 && loaders[key]) {
        return loaders[key](response.clone());
      }
    }).filter(function (a) {
      return !!a;
    });

    return Promise.all(all).then(function (all) {
      return [].concat.apply([], all);
    });
  }

  function matchCacheMap(request) {
    var urlString = request.url;
    var url = new URL(urlString);

    var requestType = undefined;

    if (isNavigateRequest(request)) {
      requestType = 'navigate';
    } else if (url.origin === location.origin) {
      requestType = 'same-origin';
    } else {
      requestType = 'cross-origin';
    }

    for (var i = 0; i < cacheMaps.length; i++) {
      var map = cacheMaps[i];

      if (!map) continue;
      if (map.requestTypes && map.requestTypes.indexOf(requestType) === -1) {
        continue;
      }

      var newString = undefined;

      if (typeof map.match === 'function') {
        newString = map.match(url, request);
      } else {
        newString = urlString.replace(map.match, map.to);
      }

      if (newString && newString !== urlString) {
        return newString;
      }
    }
  }

  function fetchWithPreload(event) {
    if (!event.preloadResponse || navigationPreload !== true) {
      return fetch(event.request);
    }

    return event.preloadResponse.then(function (response) {
      return response || fetch(event.request);
    });
  }
}

function cachesMatch(request, cacheName) {
  return caches.match(request, {
    cacheName: cacheName
  }).then(function (response) {
    if (isNotRedirectedResponse()) {
      return response;
    }

    // Fix already cached redirected responses
    return fixRedirectedResponse(response).then(function (fixedResponse) {
      return caches.open(cacheName).then(function (cache) {
        return cache.put(request, fixedResponse);
      }).then(function () {
        return fixedResponse;
      });
    });
  })
  // Return void if error happened (cache not found)
  ['catch'](function () {});
}

function applyCacheBust(asset, key) {
  var hasQuery = asset.indexOf('?') !== -1;
  return asset + (hasQuery ? '&' : '?') + '__uncache=' + encodeURIComponent(key);
}

function isNavigateRequest(request) {
  return request.mode === 'navigate' || request.headers.get('Upgrade-Insecure-Requests') || (request.headers.get('Accept') || '').indexOf('text/html') !== -1;
}

function isNotRedirectedResponse(response) {
  return !response || !response.redirected || !response.ok || response.type === 'opaqueredirect';
}

// Based on https://github.com/GoogleChrome/sw-precache/pull/241/files#diff-3ee9060dc7a312c6a822cac63a8c630bR85
function fixRedirectedResponse(response) {
  if (isNotRedirectedResponse(response)) {
    return Promise.resolve(response);
  }

  var body = 'body' in response ? Promise.resolve(response.body) : response.blob();

  return body.then(function (data) {
    return new Response(data, {
      headers: response.headers,
      status: response.status
    });
  });
}

function copyObject(original) {
  return Object.keys(original).reduce(function (result, key) {
    result[key] = original[key];
    return result;
  }, {});
}

function logGroup(title, assets) {
  console.groupCollapsed('[SW]:', title);

  assets.forEach(function (asset) {
    console.log('Asset:', asset);
  });

  console.groupEnd();
}
        WebpackServiceWorker(__wpo, {
loaders: {},
cacheMaps: [],
navigationPreload: false,
});
        module.exports = __webpack_require__("./node_modules/@dojo/cli-build-app/service-worker.js")
      

/***/ }),

/***/ "./node_modules/path-to-regexp/index.js":
/***/ (function(module, exports, __webpack_require__) {

var isarray = __webpack_require__("./node_modules/isarray/index.js")

/**
 * Expose `pathToRegexp`.
 */
module.exports = pathToRegexp
module.exports.parse = parse
module.exports.compile = compile
module.exports.tokensToFunction = tokensToFunction
module.exports.tokensToRegExp = tokensToRegExp

/**
 * The main path matching regexp utility.
 *
 * @type {RegExp}
 */
var PATH_REGEXP = new RegExp([
  // Match escaped characters that would otherwise appear in future matches.
  // This allows the user to escape special characters that won't transform.
  '(\\\\.)',
  // Match Express-style parameters and un-named parameters with a prefix
  // and optional suffixes. Matches appear as:
  //
  // "/:test(\\d+)?" => ["/", "test", "\d+", undefined, "?", undefined]
  // "/route(\\d+)"  => [undefined, undefined, undefined, "\d+", undefined, undefined]
  // "/*"            => ["/", undefined, undefined, undefined, undefined, "*"]
  '([\\/.])?(?:(?:\\:(\\w+)(?:\\(((?:\\\\.|[^\\\\()])+)\\))?|\\(((?:\\\\.|[^\\\\()])+)\\))([+*?])?|(\\*))'
].join('|'), 'g')

/**
 * Parse a string for the raw tokens.
 *
 * @param  {string}  str
 * @param  {Object=} options
 * @return {!Array}
 */
function parse (str, options) {
  var tokens = []
  var key = 0
  var index = 0
  var path = ''
  var defaultDelimiter = options && options.delimiter || '/'
  var res

  while ((res = PATH_REGEXP.exec(str)) != null) {
    var m = res[0]
    var escaped = res[1]
    var offset = res.index
    path += str.slice(index, offset)
    index = offset + m.length

    // Ignore already escaped sequences.
    if (escaped) {
      path += escaped[1]
      continue
    }

    var next = str[index]
    var prefix = res[2]
    var name = res[3]
    var capture = res[4]
    var group = res[5]
    var modifier = res[6]
    var asterisk = res[7]

    // Push the current path onto the tokens.
    if (path) {
      tokens.push(path)
      path = ''
    }

    var partial = prefix != null && next != null && next !== prefix
    var repeat = modifier === '+' || modifier === '*'
    var optional = modifier === '?' || modifier === '*'
    var delimiter = res[2] || defaultDelimiter
    var pattern = capture || group

    tokens.push({
      name: name || key++,
      prefix: prefix || '',
      delimiter: delimiter,
      optional: optional,
      repeat: repeat,
      partial: partial,
      asterisk: !!asterisk,
      pattern: pattern ? escapeGroup(pattern) : (asterisk ? '.*' : '[^' + escapeString(delimiter) + ']+?')
    })
  }

  // Match any characters still remaining.
  if (index < str.length) {
    path += str.substr(index)
  }

  // If the path exists, push it onto the end.
  if (path) {
    tokens.push(path)
  }

  return tokens
}

/**
 * Compile a string to a template function for the path.
 *
 * @param  {string}             str
 * @param  {Object=}            options
 * @return {!function(Object=, Object=)}
 */
function compile (str, options) {
  return tokensToFunction(parse(str, options))
}

/**
 * Prettier encoding of URI path segments.
 *
 * @param  {string}
 * @return {string}
 */
function encodeURIComponentPretty (str) {
  return encodeURI(str).replace(/[\/?#]/g, function (c) {
    return '%' + c.charCodeAt(0).toString(16).toUpperCase()
  })
}

/**
 * Encode the asterisk parameter. Similar to `pretty`, but allows slashes.
 *
 * @param  {string}
 * @return {string}
 */
function encodeAsterisk (str) {
  return encodeURI(str).replace(/[?#]/g, function (c) {
    return '%' + c.charCodeAt(0).toString(16).toUpperCase()
  })
}

/**
 * Expose a method for transforming tokens into the path function.
 */
function tokensToFunction (tokens) {
  // Compile all the tokens into regexps.
  var matches = new Array(tokens.length)

  // Compile all the patterns before compilation.
  for (var i = 0; i < tokens.length; i++) {
    if (typeof tokens[i] === 'object') {
      matches[i] = new RegExp('^(?:' + tokens[i].pattern + ')$')
    }
  }

  return function (obj, opts) {
    var path = ''
    var data = obj || {}
    var options = opts || {}
    var encode = options.pretty ? encodeURIComponentPretty : encodeURIComponent

    for (var i = 0; i < tokens.length; i++) {
      var token = tokens[i]

      if (typeof token === 'string') {
        path += token

        continue
      }

      var value = data[token.name]
      var segment

      if (value == null) {
        if (token.optional) {
          // Prepend partial segment prefixes.
          if (token.partial) {
            path += token.prefix
          }

          continue
        } else {
          throw new TypeError('Expected "' + token.name + '" to be defined')
        }
      }

      if (isarray(value)) {
        if (!token.repeat) {
          throw new TypeError('Expected "' + token.name + '" to not repeat, but received `' + JSON.stringify(value) + '`')
        }

        if (value.length === 0) {
          if (token.optional) {
            continue
          } else {
            throw new TypeError('Expected "' + token.name + '" to not be empty')
          }
        }

        for (var j = 0; j < value.length; j++) {
          segment = encode(value[j])

          if (!matches[i].test(segment)) {
            throw new TypeError('Expected all "' + token.name + '" to match "' + token.pattern + '", but received `' + JSON.stringify(segment) + '`')
          }

          path += (j === 0 ? token.prefix : token.delimiter) + segment
        }

        continue
      }

      segment = token.asterisk ? encodeAsterisk(value) : encode(value)

      if (!matches[i].test(segment)) {
        throw new TypeError('Expected "' + token.name + '" to match "' + token.pattern + '", but received "' + segment + '"')
      }

      path += token.prefix + segment
    }

    return path
  }
}

/**
 * Escape a regular expression string.
 *
 * @param  {string} str
 * @return {string}
 */
function escapeString (str) {
  return str.replace(/([.+*?=^!:${}()[\]|\/\\])/g, '\\$1')
}

/**
 * Escape the capturing group by escaping special characters and meaning.
 *
 * @param  {string} group
 * @return {string}
 */
function escapeGroup (group) {
  return group.replace(/([=!:$\/()])/g, '\\$1')
}

/**
 * Attach the keys as a property of the regexp.
 *
 * @param  {!RegExp} re
 * @param  {Array}   keys
 * @return {!RegExp}
 */
function attachKeys (re, keys) {
  re.keys = keys
  return re
}

/**
 * Get the flags for a regexp from the options.
 *
 * @param  {Object} options
 * @return {string}
 */
function flags (options) {
  return options.sensitive ? '' : 'i'
}

/**
 * Pull out keys from a regexp.
 *
 * @param  {!RegExp} path
 * @param  {!Array}  keys
 * @return {!RegExp}
 */
function regexpToRegexp (path, keys) {
  // Use a negative lookahead to match only capturing groups.
  var groups = path.source.match(/\((?!\?)/g)

  if (groups) {
    for (var i = 0; i < groups.length; i++) {
      keys.push({
        name: i,
        prefix: null,
        delimiter: null,
        optional: false,
        repeat: false,
        partial: false,
        asterisk: false,
        pattern: null
      })
    }
  }

  return attachKeys(path, keys)
}

/**
 * Transform an array into a regexp.
 *
 * @param  {!Array}  path
 * @param  {Array}   keys
 * @param  {!Object} options
 * @return {!RegExp}
 */
function arrayToRegexp (path, keys, options) {
  var parts = []

  for (var i = 0; i < path.length; i++) {
    parts.push(pathToRegexp(path[i], keys, options).source)
  }

  var regexp = new RegExp('(?:' + parts.join('|') + ')', flags(options))

  return attachKeys(regexp, keys)
}

/**
 * Create a path regexp from string input.
 *
 * @param  {string}  path
 * @param  {!Array}  keys
 * @param  {!Object} options
 * @return {!RegExp}
 */
function stringToRegexp (path, keys, options) {
  return tokensToRegExp(parse(path, options), keys, options)
}

/**
 * Expose a function for taking tokens and returning a RegExp.
 *
 * @param  {!Array}          tokens
 * @param  {(Array|Object)=} keys
 * @param  {Object=}         options
 * @return {!RegExp}
 */
function tokensToRegExp (tokens, keys, options) {
  if (!isarray(keys)) {
    options = /** @type {!Object} */ (keys || options)
    keys = []
  }

  options = options || {}

  var strict = options.strict
  var end = options.end !== false
  var route = ''

  // Iterate over the tokens and create our regexp string.
  for (var i = 0; i < tokens.length; i++) {
    var token = tokens[i]

    if (typeof token === 'string') {
      route += escapeString(token)
    } else {
      var prefix = escapeString(token.prefix)
      var capture = '(?:' + token.pattern + ')'

      keys.push(token)

      if (token.repeat) {
        capture += '(?:' + prefix + capture + ')*'
      }

      if (token.optional) {
        if (!token.partial) {
          capture = '(?:' + prefix + '(' + capture + '))?'
        } else {
          capture = prefix + '(' + capture + ')?'
        }
      } else {
        capture = prefix + '(' + capture + ')'
      }

      route += capture
    }
  }

  var delimiter = escapeString(options.delimiter || '/')
  var endsWithDelimiter = route.slice(-delimiter.length) === delimiter

  // In non-strict mode we allow a slash at the end of match. If the path to
  // match already ends with a slash, we remove it for consistency. The slash
  // is valid at the end of a path match, not in the middle. This is important
  // in non-ending mode, where "/test/" shouldn't match "/test//route".
  if (!strict) {
    route = (endsWithDelimiter ? route.slice(0, -delimiter.length) : route) + '(?:' + delimiter + '(?=$))?'
  }

  if (end) {
    route += '$'
  } else {
    // In non-ending mode, we need the capturing groups to match as much as
    // possible by using a positive lookahead to the end or next path segment.
    route += strict && endsWithDelimiter ? '' : '(?=' + delimiter + '|$)'
  }

  return attachKeys(new RegExp('^' + route, flags(options)), keys)
}

/**
 * Normalize the given path string, returning a regular expression.
 *
 * An empty array can be passed in for the keys, which will hold the
 * placeholder key descriptions. For example, using `/user/:id`, `keys` will
 * contain `[{ name: 'id', delimiter: '/', optional: false, repeat: false }]`.
 *
 * @param  {(string|RegExp|Array)} path
 * @param  {(Array|Object)=}       keys
 * @param  {Object=}               options
 * @return {!RegExp}
 */
function pathToRegexp (path, keys, options) {
  if (!isarray(keys)) {
    options = /** @type {!Object} */ (keys || options)
    keys = []
  }

  options = options || {}

  if (path instanceof RegExp) {
    return regexpToRegexp(path, /** @type {!Array} */ (keys))
  }

  if (isarray(path)) {
    return arrayToRegexp(/** @type {!Array} */ (path), /** @type {!Array} */ (keys), options)
  }

  return stringToRegexp(/** @type {string} */ (path), /** @type {!Array} */ (keys), options)
}


/***/ }),

/***/ "./node_modules/serviceworker-cache-polyfill/index.js":
/***/ (function(module, exports) {

/**
 * Copyright 2015 Google Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

(function() {
  var nativeAddAll = Cache.prototype.addAll;
  var userAgent = navigator.userAgent.match(/(Firefox|Chrome)\/(\d+\.)/);

  // Has nice behavior of `var` which everyone hates
  if (userAgent) {
    var agent = userAgent[1];
    var version = parseInt(userAgent[2]);
  }

  if (
    nativeAddAll && (!userAgent ||
      (agent === 'Firefox' && version >= 46) ||
      (agent === 'Chrome'  && version >= 50)
    )
  ) {
    return;
  }

  Cache.prototype.addAll = function addAll(requests) {
    var cache = this;

    // Since DOMExceptions are not constructable:
    function NetworkError(message) {
      this.name = 'NetworkError';
      this.code = 19;
      this.message = message;
    }

    NetworkError.prototype = Object.create(Error.prototype);

    return Promise.resolve().then(function() {
      if (arguments.length < 1) throw new TypeError();

      // Simulate sequence<(Request or USVString)> binding:
      var sequence = [];

      requests = requests.map(function(request) {
        if (request instanceof Request) {
          return request;
        }
        else {
          return String(request); // may throw TypeError
        }
      });

      return Promise.all(
        requests.map(function(request) {
          if (typeof request === 'string') {
            request = new Request(request);
          }

          var scheme = new URL(request.url).protocol;

          if (scheme !== 'http:' && scheme !== 'https:') {
            throw new NetworkError("Invalid scheme");
          }

          return fetch(request.clone());
        })
      );
    }).then(function(responses) {
      // If some of the responses has not OK-eish status,
      // then whole operation should reject
      if (responses.some(function(response) {
        return !response.ok;
      })) {
        throw new NetworkError('Incorrect response status');
      }

      // TODO: check that requests don't overwrite one another
      // (don't think this is possible to polyfill due to opaque responses)
      return Promise.all(
        responses.map(function(response, i) {
          return cache.put(requests[i], response);
        })
      );
    }).then(function() {
      return undefined;
    });
  };

  Cache.prototype.add = function add(request) {
    return this.addAll([request]);
  };
}());

/***/ }),

/***/ "./node_modules/sw-toolbox/lib/helpers.js":
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/*
  Copyright 2014 Google Inc. All Rights Reserved.

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
*/


var globalOptions = __webpack_require__("./node_modules/sw-toolbox/lib/options.js");
var idbCacheExpiration = __webpack_require__("./node_modules/sw-toolbox/lib/idb-cache-expiration.js");

function debug(message, options) {
  options = options || {};
  var flag = options.debug || globalOptions.debug;
  if (flag) {
    console.log('[sw-toolbox] ' + message);
  }
}

function openCache(options) {
  var cacheName;
  if (options && options.cache) {
    cacheName = options.cache.name;
  }
  cacheName = cacheName || globalOptions.cache.name;

  return caches.open(cacheName);
}

function fetchAndCache(request, options) {
  options = options || {};
  var successResponses = options.successResponses ||
      globalOptions.successResponses;

  return fetch(request.clone()).then(function(response) {
    // Only cache GET requests with successful responses.
    // Since this is not part of the promise chain, it will be done
    // asynchronously and will not block the response from being returned to the
    // page.
    if (request.method === 'GET' && successResponses.test(response.status)) {
      openCache(options).then(function(cache) {
        cache.put(request, response).then(function() {
          // If any of the options are provided in options.cache then use them.
          // Do not fallback to the global options for any that are missing
          // unless they are all missing.
          var cacheOptions = options.cache || globalOptions.cache;

          // Only run the cache expiration logic if at least one of the maximums
          // is set, and if we have a name for the cache that the options are
          // being applied to.
          if ((cacheOptions.maxEntries || cacheOptions.maxAgeSeconds) &&
              cacheOptions.name) {
            queueCacheExpiration(request, cache, cacheOptions);
          }
        });
      });
    }

    return response.clone();
  });
}

var cleanupQueue;
function queueCacheExpiration(request, cache, cacheOptions) {
  var cleanup = cleanupCache.bind(null, request, cache, cacheOptions);

  if (cleanupQueue) {
    cleanupQueue = cleanupQueue.then(cleanup);
  } else {
    cleanupQueue = cleanup();
  }
}

function cleanupCache(request, cache, cacheOptions) {
  var requestUrl = request.url;
  var maxAgeSeconds = cacheOptions.maxAgeSeconds;
  var maxEntries = cacheOptions.maxEntries;
  var cacheName = cacheOptions.name;

  var now = Date.now();
  debug('Updating LRU order for ' + requestUrl + '. Max entries is ' +
    maxEntries + ', max age is ' + maxAgeSeconds);

  return idbCacheExpiration.getDb(cacheName).then(function(db) {
    return idbCacheExpiration.setTimestampForUrl(db, requestUrl, now);
  }).then(function(db) {
    return idbCacheExpiration.expireEntries(db, maxEntries, maxAgeSeconds, now);
  }).then(function(urlsToDelete) {
    debug('Successfully updated IDB.');

    var deletionPromises = urlsToDelete.map(function(urlToDelete) {
      return cache.delete(urlToDelete);
    });

    return Promise.all(deletionPromises).then(function() {
      debug('Done with cache cleanup.');
    });
  }).catch(function(error) {
    debug(error);
  });
}

function renameCache(source, destination, options) {
  debug('Renaming cache: [' + source + '] to [' + destination + ']', options);
  return caches.delete(destination).then(function() {
    return Promise.all([
      caches.open(source),
      caches.open(destination)
    ]).then(function(results) {
      var sourceCache = results[0];
      var destCache = results[1];

      return sourceCache.keys().then(function(requests) {
        return Promise.all(requests.map(function(request) {
          return sourceCache.match(request).then(function(response) {
            return destCache.put(request, response);
          });
        }));
      }).then(function() {
        return caches.delete(source);
      });
    });
  });
}

function cache(url, options) {
  return openCache(options).then(function(cache) {
    return cache.add(url);
  });
}

function uncache(url, options) {
  return openCache(options).then(function(cache) {
    return cache.delete(url);
  });
}

function precache(items) {
  if (!(items instanceof Promise)) {
    validatePrecacheInput(items);
  }

  globalOptions.preCacheItems = globalOptions.preCacheItems.concat(items);
}

function validatePrecacheInput(items) {
  var isValid = Array.isArray(items);
  if (isValid) {
    items.forEach(function(item) {
      if (!(typeof item === 'string' || (item instanceof Request))) {
        isValid = false;
      }
    });
  }

  if (!isValid) {
    throw new TypeError('The precache method expects either an array of ' +
    'strings and/or Requests or a Promise that resolves to an array of ' +
    'strings and/or Requests.');
  }

  return items;
}

function isResponseFresh(response, maxAgeSeconds, now) {
  // If we don't have a response, then it's not fresh.
  if (!response) {
    return false;
  }

  // Only bother checking the age of the response if maxAgeSeconds is set.
  if (maxAgeSeconds) {
    var dateHeader = response.headers.get('date');
    // If there's no Date: header, then fall through and return true.
    if (dateHeader) {
      var parsedDate = new Date(dateHeader);
      // If the Date: header was invalid for some reason, parsedDate.getTime()
      // will return NaN, and the comparison will always be false. That means
      // that an invalid date will be treated as if the response is fresh.
      if ((parsedDate.getTime() + (maxAgeSeconds * 1000)) < now) {
        // Only return false if all the other conditions are met.
        return false;
      }
    }
  }

  // Fall back on returning true by default, to match the previous behavior in
  // which we never bothered checking to see whether the response was fresh.
  return true;
}

module.exports = {
  debug: debug,
  fetchAndCache: fetchAndCache,
  openCache: openCache,
  renameCache: renameCache,
  cache: cache,
  uncache: uncache,
  precache: precache,
  validatePrecacheInput: validatePrecacheInput,
  isResponseFresh: isResponseFresh
};


/***/ }),

/***/ "./node_modules/sw-toolbox/lib/idb-cache-expiration.js":
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/*
 Copyright 2015 Google Inc. All Rights Reserved.

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
*/


var DB_PREFIX = 'sw-toolbox-';
var DB_VERSION = 1;
var STORE_NAME = 'store';
var URL_PROPERTY = 'url';
var TIMESTAMP_PROPERTY = 'timestamp';
var cacheNameToDbPromise = {};

function openDb(cacheName) {
  return new Promise(function(resolve, reject) {
    var request = indexedDB.open(DB_PREFIX + cacheName, DB_VERSION);

    request.onupgradeneeded = function() {
      var objectStore = request.result.createObjectStore(STORE_NAME,
          {keyPath: URL_PROPERTY});
      objectStore.createIndex(TIMESTAMP_PROPERTY, TIMESTAMP_PROPERTY,
          {unique: false});
    };

    request.onsuccess = function() {
      resolve(request.result);
    };

    request.onerror = function() {
      reject(request.error);
    };
  });
}

function getDb(cacheName) {
  if (!(cacheName in cacheNameToDbPromise)) {
    cacheNameToDbPromise[cacheName] = openDb(cacheName);
  }

  return cacheNameToDbPromise[cacheName];
}

function setTimestampForUrl(db, url, now) {
  return new Promise(function(resolve, reject) {
    var transaction = db.transaction(STORE_NAME, 'readwrite');
    var objectStore = transaction.objectStore(STORE_NAME);
    objectStore.put({url: url, timestamp: now});

    transaction.oncomplete = function() {
      resolve(db);
    };

    transaction.onabort = function() {
      reject(transaction.error);
    };
  });
}

function expireOldEntries(db, maxAgeSeconds, now) {
  // Bail out early by resolving with an empty array if we're not using
  // maxAgeSeconds.
  if (!maxAgeSeconds) {
    return Promise.resolve([]);
  }

  return new Promise(function(resolve, reject) {
    var maxAgeMillis = maxAgeSeconds * 1000;
    var urls = [];

    var transaction = db.transaction(STORE_NAME, 'readwrite');
    var objectStore = transaction.objectStore(STORE_NAME);
    var index = objectStore.index(TIMESTAMP_PROPERTY);

    index.openCursor().onsuccess = function(cursorEvent) {
      var cursor = cursorEvent.target.result;
      if (cursor) {
        if (now - maxAgeMillis > cursor.value[TIMESTAMP_PROPERTY]) {
          var url = cursor.value[URL_PROPERTY];
          urls.push(url);
          objectStore.delete(url);
          cursor.continue();
        }
      }
    };

    transaction.oncomplete = function() {
      resolve(urls);
    };

    transaction.onabort = reject;
  });
}

function expireExtraEntries(db, maxEntries) {
  // Bail out early by resolving with an empty array if we're not using
  // maxEntries.
  if (!maxEntries) {
    return Promise.resolve([]);
  }

  return new Promise(function(resolve, reject) {
    var urls = [];

    var transaction = db.transaction(STORE_NAME, 'readwrite');
    var objectStore = transaction.objectStore(STORE_NAME);
    var index = objectStore.index(TIMESTAMP_PROPERTY);

    var countRequest = index.count();
    index.count().onsuccess = function() {
      var initialCount = countRequest.result;

      if (initialCount > maxEntries) {
        index.openCursor().onsuccess = function(cursorEvent) {
          var cursor = cursorEvent.target.result;
          if (cursor) {
            var url = cursor.value[URL_PROPERTY];
            urls.push(url);
            objectStore.delete(url);
            if (initialCount - urls.length > maxEntries) {
              cursor.continue();
            }
          }
        };
      }
    };

    transaction.oncomplete = function() {
      resolve(urls);
    };

    transaction.onabort = reject;
  });
}

function expireEntries(db, maxEntries, maxAgeSeconds, now) {
  return expireOldEntries(db, maxAgeSeconds, now).then(function(oldUrls) {
    return expireExtraEntries(db, maxEntries).then(function(extraUrls) {
      return oldUrls.concat(extraUrls);
    });
  });
}

module.exports = {
  getDb: getDb,
  setTimestampForUrl: setTimestampForUrl,
  expireEntries: expireEntries
};


/***/ }),

/***/ "./node_modules/sw-toolbox/lib/listeners.js":
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/*
  Copyright 2014 Google Inc. All Rights Reserved.

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
*/


// For cache.addAll.
__webpack_require__("./node_modules/serviceworker-cache-polyfill/index.js");

var helpers = __webpack_require__("./node_modules/sw-toolbox/lib/helpers.js");
var router = __webpack_require__("./node_modules/sw-toolbox/lib/router.js");
var options = __webpack_require__("./node_modules/sw-toolbox/lib/options.js");

// Event listeners

function fetchListener(event) {
  var handler = router.match(event.request);

  if (handler) {
    event.respondWith(handler(event.request));
  } else if (router.default &&
    event.request.method === 'GET' &&
    // Ensure that chrome-extension:// requests don't trigger the default route.
    event.request.url.indexOf('http') === 0) {
    event.respondWith(router.default(event.request));
  }
}

function activateListener(event) {
  helpers.debug('activate event fired');
  var inactiveCache = options.cache.name + '$$$inactive$$$';
  event.waitUntil(helpers.renameCache(inactiveCache, options.cache.name));
}

function flatten(items) {
  return items.reduce(function(a, b) {
    return a.concat(b);
  }, []);
}

function installListener(event) {
  var inactiveCache = options.cache.name + '$$$inactive$$$';
  helpers.debug('install event fired');
  helpers.debug('creating cache [' + inactiveCache + ']');
  event.waitUntil(
    helpers.openCache({cache: {name: inactiveCache}})
    .then(function(cache) {
      return Promise.all(options.preCacheItems)
      .then(flatten)
      .then(helpers.validatePrecacheInput)
      .then(function(preCacheItems) {
        helpers.debug('preCache list: ' +
              (preCacheItems.join(', ') || '(none)'));
        return cache.addAll(preCacheItems);
      });
    })
  );
}

module.exports = {
  fetchListener: fetchListener,
  activateListener: activateListener,
  installListener: installListener
};


/***/ }),

/***/ "./node_modules/sw-toolbox/lib/options.js":
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/*
	Copyright 2015 Google Inc. All Rights Reserved.

	Licensed under the Apache License, Version 2.0 (the "License");
	you may not use this file except in compliance with the License.
	You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

	Unless required by applicable law or agreed to in writing, software
	distributed under the License is distributed on an "AS IS" BASIS,
	WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	See the License for the specific language governing permissions and
	limitations under the License.
*/


// TODO: This is necessary to handle different implementations in the wild
// The spec defines self.registration, but it was not implemented in Chrome 40.
var scope;
if (self.registration) {
  scope = self.registration.scope;
} else {
  scope = self.scope || new URL('./', self.location).href;
}

module.exports = {
  cache: {
    name: '$$$toolbox-cache$$$' + scope + '$$$',
    maxAgeSeconds: null,
    maxEntries: null
  },
  debug: false,
  networkTimeoutSeconds: null,
  preCacheItems: [],
  // A regular expression to apply to HTTP response codes. Codes that match
  // will be considered successes, while others will not, and will not be
  // cached.
  successResponses: /^0|([123]\d\d)|(40[14567])|410$/
};


/***/ }),

/***/ "./node_modules/sw-toolbox/lib/route.js":
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/*
  Copyright 2014 Google Inc. All Rights Reserved.

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
*/


// TODO: Use self.registration.scope instead of self.location
var url = new URL('./', self.location);
var basePath = url.pathname;
var pathRegexp = __webpack_require__("./node_modules/path-to-regexp/index.js");

var Route = function(method, path, handler, options) {
  if (path instanceof RegExp) {
    this.fullUrlRegExp = path;
  } else {
    // The URL() constructor can't parse express-style routes as they are not
    // valid urls. This means we have to manually manipulate relative urls into
    // absolute ones. This check is extremely naive but implementing a tweaked
    // version of the full algorithm seems like overkill
    // (https://url.spec.whatwg.org/#concept-basic-url-parser)
    if (path.indexOf('/') !== 0) {
      path = basePath + path;
    }

    this.keys = [];
    this.regexp = pathRegexp(path, this.keys);
  }

  this.method = method;
  this.options = options;
  this.handler = handler;
};

Route.prototype.makeHandler = function(url) {
  var values;
  if (this.regexp) {
    var match = this.regexp.exec(url);
    values = {};
    this.keys.forEach(function(key, index) {
      values[key.name] = match[index + 1];
    });
  }

  return function(request) {
    return this.handler(request, values, this.options);
  }.bind(this);
};

module.exports = Route;


/***/ }),

/***/ "./node_modules/sw-toolbox/lib/router.js":
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/*
  Copyright 2014 Google Inc. All Rights Reserved.

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
*/


var Route = __webpack_require__("./node_modules/sw-toolbox/lib/route.js");
var helpers = __webpack_require__("./node_modules/sw-toolbox/lib/helpers.js");

function regexEscape(s) {
  return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
}

var keyMatch = function(map, string) {
  // This would be better written as a for..of loop, but that would break the
  // minifyify process in the build.
  var entriesIterator = map.entries();
  var item = entriesIterator.next();
  var matches = [];
  while (!item.done) {
    var pattern = new RegExp(item.value[0]);
    if (pattern.test(string)) {
      matches.push(item.value[1]);
    }
    item = entriesIterator.next();
  }
  return matches;
};

var Router = function() {
  this.routes = new Map();
  // Create the dummy origin for RegExp-based routes
  this.routes.set(RegExp, new Map());
  this.default = null;
};

['get', 'post', 'put', 'delete', 'head', 'any'].forEach(function(method) {
  Router.prototype[method] = function(path, handler, options) {
    return this.add(method, path, handler, options);
  };
});

Router.prototype.add = function(method, path, handler, options) {
  options = options || {};
  var origin;

  if (path instanceof RegExp) {
    // We need a unique key to use in the Map to distinguish RegExp paths
    // from Express-style paths + origins. Since we can use any object as the
    // key in a Map, let's use the RegExp constructor!
    origin = RegExp;
  } else {
    origin = options.origin || self.location.origin;
    if (origin instanceof RegExp) {
      origin = origin.source;
    } else {
      origin = regexEscape(origin);
    }
  }

  method = method.toLowerCase();

  var route = new Route(method, path, handler, options);

  if (!this.routes.has(origin)) {
    this.routes.set(origin, new Map());
  }

  var methodMap = this.routes.get(origin);
  if (!methodMap.has(method)) {
    methodMap.set(method, new Map());
  }

  var routeMap = methodMap.get(method);
  var regExp = route.regexp || route.fullUrlRegExp;

  if (routeMap.has(regExp.source)) {
    helpers.debug('"' + path + '" resolves to same regex as existing route.');
  }

  routeMap.set(regExp.source, route);
};

Router.prototype.matchMethod = function(method, url) {
  var urlObject = new URL(url);
  var origin = urlObject.origin;
  var path = urlObject.pathname;

  // We want to first check to see if there's a match against any
  // "Express-style" routes (string for the path, RegExp for the origin).
  // Checking for Express-style matches first maintains the legacy behavior.
  // If there's no match, we next check for a match against any RegExp routes,
  // where the RegExp in question matches the full URL (both origin and path).
  return this._match(method, keyMatch(this.routes, origin), path) ||
    this._match(method, [this.routes.get(RegExp)], url);
};

Router.prototype._match = function(method, methodMaps, pathOrUrl) {
  if (methodMaps.length === 0) {
    return null;
  }

  for (var i = 0; i < methodMaps.length; i++) {
    var methodMap = methodMaps[i];
    var routeMap = methodMap && methodMap.get(method.toLowerCase());
    if (routeMap) {
      var routes = keyMatch(routeMap, pathOrUrl);
      if (routes.length > 0) {
        return routes[0].makeHandler(pathOrUrl);
      }
    }
  }

  return null;
};

Router.prototype.match = function(request) {
  return this.matchMethod(request.method, request.url) ||
      this.matchMethod('any', request.url);
};

module.exports = new Router();


/***/ }),

/***/ "./node_modules/sw-toolbox/lib/strategies/cacheFirst.js":
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/*
	Copyright 2014 Google Inc. All Rights Reserved.

	Licensed under the Apache License, Version 2.0 (the "License");
	you may not use this file except in compliance with the License.
	You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

	Unless required by applicable law or agreed to in writing, software
	distributed under the License is distributed on an "AS IS" BASIS,
	WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	See the License for the specific language governing permissions and
	limitations under the License.
*/

var globalOptions = __webpack_require__("./node_modules/sw-toolbox/lib/options.js");
var helpers = __webpack_require__("./node_modules/sw-toolbox/lib/helpers.js");

function cacheFirst(request, values, options) {
  options = options || {};
  helpers.debug('Strategy: cache first [' + request.url + ']', options);
  return helpers.openCache(options).then(function(cache) {
    return cache.match(request).then(function(response) {
      var cacheOptions = options.cache || globalOptions.cache;
      var now = Date.now();
      if (helpers.isResponseFresh(response, cacheOptions.maxAgeSeconds, now)) {
        return response;
      }

      return helpers.fetchAndCache(request, options);
    });
  });
}

module.exports = cacheFirst;


/***/ }),

/***/ "./node_modules/sw-toolbox/lib/strategies/cacheOnly.js":
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/*
	Copyright 2014 Google Inc. All Rights Reserved.

	Licensed under the Apache License, Version 2.0 (the "License");
	you may not use this file except in compliance with the License.
	You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

	Unless required by applicable law or agreed to in writing, software
	distributed under the License is distributed on an "AS IS" BASIS,
	WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	See the License for the specific language governing permissions and
	limitations under the License.
*/

var globalOptions = __webpack_require__("./node_modules/sw-toolbox/lib/options.js");
var helpers = __webpack_require__("./node_modules/sw-toolbox/lib/helpers.js");

function cacheOnly(request, values, options) {
  options = options || {};
  helpers.debug('Strategy: cache only [' + request.url + ']', options);
  return helpers.openCache(options).then(function(cache) {
    return cache.match(request).then(function(response) {
      var cacheOptions = options.cache || globalOptions.cache;
      var now = Date.now();
      if (helpers.isResponseFresh(response, cacheOptions.maxAgeSeconds, now)) {
        return response;
      }

      return undefined;
    });
  });
}

module.exports = cacheOnly;


/***/ }),

/***/ "./node_modules/sw-toolbox/lib/strategies/fastest.js":
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/*
  Copyright 2014 Google Inc. All Rights Reserved.

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
*/

var helpers = __webpack_require__("./node_modules/sw-toolbox/lib/helpers.js");
var cacheOnly = __webpack_require__("./node_modules/sw-toolbox/lib/strategies/cacheOnly.js");

function fastest(request, values, options) {
  helpers.debug('Strategy: fastest [' + request.url + ']', options);

  return new Promise(function(resolve, reject) {
    var rejected = false;
    var reasons = [];

    var maybeReject = function(reason) {
      reasons.push(reason.toString());
      if (rejected) {
        reject(new Error('Both cache and network failed: "' +
            reasons.join('", "') + '"'));
      } else {
        rejected = true;
      }
    };

    var maybeResolve = function(result) {
      if (result instanceof Response) {
        resolve(result);
      } else {
        maybeReject('No result returned');
      }
    };

    helpers.fetchAndCache(request.clone(), options)
      .then(maybeResolve, maybeReject);

    cacheOnly(request, values, options)
      .then(maybeResolve, maybeReject);
  });
}

module.exports = fastest;


/***/ }),

/***/ "./node_modules/sw-toolbox/lib/strategies/index.js":
/***/ (function(module, exports, __webpack_require__) {

/*
	Copyright 2014 Google Inc. All Rights Reserved.

	Licensed under the Apache License, Version 2.0 (the "License");
	you may not use this file except in compliance with the License.
	You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

	Unless required by applicable law or agreed to in writing, software
	distributed under the License is distributed on an "AS IS" BASIS,
	WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	See the License for the specific language governing permissions and
	limitations under the License.
*/
module.exports = {
  networkOnly: __webpack_require__("./node_modules/sw-toolbox/lib/strategies/networkOnly.js"),
  networkFirst: __webpack_require__("./node_modules/sw-toolbox/lib/strategies/networkFirst.js"),
  cacheOnly: __webpack_require__("./node_modules/sw-toolbox/lib/strategies/cacheOnly.js"),
  cacheFirst: __webpack_require__("./node_modules/sw-toolbox/lib/strategies/cacheFirst.js"),
  fastest: __webpack_require__("./node_modules/sw-toolbox/lib/strategies/fastest.js")
};


/***/ }),

/***/ "./node_modules/sw-toolbox/lib/strategies/networkFirst.js":
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/*
 Copyright 2015 Google Inc. All Rights Reserved.

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
*/

var globalOptions = __webpack_require__("./node_modules/sw-toolbox/lib/options.js");
var helpers = __webpack_require__("./node_modules/sw-toolbox/lib/helpers.js");

function networkFirst(request, values, options) {
  options = options || {};
  var successResponses = options.successResponses ||
      globalOptions.successResponses;
  // This will bypass options.networkTimeout if it's set to a false-y value like
  // 0, but that's the sane thing to do anyway.
  var networkTimeoutSeconds = options.networkTimeoutSeconds ||
      globalOptions.networkTimeoutSeconds;
  helpers.debug('Strategy: network first [' + request.url + ']', options);

  return helpers.openCache(options).then(function(cache) {
    var timeoutId;
    var promises = [];
    var originalResponse;

    if (networkTimeoutSeconds) {
      var cacheWhenTimedOutPromise = new Promise(function(resolve) {
        timeoutId = setTimeout(function() {
          cache.match(request).then(function(response) {
            var cacheOptions = options.cache || globalOptions.cache;
            // Only resolve this promise if there's a valid response in the
            // cache. This ensures that we won't time out a network request
            // unless there's a cached entry to fallback on, which is arguably
            // the preferable behavior.
            var now = Date.now();
            var maxAgeSeconds = cacheOptions.maxAgeSeconds;
            if (helpers.isResponseFresh(response, maxAgeSeconds, now)) {
              resolve(response);
            }
          });
        }, networkTimeoutSeconds * 1000);
      });
      promises.push(cacheWhenTimedOutPromise);
    }

    var networkPromise = helpers.fetchAndCache(request, options)
      .then(function(response) {
        // We've got a response, so clear the network timeout if there is one.
        if (timeoutId) {
          clearTimeout(timeoutId);
        }

        if (successResponses.test(response.status)) {
          return response;
        }

        helpers.debug('Response was an HTTP error: ' + response.statusText,
            options);
        originalResponse = response;
        throw new Error('Bad response');
      }).catch(function(error) {
        helpers.debug('Network or response error, fallback to cache [' +
            request.url + ']', options);
        return cache.match(request).then(function(response) {
          // If there's a match in the cache, resolve with that.
          if (response) {
            return response;
          }

          // If we have a Response object from the previous fetch, then resolve
          // with that, even though it corresponds to an error status code.
          if (originalResponse) {
            return originalResponse;
          }

          // If we don't have a Response object from the previous fetch, likely
          // due to a network failure, then reject with the failure error.
          throw error;
        });
      });

    promises.push(networkPromise);

    return Promise.race(promises);
  });
}

module.exports = networkFirst;


/***/ }),

/***/ "./node_modules/sw-toolbox/lib/strategies/networkOnly.js":
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/*
	Copyright 2014 Google Inc. All Rights Reserved.

	Licensed under the Apache License, Version 2.0 (the "License");
	you may not use this file except in compliance with the License.
	You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

	Unless required by applicable law or agreed to in writing, software
	distributed under the License is distributed on an "AS IS" BASIS,
	WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	See the License for the specific language governing permissions and
	limitations under the License.
*/

var helpers = __webpack_require__("./node_modules/sw-toolbox/lib/helpers.js");

function networkOnly(request, values, options) {
  helpers.debug('Strategy: network only [' + request.url + ']', options);
  return fetch(request);
}

module.exports = networkOnly;


/***/ }),

/***/ "./node_modules/sw-toolbox/lib/sw-toolbox.js":
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/*
  Copyright 2014 Google Inc. All Rights Reserved.

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
*/


// This is the entrypoint for the sw-toolbox bundle. All code with
// side effects (e.g. adding event listeners) should be in this file.

var options = __webpack_require__("./node_modules/sw-toolbox/lib/options.js");
var router = __webpack_require__("./node_modules/sw-toolbox/lib/router.js");
var helpers = __webpack_require__("./node_modules/sw-toolbox/lib/helpers.js");
var strategies = __webpack_require__("./node_modules/sw-toolbox/lib/strategies/index.js");
var listeners = __webpack_require__("./node_modules/sw-toolbox/lib/listeners.js");

helpers.debug('Service Worker Toolbox is loading');

// Set up listeners.

self.addEventListener('install', listeners.installListener);
self.addEventListener('activate', listeners.activateListener);
self.addEventListener('fetch', listeners.fetchListener);

module.exports = {
  networkOnly: strategies.networkOnly,
  networkFirst: strategies.networkFirst,
  cacheOnly: strategies.cacheOnly,
  cacheFirst: strategies.cacheFirst,
  fastest: strategies.fastest,
  router: router,
  options: options,
  cache: helpers.cache,
  uncache: helpers.uncache,
  precache: helpers.precache
};


/***/ })

/******/ });