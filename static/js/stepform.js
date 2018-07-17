var $RESULT = $('#fullform');





var $FORM1 = $('#form1');
var $FORM2 = $('#form2');
var $FORM3 = $('#form3');
var $FORM4 = $('#form4');
var $FORM5 = $('#form5');

var $FULLDETAILS = $('#fulldetials');

var $STEP1 = $('#step1');
var $STEP2 = $('#step2');
var $STEP3 = $('#step3');
var $STEP4 = $('#step4');
var $STEP5 = $('#step5');

var $BACK1 = $('#back1');
var $BACK2 = $('#back2');
var $BACK3 = $('#back3');
var $BACK4 = $('#back4');
var $BACK5 = $('#back5');

$STEP1.on('click', _funcN1);
$STEP2.on('click', _funcN2);
$STEP3.on('click', _funcN3);
$STEP4.on('click', _funcN4);
$STEP5.on('click', _funcN5);

$BACK1.on('click', _funcB1);
$BACK2.on('click', _funcB2);
$BACK3.on('click', _funcB3);
$BACK4.on('click', _funcB4);
$BACK5.on('click', _funcB5);


function nextStep(showform, hideform) {
    showform.css('display', 'block');
    showform.addClass('animated zoomIn');
    hideform.css('display', 'none');
}

function backStep(showform, hideform) {
    showform.css('display', 'block');
    showform.addClass('animated zoomIn');
    hideform.css('display', 'none');
}

function _funcN1() {
    nextStep($FORM2, $FORM1);
}

function _funcN2() {
    nextStep($FORM3, $FORM2);
}

function _funcN3() {
    nextStep($FORM4, $FORM3);
}

function _funcN4() {
    nextStep($FORM5, $FORM4);
}

function _funcN5() {
    nextStep($FULLDETAILS, $FORM5);
}


function _funcB1() {
    backStep($FORM1, $FORM2);
}

function _funcB2() {
    backStep($FORM2, $FORM3);

}

function _funcB3() {
    backStep($FORM3, $FORM4);

}

function _funcB4() {
    backStep($FORM4, $FORM5);

}

function _funcB5() {
    backStep($FORM5, $FULLDETAILS);

}

function AddMoreJobs(element) {
    element.append(`<div class="col s12">
    <div class="input-field col s2">
        <select class="no-autoinit" name="projecttype[]">
            <option value="" disabled selected>Choose your course</option>
            <option value="internship"  selected>Internship</option>
            <option value="job"  selected>Job</option>
            <option value="projects"  selected>Project</option>
        </select>
    </div>
    <div class="input-field col s2">
        <input type="text" name="projectrole[]" id="projects" placeholder="title/role">
    </div>
    <div class="input-field col s2">
        <input type="text" name="projectinstitute[]" id="projects" placeholder="institute/organization">
    </div>
    <div class="input-field col s2">
        <input type="text" name="projectdetails[]" id="projects" placeholder="About work">
    </div>
    <div class="input-field col s2">
        <input class="datepicker" type="text" name="projectstartdate" id="startdate" placeholder="Start Date">
    </div>
    <div class="input-field col s2">
        <input class="datepicker" type="text" name="projectenddate" id="enddate" placeholder="End Date">
    </div>
</div>`);
}

function AddMoreSkills(element) {
    element.append('<div class="input-field col s12"><input type="text" name="skills[]" placeholder="Enter Your Skills"></div>');
}

function Get_All_Page_Data() {
    var All_Page_Data = {};
    $('input, select, textarea').each(function() {
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

function showAllDetials(data) {
    let ul = $('#alldetailsul');
    for (let d in data) {
        if (d === "select-dropdown dropdown-trigger" || d === "datepicker-select orig-select-month" || d === "datepicker-select orig-select-year") {

        } else {
            let li = "<li><b>" + d + "</b>" + data[d] + "</li>";
            ul.append(li);
        }
    }

}