/**
 * Created by Joost on 24-3-2015.
 */
var trainController;
$(document).ready(function(){
    trainController = new TrainController();
});

$( document ).bind( "mobileinit", function() {
    // Make your jQuery Mobile framework configuration changes here!
    $.support.cors = true;
    $.mobile.allowCrossDomainPages = true;
});

//Bindings
$(document).ready(function(){
    $.fn.form = function() {
        var formData = {};
        this.find('[name]').each(function() {
            formData[this.name] = this.value;
        });
        return formData;
    };
    //$('#trainstations').on('pageload',trainController.showClosestTrainStations());
    $('#photoPlaceholder').on('tap',function(){trainController.getCamera()});
    $('#spots').on('pageload',trainController.showSpots());
    $('form[name=spotForm]').on('submit',function(e){e.preventDefault();trainController.sendSpot(e.target);$('#photoPlaceholder').find('img').remove();e.target.reset();})
});
function TrainController(){
    var self = this;
    var geoObj = new Geolocation();
    geoObj.getLocation(function(geoLocation){self.showClosestTrainStations()});

    this.showClosestTrainStations = function(){
        console.log("Getting stations..");
        var locationManager = new LocationManager();
        locationManager.getAllLocations(function(stations){
            //stations = [new Location("Hallo",50.5,5.6,10,"Station"),new Location("Hallo1",50.5,5.6,28,"Station"),new Location("Hallo2",50.5,5.6,24,"Station"),new Location("Hallo3",50.5,5.6,20,"Station"),new Location("Hallo",50.5,5.6,10,"Station"),new Location("Hallo1",50.5,5.6,28,"Station"),new Location("Hallo2",50.5,5.6,24,"Station"),new Location("Hallo3",50.5,5.6,20,"Station"),new Location("Hallo",50.5,5.6,10,"Station"),new Location("Hallo1",50.5,5.6,28,"Station"),new Location("Hallo2",50.5,5.6,24,"Station"),new Location("Hallo3",50.5,5.6,20,"Station"),new Location("Hallo",50.5,5.6,10,"Station"),new Location("Hallo1",50.5,5.6,28,"Station"),new Location("Hallo2",50.5,5.6,24,"Station"),new Location("Hallo3",50.5,5.6,20,"Station"),new Location("Hallo",50.5,5.6,10,"Station"),new Location("Hallo1",50.5,5.6,28,"Station"),new Location("Hallo2",50.5,5.6,24,"Station"),new Location("Hallo3",50.5,5.6,20,"Station"),new Location("Hallo",50.5,5.6,10,"Station"),new Location("Hallo1",50.5,5.6,28,"Station"),new Location("Hallo2",50.5,5.6,24,"Station"),new Location("Hallo3",50.5,5.6,20,"Station"),new Location("Hallo",50.5,5.6,10,"Station"),new Location("Hallo1",50.5,5.6,28,"Station"),new Location("Hallo2",50.5,5.6,24,"Station"),new Location("Hallo3",50.5,5.6,20,"Station"),new Location("Hallo",50.5,5.6,10,"Station"),new Location("Hallo1",50.5,5.6,28,"Station"),new Location("Hallo2",50.5,5.6,24,"Station"),new Location("Hallo3",50.5,5.6,20,"Station"),new Location("Hallo",50.5,5.6,10,"Station"),new Location("Hallo1",50.5,5.6,28,"Station"),new Location("Hallo2",50.5,5.6,24,"Station"),new Location("Hallo3",50.5,5.6,20,"Station"),new Location("Hallo",50.5,5.6,10,"Station"),new Location("Hallo1",50.5,5.6,28,"Station"),new Location("Hallo2",50.5,5.6,24,"Station"),new Location("Hallo3",50.5,5.6,20,"Station")];
            console.log("Adding stations to list");
            var stationListDOM = $('#stationList');
            stationListDOM.html("");
            $.each(stations , function(index, val) {
                stationListDOM.append('<li><a href="#trainstations">'+val.locationName+'</a><span class="ui-li-count">'+val.distance.toFixed(2)+'&nbsp;KM</span></li>');
            });
            stationListDOM.listview('refresh');
        });
    };

    this.showSpots = function(){
        console.log("Getting spots...");
        var spotListDom = $('#spotsList');
        var spotManager = new SpotManager();
        spotManager.getAllSpots(function(spots){
            console.log("Adding spots to spotlist");
            spotListDom.html("");
            $.each(spots , function(index, val) {
                spotListDom.append('<li class="ui-li-has-thumb"><div class="ui-li-thumb" style="text-align: center;z-index: 1;width:100%;height:100%"><img src="data:'+val.image.extension+';base64,'+val.image.data+'" style="z-index:1;display: inline;width: 100%;"/></div><a href="#trainstations">'+val.name+'</a></li>');
            });
        });
    };

    this.addPictureToScreen = function(base64){
        var placeholder = $('#photoPlaceholder');
        placeholder.find('img').remove();
        placeholder.prepend('<img style="width: 100%; float:left;" src="data:image/jpeg;base64,'+base64+'"></img>');
        placeholder.find('input[name=image]').val(base64);
    };

    this.getCamera = function(){
        navigator.camera.getPicture(self.addPictureToScreen, function(){alert("Camera not available.")}, {allowEdit: true,quality: 50, destinationType : Camera.DestinationType.DATA_URL})
    };

    this.sendSpot = function(form){
        var formData = $(form).form();
        var jsonData = JSON.parse("{}");
        jsonData.name = formData['name'];
        jsonData.description= "";
        jsonData.latitude = geoObj.getLatitude();
        jsonData.longitude= geoObj.getLongitude();
        jsonData.image = {extension:'image/jpeg',data:formData['image']};
        jsonData.owner = "RandomID";
        var spotMan = new SpotManager();
        spotMan.saveSpot(jsonData);
    }
}