$(document).ready(function() {
    $('#myfooter').load('/templates/footer.html');
    var rowid = document.cookie;
    var uid = rowid.substring(rowid.lastIndexOf('=') + 1);
    if (getCookie("uniqueid") != "") {
        if (uid !== "null") {
            $('#navigationbar').load('/templates/navigationbar2.html');
            $('#myfooter').load('/templates/footer2.html');
        } else {
            $('#navigationbar').load('/templates/navigationbar.html');
            $('#myfooter').load('/templates/footer.html');

        }
    } else {
        $('#navigationbar').load('/templates/navigationbar.html');
        $('#myfooter').load('/templates/footer.html');

    }



});

function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}