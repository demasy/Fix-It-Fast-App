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
define(['appUtils',
        'knockout',
        'ojs/ojradioset',
        'ojs/ojknockout',
        'ojs/ojlistview',
        'ojs/ojlistitemlayout'
      ],
function(appUtils, ko) {
  function createIncident_contact(params) {
    var self = this;
    self.appUtilities = appUtils;

    self.prefetch = function() {
      self.allCustomers = params.allCustomers;
      self.customersDataSource = params.customersDataSource;
      self.newIncidentModel = params.newIncidentModel;
      self.customerSelectionChange = params.customerSelectionChange;
    }

    self.connected = function() {
      // With caching enabled, the listview has to be refreshed
      // when this VM is restored from cache. Otherwise the layout
      // of the listview goes for a toss.
      var listview = document.getElementById('customerSelectionListView');
      oj.Context.getContext(listview).getBusyContext().whenReady().then(function () {
        listview.refresh();
      });
    }
  }

  return createIncident_contact;

});
