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
'use strict';
define(['appUtils',
        'ojs/ojknockout-keyset',
        'ojs/ojarraydataprovider',
        'appController',
        'knockout',
        'ojs/ojknockout',
        'ojs/ojlistview'],
  function(appUtils, KeySet, ArrayDataProvider, app, ko) {
    function aboutList(params) {
      var self = this;
      self.optionChange = params.optionChange;
      // retrieve about items to render the list
      self.aboutOptions = new ArrayDataProvider(params.list, {keyAttributes: 'id'});
      self.selectedItem = new KeySet.ObservableKeySet();
      self.isPhone = ko.observable(app.isPhone());
      self.prefetch = function() {
        self.selectedItem.clear();
      }
      self.connected = function() {
        app.isPhone.subscribe((data)=> self.isPhone(data));
      }
      self.transitionCompleted = function() {
        appUtils.setFocusAfterModuleLoad('startBtn');
      }
    }
    return aboutList;
  });
