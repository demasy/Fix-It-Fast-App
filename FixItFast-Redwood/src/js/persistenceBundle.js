/**
 * Copyright (c) 2017, Oracle and/or its affiliates.
 * All rights reserved.
 */

define('persist/impl/logger',[],(function(){"use strict";function e(){Object.defineProperty(this,"LEVEL_NONE",{value:0,enumerable:!0}),Object.defineProperty(this,"LEVEL_ERROR",{value:1,enumerable:!0}),Object.defineProperty(this,"LEVEL_WARN",{value:2,enumerable:!0}),Object.defineProperty(this,"LEVEL_INFO",{value:3,enumerable:!0}),Object.defineProperty(this,"LEVEL_LOG",{value:4,enumerable:!0}),Object.defineProperty(this,"_METHOD_ERROR",{value:"error"}),Object.defineProperty(this,"_METHOD_WARN",{value:"warn"}),Object.defineProperty(this,"_METHOD_INFO",{value:"info"}),Object.defineProperty(this,"_METHOD_LOG",{value:"log"}),Object.defineProperty(this,"_defaultOptions",{value:{level:this.LEVEL_ERROR,writer:null}}),Object.defineProperty(this,"_options",{value:this._defaultOptions,writable:!0})}function t(e,i,o,n){var r=e;if(!(r.option("level")<i)){var s=function(e){var t=e,i=null;return t.option("writer")?i=t.option("writer"):"undefined"!=typeof window&&void 0!==window.console?i=window.console:"undefined"!=typeof console&&(i=console),i}(r);if(null!=s){if(1==n.length&&n[0]instanceof Function){var p=n[0]();n=[p]}s[o]&&s[o].apply?s[o].apply(s,n):s[o]&&(s[o]=Function.prototype.bind.call(s[o],s),t(r,i,o,n))}}}return e.prototype.error=function(e){t(this,this.LEVEL_ERROR,this._METHOD_ERROR,arguments)},e.prototype.info=function(e){t(this,this.LEVEL_INFO,this._METHOD_INFO,arguments)},e.prototype.warn=function(e){t(this,this.LEVEL_WARN,this._METHOD_WARN,arguments)},e.prototype.log=function(e){t(this,this.LEVEL_LOG,this._METHOD_LOG,arguments)},e.prototype.option=function(e,t){var i,o={};if(0==arguments.length){for(i in this._options)this._options.hasOwnProperty(i)&&(o[i]=this._options[i]);return o}if("string"==typeof e&&void 0===t)return void 0===this._options[e]?null:this._options[e];if("string"==typeof e)this._options[e]=t;else{var n=e;for(i in n)n.hasOwnProperty(i)&&this.option(i,n[i])}},new e}));
/**
 * Copyright (c) 2017, Oracle and/or its affiliates.
 * All rights reserved.
 */

define('persist/persistenceUtils',["./impl/logger"],(function(e){"use strict";function t(e){return e.headers.has("x-oracle-jscpt-cache-expiration-date")}function r(e){var t=e.get("Content-Type");return!(!t||!t.match(/.*text\/.*/)&&!t.match(/.*application\/.*json.*/))}function n(t,r){e.log("Offline Persistence Toolkit persistenceUtils: requestToJSON()"),r&&r._noClone||(t=t.clone());var n={};return a(t,n,["body","headers","signal"]),n.headers=o(t.headers),s(t,n)}function a(e,t,r){for(var n in e)"function"!=typeof e[n]&&0!==n.indexOf("_")&&-1===r.indexOf(n)&&(t[n]=e[n])}function o(t){var r={};if(t.entries){var n,a,o,s=t.entries();do{(n=s.next()).value&&(a=n.value[0],o=n.value[1],r[a]=o)}while(!n.done)}else t.forEach&&t.forEach((function(e,t){r[t]=e}));return function(t){var r=t.date;r||(e.log("Offline Persistence Toolkit persistenceUtils: Setting HTTP date header since it's null or not exposed"),r=(new Date).toUTCString(),t.date=r)}(r),r}function s(t,n){return n.body={},t instanceof Request&&((a=t.headers.get("Content-Type"))&&-1!==a.indexOf("multipart/"))?function(t,r){if(e.log("Offline Persistence Toolkit persistenceUtils: Copying multipart payload"),"function"==typeof t.formData)return t.formData().then((function(e){var t,n,a,o,s={},i=e.entries();do{(n=(t=i.next()).value)&&(a=n[0],o=n[1],s[a]=o)}while(!t.done);return r.body.formData=s,r}));var n=t.headers.get("Content-Type");return t.text().then((function(e){for(var t=c(e,n),a={},o=0;o<t.length;o++)a[t[o].headers.name]=t[o].data;return r.body.formData=a,r}))}(t,n):t instanceof Request||r(t.headers)?t.text().then((function(e){return n.body.text=e,n})):t instanceof Request||"function"!=typeof t.arrayBuffer?Promise.reject(new Error({message:"payload body type is not supported"})):t.arrayBuffer().then((function(e){return e.byteLength>0&&(n.body.arrayBuffer=e),n}));var a}function i(t,r){e.log("Offline Persistence Toolkit persistenceUtils: responseToJSON()"),r&&r._noClone||(t=t.clone());var n={};return a(t,n,["body","headers"]),n.headers=o(t.headers),r&&r.excludeBody?Promise.resolve(n):s(t,n)}function l(t){if(e.log("Offline Persistence Toolkit persistenceUtils: requestFromJSON()"),!t)return Promise.resolve();var r={};a(t,r,["headers","body","signal"]);var n=function(e,t){var r=!1,n=e.body;if(n.text&&n.text.length>0)t.body=n.text;else if(n.arrayBuffer)t.body=n.arrayBuffer;else if(n.formData){r=!0;var a=new FormData,o=n.formData;Object.keys(o).forEach((function(e){a.append(e,o[e])})),t.body=a}return r}(t,r);return r.headers=u(t,n),Promise.resolve(new Request(t.url,r))}function u(e,t){var r=new Headers;return Object.keys(e.headers).forEach((function(n){("content-type"!==n||!t&&"content-type"===n)&&r.append(n,e.headers[n])})),r}function f(t){e.log("Offline Persistence Toolkit persistenceUtils: responseFromJSON()");var r={};return a(t,r,["headers","body"]),r.headers=u(t,!1),Promise.resolve(function(e,t){var r,n=e.body;return n&&n.text?r=new Response(n.text,t):n&&n.arrayBuffer?(t.responseType="blob",r=new Response(n.arrayBuffer,t)):n&&n.blob?(t.responseType="blob",r=new Response(n.blob,t)):r=new Response(null,t),r}(t,r))}function c(t,r){e.log("Offline Persistence Toolkit persistenceUtils: parseMultipartFormData()");var n=r.match(/boundary=(?:"([^"]+)"|([^;]+))/i);if(!n)throw new Error("not a valid multipart form data value.");var a,o=function(e){for(var t={},r={},n=e.split("\r\n"),a=0;a<n.length;a++){var o=n[a];if(0!==o.length){var s=o.split(";");if(1===s.length&&0===s[0].indexOf("Content-Type"))t.contentType=s[0].split(":")[1].trim();else for(var i=0;i<s.length;i++)if(-1!==s[i].indexOf("=")){var l=s[i].split("=");r[l[0].trim()]=l[1].substring(1,l[1].length-1)}}}return t.headers=r,t},s=function(e,t){var r=e.split("\r\n");return t&&t.indexOf("image")>=0?i(r[0],t):r[0]},i=function(e,t){var r=null;try{r=atob(e)}catch(e){return null}for(var n=new ArrayBuffer(r.length),a=new Uint8Array(n),o=0;o<r.length;o++)a[o]=r.charCodeAt(o);return new Blob([n],{type:t})},l=n[1]||n[2];if("string"==typeof t)a=t;else{var u=new Uint8Array(t);a=String.fromCharCode.apply(null,u)}for(var f=a.split(new RegExp(l)),c=[],d=1;d<f.length-1;d++){var p={},y=f[d].split("\r\n\r\n"),h=y[0],v=y[1],g=o(h);p.headers=g.headers,p.data=s(v,g.contentType),c.push(p)}return c}function d(e){if(e){var t={};return Object.keys(e).forEach((function(r){if(r.startsWith("value.")){var n=e[r];n instanceof Object?(t.op=Object.keys(n)[0],t.value=n[t.op]):(t.op="$eq",t.value=n),t.attribute=r.substr(6,r.length)}else{var a=r;"$and"!=a&&"$or"!=a||(t.op=a,t.value=[],e[a].forEach((function(e,r){t.value[r]=d(e)})))}})),t}return null}function p(e){if(e){var t={},r=e.op;return"$and"==r||"$or"==r?(t[r]=[],e.value.forEach((function(e,n){t[r][n]=p(e)}))):(t["value."+e.attribute]={},t["value."+e.attribute][e.op]=e.value),t}return null}return{requestToJSON:n,requestFromJSON:l,responseToJSON:i,responseFromJSON:f,setResponsePayload:function(t,r){return e.log("Offline Persistence Toolkit persistenceUtils: setResponsePayload()"),i(t).then((function(e){var t=e.body;return t.arrayBuffer=null,t.blob=null,t.text=null,r instanceof ArrayBuffer?t.arrayBuffer=r:r instanceof Blob?t.blob=r:t.text=JSON.stringify(r),f(e)}))},parseMultipartFormData:c,isCachedResponse:t,isGeneratedEtagResponse:function(e){return e.headers.has("x-oracle-jscpt-etag-generated")},_isTextPayload:r,buildEndpointKey:function(t){e.log("Offline Persistence Toolkit persistenceUtils: buildEndpointKey() for Request with url: "+t.url);var r={url:t.url,id:Math.random().toString(36).replace(/[^a-z]+/g,"")};return JSON.stringify(r)},_cloneRequest:function(e){return n(e,{_noClone:!0}).then((function(e){return l(e).then((function(e){return e}))}))},_cloneResponse:function(e,t){return t=t||{},i(e,{_noClone:!0}).then((function(e){return f(e).then((function(e){return null!=t.url&&t.url.length>0&&null==e.headers.get("x-oracle-jscpt-response-url")&&e.headers.set("x-oracle-jscpt-response-url",t.url),e}))}))},_derivePayloadType:function(e,n){var a=n.headers.get("Content-Type"),o=e.responseType;return r(n.headers)?"text":t(n)||"blob"===o?"blob":a&&-1!==a.indexOf("image/")||"arraybuffer"===o?"arraybuffer":a&&-1!==a.indexOf("multipart/form-data")?"multipart":"text"},_mapData:function(e,t,r){var n=e||[],a=t||[];if(r){n=[],a=[];var o,s=null!=e?e.length:t.length;for(o=0;o<s;o++){var i=null!=e?{key:e[o]}:{key:null},l=null!=t?{metadata:i,data:t[o]}:{metadata:i,data:null},u=r.mapFields(l);n[o]=u.metadata.key,a[o]=u.data}}return{keys:n,data:a}},_unmapData:function(e,t,r){var n=e||[],a=t||[];if(r){n=[],a=[];var o,s=null!=e?e.length:t.length;for(o=0;o<s;o++){var i=null!=e?{key:e[o]}:{key:null},l=null!=t?{metadata:i,data:t[o]}:{metadata:i,data:null},u=r.unmapFields(l);n[o]=u.metadata.key,a[o]=u.data}}return{keys:n,data:a}},_mapFindQuery:function(e,t,r){if(e&&t){var n=d(e.selector);n&&(e.selector=p(t.mapFilterCriterion(n)))}return r&&r.length&&(e.sort=r),e},isReplayRequest:function(e){return e.headers.has("x-oracle-jscpt-sync-replay")},markReplayRequest:function(e,t){t?e.headers.set("x-oracle-jscpt-sync-replay",""):e.headers.delete("x-oracle-jscpt-sync-replay")}}}));
/**
 * Copyright (c) 2017, Oracle and/or its affiliates.
 * All rights reserved.
 */

define('persist/impl/PersistenceXMLHttpRequest',["../persistenceUtils","./logger"],(function(e,t){"use strict";function r(e){var t=this;Object.defineProperty(this,"_eventListeners",{value:[],writable:!0}),Object.defineProperty(this,"_browserXMLHttpRequest",{value:e}),Object.defineProperty(this,"_method",{value:null,writable:!0}),Object.defineProperty(this,"onabort",{value:null,enumerable:!0,writable:!0}),Object.defineProperty(this,"onerror",{value:null,enumerable:!0,writable:!0}),Object.defineProperty(this,"onload",{value:null,enumerable:!0,writable:!0}),Object.defineProperty(this,"onloadend",{value:null,enumerable:!0,writable:!0}),Object.defineProperty(this,"onloadstart",{value:null,enumerable:!0,writable:!0}),Object.defineProperty(this,"onprogress",{value:null,enumerable:!0,writable:!0}),Object.defineProperty(this,"onreadystatechange",{value:null,enumerable:!0,writable:!0}),Object.defineProperty(this,"ontimeout",{value:null,enumerable:!0,writable:!0}),Object.defineProperty(this,"_password",{value:null,writable:!0}),Object.defineProperty(this,"_readyState",{value:0,writable:!0}),Object.defineProperty(this,"readyState",{enumerable:!0,get:function(){return t._readyState}}),Object.defineProperty(this,"_requestHeaders",{value:{},writable:!0}),Object.defineProperty(this,"_response",{value:"",writable:!0}),Object.defineProperty(this,"response",{enumerable:!0,get:function(){return t._response}}),Object.defineProperty(this,"_responseHeaders",{value:{},writable:!0}),Object.defineProperty(this,"_responseText",{value:"",writable:!0}),Object.defineProperty(this,"responseText",{enumerable:!0,get:function(){return t._responseText}}),Object.defineProperty(this,"responseType",{value:"",enumerable:!0,writable:!0}),Object.defineProperty(this,"_responseURL",{value:"",writable:!0}),Object.defineProperty(this,"responseURL",{enumerable:!0,get:function(){return t._responseURL}}),Object.defineProperty(this,"_responseXML",{value:null,writable:!0}),Object.defineProperty(this,"responseXML",{enumerable:!0,get:function(){return t._responseXML}}),Object.defineProperty(this,"_status",{value:0,writable:!0}),Object.defineProperty(this,"status",{enumerable:!0,get:function(){return t._status}}),Object.defineProperty(this,"_statusText",{value:"",writable:!0}),Object.defineProperty(this,"statusText",{enumerable:!0,get:function(){return t._statusText}}),Object.defineProperty(this,"timeout",{value:0,enumerable:!0,writable:!0}),Object.defineProperty(this,"_isTimedOut",{value:!1,enumerable:!0,writable:!0}),Object.defineProperty(this,"upload",{value:new i,enumerable:!0}),Object.defineProperty(this,"_url",{value:null,writable:!0}),Object.defineProperty(this,"_username",{value:null,writable:!0}),Object.defineProperty(this,"withCredentials",{value:!1,enumerable:!0,writable:!0}),Object.defineProperty(this,"_abortController",{value:null,writable:!0}),Object.defineProperty(this,"_isUpload",{value:!1,writable:!0})}function s(e,t){e._readyState=t,e.dispatchEvent(new l("readystatechange")),1==e._isTimedOut&&e._readyState==r.DONE?(e.dispatchEvent(new l("timeout",!1,!1,e)),e.dispatchEvent(new l("loadend",!1,!1,e)),e._isTimedOut=!1):e._readyState==r.DONE&&(e.dispatchEvent(new l("load",!1,!1,e)),e.dispatchEvent(new l("loadend",!1,!1,e)))}function n(n,o,i){t.log("Offline Persistence Toolkit PersistenceXMLHttpRequest: Processing Response"),function(e,t){if(e._responseHeaders={},t.entries){var n,o,i,a=t.entries();do{(n=a.next()).value&&(o=n.value[0],i=n.value[1],e._forceMimeType&&"content-type"==o.toLowerCase()?e._responseHeaders[o]=e._forceMimeType:e._responseHeaders[o]=i)}while(!n.done)}else t.forEach&&t.forEach((function(t,r){e._forceMimeType&&"content-type"==r.toLowerCase()?e._responseHeaders[r]=e._forceMimeType:e._responseHeaders[r]=t}));s(e,r.HEADERS_RECEIVED)}(n,i.headers);var a=i.headers.get("Content-Type");n._status=i.status,n._statusText=i.statusText,n._responseURL=o.url;var l=e._derivePayloadType(n,i);if("blob"===l)t.log("Offline Persistence Toolkit PersistenceXMLHttpRequest: Calling response.blob()"),i.blob().then((function(e){n._responseType="blob",n._response=e,s(n,r.DONE),"function"==typeof n.onload&&n.onload()}),(function(e){t.error(e)}));else if("arraybuffer"===l)t.log("Offline Persistence Toolkit PersistenceXMLHttpRequest: Calling response.arrayBuffer()"),i.arrayBuffer().then((function(e){n._responseType="arrayBuffer",n._response=e,s(n,r.DONE),"function"==typeof n.onload&&n.onload()}),(function(e){t.error("error reading response as arrayBuffer!")}));else if("multipart"===l){t.log("Offline Persistence Toolkit PersistenceXMLHttpRequest: Calling response.formData()"),n._responseType="formData";var u=function(t){var o="";e.parseMultipartFormData(t,a).forEach((function(e){o+=e.data})),n._response=o,n._responseText=o,s(n,r.DONE),"function"==typeof n.onload&&n.onload()};if(i.formData)try{i.formData().then((function(e){var t,o,i="",a=e.values();do{(t=(o=a.next()).value)&&(i+=t)}while(!o.done);n._response=i,n._responseText=i,s(n,r.DONE),"function"==typeof n.onload&&n.onload()}))}catch(e){i.text().then((function(e){u(e)}))}else i.text().then((function(e){u(e)}))}else i.text().then((function(e){t.log("Offline Persistence Toolkit PersistenceXMLHttpRequest: Calling response.text()"),n._responseType="",n._response=e,n._responseText=e,s(n,r.DONE),"function"==typeof n.onload&&n.onload()}),(function(e){t.error(e)}))}function o(e){if(e._readyState!==r.OPENED)throw new Error("INVALID_STATE_ERR")}function i(){this.onabort=null,this.onerror=null,this.onload=null,this.onloadend=null,this.onloadstart=null,this.onprogress=null,this.ontimeout=null,this._eventListeners=[]}function a(e,t,r,s){Object.defineProperty(this,"type",{value:e,enumerable:!0}),Object.defineProperty(this,"bubbles",{value:t,enumerable:!0}),Object.defineProperty(this,"cancelable",{value:r,enumerable:!0}),Object.defineProperty(this,"target",{value:s,enumerable:!0}),Object.defineProperty(this,"lengthComputable",{value:!1,enumerable:!0}),Object.defineProperty(this,"loaded",{value:0,enumerable:!0}),Object.defineProperty(this,"total",{value:0,enumerable:!0})}function l(e,t,r,s){Object.defineProperty(this,"type",{value:e,enumerable:!0}),Object.defineProperty(this,"bubbles",{value:t,enumerable:!0}),Object.defineProperty(this,"cancelable",{value:r,enumerable:!0}),Object.defineProperty(this,"target",{value:s,enumerable:!0})}return Object.defineProperty(r,"UNSENT",{value:0,enumerable:!0}),Object.defineProperty(r,"OPENED",{value:1,enumerable:!0}),Object.defineProperty(r,"HEADERS_RECEIVED",{value:2,enumerable:!0}),Object.defineProperty(r,"LOADING",{value:3,enumerable:!0}),Object.defineProperty(r,"DONE",{value:4,enumerable:!0}),r.prototype.open=function(e,n,o,i,a){if(t.log("Offline Persistence Toolkit PersistenceXMLHttpRequest: open() for method: "+e+", url: "+n),"boolean"==typeof o&&!o)throw new Error("InvalidAccessError: Failed to execute 'open' on 'XMLHttpRequest': Synchronous requests are disabled on the XHR Adapter");if(this._method=e,this._url=n,this._isTimedOut=!1,function(e){var t=e.toLowerCase();if(0===t.indexOf("http:")||0===t.indexOf("https:"))return!1;if(0===t.indexOf("file:")||0===t.indexOf("cdvfile:"))return!0;if(URL&&URL.prototype&&null!=(t=new URL(e,window.location.href).origin)&&"null"!=t&&t.length>0)return 0===t.toLowerCase().indexOf("file:");var r=document.createElement("a");return r.href=e,!(!(t=r.protocol)||0!==t.toLowerCase().indexOf("file:"))}(n)){t.log("Offline Persistence Toolkit PersistenceXMLHttpRequest: open called for a File url");var l=this;this._passthroughXHR=new l._browserXMLHttpRequest,this._passthroughXHR.onreadystatechange=function(){l._passthroughXHR.readyState==r.DONE&&(l._status=l._passthroughXHR.status,l._statusText=l._passthroughXHR.statusText,l._response=l._passthroughXHR.response,l._responseHeaders=l._passthroughXHR.responseHeaders,l._responseType=l._passthroughXHR.responseType,null!=l._responseType&&""!=l._responseType&&"text"!=l._responseType||(l._responseText=l._passthroughXHR.responseText),l._responseURL=l._passthroughXHR.responseURL,null!=l._responseType&&""!=l._responseType&&"document"!=l._responseType||(l._responseXML=l._passthroughXHR.responseXML)),s(l,l._passthroughXHR.readyState)},this._passthroughXHR.open(e,n,o,i,a)}else this._passthroughXHR=null;"undefined"!=typeof AbortController&&(this._abortController=new AbortController),this._username=i,this._password=a,this._responseText=null,this._responseXML=null,this._requestHeaders={},s(this,r.OPENED)},r.prototype.setRequestHeader=function(e,r){t.log("Offline Persistence Toolkit PersistenceXMLHttpRequest: setRequestHeader() with header: "+e+" ,value: "+r),o(this);var s=this._requestHeaders[e];this._requestHeaders[e]=s?s+=","+r:r},r.prototype.send=function(e){var i=this;if(t.log("Offline Persistence Toolkit PersistenceXMLHttpRequest: send()"),this._passthroughXHR)null!=this.responseType&&(this._passthroughXHR.responseType=this.responseType),this._passthroughXHR.send(e);else{o(this),s(this,r.OPENED);var a=function(e,t){var r=function(e){var t=new Headers;return Object.keys(e._requestHeaders).forEach((function(r){t.append(r,e._requestHeaders[r])})),t}(e),s=e.withCredentials?"include":"same-origin",n={method:e._method,headers:r,mode:"cors",cache:"default",credentials:s};return"GET"!==e._method&&"HEAD"!==e._method&&"DELETE"!==e._method&&(n.body=t),n}(this,e),u=new Request(this._url,a);this._isUpload=!!a.body;var p={};(i=this)._abortController&&(p.signal=i._abortController.signal);try{i.timeout&&"number"==typeof i.timeout?function(e,r,s){return new Promise((function(n,o){t.log("Offline Persistence Toolkit PersistenceXMLHttpRequest: Calling fetchWithTimeout");var i=new Error("Fetch Timeout");i.name="TimeoutError";var a=setTimeout((function(){t.log("Offline Persistence Toolkit PersistenceXMLHttpRequest: Request Timedout: "+e.url),o(i),s._abortController&&s._abortController.abort()}),s.timeout);fetch(e,r).then((function(e){n(e)}),(function(e){o(e)})).finally((function(){clearTimeout(a)}))}))}(u,p,i).then((function(e){n(i,u,e)})).catch((function(e){e&&e.name&&"TimeoutError"===e.name?(i._isTimedOut=!0,s(i,r.DONE)):i.dispatchEvent(new l("error",!1,!1,i))})):fetch(u,p).then((function(e){n(i,u,e)}),(function(e){e&&e.name&&"AbortError"===e.name?(t.log("Offline Persistence Toolkit PersistenceXMLHttpRequest: Request Timedout: "+u.url),i.dispatchEvent(new l("abort",!1,!1,i))):i.dispatchEvent(new l("error",!1,!1,i))}))}catch(e){throw e}this.dispatchEvent(new l("loadstart",!1,!1,this))}},r.prototype.abort=function(){t.log("Offline Persistence Toolkit PersistenceXMLHttpRequest: abort()"),this._abortController?this._abortController.abort():this.dispatchEvent(new l("abort",!1,!1,self)),this._readyState=r.UNSENT,this._status=0,this._statusText=""},r.prototype.getResponseHeader=function(e){if(t.log("Offline Persistence Toolkit PersistenceXMLHttpRequest: getResponseHeader() for header: "+e),this._readyState<r.HEADERS_RECEIVED)return null;for(var s in e=e.toLowerCase(),this._responseHeaders)if(s.toLowerCase()==e.toLowerCase())return this._responseHeaders[s];return null},r.prototype.getAllResponseHeaders=function(){t.log("Offline Persistence Toolkit PersistenceXMLHttpRequest: getAllResponseHeaders()");var e=this;if(this._readyState<r.HEADERS_RECEIVED)return"";var s="";return this._responseHeaders&&Object.keys(this._responseHeaders).forEach((function(t){s+=t+": "+e._responseHeaders[t]+"\r\n"})),s},r.prototype.overrideMimeType=function(e){t.log("Offline Persistence Toolkit PersistenceXMLHttpRequest: overrideMimeType() for mimeType: "+e),"string"==typeof e&&(this._forceMimeType=e.toLowerCase())},r.prototype.addEventListener=function(e,r){t.log("Offline Persistence Toolkit PersistenceXMLHttpRequest: addEventListener() for event type: "+e),this._eventListeners[e]=this._eventListeners[e]||[],this._eventListeners[e].push(r)},r.prototype.removeEventListener=function(e,r){t.log("Offline Persistence Toolkit PersistenceXMLHttpRequest: removeEventListener() for event type: "+e);var s,n=this._eventListeners[e]||[],o=n.length;for(s=0;s<o;s++)if(n[s]==r)return n.splice(s,1)},r.prototype.dispatchEvent=function(e){t.log("Offline Persistence Toolkit PersistenceXMLHttpRequest: dispatchEvent() for event type: "+e.type);var r=this,s=e.type;switch((this._eventListeners[s]||[]).forEach((function(t){"function"==typeof t?t.call(r,e):t.handleEvent(e)})),s){case"abort":this._isUpload&&this.upload._dispatchEvent(new a("abort",!1,!1,r.upload)),this.onabort&&this.onabort(e),r.dispatchEvent(new l("loadend",!1,!1,r));break;case"error":this._isUpload&&this.upload._dispatchEvent(new a("error",!1,!1,r.upload)),this.onerror&&this.onerror(e);break;case"load":this._isUpload&&this.upload._dispatchEvent(new a("load",!1,!1,r.upload)),this.onload&&this.onload(e);break;case"loadend":this._isUpload&&this.upload._dispatchEvent(new a("loadend",!1,!1,r.upload)),this.onloadend&&this.onloadend(e);break;case"loadstart":this._isUpload&&this.upload._dispatchEvent(new a("loadstart",!1,!1,r.upload)),this.onloadstart&&this.onloadstart(e);break;case"progress":this.onprogress&&this.onprogress(e);break;case"readystatechange":this.onreadystatechange&&this.onreadystatechange(e);break;case"timeout":this._isUpload&&this.upload._dispatchEvent(new a("timeout",!1,!1,r.upload)),this.ontimeout&&this.ontimeout(e)}return!!e.defaultPrevented},i.prototype.addEventListener=function(e,r){t.log("Offline Persistence Toolkit PersistenceXMLHttpRequestUpload: addEventListener() for event type: "+e),this._eventListeners[e]=this._eventListeners[e]||[],this._eventListeners[e].push(r)},i.prototype.removeEventListener=function(e,r){t.log("Offline Persistence Toolkit PersistenceXMLHttpRequestUpload: removeEventListener() for event type: "+e);var s,n=this._eventListeners[e]||[],o=n.length;for(s=0;s<o;s++)if(n[s]==r)return n.splice(s,1)},i.prototype._dispatchEvent=function(e){t.log("Offline Persistence Toolkit PersistenceXMLHttpRequestUpload: dispatchEvent() for event type: "+e.type);var r=this,s=e.type;switch((this._eventListeners[s]||[]).forEach((function(t){"function"==typeof t?t.call(r,e):t.handleEvent(e)})),s){case"abort":this.onabort&&this.onabort(e);break;case"error":this.onerror&&this.onerror(e);break;case"load":this.onload&&this.onload(e);break;case"loadend":this.onloadend&&this.onloadend(e);break;case"loadstart":this.onloadstart&&this.onloadstart(e),this._dispatchEvent(new a("progress",!1,!1,r));break;case"progress":this.onprogress&&this.onprogress(e);break;case"timeout":this.ontimeout&&this.ontimeout(e)}return!!e.defaultPrevented},a.prototype.stopPropagation=function(){},a.prototype.preventDefault=function(){this.defaultPrevented=!0},l.prototype.stopPropagation=function(){},l.prototype.preventDefault=function(){this.defaultPrevented=!0},r}));
/**
 * Copyright (c) 2017, Oracle and/or its affiliates.
 * All rights reserved.
 */

define('persist/impl/PersistenceStoreMetadata',[],(function(){"use strict";var t=function(t,e,r){this.name=t,this.persistenceStoreFactory=e,this.versions=r};return(t.prototype={}).persistenceStoreFactory,t.prototype.versions,t}));
/**
 * Copyright (c) 2017, Oracle and/or its affiliates.
 * All rights reserved.
 */

define('persist/PersistenceStore',[],(function(){"use strict";var t=function(t){this._name=t};return(t.prototype={}).getName=function(){return this._name},t.prototype.getVersion=function(){return this._version},t.prototype.Init=function(t){return t&&t.version?this._version=t.version:this._version="0",Promise.resolve()},t.prototype.upsert=function(t,r,o,n){throw TypeError("failed in abstract function")},t.prototype.upsertAll=function(t){throw TypeError("failed in abstract function")},t.prototype.find=function(t){throw TypeError("failed in abstract function")},t.prototype.findByKey=function(t){throw TypeError("failed in abstract function")},t.prototype.removeByKey=function(t){throw TypeError("failed in abstract function")},t.prototype.delete=function(t){throw TypeError("failed in abstract function")},t.prototype.keys=function(){throw TypeError("failed in abstract function")},t.prototype.updateKey=function(t,r){throw TypeError("failed in abstract function")},t}));
/**
 * Copyright (c) 2017, Oracle and/or its affiliates.
 * All rights reserved.
 */

define('persist/impl/storageUtils',["./logger"],(function(r){"use strict";function e(r){var t,a=[];for(var f in r)if(r.hasOwnProperty(f)){var l=r[f];if(0===f.indexOf("$")){if(i(f)){if(!(l instanceof Array))throw new Error("not a valid expression: "+r);t={operator:f,array:[]};for(var s=0;s<l.length;s++){var u=e(l[s]);t.array.push(u)}}else if(o(f))throw new Error("not a valid expression: "+r)}else if("object"!=typeof l)a.push({left:f,right:l,operator:"$eq"});else{var g={left:f};n(g,l),a.push(g)}}return a.length>1?t={operator:"$and",array:a}:1===a.length&&(t=a[0]),t}function n(r,e){var n=!1;for(var t in e)if(e.hasOwnProperty(t)){var i=e[t];if(n||!o(t))throw new Error("parsing error "+e);r.operator=t,r.right=i,n=!0}}function t(r,e){var n=r.operator;if(i(n)){if(!r.left&&r.array instanceof Array){for(var a,s=r.array,u=0;u<s.length;u++){var g=t(s[u],e);if("$or"===n&&!0===g)return!0;if("$and"===n&&!1===g)return!1;a=g}return a}throw new Error("invalid expression tree!"+r)}if(!o(n))throw new Error("not a valid expression!"+r);var h,c=l(r.left,e),v=r.right;if("$lt"===n)return(c=(h=f(c,v))[0])<h[1];if("$gt"===n)return(c=(h=f(c,v))[0])>h[1];if("$lte"===n)return(c=(h=f(c,v))[0])<=h[1];if("$gte"===n)return(c=(h=f(c,v))[0])>=h[1];if("$eq"===n)return c===v;if("$ne"===n)return c!==v;if("$regex"===n)return null!==c.match(v);if("$exists"===n)return v?null!=c:null==c;if("$in"!==n){if("$nin"===n)return v.indexOf(c)<0;throw new Error("not a valid expression! "+r)}for(var $=0;$<v.length;$++)if(v[$]===c)return!0;return!1}function i(r){return"$and"===r||"$or"===r}function o(r){return"$lt"===r||"$gt"===r||"$lte"===r||"$gte"===r||"$eq"===r||"$ne"===r||"$regex"===r||"$exists"===r||"$in"===r||"$nin"===r}function a(r){return null!=r&&(r instanceof String||"string"==typeof r)}function f(r,e){return a(r)&&null==e?e="":a(e)&&null==r&&(r=""),[r,e]}function l(r,e){for(var n=r.split("."),t=e,i=0;i<n.length;i++)t=t[n[i]];return t}return{satisfy:function(n,i){return r.log("Offline Persistence Toolkit storageUtils: Processing selector: "+JSON.stringify(n)),!n||t(e(n),i)},getValue:l,assembleObject:function(r,e){var n;if(e){n={};for(var t=0;t<e.length;t++)for(var i=n,o=r,a=e[t].split("."),f=0;f<a.length;f++)o=o[a[f]],!i[a[f]]&&f<a.length-1&&(i[a[f]]={}),f===a.length-1?i[a[f]]=o:i=i[a[f]]}else n=r;return n},sortRows:function(r,e){return r&&Array.isArray(r)&&!(r.length<1)&&e&&Array.isArray(e)&&e.length?r.sort(function(r){return function(e,n){for(var t=0;t<r.length;t++){var i,o=r[t],a=!0;if("string"==typeof o)i=o;else{if("object"!=typeof o)throw new Error("invalid sort criteria.");var f=Object.keys(o);if(!f||1!==f.length)throw new Error("invalid sort criteria");a="asc"===o[i=f[0]].toLowerCase()}var s=l(i,e),u=l(i,n);if(s!=u)return a?s<u?-1:1:s<u?1:-1}return 0}}(e)):r}}}));
!function(e){"object"==typeof exports&&"undefined"!=typeof module?module.exports=e():"function"==typeof define&&define.amd?define('pouchdb',[],e):("undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:this).PouchDB=e()}((function(){return function e(t,n,r){function o(s,a){if(!n[s]){if(!t[s]){var u="function"==typeof require&&require;if(!a&&u)return u(s,!0);if(i)return i(s,!0);var c=new Error("Cannot find module '"+s+"'");throw c.code="MODULE_NOT_FOUND",c}var f=n[s]={exports:{}};t[s][0].call(f.exports,(function(e){return o(t[s][1][e]||e)}),f,f.exports,e,t,n,r)}return n[s].exports}for(var i="function"==typeof require&&require,s=0;s<r.length;s++)o(r[s]);return o}({1:[function(e,t,n){"use strict";t.exports=function(e){return function(){var t=arguments.length;if(t){for(var n=[],r=-1;++r<t;)n[r]=arguments[r];return e.call(this,n)}return e.call(this,[])}}},{}],2:[function(e,t,n){},{}],3:[function(e,t,n){
// Copyright Joyent, Inc. and other Node contributors.
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.
var r=Object.create||function(e){var t=function(){};return t.prototype=e,new t},o=Object.keys||function(e){var t=[];for(var n in e)Object.prototype.hasOwnProperty.call(e,n)&&t.push(n);return n},i=Function.prototype.bind||function(e){var t=this;return function(){return t.apply(e,arguments)}};function s(){this._events&&Object.prototype.hasOwnProperty.call(this,"_events")||(this._events=r(null),this._eventsCount=0),this._maxListeners=this._maxListeners||void 0}t.exports=s,
// Backwards-compat with node 0.10.x
s.EventEmitter=s,s.prototype._events=void 0,s.prototype._maxListeners=void 0;
// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
var a,u=10;try{var c={};Object.defineProperty&&Object.defineProperty(c,"x",{value:0}),a=0===c.x}catch(e){a=!1}function f(e){return void 0===e._maxListeners?s.defaultMaxListeners:e._maxListeners}
// These standalone emit* functions are used to optimize calling of event
// handlers for fast cases because emit() itself often has a variable number of
// arguments and can be deoptimized because of that. These functions always have
// the same number of arguments and thus do not get deoptimized, so the code
// inside them can execute faster.
function l(e,t,n){if(t)e.call(n);else for(var r=e.length,o=w(e,r),i=0;i<r;++i)o[i].call(n)}function d(e,t,n,r){if(t)e.call(n,r);else for(var o=e.length,i=w(e,o),s=0;s<o;++s)i[s].call(n,r)}function h(e,t,n,r,o){if(t)e.call(n,r,o);else for(var i=e.length,s=w(e,i),a=0;a<i;++a)s[a].call(n,r,o)}function p(e,t,n,r,o,i){if(t)e.call(n,r,o,i);else for(var s=e.length,a=w(e,s),u=0;u<s;++u)a[u].call(n,r,o,i)}function v(e,t,n,r){if(t)e.apply(n,r);else for(var o=e.length,i=w(e,o),s=0;s<o;++s)i[s].apply(n,r)}function y(e,t,n,o){var i,s,a;if("function"!=typeof n)throw new TypeError('"listener" argument must be a function');if((s=e._events)?(
// To avoid recursion in the case that type === "newListener"! Before
// adding it to the listeners, first emit "newListener".
s.newListener&&(e.emit("newListener",t,n.listener?n.listener:n),
// Re-assign `events` because a newListener handler could have caused the
// this._events to be assigned to a new object
s=e._events),a=s[t]):(s=e._events=r(null),e._eventsCount=0),a){
// Check for listener leak
if("function"==typeof a?
// Adding the second element, need to change to array.
a=s[t]=o?[n,a]:[a,n]:
// If we've already got an array, just append.
o?a.unshift(n):a.push(n),!a.warned&&(i=f(e))&&i>0&&a.length>i){a.warned=!0;var u=new Error("Possible EventEmitter memory leak detected. "+a.length+' "'+String(t)+'" listeners added. Use emitter.setMaxListeners() to increase limit.');u.name="MaxListenersExceededWarning",u.emitter=e,u.type=t,u.count=a.length,"object"==typeof console&&console.warn&&console.warn("%s: %s",u.name,u.message)}}else
// Optimize the case of one listener. Don't need the extra array object.
a=s[t]=n,++e._eventsCount;return e}function g(){if(!this.fired)switch(this.target.removeListener(this.type,this.wrapFn),this.fired=!0,arguments.length){case 0:return this.listener.call(this.target);case 1:return this.listener.call(this.target,arguments[0]);case 2:return this.listener.call(this.target,arguments[0],arguments[1]);case 3:return this.listener.call(this.target,arguments[0],arguments[1],arguments[2]);default:for(var e=new Array(arguments.length),t=0;t<e.length;++t)e[t]=arguments[t];this.listener.apply(this.target,e)}}function _(e,t,n){var r={fired:!1,wrapFn:void 0,target:e,type:t,listener:n},o=i.call(g,r);return o.listener=n,r.wrapFn=o,o}function m(e,t,n){var r=e._events;if(!r)return[];var o=r[t];return o?"function"==typeof o?n?[o.listener||o]:[o]:n?function(e){for(var t=new Array(e.length),n=0;n<t.length;++n)t[n]=e[n].listener||e[n];return t}(o):w(o,o.length):[]}function b(e){var t=this._events;if(t){var n=t[e];if("function"==typeof n)return 1;if(n)return n.length}return 0}function w(e,t){for(var n=new Array(t),r=0;r<t;++r)n[r]=e[r];return n}a?Object.defineProperty(s,"defaultMaxListeners",{enumerable:!0,get:function(){return u},set:function(e){
// check whether the input is a positive number (whose value is zero or
// greater and not a NaN).
if("number"!=typeof e||e<0||e!=e)throw new TypeError('"defaultMaxListeners" must be a positive number');u=e}}):s.defaultMaxListeners=u,
// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
s.prototype.setMaxListeners=function(e){if("number"!=typeof e||e<0||isNaN(e))throw new TypeError('"n" argument must be a positive number');return this._maxListeners=e,this},s.prototype.getMaxListeners=function(){return f(this)},s.prototype.emit=function(e){var t,n,r,o,i,s,a="error"===e;if(s=this._events)a=a&&null==s.error;else if(!a)return!1;
// If there is no 'error' event listener then throw.
if(a){if(arguments.length>1&&(t=arguments[1]),t instanceof Error)throw t;// Unhandled 'error' event
// At least give some kind of context to the user
var u=new Error('Unhandled "error" event. ('+t+")");throw u.context=t,u}if(!(n=s[e]))return!1;var c="function"==typeof n;switch(r=arguments.length){
// fast cases
case 1:l(n,c,this);break;case 2:d(n,c,this,arguments[1]);break;case 3:h(n,c,this,arguments[1],arguments[2]);break;case 4:p(n,c,this,arguments[1],arguments[2],arguments[3]);break;
// slower
default:for(o=new Array(r-1),i=1;i<r;i++)o[i-1]=arguments[i];v(n,c,this,o)}return!0},s.prototype.addListener=function(e,t){return y(this,e,t,!1)},s.prototype.on=s.prototype.addListener,s.prototype.prependListener=function(e,t){return y(this,e,t,!0)},s.prototype.once=function(e,t){if("function"!=typeof t)throw new TypeError('"listener" argument must be a function');return this.on(e,_(this,e,t)),this},s.prototype.prependOnceListener=function(e,t){if("function"!=typeof t)throw new TypeError('"listener" argument must be a function');return this.prependListener(e,_(this,e,t)),this},
// Emits a 'removeListener' event if and only if the listener was removed.
s.prototype.removeListener=function(e,t){var n,o,i,s,a;if("function"!=typeof t)throw new TypeError('"listener" argument must be a function');if(!(o=this._events))return this;if(!(n=o[e]))return this;if(n===t||n.listener===t)0==--this._eventsCount?this._events=r(null):(delete o[e],o.removeListener&&this.emit("removeListener",e,n.listener||t));else if("function"!=typeof n){for(i=-1,s=n.length-1;s>=0;s--)if(n[s]===t||n[s].listener===t){a=n[s].listener,i=s;break}if(i<0)return this;0===i?n.shift():
// About 1.5x faster than the two-arg version of Array#splice().
function(e,t){for(var n=t,r=n+1,o=e.length;r<o;n+=1,r+=1)e[n]=e[r];e.pop()}(n,i),1===n.length&&(o[e]=n[0]),o.removeListener&&this.emit("removeListener",e,a||t)}return this},s.prototype.removeAllListeners=function(e){var t,n,i;if(!(n=this._events))return this;
// not listening for removeListener, no need to emit
if(!n.removeListener)return 0===arguments.length?(this._events=r(null),this._eventsCount=0):n[e]&&(0==--this._eventsCount?this._events=r(null):delete n[e]),this;
// emit removeListener for all listeners on all events
if(0===arguments.length){var s,a=o(n);for(i=0;i<a.length;++i)"removeListener"!==(s=a[i])&&this.removeAllListeners(s);return this.removeAllListeners("removeListener"),this._events=r(null),this._eventsCount=0,this}if("function"==typeof(t=n[e]))this.removeListener(e,t);else if(t)
// LIFO order
for(i=t.length-1;i>=0;i--)this.removeListener(e,t[i]);return this},s.prototype.listeners=function(e){return m(this,e,!0)},s.prototype.rawListeners=function(e){return m(this,e,!1)},s.listenerCount=function(e,t){return"function"==typeof e.listenerCount?e.listenerCount(t):b.call(e,t)},s.prototype.listenerCount=b,s.prototype.eventNames=function(){return this._eventsCount>0?Reflect.ownKeys(this._events):[]}},{}],4:[function(e,t,n){"use strict";var r,o,i,s=[e("./nextTick"),e("./queueMicrotask"),e("./mutation.js"),e("./messageChannel"),e("./stateChange"),e("./timeout")],a=-1,u=[],c=!1;function f(){r&&o&&(r=!1,o.length?u=o.concat(u):a=-1,u.length&&l())}
//named nextTick for less confusing stack traces
function l(){if(!r){c=!1,r=!0;for(var e=u.length,t=setTimeout(f);e;){for(o=u,u=[];o&&++a<e;)o[a].run();a=-1,e=u.length}o=null,a=-1,r=!1,clearTimeout(t)}}for(var d=-1,h=s.length;++d<h;)if(s[d]&&s[d].test&&s[d].test()){i=s[d].install(l);break}
// v8 likes predictible objects
function p(e,t){this.fun=e,this.array=t}p.prototype.run=function(){var e=this.fun,t=this.array;switch(t.length){case 0:return e();case 1:return e(t[0]);case 2:return e(t[0],t[1]);case 3:return e(t[0],t[1],t[2]);default:return e.apply(null,t)}},t.exports=function(e){var t=new Array(arguments.length-1);if(arguments.length>1)for(var n=1;n<arguments.length;n++)t[n-1]=arguments[n];u.push(new p(e,t)),c||r||(c=!0,i())}},{"./messageChannel":5,"./mutation.js":6,"./nextTick":2,"./queueMicrotask":7,"./stateChange":8,"./timeout":9}],5:[function(e,t,n){(function(e){(function(){"use strict";n.test=function(){return!e.setImmediate&&void 0!==e.MessageChannel},n.install=function(t){var n=new e.MessageChannel;return n.port1.onmessage=t,function(){n.port2.postMessage(0)}}}).call(this)}).call(this,"undefined"!=typeof global?global:"undefined"!=typeof self?self:"undefined"!=typeof window?window:{})},{}],6:[function(e,t,n){(function(e){(function(){"use strict";
//based off rsvp https://github.com/tildeio/rsvp.js
//license https://github.com/tildeio/rsvp.js/blob/master/LICENSE
//https://github.com/tildeio/rsvp.js/blob/master/lib/rsvp/asap.js
var t=e.MutationObserver||e.WebKitMutationObserver;n.test=function(){return t},n.install=function(n){var r=0,o=new t(n),i=e.document.createTextNode("");return o.observe(i,{characterData:!0}),function(){i.data=r=++r%2}}}).call(this)}).call(this,"undefined"!=typeof global?global:"undefined"!=typeof self?self:"undefined"!=typeof window?window:{})},{}],7:[function(e,t,n){(function(e){(function(){"use strict";n.test=function(){return"function"==typeof e.queueMicrotask},n.install=function(t){return function(){e.queueMicrotask(t)}}}).call(this)}).call(this,"undefined"!=typeof global?global:"undefined"!=typeof self?self:"undefined"!=typeof window?window:{})},{}],8:[function(e,t,n){(function(e){(function(){"use strict";n.test=function(){return"document"in e&&"onreadystatechange"in e.document.createElement("script")},n.install=function(t){return function(){
// Create a <script> element; its readystatechange event will be fired asynchronously once it is inserted
// into the document. Do so, thus queuing up the task. Remember to clean up once it's been called.
var n=e.document.createElement("script");return n.onreadystatechange=function(){t(),n.onreadystatechange=null,n.parentNode.removeChild(n),n=null},e.document.documentElement.appendChild(n),t}}}).call(this)}).call(this,"undefined"!=typeof global?global:"undefined"!=typeof self?self:"undefined"!=typeof window?window:{})},{}],9:[function(e,t,n){"use strict";n.test=function(){return!0},n.install=function(e){return function(){setTimeout(e,0)}}},{}],10:[function(e,t,n){(function(n){(function(){"use strict";function r(e){return e&&"object"==typeof e&&"default"in e?e.default:e}var o,i,s=r(e("immediate")),a=e("uuid"),u=r(e("spark-md5")),c=r(e("vuvuzela")),f=r(e("argsarray")),l=r(e("inherits")),d=r(e("events"));function h(e){return"$"+e}function p(e){return e.substring(1)}function v(){this._store={}}function y(e){
// init with an array
if(this._store=new v,e&&Array.isArray(e))for(var t=0,n=e.length;t<n;t++)this.add(e[t])}
// most of this is borrowed from lodash.isPlainObject:
// https://github.com/fis-components/lodash.isplainobject/
// blob/29c358140a74f252aeb08c9eb28bef86f2217d4a/index.js
v.prototype.get=function(e){var t=h(e);return this._store[t]},v.prototype.set=function(e,t){var n=h(e);return this._store[n]=t,!0},v.prototype.has=function(e){return h(e)in this._store},v.prototype.delete=function(e){var t=h(e),n=t in this._store;return delete this._store[t],n},v.prototype.forEach=function(e){for(var t=Object.keys(this._store),n=0,r=t.length;n<r;n++){var o=t[n];e(this._store[o],o=p(o))}},Object.defineProperty(v.prototype,"size",{get:function(){return Object.keys(this._store).length}}),y.prototype.add=function(e){return this._store.set(e,!0)},y.prototype.has=function(e){return this._store.has(e)},y.prototype.forEach=function(e){this._store.forEach((function(t,n){e(n)}))},Object.defineProperty(y.prototype,"size",{get:function(){return this._store.size}}),
/* global Map,Set,Symbol */
// Based on https://kangax.github.io/compat-table/es6/ we can sniff out
// incomplete Map/Set implementations which would otherwise cause our tests to fail.
// Notably they fail in IE11 and iOS 8.4, which this prevents.
function(){if("undefined"==typeof Symbol||"undefined"==typeof Map||"undefined"==typeof Set)return!1;var e=Object.getOwnPropertyDescriptor(Map,Symbol.species);return e&&"get"in e&&Map[Symbol.species]===Map}
// based on https://github.com/montagejs/collections
()?(// prefer built-in Map/Set
o=Set,i=Map):(// fall back to our polyfill
o=y,i=v);var g,_=Function.prototype.toString,m=_.call(Object);function b(e){var t,n,r;if(!e||"object"!=typeof e)return e;if(Array.isArray(e)){for(t=[],n=0,r=e.length;n<r;n++)t[n]=b(e[n]);return t}
// special case: to avoid inconsistencies between IndexedDB
// and other backends, we automatically stringify Dates
if(e instanceof Date)return e.toISOString();if(function(e){return"undefined"!=typeof ArrayBuffer&&e instanceof ArrayBuffer||"undefined"!=typeof Blob&&e instanceof Blob}(e))return function(e){if(e instanceof ArrayBuffer)return function(e){if("function"==typeof e.slice)return e.slice(0);
// IE10-11 slice() polyfill
var t=new ArrayBuffer(e.byteLength),n=new Uint8Array(t),r=new Uint8Array(e);return n.set(r),t}(e);var t=e.size,n=e.type;
// Blob
return"function"==typeof e.slice?e.slice(0,t,n):e.webkitSlice(0,t,n);
// PhantomJS slice() replacement
}(e);if(!function(e){var t=Object.getPrototypeOf(e);
/* istanbul ignore if */if(null===t)// not sure when this happens, but I guess it can
return!0;var n=t.constructor;return"function"==typeof n&&n instanceof n&&_.call(n)==m}(e))return e;// don't clone objects like Workers
for(n in t={},e)
/* istanbul ignore else */
if(Object.prototype.hasOwnProperty.call(e,n)){var o=b(e[n]);void 0!==o&&(t[n]=o)}return t}function w(e){var t=!1;return f((function(n){
/* istanbul ignore if */
if(t)
// this is a smoke test and should never actually happen
throw new Error("once called more than once");t=!0,e.apply(this,n)}))}function k(e){
//create the function we will be returning
return f((function(t){
// Clone arguments
t=b(t);var n=this,r="function"==typeof t[t.length-1]&&t.pop(),o=new Promise((function(r,o){var i;try{var s=w((function(e,t){e?o(e):r(t)}));
// create a callback for this invocation
// apply the function in the orig context
t.push(s),(i=e.apply(n,t))&&"function"==typeof i.then&&r(i)}catch(e){o(e)}}));
// if the last argument is a function, assume its a callback
// if there is a callback, call it back
return r&&o.then((function(e){r(null,e)}),r),o}))}function j(e,t){return k(f((function(n){if(this._closed)return Promise.reject(new Error("database is closed"));if(this._destroyed)return Promise.reject(new Error("database is destroyed"));var r=this;return function(e,t,n){
/* istanbul ignore if */
if(e.constructor.listeners("debug").length){for(var r=["api",e.name,t],o=0;o<n.length-1;o++)r.push(n[o]);e.constructor.emit("debug",r);
// override the callback itself to log the response
var i=n[n.length-1];n[n.length-1]=function(n,r){var o=["api",e.name,t];o=o.concat(n?["error",n]:["success",r]),e.constructor.emit("debug",o),i(n,r)}}}(r,e,n),this.taskqueue.isReady?t.apply(this,n):new Promise((function(t,o){r.taskqueue.addTask((function(i){i?o(i):t(r[e].apply(r,n))}))}))})))}
// like underscore/lodash _.pick()
function O(e,t){for(var n={},r=0,o=t.length;r<o;r++){var i=t[r];i in e&&(n[i]=e[i])}return n}
// Most browsers throttle concurrent requests at 6, so it's silly
// to shim _bulk_get by trying to launch potentially hundreds of requests
// and then letting the majority time out. We can handle this ourselves.
function A(e){return e}function q(e){return[{ok:e}]}
// shim for P/CouchDB adapters that don't directly implement _bulk_get
function S(e,t,n){var r=t.docs,o=new i;
// consolidate into one request per doc if possible
r.forEach((function(e){o.has(e.id)?o.get(e.id).push(e):o.set(e.id,[e])}));var s=o.size,a=0,u=new Array(s);function c(){var e;++a===s&&(e=[],u.forEach((function(t){t.docs.forEach((function(n){e.push({id:t.id,docs:[n]})}))})),n(null,{results:e}))}var f=[];o.forEach((function(e,t){f.push(t)}));var l=0;!function n(){if(!(l>=f.length)){var r=Math.min(l+6,f.length),i=f.slice(l,r);!function(r,i){r.forEach((function(r,s){var a=i+s,f=o.get(r),l=O(f[0],["atts_since","attachments"]);l.open_revs=f.map((function(e){
// rev is optional, open_revs disallowed
return e.rev})),
// remove falsey / undefined revisions
l.open_revs=l.open_revs.filter(A);var d=A;0===l.open_revs.length&&(delete l.open_revs,
// when fetching only the "winning" leaf,
// transform the result so it looks like an open_revs
// request
d=q),
// globally-supplied options
["revs","attachments","binary","ajax","latest"].forEach((function(e){e in t&&(l[e]=t[e])})),e.get(r,l,(function(e,t){var o,i,s;
/* istanbul ignore if */o=e?[{error:e}]:d(t),i=r,s=o,u[a]={id:i,docs:s},c(),n()}))}))}(i,l),l+=i.length}}()}try{localStorage.setItem("_pouch_check_localstorage",1),g=!!localStorage.getItem("_pouch_check_localstorage")}catch(e){g=!1}function x(){return g}
// Custom nextTick() shim for browsers. In node, this will just be process.nextTick(). We
function E(){d.call(this),this._listeners={},
/* istanbul ignore next */
function(e){x()&&addEventListener("storage",(function(t){e.emit(t.key)}))}(this)}function C(e){
/* istanbul ignore else */
if("undefined"!=typeof console&&"function"==typeof console[e]){var t=Array.prototype.slice.call(arguments,1);console[e].apply(console,t)}}function P(e){var t=0;return e||(t=2e3),function(e,t){var n=6e5;// Hard-coded default of 10 minutes
return e=parseInt(e,10)||0,(t=parseInt(t,10))!=t||t<=e?t=(e||1)<<1:t+=1,
// In order to not exceed maxTimeout, pick a random value between half of maxTimeout and maxTimeout
t>n&&(e=3e5,// divide by two
t=n),~~((t-e)*Math.random()+e);// ~~ coerces to an int, but fast.
}(e,t)}
// designed to give info to browser users, who are disturbed
// when they see http errors in the console
function L(e,t){C("info","The above "+e+" is totally normal. "+t)}l(E,d),E.prototype.addListener=function(e,t,n,r){
/* istanbul ignore if */
if(!this._listeners[t]){var o=this,i=!1;this._listeners[t]=a,this.on(e,a)}function a(){
/* istanbul ignore if */
if(o._listeners[t])if(i)i="waiting";else{i=!0;var e=O(r,["style","include_docs","attachments","conflicts","filter","doc_ids","view","since","query_params","binary","return_docs"]);
/* istanbul ignore next */n.changes(e).on("change",(function(e){e.seq>r.since&&!r.cancelled&&(r.since=e.seq,r.onChange(e))})).on("complete",(function(){"waiting"===i&&s(a),i=!1})).on("error",(function(){i=!1}))}}},E.prototype.removeListener=function(e,t){
/* istanbul ignore if */
t in this._listeners&&(d.prototype.removeListener.call(this,e,this._listeners[t]),delete this._listeners[t])},
/* istanbul ignore next */
E.prototype.notifyLocalWindows=function(e){
//do a useless change on a storage thing
//in order to get other windows's listeners to activate
x()&&(localStorage[e]="a"===localStorage[e]?"b":"a")},E.prototype.notify=function(e){this.emit(e),this.notifyLocalWindows(e)};var D="function"==typeof Object.assign?Object.assign:function(e){for(var t=Object(e),n=1;n<arguments.length;n++){var r=arguments[n];if(null!=r)// Skip over if undefined or null
for(var o in r)
// Avoid bugs when hasOwnProperty is shadowed
Object.prototype.hasOwnProperty.call(r,o)&&(t[o]=r[o])}return t};function $(e,t,n){Error.call(this,n),this.status=e,this.name=t,this.message=n,this.error=!0}l($,Error),$.prototype.toString=function(){return JSON.stringify({status:this.status,name:this.name,message:this.message,reason:this.reason})},new $(401,"unauthorized","Name or password is incorrect.");var I=new $(400,"bad_request","Missing JSON list of 'docs'"),T=new $(404,"not_found","missing"),B=new $(409,"conflict","Document update conflict"),M=new $(400,"bad_request","_id field must contain a string"),R=new $(412,"missing_id","_id is required for puts"),U=new $(400,"bad_request","Only reserved document ids may start with underscore."),N=(new $(412,"precondition_failed","Database not open"),new $(500,"unknown_error","Database encountered an unknown error")),F=new $(500,"badarg","Some query argument is invalid"),K=(new $(400,"invalid_request","Request was invalid"),new $(400,"query_parse_error","Some query parameter is invalid")),J=new $(500,"doc_validation","Bad special document member"),z=new $(400,"bad_request","Something wrong with the request"),V=new $(400,"bad_request","Document must be a JSON object"),G=(new $(404,"not_found","Database not found"),new $(500,"indexed_db_went_bad","unknown")),Q=(new $(500,"web_sql_went_bad","unknown"),new $(500,"levelDB_went_went_bad","unknown"),new $(403,"forbidden","Forbidden by design doc validate_doc_update function"),new $(400,"bad_request","Invalid rev format")),W=(new $(412,"file_exists","The database could not be created, the file already exists."),new $(412,"missing_stub","A pre-existing attachment stub wasn't found"));function Y(e,t){function n(t){for(
// inherit error properties from our parent error manually
// so as to allow proper JSON parsing.
/* jshint ignore:start */
var n=Object.getOwnPropertyNames(e),r=0,o=n.length;r<o;r++)"function"!=typeof e[n[r]]&&(this[n[r]]=e[n[r]]);
/* jshint ignore:end */void 0!==t&&(this.reason=t)}return n.prototype=$.prototype,new n(t)}function H(e){if("object"!=typeof e){var t=e;(e=N).data=t}return"error"in e&&"conflict"===e.error&&(e.name="conflict",e.status=409),"name"in e||(e.name=e.error||"unknown"),"status"in e||(e.status=500),"message"in e||(e.message=e.message||e.reason),e}function X(e){var t={},n=e.filter&&"function"==typeof e.filter;return t.query=e.query_params,function(r){r.doc||(
// CSG sends events on the changes feed that don't have documents,
// this hack makes a whole lot of existing code robust.
r.doc={});var o=n&&function(e,t,n){try{return!e(t,n)}catch(e){var r="Filter function threw: "+e.toString();return Y(z,r)}}(e.filter,r.doc,t);if("object"==typeof o)return o;if(o)return!1;if(e.include_docs){if(!e.attachments)for(var i in r.doc._attachments)
/* istanbul ignore else */
r.doc._attachments.hasOwnProperty(i)&&(r.doc._attachments[i].stub=!0)}else delete r.doc;return!0}}function Z(e){for(var t=[],n=0,r=e.length;n<r;n++)t=t.concat(e[n]);return t}
// shim for Function.prototype.name,
// Determine id an ID is valid
//   - invalid IDs begin with an underescore that does not begin '_design' or
//     '_local'
//   - any other string value is a valid id
// Returns the specific error object for each case
function ee(e){var t;if(e?"string"!=typeof e?t=Y(M):/^_/.test(e)&&!/^_(design|local)/.test(e)&&(t=Y(U)):t=Y(R),t)throw t}
// Checks if a PouchDB object is "remote" or not. This is
function te(e){return"boolean"==typeof e._remote?e._remote:
/* istanbul ignore next */
"function"==typeof e.type&&(C("warn","db.type() is deprecated and will be removed in a future version of PouchDB"),"http"===e.type()
/* istanbul ignore next */)}function ne(e){if(!e)return null;var t=e.split("/");return 2===t.length?t:1===t.length?[e,e]:null}function re(e){var t=ne(e);return t?t.join("/"):null}
// originally parseUri 1.2.2, now patched by us
// (c) Steven Levithan <stevenlevithan.com>
// MIT License
new $(413,"invalid_url","Provided URL is invalid");var oe=["source","protocol","authority","userInfo","user","password","host","port","relative","path","directory","file","query","anchor"],ie="queryKey",se=/(?:^|&)([^&=]*)=?([^&]*)/g,ae=/^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/;function ue(e){for(var t=ae.exec(e),n={},r=14;r--;){var o=oe[r],i=t[r]||"",s=-1!==["user","password"].indexOf(o);n[o]=s?decodeURIComponent(i):i}return n[ie]={},n[oe[12]].replace(se,(function(e,t,r){t&&(n[ie][t]=r)})),n}
// Based on https://github.com/alexdavid/scope-eval v0.0.3
// (source: https://unpkg.com/scope-eval@0.0.3/scope_eval.js)
// This is basically just a wrapper around new Function()
function ce(e,t){var n=[],r=[];for(var o in t)t.hasOwnProperty(o)&&(n.push(o),r.push(t[o]));return n.push(e),Function.apply(null,n).apply(null,r)}
// this is essentially the "update sugar" function from daleharvey/pouchdb#1388
// the diffFun tells us what delta to apply to the doc.  it either returns
// the doc, or false if it doesn't need to do an update after all
function fe(e,t,n){return new Promise((function(r,o){e.get(t,(function(i,s){if(i){
/* istanbul ignore next */
if(404!==i.status)return o(i);s={}}
// the user might change the _rev, so save it for posterity
var a=s._rev,u=n(s);if(!u)
// if the diffFun returns falsy, we short-circuit as
// an optimization
return r({updated:!1,rev:a});
// users aren't allowed to modify these values,
// so reset them here
u._id=t,u._rev=a,r(function(e,t,n){return e.put(t).then((function(e){return{updated:!0,rev:e.rev}}),(function(r){
/* istanbul ignore next */
if(409!==r.status)throw r;return fe(e,t._id,n)}))}(e,u,n))}))}))}var le=function(e){return atob(e)},de=function(e){return btoa(e)};
// Abstracts constructing a Blob object, so it also works in older
// browsers that don't support the native Blob constructor (e.g.
// old QtWebKit versions, Android < 4.4).
function he(e,t){
/* global BlobBuilder,MSBlobBuilder,MozBlobBuilder,WebKitBlobBuilder */
e=e||[],t=t||{};try{return new Blob(e,t)}catch(o){if("TypeError"!==o.name)throw o;for(var n=new("undefined"!=typeof BlobBuilder?BlobBuilder:"undefined"!=typeof MSBlobBuilder?MSBlobBuilder:"undefined"!=typeof MozBlobBuilder?MozBlobBuilder:WebKitBlobBuilder),r=0;r<e.length;r+=1)n.append(e[r]);return n.getBlob(t.type)}}
// From http://stackoverflow.com/questions/14967647/ (continues on next line)
// encode-decode-image-with-base64-breaks-image (2013-04-21)
function pe(e){for(var t=e.length,n=new ArrayBuffer(t),r=new Uint8Array(n),o=0;o<t;o++)r[o]=e.charCodeAt(o);return n}function ve(e,t){return he([pe(e)],{type:t})}function ye(e,t){return ve(le(e),t)}
//Can't find original post, but this is close
//http://stackoverflow.com/questions/6965107/ (continues on next line)
//converting-between-strings-and-arraybuffers
// shim for browsers that don't support it
function ge(e,t){var n=new FileReader,r="function"==typeof n.readAsBinaryString;n.onloadend=function(e){var n=e.target.result||"";if(r)return t(n);t(function(e){for(var t="",n=new Uint8Array(e),r=n.byteLength,o=0;o<r;o++)t+=String.fromCharCode(n[o]);return t}(n))},r?n.readAsBinaryString(e):n.readAsArrayBuffer(e)}function _e(e,t){ge(e,(function(e){t(e)}))}function me(e,t){_e(e,(function(e){t(de(e))}))}
// simplified API. universal browser support is assumed
// this is not used in the browser
var be=self.setImmediate||self.setTimeout;function we(e,t,n,r,o){(n>0||r<t.size)&&(
// only slice blob if we really need to
t=function(e,t,n){return e.webkitSlice?e.webkitSlice(t,n):e.slice(t,n)}(t,n,r)),function(e,t){var n=new FileReader;n.onloadend=function(e){var n=e.target.result||new ArrayBuffer(0);t(n)},n.readAsArrayBuffer(e)}(t,(function(t){e.append(t),o()}))}function ke(e,t,n,r,o){(n>0||r<t.length)&&(
// only create a substring if we really need to
t=t.substring(n,r)),e.appendBinary(t),o()}function je(e,t){var n="string"==typeof e,r=n?e.length:e.size,o=Math.min(32768,r),i=Math.ceil(r/o),s=0,a=n?new u:new u.ArrayBuffer,c=n?ke:we;function f(){be(d)}function l(){var e=function(e){return de(e)}(a.end(!0));t(e),a.destroy()}function d(){var t=s*o;s++,c(a,e,t,t+o,s<i?f:l)}d()}function Oe(e){return u.hash(e)}function Ae(e,t){var n=b(e);return t?(delete n._rev_tree,Oe(JSON.stringify(n))):a.v4().replace(/-/g,"").toLowerCase()}var qe=a.v4;// mimic old import, only v4 is ever used elsewhere
// We fetch all leafs of the revision tree, and sort them based on tree length
// and whether they were deleted, undeleted documents with the longest revision
// tree (most edits) win
// The final sort algorithm is slightly documented in a sidebar here:
// http://guide.couchdb.org/draft/conflicts.html
function Se(e){for(var t,n,r,o,i=e.rev_tree.slice();o=i.pop();){var s=o.ids,a=s[2],u=o.pos;if(a.length)// non-leaf
for(var c=0,f=a.length;c<f;c++)i.push({pos:u+1,ids:a[c]});else{var l=!!s[1].deleted,d=s[0];
// sort by deleted, then pos, then id
t&&!(r!==l?r:n!==u?n<u:t<d)||(t=d,n=u,r=l)}}return n+"-"+t}
// Pretty much all below can be combined into a higher order function to
// traverse revisions
// The return value from the callback will be passed as context to all
// children of that node
function xe(e,t){for(var n,r=e.slice();n=r.pop();)for(var o=n.pos,i=n.ids,s=i[2],a=t(0===s.length,o,i[0],n.ctx,i[1]),u=0,c=s.length;u<c;u++)r.push({pos:o+1,ids:s[u],ctx:a})}function Ee(e,t){return e.pos-t.pos}function Ce(e){var t=[];xe(e,(function(e,n,r,o,i){e&&t.push({rev:n+"-"+r,pos:n,opts:i})})),t.sort(Ee).reverse();for(var n=0,r=t.length;n<r;n++)delete t[n].pos;return t}
// returns revs of all conflicts that is leaves such that
// 1. are not deleted and
// 2. are different than winning revision
function Pe(e){for(var t=Se(e),n=Ce(e.rev_tree),r=[],o=0,i=n.length;o<i;o++){var s=n[o];s.rev===t||s.opts.deleted||r.push(s.rev)}return r}
// compact a tree by marking its non-leafs as missing,
// and return a list of revs to delete
// build up a list of all the paths to the leafs in this revision tree
function Le(e){for(var t,n=[],r=e.slice();t=r.pop();){var o=t.pos,i=t.ids,s=i[0],a=i[1],u=i[2],c=0===u.length,f=t.history?t.history.slice():[];f.push({id:s,opts:a}),c&&n.push({pos:o+1-f.length,ids:f});for(var l=0,d=u.length;l<d;l++)r.push({pos:o+1,ids:u[l],history:f})}return n.reverse()}
// for a better overview of what this is doing, read:
function De(e,t){return e.pos-t.pos}
// classic binary search
// assuming the arr is sorted, insert the item in the proper place
function $e(e,t,n){var r=function(e,t,n){for(var r,o=0,i=e.length;o<i;)n(e[r=o+i>>>1],t)<0?o=r+1:i=r;return o}(e,t,n);e.splice(r,0,t)}
// Turn a path as a flat array into a tree with a single branch.
// If any should be stemmed from the beginning of the array, that's passed
// in as the second argument
function Ie(e,t){for(var n,r,o=t,i=e.length;o<i;o++){var s=e[o],a=[s.id,s.opts,[]];r?(r[2].push(a),r=a):n=r=a}return n}
// compare the IDs of two trees
function Te(e,t){return e[0]<t[0]?-1:1}
// Merge two trees together
// The roots of tree1 and tree2 must be the same revision
function Be(e,t){for(var n=[{tree1:e,tree2:t}],r=!1;n.length>0;){var o=n.pop(),i=o.tree1,s=o.tree2;(i[1].status||s[1].status)&&(i[1].status="available"===i[1].status||"available"===s[1].status?"available":"missing");for(var a=0;a<s[2].length;a++)if(i[2][0]){for(var u=!1,c=0;c<i[2].length;c++)i[2][c][0]===s[2][a][0]&&(n.push({tree1:i[2][c],tree2:s[2][a]}),u=!0);u||(r="new_branch",$e(i[2],s[2][a],Te))}else r="new_leaf",i[2][0]=s[2][a]}return{conflicts:r,tree:e}}function Me(e,t,n){var r,o=[],i=!1,s=!1;if(!e.length)return{tree:[t],conflicts:"new_leaf"};for(var a=0,u=e.length;a<u;a++){var c=e[a];if(c.pos===t.pos&&c.ids[0]===t.ids[0])
// Paths start at the same position and have the same root, so they need
// merged
r=Be(c.ids,t.ids),o.push({pos:c.pos,ids:r.tree}),i=i||r.conflicts,s=!0;else if(!0!==n){
// The paths start at a different position, take the earliest path and
// traverse up until it as at the same point from root as the path we
// want to merge.  If the keys match we return the longer path with the
// other merged After stemming we dont want to expand the trees
var f=c.pos<t.pos?c:t,l=c.pos<t.pos?t:c,d=l.pos-f.pos,h=[],p=[];for(p.push({ids:f.ids,diff:d,parent:null,parentIdx:null});p.length>0;){var v=p.pop();if(0!==v.diff)for(var y=v.ids[2],g=0,_=y.length;g<_;g++)p.push({ids:y[g],diff:v.diff-1,parent:v.ids,parentIdx:g});else v.ids[0]===l.ids[0]&&h.push(v)}var m=h[0];m?(r=Be(m.ids,l.ids),m.parent[2][m.parentIdx]=r.tree,o.push({pos:f.pos,ids:f.ids}),i=i||r.conflicts,s=!0):o.push(c)}else o.push(c)}
// We didnt find
return s||o.push(t),o.sort(De),{tree:o,conflicts:i||"internal_node"}}
// To ensure we dont grow the revision tree infinitely, we stem old revisions
function Re(e,t,n){var r=Me(e,t),o=function(e,t){for(
// First we break out the tree into a complete list of root to leaf paths
var n,r,o=Le(e),i=0,s=o.length;i<s;i++){
// Then for each path, we cut off the start of the path based on the
// `depth` to stem to, and generate a new set of flat trees
var a,u=o[i],c=u.ids;if(c.length>t){
// only do the stemming work if we actually need to stem
n||(n={});var f=c.length-t;a={pos:u.pos+f,ids:Ie(c,f)};for(var l=0;l<f;l++){var d=u.pos+l+"-"+c[l].id;n[d]=!0}}else// no need to actually stem
a={pos:u.pos,ids:Ie(c,0)};
// Then we remerge all those flat trees together, ensuring that we dont
// connect trees that would go beyond the depth limit
r=r?Me(r,a,!0).tree:[a]}
// this is memory-heavy per Chrome profiler, avoid unless we actually stemmed
return n&&xe(r,(function(e,t,r){
// some revisions may have been removed in a branch but not in another
delete n[t+"-"+r]})),{tree:r,revs:n?Object.keys(n):[]}}(r.tree,n);return{tree:o.tree,stemmedRevs:o.revs,conflicts:r.conflicts}}
// return true if a rev exists in the rev tree, false otherwise
function Ue(e){return e.ids}
// check if a specific revision of a doc has been deleted
//  - metadata: the metadata object from the doc store
//  - rev: (optional) the revision to check. defaults to winning revision
function Ne(e,t){t||(t=Se(e));for(var n,r=t.substring(t.indexOf("-")+1),o=e.rev_tree.map(Ue);n=o.pop();){if(n[0]===r)return!!n[1].deleted;o=o.concat(n[2])}}function Fe(e){return/^_local/.test(e)}
// returns the current leaf node for a given revision
function Ke(e,t,n){d.call(this);var r=this;this.db=e;var o=(t=t?b(t):{}).complete=w((function(t,n){var o,s;t?(s="error",("listenerCount"in(o=r)?o.listenerCount(s):d.listenerCount(o,s))>0&&r.emit("error",t)):r.emit("complete",n),r.removeAllListeners(),e.removeListener("destroyed",i)}));function i(){r.cancel()}n&&(r.on("complete",(function(e){n(null,e)})),r.on("error",n)),e.once("destroyed",i),t.onChange=function(e,t,n){
/* istanbul ignore if */
r.isCancelled||function(e,t,n,r){
// isolate try/catches to avoid V8 deoptimizations
try{e.emit("change",t,n,r)}catch(e){C("error",'Error in .on("change", function):',e)}}(r,e,t,n)};var s=new Promise((function(e,n){t.complete=function(t,r){t?n(t):e(r)}}));r.once("cancel",(function(){e.removeListener("destroyed",i),t.complete(null,{status:"cancelled"})})),this.then=s.then.bind(s),this.catch=s.catch.bind(s),this.then((function(e){o(null,e)}),o),e.taskqueue.isReady?r.validateChanges(t):e.taskqueue.addTask((function(e){e?t.complete(e):r.isCancelled?r.emit("cancel"):r.validateChanges(t)}))}function Je(e,t,n){var r=[{rev:e._rev}];"all_docs"===n.style&&(r=Ce(t.rev_tree).map((function(e){return{rev:e.rev}})));var o={id:t.id,changes:r,doc:e};return Ne(t,e._rev)&&(o.deleted=!0),n.conflicts&&(o.doc._conflicts=Pe(t),o.doc._conflicts.length||delete o.doc._conflicts),o}
/*
 * A generic pouch adapter
 */function ze(e,t){return e<t?-1:e>t?1:0}
// Wrapper for functions that call the bulkdocs api with a single doc,
// if the first result is an error, return an error
function Ve(e,t){return function(n,r){n||r[0]&&r[0].error?((n=n||r[0]).docId=t,e(n)):e(null,r.length?r[0]:r)}}
// clean docs given to us by the user
// compare two docs, first by _id then by _rev
function Ge(e,t){var n=ze(e._id,t._id);return 0!==n?n:ze(e._revisions?e._revisions.start:0,t._revisions?t._revisions.start:0)}
// for every node in a revision tree computes its distance from the closest
// leaf
// all compaction is done in a queue, to avoid attaching
// too many listeners at once
function Qe(e){var t=e._compactionQueue[0],n=t.opts,r=t.callback;e.get("_local/compaction").catch((function(){return!1})).then((function(t){t&&t.last_seq&&(n.last_seq=t.last_seq),e._compact(n,(function(t,n){
/* istanbul ignore if */
t?r(t):r(null,n),s((function(){e._compactionQueue.shift(),e._compactionQueue.length&&Qe(e)}))}))}))}function We(){
// re-bind prototyped methods
for(var e in d.call(this),We.prototype)"function"==typeof this[e]&&(this[e]=this[e].bind(this))}function Ye(){this.isReady=!1,this.failed=!1,this.queue=[]}function He(e,t){
// In Node our test suite only tests this for PouchAlt unfortunately
/* istanbul ignore if */
if(!(this instanceof He))return new He(e,t);var n=this;if(t=t||{},e&&"object"==typeof e&&(e=(t=e).name,delete t.name),void 0===t.deterministic_revs&&(t.deterministic_revs=!0),this.__opts=t=b(t),n.auto_compaction=t.auto_compaction,n.prefix=He.prefix,"string"!=typeof e)throw new Error("Missing/invalid DB name");var r=function(e,t){var n=e.match(/([a-z-]*):\/\/(.*)/);if(n)
// the http adapter expects the fully qualified name
return{name:/https?/.test(n[1])?n[1]+"://"+n[2]:n[2],adapter:n[1]};var r=He.adapters,o=He.preferredAdapters,i=He.prefix,s=t.adapter;if(!s)// automatically determine adapter
for(var a=0;a<o.length&&"idb"===(s=o[a])&&"websql"in r&&x()&&localStorage["_pouch__websqldb_"+i+e];++a)
// log it, because this can be confusing during development
C("log",'PouchDB is downgrading "'+e+'" to WebSQL to avoid data loss, because it was already opened with WebSQL.');var u=r[s];
// if adapter is invalid, then an error will be thrown later
return{name:u&&"use_prefix"in u&&!u.use_prefix?e:i+e,adapter:s}}
// OK, so here's the deal. Consider this code:
//     var db1 = new PouchDB('foo');
//     var db2 = new PouchDB('foo');
//     db1.destroy();
// ^ these two both need to emit 'destroyed' events,
// as well as the PouchDB constructor itself.
// So we have one db object (whichever one got destroy() called on it)
// responsible for emitting the initial event, which then gets emitted
// by the constructor, which then broadcasts it to any other dbs
// that may have been created with the same name.
((t.prefix||"")+e,t);if(t.name=r.name,t.adapter=t.adapter||r.adapter,n.name=e,n._adapter=t.adapter,He.emit("debug",["adapter","Picked adapter: ",t.adapter]),!He.adapters[t.adapter]||!He.adapters[t.adapter].valid())throw new Error("Invalid Adapter: "+t.adapter);We.call(n),n.taskqueue=new Ye,n.adapter=t.adapter,He.adapters[t.adapter].call(n,t,(function(e){if(e)return n.taskqueue.fail(e);!function(e){function t(t){e.removeListener("closed",n),t||e.constructor.emit("destroyed",e.name)}function n(){e.removeListener("destroyed",t),e.constructor.emit("unref",e)}e.once("destroyed",t),e.once("closed",n),e.constructor.emit("ref",e)}(n),n.emit("created",n),He.emit("created",n.name),n.taskqueue.ready(n)}))}
// AbortController was introduced quite a while after fetch and
// isnt required for PouchDB to function so polyfill if needed
l(Ke,d),Ke.prototype.cancel=function(){this.isCancelled=!0,this.db.taskqueue.isReady&&this.emit("cancel")},Ke.prototype.validateChanges=function(e){var t=e.complete,n=this;
/* istanbul ignore else */He._changesFilterPlugin?He._changesFilterPlugin.validate(e,(function(r){if(r)return t(r);n.doChanges(e)})):n.doChanges(e)},Ke.prototype.doChanges=function(e){var t=this,n=e.complete;if("live"in(e=b(e))&&!("continuous"in e)&&(e.continuous=e.live),e.processChange=Je,"latest"===e.since&&(e.since="now"),e.since||(e.since=0),"now"!==e.since
/* istanbul ignore else */){if(He._changesFilterPlugin){if(He._changesFilterPlugin.normalize(e),He._changesFilterPlugin.shouldFilter(this,e))return He._changesFilterPlugin.filter(this,e)}else["doc_ids","filter","selector","view"].forEach((function(t){t in e&&C("warn",'The "'+t+'" option was passed in to changes/replicate, but pouchdb-changes-filter plugin is not installed, so it was ignored. Please install the plugin to enable filtering.')}));"descending"in e||(e.descending=!1),
// 0 and 1 should return 1 document
e.limit=0===e.limit?1:e.limit,e.complete=n;var r=this.db._changes(e);
/* istanbul ignore else */if(r&&"function"==typeof r.cancel){var o=t.cancel;t.cancel=f((function(e){r.cancel(),o.apply(this,e)}))}}else this.db.info().then((function(r){
/* istanbul ignore if */
t.isCancelled?n(null,{status:"cancelled"}):(e.since=r.update_seq,t.doChanges(e))}),n)},l(We,d),We.prototype.post=j("post",(function(e,t,n){if("function"==typeof t&&(n=t,t={}),"object"!=typeof e||Array.isArray(e))return n(Y(V));this.bulkDocs({docs:[e]},t,Ve(n,e._id))})),We.prototype.put=j("put",(function(e,t,n){if("function"==typeof t&&(n=t,t={}),"object"!=typeof e||Array.isArray(e))return n(Y(V));if(ee(e._id),Fe(e._id)&&"function"==typeof this._putLocal)return e._deleted?this._removeLocal(e,n):this._putLocal(e,n);var r,o,i,s,a=this;function u(n){"function"==typeof a._put&&!1!==t.new_edits?a._put(e,t,n):a.bulkDocs({docs:[e]},t,Ve(n,e._id))}t.force&&e._rev?(o=(r=e._rev.split("-"))[1],i=parseInt(r[0],10)+1,s=Ae(),e._revisions={start:i,ids:[s,o]},e._rev=i+"-"+s,t.new_edits=!1,u((function(t){var r=t?null:{ok:!0,id:e._id,rev:e._rev};n(t,r)}))):u(n)})),We.prototype.putAttachment=j("putAttachment",(function(e,t,n,r,o){var i=this;function s(e){var n="_rev"in e?parseInt(e._rev,10):0;return e._attachments=e._attachments||{},e._attachments[t]={content_type:o,data:r,revpos:++n},i.put(e)}return"function"==typeof o&&(o=r,r=n,n=null),
// Lets fix in https://github.com/pouchdb/pouchdb/issues/3267
/* istanbul ignore if */
void 0===o&&(o=r,r=n,n=null),o||C("warn","Attachment",t,"on document",e,"is missing content_type"),i.get(e).then((function(e){if(e._rev!==n)throw Y(B);return s(e)}),(function(t){
// create new doc
/* istanbul ignore else */
if(t.reason===T.message)return s({_id:e});throw t}))})),We.prototype.removeAttachment=j("removeAttachment",(function(e,t,n,r){var o=this;o.get(e,(function(e,i){
/* istanbul ignore if */
if(e)r(e);else if(i._rev===n){
/* istanbul ignore if */
if(!i._attachments)return r();delete i._attachments[t],0===Object.keys(i._attachments).length&&delete i._attachments,o.put(i,r)}else r(Y(B))}))})),We.prototype.remove=j("remove",(function(e,t,n,r){var o;"string"==typeof t?(
// id, rev, opts, callback style
o={_id:e,_rev:t},"function"==typeof n&&(r=n,n={})):(
// doc, opts, callback style
o=e,"function"==typeof t?(r=t,n={}):(r=n,n=t)),(n=n||{}).was_delete=!0;var i={_id:o._id,_rev:o._rev||n.rev,_deleted:!0};if(Fe(i._id)&&"function"==typeof this._removeLocal)return this._removeLocal(o,r);this.bulkDocs({docs:[i]},n,Ve(r,i._id))})),We.prototype.revsDiff=j("revsDiff",(function(e,t,n){"function"==typeof t&&(n=t,t={});var r=Object.keys(e);if(!r.length)return n(null,{});var o=0,s=new i;function a(e,t){s.has(e)||s.set(e,{missing:[]}),s.get(e).missing.push(t)}r.map((function(t){this._getRevisionTree(t,(function(i,u){if(i&&404===i.status&&"missing"===i.message)s.set(t,{missing:e[t]});else{if(i)
/* istanbul ignore next */
return n(i);!function(t,n){
// Is this fast enough? Maybe we should switch to a set simulated by a map
var r=e[t].slice(0);xe(n,(function(e,n,o,i,s){var u=n+"-"+o,c=r.indexOf(u);-1!==c&&(r.splice(c,1),
/* istanbul ignore if */
"available"!==s.status&&a(t,u))})),
// Traversing the tree is synchronous, so now `missingForId` contains
// revisions that were not found in the tree
r.forEach((function(e){a(t,e)}))}(t,u)}if(++o===r.length){
// convert LazyMap to object
var c={};return s.forEach((function(e,t){c[t]=e})),n(null,c)}}))}),this)})),
// _bulk_get API for faster replication, as described in
// https://github.com/apache/couchdb-chttpd/pull/33
// At the "abstract" level, it will just run multiple get()s in
// parallel, because this isn't much of a performance cost
// for local databases (except the cost of multiple transactions, which is
// small). The http adapter overrides this in order
// to do a more efficient single HTTP request.
We.prototype.bulkGet=j("bulkGet",(function(e,t){S(this,e,t)})),
// compact one document and fire callback
// by compacting we mean removing all revisions which
// are further from the leaf in revision tree than max_height
We.prototype.compactDocument=j("compactDocument",(function(e,t,n){var r=this;this._getRevisionTree(e,(function(o,i){
/* istanbul ignore if */
if(o)return n(o);var s=function(e){var t={},n=[];return xe(e,(function(e,r,o,i){var s=r+"-"+o;return e&&(t[s]=0),void 0!==i&&n.push({from:i,to:s}),s})),n.reverse(),n.forEach((function(e){void 0===t[e.from]?t[e.from]=1+t[e.to]:t[e.from]=Math.min(t[e.from],1+t[e.to])})),t}(i),a=[],u=[];Object.keys(s).forEach((function(e){s[e]>t&&a.push(e)})),xe(i,(function(e,t,n,r,o){var i=t+"-"+n;"available"===o.status&&-1!==a.indexOf(i)&&u.push(i)})),r._doCompaction(e,u,n)}))})),
// compact the whole database using single document
// compaction
We.prototype.compact=j("compact",(function(e,t){"function"==typeof e&&(t=e,e={});var n=this;e=e||{},n._compactionQueue=n._compactionQueue||[],n._compactionQueue.push({opts:e,callback:t}),1===n._compactionQueue.length&&Qe(n)})),We.prototype._compact=function(e,t){var n=this,r={return_docs:!1,last_seq:e.last_seq||0},o=[];n.changes(r).on("change",(function(e){o.push(n.compactDocument(e.id,0))})).on("complete",(function(e){var r=e.last_seq;Promise.all(o).then((function(){return fe(n,"_local/compaction",(function(e){return(!e.last_seq||e.last_seq<r)&&(e.last_seq=r,e)}))})).then((function(){t(null,{ok:!0})})).catch(t)})).on("error",t)},
/* Begin api wrappers. Specific functionality to storage belongs in the
   _[method] */
We.prototype.get=j("get",(function(e,t,n){if("function"==typeof t&&(n=t,t={}),"string"!=typeof e)return n(Y(M));if(Fe(e)&&"function"==typeof this._getLocal)return this._getLocal(e,n);var r=[],o=this;function i(){var i=[],s=r.length;
/* istanbul ignore if */if(!s)return n(null,i);
// order with open_revs is unspecified
r.forEach((function(r){o.get(e,{rev:r,revs:t.revs,latest:t.latest,attachments:t.attachments,binary:t.binary},(function(e,t){if(e)i.push({missing:r});else{for(
// using latest=true can produce duplicates
var o,a=0,u=i.length;a<u;a++)if(i[a].ok&&i[a].ok._rev===t._rev){o=!0;break}o||i.push({ok:t})}--s||n(null,i)}))}))}if(!t.open_revs)return this._get(e,t,(function(r,i){if(r)return r.docId=e,n(r);var s=i.doc,a=i.metadata,u=i.ctx;if(t.conflicts){var c=Pe(a);c.length&&(s._conflicts=c)}if(Ne(a,s._rev)&&(s._deleted=!0),t.revs||t.revs_info){for(var f=s._rev.split("-"),l=parseInt(f[0],10),d=f[1],h=Le(a.rev_tree),p=null,v=0;v<h.length;v++){var y=h[v],g=y.ids.map((function(e){return e.id})).indexOf(d);(g===l-1||!p&&-1!==g)&&(p=y)}
/* istanbul ignore if */if(!p)return(r=new Error("invalid rev tree")).docId=e,n(r);var _=p.ids.map((function(e){return e.id})).indexOf(s._rev.split("-")[1])+1,m=p.ids.length-_;if(p.ids.splice(_,m),p.ids.reverse(),t.revs&&(s._revisions={start:p.pos+p.ids.length-1,ids:p.ids.map((function(e){return e.id}))}),t.revs_info){var b=p.pos+p.ids.length;s._revs_info=p.ids.map((function(e){return{rev:--b+"-"+e.id,status:e.opts.status}}))}}if(t.attachments&&s._attachments){var w=s._attachments,k=Object.keys(w).length;if(0===k)return n(null,s);Object.keys(w).forEach((function(e){this._getAttachment(s._id,e,w[e],{
// Previously the revision handling was done in adapter.js
// getAttachment, however since idb-next doesnt we need to
// pass the rev through
rev:s._rev,binary:t.binary,ctx:u},(function(t,r){var o=s._attachments[e];o.data=r,delete o.stub,delete o.length,--k||n(null,s)}))}),o)}else{if(s._attachments)for(var j in s._attachments)
/* istanbul ignore else */
s._attachments.hasOwnProperty(j)&&(s._attachments[j].stub=!0);n(null,s)}}));if("all"===t.open_revs)this._getRevisionTree(e,(function(e,t){
/* istanbul ignore if */
if(e)return n(e);r=Ce(t).map((function(e){return e.rev})),i()}));else{if(!Array.isArray(t.open_revs))return n(Y(N,"function_clause"));r=t.open_revs;for(var s=0;s<r.length;s++){var a=r[s];
// looks like it's the only thing couchdb checks
if("string"!=typeof a||!/^\d+-/.test(a))return n(Y(Q))}i()}})),
// TODO: I dont like this, it forces an extra read for every
// attachment read and enforces a confusing api between
// adapter.js and the adapter implementation
We.prototype.getAttachment=j("getAttachment",(function(e,t,n,r){var o=this;n instanceof Function&&(r=n,n={}),this._get(e,n,(function(i,s){return i?r(i):s.doc._attachments&&s.doc._attachments[t]?(n.ctx=s.ctx,n.binary=!0,void o._getAttachment(e,t,s.doc._attachments[t],n,r)):r(Y(T))}))})),We.prototype.allDocs=j("allDocs",(function(e,t){if("function"==typeof e&&(t=e,e={}),e.skip=void 0!==e.skip?e.skip:0,e.start_key&&(e.startkey=e.start_key),e.end_key&&(e.endkey=e.end_key),"keys"in e){if(!Array.isArray(e.keys))return t(new TypeError("options.keys must be an array"));var n=["startkey","endkey","key"].filter((function(t){return t in e}))[0];if(n)return void t(Y(K,"Query parameter `"+n+"` is not compatible with multi-get"));if(!te(this)&&(function(e){var t="limit"in e?e.keys.slice(e.skip,e.limit+e.skip):e.skip>0?e.keys.slice(e.skip):e.keys;e.keys=t,e.skip=0,delete e.limit,e.descending&&(t.reverse(),e.descending=!1)}(e),0===e.keys.length))return this._allDocs({limit:0},t)}return this._allDocs(e,t)})),We.prototype.changes=function(e,t){return"function"==typeof e&&(t=e,e={}),
// By default set return_docs to false if the caller has opts.live = true,
// this will prevent us from collecting the set of changes indefinitely
// resulting in growing memory
(e=e||{}).return_docs="return_docs"in e?e.return_docs:!e.live,new Ke(this,e,t)},We.prototype.close=j("close",(function(e){return this._closed=!0,this.emit("closed"),this._close(e)})),We.prototype.info=j("info",(function(e){var t=this;this._info((function(n,r){if(n)return e(n);
// assume we know better than the adapter, unless it informs us
r.db_name=r.db_name||t.name,r.auto_compaction=!(!t.auto_compaction||te(t)),r.adapter=t.adapter,e(null,r)}))})),We.prototype.id=j("id",(function(e){return this._id(e)})),
/* istanbul ignore next */
We.prototype.type=function(){return"function"==typeof this._type?this._type():this.adapter},We.prototype.bulkDocs=j("bulkDocs",(function(e,t,n){if("function"==typeof t&&(n=t,t={}),t=t||{},Array.isArray(e)&&(e={docs:e}),!e||!e.docs||!Array.isArray(e.docs))return n(Y(I));for(var r=0;r<e.docs.length;++r)if("object"!=typeof e.docs[r]||Array.isArray(e.docs[r]))return n(Y(V));var o;if(e.docs.forEach((function(e){e._attachments&&Object.keys(e._attachments).forEach((function(t){o=o||function(e){return"_"===e.charAt(0)&&e+" is not a valid attachment name, attachment names cannot start with '_'"}(t),e._attachments[t].content_type||C("warn","Attachment",t,"on document",e._id,"is missing content_type")}))})),o)return n(Y(z,o));"new_edits"in t||(t.new_edits=!("new_edits"in e)||e.new_edits);var i=this;t.new_edits||te(i)||
// ensure revisions of the same doc are sorted, so that
// the local adapter processes them correctly (#2935)
e.docs.sort(Ge),function(e){for(var t=0;t<e.length;t++){var n=e[t];if(n._deleted)delete n._attachments;// ignore atts for deleted docs
else if(n._attachments)for(
// filter out extraneous keys from _attachments
var r=Object.keys(n._attachments),o=0;o<r.length;o++){var i=r[o];n._attachments[i]=O(n._attachments[i],["data","digest","content_type","length","revpos","stub"])}}}(e.docs);
// in the case of conflicts, we want to return the _ids to the user
// however, the underlying adapter may destroy the docs array, so
// create a copy here
var s=e.docs.map((function(e){return e._id}));return this._bulkDocs(e,t,(function(e,r){if(e)return n(e);
// add ids for error/conflict responses (not required for CouchDB)
if(t.new_edits||(
// this is what couch does when new_edits is false
r=r.filter((function(e){return e.error}))),!te(i))for(var o=0,a=r.length;o<a;o++)r[o].id=r[o].id||s[o];n(null,r)}))})),We.prototype.registerDependentDatabase=j("registerDependentDatabase",(function(e,t){var n=new this.constructor(e,this.__opts);fe(this,"_local/_pouch_dependentDbs",(function(t){return t.dependentDbs=t.dependentDbs||{},!t.dependentDbs[e]&&(t.dependentDbs[e]=!0,t)})).then((function(){t(null,{db:n})})).catch(t)})),We.prototype.destroy=j("destroy",(function(e,t){"function"==typeof e&&(t=e,e={});var n=this,r=!("use_prefix"in n)||n.use_prefix;function o(){
// call destroy method of the particular adaptor
n._destroy(e,(function(e,r){if(e)return t(e);n._destroyed=!0,n.emit("destroyed"),t(null,r||{ok:!0})}))}if(te(n))
// no need to check for dependent DBs if it's a remote DB
return o();n.get("_local/_pouch_dependentDbs",(function(e,i){if(e)
/* istanbul ignore if */
return 404!==e.status?t(e):o();var s=i.dependentDbs,a=n.constructor,u=Object.keys(s).map((function(e){
// use_prefix is only false in the browser
/* istanbul ignore next */
var t=r?e.replace(new RegExp("^"+a.prefix),""):e;return new a(t,n.__opts).destroy()}));Promise.all(u).then(o,t)}))})),Ye.prototype.execute=function(){var e;if(this.failed)for(;e=this.queue.shift();)e(this.failed);else for(;e=this.queue.shift();)e()},Ye.prototype.fail=function(e){this.failed=e,this.execute()},Ye.prototype.ready=function(e){this.isReady=!0,this.db=e,this.execute()},Ye.prototype.addTask=function(e){this.queue.push(e),this.failed&&this.execute()},l(He,We);var Xe="undefined"!=typeof AbortController?AbortController:function(){return{abort:function(){}}},Ze=fetch,et=Headers;He.adapters={},He.preferredAdapters=[],He.prefix="_pouch_";var tt=new d;
// this would just be "return doc[field]", but fields
// can be "deep" due to dot notation
function nt(e,t){for(var n=e,r=0,o=t.length;r<o&&(n=n[t[r]]);r++);return n}
// Converts a string in dot notation to an array of its components, with backslash escaping
function rt(e){for(
// fields may be deep (e.g. "foo.bar.baz"), so parse
var t=[],n="",r=0,o=e.length;r<o;r++){var i=e[r];"."===i?r>0&&"\\"===e[r-1]?// escaped delimiter
n=n.substring(0,n.length-1)+".":(// not escaped, so delimiter
t.push(n),n=""):// normal character
n+=i}return t.push(n),t}!function(e){Object.keys(d.prototype).forEach((function(t){"function"==typeof d.prototype[t]&&(e[t]=tt[t].bind(tt))}));
// these are created in constructor.js, and allow us to notify each DB with
// the same name that it was destroyed, via the constructor object
var t=e._destructionListeners=new i;e.on("ref",(function(e){t.has(e.name)||t.set(e.name,[]),t.get(e.name).push(e)})),e.on("unref",(function(e){if(t.has(e.name)){var n=t.get(e.name),r=n.indexOf(e);r<0||(n.splice(r,1),n.length>1?
/* istanbul ignore next */
t.set(e.name,n):t.delete(e.name))}})),e.on("destroyed",(function(e){if(t.has(e)){var n=t.get(e);t.delete(e),n.forEach((function(e){e.emit("destroyed",!0)}))}}))}(He),He.adapter=function(e,t,n){
/* istanbul ignore else */
t.valid()&&(He.adapters[e]=t,n&&He.preferredAdapters.push(e))},He.plugin=function(e){if("function"==typeof e)// function style for plugins
e(He);else{if("object"!=typeof e||0===Object.keys(e).length)throw new Error('Invalid plugin: got "'+e+'", expected an object or a function');Object.keys(e).forEach((function(t){// object style for plugins
He.prototype[t]=e[t]}))}return this.__defaults&&(He.__defaults=D({},this.__defaults)),He},He.defaults=function(e){function t(e,n){if(!(this instanceof t))return new t(e,n);n=n||{},e&&"object"==typeof e&&(e=(n=e).name,delete n.name),n=D({},t.__defaults,n),He.call(this,e,n)}return l(t,He),t.preferredAdapters=He.preferredAdapters.slice(),Object.keys(He).forEach((function(e){e in t||(t[e]=He[e])})),
// make default options transitive
// https://github.com/pouchdb/pouchdb/issues/5922
t.__defaults=D({},this.__defaults,e),t},He.fetch=function(e,t){return Ze(e,t)};var ot=["$or","$nor","$not"];function it(e){return ot.indexOf(e)>-1}function st(e){return Object.keys(e)[0]}
// flatten an array of selectors joined by an $and operator
function at(e){
// sort to ensure that e.g. if the user specified
// $and: [{$gt: 'a'}, {$gt: 'b'}], then it's collapsed into
// just {$gt: 'b'}
var t={};return e.forEach((function(e){Object.keys(e).forEach((function(n){var r=e[n];if("object"!=typeof r&&(r={$eq:r}),it(n))t[n]=r instanceof Array?r.map((function(e){return at([e])})):at([r]);else{var o=t[n]=t[n]||{};Object.keys(r).forEach((function(e){var t=r[e];return"$gt"===e||"$gte"===e?
// collapse logically equivalent gt/gte values
function(e,t,n){void 0===n.$eq&&(// do nothing
void 0!==n.$gte?"$gte"===e?t>n.$gte&&(// more specificity
n.$gte=t):// operator === '$gt'
t>=n.$gte&&(// more specificity
delete n.$gte,n.$gt=t):void 0!==n.$gt?"$gte"===e?t>n.$gt&&(// more specificity
delete n.$gt,n.$gte=t):// operator === '$gt'
t>n.$gt&&(// more specificity
n.$gt=t):n[e]=t)}
// collapse logically equivalent lt/lte values
(e,t,o):"$lt"===e||"$lte"===e?function(e,t,n){void 0===n.$eq&&(// do nothing
void 0!==n.$lte?"$lte"===e?t<n.$lte&&(// more specificity
n.$lte=t):// operator === '$gt'
t<=n.$lte&&(// more specificity
delete n.$lte,n.$lt=t):void 0!==n.$lt?"$lte"===e?t<n.$lt&&(// more specificity
delete n.$lt,n.$lte=t):// operator === '$gt'
t<n.$lt&&(// more specificity
n.$lt=t):n[e]=t)}
// combine $ne values into one array
(e,t,o):"$ne"===e?function(e,t){"$ne"in t?
// there are many things this could "not" be
t.$ne.push(e):// doesn't exist yet
t.$ne=[e]}
// add $eq into the mix
(t,o):"$eq"===e?function(e,t){
// these all have less specificity than the $eq
// TODO: check for user errors here
delete t.$gt,delete t.$gte,delete t.$lt,delete t.$lte,delete t.$ne,t.$eq=e}
//#7458: execute function mergeAndedSelectors on nested $and
(t,o):void(o[e]=t)}))}}))})),t}function ut(e){for(var t in e){if(Array.isArray(e))for(var n in e)e[n].$and&&(e[n]=at(e[n].$and));var r=e[t];"object"==typeof r&&ut(r)}return e}
//#7458: determine id $and is present in selector (at any level)
function ct(e,t){for(var n in e){"$and"===n&&(t=!0);var r=e[n];"object"==typeof r&&(t=ct(r,t))}return t}
// normalize the selector
function ft(e){var t=b(e),n=!1;
//#7458: if $and is present in selector (at any level) merge nested $and
ct(t,!1)&&("$and"in(t=ut(t))&&(t=at(t.$and)),n=!0),["$or","$nor"].forEach((function(e){e in t&&
// message each individual selector
// e.g. {foo: 'bar'} becomes {foo: {$eq: 'bar'}}
t[e].forEach((function(e){for(var t=Object.keys(e),n=0;n<t.length;n++){var r=t[n],o=e[r];"object"==typeof o&&null!==o||(e[r]={$eq:o})}}))})),"$not"in t&&(
//This feels a little like forcing, but it will work for now,
//I would like to come back to this and make the merging of selectors a little more generic
t.$not=at([t.$not]));for(var r=Object.keys(t),o=0;o<r.length;o++){var i=r[o],s=t[i];"object"!=typeof s||null===s?s={$eq:s}:"$ne"in s&&!n&&(
// I put these in an array, since there may be more than one
// but in the "mergeAnded" operation, I already take care of that
s.$ne=[s.$ne]),t[i]=s}return t}// verified by -Number.MIN_VALUE
// set to '_' for easier debugging 
function lt(e,t){if(e===t)return 0;e=dt(e),t=dt(t);var n=yt(e),r=yt(t);if(n-r!=0)return n-r;switch(typeof e){case"number":return e-t;case"boolean":return e<t?-1:1;case"string":return function(e,t){
// See: https://github.com/daleharvey/pouchdb/issues/40
// This is incompatible with the CouchDB implementation, but its the
// best we can do for now
return e===t?0:e>t?1:-1}(e,t)}return Array.isArray(e)?function(e,t){for(var n=Math.min(e.length,t.length),r=0;r<n;r++){var o=lt(e[r],t[r]);if(0!==o)return o}return e.length===t.length?0:e.length>t.length?1:-1}(e,t):function(e,t){for(var n=Object.keys(e),r=Object.keys(t),o=Math.min(n.length,r.length),i=0;i<o;i++){
// First sort the keys
var s=lt(n[i],r[i]);if(0!==s)return s;
// if the keys are equal sort the values
if(0!==(s=lt(e[n[i]],t[r[i]])))return s}return n.length===r.length?0:n.length>r.length?1:-1}
// The collation is defined by erlangs ordered terms
// the atoms null, true, false come first, then numbers, strings,
// arrays, then objects
// null/undefined/NaN/Infinity/-Infinity are all considered null
(e,t)}
// couch considers null/NaN/Infinity/-Infinity === undefined,
// for the purposes of mapreduce indexes. also, dates get stringified.
function dt(e){switch(typeof e){case"undefined":return null;case"number":return e===1/0||e===-1/0||isNaN(e)?null:e;case"object":var t=e;if(Array.isArray(e)){var n=e.length;e=new Array(n);for(var r=0;r<n;r++)e[r]=dt(t[r]);
/* istanbul ignore next */}else{if(e instanceof Date)return e.toJSON();if(null!==e)for(var o in// generic object
e={},t)if(t.hasOwnProperty(o)){var i=t[o];void 0!==i&&(e[o]=dt(i))}}}return e}
// convert the given key to a string that would be appropriate
// for lexical sorting, e.g. within a database, where the
// sorting is the same given by the collate() function.
function ht(e){return yt(e=dt(e))+""+function(e){if(null!==e)switch(typeof e){case"boolean":return e?1:0;case"number":
// conversion:
// x yyy zz...zz
// x = 0 for negative, 1 for 0, 2 for positive
// y = exponent (for negative numbers negated) moved so that it's >= 0
// z = mantisse
return function(e){if(0===e)return"1";
// convert number to exponential format for easier and
// more succinct string sorting
var t,n=e.toExponential().split(/e\+?/),r=parseInt(n[1],10),o=e<0,i=o?"0":"2";i+=""+(function(e,t,n){
/* istanbul ignore next */
for(var r="",o=3-e.length;r.length<o;)r+="0";return r}(t=((o?-r:r)- -324).toString())+t);
// then sort by the factor
var s=Math.abs(parseFloat(n[0]));// [1..10)
/* istanbul ignore next */o&&(// for negative reverse ordering
s=10-s);var a=s.toFixed(20);
// strip zeros from the end
return i+""+a.replace(/\.?0+$/,"")}
// create a comparator based on the sort object
(e);case"string":
// We've to be sure that key does not contain \u0000
// Do order-preserving replacements:
// 0 -> 1, 1
// 1 -> 1, 2
// 2 -> 2, 2
/* eslint-disable no-control-regex */
return e.replace(/\u0002/g,"").replace(/\u0001/g,"").replace(/\u0000/g,"");
/* eslint-enable no-control-regex */case"object":var t=Array.isArray(e),n=t?e:Object.keys(e),r=-1,o=n.length,i="";if(t)for(;++r<o;)i+=ht(n[r]);else for(;++r<o;){var s=n[r];i+=ht(s)+ht(e[s])}return i}return""}(e)+"\0"}function pt(e,t){var n,r=t;if("1"===e[t])n=0,t++;else{var o="0"===e[t];t++;var i="",s=e.substring(t,t+3),a=parseInt(s,10)+-324;for(
/* istanbul ignore next */
o&&(a=-a),t+=3;;){var u=e[t];if("\0"===u)break;i+=u,t++}n=1===(i=i.split(".")).length?parseInt(i,10):parseFloat(i[0]+"."+i[1])
/* istanbul ignore next */,o&&(n-=10
/* istanbul ignore next */),0!==a&&(
// parseFloat is more reliable than pow due to rounding errors
// e.g. Number.MAX_VALUE would return Infinity if we did
// num * Math.pow(10, magnitude);
n=parseFloat(n+"e"+a))}return{num:n,length:t-r}}
// move up the stack while parsing
// this function moved outside of parseIndexableString for performance
function vt(e,t){var n=e.pop();if(t.length){var r=t[t.length-1];n===r.element&&(
// popping a meta-element, e.g. an object whose value is another object
t.pop(),r=t[t.length-1]);var o=r.element,i=r.index;Array.isArray(o)?o.push(n):i===e.length-2?o[e.pop()]=n:e.push(n);// obj with key only
}}function yt(e){var t=["boolean","number","string","object"].indexOf(typeof e);
//false if -1 otherwise true, but fast!!!!1
return~t?null===e?1:Array.isArray(e)?5:t<3?t+2:t+3:
/* istanbul ignore next */
Array.isArray(e)?5:void 0}function gt(e,t,n){return n.every((function(n){var r=t[n],o=rt(n),i=nt(e,o);return it(n)?function(e,t,n){return"$or"===e?t.some((function(e){return gt(n,e,Object.keys(e))})):"$not"===e?!gt(n,t,Object.keys(t)):!t.find((function(e){return gt(n,e,Object.keys(e))}))}(n,r,e):_t(r,e,o,i)}))}function _t(e,t,n,r){return!e||(
// is matcher an object, if so continue recursion
"object"==typeof e?Object.keys(e).every((function(o){var i=e[o];return function(e,t,n,r,o){if(!kt[e])throw new Error('unknown operator "'+e+'" - should be one of $eq, $lte, $lt, $gt, $gte, $exists, $ne, $in, $nin, $size, $mod, $regex, $elemMatch, $type, $allMatch or $all');return kt[e](t,n,r,o)}(o,t,i,n,r)})):e===r)}function mt(e){return null!=e}function bt(e){return void 0!==e}function wt(e,t){return t.some((function(t){return e instanceof Array?e.indexOf(t)>-1:e===t}))}var kt={$elemMatch:function(e,t,n,r){return!!Array.isArray(r)&&0!==r.length&&("object"==typeof r[0]?r.some((function(e){return gt(e,t,Object.keys(t))})):r.some((function(r){return _t(t,e,n,r)})))},$allMatch:function(e,t,n,r){return!!Array.isArray(r)&&
/* istanbul ignore next */
0!==r.length&&("object"==typeof r[0]?r.every((function(e){return gt(e,t,Object.keys(t))})):r.every((function(r){return _t(t,e,n,r)})))},$eq:function(e,t,n,r){return bt(r)&&0===lt(r,t)},$gte:function(e,t,n,r){return bt(r)&&lt(r,t)>=0},$gt:function(e,t,n,r){return bt(r)&&lt(r,t)>0},$lte:function(e,t,n,r){return bt(r)&&lt(r,t)<=0},$lt:function(e,t,n,r){return bt(r)&&lt(r,t)<0},$exists:function(e,t,n,r){
//a field that is null is still considered to exist
return t?bt(r):!bt(r)},$mod:function(e,t,n,r){return mt(r)&&function(e,t){var n=t[0],r=t[1];if(0===n)throw new Error("Bad divisor, cannot divide by zero");if(parseInt(n,10)!==n)throw new Error("Divisor is not an integer");if(parseInt(r,10)!==r)throw new Error("Modulus is not an integer");return parseInt(e,10)===e&&e%n===r}(r,t)},$ne:function(e,t,n,r){return t.every((function(e){return 0!==lt(r,e)}))},$in:function(e,t,n,r){return mt(r)&&wt(r,t)},$nin:function(e,t,n,r){return mt(r)&&!wt(r,t)},$size:function(e,t,n,r){return mt(r)&&function(e,t){return e.length===t}(r,t)},$all:function(e,t,n,r){return Array.isArray(r)&&function(e,t){return t.every((function(t){return e.indexOf(t)>-1}))}(r,t)},$regex:function(e,t,n,r){return mt(r)&&function(e,t){return new RegExp(t).test(e)}(r,t)},$type:function(e,t,n,r){return function(e,t){switch(t){case"null":return null===e;case"boolean":return"boolean"==typeof e;case"number":return"number"==typeof e;case"string":return"string"==typeof e;case"array":return e instanceof Array;case"object":return"[object Object]"==={}.toString.call(e)}throw new Error(t+" not supported as a type.Please use one of object, string, array, number, boolean or null.")}(r,t)}};
// return true if the given doc matches the supplied selector
function jt(e,t){if(e.selector&&e.filter&&"_selector"!==e.filter){var n="string"==typeof e.filter?e.filter:"function";return t(new Error('selector invalid for filter "'+n+'"'))}t()}function Ot(e){e.view&&!e.filter&&(e.filter="_view"),e.selector&&!e.filter&&(e.filter="_selector"),e.filter&&"string"==typeof e.filter&&("_view"===e.filter?e.view=re(e.view):e.filter=re(e.filter))}function At(e,t){return t.filter&&"string"==typeof t.filter&&!t.doc_ids&&!te(e.db)}function qt(e,t){var n=t.complete;if("_view"===t.filter){if(!t.view||"string"!=typeof t.view){var r=Y(z,"`view` filter parameter not found or invalid.");return n(r)}
// fetch a view from a design doc, make it behave like a filter
var o=ne(t.view);e.db.get("_design/"+o[0],(function(r,i){
/* istanbul ignore if */
if(e.isCancelled)return n(null,{status:"cancelled"});
/* istanbul ignore next */if(r)return n(H(r));var s=i&&i.views&&i.views[o[1]]&&i.views[o[1]].map;if(!s)return n(Y(T,i.views?"missing json key: "+o[1]:"missing json key: views"));t.filter=ce(["return function(doc) {",'  "use strict";',"  var emitted = false;","  var emit = function (a, b) {","    emitted = true;","  };","  var view = "+s+";","  view(doc);","  if (emitted) {","    return true;","  }","};"].join("\n"),{}),e.doChanges(t)}))}else if(t.selector)t.filter=function(e){return function(e,t){
/* istanbul ignore if */
if("object"!=typeof t)
// match the CouchDB error message
throw new Error("Selector error: expected a JSON object");var n=function(e,t,n){if(e=e.filter((function(e){return gt(e.doc,t.selector,n)})),t.sort){
// in-memory sort
var r=function(e){function t(t){return e.map((function(e){var n=rt(st(e));return nt(t,n)}))}return function(e,n){var r,o,i=lt(t(e.doc),t(n.doc));return 0!==i?i:(r=e.doc._id)<(o=n.doc._id)?-1:r>o?1:0;
// this is what mango seems to do
}}(t.sort);e=e.sort(r),"string"!=typeof t.sort[0]&&"desc"===(o=t.sort[0])[st(o)]&&(e=e.reverse())}var o;if("limit"in t||"skip"in t){
// have to do the limit in-memory
var i=t.skip||0,s=("limit"in t?t.limit:e.length)+i;e=e.slice(i,s)}return e}([{doc:e}],{selector:t=ft(t)},Object.keys(t));return n&&1===n.length}(e,t.selector)},e.doChanges(t);else{
// fetch a filter from a design doc
var i=ne(t.filter);e.db.get("_design/"+i[0],(function(r,o){
/* istanbul ignore if */
if(e.isCancelled)return n(null,{status:"cancelled"});
/* istanbul ignore next */if(r)return n(H(r));var s=o&&o.filters&&o.filters[i[1]];if(!s)return n(Y(T,o&&o.filters?"missing json key: "+i[1]:"missing json key: filters"));t.filter=ce('"use strict";\nreturn '+s+";",{}),e.doChanges(t)}))}}function St(e){return e.reduce((function(e,t){return e[t]=!0,e}),{})}
// List of top level reserved words for doc
// TODO: remove from pouchdb-core (breaking)
He.plugin((function(e){e._changesFilterPlugin={validate:jt,normalize:Ot,shouldFilter:At,filter:qt}})),He.version="7.2.2";var xt=St(["_id","_rev","_attachments","_deleted","_revisions","_revs_info","_conflicts","_deleted_conflicts","_local_seq","_rev_tree",
//replication documents
"_replication_id","_replication_state","_replication_state_time","_replication_state_reason","_replication_stats",
// Specific to Couchbase Sync Gateway
"_removed"]),Et=St(["_attachments",
//replication documents
"_replication_id","_replication_state","_replication_state_time","_replication_state_reason","_replication_stats"]);
// List of reserved words that should end up the document
function Ct(e){if(!/^\d+-/.test(e))return Y(Q);var t=e.indexOf("-"),n=e.substring(0,t),r=e.substring(t+1);return{prefix:parseInt(n,10),id:r}}
// Preprocess documents, parse their revisions, assign an id and a
// revision for new writes that are missing them, etc
function Pt(e,t,n){var r,o,i;n||(n={deterministic_revs:!0});var s={status:"available"};if(e._deleted&&(s.deleted=!0),t)if(e._id||(e._id=qe()),o=Ae(e,n.deterministic_revs),e._rev){if((i=Ct(e._rev)).error)return i;e._rev_tree=[{pos:i.prefix,ids:[i.id,{status:"missing"},[[o,s,[]]]]}],r=i.prefix+1}else e._rev_tree=[{pos:1,ids:[o,s,[]]}],r=1;else if(e._revisions&&(e._rev_tree=function(e,t){for(var n=e.start-e.ids.length+1,r=e.ids,o=[r[0],t,[]],i=1,s=r.length;i<s;i++)o=[r[i],{status:"missing"},[o]];return[{pos:n,ids:o}]}(e._revisions,s),r=e._revisions.start,o=e._revisions.ids[0]),!e._rev_tree){if((i=Ct(e._rev)).error)return i;r=i.prefix,o=i.id,e._rev_tree=[{pos:r,ids:[o,s,[]]}]}ee(e._id),e._rev=r+"-"+o;var a={metadata:{},data:{}};for(var u in e)
/* istanbul ignore else */
if(Object.prototype.hasOwnProperty.call(e,u)){var c="_"===u[0];if(c&&!xt[u]){var f=Y(J,u);throw f.message=J.message+": "+u,f}c&&!Et[u]?a.metadata[u.slice(1)]=e[u]:a.data[u]=e[u]}return a}function Lt(e,t,n){if(e.stub)return n();"string"==typeof e.data?// input is a base64 string
function(e,t,n){var r=function(e){try{return le(e)}catch(e){return{error:Y(F,"Attachment is not a valid base64 string")}}}(e.data);if(r.error)return n(r.error);e.length=r.length,e.data="blob"===t?ve(r,e.content_type):"base64"===t?de(r):r,je(r,(function(t){e.digest="md5-"+t,n()}))}(e,t,n):// input is a blob
function(e,t,n){je(e.data,(function(r){e.digest="md5-"+r,
// size is for blobs (browser), length is for buffers (node)
e.length=e.data.size||e.data.length||0,"binary"===t?_e(e.data,(function(t){e.data=t,n()})):"base64"===t?me(e.data,(function(t){e.data=t,n()})):n()}))}(e,t,n)}function Dt(e,t,n,r,o,s,a,u,c){
// Default to 1000 locally
e=e||1e3;var f=u.new_edits,l=new i,d=0,h=t.length;function p(){++d===h&&c&&c()}t.forEach((function(e,t){if(e._id&&Fe(e._id)){var r=e._deleted?"_removeLocal":"_putLocal";n[r](e,{ctx:o},(function(e,n){s[t]=e||n,p()}))}else{var i=e.metadata.id;l.has(i)?(h--,// duplicate
l.get(i).push([e,t])):l.set(i,[[e,t]])}})),
// in the case of new_edits, the user can provide multiple docs
// with the same id. these need to be processed sequentially
l.forEach((function(t,n){var o=0;function i(){++o<t.length?c():p()}function c(){var c=t[o],l=c[0],d=c[1];if(r.has(n))!function(e,t,n,r,o,i,s,a){if(function(e,t){for(var n,r=e.slice(),o=t.split("-"),i=parseInt(o[0],10),s=o[1];n=r.pop();){if(n.pos===i&&n.ids[0]===s)return!0;for(var a=n.ids[2],u=0,c=a.length;u<c;u++)r.push({pos:n.pos+1,ids:a[u]})}return!1}(t.rev_tree,n.metadata.rev)&&!a)return r[o]=n,i();
// sometimes this is pre-calculated. historically not always
var u=t.winningRev||Se(t),c="deleted"in t?t.deleted:Ne(t,u),f="deleted"in n.metadata?n.metadata.deleted:Ne(n.metadata),l=/^1-/.test(n.metadata.rev);if(c&&!f&&a&&l){var d=n.data;d._rev=u,d._id=n.metadata.id,n=Pt(d,a)}var h=Re(t.rev_tree,n.metadata.rev_tree[0],e);if(a&&(c&&f&&"new_leaf"!==h.conflicts||!c&&"new_leaf"!==h.conflicts||c&&!f&&"new_branch"===h.conflicts)){var p=Y(B);return r[o]=p,i()}var v=n.metadata.rev;n.metadata.rev_tree=h.tree,n.stemmedRevs=h.stemmedRevs||[],
/* istanbul ignore else */
t.rev_map&&(n.metadata.rev_map=t.rev_map);
// recalculate
var y=Se(n.metadata),g=Ne(n.metadata,y),_=c===g?0:c<g?-1:1;s(n,y,g,v===y?g:Ne(n.metadata,v),!0,_,o,i)}(e,r.get(n),l,s,d,i,a,f);else{
// Ensure stemming applies to new writes as well
var h=Re([],l.metadata.rev_tree[0],e);l.metadata.rev_tree=h.tree,l.stemmedRevs=h.stemmedRevs||[],function(e,t,n){
// Cant insert new deleted documents
var r=Se(e.metadata),o=Ne(e.metadata,r);if("was_delete"in u&&o)return s[t]=Y(T,"deleted"),n();
// 4712 - detect whether a new document was inserted with a _rev
if(f&&function(e){return"missing"===e.metadata.rev_tree[0].ids[1].status}(e)){var i=Y(B);return s[t]=i,n()}a(e,r,o,o,!1,o?0:1,t,n)}(l,d,i)}}c()}))}
// IndexedDB requires a versioned database structure, so we use the
// version here to manage migrations.
var $t="document-store",It="by-sequence",Tt="attach-store",Bt="attach-seq-store",Mt="meta-store",Rt="local-store",Ut="detect-blob-support";
// The object stores created for each database
// DOC_STORE stores the document meta data, its revision history and state
// Keyed by document id
function Nt(e){try{return JSON.stringify(e)}catch(t){
/* istanbul ignore next */
return c.stringify(e)}}function Ft(e){return function(t){var n="unknown_error";t.target&&t.target.error&&(n=t.target.error.name||t.target.error.message),e(Y(G,n,t.type))}}
// Unfortunately, the metadata has to be stringified
// when it is put into the database, because otherwise
// IndexedDB can throw errors for deeply-nested objects.
// Originally we just used JSON.parse/JSON.stringify; now
// we use this custom vuvuzela library that avoids recursion.
// If we could do it all over again, we'd probably use a
// format for the revision trees other than JSON.
function Kt(e,t,n){return{data:Nt(e),winningRev:t,deletedOrLocal:n?"1":"0",seq:e.seq,// highest seq for this doc
id:e.id}}function Jt(e){if(!e)return null;var t=function(e){
// This try/catch guards against stack overflow errors.
// JSON.parse() is faster than vuvuzela.parse() but vuvuzela
// cannot overflow.
try{return JSON.parse(e)}catch(t){
/* istanbul ignore next */
return c.parse(e)}}(e.data);return t.winningRev=e.winningRev,t.deleted="1"===e.deletedOrLocal,t.seq=e.seq,t}
// read the doc back out from the database. we don't store the
// _id or _rev because we already have _doc_id_rev.
function zt(e){if(!e)return e;var t=e._doc_id_rev.lastIndexOf(":");return e._id=e._doc_id_rev.substring(0,t-1),e._rev=e._doc_id_rev.substring(t+1),delete e._doc_id_rev,e}
// Read a blob from the database, encoding as necessary
// and translating from base64 if the IDB doesn't support
// native Blobs
function Vt(e,t,n,r){n?// we have blob support
r(e?"string"!=typeof e?e:ye(e,t):he([""],{type:t})):// as base64 string
e?"string"!=typeof e?// we have blob support
ge(e,(function(e){r(de(e))})):// no blob support
r(e):r("")}function Gt(e,t,n,r){var o=Object.keys(e._attachments||{});if(!o.length)return r&&r();var i=0;function s(){++i===o.length&&r&&r()}o.forEach((function(r){t.attachments&&t.include_docs?function(e,t){var r=e._attachments[t],o=r.digest;n.objectStore(Tt).get(o).onsuccess=function(e){r.body=e.target.result.body,s()}}(e,r):(e._attachments[r].stub=!0,s())}))}
// IDB-specific postprocessing necessary because
// we don't know whether we stored a true Blob or
// a base64-encoded string, and if it's a Blob it
// needs to be read outside of the transaction context
function Qt(e,t){return Promise.all(e.map((function(e){if(e.doc&&e.doc._attachments){var n=Object.keys(e.doc._attachments);return Promise.all(n.map((function(n){var r=e.doc._attachments[n];if("body"in r){var o=r.body,i=r.content_type;return new Promise((function(s){Vt(o,i,t,(function(t){e.doc._attachments[n]=D(O(r,["digest","content_type"]),{data:t}),s()}))}))}})))}})))}function Wt(e,t,n){var r=[],o=n.objectStore(It),i=n.objectStore(Tt),s=n.objectStore(Bt),a=e.length;function u(){--a||r.length&&r.forEach((function(e){s.index("digestSeq").count(IDBKeyRange.bound(e+"::",e+"::￿",!1,!1)).onsuccess=function(t){t.target.result||
// orphaned
i.delete(e)}}))}e.forEach((function(e){var n=o.index("_doc_id_rev"),i=t+"::"+e;n.getKey(i).onsuccess=function(e){var t=e.target.result;if("number"!=typeof t)return u();o.delete(t),s.index("seq").openCursor(IDBKeyRange.only(t)).onsuccess=function(e){var t=e.target.result;if(t){var n=t.value.digestSeq.split("::")[0];r.push(n),s.delete(t.primaryKey),t.continue()}else// done
u()}}}))}function Yt(e,t,n){try{return{txn:e.transaction(t,n)}}catch(e){return{error:e}}}var Ht=new E;function Xt(e,t,n,r,o,s){for(var a,u,c,f,l,d,h,p,v=t.docs,y=0,g=v.length;y<g;y++){var _=v[y];_._id&&Fe(_._id)||(_=v[y]=Pt(_,n.new_edits,e)).error&&!h&&(h=_)}if(h)return s(h);var m=!1,b=0,w=new Array(v.length),k=new i,j=!1,O=r._meta.blobSupport?"blob":"base64";function A(){m=!0,q()}function q(){p&&m&&(
// caching the docCount saves a lot of time in allDocs() and
// info(), which is why we go to all the trouble of doing this
p.docCount+=b,d.put(p))}function S(){j||(Ht.notify(r._meta.name),s(null,w))}function x(e,t,n,r,o,i,s,a){e.metadata.winningRev=t,e.metadata.deleted=n;var u=e.data;if(u._id=e.metadata.id,u._rev=e.metadata.rev,r&&(u._deleted=!0),u._attachments&&Object.keys(u._attachments).length)return function(e,t,n,r,o,i){var s=e.data,a=0,u=Object.keys(s._attachments);function c(){a===u.length&&E(e,t,n,r,o,i)}function l(){a++,c()}u.forEach((function(n){var r=e.data._attachments[n];if(r.stub)a++,c();else{var o=r.data;delete r.data,r.revpos=parseInt(t,10),function(e,t,n){f.count(e).onsuccess=function(r){if(r.target.result)return n();// already exists
var o={digest:e,body:t};f.put(o).onsuccess=n}}(r.digest,o,l)}}))}
// map seqs to attachment digests, which
// we will need later during compaction
(e,t,n,o,s,a);b+=i,q(),E(e,t,n,o,s,a)}function E(e,t,n,o,i,s){var f=e.data,d=e.metadata;function h(i){var s=e.stemmedRevs||[];o&&r.auto_compaction&&(s=s.concat(function(e){var t=[];return xe(e.rev_tree,(function(e,n,r,o,i){"available"!==i.status||e||(t.push(n+"-"+r),i.status="missing")})),t}(e.metadata))),s&&s.length&&Wt(s,e.metadata.id,a),d.seq=i.target.result;
// Current _rev is calculated from _rev_tree on read
// delete metadata.rev;
var c=Kt(d,t,n);u.put(c).onsuccess=p}function p(){w[i]={ok:!0,id:d.id,rev:d.rev},k.set(e.metadata.id,e.metadata),function(e,t,n){var r=0,o=Object.keys(e.data._attachments||{});if(!o.length)return n();function i(){++r===o.length&&n()}function s(n){var r=e.data._attachments[n].digest,o=l.put({seq:t,digestSeq:r+"::"+t});o.onsuccess=i,o.onerror=function(e){
// this callback is for a constaint error, which we ignore
// because this docid/rev has already been associated with
// the digest (e.g. when new_edits == false)
e.preventDefault(),// avoid transaction abort
e.stopPropagation(),// avoid transaction onerror
i()}}for(var a=0;a<o.length;a++)s(o[a]);// do in parallel
}(e,d.seq,s)}f._doc_id_rev=d.id+"::"+d.rev,delete f._id,delete f._rev;var v=c.put(f);v.onsuccess=h,v.onerror=function(e){
// ConstraintError, need to update, not put (see #1638 for details)
e.preventDefault(),// avoid transaction abort
e.stopPropagation(),c.index("_doc_id_rev").getKey(f._doc_id_rev).onsuccess=function(e){c.put(f,e.target.result).onsuccess=h}}}!function(e,t,n){if(!e.length)return n();var r,o=0;function i(){o++,e.length===o&&(r?n(r):n())}e.forEach((function(e){var n=e.data&&e.data._attachments?Object.keys(e.data._attachments):[],o=0;if(!n.length)return i();function s(e){r=e,++o===n.length&&i()}for(var a in e.data._attachments)e.data._attachments.hasOwnProperty(a)&&Lt(e.data._attachments[a],t,s)}))}(v,O,(function(t){if(t)return s(t);!function(){var t=Yt(o,[$t,It,Tt,Rt,Bt,Mt],"readwrite");if(t.error)return s(t.error);(a=t.txn).onabort=Ft(s),a.ontimeout=Ft(s),a.oncomplete=S,u=a.objectStore($t),c=a.objectStore(It),f=a.objectStore(Tt),l=a.objectStore(Bt),(d=a.objectStore(Mt)).get(Mt).onsuccess=function(e){p=e.target.result,q()},function(e){var t=[];if(v.forEach((function(e){e.data&&e.data._attachments&&Object.keys(e.data._attachments).forEach((function(n){var r=e.data._attachments[n];r.stub&&t.push(r.digest)}))})),!t.length)return e();var n,r=0;function o(){++r===t.length&&e(n)}t.forEach((function(e){!function(e,t){f.get(e).onsuccess=function(n){if(n.target.result)t();else{var r=Y(W,"unknown stub attachment with digest "+e);r.status=412,t(r)}}}(e,(function(e){e&&!n&&(n=e),o()}))}))}((function(t){if(t)return j=!0,s(t);!function(){if(v.length)for(var t=0,o=0,i=v.length;o<i;o++){var s=v[o];s._id&&Fe(s._id)?c():u.get(s.metadata.id).onsuccess=f}function c(){++t===v.length&&Dt(e.revs_limit,v,r,k,a,w,x,n,A)}function f(e){var t=Jt(e.target.result);t&&k.set(t.id,t),c()}}()}))}()}))}
// Abstraction over IDBCursor and getAll()/getAllKeys() that allows us to batch our operations
// while falling back to a normal IDBCursor operation on browsers that don't support getAll() or
// getAllKeys(). This allows for a much faster implementation than just straight-up cursors, because
// we're not processing each document one-at-a-time.
function Zt(e,t,n,r,o){
// Bail out of getAll()/getAllKeys() in the following cases:
// 1) either method is unsupported - we need both
// 2) batchSize is 1 (might as well use IDBCursor)
// 3) descending – no real way to do this via getAll()/getAllKeys()
var i,s,a;function u(e){s=e.target.result,i&&o(i,s,a)}function c(e){i=e.target.result,s&&o(i,s,a)}function f(e){var t=e.target.result;if(!t)// done
return o();
// regular IDBCursor acts like a batch where batch size is always 1
o([t.key],[t.value],t)}-1===r&&(r=1e3),"function"==typeof e.getAll&&"function"==typeof e.getAllKeys&&r>1&&!n?(a={continue:function(){if(!i.length)// no more results
return o();
// fetch next batch, exclusive start
var n,a=i[i.length-1];if(t&&t.upper)try{n=IDBKeyRange.bound(a,t.upper,!0,t.upperOpen)}catch(e){if("DataError"===e.name&&0===e.code)return o();// we're done, startkey and endkey are equal
}else n=IDBKeyRange.lowerBound(a,!0);t=n,i=null,s=null,e.getAll(t,r).onsuccess=u,e.getAllKeys(t,r).onsuccess=c}},e.getAll(t,r).onsuccess=u,e.getAllKeys(t,r).onsuccess=c):n?e.openCursor(t,"prev").onsuccess=f:e.openCursor(t).onsuccess=f}
// simple shim for objectStore.getAll(), falling back to IDBCursor
function en(e,t,n){var r,o,i="startkey"in e&&e.startkey,s="endkey"in e&&e.endkey,a="key"in e&&e.key,u="keys"in e&&e.keys,c=e.skip||0,f="number"==typeof e.limit?e.limit:-1,l=!1!==e.inclusive_end;if(!u&&(o=(r=function(e,t,n,r,o){try{if(e&&t)return o?IDBKeyRange.bound(t,e,!n,!1):IDBKeyRange.bound(e,t,!1,!n);if(e)return o?IDBKeyRange.upperBound(e):IDBKeyRange.lowerBound(e);if(t)return o?IDBKeyRange.lowerBound(t,!n):IDBKeyRange.upperBound(t,!n);if(r)return IDBKeyRange.only(r)}catch(e){return{error:e}}return null}(i,s,l,a,e.descending))&&r.error)&&("DataError"!==o.name||0!==o.code))
// DataError with error code 0 indicates start is less than end, so
// can just do an empty query. Else need to throw
return n(Y(G,o.name,o.message));var d=[$t,It,Mt];e.attachments&&d.push(Tt);var h=Yt(t,d,"readonly");if(h.error)return n(h.error);var p=h.txn;p.oncomplete=function(){e.attachments?Qt(w,e.binary).then(A):A()}
// don't bother doing any requests if start > end or limit === 0
,p.onabort=Ft(n);var v,y,g=p.objectStore($t),_=p.objectStore(It),m=p.objectStore(Mt),b=_.index("_doc_id_rev"),w=[];function k(t,n){var r={id:n.id,key:n.id,value:{rev:t}};n.deleted?u&&(w.push(r),
// deleted docs are okay with "keys" requests
r.value.deleted=!0,r.doc=null):c--<=0&&(w.push(r),e.include_docs&&
// if the user specifies include_docs=true, then we don't
// want to block the main cursor while we're fetching the doc
function(t,n,r){var o=t.id+"::"+r;b.get(o).onsuccess=function(r){if(n.doc=zt(r.target.result)||{},e.conflicts){var o=Pe(t);o.length&&(n.doc._conflicts=o)}Gt(n.doc,e,p)}}(n,r,t))}function j(e){for(var t=0,n=e.length;t<n&&w.length!==f;t++){var r=e[t];if(r.error&&u)
// key was not found with "keys" requests
w.push(r);else{var o=Jt(r);k(o.winningRev,o)}}}function O(e,t,n){n&&(j(t),w.length<f&&n.continue())}function A(){var t={total_rows:v,offset:e.skip,rows:w};
/* istanbul ignore if */e.update_seq&&void 0!==y&&(t.update_seq=y),n(null,t)}return m.get(Mt).onsuccess=function(e){v=e.target.result.docCount},
/* istanbul ignore if */
e.update_seq&&function(e,t){e.openCursor(null,"prev").onsuccess=function(e){var t=e.target.result,n=void 0;return t&&t.key&&(n=t.key),function(e){e.target.result&&e.target.result.length>0&&(y=e.target.result[0])}({target:{result:[n]}})}}(_),o||0===f?void 0:u?function(e,t,n){
// It's not guaranted to be returned in right order  
var r=new Array(e.length),o=0;e.forEach((function(i,s){t.get(i).onsuccess=function(t){t.target.result?r[s]=t.target.result:r[s]={key:i,error:"not_found"},++o===e.length&&n(e,r,{})}}))}(e.keys,g,O):-1===f?function(e,t,n){if("function"!=typeof e.getAll){
// fall back to cursors
var r=[];e.openCursor(t).onsuccess=function(e){var t=e.target.result;t?(r.push(t.value),t.continue()):n({target:{result:r}})}}else
// use native getAll
e.getAll(t).onsuccess=n}(g,r,(function(t){var n=t.target.result;e.descending&&(n=n.reverse()),j(n)})):
// else do a cursor
// choose a batch size based on the skip, since we'll need to skip that many
void Zt(g,r,e.descending,f+c,O)}
// Blobs are not supported in all versions of IndexedDB, notably
// Chrome <37 and Android <5. In those versions, storing a blob will throw.
// Various other blob bugs exist in Chrome v37-42 (inclusive).
// Detecting them is expensive and confusing to users, and Chrome 37-42
// is at very low usage worldwide, so we do a hacky userAgent check instead.
// content-type bug: https://code.google.com/p/chromium/issues/detail?id=408120
// 404 bug: https://code.google.com/p/chromium/issues/detail?id=447916
// FileReader bug: https://code.google.com/p/chromium/issues/detail?id=447836
// This task queue ensures that IDB open calls are done in their own tick
var tn=!1,nn=[];function rn(){!tn&&nn.length&&(tn=!0,nn.shift()())}function on(e,t,n,r){if((e=b(e)).continuous){var s=n+":"+qe();return Ht.addListener(n,s,t,e),Ht.notify(n),{cancel:function(){Ht.removeListener(n,s)}}}var a=e.doc_ids&&new o(e.doc_ids);e.since=e.since||0;var u=e.since,c="limit"in e?e.limit:-1;0===c&&(c=1);var f,l,d,h,p=[],v=0,y=X(e),g=new i;function _(e,t,n,r){if(n.seq!==t)
// some other seq is later
return r();if(n.winningRev===e._rev)
// this is the winning doc
return r(n,e);
// fetch winning doc in separate request
var o=e._id+"::"+n.winningRev;h.get(o).onsuccess=function(e){r(n,zt(e.target.result))}}function m(){e.complete(null,{results:p,last_seq:u})}var w=[$t,It];e.attachments&&w.push(Tt);var k=Yt(r,w,"readonly");if(k.error)return e.complete(k.error);(f=k.txn).onabort=Ft(e.complete),f.oncomplete=function(){!e.continuous&&e.attachments?
// cannot guarantee that postProcessing was already done,
// so do it again
Qt(p).then(m):m()},l=f.objectStore(It),d=f.objectStore($t),h=l.index("_doc_id_rev"),Zt(l,e.since&&!e.descending?IDBKeyRange.lowerBound(e.since,!0):null,e.descending,c,(function(t,n,r){if(r&&t.length){var o=new Array(t.length),i=new Array(t.length),s=0;n.forEach((function(n,u){!function(e,t,n){if(a&&!a.has(e._id))return n();var r=g.get(e._id);if(r)// cached
return _(e,t,r,n);
// metadata not cached, have to go fetch it
d.get(e._id).onsuccess=function(o){r=Jt(o.target.result),g.set(e._id,r),_(e,t,r,n)}}(zt(n),t[u],(function(n,a){i[u]=n,o[u]=a,++s===t.length&&function(){for(var t=[],n=0,s=o.length;n<s&&v!==c;n++){var a=o[n];if(a){var u=i[n];t.push(l(u,a))}}Promise.all(t).then((function(t){for(var n=0,r=t.length;n<r;n++)t[n]&&e.onChange(t[n])})).catch(e.complete),v!==c&&r.continue()}
// Fetch all metadatas/winningdocs from this batch in parallel, then process
// them all only once all data has been collected. This is done in parallel
// because it's faster than doing it one-at-a-time.
()}))}))}function l(t,n){var r=e.processChange(n,t,e);u=r.seq=t.seq;var o=y(r);return"object"==typeof o?Promise.reject(o):o?(v++,e.return_docs&&p.push(r),
// process the attachment immediately
// for the benefit of live listeners
e.attachments&&e.include_docs?new Promise((function(t){Gt(n,e,f,(function(){Qt([r],e.binary).then((function(){t(r)}))}))})):Promise.resolve(r)):Promise.resolve()}}))}var sn,an=new i,un=new i;function cn(e,t){var n=this;!function(e,t,n){nn.push((function(){e((function(e,r){!function(e,t,n,r){try{e(t,n)}catch(t){
// Shouldn't happen, but in some odd cases
// IndexedDB implementations might throw a sync
// error, in which case this will at least log it.
r.emit("error",t)}}(t,e,r,n),tn=!1,s((function(){rn()}))}))})),rn()}((function(t){!function(e,t,n){var r=t.name,o=null;
// called when creating a fresh new database
// migration to version 2
// unfortunately "deletedOrLocal" is a misnomer now that we no longer
// store local docs in the main doc-store, but whaddyagonnado
function i(e,t){var n=e.objectStore($t);n.createIndex("deletedOrLocal","deletedOrLocal",{unique:!1}),n.openCursor().onsuccess=function(e){var r=e.target.result;if(r){var o=r.value,i=Ne(o);o.deletedOrLocal=i?"1":"0",n.put(o),r.continue()}else t()}}
// migration to version 3 (part 1)
// migration to version 3 (part 2)
function a(e,t){var n=e.objectStore(Rt),r=e.objectStore($t),o=e.objectStore(It);r.openCursor().onsuccess=function(e){var i=e.target.result;if(i){var s=i.value,a=s.id,u=Fe(a),c=Se(s);if(u){var f=a+"::"+c,l=a+"::",d=a+"::~",h=o.index("_doc_id_rev"),p=IDBKeyRange.bound(l,d,!1,!1),v=h.openCursor(p);
// remove all seq entries
// associated with this docId
v.onsuccess=function(e){if(v=e.target.result){var t=v.value;t._doc_id_rev===f&&n.put(t),o.delete(v.primaryKey),v.continue()}else
// done
r.delete(i.primaryKey),i.continue()}}else i.continue()}else t&&t()}}
// migration to version 4 (part 1)
// migration to version 4 (part 2)
function u(e,t){var n=e.objectStore(It),r=e.objectStore(Tt),o=e.objectStore(Bt);r.count().onsuccess=function(e){if(!e.target.result)return t();// done
n.openCursor().onsuccess=function(e){var n=e.target.result;if(!n)return t();// done
for(var r=n.value,i=n.primaryKey,s=Object.keys(r._attachments||{}),a={},u=0;u<s.length;u++)a[r._attachments[s[u]].digest]=!0;var c=Object.keys(a);for(u=0;u<c.length;u++){var f=c[u];o.put({seq:i,digestSeq:f+"::"+i})}n.continue()}}}
// migration to version 5
// Instead of relying on on-the-fly migration of metadata,
// this brings the doc-store to its modern form:
// - metadata.winningrev
// - metadata.seq
// - stringify the metadata when storing it
function c(e){
// ensure that every metadata has a winningRev and seq,
// which was previously created on-the-fly but better to migrate
var t=e.objectStore(It),n=e.objectStore($t);n.openCursor().onsuccess=function(e){var r=e.target.result;if(r){var o=function(e){return e.data?Jt(e):(
// old format, when we didn't store it stringified
e.deleted="1"===e.deletedOrLocal,e)}(r.value);if(o.winningRev=o.winningRev||Se(o),o.seq)return i();!function(){
// metadata.seq was added post-3.2.0, so if it's missing,
// we need to fetch it manually
var e=o.id+"::",n=o.id+"::￿",r=t.index("_doc_id_rev").openCursor(IDBKeyRange.bound(e,n)),s=0;r.onsuccess=function(e){var t=e.target.result;if(!t)return o.seq=s,i();var n=t.primaryKey;n>s&&(s=n),t.continue()}}()}function i(){var e=Kt(o,o.winningRev,o.deleted);n.put(e).onsuccess=function(){r.continue()}}}}e._meta=null,e._remote=!1,e.type=function(){return"idb"},e._id=k((function(t){t(null,e._meta.instanceId)})),e._bulkDocs=function(n,r,i){Xt(t,n,r,e,o,i)},
// First we look up the metadata in the ids database, then we fetch the
// current revision(s) from the by sequence store
e._get=function(e,t,n){var r,i,s,a=t.ctx;if(!a){var u=Yt(o,[$t,It,Tt],"readonly");if(u.error)return n(u.error);a=u.txn}function c(){n(s,{doc:r,metadata:i,ctx:a})}a.objectStore($t).get(e).onsuccess=function(e){
// we can determine the result here if:
// 1. there is no such document
// 2. the document is deleted and we don't ask about specific rev
// When we ask with opts.rev we expect the answer to be either
// doc (possibly with _deleted=true) or missing error
if(!(i=Jt(e.target.result)))return s=Y(T,"missing"),c();var n;if(t.rev)n=t.latest?function(e,t){for(var n,r=t.rev_tree.slice();n=r.pop();){var o=n.pos,i=n.ids,s=i[0],a=i[1],u=i[2],c=0===u.length,f=n.history?n.history.slice():[];if(f.push({id:s,pos:o,opts:a}),c)for(var l=0,d=f.length;l<d;l++){var h=f[l];if(h.pos+"-"+h.id===e)
// return the rev of this leaf
return o+"-"+s}for(var p=0,v=u.length;p<v;p++)r.push({pos:o+1,ids:u[p],history:f})}
/* istanbul ignore next */throw new Error("Unable to resolve latest revision for id "+t.id+", rev "+e)}(t.rev,i):t.rev;else if(n=i.winningRev,Ne(i))return s=Y(T,"deleted"),c();var o=a.objectStore(It),u=i.id+"::"+n;o.index("_doc_id_rev").get(u).onsuccess=function(e){if((r=e.target.result)&&(r=zt(r)),!r)return s=Y(T,"missing"),c();c()}}},e._getAttachment=function(e,t,n,r,i){var s;if(r.ctx)s=r.ctx;else{var a=Yt(o,[$t,It,Tt],"readonly");if(a.error)return i(a.error);s=a.txn}var u=n.digest,c=n.content_type;s.objectStore(Tt).get(u).onsuccess=function(e){Vt(e.target.result.body,c,r.binary,(function(e){i(null,e)}))}},e._info=function(t){var n,r,i=Yt(o,[Mt,It],"readonly");if(i.error)return t(i.error);var s=i.txn;s.objectStore(Mt).get(Mt).onsuccess=function(e){r=e.target.result.docCount},s.objectStore(It).openCursor(null,"prev").onsuccess=function(e){var t=e.target.result;n=t?t.key:0},s.oncomplete=function(){t(null,{doc_count:r,update_seq:n,
// for debugging
idb_attachment_format:e._meta.blobSupport?"binary":"base64"})}},e._allDocs=function(e,t){en(e,o,t)},e._changes=function(t){return on(t,e,r,o)},e._close=function(e){
// https://developer.mozilla.org/en-US/docs/IndexedDB/IDBDatabase#close
// "Returns immediately and closes the connection in a separate thread..."
o.close(),an.delete(r),e()},e._getRevisionTree=function(e,t){var n=Yt(o,[$t],"readonly");if(n.error)return t(n.error);n.txn.objectStore($t).get(e).onsuccess=function(e){var n=Jt(e.target.result);n?t(null,n.rev_tree):t(Y(T))}},
// This function removes revisions of document docId
// which are listed in revs and sets this document
// revision to to rev_tree
e._doCompaction=function(e,t,n){var r=Yt(o,[$t,It,Tt,Bt],"readwrite");if(r.error)return n(r.error);var i=r.txn;i.objectStore($t).get(e).onsuccess=function(n){var r=Jt(n.target.result);xe(r.rev_tree,(function(e,n,r,o,i){var s=n+"-"+r;-1!==t.indexOf(s)&&(i.status="missing")})),Wt(t,e,i);var o=r.winningRev,s=r.deleted;i.objectStore($t).put(Kt(r,o,s))},i.onabort=Ft(n),i.oncomplete=function(){n()}},e._getLocal=function(e,t){var n=Yt(o,[Rt],"readonly");if(n.error)return t(n.error);var r=n.txn.objectStore(Rt).get(e);r.onerror=Ft(t),r.onsuccess=function(e){var n=e.target.result;n?(delete n._doc_id_rev,// for backwards compat
t(null,n)):t(Y(T))}},e._putLocal=function(e,t,n){"function"==typeof t&&(n=t,t={}),delete e._revisions;// ignore this, trust the rev
var r=e._rev,i=e._id;e._rev=r?"0-"+(parseInt(r.split("-")[1],10)+1):"0-1";var s,a=t.ctx;if(!a){var u=Yt(o,[Rt],"readwrite");if(u.error)return n(u.error);(a=u.txn).onerror=Ft(n),a.oncomplete=function(){s&&n(null,s)}}var c,f=a.objectStore(Rt);r?(c=f.get(i)).onsuccess=function(o){var i=o.target.result;i&&i._rev===r?f.put(e).onsuccess=function(){s={ok:!0,id:e._id,rev:e._rev},t.ctx&&// return immediately
n(null,s)}:n(Y(B))}:(// new doc
(c=f.add(e)).onerror=function(e){
// constraint error, already exists
n(Y(B)),e.preventDefault(),// avoid transaction abort
e.stopPropagation()},c.onsuccess=function(){s={ok:!0,id:e._id,rev:e._rev},t.ctx&&// return immediately
n(null,s)})},e._removeLocal=function(e,t,n){"function"==typeof t&&(n=t,t={});var r,i=t.ctx;if(!i){var s=Yt(o,[Rt],"readwrite");if(s.error)return n(s.error);(i=s.txn).oncomplete=function(){r&&n(null,r)}}var a=e._id,u=i.objectStore(Rt),c=u.get(a);c.onerror=Ft(n),c.onsuccess=function(o){var i=o.target.result;i&&i._rev===e._rev?(u.delete(a),r={ok:!0,id:a,rev:"0-0"},t.ctx&&// return immediately
n(null,r)):n(Y(T))}},e._destroy=function(e,t){Ht.removeAllListeners(r);
//Close open request for "dbName" database to fix ie delay.
var n=un.get(r);n&&n.result&&(n.result.close(),an.delete(r));var o=indexedDB.deleteDatabase(r);o.onsuccess=function(){
//Remove open request from the list.
un.delete(r),x()&&r in localStorage&&delete localStorage[r],t(null,{ok:!0})},o.onerror=Ft(t)};var f=an.get(r);if(f)return o=f.idb,e._meta=f.global,s((function(){n(null,e)}));var l=indexedDB.open(r,5);un.set(r,l),l.onupgradeneeded=function(e){var t=e.target.result;if(e.oldVersion<1)return function(e){var t=e.createObjectStore($t,{keyPath:"id"});e.createObjectStore(It,{autoIncrement:!0}).createIndex("_doc_id_rev","_doc_id_rev",{unique:!0}),e.createObjectStore(Tt,{keyPath:"digest"}),e.createObjectStore(Mt,{keyPath:"id",autoIncrement:!1}),e.createObjectStore(Ut),
// added in v2
t.createIndex("deletedOrLocal","deletedOrLocal",{unique:!1}),
// added in v3
e.createObjectStore(Rt,{keyPath:"_id"});
// added in v4
var n=e.createObjectStore(Bt,{autoIncrement:!0});n.createIndex("seq","seq"),n.createIndex("digestSeq","digestSeq",{unique:!0})}(t);// new db, initial schema
// do migrations
var n=e.currentTarget.transaction;
// these migrations have to be done in this function, before
// control is returned to the event loop, because IndexedDB
e.oldVersion<3&&function(e){e.createObjectStore(Rt,{keyPath:"_id"}).createIndex("_doc_id_rev","_doc_id_rev",{unique:!0})}(t),e.oldVersion<4&&function(e){var t=e.createObjectStore(Bt,{autoIncrement:!0});t.createIndex("seq","seq"),t.createIndex("digestSeq","digestSeq",{unique:!0})}(t);var r=[i,// v1 -> v2
a,// v2 -> v3
u,// v3 -> v4
c],o=e.oldVersion;!function e(){var t=r[o-1];o++,t&&t(n,e)}()},l.onsuccess=function(t){(o=t.target.result).onversionchange=function(){o.close(),an.delete(r)},o.onabort=function(e){C("error","Database has a global failure",e.target.error),o.close(),an.delete(r)};
// Do a few setup operations (in parallel as much as possible):
// 1. Fetch meta doc
// 2. Check blob support
// 3. Calculate docCount
// 4. Generate an instanceId if necessary
// 5. Store docCount and instanceId on meta doc
var i,s,a,u,c=o.transaction([Mt,Ut,$t],"readwrite"),f=!1;function l(){void 0!==a&&f&&(e._meta={name:r,instanceId:u,blobSupport:a},an.set(r,{idb:o,global:e._meta}),n(null,e))}function d(){if(void 0!==s&&void 0!==i){var e=r+"_id";e in i?u=i[e]:i[e]=u=qe(),i.docCount=s,c.objectStore(Mt).put(i)}}
// fetch or generate the instanceId
c.objectStore(Mt).get(Mt).onsuccess=function(e){i=e.target.result||{id:Mt},d()},
// countDocs
function(e,t){e.objectStore($t).index("deletedOrLocal").count(IDBKeyRange.only("0")).onsuccess=function(e){!function(e){s=e,d()}(e.target.result)}}(c),
// check blob support
sn||(
// make sure blob support is only checked once
sn=function(e){return new Promise((function(t){var n=he([""]),r=e.objectStore(Ut).put(n,"key");r.onsuccess=function(){var e=navigator.userAgent.match(/Chrome\/(\d+)/),n=navigator.userAgent.match(/Edge\//);
// MS Edge pretends to be Chrome 42:
// https://msdn.microsoft.com/en-us/library/hh869301%28v=vs.85%29.aspx
t(n||!e||parseInt(e[1],10)>=43)},r.onerror=e.onabort=function(e){
// If the transaction aborts now its due to not being able to
// write to the database, likely due to the disk being full
e.preventDefault(),e.stopPropagation(),t(!1)}})).catch((function(){return!1;// error, so assume unsupported
}))}(c)),sn.then((function(e){a=e,l()})),
// only when the metadata put transaction has completed,
// consider the setup done
c.oncomplete=function(){f=!0,l()},c.onabort=Ft(n)},l.onerror=function(e){var t=e.target.error&&e.target.error.message;t?-1!==t.indexOf("stored database is a higher version")&&(t=new Error('This DB was created with the newer "indexeddb" adapter, but you are trying to open it with the older "idb" adapter')):t="Failed to open indexedDB, are you in private browsing mode?",C("error",t),n(Y(G,t))}}(n,e,t)}),t,n.constructor)}cn.valid=function(){
// Following #7085 buggy idb versions (typically Safari < 10.1) are
// considered valid.
// On Firefox SecurityError is thrown while referencing indexedDB if cookies
// are not allowed. `typeof indexedDB` also triggers the error.
try{
// some outdated implementations of IDB that appear on Samsung
// and HTC Android devices <4.4 are missing IDBKeyRange
return"undefined"!=typeof indexedDB&&"undefined"!=typeof IDBKeyRange}catch(e){return!1}};var fn=5e3,ln={};function dn(e){var t=e.doc||e.ok,n=t&&t._attachments;n&&Object.keys(n).forEach((function(e){var t=n[e];t.data=ye(t.data,t.content_type)}))}function hn(e){return/^_design/.test(e)?"_design/"+encodeURIComponent(e.slice(8)):/^_local/.test(e)?"_local/"+encodeURIComponent(e.slice(7)):encodeURIComponent(e)}function pn(e){return e._attachments&&Object.keys(e._attachments)?Promise.all(Object.keys(e._attachments).map((function(t){var n=e._attachments[t];if(n.data&&"string"!=typeof n.data)return new Promise((function(e){me(n.data,e)})).then((function(e){n.data=e}))}))):Promise.resolve()}
// Get all the information you possibly can about the URI given by name and
// return it as a suitable object.
// Generate a URL with the host data given by opts and the given path
function vn(e,t){return yn(e,e.db+"/"+t)}
// Generate a URL with the host data given by opts and the given path
function yn(e,t){
// If the host already has a path, then we need to have a path delimiter
// Otherwise, the path delimiter is the empty string
var n=e.path?"/":"";
// If the host already has a path, then we need to have a path delimiter
// Otherwise, the path delimiter is the empty string
return e.protocol+"://"+e.host+(e.port?":"+e.port:"")+"/"+e.path+n+t}function gn(e){return"?"+Object.keys(e).map((function(t){return t+"="+encodeURIComponent(e[t])})).join("&")}
// Implements the PouchDB API for dealing with CouchDB instances over HTTP
function _n(e,t){
// The functions that will be publicly available for HttpPouch
var r=this,o=function(e,t){
// encode db name if opts.prefix is a url (#5574)
if(function(e){if(!e.prefix)return!1;var t=ue(e.prefix).protocol;return"http"===t||"https"===t}(t)){var n=t.name.substr(t.prefix.length);
// Ensure prefix has a trailing slash
e=t.prefix.replace(/\/?$/,"/")+encodeURIComponent(n)}var r=ue(e);(r.user||r.password)&&(r.auth={username:r.user,password:r.password});
// Split the path part of the URI into parts using '/' as the delimiter
// after removing any leading '/' and any trailing '/'
var o=r.path.replace(/(^\/|\/$)/g,"").split("/");return r.db=o.pop(),
// Prevent double encoding of URI component
-1===r.db.indexOf("%")&&(r.db=encodeURIComponent(r.db)),r.path=o.join("/"),r}(e.name,e),i=vn(o,"");e=b(e);var a,u=function(t,n){if((n=n||{}).headers=n.headers||new et,n.credentials="include",e.auth||o.auth){var r=e.auth||o.auth,i=r.username+":"+r.password,s=de(unescape(encodeURIComponent(i)));n.headers.set("Authorization","Basic "+s)}var a=e.headers||{};return Object.keys(a).forEach((function(e){n.headers.append(e,a[e])})),
/* istanbul ignore if */
function(e){var t="undefined"!=typeof navigator&&navigator.userAgent?navigator.userAgent.toLowerCase():"",n=-1!==t.indexOf("msie"),r=-1!==t.indexOf("trident"),o=-1!==t.indexOf("edge"),i=!("method"in e)||"GET"===e.method;return(n||r||o)&&i}(n)&&(t+=(-1===t.indexOf("?")?"?":"&")+"_nonce="+Date.now()),(e.fetch||Ze)(t,n)};function c(e,t){return j(e,f((function(e){d().then((function(){return t.apply(this,e)})).catch((function(t){e.pop()(t)}))}))).bind(r)}function l(e,t,n){var r={};return(t=t||{}).headers=t.headers||new et,t.headers.get("Content-Type")||t.headers.set("Content-Type","application/json"),t.headers.get("Accept")||t.headers.set("Accept","application/json"),u(e,t).then((function(e){return r.ok=e.ok,r.status=e.status,e.json()})).then((function(e){if(r.data=e,!r.ok){r.data.status=r.status;var t=H(r.data);if(n)return n(t);throw t}if(Array.isArray(r.data)&&(r.data=r.data.map((function(e){return e.error||e.missing?H(e):e}))),!n)return r;n(null,r.data)}))}function d(){return e.skip_setup?Promise.resolve():
// If there is a setup in process or previous successful setup
// done then we will use that
// If previous setups have been rejected we will try again
a||((a=l(i).catch((function(e){return e&&e.status&&404===e.status?(
// Doesnt exist, create it
L(404,"PouchDB is just detecting if the remote exists."),l(i,{method:"PUT"})):Promise.reject(e)})).catch((function(e){
// If we try to create a database that already exists, skipped in
// istanbul since its catching a race condition.
/* istanbul ignore if */
return!(!e||!e.status||412!==e.status)||Promise.reject(e)}))).catch((function(){a=null})),a)}function h(e){return e.split("/").map(encodeURIComponent).join("/")}
// Get the attachment
s((function(){t(null,r)})),r._remote=!0,
/* istanbul ignore next */
r.type=function(){return"http"},r.id=c("id",(function(e){u(yn(o,"")).then((function(e){return e.json()})).catch((function(){return{}})).then((function(t){
// Bad response or missing `uuid` should not prevent ID generation.
var n=t&&t.uuid?t.uuid+o.db:vn(o,"");e(null,n)}))})),
// Sends a POST request to the host calling the couchdb _compact function
//    version: The version of CouchDB it is running
r.compact=c("compact",(function(e,t){"function"==typeof e&&(t=e,e={}),e=b(e),l(vn(o,"_compact"),{method:"POST"}).then((function(){
// Ping the http if it's finished compaction
!function n(){r.info((function(r,o){
// CouchDB may send a "compact_running:true" if it's
// already compacting. PouchDB Server doesn't.
/* istanbul ignore else */
o&&!o.compact_running?t(null,{ok:!0}):setTimeout(n,e.interval||200)}))}()}))})),r.bulkGet=j("bulkGet",(function(e,t){var n=this;function r(t){var n={};e.revs&&(n.revs=!0),e.attachments&&(
/* istanbul ignore next */n.attachments=!0),e.latest&&(n.latest=!0),l(vn(o,"_bulk_get"+gn(n)),{method:"POST",body:JSON.stringify({docs:e.docs})}).then((function(n){e.attachments&&e.binary&&n.data.results.forEach((function(e){e.docs.forEach(dn)})),t(null,n.data)})).catch(t)}
/* istanbul ignore next */function i(){
// avoid "url too long error" by splitting up into multiple requests
var r=Math.ceil(e.docs.length/50),o=0,i=new Array(r);function s(e){return function(n,s){
// err is impossible because shim returns a list of errs in that case
i[e]=s.results,++o===r&&t(null,{results:Z(i)})}}for(var a=0;a<r;a++){var u=O(e,["revs","attachments","binary","latest"]);u.docs=e.docs.slice(50*a,Math.min(e.docs.length,50*(a+1))),S(n,u,s(a))}}
// mark the whole database as either supporting or not supporting _bulk_get
var s=yn(o,""),a=ln[s];
/* istanbul ignore next */"boolean"!=typeof a?
// check if this database supports _bulk_get
r((function(e,n){e?(ln[s]=!1,L(e.status,"PouchDB is just detecting if the remote supports the _bulk_get API."),i()):(ln[s]=!0,t(null,n))})):a?r(t):i()})),
// Calls GET on the host, which gets back a JSON string containing
//    couchdb: A welcome string
//    version: The version of CouchDB it is running
r._info=function(e){d().then((function(){return u(vn(o,""))})).then((function(e){return e.json()})).then((function(t){t.host=vn(o,""),e(null,t)})).catch(e)},r.fetch=function(e,t){return d().then((function(){var n="/"===e.substring(0,1)?yn(o,e.substring(1)):vn(o,e);return u(n,t)}))},
// Get the document with the given id from the database given by host.
// The id could be solely the _id in the database, or it may be a
// _design/ID or _local/ID path
r.get=c("get",(function(e,t,n){
// If no options were given, set the callback to the second parameter
"function"==typeof t&&(n=t,t={});
// List of parameters to add to the GET request
var r={};function i(e){var n=e._attachments,r=n&&Object.keys(n);if(n&&r.length)
// This limits the number of parallel xhr requests to 5 any time
// to avoid issues with maximum browser request limits
// dead simple promise pool, inspired by https://github.com/timdp/es6-promise-pool
// but much smaller in code size. limits the number of concurrent promises that are executed
return function(e,t){return new Promise((function(t,n){var r,o=0,i=0,s=0,a=e.length;function u(){++s===a?
/* istanbul ignore if */
r?n(r):t():l()}function c(){o--,u()}
/* istanbul ignore next */function f(e){o--,r=r||e,u()}function l(){for(;o<5&&i<a;)o++,e[i++]().then(c,f)}l()}))}(r.map((function(r){return function(){
// we fetch these manually in separate XHRs, because
// Sync Gateway would normally send it back as multipart/mixed,
// which we cannot parse. Also, this is more efficient than
// receiving attachments as base64-encoded strings.
return function(r){var i=n[r],s=hn(e._id)+"/"+h(r)+"?rev="+e._rev;return u(vn(o,s)).then((function(e){return"buffer"in e?e.buffer():e.blob()})).then((function(e){if(t.binary){var n=Object.getOwnPropertyDescriptor(e.__proto__,"type");return n&&!n.set||(e.type=i.content_type),e}return new Promise((function(t){me(e,t)}))})).then((function(e){delete i.stub,delete i.length,i.data=e}))}(r)}})))}(t=b(t)).revs&&(r.revs=!0),t.revs_info&&(r.revs_info=!0),t.latest&&(r.latest=!0),t.open_revs&&("all"!==t.open_revs&&(t.open_revs=JSON.stringify(t.open_revs)),r.open_revs=t.open_revs),t.rev&&(r.rev=t.rev),t.conflicts&&(r.conflicts=t.conflicts
/* istanbul ignore if */),t.update_seq&&(r.update_seq=t.update_seq),e=hn(e),l(vn(o,e+gn(r))).then((function(e){return Promise.resolve().then((function(){if(t.attachments)return n=e.data,Array.isArray(n)?Promise.all(n.map((function(e){if(e.ok)return i(e.ok)}))):i(n);var n})).then((function(){n(null,e.data)}))})).catch((function(t){t.docId=e,n(t)}))})),
// Delete the document given by doc from the database given by host.
r.remove=c("remove",(function(e,t,n,r){var i;"string"==typeof t?(
// id, rev, opts, callback style
i={_id:e,_rev:t},"function"==typeof n&&(r=n,n={})):(
// doc, opts, callback style
i=e,"function"==typeof t?(r=t,n={}):(r=n,n=t));var s=i._rev||n.rev;l(vn(o,hn(i._id))+"?rev="+s,{method:"DELETE"},r).catch(r)})),r.getAttachment=c("getAttachment",(function(e,t,r,i){"function"==typeof r&&(i=r,r={});var s,a=r.rev?"?rev="+r.rev:"",c=vn(o,hn(e))+"/"+h(t)+a;u(c,{method:"GET"}).then((function(e){if(s=e.headers.get("content-type"),e.ok)return void 0===n||n.browser||"function"!=typeof e.buffer?e.blob():e.buffer();throw e})).then((function(e){
// TODO: also remove
void 0===n||n.browser||(e.type=s),i(null,e)})).catch((function(e){i(e)}))})),
// Remove the attachment given by the id and rev
r.removeAttachment=c("removeAttachment",(function(e,t,n,r){l(vn(o,hn(e)+"/"+h(t))+"?rev="+n,{method:"DELETE"},r).catch(r)})),
// Add the attachment given by blob and its contentType property
// to the document with the given id, the revision given by rev, and
// add it to the database given by host.
r.putAttachment=c("putAttachment",(function(e,t,n,r,i,s){"function"==typeof i&&(s=i,i=r,r=n,n=null);var a=hn(e)+"/"+h(t),u=vn(o,a);if(n&&(u+="?rev="+n),"string"==typeof r){
// input is assumed to be a base64 string
var c;try{c=le(r)}catch(e){return s(Y(F,"Attachment is not a valid base64 string"))}r=c?ve(c,i):""}
// Add the attachment
l(u,{headers:new et({"Content-Type":i}),method:"PUT",body:r},s).catch(s)})),
// Update/create multiple documents given by req in the database
// given by host.
r._bulkDocs=function(e,t,n){
// If new_edits=false then it prevents the database from creating
// new revision numbers for the documents. Instead it just uses
// the old ones. This is used in database replication.
e.new_edits=t.new_edits,d().then((function(){return Promise.all(e.docs.map(pn))})).then((function(){
// Update/create the documents
return l(vn(o,"_bulk_docs"),{method:"POST",body:JSON.stringify(e)},n)})).catch(n)},
// Update/create document
r._put=function(e,t,n){d().then((function(){return pn(e)})).then((function(){return l(vn(o,hn(e._id)),{method:"PUT",body:JSON.stringify(e)})})).then((function(e){n(null,e.data)})).catch((function(t){t.docId=e&&e._id,n(t)}))},
// Get a listing of the documents in the database given
// by host and ordered by increasing id.
r.allDocs=c("allDocs",(function(e,t){"function"==typeof e&&(t=e,e={});
// List of parameters to add to the GET request
var n,r={},i="GET";(e=b(e)).conflicts&&(r.conflicts=!0
/* istanbul ignore if */),e.update_seq&&(r.update_seq=!0),e.descending&&(r.descending=!0),e.include_docs&&(r.include_docs=!0),
// added in CouchDB 1.6.0
e.attachments&&(r.attachments=!0),e.key&&(r.key=JSON.stringify(e.key)),e.start_key&&(e.startkey=e.start_key),e.startkey&&(r.startkey=JSON.stringify(e.startkey)),e.end_key&&(e.endkey=e.end_key),e.endkey&&(r.endkey=JSON.stringify(e.endkey)),void 0!==e.inclusive_end&&(r.inclusive_end=!!e.inclusive_end),void 0!==e.limit&&(r.limit=e.limit),void 0!==e.skip&&(r.skip=e.skip);var s=gn(r);void 0!==e.keys&&(i="POST",n={keys:e.keys}),l(vn(o,"_all_docs"+s),{method:i,body:JSON.stringify(n)}).then((function(n){e.include_docs&&e.attachments&&e.binary&&n.data.rows.forEach(dn),t(null,n.data)})).catch(t)})),
// Get a list of changes made to documents in the database given by host.
// TODO According to the README, there should be two other methods here,
// api.changes.addListener and api.changes.removeListener.
r._changes=function(e){
// We internally page the results of a changes request, this means
// if there is a large set of changes to be returned we can start
// processing them quicker instead of waiting on the entire
// set of changes to return and attempting to process them at once
var t="batch_size"in e?e.batch_size:25;(e=b(e)).continuous&&!("heartbeat"in e)&&(e.heartbeat=1e4);var n="timeout"in e?e.timeout:3e4;
// ensure CHANGES_TIMEOUT_BUFFER applies
"timeout"in e&&e.timeout&&n-e.timeout<fn&&(n=e.timeout+fn
/* istanbul ignore if */),"heartbeat"in e&&e.heartbeat&&n-e.heartbeat<fn&&(n=e.heartbeat+fn);var r={};"timeout"in e&&e.timeout&&(r.timeout=e.timeout);var i=void 0!==e.limit&&e.limit,a=i;
// If opts.query_params exists, pass it through to the changes request.
// These parameters may be used by the filter on the source database.
if(e.style&&(r.style=e.style),(e.include_docs||e.filter&&"function"==typeof e.filter)&&(r.include_docs=!0),e.attachments&&(r.attachments=!0),e.continuous&&(r.feed="longpoll"),e.seq_interval&&(r.seq_interval=e.seq_interval),e.conflicts&&(r.conflicts=!0),e.descending&&(r.descending=!0
/* istanbul ignore if */),e.update_seq&&(r.update_seq=!0),"heartbeat"in e&&e.heartbeat&&(r.heartbeat=e.heartbeat),e.filter&&"string"==typeof e.filter&&(r.filter=e.filter),e.view&&"string"==typeof e.view&&(r.filter="_view",r.view=e.view),e.query_params&&"object"==typeof e.query_params)for(var u in e.query_params)
/* istanbul ignore else */
e.query_params.hasOwnProperty(u)&&(r[u]=e.query_params[u]);var c,f="GET";e.doc_ids?(
// set this automagically for the user; it's annoying that couchdb
// requires both a "filter" and a "doc_ids" param.
r.filter="_doc_ids",f="POST",c={doc_ids:e.doc_ids}):e.selector&&(
// set this automagically for the user, similar to above
r.filter="_selector",f="POST",c={selector:e.selector});var h,p=new Xe,v=function(n,s){if(!e.aborted){r.since=n,
// "since" can be any kind of json object in Cloudant/CouchDB 2.x
/* istanbul ignore next */
"object"==typeof r.since&&(r.since=JSON.stringify(r.since)),e.descending?i&&(r.limit=a):r.limit=!i||a>t?t:a;
// Set the options for the ajax call
var u=vn(o,"_changes"+gn(r)),v={signal:p.signal,method:f,body:JSON.stringify(c)};h=n,
/* istanbul ignore if */
e.aborted||
// Get the changes
d().then((function(){return l(u,v,s)})).catch(s)}},y={results:[]},g=function(n,r){if(!e.aborted){var o=0;
// If the result of the ajax call (res) contains changes (res.results)
if(r&&r.results){o=r.results.length,y.last_seq=r.last_seq;var u=null,c=null;
// Attach 'pending' property if server supports it (CouchDB 2.0+)
/* istanbul ignore if */"number"==typeof r.pending&&(u=r.pending),"string"!=typeof y.last_seq&&"number"!=typeof y.last_seq||(c=y.last_seq),e.query_params,r.results=r.results.filter((function(t){a--;var n=X(e)(t);return n&&(e.include_docs&&e.attachments&&e.binary&&dn(t),e.return_docs&&y.results.push(t),e.onChange(t,u,c)),n}))}else if(n)
// In case of an error, stop listening for changes and call
// opts.complete
return e.aborted=!0,void e.complete(n);
// The changes feed may have timed out with no results
// if so reuse last update sequence
r&&r.last_seq&&(h=r.last_seq);var f=i&&a<=0||r&&o<t||e.descending;(!e.continuous||i&&a<=0)&&f?
// We're done, call the callback
e.complete(null,y):
// Queue a call to fetch again with the newest sequence number
s((function(){v(h,g)}))}};
// Return a method to cancel this method from processing any more
return v(e.since||0,g),{cancel:function(){e.aborted=!0,p.abort()}}},
// Given a set of document/revision IDs (given by req), tets the subset of
// those that do NOT correspond to revisions stored in the database.
// See http://wiki.apache.org/couchdb/HttpPostRevsDiff
r.revsDiff=c("revsDiff",(function(e,t,n){
// If no options were given, set the callback to be the second parameter
"function"==typeof t&&(n=t,t={}),
// Get the missing document/revision IDs
l(vn(o,"_revs_diff"),{method:"POST",body:JSON.stringify(e)},n).catch(n)})),r._close=function(e){e()},r._destroy=function(e,t){l(vn(o,""),{method:"DELETE"}).then((function(e){t(null,e)})).catch((function(e){
/* istanbul ignore if */
404===e.status?t(null,{ok:!0}):t(e)}))}}
// HttpPouch is a valid adapter.
function mn(e){this.status=400,this.name="query_parse_error",this.message=e,this.error=!0;try{Error.captureStackTrace(this,mn)}catch(e){}}function bn(e){this.status=404,this.name="not_found",this.message=e,this.error=!0;try{Error.captureStackTrace(this,bn)}catch(e){}}function wn(e){this.status=500,this.name="invalid_value",this.message=e,this.error=!0;try{Error.captureStackTrace(this,wn)}catch(e){}}function kn(e,t){return t&&e.then((function(e){s((function(){t(null,e)}))}),(function(e){s((function(){t(e)}))})),e}function jn(e,t){return function(){var n=arguments,r=this;return e.add((function(){return t.apply(r,n)}))}}
// uniq an array of strings, order not guaranteed
// similar to underscore/lodash _.uniq
function On(e){var t=new o(e),n=new Array(t.size),r=-1;return t.forEach((function(e){n[++r]=e})),n}function An(e){var t=new Array(e.size),n=-1;return e.forEach((function(e,r){t[++n]=r})),t}function qn(e){return new wn("builtin "+e+" function requires map values to be numbers or number arrays")}function Sn(e){for(var t=0,n=0,r=e.length;n<r;n++){var o=e[n];if("number"!=typeof o){if(!Array.isArray(o))// not array/number
throw qn("_sum");
// lists of numbers are also allowed, sum them separately
t="number"==typeof t?[t]:t;for(var i=0,s=o.length;i<s;i++){var a=o[i];if("number"!=typeof a)throw qn("_sum");void 0===t[i]?t.push(a):t[i]+=a}}else"number"==typeof t?t+=o:// add number to array
t[0]+=o}return t}_n.valid=function(){return!0},l(mn,Error),l(bn,Error),l(wn,Error);var xn=C.bind(null,"log"),En=Array.isArray,Cn=JSON.parse;function Pn(e,t){return ce("return ("+e.replace(/;\s*$/,"")+");",{emit:t,sum:Sn,log:xn,isArray:En,toJSON:Cn})}
/*
 * Simple task queue to sequentialize actions. Assumes
 * callbacks will eventually fire (once).
 */function Ln(){this.promise=new Promise((function(e){e()}))}function Dn(e){if(!e)return"undefined";// backwards compat for empty reduce
// for backwards compat with mapreduce, functions/strings are stringified
// as-is. everything else is JSON-stringified.
switch(typeof e){case"function":case"string":
// e.g. a mapreduce built-in _reduce function
return e.toString();default:
// e.g. a JSON object in the case of mango queries
return JSON.stringify(e)}}
/* create a string signature for a view so we can cache it and uniq it */function $n(e,t,n,r,o,i){var s,a=function(e,t){
// the "undefined" part is for backwards compatibility
return Dn(e)+Dn(t)+"undefined"}(n,r);if(!o&&
// cache this to ensure we don't try to update the same view twice
(s=e._cachedViews=e._cachedViews||{})[a])return s[a];var u=e.info().then((function(u){var c=u.db_name+"-mrview-"+(o?"temp":Oe(a));
// save the view name in the source db so it can be cleaned up if necessary
// (e.g. when the _design doc is deleted, remove all associated view data)
return fe(e,"_local/"+i,(function(e){e.views=e.views||{};var n=t;-1===n.indexOf("/")&&(n=t+"/"+t);var r=e.views[n]=e.views[n]||{};
/* istanbul ignore if */if(!r[c])return r[c]=!0,e})).then((function(){return e.registerDependentDatabase(c).then((function(t){var o=t.db;o.auto_compaction=!0;var i={name:c,db:o,sourceDB:e,adapter:e.adapter,mapFun:n,reduceFun:r};return i.db.get("_local/lastSeq").catch((function(e){
/* istanbul ignore if */
if(404!==e.status)throw e})).then((function(e){return i.seq=e?e.seq:0,s&&i.db.once("destroyed",(function(){delete s[a]})),i}))}))}))}));return s&&(s[a]=u),u}Ln.prototype.add=function(e){return this.promise=this.promise.catch((function(){
// just recover
})).then((function(){return e()})),this.promise},Ln.prototype.finish=function(){return this.promise};var In={},Tn=new Ln;function Bn(e){
// can be either 'ddocname/viewname' or just 'viewname'
// (where the ddoc name is the same)
return-1===e.indexOf("/")?[e,e]:e.split("/")}function Mn(e,t){try{e.emit("error",t)}catch(e){C("error","The user's map/reduce function threw an uncaught error.\nYou can debug this error by doing:\nmyDatabase.on('error', function (err) { debugger; });\nPlease double-check your map/reduce function."),C("error",t)
/**
 * Returns an "abstract" mapreduce object of the form:
 *
 *   {
 *     query: queryFun,
 *     viewCleanup: viewCleanupFun
 *   }
 *
 * Arguments are:
 *
 * localDoc: string
 *   This is for the local doc that gets saved in order to track the
 *   "dependent" DBs and clean them up for viewCleanup. It should be
 *   unique, so that indexer plugins don't collide with each other.
 * mapper: function (mapFunDef, emit)
 *   Returns a map function based on the mapFunDef, which in the case of
 *   normal map/reduce is just the de-stringified function, but may be
 *   something else, such as an object in the case of pouchdb-find.
 * reducer: function (reduceFunDef)
 *   Ditto, but for reducing. Modules don't have to support reducing
 *   (e.g. pouchdb-find).
 * ddocValidator: function (ddoc, viewName)
 *   Throws an error if the ddoc or viewName is not valid.
 *   This could be a way to communicate to the user that the configuration for the
 *   indexer is invalid.
 */}}var Rn=function(e,t){return Sn(t)},Un=function(e,t){return t.length},Nn=function(e,t){return{sum:Sn(t),min:Math.min.apply(null,t),max:Math.max.apply(null,t),count:t.length,sumsqr:
// no need to implement rereduce=true, because Pouch
// will never call it
function(e){for(var t=0,n=0,r=e.length;n<r;n++){var o=e[n];t+=o*o}return t}(t)}},Fn=function(e,t,n,r){function a(e,t,n){
// emit an event if there was an error thrown by a map function.
// putting try/catches in a single function also avoids deoptimizations.
try{t(n)}catch(t){Mn(e,t)}}function u(e,t,n,r,o){
// same as above, but returning the result or an error. there are two separate
// functions to avoid extra memory allocations since the tryCode() case is used
// for custom map functions (common) vs this function, which is only used for
// custom reduce functions (rare)
try{return{output:t(n,r,o)}}catch(t){return Mn(e,t),{error:t}}}function c(e,t){var n=lt(e.key,t.key);return 0!==n?n:lt(e.value,t.value)}function l(e,t,n){return n=n||0,"number"==typeof t?e.slice(n,t+n):n>0?e.slice(n):e}function d(e){var t=e.value;
// Users can explicitly specify a joined doc _id, or it
// defaults to the doc _id that emitted the key/value.
return t&&"object"==typeof t&&t._id||e.id}function h(e){return function(t){return e.include_docs&&e.attachments&&e.binary&&function(e){e.rows.forEach((function(e){var t=e.doc&&e.doc._attachments;t&&Object.keys(t).forEach((function(e){var n=t[e];t[e].data=ye(n.data,n.content_type)}))}))}(t),t}}function p(e,t,n,r){
// add an http param from opts to params, optionally json-encoded
var o=t[e];void 0!==o&&(r&&(o=encodeURIComponent(JSON.stringify(o))),n.push(e+"="+o))}function v(e){if(void 0!==e){var t=Number(e);
// prevents e.g. '1foo' or '1.1' being coerced to 1
return isNaN(t)||t!==parseInt(e,10)?e:t}}function y(e,t){var n=e.descending?"endkey":"startkey",r=e.descending?"startkey":"endkey";if(void 0!==e[n]&&void 0!==e[r]&&lt(e[n],e[r])>0)throw new mn("No rows can match your key range, reverse your start_key and end_key or set {descending : true}");if(t.reduce&&!1!==e.reduce){if(e.include_docs)throw new mn("{include_docs:true} is invalid for reduce");if(e.keys&&e.keys.length>1&&!e.group&&!e.group_level)throw new mn("Multi-key fetches for reduce views must use {group: true}")}["group_level","limit","skip"].forEach((function(t){var n=function(e){if(e){if("number"!=typeof e)return new mn('Invalid value for integer: "'+e+'"');if(e<0)return new mn('Invalid value for positive integer: "'+e+'"')}}(e[t]);if(n)throw n}))}function g(e){return function(t){
/* istanbul ignore else */
if(404===t.status)return e;throw t}}
// returns a promise for a list of docs to update, based on the input docId.
// the order doesn't matter, because post-3.2.0, bulkDocs
// is an atomic operation in all three adapters.
function _(e,t,n){var r="_local/doc_"+e,i={_id:r,keys:[]},s=n.get(e),a=s[0];return(function(e){
// only return true if the current change is 1-
// and there are no other leafs
return 1===e.length&&/^1-/.test(e[0].rev)}(s[1])?Promise.resolve(i):t.db.get(r).catch(g(i))).then((function(e){return function(e){return e.keys.length?t.db.allDocs({keys:e.keys,include_docs:!0}):Promise.resolve({rows:[]})}(e).then((function(t){return function(e,t){for(var n=[],r=new o,i=0,s=t.rows.length;i<s;i++){var u=t.rows[i].doc;if(u&&(n.push(u),r.add(u._id),u._deleted=!a.has(u._id),!u._deleted)){var c=a.get(u._id);"value"in c&&(u.value=c.value)}}var f=An(a);return f.forEach((function(e){if(!r.has(e)){
// new doc
var t={_id:e},o=a.get(e);"value"in o&&(t.value=o.value),n.push(t)}})),e.keys=On(f.concat(e.keys)),n.push(e),n}(e,t)}))}))}
// updates all emitted key/value docs and metaDocs in the mrview database
// for the given batch of documents from the source database
function m(e){var t="string"==typeof e?e:e.name,n=In[t];return n||(n=In[t]=new Ln),n}function b(e){return jn(m(e),(function(){return function(e){
// bind the emit function once
var t,n;var r=function(e,t){
// for temp_views one can use emit(doc, emit), see #38
if("function"==typeof e&&2===e.length){var n=e;return function(e){return n(e,t)}}return Pn(e.toString(),t)}(e.mapFun,(function(e,r){var o={id:n._id,key:dt(e)};
// Don't explicitly store the value unless it's defined and non-null.
// This saves on storage space, because often people don't use it.
null!=r&&(o.value=dt(r)),t.push(o)})),o=e.seq||0;function s(t,n){return function(){return function(e,t,n){var r="_local/lastSeq";return e.db.get(r).catch(g({_id:r,seq:0})).then((function(r){var o=An(t);return Promise.all(o.map((function(n){return _(n,e,t)}))).then((function(t){var o=Z(t);
// write all docs in a single operation, update the seq once
return r.seq=n,o.push(r),e.db.bulkDocs({docs:o})}))}))}(e,t,n)}}var u=new Ln;function f(){return e.sourceDB.changes({return_docs:!0,conflicts:!0,include_docs:!0,style:"all_docs",since:o,limit:50}).then(l)}function l(e){var t=e.results;if(t.length){var n=d(t);if(u.add(s(n,o)),!(t.length<50))return f()}}function d(s){for(var u=new i,f=0,l=s.length;f<l;f++){var d=s[f];if("_"!==d.doc._id[0]){t=[],(n=d.doc)._deleted||a(e.sourceDB,r,n),t.sort(c);var p=h(t);u.set(d.doc._id,[p,d.changes])}o=d.seq}return u}function h(e){for(var t,n=new i,r=0,o=e.length;r<o;r++){var s=e[r],a=[s.key,s.id];r>0&&0===lt(s.key,t)&&a.push(r),n.set(ht(a),s),t=s.key}return n}return f().then((function(){return u.finish()})).then((function(){e.seq=o}))}(e)}))()}function w(e,t){return jn(m(e),(function(){return function(e,t){var n,r=e.reduceFun&&!1!==t.reduce,o=t.skip||0;function s(t){return t.include_docs=!0,e.db.allDocs(t).then((function(e){return n=e.total_rows,e.rows.map((function(e){
// implicit migration - in older versions of PouchDB,
// we explicitly stored the doc as {id: ..., key: ..., value: ...}
// this is tested in a migration test
/* istanbul ignore next */
if("value"in e.doc&&"object"==typeof e.doc.value&&null!==e.doc.value){var t=Object.keys(e.doc.value).sort(),n=["id","key","value"];
// this detection method is not perfect, but it's unlikely the user
// emitted a value which was an object with these 3 exact keys
if(!(t<n||t>n))return e.doc.value}var r=function(e){
/*eslint no-constant-condition: ["error", { "checkLoops": false }]*/
for(var t=[],n=[],r=0;;){var o=e[r++];if("\0"!==o)switch(o){case"1":t.push(null);break;case"2":t.push("1"===e[r]),r++;break;case"3":var i=pt(e,r);t.push(i.num),r+=i.length;break;case"4":
/*eslint no-constant-condition: ["error", { "checkLoops": false }]*/
for(var s="";;){var a=e[r];if("\0"===a)break;s+=a,r++}
// perform the reverse of the order-preserving replacement
// algorithm (see above)
/* eslint-disable no-control-regex */s=s.replace(/\u0001\u0001/g,"\0").replace(/\u0001\u0002/g,"").replace(/\u0002\u0002/g,""),
/* eslint-enable no-control-regex */
t.push(s);break;case"5":var u={element:[],index:t.length};t.push(u.element),n.push(u);break;case"6":var c={element:{},index:t.length};t.push(c.element),n.push(c);break;
/* istanbul ignore next */default:throw new Error("bad collationIndex or unexpectedly reached end of input: "+o)}else{if(1===t.length)return t.pop();vt(t,n)}}}(e.doc._id);return{key:r[0],id:r[1],value:"value"in e.doc?e.doc.value:null}}))}))}function a(s){var a;if(a=r?function(e,t,n){0===n.group_level&&delete n.group_level;var r=n.group||n.group_level,o=function(e){var t=e.toString();return function(e){if(/^_sum/.test(e))return Rn;if(/^_count/.test(e))return Un;if(/^_stats/.test(e))return Nn;if(/^_/.test(e))throw new Error(e+" is not a supported reduce function.")}(t)||Pn(t)}(e.reduceFun),i=[],s=isNaN(n.group_level)?Number.POSITIVE_INFINITY:n.group_level;t.forEach((function(e){var t=i[i.length-1],n=r?e.key:null;if(
// only set group_level for array keys
r&&Array.isArray(n)&&(n=n.slice(0,s)),t&&0===lt(t.groupKey,n))return t.keys.push([e.key,e.id]),void t.values.push(e.value);i.push({keys:[[e.key,e.id]],values:[e.value],groupKey:n})})),t=[];for(var a=0,c=i.length;a<c;a++){var f=i[a],d=u(e.sourceDB,o,f.keys,f.values,!1);if(d.error&&d.error instanceof wn)
// CouchDB returns an error if a built-in errors out
throw d.error;t.push({
// CouchDB just sets the value to null if a non-built-in errors out
value:d.error?null:d.output,key:f.groupKey})}
// no total_rows/offset when reducing
return{rows:l(t,n.limit,n.skip)}}(e,s,t):{total_rows:n,offset:o,rows:s}
/* istanbul ignore if */,t.update_seq&&(a.update_seq=e.seq),t.include_docs){var c=On(s.map(d));return e.sourceDB.allDocs({keys:c,include_docs:!0,conflicts:t.conflicts,attachments:t.attachments,binary:t.binary}).then((function(e){var t=new i;return e.rows.forEach((function(e){t.set(e.id,e.doc)})),s.forEach((function(e){var n=d(e),r=t.get(n);r&&(e.doc=r)})),a}))}return a}if(void 0===t.keys||t.keys.length||(
// equivalent query
t.limit=0,delete t.keys),void 0!==t.keys){var c=t.keys.map((function(e){var n={startkey:ht([e]),endkey:ht([e,{}])};
/* istanbul ignore if */return t.update_seq&&(n.update_seq=!0),s(n)}));return Promise.all(c).then(Z).then(a)}// normal query, no 'keys'
var f,h,p={descending:t.descending};
/* istanbul ignore if */if(t.update_seq&&(p.update_seq=!0),"start_key"in t&&(f=t.start_key),"startkey"in t&&(f=t.startkey),"end_key"in t&&(h=t.end_key),"endkey"in t&&(h=t.endkey),void 0!==f&&(p.startkey=t.descending?ht([f,{}]):ht([f])),void 0!==h){var v=!1!==t.inclusive_end;t.descending&&(v=!v),p.endkey=ht(v?[h,{}]:[h])}if(void 0!==t.key){var y=ht([t.key]),g=ht([t.key,{}]);p.descending?(p.endkey=y,p.startkey=g):(p.startkey=y,p.endkey=g)}return r||("number"==typeof t.limit&&(p.limit=t.limit),p.skip=o),s(p).then(a)}(e,t)}))()}function k(t,n,r){
/* istanbul ignore next */
if("function"==typeof t._query)
// custom adapters can define their own api._query
// and override the default behavior
/* istanbul ignore next */
return function(e,t,n){return new Promise((function(r,o){e._query(t,n,(function(e,t){if(e)return o(e);r(t)}))}))}
// custom adapters can define their own api._viewCleanup
// and override the default behavior
/* istanbul ignore next */(t,n,r);if(te(t))return function(e,t,n){
// List of parameters to add to the PUT request
var r,o,i,s=[],a="GET";
// If keys are supplied, issue a POST to circumvent GET query string limits
// see http://wiki.apache.org/couchdb/HTTP_view_API#Querying_Options
if(
// If opts.reduce exists and is defined, then add it to the list
// of parameters.
// If reduce=false then the results are that of only the map function
// not the final result of map and reduce.
p("reduce",n,s),p("include_docs",n,s),p("attachments",n,s),p("limit",n,s),p("descending",n,s),p("group",n,s),p("group_level",n,s),p("skip",n,s),p("stale",n,s),p("conflicts",n,s),p("startkey",n,s,!0),p("start_key",n,s,!0),p("endkey",n,s,!0),p("end_key",n,s,!0),p("inclusive_end",n,s),p("key",n,s,!0),p("update_seq",n,s),s=""===(
// Format the list of parameters into a valid URI query string
s=s.join("&"))?"":"?"+s,void 0!==n.keys){var u="keys="+encodeURIComponent(JSON.stringify(n.keys));
// according to http://stackoverflow.com/a/417184/680742,
// the de facto URL length limit is 2000 characters
u.length+s.length+1<=2e3?
// If the keys are short enough, do a GET. we do this to work around
// Safari not understanding 304s on POSTs (see pouchdb/pouchdb#1239)
s+=("?"===s[0]?"&":"?")+u:(a="POST","string"==typeof t?r={keys:n.keys}:// fun is {map : mapfun}, so append to this
t.keys=n.keys)}
// We are referencing a query defined in the design doc
if("string"==typeof t){var c=Bn(t);return e.fetch("_design/"+c[0]+"/_view/"+c[1]+s,{headers:new et({"Content-Type":"application/json"}),method:a,body:JSON.stringify(r)}).then((function(e){return o=e.ok,i=e.status,e.json()})).then((function(e){if(!o)throw e.status=i,H(e);
// fail the entire request if the result contains an error
return e.rows.forEach((function(e){
/* istanbul ignore if */
if(e.value&&e.value.error&&"builtin_reduce_error"===e.value.error)throw new Error(e.reason)})),e})).then(h(n))}
// We are using a temporary view, terrible for performance, good for testing
return r=r||{},Object.keys(t).forEach((function(e){Array.isArray(t[e])?r[e]=t[e]:r[e]=t[e].toString()})),e.fetch("_temp_view"+s,{headers:new et({"Content-Type":"application/json"}),method:"POST",body:JSON.stringify(r)}).then((function(e){return o=e.ok,i=e.status,e.json()})).then((function(e){if(!o)throw e.status=i,H(e);return e})).then(h(n))}(t,n,r);if("string"!=typeof n)
// temp_view
return y(r,n),Tn.add((function(){return $n(
/* sourceDB */t,
/* viewName */"temp_view/temp_view",
/* mapFun */n.map,
/* reduceFun */n.reduce,
/* temporary */!0,
/* localDocName */e).then((function(e){return t=b(e).then((function(){return w(e,r)})),n=function(){return e.db.destroy()},t.then((function(e){return n().then((function(){return e}))}),(function(e){return n().then((function(){throw e}))}));
// Promise finally util similar to Q.finally
var t,n}))})),Tn.finish();
// persistent view
var o=n,i=Bn(o),a=i[0],u=i[1];return t.get("_design/"+a).then((function(n){var i=n.views&&n.views[u];if(!i)
// basic validator; it's assumed that every subclass would want this
throw new bn("ddoc "+n._id+" has no view named "+u);return function(e,t){var n=e.views&&e.views[t];if("string"!=typeof n.map)throw new bn("ddoc "+e._id+" has no string view named "+t+", instead found object of type: "+typeof n.map)}(n,u),y(r,i),$n(
/* sourceDB */t,
/* viewName */o,
/* mapFun */i.map,
/* reduceFun */i.reduce,
/* temporary */!1,
/* localDocName */e).then((function(e){return"ok"===r.stale||"update_after"===r.stale?("update_after"===r.stale&&s((function(){b(e)})),w(e,r)):b(e).then((function(){return w(e,r)}))}))}))}var j;return{query:function(e,t,n){var r=this;"function"==typeof t&&(n=t,t={}),t=t?function(e){return e.group_level=v(e.group_level),e.limit=v(e.limit),e.skip=v(e.skip),e}(t):{},"function"==typeof e&&(e={map:e});var o=Promise.resolve().then((function(){return k(r,e,t)}));return kn(o,n),o},viewCleanup:(j=function(){var t=this;
/* istanbul ignore next */return"function"==typeof t._viewCleanup?function(e){return new Promise((function(t,n){e._viewCleanup((function(e,r){if(e)return n(e);t(r)}))}))}(t):te(t)?function(e){return e.fetch("_view_cleanup",{headers:new et({"Content-Type":"application/json"}),method:"POST"}).then((function(e){return e.json()}))}(t):function(t){return t.get("_local/"+e).then((function(e){var n=new i;Object.keys(e.views).forEach((function(e){var t=Bn(e),r="_design/"+t[0],i=t[1],s=n.get(r);s||(s=new o,n.set(r,s)),s.add(i)}));var r={keys:An(n),include_docs:!0};return t.allDocs(r).then((function(r){var o={};r.rows.forEach((function(t){var r=t.key.substring(8);// cuts off '_design/'
n.get(t.key).forEach((function(n){var i=r+"/"+n;
/* istanbul ignore if */e.views[i]||(
// new format, without slashes, to support PouchDB 2.2.0
// migration test in pouchdb's browser.migration.js verifies this
i=n);var s=Object.keys(e.views[i]),a=t.doc&&t.doc.views&&t.doc.views[n];
// design doc deleted, or view function nonexistent
s.forEach((function(e){o[e]=o[e]||a}))}))}));var i=Object.keys(o).filter((function(e){return!o[e]})).map((function(e){return jn(m(e),(function(){return new t.constructor(e,t.__opts).destroy()}))()}));return Promise.all(i).then((function(){return{ok:!0}}))}))}),g({ok:!0}))}(t)},f((function(e){var t=e.pop(),n=j.apply(this,e);return"function"==typeof t&&kn(n,t),n})))}}("mrviews"),Kn={query:function(e,t,n){return Fn.query.call(this,e,t,n)},viewCleanup:function(e){return Fn.viewCleanup.call(this,e)}};function Jn(e){return/^1-/.test(e)}function zn(e,t){var n=Object.keys(t._attachments);return Promise.all(n.map((function(n){return e.getAttachment(t._id,n,{rev:t._rev})})))}
// Fetch all the documents from the src as described in the "diffs",
// which is a mapping of docs IDs to revisions. If the state ever
// changes to "cancelled", then the returned promise will be rejected.
// Else it will be resolved with a list of fetched documents.
var Vn="pouchdb";function Gn(e,t,n,r,o){return e.get(t).catch((function(n){if(404===n.status)return"http"!==e.adapter&&"https"!==e.adapter||L(404,"PouchDB is just checking if a remote checkpoint exists."),{session_id:r,_id:t,history:[],replicator:Vn,version:1};throw n})).then((function(i){if(!o.cancelled&&i.last_seq!==n)
// Filter out current entry for this replication
return i.history=(i.history||[]).filter((function(e){return e.session_id!==r})),
// Add the latest checkpoint to history
i.history.unshift({last_seq:n,session_id:r}),
// Just take the last pieces in history, to
// avoid really big checkpoint docs.
// see comment on history size above
i.history=i.history.slice(0,5),i.version=1,i.replicator=Vn,i.session_id=r,i.last_seq=n,e.put(i).catch((function(i){if(409===i.status)
// retry; someone is trying to write a checkpoint simultaneously
return Gn(e,t,n,r,o);throw i}));
// if the checkpoint has not changed, do not update
}))}function Qn(e,t,n,r,o){this.src=e,this.target=t,this.id=n,this.returnValue=r,this.opts=o||{}}Qn.prototype.writeCheckpoint=function(e,t){var n=this;return this.updateTarget(e,t).then((function(){return n.updateSource(e,t)}))},Qn.prototype.updateTarget=function(e,t){return this.opts.writeTargetCheckpoint?Gn(this.target,this.id,e,t,this.returnValue):Promise.resolve(!0)},Qn.prototype.updateSource=function(e,t){if(this.opts.writeSourceCheckpoint){var n=this;return Gn(this.src,this.id,e,t,this.returnValue).catch((function(e){if(Xn(e))return n.opts.writeSourceCheckpoint=!1,!0;throw e}))}return Promise.resolve(!0)};var Wn={undefined:function(e,t){
// This is the previous comparison function
return 0===lt(e.last_seq,t.last_seq)?t.last_seq:0
/* istanbul ignore next */},1:function(e,t){
// This is the comparison function ported from CouchDB
// This checkpoint comparison is ported from CouchDBs source
// they come from here:
// https://github.com/apache/couchdb-couch-replicator/blob/master/src/couch_replicator.erl#L863-L906
return function(e,t){return e.session_id===t.session_id?{last_seq:e.last_seq,history:e.history}:Yn(e.history,t.history)}(t,e).last_seq}};function Yn(e,t){
// the erlang loop via function arguments is not so easy to repeat in JS
// therefore, doing this as recursion
var n=e[0],r=e.slice(1),o=t[0],i=t.slice(1);return n&&0!==t.length?
/* istanbul ignore if */
Hn(n.session_id,t)?{last_seq:n.last_seq,history:e}:Hn(o.session_id,r)?{last_seq:o.last_seq,history:i}:Yn(r,i):{last_seq:0,history:[]}}function Hn(e,t){var n=t[0],r=t.slice(1);return!(!e||0===t.length)&&(e===n.session_id||Hn(e,r))}function Xn(e){return"number"==typeof e.status&&4===Math.floor(e.status/100)}function Zn(e,t,n,r,o){var i,a,u,c=[],f={seq:0,changes:[],docs:[]},l=!1,d=!1,h=!1,p=0,v=n.continuous||n.live||!1,y=n.batch_size||100,g=n.batches_limit||10,_=!1,m=n.doc_ids,w=n.selector,k=[],j=qe();// list of batches to be processed
o=o||{ok:!0,start_time:(new Date).toISOString(),docs_read:0,docs_written:0,doc_write_failures:0,errors:[]};var O={};function A(){return u?Promise.resolve():
// Generate a unique id particular to this replication.
// Not guaranteed to align perfectly with CouchDB's rep ids.
function(e,t,n){var r=n.doc_ids?n.doc_ids.sort(lt):"",o=n.filter?n.filter.toString():"",i="",s="",a="";
// possibility for checkpoints to be lost here as behaviour of
// JSON.stringify is not stable (see #6226)
/* istanbul ignore if */return n.selector&&(a=JSON.stringify(n.selector)),n.filter&&n.query_params&&(i=JSON.stringify(function(e){return Object.keys(e).sort(lt).reduce((function(t,n){return t[n]=e[n],t}),{})}(n.query_params))),n.filter&&"_view"===n.filter&&(s=n.view.toString()),Promise.all([e.id(),t.id()]).then((function(e){var t=e[0]+e[1]+o+s+i+r+a;return new Promise((function(e){je(t,e)}))})).then((function(e){return"_local/"+e.replace(/\//g,".").replace(/\+/g,"_")}))}(e,t,n).then((function(o){a=o;var i;i=!1===n.checkpoint?{writeSourceCheckpoint:!1,writeTargetCheckpoint:!1}:"source"===n.checkpoint?{writeSourceCheckpoint:!0,writeTargetCheckpoint:!1}:"target"===n.checkpoint?{writeSourceCheckpoint:!1,writeTargetCheckpoint:!0}:{writeSourceCheckpoint:!0,writeTargetCheckpoint:!0},u=new Qn(e,t,a,r,i)}))}function q(){if(k=[],0!==i.docs.length){var e=i.docs,s={timeout:n.timeout};return t.bulkDocs({docs:e,new_edits:!1},s).then((function(t){
/* istanbul ignore if */
if(r.cancelled)throw D(),new Error("cancelled");
// `res` doesn't include full documents (which live in `docs`), so we create a map of 
// (id -> error), and check for errors while iterating over `docs`
var n=Object.create(null);t.forEach((function(e){e.error&&(n[e.id]=e)}));var i=Object.keys(n).length;o.doc_write_failures+=i,o.docs_written+=e.length-i,e.forEach((function(e){var t=n[e._id];if(t){o.errors.push(t);
// Normalize error name. i.e. 'Unauthorized' -> 'unauthorized' (eg Sync Gateway)
var i=(t.name||"").toLowerCase();if("unauthorized"!==i&&"forbidden"!==i)throw t;r.emit("denied",b(t))}else k.push(e)}))}),(function(t){throw o.doc_write_failures+=e.length,t}))}}function S(){if(i.error)throw new Error("There was a problem getting docs.");o.last_seq=p=i.seq;var e=b(o);return k.length&&(e.docs=k,
// Attach 'pending' property if server supports it (CouchDB 2.0+)
/* istanbul ignore if */
"number"==typeof i.pending&&(e.pending=i.pending,delete i.pending),r.emit("change",e)),l=!0,u.writeCheckpoint(i.seq,j).then((function(){
/* istanbul ignore if */
if(l=!1,r.cancelled)throw D(),new Error("cancelled");i=void 0,B()})).catch((function(e){throw R(e),e}))}function x(){return function(e,t,n,r){n=b(n);// we do not need to modify this
var o=[],i=!0;function s(t){
// Optimization: fetch gen-1 docs and attachments in
// a single request using _all_docs
return e.allDocs({keys:t,include_docs:!0,conflicts:!0}).then((function(e){if(r.cancelled)throw new Error("cancelled");e.rows.forEach((function(e){var t;e.deleted||!e.doc||!Jn(e.value.rev)||(t=e.doc)._attachments&&Object.keys(t._attachments).length>0||function(e){return e._conflicts&&e._conflicts.length>0}(e.doc)||(
// strip _conflicts array to appease CSG (#5793)
/* istanbul ignore if */
e.doc._conflicts&&delete e.doc._conflicts,
// the doc we got back from allDocs() is sufficient
o.push(e.doc),delete n[e.id])}))}))}return Promise.resolve().then((function(){
// filter out the generation 1 docs and get them
// leaving the non-generation one docs to be got otherwise
var e=Object.keys(n).filter((function(e){var t=n[e].missing;return 1===t.length&&Jn(t[0])}));if(e.length>0)return s(e)})).then((function(){var s=function(e){var t=[];return Object.keys(e).forEach((function(n){e[n].missing.forEach((function(e){t.push({id:n,rev:e})}))})),{docs:t,revs:!0,latest:!0}}(n);if(s.docs.length)return e.bulkGet(s).then((function(n){
/* istanbul ignore if */
if(r.cancelled)throw new Error("cancelled");return Promise.all(n.results.map((function(n){return Promise.all(n.docs.map((function(n){var r=n.ok;return n.error&&(
// when AUTO_COMPACTION is set, docs can be returned which look
// like this: {"missing":"1-7c3ac256b693c462af8442f992b83696"}
i=!1),r&&r._attachments?function(e,t,n){var r=te(t)&&!te(e),o=Object.keys(n._attachments);return r?e.get(n._id).then((function(r){return Promise.all(o.map((function(o){return function(e,t,n){return!e._attachments||!e._attachments[n]||e._attachments[n].digest!==t._attachments[n].digest}(r,n,o)?t.getAttachment(n._id,o):e.getAttachment(r._id,o)})))})).catch((function(e){
/* istanbul ignore if */
if(404!==e.status)throw e;return zn(t,n)})):zn(t,n)}(t,e,r).then((function(e){var t=Object.keys(r._attachments);return e.forEach((function(e,n){var o=r._attachments[t[n]];delete o.stub,delete o.length,o.data=e})),r})):r})))}))).then((function(e){o=o.concat(Z(e).filter(Boolean))}))}))})).then((function(){return{ok:i,docs:o}}))}(e,t,i.diffs,r).then((function(e){i.error=!e.ok,e.docs.forEach((function(e){delete i.diffs[e._id],o.docs_read++,i.docs.push(e)}))}))}function E(){var e;r.cancelled||i||(0!==c.length?(i=c.shift(),(e={},i.changes.forEach((function(t){
// Couchbase Sync Gateway emits these, but we can ignore them
/* istanbul ignore if */
"_user/"!==t.id&&(e[t.id]=t.changes.map((function(e){return e.rev})))})),t.revsDiff(e).then((function(e){
/* istanbul ignore if */
if(r.cancelled)throw D(),new Error("cancelled");
// currentBatch.diffs elements are deleted as the documents are written
i.diffs=e}))).then(x).then(q).then(S).then(E).catch((function(e){L("batch processing terminated with error",e)}))):C(!0))}function C(e){0!==f.changes.length?(e||d||f.changes.length>=y)&&(c.push(f),f={seq:0,changes:[],docs:[]},"pending"!==r.state&&"stopped"!==r.state||(r.state="active",r.emit("active")),E()):0!==c.length||i||((v&&O.live||d)&&(r.state="pending",r.emit("paused")),d&&D())}function L(e,t){h||(t.message||(t.message=e),o.ok=!1,o.status="aborting",c=[],f={seq:0,changes:[],docs:[]},D(t))}function D(i){if(!(h||r.cancelled&&(o.status="cancelled",l)))if(o.status=o.status||"complete",o.end_time=(new Date).toISOString(),o.last_seq=p,h=!0,i){
// need to extend the error because Firefox considers ".result" read-only
(i=Y(i)).result=o;
// Normalize error name. i.e. 'Unauthorized' -> 'unauthorized' (eg Sync Gateway)
var s=(i.name||"").toLowerCase();"unauthorized"===s||"forbidden"===s?(r.emit("error",i),r.removeAllListeners()):function(e,t,n,r){if(!1===e.retry)return t.emit("error",n),void t.removeAllListeners();
/* istanbul ignore if */if("function"!=typeof e.back_off_function&&(e.back_off_function=P),t.emit("requestError",n),"active"===t.state||"pending"===t.state){t.emit("paused",n),t.state="stopped";var o=function(){e.current_back_off=0};t.once("paused",(function(){t.removeListener("active",o)})),t.once("active",o)}e.current_back_off=e.current_back_off||0,e.current_back_off=e.back_off_function(e.current_back_off),setTimeout(r,e.current_back_off)}(n,r,i,(function(){Zn(e,t,n,r)}))}else r.emit("complete",o),r.removeAllListeners();
/* istanbul ignore if */}function $(e,t,o){
/* istanbul ignore if */
if(r.cancelled)return D();
// Attach 'pending' property if server supports it (CouchDB 2.0+)
/* istanbul ignore if */"number"==typeof t&&(f.pending=t),X(n)(e)&&(f.seq=e.seq||o,f.changes.push(e),s((function(){C(0===c.length&&O.live)})))}function I(e){
/* istanbul ignore if */
if(_=!1,r.cancelled)return D();
// if no results were returned then we're done,
// else fetch more
if(e.results.length>0)O.since=e.results[e.results.length-1].seq,B(),C(!0);else{var t=function(){v?(O.live=!0,B()):d=!0,C(!0)};
// update the checkpoint so we start from the right seq next time
i||0!==e.results.length?t():(l=!0,u.writeCheckpoint(e.last_seq,j).then((function(){l=!1,o.last_seq=p=e.last_seq,t()})).catch(R))}}function T(e){
/* istanbul ignore if */
if(_=!1,r.cancelled)return D();L("changes rejected",e)}function B(){if(!_&&!d&&c.length<g){_=!0,r._changes&&(// remove old changes() and listeners
r.removeListener("cancel",r._abortChanges),r._changes.cancel()),r.once("cancel",o);var t=e.changes(O).on("change",$);t.then(i,i),t.then(I).catch(T),n.retry&&(
// save for later so we can cancel if necessary
r._changes=t,r._abortChanges=o)}function o(){t.cancel()}function i(){r.removeListener("cancel",o)}}function M(){A().then((function(){
/* istanbul ignore if */
if(!r.cancelled)return u.getCheckpoint().then((function(e){O={since:p=e,limit:y,batch_size:y,style:"all_docs",doc_ids:m,selector:w,return_docs:!0},n.filter&&("string"!=typeof n.filter?
// required for the client-side filter in onChange
O.include_docs=!0:// ddoc filter
O.filter=n.filter),"heartbeat"in n&&(O.heartbeat=n.heartbeat),"timeout"in n&&(O.timeout=n.timeout),n.query_params&&(O.query_params=n.query_params),n.view&&(O.view=n.view),B()}));D()})).catch((function(e){L("getCheckpoint rejected with ",e)}))}
/* istanbul ignore next */function R(e){l=!1,L("writeCheckpoint completed with error",e)}
/* istanbul ignore if */r.ready(e,t),r.cancelled?// cancelled immediately
D():(r._addedListeners||(r.once("cancel",D),"function"==typeof n.complete&&(r.once("error",n.complete),r.once("complete",(function(e){n.complete(null,e)}))),r._addedListeners=!0),void 0===n.since?M():A().then((function(){return l=!0,u.writeCheckpoint(n.since,j)})).then((function(){l=!1,
/* istanbul ignore if */
r.cancelled?D():(p=n.since,M())})).catch(R))}
// We create a basic promise so the caller can cancel the replication possibly
// before we have actually started listening to changes etc
function er(){d.call(this),this.cancelled=!1,this.state="pending";var e=this,t=new Promise((function(t,n){e.once("complete",t),e.once("error",n)}));e.then=function(e,n){return t.then(e,n)},e.catch=function(e){return t.catch(e)},
// As we allow error handling via "error" event as well,
// put a stub in here so that rejecting never throws UnhandledError.
e.catch((function(){}))}function tr(e,t){var n=t.PouchConstructor;return"string"==typeof e?new n(e,t):e}function nr(e,t,n,r){if("function"==typeof n&&(r=n,n={}),void 0===n&&(n={}),n.doc_ids&&!Array.isArray(n.doc_ids))throw Y(z,"`doc_ids` filter parameter is not a list.");n.complete=r,(n=b(n)).continuous=n.continuous||n.live,n.retry="retry"in n&&n.retry,
/*jshint validthis:true */
n.PouchConstructor=n.PouchConstructor||this;var o=new er(n);return Zn(tr(e,n),tr(t,n),n,o),o}function rr(e,t,n,r){return"function"==typeof n&&(r=n,n={}),void 0===n&&(n={}),
/*jshint validthis:true */
(n=b(n)).PouchConstructor=n.PouchConstructor||this,new or(e=tr(e,n),t=tr(t,n),n,r)}function or(e,t,n,r){var o=this;this.canceled=!1;var i=n.push?D({},n,n.push):n,s=n.pull?D({},n,n.pull):n;function a(e){o.emit("change",{direction:"pull",change:e})}function u(e){o.emit("change",{direction:"push",change:e})}function c(e){o.emit("denied",{direction:"push",doc:e})}function f(e){o.emit("denied",{direction:"pull",doc:e})}function l(){o.pushPaused=!0,
/* istanbul ignore if */
o.pullPaused&&o.emit("paused")}function d(){o.pullPaused=!0,
/* istanbul ignore if */
o.pushPaused&&o.emit("paused")}function h(){o.pushPaused=!1,
/* istanbul ignore if */
o.pullPaused&&o.emit("active",{direction:"push"})}function p(){o.pullPaused=!1,
/* istanbul ignore if */
o.pushPaused&&o.emit("active",{direction:"pull"})}this.push=nr(e,t,i),this.pull=nr(t,e,s),this.pushPaused=!0,this.pullPaused=!0;var v={};function y(e){// type is 'push' or 'pull'
return function(t,n){("change"===t&&(n===a||n===u)||"denied"===t&&(n===f||n===c)||"paused"===t&&(n===d||n===l)||"active"===t&&(n===p||n===h))&&(t in v||(v[t]={}),v[t][e]=!0,2===Object.keys(v[t]).length&&
// both push and pull have asked to be removed
o.removeAllListeners(t))}}function g(e,t,n){-1==e.listeners(t).indexOf(n)&&e.on(t,n)}n.live&&(this.push.on("complete",o.pull.cancel.bind(o.pull)),this.pull.on("complete",o.push.cancel.bind(o.push))),this.on("newListener",(function(e){"change"===e?(g(o.pull,"change",a),g(o.push,"change",u)):"denied"===e?(g(o.pull,"denied",f),g(o.push,"denied",c)):"active"===e?(g(o.pull,"active",p),g(o.push,"active",h)):"paused"===e&&(g(o.pull,"paused",d),g(o.push,"paused",l))})),this.on("removeListener",(function(e){"change"===e?(o.pull.removeListener("change",a),o.push.removeListener("change",u)):"denied"===e?(o.pull.removeListener("denied",f),o.push.removeListener("denied",c)):"active"===e?(o.pull.removeListener("active",p),o.push.removeListener("active",h)):"paused"===e&&(o.pull.removeListener("paused",d),o.push.removeListener("paused",l))})),this.pull.on("removeListener",y("pull")),this.push.on("removeListener",y("push"));var _=Promise.all([this.push,this.pull]).then((function(e){var t={push:e[0],pull:e[1]};return o.emit("complete",t),r&&r(null,t),o.removeAllListeners(),t}),(function(e){if(o.cancel(),r?
// if there's a callback, then the callback can receive
// the error event
r(e):
// if there's no callback, then we're safe to emit an error
// event, which would otherwise throw an unhandled error
// due to 'error' being a special event in EventEmitters
o.emit("error",e),o.removeAllListeners(),r)
// no sense throwing if we're already emitting an 'error' event
throw e}));this.then=function(e,t){return _.then(e,t)},this.catch=function(e){return _.catch(e)}}Qn.prototype.getCheckpoint=function(){var e=this;return e.opts&&e.opts.writeSourceCheckpoint&&!e.opts.writeTargetCheckpoint?e.src.get(e.id).then((function(e){return e.last_seq||0})).catch((function(e){
/* istanbul ignore if */
if(404!==e.status)throw e;return 0})):e.target.get(e.id).then((function(t){return e.opts&&e.opts.writeTargetCheckpoint&&!e.opts.writeSourceCheckpoint?t.last_seq||0:e.src.get(e.id).then((function(e){
// Since we can't migrate an old version doc to a new one
// (no session id), we just go with the lowest seq in this case
/* istanbul ignore if */
return t.version!==e.version?0:(n=t.version?t.version.toString():"undefined")in Wn?Wn[n](t,e):0
/* istanbul ignore next */;var n}),(function(n){if(404===n.status&&t.last_seq)return e.src.put({_id:e.id,last_seq:0}).then((function(){return 0}),(function(n){return Xn(n)?(e.opts.writeSourceCheckpoint=!1,t.last_seq):0
/* istanbul ignore next */}));throw n}))})).catch((function(e){if(404!==e.status)throw e;return 0}))},l(er,d),er.prototype.cancel=function(){this.cancelled=!0,this.state="cancelled",this.emit("cancel")},er.prototype.ready=function(e,t){var n=this;function r(){n.cancel()}n._readyCalled||(n._readyCalled=!0,e.once("destroyed",r),t.once("destroyed",r),n.once("complete",(function(){e.removeListener("destroyed",r),t.removeListener("destroyed",r)})))},l(or,d),or.prototype.cancel=function(){this.canceled||(this.canceled=!0,this.push.cancel(),this.pull.cancel())},He.plugin((function(e){e.adapter("idb",cn,!0)})).plugin((function(e){e.adapter("http",_n,!1),e.adapter("https",_n,!1)})).plugin(Kn).plugin((function(e){e.replicate=nr,e.sync=rr,Object.defineProperty(e.prototype,"replicate",{get:function(){var e=this;return void 0===this.replicateMethods&&(this.replicateMethods={from:function(t,n,r){return e.constructor.replicate(t,e,n,r)},to:function(t,n,r){return e.constructor.replicate(e,t,n,r)}}),this.replicateMethods}}),e.prototype.sync=function(e,t,n){return this.constructor.sync(this,e,t,n)}})),t.exports=He}).call(this)}).call(this,e("_process"))},{_process:22,argsarray:1,events:3,immediate:4,inherits:11,"spark-md5":23,uuid:13,vuvuzela:24}],11:[function(e,t,n){"function"==typeof Object.create?
// implementation from standard node.js 'util' module
t.exports=function(e,t){t&&(e.super_=t,e.prototype=Object.create(t.prototype,{constructor:{value:e,enumerable:!1,writable:!0,configurable:!0}}))}:
// old school shim for old browsers
t.exports=function(e,t){if(t){e.super_=t;var n=function(){};n.prototype=t.prototype,e.prototype=new n,e.prototype.constructor=e}}},{}],12:[function(e,t,n){"use strict";Object.defineProperty(n,"__esModule",{value:!0}),n.default=void 0;
/**
 * Convert array of 16 byte values to UUID string format of the form:
 * XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX
 */
const r=[];for(let e=0;e<256;++e)r.push((e+256).toString(16).substr(1));n.default=function(e,t){const n=t||0,o=r;// Note: Be careful editing this code!  It's been tuned for performance
// and works in ways you may not expect. See https://github.com/uuidjs/uuid/pull/434
return(o[e[n+0]]+o[e[n+1]]+o[e[n+2]]+o[e[n+3]]+"-"+o[e[n+4]]+o[e[n+5]]+"-"+o[e[n+6]]+o[e[n+7]]+"-"+o[e[n+8]]+o[e[n+9]]+"-"+o[e[n+10]]+o[e[n+11]]+o[e[n+12]]+o[e[n+13]]+o[e[n+14]]+o[e[n+15]]).toLowerCase()}},{}],13:[function(e,t,n){"use strict";Object.defineProperty(n,"__esModule",{value:!0}),Object.defineProperty(n,"v1",{enumerable:!0,get:function(){return r.default}}),Object.defineProperty(n,"v3",{enumerable:!0,get:function(){return o.default}}),Object.defineProperty(n,"v4",{enumerable:!0,get:function(){return i.default}}),Object.defineProperty(n,"v5",{enumerable:!0,get:function(){return s.default}});var r=a(e("./v1.js")),o=a(e("./v3.js")),i=a(e("./v4.js")),s=a(e("./v5.js"));function a(e){return e&&e.__esModule?e:{default:e}}},{"./v1.js":17,"./v3.js":18,"./v4.js":20,"./v5.js":21}],14:[function(e,t,n){"use strict";
/**
 * Calculate output length with padding and bit length
 */function r(e){return 14+(e+64>>>9<<4)+1}
/*
 * Calculate the MD5 of an array of little-endian words, and a bit length.
 */
/*
 * Add integers, wrapping at 2^32. This uses 16-bit operations internally
 * to work around bugs in some JS interpreters.
 */function o(e,t){const n=(65535&e)+(65535&t);return(e>>16)+(t>>16)+(n>>16)<<16|65535&n}
/*
 * Bitwise rotate a 32-bit number to the left.
 */
/*
 * These functions implement the four basic operations the algorithm uses.
 */function i(e,t,n,r,i,s){return o((a=o(o(t,e),o(r,s)))<<(u=i)|a>>>32-u,n);var a,u}function s(e,t,n,r,o,s,a){return i(t&n|~t&r,e,t,o,s,a)}function a(e,t,n,r,o,s,a){return i(t&r|n&~r,e,t,o,s,a)}function u(e,t,n,r,o,s,a){return i(t^n^r,e,t,o,s,a)}function c(e,t,n,r,o,s,a){return i(n^(t|~r),e,t,o,s,a)}Object.defineProperty(n,"__esModule",{value:!0}),n.default=void 0;n.default=
/*
 * Browser-compatible JavaScript MD5
 *
 * Modification of JavaScript MD5
 * https://github.com/blueimp/JavaScript-MD5
 *
 * Copyright 2011, Sebastian Tschan
 * https://blueimp.net
 *
 * Licensed under the MIT license:
 * https://opensource.org/licenses/MIT
 *
 * Based on
 * A JavaScript implementation of the RSA Data Security, Inc. MD5 Message
 * Digest Algorithm, as defined in RFC 1321.
 * Version 2.2 Copyright (C) Paul Johnston 1999 - 2009
 * Other contributors: Greg Holt, Andrew Kepert, Ydnar, Lostinet
 * Distributed under the BSD License
 * See http://pajhome.org.uk/crypt/md5 for more info.
 */
function(e){if("string"==typeof e){const t=unescape(encodeURIComponent(e));// UTF8 escape
e=new Uint8Array(t.length);for(let n=0;n<t.length;++n)e[n]=t.charCodeAt(n)}
/*
 * Convert an array of little-endian words to an array of bytes
 */return function(e){const t=[],n=32*e.length,r="0123456789abcdef";for(let o=0;o<n;o+=8){const n=e[o>>5]>>>o%32&255,i=parseInt(r.charAt(n>>>4&15)+r.charAt(15&n),16);t.push(i)}return t}(function(e,t){
/* append padding */
e[t>>5]|=128<<t%32,e[r(t)-1]=t;let n=1732584193,i=-271733879,f=-1732584194,l=271733878;for(let t=0;t<e.length;t+=16){const r=n,d=i,h=f,p=l;n=s(n,i,f,l,e[t],7,-680876936),l=s(l,n,i,f,e[t+1],12,-389564586),f=s(f,l,n,i,e[t+2],17,606105819),i=s(i,f,l,n,e[t+3],22,-1044525330),n=s(n,i,f,l,e[t+4],7,-176418897),l=s(l,n,i,f,e[t+5],12,1200080426),f=s(f,l,n,i,e[t+6],17,-1473231341),i=s(i,f,l,n,e[t+7],22,-45705983),n=s(n,i,f,l,e[t+8],7,1770035416),l=s(l,n,i,f,e[t+9],12,-1958414417),f=s(f,l,n,i,e[t+10],17,-42063),i=s(i,f,l,n,e[t+11],22,-1990404162),n=s(n,i,f,l,e[t+12],7,1804603682),l=s(l,n,i,f,e[t+13],12,-40341101),f=s(f,l,n,i,e[t+14],17,-1502002290),i=s(i,f,l,n,e[t+15],22,1236535329),n=a(n,i,f,l,e[t+1],5,-165796510),l=a(l,n,i,f,e[t+6],9,-1069501632),f=a(f,l,n,i,e[t+11],14,643717713),i=a(i,f,l,n,e[t],20,-373897302),n=a(n,i,f,l,e[t+5],5,-701558691),l=a(l,n,i,f,e[t+10],9,38016083),f=a(f,l,n,i,e[t+15],14,-660478335),i=a(i,f,l,n,e[t+4],20,-405537848),n=a(n,i,f,l,e[t+9],5,568446438),l=a(l,n,i,f,e[t+14],9,-1019803690),f=a(f,l,n,i,e[t+3],14,-187363961),i=a(i,f,l,n,e[t+8],20,1163531501),n=a(n,i,f,l,e[t+13],5,-1444681467),l=a(l,n,i,f,e[t+2],9,-51403784),f=a(f,l,n,i,e[t+7],14,1735328473),i=a(i,f,l,n,e[t+12],20,-1926607734),n=u(n,i,f,l,e[t+5],4,-378558),l=u(l,n,i,f,e[t+8],11,-2022574463),f=u(f,l,n,i,e[t+11],16,1839030562),i=u(i,f,l,n,e[t+14],23,-35309556),n=u(n,i,f,l,e[t+1],4,-1530992060),l=u(l,n,i,f,e[t+4],11,1272893353),f=u(f,l,n,i,e[t+7],16,-155497632),i=u(i,f,l,n,e[t+10],23,-1094730640),n=u(n,i,f,l,e[t+13],4,681279174),l=u(l,n,i,f,e[t],11,-358537222),f=u(f,l,n,i,e[t+3],16,-722521979),i=u(i,f,l,n,e[t+6],23,76029189),n=u(n,i,f,l,e[t+9],4,-640364487),l=u(l,n,i,f,e[t+12],11,-421815835),f=u(f,l,n,i,e[t+15],16,530742520),i=u(i,f,l,n,e[t+2],23,-995338651),n=c(n,i,f,l,e[t],6,-198630844),l=c(l,n,i,f,e[t+7],10,1126891415),f=c(f,l,n,i,e[t+14],15,-1416354905),i=c(i,f,l,n,e[t+5],21,-57434055),n=c(n,i,f,l,e[t+12],6,1700485571),l=c(l,n,i,f,e[t+3],10,-1894986606),f=c(f,l,n,i,e[t+10],15,-1051523),i=c(i,f,l,n,e[t+1],21,-2054922799),n=c(n,i,f,l,e[t+8],6,1873313359),l=c(l,n,i,f,e[t+15],10,-30611744),f=c(f,l,n,i,e[t+6],15,-1560198380),i=c(i,f,l,n,e[t+13],21,1309151649),n=c(n,i,f,l,e[t+4],6,-145523070),l=c(l,n,i,f,e[t+11],10,-1120210379),f=c(f,l,n,i,e[t+2],15,718787259),i=c(i,f,l,n,e[t+9],21,-343485551),n=o(n,r),i=o(i,d),f=o(f,h),l=o(l,p)}return[n,i,f,l]}
/*
 * Convert an array bytes to an array of little-endian words
 * Characters >255 have their high-byte silently ignored.
 */(function(e){if(0===e.length)return[];const t=8*e.length,n=new Uint32Array(r(t));for(let r=0;r<t;r+=8)n[r>>5]|=(255&e[r/8])<<r%32;return n}(e),8*e.length))}},{}],15:[function(e,t,n){"use strict";Object.defineProperty(n,"__esModule",{value:!0}),n.default=function(){if(!r)throw new Error("crypto.getRandomValues() not supported. See https://github.com/uuidjs/uuid#getrandomvalues-not-supported");return r(o)};
// Unique ID creation requires a high quality random # generator. In the browser we therefore
// require the crypto API and do not support built-in fallback to lower quality random number
// generators (like Math.random()).
// getRandomValues needs to be invoked in a context where "this" is a Crypto implementation. Also,
// find the complete implementation of crypto (msCrypto) on IE11.
const r="undefined"!=typeof crypto&&crypto.getRandomValues&&crypto.getRandomValues.bind(crypto)||"undefined"!=typeof msCrypto&&"function"==typeof msCrypto.getRandomValues&&msCrypto.getRandomValues.bind(msCrypto),o=new Uint8Array(16)},{}],16:[function(e,t,n){"use strict";
// Adapted from Chris Veness' SHA1 code at
// http://www.movable-type.co.uk/scripts/sha1.html
function r(e,t,n,r){switch(e){case 0:return t&n^~t&r;case 1:return t^n^r;case 2:return t&n^t&r^n&r;case 3:return t^n^r}}function o(e,t){return e<<t|e>>>32-t}Object.defineProperty(n,"__esModule",{value:!0}),n.default=void 0;n.default=function(e){const t=[1518500249,1859775393,2400959708,3395469782],n=[1732584193,4023233417,2562383102,271733878,3285377520];if("string"==typeof e){const t=unescape(encodeURIComponent(e));// UTF8 escape
e=[];for(let n=0;n<t.length;++n)e.push(t.charCodeAt(n))}e.push(128);const i=e.length/4+2,s=Math.ceil(i/16),a=new Array(s);for(let t=0;t<s;++t){const n=new Uint32Array(16);for(let r=0;r<16;++r)n[r]=e[64*t+4*r]<<24|e[64*t+4*r+1]<<16|e[64*t+4*r+2]<<8|e[64*t+4*r+3];a[t]=n}a[s-1][14]=8*(e.length-1)/Math.pow(2,32),a[s-1][14]=Math.floor(a[s-1][14]),a[s-1][15]=8*(e.length-1)&4294967295;for(let e=0;e<s;++e){const i=new Uint32Array(80);for(let t=0;t<16;++t)i[t]=a[e][t];for(let e=16;e<80;++e)i[e]=o(i[e-3]^i[e-8]^i[e-14]^i[e-16],1);let s=n[0],u=n[1],c=n[2],f=n[3],l=n[4];for(let e=0;e<80;++e){const n=Math.floor(e/20),a=o(s,5)+r(n,u,c,f)+l+t[n]+i[e]>>>0;l=f,f=c,c=o(u,30)>>>0,u=s,s=a}n[0]=n[0]+s>>>0,n[1]=n[1]+u>>>0,n[2]=n[2]+c>>>0,n[3]=n[3]+f>>>0,n[4]=n[4]+l>>>0}return[n[0]>>24&255,n[0]>>16&255,n[0]>>8&255,255&n[0],n[1]>>24&255,n[1]>>16&255,n[1]>>8&255,255&n[1],n[2]>>24&255,n[2]>>16&255,n[2]>>8&255,255&n[2],n[3]>>24&255,n[3]>>16&255,n[3]>>8&255,255&n[3],n[4]>>24&255,n[4]>>16&255,n[4]>>8&255,255&n[4]]}},{}],17:[function(e,t,n){"use strict";Object.defineProperty(n,"__esModule",{value:!0}),n.default=void 0;var r=i(e("./rng.js")),o=i(e("./bytesToUuid.js"));function i(e){return e&&e.__esModule?e:{default:e}}
// **`v1()` - Generate time-based UUID**
// Inspired by https://github.com/LiosK/UUID.js
// and http://docs.python.org/library/uuid.html
let s,a,u=0,c=0;n.default=// See https://github.com/uuidjs/uuid for API details
function(e,t,n){let i=t&&n||0;const f=t||[];let l=(e=e||{}).node||s,d=void 0!==e.clockseq?e.clockseq:a;// node and clockseq need to be initialized to random values if they're not
// specified.  We do this lazily to minimize issues related to insufficient
// system entropy.  See #189
if(null==l||null==d){const t=e.random||(e.rng||r.default)();null==l&&(
// Per 4.5, create and 48-bit node id, (47 random bits + multicast bit = 1)
l=s=[1|t[0],t[1],t[2],t[3],t[4],t[5]]),null==d&&(
// Per 4.2.2, randomize (14 bit) clockseq
d=a=16383&(t[6]<<8|t[7]))}// UUID timestamps are 100 nano-second units since the Gregorian epoch,
// (1582-10-15 00:00).  JSNumbers aren't precise enough for this, so
// time is handled internally as 'msecs' (integer milliseconds) and 'nsecs'
// (100-nanoseconds offset from msecs) since unix epoch, 1970-01-01 00:00.
let h=void 0!==e.msecs?e.msecs:Date.now(),p=void 0!==e.nsecs?e.nsecs:c+1;// Per 4.2.1.2, use count of uuid's generated during the current clock
// cycle to simulate higher resolution clock
// Time since last uuid creation (in msecs)
const v=h-u+(p-c)/1e4;// Per 4.2.1.2, Bump clockseq on clock regression
// Per 4.2.1.2 Throw error if too many uuids are requested
if(v<0&&void 0===e.clockseq&&(d=d+1&16383),// Reset nsecs if clock regresses (new clockseq) or we've moved onto a new
// time interval
(v<0||h>u)&&void 0===e.nsecs&&(p=0),p>=1e4)throw new Error("uuid.v1(): Can't create more than 10M uuids/sec");u=h,c=p,a=d,// Per 4.1.4 - Convert from unix epoch to Gregorian epoch
h+=122192928e5;// `time_low`
const y=(1e4*(268435455&h)+p)%4294967296;f[i++]=y>>>24&255,f[i++]=y>>>16&255,f[i++]=y>>>8&255,f[i++]=255&y;// `time_mid`
const g=h/4294967296*1e4&268435455;f[i++]=g>>>8&255,f[i++]=255&g,// `time_high_and_version`
f[i++]=g>>>24&15|16,// include version
f[i++]=g>>>16&255,// `clock_seq_hi_and_reserved` (Per 4.2.2 - include variant)
f[i++]=d>>>8|128,// `clock_seq_low`
f[i++]=255&d;// `node`
for(let e=0;e<6;++e)f[i+e]=l[e];return t||(0,o.default)(f)}},{"./bytesToUuid.js":12,"./rng.js":15}],18:[function(e,t,n){"use strict";Object.defineProperty(n,"__esModule",{value:!0}),n.default=void 0;var r=i(e("./v35.js")),o=i(e("./md5.js"));function i(e){return e&&e.__esModule?e:{default:e}}var s=(0,r.default)("v3",48,o.default);n.default=s},{"./md5.js":14,"./v35.js":19}],19:[function(e,t,n){"use strict";Object.defineProperty(n,"__esModule",{value:!0}),n.default=function(e,t,n){function r(e,r,i,s){const a=i&&s||0;if("string"==typeof e&&(e=function(e){e=unescape(encodeURIComponent(e));// UTF8 escape
const t=[];for(let n=0;n<e.length;++n)t.push(e.charCodeAt(n));return t}(e)),"string"==typeof r&&(r=function(e){
// Note: We assume we're being passed a valid uuid string
const t=[];return e.replace(/[a-fA-F0-9]{2}/g,(function(e){t.push(parseInt(e,16))})),t}(r)),!Array.isArray(e))throw TypeError("value must be an array of bytes");if(!Array.isArray(r)||16!==r.length)throw TypeError("namespace must be uuid string or an Array of 16 byte values");// Per 4.3
const u=n(r.concat(e));if(u[6]=15&u[6]|t,u[8]=63&u[8]|128,i)for(let e=0;e<16;++e)i[a+e]=u[e];return i||(0,o.default)(u)}// Function#name is not settable on some platforms (#270)
try{r.name=e;// eslint-disable-next-line no-empty
}catch(e){}// For CommonJS default export support
return r.DNS=i,r.URL=s,r},n.URL=n.DNS=void 0;var r,o=(r=e("./bytesToUuid.js"))&&r.__esModule?r:{default:r};const i="6ba7b810-9dad-11d1-80b4-00c04fd430c8";n.DNS=i;const s="6ba7b811-9dad-11d1-80b4-00c04fd430c8";n.URL=s},{"./bytesToUuid.js":12}],20:[function(e,t,n){"use strict";Object.defineProperty(n,"__esModule",{value:!0}),n.default=void 0;var r=i(e("./rng.js")),o=i(e("./bytesToUuid.js"));function i(e){return e&&e.__esModule?e:{default:e}}n.default=function(e,t,n){"string"==typeof e&&(t="binary"===e?new Uint8Array(16):null,e=null);const i=(e=e||{}).random||(e.rng||r.default)();// Per 4.4, set bits for version and `clock_seq_hi_and_reserved`
// Copy bytes to buffer, if provided
if(i[6]=15&i[6]|64,i[8]=63&i[8]|128,t){const e=n||0;for(let n=0;n<16;++n)t[e+n]=i[n];return t}return(0,o.default)(i)}},{"./bytesToUuid.js":12,"./rng.js":15}],21:[function(e,t,n){"use strict";Object.defineProperty(n,"__esModule",{value:!0}),n.default=void 0;var r=i(e("./v35.js")),o=i(e("./sha1.js"));function i(e){return e&&e.__esModule?e:{default:e}}var s=(0,r.default)("v5",80,o.default);n.default=s},{"./sha1.js":16,"./v35.js":19}],22:[function(e,t,n){
// shim for using process in browser
var r,o,i=t.exports={};
// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.
function s(){throw new Error("setTimeout has not been defined")}function a(){throw new Error("clearTimeout has not been defined")}function u(e){if(r===setTimeout)
//normal enviroments in sane situations
return setTimeout(e,0);
// if setTimeout wasn't available but was latter defined
if((r===s||!r)&&setTimeout)return r=setTimeout,setTimeout(e,0);try{
// when when somebody has screwed with setTimeout but no I.E. maddness
return r(e,0)}catch(t){try{
// When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
return r.call(null,e,0)}catch(t){
// same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
return r.call(this,e,0)}}}!function(){try{r="function"==typeof setTimeout?setTimeout:s}catch(e){r=s}try{o="function"==typeof clearTimeout?clearTimeout:a}catch(e){o=a}}();var c,f=[],l=!1,d=-1;function h(){l&&c&&(l=!1,c.length?f=c.concat(f):d=-1,f.length&&p())}function p(){if(!l){var e=u(h);l=!0;for(var t=f.length;t;){for(c=f,f=[];++d<t;)c&&c[d].run();d=-1,t=f.length}c=null,l=!1,function(e){if(o===clearTimeout)
//normal enviroments in sane situations
return clearTimeout(e);
// if clearTimeout wasn't available but was latter defined
if((o===a||!o)&&clearTimeout)return o=clearTimeout,clearTimeout(e);try{
// when when somebody has screwed with setTimeout but no I.E. maddness
o(e)}catch(t){try{
// When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
return o.call(null,e)}catch(t){
// same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
// Some versions of I.E. have different rules for clearTimeout vs setTimeout
return o.call(this,e)}}}(e)}}
// v8 likes predictible objects
function v(e,t){this.fun=e,this.array=t}function y(){}i.nextTick=function(e){var t=new Array(arguments.length-1);if(arguments.length>1)for(var n=1;n<arguments.length;n++)t[n-1]=arguments[n];f.push(new v(e,t)),1!==f.length||l||u(p)},v.prototype.run=function(){this.fun.apply(null,this.array)},i.title="browser",i.browser=!0,i.env={},i.argv=[],i.version="",// empty string to avoid regexp issues
i.versions={},i.on=y,i.addListener=y,i.once=y,i.off=y,i.removeListener=y,i.removeAllListeners=y,i.emit=y,i.prependListener=y,i.prependOnceListener=y,i.listeners=function(e){return[]},i.binding=function(e){throw new Error("process.binding is not supported")},i.cwd=function(){return"/"},i.chdir=function(e){throw new Error("process.chdir is not supported")},i.umask=function(){return 0}},{}],23:[function(e,t,n){!function(e){if("object"==typeof n)
// Node/CommonJS
t.exports=e();else{
// Browser globals (with support for web workers)
var r;try{r=window}catch(e){r=self}r.SparkMD5=e()}}((function(e){"use strict";
/*
     * Fastest md5 implementation around (JKM md5).
     * Credits: Joseph Myers
     *
     * @see http://www.myersdaily.org/joseph/javascript/md5-text.html
     * @see http://jsperf.com/md5-shootout/7
     */
/* this function is much faster,
      so if possible we use it. Some IEs
      are the only ones I know of that
      need the idiotic second function,
      generated by an if clause.  */var t=["0","1","2","3","4","5","6","7","8","9","a","b","c","d","e","f"];function n(e,t){var n=e[0],r=e[1],o=e[2],i=e[3];r=((r+=((o=((o+=((i=((i+=((n=((n+=(r&o|~r&i)+t[0]-680876936|0)<<7|n>>>25)+r|0)&r|~n&o)+t[1]-389564586|0)<<12|i>>>20)+n|0)&n|~i&r)+t[2]+606105819|0)<<17|o>>>15)+i|0)&i|~o&n)+t[3]-1044525330|0)<<22|r>>>10)+o|0,r=((r+=((o=((o+=((i=((i+=((n=((n+=(r&o|~r&i)+t[4]-176418897|0)<<7|n>>>25)+r|0)&r|~n&o)+t[5]+1200080426|0)<<12|i>>>20)+n|0)&n|~i&r)+t[6]-1473231341|0)<<17|o>>>15)+i|0)&i|~o&n)+t[7]-45705983|0)<<22|r>>>10)+o|0,r=((r+=((o=((o+=((i=((i+=((n=((n+=(r&o|~r&i)+t[8]+1770035416|0)<<7|n>>>25)+r|0)&r|~n&o)+t[9]-1958414417|0)<<12|i>>>20)+n|0)&n|~i&r)+t[10]-42063|0)<<17|o>>>15)+i|0)&i|~o&n)+t[11]-1990404162|0)<<22|r>>>10)+o|0,r=((r+=((o=((o+=((i=((i+=((n=((n+=(r&o|~r&i)+t[12]+1804603682|0)<<7|n>>>25)+r|0)&r|~n&o)+t[13]-40341101|0)<<12|i>>>20)+n|0)&n|~i&r)+t[14]-1502002290|0)<<17|o>>>15)+i|0)&i|~o&n)+t[15]+1236535329|0)<<22|r>>>10)+o|0,r=((r+=((o=((o+=((i=((i+=((n=((n+=(r&i|o&~i)+t[1]-165796510|0)<<5|n>>>27)+r|0)&o|r&~o)+t[6]-1069501632|0)<<9|i>>>23)+n|0)&r|n&~r)+t[11]+643717713|0)<<14|o>>>18)+i|0)&n|i&~n)+t[0]-373897302|0)<<20|r>>>12)+o|0,r=((r+=((o=((o+=((i=((i+=((n=((n+=(r&i|o&~i)+t[5]-701558691|0)<<5|n>>>27)+r|0)&o|r&~o)+t[10]+38016083|0)<<9|i>>>23)+n|0)&r|n&~r)+t[15]-660478335|0)<<14|o>>>18)+i|0)&n|i&~n)+t[4]-405537848|0)<<20|r>>>12)+o|0,r=((r+=((o=((o+=((i=((i+=((n=((n+=(r&i|o&~i)+t[9]+568446438|0)<<5|n>>>27)+r|0)&o|r&~o)+t[14]-1019803690|0)<<9|i>>>23)+n|0)&r|n&~r)+t[3]-187363961|0)<<14|o>>>18)+i|0)&n|i&~n)+t[8]+1163531501|0)<<20|r>>>12)+o|0,r=((r+=((o=((o+=((i=((i+=((n=((n+=(r&i|o&~i)+t[13]-1444681467|0)<<5|n>>>27)+r|0)&o|r&~o)+t[2]-51403784|0)<<9|i>>>23)+n|0)&r|n&~r)+t[7]+1735328473|0)<<14|o>>>18)+i|0)&n|i&~n)+t[12]-1926607734|0)<<20|r>>>12)+o|0,r=((r+=((o=((o+=((i=((i+=((n=((n+=(r^o^i)+t[5]-378558|0)<<4|n>>>28)+r|0)^r^o)+t[8]-2022574463|0)<<11|i>>>21)+n|0)^n^r)+t[11]+1839030562|0)<<16|o>>>16)+i|0)^i^n)+t[14]-35309556|0)<<23|r>>>9)+o|0,r=((r+=((o=((o+=((i=((i+=((n=((n+=(r^o^i)+t[1]-1530992060|0)<<4|n>>>28)+r|0)^r^o)+t[4]+1272893353|0)<<11|i>>>21)+n|0)^n^r)+t[7]-155497632|0)<<16|o>>>16)+i|0)^i^n)+t[10]-1094730640|0)<<23|r>>>9)+o|0,r=((r+=((o=((o+=((i=((i+=((n=((n+=(r^o^i)+t[13]+681279174|0)<<4|n>>>28)+r|0)^r^o)+t[0]-358537222|0)<<11|i>>>21)+n|0)^n^r)+t[3]-722521979|0)<<16|o>>>16)+i|0)^i^n)+t[6]+76029189|0)<<23|r>>>9)+o|0,r=((r+=((o=((o+=((i=((i+=((n=((n+=(r^o^i)+t[9]-640364487|0)<<4|n>>>28)+r|0)^r^o)+t[12]-421815835|0)<<11|i>>>21)+n|0)^n^r)+t[15]+530742520|0)<<16|o>>>16)+i|0)^i^n)+t[2]-995338651|0)<<23|r>>>9)+o|0,r=((r+=((i=((i+=(r^((n=((n+=(o^(r|~i))+t[0]-198630844|0)<<6|n>>>26)+r|0)|~o))+t[7]+1126891415|0)<<10|i>>>22)+n|0)^((o=((o+=(n^(i|~r))+t[14]-1416354905|0)<<15|o>>>17)+i|0)|~n))+t[5]-57434055|0)<<21|r>>>11)+o|0,r=((r+=((i=((i+=(r^((n=((n+=(o^(r|~i))+t[12]+1700485571|0)<<6|n>>>26)+r|0)|~o))+t[3]-1894986606|0)<<10|i>>>22)+n|0)^((o=((o+=(n^(i|~r))+t[10]-1051523|0)<<15|o>>>17)+i|0)|~n))+t[1]-2054922799|0)<<21|r>>>11)+o|0,r=((r+=((i=((i+=(r^((n=((n+=(o^(r|~i))+t[8]+1873313359|0)<<6|n>>>26)+r|0)|~o))+t[15]-30611744|0)<<10|i>>>22)+n|0)^((o=((o+=(n^(i|~r))+t[6]-1560198380|0)<<15|o>>>17)+i|0)|~n))+t[13]+1309151649|0)<<21|r>>>11)+o|0,r=((r+=((i=((i+=(r^((n=((n+=(o^(r|~i))+t[4]-145523070|0)<<6|n>>>26)+r|0)|~o))+t[11]-1120210379|0)<<10|i>>>22)+n|0)^((o=((o+=(n^(i|~r))+t[2]+718787259|0)<<15|o>>>17)+i|0)|~n))+t[9]-343485551|0)<<21|r>>>11)+o|0,e[0]=n+e[0]|0,e[1]=r+e[1]|0,e[2]=o+e[2]|0,e[3]=i+e[3]|0}function r(e){var t,n=[];/* Andy King said do it this way. */for(t=0;t<64;t+=4)n[t>>2]=e.charCodeAt(t)+(e.charCodeAt(t+1)<<8)+(e.charCodeAt(t+2)<<16)+(e.charCodeAt(t+3)<<24);return n}function o(e){var t,n=[];/* Andy King said do it this way. */for(t=0;t<64;t+=4)n[t>>2]=e[t]+(e[t+1]<<8)+(e[t+2]<<16)+(e[t+3]<<24);return n}function i(e){var t,o,i,s,a,u,c=e.length,f=[1732584193,-271733879,-1732584194,271733878];for(t=64;t<=c;t+=64)n(f,r(e.substring(t-64,t)));for(o=(e=e.substring(t-64)).length,i=[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],t=0;t<o;t+=1)i[t>>2]|=e.charCodeAt(t)<<(t%4<<3);if(i[t>>2]|=128<<(t%4<<3),t>55)for(n(f,i),t=0;t<16;t+=1)i[t]=0;
// Beware that the final length might not fit in 32 bits so we take care of that
return s=(s=8*c).toString(16).match(/(.*?)(.{0,8})$/),a=parseInt(s[2],16),u=parseInt(s[1],16)||0,i[14]=a,i[15]=u,n(f,i),f}function s(e){var n,r="";for(n=0;n<4;n+=1)r+=t[e>>8*n+4&15]+t[e>>8*n&15];return r}function a(e){var t;for(t=0;t<e.length;t+=1)e[t]=s(e[t]);return e.join("")}
// In some cases the fast add32 function cannot be used..
// ---------------------------------------------------
/**
     * Helpers.
     */function u(e){return/[\u0080-\uFFFF]/.test(e)&&(e=unescape(encodeURIComponent(e))),e}function c(e){var t,n=[],r=e.length;for(t=0;t<r-1;t+=2)n.push(parseInt(e.substr(t,2),16));return String.fromCharCode.apply(String,n)}
// ---------------------------------------------------
/**
     * SparkMD5 OOP implementation.
     *
     * Use this class to perform an incremental md5, otherwise use the
     * static methods instead.
     */function f(){
// call reset to init the instance
this.reset()}
/**
     * Appends a string.
     * A conversion will be applied if an utf8 string is detected.
     *
     * @param {String} str The string to be appended
     *
     * @return {SparkMD5} The instance itself
     */return a(i("hello")),
// ---------------------------------------------------
/**
     * ArrayBuffer slice polyfill.
     *
     * @see https://github.com/ttaubert/node-arraybuffer-slice
     */
"undefined"==typeof ArrayBuffer||ArrayBuffer.prototype.slice||function(){function t(e,t){return(e=0|e||0)<0?Math.max(e+t,0):Math.min(e,t)}ArrayBuffer.prototype.slice=function(n,r){var o,i,s,a,u=this.byteLength,c=t(n,u),f=u;return r!==e&&(f=t(r,u)),c>f?new ArrayBuffer(0):(o=f-c,i=new ArrayBuffer(o),s=new Uint8Array(i),a=new Uint8Array(this,c,o),s.set(a),i)}}(),f.prototype.append=function(e){
// Converts the string to utf8 bytes if necessary
// Then append as binary
return this.appendBinary(u(e)),this
/**
     * Appends a binary string.
     *
     * @param {String} contents The binary string to be appended
     *
     * @return {SparkMD5} The instance itself
     */},f.prototype.appendBinary=function(e){this._buff+=e,this._length+=e.length;var t,o=this._buff.length;for(t=64;t<=o;t+=64)n(this._hash,r(this._buff.substring(t-64,t)));return this._buff=this._buff.substring(t-64),this
/**
     * Finishes the incremental computation, reseting the internal state and
     * returning the result.
     *
     * @param {Boolean} raw True to get the raw string, false to get the hex string
     *
     * @return {String} The result
     */},f.prototype.end=function(e){var t,n,r=this._buff,o=r.length,i=[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];for(t=0;t<o;t+=1)i[t>>2]|=r.charCodeAt(t)<<(t%4<<3);return this._finish(i,o),n=a(this._hash),e&&(n=c(n)),this.reset(),n
/**
     * Resets the internal state of the computation.
     *
     * @return {SparkMD5} The instance itself
     */},f.prototype.reset=function(){return this._buff="",this._length=0,this._hash=[1732584193,-271733879,-1732584194,271733878],this
/**
     * Gets the internal state of the computation.
     *
     * @return {Object} The state
     */},f.prototype.getState=function(){return{buff:this._buff,length:this._length,hash:this._hash.slice()}},
/**
     * Gets the internal state of the computation.
     *
     * @param {Object} state The state
     *
     * @return {SparkMD5} The instance itself
     */
f.prototype.setState=function(e){return this._buff=e.buff,this._length=e.length,this._hash=e.hash,this
/**
     * Releases memory used by the incremental buffer and other additional
     * resources. If you plan to use the instance again, use reset instead.
     */},f.prototype.destroy=function(){delete this._hash,delete this._buff,delete this._length
/**
     * Finish the final calculation based on the tail.
     *
     * @param {Array}  tail   The tail (will be modified)
     * @param {Number} length The length of the remaining buffer
     */},f.prototype._finish=function(e,t){var r,o,i,s=t;if(e[s>>2]|=128<<(s%4<<3),s>55)for(n(this._hash,e),s=0;s<16;s+=1)e[s]=0;
// Do the final computation based on the tail and length
// Beware that the final length may not fit in 32 bits so we take care of that
r=(r=8*this._length).toString(16).match(/(.*?)(.{0,8})$/),o=parseInt(r[2],16),i=parseInt(r[1],16)||0,e[14]=o,e[15]=i,n(this._hash,e)},
/**
     * Performs the md5 hash on a string.
     * A conversion will be applied if utf8 string is detected.
     *
     * @param {String}  str The string
     * @param {Boolean} [raw] True to get the raw string, false to get the hex string
     *
     * @return {String} The result
     */
f.hash=function(e,t){
// Converts the string to utf8 bytes if necessary
// Then compute it using the binary function
return f.hashBinary(u(e),t)},
/**
     * Performs the md5 hash on a binary string.
     *
     * @param {String}  content The binary string
     * @param {Boolean} [raw]     True to get the raw string, false to get the hex string
     *
     * @return {String} The result
     */
f.hashBinary=function(e,t){var n=a(i(e));return t?c(n):n},
// ---------------------------------------------------
/**
     * SparkMD5 OOP implementation for array buffers.
     *
     * Use this class to perform an incremental md5 ONLY for array buffers.
     */
f.ArrayBuffer=function(){
// call reset to init the instance
this.reset()},
/**
     * Appends an array buffer.
     *
     * @param {ArrayBuffer} arr The array to be appended
     *
     * @return {SparkMD5.ArrayBuffer} The instance itself
     */
f.ArrayBuffer.prototype.append=function(e){var t,r,i,s,a=(r=this._buff.buffer,i=e,!0,(s=new Uint8Array(r.byteLength+i.byteLength)).set(new Uint8Array(r)),s.set(new Uint8Array(i),r.byteLength),s),u=a.length;for(this._length+=e.byteLength,t=64;t<=u;t+=64)n(this._hash,o(a.subarray(t-64,t)));return this._buff=t-64<u?new Uint8Array(a.buffer.slice(t-64)):new Uint8Array(0),this
/**
     * Finishes the incremental computation, reseting the internal state and
     * returning the result.
     *
     * @param {Boolean} raw True to get the raw string, false to get the hex string
     *
     * @return {String} The result
     */},f.ArrayBuffer.prototype.end=function(e){var t,n,r=this._buff,o=r.length,i=[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];for(t=0;t<o;t+=1)i[t>>2]|=r[t]<<(t%4<<3);return this._finish(i,o),n=a(this._hash),e&&(n=c(n)),this.reset(),n
/**
     * Resets the internal state of the computation.
     *
     * @return {SparkMD5.ArrayBuffer} The instance itself
     */},f.ArrayBuffer.prototype.reset=function(){return this._buff=new Uint8Array(0),this._length=0,this._hash=[1732584193,-271733879,-1732584194,271733878],this
/**
     * Gets the internal state of the computation.
     *
     * @return {Object} The state
     */},f.ArrayBuffer.prototype.getState=function(){var e,t=f.prototype.getState.call(this);
// Convert buffer to a string
return t.buff=(e=t.buff,String.fromCharCode.apply(null,new Uint8Array(e))),t
/**
     * Gets the internal state of the computation.
     *
     * @param {Object} state The state
     *
     * @return {SparkMD5.ArrayBuffer} The instance itself
     */},f.ArrayBuffer.prototype.setState=function(e){
// Convert string to buffer
return e.buff=function(e,t){var n,r=e.length,o=new ArrayBuffer(r),i=new Uint8Array(o);for(n=0;n<r;n+=1)i[n]=e.charCodeAt(n);return i}(e.buff),f.prototype.setState.call(this,e)},f.ArrayBuffer.prototype.destroy=f.prototype.destroy,f.ArrayBuffer.prototype._finish=f.prototype._finish,
/**
     * Performs the md5 hash on an array buffer.
     *
     * @param {ArrayBuffer} arr The array buffer
     * @param {Boolean}     [raw] True to get the raw string, false to get the hex one
     *
     * @return {String} The result
     */
f.ArrayBuffer.hash=function(e,t){var r=a(function(e){var t,r,i,s,a,u,c=e.length,f=[1732584193,-271733879,-1732584194,271733878];for(t=64;t<=c;t+=64)n(f,o(e.subarray(t-64,t)));
// Not sure if it is a bug, however IE10 will always produce a sub array of length 1
// containing the last element of the parent array if the sub array specified starts
// beyond the length of the parent array - weird.
// https://connect.microsoft.com/IE/feedback/details/771452/typed-array-subarray-issue
for(r=(e=t-64<c?e.subarray(t-64):new Uint8Array(0)).length,i=[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],t=0;t<r;t+=1)i[t>>2]|=e[t]<<(t%4<<3);if(i[t>>2]|=128<<(t%4<<3),t>55)for(n(f,i),t=0;t<16;t+=1)i[t]=0;
// Beware that the final length might not fit in 32 bits so we take care of that
return s=(s=8*c).toString(16).match(/(.*?)(.{0,8})$/),a=parseInt(s[2],16),u=parseInt(s[1],16)||0,i[14]=a,i[15]=u,n(f,i),f}(new Uint8Array(e)));return t?c(r):r},f}))},{}],24:[function(e,t,n){"use strict";
/**
 * Stringify/parse functions that don't operate
 * recursively, so they avoid call stack exceeded
 * errors.
 */
// Convenience function for the parse function.
// This pop function is basically copied from
// pouchCollate.parseIndexableString
function r(e,t,n){var r=n[n.length-1];e===r.element&&(
// popping a meta-element, e.g. an object whose value is another object
n.pop(),r=n[n.length-1]);var o=r.element,i=r.index;Array.isArray(o)?o.push(e):i===t.length-2?o[t.pop()]=e:t.push(e);// obj with key only
}n.stringify=function(e){var t=[];t.push({obj:e});for(var n,r,o,i,s,a,u,c,f,l,d="";n=t.pop();)if(r=n.obj,d+=n.prefix||"",o=n.val||"")d+=o;else if("object"!=typeof r)d+=void 0===r?null:JSON.stringify(r);else if(null===r)d+="null";else if(Array.isArray(r)){for(t.push({val:"]"}),i=r.length-1;i>=0;i--)s=0===i?"":",",t.push({obj:r[i],prefix:s});t.push({val:"["})}else{for(u in// object
a=[],r)r.hasOwnProperty(u)&&a.push(u);for(t.push({val:"}"}),i=a.length-1;i>=0;i--)f=r[c=a[i]],l=i>0?",":"",l+=JSON.stringify(c)+":",t.push({obj:f,prefix:l});t.push({val:"{"})}return d},n.parse=function(e){for(var t,n,o,i,s,a,u,c,f,l=[],d=[],h=0;;)if("}"!==(t=e[h++])&&"]"!==t&&void 0!==t)switch(t){case" ":case"\t":case"\n":case":":case",":break;case"n":h+=3,// 'ull'
r(null,l,d);break;case"t":h+=3,// 'rue'
r(!0,l,d);break;case"f":h+=4,// 'alse'
r(!1,l,d);break;case"0":case"1":case"2":case"3":case"4":case"5":case"6":case"7":case"8":case"9":case"-":for(n="",h--;;){if(o=e[h++],!/[\d\.\-e\+]/.test(o)){h--;break}n+=o}r(parseFloat(n),l,d);break;case'"':for(i="",s=void 0,a=0;'"'!==(u=e[h++])||"\\"===s&&a%2==1;)i+=u,"\\"===(s=u)?a++:a=0;r(JSON.parse('"'+i+'"'),l,d);break;case"[":c={element:[],index:l.length},l.push(c.element),d.push(c);break;case"{":f={element:{},index:l.length},l.push(f.element),d.push(f);break;default:throw new Error("unexpectedly reached end of input: "+t)}else{if(1===l.length)return l.pop();r(l.pop(),l,d)}}},{}]},{},[10])(10)}));
/**
 * Copyright (c) 2017, Oracle and/or its affiliates.
 * All rights reserved.
 */

define('persist/impl/pouchDBPersistenceStore',["../PersistenceStore","../impl/storageUtils","pouchdb","./logger"],(function(e,t,r,n){"use strict";var i=function(t){e.call(this,t)};(i.prototype=new e).Init=function(e){this._version=e&&e.version||"0";var t=this._name+this._version,i=e?e.adapter:null,o=this._extractDBOptions(e);if(i)try{i.plugin&&r.plugin(i.plugin),(o=o||{}).adapter=i.name,this._dbOptions=o,this._db=new r(t,o)}catch(e){return n.log("Error creating PouchDB instance with adapter "+i+": ",e.message),n.log("Please make sure the needed plugin and adapter are installed."),Promise.reject(e)}else o?(this._dbOptions=o,this._db=new r(t,o)):(this._dbOptions=null,this._db=new r(t));return e&&e.index&&(Array.isArray(e.index)?(this._index=e.index.filter((function(e){return"key"!==e})),0===this._index.length&&(this._index=null)):n.log("index must be an array")),this._createIndex()},i.prototype._extractDBOptions=function(e){var t=null;if(e){var r=this;Object.keys(e).forEach((function(n){r._isPersistenceStoreKey(n)||(t||(t={}),t[n]=e[n])}))}return t},i.prototype._isPersistenceStoreKey=function(e){return"version"===e||"adapter"===e||"index"===e||"skipMetadata"===e},i.prototype._createIndex=function(){if(this._index&&this._db.createIndex){var e=this,t=e._name+e._index.toString().replace(",","").replace(".",""),r={index:{fields:e._index,name:t}};return e._db.createIndex(r).catch((function(t){n.error("creating index on "+e._index.toString()+" failed with error "+t)}))}return Promise.resolve()},i.prototype.upsert=function(e,t,r,i){n.log("Offline Persistence Toolkit pouchDBPersistenceStore: upsert() for key: "+e);var s=this,a=e.toString();return s._db.get(a).then((function(e){return o(i,e)?e:Promise.reject({status:409})})).catch((function(e){return 404===e.status&&"missing"===e.message?void 0:Promise.reject(e)})).then((function(e){return s._put(a,t,r,i,e)}))},i.prototype._put=function(e,t,r,n,i){var o=[],s=this._prepareUpsert(r,o),a={_id:e,key:e,metadata:t,value:s?null:r};i&&(a._rev=i._rev);var u=this;return u._db.put(a).then((function(t){return u._addAttachments(e,t.rev,o)})).catch((function(e){if(409!==e.status)throw e}))};var o=function(e,t){return!e||t.metadata.versionIdentifier===e};i.prototype._addAttachments=function(e,t,r){if(r&&r.length){var i=this,o=r.map((function(r){var n;return n=r.value instanceof Blob?r.value:new Blob([r.value]),i._db.putAttachment(e,r.path,t,n,"binary")}),this);return Promise.all(o).catch((function(t){n.error("store: "+i._name+" failed add attachment for doc "+e)}))}return Promise.resolve()},i.prototype.upsertAll=function(e){if(n.log("Offline Persistence Toolkit pouchDBPersistenceStore: upsertAll()"),e&&e.length){var t=this,r={},i=e.map((function(e){var n=e.key.toString(),i=e.value,o=[],s=t._prepareUpsert(i,o);o.length>0&&(r[n]=o);var a={_id:n,key:e.key,metadata:e.metadata,value:s?null:i};return t._db.get(n).then((function(e){return a._rev=e._rev,a})).catch((function(e){if(404===e.status&&"missing"===e.message)return a;throw e}))}));return Promise.all(i).then((function(e){return t._db.bulkDocs(e)})).then((function(e){var i=[];if(e.forEach((function(e,o){if(e.ok){var s=r[e.id];s&&i.push(t._addAttachments(e.id,e.rev,s))}else 409===e.status&&n.log("conflict error")})),i.length>0)return Promise.all(i)})).catch((function(e){n.log("error in upsertAll")}))}return Promise.resolve()},i.prototype.find=function(e){n.log("Offline Persistence Toolkit pouchDBPersistenceStore: find() for expression: "+JSON.stringify(e));var r=this;if(e=e||{},r._db.find){var i=r._prepareFind(e);return r._db.find(i).then((function(e){if(e&&e.docs&&e.docs.length){var t=e.docs.map(r._findResultCallback(i.fields),r);return Promise.all(t)}return[]})).catch((function(e){if(404===e.status&&"missing"===e.message)return[];throw e}))}return r._db.allDocs({include_docs:!0}).then((function(n){if(n&&n.rows&&n.rows.length){var i=n.rows.filter((function(r){var n=r.doc;return!(s(r)||!t.satisfy(e.selector,n))}));if(i.length){var o=i.map((function(e){return r._fixKey(e.doc),e.doc})),a=t.sortRows(o,e.sort).map((function(n){return r._fixBinaryValue(n).then((function(r){return e.fields?t.assembleObject(r,e.fields):r.value}))}));return Promise.all(a)}return[]}return[]})).catch((function(e){return n.log("error retrieving all documents from pouch db, returns empty list as find operation.",e),[]}))},i.prototype._findResultCallback=function(e){return function(t){return this._fixValue(t).then((function(t){return e?t:t.value}))}},i.prototype._fixValue=function(e){return this._fixKey(e),this._fixBinaryValue(e)},i.prototype._fixBinaryValue=function(e){var t=e._id||e.id||e.key,r=e._attachments;if(r){var i=this,o=Object.keys(r)[0];return i._db.getAttachment(t,o).then((function(t){if("rootpath"===o)e.value=t;else{for(var r=o.split("."),n=e.value,i=0;i<r.length-1;i++)n=n[r[i]];n[r[r.length-1]]=t}return e})).catch((function(e){n.error("store: "+i._name+" error getting attachment. ")}))}return Promise.resolve(e)},i.prototype.findByKey=function(e){n.log("Offline Persistence Toolkit pouchDBPersistenceStore: findByKey() for key: "+e);var t=this,r=e.toString();return t._db.get(r,{attachments:!0}).then((function(e){return t._fixBinaryValue(e)})).then((function(e){return e.value})).catch((function(e){return 404===e.status&&"missing"===e.message?void 0:Promise.reject(e)}))},i.prototype.removeByKey=function(e){n.log("Offline Persistence Toolkit pouchDBPersistenceStore: removeByKey() for key: "+e);var t=this;if(!e)return Promise.resolve(!1);var r=e.toString();return t._db.get(r).then((function(e){return t._db.remove(e)})).then((function(){return!0})).catch((function(e){return(404!==e.status||"missing"!==e.message)&&Promise.reject(e)}))},i.prototype.delete=function(e){n.log("Offline Persistence Toolkit pouchDBPersistenceStore: delete() for expression: "+JSON.stringify(e));var t=this;if(e){var i=e;return i.fields=["_id","_rev"],t.find(i).then((function(e){if(e&&e.length){var r=e.map((function(e){return{_id:e._id,_rev:e._rev,_deleted:!0}}));return t._db.bulkDocs(r)}})).catch((function(e){n.error("store: "+t._name+" error deleting....")}))}return t._db.destroy().then((function(){var e=t._name+t._version;return t._dbOptions?t._db=new r(e,t._dbOptions):t._db=new r(e),t._createIndex()})).catch((function(e){n.error("store: "+t._name+" error deleting....")}))},i.prototype.keys=function(){n.log("Offline Persistence Toolkit pouchDBPersistenceStore: keys()");var e=this;return e._db.allDocs().then((function(e){var t=e.rows,r=[];if(t&&t.length)for(var n=0;n<t.length;n++)s(t[n])||r.push(t[n].id);return r})).catch((function(t){n.error("store: "+e._name+" error getting all the docs for keys ")}))},i.prototype._prepareFind=function(e){var t={},r=e.selector;r?r&&(t.selector=r):t.selector={_id:{$gt:null}};var n=e.fields;return n&&n.length&&(t.fields=n,-1!==n.indexOf("key")&&-1===n.indexOf("_id")&&t.fields.push("_id")),t},i.prototype._prepareUpsert=function(e,t){return!!e&&(e instanceof Blob||e instanceof ArrayBuffer?(t.push({path:"rootpath",value:e}),!0):(this._inspectValue("",e,t),!1))},i.prototype._inspectValue=function(e,t,r){for(var n in t)if(t.hasOwnProperty(n)){var i=t[n];if(i&&"object"==typeof i)if(i instanceof Blob||i instanceof ArrayBuffer){var o=e;o.length>0&&(o+=".");var s={path:o+n,value:i};r.push(s),t.key=null}else if(void 0===i.length){var a=e;e.length>0&&(e+="."),e+=n,this._inspectValue(e,i,r),e=a}}},i.prototype.updateKey=function(e,t){n.log("Offline Persistence Toolkit PouchDBPersistenceStore: updateKey() with currentKey: "+e+" and new key: "+t);var r=this;return r._db.get(e).then((function(e){return e?r.upsert(t,e.metadata,e.value):Promise.reject("No existing key found to update")})).then((function(){return r.removeByKey(e)})).catch((function(){n.error("store: "+r._name+" error updating key")}))};var s=function(e){return e.id.startsWith("_design/")};return i.prototype._fixKey=function(e){var t=e._id||e.id||e.key;t&&(e.key=t)},i}));
/**
 * Copyright (c) 2017, Oracle and/or its affiliates.
 * All rights reserved.
 */

define('persist/pouchDBPersistenceStoreFactory',["./impl/pouchDBPersistenceStore"],(function(e){"use strict";return{createPersistenceStore:function(n,t){return function(n,t){var r=new e(n);return r.Init(t).then((function(){return r}))}(n,t)}}}));
/**
 * Copyright (c) 2017, Oracle and/or its affiliates.
 * All rights reserved.
 */

define('persist/persistenceStoreManager',["./impl/logger","./impl/PersistenceStoreMetadata","./pouchDBPersistenceStoreFactory"],(function(e,t,r){"use strict";var o=function(){Object.defineProperty(this,"_stores",{value:{},writable:!0}),Object.defineProperty(this,"_factories",{value:{},writable:!0}),Object.defineProperty(this,"_DEFAULT_STORE_FACTORY_NAME",{value:"_defaultFactory",writable:!1}),Object.defineProperty(this,"_METADATA_STORE_NAME",{value:"systemCache-metadataStore",writable:!1}),Object.defineProperty(this,"_storeNameMapping",{value:{},writable:!0})};return o.prototype.registerStoreFactory=function(e,t){if(!t)throw TypeError("A valid factory must be provided.");if(!e)throw TypeError("A valid name must be provided.");var r=this._mapStoreName(e),o=this._factories[r];if(o&&o!==t)throw TypeError("A factory with the same name has already been registered.");this._factories[r]=t},o.prototype.registerDefaultStoreFactory=function(e){this.registerStoreFactory(this._DEFAULT_STORE_FACTORY_NAME,e)},o.prototype.openStore=function(t,r){e.log("Offline Persistence Toolkit PersistenceStoreManager: openStore() for name: "+t);var o=this._mapStoreName(t),n=this._stores[o],a=r&&r.version||"0";if(n&&n[a])return Promise.resolve(n[a]);var i=this._factories[o];if(i||(i=this._factories[this._DEFAULT_STORE_FACTORY_NAME]),!i)return Promise.reject(new Error("no factory is registered to create the store."));var s=this;return e.log("Offline Persistence Toolkit PersistenceStoreManager: Calling createPersistenceStore on factory"),i.createPersistenceStore(o,r).then((function(t){return(n=n||{})[a]=t,s._stores[o]=n,r&&r.skipMetadata?t:s._updateStoreMetadata(o,a).then((function(){return t})).catch((function(r){return e.log("updating store metadata for store "+o+" failed"),t}))}))},o.prototype._updateStoreMetadata=function(e,t){var r=this;return r._getStoresMetadata(e).then((function(o){var n=null;if(o?o.versions.indexOf(t)<0&&(o.versions.push(t),n=o.versions):n=[t],n){var a=r._encodeString(e);return r._metadataStore.upsert(a,{},n)}}))},o.prototype.hasStore=function(e,t){var r=this._mapStoreName(e),o=this._stores[r];return!(!o||0===Object.keys(o).length||t&&t.version&&!o[t.version])},o.prototype.deleteStore=function(t,r){e.log("Offline Persistence Toolkit PersistenceStoreManager: deleteStore() for name: "+t);var o=this,n=this._mapStoreName(t);return o._getStoresMetadata(n).then((function(a){if(a){var i=[],s=[],c=a.versions;if(r&&r.version){var u=c.indexOf(r.version);u<0?s=c:(c.splice(u,1),s=c,i.push(r.version))}else i=c;return!!i.length&&(_=i.map((function(e){var t=this;return t.openStore(n,{version:e,skipMetadata:!0}).then((function(r){return delete t._stores[n][e],r.delete()}))}),o),Promise.all(_).then((function(){var e=o._encodeString(n);return s.length?o._metadataStore.upsert(e,{},s):o._metadataStore.removeByKey(e)})).then((function(){return!0})).catch((function(t){return e.log("failed deleting store "+n),!1})))}var f=[];if(r&&r.version?o._stores[n]&&o._stores[n][r.version]&&(f.push(o._stores[n][r.version]),delete o._stores[n][r.version]):o._stores[n]&&(f=Object.values(o._stores[n]),o._stores[n]={}),f.length){var _=f.map((function(e){return e.delete()}));return Promise.all(_).then((function(){return!0})).catch((function(r){return e.log("failed deleting store "+t),!1}))}return!1}))},o.prototype.getStoresMetadata=function(){var r=this,o=new Map;return this._getMetadataStore().then((function(e){return e.find({fields:["key","value"]})})).then((function(e){return e&&e.length>0&&e.forEach((function(e){var n=r._decodeString(e.key),a=r._factories[n];a||(a=r._factories[r._DEFAULT_STORE_FACTORY_NAME]),o.set(n,new t(n,a,e.value))})),o})).catch((function(t){return e.log("error occured getting store metadata."),o}))},o.prototype._getStoresMetadata=function(r){var o=this;return o._getMetadataStore().then((function(e){var t=o._encodeString(r);return e.findByKey(t)})).then((function(e){if(e){var n=o._factories[r];return n||(n=o._factories[o._DEFAULT_STORE_FACTORY_NAME]),new t(r,n,e)}return null})).catch((function(t){return e.log("error getting store metadata for store "+r),null}))},o.prototype._mapStoreName=function(e,t){var r=this._storeNameMapping[e];return r||(r=e.replace(/(.*):\/\/(.*)/gi,"$1$2"),this._storeNameMapping[e]=r,r)},o.prototype._getMetadataStore=function(){var e=this;return e._metadataStore?Promise.resolve(e._metadataStore):(this._factories[this._DEFAULT_STORE_FACTORY_NAME]||(this._factories[e._METADATA_STORE_NAME]=r),this.openStore(e._METADATA_STORE_NAME,{skipMetadata:!0}).then((function(t){return e._metadataStore=t,e._metadataStore})))},o.prototype._encodeString=function(e){for(var t=[],r=0;r<e.length;r++){var o=Number(e.charCodeAt(r)).toString(16);t.push(o)}return t.join("")},o.prototype._decodeString=function(e){var t,r=e.toString(),o="";for(t=0;t<r.length;t+=2)o+=String.fromCharCode(parseInt(r.substr(t,2),16));return o},new o}));
/**
 * Copyright (c) 2017, Oracle and/or its affiliates.
 * All rights reserved.
 */

define('persist/impl/defaultCacheHandler',["../persistenceUtils","../persistenceStoreManager","./logger"],(function(e,r,t){"use strict";function n(){Object.defineProperty(this,"_endpointToOptionsMap",{value:{},writable:!0})}function o(e){for(var r=e.name,t=e.resourceIdentifier,n=e.keys,o=[],i=(new Date).toUTCString(),a=0;a<n.length;a++){var s={key:n[a],metadata:{lastUpdated:i,resourceIdentifier:t},value:e.data[a]};o.push(s)}var u={};return u[r]=o,u}n.prototype.constructRequestResponseCacheData=function(r,n){var o=this,i={};return t.log("Offline Persistence Toolkit DefaultCacheHandler: constructRequestResponseCacheData()"),e.requestToJSON(r).then((function(t){i.requestData=t;var a=o.hasShredder(r);return e.responseToJSON(n,{excludeBody:a})})).then((function(e){return i.responseData=e,{key:o._constructCacheKey(r,n),metadata:o.constructMetadata(r),value:i}}))},n.prototype.constructShreddedData=function(e,r){t.log("Offline Persistence Toolkit DefaultCacheHandler: constructShreddedData()");var n=this._getShredder(e);return n?n(r).then((function(e){return e&&Array.isArray(e)?e.map(o):null})):Promise.resolve()},n.prototype.shredResponse=function(e,r){t.log("Offline Persistence Toolkit DefaultCacheHandler: shredResponse()");var n=this._getShredder(e);return n?n(r):Promise.resolve()},n.prototype.cacheShreddedData=function(e,n){t.log("Offline Persistence Toolkit DefaultCacheHandler: cacheShreddedData()");var i=e.map(o),a=this;return function(e){var n=e.map((function(e){var n=Object.keys(e)[0],o=e[n];return o&&o.length?function(e,n){return t.log("Offline Persistence Toolkit DefaultCacheHandler: Updating store with shredded data"),r.openStore(e).then((function(e){return e.upsertAll(n)}))}(n,o):Promise.resolve()}));return Promise.all(n)}(i).then((function(){if(a._isCompleteCollection(n,e))return function(e){var t=e.map((function(e){var t=e.name,n={selector:{key:{$nin:e.keys}}};return r.openStore(t).then((function(e){return e.delete(n)}))}));return Promise.all(t)}(e)}))},n.prototype._isCompleteCollection=function(e,r){if(!e||"GET"!==e.method&&"HEAD"!==e.method)return!1;if(!function(e){if(!e)return!1;for(var r=0;r<e.length;r++)if("collection"!==e[r].resourceType)return!1;return!0}(r))return!1;if(e.url===e.baseUrl)return!0;var t=this._getQueryHandler(e.url);if(!t||"function"!=typeof t.normalizeQueryParameter)return!1;var n=t.normalizeQueryParameter(e.url);if(n.searchCriteria||0!==n.offset)return!1;var o=n.limit;return o<0||r[0].keys.length<o},n.prototype._constructCacheKey=function(e,r){var t=e.url+"$"+e.method+"$";if(r){var n=r.headers;if(n&&(s=n.get("vary")))if("*"===s)t=1e3*(new Date).getTime()+Math.floor(1e3*Math.random());else for(var o=e.headers,i=s.split(","),a=0;a<i.length;a++){var s,u=i[a];t+=(u=u.trim())+"="+(s=o&&o.get(u)?o.get(u):"undefined")+";"}}return t},n.prototype.getMatchedCacheKeys=function(e,r,t){var n,o;return n=r&&r.ignoreSearch?i(e.url):e.url,r&&r.ignoreMethod||(o=e.method),t.filter((function(t){var s=t.split("$");if(1===s.length){if(t.slice(0,n.length)!==n)return!1;if(r&&r.ignoreSearch&&"/"===t[n.length])return!1;if(o&&-1===(r&&r.ignoreSearch?t.slice(n.length):t.slice(n.length,n.length+e.method.length)).indexOf(o))return!1;if(!r||!r.ignoreVary){var u=t;if(!(u=o?(u=u.split(o))[u.length-1]:a(u)))return!0;var l=u.split("="),c=e.headers;if(2===l){if((f=c&&c.get(l[0])?c.get(l[0]):"undefined")!==l[1])return!1}else for(var d=0;d<l.length-1;d++){var h=l[d],f=c&&c.get(h)?c.get(h):"undefined",p=l[d+1].split(f);if(2!==p.length&&""!==p[0])return!1;if(p[1]&&p[1].startsWith(","))return!1;l[d+1]=p[1]}}return!0}if((r&&r.ignoreSearch?i(s[0]):s[0])!==n)return!1;if(o&&s[1]!==o)return!1;if(!r||!r.ignoreVary){if(!(u=s[2]))return!0;var g=u.split(";");if(1===g.length)return!1;for(c=e.headers,d=0;d<g.length-1;d++)if(h=g[d].split("="),(f=c&&c.get(h[0])?c.get(h[0]):"undefined")!=h[1])return!1}return!0}))},n.prototype.constructMetadata=function(e){var r=(new Date).getTime(),t=i(e.url);return{url:e.url,method:e.method,baseUrl:t,created:r,lastupdated:r}},n.prototype.constructResponse=function(r){return t.log("Offline Persistence Toolkit DefaultCacheHandler: constructResponse()"),e.responseFromJSON(r).then((function(r){return e.isCachedResponse(r)||r.headers.set("x-oracle-jscpt-cache-expiration-date",""),r}))},n.prototype.constructSearchCriteria=function(e,r){t.log("Offline Persistence Toolkit DefaultCacheHandler: constructSearchCriteria()");var n=!1;r&&void 0!==r.ignoreSearch&&(n=r.ignoreSearch);var o,a=!1;return r&&void 0!==r.ignoreMethod&&(a=r.ignoreMethod),o=n?{"metadata.baseUrl":i(e.url)}:{"metadata.url":e.url},a||(o["metadata.method"]=e.method),{selector:o,sort:["metadata.created"]}},n.prototype.registerEndpointOptions=function(e,r){if(!e)throw new Error({message:"a valid endpointKey must be provided."});if(this._endpointToOptionsMap[e])throw new Error({message:"endpointKey can only be registered once."});this._endpointToOptionsMap[e]=r},n.prototype.unregisterEndpointOptions=function(e){if(!e)throw new Error({message:"a valid endpointKey must be provided."});delete this._endpointToOptionsMap[e]},n.prototype.hasShredder=function(e){return null!==this._getShredder(e)},n.prototype._getShredder=function(e){var r=this._getJsonProcessor(e.url);return r?r.shredder:null},n.prototype._getUnshredder=function(e){var r=this._getJsonProcessor(e.url);return r?r.unshredder:null},n.prototype._getJsonProcessor=function(e){for(var r=Object.keys(this._endpointToOptionsMap),t=0;t<r.length;t++){var n=r[t];if(e===JSON.parse(n).url){var o=this._endpointToOptionsMap[n];return o&&o.jsonProcessor&&o.jsonProcessor.shredder&&o.jsonProcessor.unshredder?o.jsonProcessor:null}}return null},n.prototype._getQueryHandler=function(e){for(var r=Object.keys(this._endpointToOptionsMap),t=0;t<r.length;t++){var n=r[t];if(e===JSON.parse(n).url){var o=this._endpointToOptionsMap[n];return o&&o.queryHandler?o.queryHandler:null}}return null},n.prototype.fillResponseBodyWithShreddedData=function(e,n,o){t.log("Offline Persistence Toolkit DefaultCacheHandler: fillResponseBodyWithShreddedData()"),null!=e.url&&e.url.length>0&&null==o.headers.get("x-oracle-jscpt-response-url")&&o.headers.set("x-oracle-jscpt-response-url",e.url),n&&1===n.length&&"single"===n[0].resourceType&&o.headers.set("x-oracle-jscpt-resource-type","single");var i=this._getUnshredder(e),a=this._getShredder(e);if(!(i&&a&&o&&n&&n.length))return Promise.resolve(o);var s=n.map((function(e){return n=(t=e).name,r.openStore(n).then((function(e){if(t.keys&&t.keys.length){if(1===t.keys.length)return e.findByKey(t.keys[0]);var r={selector:{$or:t.keys.map((function(e){return{key:{$eq:e}}}))}};return e.find(r)}return[]})).then((function(e){return Array.isArray(e)||(e=[e]),t.data=e,t}));var t,n}));return Promise.all(s).then((function(e){return i(e,o)}))},n.prototype.deleteShreddedData=function(e){var t=[];return e.forEach((function(e){var n=e.name,o=e.keys;if(n&&o&&o.length){var i=r.openStore(n).then((function(e){var r={selector:{$or:o.map((function(e){return{key:{$eq:e}}}))}};return e.delete(r)}));t.push(i)}})),Promise.all(t)};var i=function(e){if(!e||"string"!=typeof e)return"";var r=/([^?]*)\?/.exec(e);return r&&2===r.length?r[1]:e},a=function(e){if(!e||"string"!=typeof e)return"";var r=e.split("").reverse().join(""),t=/(.*?)(TEG|TUP|ETELED|TSOP|HCTAP|TCENNOC|SNOITPO|ECART)/.exec(r);return t&&3===t.length?t[1].split("").reverse().join(""):e};return new n}));
/**
 * Copyright (c) 2017, Oracle and/or its affiliates.
 * All rights reserved.
 */

define('persist/impl/PersistenceSyncManager',["require","../persistenceUtils","../persistenceStoreManager","./defaultCacheHandler","./logger"],(function(e,n,t,r,o){"use strict";function s(e,n,t){Object.defineProperty(this,"_eventListeners",{value:[],writable:!0}),Object.defineProperty(this,"_isOnline",{value:e}),Object.defineProperty(this,"_browserFetch",{value:n}),Object.defineProperty(this,"_cache",{value:t})}function i(e){return"stop"===(e=e||{}).action}function u(e,n){var r,o,s,i,u,c=[];e instanceof Array||(e=[e]);var l=e.length,f=function(a){if(!(a<l))return Promise.resolve();if(s=e[a].storeName,o=e[a].operation,i=e[a].undoRedoData,"upsert"==o||"remove"==o&&n){for(c=[],u=i.length,r=0;r<u;r++)n?c.push({key:i[r].key,value:i[r].undo}):c.push({key:i[r].key,value:i[r].redo});return t.openStore(s).then((function(e){return 1==c.length&&null==c[0].value&&null!=c[0].key?e.removeByKey(c[0].key).then((function(){return f(++a)})):e.upsertAll(c).then((function(){return f(++a)}))}))}return"remove"==o?t.openStore(s).then((function(e){return e.removeByKey(i[0].key).then((function(){return f(++a)}))})):void 0};return f(0)}function c(e,n,t,r){return l(t,e._eventListeners.filter(function(e,n){return function(t){return e.toLowerCase()==t.type&&(null!=n&&n.match(t.scope)||null==n||null==t.scope)}}(n,r)))}function l(e,n){return n.length>0?n[0].listener(e).then((function(e){return null!=e?Promise.resolve(e):n.length>1?l(n.slice(1)):void 0})):Promise.resolve(null)}function f(e){return t.openStore(e,{index:["key"],skipMetadata:!0})}function a(){return f("syncLog")}function h(){return f("redoUndoLog")}return s.prototype.addEventListener=function(e,n,t){o.log("Offline Persistence Toolkit PersistenceSyncManager: addEventListener() for type: "+e+" and scope: "+t),this._eventListeners.push({type:e.toLowerCase(),listener:n,scope:t})},s.prototype.removeEventListener=function(e,n,t){o.log("Offline Persistence Toolkit PersistenceSyncManager: removeEventListener() for type: "+e+" and scope: "+t),this._eventListeners=this._eventListeners.filter((function(r){return e.toLowerCase()!=r.type||n!=r.listener||t!=r.scope}))},s.prototype.getSyncLog=function(){var e;return o.log("Offline Persistence Toolkit PersistenceSyncManager: getSyncLog()"),this._readingSyncLog||(this._readingSyncLog=(e=this,a().then((function(e){return e.find((n={},t=[],(r=[]).push("key"),n.sort=r,t.push("key"),t.push("value"),n.fields=t,n));var n,t,r})).then((function(e){return function(e){var t,r,o=[],s=function(e){return e&&0!=e.length?(t=e[0].key,r=e[0].value,n.requestFromJSON(r).then((function(n){return o.push(function(e,n){return{requestId:e,request:n,undo:function(){return function(e){return h().then((function(n){return n.findByKey(e)})).then((function(e){return null!=e&&u(e,!0).then((function(){return!0}))}))}(e)},redo:function(){return function(e){return h().then((function(n){return n.findByKey(e)})).then((function(e){return null!=e&&u(e,!1).then((function(){return!0}))}))}(e)}}}(t,n)),e.shift(),s(e)}))):Promise.resolve(o)};return s(e)}(e)})).then((function(n){return e._readingSyncLog=null,n})))),this._readingSyncLog},s.prototype.insertRequest=function(e,t){o.log("Offline Persistence Toolkit PersistenceSyncManager: insertRequest() for Request with url: "+e.url);var s={};return a().then((function(t){return s.store=t,n.requestToJSON(e,{_noClone:!0})})).then((function(n){return s.requestData=n,s.metadata=r.constructMetadata(e),s.requestId=s.metadata.created.toString(),s.store.upsert(s.requestId,s.metadata,s.requestData)})).then((function(){if(null!=t){var e=t.undoRedoDataArray;return null!=e?h().then((function(n){var t=function(r){return r<e.length&&null!=e[r]?n.upsert(s.requestId,s.metadata,e[r]).then((function(){return t(++r)})):Promise.resolve()};return t(0)})):Promise.resolve()}return Promise.resolve()}))},s.prototype.removeRequest=function(e){o.log("Offline Persistence Toolkit PersistenceSyncManager: removeRequest() for Request with requestId: "+e);var t=this,r={};return a().then((function(t){return r.store=t,function(e,t){return t.findByKey(e).then((function(e){if(e)return n.requestFromJSON(e)}))}(e,t)})).then((function(n){return n?t._internalRemoveRequest(e,n,r.store):void 0}))},s.prototype._internalRemoveRequest=function(e,n,t){var r=[];return t?r.push(t.removeByKey(e)):r.push(a().then((function(n){return n.removeByKey(e)}))),"GET"!==n.method&&"HEAD"!==n.method&&r.push(h().then((function(n){return n.removeByKey(e)}))),Promise.all(r).then((function(){return n})).catch((function(n){o.log("Offline Persistence Toolkit PersistenceSyncManager: removeRequest() error for Request with requestId: "+e)}))},s.prototype.updateRequest=function(e,t){return o.log("Offline Persistence Toolkit PersistenceSyncManager: updateRequest() for Request with requestId: "+e),Promise.all([a(),n.requestToJSON(t)]).then((function(n){var o=n[0],s=n[1],i=r.constructMetadata(t);return o.upsert(e,i,s)}))},s.prototype.sync=function(e){o.log("Offline Persistence Toolkit PersistenceSyncManager: sync()"),this._options=e||{};var t=this;return this._syncing?Promise.reject("Cannot start sync while sync is in progress"):(this._syncing=!0,new Promise((function(e,r){t.getSyncLog().then((function(s){var u,l,f;o.log("Offline Persistence Toolkit PersistenceSyncManager: Processing sync");var a=function(s){0==s.length&&(o.log("Offline Persistence Toolkit PersistenceSyncManager: Sync finished, no requests in sync log"),e()),s.length>0&&(o.log("Offline Persistence Toolkit PersistenceSyncManager: Processing sync, # of requests in sync log: "+s.length),u=s[0].requestId,l=s[0].request,f=l.clone(),o.log("Offline Persistence Toolkit PersistenceSyncManager: Dispatching beforeSyncRequest event"),c(t,"beforeSyncRequest",{requestId:u,request:f.clone()},l.url).then((function(h){if(i(h))return o.log("Offline Persistence Toolkit PersistenceSyncManager: Sync stopped by beforeSyncRequest event listener"),void e();"skip"!==(h=h||{}).action?("replay"===h.action&&(o.log("Offline Persistence Toolkit PersistenceSyncManager: Replay request from beforeSyncRequest event listener"),l=h.request),f=l.clone(),function(e,n){var t,r=e,s=r._options.preflightOptionsRequest,i=r._options.preflightOptionsRequestTimeout;if(null!=n.url&&"disabled"!=s&&null!=n.url.match(s)){if(o.log("Offline Persistence Toolkit PersistenceSyncManager: Checking URL based on preflightOptionsRequest"),r._pingedURLs){if(r._pingedURLs.indexOf(n.url)>=0)return Promise.resolve(!0)}else r._pingedURLs=[];return r._preflightOptionsRequestId=(new Date).getTime(),new Promise((t=r._preflightOptionsRequestId,function(e,o){r._repliedOptionsRequest=!1;var s=new Request(n.url,{method:"OPTIONS"}),u=6e4;null!=i&&(u=i),setTimeout((function(){r._repliedOptionsRequest||r._preflightOptionsRequestId!=t||o(!1)}),u),r._browserFetch(s).then((function(t){r._repliedOptionsRequest=!0,r._pingedURLs||(r._pingedURLs=[]),r._pingedURLs.push(n.url),e(!0)}),(function(n){r._repliedOptionsRequest=!0,e(!0)}))}))}return Promise.resolve(!0)}(t,l).then((function(){n.markReplayRequest(l,!0),o.log("Offline Persistence Toolkit PersistenceSyncManager: Replaying request with url: "+l.url),("undefined"!=typeof window&&null!=window?fetch:t._browserFetch)(l).then((function(h){h.status>=400?r({error:h.statusText,requestId:u,request:f.clone(),response:h.clone()}):n._cloneResponse(h,{url:l.url}).then((function(n){o.log("Offline Persistence Toolkit PersistenceSyncManager: Dispatching syncRequest event"),c(t,"syncRequest",{requestId:u,request:f.clone(),response:n.clone()},l.url).then((function(n){i(n)?e():(o.log("Offline Persistence Toolkit PersistenceSyncManager: Removing replayed request"),t._internalRemoveRequest(u,l).then((function(){s.shift(),a(s)}),(function(e){r({error:e,requestId:u,request:f.clone()})})))}))}))}),(function(e){r({error:e,requestId:u,request:f.clone()})}))}),(function(e){r(!1===e?{error:"Preflight OPTIONS request timed out",requestId:u,request:f.clone(),response:new Response(null,{status:504,statusText:"Preflight OPTIONS request timed out"})}:{error:e,requestId:u,request:f.clone()})}))):(o.log("Offline Persistence Toolkit PersistenceSyncManager: Removing skipped request"),t._internalRemoveRequest(u,l).then((function(){s.shift(),a(s)}),(function(e){r({error:e,requestId:u,request:f.clone()})})))})))};s=function(e){if(e&&e.length>0){var n,t,r=[];for(n=0;n<e.length;n++)"GET"!=(t=e[n].request).method&&"HEAD"!=t.method&&r.push(e[n]);for(n=0;n<e.length;n++)"GET"!=(t=e[n].request).method&&"HEAD"!=t.method||r.push(e[n]);return r}return e}(s),a(s)}))})).finally((function(e){t._syncing=!1,t._pingedURLs=null})))},s}));
/**
 * Copyright (c) 2017, Oracle and/or its affiliates.
 * All rights reserved.
 */

define('persist/impl/OfflineCache',["./defaultCacheHandler","../persistenceStoreManager","../persistenceUtils","./logger"],(function(e,r,t,n){"use strict";function o(e,r){if(!e)throw TypeError("A name must be provided to create an OfflineCache!");if(!r)throw TypeError("A persistence store must be provided to create an OfflineCache!");this._name=e,this._storeName=r,this._shreddedNamesStoreName=this._storeName+"_OPT_INT_SHRED_STORE_NAMES_",this._store=null,this._cacheKeys=[],this._createStorePromise}function a(e,r,t){if(t&&t.length)for(var n=0;n<t.length;n++){var o=t[n];if(u(e,r,o.value))return o}return null}function i(e,r,t){return function(n){var o;return o=t?n[t]:n,u(e,r,o)}}function u(e,r,t){if(e)return!0;if(!t||!r)return!1;var o=t.requestData.headers,a=t.responseData.headers,i=r.headers,u=a.vary;if(n.log("Offline Persistence Toolkit OfflineCache: Processing HTTP Vary header"),!u)return!0;if("*"===u.trim())return!1;for(var s=u.split(","),c=0;c<s.length;c++){var l=s[c].toLowerCase();l=l.trim();var f=i.get(l),h=o[l];if(n.log("Offline Persistence Toolkit OfflineCache: HTTP Vary header name: "+l),n.log("Offline Persistence Toolkit OfflineCache: Request HTTP Vary header value: "+f),n.log("Offline Persistence Toolkit OfflineCache: Cached HTTP Vary header value: "+h),!(!h&&!f||h&&f&&h===f))return!1}return!0}function s(r,t,o){if(t){n.log("Offline Persistence Toolkit OfflineCache: Converting cached entry to Response object");var a=!1;o&&o.ignoreBody&&(a=!0);var i=t.bodyAbstract;return e.constructResponse(t).then((function(t){if(null!=r.url&&r.url.length>0&&null==t.headers.get("x-oracle-jscpt-response-url")&&t.headers.set("x-oracle-jscpt-response-url",r.url),!a&&i){var o;try{o=JSON.parse(i)}catch(e){n.error("error parsing json "+i)}return e.fillResponseBodyWithShreddedData(r,o,t)}return t}))}return Promise.resolve()}function c(r,t,n){if(t){var o=e.constructSearchCriteria(t,n);o.fields=["key","value"];var a=n&&n.ignoreVary;return r.find(o).then((function(e){return e&&e.length?e.filter(i(a,t,"value")).map((function(e){return e.key})):[]}))}return r.keys()}return o.prototype.getName=function(){return this._name},o.prototype.add=function(e){n.log("Offline Persistence Toolkit OfflineCache: add()");var r=this;return fetch(e).then((function(t){return r.put(e,t)}))},o.prototype.addAll=function(e){n.log("Offline Persistence Toolkit OfflineCache: addAll()");var r=e.map(this.add,this);return Promise.all(r)},o.prototype.match=function(e,r){return n.log("Offline Persistence Toolkit OfflineCache: match() for Request with url: "+e.url),this._getCacheEntries(e,r).then((function(t){var n=a(r&&r.ignoreVary,e,t);if(n)return s(e,n.value.responseData,r)})).catch((function(r){n.log("error finding match for request with url: "+e.url)}))},o.prototype._getCacheEntries=function(r,t){var n=this;return this._getStore().then((function(o){var a=e.getMatchedCacheKeys(r,t,n._cacheKeys);if(a&&a.length){var i=a.map((function(e){return o.findByKey(e).then((function(r){return{key:e,value:r}}))}));return Promise.all(i)}var u=e.constructSearchCriteria(r,t);return u.fields=["key","value"],o.find(u)}))},o.prototype._matchByKey=function(e,r,t){return this._getStore().then((function(e){return e.findByKey(r)})).then((function(r){return r?s(e,r.responseData,t):void 0}))},o.prototype._internalMatch=function(r,t){var o=this;return o._getStore().then((function(n){var a=e.getMatchedCacheKeys(r,t,o._cacheKeys);if(a&&a.length){var i=a.map((function(e){return n.findByKey(e)}));return Promise.all(i).then((function(e){return e.map((function(e,r){return{key:a[r],value:e}}))}))}var u=e.constructSearchCriteria(r,t);return u.fields=["key","value"],n.find(u)})).then((function(e){if(e){var o=a(t&&t.ignoreVary,r,e);if(o){var i={key:o.key},u=o.value.responseData.bodyAbstract;if(u)try{var s=JSON.parse(u);s?1===s.length&&"single"===s[0].resourceType?i.resourceType="single":i.resourceType="collection":i.resourceType="unknown"}catch(e){return void n.log("internal error: invalid body abstract")}else i.resourceType="unknown";return i}}})).catch((function(e){n.log("error finding match internal")}))},o.prototype.matchAll=function(e,r){return n.log("Offline Persistence Toolkit OfflineCache: matchAll() for Request with url: "+e.url),this._getCacheEntries(e,r).then((function(t){var n=function(e,r,t){var n=[];return t&&t.length&&(n=t.filter(i(e,r,"value")).map((function(e){return e.value.responseData}))),n}(r&&r.ignoreVary,e,t);return function(e,r,t){if(r&&r.length){var n=r.map((function(r){return s(e,r,t)}));return Promise.all(n)}return Promise.resolve()}(e,n,r)})).catch((function(r){n.log("error finding all matches for request with url: "+e.url)}))},o.prototype._getStore=function(){var e,t=this;return t._store?Promise.resolve(t._store):(t._createStorePromise||(t._createStorePromise=r.openStore(t._storeName,{index:["metadata.baseUrl","metadata.url","metadata.created"],skipMetadata:!0}).then((function(r){return e=r,r.keys()})).then((function(r){return t._cacheKeys=r,t._store=e,t._store}))),t._createStorePromise)},o.prototype._getShreddedNamesStore=function(){var e=this;return e._shreddedNamesStore?Promise.resolve(e._shreddedNamesStore):(e._createShreddedNamesStorePromise||(e._createShreddedNamesStorePromise=r.openStore(e._shreddedNamesStoreName,{index:["metadata.baseUrl","metadata.url","metadata.created"],skipMetadata:!0}).then((function(r){return e._shreddedNamesStore=r,e._shreddedNamesStore}))),e._createShreddedNamesStorePromise)},o.prototype.put=function(r,t){n.log("Offline Persistence Toolkit OfflineCache: put() for Request with url: "+r.url);var o,a=this;return a._getStore().then((function(){return e.constructRequestResponseCacheData(r,t)})).then((function(i){var u=a._store;return o=i.key,e.hasShredder(r)?e.shredResponse(r,t).then((function(r){if(r){var t=[];return i.value.responseData.bodyAbstract=function(e){var r=e.map((function(e){return{name:e.name,keys:e.keys?e.keys.reduce((function(e,r){return r?e.push(r):n.warn("should not have undefined key in the shredded data"),e}),[]):e.keys,resourceType:e.resourceType}}));return JSON.stringify(r)}(r),t.push(u.upsert(i.key,i.metadata,i.value)),t.push(e.cacheShreddedData(r,i.metadata)),a._updateShreddedStoreNames(r.map((function(e){return e.name}))).then((function(){return Promise.all(t)}))}o=null})):u.upsert(i.key,i.metadata,i.value)})).then((function(){o&&a._cacheKeys.indexOf(o)<0&&a._cacheKeys.push(o)})).catch((function(e){n.error("error in cache.put() for Request with url: "+r.url)}))},o.prototype._updateShreddedStoreNames=function(e){return this._getShreddedNamesStore().then((function(r){return e?r.keys().then((function(t){var n=[];if(e.forEach((function(e){t.indexOf(e)<0&&n.push(e)})),n.length>0){var o=[];return n.forEach((function(e){o.push({key:e,metadata:{},value:{}})})),r.upsertAll(o)}})):r.delete()}))},o.prototype._getShreddedStoreNames=function(){return this._getShreddedNamesStore().then((function(e){return e.keys()}))},o.prototype.delete=function(r,t){if(!r)return n.warn("Offline Persistence Toolkit OfflineCache: delete() request is a required parameter. To clear the cache, please call clear()"),Promise.resolve(!1);n.log("Offline Persistence Toolkit OfflineCache: delete() for Request with url: "+r.url);var o=this;return o._getStore().then((function(a){if(e.hasShredder(r)){var u=e.constructSearchCriteria(r,t);u.fields=["key","value"];var s=t&&t.ignoreVary;return a.find(u).then((function(t){if(t&&t.length){var u=t.filter(i(s,r,"value")),c=[];return u.forEach((function(r){c.push(a.removeByKey(r.key));var t=o._cacheKeys.indexOf(r.key);t>=0&&o._cacheKeys.splice(t,1),r.value.responseData.bodyAbstract&&r.value.responseData.bodyAbstract.length&&c.push(e.deleteShreddedData(JSON.parse(r.value.responseData.bodyAbstract)))})),Promise.all(c).then((function(){return n.log("Offline Persistence Toolkit OfflineCache: all matching entries are deleted from both the cache store and the shredded store."),!0}))}return!1}))}return c(a,r,t).then((function(e){if(e&&e.length){var r=e.map((function(e){var r=o._cacheKeys.indexOf(e);return r>=0&&o._cacheKeys.splice(r,1),a.removeByKey(e)}));return Promise.all(r)}return[]})).then((function(e){return!(!e||!e.length)}))})).catch((function(e){return n.log("Offline Persistence Toolkit OfflineCache: error occurred delete() for Request with url: "+r.url),!1}))},o.prototype.keys=function(e,r){e?n.log("Offline Persistence Toolkit OfflineCache: keys() for Request with url: "+e.url):n.log("Offline Persistence Toolkit OfflineCache: keys()");var o=this;return o._getStore().then((function(){return c(o._store,e,r)})).then((function(e){var r=[];return e.forEach((function(e){r.push(o._store.findByKey(e).then((function(e){return t.requestFromJSON(e.requestData)})))})),Promise.all(r)})).catch((function(r){return n.log("Offline Persistence Toolkit OfflineCache: keys() error for Request with url: "+e.url),[]}))},o.prototype.hasMatch=function(e,r){return n.log("Offline Persistence Toolkit OfflineCache: hasMatch() for Request with url: "+e.url),this._getCacheEntries(e,r).then((function(t){return null!==a(r&&r.ignoreVary,e,t)}))},o.prototype.clear=function(){n.log("Offline Persistence Toolkit OfflineCache: clear()");var e=this;return e._getStore().then((function(t){var n=[];return n.push(t.delete()),e._getShreddedStoreNames().then((function(t){return t.forEach((function(e){n.push(r.deleteStore(e))})),Promise.all(n).then((function(r){return e._updateShreddedStoreNames(null)})).then((function(){return e._cacheKeys=[],!0}))}))})).catch((function(e){n.log("Offline Persistence Toolkit OfflineCache: clear() error")}))},o}));
/**
 * Copyright (c) 2017, Oracle and/or its affiliates.
 * All rights reserved.
 */

define('persist/impl/offlineCacheManager',["./OfflineCache","./logger"],(function(e,r){"use strict";function t(){this._prefix="offlineCaches-",this._caches={},this._cachesArray=[]}return t.prototype.open=function(t){r.log("Offline Persistence Toolkit OfflineCacheManager: open() with name: "+t);var n=this._caches[t];return n||(n=new e(t,this._prefix+t),this._caches[t]=n,this._cachesArray.push(n)),n},t.prototype.match=function(e,t){r.log("Offline Persistence Toolkit OfflineCacheManager: match() for Request with url: "+e.url);var n=function(r,i){return i===r.length?Promise.resolve():r[i].match(e,t).then((function(e){return e?e.clone():n(r,i+1)}))};return n(this._cachesArray,0)},t.prototype.has=function(e){return r.log("Offline Persistence Toolkit OfflineCacheManager: has() for name: "+e),this._caches[e]?Promise.resolve(!0):Promise.resolve(!1)},t.prototype.delete=function(e){r.log("Offline Persistence Toolkit OfflineCacheManager: delete() for name: "+e);var t=this,n=t._caches[e];return n?n.clear().then((function(){return t._cachesArray.splice(t._cachesArray.indexOf(e),1),delete t._caches[e],!0})):Promise.resolve(!1)},t.prototype.keys=function(){r.log("Offline Persistence Toolkit OfflineCacheManager: keys()");for(var e=[],t=0;t<this._cachesArray.length;t++)e.push(this._cachesArray[t].getName());return Promise.resolve(e)},new t}));
/**
 * Copyright (c) 2014-2016 GitHub, Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the
 * "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to
 * the following conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
 * LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.prototype
 */
!function(t){"use strict";if(!t.fetch){var e="URLSearchParams"in t,r="Symbol"in t&&"iterator"in Symbol,o="FileReader"in t&&"Blob"in t&&function(){try{return new Blob,!0}catch(t){return!1}}(),n="FormData"in t,i="ArrayBuffer"in t;if(i)var s=["[object Int8Array]","[object Uint8Array]","[object Uint8ClampedArray]","[object Int16Array]","[object Uint16Array]","[object Int32Array]","[object Uint32Array]","[object Float32Array]","[object Float64Array]"],a=function(t){return t&&DataView.prototype.isPrototypeOf(t)},h=ArrayBuffer.isView||function(t){return t&&s.indexOf(Object.prototype.toString.call(t))>-1};l.prototype.append=function(t,e){t=d(t),e=y(e);var r=this.map[t];this.map[t]=r?r+","+e:e},l.prototype.delete=function(t){delete this.map[d(t)]},l.prototype.get=function(t){return t=d(t),this.has(t)?this.map[t]:null},l.prototype.has=function(t){return this.map.hasOwnProperty(d(t))},l.prototype.set=function(t,e){this.map[d(t)]=y(e)},l.prototype.forEach=function(t,e){for(var r in this.map)this.map.hasOwnProperty(r)&&t.call(e,this.map[r],r,this)},l.prototype.keys=function(){var t=[];return this.forEach((function(e,r){t.push(r)})),p(t)},l.prototype.values=function(){var t=[];return this.forEach((function(e){t.push(e)})),p(t)},l.prototype.entries=function(){var t=[];return this.forEach((function(e,r){t.push([r,e])})),p(t)},r&&(l.prototype[Symbol.iterator]=l.prototype.entries);
// HTTP methods whose capitalization should be normalized
var u=["DELETE","GET","HEAD","OPTIONS","POST","PUT"];v.prototype.clone=function(){return new v(this,{body:this._bodyInit})},_.call(v.prototype),_.call(B.prototype),B.prototype.clone=function(){return new B(this._bodyInit,{status:this.status,statusText:this.statusText,headers:new l(this.headers),url:this.url})},B.error=function(){var t=new B(null,{status:0,statusText:""});return t.type="error",t};var f=[301,302,303,307,308];B.redirect=function(t,e){if(-1===f.indexOf(e))throw new RangeError("Invalid status code");return new B(null,{status:e,headers:{location:t}})},t.Headers=l,t.Request=v,t.Response=B,t.fetch=function(t,e){return new Promise((function(r,n){var i=new v(t,e),s=new XMLHttpRequest;// @HTMLUpdateOK
s.onload=function(){var t,e,o={status:s.status,statusText:s.statusText,headers:(t=s.getAllResponseHeaders()||"",e=new l,t.replace(/\r?\n[\t ]+/g," ").split(/\r?\n/).forEach((function(t){var r=t.split(":"),o=r.shift().trim();if(o){var n=r.join(":").trim();e.append(o,n)}})),e)};o.url="responseURL"in s?s.responseURL:o.headers.get("X-Request-URL");var n="response"in s?s.response:s.responseText;r(new B(n,o))},s.onerror=function(){n(new TypeError("Network request failed"))},s.ontimeout=function(){n(new TypeError("Network request failed"))},s.open(i.method,i.url,!0),"include"===i.credentials&&(s.withCredentials=!0),"responseType"in s&&o&&(s.responseType="blob"),i.headers.forEach((function(t,e){s.setRequestHeader(e,t)})),s.send(void 0===i._bodyInit?null:i._bodyInit)}))},t.fetch.polyfill=!0}function d(t){if("string"!=typeof t&&(t=String(t)),/[^a-z0-9\-#$%&'*+.\^_`|~]/i.test(t))throw new TypeError("Invalid character in header field name");return t.toLowerCase()}function y(t){return"string"!=typeof t&&(t=String(t)),t}
// Build a destructive iterator for the value list
function p(t){var e={next:function(){var e=t.shift();return{done:void 0===e,value:e}}};return r&&(e[Symbol.iterator]=function(){return e}),e}function l(t){this.map={},t instanceof l?t.forEach((function(t,e){this.append(e,t);// @XSSFalsePositive
}),this):Array.isArray(t)?t.forEach((function(t){this.append(t[0],t[1]);// @XSSFalsePositive
}),this):t&&Object.getOwnPropertyNames(t).forEach((function(e){this.append(e,t[e]);// @XSSFalsePositive
}),this)}function c(t){if(t.bodyUsed)return Promise.reject(new TypeError("Already read"));t.bodyUsed=!0}function b(t){return new Promise((function(e,r){t.onload=function(){e(t.result)},t.onerror=function(){r(t.error)}}))}function m(t){var e=new FileReader,r=b(e);return e.readAsArrayBuffer(t),r}function w(t){if(t.slice)return t.slice(0);var e=new Uint8Array(t.byteLength);return e.set(new Uint8Array(t)),e.buffer}function _(){return this.bodyUsed=!1,this._initBody=function(t){if(this._bodyInit=t,t)if("string"==typeof t)this._bodyText=t;else if(o&&Blob.prototype.isPrototypeOf(t))this._bodyBlob=t;else if(n&&FormData.prototype.isPrototypeOf(t))this._bodyFormData=t;else if(e&&URLSearchParams.prototype.isPrototypeOf(t))this._bodyText=t.toString();else if(i&&o&&a(t))this._bodyArrayBuffer=w(t.buffer),
// IE 10-11 can't handle a DataView body.
this._bodyInit=new Blob([this._bodyArrayBuffer]);else{if(!i||!ArrayBuffer.prototype.isPrototypeOf(t)&&!h(t))throw new Error("unsupported BodyInit type");this._bodyArrayBuffer=w(t)}else this._bodyText="";this.headers.get("content-type")||("string"==typeof t?this.headers.set("content-type","text/plain;charset=UTF-8"):this._bodyBlob&&this._bodyBlob.type?this.headers.set("content-type",this._bodyBlob.type):e&&URLSearchParams.prototype.isPrototypeOf(t)&&this.headers.set("content-type","application/x-www-form-urlencoded;charset=UTF-8"))},o&&(this.blob=function(){var t=c(this);if(t)return t;if(this._bodyBlob)return Promise.resolve(this._bodyBlob);if(this._bodyArrayBuffer)return Promise.resolve(new Blob([this._bodyArrayBuffer]));if(this._bodyFormData)throw new Error("could not read FormData body as blob");return Promise.resolve(new Blob([this._bodyText]))},this.arrayBuffer=function(){return this._bodyArrayBuffer?c(this)||Promise.resolve(this._bodyArrayBuffer):this.blob().then(m)}),this.text=function(){var t,e,r,o=c(this);if(o)return o;if(this._bodyBlob)return t=this._bodyBlob,r=b(e=new FileReader),e.readAsText(t),r;if(this._bodyArrayBuffer)return Promise.resolve(function(t){for(var e=new Uint8Array(t),r=new Array(e.length),o=0;o<e.length;o++)r[o]=String.fromCharCode(e[o]);return r.join("")}(this._bodyArrayBuffer));if(this._bodyFormData)throw new Error("could not read FormData body as text");return Promise.resolve(this._bodyText)},n&&(this.formData=function(){return this._bodyFormData?Promise.resolve(this._bodyFormData):this.text().then(A)}),this.json=function(){return this.text().then(JSON.parse)},this}function v(t,e){var r,o,n=(e=e||{}).body;if(t instanceof v){if(t.bodyUsed)throw new TypeError("Already read");this.url=t.url,this.credentials=t.credentials,e.headers||(this.headers=new l(t.headers)),this.method=t.method,this.mode=t.mode,n||null==t._bodyInit||(n=t._bodyInit,t.bodyUsed=!0)}else this.url=String(t);if(this.credentials=e.credentials||this.credentials||"omit",!e.headers&&this.headers||(this.headers=new l(e.headers)),this.method=(o=(r=e.method||this.method||"GET").toUpperCase(),u.indexOf(o)>-1?o:r),this.mode=e.mode||this.mode||null,this.referrer=null,("GET"===this.method||"HEAD"===this.method)&&n)throw new TypeError("Body not allowed for GET or HEAD requests");this._initBody(n)}function A(t){var e=new FormData;return t.trim().split("&").forEach((function(t){if(t){var r=t.split("="),o=r.shift().replace(/\+/g," "),n=r.join("=").replace(/\+/g," ");e.append(decodeURIComponent(o),decodeURIComponent(n))}})),e}function B(t,e){e||(e={}),this.type="default",this.status="status"in e?e.status:200,this.ok=this.status>=200&&this.status<300,this.statusText="statusText"in e?e.statusText:"OK",this.headers=new l(e.headers),this.url=e.url||"",this._initBody(t)}}("undefined"!=typeof self?self:this);
define("persist/impl/fetch", function(){});

/**
 * Copyright (c) 2017, Oracle and/or its affiliates.
 * All rights reserved.
 */

define('persist/persistenceManager',["./impl/PersistenceXMLHttpRequest","./impl/PersistenceSyncManager","./impl/offlineCacheManager","./impl/logger","./impl/fetch"],(function(e,t,n,r){"use strict";function i(){Object.defineProperty(this,"_registrations",{value:[],writable:!0}),Object.defineProperty(this,"_eventListeners",{value:[],writable:!0}),Object.defineProperty(this,"_forceOffline",{value:!1,writable:!0}),Object.defineProperty(this,"_isOffline",{value:!1,writable:!0}),Object.defineProperty(this,"_cache",{value:null,writable:!0}),Object.defineProperty(this,"_persistenceSyncManager",{value:new t(this.isOnline.bind(this),this.browserFetch.bind(this),this.getCache.bind(this))})}function o(){return"undefined"!=typeof window&&null!=window}function s(e,t){Object.defineProperty(this,"scope",{value:e,enumerable:!0}),Object.defineProperty(this,"_persistenceManager",{value:t}),Object.defineProperty(this,"_eventListeners",{value:[],writable:!0})}function a(e){return function t(n,i){var o=this,s=n,a=i;if(r.log("Offline Persistence Toolkit persistenceRequest: Create New Request"),n._input){for(var c in r.log("Offline Persistence Toolkit persistenceRequest: Input is a PersistenceRequest"),s=n._input,a=Object.assign({},n._init),i)i.hasOwnProperty(c)&&(a[c]=i[c]);if(n.headers&&a&&a.body&&a.body instanceof FormData)if(a.headers){var u=n.headers.get("Content-Type");a.headers.set("Content-Type",u)}else a.headers=n.headers}this._browserRequest=new e._browserRequestConstructor(s,a),this._input=s,this._init=a;var f,b=function(e){var t=Object.getOwnPropertyDescriptor(o._browserRequest,e);t&&(t.writable||t.set)?Object.defineProperty(o,e,{get:function(){return o._browserRequest[e]},set:function(t){o._browserRequest[e]=t},enumerable:!0}):Object.defineProperty(o,e,{get:function(){return o._browserRequest[e]},enumerable:!0})};for(f in this._browserRequest)"body"!=f&&"function"==typeof this._browserRequest[f]||b(f);var h=this.headers.get("Content-Type");null!=h&&h.indexOf("boundary=")>-1&&h.indexOf("form-data")>-1&&(h=h.split("boundary="),this._boundary="--"+h[h.length-1]),this.arrayBuffer=function(){r.log("Offline Persistence Toolkit persistenceRequest: Called arrayBuffer()");var e=this;try{return e._init&&e._init.body&&e._init.body instanceof FormData?l(e._init.body,e._boundary).then((function(e){var t;return t=e,(new TextEncoder).encode(t).buffer})):e._browserRequest.arrayBuffer()}catch(e){return Promise.reject(e)}},this.blob=function(){r.log("Offline Persistence Toolkit persistenceRequest: Called blob()");var e=this;try{return e._init&&e._init.body&&e._init.body instanceof FormData?l(e._init.body,e._boundary).then((function(t){return new Blob([t],{type:e.headers.get("Content-Type")})})):e._browserRequest.blob()}catch(e){return Promise.reject(e)}},this.formData=function(){r.log("Offline Persistence Toolkit persistenceRequest: Called formData()");var e=this;try{return e._init&&e._init.body&&e._init.body instanceof FormData?Promise.resolve(e._init.body):e._browserRequest.formData()}catch(e){return Promise.reject(e)}},this.json=function(){r.log("Offline Persistence Toolkit persistenceRequest: Called json()");var e=this;try{return e._init&&e._init.body&&e._init.body instanceof FormData?Promise.reject(new SyntaxError("Unexpected number in JSON at position 1")):e._browserRequest.json()}catch(e){return Promise.reject(e)}},this.text=function(){r.log("Offline Persistence Toolkit persistenceRequest: Called text()");var e=this;try{return e._init&&e._init.body&&e._init.body instanceof FormData?l(e._init.body,e._boundary):e._browserRequest.text()}catch(e){return Promise.reject(e)}},this.clone=function(){r.log("Offline Persistence Toolkit persistenceRequest: Called clone()");var e=this;e.headers&&e._init&&e._init.body&&e._init.body instanceof FormData&&(e._init.headers=e.headers);var n=new t(e._input,e._init);return n._browserRequest=e._browserRequest.clone(),n},this.toString=function(){return r.log("Offline Persistence Toolkit persistenceRequest:requestToString()"),this._input.url?this._input.url:this._input}}}function l(e,t){return new Promise((function(n,r){var i=[],o=t;e.forEach((function(e,n){i.push(function(e,t,n){return new Promise((function(r,i){var o;switch(e.constructor.name){case"File":var s=new FileReader;s.onload=function(i){o='\r\nContent-Disposition: form-data; name="'+t.toString()+'"; filename="'+e.name+'"\r\nContent-Type: '+e.type+"\r\n\r\n"+i.target.result+"\r\n"+n,r(o)},s.onerror=function(){s.abort(),i(new DOMException("Problem parsing input file."))},s.readAsText(e);break;case"String":r(o='\r\nContent-Disposition: form-data; name="'+t+'"\r\n\r\n'+e+"\r\n"+n);break;default:o='\r\nContent-Disposition: form-data; name="'+t.toString()+'"\r\n\r\n'+e.toString()+"\r\n"+n,r(o)}}))}(e,n,t))})),Promise.all(i).then((function(e){e.forEach((function(e){o+=e})),n(o+="--")})).catch((function(e){r(e)}))}))}return i.prototype.init=function(){return r.log("Offline Persistence Toolkit PersistenceManager: Initilizing"),function(t){var n,i;n=/^((?!chrome|android).)*safari/i.test(navigator.userAgent),i=/\((iPad|iPhone)/i.test(navigator.userAgent),!n&&!i||t._browserRequestConstructor||t._persistenceRequestConstructor||(r.log("Offline Persistence Toolkit PersistenceManager: Replacing Safari Browser APIs"),Object.defineProperty(t,"_browserRequestConstructor",{value:self.Request,writable:!1}),Object.defineProperty(t,"_persistenceRequestConstructor",{value:a(t),writable:!1}),self.Request=t._persistenceRequestConstructor,o()||t._browserFetchFunc||(Object.defineProperty(t,"_browserFetchFunc",{value:self.fetch,writable:!1}),self.fetch=function(e){function t(e){Object.defineProperty(this,"isReload",{value:!1,enumerable:!0}),Object.defineProperty(this,"clientId",{value:null,enumerable:!0}),Object.defineProperty(this,"client",{value:null,enumerable:!0}),Object.defineProperty(this,"request",{value:e,enumerable:!0}),Object.defineProperty(this,"_resolveCallback",{value:null,writable:!0}),Object.defineProperty(this,"_rejectCallback",{value:null,writable:!0})}return t.prototype.respondWith=function(e){var t=this;if(e instanceof Promise)e.then((function(e){t._resolveCallback(e)}),(function(e){t._rejectCallback(e)}));else if("function"==typeof e){var n=e();t._resolveCallback(n)}},t.prototype._setPromiseCallbacks=function(e,t){this._resolveCallback=e,this._rejectCallback=t},function(t,n){var i;return i=Request.prototype.isPrototypeOf(t)&&!n?t:new Request(t,n),r.log("Offline Persistence Toolkit serviceWorkerFetch:"+i.url),i._browserRequest&&(i=i._browserRequest),new Promise((function(t,n){e._browserFetchFunc.call(self,i).then((function(e){t(e)}),(function(e){n(e)}))}))}}(t))),!o()||t._browserFetchFunc||t._browserXMLHttpRequest||(r.log("Offline Persistence Toolkit PersistenceManager: Replacing browser APIs"),Object.defineProperty(t,"_browserFetchFunc",{value:window.fetch,writable:!1}),Object.defineProperty(t,"_browserXMLHttpRequest",{value:window.XMLHttpRequest,writable:!1}),window.fetch=function(e){function t(e){Object.defineProperty(this,"isReload",{value:!1,enumerable:!0}),Object.defineProperty(this,"clientId",{value:null,enumerable:!0}),Object.defineProperty(this,"client",{value:null,enumerable:!0}),Object.defineProperty(this,"request",{value:e,enumerable:!0}),Object.defineProperty(this,"_resolveCallback",{value:null,writable:!0}),Object.defineProperty(this,"_rejectCallback",{value:null,writable:!0})}return t.prototype.respondWith=function(e){var t=this;if(e instanceof Promise)e.then((function(e){t._resolveCallback(e)}),(function(e){t._rejectCallback(e)}));else if("function"==typeof e){var n=e();t._resolveCallback(n)}},t.prototype._setPromiseCallbacks=function(e,t){this._resolveCallback=e,this._rejectCallback=t},function(n,i){var o;return o=Request.prototype.isPrototypeOf(n)&&!i?n:new Request(n,i),e.getRegistration(o.url).then((function(n){if(null!=n){var i=new t(o),s=function(e,t,n){var i,o,s,a,l=null,c=e._registrations,u=null!=c?c.length:0;for(i=0;i<u;i++)if(s=c[i],null!=n.request.url.match(s.scope)){for(a=s._eventListeners.length,o=0;o<a;o++)s._eventListeners[o].type==t&&(null===l&&n._setPromiseCallbacks instanceof Function&&(l=new Promise((function(e,t){n._setPromiseCallbacks(e,t)}))),r.log("Offline Persistence Toolkit PersistenceManager: Calling fetch event listener"),s._eventListeners[o].listener(n));if(null!=l)return l}return!0}(e,"fetch",i);if(null!=s&&s instanceof Promise)return s}return e.browserFetch(o)}))}}(t),window.XMLHttpRequest=function(){return null!=t._browserFetchRequest?new t._browserXMLHttpRequest:new e(t._browserXMLHttpRequest)})}(this),function(e){var t=e;o()&&!t._addedBrowserEventListeners&&(r.log("Offline Persistence Toolkit PersistenceManager: Adding browser event listeners"),window.addEventListener("offline",(function(e){t._isOffline=!0}),!1),window.addEventListener("online",(function(e){t._isOffline=!1}),!1),t._addedBrowserEventListeners=!0)}(this),this._cache=n.open("systemCache"),Promise.resolve()},i.prototype.forceOffline=function(e){r.log("Offline Persistence Toolkit PersistenceManager: forceOffline is called with value: "+e),this._forceOffline=e},i.prototype.getCache=function(){return this._cache},i.prototype.isOnline=function(){var e=navigator.onLine;return navigator.network&&navigator.network.connection&&navigator.network.connection.type==Connection.NONE&&(e=!1,r.log("Offline Persistence Toolkit PersistenceManager: Cordova network info plugin is returning online value: "+e)),e&&!this._isOffline&&!this._forceOffline},i.prototype.register=function(e){var t=new s((e=e||{}).scope,this);return this._registrations.push(t),Promise.resolve(t)},i.prototype.getRegistration=function(e){var t,n,r=this._registrations.length;for(t=0;t<r;t++)if(n=this._registrations[t],e.match(n.scope))return Promise.resolve(n);return Promise.resolve()},i.prototype.getRegistrations=function(){return Promise.resolve(this._registrations.slice())},i.prototype.getSyncManager=function(){return this._persistenceSyncManager},i.prototype.browserFetch=function(e){var t=this;r.log("Offline Persistence Toolkit PersistenceManager: browserFetch() for Request with url: "+e.url);var n=e;return o()?(Object.defineProperty(this,"_browserFetchRequest",{value:e,writable:!0}),new Promise((function(i,o){r.log("Offline Persistence Toolkit PersistenceManager: Calling browser fetch function for Request with url: "+e.url),e._browserRequest&&(n=e._browserRequest),t._browserFetchFunc.call(window,n).then((function(e){i(e)}),(function(e){o(e)})),t._browserFetchRequest=null}))):(e._browserRequest&&(n=e._browserRequest),fetch(n))},s.prototype.addEventListener=function(e,t){this._eventListeners.push({type:e.toLowerCase(),listener:t})},s.prototype.unregister=function(){return Promise.resolve(function(e,t){var n=e,r=n._registrations.indexOf(t);return r>-1&&(n._registrations.splice(r,1),!0)}(this._persistenceManager,this))},new i}));
/**
 * Copyright (c) 2017, Oracle and/or its affiliates.
 * All rights reserved.
 */

define('persist/cacheStrategies',["./persistenceManager","./persistenceUtils","./impl/logger"],(function(e,t,n){"use strict";function r(e,t){var n=e.get("Cache-Control");if(n){var r,a,i,s=n.split(",");for(r=0;r<s.length;r++)if(0===(a=s[r].trim()).indexOf(t))return!((i=a.split("=")).length>1)||i[1].trim()}return null}function a(r,a,i){return t.isCachedResponse(a)?e.isOnline()?e.browserFetch(r).then((function(t){return 304==t.status?a:e.getCache().delete(r).then((function(){return n.log("Offline Persistence Toolkit cacheStrategies: Removing old entry based on HTTP revalidation"),t}))})):i?t.responseToJSON(a).then((function(e){return e.status=504,e.statusText="cache-control: must-revalidate failed due to application being offline",n.log("Offline Persistence Toolkit cacheStrategies: Returning Response status 504 based HTTP revalidation"),t.responseFromJSON(e)})):Promise.resolve(a):Promise.resolve(a)}return{getHttpCacheHeaderStrategy:function(){return function(i,s){return function(e,r){var a=r.headers.get("Expires"),i=r.headers.get("x-oracle-jscpt-cache-expiration-date");!a||!t.isCachedResponse(r)||i&&0!=i.length||(r.headers.set("x-oracle-jscpt-cache-expiration-date",a),n.log("Offline Persistence Toolkit cacheStrategies: Set x-oracle-jscpt-cache-expiration-date header based on HTTP Expires header"))}(0,s),function(e,a){var i=r(a.headers,"max-age");if(null!=i&&t.isCachedResponse(a)){var s=e.headers.get("Date");s||(s=(new Date).toUTCString());var o=new Date(s).getTime(),c=new Date(o+1e3*i);a.headers.set("x-oracle-jscpt-cache-expiration-date",c.toUTCString()),n.log("Offline Persistence Toolkit cacheStrategies: Set x-oracle-jscpt-cache-expiration-date header based on HTTP max-age header")}}(i,s),function(r,i){var s=r.headers.get("If-Match"),o=r.headers.get("If-None-Match");if(s||o){if(e.isOnline())return a(r,i,!1);var c=i.headers.get("ETag");if(s&&c.indexOf(s)<0)return t.responseToJSON(i).then((function(e){return e.status=412,e.statusText="If-Match failed due to no matching ETag while offline",n.log("Offline Persistence Toolkit cacheStrategies: Returning Response status 412 based on ETag and HTTP If-Match header"),t.responseFromJSON(e)}));if(o&&c.indexOf(o)>=0)return t.responseToJSON(i).then((function(e){return e.status=412,e.statusText="If-None-Match failed due to matching ETag while offline",n.log("Offline Persistence Toolkit cacheStrategies: Returning Response status 412 based on ETag and HTTP If-None-Match header"),t.responseFromJSON(e)}))}return Promise.resolve(i)}(i,s).then((function(e){return function(e,t){if(r(t.headers,"must-revalidate")){var i=t.headers.get("x-oracle-jscpt-cache-expiration-date");if(i){var s=new Date(i).getTime();if((new Date).getTime()>s)return n.log("Offline Persistence Toolkit cacheStrategies: Handling revalidation HTTP must-revalidate header"),a(e,t,!0)}}return Promise.resolve(t)}(i,e)})).then((function(e){return function(e,t){return function(e,t){if(r(t.headers,"no-cache"))return n.log("Offline Persistence Toolkit cacheStrategies: Has HTTP no-cache header"),!0;var a=e.headers.get("Pragma"),i=a&&"no-cache"===a.trim();return i&&n.log("Offline Persistence Toolkit cacheStrategies: Has HTTP Pragma no-cache header"),i}(e,t)?a(e,t):Promise.resolve(t)}(i,e)})).then((function(a){return function(a,i){return null!=r(i.headers,"no-store")?(t.isCachedResponse(i)&&i.headers.delete("x-oracle-jscpt-cache-expiration-date"),n.log("Offline Persistence Toolkit cacheStrategies: Has HTTP no-store header"),Promise.resolve(i)):function(r,a){if(null==a||t.isCachedResponse(a)||"GET"!=r.method&&"HEAD"!=r.method)return Promise.resolve(a);var i=a.clone();return e.getCache().put(r,a).then((function(){return n.log("Offline Persistence Toolkit cacheStrategies: Cached Request/Response"),i}))}(a,i)}(i,a)}))}}}}));
/**
 * Copyright (c) 2017, Oracle and/or its affiliates.
 * All rights reserved.
 */

define('persist/fetchStrategies',["./persistenceManager","./persistenceUtils","./impl/defaultCacheHandler","./impl/logger"],(function(e,n,t,r){"use strict";function s(n,t,s){return new Promise((function(i,l){r.log("Offline Persistence Toolkit fetchStrategies: Process queryParams for Request"),function(e,n){var t=function(e){var n=null;return null!=e.queryHandler&&(n=e.queryHandler),n}(n);return null==t?Promise.resolve():t(e,n)}(n,t).then((function(t){t?(i(t.clone()),o(n,s)):(r.log("Offline Persistence Toolkit fetchStrategies: Response for queryParams is not null"),function(n){return e.getCache().match(n)}(n).then((function(t){t?(r.log("Offline Persistence Toolkit fetchStrategies: Cached Response is not null"),i(t),o(n,s)):(r.log("Offline Persistence Toolkit fetchStrategies: Cached Response is null"),e.browserFetch(n).then((function(e){var t=e.clone();i(t),s&&s(n,e)}),(function(e){i(new Response(null,{status:503,statusText:"No cached response exists"}))})))})))}))}))}function o(t,s){s&&(r.log("Offline Persistence Toolkit fetchStrategies: Fetch for ServerResponseCallback"),e.browserFetch(t).then((function(e){n._cloneResponse(e,{url:t.url}).then((function(e){s(t,e)}))})))}return{getCacheFirstStrategy:function(o){var i=(o=o||{}).serverResponseCallback,l="disabled"==o.backgroundFetch;return l&&(i=null),i||l||(i=function(e,n){return Promise.resolve(n)}),function(o,l){if(r.log("Offline Persistence Toolkit fetchStrategies: Processing CacheFirstStrategy"),i)var c=function(r,s){var o=n.buildEndpointKey(r);t.registerEndpointOptions(o,l);var c={};return n._cloneResponse(s,{url:r.url}).then((function(e){return i(r,e)})).then((function(n){return c.resolvedResponse=n,e.getCache().hasMatch(r)})).then((function(t){var s=c.resolvedResponse.clone();return t?null==c.resolvedResponse||n.isCachedResponse(c.resolvedResponse)||"GET"!=r.method&&"HEAD"!=r.method?s:e.getCache().put(r,c.resolvedResponse).then((function(){return s})):s})).finally((function(){t.unregisterEndpointOptions(o)}))};return s(o,l,c)}},getCacheIfOfflineStrategy:function(){return function(t,o){return r.log("Offline Persistence Toolkit fetchStrategies: Processing CacheIfOfflineStrategy"),e.isOnline()?e.browserFetch(t).then((function(e){return e.ok?n._cloneResponse(e,{url:t.url}):function(e,n,t){return n.status<500?(r.log("Offline Persistence Toolkit fetchStrategies: Response is not ok"),Promise.resolve(n)):s(e,t)}(t,e,o)}),(function(e){return r.log(e),s(t,o)})):s(t,o)}}}}));
/**
 * Copyright (c) 2017, Oracle and/or its affiliates.
 * All rights reserved.
 */

define('persist/defaultResponseProxy',["./persistenceManager","./persistenceUtils","./fetchStrategies","./cacheStrategies","./persistenceStoreManager","./impl/defaultCacheHandler","./impl/logger"],(function(e,t,n,r,o,s,i){"use strict";function l(e){null==(e=e||{}).fetchStrategy&&(e.fetchStrategy=n.getCacheIfOfflineStrategy()),null==e.cacheStrategy&&(e.cacheStrategy=r.getHttpCacheHeaderStrategy()),e.requestHandlerOverride=e.requestHandlerOverride||{},null==e.requestHandlerOverride.handleGet&&(e.requestHandlerOverride.handleGet=this.handleGet),null==e.requestHandlerOverride.handlePost&&(e.requestHandlerOverride.handlePost=this.handlePost),null==e.requestHandlerOverride.handlePut&&(e.requestHandlerOverride.handlePut=this.handlePut),null==e.requestHandlerOverride.handlePatch&&(e.requestHandlerOverride.handlePatch=this.handlePatch),null==e.requestHandlerOverride.handleDelete&&(e.requestHandlerOverride.handleDelete=this.handleDelete),null==e.requestHandlerOverride.handleHead&&(e.requestHandlerOverride.handleHead=this.handleHead),null==e.requestHandlerOverride.handleOptions&&(e.requestHandlerOverride.handleOptions=this.handleOptions),Object.defineProperty(this,"_options",{value:e})}function u(t){return e.isOnline()?e.browserFetch(t):Promise.resolve(new Response(null,{status:503,statusText:"Must provide handlePost override for offline"}))}function a(e,t){var n=e;return(0,n._options.fetchStrategy)(t,n._options)}function d(e,n){return i.log("Offline Persistence Toolkit DefaultResponseProxy: Processing offline logic for default PUT Handler"),t.requestToJSON(n).then((function(e){e.status=200,e.statusText="OK",e.headers["content-type"]="application/json",e.headers["x-oracle-jscpt-cache-expiration-date"]="";var n=e.headers["if-match"],r=e.headers["if-none-match"];if(n||r){i.log("Offline Persistence Toolkit DefaultResponseProxy: Generating ETag for offline Response for default PUT Handler");var o=Math.floor(1e6*Math.random());e.headers.etag=(Date.now()+o).toString(),e.headers["x-oracle-jscpt-etag-generated"]=e.headers.etag,delete e.headers["if-match"],delete e.headers["if-none-match"]}return t.responseFromJSON(e)}))}function f(e,n){var r=e;return i.log("Offline Persistence Toolkit DefaultResponseProxy: Processing offline logic for default DELETE Handler"),t.requestToJSON(n).then((function(e){return e.status=200,e.statusText="OK",e.headers["content-type"]="application/json",e.headers["x-oracle-jscpt-cache-expiration-date"]="",t.responseFromJSON(e).then((function(s){var i=h(n),l=null;return r._options&&r._options.jsonProcessor&&r._options.jsonProcessor.shredder&&(l=r._options.jsonProcessor.shredder),l?l(s).then((function(n){if(n){var r=n[0].name;return o.openStore(r).then((function(n){return n.findByKey(i).then((function(n){return n?t.responseFromJSON(e).then((function(e){return t.setResponsePayload(e,n).then((function(e){return e}))})):s}))}))}return s})):s}))}))}function c(e,t,n,r){var o=e;return n.status<500?Promise.resolve(n):r(o,t)}function h(e){var t=e.url.split("/");return t[t.length-1]}function p(t,n,r){return!e.isOnline()||r?e.getSyncManager().insertRequest(t,{undoRedoDataArray:n}):Promise.resolve()}function h(e){var t=e.url.split("/");return t.length>1?t[t.length-1].split("?")[0]:null}return l.prototype.getFetchEventListener=function(){var e=this;return function(t){t.respondWith(e.processRequest(t.request))}},l.prototype.processRequest=function(n){var r=this,l=t.buildEndpointKey(n);return new Promise((function(u,a){s.registerEndpointOptions(l,r._options);var d=function(e,n){var r=e,o=r._options,s=null;return t.isReplayRequest(n)?s=r.handleSyncReplay:"POST"===n.method?s=o.requestHandlerOverride.handlePost:"GET"===n.method?s=o.requestHandlerOverride.handleGet:"PUT"===n.method?s=o.requestHandlerOverride.handlePut:"PATCH"===n.method?s=o.requestHandlerOverride.handlePatch:"DELETE"===n.method?s=o.requestHandlerOverride.handleDelete:"HEAD"===n.method?s=o.requestHandlerOverride.handleHead:"OPTIONS"===n.method&&(s=o.requestHandlerOverride.handleOptions),s}(r,n),f={};f.isReplayRequest=t.isReplayRequest(n);var c=n.clone();i.log("Offline Persistence Toolkit DefaultResponseProxy: Calling requestHandler for request with enpointKey: "+l),d.call(r,n).then((function(e){return t.isCachedResponse(e)&&(i.log("Offline Persistence Toolkit DefaultResponseProxy: Response is cached for request with enpointKey: "+l),f.isCachedResponse=!0),e.ok?(i.log("Offline Persistence Toolkit DefaultResponseProxy: Response is ok for request with enpointKey: "+l),function(e,t,n){var r=e;return"GET"===t.method||"HEAD"===t.method?(0,r._options.cacheStrategy)(t,n,r._options):Promise.resolve(n)}(r,n,e)):(i.log("Offline Persistence Toolkit DefaultResponseProxy: Response is not ok for request with enpointKey: "+l),e)})).then((function(e){return f.response=e,e.ok?(i.log("Offline Persistence Toolkit DefaultResponseProxy: Response is ok after cacheStrategy for request with enpointKey: "+l),function(e,t){return"GET"==e.method||"HEAD"==e.method?Promise.resolve():function(e,t){return s.constructShreddedData(e,t).then((function(t){return t?function(e,t){var n=[];return t.forEach((function(t){var r=Object.keys(t)[0];n.push(function(e,t,n){return function(e,t,n){var r,s,i=[],l=function(n,u){return n<u.length&&"GET"!==e.method&&"HEAD"!==e.method?u[n].key?(r=u[n].key.toString(),s="DELETE"!==e.method?u[n].value:null,o.openStore(t).then((function(e){return e.findByKey(r).then((function(e){return i.push({key:r,undo:e,redo:s}),l(++n,u)}),(function(e){return i.push({key:r,undo:null,redo:s}),l(++n,u)}))}))):l(++n,u):Promise.resolve(i)};return l(0,n)}(e,t,n).then((function(r){if("DELETE"===e.method){if(!n||0===n.length){var s=h(e);n=[{key:s}]}return function(e,t,n){return o.openStore(e).then((function(e){return e.removeByKey(t[0].key)})).then((function(){return n.length>0?{storeName:e,operation:"remove",undoRedoData:n}:null}))}(t,n,r)}return function(e,t,n){return o.openStore(e).then((function(e){return e.upsertAll(t)})).then((function(){return n.length>0?{storeName:e,operation:"upsert",undoRedoData:n}:null}))}(t,n,r)}))}(e,r,t[r]))})),Promise.all(n)}(e,t):Promise.resolve()}))}(e,t)}(n,e)):(i.log("Offline Persistence Toolkit DefaultResponseProxy: Response is not ok after cacheStrategy for request with enpointKey: "+l),null)})).then((function(t){if(!f.isReplayRequest)return p(n,t,f.isCachedResponse&&!e.isOnline())})).then((function(){s.unregisterEndpointOptions(l),u(f.response)})).catch((function(e){i.log("Offline Persistence Toolkit DefaultResponseProxy: Insert Response in syncManager after error for request with enpointKey: "+l),f.isReplayRequest?(s.unregisterEndpointOptions(l),a(e)):p(c,null,!0).then((function(){s.unregisterEndpointOptions(l),a(e)}),(function(){s.unregisterEndpointOptions(l),a(e)}))}))}))},l.prototype.handlePost=function(e){return i.log("Offline Persistence Toolkit DefaultResponseProxy: Processing Request with default POST Handler"),u(e)},l.prototype.handleSyncReplay=function(n){return i.log("Offline Persistence Toolkit DefaultResponseProxy: Processing Request from Sync Replay"),t.markReplayRequest(n,!1),e.browserFetch(n)},l.prototype.handleGet=function(e){return i.log("Offline Persistence Toolkit DefaultResponseProxy: Processing Request with default GET Handler"),a(this,e)},l.prototype.handleHead=function(e){return i.log("Offline Persistence Toolkit DefaultResponseProxy: Processing Request with default HEAD Handler"),a(this,e)},l.prototype.handleOptions=function(e){return i.log("Offline Persistence Toolkit DefaultResponseProxy: Processing Request with default OPTIONS Handler"),u(e)},l.prototype.handlePut=function(t){return i.log("Offline Persistence Toolkit DefaultResponseProxy: Processing Request with default PUT Handler"),function(t,n){var r=t;return e.isOnline()?e.browserFetch(n.clone()).then((function(e){return e.ok?(i.log("Offline Persistence Toolkit DefaultResponseProxy: Response is ok for default PUT Handler"),e):c(r,n,e,d)}),(function(e){return d(0,n)})):d(0,n)}(this,t)},l.prototype.handlePatch=function(e){return i.log("Offline Persistence Toolkit DefaultResponseProxy: Processing Request with default PATCH Handler"),u(e)},l.prototype.handleDelete=function(t){return i.log("Offline Persistence Toolkit DefaultResponseProxy: Processing Request with default DELETE Handler"),function(t,n){var r=t;return e.isOnline()?e.browserFetch(n.clone()).then((function(e){return e.ok?(i.log("Offline Persistence Toolkit DefaultResponseProxy: Response is ok for default DELETE Handler"),e):c(r,n,e,f)}),(function(e){return f(r,n)})):f(r,n)}(this,t)},{getResponseProxy:function(e){return new l(e)}}}));
/**
 * Copyright (c) 2017, Oracle and/or its affiliates.
 * All rights reserved.
 */

define('persist/simpleJsonShredding',["./persistenceUtils","./impl/logger"],(function(e,r){"use strict";return{getShredder:function(n,t,s){return function(i){r.log("Offline Persistence Toolkit simpleJsonShredding: Shredding Response");var a=i.clone(),o=a.headers.get("Etag");return a.text().then((function(i){var a=[],c=[],d="collection";if(i&&i.length>0)try{var u=JSON.parse(i);if(Array.isArray(u))a=u.map((function(e){if(t instanceof Array){var r=[];return t.forEach((function(n){r.push(e[n])})),r}return e[t]})),c=u;else{if(t instanceof Array){var f=[];t.forEach((function(e){f.push(u[e])})),a[0]=f}else a[0]=u[t];c[0]=u,d="single"}}catch(e){r.log("Offline Persistence Toolkit simpleRestJsonShredding: Error during shredding: "+e)}var l=e._mapData(a,c,s);return[{name:n,resourceIdentifier:o,keys:l.keys,data:l.data,resourceType:d}]}))}},getUnshredder:function(n){return function(t,s){return r.log("Offline Persistence Toolkit simpleJsonShredding: Unshredding Response"),Promise.resolve().then((function(){if(!t||1!==t.length)throw new Error({message:"shredded data is not in the correct format."});var r=e._unmapData(t[0].keys,t[0].data,n),i=function(e){var r=e[0].data;return r&&1===r.length&&"single"===e[0].resourceType?r[0]:r}([{keys:r.keys,data:r.data,resourceType:t[0].resourceType}]);return e.setResponsePayload(s,i)})).then((function(e){return e.headers.set("x-oracle-jscpt-cache-expiration-date",""),e}))}}}}));

define("rjs_bundles/persistenceBundle", function(){});
