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

// header module viewModel

'use strict';
define(['appUtils', 'appController', 'knockout', 'ojs/ojbutton', 'ojs/ojknockout'], function(appUtils, app, ko) {
  function basicHeaderVM(params) {
    var self = this;
    self.title = params.title || '';
    self.startBtn = params.startBtn;
    self.endBtn = params.endBtn;
    self.endBtn.disabled = params.endBtn.disabled || false;

    self.addIncidentButton = params.addIncidentButton || undefined;

    self.isPhone = ko.observable(app.isPhone());
    self.connected = function(){
      app.isPhone.subscribe((data)=> self.isPhone(data));
    }
    self.transitionCompleted = function() {
      appUtils.setFocusAfterModuleLoad(self.startBtn.id);
    }
  }
  return basicHeaderVM;
});
