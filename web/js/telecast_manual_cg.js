

$(document).off("click", ".add_new_cg_entry");
$(document).on("click", ".add_new_cg_entry", function(){
	validateNewCGEntry();
});

$(document).off("click", ".cancel_cg_entry");
$(document).on("click", ".cancel_cg_entry", function(){
	$(".add_new_cg_entry").removeAttr("data");
	$(".add_new_cg_entry").text("Add");
	$(".cg_custom_entry_header input").val("");
});


function initClickOnManualCGIcons(){
	console.log("initClickOnManualCGIcons..........");

	$(".manual_cg_row_action_icons").click(function(){

		var idStr = $(this).attr("id");
		var key = $(this).attr("data");
		if(!idStr || !key){
			console.log("Invalid ID or key...");
			return false;
		}

		var idList = idStr.split("_");
		var action = idList[0];
		var id = idList[1];

		if(action == "edit"){
			editCGEntry(key);
		}

		if(action == "delete"){
			deleteCGEntry(key);
		}

	});
}

function validateNewCGEntry(){
	var obj = {};
	obj["clip_caption"]  = $(".cg_caption").val();
	obj["advt_type"]  = $(".cg_advt_type").val();
	obj["spot_type"]  = $(".cg_spot_type").val();
	obj["package_detail"]  = $(".cg_unit_type").val();
	var units_per_day  =  $(".cg_units_per_day").val();
	var rate = $(".cg_rate").val();

	if($.isNumeric(units_per_day) == false){
		jAlert('Invalid No. units/No.days');
		return false;
	}
	if($.isNumeric(rate) == false){
		jAlert('Invalid Rate');
		return false;
	}
	obj["count"]  = units_per_day
	obj["rate"]  = rate;
	// obj["amount"]  = $(".cg_amount").val();

	for(var key in obj){
		if(obj[key] == "" || obj[key] == undefined){
			jAlert("Empty "+key.toUpperCase() );
			return false;
		} else {
			if(key == "rate" || key == "count" ){
				obj[key] = parseFloat(obj[key]);
			}
		}
	}

	if(obj.spot_type.toLowerCase() == "bonus" && obj.rate > 0){
		console.log("Reseting rate to ZERO for spot_type BONUS");
		obj.rate = 0;
	}

	obj["id"] = guid();

	console.log(obj);
	// var id = obj.clip_caption+"###"+obj.spot_type+"###"+obj.package_detail;
	var id = guid();

	var updateKey = $(".add_new_cg_entry").attr("data");
	if(updateKey){
		if(TELECAST_NFPC_DURATION_SUMMARY[updateKey]){
			delete TELECAST_NFPC_DURATION_SUMMARY[updateKey];
		}
	}

	TELECAST_NFPC_DURATION_SUMMARY[id] = obj;
	loadCGDurSummayTable("manual_cg_row");

	$(".cg_custom_entry_header input").val("");

	$(".add_new_cg_entry").attr("data", "");
	$(".add_new_cg_entry").text("Add");
	TELECAST_CERTIFICATE_FILTER_DATA['cg_log_map'] = TELECAST_NFPC_DURATION_SUMMARY;

}

function deleteCGEntry(key){
	delete TELECAST_NFPC_DURATION_SUMMARY[key];
	TELECAST_CERTIFICATE_FILTER_DATA['cg_log_map'] = TELECAST_NFPC_DURATION_SUMMARY;
	loadCGDurSummayTable("manual_cg_row");
}

function editCGEntry(key){
	var obj = TELECAST_NFPC_DURATION_SUMMARY[key];
	if(!obj){
		console.log("Invalid manual CG obj....");
		return false;
	}

	$(".cg_caption").val(obj["clip_caption"] );
	$(".cg_advt_type").val( obj["advt_type"] );
	$(".cg_spot_type").val( obj["spot_type"] );
	$(".cg_unit_type").val( obj["package_detail"] );
	$(".cg_units_per_day").val( obj["count"] );
	$(".cg_rate").val( obj["rate"] );

	$(".add_new_cg_entry").attr("data", key);
	$(".add_new_cg_entry").text("Update");
}

