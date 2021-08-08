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
define(['ojs/ojcore','knockout','appController','ojs/ojconfig', 'ojs/ojbutton', 'ojs/ojanimation'], function(oj,ko,app,Config) {
	function tourLaunchPage(params) {
		var self = this;
    self.startTour = params.startTour;
    self.goToSignIn = app.goToSignIn;
    self.isPhone = ko.observable(app.isPhone());
    self.transitionCompleted = function() {
      // hide cordova splash screen
      if(navigator.splashscreen) {
        navigator.splashscreen.hide();
      }

      // invoke slideIn animation
      var animateOptions = { 'delay': 0, 'duration': '1s', 'timingFunction': 'ease-out' };
      oj.AnimationUtils['slideIn'](document.getElementsByClassName('demo-tour-launch-action')[0], animateOptions);
    };
    self.connected = function() {
      app.isPhone.subscribe((data)=> self.isPhone(data))
    };

  }

  return tourLaunchPage;
});
