/**
 * Created by Joost on 24-3-2015.
 */
var trainController;
var spotManager;
var locationManager;
$(document).ready(function(){
    trainController = new TrainController();
    spotManager = new SpotManager();
    locationManager = new LocationManager();
});

$( document ).on( "mobileinit", function() {
    // Make your jQuery Mobile framework configuration changes here!
    $.ajax({
        type: "get",
        url: "http://trainspot.herokuapp.nl/login",
        dataType:"json",
        async: "true",
        complete: function (data) {
            if(data.authenticated){
                $.mobile.pageContainer.pagecontainer('change', '#mainpage',
                    {
                        transition: 'flip',
                        changeHash: true,
                        reverse: true,
                        showLoadMsg: true
                    }
                );
            }
        },
        error: function (xhr, status) {
            console.log("Error ophalen MySpots "+status + " Message: " + xhr.statusText);
        }
    });
    $.support.cors = true;
    $.mobile.allowCrossDomainPages = true;
    $('#loginForm').on('submit',function(e){
        e.preventDefault();
        window.localStorage.setItem("username", $(e.target).find('input[name=username]').first().val());
        $.ajax({
            type: "POST",
            url: "http://trainspot.herokuapp.com/login",
            dataType:'json',
            contentType: "application/json",
            data: JSON.stringify({"username":window.localStorage.getItem('username'),"password":$(e.target).find('input[name=password]').first().val()}),
            beforeSend:function(){
                $(e.target).find('[type=submit]').prop("disabled",true);
            },
            success: function (data) {
                if(data.authenticated) {
                    window.localStorage.setItem("userId",data.user._id);
                    $.mobile.pageContainer.pagecontainer('change', '#mainpage',
                        {
                            transition: 'flip',
                            changeHash: true,
                            reverse: true,
                            showLoadMsg: true
                        }
                    );
                    $(e.target).find('[type=submit]').prop("disabled",false);
                }else{
                    $(e.target).find('[type=submit]').prop("disabled",true);
                }
            },
            error: function (xhr, status) {
                $(e.target).find('[type=submit]').prop("disabled",false);
                console.log(status+" Message: "+xhr.statusText);
            }
        });
        window.registration.registerToBackend();
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

    $(window).on("swiperight",function(){history.go(-1);});
    $('#rangeSetting').on('change',function(e){window.localStorage.setItem("itemsInRange",$(e.target).val());});
    $('#limitSetting').on('change',function(e){window.localStorage.setItem("itemsPerRequest",$(e.target).val());});
    $('#rangeSetting').val(window.localStorage.getItem("itemsInRange") || 50).trigger("change");
    $('#limitSetting').val(window.localStorage.getItem("itemsPerRequest") || 5).trigger("change");

    $('#trainstations').on('pagecreate',function(e){trainController.showClosestTrainStations(false,function(s){})});
    $('#spots').on('pagecreate',function(e){trainController.showSpots(function(){})});
    $('#myspots').on('pagecreate',function(e){trainController.showMySpots(function(){})});
    $('#photoPlaceholder').on('tap',function(e){trainController.getCamera()});
    $('#refreshLocations').on('tap',function(e){$(e.target).addClass('fa-spin');trainController.showClosestTrainStations(true,function(){$(e.target).removeClass('fa-spin');});});
    $('#refreshMySpots').on('tap',function(e){$(e.target).addClass('fa-spin');trainController.showMySpots(function(){$(e.target).removeClass('fa-spin');})});
    $('#refreshSpots').on('tap',function(e){$(e.target).addClass('fa-spin');trainController.showSpots(function(){$(e.target).removeClass('fa-spin');});});
    $('form[name=spotForm]').on('submit',function(e){e.preventDefault();trainController.sendSpot(e.target);$('#photoPlaceholder').find('img').remove();e.target.reset();});
    $('#newLocationForm').on('submit',function(e){e.preventDefault();trainController.sendLocation($(e.target));});
    $('#useCurrentLocationButton').on('tap',function(){$('#map').locationpicker("location",({latitude:window.localStorage.getItem('latitude'),longitude:window.localStorage.getItem('longitude')}));});
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
        geoObj.getLocation(function(location) {
                var rangeLat = geoObj.getLatitude();
                var rangeLon = geoObj.getLongitude();
                spotManager.getCloseSpots(function (spots) {
                    console.log("Adding spots to spotlist, found "+spots.length);
                    var spotListDom = $('#spotsList');
                    var loadMoreSpotsButton = $('#loadNextSpots');
                    spotListDom.find('li').not('#loadNextSpots').remove();
                    $.each(spots, function (index, val) {
                        loadMoreSpotsButton.before('<li class="ui-li-has-thumb"><div class="ui-li-thumb" style="text-align: center;z-index: 1;width:100%;height:100%"><img src="data:' + val.image.extension + ';base64,' + val.image.data + '" style="z-index:1;display: inline;width: 100%;"/></div><a href="#trainstations">' + val.name + '</a><span class="ui-li-count">' + val.distance + ' KM</span></li>');
                    });
                    $('#spotsCacheDate').text(moment().format('DD-MM-YY HH:mm'));
                    spotListDom.listview().listview('refresh');
                    callback();
                }, rangeLat, rangeLon);
            },function(){}
        );
    };

    this.showMySpots = function(callback){
        console.log("Getting own spots...");
        geoObj.getLocation(function(location) {
                var rangeLat = geoObj.getLatitude();
                var rangeLon = geoObj.getLongitude();
                spotManager.getMySpots(function (spots) {
                    console.log("Adding spots to spotlist, found "+spots.length);
                    var mySpotListDom = $('#mySpotsList');
                    var loadMoreMySpotsButton = $('#loadMyNextSpots');
                    spotListDom.find('li').not('#loadMyNextSpots').remove();
                    $.each(spots, function (index, val) {
                        loadMoreMySpotsButton.before('<li class="ui-li-has-thumb" id="MySpot_'+val.id+'"><div class="ui-li-thumb" style="text-align: center;z-index: 1;width:100%;height:100%"><img src="data:' + val.image.extension + ';base64,' + val.image.data + '" style="z-index:1;display: inline;width: 100%;"/></div><a href="#trainstations">' + val.name + '</a><span class="ui-li-count">' + val.distance + ' KM</span><span class="ui-li-count">Edit</span></li>');
                    });
                    $('#mySpotsCacheDate').text(moment().format('DD-MM-YY HH:mm'));
                    mySpotListDom.listview().listview('refresh');
                    callback();
                }, rangeLat, rangeLon);
            },function(){}
        );
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
        jsonData.owner = window.localStorage.getItem('userId');
        jsonData.creationDate = moment().valueOf();
        spotManager.saveSpot(jsonData);
    };

    this.sendLocation = function(form){
        var formData = $(form).form();
        var jsonData = JSON.parse("{}");
        jsonData.name = formData['name'];
        jsonData.latitude = formData['lat'];
        jsonData.longitude= formData['lon'];
        jsonData.type = "userLocation";
        locationManager.saveLocation(jsonData);
        form[0].reset();
        $.mobile.pageContainer.pagecontainer('change','#trainstations',
            {
                transition: 'slide',
                changeHash: true,
                reverse: true,
                showLoadMsg: true
            }
        );
    };
}