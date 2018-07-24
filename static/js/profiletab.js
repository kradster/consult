let tab1 = $("#tab1");
let tab2 = $("#tab2");
let tab3 = $("#tab3");
let tab4 = $("#tab4");


var temp = $('#panel1');

tab1.on("click", showpanel1);
tab2.on("click", showpanel2);
tab3.on("click", showpanel3);
tab4.on("click", showpanel4);

function showpanel1() {
    showProfileTab($("#panel1"));
    $(this).addClass('active-tab').siblings().removeClass('active-tab');
};

function showpanel2() {
    showProfileTab($("#panel2"));
    $(this).addClass('active-tab').siblings().removeClass('active-tab');

};

function showpanel3() {
    showProfileTab($("#panel3"));
    $(this).addClass('active-tab').siblings().removeClass('active-tab');

};

function showpanel4() {
    showProfileTab($("#panel4"));
    $(this).addClass('active-tab').siblings().removeClass('active-tab');

};

function showProfileTab(showpanel) {
    if (temp != null) temp.css("display", "none");
    showpanel.css("display", "block");
    temp = showpanel;
}