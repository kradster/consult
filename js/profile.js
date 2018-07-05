$(document).ready(function(){
    let USERID = $.cookie("userid");
    alert(USERID);
    log('hi');
});


function log(message){
    console.log(message);
}