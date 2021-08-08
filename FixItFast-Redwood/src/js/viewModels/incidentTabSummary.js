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
define(['knockout', 'appUtils', 'ojs/ojknockout', 'ojs/ojformlayout', 'ojs/ojlabelvalue'], function(ko, appUtils) {
  function incidentTabSummary(params) {
    var self = this;
    self.goToPriority = params.goToPriority;
    self.goToStatus = params.goToStatus;
    self.goToCustomer = params.goToCustomer;
    self.incidentData = params.incidentData;
    self.mapHref = ko.observable();
    self.goToCustomerLocationMap = params.goToCustomerLocationMap;
/** to fetch Incident Status icon for redwood theme, might need to replace icons once new icons are received */
    self.getIncidentStatusIcon = function(status){
      switch(status){
        case 'closed':
          return 'oj-ux-ico-folder';
        case 'accepted':
          return 'oj-ux-ico-folder-accepted';
        case 'open':
        default:
          return 'oj-ux-ico-folder-open';
      }
    }
/** to fetch Incident priority icon for redwood theme, might need to replace icons once new icons are received */
    self.getPriorityIcon = function(status){
      switch(status){
        case 'high':
          return 'oj-ux-ico-odometer';
        case 'normal':
          return 'oj-ux-ico-odometer-mid';
        case 'low':
        default:
          return 'oj-ux-ico-odometer-low';
      }
    }
    self.prefetch = function() {
      // Data is passed as parameter. No new data to load
      return Promise.resolve();
    }

    // adjust content padding top
    self.connected = function() {
      appUtils.adjustContentPadding();
      self.mapHref(appUtils.getMapPrefix() + '0,0?q=' + self.incidentData().location.formattedAddress);
    };

    // trigger click when selection changes
    self.optionChange = function (event) {
      var detail = event.detail;
      if(detail.items && detail.items[0]) {
        detail.items[0].click();
      }
    };

    //get init caps of the passed string
    self.getInitCap = function(text) {
      if (text) {
        return text.charAt(0).toUpperCase() + text.slice(1);
      }
    };

  }

  return incidentTabSummary;
});
