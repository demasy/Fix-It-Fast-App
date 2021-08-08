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
define(['appController', 'ImageHelper', 'ojs/ojknockout'], function(app, imageHelper) {
  function createIncident_photo(params) {
    var self = this;

    self.connected = function() {
      // retrieve img observable from newIncidentDataModel
      self.newIncidentModel = params.newIncidentModel;
      self.imgSrc = self.newIncidentModel().picture;
      self.spenSupported = app.spenSupported;
      self.setupPopup = app.setupPopup;

      imageHelper.registerImageListeners(app, 'upload-incident-pic', self.imgSrc, self, 'attachPhoto');
    };
  }

  return createIncident_photo;
});
