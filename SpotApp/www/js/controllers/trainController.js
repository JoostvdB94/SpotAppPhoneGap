/**
 * Created by Joost on 24-3-2015.
 */
var trainController;
var pushNotification;
$(document).ready(function(){
    trainController = new TrainController();
});

$( document ).on( "mobileinit", function() {
    // Make your jQuery Mobile framework configuration changes here!
    $.support.cors = true;
    $.mobile.allowCrossDomainPages = true;
    $('#loginForm').on('submit',function(e){
        window.localStorage.setItem("username", $(e.target).find('input[name=username]').first().val());
        e.preventDefault();
        $.mobile.pageContainer.pagecontainer('change','#mainpage',
            {
                transition: 'flip',
                changeHash: true,
                reverse: true,
                showLoadMsg: true
            }
        );
        trainController.registerToBackend();
    });
    $.mobile.defaultPageTransition = "slide";
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

    $('#trainstations').on('beforepageload',trainController.showClosestTrainStations(false,function(){}));
    $('#photoPlaceholder').on('tap',function(){trainController.getCamera()});
    $('#myspots').on('pageload',trainController.showSpots(function(){}));
    $('#refreshLocations').on('tap',function(e){$(e.target).addClass('fa-spin');trainController.showClosestTrainStations(true,function(){$(e.target).removeClass('fa-spin');});});
    $('#refreshMySpots').on('tap',function(e){$(e.target).addClass('fa-spin');trainController.showSpots(true,function(){$(e.target).removeClass('fa-spin');});});
    $('form[name=spotForm]').on('submit',function(e){e.preventDefault();trainController.sendSpot(e.target);$('#photoPlaceholder').find('img').remove();e.target.reset();})
});
function TrainController(){
    var self = this;
    var geoObj = new Geolocation();

    this.showClosestTrainStations = function(refreshCache, callback){
        var loadLocations = function(geoLocation){
            console.log("Getting stations..");
            var locationManager = new LocationManager();
            locationManager.getAllLocations(refreshCache,function (stations) {
                console.log("Adding stations to list");
                var stationListDOM = $('#stationList');
                stationListDOM.html("");
                $.each(stations, function (index, val) {
                    stationListDOM.append('<li><a href="#trainstations">' + val.locationName + '</a><span class="ui-li-count">' + val.distance.toFixed(2) + '&nbsp;KM</span></li>');
                });
                $('#locationCacheDate').text(moment(locationManager.getLocationsCacheLastUpdated()).format('DD-MM-YY HH:mm'));
                stationListDOM.listview().listview('refresh');
                callback();
            });
        };
        geoObj.getLocation(loadLocations,loadLocations);
    };

    this.showSpots = function(callback){
        console.log("Getting spots...");
        var spotManager = new SpotManager();
        spotManager.getAllSpots(function(spots){
            console.log("Adding spots to spotlist");
            var spotListDom = $('#mySpotsList');
            spotListDom.html("");
            $.each(spots , function(index, val) {
                spotListDom.append('<li class="ui-li-has-thumb"><div class="ui-li-thumb" style="text-align: center;z-index: 1;width:100%;height:100%"><img src="data:'+val.image.extension+';base64,'+val.image.data+'" style="z-index:1;display: inline;width: 100%;"/></div><a href="#trainstations">'+val.name+'</a></li>');
            });
            $('#mySpotsCacheDate').text(moment().format('DD-MM-YY HH:mm'));
            spotListDom.listview().listview('refresh');
            callback();
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
        jsonData.description= formData["description"] || "";
        jsonData.latitude = geoObj.getLatitude();
        jsonData.longitude= geoObj.getLongitude();
        jsonData.image = {extension:'image/jpeg',data:formData['image']};
        jsonData.owner = "RandomID";
        jsonData.creationDate = moment().valueOf();
        var spotMan = new SpotManager();
        spotMan.saveSpot(jsonData);
    };
}