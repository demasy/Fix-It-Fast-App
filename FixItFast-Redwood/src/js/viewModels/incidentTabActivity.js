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
define(['ojs/ojcore', 'knockout',
        'dataService',
        'appController',
        'ImageHelper',
        'appUtils',
        'ojs/ojarraydataprovider',
        'ojs/ojlogger',
        'ojs/ojknockout',
        'ojs/ojlistview',
        'ojs/ojinputtext',
        'ojs/ojbutton',
        'ojs/ojrefresher',
        'ojs/ojavatar'], function(oj, ko, data, app, imageHelper, appUtils, ArrayDataProvider, Logger) {
  function incidentTabActivity(params) {

    var self = this;
    self.isReadOnlyMode = app.isReadOnlyMode;
    self.appUtilities = appUtils;
    self.postBtnDisabled = ko.observable(true);
    self.isMobile = window.cordova;

    // retrieve incident id
    self.incidentId = params.parentRouter.parent.currentState().id;

    self.scrollElem = document.body;

    self.allActivities = ko.observableArray([]);
    self.dataSource = new ArrayDataProvider(self.allActivities, { keyAttributes: 'id' });

    function getActivities() {
      // check for new activities
      return new Promise(function (resolve, reject) {
        data.getIncidentActivities(self.incidentId)
          .then(function(response) {
            var data = JSON.parse(response);
            var results = data.activities;
            self.lastUpdate = data.lastUpdate;
            processActivities(results);
            resolve();
          })
          .catch(function (e) {
            reject(e);
          });
      });
    }

    function processActivities(results) {
      results.sort(function(a, b) {
        return (a.createdOn < b.createdOn) ? 1 : (a.createdOn > b.createdOn) ? -1 : 0;
      });

      self.allActivities(results);

      if(results.length === 0) {
        var activityListView = document.getElementById('activityListView');
        activityListView.translations.msgNoData = 'No Activity';
        activityListView.refresh();
      }
    }

    self.refreshList = function() {
      return getActivities();
    };

    self.prefetch = function() {
      return getActivities();
    }

    self.connected = function () {
      document.getElementById('page').addEventListener('onActivitiesUpdated', refreshActivities);
      // adjust content padding top
      appUtils.adjustContentPadding();
      imageHelper.registerImageListeners(app, 'upload-activity-pic', self.imageSrc, self, 'changePhoto');
    }

    self.disconnected = function () {
      document.getElementById('page').removeEventListener('onActivitiesUpdated', refreshActivities);
    }

    var refreshActivities = function (response) {
      var data = JSON.parse(response.detail);
      var results = data.activities;
      self.lastUpdate = data.lastUpdate;
      processActivities(results);
    }

    self.activityText = ko.observable();
    self.imageSrc = ko.observable();

    // post to activity list
    self.postActivity = function() {
      imageHelper.loadImage(self.imageSrc())
        .then(function(base64Image) {
          return data.postIncidentActivity(self.incidentId, self.activityText(), base64Image);
        })
        .then(function(response) {
          self.activityText('');
          self.imageSrc('');
          document.getElementById('upload-activity-pic').value = '';
          self.allActivities.unshift(JSON.parse(response));
          app.connectionDrawer.showAfterUpdateMessage();
        })
        .catch(function(err) {
          var errMsg = 'Failed to post activity';
          oj.Logger.error(errMsg, err);
          app.connectionDrawer.showAfterUpdateMessage(errMsg);
        });
    };

    self.validatePostBtnState = function(event) {
      if (self.isReadOnlyMode)
        return;

      var text = event.target.value.trim();
      if ((text && !self.postBtnDisabled()) || (!text && self.postBtnDisabled()))
        return;

      self.postBtnDisabled(!self.postBtnDisabled());
    };

    function copyLocalFile(localFileUrl, res, rej) {
      window.resolveLocalFileSystemURL(cordova.file.applicationDirectory + localFileUrl,
        function(entry) {
          window.resolveLocalFileSystemURL(cordova.file.dataDirectory, function(storage) {
            entry.copyTo(storage, localFileUrl.split("/").pop(), function(newFileEntry) {
              res(newFileEntry.toURL());
            }, rej);
          }, rej);
        }, rej);
    }

    function copyLocalFileToDataDir(localFileUrl) {
      return new Promise(function(res, rej) {
        window.resolveLocalFileSystemURL(cordova.file.dataDirectory + localFileUrl.split("/").pop(),
          function(existingFile) {
            if (existingFile.isFile) {
              res(existingFile.toURL());
              return;
            }
            copyLocalFile(localFileUrl, res, rej);
          },
          function(err) {
            if (err.code == 1) {
              copyLocalFile(localFileUrl, res, rej);
            }
          });
      });
    }

    function openFileUsingOpener2(localUrl) {
      cordova.plugins.fileOpener2.open(localUrl, 'application/pdf', {
        error : function(e) {
          Logger.info('[FIF App] Error status: ' + e.status + ' - Error message: ' + e.message);
        },
        success : function () {
          Logger.info('[FIF App] File opened successfully');
        }
      });
    }

    self.openLocalFile = function(event, vm) {
      if (!cordova.plugins.fileOpener2 || !cordova.file) {
        Logger.error("Cannot open PDF as required plugins are missing. Install cordova-plugin-file-opener2 and cordova-plugin-file plugins.");
        return;
      }

      copyLocalFileToDataDir('www/' + vm.data.pdf)
        .then(function(copiedUrl) {
          openFileUsingOpener2(copiedUrl);
        }).catch(function(err) {
          Logger.info(JSON.stringify(err));
        });
    };
  }

  return incidentTabActivity;
});
