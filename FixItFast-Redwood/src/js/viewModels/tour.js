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

// Tour page viewModel holding the tour launch page and tour content

'use strict';
define(['knockout', 'appController',
        'ModuleHelper', 'ojs/ojmodule-element',
        'ojs/ojknockout', 'ojs/ojmoduleanimations'], function(ko, app, moduleHelper) {
  function tour(params) {
    var self = this;
    self.tourPage = ko.observable('tourLaunchPage');

    self.startTour = function() {
      self.tourPage('tourContent');
    };

    self.filmStripOptionChange = function(event) {
      self.step(event.detail.value['index']);
    };

    var moduleParams = {
      'startTour': self.startTour,
      'filmStripOptionChange': self.filmStripOptionChange
    };

    moduleHelper.setupModuleCaching(self);
    moduleHelper.setupModuleWithObservable(self, 'moduleConfig', self.tourPage, moduleParams, 'none');

    self.moduleAnimation = oj.ModuleAnimations.createAnimation({'effect':'slideOut','duration':'0.3s', 'persist': 'all'}, {'effect':'slideIn','duration':'0.3s'}, false);

    self.step = ko.observable(0);
    self.goToSignIn = app.goToSignIn;
  }

  return tour;
});
