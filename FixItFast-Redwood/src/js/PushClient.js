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

// PushClient using PhoneGap notification plugin and serviceWorker

'use strict';

define(['appConfig', 'dataService', 'ojs/ojlogger'], function (appConfig, data, Logger) {

  function PushClient(app) {
    var self = this;

    var platforms = navigator.userAgent.match(/(iPhone|iPad|iPod|Android|MSAppHost)/i);
    self.platform = platforms ? platforms[0] : null;
    if(self.platform ) {
      if(self.platform.substring(0,1) == 'i'){
        self.platform = "IOS"
      } else if(self.platform && self.platform.substring(0,1) == 'A'){
        self.platform = "ANDROID"
      } else if(self.platform && self.platform.substring(0,1) == 'M'){
        self.platform = "WINDOWS"
      }
    }

    self.providers = {
      'IOS': 'APNS',
      'ANDROID': 'GCM',
      'WINDOWS': 'WNS',
      'WEB': 'SYNIVERSE'
    }

    _initPush();

    function _initPush() {
      // get notificationToken from serviceWorker registration
      if('serviceWorker' in navigator) {
        navigator.serviceWorker.ready.then(function(registration) {
          registration.pushManager.subscribe({userVisibleOnly: true})
            .then(function (subscription) {
              self.notificationToken = subscription.endpoint.split('/').pop();
              // servicework uses GCM so set android as platform
              self.platform = 'ANDROID';
            })
            .catch(function (e) {
              if (Notification.permission === 'denied') {
                Logger.info('[FIF App] notification permission denied');
              } else {
                Logger.error(e);
              }
            })
        })
      }

      // initialise PushNotification plugin
      if(window.PushNotification) {
        self.push = PushNotification.init({
            "android": {
              senderID: appConfig.senderID,
              clearBadge: "true"
            },
            "browser": {
              pushServiceURL: 'http://push.api.phonegap.com/v1/push'
            },
            "ios": {
              clearBadge: "true",
              alert: "true",
              badge: "true",
              sound: "true"
            },
            "windows": {}
          });
        self.push.on('registration', function (data) {
          // update regId
          self.notificationToken = data.registrationId;
        });
        self.push.on('notification', function (data) {
          // TODO go to incidents list on click

          // Set badge in nav drawer
          app.unreadIncidentsNum(data.count);

          // Set badge on app icon
          self.push.setApplicationIconBadgeNumber(function() {
          }, function() {
            Logger.error('Setting Badge Number Error');
          }, data.count);
        });
      }
    }

    // register notification with Oracle Mobile Hub backend
    self.registerForNotifications = function () {

      // TODO verify whether authentication is needed

      var registration = {
        'notificationToken': self.notificationToken,
        'mobileClient': {
          'id': appConfig.appId,
          'version': appConfig.appVersion,
          'platform': self.platform
        },
        'notificationProvider': self.providers[self.platform]
      }

      // uncomment the following after setting up the Oracle Mobile Hub backend and senderID in appConfigExternal.js
      // data.registerForNotifications(registration).then(function (response) {
      //   console.log('[FIF App] Registering Notifications Success: ', response);
      // }).fail(function (response) {
      //   console.error('Registering Notifications Fail: ', response);
      // })
    }

  }

  return PushClient;
})
