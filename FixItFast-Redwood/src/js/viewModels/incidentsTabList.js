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

 // incidents list view viewModel
'use strict';
define(['ojs/ojcore', 'knockout',
        'dataService',
        'appController',
        'appUtils',
        'persist/persistenceStoreManager',
        'ojs/ojarraydataprovider',
        'ojs/ojknockout',
        'ojs/ojoffcanvas',
        'ojs/ojlistview',
        'ojs/ojswipeactions',
        'ojs/ojpulltorefresh',
        'ojs/ojcheckboxset',
        'ojs/ojpopup',
        'ojs/ojrefresher',
        'ojs/ojanimation',
        'ojs/ojlabel',
        'ojs/ojformlayout'],
function(oj, ko, data, app, appUtils, persistenceStoreManager, ArrayDataProvider) {
  function incidentsTabList(params) {
    var self = this;
    var pullToRefreshInProgress = false;
    self.closePopup = params.closePopup;

    self.refreshIncidents = function() {
      pullToRefreshInProgress = true;
      return new Promise(function(resolve, reject) {
        // check for new incidents
        data.getIncidents()
          .then(function(response) {
            processIncidentsData(response, resolve);
          })
          .fail(function(response){
            reject("Failed to get incidents");
          });
      }).then(function() {
        pullToRefreshInProgress = false;
      }).catch(function() {
        pullToRefreshInProgress = false;
      });
    };

    var updateIncidentsList = function (response) {
      processIncidentsData(response.detail);
      params.incidentList(response.detail);
    };

    var updateBarCharData = function (response) {
      params.barChartResultMetrics(JSON.parse(response.detail).metrics);
    }

    var updatePieChartData = function (response) {
      params.pieChartResult(JSON.parse(response.detail));
    }

    self.getIconClass = function(category) {
      var iconType;
      switch (category) {
        case 'general':
          iconType = 'oj-ux-ico-home';
          break;
        case 'plumbing':
          iconType = 'oj-ux-ico-waterdrop';
          break;
        case 'heatingcooling':
          iconType = 'oj-ux-ico-fire';
          break;
        case 'appliance':
          iconType = 'oj-ux-ico-drawer';
          break;
        case 'electrical':
          iconType = 'oj-ux-ico-lightbulb';
          break;
      }
      var classes = iconType + " oj-ux-icon-size-6x";
      return classes;
    }

    self.getTextClass = function(priority) {
      var colorClass;
      switch (priority) {
        case 'high':
          colorClass = 'oj-text-color-danger';
          break;
        case 'normal':
          colorClass = 'oj-text-color-warning';
          break;
        case 'low':
          colorClass = 'oj-text-color-success';
          break;
      }
      return colorClass + " oj-typography-body-md oj-sm-padding-1x-top";
    }

    self.getBadgeClass = function(priority) {
      var badgeClass = "oj-badge oj-badge-subtle";
      switch (priority) {
        case 'high':
          badgeClass += " oj-badge-danger";
          break;
        case 'low':
          badgeClass += " oj-badge-success";
          break;
      }
      return badgeClass;
    }

    function doOneTimeActivities() {
      if (self.alreadyConnected)
        return;

      self.alreadyConnected = true;
      document.getElementById('page').addEventListener('onIncidentsUpdated', updateIncidentsList);
      //Adding event listener to update module parameters
      document.getElementById('page').addEventListener('onHistoryStatsUpdated', updateBarCharData);
      document.getElementById('page').addEventListener('onIncidentStatsUpdated', updatePieChartData);

      self.onlineStateChangeSubscription = app.subscribeForDeviceOnlineStateChange(function() {
        document.getElementById('incidentsListView').refresh();
      });

      var listView = document.getElementById('incidentsListView');
      oj.Context.getContext(listView).getBusyContext().whenReady().finally(function() {
        if (self.pageBusyResolve) {
          self.pageBusyResolve();
          self.pageBusyResolve = null;
        }
      });

      appUtils.adjustContentPadding();
    }

    self.prefetch = function() {
      var busyContext = oj.Context.getPageContext().getBusyContext();
      var options = {"description": "Waiting for list view to render."};
      self.pageBusyResolve = busyContext.addBusyState(options);

      return new Promise(function(resolve, reject) {
        processIncidentsData(params.incidentList(), resolve);
      })
    }

    self.connected = function() {
      self.isPhone = app.isPhone;
      return doOneTimeActivities();
    };

    self.transitionCompleted = function() {
      var addIncidentBtn = document.getElementById('addIncident');

      // When we navigate directly to customerDetails from incident, this dom is not initialized.
      if (addIncidentBtn) {
        oj.Context.getContext(addIncidentBtn).getBusyContext().whenReady().then(function () {
          // invoke zoomIn animation on floating action button
          var animateOptions = { 'delay': 0, 'duration': '0.3s', 'timingFunction': 'ease-out' };
          oj.AnimationUtils['zoomIn'](addIncidentBtn, animateOptions);
        });
      }
    };

    self.disconnected = function () {
      // Store scroll position
      localStorage.setItem("incidents-scroll-pos",  self.scrollPos().y);

      document.getElementById('page').removeEventListener('onIncidentsUpdated', updateIncidentsList);
      document.getElementById('page').removeEventListener('onStatsUpdated', updateBarCharData);
      document.getElementById('page').removeEventListener('onIncidentStatsUpdated', updatePieChartData);

      if (self.onlineStateChangeSubscription) {
        self.onlineStateChangeSubscription.dispose();
        self.onlineStateChangeSubscription = undefined;
      }

      self.alreadyConnected = false;
    }

    function processIncidentsData(response, resolve) {
      var incidentsData = JSON.parse(response);
      self.lastUpdate = incidentsData.lastUpdate;

      var unreadIncidentsNum = 0;

      incidentsData.result.forEach(function(incident){
        incident.statusObservable = ko.observable(incident.status);
        incident.formattedCreatedOn = appUtils.formatTimeStamp(incident.createdOn).date;
        if(!incident.read)
          unreadIncidentsNum++;
      });

      app.unreadIncidentsNum(unreadIncidentsNum);

      incidentsData.result.sort(function(a, b) {
        return (a.createdOn < b.createdOn) ? 1 : (a.createdOn > b.createdOn) ? -1 : 0;
      });

      persistenceStoreManager.openStore('incidents').then(function (store) {
        store.keys().then(function (keys) {
          incidentsData.result.forEach(function (incident) {
            incident.cached = false;
            keys.forEach(function (key) {
              if(key.indexOf(incident.id) > -1) {
                incident.cached = true
              }
            })

          })

          self.allIncidents = incidentsData.result;

          var results = self.filterIncidents();

          // show message when no data is available.
          if(results.length === 0) {
            document.getElementById("incidentsListView").translations.msgNoData = "new message";
          }

          // update observable
          self.filteredIncidents(results);

          var listView = document.getElementById('incidentsListView');
          oj.Context.getContext(listView).getBusyContext().whenReady().then(function () {
            // Restore scroll position
            self.scrollPos( { y: localStorage.getItem("incidents-scroll-pos") });
          });

          if (resolve)
            resolve();
        })
      })
    }

    self.scrollElem = navigator.userAgent.search(/Firefox|Trident|Edge/g)  > -1 ? document.body.parentElement : document.body;
    self.scrollPos = ko.observable({ y: 0 });

    self.priorityFilterArr = ko.observable(['high', 'normal', 'low']);
    self.statusFilterArr = ko.observable(['open', 'accepted', 'closed']);

    self.allIncidents = [];

    self.filteredIncidents = ko.observableArray([]);
    self.incidentsTableData = new ArrayDataProvider(self.filteredIncidents, { keyAttributes: 'id' });

    self.filterIncidents = function() {
      return self.allIncidents.filter(function(incident) {
        return self.priorityFilterArr().indexOf(incident.priority) > -1 && self.statusFilterArr().indexOf(incident.statusObservable()) > -1;
      });
    };

    // update incidents list when priority or status filter changes
    self.priorityFilterArr.subscribe(function(newValue) {
      var filteredResults = self.filterIncidents();
      self.filteredIncidents(filteredResults);
    });

    self.statusFilterArr.subscribe(function(newValue) {
      var filteredResults = self.filterIncidents();
      self.filteredIncidents(filteredResults);
    });

    self.incidentSelectable = function(itemContext) {
      return app.isDeviceOnline() || itemContext.data.cached;
    }

    self.incidentSelected = function(event) {
      if (pullToRefreshInProgress)
        return;

      var value = self.setToArray(event.detail.value);
      if (!value || !value[0])
        return;

      event.preventDefault();
      params.incidentsTabListAnimation(null);
      app.goToIncident(value[0], 'incidentsTabList');
    };

    // helper method to convert Set to array, since Array.from is not available in all browsers
    self.setToArray = function (set) {
      var arr = [];
      set.values().forEach(function (key) {
        arr.push(key);
      });
      return arr;
    };

    self.goToAddIncident = function() {
      app.goToCreateIncident();
    };

    self.handleAction = function(event, model) {
      var action = event.target.value,
        dataModel = model.data;

      if (!dataModel || !dataModel.id) {
        return;
      }

      var index = self.allIncidents.map(function(e) { return e.id; }).indexOf(dataModel.id);
      self.allIncidents[index].statusObservable(action);

      data.updateIncident(dataModel.id, {status: action}).then(function(response) {
        // update success
        // re-apply filter to incidents after changing status
        self.filterIncidents();
      }).fail(function(response){
        oj.Logger.error('Failed to update incident.', response)
        app.connectionDrawer.showAfterUpdateMessage();
      });

      event.preventDefault();
      event.stopPropagation();
    };
  }

  return incidentsTabList;

});
