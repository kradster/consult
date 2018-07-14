let tab1 = $("#tab1");
let tab2 = $("#tab2");
let tab3 = $("#tab3");
let tab4 = $("#tab4");
let tab5 = $('#tab5');

var temp = $('#panel1');

tab1.on("click", showpanel1);
tab2.on("click", showpanel2);
tab3.on("click", showpanel3);
tab4.on("click", showpanel4);
tab5.on('click', showpanel5);

function showpanel1() {
    showProfileTab($("#panel1"))
};

function showpanel2() {
    showProfileTab($("#panel2"))
};

function showpanel3() {
    showProfileTab($("#panel3"))
};

function showpanel4() {
    showProfileTab($("#panel4"))
};

function showpanel5() {
    showProfileTab($("#panel5"));
}

function showProfileTab(showpanel) {
    if (temp != null) temp.css("display", "none");
    showpanel.css("display", "block");
    temp = showpanel;
}