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

 // signin page viewModel
 // In a real app, replace it with your authentication and logic
'use strict';
define(['ojs/ojcore', 'knockout', 'appController', 'appUtils',
        'ojs/ojknockout',
        'ojs/ojcheckboxset',
        'ojs/ojinputtext',
        'ojs/ojbutton',
        'ojs/ojvalidationgroup',
        'ojs/ojanimation',
        'ojs/ojswitcher'], function(oj, ko, app, appUtils) {
  function signin() {
    var self = this;
    self.isPhone = ko.observable(app.isPhone());
    self.transitionCompleted = function() {
      appUtils.setFocusAfterModuleLoad('signInBtn');
      var animateOptions = { 'delay': 0, 'duration': '1s', 'timingFunction': 'ease-out' };
      oj.AnimationUtils['fadeIn'](document.getElementsByClassName('demo-signin-bg')[0], animateOptions);
    }

    self.signInGroupValid = ko.observable();
    self.signUpGroupValid = ko.observable();
    self.userName = ko.observable();
    self.passWord = ko.observable();
    self.rememberUserName = ko.observable();
    self.selectedItem = ko.observable('signIn');

    // First time, rememberUserName in sessionStorage will not be set. In this case we default to true.
    if (window.sessionStorage.rememberUserName === undefined || window.sessionStorage.rememberUserName === 'true') {
      app.getUserProfile()
        .then(function(userProfile) {
          self.userName(userProfile.firstName() + ' ' + userProfile.lastName());
        }).catch(function() {
          // This won't happen in general, because then that means the entire offline data loading is broken.
          // Use default user name if at all this happens.
          self.userName("Harry Calson");
        });
      self.passWord('password');
      self.rememberUserName(['remember']);
    }

    // Replace with sign in authentication
    self.signIn = function() {
      if((self.selectedItem() === 'signIn' && self.signInGroupValid() != "valid") ||
          (self.selectedItem() === 'signUp' && self.signUpGroupValid() != "valid")) {
            return;
      }
      window.sessionStorage.rememberUserName = '' + (self.rememberUserName() && self.rememberUserName().indexOf('remember') != -1);
      app.onLoginSuccess();
    };

  }
  return signin;
});
