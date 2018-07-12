let LocationContainer = $('#location-container');
        //let LocationParent = $('#location-parent');
        let counter = 1;

        function AddMoreLocation() {
            if(counter<5){
            LocationContainer.append(
                `
           <div id="location-parent">
                                <div class="col s3 right-align" style="padding-top:10px;">Location</div>
                                <div class="col s8">
                                    <select class="no-autoinit"  name="location[]">
                                            <option value="" disabled selected>Choose your option</option>
                                            <option value="Delhi">Delhi</option>
                                            <option value="New Delhi">New Delhi</option>
                                            <option value="Noida">Noida</option>
                                            <option value="Gurugram">Gurugram</option>
                                            <option value="Greater Noida">Greater Noida</option>
                                            <option value="Ghaziabad">Gaziabad</option>
                                            <option value="Faridabad">Faridabad</option>
                                            <option value="Sahibabad">Sahibabad</option>
                                            <option value="Kanpur">Kanpur</option>
                                            <option value="Luchnow">Luchnow</option>
                                            <option value="Meerut">Meerut</option>
                                            <option value="Sonipat">Sonipat</option>
                                            <option value="Ambala">Ambala</option>
                                            <option value="Agra">Agra</option>
                                            <option value="Dehradun">Dehradun</option>
                                            <option value="Chandigarh">Chandigarh</option>
                                        </select>
                                </div>
                                <div class="col s1">
                                    <input id="remove-location" type="button" class="ui button mini red white-text" value="X">
                                </div>
                                <div class="col s12" style="height:5px;"></div>
                            </div>
           `
            );
            counter++;
            }else{
            $('#add-location').attr("disabled","disabled");
            }
            console.log(counter);
        }
        $(document).on('click',"#remove-location",function(){
            if(counter <= 5){
            $('#add-location').removeAttr("disabled");
            }
            jQuery(this).parent().parent().remove();
            console.log(counter);
            counter--;
            
        });
    