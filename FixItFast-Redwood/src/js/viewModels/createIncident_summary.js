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
define(['ojs/ojinputtext', 'ojs/ojknockout', 'ojs/ojlabel', 'ojs/ojformlayout'], function() {
  function createIncident_summary(params) {
    var self = this;
    var categoryDic = {
      'appliance': 'Appliance',
      'electrical': 'Electrical',
      'heatingcooling': 'Heating / Cooling',
      'plumbing': 'Plumbing',
      'general': 'General'
    };

    self.prefetch = function() {
      self.newIncidentModel = params.newIncidentModel;
    }

    self.categoryLabel = function(categoryID) {
      return categoryDic[categoryID];
    };

    self.priorityLabel = function(priorityID) {
      return priorityID.charAt(0).toUpperCase() + priorityID.slice(1);
    };
  }

  return createIncident_summary;
});
