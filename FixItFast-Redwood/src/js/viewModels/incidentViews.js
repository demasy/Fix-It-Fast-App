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
define(['ojs/ojcore', 'knockout', 'appController', 'appUtils',
        'ModuleHelper', 'ojs/ojmodule-element', 'ojs/ojknockout'], function(oj, ko, app, appUtils, moduleHelper) {
  function incidentViews(params) {
    var self = this;
    var childRouterConfig = {
      'incidentTabSummary': { label: 'Summary', isDefault: true },
      'incidentTabActivity': { label: 'Activities' },
      'incidentTabMap': { label: 'Map'},
      'priority':  { label: 'Priority' },
      'status': { label: 'Status' }
    };

    self.router = params.parentRouter.createChildRouter('incidentView').configure(childRouterConfig);

    self.goToPriority = function() {
      self.router.go('priority');
    };

    self.goToStatus = function() {
      self.router.go('status');
    };

    self.goToCustomer = function(custId, incidentId) {
      app.goToCustomerFromIncident(custId, incidentId);
    }

    self.goToPrevious = function() {
      var state = self.router.currentState().id;
      if (state === 'priority' || state === 'status' || self.mapLoadedFromAddressLink) {
        self.mapLoadedFromAddressLink = false;
        self.router.go('incidentTabSummary');
        return;
      }

      app.goToIncidents();
    };

    self.goToCustomerLocationMap = function() {
      self.mapLoadedFromAddressLink = true;
      self.router.go('incidentTabMap');
    };

    self.connected = function() {
      oj.Router.sync();
    };

    // update animation for middle tab
    self.navBarChange = function(event) {
      if (event.detail.value === 'incidentTabMap')
        appUtils.setPageBusyContext();
      if (event.detail.value !== 'incidentTabActivity')
        return;
      if (event.detail.previousValue === 'incidentTabSummary')
        middleAnimation('navSiblingLater');
      else if (event.detail.previousValue === 'incidentTabMap')
        middleAnimation('navSiblingEarlier');
    };

    var moduleParams = {
      'locationId': params.locationId,
      'goToPriority': self.goToPriority,
      'goToStatus': self.goToStatus,
      'goToCustomer': self.goToCustomer,
      'incidentData': params.incidentData,
      'priorityChange': params.priorityChange,
      'statusChange': params.statusChange,
      'parentRouter': self.router,
      'goToCustomerLocationMap': self.goToCustomerLocationMap
    };
    moduleHelper.setupModuleWithObservable(self, 'moduleConfig', self.router.stateId, moduleParams, 'none');
    moduleHelper.setupModuleCaching(self);

    var middleAnimation = ko.observable();
    var animationOptions = {
      'incidentTabSummary': 'navSiblingEarlier',
      'incidentTabActivity': middleAnimation,
      'incidentTabMap': 'navSiblingLater',
      'priority':  'navSiblingLater',
      'status': 'navSiblingLater'
    }
    moduleHelper.setupModuleAnimations(self, animationOptions, self.router.stateId, 'incidentTabSummary');

    var showNavBtn = ko.observable(false);
    var headerViewModelParams = {
      title: 'Incident',
      startBtn: {
        id: 'backBtn',
        click: self.goToPrevious,
        display: 'icons',
        label: 'Back',
        icons: 'oj-ux-ico-arrow-left',
        visible: true
      },
      endBtn: {
        id: 'navigateBtn',
        click: function() {},
        display: 'icons',
        label: 'Navigate',
        icons: 'oj-ux-ico-location-found',
        visible: showNavBtn
      }
    };

    // hide or show the navigation btn
    self.router.stateId.subscribe(function(newValue) {
      if(newValue === 'incidentTabMap') {
        showNavBtn(true)
      } else {
        showNavBtn(false)
      }
    });

    moduleHelper.setupStaticModule(self, 'headerConfig', 'basicHeader', headerViewModelParams);
  }

  return incidentViews;
});
