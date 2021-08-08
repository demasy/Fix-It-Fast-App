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
define(['appController', 'knockout', 'ModuleHelper',
        'ojs/ojmodule-element',
        'ojs/ojpopup', 'ojs/ojknockout'], function(app, ko, moduleHelper) {

  function aboutContent(params) {
    var self = this;
    self.toggleDrawer = app.toggleDrawer;
    var aboutListItems = [{id: 'aboutDemo', title: '', label: 'About Demo' },
                          {id: 'privacyPolicy', title: 'Oracle Privacy Policy', label: 'Oracle Privacy Policy' }];


    var routerConfigOptions = {
      'aboutList': { label: 'About', isDefault: true },
      'aboutDemo': { label: 'About Demo' }
    };

    self.router = params.parentRouter.createChildRouter('aboutContent').configure(routerConfigOptions);
    self.isPhone = ko.observable(app.isPhone())
    self.optionChange = function(event) {
      var value = self.setToArray(event.detail.value);
      if (!value || !value[0])
        return;

      if (value[0] === 'privacyPolicy') {
        params.goToPrivacyPolicy();
        return;
      }

      self.router.go('aboutDemo');
    };

    // helper method to convert Set to array, since Array.from is not available in all browsers
    self.setToArray = function (set) {
      var arr = [];
      set.values().forEach(function (key) {
        arr.push(key);
      });
      return arr;
    };

    var moduleParams = {
      'list': aboutListItems,
      'optionChange': self.optionChange
    }

    moduleHelper.setupModuleWithObservable(self, 'moduleConfig', self.router.stateId, moduleParams, 'none');
    moduleHelper.setupModuleCaching(self);

    var animationOptions = {
      'aboutList': 'navParent',
      'aboutDemo': 'navChild',
    }
    moduleHelper.setupModuleAnimations(self, animationOptions, self.router.stateId, 'aboutList');

    self.connected = function() {
      oj.Router.sync();
      app.isPhone.subscribe((data)=> self.isPhone(data))
    };

    // dispose about page child router
    self.disconnected = function() {
      self.router.dispose();
    };

    self.goBack = function() {
      self.router.go('aboutList');
    }

    // open social links popup
    self.openPopup = function() {
      var popup = document.getElementById('aboutPopup');
      popup.position = {
        "my": {
          "horizontal": "center",
          "vertical": "top"
        },
        "at": {
          "horizontal": "center",
          "vertical": "top + 50"
        },
        "of": ".oj-hybrid-applayout-content",
        "offset": {
          "x": 0,
          "y": 30
        }
      };

      // place initial focus on the popup instead of the first focusable element
      popup.initialFocus = 'popup';

      return popup.open('#profile-action-btn');
    };
  }

  return aboutContent;
});
