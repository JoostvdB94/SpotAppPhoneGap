/**
 * Created by Joost on 31-3-2015.
 */
window.registration = new Registration();

function Registration(){
    document.addEventListener('deviceready',function(){
        var device = window.device;
        pushNotification = window.plugins.pushNotification;
        if ( device.platform == 'android' || device.platform == 'Android' || device.platform == "amazon-fireos" ){
            pushNotification.register(
                window.registration.registrationCompleted,
                window.registration.registrationFailed,
                {
                    "senderID":"761052820982",
                    "ecb":"onNotification"
                });
        } else {
            pushNotification.register(
                window.registration.registrationCompleted,
                window.registration.registrationFailed,
                {
                    "badge":"true",
                    "sound":"true",
                    "alert":"true",
                    "ecb":"onNotificationAPN"
                });
        }
    });

    this.registrationCompleted = function(result){
    };

    this.registrationFailed = function(result){

    };

}

var onNotification = function(event){
    switch(event.event){
        case 'registered':
            if(event.regid.length > 0){
                alert("Registered!" + event.regid);
                window.localStorage.setItem("regId",event.regid);
            }
            break;
        case 'message':
            if(e.foreground){
                alert("Alert in foreground");
            }else{
                alert("Alert was in Background");
            }
            break;
        default:
            break;
    }
};

var onNotificationAPN = function(event){
    alert("NOTIFICATION!....Apple?");
};
