

    var h = $(window).height() - 250;
    $("#settings_div").css({"max-height": h+"px"});

	$(document).ready(function() {

		$(".cancelbutton").click(function(){
            $("#main").load("/settings/settings_menu.html");
    	});

    	$("#settings_save").click(function(){
            var settingsObj = {}; 
    		var id = $('#application_id').val();
            var settingsObj = validate_labels_value();

			$.ajax({                     
                 type:"PUT",
                 url : "labels",
                 data: JSON.stringify(settingsObj),
                success:function(data){
                    $("#main").load("/settings/settings_menu.html");
                    // updating local object.
                    labelsMapObj = settingsObj;
                },
                error: function(xhr, status, text) {
                    comm_handleAjaxError(xhr);
                }
            });
    	});


        function validate_labels_value(){
            var settingsObj = {};

            $("#settings_fieldset .label_value").each(function(){
                var id = $(this).attr('id');
                var label = id.replace("label_", "");
                var value = $("#"+id).val();
                value = value.trim();
                label = label.replace(/_/g, " ");
                
                if (value) {
                    var moduleType = $("#"+id).attr("data-module");
                    if( !(moduleType in settingsObj) ){
                        settingsObj[moduleType] = {};
                    }
                    settingsObj[moduleType][label] = value;

                }
            });

            return  settingsObj;
        }

	});

    function buildLabelsInput(){
        if(labelsList.length <=0 ){
            console.log("Empty Label List");
            return;
        }

        var lblValStr = "";
        for(var i=0; i<labelsList.length; i++){
            var module = labelsList[i].module;
            var labels = labelsList[i].labels

            // lblValStr += "<tr><th class='label_module'>"+module+"</th><th></th></tr>";

            for(var j=0; j<labels.length; j++){
                var label = labels[j];
                var value = getLabelValue(module, labels[j]);
                var id = label.replace(/\s+/g, '_');

                var inputCls = "show_input";
                var spanCls = "hide_input";
                if(value){
                    inputCls = "hide_input";
                    spanCls = "show_input";
                }

                lblValStr += "<tr>"
                                +"<td class='label_td' id='lbl_"+id+"'>"+label+"</td>"
                                +"<td class='label_value_td' id='val_"+id+"'>"
                                    +"<span class='value_span "+spanCls+"'>"+value+"</span>"
                                    +"<input type='text' class='label_value label_value_input "+inputCls+"' value='"+value+"'' id='label_"+id+"' data-module='"+module+"' />"
                                +"</td>"
                            +"</tr>"
            }
        }
        $("#lbl_val_tbl tbody").html(lblValStr);
        initClickOnValue();
    }
    loadLabels();
    buildLabelsInput();


    function initClickOnValue(){
        $(".label_value_td").click(function(){
            var id = $(this).attr('id');
            $("#"+id+" input").show().focus();
            $("#"+id+" .value_span").hide();

            var lblId = id.replace("val_", "lbl_");
            $("#"+lblId).css({"font-weight": "bold"});
        });


        $(".label_value_input").on("focusout", function(){
            $(".label_td").css({"font-weight": "normal"});

             var id = $(this).closest('td').attr('id');
            $("#"+id+" input").hide();

            var value = $("#"+id+" input").val();
            value = value.trim();
            if(value){
                $("#"+id+" input").hide();
                $("#"+id+" .value_span").html(value).show();
            } else {
                $("#"+id+" input").show();
                $("#"+id+" .value_span").html("").hide();
            }
        });
    }


    function getLabelValue(module, label){
        var val = "";
        if($.isEmptyObject(labelsMapObj)){
            return "";
        }

        if( !$.isEmptyObject(labelsMapObj[module]) ){
        	var value = labelsMapObj[module][label];
            val = value != undefined ? value : "";
        }

        return val;
    }
		