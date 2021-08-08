/**
 * @license
 * Copyright (c) 2014, 2021, Oracle and/or its affiliates.
 * Licensed under The Universal Permissive License (UPL), Version 1.0
 * as shown at https://oss.oracle.com/licenses/upl/
 * @ignore
 */
exports.getIncidents = function ()
{
  return incidents;
};

/**
 * Cloner
 */
var _cloneObject = function (object)
{
  return JSON.parse(JSON.stringify(object));
};

/**
 * Returns all incidents assigned to technician with technician (username) and status not closed.
 * @param {number} technicianUsername
 * @returns {Array} of incidents
 */
var _getIncidentsForTechnician = function (technicianUsername)
{
  var incident = null,
    ret = [];
  for (var i = 0; i < incidents.length; i++)
  {
    incident = incidents[i];
    if (incident._technicianUsername === technicianUsername)
    {
      ret.push(incident);
    }
  }
  return ret;
};

/**
 * Returns all incidents that technician is working on.
 * @param {number} technicianUsername
 * @returns {Array} of incidents
 */
var _getWIPIncidentsForTechnician = function (technicianUsername)
{
  var incident = null,
    ret = [],
    incidents = _getIncidentsForTechnician(technicianUsername);

  for (var i = 0; i < incidents.length; i++)
  {
    incident = incidents[i];
    if (incident.status !== "closed")
    {
      ret.push(incident);
    }
  }
  return ret;
};

/**
 * Always creates an activity record. Callers should ensure that the activity can be created in the first place.
 *
 * @param id
 * @param comment
 * @param techUsername
 * @param picture (optional)
 * @returns {{}}
 * @private
 */
var _createActivityRecord = function (id, comment, techUsername, picture)
{
  var incident = null;
  var result = [];

  if (picture == null) {
  	console.log("PICTURE=null");
  } else {
  	console.log("PICTURE=" + picture);
  }

  for (var i = 0; i < incidents.length; i++)
  {
    if (incidents[i].id === id)
    {
      incident = incidents[i];
      break;
    }
  }

  // get all activities for incident
  if (incident)
  {
    // a comment was provided. add a new activity record.
    if (comment)
    {
      var newActivity = {};
      newActivity.incidentId = incident.id;
      newActivity.comment = comment;
      newActivity.picture = picture || null;
      newActivity._technicianUsername = techUsername;
      newActivity.createdOn = new Date().toISOString();
      newActivity.revNum = 1;

      // generate ID
      newActivity.id = (function (prefix, suffixNum)
      {
        var existingIds = incidentActivities.map(function (activity)
        {
          return activity.id;
        });

        var id = prefix + suffixNum;

        while (existingIds.indexOf(id) >= 0)
        {
          id = prefix + suffixNum++;
        }
        ;
        return id;
      })("act-", 134); // prefix & initial suffix to try

      incidentActivities.push(newActivity);
      incident.activitiesRevNum++;

      return newActivity;
    }
  }
};

/**
 * Returns all incidents that technician is working on.
 * @param {number} technicianUsername
 * @returns {Array} of incidents
 */
exports.getWIPIncidentsForTechnician = function (technicianUsername)
{
  var response = {};
  response.result = _getWIPIncidentsForTechnician(technicianUsername);
  response.revNum = incidentsRevNum;

  return response;
};

/**
 * creates a new incident record and returns the incident.
 *
 * problem*, description, priority [low, normal, high]
 *
 * @param data
 */
exports.createIncident = function (data)
{
  if (data && data.problem)
  {
    console.log ("createIncident: " + JSON.stringify(data));

    //var d = new Date();
    //var dateStr = d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();

    var newIncident = {
      "id": "",
      "problem": data.problem,
      "description": data.description || data.problem,
      "category": data.category || "general",
      "picture": data.picture || null,
      "status": "open",
      "priority": data.priority || "low",
      "createdOn": new Date().toISOString(),
      "lastUpdatedOn": "",
      "customerId": data.customerId || customers[0].id,
      "_technicianUsername": technicians[0].username,
      "locationId": data.locationId || locations[0].id,
      "read": false,
      "revNum": 1,
      "activitiesRevNum": 1
    };

    // generate ID
    newIncident.id = (function (prefix, suffixNum)
    {
      var existingIds = incidents.map(function (incident)
      {
        return incident.id;
      });

      var id = prefix + suffixNum;

      while (existingIds.indexOf(id) >= 0)
      {
        id = prefix + suffixNum++;
      }
      ;
      return id;
    })("inc-", 122); // prefix & initial suffix to try

    // add to data store
    incidents.push(newIncident);

    // increment unread count
    unread_incident_count++;

    // increment incidents list revision number
    incidentsRevNum++;

    // add a record activity
    _createActivityRecord(newIncident.id, newIncident.description, newIncident._technicianUsername, newIncident.picture);

    return newIncident;
  }

  return null;
};

/**
 * Get Incident Stats for the current technician, where {status} is 'open', and ordered by {priority DESC}.
 * @param {number} technicianUsername
 * @returns object
 */
exports.getIncidentsStats = function (technicianUsername)
{
  var incident = null,
    ret = {},  
    incidents = _getWIPIncidentsForTechnician(technicianUsername);

  ret.groups = {"high": [], "normal": [], "low": []};
  for (var i = 0; i < incidents.length; i++)
  {
    incident = incidents[i];
    ret.groups[incident.priority].push(incident);
  }
  ret.revNum = incidentsRevNum;

  return ret;
};

/**
 * Returns a single incident retrieved by its 'id'
 * @param {String} id
 * @returns {*}
 */
exports.getIncidentById = function (id)
{
  var incident = null;
  for (var i = 0; i < incidents.length; i++)
  {
    incident = incidents[i];
    if (incident.id === id)
    {
      // Mark as read & update unread incident count
      if (incident.read == false) {
        incident.read = true;
        unread_incident_count--;
        incident.revNum++;
        incidentsRevNum++;
      }
      return incident;
    }
  }
  return null;
};

/**
 * Patches an incident with data from incidentObj.
 * @param {string} id
 * @param {Object} patched
 * @returns {*}
 */
exports.updateIncident = function (id, patched)
{
  //console.log("updateIncident called: id = " + id + " obj = " +  JSON.stringify(incidentObj));
  var _STATUS_VALUES = ["open", "closed", "accepted"];
  var _PRIORITY_VALUES = ["high", "normal", "low"];

  for (var i = 0; i < incidents.length; i++)
  {
    if (incidents[i].id === id)
    {
      var incident = incidents[i];

      if (patched)
      {
        var updated = false;

        // Currently only problem, description, status and priority can change.
        if (patched.status && _STATUS_VALUES.indexOf(patched.status.toLowerCase().trim()) > -1)
        {
          var newValue = patched.status.toLowerCase().trim();
          if (incident.status !== newValue)
          {
            incident.status = newValue;
            updated = true;

            // add a record activity
            _createActivityRecord(id, "Status changed to " + incident.status, incident._technicianUsername);
          }
        }

        if (patched.priority && _PRIORITY_VALUES.indexOf(patched.priority.toLowerCase().trim()) > -1)
        {
          newValue = patched.priority.toLowerCase().trim();
          if (incident.priority !== newValue)
          {
            incident.priority = newValue;
            updated = true;

            // add a record activity
            _createActivityRecord(id, "Priority changed to " + incident.priority, incident._technicianUsername);
          }
        }

        if (patched.problem)
        {
          newValue = patched.problem.toLowerCase().trim();
          if (incident.problem !== newValue)
          {
            incident.problem = newValue;
            updated = true;

            // add a record activity
            _createActivityRecord(id, "Problem changed to " + incident.problem, incident._technicianUsername);
          }
        }
        if (patched.description)
        {
          newValue = patched.description.toLowerCase().trim();
          if (incident.description !== newValue)
          {
            incident.description = newValue;
            updated = true;

            // add a record activity
            _createActivityRecord(id, "Description changed to " + incident.description, incident._technicianUsername);
          }
        }
        if (patched.category)
        {
          newValue = patched.category.toLowerCase().trim();
          if (incident.category !== newValue)
          {
            incident.category = newValue;
            updated = true;

            // add a record activity
            _createActivityRecord(id, "Category changed to " + incident.category, incident._technicianUsername);
          }
        }

        if (updated)
        {
          incident.revNum++;
          incidentsRevNum++;
        }
      }

      return incident;
    }
  }

  return null;
};

exports.closeIncident = function (id, data)
{

  data = {status: "closed"};
  console.log(data);
  console.log(exports.updateIncident);

  return exports.updateIncident(id, data);
};

/**
 * Returns all activities for the current incident.
 * @param {String} id
 * @returns {*} array of incident activity records. when there are no activity records for the
 * incident the array is empty. if the incident was not found then this returns null
 */
exports.getIncidentActivities = function (id)
{
  var incident = null;
  var result = {};

  for (var i = 0; i < incidents.length; i++)
  {
    if (incidents[i].id === id)
    {
      incident = incidents[i];
      break;
    }
  }

  // get all activities for incident
  result.activities = [];
  if (incident)
  {
    for (var k = 0; k < incidentActivities.length; k++)
    {
      if (incidentActivities[k].incidentId === incident.id)
      {
        // add the activity record to result.
        result.activities.push(incidentActivities[k]);
      }
    }

    /**
     * results are sorted by date desc
     */
    result.activities.sort(function (a, b)
    {
      var adate = new Date(a);
      var bdate = new Date(b);

      var diff = adate - bdate;
      return diff < 0 ? 1 : (diff > 0) ? -1 : 0;
    });

    result.revNum = incident.activitiesRevNum;
    return result;
  }

  return null;
};

/**
 * Creates a new activity record on the incident as long as incident is open and a comment has been provided.
 *
 * @param {String} id of the incident for which the activity record is created
 * @param {Object} activity record body
 * @param {number} techUsername for now only technician can create activities
 *
 * @return {Object} the newly created activity or null if none created.
 */
exports.createIncidentActivity = function (id, activity, techUsername)
{

  // ensure activity can be created
  var incident = null;
  for (var i = 0; i < incidents.length; i++)
  {
    if (incidents[i].id === id)
    {
      incident = incidents[i];
      break;
    }
  }

  // only allow adding activity records for incidents that are not closed
  if (incident && incident.status !== "closed" && activity && activity.comment && techUsername)
  {
    return _createActivityRecord(id, activity.comment, techUsername, activity.picture);
  }

  return null;
};

/**
 * update incident activity.
 * @param id
 * @param patched
 * @returns {*}
 */
exports.updateIncidentActivity = function (id, patched)
{
  for (var i = 0; i < incidentActivities.length; i++)
  {
    if (incidentActivities[i].id === id)
    {
      var incidentActivity = incidentActivities[i];
      // Currently only commment or picture can change.
      if (patched)
      {
        var updated = false;

        if (patched.comment) 
        {
          incidentActivity.comment = patched.comment;
          updated = true;
        }
        // allow null or "" values
        if (typeof patched.picture !== "undefined") 
        {
          incidentActivity.picture = patched.picture || null;
          updated = true;
        }

        if (updated)
        {
          for (var i = 0; i < incidents.length; i++)
          {
            if (incidents[i].id === incidentActivity.incidentId)
            {
              incidents[i].activitiesRevNum++;
              break;
            }
          }
          incidentActivity.revNum++;
        }
      }

      return incidentActivity;
    }
  }
  return null;
};

/**
 * Returns the details of a location using its id
 * @param {string} id
 * @returns {*}
 */
exports.getLocation = function (id)
{
  var loc = null;
  for (var i = 0; i < locations.length; i++)
  {
    loc = locations[i];

    if (loc.id === id)
    {
      return loc;
    }
  }
  return null;
};

/**
 * Returns all the customers.
 * @returns {Array}
 */
exports.getCustomers = function ()
{
  var response = {};
  response.result = customers;
  response.revNum = customersRevNum;

  return response;
};

/**
 * Returns the details of a customer with 'id'.
 * @param {String} id
 * @returns {Object}
 */
exports.getCustomerById = function (id)
{
  var user = null;
  for (var i = 0; i < customers.length; i++)
  {
    user = customers[i];
    if (user.id === id)
    {
      return user;
    }
  }
  return null;
};

/**
 * Creates a new customer.
 *
 * @param {Object} obj data for the customer
 *
 * @return {Object} the newly created customer or null if required parameters were not provided.
 */
exports.createCustomer = function (obj)
{

  // first name and last name are required
  if (obj && obj.firstName && obj.lastName)
  {
    var newCust = {};
    newCust.firstName = obj.firstName;
    newCust.lastName = obj.lastName;

    // auto-fill username and id
    var letterCount = 1;
    var username = "";

    do {
      var prefix = (obj.firstName).substring(0, letterCount);
      username = prefix + obj.lastName;
      var foundUnique = true;
      var cust;

      for (var k = 0; k < customers.length; k++)
      {
        cust = customers[k];
        if (cust.username === username)
        {
          foundUnique = false;
          letterCount++;
          break; // try with new username
        }
      }

    }
    while (!foundUnique)

    newCust.username = username;
    newCust.role = "Customer";

    // get the last number from the customer data store and increment by 1
    var lastRecord = customers[customers.length - 1];
    var str = lastRecord.id;
    var numb = str.match(/\d/g);
    numb = numb.join("");
    newCust.id = "cus-" + ++numb;
    newCust.revNum = 1;

    // update optional properties if present
    var props = ["email", "mobile", "home", "locationId", "username"];
    props.forEach(function (prop)
    {
        newCust[prop] = obj[prop] || null;
    });

    // add to data store
    customers.push(newCust);
    customersRevNum++;

    return newCust;
  }

  return null;
};

/**
 * update customer info.
 * @param id
 * @param patched
 * @returns {*}
 */
exports.updateCustomer = function (id, patched)
{
  for (var i = 0; i < customers.length; i++)
  {
    if (customers[i].id === id)
    {
      var customer = customers[i];
      // Currently only firstName, lastName, mobile, home and email can change.
      if (patched)
      {
        var updated = false;

        if (patched.firstName) 
        {
          customer.firstName = patched.firstName;
          updated = true;
        }
        if (patched.lastName) 
        {
          customer.lastName = patched.lastName;
          updated = true;
        }

        // allow null or "" values
        if (typeof patched.mobile !== "undefined") 
        {
          customer.mobile = patched.mobile || null;
          updated = true;
        }

        if (typeof patched.home !== "undefined") 
        {
          customer.home = patched.home || null;
          updated = true;
        }

        if (typeof patched.email !== "undefined") 
        {
          customer.email = patched.email || null;
          updated = true;
        }

        // TODO: Add update location using foreign key relationship

        if (updated) 
        {
          customer.revNum++;
          customersRevNum++;  // Although list hasn't changed, client should refresh
        }
      }

      return customer;
    }
  }
  return null;
};

/**
 * Get user profile by id. The user happens to be the technician.
 * @param {number} id
 * @returns {*}
 */
exports.getTechnicianByUsername = function (username)
{
  var user = null;
  for (var i = 0; i < technicians.length; i++)
  {
    user = technicians[i];
    if (user.username === username)
    {
      return user;
    }
  }
  return null;
};

/**
 * update technician profile.
 * @param id
 * @param patched
 * @returns {*}
 */
exports.updateTechnician = function (username, patched)
{
  for (var i = 0; i < technicians.length; i++)
  {
    if (technicians[i].username === username)
    {
      var technician = technicians[i];
      // Currently only firstName, lastName, photo, mobile , home and email can change.
      if (patched)
      {
        var updated = false;

        // allow null or "" values
        if (typeof patched.mobile !== "undefined") 
        {
          technician.mobile = patched.mobile || null;
          updated = true;
        }

        if (typeof patched.home !== "undefined")
        {
          technician.home = patched.home || null;
          updated = true;
        }

        if (typeof patched.email !== "undefined")
        {
          technician.email = patched.email || null;
          updated = true;
        }

// Doesn't make sense to allow change of username, since it's used like a primary key
//        if (patched.username !== technician.username)
//        {
//          technician.username = patched.username;
//        }

        if (patched.firstName !== technician.firstName)
        {
          technician.firstName = patched.firstName;
          updated = true;
        }
        if (patched.lastName !== technician.lastName)
        {
          technician.lastName = patched.lastName;
          updated = true;
        }

        // ignore photo for now.
        // TODO: Add update location using foreign key relationship

        if (updated) 
        {
          technician.revNum++;
        }
      }

      return technician;
    }
  }
  return null;
};

/**
 * Returns the technician stats for the period specified.
 * @param {string} period one of 'annual' 'semi' 'quarter'. default is annual
 */
exports.getTechnicianPerformanceData = function (period)
{
  var data = technicianStats;

  if (period && period === "semi")
  {
    // return last 6 months of data
    data = data.slice(12, 23);
  }
  else if (period && period === "quarter")
  {
    // return last 6 months of data
    data = data.slice(18, 23);
  }

  return data;
};

exports.getTechnicianPerformanceMetric = function (seq)
{
  var metric = null;
  for (var i = 0; i < technicianStats.length > 0; i++)
  {
    metric = technicianStats[i];
    if (metric["seq"] == seq)
    {
      break;
    }
  }

  return metric;
};

exports.getUnreadIncidentCount = function(/* technicianUserName */) {
  // TODO: This should be a count per technician, but for now we only have 1 technician
  return unread_incident_count;
};

exports.getStats = function (period, tech)
{
  return cumulativeStats;
};

exports.getPhoto = function (photoId)
{
  return headshots_base64[photoId];
};

exports.getCollectionObject = function (id)
{
  var obj = collectionObjects[id];

  if (!obj)
  {
    obj = [];
    collectionObjects[id] = obj;
  }

  //console.log("getCollectionObject called: id = " + id + " obj = " +  JSON.stringify(obj));

  return obj;
};

exports.updateCollectionObject = function (id, obj)
{
  //console.log("updateCollectionObject called: id = " + id + " obj = " +  JSON.stringify(obj));

  collectionObjects[id] = obj;

  return {"id": id};
};

exports.resetStorage = function ()
{
  technicians = _cloneObject(original_technicians);
  technicianStats = _cloneObject(original_technicianStats);
  cumulativeStats = _cloneObject(original_cumulativeStats);
  customers = _cloneObject(original_customers);
  locations = _cloneObject(original_locations);
  incidents = _cloneObject(original_incidents);
  incidentActivities = _cloneObject(original_incidentActivities);
  customersRevNum++;
  incidentsRevNum++;

  //collectionObjects = {};

  //console.log("Storage cleared!");
};

/** -------------------------------
 * Mock Data for FixitFast service
 * --------------------------------
 */

/**
 * Technicians table
 *  technicians <--> (1..1) locations (locationId). NOTE: Technician location is the contact address.
 * @type {*[]}
 */
var technicians = [

  {
    "id": "7eabf05b-47f6-43b0-a6fa-27b20a0aed36",
    "username": "hcr",
    "firstName": "Harry",
    "lastName": "Carson",
    "role": "Field Service",
    "mobile": "+16505067000",
    "home": "+15105552121",
    "locationId": "loc-0",
    "email": "harry.carson@fixitfast.com",
    "photo": "m1",
    "revNum": 1
  },
  {
    "id": "2",
    "username": "charlie",
    "firstName": "Charlie",
    "lastName": "Doer",
    "role": "Field Service",
    "mobile": "+16505067000",
    "home": "+15105552121",
    "locationId": "loc-0",
    "email": "charlie.doe@fixitfast.com",
    "photo": "m2",
    "revNum": 1
  },
  {
    "id": "3",
    "username": "rosie",
    "firstName": "Rosie",
    "lastName": "Riveter",
    "role": "Field Service",
    "mobile": "+16505067000",
    "home": "+15105552121",
    "locationId": "loc-0",
    "email": "rosie.riveter@fixitfast.com",
    "photo": "f1",
    "revNum": 1
  },
  {
    "id": "4",
    "username": "fred",
    "firstName": "Fred",
    "lastName": "Fixer",
    "role": "Field Service",
    "mobile": "+16505067000",
    "home": "+15105552121",
    "locationId": "loc-0",
    "email": "fred.fixer@fixitfast.com",
    "photo": "m3",
    "revNum": 1
  },
  {
    "id": "5",
    "username": "tom",
    "firstName": "Tom",
    "lastName": "Tuttle",
    "role": "Online Help",
    "mobile": "+16505067000",
    "home": "+15105552121",
    "locationId": "loc-0",
    "email": "tom.tuttle@fixitfast.com",
    "photo": "m4",
    "revNum": 1
  }
];

var original_technicians = _cloneObject(technicians);

/**
 * TODO: Needs cleanup; Hardcoded data for now
 */
var technicianStats = [
  {
    "month": "Aug",
    "technician": "hcr",
    "incidentCount": 12
  },
  {
    "technician": "Average",
    "month": "Aug",
    "incidentCount": 10
  },
  {
    "technician": "hcr",
    "month": "Sep",
    "incidentCount": 8
  },
  {
    "technician": "Average",
    "month": "Sep",
    "incidentCount": 15
  },
  {
    "technician": "hcr",
    "month": "Oct",
    "incidentCount": 9
  },
  {
    "technician": "Average",
    "month": "Oct",
    "incidentCount": 15
  },
  {
    "technician": "hcr",
    "month": "Nov",
    "incidentCount": 0
  },
  {
    "technician": "Average",
    "month": "Nov",
    "incidentCount": 20
  },
  {
    "technician": "hcr",
    "month": "Dec",
    "incidentCount": 13
  },
  {
    "technician": "Average",
    "month": "Dec",
    "incidentCount": 11
  },
  {
    "technician": "hcr",
    "month": "Jan",
    "incidentCount": 7
  },
  {
    "technician": "Average",
    "month": "Jan",
    "incidentCount": 7
  },
  {
    "technician": "hcr",
    "month": "Feb",
    "incidentCount": 8
  },
  {
    "technician": "Average",
    "month": "Feb",
    "incidentCount": 9
  },
  {
    "technician": "hcr",
    "month": "Mar",
    "incidentCount": 4
  },
  {
    "technician": "Average",
    "month": "Feb",
    "incidentCount": -3
  },
  {
    "technician": "hcr",
    "month": "Mar",
    "incidentCount": 8
  },
  {
    "technician": "Average",
    "month": "Mar",
    "incidentCount": 9
  },
  {
    "technician": "hcr",
    "month": "Apr",
    "incidentCount": 8
  },
  {
    "technician": "Average",
    "month": "Apr",
    "incidentCount": 9
  },
  {
    "technician": "hcr",
    "month": "May",
    "incidentCount": 5
  },
  {
    "technician": "Average",
    "month": "May",
    "incidentCount": 9
  },
  {
    "technician": "hcr",
    "month": "Jun",
    "incidentCount": 4
  },
  {
    "technician": "Average",
    "month": "Jun",
    "incidentCount": 9
  },
  {
    "technician": "hcr",
    "month": "Jul",
    "incidentCount": 10
  },
  {
    "technician": "Average",
    "month": "Jul",
    "incidentCount": 11
  }
];

var original_technicianStats = _cloneObject(technicianStats);

var cumulativeStats = [
  {
    "month": "Jan",
    "technician": "hcr",
    "radius": 3,
    "incidentsClosed": 5,
    "incidentsAssigned": 7
  },
  {
    "month": "Feb",
    "technician": "hcr",
    "radius": 6,
    "incidentsClosed": 3,
    "incidentsAssigned": 6
  },
  {
    "month": "Mar",
    "technician": "hcr",
    "radius": 9,
    "incidentsClosed": 1,
    "incidentsAssigned": 5
  },
  {
    "month": "Apr",
    "technician": "hcr",
    "radius": 12,
    "incidentsClosed": 2,
    "incidentsAssigned": 7
  },
  {
    "month": "May",
    "technician": "hcr",
    "radius": 15,
    "incidentsClosed": 3,
    "incidentsAssigned": 9
  },
  {
    "month": "Jun",
    "technician": "hcr",
    "radius": 18,
    "incidentsClosed": 2,
    "incidentsAssigned": 4
  },
  {
    "month": "Jul",
    "technician": "hcr",
    "radius": 3,
    "incidentsClosed": 3,
    "incidentsAssigned": 6
  },
  {
    "month": "Aug",
    "technician": "hcr",
    "radius": 6,
    "incidentsClosed": 4,
    "incidentsAssigned": 8
  },
  {
    "month": "Sep",
    "technician": "hcr",
    "radius": 9,
    "incidentsClosed": 2,
    "incidentsAssigned": 3
  },
  {
    "month": "Oct",
    "technician": "hcr",
    "radius": 12,
    "incidentsClosed": 3,
    "incidentsAssigned": 5
  },
  {
    "month": "Nov",
    "technician": "hcr",
    "radius": 15,
    "incidentsClosed": 1,
    "incidentsAssigned": 4
  },
  {
    "month": "Dec",
    "technician": "hcr",
    "radius": 18,
    "incidentsClosed": 2,
    "incidentsAssigned": 6
  }
];

var original_cumulativeStats = _cloneObject(cumulativeStats);

/**
 * Customers Table
 * customers <--> (1..1) locations (locationId). NOTE: Customer can have multiple locations but for beta just one.
 * @type {*[]}
 */
var customers = [
  {
    "id": "cus-101",
    "username": "bsmith",
    "firstName": "Bob",
    "lastName": "Smith",
    "locationId": "loc-1",
    "mobile": "+16505067000",
    "home": "+15105552121",
    "email": "bsmith@somewhere.com",
    "role": "Customer",
    "revNum": 1
  },
  {
    "id": "cus-102",
    "username": "djones",
    "firstName": "Dan",
    "lastName": "Jones",
    "locationId": "loc-2",
    "mobile": "+16505067000",
    "home": "+15105552121",
    "email": "djones@somewhere.com",
    "role": "Customer",
    "revNum": 1
  },
  {
    "id": "cus-103",
    "username": "rbarker",
    "firstName": "Ricky",
    "lastName": "Barker",
    "locationId": "loc-3",
    "mobile": "+16505067000",
    "home": "+15105552121",
    "email": "rbarker@somewhere.com",
    "role": "Customer",
    "revNum": 1
  },
  {
    "id": "cus-104",
    "username": "lsmith",
    "firstName": "Lynn",
    "lastName": "Smith",
    "locationId": "loc-4",
    "mobile": "+16505067000",
    "home": "+15105552121",
    "email": "lsmith@somewhere.com",
    "role": "Customer",
    "revNum": 1
  },
  {
    "id": "cus-105",
    "username": "jtaylor",
    "firstName": "Julia",
    "lastName": "Taylor",
    "locationId": "loc-5",
    "mobile": "+16505067000",
    "home": "+15105552121",
    "email": "jtaylor@somewhere.com",
    "role": "Customer",
    "revNum": 1
  },
  {
    "id": "cus-106",
    "username": "bwilliams",
    "firstName": "Bruce",
    "lastName": "Williams",
    "locationId": "loc-6",
    "mobile": "+16505067000",
    "home": "+15105552121",
    "email": "bwilliams@somewhere.com",
    "role": "Customer",
    "revNum": 1
  },
  {
    "id": "cus-107",
    "username": "kbrown",
    "firstName": "Kent",
    "lastName": "Brown",
    "locationId": "loc-7",
    "mobile": "+16505067000",
    "home": "+15105552121",
    "email": "kbrown@somewhere.com",
    "role": "Customer",
    "revNum": 1
  },
  {
    "id": "cus-108",
    "username": "ldavies",
    "firstName": "Larry",
    "lastName": "Davies",
    "locationId": "loc-8",
    "mobile": "+16505067000",
    "home": "+15105552121",
    "email": "ldavies@somewhere.com",
    "role": "Customer",
    "revNum": 1
  },
  {
    "id": "cus-109",
    "username": "tthomas",
    "firstName": "Ted",
    "lastName": "Thomas",
    "locationId": "loc-9",
    "mobile": "+16505067000",
    "home": "+15105552121",
    "email": "tthomas@somewhere.com",
    "role": "Customer",
    "revNum": 1
  },
  {
    "id": "cus-110",
    "username": "bthompson",
    "firstName": "Bruce",
    "lastName": "Thompson",
    "locationId": "loc-10",
    "mobile": "+16505067000",
    "home": "+15105552121",
    "email": "bthompson@somewhere.com",
    "role": "Customer",
    "revNum": 1
  },
  {
    "id": "cus-111",
    "username": "jling",
    "firstName": "Jini",
    "lastName": "Ling",
    "locationId": "loc-11",
    "mobile": "+16505067000",
    "home": "+15105552121",
    "email": "jling@somewhere.com",
    "role": "Customer",
    "revNum": 1
  },
  {
    "id": "cus-112",
    "username": "jstevens",
    "firstName": "Jennifer",
    "lastName": "Stevens",
    "locationId": "loc-12",
    "mobile": "+16505067000",
    "home": "+15105552121",
    "email": "jstevens@somewhere.com",
    "role": "Customer",
    "revNum": 1
  },
  {
    "id": "cus-113",
    "username": "skapoor",
    "firstName": "Srini",
    "lastName": "Kapoor",
    "locationId": "loc-13",
    "mobile": "+16505067000",
    "home": "+15105552121",
    "email": "skapoor@somewhere.com",
    "role": "Customer",
    "revNum": 1
  },
  {
    "id": "cus-114",
    "username": "mdsouza",
    "firstName": "Mark",
    "lastName": "DSouza",
    "locationId": "loc-14",
    "mobile": "+16505067000",
    "home": "+15105552121",
    "email": "mdsouza@somewhere.com",
    "role": "Customer",
    "revNum": 1
  },
  {
    "id": "cus-115",
    "username": "jjackson",
    "firstName": "Jamal",
    "lastName": "Jackson",
    "locationId": "loc-15",
    "mobile": "+16505067000",
    "home": "+15105552121",
    "email": "jjackson@somewhere.com",
    "role": "Customer",
    "revNum": 1
  }
];

var customersRevNum = 1;
var original_customers = _cloneObject(customers);

/**
 * List of locations.
 *
 * @type {*[]}
 */
var locations = [
  {
    "id": "loc-0",
    "formattedAddress": "200 Oracle Parkway, Redwood Shores, CA 94065 USA",
    "street1": "200 Oracle Parkway",
    "street2": "",
    "city": "Redwood Shores",
    "state": "CA",
    "zip": "94065",
    "country": "USA",
    "latitude": "37.530737",
    "longitude": "-122.265557",
    "revNum": 1
  },
  {
    "id": "loc-1",
    "formattedAddress": "100 Main Street, San Francisco, CA 94135 USA",
    "street1": "100 Main Street",
    "street2": "",
    "city": "San Francisco",
    "state": "CA",
    "zip": "94135",
    "country": "USA",
    "latitude": "37.791826",
    "longitude": "-122.394953",
    "revNum": 1
  },
  {
    "id": "loc-2",
    "formattedAddress": "300 Second Street, Fremont, CA 94536 USA",
    "street1": "300 Second Street",
    "street2": "",
    "city": "Fremont",
    "state": "CA",
    "zip": "94536",
    "country": "USA",
    "latitude": "37.552713",
    "longitude": "-121.994713",
    "revNum": 1
  },
  {
    "id": "loc-3",
    "formattedAddress": "200 First Street, Livermore, CA 94566 USA",
    "street1": "200 First Street",
    "street2": "",
    "city": "Livermore",
    "state": "CA",
    "zip": "94566",
    "country": "USA",
    "latitude": "37.660406",
    "longitude": "-121.876038",
    "revNum": 1
  },
  {
    "id": "loc-4",
    "formattedAddress": "100 Park Street, Alameda, CA 94501 USA",
    "street1": "100 Park Street",
    "street2": "",
    "city": "Alameda",
    "state": "CA",
    "zip": "94501",
    "country": "USA",
    "latitude": "37.763389",
    "longitude": "-122.243514",
    "revNum": 1
  },
  {
    "id": "loc-5",
    "formattedAddress": "4500 Broadway, Oakland, CA 94611 USA",
    "street1": "4500 Broadway",
    "street2": "",
    "city": "Oakland",
    "state": "CA",
    "zip": "94611",
    "country": "USA",
    "latitude": "37.832892",
    "longitude": "-122.253260",
    "revNum": 1
  },
  {
    "id": "loc-6",
    "formattedAddress": "4226 Piedmont Ave, Oakland, CA 94611 USA",
    "street1": "4226 Piedmont Ave",
    "street2": "",
    "city": "Oakland",
    "state": "CA",
    "zip": "94611",
    "country": "USA",
    "latitude": "37.827911",
    "longitude": "-122.249982",
    "revNum": 1
  },
  {
    "id": "loc-7",
    "formattedAddress": "5655 College Ave, Oakland, CA 94618 USA",
    "street1": "5655 College Ave",
    "street2": "",
    "city": "Oakland",
    "state": "CA",
    "zip": "94618",
    "country": "USA",
    "latitude": "37.843693",
    "longitude": "-122.251890",
    "revNum": 1
  },
  {
    "id": "loc-8",
    "formattedAddress": "1200 University Ave, Berkeley, CA 94702 USA",
    "street1": "1200 University Ave",
    "street2": "",
    "city": "Berkeley",
    "state": "CA",
    "zip": "94702",
    "country": "USA",
    "latitude": "37.869368",
    "longitude": "-122.289508",
    "revNum": 1
  },
  {
    "id": "loc-9",
    "formattedAddress": "2100 Ward Street, Berkeley, CA 94702 USA",
    "street1": "2100 Ward Street",
    "street2": "",
    "city": "Berkeley",
    "state": "CA",
    "zip": "94702",
    "country": "USA",
    "latitude": "37.859333",
    "longitude": "-122.266792",
    "revNum": 1
  },
  {
    "id": "loc-10",
    "formattedAddress": "2181 Shattuck Avenue, Berkeley, CA 94702 USA",
    "street1": "2181 Shattuck Avenue",
    "street2": "",
    "city": "Berkeley",
    "state": "CA",
    "zip": "94702",
    "country": "USA",
    "latitude": "37.869801",
    "longitude": "-122.267527",
    "revNum": 1
  },
  {
    "id": "loc-11",
    "formattedAddress": "1200 Shattuck Avenue, Berkeley, CA 94702 USA",
    "street1": "1200 Shattuck Avenue",
    "street2": "",
    "city": "Berkeley",
    "state": "CA",
    "zip": "94702",
    "country": "USA",
    "latitude": "37.869801",
    "longitude": "-122.267527",
    "revNum": 1
  },
  {
    "id": "loc-12",
    "formattedAddress": "5655 College Ave, Oakland, CA 94618 USA",
    "street1": "5655 College Ave",
    "street2": "",
    "city": "Oakland",
    "state": "CA",
    "zip": "94618",
    "country": "USA",
    "latitude": "37.843693",
    "longitude": "-122.251890",
    "revNum": 1
  },
  {
    "id": "loc-13",
    "formattedAddress": "4226 Piedmont Ave, Oakland, CA 94611 USA",
    "street1": "4226 Piedmont Ave",
    "street2": "",
    "city": "Oakland",
    "state": "CA",
    "zip": "94611",
    "country": "USA",
    "latitude": "37.827911",
    "longitude": "-122.249982",
    "revNum": 1
  },
  {
    "id": "loc-14",
    "formattedAddress": "100 Main Street, San Francisco, CA 94135 USA",
    "street1": "100 Main Street",
    "street2": "",
    "city": "San Francisco",
    "state": "CA",
    "zip": "94135",
    "country": "USA",
    "latitude": "37.791826",
    "longitude": "-122.394953",
    "revNum": 1
  },
  {
    "id": "loc-15",
    "formattedAddress": "300 Second Street, Fremont, CA 94536 USA",
    "street1": "300 Second Street",
    "street2": "",
    "city": "Fremont",
    "state": "CA",
    "zip": "94536",
    "country": "USA",
    "latitude": "37.552713",
    "longitude": "-121.994713",
    "revNum": 1
  }

];

var original_locations = _cloneObject(locations);


/**
 * incidents <--> (1..1) technicians (technicianUsername) - technician assigned to it.
 * incidents <--> (1..1) customers (customerId) - customer reporting incident
 * incidents <--> (1..1) locations (locationId) - where incident occurred
 * @type {*[]}
 */
var incidents = [
  {
    "id": "inc-101",
    "problem": "Leaky Water Heater",
    "description": "water heater leaks water incessantly",
    "category": "plumbing",
    "picture": null,
    "status": "open",
    "priority": "high",
    "createdOn": "2016-07-25T09:00:41+00:00",
    "lastUpdatedOn": "",
    "customerId": "cus-104",
    "_technicianUsername": "hcr",
    "locationId": "loc-4",
    "read": true,
    "revNum": 1,
    "activitiesRevNum": 1
  },
  {
    "id": "inc-102",
    "problem": "Fridge is broken",
    "description": "The thermostat appears to not be working.",
    "category": "appliance",
    "picture": null,
    "status": "accepted",
    "priority": "low",
    "createdOn": "2016-07-18T09:00:41+00:00",
    "lastUpdatedOn": "2016-07-19T09:00:41+00:00",
    "customerId": "cus-103",
    "_technicianUsername": "hcr",
    "locationId": "loc-3",
    "read": true,
    "revNum": 1,
    "activitiesRevNum": 1
  },
  {
    "id": "inc-103",
    "problem": "Noises coming from heater",
    "description": "Noises coming from inside the tank",
    "category": "heatingcooling",
    "picture": null,
    "status": "closed",
    "priority": "normal",
    "createdOn": "2016-07-15T09:00:41+00:00",
    "lastUpdatedOn": "2016-07-31T09:00:41+00:00",
    "customerId": "cus-112",
    "_technicianUsername": "fred",
    "locationId": "loc-12",
    "read": true,
    "revNum": 1,
    "activitiesRevNum": 1
  },
  {
    "id": "inc-104",
    "problem": "Water leak on main line",
    "description": "Yard and basement are flooded",
    "category": "plumbing",
    "picture": null,
    "status": "open",
    "priority": "high",
    "createdOn": "2016-07-13T09:00:41+00:00",
    "lastUpdatedOn": "",
    "customerId": "cus-104",
    "_technicianUsername": "charlie",
    "locationId": "loc-4",
    "read": true,
    "revNum": 1,
    "activitiesRevNum": 1
  },
  {
    "id": "inc-105",
    "problem": "Dishwasher leaking",
    "description": "Water leakage observed under kitchen sink and back wall",
    "category": "appliance",
    "picture": null,
    "status": "accepted",
    "priority": "normal",
    "createdOn": "2016-07-25T09:00:41+00:00",
    "lastUpdatedOn": "2016-07-31T09:00:41+00:00",
    "customerId": "cus-103",
    "_technicianUsername": "hcr",
    "locationId": "loc-3",
    "read": true,
    "revNum": 1,
    "activitiesRevNum": 1
  },
  {
    "id": "inc-106",
    "problem": "Water temperature problems in heater",
    "description": "Have no hot water – the heating element (electric) is probably not working",
    "category": "heatingcooling",
    "picture": null,
    "status": "closed",
    "priority": "low",
    "createdOn": "2016-07-05T09:00:41+00:00",
    "lastUpdatedOn": "2016-07-13T09:00:41+00:00",
    "customerId": "cus-104",
    "_technicianUsername": "fred",
    "locationId": "loc-4",
    "read": true,
    "revNum": 1,
    "activitiesRevNum": 1
  },
  {
    "id": "inc-107",
    "problem": "Water main shutoff issue",
    "description": "The shut-off valve appears to be sealed shut and not budging",
    "category": "plumbing",
    "picture": null,
    "status": "open",
    "priority": "normal",
    "createdOn": "2016-07-10T09:00:41+00:00",
    "lastUpdatedOn": "",
    "customerId": "cus-112",
    "_technicianUsername": "charlie",
    "locationId": "loc-12",
    "read": true,
    "revNum": 1,
    "activitiesRevNum": 1
  },
  {
    "id": "inc-108",
    "problem": "Pipe burst in cafeteria",
    "description": "The cafeteria is flooded, and unusable. Situation needs to be fixed soon",
    "category": "plumbing",
    "picture": null,
    "status": "accepted",
    "priority": "high",
    "createdOn": "2016-07-12T09:00:41+00:00",
    "lastUpdatedOn": "2016-07-23T09:00:41+00:00",
    "customerId": "cus-112",
    "_technicianUsername": "hcr",
    "locationId": "loc-12",
    "read": true,
    "revNum": 1,
    "activitiesRevNum": 1
  },
  {
    "id": "inc-109",
    "problem": "Water tasting funny",
    "description": "Smell gas in water supply.",
    "category": "plumbing",
    "picture": null,
    "status": "closed",
    "priority": "normal",
    "createdOn": "2016-06-25T09:00:41+00:00",
    "lastUpdatedOn": "2016-08-01T09:00:41+00:00",
    "customerId": "cus-111",
    "_technicianUsername": "charlie",
    "locationId": "loc-11",
    "read": true,
    "revNum": 1,
    "activitiesRevNum": 1
  },
  {
    "id": "inc-110",
    "problem": "Carpet is flooded",
    "description": "Leak possibly from water radiant floor heating system",
    "category": "plumbing",
    "picture": null,
    "status": "open",
    "priority": "high",
    "createdOn": "2016-06-20T09:00:41+00:00",
    "lastUpdatedOn": "",
    "customerId": "cus-113",
    "_technicianUsername": "charlie",
    "locationId": "loc-13",
    "read": true,
    "revNum": 1,
    "activitiesRevNum": 1
  },
  {
    "id": "inc-111",
    "problem": "Carpet not installed properly",
    "description": "New carpet installed last week is coming apart at the seams",
    "category": "general",
    "picture": null,
    "status": "accepted",
    "priority": "normal",
    "createdOn": "2016-06-11T09:00:41+00:00",
    "lastUpdatedOn": "2016-07-01T09:00:41+00:00",
    "customerId": "cus-113",
    "_technicianUsername": "hcr",
    "locationId": "loc-13",
    "read": true,
    "revNum": 1,
    "activitiesRevNum": 1
  },
  {
    "id": "inc-112",
    "problem": "Noisy washing machine",
    "description": "Machine makes loud noises and rattles during rinse cycle",
    "category": "appliance",
    "picture": null,
    "status": "closed",
    "priority": "low",
    "createdOn": "2016-07-01T09:00:41+00:00",
    "lastUpdatedOn": "2016-08-02T09:00:41+00:00",
    "customerId": "cus-114",
    "_technicianUsername": "fred",
    "locationId": "loc-14",
    "read": true,
    "revNum": 1,
    "activitiesRevNum": 1
  },
  {
    "id": "inc-113",
    "problem": "Washing machine does not clean clothes",
    "description": "The agitator does not work in the washing machine leaving clothes unclean",
    "category": "appliance",
    "picture": null,
    "status": "open",
    "priority": "normal",
    "createdOn": "2016-06-02T09:00:41+00:00",
    "lastUpdatedOn": "",
    "customerId": "cus-114",
    "_technicianUsername": "charlie",
    "locationId": "loc-14",
    "read": true,
    "revNum": 1,
    "activitiesRevNum": 1
  },
  {
    "id": "inc-114",
    "problem": "Carpet is shedding",
    "description": "Newly installed carpet sheds like crazy and is a trip hazard",
    "picture": null,
    "category": "general",
    "status": "accepted",
    "priority": "low",
    "createdOn": "2016-08-01T09:00:41+00:00",
    "lastUpdatedOn": "2016-08-04T09:00:41+00:00",
    "customerId": "cus-113",
    "_technicianUsername": "hcr",
    "locationId": "loc-13",
    "read": true,
    "revNum": 1,
    "activitiesRevNum": 1
  },
  {
    "id": "inc-115",
    "problem": "Carpet sucks",
    "description": "It stains too easily, aged way too fast, among other problems",
    "category": "general",
    "picture": null,
    "status": "open",
    "priority": "low",
    "createdOn": "2016-07-05T09:00:41+00:00",
    "lastUpdatedOn": "",
    "customerId": "cus-113",
    "_technicianUsername": "rosie",
    "locationId": "loc-13",
    "read": true,
    "revNum": 1,
    "activitiesRevNum": 1
  },
  {
    "id": "inc-116",
    "problem": "Carpet glue smells real bad",
    "description": "installed carpet about 2 weeks ago, but still smell the glue!",
    "category": "general",
    "picture": null,
    "status": "accepted",
    "priority": "normal",
    "createdOn": "2016-07-15T09:00:41+00:00",
    "lastUpdatedOn": "2016-07-19T09:00:41+00:00",
    "customerId": "cus-114",
    "_technicianUsername": "rosie",
    "locationId": "loc-14",
    "read": true,
    "revNum": 1,
    "activitiesRevNum": 1
  },
  {
    "id": "inc-117",
    "problem": "Carpet quality extremely poor",
    "description": "carpet is shedding fibers and is a hazard to pet",
    "category": "general",
    "picture": null,
    "status": "open",
    "priority": "high",
    "createdOn": "2016-07-31T09:00:41+00:00",
    "lastUpdatedOn": "2016-08-03T09:00:41+00:00",
    "customerId": "cus-114",
    "_technicianUsername": "rosie",
    "locationId": "loc-14",
    "read": true,
    "revNum": 1,
    "activitiesRevNum": 1
  },
  {
    "id": "inc-118",
    "problem": "Newly installed carpet moldy",
    "description": "installed carpet appears to be moldy as the subfloor is not dry",
    "category": "general",
    "picture": null,
    "status": "accepted",
    "priority": "high",
    "createdOn": "2016-08-03T09:00:41+00:00",
    "lastUpdatedOn": "2016-08-04T09:00:41+00:00",
    "customerId": "cus-111",
    "_technicianUsername": "rosie",
    "locationId": "loc-11",
    "read": true,
    "revNum": 1,
    "activitiesRevNum": 1
  },
  {
    "id": "inc-119",
    "problem": "Water heater shuts off when in use",
    "description": "hot water stops in the middle of showering!",
    "category": "plumbing",
    "picture": null,
    "status": "open",
    "priority": "normal",
    "createdOn": "2016-07-04T09:00:41+00:00",
    "lastUpdatedOn": "",
    "customerId": "cus-103",
    "_technicianUsername": "fred",
    "locationId": "loc-3",
    "read": true,
    "revNum": 1,
    "activitiesRevNum": 1
  },
  {
    "id": "inc-120",
    "problem": "water heater needs to be insulated",
    "description": "technician forgot to wrap new heater in insulation",
    "category": "plumbing",
    "picture": null,
    "status": "open",
    "priority": "low",
    "createdOn": "2016-06-11T09:00:41+00:00",
    "lastUpdatedOn": "",
    "customerId": "cus-103",
    "_technicianUsername": "fred",
    "locationId": "loc-3",
    "read": true,
    "revNum": 1,
    "activitiesRevNum": 1
  },
  {
    "id": "inc-121",
    "problem": "clothes in dryer are scalding hot!",
    "description": "despite a clean lint filter clothes are coming out too hot. potential liability",
    "category": "appliance",
    "picture": null,
    "status": "open",
    "priority": "high",
    "createdOn": "2016-08-03T09:00:41+00:00",
    "lastUpdatedOn": "",
    "customerId": "cus-103",
    "_technicianUsername": "hcr",
    "locationId": "loc-3",
    "read": true,
    "revNum": 1,
    "activitiesRevNum": 1
  }
];

var incidentsRevNum = 1;
var original_incidents = _cloneObject(incidents);

var unread_incident_count = 0;


/* Dummy photo for incident activites */
var broken_water_heater = "data:image/jpeg;base64,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";

/**
 * Incident Activities.
 * incident (incidentId) <--> (1..m) activities - multiple activity records for an incident
 * @type {Array}
 */
var incidentActivities = [
  {
    "id": "act-101",
    "incidentId": "inc-101",
    "comment": "Leaky Water Heater",
    "picture": broken_water_heater,
    "createdOn": "2016-07-25T09:00:41+00:00",
    "customerId": "cus-104",
    "revNum": 1
  },
  {
    "id": "act-102",
    "incidentId": "inc-101",
    "comment": "Status changed to accepted. Technician will respond within 24 hours.",
    "picture": null,
    "createdOn": "2016-07-25T13:00:00+00:00",
    "_technicianUsername": "hcr",
    "revNum": 1
  },
  {
    "id": "act-103",
    "incidentId": "inc-101",
    "comment": "Called customer to schedule visit",
    "picture": null,
    "createdOn": "2016-07-26T09:15:00+00:00",
    "_technicianUsername": "hcr",
    "revNum": 1
  },
  {
    "id": "act-104",
    "incidentId": "inc-102",
    "comment": "Fridge is utterly broken!",
    "picture": broken_water_heater,
    "createdOn": "2016-07-18T09:00:41+00:00",
    "customerId": "cus-103",
    "revNum": 1
  },
  {
    "id": "act-105",
    "incidentId": "inc-102",
    "comment": "Status changed to accepted. Technician will respond within 48 hours.",
    "picture": null,
    "createdOn": "2016-07-19T13:00:00+00:00",
    "_technicianUsername": "hcr",
    "revNum": 1
  },
  {
    "id": "act-106",
    "incidentId": "inc-102",
    "comment": "Enroute to customer location",
    "picture": null,
    "createdOn": "2016-07-19T09:15:00+00:00",
    "_technicianUsername": "hcr",
    "revNum": 1
  },
  {
    "id": "act-107",
    "incidentId": "inc-103",
    "comment": "No response for last 15 days! Plan to report to BBB",
    "picture": null,
    "createdOn": "2016-07-30T09:15:00+00:00",
    "customerId": "cus-112",
    "revNum": 1
  },
  {
    "id": "act-108",
    "incidentId": "inc-103",
    "comment": "Incident Accepted. Will respond in 24 hours.",
    "picture": null,
    "createdOn": "2016-07-31T09:15:00+00:00",
    "_technicianUsername": "fred",
    "revNum": 1
  },
  {
    "id": "act-109",
    "incidentId": "inc-103",
    "comment": "Incident Fixed. Loose bolt in water heater",
    "picture": null,
    "createdOn": "2016-07-31T09:15:00+00:00",
    "_technicianUsername": "fred",
    "revNum": 1
  },

  {
    "id": "act-110",
    "incidentId": "inc-104",
    "comment": "Severe water damamge in basement. SOS!",
    "picture": broken_water_heater,
    "createdOn": "2016-07-13T09:15:00+00:00",
    "customerId": "cus-104",
    "revNum": 1
  },

  {
    "id": "act-111",
    "incidentId": "inc-105",
    "comment": "Incident Accepted. Will respond in 24 hours.",
    "picture": null,
    "createdOn": "2016-07-25T09:15:00+00:00",
    "_technicianUsername": "hcr",
    "revNum": 1
  },
  {
    "id": "act-112",
    "incidentId": "inc-105",
    "comment": "Visited client location. Dishwasher needs new part.",
    "picture": null,
    "createdOn": "2016-07-31T09:15:00+00:00",
    "_technicianUsername": "hcr",
    "revNum": 1
  },

  {
    "id": "act-113",
    "incidentId": "inc-106",
    "comment": "Incident Accepted. Will respond in 24 hours.",
    "picture": null,
    "createdOn": "2016-07-13T09:15:00+00:00",
    "_technicianUsername": "fred",
    "revNum": 1
  },
  {
    "id": "act-114",
    "incidentId": "inc-106",
    "comment": "Incident Fixed. Temperature Gauge Malfunction.",
    "picture": null,
    "createdOn": "2016-07-31T09:35:00+00:00",
    "_technicianUsername": "fred",
    "revNum": 1
  },

  {
    "id": "act-115",
    "incidentId": "inc-107",
    "comment": "Technician failed to open main water valve!",
    "picture": null,
    "createdOn": "2016-07-10T09:15:00+00:00",
    "customerId": "cus-112",
    "revNum": 1
  },

  {
    "id": "act-116",
    "incidentId": "inc-108",
    "comment": "Incident Accepted. Will respond in 24 hours.",
    "picture": null,
    "createdOn": "2016-07-12T09:15:00+00:00",
    "_technicianUsername": "hcr",
    "revNum": 1
  },
  {
    "id": "act-117",
    "incidentId": "inc-108",
    "comment": "Installed temporary valve to arrest leak. Need new pipe installed.",
    "picture": null,
    "createdOn": "2016-07-23T09:15:00+00:00",
    "_technicianUsername": "hcr",
    "revNum": 1
  },

  {
    "id": "act-118",
    "incidentId": "inc-109",
    "comment": "Incident Accepted. Will respond in 24 hours.",
    "picture": null,
    "createdOn": "2016-06-25T09:15:00+00:00",
    "_technicianUsername": "charlie",
    "revNum": 1
  },
  {
    "id": "act-119",
    "incidentId": "inc-109",
    "comment": "Incident Fixed. Customer no longer smells gas.",
    "picture": null,
    "createdOn": "2016-08-01T09:35:00+00:00",
    "_technicianUsername": "charlie",
    "revNum": 1
  },

  {
    "id": "act-120",
    "incidentId": "inc-110",
    "comment": "Radiant floor heating faulty. Carpet is damp!",
    "picture": null,
    "createdOn": "2016-06-20T09:15:00+00:00",
    "customerId": "cus-113",
    "revNum": 1
  },

  {
    "id": "act-121",
    "incidentId": "inc-111",
    "comment": "Incident Accepted. Will respond in 24 hours.",
    "picture": null,
    "createdOn": "2016-06-11T09:15:00+00:00",
    "_technicianUsername": "hcr",
    "revNum": 1
  },
  {
    "id": "act-122",
    "incidentId": "inc-111",
    "comment": "Technician brought faulty replacement and did a half-baked job!!",
    "picture": null,
    "createdOn": "2016-07-01T09:15:00+00:00",
    "customerId": "cus-113",
    "revNum": 1
  },

  {
    "id": "act-123",
    "incidentId": "inc-112",
    "comment": "Incident Accepted. Will respond in 24 hours.",
    "picture": null,
    "createdOn": "2016-08-01T09:15:00+00:00",
    "_technicianUsername": "fred",
    "revNum": 1
  },
  {
    "id": "act-124",
    "incidentId": "inc-112",
    "comment": "Incident Fixed. Customer likely overloading washer. Recommended reducing load.",
    "picture": null,
    "createdOn": "2016-08-02T09:15:00+00:00",
    "_technicianUsername": "fred",
    "revNum": 1
  },

  {
    "id": "act-125",
    "incidentId": "inc-114",
    "comment": "Incident Accepted. Will respond in 24 hours.",
    "picture": null,
    "createdOn": "2016-08-02T09:15:00+00:00",
    "_technicianUsername": "hcr",
    "revNum": 1
  },
  {
    "id": "act-126",
    "incidentId": "inc-114",
    "comment": "Customer asked to reorder new carpet to replace faulty carpet",
    "picture": null,
    "createdOn": "2016-08-04T09:15:00+00:00",
    "_technicianUsername": "hcr",
    "revNum": 1
  },

  {
    "id": "act-127",
    "incidentId": "inc-116",
    "comment": "Incident Accepted. Will respond in 24 hours.",
    "picture": null,
    "createdOn": "2016-07-15T09:15:00+00:00",
    "_technicianUsername": "rosie",
    "revNum": 1
  },
  {
    "id": "act-128",
    "incidentId": "inc-116",
    "comment": "Sub-standard glue is not acceptable!! Carpet continues to unravel",
    "picture": null,
    "createdOn": "2016-07-19T09:15:00+00:00",
    "customerId": "cus-114",
    "revNum": 1
  },

  {
    "id": "act-129",
    "incidentId": "inc-117",
    "comment": "Incident Accepted. Will respond in 24 hours.",
    "picture": null,
    "createdOn": "2016-08-03T09:15:00+00:00",
    "_technicianUsername": "rosie",
    "revNum": 1
  },

  {
    "id": "act-130",
    "incidentId": "inc-118",
    "comment": "Incident Accepted. Will respond in 24 hours.",
    "picture": null,
    "createdOn": "2016-08-03T09:15:00+00:00",
    "_technicianUsername": "rosie",
    "revNum": 1
  },
  {
    "id": "act-131",
    "incidentId": "inc-118",
    "comment": "Customer was not present at the location. Unable to fix issue.",
    "picture": null,
    "createdOn": "2016-08-04T09:15:00+00:00",
    "_technicianUsername": "rosie",
    "revNum": 1
  },
  {
    "id": "act-132",
    "incidentId": "inc-120",
    "comment": "Water heater technician failed to insulate heater as per agreement.",
    "picture": broken_water_heater,
    "createdOn": "2016-06-11T09:15:00+00:00",
    "customerId": "cus-103",
    "revNum": 1
  },
  {
    "id": "act-133",
    "incidentId": "inc-121",
    "comment": "Incident Accepted. Will respond in 24 hours.",
    "picture": null,
    "createdOn": "2016-08-03T09:15:00+00:00",
    "customerId": "cus-103",
    "revNum": 1
  }
];

var original_incidentActivities = _cloneObject(incidentActivities);

var collectionObjects = {};

/**
 * Standard Headshots
 *
 */
var headshots_base64 = {
  "f1": "/9j/4AAQSkZJRgABAQAASABIAAD/4QCARXhpZgAATU0AKgAAAAgABQESAAMAAAABAAEAAAEaAAUAAAABAAAASgEbAAUAAAABAAAAUgEoAAMAAAABAAIAAIdpAAQAAAABAAAAWgAAAAAAAABIAAAAAQAAAEgAAAABAAKgAgAEAAAAAQAAAMigAwAEAAAAAQAAAMgAAAAA/+EJIWh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8APD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iWE1QIENvcmUgNS40LjAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIi8+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPD94cGFja2V0IGVuZD0idyI/PgD/7QA4UGhvdG9zaG9wIDMuMAA4QklNBAQAAAAAAAA4QklNBCUAAAAAABDUHYzZjwCyBOmACZjs+EJ+/+IM5ElDQ19QUk9GSUxFAAEBAAAM1GFwcGwCEAAAbW50clJHQiBYWVogB+AABQAJAAoAGQAkYWNzcEFQUEwAAAAAQVBQTAAAAAAAAAAAAAAAAAAAAAAAAPbWAAEAAAAA0y1hcHBsAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAARZGVz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",
  "f2": "/9j/4AAQSkZJRgABAQAASABIAAD/4QCARXhpZgAATU0AKgAAAAgABQESAAMAAAABAAEAAAEaAAUAAAABAAAASgEbAAUAAAABAAAAUgEoAAMAAAABAAIAAIdpAAQAAAABAAAAWgAAAAAAAABIAAAAAQAAAEgAAAABAAKgAgAEAAAAAQAAAMigAwAEAAAAAQAAAMgAAAAA/+EJIWh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8APD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iWE1QIENvcmUgNS40LjAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIi8+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPD94cGFja2V0IGVuZD0idyI/PgD/7QA4UGhvdG9zaG9wIDMuMAA4QklNBAQAAAAAAAA4QklNBCUAAAAAABDUHYzZjwCyBOmACZjs+EJ+/+IM5ElDQ19QUk9GSUxFAAEBAAAM1GFwcGwCEAAAbW50clJHQiBYWVogB+AABQAJAAoAGQAkYWNzcEFQUEwAAAAAQVBQTAAAAAAAAAAAAAAAAAAAAAAAAPbWAAEAAAAA0y1hcHBsAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAARZGVz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",

  "m1": "/9j/4AAQSkZJRgABAQAASABIAAD/4QCARXhpZgAATU0AKgAAAAgABQESAAMAAAABAAEAAAEaAAUAAAABAAAASgEbAAUAAAABAAAAUgEoAAMAAAABAAIAAIdpAAQAAAABAAAAWgAAAAAAAABIAAAAAQAAAEgAAAABAAKgAgAEAAAAAQAAAMigAwAEAAAAAQAAAMgAAAAA/+EJIWh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8APD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iWE1QIENvcmUgNS40LjAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIi8+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPD94cGFja2V0IGVuZD0idyI/PgD/7QA4UGhvdG9zaG9wIDMuMAA4QklNBAQAAAAAAAA4QklNBCUAAAAAABDUHYzZjwCyBOmACZjs+EJ+/+IM5ElDQ19QUk9GSUxFAAEBAAAM1GFwcGwCEAAAbW50clJHQiBYWVogB+AABQAJAAoAGQAkYWNzcEFQUEwAAAAAQVBQTAAAAAAAAAAAAAAAAAAAAAAAAPbWAAEAAAAA0y1hcHBsAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAARZGVz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",
  "m2": "/9j/4AAQSkZJRgABAQAASABIAAD/4QCARXhpZgAATU0AKgAAAAgABQESAAMAAAABAAEAAAEaAAUAAAABAAAASgEbAAUAAAABAAAAUgEoAAMAAAABAAIAAIdpAAQAAAABAAAAWgAAAAAAAABIAAAAAQAAAEgAAAABAAKgAgAEAAAAAQAAAMigAwAEAAAAAQAAAMgAAAAA/+EJIWh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8APD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iWE1QIENvcmUgNS40LjAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIi8+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPD94cGFja2V0IGVuZD0idyI/PgD/7QA4UGhvdG9zaG9wIDMuMAA4QklNBAQAAAAAAAA4QklNBCUAAAAAABDUHYzZjwCyBOmACZjs+EJ+/+IM5ElDQ19QUk9GSUxFAAEBAAAM1GFwcGwCEAAAbW50clJHQiBYWVogB+AABQAJAAoAGQAkYWNzcEFQUEwAAAAAQVBQTAAAAAAAAAAAAAAAAAAAAAAAAPbWAAEAAAAA0y1hcHBsAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAARZGVz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",
  "m3": "/9j/4AAQSkZJRgABAQAASABIAAD/4QCARXhpZgAATU0AKgAAAAgABQESAAMAAAABAAEAAAEaAAUAAAABAAAASgEbAAUAAAABAAAAUgEoAAMAAAABAAIAAIdpAAQAAAABAAAAWgAAAAAAAABIAAAAAQAAAEgAAAABAAKgAgAEAAAAAQAAAMigAwAEAAAAAQAAAMgAAAAA/+EJIWh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8APD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iWE1QIENvcmUgNS40LjAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIi8+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPD94cGFja2V0IGVuZD0idyI/PgD/7QA4UGhvdG9zaG9wIDMuMAA4QklNBAQAAAAAAAA4QklNBCUAAAAAABDUHYzZjwCyBOmACZjs+EJ+/+IM5ElDQ19QUk9GSUxFAAEBAAAM1GFwcGwCEAAAbW50clJHQiBYWVogB+AABQAJAAoAGQAkYWNzcEFQUEwAAAAAQVBQTAAAAAAAAAAAAAAAAAAAAAAAAPbWAAEAAAAA0y1hcHBsAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAARZGVz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",
  "m4": "/9j/4AAQSkZJRgABAQAASABIAAD/4QCARXhpZgAATU0AKgAAAAgABQESAAMAAAABAAEAAAEaAAUAAAABAAAASgEbAAUAAAABAAAAUgEoAAMAAAABAAIAAIdpAAQAAAABAAAAWgAAAAAAAABIAAAAAQAAAEgAAAABAAKgAgAEAAAAAQAAAMigAwAEAAAAAQAAAMgAAAAA/+EJIWh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8APD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iWE1QIENvcmUgNS40LjAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIi8+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPD94cGFja2V0IGVuZD0idyI/PgD/7QA4UGhvdG9zaG9wIDMuMAA4QklNBAQAAAAAAAA4QklNBCUAAAAAABDUHYzZjwCyBOmACZjs+EJ+/+IM5ElDQ19QUk9GSUxFAAEBAAAM1GFwcGwCEAAAbW50clJHQiBYWVogB+AABQAJAAoAGQAkYWNzcEFQUEwAAAAAQVBQTAAAAAAAAAAAAAAAAAAAAAAAAPbWAAEAAAAA0y1hcHBsAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAARZGVz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"
};
