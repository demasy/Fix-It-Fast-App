/**
 * @license
 * Copyright (c) 2014, 2021, Oracle and/or its affiliates.
 * Licensed under The Universal Permissive License (UPL), Version 1.0
 * as shown at https://oss.oracle.com/licenses/upl/
 * @ignore
 */
var path = require('path');

function resolvePath(filePath)
{
  return path.resolve(__dirname, filePath);
}

var db = require(resolvePath("app/database.js"));

var constants = require(resolvePath("constants"));
var CONTEXT_ROOT = constants.CONTEXT_ROOT ? constants.CONTEXT_ROOT : '';

var QP_TECHNICIAN = "technician";

// Notification ID must be unique for each notification to appear separately on Android
var notificationId = 0;

/**
 * we changed the Companion app, and this service, to use a real username instead of '1',
 * so we need to support both, so old Companion MAX Appsd work with the new service
 */
function _mapUsername(username)
{
  if (username === '1')
  {
    //console.log('mapping user: ' + username);
    username = 'hcr';
  }
  return username;
}

module.exports = function (api)
{

  // TODO: NEed a way to use JSON Schema to return exact response so we don't send extra info
  var _AUTHENTICATED_USER = 'hcr';

  // Simple cloner of objects
  var _cloneObject = function (response)
  {
    return JSON.parse(JSON.stringify(response));
  };

  var _buildAuthUserProfileResponse = function (technician)
  {
    var technicianResponse = technician;

    var value = technician["photo"];
    if (value)
    {
      var base64 = db.getPhoto(value);
      // add base64 encoding prefix, for html encoded images
      technicianResponse["photo"] = "data:image/png;base64," + base64;

    }
    var locationId = technician.locationId;

    // fetch customer address info and update response
    technicianResponse.location = db.getLocation(locationId);

    return technicianResponse;
  };

  var _buildAuthUserPersonResponse = function (technician)
  {
    // TODO we should be reading from schema here
    var personResponse = {
      "username": "",
      "firstName": "",
      "lastName": "",
      "email": "",
      "mobile": "",
      "photo": ""
    };
    var props = Object.keys(personResponse);
    for (var i = 0; i < props.length; i++)
    {
      var prop = props[i];
      var value = technician[prop];
      if (prop === "photo")
      {
        var base64 = db.getPhoto(value);
        // add base64 encoding prefix, for html encoded images

        // add base64 encoding prefix, for html encoded images
        value = "data:image/png;base64," + base64;

      }
      personResponse[prop] = value;
    }

    return personResponse;
  };

  var _buildIncidentResponse = function (incident)
  {

    var incidentResponse = incident;
    var customerId = incident.customerId;
    var locationId = incident.locationId;

    // TODO: NEed a way to use JSON Schema to return exact response so we don't send extra info

    // fetch customer info
    incidentResponse.customer = db.getCustomerById(customerId);

    // fetch location info and update response
    var dbLocation = db.getLocation(locationId) || {};

    var incidentLocation = {};
    incidentLocation.formattedAddress = dbLocation.formattedAddress;
    incidentLocation.latitude = dbLocation.latitude;
    incidentLocation.longitude = dbLocation.longitude;
    incidentLocation.id = dbLocation.id;
    incidentLocation.revNum = dbLocation.revNum;
    incidentResponse.location = incidentLocation;

    return incidentResponse;
  };

  var _buildCustomerResponse = function (customer)
  {

    var customerResponse = customer;
    var locationId = customer.locationId;

    // TODO: NEed a way to use JSON Schema to return exact response so we don't send extra info

    // fetch customer address info and update response
    customerResponse.address = db.getLocation(locationId);

    return customerResponse;
  };

  var _buildIncidentActivityResponse = function (activity)
  {
    var activityResponse = {};
    var customerId = activity.customerId;

    var technicianUsername = activity._technicianUsername;

    // activity record can have either customerId or technicianUsername. not both
    var user = technicianUsername ? db.getTechnicianByUsername(technicianUsername) :
      (customerId ? db.getCustomerById(customerId) : null);

    if (user)
    {
      activityResponse.firstName = user.firstName;
      activityResponse.lastName = user.lastName;
      activityResponse.userId = user.id;
      activityResponse.role = user.role;
    }

    // fetch location info and update response
    activityResponse.createdOn = activity.createdOn;
    activityResponse.comment = activity.comment;
    activityResponse.picture = activity.picture;
    activityResponse.id = activity.id;
    activityResponse.revNum = activity.revNum;

    return activityResponse;
  };

  /**
   * Returns the parsed value for all '/incidents' query parameters.
   * @param {string} name of param
   * @param {string} value value of query param
   * @private
   */
  var _getIncidentsQueryParam = function (name, value)
  {
    var ret = undefined;

    switch (name)
    {
      case QP_TECHNICIAN:
        var techUsername;
        if (value && typeof value === "string")
        {
          // According to service api, queryParameter can be either string '~' or an integer technician id.
          if (value === "~")
          {
            // hardcode '~' to _AUTHENTICATED_USER; we don't have an authenticated user in mock.
            techUsername = _AUTHENTICATED_USER;
          }
          else
          {
            techUsername = value;
          }
        }

        ret = techUsername;
        break;

      default:
        ret = undefined;
    }

    return ret;
  };

  // INCIDENTS ENDPOINTS
  /**
   * Return incidents response.
   */
  api.get(CONTEXT_ROOT + '/incidents', function (req, res)
  {
    var response = {};
    var list = null,
      incidents = null,
      incident = null,
      technicianUsername = null;

    if (!req.query[QP_TECHNICIAN])
    {
      res.send(400, "A required query parameter '" + QP_TECHNICIAN + "' was not specified for this request.");
      return;
    }

    technicianUsername = _getIncidentsQueryParam(QP_TECHNICIAN, _mapUsername(req.query[QP_TECHNICIAN]));
    list = db.getWIPIncidentsForTechnician(technicianUsername);
    incidents = list.result;
    response.revNum = list.revNum;

    // package Incidents response
    response.count = incidents.length;
    response.result = [];

    for (var i = 0; i < incidents.length; i++)
    {

      incident = incidents[i];
      response.result.push(_buildIncidentResponse(incident));
    }
    res.send(200, response);
  });

  /**
   * Creates an incident record and assigns to the current technician if a technician is not provided.
   */
  api.post(CONTEXT_ROOT + '/incidents', function (req, res)
  {
    var id = req.params.id;
    var obj = req.body;

    //console.log("createIncident action called id = " + id + " body = " + obj);

    var patchedIncident = db.createIncident(obj);

    if (!patchedIncident)
    {
      res.send(404, "An incident with problem '" + obj.problem + "' was not created");
    }
    else
    {
      var response = _buildIncidentResponse(patchedIncident);
      // Send result
      res.send(200, response);

      // post notification
      var badgeNumber = db.getUnreadIncidentCount(/* technicianUserName */);
      req.oracleMobile.notification.post(
      { 
        payload: 
        {
          services: 
          {
            apns: 
            {
              aps: 
              {
                alert: 'A new incident has been assigned to you: ' + patchedIncident.description,
                sound: "default",
                badge: badgeNumber
              }
            },
            gcm: 
            {
              data: 
              {
                message: 'A new incident has been assigned to you: ' + patchedIncident.description,
                sound: "default",
                notId: ++notificationId,
                badge: badgeNumber
              }
            }
          }
        }
      }, 
      {
        mbe: req.oracleMobile.mbe.getMBE().name,
        version: req.oracleMobile.mbe.getMBE().version
      })
      .then(
        function (result) {
        },
        function (error) {
        }
      );
    }
  });

  // INCIDENT ENDPOINTS
  api.get(CONTEXT_ROOT + '/incidents/:id', function (req, res)
  {
    //console.log(req.originalUrl);

    var id = req.params.id;
    var incident = db.getIncidentById(id);
    if (incident)
    {
      var response = _buildIncidentResponse(incident);
      res.send(200, response);
    }
    else
    {
      res.send(404, "incident " + id + " not found!");
    }
  });

  api.delete(CONTEXT_ROOT + '/incidents/:id', function (req, res)
  {
    //console.log(req.originalUrl);

    var id = req.params.id;
    var incident = db.getIncidentById(id);
    if (incident)
    {
      var data = {};
      var deleted = db.closeIncident(id, data);
      if (deleted)
      {
        res.send(204, "The incident has been deleted successfully");
      }
      else
      {
        res.send(404, "incident " + id + " not found or it has been deleted already!");
      }
    }
    else
    {
      res.send(404, "incident " + id + " not found!");
    }
  });

  api.post(CONTEXT_ROOT + '/incidents/:id/closeIncident', function (req, res)
  {
    var id = req.params.id;
    var obj = req.body;

    // console.log("PUT Incident action called id = " + id + " body = " + JSON.stringify(obj));

    var closedIncident = db.closeIncident(id, obj);

    if (closedIncident)
    {
      res.send(204, "The incident has been closed successfully");
    }
    else
    {
      res.send(404, "incident " + id + " not found!");
    }
  });

  api.put(CONTEXT_ROOT + '/incidents/:id', function (req, res)
  {
    var id = req.params.id;
    var obj = req.body;

    // console.log("PUT Incident action called id = " + id + " body = " + JSON.stringify(obj));

    var patchedIncident = db.updateIncident(id, obj);

    if (!patchedIncident)
    {
      res.send(404, "An incident with the id '" + id + "' was not found");
    }
    else
    {
      var response = _buildIncidentResponse(patchedIncident);
      res.send(200, response);
    }
  });

  api.get(CONTEXT_ROOT + '/incidents/:id/activities', function (req, res)
  {
    var id = req.params.id;

    var list = db.getIncidentActivities(id);
    var response = {};
    response.activities = [];
    if (list)
    {
      for (var i = 0; i < list.activities.length; i++)
      {
        response.activities.push(_buildIncidentActivityResponse(list.activities[i]));
      }
      response.revNum = list.revNum;
      res.send(200, response);
    }
    else
    {
      res.send(404, "unable to locate incident " + id + " not found!");
    }
  });

  api.post(CONTEXT_ROOT + '/incidents/:id/activities', function (req, res)
  {
    var id = req.params.id;
    var newActivity = null;
    var obj = req.body;

    console.log("POST activity comment: " + obj.comment + " picture: " + obj.picture);

    if (obj.comment)
    {
      // form data comes as encoded url params
      newActivity = db.createIncidentActivity(id, obj, _AUTHENTICATED_USER);
    }

    if (!newActivity)
    {
      res.send(400, "unable to create incident activity.");
    }
    else
    {
      var response = _buildIncidentActivityResponse(newActivity);
      res.send(201, response);
    }
  });

  api.patch(CONTEXT_ROOT + '/incidents/:id/activities/:actid', function (req, res)
  {
    var id = req.params.actid;
    var obj = req.body;

    //console.log("patchIncidentActivity action called id = " + id + " body = " + obj);

    var patchedIncidentActivity = db.updateIncidentActivity(id, obj);

    if (!patchedIncidentActivity)
    {
      res.send(404, "An incident activity with the id '" + id + "' was not found");
    }
    else
    {
      var response = _buildIncidentActivityResponse(patchedIncidentActivity);
      res.send(200, response);
    }
  });

  // CUSTOMERS ENDPOINTS
  /**
   * Return customers response.
   */
  api.get(CONTEXT_ROOT + '/customers', function (req, res)
  {
    //console.log(req.originalUrl);

    var response = {};
    var list = db.getCustomers();
    var customers = list.result;
    
    // package customers response

    response.count = customers.length;
    response.revNum = list.revNum;
    response.result = [];

    for (var i = 0; i < customers.length; i++)
    {

      var customer = _cloneObject(customers[i]);
      response.result.push(_buildCustomerResponse(customer));
    }

    res.send(200, response);
  });

  api.post(CONTEXT_ROOT + '/customers', function (req, res)
  {
    var response = {};
    var postBody = req.body;

    var newCustomer = _cloneObject(db.createCustomer(postBody));
    if (!newCustomer)
    {
      res.send(404, "A customer could not be created");
    }
    else
    {
      var response = _buildCustomerResponse(newCustomer);
      // Unclear how we would set headers.
      // res.headers['Location'] = "/" + response.id;
      res.send(201, response);
    }
  });

  // CUSTOMER ENDPOINTS
  api.get(CONTEXT_ROOT + '/customers/:id', function (req, res)
  {
    //console.log(req.originalUrl);

    var id = req.params && req.params.id;

    var cust = db.getCustomerById(id);

    var customer = _cloneObject(cust);
    if (customer)
    {
      var response = _buildCustomerResponse(customer);
      res.send(200, response);
    }
    else
    {
      res.send(404, "customer with id '" + id + "' not found!");
    }
  });

  api.patch(CONTEXT_ROOT + '/customers/:id', function (req, res)
  {
    var id = req.params.id;
    var obj = req.body;

    //console.log("updateIncident action called id = " + id + " body = " + obj);

    var patchedCustomer = db.updateCustomer(id, obj);

    if (!patchedCustomer)
    {
      res.send(404, "A customer with the id '" + id + "' was not found");
    }
    else
    {
      var response = _buildCustomerResponse(patchedCustomer);
      res.send(200, response);
    }
  });

  // TECHNICIAN PROFILE
  api.get(CONTEXT_ROOT + '/users/~', function (req, res)
  {
    // TODO need to build a mock security implementation for the authenticated user.

    var tech = _cloneObject(db.getTechnicianByUsername(_AUTHENTICATED_USER));
    if (tech)
    {
      var response = _buildAuthUserProfileResponse(tech);
      res.send(200, response);
    }
    else
    {
      res.send(404, "user profile cannot be located!");
    }
  });

  api.patch(CONTEXT_ROOT + '/users/~', function (req, res)
  {
    var id = _AUTHENTICATED_USER;
    var obj = req.body;

    //console.log("updateUser action called id = " + id + " body = " + obj);

    var technician = _cloneObject(db.updateTechnician(id, obj));
    if (!technician)
    {
      res.send(404, "user profile not found");
    }
    else
    {
      var response = _buildAuthUserProfileResponse(technician);
      res.send(200, response);
    }
  });

  // STATS ENDPOINTS
  api.get(CONTEXT_ROOT + '/stats', function (req, res)
  {
    var qp = req.query;
    var response = {};
    var period = "annual";

    if (qp && qp.period)
    {
      var _valid_periods = ["annual", "semi", "quarter"];

      if (_valid_periods.indexOf(qp.period) > -1)
      {
        period = qp.period;
      }
    }
    if (qp && qp[QP_TECHNICIAN])
    {
      var tech = db.getTechnicianByUsername(_mapUsername(qp[QP_TECHNICIAN]));
      // TODO: hardcoded data for now.
      response.metrics = db.getStats(period, tech);
      response.revNum = 1;
      res.send(200, response);
    }
    else
    {
      res.send(400, "A required query parameter '" + QP_TECHNICIAN + "' was not specified for this request.");
    }
  });

  api.get(CONTEXT_ROOT + '/stats/incidents', function (req, res)
  {
    var qp = req.query;
    var incidentStats = null;

    if (qp && qp[QP_TECHNICIAN])
    {
      var technicianUsername = _getIncidentsQueryParam(QP_TECHNICIAN, _mapUsername(qp[QP_TECHNICIAN]));
      incidentStats = db.getIncidentsStats(technicianUsername);
    }
    else
    {
      res.send(400, "A required query parameter '" + QP_TECHNICIAN + "' was not specified for this request.");
      return;
    }

    // package incidentsStats response
    var groups = Object.keys(incidentStats.groups || {});
    var response = {incidentCount: {"high": 0, "normal": 0, "low": 0}, revNum: incidentStats.revNum};

    var groupName = "";
    var groupCount = 0;
    var ic = response.incidentCount;
    for (var i = 0; i < groups.length; i++)
    {
      groupName = groups[i];
      groupCount = incidentStats.groups[groupName].length;
      groupCount = incidentStats.groups[groupName].length;

      ic[groupName] = groupCount;
    }

    //console.log(response);
    res.send(200, response);
  });

  api.get(CONTEXT_ROOT + '/stats/technician', function (req, res)
  {
    var qp = req.query;

    var period = "semi";

    if (qp && qp.period)
    {
      var _valid_periods = ["annual", "semi", "quarter"];

      if (_valid_periods.indexOf(qp.period) > -1)
      {
        period = qp.period;
      }
    }

    var tech = db.getTechnicianByUsername(_AUTHENTICATED_USER);
    if (tech)
    {
      var personResponse = _buildAuthUserPersonResponse(tech);
    }

    /*
     // alternate collectionModel needs to be tested
     var _TECHNICIAN_STATS = {
     "timeSlice": "month",
     "technician": personResponse,
     "stats":
     {
     "timeSlice": ["Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"],
     "technician": [12, 10, 8, 4, 0, 9, 13, 8, 5, 9, 10, 11],
     "average": [11, 8, 15, 14, 17, 9, 14, 10, 15, 11, 11, 10]
     }
     */

    // TODO: hardcoded data for now.
    var metrics = db.getTechnicianPerformanceData(period);
    var response = {
      dateDimension: "month",
      technician: personResponse,
      metrics: metrics.slice()
    };

    res.send(200, response);
  });

  // LOCATIONS ENDPOINTS
  api.get(CONTEXT_ROOT + '/locations/:id', function (req, res)
  {
    var qp = req.params;
    var location;

    if (qp && qp.id)
    {
      location = db.getLocation(qp.id);
    }
    else
    {
      res.send(400, "A location 'id' was not specified for this request.");
    }

    if (location)
    {
      res.send(200, location);
    }
    else
    {
      res.send(404, "location data cannot be located!");
    }
  });

   api.delete(CONTEXT_ROOT + '/storage', function (req, res)
   {
     //console.log("DELETE /storage called");
     db.resetStorage();
     res.send(200, { success: true });
   });

};
