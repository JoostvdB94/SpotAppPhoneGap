/**
 * Created by Joost on 24-3-2015.
 */
var trainController;
$(document).ready(function(){
    trainController = new TrainController();
});

//Bindings
$(document).ready(function(){
    $('#trainstations').on('pageload',trainController.showClosestTrainStations());
    $('#takePicture').on('tap',function(){trainController.getCamera()});
    $('#sendSpot').on('tap',function(){$('#photoPlaceholder').html("");$('#spot').find('input').val("");alert("Opgeslagen")})
});
function TrainController(){
    var self = this;
    var geoObj = new Geolocation();
    geoObj.getLocation(function(geoLocation){self.showClosestTrainStations()});

    this.showClosestTrainStations = function(){
        console.log("Getting stations..");
        var locationManager = new LocationManager();
        locationManager.getAllLocations(function(stations){
            stations = [new Location("Hallo",50.5,5.6,10,"Station"),new Location("Hallo1",50.5,5.6,28,"Station"),new Location("Hallo2",50.5,5.6,24,"Station"),new Location("Hallo3",50.5,5.6,20,"Station"),new Location("Hallo",50.5,5.6,10,"Station"),new Location("Hallo1",50.5,5.6,28,"Station"),new Location("Hallo2",50.5,5.6,24,"Station"),new Location("Hallo3",50.5,5.6,20,"Station"),new Location("Hallo",50.5,5.6,10,"Station"),new Location("Hallo1",50.5,5.6,28,"Station"),new Location("Hallo2",50.5,5.6,24,"Station"),new Location("Hallo3",50.5,5.6,20,"Station"),new Location("Hallo",50.5,5.6,10,"Station"),new Location("Hallo1",50.5,5.6,28,"Station"),new Location("Hallo2",50.5,5.6,24,"Station"),new Location("Hallo3",50.5,5.6,20,"Station"),new Location("Hallo",50.5,5.6,10,"Station"),new Location("Hallo1",50.5,5.6,28,"Station"),new Location("Hallo2",50.5,5.6,24,"Station"),new Location("Hallo3",50.5,5.6,20,"Station"),new Location("Hallo",50.5,5.6,10,"Station"),new Location("Hallo1",50.5,5.6,28,"Station"),new Location("Hallo2",50.5,5.6,24,"Station"),new Location("Hallo3",50.5,5.6,20,"Station"),new Location("Hallo",50.5,5.6,10,"Station"),new Location("Hallo1",50.5,5.6,28,"Station"),new Location("Hallo2",50.5,5.6,24,"Station"),new Location("Hallo3",50.5,5.6,20,"Station"),new Location("Hallo",50.5,5.6,10,"Station"),new Location("Hallo1",50.5,5.6,28,"Station"),new Location("Hallo2",50.5,5.6,24,"Station"),new Location("Hallo3",50.5,5.6,20,"Station"),new Location("Hallo",50.5,5.6,10,"Station"),new Location("Hallo1",50.5,5.6,28,"Station"),new Location("Hallo2",50.5,5.6,24,"Station"),new Location("Hallo3",50.5,5.6,20,"Station"),new Location("Hallo",50.5,5.6,10,"Station"),new Location("Hallo1",50.5,5.6,28,"Station"),new Location("Hallo2",50.5,5.6,24,"Station"),new Location("Hallo3",50.5,5.6,20,"Station")];
            console.log("Adding stations to list");
            var stationListDOM = $('#stationList');
            stationListDOM.html("");
            $.each(stations , function(index, val) {
                stationListDOM.append('<li><a href="#trainstations">'+val.name+'</a><span class="ui-li-count">'+val.distance.toFixed(2)+'&nbsp;KM</span></li>');
            });
            stationListDOM.listview('refresh');
        });
    };

    this.getCamera = function(){
        navigator.camera.getPicture(self.addPictureToScreen, function(){alert("Camera not available.")}, {allowEdit: true,quality: 50, destinationType : Camera.DestinationType.DATA_URL})
    };

    this.addPictureToScreen = function(base64){
        $('#photoPlaceholder').html('<img style="width: 100%;" src="data:image/'+navigator.camera.EncodingType+';base64,'+base64+'"></img>');
    }
}