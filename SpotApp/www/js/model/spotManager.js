/**
 * Created by Joost on 24-3-2015.
 */
function SpotManager(){
    var self = this;
    var mySpotsCurrentPage = 1;
    var baseApiURL = "http://trainspot.herokuapp.com/api/spots";
    //var authString = "Basic " + btoa("dannyvdbiezen@outlook.com:XnUYCIQtPEjlnz0BUztek8jqMgpxm4_Nvk1yqx7C59sEzjy71yZz2g");
    this.getCloseSpots = function(callback,latitude,longitude){
        $.ajax({
            type: "get",
            url: baseApiURL+"?limit="+window.localStorage.getItem("itemsPerRequest")+"&latitude="+latitude+"&longitude="+longitude+"&range="+window.localStorage.getItem("itemsInRange"),
            async: "true",
            complete: function (data) {
                callback(self.sortSpots(new DistanceCalculator(),self.parseJson(data.responseText)));
            },
            error: function (xhr, status) {
                console.log("Error ophalen CloseSpots "+ status + " Message: " + xhr.statusText);
            }
        });
    };

    this.getMySpots = function (callback) {
        var baseApiURL = "http://trainspot.herokuapp.com/api/spots";
        $.ajax({
            type: "get",
            url: baseApiURL+"?owner="+window.localStorage.getItem("userId")+"&limit="+window.localStorage.getItem("itemsPerRequest"),
            async: "true",
            complete: function (data) {
                callback(self.sortSpotsByTime(self.parseJson(data.responseText)));
            },
            error: function (xhr, status) {
                console.log("Error ophalen MySpots "+status + " Message: " + xhr.statusText);
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
            spot.owner = jsonSpots[index].owner._id;
            spot.distance = jsonSpots[index].distance;
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
            },
            error: function (xhr, status) {
                console.log(status+" Message: "+xhr.statusText);
            }
        });
    };

    this.sortSpots = function(disCalc,spots){
        if(spots){
            $.each(spots , function(index, val) {
                spots[index].distance = disCalc.calculate(window.localStorage.getItem("latitude"), window.localStorage.getItem("longitude"), spots[index].latitude, spots[index].longitude);
            });
            return spots.sort(function(a,b) { return parseFloat(a.distance) - parseFloat(b.distance) } );
        }
        return false;
    };

    this.sortSpotsByTime = function(spots){
        if(spots){
            return spots.sort(function(a,b) { return parseInt(a.creationDate) - parseInt(b.creationDate) } );
        }
        return false;
    }
}