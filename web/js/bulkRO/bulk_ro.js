
var broAgencyMap = {}, broCustMap = {}, prgmsArr = [], valueAdsArr = [];
var primeTimeArr = ["07:00:00_09:0000", "16:00:00_18:00:00", "20:00:00_22:00:00"];

// $(function(){
	// loading necessary details.
	bro_getChannelInfo();
	bro_getInvoiceMaster();
	bro_loadCustomers();
	bro_loadAgencies();
	bro_loadMasterPrograms();
	// bro_loadSpecialPrograms();
	bro_loadAdvtTypes();
	// bro_loadCommercials('init');

	// setting channel logo src
	var channel = $("#channel").val();
	var channel_logo = getChannelLogo(channel);
	
	$('#bro_channel_logo').prop('src',channel_logo);
	$("#selPrgmId").val("");

	$("#prgm_start_date, #prgm_end_date, #va_start_date, #va_end_date").datepicker({
		dateFormat : 'dd/mm/yy',
		showOn : "both",
		buttonImage : "javascripts/jquery-ui/development-bundle/demos/images/calendar.gif",
		buttonImageOnly : true,
		minDate: new Date(),
		onClose: function(){
			var id = $(this).attr("id");
			var date = $(this).val();
			if(date && id != "bro_date"){
				// var type = "";
				// if( $(this).hasClass("start_date") ){
				// 	type = "start";
				// }
				// if( $(this).hasClass("end_date") ){
				// 	type = "end";
				// }

				// if(type){
					var isValid = bro_validateDate(date);
					if(!isValid){
						if($("#bro_start_end_date").val()){
							jAlert("Date should be in range of Bulk RO start-end dates: "+$("#bro_start_end_date").val() );
						} else {
							jAlert("Please select start and end date for Bulk RO ");
						}
						$(this).val("");
					}
				// }
			}

		}
	});

	$("#bro_start_end_date").datepick({
		rangeSelect: true, 
		minDate: moment().format("DD/MM/YYYY"),
		monthsToShow: 1,
		showTrigger: '#calImg',
		dateFormat:'dd/mm/yyyy',
		// maxDate:'+7m',
		onClose : function(date, picker) {
	    }
    });

	// $("#bro_start_time").timepicker({ 'timeFormat': 'H:i:s','scrollDefaultNow': true, 'minTime':'00:10:00','step': 10});
	// $("#bro_end_time").timepicker({ 'timeFormat': 'H:i:s','scrollDefaultNow': true, 'minTime':'00:10:00','step': 10});

	$(".bro_readonly").attr("disabled", "true");
	$(".bro_readonly").css({"background": "#efefef"});

	function bro_validateDate(d){
		var date = $("#bro_start_end_date").val();
		if(date){
			var dateArr = date.split(" - ");
			var st_dt = moment(dateArr[0], "DD/MM/YYYY").format("YYYYMMDD");
			var ed_dt = moment(dateArr[1], "DD/MM/YYYY").format("YYYYMMDD");

			if(d){
				d = moment(d, "DD/MM/YYYY").format("YYYYMMDD");

				if(d < st_dt || d > ed_dt){
					return false;
				} else {
					return true;
				}

			} else {
				console.log("Empty Date Param..");
				return false;
			}
		} else {
			jAlert("Please select start and end date for Bulk RO ");
			return false;
		}
	}

	function bro_validateStartEndDate(start, end){
		console.log(start+" ......... "+end);
		var st_dt = moment(start, "YYYY/MM/DD").format("YYYYMMDD");
		var ed_dt = moment(end, "YYYY/MM/DD").format("YYYYMMDD");

		if( st_dt > ed_dt ){
			return false;
		} else {
			return true;
		}
	}

	//to get random unique id for UI reference in progrms/value_ads CRUD in UI.
	function guid() {
	  return "rand"+s4() + s4() + s4() + s4() + s4();
	}
	function s4() {
	  return Math.floor((1 + Math.random()) * 0x10000)
	    .toString(16)
	    .substring(1);
	}

	$("#bro_prgms_input_toggle").click(function(){
		$("#bro_prgms_input_row").toggle();
	});

	$("#bro_va_input_toggle").click(function(){
		$("#bro_va_input_row").toggle();
	});

	$(".bro_prgm_days").on("change", function(){
		var days = $(this).val();
		if(days.length){
			//if user selects "from Program" option, remove all other options.
			if(days.indexOf("-1") != -1 ){
				$(this).val(["-1"]);
			}
		}
	});

	$("#bro_prgm_gen_from").on("change", function(){
		var prgm_type = $("#bro_prgm_gen_from").val();
		$("#bro_prgms_select, #bro_va_select").attr("data", prgm_type);
		console.log("prgm_type.........."+prgm_type);

		if(prgm_type == "master"){
			$("#bro_prgms_select, #bro_va_select").html("");
			bro_buildPrgmsList(masterPrgmsArr);
		}
		if(prgm_type == "special") {
			$("#bro_prgms_select, #bro_va_select").html("");
			bro_buildPrgmsList(specialPrgmsArr);
		}
	});

	$("#bro_add_prgm").click(function(){
		$("#selPrgmId").val("");
		var prgm_id = $("#bro_prgms_select").val();
		// var prgm_name = $("#bro_prgms_select option:selected").text();
		var ad_type_id = $("#bro_prgm_advt_types").val();
		var advt_type = $("#bro_prgm_advt_types option:selected").text();
		var days = $("#bro_prgm_days").val();


		advt_type = "  ";

		if(prgm_id != null){
			if(prgm_id.length <=0 ){
				jAlert("Please select a Program");
				return;
			}
		} else {
			jAlert("Please select a Program");
			return;
		}
		
		// if( prgm_id == -1){
		// 	jAlert("Please select a valid Program");
		// 	return;
		// }
		if(ad_type_id ==null || (ad_type_id.length == 1 && ad_type_id[0] == -1) ){
			jAlert("Please select a valid Advertisement type");
			return;
		}
		
		var episodes = "", start_date = "", end_date = "", dur = "", rate = "", temp = {};
		var data = $("#bro_prgms_select").attr("data");

		if($("#bro_prgm_episodes").val()){
			episodes = $("#bro_prgm_episodes").val();
			temp["num_spots"] = episodes;
		}	
		if($("#prgm_start_date").val()){
			start_date = $("#prgm_start_date").val();
			temp["start_date"] = moment(start_date, "DD/MM/YYYY").format("YYYY/MM/DD");;
		} else {
			jAlert("Please select a start date");
			return;
		}
		if($("#prgm_end_date").val()){
			end_date = $("#prgm_end_date").val();
			temp["end_date"] = moment(end_date, "DD/MM/YYYY").format("YYYY/MM/DD");;
		} else {
			jAlert("Please select a end date");
			return;
		}

		var isValid = bro_validateStartEndDate(temp["start_date"], temp["end_date"]);
		if(!isValid){
			jAlert("End date should be greater than or equal start date");
			return;
		}

		temp["program_wise"] =  true
		temp["program_gen_from"] =  data;

		
		temp["days"] = [];
		if(days==null)
			days = -1
		if(temp["program_gen_from"] == "master" && days.length > 0){
			for(var i=0; i<days.length; i++){
				if(days[i] != -1){
					temp["days"].push(days[i]);
				}
			}
		}
		
		for(var i=0; i<prgm_id.length; i++){
			var prgmId = prgm_id[i];

			for(var j=0; j<ad_type_id.length; j++){
				var adId = ad_type_id[j];
				var newObj = {};
				
				newObj = $.extend(true, {}, temp);

				newObj["_id"] = guid();
				newObj["program_id"] =  prgmId;
				newObj["ad_type_id"] =  adId;
				newObj["type"] =  broAdvtIdNameMap[adId];		
				prgmsArr.push(newObj);
			}
		}
		
		buildPrgmRows(prgmsArr);

		$("#bro_prgm_advt_types, #bro_prgm_days").val("-1");
		$("#bro_prgms_select").val("any");
		$("#prgm_start_date, #bro_prgm_episodes, #prgm_end_date").val("");

		$("#bro_prgms_input_toggle").show();
		$("#bro_prgms_input_row").hide();

		$("#bro_cancel_prgm").trigger("click");

	});

	$("#bro_cancel_prgm").click(function(){
		$("#selPrgmId").val("");
		$("#bro_prgm_advt_types, #bro_prgm_days").val("-1");
		$("#bro_prgms_select").val("any");
		$("#prgm_start_date, #bro_prgm_episodes, #prgm_end_date, #bro_prgm_com_id").val("");
		$(".bro_update_prgm").hide();
		$("#bro_add_prgm").show();
		$("#bro_prgm_advt_types, #bro_prgms_select").attr("multiple", true);

		$("#bro_prgms_input_toggle").show();
		$("#bro_prgms_input_row").hide();
	});

	$("#bro_update_prgm").click(function(){
		var rowId = $("#selPrgmId").val();
		var prgm_id = $("#bro_prgms_select").val();
		// var prgm_name = $("#bro_prgms_select option:selected").text();
		var ad_type_id = $("#bro_prgm_advt_types").val();
		var advt_type = $("#bro_prgm_advt_types option:selected").text();
		var days = $("#bro_prgm_days").val();

		if( prgm_id == -1){
			jAlert("Please select a valid Program");
			return;
		}

		if( ad_type_id == -1){
			jAlert("Please select a valid Advertisement type");
			return;
		}
		if(!rowId){
			console.log("INVALID ROW ID");
			return;
		}

		var prgm = getPrgmObj(rowId.replace("prgm_", ""));
		if( $.isEmptyObject(prgm) ){
			console.log("EMPTY PRGM OBJECT while update.....");
			return;
		}
		var data = $("#bro_prgms_select").attr("data");
		console.log("advt_type: "+advt_type);

		prgm["program_id"] =  prgm_id;
		prgm["ad_type_id"] = ad_type_id;
		prgm["type"] = advt_type;
		prgm["program_wise"] = true;
		prgm["program_gen_from"] = data;

		if($("#bro_ro_num").val()){
			prgm["ro_number"] = $("#bro_ro_num").val()
		}

		if($("#bro_prgm_episodes").val()){
			episodes = $("#bro_prgm_episodes").val();
			prgm["num_spots"] = episodes;
		}	
		if($("#prgm_start_date").val()){
			start_date = $("#prgm_start_date").val();
			prgm["start_date"] = moment(start_date, "DD/MM/YYYY").format("YYYY/MM/DD");
		} else {
			jAlert("Please select a start date");
			return;
		}
		if($("#prgm_end_date").val()){
			end_date = $("#prgm_end_date").val();
			prgm["end_date"] = moment(end_date, "DD/MM/YYYY").format("YYYY/MM/DD");
		} else {
			jAlert("Please select a end date");
			return;
		}

		var isValid = bro_validateStartEndDate(prgm["start_date"], prgm["end_date"]);
		if(!isValid){
			jAlert("End date should be greater than or equal start date");
			return;
		}

		prgm["days"] = [];
		if(prgm["program_gen_from"] == "master" && days.length > 0){
			for(var i=0; i<days.length; i++){
				if(days[i] != -1){
					prgm["days"].push(days[i]);
				}
			}
		}

		buildPrgmRows(prgmsArr);

		$("#bro_prgm_advt_types, #bro_prgm_days").val("-1");
		$("#bro_prgms_select").val("any");
		$("#prgm_start_date, #bro_prgm_episodes, #prgm_end_date, #bro_prgm_com_id").val("");
		$(".bro_update_prgm").hide();
		$("#bro_add_prgm").show();

		$("#bro_prgm_advt_types, #bro_prgms_select").attr("multiple", true);

		$("#bro_prgms_input_toggle").show();
		$("#bro_prgms_input_row").hide();

	});

	function initClickPrgms(){

		$(".bro_edit_prgm").click(function(){ 
			
			$("#bro_prgms_input_row").show();
			$("#bro_prgms_input_toggle").hide();

			$("#selPrgmId").val("");
			var prgm_id = $(this).attr('value');
			var id = $(this).closest('tr').attr('id');
			if(id){
				$("#selPrgmId").val(id);
			}

			var prgm = getPrgmObj(id.replace("prgm_", ""));
			$("#bro_prgm_advt_types, #bro_prgm_days").val("-1");
			$("#bro_prgms_select").val("any");
			$("#prgm_start_date, #bro_prgm_episodes, #prgm_end_date, #bro_prgm_com_id").val("");

			$("#bro_prgm_advt_types, #bro_prgms_select").removeAttr("multiple");


			if( $.isEmptyObject(prgm) ){
				console.log("EMPTY PRGM OBJECT");
				return;
			}

			var isProgram = prgm.program_wise;
			var firstCellStr = "";
			
			$("#bro_prgm_gen_from_tr").show();
			$("#bro_prgms_select").show();
			$(".bro_dptime").hide();

			if(prgm.program_gen_from == "master"){
				bro_buildPrgmsList(masterPrgmsArr);
				$("#bro_prgms_select").val(prgm.program_id);
			}
			if(prgm.program_gen_from == "special"){
				bro_buildPrgmsList(specialPrgmsArr);
				$("#bro_prgms_select").val(prgm.program_id);
			}

			$("#bro_prgm_advt_types").val(prgm.ad_type_id);

			if(prgm.ro_number != undefined){
				$("#bro_ro_num").val(prgm.ro_number);
			}

			if(prgm.num_spots != undefined){
				$("#bro_prgm_episodes").val(prgm.num_spots);
			}

			if(prgm.start_date != undefined){
				$("#prgm_start_date").val(moment(prgm.start_date, "YYYY/MM/DD").format("DD/MM/YYYY") );
			}

			if(prgm.end_date != undefined){
				$("#prgm_end_date").val(moment(prgm.end_date, "YYYY/MM/DD").format("DD/MM/YYYY") );
			}

			if("clip_id" in prgm){
				$("#bro_prgm_com_id").val(prgm.clip_id);
			}

			if("days" in prgm){
				if(prgm.days.length){
					$("#bro_prgm_days").val(prgm.days);
				}
			}

			$(".bro_update_prgm").show();
			$("#bro_add_prgm").hide();
		});

		$(".bro_delete_prgm").click(function(){
			var id = $(this).closest('tr').attr('id');
			if(id){
				id = id.replace("prgm_", "");
			} else {
				console.log("INVALID Item ID....");
				return;
			}

			jConfirm('Do you want to delete this Program Entry?', 'Program', function(response) {
				if(response){
					var prgmIdx = getPrgmIndex(id);
					if(prgmIdx != null){
						prgmsArr.splice(prgmIdx, 1);
						buildPrgmRows(prgmsArr);
					}
				}
			});
		});
	}

	$("#bro_add_va").click(function(){
		$("#selVaId").val("");
		var program_id = $("#bro_va_select").val();
		var ad_type_id = $("#bro_va_advt_types").val();
		var days = $("#bro_va_days").val();
		// var advt_type = $("#bro_va_advt_types option:selected").text();

		var isPrgmWise = $("#bro_va_select").is(":visible");

		if(isPrgmWise && program_id != null){
			if(program_id.length == 0){
				jAlert("Please select a valid Program ");
				return;
			}
		}
		if(program_id == null){
			jAlert("Please select a valid Program ");
				return;
		}
		if( ad_type_id ==null || ad_type_id == -1){
			jAlert("Please select a valid Advertisement type");
			return;
		}

		// if( isDuplicatePrgm(prgm_id, null) ){
		// 	jAlert("Duplicate Program entry");
		// 	return;
		// }
		
		var episodes = "", start_date = "", end_date = "", dur = "", rate = "", temp = {};
		var data = $("#bro_va_select").attr("data");

		if($("#bro_va_episodes").val()){
			episodes = $("#bro_va_episodes").val();
			temp["num_spots"] = episodes;
		}	
		if($("#va_start_date").val()){
			start_date = $("#va_start_date").val();
			temp["start_date"] = moment(start_date, "DD/MM/YYYY").format("YYYY/MM/DD");;
		} else {
			jAlert("Please select a start date");
			return;
		}
		if($("#va_end_date").val()){
			end_date = $("#va_end_date").val();
			temp["end_date"] = moment(end_date, "DD/MM/YYYY").format("YYYY/MM/DD");;
		} else {
			jAlert("Please select a end date");
			return;
		}

		var isValid = bro_validateStartEndDate(temp["start_date"], temp["end_date"]);
		if(!isValid){
			jAlert("End date should be greater than or equal start date");
			return;
		}

		temp["days"] = [];
		if(data == "master" && days.length > 0){
			for(var i=0; i<days.length; i++){
				if(days[i] != -1){
					temp["days"].push(days[i]);
				}
			}
		}

		if(isPrgmWise){
			temp["program_wise"] =  true;
			if(data != undefined){
				temp["program_gen_from"] =  data;
			} else {
				console.log("undefined va program_gen_from....");
				return;
			}

			for(var i=0; i<program_id.length; i++){
				var prgmId = program_id[i];
				for(var j=0; j<ad_type_id.length; j++){
					var newObj = {};
					var adId = ad_type_id[j];
					newObj = $.extend(true, {}, temp);
				
					newObj["_id"] = guid();
					newObj["program_id"] =  prgmId;
					newObj["ad_type_id"] =  adId;
					newObj["type"] =  broAdvtIdNameMap[adId];		
					valueAdsArr.push(newObj);
				}
			}

		} else {
			var value = $("#bro_va_caption").val();
			if(value){
				temp["value_ad_name"] =  value;
			} else {
				jAlert("Empty Value Add");
				return;
			}


			for(var i=0; i<ad_type_id.length; i++){
				var newObj = {};
				var adId = ad_type_id[i];
				newObj = $.extend(true, {}, temp);
			
				newObj["_id"] = guid();
				newObj["program_id"] =  prgmId;
				newObj["ad_type_id"] =  adId;
				newObj["type"] =  broAdvtIdNameMap[adId];		
				valueAdsArr.push(newObj);
			}
		}

		buildValueAdsRows(valueAdsArr);
		// console.log(valueAdsArr);

		$("#bro_va_advt_types, #bro_va_days").val("-1");
		$("#bro_va_select").val("any");
		$("#va_start_date, #bro_va_episodes, #va_end_date, #bro_va_caption").val("");

		$("#bro_va_input_toggle").show();
		$("#bro_va_input_row").hide();

		$("#bro_cancel_va").trigger("click");
	});

	$("#bro_cancel_va").click(function(){
		$("#selVaId").val("");
		$("#bro_va_advt_types, #bro_va_days").val("-1");
		$("#bro_va_select").val("any");
		$("#va_start_date, #bro_va_episodes, #va_end_date, #bro_va_caption").val("");
		$(".bro_update_va").hide();
		$("#bro_add_va").show();
		$("#bro_va_advt_types, #bro_va_select").attr("multiple", true);

		$("#bro_va_input_toggle").show();
		$("#bro_va_input_row").hide();
	});


	$("#bro_update_va").click(function(){
		
		var rowId = $("#selVaId").val();
		var program_id = $("#bro_va_select").val();
		var ad_type_id = $("#bro_va_advt_types").val();
		var advt_type = $("#bro_va_advt_types option:selected").text();
		var days = $("#bro_va_days").val();

		if(program_id == -1){
			jAlert("Please select a valid Program");
			return;
		}
		if( ad_type_id == -1){
			jAlert("Please select a valid Advertisement type");
			return;
		}
		if(!rowId){
			console.log("INVALID ROW ID");
			return;
		}
		
		// if( isDuplicatePrgm(va_id, rowId.replace("va_", "")) ){
		// 	jAlert("Duplicate Program entry");
		// 	return;
		// }

		var obj = getValueAdsObj(rowId);
		if( $.isEmptyObject(obj) ){
			console.log("EMPTY VALUE ADS OBJECT while update.....");
			return;
		}

		var data = $("#bro_va_select").attr("data");
		var isPrgmWise = $("#bro_va_select").is(":visible");

		if(isPrgmWise){
			obj["program_id"] =  program_id;
			obj["program_wise"] = true;

			if("value_ad_name" in obj){
				delete obj["value_ad_name"];
			}
			
			obj["program_gen_from"] = data;

		} else {
			obj["program_wise"] = false;
			if("program_gen_from" in obj){
				delete obj["program_gen_from"];
			}

			var value = $("#bro_va_caption").val();
			if(value){
				obj["value_ad_name"] =  value;
			} else {
				jAlert("Empty Value Add");
				return;
			}

		}
		
		obj["ad_type_id"] =  ad_type_id;
		obj["type"] =  advt_type;

		if($("#bro_va_episodes").val()){
			episodes = $("#bro_va_episodes").val();
			obj["num_spots"] = episodes;
		}	
		if($("#va_start_date").val()){
			start_date = $("#va_start_date").val();
			obj["start_date"] = moment(start_date, "DD/MM/YYYY").format("YYYY/MM/DD");;
		} else {
			jAlert("Please select a start date");
			return;
		}
		if($("#va_end_date").val()){
			end_date = $("#va_end_date").val();
			obj["end_date"] = moment(end_date, "DD/MM/YYYY").format("YYYY/MM/DD");;
		} else {
			jAlert("Please select a end date");
			return;
		}

		var isValid = bro_validateStartEndDate(obj["start_date"], obj["end_date"]);
		if(!isValid){
			jAlert("End date should be greater than or equal start date");
			return;
		}

		obj["days"] = [];
		if(obj["program_gen_from"] == "master" && days.length > 0){
			for(var i=0; i<days.length; i++){
				if(days[i] != -1){
					obj["days"].push(days[i]);
				}
			}
		}
		
		console.log(obj);

		buildValueAdsRows(valueAdsArr);

		$("#bro_va_advt_types, #bro_va_days").val("-1");
		$("#bro_va_select").val("any");
		$("#va_start_date, #bro_va_episodes, #va_end_date, #bro_va_caption").val("");
		$(".bro_update_va").hide();
		$("#bro_add_va").show();
		$("#bro_va_advt_types, #bro_va_select").attr("multiple", true);

		$("#bro_va_input_toggle").show();
		$("#bro_va_input_row").hide();

	});

	function initClickValueAds(){ 

		$(".bro_edit_va").click(function(){ 
			
			$("#bro_va_input_toggle").hide();
			$("#bro_va_input_row").show();

			$("#selVaId").val("");
			var id = $(this).closest('tr').attr('id');
			if(id){
				id = id.replace("va_", "");
				$("#selVaId").val(id);
			}

			var rowItem = getValueAdsObj(id);
			$("#bro_va_advt_types, #bro_va_days").val("-1");
			$("#bro_va_select").val("any");
			$("#va_start_date, #bro_va_episodes, #va_end_date, #bro_va_caption").val("");
			$("#bro_va_advt_types, #bro_va_select").removeAttr("multiple");

			if( $.isEmptyObject(rowItem) ){
				console.log("EMPTY VALUE ADS OBJECT");
				return;
			}

			if(rowItem.program_wise){
				if(rowItem.program_gen_from == "master"){
					bro_buildPrgmsList(masterPrgmsArr);
				} else {
					bro_buildPrgmsList(specialPrgmsArr);
				}
				$("#bro_va_select").val(rowItem.program_id);
				$("#bro_va_caption").hide();
				$("#bro_va_select").show();
				$("#va_others_link").text("Others");
			} else {
				$("#bro_va_caption").val(rowItem.value_ad_name);
				$("#bro_va_select").hide();
				$("#bro_va_caption").show();
				$("#va_others_link").text("< Back");
			}

			$("#bro_va_advt_types").val(rowItem.ad_type_id);
			if(rowItem.num_spots != undefined){
				$("#bro_va_episodes").val(rowItem.num_spots);
			}

			if(rowItem.start_date != undefined){
				$("#va_start_date").val( moment(rowItem.start_date, "YYYY/MM/DD").format("DD/MM/YYYY") );
			}

			if(rowItem.end_date != undefined){
				$("#va_end_date").val(moment(rowItem.end_date, "YYYY/MM/DD").format("DD/MM/YYYY") );
			}

			if('days' in rowItem){
				if(rowItem.days.length){
					$("#bro_va_days").val(rowItem.days);
				}
			}

			$(".bro_update_va").show();
			$("#bro_add_va").hide();
			
		});


		$(".bro_delete_va").click(function(){
			var id = $(this).closest('tr').attr('id');
			if(id){
				id = id.replace("va_", "");
			} else {
				console.log("INVALID Item ID....");
				return;
			}

			jConfirm('Do you want to delete this Value Ads Entry?', 'Value Ads', function(response) {
				if(response){
					var vaIdx = getValueAdsIndex(id);
					if(vaIdx != null){
						valueAdsArr.splice(vaIdx, 1);
						buildValueAdsRows(valueAdsArr);
					}
				}
			});
		});
	}

	function getValueAdsObj(id){

		var obj = {};
		if(valueAdsArr.length){
			for(var i=0; i<valueAdsArr.length; i++){
				if(id == valueAdsArr[i]._id){
					obj = valueAdsArr[i];
					break;
				}
			}
		}
		return obj;
	}

	function buildValueAdsRows(valueAds){

		if(valueAds.length)	{
			var rowStr = "";
			for(var i=0; i< valueAds.length; i++){
				var item = valueAds[i];
				var duration = item.duration != undefined ? item.duration : "";
				var rate = item.rate != undefined ? item.rate : "";
				var episodes = item.num_spots != undefined ? item.num_spots : "";
				var name = "";
				if(item.program_wise){
					if(item.program_gen_from == "master"){
						name = getProgramInfo(masterPrgmsArr, item.program_id, "master");
					}
					if(item.program_gen_from == "special"){
						name = getProgramInfo(specialPrgmsArr, item.program_id, "special");
					}
				} else {
					name = item.value_ad_name;
				}

				var dayStr = "";
				if("days" in item){
					if(item.days.length){						
						for(var j=0; j<item.days.length; j++){
							var day = item.days[j];
							dayStr += day.substring(0, 3);
							if(j<item.days.length-1){
								dayStr += ", ";
							}
						}
					}
				}

				rowStr += '<tr id="va_'+item._id+'">'
							+'<td>'+name+'</td>'
							+'<td>'+item.type+'</td>'
							+'<td>'+dayStr+'</td>'
							+'<td>'+episodes+'</td>'
							+'<td>'+moment(item.start_date, "YYYY/MM/DD").format("DD/MM/YYYY")+'</td>'
							+'<td>'+moment(item.end_date, "YYYY/MM/DD").format("DD/MM/YYYY")+'</td>'
							+'<td class="action_col">'
								+'<i class="fa fa-pencil text-primary bro_edit_va" title="Edit Value Ads" value="'+item.program_id+'" ></i>'
								+'<i class="fa fa-trash text-danger bro_delete_va" title="Delete Value Ads" value="'+item.program_id+'" ></i>'
							+'</td>'
						  +'</tr>';

			}
			$("#bro_value_ads_tbl tbody").html(rowStr);
			initClickValueAds();
		}
	}

	function getValueAdsIndex(id){
		var index = null;
		if(valueAdsArr.length){
			for(var i=0; i<valueAdsArr.length; i++){
				if(id == valueAdsArr[i]._id){
					index = i;
					break;
				}
			}
		}
		return index;
	}

	function getPrgmIndex(id){
		var index = null;
		if(prgmsArr.length){
			for(var i=0; i<prgmsArr.length; i++){
				if(id == prgmsArr[i]._id){
					index = i;
					break;
				}
			}
		}
		return index;

	}

	function getPrgmObj(id){
		var prgm = {};
		if(prgmsArr.length){
			for(var i=0; i<prgmsArr.length; i++){
				if(id == prgmsArr[i]._id){
					prgm = prgmsArr[i];
					break;
				}
			}
		}
		return prgm;
	}

	function isDuplicatePrgm(prgmId, objId){
		var duplicate = false;
		if(prgmsArr.length){
			for(var i=0; i<prgmsArr.length; i++){
				var item = prgmsArr[i];
				if(objId == null || objId == undefined){
					console.log(item.program_id+" .......... "+ prgmId);
					if(item.program_id == prgmId){
						duplicate = true;
					}
				} else if(objId){
					if(item._id != objId && item.program_id == prgmId){
						duplicate = true;
					}
				}
			}
		}

		return duplicate;
	}

	function getProgramInfo(arr, id, prgmType){
		var str = "";
		if(id != undefined){
			for(var i=0; i<arr.length; i++){
				var item = arr[i];
				if(id == item._id){
					var endTime = "";
					if("end_time" in item){
						endTime = item.end_time;
					}
					var daysStr = "";
					if(prgmType == "master" && item.days.length){
						for(var j=0; j<item.days.length; j++){
							var day = item.days[j];
							daysStr += day.substring(0, 3);
							if(j < item.days.length-1){
								daysStr += ", "
							}
						}
						str = item.program_name+" <span title='Program start and end time' style='font-size:12px;color:#7796BF;'>( "+item.start_time+" - "+endTime+" )</span><br><span title='Program allocated days' style='font-size:12px;color:#7796BF;'>( "+daysStr+" )</span>";
					} 

					if(prgmType == "special"){
						var date = moment(item.date, "YYYY/MM/DD").format("DD/MM/YYYY, ddd");
						str = item.program_name+" <span title='Program start and end time' style='font-size:12px;color:#7796BF;'>( "+item.start_time+" - "+endTime+" )</span><br><span title='Program allocated days' style='font-size:12px;color:#7796BF;'>( "+date+" )</span>";
					}
					
					break;
				}
			}
		}
		return str;
	}

	function buildPrgmRows(programs){

		if(programs.length)	{
			var rowStr = "";
			for(var i=0; i< programs.length; i++){

				var item = programs[i];
				var duration = item.duration != undefined ? item.duration : "";
				var rate = item.rate != undefined ? item.rate : "";
				var episodes = item.num_spots != undefined ? item.num_spots : "";

				var isProgram = item.program_wise;
				var firstCellStr = "";
				if(!isProgram){
					firstCellStr = item.start_time+" - "+item.end_time;
				} else {

					if(item.program_gen_from == "master"){
						firstCellStr = getProgramInfo(masterPrgmsArr, item.program_id, "master");
					}
					if(item.program_gen_from == "special"){
						firstCellStr = getProgramInfo(specialPrgmsArr, item.program_id, "special");
					}
				}

				var clipId = "";
				if("clip_id" in item){
					clipId = item["clip_id"];
				}
				//  else {
				// 	clipId = "(to be generated)"
				// }

				var dayStr = "";
				if("days" in item){
					if(item.days.length){						
						for(var j=0; j<item.days.length; j++){
							var day = item.days[j];
							dayStr += day.substring(0, 3);
							if(j<item.days.length-1){
								dayStr += ", ";
							}
						}
					}
				}
				
				rowStr += '<tr id="prgm_'+item._id+'">'
							+'<td>'+firstCellStr+'</td>'
							+'<td>'+item.type+'</td>'
							+'<td>'+dayStr+'</td>'
							+'<td>'+episodes+'</td>'
							+'<td>'+moment(item.start_date, "YYYY/MM/DD").format("DD/MM/YYYY")+'</td>'
							+'<td>'+moment(item.end_date, "YYYY/MM/DD").format("DD/MM/YYYY")+'</td>'
							+'<td class="bro_prgm_clip">'+clipId+'</td>'
							+'<td class="action_col">'
								+'<i class="fa fa-pencil text-primary bro_edit_prgm" title="Edit Programs" value="'+item.program_id+'" ></i>'
								+'<i class="fa fa-trash text-danger bro_delete_prgm" title="Delete Programs" value="'+item.program_id+'" ></i>'
							+'</td>'
						  +'</tr>';

			}
			$("#bro_prgms_tbl tbody").html(rowStr);
			initClickPrgms();
		}
	}

	$("#bro_customer_filter").on('keydown', function(){
		$("#bro_customer_id").val('');
	});

	$("#bro_customer_filter").focusout(function(){
		var custId = $("#bro_customer_id").val();
		var custStr = $("#bro_customer_filter").val();
		custStr = custStr.trim();

		if(!custId && custStr){
			if( !$.isEmptyObject(broCustMap) ){
				for(key in broCustMap){
					var name = broCustMap[key];
					if ( name.toUpperCase() === custStr.toUpperCase() ) {
						$("#bro_customer_id").val(key);
						// load_agencies();
						setCustomerAddress(key);
						return;
					}	
				}
			}
		}
	});

	$("#bro_agency_filter").on('keydown', function(){
		$("#bro_agency_id").val('');
	});

	$("#bro_agency_filter").focusout(function(){
		var agencyId = $("#bro_agency_id").val();
		var agencyStr = $("#bro_agency_filter").val();
		agencyStr = agencyStr.trim();

		if(!agencyId && agencyStr){
			if( !$.isEmptyObject(broAgencyMap) ){
				for(key in broAgencyMap){
					var name = broAgencyMap[key];
					if ( name.toUpperCase() === agencyStr.toUpperCase() ) {
						$("#bro_agency_id").val(key);
						setAgencyAddress(key);
						return;
					}	
				}
			}
		}
	});


	function setCustomerAddress(custId){
		$("#bro_cust_address span, #bro_cust_ph").html("");
		if(cust.length){
			for(var i=0; i<cust.length; i++){
				var item = cust[i];
				if(custId == item._id){
					if( item.address != null ){
						var adrs = item.address;
						setAdrs(adrs, "cust");
					}

					if(item.telephone && item.telephone != undefined){
						$("#bro_cust_ph").html(item.telephone);
					}
					break;
				}
			}
		}
	}

	function setAgencyAddress(agencyId){
		$("#bro_agency_address span, #bro_agency_ph").html("");
		if(agency_list.length){
			for(var i=0; i<agency_list.length; i++){
				var item = agency_list[i];

				if(agencyId == item._id){
					if( item.address != null ){
						var adrs = item.address;
						setAdrs(adrs, "agency");
					}

					if(item.telephone && item.telephone != undefined){
						$("#bro_agency_ph").html(item.telephone);
					}
					break;
				}
			}
		}
	}

	function setAdrs(adrs, eleId){

		if(adrs.street){
			$("#bro_"+eleId+"_street").html(adrs.street+", ");
		} else {
			$("#bro_"+eleId+"_street").html("");
		}

		if(adrs.area){
			$("#bro_"+eleId+"_area").html(adrs.area+", ");
		} else {
			$("#bro_"+eleId+"_area").html("");
		}

		if(adrs.landmark){
			$("#bro_"+eleId+"_landmark").html(adrs.landmark+", ");
		} else {
			$("#bro_"+eleId+"_landmark").html("");
		}

		if(adrs.city){
			$("#bro_"+eleId+"_city").html(adrs.city);
		} else {
			$("#bro_"+eleId+"_city").html("");
		}

		if(adrs.pincode){
			$("#bro_"+eleId+"_pincode").html(" - "+adrs.pincode);
		} else {
			$("#bro_"+eleId+"_pincode").html("");
		}
	}

	function bro_getChannelInfo(){
		$.ajax({
			url:'channels?channel_id='+$("#channel").val(),
			success:function(data){
				if(data.channels.length){
					var channel = data.channels[0];
					var adrs = channel.address;
					bro_updateAddressHtml(adrs);
				}
			},
			error: function(error){
				comm_handleAjaxError(error);
			}
		});
	}

	var salesTax = 0;
	function bro_getInvoiceMaster(){
		$("#bro_agency_commission").val("");
		$.ajax({
			dataType: 'JSON',
			url: 'invoice_master?channel_id='+$("#channel").val(),
			success: function(data) {
				if('invoice_master' in data){
					var item = data['invoice_master'][0];
					if(item.agency_commission && item.agency_commission != undefined){
						$("#bro_agency_commission").val(item.agency_commission);
					}

					if(item.sales_tax && item.sales_tax != undefined){
						// $("#fct_service_tax").val(item.sales_tax);
						salesTax = item.sales_tax;
					}
				}
			},
			error: function(error){
				comm_handleAjaxError(error);
			}
		});

	}

	function bro_updateAddressHtml(adrs){
		if(adrs && adrs!= undefined){
			if(adrs.street){
				$("#bro_street").html(adrs.street+", ");
			} else {
				$("#bro_street").html("");
			}

			if(adrs.area){
				$("#bro_area").html(adrs.area+", ");
			} else {
				$("#bro_area").html("");
			}

			if(adrs.landmark){
				$("#bro_landmark").html(adrs.landmark+", ");
			} else {
				$("#bro_landmark").html("");
			}

			if(adrs.city){
				$("#bro_city").html(adrs.city+", ");
			} else {
				$("#bro_city").html("");
			}

			if(adrs.pincode){
				$("#bro_pincode").html(adrs.pincode);
			} else {
				$("#bro_pincode").html("");
			}
		}
	}

	var broAgencyArr = [], agency_list = [];
	function bro_loadAgencies(){
	  customer_id = $("#customer_id").val();
	  url = '/agencies?channel_id='+channel;

	  broAgencyArr = [];
	  $.ajax({
			dataType: "json",
			url: url,
			success: function( result) {
				agency_list = [];
				broAgencyMap = {};

				if(result.agencies == undefined){
			    	return;
			    } else {
			    	agency_list = result.agencies;
			    }
			
		    	for(var j=0;j<agency_list.length;j++){
		    		var name = agency_list[j].name, id = agency_list[j]._id;

		    		broAgencyArr.push({"label": name.toUpperCase(), "value": id });
		    		broAgencyMap[id] = name;
		    	}

		    	// Autocomplete initialization
			    $("#bro_agency_filter").autocomplete({
			    	minLength:0,
			    	source: function( request, response ) {
			    		var matches = [];	
			    		for(var i=0; i<broAgencyArr.length; i++){
			    			var item = broAgencyArr[i];
			    			var name = item.label;
							if ( name.toUpperCase().indexOf(request.term.toUpperCase()) === 0 ) {
								matches.push(item);
							}
			    		}
			    		if(request.term == ""){
							matches = broAgencyArr;
						}
					    response(matches);
					},
					focus: function(event, ui) {
						event.preventDefault();
						$(this).val(ui.item.label);
					},
					select: function(event, ui) {
						event.preventDefault();
						$(this).val(ui.item.label);
						$("#bro_agency_id").val(ui.item.value);
						setAgencyAddress(ui.item.value);
					}
				});

				$("#bro_agency_filter").unbind("click");
				$("#bro_agency_filter").on("click, focus", function(){
					if($("#bro_agency_filter").val() == ""){
						$("#bro_agency_filter").autocomplete("search", "");
					}
				});

			},
			error: function(xhr, status, text) {
	            comm_handleAjaxError(xhr);
	        }
		});
	}

	var broCustArr = [], broCustAdrsMap = {}, cust = [];
	function bro_loadCustomers(type){

		$.ajax({
			dataType: "json",
			url: 'customers?status=active&channel_id='+channel,
			success: function(result) {
				broCustArr = [], broCustAdrsMap = {};
				if(type == undefined){
					broCustMap = {};
				}
				if( result.customers == undefined){
					return;
				}
				if( !result.customers.length ){
					console.log("Empty customers");
					return;
				}
				cust = [];
		    	cust = result.customers;
		    	if(cust.length){

			    	for(var i=0; i<cust.length; i++){
					    broCustArr.push({"label": cust[i].name.toUpperCase(), "value": cust[i]._id });
					    broCustMap[cust[i]._id] = cust[i].name;
			    	}
			    	bro_initCustAutocomplete();
				}

			},
			error: function(xhr, status, text) {
				comm_handleAjaxError(xhr);
			} 
		});
	}

	function bro_initCustAutocomplete(){
		$("#bro_customer_filter").autocomplete({
	    	minLength: 0,
	    	source: function( request, response ) {
	    		var matches = [];	
	    		for(var i=0; i<broCustArr.length; i++){
	    			var item = broCustArr[i];
	    			var name = item.label;
					if ( name.toUpperCase().indexOf(request.term.toUpperCase()) === 0 ) {
						matches.push(item);
					}
	    		}

	    		if(request.term == ""){
					matches = broCustArr;
				}

			    response(matches);
			},
			focus: function(event, ui) {
				event.preventDefault();
				$(this).val(ui.item.label);
				console.log("focus");
			},
			select: function(event, ui) {
				event.preventDefault();
				$(this).val(ui.item.label);
				$("#bro_customer_id").val(ui.item.value);

				var customerId = $('#bro_customer_id').val();

				if(customerId!="" && customerId!="0"){
					// load_agencies();
					setCustomerAddress(customerId);
				}else{
					jAlert("Please select a customer");
				}
				return;
			}
		});
		
		$("#bro_customer_filter").unbind("click");
		$("#bro_customer_filter").on("click, focus", function(){
			if($("#bro_customer_filter").val() == ""){
				$("#bro_customer_filter").autocomplete("search", "");
			}
		});
	}

	function bro_loadMasterPrograms(){
		var channel = $("#channel").val();
		if(!channel){
			return;
		}

		var url =  '/master-programs?channel_id='+channel;
		$.ajax({
			dataType: 'JSON',
			url: url,
			success: function(data) {
				masterPrgmsArr = [];
				masterPrgmsArr = data["master-programs"];
				bro_buildPrgmsList(masterPrgmsArr);
			},
			error: function(data) {
				masterPrgmsArr = [];
				comm_handleAjaxError(data);
			}
		});
	}

	function bro_loadSpecialPrograms(){
		var channel = $("#channel").val();
		if(!channel){
			return;
		}
		
		var url =  '/special-programs?channel_id='+channel;
		$.ajax({
			dataType: 'JSON',
			url: url,
			success: function(data) {
				specialPrgmsArr = [];
				specialPrgmsArr = data["special-programs"];
				bro_buildPrgmsList(specialPrgmsArr);
			},
			error: function(data) {
				specialPrgmsArr = [];
				comm_handleAjaxError(data);
			}
		});
	}

	function bro_buildPrgmsList(programs){
		$("#bro_prgms_select").html("");
		
		if(programs.length){
			$("#bro_prgms_select").html("");
			var prgmStr = '<option value="any">Any Program</option>';
			for(var i=0; i< programs.length; i++){
				var item = programs[i];

				if("date" in item){
					var date = moment(item.date, "YYYY/MM/DD").format("YYYYMMDD");
					var curDate = moment().format("YYYYMMDD");
					var curTime = moment().format("HHmmss");
					var time = moment(item.start_time, "HH:mm:ss").format("HHmmss");
					if(item['break_type']!=0 && date >= curDate && time > curTime){
						prgmStr += '<option value="'+item._id+'">'+item.program_name+'</option>';
					}
				} else {
					if(item['break_type']!=0){
						prgmStr += '<option value="'+item._id+'">'+item.program_name+'</option>';
					}
				}
				// prgmTimeMap[item._id] = item.start_time+"_"+item.end_time;
			}
			$("#bro_prgms_select").html(prgmStr);
			$("#bro_va_select").html(prgmStr);

			// $(".chosen-select").trigger("chosen:updated");
			// try{
			// 	$(".chosen-select").chosen("destroy");
			// } catch(e){}
			 
			// $("#bro_prgms_select").chosen({ width:"100%" });


			// $("#bro_prgms_select").multiselect("refresh");
		}

	}

	var broAdvtTypes = [], broAdvtMap = {}, broAdvtIdNameMap = {};
	function bro_loadAdvtTypes(){
		var channel = $("#channel").val();
		if(!channel){
			return;
		}
		broAdvtTypes = [];
		$("#bro_prgm_advt_types, #bro_va_advt_types").html("");
		var url =  '/advertisement_types?"channel_id":"'+channel;
		$.ajax({
			dataType: 'JSON',
			url: url,
			success: function(data) {
				if(data.ad_types){
					var advtList = data.ad_types;
					var optionStr = '';
					for(var i=0; i<advtList.length; i++){
						var item = advtList[i];
						if( item.schedule_type != "off" ){
							optionStr += '<option value="'+item._id+'"> '+item.name+' </option>';
							broAdvtMap[item.ad_type_identity] = item;
							broAdvtIdNameMap[item._id] = item.ad_type_identity;
						}
					}
					$("#bro_prgm_advt_types").html(optionStr);
					$("#bro_va_advt_types").html(optionStr);					
					// $("#bro_prgm_advt_types").chosen({ width:"100%" });
				}
			}, 
			error: function(data) {
				comm_handleAjaxError(data);
			}
		});
	}

	var broObj = {};
	$("#bro_add").click(function(){
		broObj = {};
		broObj = getbroObject();
		broObj["channel_id"] = $("#channel").val();
		
		if(broObj != undefined){
			add_bulkRo(broObj);
		}

	});

	$("#bro_update").click(function(){
		var broId = $("#bro_update").attr("value");
		if(!broId){
			console.log("Invalid Bro Id.......");
			return;
		}

		broObj = {};
		broObj = getbroObject();
		broObj["channel_id"] = $("#channel").val();
		
		if(broObj != undefined){
			edit_bulkRo(broObj, broId);
		}

	});

	function getbroObject(){
		var broObj = {}; //variable with local scope
		// var date = $("#bro_date").val();
		var date_range = $("#bro_start_end_date").val();
		var cust_id = $("#bro_customer_id").val();
		var cust_name = $("#bro_customer_filter").val();
		var agency_id = $("#bro_agency_id").val();
		var agency_name = $("#bro_agency_filter").val();
		var agency_commission = $("#bro_agency_commission").val();

		var bill_to = $("#bro_bill_to").val();
		var bill_according_to = $("#bro_bill_according_to").val();

		var prime = $("#fct_prime").val();
		var non_prime = $("#fct_non_prime").val();
		var commercials = $("#fct_bonus").val();
		var promo = $("#fct_value_ads").val();
		var fct_total = $("#fct_total").val();

		var gross_amt = $("#fct_gross_amt").val();
		var less_commission = $("#fct_less_commission").val();
		var net_amt = $("#fct_net_amt").val();
		var service_tax = $("#fct_service_tax").val();
		var net_pay = $("#fct_net_payable").val();

		var iro_num = $("#iro_number").val();

		// if(date){
		// 	broObj["date"] = date;
		// } else {
		// 	jAlert("Empty date");
		// 	return;
		// }

		console.log("date_range: "+ date_range);
		if(date_range){
			var dateArr = date_range.split(" - ")
			broObj["start_date"] = moment(dateArr[0], "DD/MM/YYYY").format("YYYY/MM/DD");
			broObj["end_date"] = moment(dateArr[1], "DD/MM/YYYY").format("YYYY/MM/DD");
		} else {
			jAlert("Empty start and end dates");
			return;
		}

		if(iro_num){
			broObj["iro_number"] = iro_num;
		} else {
			jAlert("Empty IRO Number");
			return;
		}

		if($("#bro_ro_num").val()){
			broObj["ro_number"] = $("#bro_ro_num").val()
		} else {
			jAlert("Empty RO number");
			return;
		}
		
		if(cust_id){
			broObj["client_id"] = cust_id;
		}  else {
			jAlert("Empty Client");
			return;
		}
		if(cust_name){
			broObj["client_name"] = cust_name;
		}
		if(agency_id){
			broObj["agency_id"] = agency_id;
		}
		if(agency_name){
			broObj["agency_name"] = agency_name;
		}
		if(agency_commission != ""){
			broObj["agency_commission"] = agency_commission;
		}
		if(bill_to){
			broObj["bill_to"] = bill_to;
		}
		if(bill_according_to){
			broObj["bill_according_to"] = bill_according_to;
		}

		var fctObj = {};
		// if(prime != ""){
			fctObj["prime"] = prime;
		// }
		// if(non_prime != ""){
			fctObj["non_prime"] = non_prime;
		// }
		// if(commercials != ""){
			fctObj["cs"] = commercials;
		// }
		// if(promo != ""){
			fctObj["promo"] = promo;
		// }
		// if(fct_total != ""){
			fctObj["total"] = fct_total;
		// }
		broObj["fct_details"] = fctObj;

		var temp = {};
		// if(gross_amt != ""){
			temp["gross_amount"] = gross_amt;
		// }
		// if(less_commission != ""){
			temp["less_commission"] = less_commission;
		// }
		// if(net_amt != ""){
			temp["net_amount"] = net_amt;
		// }
		// if(service_tax != ""){
			temp["service_tax"] = service_tax;
		// }
		// if(net_pay != ""){
			temp["amount_payable"] = net_pay;
		// }
		broObj["rate_details"] = temp;

		console.log("prgms: "+prgmsArr.length);

		if(prgmsArr.length == 0){
			jAlert("Empty progrms list");
			return;
		}
		broObj["programs"] = prgmsArr;
		broObj["value_ads"] = valueAdsArr;

		broObj["remarks"] = $("#bro_remarks").val();
		console.log(broObj);
		return broObj;
	}

	function bro_fillInputValues(obj){
		$("#iro_number").val("");
		$("#bro_add").hide();
		$("#bro_update").show();
		$("#bro_update").attr("value", obj._id);

		prgmsArr = [], valueAdsArr = [];
		prgmsArr = obj.programs;
		buildPrgmRows(prgmsArr);

		valueAdsArr = obj.value_ads;
		buildValueAdsRows(valueAdsArr);

		if('start_date' in obj && 'end_date' in obj){
			var st_dt = moment(obj.start_date, "YYYY/MM/DD").format("DD/MM/YYYY");
			var ed_dt = moment(obj.end_date, "YYYY/MM/DD").format("DD/MM/YYYY");
			$("#bro_start_end_date").val(st_dt+" - "+ed_dt);
		}

		// if(obj.date){
		// 	$("#bro_date").val(obj.date);
		// }
		if(obj.client_id){
			$("#bro_customer_id").val(obj.client_id);
			setTimeout(function(){
				setCustomerAddress(obj.client_id);
			}, 500);
		}
		if(obj.client_name){
			$("#bro_customer_filter").val(obj.client_name);
		}
		if(obj.agency_id){
			$("#bro_agency_id").val(obj.agency_id);
			setTimeout(function(){
				setAgencyAddress(obj.agency_id);
			}, 500);
		}
		if(obj.agency_name){
			$("#bro_agency_filter").val(obj.agency_name);
		}
		if(obj.agency_commission){
			$("#bro_agency_commission").val(obj.agency_commission);
		}
		if(obj.bill_to){
			$("#bro_bill_to").val();
		}
		if(obj.bill_according_to){
			$("#bro_bill_according_to").val(obj.bill_according_to);
		}

		if(obj.remarks){
			$("#bro_remarks").val(obj.remarks);
		}

		if(obj.ro_number){
			$("#bro_ro_num").val(obj.ro_number);
		}

		if(obj.iro_number){
			$("#iro_number").val(obj.iro_number);
		}

		var fctObj = obj.fct_details;
		$("#fct_prime").val(fctObj.prime);
		$("#fct_non_prime").val(fctObj.non_prime);
		$("#fct_bonus").val(fctObj.cs);
		$("#fct_value_ads").val(fctObj.promo);
		$("#fct_total").val(fctObj.total);

		var rateObj = obj.rate_details;
		$("#fct_gross_amt").val(rateObj.gross_amount);
		$("#fct_less_commission").val(rateObj.less_commission);
		$("#fct_net_amt").val(rateObj.net_amount);
		$("#fct_service_tax").val(rateObj.service_tax);
		$("#fct_net_payable").val(rateObj.amount_payable);
	}

	function resetInputValues(){
		$("#bro_update").attr("value", "");
		$("#bulk_ro_form_wrapper input").val("");
		$("#bulk_ro_form_wrapper select").val("-1");

		//setting default values for bill_to/bill_according_to
		$("#bro_bill_to").val("client");
		$("#bro_bill_according_to").val("fct");

		//emptying prgms/value_Ads table.
		$("#bro_prgms_tbl tbody").html("");
		$("#bro_value_ads_tbl tbody").html("");
	}


	function add_bulkRo(obj){

		console.log(broObj);
		$.ajax({
			url : 'bulk_ro?channel_id='+$("#channel").val(),
			type : "POST",
			dataType:"json",
			data : JSON.stringify(obj),
			success: function(data) {
				jAlert("Successfully Added New BULK RO Entry");
				resetInputValues();
				$('#main').load("bulkRO/bulk_ro_list.html");
			},
			error: function(error){
				comm_handleAjaxError(error);
			}
		});
	}

	function edit_bulkRo(obj, objId){
		console.log(obj);
		if($("#bro_ro_num").val()){
			obj["ro_number"] = $("#bro_ro_num").val()
		}

		$.ajax({
			url : 'bulk_ro/'+objId+'?channel_id='+$("#channel").val(),
			type : "PUT",
			dataType:"json",
			data : JSON.stringify(obj),
			success: function(data) {
				jAlert("Successfully Updated BULK RO Entry");
				resetInputValues();
				$('#main').load("bulkRO/bulk_ro_list.html");
			},
			error: function(error){
				comm_handleAjaxError(error);
			}
		});
	}

	$("#bro_cancel").click(function(){
		$('#main').load("bulkRO/bulk_ro_list.html");
	});

	$("#bro_print").click(function(){
		$("#bro_title, #bulk_ro_tbl, .bro_input_row, #btns_wrapper_div, .action_col").hide();
		$("#bro_sign_tbl").show();
		$("#bro_print, .table_header_icon, .bro_mandatory_icon").hide();

		window.print();
		$("#bro_print, .table_header_icon, .bro_mandatory_icon").show();
		$("#bro_sign_tbl").hide();
	});

	$("#bro_agency_commission").focusout(function(){
		var value = $("#bro_agency_commission").val();
		if(value && value < 0){
			$("#bro_agency_commission").val(0);
		}
		calculateBulkNetPayable();

	});

	$("#fct_gross_amt").focusout(function(){
		var value = $("#fct_gross_amt").val();
		if(value && value < 0){
			$("#fct_gross_amt").val(0);
		}
		calculateBulkNetPayable();
	});

	function calculateBulkNetPayable(){
		var agencyComm = $("#bro_agency_commission").val();
		var grossAmt = $("#fct_gross_amt").val();

		if(grossAmt > 0){
			var agency_disc_amt = 0;
			if(agencyComm >= 0){
				agency_disc_amt = grossAmt * ( agencyComm / 100);
			}
			agency_disc_amt = agency_disc_amt.toFixed(2);
			$("#fct_less_commission").val(agency_disc_amt);

			var agency_disc = grossAmt - agency_disc_amt;
			agency_disc = agency_disc.toFixed(2);
			$("#fct_net_amt").val(agency_disc);

			var service_tax = agency_disc * ( salesTax / 100 );
			service_tax = service_tax.toFixed(2);
			$("#fct_service_tax").val(service_tax);

			var round_off = parseFloat(agency_disc) + parseFloat(service_tax);
			
			console.log("round_off....."+round_off);

			round_off = round_off.toFixed(2);
			$("#fct_net_payable").val(round_off);

		} else {
			$("#fct_less_commission").val(0);
			$("#fct_net_amt").val(0);
			$("#fct_service_tax").val(0);
			$("#fct_net_payable").val(0);
		}
	}

	$("#va_others_link").click(function(){
		var text = $("#va_others_link").text();
		if(text == "Others"){
			$("#va_others_link").text("< Back");
			$("#bro_va_select").hide();
			$("#bro_va_caption").show();
		} else {
			$("#va_others_link").text("Others");
			$("#bro_va_caption").hide();
			$("#bro_va_select").show();
		}
	});

	$(".fct_input").focusout(function(){
		var value = $(this).val();
		if(value < 0 ){
			$(this).val(0);
		}
		calculateFctTotal();

	});

	function calculateFctTotal(){
		var prime = $("#fct_prime").val() != "" ? $("#fct_prime").val() : 0;
		var non_prime = $("#fct_non_prime").val() != "" ? $("#fct_non_prime").val() : 0;
		var bonus = $("#fct_bonus").val() != "" ? $("#fct_bonus").val() : 0;
		var value_ads = $("#fct_value_ads").val() != "" ? $("#fct_value_ads").val() : 0;
		var fct_total = parseFloat(prime) + parseFloat(non_prime) + parseFloat(bonus) + parseFloat(value_ads);
		
		$("#fct_total").val(fct_total.toFixed(2));
	}

