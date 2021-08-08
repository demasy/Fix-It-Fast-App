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
        'ojs/ojradioset'],
function(ko, app, appUtils, ArrayDataProvider) {
  function status(params) {
    var self = this;
    self.incidentData = params.incidentData;
    self.statusChange = params.statusChange;
    self.isReadOnlyMode = app.isReadOnlyMode;

    self.connected = function() {
      appUtils.adjustContentPadding();
    };

    var statusOptionsArr = [{'id': 'open', 'title': 'Open'},
                            {'id': 'accepted', 'title': 'Accepted'},
                            {'id': 'closed', 'title': 'Closed'}];

    self.statusOptions = ko.observableArray();
    self.statusOptions(new ArrayDataProvider(statusOptionsArr, {keyAttributes: 'id'}));
  }

  return status;
});
