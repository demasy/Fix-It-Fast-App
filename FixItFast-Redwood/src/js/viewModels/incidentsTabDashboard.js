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

// dashboard viewModel that controls the visualizations

'use strict';
define(['ojs/ojcore', 'knockout', 'appController', 'appUtils', 'ojs/ojconverter-number',
        'ojs/ojknockout', 'ojs/ojchart'], function(oj, ko, app, appUtils, NumberConverter) {

  function incidentsTabDashboard(params) {
    var self = this;

    self.centerLabel = ko.observable();
    self.labelStyle = ko.observable({'color':'#1a1816','fontSize':'33px','fontWeight':'200'});

    self.numPriorityHigh = ko.observable(0);
    self.numPriorityNormal = ko.observable(0);
    self.numPriorityLow = ko.observable(0);

    self.pieSeriesValue = ko.observableArray([]);
    self.pieGroupsValue = ko.observableArray([]);

    self.barSeriesValue = ko.observableArray([]);
    self.barGroupsValue = ko.observableArray([]);

    self.innerRadius = ko.observable(0.8);
    self.integerConverter = ko.observable(null);

    self.integerConverter(new NumberConverter.IntlNumberConverter({minimumFractionDigits: 0, maximumFractionDigits: 0}));

    self.isPhone = ko.observable(app.isPhone());

    // load incidents stats
    self.prefetch = function() {
      new Promise(function(resolve, reject) {
        self.setPieChart(params.pieChartResult());
        self.setBarChart(params.barChartResultMetrics(), resolve);
      });
    }

    self.connected = function(params) {
      appUtils.adjustContentPadding();
      app.isPhone.subscribe((data)=> self.isPhone(data));
    };

    self.setBarChart = function(data, resolve) {
      var barGroups = [];
      var series = [{ name: "Open Incidents", items: [], color: '#EEA357' },
                    { name: "Closed Incidents", items: [], color: '#4EB5A3' }];

      data.forEach(function(entry) {
        barGroups.push({name: entry.month.substr(0, 3), shortDesc: entry.month});
        var openIncidents = entry.incidentsAssigned - entry.incidentsClosed;
        series[0].items.push({value: openIncidents, shortDesc: openIncidents + " Open Incidents in " + entry.month});
        series[1].items.push({value: entry.incidentsClosed, shortDesc: entry.incidentsClosed + " Closed Incidents in " + entry.month});
      });

      self.barSeriesValue(series);

      self.barGroupsValue(barGroups);
      if (resolve)
        resolve();
    };

    /**
     * Generate the custom tooltip
     */
    self.tooltipFunction = function (dataContext) {
      // Set a black border for the tooltip
      dataContext.parentElement.style.borderColor = "#1a1816";

      var tooltipElem = document.createElement('div');

      // Add series and group text
      var textDiv = document.createElement('div');
      textDiv.style.textAlign = 'center'
      tooltipElem.appendChild(textDiv);

      var dateText = document.createElement('span');
      dateText.textContent = dataContext.group;
      dateText.style.fontWeight = 'bold';
      textDiv.appendChild(dateText);

      textDiv.appendChild(document.createElement('br'));

      var table = document.createElement('table');
      textDiv.appendChild(table);

      var chart = dataContext.componentElement;
      for (var i = 0; i < chart.getSeriesCount(); i++)
      {
        var seriesItem = chart.getDataItem(i, dataContext.x);

        var row = document.createElement('tr');
        table.appendChild(row);

        var column1 = document.createElement('td');
        row.appendChild(column1);
        column1.style.backgroundColor = seriesItem['color'];
        column1.style.width = '5px';

        var column2 = document.createElement('td');
        row.appendChild(column2);
        var seriesText = document.createElement('span');
        seriesText.textContent = seriesItem['series']
        seriesText.style.cssFloat = 'left';
        column2.appendChild(seriesText);

        var column3 = document.createElement('td');
        row.appendChild(column3);
        var valueText = document.createElement('span');
        valueText.textContent = seriesItem['value'];
        column3.appendChild(valueText)
      }

      // Return an object with the elem to be inserted mapped to the 'insert' key
      return {'insert':tooltipElem};
    };

    self.setPieChart = function(data) {
      var total = data.incidentCount.high + data.incidentCount.normal + data.incidentCount.low;
      self.centerLabel(total + '');

      self.numPriorityHigh(data.incidentCount.high);
      self.numPriorityNormal(data.incidentCount.normal);
      self.numPriorityLow(data.incidentCount.low);

      var pieSeries = [{items: [{value: self.numPriorityLow(), shortDesc: self.numPriorityLow() + " Low Priority Incidents"}], color: '#32925E', name: 'Low Pirority' },
                   {items: [{value: self.numPriorityNormal(), shortDesc: self.numPriorityNormal() + " Normal Priority Incidents"}], color: '#655f5b', name: 'Normal Priority' },
                   {items: [{value: self.numPriorityHigh(), shortDesc: self.numPriorityHigh() + " High Priority Incidents"}], color: '#C84E3C', name: 'High Priority' }];

      var pieGroups = ["Group A"];

      self.pieSeriesValue(pieSeries);
      self.pieGroupsValue(pieGroups);
    };
  }

  return incidentsTabDashboard;
});
