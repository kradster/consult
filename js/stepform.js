var $RESULT = $('#fullform');

var $ADDMOREJOBS = $('#addmorejobs');
var $ADDMORESKILLS = $('#addmoreskills');

var $JOBSPANEl = $('#jobspanel');
var $SKIILSPANEl = $('#skillspanel');



var $FORM1 = $('#form1');
var $FORM2 = $('#form2');
var $FORM3 = $('#form3');
var $FORM4 = $('#form4');
var $FULLDETAILS = $('#fulldetials');

var $STEP1 = $('#step1');
var $STEP2 = $('#step2');
var $STEP3 = $('#step3');
var $STEP4 = $('#step4');

var $BACK1 = $('#back1');
var $BACK2 = $('#back2');
var $BACK3 = $('#back3');
var $BACK4 = $('#back4');

$STEP1.on('click', _funcN1);
$STEP2.on('click', _funcN2);
$STEP3.on('click', _funcN3);
$STEP4.on('click', _funcN4);

$BACK1.on('click',_funcB1);
$BACK2.on('click',_funcB2);
$BACK3.on('click',_funcB3);
$BACK4.on('click',_funcB4);

$ADDMOREJOBS.on('click',_funcAddJob);
$ADDMORESKILLS.on('click',_funcAddSkills);

function _funcAddJob(){
    AddMoreJobs($JOBSPANEl);
}
function _funcAddSkills(){
    AddMoreSkills($SKIILSPANEl);
}

function nextStep(showform, hideform) {
    showform.css('display', 'block');
    hideform.css('display', 'none');
}

function _funcN1() {
    nextStep($FORM2, $FORM1)
}

function _funcN2() {
    nextStep($FORM3, $FORM2)
}

function _funcN3() {
    nextStep($FORM4, $FORM3)
}

function _funcN4() {
    var data = Get_All_Page_Data();
    showAllDetials(data);
    nextStep($FULLDETAILS, $FORM4)
}


function _funcB1() {
    nextStep($FORM1, $FORM2)
}
function _funcB2() {
    nextStep($FORM2, $FORM3)

}
function _funcB3() {
    nextStep($FORM3, $FORM4)

}
function _funcB4() {
    nextStep($FORM4, $FULLDETAILS)

}

function AddMoreJobs(element){
    element.append('<div class="col s12"><div class="input-field col s6"><input type="text" name="projects[]" id="projects" placeholder="Project/Internship/Job"></div><div class="input-field col s3"><input class="datepicker" type="text" name="startdate" placeholder="Start Date"></div><div class="input-field col s3"><input class="datepicker" type="text" name="enddate" placeholder="End Date"></div></div>');
}
function AddMoreSkills(element){
    element.append('<div class="input-field col s12"><input type="text" name="skills[]" placeholder="Enter Your Skills"></div>');
}

function Get_All_Page_Data() {
    var All_Page_Data = {};
    $('input, select, textarea').each(function () {
        var input = $(this);
        var Element_Name;
        var Element_Value;

        if ((input.attr('type') == 'submit') || (input.attr('type') == 'button')) {
            return true;
        }

        if ((input.attr('name') != undefined) && (input.attr('name') != '')) {
            Element_Name = input.attr('name');
        } else if ((input.attr('id') != undefined) && (input.attr('id') != '')) {
            Element_Name = input.attr('id');
        } else if ((input.attr('class') != undefined) && (input.attr('class') != '')) {
            Element_Name = input.attr('class');
        }

        if (input.val() != undefined) {
            if (input.attr('type') == 'radio') {
                Element_Value = jQuery('input[name=' + Element_Name + ']:checked').val();
            } else {
                Element_Value = input.val();
            }
        } else if (input.value() != undefined) {
            Element_Value = input.value();
        } else if (input.text() != undefined) {
            Element_Value = input.text();
        }

        if (Element_Name != undefined) {
            All_Page_Data[Element_Name] = Element_Value;
        }
    });
    return All_Page_Data;
}

function showAllDetials(data){
    let ul = $('#alldetailsul');
    for(let d in data){
        if(d==="select-dropdown dropdown-trigger"||d==="datepicker-select orig-select-month"||d==="datepicker-select orig-select-year"){
            
        }
        else{
            let li = "<li><b>"+d+ "</b>"+data[d]+"</li>";
            ul.append(li);  
        }
    }

}