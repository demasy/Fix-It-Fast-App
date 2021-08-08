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
define(['ModuleHelper', 'ojs/ojmodule-element'], function(moduleHelper) {
  function privacyPolicy(params) {
    var self = this;

    self.connected = function() {
      // Using app.appUtilities.adjustContentPadding() has ill effect
      // on the outgoing ojmodule transparency
      // Therefore, using local padding adjustment code.
      var header = document.getElementById('policyContentTop');
      var content = document.getElementById('policyContent');
      content.style.paddingTop = header.offsetHeight + 'px';
    }

    // create customer page header settings
    var headerViewModelParams = {
      title: 'Oracle Privacy Policy',
      startBtn: {
        id: 'backBtn',
        click: params.goToAboutContent,
        display: 'icons',
        label: 'Back',
        icons: 'oj-ux-ico-arrow-left',
        visible: true
      },
      endBtn: {
        visible: false,
      }
    };

    moduleHelper.setupStaticModule(self, 'headerConfig', 'basicHeader', headerViewModelParams);
  }

  return privacyPolicy;
});
