/**
 * @license
 * Copyright (c) 2014, 2021, Oracle and/or its affiliates.
 * Licensed under The Universal Permissive License (UPL), Version 1.0
 * as shown at https://oss.oracle.com/licenses/upl/
 * @ignore
 */
define(["ojs/ojcore-base","jquery","ojs/ojlogger","ojs/ojtranslation","ojs/ojdatasource-common"],function(t,e,r,a,i){"use strict";t=t&&Object.prototype.hasOwnProperty.call(t,"default")?t.default:t,e=e&&Object.prototype.hasOwnProperty.call(e,"default")?e.default:e;const s=function(t,e){if(this.data=t||{},!(t instanceof Array||this._isObservableArray(t))){var a=i.TableDataSource._LOGGER_MSG._ERR_DATA_INVALID_TYPE_SUMMARY,n=i.TableDataSource._LOGGER_MSG._ERR_DATA_INVALID_TYPE_DETAIL;throw new Error(a+"\n"+n)}null!=e&&null!=e.idAttribute||r.info(s._LOGGER_MSG._INFO_ARRAY_TABLE_DATASOURCE_IDATTR),s.superclass.constructor.call(this,t,e),this._eventHandlers=[],this._rows={},null!=t&&(this._idAttribute=null,null!=e&&null!=e.idAttribute&&(this._idAttribute=e.idAttribute)),(null==e||"enabled"!==e.startFetch&&null!=e.startFetch)&&null!=e||(this._startFetchEnabled=!0)};t._registerLegacyNamespaceProp("ArrayTableDataSource",s),t.Object.createSubclass(s,i.TableDataSource,"ArrayTableDataSource"),s.prototype.comparator=null,s.prototype.sortCriteria=null,s.prototype.Init=function(){s.superclass.Init.call(this)},s.prototype.add=function(t,e){e=e||{},this._checkDataLoaded();var r=e.at;return this._addToRowSet(t,r,e)},s.prototype.at=function(t,e){var r;return this._checkDataLoaded(),r=t<0||t>=this._rows.data.length?null:{data:this._rows.data[t],index:t,key:this._getId(this._rows.data[t])},new Promise(function(t){t(r)})},s.prototype.change=function(t,e){e=e||{},this._checkDataLoaded();var r=e.silent,a={data:[],keys:[],indexes:[]};t instanceof Array||(t=[t]);for(var s=0;s<t.length;s++){var n=t[s];if(null!=n){var o=this._getId(n),l=this._getInternal(o,!1);a.data.push(this._wrapWritableValue(n)),a.keys.push(o),a.indexes.push(l.index),this._rows.data[l.index]=n}}return!r&&a.data.length>0&&i.TableDataSource.superclass.handleEvent.call(this,i.TableDataSource.EventType.CHANGE,a),Promise.resolve(a)},s.prototype.fetch=function(t){return"init"!==(t=t||{}).fetchType||this._startFetchEnabled?this._fetchInternal(t):Promise.resolve()},s.prototype.get=function(t,e){return this._checkDataLoaded(),Promise.resolve(this._getInternal(t,!0))},s.prototype.getCapability=function(t){return"full"},s.prototype.remove=function(t,e){return e=e||{},this._checkDataLoaded(),this._removeInternal(t,e)},s.prototype.reset=function(t,e){(e=e||{}).previousRows=this._rows;var r=e.silent;return null!=t&&(this.data=t),this._rows={},this._totalSize=0,this._arrayChangeSubscription&&(this._arrayChangeSubscription.dispose(),this._arrayChangeSubscription=null),r||i.TableDataSource.superclass.handleEvent.call(this,i.TableDataSource.EventType.RESET,null),Promise.resolve()},s.prototype.sort=function(t){null==t?t=this.sortCriteria:this.sortCriteria=t,t=t||{},this._checkDataLoaded();var e=this;return new Promise(function(r){var a=e._getComparator();e._rows.data.sort(function(t,r){return s._sortFunc(t,r,a,e)}),e._sorted=!0;var n={header:t.key,direction:t.direction};i.TableDataSource.superclass.handleEvent.call(e,i.TableDataSource.EventType.SORT,n),r(n)})},s.prototype.totalSize=function(){return this._checkDataLoaded(),this._totalSize},s.prototype._addToRowSet=function(t,e,r){var a=(r=r||{}).silent,n={data:[],keys:[],indexes:[]};t instanceof Array||(t=[t]),null==e||e instanceof Array||(e=[e]);for(var o=0;o<t.length;o++){var l=t[o];if(null!=l){var u=this._getId(l);if(n.data.push(this._wrapWritableValue(l)),n.keys.push(u),!0===this._sorted&&this._rows.data.length>0)for(var h=0;h<this._rows.data.length;h++){if(s._sortFunc(l,this._rows.data[h],this._getComparator(),this)<0){this._rows.data.splice(h,0,l),n.indexes.push(h);break}if(h===this._rows.data.length-1){this._rows.data.push(l),n.indexes.push(h+1);break}}else null==e?(this._rows.data.push(l),n.indexes.push(this._rows.data.length-1)):(this._rows.data.splice(e[o],0,l),n.indexes.push(e[o]));this._totalSize+=1,this._realignRowIndices()}}return!a&&n.data.length>0&&i.TableDataSource.superclass.handleEvent.call(this,i.TableDataSource.EventType.ADD,n),Promise.resolve(n)},s.prototype._checkDataLoaded=function(){if(!this._isDataLoaded()){var t=[];this.data instanceof Array?t=this.data:this._isObservableArray(this.data)&&(t=this.data.peek(),this._subscribeObservableArray(this.data)),this._rows=this._getRowArray(t),this._totalSize=t.length}},s.prototype._isDataLoaded=function(){return null!=this._rows&&null!=this._rows.data},s.prototype._fetchInternal=function(t){var e,r,a,i;t=t||{},this._startFetch(t),this._checkDataLoaded();try{e=t.pageSize>0?t.pageSize:-1,this._startIndex||(this._startIndex=0),this._startIndex=null==t.startIndex?this._startIndex:t.startIndex,i=s._getEndIndex(this._rows,this._startIndex,e),r=[],a=[];for(var n=this._startIndex;n<=i;n++){var o=this._getId(this._rows.data[n]),l=this._wrapWritableValue(this._rows.data[n]);r[n-this._startIndex]=l,a[n-this._startIndex]=o}}catch(e){return this._endFetch(t,null,e),Promise.reject(e)}i<this._startIndex&&(this._startIndex=i+1),t.pageSize=e,t.startIndex=this._startIndex,t.refresh=!0;var u={data:r,keys:a,startIndex:this._startIndex};return this._endFetch(t,u,null),Promise.resolve(u)},s.prototype._getInternal=function(t,r){for(var a=null,i=0;i<this._rows.data.length;i++){var s=this._rows.data[i];if(void 0!==s){var n=this._getId(s);if(e.isArray(n)&&e.isArray(t)){if(n.length===t.length){for(var o=!0,l=0;l<t.length;l++)if(n[l]!==t[l]){o=!1;break}if(o){a=r?{data:this._wrapWritableValue(s),key:n,index:this._rows.indexes[i]}:{data:s,key:n,index:this._rows.indexes[i]};break}}}else if(n===t){a=r?{data:this._wrapWritableValue(s),key:n,index:this._rows.indexes[i]}:{data:s,key:n,index:this._rows.indexes[i]};break}}}return a},s.prototype._getComparator=function(){var t=this.comparator;if(null==t){var r=this.sortCriteria.key,a=this.sortCriteria.direction;"ascending"===a?t=function(t){return e.isFunction(t[r])?t[r]():t[r]}:"descending"===a&&(t=function(t,a){var i,s;return e.isFunction(t[r])?(i=t[r](),s=a[r]()):(i=t[r],s=a[r]),i===s?0:i>s?-1:1})}return t},s.prototype._realignRowIndices=function(){for(var t=0;t<this._rows.data.length;t++)this._rows.indexes[t]=t},s.prototype._removeInternal=function(t,e){var r,a=(e=e||{}).silent,s={data:[],keys:[],indexes:[]};t instanceof Array||(t=[t]);var n=[];for(r=0;r<t.length;r++){var o=t[r];if(null!=o){var l=this._getId(o),u=this._getInternal(l,!1);null!=u&&n.push({data:u.data,key:u.key,index:u.index})}}for(n.sort(function(t,e){return t.index-e.index}),r=0;r<n.length;r++)s.data.push(n[r].data),s.keys.push(n[r].key),s.indexes.push(n[r].index);for(r=s.indexes.length-1;r>=0;r--)this._rows.data.splice(s.indexes[r],1),this._rows.indexes.splice(s.indexes[r],1),this._totalSize-=1;return this._realignRowIndices(),!a&&s.data.length>0&&i.TableDataSource.superclass.handleEvent.call(this,i.TableDataSource.EventType.REMOVE,s),Promise.resolve(s)},s.prototype._setRow=function(t,e){this._rows[t]=e,e.index=t},s.prototype._startFetch=function(t){t.silent||i.TableDataSource.superclass.handleEvent.call(this,i.TableDataSource.EventType.REQUEST,{startIndex:t.startIndex})},s.prototype._endFetch=function(t,e,r){null!=r?i.TableDataSource.superclass.handleEvent.call(this,i.TableDataSource.EventType.ERROR,r):t.silent||i.TableDataSource.superclass.handleEvent.call(this,i.TableDataSource.EventType.SYNC,e)},s.prototype._handleRowChange=function(t){t.startIndex=this._startIndex,i.TableDataSource.superclass.handleEvent.call(this,i.TableDataSource.EventType.CHANGE,t)},s._compareKeys=function(t,e,r){if("descending"===r){if(t<e)return 1;if(e<t)return-1}else{if(t>e)return 1;if(e>t)return-1}return 0},s._getEndIndex=function(t,e,r){var a=t.data.length-1;return r>0&&(a=(a=e+r-1)>t.data.length-1?t.data.length-1:a),a},s._getKey=function(t,e){return"function"==typeof t[e]?t[e]():t[e]},s.prototype._getRowArray=function(t){var e=t.length-1,r={data:[],indexes:[]};this._attributes=null;for(var a=0;a<=e;a++){var i={},s=t[a];if(s)for(var n=Object.keys(s),o=0;o<n.length;o++){var l=n[o];i[l]=s[l],0===a&&(null==this._attributes&&(this._attributes=[]),this._attributes.push(l))}else i=null;r.data[a]=i,r.indexes[a]=a}return r},s.prototype._getId=function(t){var r,i,n=this._getIdAttr(t);if(null==t)return null;if(e.isArray(n)){var o;for(r=[],o=0;o<n.length;o++){if(!(n[o]in t))throw i=a.applyParameters(s._LOGGER_MSG._ERR_ARRAY_TABLE_DATASOURCE_IDATTR_NOT_IN_ROW,[n[o]]),new Error(i);r[o]=s._getKey(t,n[o])}}else{if(!(n in t))throw i=a.applyParameters(s._LOGGER_MSG._ERR_ARRAY_TABLE_DATASOURCE_IDATTR_NOT_IN_ROW,[n]),new Error(i);r=s._getKey(t,n)}return r},s.prototype._getIdAttr=function(t){if(null!=this._idAttribute)return this._idAttribute;if(null==this._attributes){this._attributes=[];for(var e=Object.keys(t),r=0;r<e.length;r++){var a=e[r];this._attributes.push(a)}}return Object.prototype.hasOwnProperty.call(this._attributes,"id")?"id":this._attributes},s._sortFunc=function(r,a,i,n){var o,l,u,h,d=n.sortCriteria.direction;if(e.isFunction(i)){if(1===i.length){o=i.call(n,r),l=i.call(n,a);var _=t.StringUtils.isString(o)?o.split(","):[o],c=t.StringUtils.isString(l)?l.split(","):[l];for(u=0;u<_.length;u++)if(0!==(h=s._compareKeys(_[u],c[u],d)))return h;return 0}return i.call(n,r,a)}if(t.StringUtils.isString(i)){var p=i.split(",");for(u=0;u<p.length;u++)if(o=s._getKey(r,p[u]),l=s._getKey(a,p[u]),0!==(h=s._compareKeys(o,l,d)))return h}return 0},s.prototype._subscribeObservableArray=function(e){if(!(e instanceof Array)){var r=this;this._arrayChangeSubscription=e.subscribe(function(e){var a,i,s,n,o=[],l=[];for(a=0;a<e.length;a++)for(s=e[a].index,n=e[a].status,i=0;i<e.length;i++)i!==a&&s===e[i].index&&n!==e[i].status&&o.indexOf(a)<0&&l.indexOf(a)<0&&("deleted"===n?(l.push(a),o.push(i)):(l.push(i),o.push(a)));var u=[];for(a=0;a<e.length;a++)if(o.indexOf(a)>=0){var h=r._getId(r._rows.data[e[a].index]),d=r._getId(e[a].value);null==d||t.Object.compareValues(d,h)||(r._rows.data[e[a].index]=e[a].value),u.push(e[a].value)}r.change(u,null),u=[];var _=[];for(a=0;a<e.length;a++)o.indexOf(a)<0&&l.indexOf(a)<0&&"deleted"===e[a].status&&u.push(e[a].value);for(r.remove(u,null),u=[],_=[],a=0;a<e.length;a++)o.indexOf(a)<0&&l.indexOf(a)<0&&"added"===e[a].status&&(u.push(e[a].value),_.push(e[a].index));r.add(u,{at:_})},null,"arrayChange")}},s.prototype._wrapWritableValue=function(t){var e={};if(!t)return null;for(var r=Object.keys(t),a=0;a<r.length;a++)s._defineProperty(e,t,r[a]);return e},s.prototype._isObservableArray=function(t){return"function"==typeof t&&"function"==typeof t.subscribe},s._defineProperty=function(t,e,r){Object.defineProperty(t,r,{get:function(){return e[r]},set:function(t){e[r]=t},enumerable:!0})},s._LOGGER_MSG={_INFO_ARRAY_TABLE_DATASOURCE_IDATTR:"idAttribute option has not been specified. Will default to using 'id' if the field exists. If not, will use all the fields.",_ERR_ARRAY_TABLE_DATASOURCE_IDATTR_NOT_IN_ROW:"Specified idAttribute {0} not in row data. Please ensure all specified idAttribute fields are in the row data or do not specify idAttribute and all fields will be used as id."}});
//# sourceMappingURL=ojarraytabledatasource.js.map