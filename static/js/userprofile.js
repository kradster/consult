$(document).ready(function(){
    var rowid = document.cookie;
            var uid = rowid.substring(rowid.lastIndexOf('=')+1);
            if(uid!=="null"){
            $('#userprofile').load('../templates/userprofile.html');
            }
            console.log(uid);
});