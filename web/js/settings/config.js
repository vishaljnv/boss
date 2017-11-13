
$(document).ready(function() {

    if( !$.isEmptyObject(channelConfigObj) ){
        var orderConfig = "", printConfig = "", reportConfig = "";
        //checking for order configurations
        if("order" in channelConfigObj){
            orderConfig = channelConfigObj.order;
        }

        //checking for print configurations
        if("print" in channelConfigObj){
            printConfig = channelConfigObj.print;
        }

        //checking for print configurations
        if("report" in channelConfigObj){
            reportConfig = channelConfigObj.report;

            if(reportConfig.manual_cg_entry){
                $("#config_tc_manual_cg").attr("checked", true);
            }
        }

        if(orderConfig){
            if("bill_type" in orderConfig){
                if(orderConfig.bill_type){
                    $('#config_bill_type').attr("checked", true);
                }
            }

            if("vertical_sub_vertical" in orderConfig){
                if(orderConfig.vertical_sub_vertical){
                    $('#config_vertical_sub_vertical').attr("checked", true);
                }
            }
        }

        if(printConfig){
            if("reff_id" in printConfig){
                if(printConfig.reff_id){
                    $('#config_ref_id').attr("checked", true);
                }
            }

            if("invoice_bill_date" in printConfig){
                if(printConfig.invoice_bill_date){
                    $('#config_inv_bill_date').attr("checked", true);
                }
            }

            if("inv_footer_1" in printConfig){
                if(printConfig.inv_footer_1){
                    $('#config_inv_footer_1').attr("checked", true);
                }
            }

            if("inv_footer_2" in printConfig){
                if(printConfig.inv_footer_2){
                    $('#config_inv_footer_2').attr("checked", true);
                }
            }


            if("e_oe" in printConfig){
                if(printConfig.e_oe){
                    $('#config_e_oe').attr("checked", true);
                }
            }


            if("for_media" in printConfig){
                if(printConfig.for_media){
                    $('#config_for_media').attr("checked", true);
                    $("#config_for_media_name_wrapper").show();
                } else {
                    $("#config_for_media_name_wrapper").hide();
                }

                if(printConfig.for_media_name){
                    $("#config_for_media_name").val(printConfig.for_media_name);
                }
            }


            if("auth_sign" in printConfig){
                if(printConfig.auth_sign){
                    $('#config_auth_sign').attr("checked", true);
                }
            }
        }
    }

    $("#config_for_media").click(function(){
        var isChecked = $(this).is(":checked");
        if(isChecked){
            $("#config_for_media_name_wrapper").show();
        } else {
            $("#config_for_media_name_wrapper").hide();
        }
    });



	$(".cancelbutton").click(function(){
        $("#main").load("/settings/settings_menu.html");
	});

	$("#config_save").click(function(){
		console.log("config_save.............");

		var bill_type = $('#config_bill_type').is(":checked");
		var ref_id = $("#config_ref_id").is(":checked");
        var vertical = $("#config_vertical_sub_vertical").is(":checked");
        var inv_footer_1 = $("#config_inv_footer_1").is(":checked");
        var inv_footer_2 = $("#config_inv_footer_2").is(":checked");
        var e_oe = $("#config_e_oe").is(":checked");
        var for_media = $("#config_for_media").is(":checked");
        var auth_sign = $("#config_auth_sign").is(":checked");
        var for_media_name = $("#config_for_media_name").val();
        // var sub_vertical = $("#config_sub_vertical").is(":checked");

        var manual_cg_entry = $("#config_tc_manual_cg").is(":checked");
        var inv_bill_date = $("#config_inv_bill_date").is(":checked");

        var channel = $("#channel").val()
        if(!channel){
        	return;
        }

        if( $.isEmptyObject(channelConfigObj) ){ 
            console.log("Channel configurations not exist......");
            return;
        }

        var id = channelConfigObj._id;

        if( !id ){
            console.log("Invalid configuration id...");
            return;
        }

        configObj = {
        	"order":{
            			"bill_type": bill_type,
                        "vertical_sub_vertical": vertical,
        			},
        	"print":{
        		        "reff_id": ref_id,
                        "inv_footer_1": inv_footer_1,
                        "inv_footer_2": inv_footer_2,
                        "e_oe": e_oe,
                        "auth_sign": auth_sign,
                        "for_media": for_media,
                        "invoice_bill_date": inv_bill_date,
        	        },
            "report": {
                        "manual_cg_entry": manual_cg_entry,
            },
        	"channel_id": channel
        };

        if(for_media){
            if(for_media_name){
                configObj.print["for_media_name"] = for_media_name;
            } else {
                jAlert("Empty For Media name");
                return false;
            }
        }

        console.log(JSON.stringify(configObj));

		$.ajax({                     
             type:"PUT",
             url : "configurations/"+id,
             data: JSON.stringify(configObj),
            success:function(data){
                $("#main").load("/settings/settings_menu.html");
                
                //load channel configurations.
                comm_loadChannelConfig();
            },
            error: function(xhr, status, text) {
                comm_handleAjaxError(xhr);
            }
        });
	});

});


