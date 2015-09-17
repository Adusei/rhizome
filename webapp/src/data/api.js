/* jshint browser: true */
/* global Promise */
'use strict';

var BASE_URL = '/api';

var _ = require('lodash');
var request = require('superagent');
var prefix = require('superagent-prefix')(BASE_URL);

var treeify = require('../data/transform/treeify');
var campaign = require('../data/model/campaign');

function urlencode(query) {
  return '?' + _.map(query, function (v, k) {
      return encodeURIComponent(k) + '=' + encodeURIComponent(v);
    }).join('&');
}

function getCookie(name) {
  var cookieValue = null;
  if (document.cookie && document.cookie !== '') {
    var cookies = document.cookie.split(';');
    for (var i = 0; i < cookies.length; i++) {
      var cookie = cookies[i];//jQuery.trim(cookies[i]);
      // Does this cookie string begin with the name we want?
      if (cookie.substring(0, name.length + 1) === (name + '=')) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}

function endPoint(path, mode, defaultVersion, useDefaults) {
  mode = (mode) ? mode.toUpperCase() : 'GET';
  defaultVersion = defaultVersion || 1;
  useDefaults = _.isUndefined(useDefaults) ? true : useDefaults;

  var defaults = {
    format: 'json',
  };


  function fetch(query, version, headers) {
    version = version || defaultVersion;
    headers = headers || {};

    var versionedPath = '/v' + version + path;
    var req = prefix(request(mode, versionedPath));

    // form GET request
    if (mode === 'GET') {
      var q = useDefaults ? _.defaults({}, query, defaults) : query;
      req.query(q)
        .set(headers)
        .send();
    }
    // form POST request
    else if (mode === 'POST') {
      var csrftoken = getCookie('csrftoken');
      req.query(defaults)
        .set('X-CSRFToken', csrftoken)
        .set('Content-Type', 'application/x-www-form-urlencoded')
        .send(query);
    }

    return new Promise(function (fulfill, reject) {
      req.end(function (error, res) {
        if (error) {
          reject({
            status: res.status,
            msg: res.body.error
          });
        } else {
          fulfill({
            meta: res.body.meta || {},
            objects: _.isArray(res.body) ?
              res.body :
            res.body.objects || _.omit(res.body, 'meta')
          });
        }
      });
    });
  }

  fetch.toString = function (query, version) {
    version = version || defaultVersion;
    var versionedPath = '/v' + version + path;

    return BASE_URL + versionedPath + urlencode(_.defaults({}, query, defaults));
  };

  return fetch;
}

function datapoint(q) {
  var fetch = endPoint('/datapoint/');

  // Return a promise so we can chain the requests for datapoints with the
  // campaign lookups.
  return new Promise(function (fulfill, reject) {

    // Fetch datapoints first, then look up the campaigns. Once campaign data
    // has been filled in, fulfill the promise.

    fetch(q).then(function (data) {
      var campaigns = data.objects.map(function (d) {
        return d.campaign;
      });

      endPoint('/campaign/', 'get', 1)({
        id__in: _.uniq(campaigns)
      }).then(function (campaignData) {
        var campaigns = _.indexBy(campaignData.objects, 'id');

        // Replace the campaign IDs with campaign objects
        for (var i = data.objects.length - 1; i >= 0; --i) {
          data.objects[i].campaign = campaign(campaigns[data.objects[i].campaign]);
        }

        fulfill(data);
      });

    }, reject);

  });
}
datapoint.toString = function (query, version) {
  return endPoint('/datapoint/').toString(query, version);
};

function indicatorsTree(q) {
  var fetch1 = endPoint('/indicator/', 'get', 1);
  var fetch2 = endPoint('/indicator_tag', 'get', 1);
  var makeTagId = function (tId) {
    return 'tag-' + tId;
  };
  return new Promise(function (fulfill, reject) {

    fetch1(q).then(function (indicators) {
      fetch2().then(function (tags) {
        tags.objects = _.sortBy(tags.objects, 'tag_name').reverse();
        var tags_map = {};
        _.each(tags.objects, function (t) {
          tags_map[t.id] = t;
          t.id = makeTagId(t.id);
          t.noValue = true;
          t.parent = t.parent_tag_id && t.parent_tag_id !== 'None' ? makeTagId(t.parent_tag_id) : null;
          t.children = [];
          t.title = t.tag_name;
          t.value = t.id;
        });

        // add 'Other Indicators' tag to collect any indicators without tags
        var otherTag = {
          'id': 0,
          'value': makeTagId(0),
          'noValue': true,
          'title': 'Other Indicators',
          'children': []
        };

        _.each(indicators.objects, function (i) {
          i.title = i.name;
          i.value = i.id;
          if (!_.isArray(i.tag_json) || i.tag_json.length === 0) {
            otherTag.children.push(i);
          }
          else if (_.isArray(i.tag_json)) {
            _.each(i.tag_json, function (tId) {
              tags_map[tId].children.push(i);
            });
          }
        });

        // add other tag?
        if (otherTag.children.length > 0) {
          tags.objects.push(otherTag);
        }
        //tags.objects.reverse();
        // sort indicators with each tag
        _.each(tags.objects, function (t) {
          t.children = _.sortBy(t.children, 'title');
        });

        tags.objects = treeify(tags.objects, 'id');
        tags.objects.reverse();
        tags.flat = indicators.objects;
        fulfill(tags);
      });
    }, reject);
  });
}
function tagTree(q) {
  var fetch = endPoint('/indicator_tag', 'get', 1);
  return new Promise(function (fulfill, reject) {

    fetch().then(function (tags) {
      var tags_map = {};
      _.each(tags.objects, function (t) {
        tags_map[t.id] = t;
        t.parent = t.parent_tag_id
        t.children = [];
        t.title = t.tag_name;
        t.value = t.id;
      });
      tags.objects = treeify(tags.objects, 'id');
      tags.flat = tags.objects;
      fulfill(tags);
    }, reject);
  });
}

module.exports = {

  // CUSTOM GET REQUESTS -> MANIPULATED BY JS //
  datapoints: datapoint,
  indicatorsTree: indicatorsTree,
  tagTree: tagTree,

  // BASIC GET REQUESTS //
  campaign: endPoint('/campaign/', 'get', 1),
  regions: endPoint('/region/', 'get', 1),
  datapointsRaw: endPoint('/datapointentry/','get', 1),
  indicators: endPoint('/indicator/', 'get', 1),
  office: endPoint('/office/', 'get', 1),
  location_type: endPoint('/location_type/', 'get', 1),
  indicator_to_tag: endPoint('/indicator_to_tag/', 'get', 1),
  indicator_tag: endPoint('/indicator_tag/', 'get', 1),
  get_dashboard: endPoint('/custom_dashboard/', 'get', 1),
  groups: endPoint('/group/', 'get', 1),
  users: endPoint('/user/', 'get', 1),
  user_groups: endPoint('/user_group/', 'get', 1),
  region_permission: endPoint('/region_permission/', 'get', 1),
  group_permissions: endPoint('/group_permission/', 'get', 1),
  geo: endPoint('/geo/', 'get', 1),
  get_source_object_map: endPoint('/source_object_map/','get',1),
  user_permissions: endPoint('/user_group/', 'get', 1),    // FIXME
  refresh_master: endPoint('/refresh_master/', 'get', 1, false),
    
  // SOURCE DATA DASHBOARD REQUESTS //
  source_doc: endPoint('/source_doc/', 'get', 1),
  submission: endPoint('/source_submission/', 'get', 1, false),
  docDetail: endPoint('/doc_detail/', 'get', 1, false),
  docMap: endPoint('/source_object_map/', 'get', 1, false),
  docDatapoint: endPoint('/doc_datapoint/', 'get', 1, false),
  docResults: endPoint('/computed_datapoint/', 'get', 1, false),
  docDetailType: endPoint('/doc_detail_type/', 'get', 1, false),
  transformUpload: endPoint('/transform_upload/', 'get', 1, false),

  // POST //
  docDetailPost: endPoint('/doc_detail/', 'post'),
  uploadPost: endPoint('/source_doc/', 'post'),
  datapointUpsert: endPoint('/datapointentry/', 'post'),
  save_dashboard: endPoint('/custom_dashboard/', 'post', 1),
  set_region_permission: endPoint('/region_permission/', 'post', 1),
  set_indicator_to_tag: endPoint('/indicator_to_tag/', 'post', 1),
  post_source_object_map: endPoint('/source_object_map/','post', 1,false),

};
