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
define(['ojs/ojarraydataprovider',
        'ojs/ojinputtext',
        'ojs/ojradioset',
        'ojs/ojlabel', 'ojs/ojformlayout'], function(ArrayDataProvider) {
  function createIncident_problem(params) {
    var self = this;

    var categoryData = [
      {id: 'appliance', title: 'Appliance'},
      {id: 'electrical', title: 'Electrical'},
      {id: 'heatingcooling', title: 'Heating / Cooling'},
      {id: 'plumbing', title: 'Plumbing'},
      {id: 'generalhome', title: 'General Home'}
    ];

    var priorityData = [
      {id: 'high', title: 'High'},
      {id: 'normal', title: 'Normal'},
      {id: 'low', title: 'Low'}
    ];

    self.prefetch = function() {
      self.newIncidentModel = params.newIncidentModel;
      self.priorityList = new ArrayDataProvider(priorityData, {keyAttributes: 'id'});
      self.categoryList = new ArrayDataProvider(categoryData, {keyAttributes: 'id'});
    }
  }

  return createIncident_problem;
});
