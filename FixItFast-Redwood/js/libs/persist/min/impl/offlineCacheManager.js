/**
 * Copyright (c) 2017, Oracle and/or its affiliates.
 * All rights reserved.
 */

define(["./OfflineCache","./logger"],(function(e,r){"use strict";function t(){this._prefix="offlineCaches-",this._caches={},this._cachesArray=[]}return t.prototype.open=function(t){r.log("Offline Persistence Toolkit OfflineCacheManager: open() with name: "+t);var n=this._caches[t];return n||(n=new e(t,this._prefix+t),this._caches[t]=n,this._cachesArray.push(n)),n},t.prototype.match=function(e,t){r.log("Offline Persistence Toolkit OfflineCacheManager: match() for Request with url: "+e.url);var n=function(r,i){return i===r.length?Promise.resolve():r[i].match(e,t).then((function(e){return e?e.clone():n(r,i+1)}))};return n(this._cachesArray,0)},t.prototype.has=function(e){return r.log("Offline Persistence Toolkit OfflineCacheManager: has() for name: "+e),this._caches[e]?Promise.resolve(!0):Promise.resolve(!1)},t.prototype.delete=function(e){r.log("Offline Persistence Toolkit OfflineCacheManager: delete() for name: "+e);var t=this,n=t._caches[e];return n?n.clear().then((function(){return t._cachesArray.splice(t._cachesArray.indexOf(e),1),delete t._caches[e],!0})):Promise.resolve(!1)},t.prototype.keys=function(){r.log("Offline Persistence Toolkit OfflineCacheManager: keys()");for(var e=[],t=0;t<this._cachesArray.length;t++)e.push(this._cachesArray[t].getName());return Promise.resolve(e)},new t}));