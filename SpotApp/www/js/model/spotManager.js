/**
 * Created by Joost on 24-3-2015.
 */
function SpotManager(){
    var self = this;
    var baseApiURL = "http://trainspot.herokuapp.com/api/spots";
    //var authString = "Basic " + btoa("dannyvdbiezen@outlook.com:XnUYCIQtPEjlnz0BUztek8jqMgpxm4_Nvk1yqx7C59sEzjy71yZz2g");
    this.getAllSpots = function(callback){
        $.ajax({
            type: "get",
            url: baseApiURL,
            async: "true",
            complete: function (data) {
                callback(self.parseJson(data.responseText));
            },
            error: function (xhr, status) {
                console.log(status + " Message: " + xhr.statusText);
            }
        });
    };

    this.parseJson = function (jsonText) {
        var spots = [];
        var jsonSpots = JSON.parse(jsonText);
        $.each(jsonSpots,function(index,val){
            var spot = new Spot();
            spot.id = jsonSpots[index]._id;
            spot.name = jsonSpots[index].name;
            spot.description = jsonSpots[index].description || "";
            spot.longitude = jsonSpots[index].longitude;
            spot.latitude = jsonSpots[index].latitude;
            spot.image = new Image(jsonSpots[index].image.extension,jsonSpots[index].image.data);
            spot.owner = null;

            spots.push(spot);
        });
        return spots
    };

    this.saveSpot = function (jsonData){
        var baseApiURL = "http://trainspot.herokuapp.com/api/spots";
        $.ajax({
            type: "post",
            url: baseApiURL,
            dataType:'json',
            contentType: "application/json",
            data: JSON.stringify(jsonData),
            success: function (data) {
                alert("Succesvol opgestuurd.");
                //TODO Stuur pushnotificatie naar anderen met ID van spot data._id
            },
            error: function (xhr, status) {
                console.log(status+" Message: "+xhr.statusText);
            }
        });
        this.getAllSpots(function(spots){});
    };

    this.updateSpotsCache = function(spots){
        window.localStorage.setObject("spotsList",spots);
        window.localStorage.setObject("spotsListDate",new Date());
    };

    this.getSpotsCache = function () {
        return window.localStorage.getObject("spotsList");
    };

    this.getSpotsCacheLastUpdated = function () {
        return window.localStorage.getObject("spotsListDate");
    };

    this.sortSpots = function(disCalc,spots){
        if(spots){
            $.each(spots , function(index, val) {
                spots[index].distance = disCalc.calculate(lat, lon, spots[index].lat, spots[index].lon);
            });
            return spots.sort(function(a,b) { return parseFloat(a.distance) - parseFloat(b.distance) } );
        }
        return false;
    }
}