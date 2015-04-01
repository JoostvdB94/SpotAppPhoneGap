/**
 * Created by Joost on 24-3-2015.
 */
function LocationManager(){
    var self = this;
    var currentPageNumber = 1;
    var baseApiURL = "http://trainspot.herokuapp.com";
    //var authString = "Basic " + btoa("dannyvdbiezen@outlook.com:XnUYCIQtPEjlnz0BUztek8jqMgpxm4_Nvk1yqx7C59sEzjy71yZz2g");
    var disCalc = new DistanceCalculator();
    var geo = new Geolocation();
    var yesterday = moment().subtract(1,'days');
    this.getAllLocations = function(refreshCache,callback){
        if(refreshCache || !self.getLocationsCacheLastUpdated() || moment(self.getLocationsCacheLastUpdated(),moment.ISO_8601).isBefore(yesterday)) {
            $.ajax({
                type: "get",
                url: baseApiURL + "/api/locations",
                dataType: "json",
                async: "true",
                success: function (data, textStatus, jqXhr) {
                    self.parseLocationJson(data);
                },

                error: function (xhr, status) {
                    console.log(status + " Message: " + xhr.statusText);
                }
            });
            $(this).on("parsedJson",function(){callback(self.getLocationsCache())});
        }else{
            callback(self.getLocationsCache());
        }

    };

    this.parseLocationJson = function (jsonArray) {
        var locations = [];
        //var jsonArray = JSON.parse(json);
        geo.getLocation(function(geoLocation) {
            parseData(geoLocation);
        },function(message){
            parseData(null);
        });

        var parseData = function(geoLocation){
            $.each(jsonArray, function (index, jsonItem) {
                var location = new Location();
                location.lat = jsonItem.latitude;
                location.lon = jsonItem.longitude;
                location.type = jsonItem.type;
                location.locationName = jsonItem["name"];
                if(geoLocation) {
                    location.distance = disCalc.calculate(location.lat, location.lon, geoLocation.coords.latitude, geoLocation.coords.longitude);
                }else{
                    location.distance = 0;
                }
                locations.push(location);
            });
            self.updateLocationCache(locations);
            self.sortLocations();
            $(self).trigger("parsedJson");
        }
    };

    this.updateLocationCache = function(stations){
        window.localStorage.setObject("stationList",stations);
        window.localStorage.setObject("stationListDate",new Date());
    };

    this.getLocationsCache = function () {
        return window.localStorage.getObject("stationList");
    };

    this.getLocationsCacheLastUpdated = function () {
        return window.localStorage.getObject("stationListDate");
    };

    this.sortLocations = function(){
        var locations = this.getLocationsCache();
        if(locations){
            this.updateLocationCache(locations.sort(function(a,b) { return parseFloat(a.distance) - parseFloat(b.distance) } ));
        }
        return false;
    };

    this.saveLocation = function(formData) {

        var baseApiURL = "http://trainspot.herokuapp.com/api/locations";
        $.ajax({
            type: "post",
            url: baseApiURL,
            dataType:'json',
            contentType: "application/json",
            data: JSON.stringify(formData),
            success: function (data) {

            },
            error: function (xhr, status) {
                console.log(status+" Message: "+xhr.statusText);
            }
        });
    }
}