/**
 * Created by Joost on 24-3-2015.
 */
var trainController;
var pushNotification;
$(document).ready(function(){
    trainController = new TrainController();
});

document.addEventListener('deviceready',function(){
    alert("deviceready");
    var device = window.device;
    alert(device.platform);
    pushNotification = window.plugins.pushNotification;
    if ( device.platform == 'android' || device.platform == 'Android' || device.platform == "amazon-fireos" ){
        pushNotification.register(
            trainController.registrationCompleted,
            trainController.registrationFailed,
            {
                "senderID":"761052820982",
                "ecb":"onNotification"
            });
    } else {
        pushNotification.register(
            trainController.registrationCompleted,
            trainController.registrationFailed,
            {
                "badge":"true",
                "sound":"true",
                "alert":"true",
                "ecb":"onNotificationAPN"
            });
    }
});

var onNotification = function(event){
  alert("NOTIFICATION!");
};
var onNotificationAPN = function(event){
  alert("NOTIFICATION!");
};

$( document ).on( "mobileinit", function() {
    // Make your jQuery Mobile framework configuration changes here!
    $.support.cors = true;
    $.mobile.allowCrossDomainPages = true;
    alert("MobileInit");
    $('#loginForm').on('submit',function(e){
        e.preventDefault();
        $.mobile.pageContainer.pagecontainer('change','#mainpage',
            {
                transition: 'flip',
                changeHash: false,
                reverse: true,
                showLoadMsg: true
            }
        );
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
    $('#spots').on('pageload',trainController.showSpots(false, function(){}));
    $('#refreshLocations').on('tap',function(e){$(e.target).addClass('fa-spin');trainController.showClosestTrainStations(true,function(){$(e.target).removeClass('fa-spin');});});
    $('#refreshSpots').on('tap',function(e){$(e.target).addClass('fa-spin');trainController.showSpots(true,function(){$(e.target).removeClass('fa-spin');});});
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

    this.showSpots = function(refreshCache, callback){
        console.log("Getting spots...");
        var spotManager = new SpotManager();
        spotManager.getAllSpots(refreshCache,function(spots){
            console.log("Adding spots to spotlist");
            var spotListDom = $('#spotsList');
            spotListDom.html("");
            $.each(spots , function(index, val) {
                spotListDom.append('<li class="ui-li-has-thumb"><div class="ui-li-thumb" style="text-align: center;z-index: 1;width:100%;height:100%"><img src="data:'+val.image.extension+';base64,'+val.image.data+'" style="z-index:1;display: inline;width: 100%;"/></div><a href="#trainstations">'+val.name+'</a></li>');
            });
            $('#spotsCacheDate').text(moment(spotManager.getSpotsCacheLastUpdated()).format('DD-MM-YY HH:mm'));
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
        jsonData.description= "";
        jsonData.latitude = geoObj.getLatitude();
        jsonData.longitude= geoObj.getLongitude();
        jsonData.image = {extension:'image/jpeg',data:formData['image']};
        jsonData.owner = "RandomID";
        var spotMan = new SpotManager();
        spotMan.saveSpot(jsonData);
    };

    this.registrationCompleted = function(result){
        alert("registered!");
    };

    this.registrationFailed = function(result){
        alert("Register failed");
    };
}