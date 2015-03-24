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
        }, function(){
            alert("No Location found..");
        });
    };

    this.getLatitude = function(){
        return (latitude)?latitude:58.2;
    };

    this.getLongitude = function(){
        return (longitude)?longitude:42.3;
    }
}