/* Magic Mirror
 * Module: Septa
 *
 * By Jonny Perez https://github.com/SJPMAX
 * MIT Licensed.
 */
var NodeHelper = require('node_helper');
var request = require('request');
var $ = require('jquery');
fs = require('fs');
var allRoutes = "";

module.exports = NodeHelper.create({
  start: function () {
    console.log('Septa helper started ...');
  },

  getRoutes: function (deets) {

      var self = this;
 request({ url: deets.url, method: 'GET' }, function (error, response, body) {
          if (!error && response.statusCode == 200) {
  var foundRoutes = [];
    var myRoutes = deets.routes;
    var latLong = [39.9742330, -75.1849950];
body = JSON.parse(body);
var key = Object.keys(body)[0];
   var allRoutes = body[key];
      self.sendSocketNotification('ROUTES_RESULT', allRoutes);
}
});
  },

getGoogleInfo: function (Coordinates){
var self = this;
 request({ url: Coordinates, method: 'GET' }, function (error, response, body) {
          if (!error && response.statusCode == 200) {
body = JSON.parse(body);
      self.sendSocketNotification('GOOGLE_INFO_RESULT', body);
}

});
  

},

  //Subclass socketNotificationReceived received.
  socketNotificationReceived: function(notification, payload) {
    if (notification === 'GET_ROUTES') {
      this.getRoutes(payload);
    }
   if ( 'GET_GOOGLE_INFO'){
this.getGoogleInfo(payload);
}
  }

});

