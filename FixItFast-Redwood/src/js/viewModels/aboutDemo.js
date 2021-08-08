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
define(['appUtils', 'appController', 'knockout'],
  function(appUtils, app, ko) {
    function aboutDemo() {
      var self = this;
      self.isPhone = ko.observable(app.isPhone());
      self.transitionCompleted = function() {
        appUtils.setFocusAfterModuleLoad('startBtn');
      }
      self.connected = function() {
        app.isPhone.subscribe((data)=> self.isPhone(data));
      }
    }
    return aboutDemo;
  });
