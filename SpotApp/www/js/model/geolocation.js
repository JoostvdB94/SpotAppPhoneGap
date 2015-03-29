/**
 * Created by Joost on 24-3-2015.
 */
function Geolocation(){
    var latitude;
    var longitude;

    this.getLocation =  function (succesCallback) {
        navigator.geolocation.getCurrentPosition(function(position){
            latitude = position.coords.latitude;
            longitude = position.coords.longitude;
            succesCallback(position);
            console.log(position);
        }, function(){
            alert("No Location found..");
        });
    };

    this.getLatitude = function(){
        return latitude;
    };

    this.getLongitude = function(){
        return longitude;
    }
}