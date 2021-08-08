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

// This incidents viewModel controls dashboard/list/map tabs.

'use strict';
define(['ojs/ojcore', 'knockout',
        'dataService', 'appController', 'appUtils',
        'ModuleHelper', 'ojs/ojmodule-element',
        'ojs/ojknockout'], function(oj, ko, data, app, appUtils, moduleHelper) {
  function incidents(params) {
    var self = this;

    self.showFilterBtn = ko.observable(false);
    self.showAddIncidentBtn = ko.observable(false);

    var middleAnimation = ko.observable();

    var childRouterConfig = {
      'incidentsTabDashboard': { label: 'Dashboard', isDefault: true },
      'incidentsTabList': { label: 'Incidents List' },
      'incidentsTabMap': { label: 'Map' }
    };

    self.router = params.parentRouter.createChildRouter('incidentsTab').configure(childRouterConfig);

    self.router.stateId.subscribe(function(newValue) {
      if (typeof newValue !== "undefined") {
        if(newValue === 'incidentsTabList') {
          self.showFilterBtn(true);
          self.showAddIncidentBtn(true);
        } else {
          self.showFilterBtn(false);
          self.showAddIncidentBtn(false);
        }
      }
    });

    // load incidents stats
    self.prefetch = function() {
      return new Promise(function(resolve, reject){
        self.statsPromises = [data.getIncidentsStats(), data.getIncidentsHistoryStats(), data.getIncidents()];
        self.incidentsStatsPromise = Promise.all(self.statsPromises);

        // update charts data upon loading incidents stats
        self.incidentsStatsPromise.then(function(results) {
          var pieChartResult = JSON.parse(results[0]);
          var barChartResultMetrics = JSON.parse(results[1]).metrics;
          var incidentList = results[2];
          loadModule(pieChartResult, barChartResultMetrics, incidentList);
          resolve();
        });
      });
    }

    self.connected = function() {
      oj.Router.sync();
    };

    self.disconnected = function() {
      self.router.dispose();
    };

    // update animation for middle tab
    self.navBarChange = function(event) {
      if (event.detail.value === 'incidentsTabMap')
        appUtils.setPageBusyContext();
      if (event.detail.value !== 'incidentsTabList')
        return;
      if (event.detail.previousValue === 'incidentsTabDashboard')
        middleAnimation('navSiblingLater');
      else if (event.detail.previousValue === 'incidentsTabMap')
        middleAnimation('navSiblingEarlier');
    };

    self.closePopup = function() {
      return document.getElementById('filterpopup').close();
    };

    // Setup header moduleConfig
    var headerViewModelParams = {
      title: 'Incidents',
      startBtn: {
        id: 'navDrawerBtn',
        click: app.toggleDrawer,
        display: 'icons',
        label: 'Navigation Drawer',
        icons: 'oj-ux-ico-menu',
        visible: true
      },
      endBtn: {
        id: 'filterPopUpBtn',
        click: function() {
          var popup = document.getElementById('filterpopup');
          popup.position = {
            "my": {
              "horizontal": "end",
              "vertical": "top"
            },
            "at": {
              "horizontal": "end",
              "vertical": "bottom"
            },
            "of": ".oj-hybrid-applayout-header-no-border",
            "offset": {
              "x": -10,
              "y": 0
            }
          };

          // place initial focus on the popup instead of the first focusable element
          popup.initialFocus = 'popup';
          return popup.open('#filterIncident');
        },
        display: 'icons',
        label: 'incidents filters',
        icons: 'oj-ux-ico-filter-2',
        visible: self.showFilterBtn
      },

      addIncidentButton: {
        id: 'addIncidentBtn',
        click: app.goToCreateIncident,
        display: 'icons',
        label: 'Add Incident Button',
        icons: 'oj-ux-ico-plus',
        visible: self.showAddIncidentBtn
      }
    };

    moduleHelper.setupStaticModule(self, 'headerConfig', 'basicHeader', headerViewModelParams);

    function loadModule(pieChartResult, barChartResultMetrics, incidentList) {

      // Setup main moduleConfig
      var moduleParams = {
        'closePopup': self.closePopup,
        'pieChartResult': ko.observable(pieChartResult),
        'barChartResultMetrics': ko.observable(barChartResultMetrics),
        'incidentList': ko.observable(incidentList),
        'incidentsTabListAnimation': middleAnimation,
        'parentRouter': self.router
      };

      moduleHelper.setupModuleWithObservable(self, 'moduleConfig', self.router.stateId, moduleParams, 'none');
      moduleHelper.setupModuleCaching(self);


      var animationOptions = {
        'incidentsTabDashboard': 'navSiblingEarlier',
        'incidentsTabList': middleAnimation,
        'incidentsTabMap': 'navSiblingLater'
      }
      moduleHelper.setupModuleAnimations(self, animationOptions, self.router.stateId, 'incidentsTabDashboard');
    }
  }

  return incidents;
});
