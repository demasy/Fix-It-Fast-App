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

 // view model for the tour content with filmstrip
 'use strict';
 define(['knockout','appController', 'ojs/ojfilmstrip', 'ojs/ojpagingcontrol', 'ojs/ojknockout'], function(ko,app) {
   function tourContent(params) {
     var self = this;
     self.step = ko.observable(0);
     self.isPhone = ko.observable(app.isPhone());
     self.goToSignIn = app.goToSignIn;

     self.pagingModel = ko.observable(null);
     self.filmStripOptionChange = params.filmStripOptionChange;

     // todo: need to fix the animation so that the paging model is set before the transition occurs
     self.connected = function() {
       var filmStrip = document.getElementById("filmStrip");
       oj.Context.getContext(filmStrip).getBusyContext().whenReady().then(function () {
         self.pagingModel(filmStrip.getPagingModel());
       });
     }

     self.steps = [
       {
         'title': 'Dashboard',
         'description': 'Review a dashboard of your current incidents.',
         'headingColorClass': 'oj-text-color-primary',
         'mobileBgClass': 'demo-dashboard-bg-mobile',
          'bgClass': 'demo-dashboard-bg',
         'mobileIconClass': './css/images/Tour_Dashboard_1X.png',
         'iconClass': './css/images/Tour_Dashboard_3X.png'
       },
       {
         'title': 'Maps',
         'description': 'Find locations and directions to your customers.',
         'headingColorClass': 'oj-text-color-secondary',
         'mobileBgClass': 'demo-maps-bg-mobile',
         'bgClass': 'demo-maps-bg',
         'mobileIconClass': './css/images/Tour_Maps_1X.png',
         'iconClass': './css/images/Tour_Maps_3X.png'
       },
       {
         'title': 'Incidents',
         'description': 'Check on details about the incident including seeing feed updates and photos.',
         'headingColorClass': 'oj-text-color-danger',
         'mobileBgClass': 'demo-incidents-bg-mobile',
         'bgClass': 'demo-incidents-bg',
         'mobileIconClass': './css/images/Tour_Incidents_1X.png',
         'iconClass': './css/images/Tour_Incidents_3X.png'
       },
       {
         'title': 'Customers',
         'description': 'Have your customers information easily available.',
         'headingColorClass': 'oj-text-color-success',
         'mobileBgClass': 'demo-customers-bg-mobile',
         'bgClass': 'demo-customers-bg',
         'mobileIconClass': './css/images/Tour_Customers_1X.png',
         'iconClass': './css/images/Tour_Customers_3X.png'
       }
     ];

     self.getItemInitialDisplay = function(index) {
       return index < 1 ? '' : 'none';
     };

     self.skipOrSignIn = ko.computed(function() {
      if(self.step() === 3) {
        return 'Sign In';
      }
      return 'Skip';
    });

   }
   return tourContent;
 });
