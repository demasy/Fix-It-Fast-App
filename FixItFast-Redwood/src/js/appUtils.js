/**
 * @license
 * Copyright (c) 2014, 2021, Oracle and/or its affiliates.
 * Licensed under The Universal Permissive License (UPL), Version 1.0
 * as shown at https://oss.oracle.com/licenses/upl/
 * @ignore
 */
'use strict';
define(['ojs/ojlogger'], function (Logger) {
    // Common utility functions for formatting
    var avatarClassPalette = ["customer0", "customer1", "customer2", "customer3", "customer4", "customer5"];
    var userAvatarClass = "customer1";
    var avatarColors = ["neutral", "purple", "red", "orange", "teal", "green"];
    var userAvatarColor = "purple";

    var formatAvatarClass = function (role, id) {
      if(role.toLowerCase() === 'customer') {
        return avatarClassPalette[id.slice(-3)%6];
      } else {
        return userAvatarClass;
      }
    };

    var getAvatarColor = function (role, id) {
      if(role.toLowerCase() === 'customer') {
        return avatarColors[id.slice(-3)%6];
      } else {
        return userAvatarColor;
      }
    };

    var formatInitials = function(firstName, lastName) {
      if(firstName && lastName) {
        return firstName.charAt(0).toUpperCase() + lastName.charAt(0).toUpperCase();
      }
    };

    var monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    var formatTimeStamp = function(timeString) {

      var timeStamp = Date.parse(timeString);
      var date = new Date(timeStamp);
      var hours = date.getHours();
      var minutes = "0" + date.getMinutes();
      var formattedTime = hours + ':' + minutes.substr(-2);

      var monthName = monthNames[date.getMonth()].substr(0, 3);
      var dateString = "0" + date.getDate();
      var formattedDate = monthName + ' ' + dateString.substr(-2);

      return {
        time: formattedTime,
        date: formattedDate
      };
    };

    /**
     * If there is a Top or Bottom header which matches with the content's id
     * then return that. Otherwise return the first one.
     * Doing this will prevent wrong padding for scenarios where one page has a
     * wider header and another has a narrower one.
     */
    var findMatchingElemIndex = function(tuples, id, suffix) {
      if (!tuples || tuples.length == 0)
        return undefined;

      if (!id)
        return 0;

      var idToMatch = id + suffix;
      for (var i in tuples) {
        if (tuples[i].id === idToMatch)
          return i;
      }

      return 0;
    }

    /**
     * This method reads the offsetHeight from the elements once and stores it
     * This way we solve the issue of forced reflows that happens while reading this
     * infomration within a loop while setting padding for the content elements.
     */
    var makeTuples = function(els) {
      var tuples = [];
      for (var i = 0; i < els.length; i++)
        tuples.push({id:els[i].id, offsetHeight:els[i].offsetHeight});
      return tuples;
    }

    /**
     * This method automatically adjusts content padding with respect to the top and bottom content.
     * For tieing up content to a particular top or bottom section, use ids.
     * Content section with id as 'content' will be matched with a top with 'contentTop' and bottom with 'contentBottom'
     * In this case the respective DOMs will be used for adjusting the padding.
     * If there is no ID on the content, then the first available top and bottom will be taken to adjust padding.
     */
    var adjustContentPadding = function() {
      var topElems = document.getElementsByClassName('oj-applayout-fixed-top');
      var topElemTuples = makeTuples(topElems);
      var contentElems = document.getElementsByClassName('oj-applayout-content');
      var bottomElems = document.getElementsByClassName('oj-applayout-fixed-bottom');
      var bottomElemTuples = makeTuples(bottomElems);

      for (var i = 0; i < contentElems.length; i++) {
        var contentElem = contentElems[i];
        var topElemIndex = findMatchingElemIndex(topElemTuples, contentElem.id, 'Top');
        var bottomElemIndex = findMatchingElemIndex(bottomElemTuples, contentElem.id, 'Bottom');

        if (topElemIndex !== undefined)
          contentElems[i].style.paddingTop = topElemTuples[topElemIndex].offsetHeight+'px';

        if (bottomElemIndex !== undefined)
          contentElems[i].style.paddingBottom = bottomElemTuples[bottomElemIndex].offsetHeight+'px';

        // Add oj-complete marker class to signal that the content area can be unhidden.
        contentElems[i].classList.add('oj-complete');
      }
    };

    /**
     * Method used to set focus after every oj-module transition.
     * This needs to be done because the focus remains on the last tapped area in case of mobile.
     * Just setting focus on the element does not work well on iOS. So this method employs
     * a retry logic
     * @param {string} id
     */
    var setFocusAfterModuleLoad = function(id) {
      var focusInterval = 250; // ms, time between function calls
      var focusTotalRepetitions = 3; // number of repetitions
      var focusRepetitions = 0;
      var interval = window.setInterval(function() {
        // Some times when transitioning from one module to another
        // the element to be focused may have same id.
        // So get the element every time rather get once and reuse.
        var el = document.getElementById(id)
        if (el)
          el.focus();
        focusRepetitions++;
        if (focusRepetitions >= focusTotalRepetitions) {
          window.clearInterval(interval);
        }
      }, focusInterval);
    }

    var mapPrefix;
    var getMapPrefix = function() {
      if (mapPrefix)
        return mapPrefix;

      mapPrefix = 'geo:';
      if (window.device && window.device.platform
            && window.device.platform.toLowerCase() === 'ios') {
        mapPrefix = 'maps:';
      }
      return mapPrefix;
    }

    var pageBusyResolve;

    /**
     * Sets page level busy context and adds busy state.
     * These are for cases outside normal VM load such as map loads, which do not come under prefetch.
     * This is only one for the app. This is centralized here because setting of busy context and resolve
     * happens in different places (VMs)
     * For VM instantiation and prefetch there is a separate busy context in ModuleHelper.
     * For data loads there is a separate busy context in dataService.
     */
    var setPageBusyContext = function() {
      if (pageBusyResolve) return;

      var busyContext = oj.Context.getPageContext().getBusyContext();
      var options = {"description": "Busy navigating between views and performing loading operations..."};
      Logger.info('[FIF App] Setting up app level busy context: ' + options.description);
      pageBusyResolve = busyContext.addBusyState(options);
    };

    /**
     * Resolve the busy context set via setPageBusyContext
     */
    var resolvePageBusyContext = function() {
      if (pageBusyResolve) {
        pageBusyResolve();
        Logger.info('[FIF App] Resolving app level busy context');
        pageBusyResolve = null;
      }
    };

    return {
      formatAvatarClass: formatAvatarClass,
      getAvatarColor: getAvatarColor,
      formatInitials: formatInitials,
      formatTimeStamp: formatTimeStamp,
      adjustContentPadding: adjustContentPadding,
      setFocusAfterModuleLoad: setFocusAfterModuleLoad,
      getMapPrefix: getMapPrefix,
      setPageBusyContext: setPageBusyContext,
      resolvePageBusyContext: resolvePageBusyContext
    }
  });
