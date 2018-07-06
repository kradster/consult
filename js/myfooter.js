$(document).ready(function(){
    $('#myfooter').load('/templates/footer.html');
    var rowid = document.cookie;
    var uid = rowid.substring(rowid.lastIndexOf('=')+1);
    if(uid!=="null"){
        $('#navigationbar').load('/templates/navigationbar2.html');
    }else{
        $('#navigationbar').load('/templates/navigationbar.html');

    }

});