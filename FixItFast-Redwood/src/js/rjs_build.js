/**
 * @license
 * Copyright (c) 2014, 2021, Oracle and/or its affiliates.
 * Licensed under The Universal Permissive License (UPL), Version 1.0
 * as shown at https://oss.oracle.com/licenses/upl/
 * @ignore
 */
({
  baseUrl: "js",
  appDir: "../",
  dir: "rjs_built",
  modules: [
    {
      name: "rjs_bundles/listBundle",
      create: true,
      include: ['ojs/ojcore', 'ojs/ojswipetoreveal', 'ojs/ojoffcanvas',
        'ojs/ojpulltorefresh', 'ojs/ojlistview', 'ojs/ojarraytabledatasource'],
      exclude: ['jquery']
    },
    {
      name: "rjs_bundles/mapviewBundle",
      create: true,
      include: ['oraclemapviewer', 'oracleelocation'],
      exclude: ['jquery']
    }, {
      name: "rjs_bundles/landingBundle",
      create: true,
      include: [ 'ojs/ojanimation', 'ojs/ojbutton', 'ojs/ojcomposite-knockout',
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
      exclude: ['jquery']
    }, {
      name: "rjs_bundles/incidentsBundle",
      create: true,
      include: [ 'ojs/ojconverter-number', 'ojs/ojchart', 'ojs/ojrefresher',
        'ojs/ojswipeactions', 'ojs/ojtrain'],
      exclude: ['jquery']
    }, {
      name: "rjs_bundles/signinBundle",
      create: true,
      include: [ 'ojs/ojvalidationgroup', 'ojs/ojcheckboxset',
        'ojs/ojradiocheckbox'],
      exclude: ['jquery']
    }, {
      name: "rjs_bundles/customerBundle",
      create: true,
      include: ['ojs/ojindexer', 'ojs/ojindexermodeltreedatasource',
        'ojs/ojlistdataproviderview', 'ojs/ojoptgroup', 'ojs/ojselectcombobox',
        'ojs/ojtreedataprovideradapter',
        'ojs/ojtreedataproviderview'],
      exclude: ['jquery']
    }, {
      name: "rjs_bundles/persistenceBundle",
      create: true,
      include: ['persist/persistenceManager', 'persist/PersistenceStore',
       'persist/persistenceStoreManager', 'persist/impl/PersistenceSyncManager',
       'persist/persistenceUtils', 'persist/impl/PersistenceXMLHttpRequest',
       'persist/impl/offlineCacheManager', 'persist/impl/OfflineCache', 'persist/cacheStrategies',
       'persist/impl/defaultCacheHandler','persist/defaultResponseProxy',
       'persist/impl/fetch', 'persist/fetchStrategies', 'persist/impl/logger',
       'persist/simpleJsonShredding', 'persist/impl/storageUtils','persist/pouchDBPersistenceStoreFactory',
       'persist/impl/pouchDBPersistenceStore'],
      exclude: ['jquery']
    }
  ],
  
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
    'persist': 'libs/persist/min',
    'pouchdb': 'libs/persist/min/pouchdb-browser-7.2.2'
  },
  // endinjector
  optimize: "none"
})
