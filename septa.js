'use strict';

console.log('found septa');
Log.info('error');
Log.log('log');
Log.error('info');

Module.register("septa", {

    result: [],
    // Default module config.
    defaults: {
        routes: '[7,32,48]',
        url: 'https://www3.septa.org/hackathon/TransitViewAll/',
        myLatLong: '39.9742330,-75.1849950',
        updateInterval: 60000, //google free api only allows 2500 calls a day.
        dayStart: 8, //starting time for bus routes
        dayFinish: 21 //ending time
    },
    getStyles: function() {
        return ["septa.css"];
    },

    start: function() {
        this.getRoutes();
        this.scheduleUpdate();
    },
    getGoogleInfo: function(latLongList) {
        var myLatLong = this.config.myLatLong;
        var googleLocURL = "https://maps.googleapis.com/maps/api/distancematrix/json?origins=" + latLongList + "&destinations=" + myLatLong + "&mode=bus&language=en-EN&key=AIzaSyCCt6hR1QDBWIgF7Whrmn2zS4MLNOYQG1E";
        console.log(googleLocURL);
        this.sendSocketNotification('GET_GOOGLE_INFO', googleLocURL);
    },
    getDom: function() {
        var wrapper = document.createElement("div");
        var _this = this;
        var allRoutes = this.Septaresult;
        var configRoutes = this.config.routes.split(',');
        var routeForGoogle = [];
        var busNumberHolder = [];
	var rightNow = new Date().getHours();
	var begin = this.config.dayStart;
	var end = this.config.dayFinish;
	
        if (typeof allRoutes == "undefined" && rightNow < begin && rightNow > end) //don't need bus times before 8am or after 9pm. 
           wrapper.append = 'Loading Bus...';
        else {
            allRoutes.forEach(function(key, val) {
                if (configRoutes.indexOf(Object.keys(key)[0]) != -1) //this compares user config bus routes to ALL routes
                {
                    console.log(Object.keys(key)[0]);

                    key[Object.keys(key)[0]].forEach(function(clik, clak) {
                        if (clik["Direction"] != "NorthBound") {
                            var thisBusLatLong = [clik["lat"], clik["lng"]];
			   console.log(Object.keys(key)[0] + ': '+clik["Direction"] + '. Offset: ' + clik["Offset_sec"]);
			var busNumDir = Object.keys(key)[0]+ ': '+ (clik["Direction"] ===' ' ? "unknown" : clik["Direction"]) + '", "Offset": ' + clik["Offset_sec"];
                            busNumberHolder.push(busNumDir);
                            routeForGoogle.push(thisBusLatLong);
                        }
                    });
                }
            });
            var URLString = routeForGoogle.join('|');
            var busTimeAndNumber = "[";
            if (URLString == '') {
                wrapper.innerHTML = "Loading..."
            } else {
                _this.getGoogleInfo(URLString);
                //wrapper.innerHTML = JSON.parse(this.result);
            }
            if (typeof this.Septaresult === "undefined" ||typeof this.Googleresult === "undefined") {
                wrapper.innerHTML = "Loading GoogleBus..."
            } else {

                this.Googleresult["rows"].forEach(function(key, val) {
                    console.log(key.elements["0"].duration.value);
                    console.log(busNumberHolder);
                    busTimeAndNumber = busTimeAndNumber + '{"bus": "'+busNumberHolder[val] + ', "time": ' + key.elements["0"].duration.value + '},';
                });
		busTimeAndNumber = busTimeAndNumber.substring(0, busTimeAndNumber.length - 1) + ']';
		window.busTimeAndNumber = busTimeAndNumber;
		busTimeAndNumber=JSON.parse(busTimeAndNumber);
		busTimeAndNumber=busTimeAndNumber.sort(function (a, b) {
		    return (a.time- b.time);
		});
                console.log(busTimeAndNumber);
		    var busTable = document.createElement('ul');
		for(var i = 0; i<5; i++)
		{
		var item = document.createElement('li');
		item.appendChild(document.createTextNode(busTimeAndNumber[i]['bus'] + ' in ' + (busTimeAndNumber[i]['time']/60).toFixed(2) + ' minute(s)'+ '-  ' + (busTimeAndNumber[i]['Offset']/60).toFixed(2) + ' minute(s) ago' ));
busTable.appendChild(item);
        }	
		
                wrapper.appendChild(busTable);
		var time = new Date();
time = time.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', second: 'numeric',hour12: true });

		var time = document.createTextNode("Updated at: " + time);
		var spanny = document.createElement("span"); 
		 spanny.className = "smaller";  
		spanny.appendChild(time);
		wrapper.appendChild(spanny);
                console.log(wrapper);
            }
        }
        return wrapper;
    },

    scheduleUpdate: function(delay) {
        var nextLoad = this.config.updateInterval;
console.log(nextLoad);
        if (typeof delay !== "undefined" && delay >= 0) {
            nextLoad = delay;
        }
console.log("last: " + nextLoad);
        var self = this;
        setInterval(function() {
            self.getRoutes();
        }, nextLoad);
    },


    getRoutes: function() {
        this.sendSocketNotification('GET_ROUTES', this.config);
    },




    socketNotificationReceived: function(notification, payload) {
        if (notification === "ROUTES_RESULT") {
            this.Septaresult = payload;
            this.updateDom(self.config.fadeSpeed);
        } else if (notification === "GOOGLE_INFO_RESULT") {
            //console.log(payload);
            this.Googleresult = payload;
            //this.updateDom(self.config.fadeSpeed);
        }
    },

});
