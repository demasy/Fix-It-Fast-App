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

// settins viewModel of the app

'use strict';
define(['appController', 'ModuleHelper', 'appUtils', 'ojs/ojswitch', 'ojs/ojbutton',
        'ojs/ojmodule-element', 'ojs/ojknockout', 'ojs/ojformlayout'],
function(app, moduleHelper, appUtils) {

  function settings() {
    var self = this;
    self.usingMobileBackend = app.usingMobileBackend;

    // adjust content padding top
    self.transitionCompleted = function() {
      appUtils.adjustContentPadding();
    };

    // settings page header
    var headerViewModelParams = {
      title: 'Settings',
      startBtn: {
        id: 'navDrawerBtn',
        click: app.toggleDrawer,
        display: 'icons',
        label: 'Navigation Drawer',
        icons: 'oj-ux-ico-menu',
        visible: true
      },
      endBtn: {
        visible: false
      }
    };

    moduleHelper.setupStaticModule(this, 'headerConfig', 'basicHeader', headerViewModelParams);
  }

  settings.prototype.configureLocalAuth = function() {
    app.showLocalAuthConfig();
  }

  return settings;
});
