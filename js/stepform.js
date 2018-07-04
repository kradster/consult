
    var $RESULT = $('#fullform');

    var $FORM1 = $('#form1');
    var $FORM2 = $('#form2');
    var $FORM3 = $('#form3');
    var $FORM4 = $('#form4');
    var $FORM5 = $('#form5');

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

    $STEP1.on('click',_funcN1);
    $STEP2.on('click',_funcN2);
    $STEP3.on('click',_funcN3);
    $STEP4.on('click',_funcN4);
    $STEP5.on('click',_funcN5);


    function nextStep(showform,hideform){
        showform.css('display','block');
        hideform.css('display','none');
    }

    function _funcN1(){
        nextStep($FORM2,$FORM1)
    }
    function _funcN2(){
        nextStep($FORM3,$FORM2)
    }
    function _funcN3(){
        nextStep($FORM4,$FORM3)
    }
    function _funcN4(){
        nextStep($FORM5,$FORM4)
    }
    function _funcN5(){
        nextStep($RESULT,$FORM5)
    }