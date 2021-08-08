/**
 * @license
 * Copyright (c) 2014, 2021, Oracle and/or its affiliates.
 * Licensed under The Universal Permissive License (UPL), Version 1.0
 * as shown at https://oss.oracle.com/licenses/upl/
 * @ignore
 */
/**
 * Copyright (c) 2014, 2021, Oracle and/or its affiliates.
 * Licensed under The Universal Permissive License (UPL), Version 1.0
 * as shown at https://oss.oracle.com/licenses/upl/
 */

/**
 * Example of Require.js boostrap javascript
 */
'use strict';


(function () {
  requirejs.config({
    // Path mappings for the logical module names
    paths:
    // injector:mainReleasePaths
    {
      'ojs': 'libs/oj/v11.0.0/min',
      'ojL10n': 'libs/oj/v11.0.0/ojL10n',
      'ojtranslations': 'libs/oj/v11.0.0/resources',
      
  'knockout': 'libs/knockout/knockout-3.5.1',
  'knockout-mapping': 'libs/knockout/knockout.mapping-latest',
  'jquery': 'libs/jquery/jquery-3.6.0.min',
  'jqueryui-amd': 'libs/jquery/jqueryui-amd-1.12.1.min',
  'text': 'libs/require/text',
  'hammerjs': 'libs/hammer/hammer-2.0.8.min',
  'signals': 'libs/js-signals/signals.min',
  'ojdnd': 'libs/dnd-polyfill/dnd-polyfill-1.0.2.min',
  'css': 'libs/require-css/css.min',
  'css-builder': 'libs/require-css/css-builder',
  'normalize': 'libs/require-css/normalize',
  'preact': 'libs/preact/dist/preact.umd',
  'preact/hooks': 'libs/preact/hooks/dist/hooks.umd',
  'proj4': 'libs/proj4js/dist/proj4',
  'touchr': 'libs/touchr/touchr',
      'oraclemapviewer': 'libs/oraclemapsv2',
      'oracleelocation': 'libs/oracleelocationv3',
      'chai': 'libs/chai/chai-4.3.4',
      'pouchdb': 'libs/persist/min/pouchdb-browser-7.2.2',
      'pouchfind': 'libs/persist/min/pouchdb.find',
      'persist': 'libs/persist/min',
      'appConfig': 'appConfigExternal',
      'oj-sample-mobile-internal':'auth-cca/oj-sample-mobile-internal',
      'listBundle': 'listBundle',
      'mapviewBundle': 'mapviewBundle',
      'incidentsBundle': 'incidentsBundle',
      'landingBundle': 'landingBundle',
      'signinBundle': 'signinBundle',
      'customerBundle': 'customerBundle',
      'profileBundle': 'profileBundle',
      'settingsBundle': 'settingsBundle',
      'persistenceBundle': 'persistenceBundle'
    }
    // endinjector
  });
}());

requirejs.config(
  {
    bundles:
      {
        'listBundle': ['ojL10n', 'ojs/ojanimation', 'ojtranslations/nls/ojtranslations', 'ojs/ojcore', 'hammer', 'ojs/ojjquery-hammer',
          'jqueryui-amd/version',  'jqueryui-amd/widget', 'jqueryui-amd/unique-id',
          'jqueryui-amd/keycode', 'jqueryui-amd/focusable', 'jqueryui-amd/tabbable', 'ojs/ojmessaging', 'ojs/ojcomponentcore', 'ojs/ojoffcanvas',
          'ojs/ojswipetoreveal', 'ojs/ojpulltorefresh', 'ojs/ojdomscroller', 'ojs/ojlistview', 'ojs/ojdatasource-common', 'ojs/ojarraytabledatasource'],
        'mapviewBundle': ['oraclemapviewer', 'ojs/oracleelocation'],
        'landingBundle': [ 'ojs/ojbutton', 'ojs/ojcomposite-knockout',
          'ojs/ojcomposite', 'ojs/ojcontext', 'ojs/ojconverterutils',
          'ojs/ojconverter', 'ojs/ojconverterutils-i18n',
          'ojs/ojdatacollection-common', 'ojs/ojdataprovider', 'ojs/ojformlayout',
          'ojs/ojhtmlutils', 'ojs/ojinputtext', 'ojs/ojkeysetimpl',
          'ojs/ojknockout', 'ojs/ojknockouttemplateutils', 'ojs/ojkoshared',
          'ojs/ojlocaledata', 'ojs/ojlogger', 'ojs/ojmenu', 'ojs/ojmessage',
          'ojs/ojmessages', 'ojs/ojmodule-element', 'ojs/ojmodule-element-utils',
          'ojs/ojmodule', 'ojs/ojmoduleanimations', 'ojs/ojnavigationlist',
          'ojs/ojoption', 'ojs/ojpopupcore', 'ojs/ojradioset',
          'ojs/ojresponsiveknockoututils', 'ojs/ojrouter','ojs/ojswitch',
          'ojs/ojtemplateengine', 'ojs/ojthemeutils', 'ojs/ojvalidation-error',
          'ojs/ojvalidator'],
        'incidentsBundle': ['ojs/ojtrain', 'ojs/ojconverter-number', 'ojs/ojchart', 'ojs/ojswipeactions','ojs/ojrefresher'],
        'signinBundle': [ 'ojs/ojvalidationgroup', 'ojs/ojcheckboxset', 'ojs/ojradiocheckbox'],
        'customerBundle': ['ojs/ojindexer', 'ojs/ojindexermodeltreedatasource',
          'ojs/ojlistdataproviderview', 'ojs/ojoptgroup', 'ojs/ojselectcombobox',
          'ojs/ojtreedataprovideradapter',
          'ojs/ojtreedataproviderview'],
        'persistenceBundle': ['persist/persistenceManager', 'persist/PersistenceStore',
          'persist/persistenceStoreManager', 'persist/impl/PersistenceSyncManager',
          'persist/persistenceUtils', 'persist/impl/PersistenceXMLHttpRequest',
          'persist/impl/offlineCacheManager', 'persist/impl/OfflineCache', 'persist/cacheStrategies',
          'persist/impl/defaultCacheHandler','persist/defaultResponseProxy',
          'persist/impl/fetch', 'persist/fetchStrategies', 'persist/impl/logger',
          'persist/simpleJsonShredding', 'persist/impl/storageUtils','persist/pouchDBPersistenceStoreFactory',
          'persist/impl/pouchDBPersistenceStore']
      }
  }
);

require(['pouchdb'], function (pouchdb) {
  window.PouchDB = pouchdb;
});

/**
 * A top-level require call executed by the Application.
 * Although 'ojcore' and 'knockout' would be loaded in any case (they are specified as dependencies
 * by the modules themselves), we are listing them explicitly to get the references to the 'oj' and 'ko'
 * objects in the callback
 */
require(['ojs/ojcore', 'knockout', 'appController', 'jquery', 'appUtils'], function (oj, ko, app, $, appUtils) {
  // The moment we load the app, we set the busy context.
  // This will be resolved when app's login page is ready to interact.
  appUtils.setPageBusyContext();
  $(function() {

    function init() {
      oj.Router.sync().then(function () {
        // bind your ViewModel for the content of the whole page body.
        ko.applyBindings(app, document.getElementById('page'));
      }, function (error) {
        oj.Logger.error('Error in root start: ' + error.message);
      });
    }

    // If running in a hybrid (e.g. Cordova) environment, we need to wait for the deviceready
    // event before executing any code that might interact with Cordova APIs or plugins.
    if ($(document.body).hasClass('oj-hybrid')) {
      document.addEventListener("deviceready", init);
    } else {
      init();
    }

  });

});
