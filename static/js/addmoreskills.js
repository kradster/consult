var $ADDMOREJOBS = $('#addmorejobs');
var $ADDMORESKILLS = $('#addmoreskills');

var $JOBSPANEl = $('#jobspanel');
var $SKIILSPANEl = $('#skillspanel');

$ADDMOREJOBS.on('click', _funcAddJob);
$ADDMORESKILLS.on('click', _funcAddSkills);

function _funcAddJob() {
    AddMoreJobs($JOBSPANEl);
}

function _funcAddSkills() {
    AddMoreSkills($SKIILSPANEl);
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
    <div class="input-field col s3">
        <input class="datepicker col s5" type="text" name="projectstartdate[]" id="startdate" placeholder="Start Date">
        <input class="datepicker col s5" type="text" name="projectenddate[]" id="enddate" placeholder="End Date">
    </div>
    <div class="input-field col s1">
        <input id="removeMoreJobs" type="button" class="ui button mini white-text red accent-4" value="X">
    </div>
</div>`);
}

function AddMoreSkills(element) {
    element.append(`
    <div class="col s12">
                        <div class="input-field col s10">
                            <input type="text" name="skills[]" placeholder="Enter Your Skills">
                        </div>
                        <div class="input-field col s2">
                            <input id="removeMoreskills" type="button" class="ui button white-text mini red accent-4" value="X">
                        </div>
                        </div>
    `);
}

$(document).on('click', "#removeMoreJobs", function() {
    $(this).parent().parent().remove();
});
$(document).on('click', "#removeMoreskills", function() {
    $(this).parent().parent().remove();
});