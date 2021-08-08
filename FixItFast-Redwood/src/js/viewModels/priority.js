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
define(['knockout',
        'appController',
        'appUtils',
        'ojs/ojarraydataprovider',
        'ojs/ojknockout',
        'ojs/ojradioset'],
function(ko, app, appUtils, ArrayDataProvider) {
  function priority(params) {
    var self = this;
    self.incidentData = params.incidentData;
    self.priorityChange = params.priorityChange;
    self.isReadOnlyMode = app.isReadOnlyMode;

    self.connected = function() {
      appUtils.adjustContentPadding();
    }

    var priorityOptionsArr = [{'id': 'high', 'title': 'High'},
                              {'id': 'normal', 'title': 'Normal'},
                              {'id': 'low', 'title': 'Low'}];

    self.priorityOptions= ko.observableArray();
    self.priorityOptions(new ArrayDataProvider(priorityOptionsArr, {keyAttributes: 'id'}));

  }

  return priority;
});
