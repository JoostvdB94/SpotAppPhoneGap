/**
 * Created by Joost on 24-3-2015.
 */
function Geolocation(){
    var latitude;
    var longitude;

    this.getLocation =  function (succesCallback,failureCallback) {
        navigator.geolocation.getCurrentPosition(function(position){
            latitude = position.coords.latitude;
            longitude = position.coords.longitude;
            succesCallback(position);
            console.log(position);
        }, function(message){
            alert("No Location found.. "+message);
            failureCallback(null);
        });
    };

    this.getLatitude = function(){
        return latitude;
    };

    this.getLongitude = function(){
        return longitude;
    }
}