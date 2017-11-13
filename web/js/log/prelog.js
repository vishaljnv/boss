var hasLocalStorage = false;
var col_exp_prgm = [];

if (typeof(Storage) !== "undefined") {
	hasLocalStorage = true;
}


function checkSessionExists() {
	var sessionId = $("#sessionId").val();
	var flag = true;
	/*$.ajax({
		async : false,
		url : "/checkSessionExists/" + sessionId,
		type : "GET",
		success : function(data) {
			if (data.sessionExists == "no") {
				flag = false;
			} else
			flag = true;
		}
	});*/
	return flag;
}

var channel = $("#channel").val();
var log_channel_logo = getChannelLogo(channel);

var playlistTable =  $('#schedules_list').dataTable({
	  "iDisplayLength": -1,
	  "aLengthMenu": [[-1, 25, 50, 75, 100], ["All", 25, 50, 75, 100]],
	  "columns": [
	    	       { "width": "20%" },
	    	       { "width": "10%" },
	    	       { "width": "10%" },
	    	       { "width": "10%" },
	    	       { "width": "10%" },
	    	       { "width": "13%" }
	    	     
	           ], 
	    "dom": 'Bfrtip',
       "buttons": [
		            {
		                extend: 'print',
		                title: "",
		                autoPrint:true,
		                exportOptions: {
		                    columns: ':visible'
		                },
		                 customize: function ( win ) {  
		                 startTime = $('#startTime').val();
		                 endTime = $('#endTime').val(); 
		                 pg_title = "Playlist from" + startTime + "-"  +endTime;              
                    $(win.document.body).prepend('<table cellspacing="0" style="width: 100%;margin-bottom:10px;border:0"> <tr style="background-color: #ddd;height:100px;"> <td style="align:left;vertical-align:center;"><strong>Date:'+logDate +'</strong></td> <td style="align:left;vertical-align:center;"><strong>'+pg_title+'</strong></td> <td><img src="'+log_channel_logo+'" style="position:absolute; top:0; right:0;height:90px;"/></td> </tr></table>'); 
                    $(win.document.body).find( 'table' ).addClass( 'compact' ).css( 'font-size', 'inherit' );
                    // $(win.document.body).find( 'table' ).css( 'border', 'none' );
                    $(win.document.title).css( 'font-size', '5pt' );
                    $(win.document.body).css("background","white");                    
                },

		                footer: true
		            }],
	  "bAutoWidth": false,
	   "bSort": false,
       "bStateSave":true,
       "paging": true,
 	  "pagingType": 'full_numbers'
   		});	

var logs, auto, slots, nodeData, unallocSlots, did_not_air_list,logDate = '';
var programs_map = {}, unsIdMap = {};
var channel = $("#channel").val();

$("#logDate").datepicker({
	dateFormat : 'dd/mm/yy',
	showOn : "both",
	buttonImage : "javascripts/jquery-ui/development-bundle/demos/images/calendar.gif",
	buttonImageOnly : true,
	onSelect : function(date, picker) {
		getLogsOnSelect(date);
		logDate = date;
		// $("#makeGoodsDate").datepicker("setDate", moment($("#logDate"), 'DD/MM/YYYY').subtract(1, 'days').format() );
		log_loadMakeGoods();
	}
});

$("#makeGoodsDate").datepicker({
	dateFormat : 'dd/mm/yy',
	showOn : "both",
	buttonImage : "javascripts/jquery-ui/development-bundle/demos/images/calendar.gif",
	buttonImageOnly : true,
	onSelect : function(date, picker) {
		log_loadMakeGoods();
	}
});

if (logDate != "") {
	$("#logDate").datepicker("setDate", logDate);
} else {
	logDate = getCurrentDate();
	$("#logDate").datepicker("setDate", moment().add(1, 'days').format() );
}

$("#makeGoodsDate").datepicker("setDate", moment($("#logDate"), 'DD/MM/YYYY').subtract(1, 'days').format("DD/MM/YYYY") );

var dummyNodeData = {
	start_time : '00:00:00',
	duration : 0,
	id : 0,
	name : 'Program-0',
	breaks : {
		0 : {
			slot_count : 0,
			start_time : '00:00:00',
			duration : 120000000000000,
			slot_order : [],
			id : 0,
			name : 'Break-0'
		}
	},
	break_order : [ 0 ]
};

var unallocSlotsNodeData = {
	start_time : '00:00:00',
	duration : 0,
	id : 99999,
	name : 'Program-unalloc',
	breaks : {
		0 : {
			slot_count : 0,
			start_time : '00:00:00',
			duration : 120000000000000,
			slot_order : [],
			id : 99999,
			name : 'Break-unalloc'
		}
	},
	break_order : [ 0 ]
};



$(document).ready(function() {
	channel = $("#channel").val();

	$("#log_download_xls_div").dialog({
									title: "Download as xls",
									modal: true,
									width:400,
  			 						height:250,
									autoOpen: false,
									autoFocus: false
								});

	$("#close_xls_dialog").click(function(){
		$("#log_download_xls_div").dialog('close');
	});

	// Autocomplete initialization
	var branchList = comm_getBranchNameList();
    $("#log_branch").autocomplete({
        minLength:0,
        source: function( request, response ) {
            var matches = [];   
            for(var i=0; i<branchList.length; i++){
                var item = branchList[i];
                if ( item.toUpperCase().indexOf(request.term.toUpperCase()) === 0 ) {
                    matches.push(item);
                }
            }
            if(request.term == ""){
                matches = branchList;
            }
            response(matches);
        },
        focus: function(event, ui) {
            event.preventDefault();
        }
    });

    $("#log_branch").unbind("click");
    $("#log_branch").on("click, focus", function(){
        if($("#log_branch").val() == ""){
            $("#log_branch").autocomplete("search", "");
        }
    });

    // Autocomplete initialization
	var customerList = comm_getCustNameList();
    $("#log_cust").autocomplete({
        minLength:0,
        source: function( request, response ) {
            var matches = [];   
            for(var i=0; i<customerList.length; i++){
                var item = customerList[i];
                if ( item.toUpperCase().indexOf(request.term.toUpperCase()) === 0 ) {
                    matches.push(item);
                }
            }
            if(request.term == ""){
                matches = customerList;
            }
            response(matches);
        },
        focus: function(event, ui) {
            event.preventDefault();
        }
    });

    $("#log_cust").unbind("click");
    $("#log_cust").on("click, focus", function(){
        if($("#log_cust").val() == ""){
            $("#log_cust").autocomplete("search", "");
        }
    });


     
    // before loading page check whether auto scheduling feature is off or on
    $.ajax({
    	global : true,
		dataType: 'JSON',
		type : "GET",
		url : "/scheduling_settings",
		success : function(data) {
			var settings = data.scheduling_settings;
			if(settings.length){
				auto = settings[0].auto_scheduling;
				if (auto == 0){
					$('#genSchedule').hide();
				}
			}
		}, error: function(error){
			console.log(JSON.stringify(error));
		}
	}); 

	var currentDate = new Date();
	$("#logDate").datepicker("setDate", moment().add(1, 'days').format("DD/MM/YYYY") );	
	logDate = $("#logDate").val();	
	updateTBDropDown();
	load_logs(logDate);

}); // document ready ends


function updateTBDropDown(){
	var tb = {};
	var logDate = $("#logDate").val();	
	if(localStorage.getItem("tb")){
		tb = JSON.parse(localStorage.getItem("tb"));
	}
	if( !$.isEmptyObject(tb) ){
		if(tb[logDate]){
			$("#prgm-group-combobox").val(tb[logDate]);
		}
	}
}

function updatePrgmsDropDown(){
	var prgms = {};
	var logDate = $("#logDate").val();
	if( localStorage.getItem("prgms") ){
		prgms = JSON.parse(localStorage.getItem("prgms"));
	}

	if( !$.isEmptyObject(prgms) ){
		if(prgms[logDate]){
			var prgm_id = prgms[logDate], prgmExists = false;

			if( !$.isEmptyObject(prgmTimeMap) ){
				for(var key in prgmTimeMap){
					if(prgm_id == key){
						prgmExists = true;
						break;
					}
				}
			}
			if(prgmExists){
				$("#prelog-prgm-combobox").val(prgm_id);
				$("#prgm-group-combobox").val("all");

				var tb = JSON.parse(localStorage.getItem("tb") ) ;
				if(!tb ){
					tb = {};
				}
				tb[logDate] = "all";
				localStorage.setItem("tb", JSON.stringify(tb) );
				updateTBDropDown();
			} else {
				$("#prelog-prgm-combobox").val("-1");
				updateTBDropDown();
			}
		}
	}
}


$("#exportPlaylist").click(function (e){
	var channel = $("#channel option:selected").text();
	if(channel){
		jConfirm('You are in the channel "<b>'+channel+'</b>",  Do you want to continue with export? ','Logs export - '+channel, function(response) {
			if (response) {
				if(checkSessionExists()){
					showDialog(true);
					e.preventDefault();
				}else{
					$(location).attr('href', window.location.href);
				}
			}
		});
	} else {
		jAlert("Invalid channel");
		return false;
	}
});

$("#download_log_btn").click(function (e){
	if(checkSessionExists()){
		$('#logStartTime').val("");
        $('#logEndTime').val("");
    	$("#log_branch").val("");
    	$("#log_cust").val("");
		$("#log_download_xls_div").dialog("open");
		e.preventDefault();
	} else {
		$(location).attr('href', window.location.href);
	}
});

$("#btnClose").click(function (e){
	HideDialog();
	e.preventDefault();
});

$("#btnExport").click(function (e) {

	if(checkSessionExists()){
		var startTime = $('#startTime').val();
		var endTime = $('#endTime').val();
		var part = $('#part').val();

		if (part == null || part == undefined || part == ""){
            jAlert("Please enter Remark")
            return;
        }
		if(validateTime(startTime," start time") && validateTime(endTime," end time") && checkStartEndTime(startTime,endTime)){
            if (endTime == "24:00:00"){
                endTime = "23:59:59"
            }

			jConfirm('Do you want to export the playlist to Automation','Logs', function(response) {
				if (response) {
					var value = {}
					value = {
						"sched-start-time": logDate+" "+startTime,
					    "sched-end-time": logDate+" "+endTime,
					    "creat-time": getCurrentDateTime(),
					    "sched-part": part,
					    "channel_id": channel
					};

					$.ajax({
						global : true,
						type : "POST",
						url : "export-playlist",
						dataType:"json",
						data: JSON.stringify(value),
						success : function(data) {
							jAlert(data.message);
							HideDialog();
						},
						error : function(error) {
							//jAlert("Couldn't connect with QEA services..!");
							comm_handleAjaxError(error);
 
						}
					});
				}
			});
		}
		e.preventDefault();
	}else{
		$(location).attr('href', window.location.href);
	}
});



$("#printBtn").click(function (e) {

	var startTime = $('#startTime').val();
    var endTime = $('#endTime').val();
	var part = $('#part').val();
	if(validateTime(startTime," start time") && validateTime(endTime," end time") && 
			checkStartEndTime(startTime,endTime)){

        if (endTime == "24:00:00"){
            endTime = "23:59:59"
        }
        
		var value ={}
		value = {
			"sched-start-time": logDate+" "+startTime,
		    "sched-end-time": logDate+" "+endTime,
		    "creat-time": getCurrentDateTime(),
		    "sched-part": part,
		    "channel_id": channel,
		};

        url = 'print-playlist?s='+JSON.stringify(value) 
        $("#start_time").text(startTime);
        $("#end_time").text(endTime);

	    $.ajax({
	    	global : true,
			type : "GET",
			url :  url,
			dataType:"json",
			success : function(data) {
				if(data.play_list!=undefined){
					loadPlaylist(data.play_list);
			    } else {
			    	empty_list = [];
			    	loadPlaylist(empty_list)
			    }
				HideDialog();
				var getArr={
					width : 1200,
					height : 600,
					modal : true,
					title: 'Schedule details'
				};
				
		        $('#playlist').dialog(getArr);
			}
		});
	}
});

// $("#xlsExportBtn").click(function (e) {

// 	var startTime = $('#startTime').val();
//     var endTime = $('#endTime').val();
// 	var part = $('#part').val();
// 	if(validateTime(startTime," start time") && validateTime(endTime," end time") && 
// 			checkStartEndTime(startTime,endTime)){

//         if (endTime == "24:00:00"){
//             endTime = "23:59:59"
//         }
// 		var value ={}
// 		var format = ["Customer Name", "Agency Name", "Clip Name", "Clip Duration", "Play Start Time", "Start Time min", "Start Time max","Break"];
// 		value = {
// 			"sched-start-time": logDate+" "+startTime,
// 		    "sched-end-time": logDate+" "+endTime,
// 		    "creat-time": getCurrentDateTime(),
// 		    "sched-part": part,
// 		    "channel_id": channel,
// 		    "type":"playlist-logs",
// 		    "format" : format
// 		};

//         url = '/export_to_xls?s='+JSON.stringify(value) 
//         $("#start_time").text(startTime);
//         $("#end_time").text(endTime);

// 	    $.ajax({
// 	    	global : true,
// 			type : "GET",
// 			url :  url,
// 			dataType:"json",
// 			success : function(data) {
// 				if (data["filename"]) {
//     				$.fileDownload('/downloadfile/'+data['filename']);
// 				}
// 			}
// 		});
// 	}
// });

$("#download_xls").unbind("click");
$("#download_xls").click(function (e) {

	var startTime = $('#logStartTime').val();
    var endTime = $('#logEndTime').val();
    var branchName = $("#log_branch").val();
    var custName = $("#log_cust").val();
    var branchId = null, custId = null;

    if(branchName){
    	branchId = comm_getBranchIdByName(branchName);
    }

    if(custName){
    	custId = comm_getCustIdByName(custName);
    }

	if(validateTime(startTime," start time") && validateTime(endTime," end time") && 
			checkStartEndTime(startTime,endTime)){

        if (endTime == "24:00:00"){
            endTime = "23:59:59"
        }
		var value ={}
		var format = ["Customer Name", "Agency Name", "Clip Name", "Clip Duration", "Break Start Time","Break End time","Play Start Time", "Dp start time", "Dp end time","Break"];
		value = {
			"sched-start-time": logDate+" "+startTime,
		    "sched-end-time": logDate+" "+endTime,
		    "creat-time": getCurrentDateTime(), //file downloaded time
		    "channel_id": channel,
		    "type":"playlist-logs",
		    "format" : format
		};

		if(branchId){
			value["branch_id"] = branchId;
		}

		if(custId){
			value["customer_id"] = custId;
		}

        var url = '/export_to_xls?s='+JSON.stringify(value);
        console.log(url);

	    $.ajax({
	    	global : true,
			type : "GET",
			url :  url,
			dataType:"json",
			success : function(data) {
				if (data["filename"]) {
    				$.fileDownload('/downloadfile/'+data['filename']);
				}
			}
		});
	}
});

var prgmTimeMap = {};
function buildProgramsList(){
	if(programs.length){
		var prgmStr = '<option value="-1">All Programs</option>';
		$("#prelog-prgm-combobox").html("");
		for(var i=0; i< programs.length; i++){
			var item = programs[i];
			prgmStr += '<option value="'+item._id+'">'+item.program_name+'</option>';
			prgmTimeMap[item._id] = item.start_time+"-"+item.end_time;
		}
		$("#prelog-prgm-combobox").html(prgmStr);
		$("#prelog-prgm-combobox").show();
		updatePrgmsDropDown();
	} else {
		$("#prelog-prgm-combobox").hide();
		$("#prelog-list").html("");
	}
}
log_loadPrograms();

var programs = [];
function log_loadPrograms(){
	var date = $("#logDate").val();
	var channel = $("#channel").val();
	if(!date || !channel){
		return;
	}
	programs = [];
	var url =  '/programs?s={"date":"'+date+'","channel_id":"'+channel+'"}'
	$.ajax({
		global : true,
		dataType: 'JSON',
		url: url,
		success: function(data) {
			programs = data.programs;
			buildProgramsList();
		}, 
		error: function(data) {
			comm_handleAjaxError(data);
		}
	});
}

function showProgramLog(){
	var prgm_id = $("#prelog-prgm-combobox").val();
	if(prgm_id){
		var date = $("#logDate").val();
		if($("#logDate").val()){
			$("#prgm-group-combobox").val("all");
			load_logs(date);
			getLog(date);
		}
	}

	var prgms = {};
	if( localStorage.getItem("prgms") ){
		prgms = JSON.parse(localStorage.getItem("prgms"));
	}
	prgms[date] = prgm_id;

	var tb = {};
	if( localStorage.getItem("tb") ){
		tb = JSON.parse(localStorage.getItem("tb"));
		if( !$.isEmptyObject(tb) ){
			tb[date] = "all";
		}
	}

	localStorage.setItem("prgms", JSON.stringify(prgms) );

}
	   
function loadPlaylist(playlist){
    playlistTable.fnClearTable() 
    for (i = 0; i < playlist.length; i++) {
    	playlistTable.fnAddData([ playlist[i]['clip_name'] || '',
	 	sec_to_hhmmss(playlist[i]['duration']) || '',playlist[i]['start_time'] || '',
	 	playlist[i]['dp_start_time'] || '',playlist[i]['dp_end_time'] || '',
	 	playlist[i]['break_name'] || '']);
    }
}

function createUnallocatedSlots() {

	$('.unalocated_list_wrapper .comm_wrapper_ul').empty();

	for(var index in unallocSlots){
		advt_schedule_type = ""
		var val = unallocSlots[index];
		var slot = unallocSlots[index];
		var clips = [];

		if(val.clips!=undefined){
		  clips = val.clips;
		}
		
		for(var ind in clips){
			var clip = clips[ind];
            // console.log(clip);
			if(clip.spots_not_allocated >0 || clip.value_ads){

              	for(var j=0; j< clip.daypart_count.length; j++){
					var dp = "", dpObj = {};
					dpObj = clip.daypart_count[j];	

					for(var key in dpObj){
						if(key != "uns_id" && key != "rate"){
							dp = key;
						}
					}

					if(dpObj[dp] <= 0 && !clip.value_ads ){
						// to stop showing unallocated slot which has dp count = 0
						console.log("to stop showing unallocated slot which has dp count")
						continue;
					}
					if(clip.advt_schedule_type != undefined){
						advt_schedule_type = clip.advt_schedule_type
					}

					unsIdMap[dpObj.uns_id] = {
						order_id: val['order_id'],
						clip_id: clip.clip_id,
						day_part: dp,
						count: dpObj[dp],
						day_part_start: dp.split("-")[0],
						day_part_end: dp.split("-")[1]
					};

					var color = "#fdfdd2";
          			if(advt_color_map[clip.advt_type]){
          				color = advt_color_map[clip.advt_type];
          			}
          			var count_color = darkerColor(color);
          			var remarks_or_clip_name = clip.clip_name;
					// if (clip.slot_type == "break"){
              			// un_all_commercials.push(slot);

              			//var drag_str = ""
              		   
              		    var	drag_str = "draggable='true'"+
			                     "ondragstart='unallocated_drag_start(event)' ondragend='unallocated_drag_end(event)'"
              		 
              		    if (clip.remarks != null && clip.remarks != undefined && clip.remarks != ""){
                              remarks_or_clip_name = "REMARKS : " + clip.remarks;
                        }

                        var countShow = "inline";
                        if(!dpObj[dp] || dpObj[dp] < 0){
                        	countShow = "none"; 
                        }
                        var orderedSpots = 0;
                        if(clip.ordered_spots != undefined && clip.ordered_spots != null){
                        	orderedSpots = clip.ordered_spots;
                        } 
                        var spot_type = "None";
                            if(clip.spot_type != undefined && clip.spot_type !=null){
                            	spot_type = clip.spot_type;
                            }  

                        var valueAdsStr = "";
                        if(clip.value_ads){
                        	valueAdsStr = "powered by";
                        }

                        var prdctType = "";
				    	if(clip.product_type){
				    		prdctType = clip.product_type;
				    	}

				    	var clip_caption = trimClipNameWithExtn(clip.clip_name, 20)
				    	if(clip.clip_caption!=undefined && clip.clip_caption!=null && 
				    	   clip.clip_caption!='')
                           clip_caption = clip.clip_caption
                           clip_caption =  trimClipNameWithExtn(clip_caption, 20);

                           var clipPosStr = "";
                           if("clip_position" in clip){
                           		if( clip.clip_position ){
                           			clipPosStr = clip.clip_position;
                           		}
                           }

		              	var unslotStr = "<li id='unslot-"+dpObj.uns_id+"' class='dslot slot' name='"+val['order_id']+"' title='"+clip.customer_name+' : '+clip.clip_name+"' "+drag_str+" style='background-color:"+color+" !important'>"
		              					+'<span class="prelog_clip_info" data="uns" value="'+dpObj.uns_id+'" title="Clip details"><i class="fa fa-info-circle"></i></span>'
		              					+'<span class="clip_name_preview" value="'+clip.clip_id+'" title="'+remarks_or_clip_name+'">'+ clip_caption+'</span>'
		              					+'<span class="unslot_type" style="display:none">'+clip.slot_type+'</span>'
		              					+'<span class="uns_clip_type" style="display:none;">'+valueAdsStr+'</span>'
		              					+'<span class="uns_clip_pos" style="display:none;">'+clipPosStr+'</span>'
		              					+"<span class='unslot_clip_id' id="+clip.clip_id+" style='display:none'></span>"
					                     +"<span class='comm_dur_wrapper align-right'>"+
					                     	"<font class='prgm_comm_dp' style='margin-right:10px' title='Day Part Start and End time'>"+dp+"</font>"+
						                     "<font class='prgm_comm_dur' style='margin-right:40px' title='Duration'>"+parseInt(clip.duration)+" sec</font>"+
								             "<font  class='comm_count prgm_comm_count' title='Unallocated count' style='background-color: "+count_color+" !important;display:"+countShow+"'> "+dpObj[dp]+" </font>"+
							             "</span>"
							             +"<span class='unslot_spot_type' style='display:none;'>"+spot_type+"</span><span class='unslot_ordered_spots' style='display:none;'>"+orderedSpots+"</span>"
				                     "</li>";

				        var advtId = getAdvtTypeLocalId(clip.advt_type);
				        // console.log(advtId);
						$('#brk-'+advtId).append(unslotStr);
					// } else {
					// 	var lbandStr = "<li id='unslot-"+dpObj.uns_id+"' class='dslot slot prgm-lband'  value='"+clip.slot_type+"'' name='"+val['order_id']+"' title='"+clip.customer_name+' : '+clip.clip_name+"'  draggable='true'"+
		   //                   "ondragstart='unallocated_drag_start(event)' ondragend='unallocated_drag_end(event)' style='background-color:"+color+" !important'>"
					//  					+trimClipNameWithExtn(clip.clip_name, 35)
					//  					+'<span class="unslot_type" style="display:none">'+clip.slot_type+'</span>'
					//  					+"<span class='unslot_clip_id' id="+clip.clip_id+" style='display:none'></span>"
			  //                    		+"<span class='comm_dur_wrapper align-right'>"+
			  //                    			"<font class='prgm_comm_dp' style='margin-right:10px' title='Day Part Start and End time'>"+dp+"</font>"+
			  //                    			"<font class='prgm_comm_dur' style='margin-right:40px' title='Duration'>"+parseInt(clip.duration)+" sec</font>"+
					//              			"<font  class='comm_count prgm_lband_count'  title='Unallocated count' style='background-color: "+count_color+" !important'> "+dpObj[dp]+" </font>"+
					//              		"</span>"+
		   //                   		"</li>";
		   //              $('#brk-'+clip.advt_type).append(lbandStr);
		   //          }
				}
			}
		}
	}
	setTimeout(function(){
		initClipInfoClick();
	},400);
}

var did_not_air_map = {};
function display_did_not_air(){
	$("#did_not_air_wraper_div .comm_wrapper_ul").html("");
	
	did_not_air_map = {};
	for(var i=0; i<did_not_air_list.length; i++){
		var did_not_air_str = '';
		var item = did_not_air_list[i];
		did_not_air_map[item._id] = item;

		var clipName = item['clip_name'];
		clipName = trimClipNameWithExtn(clipName, 20);
		dpStr = item['dp_start_time'] + '-' +item['dp_end_time'];
		//Number.isInterger(dur);
		var clip_caption = clipName
		if(item['clip_caption']!=undefined &&  item['clip_caption']!=null &&
			item['clip_caption']!='')
			clip_caption = item['clip_caption']
		    clip_caption = trimClipNameWithExtn(clip_caption, 20);

		if (item['duration']!=undefined){
			dur = item['duration'].toFixed(2) + "&nbsp;Sec";
		} else {
	    	dur = ""; 	
	    }

	    var title = "";
	    if(item.customer){
	    	title = item.customer+": "+item.clip_name;
	    } else {
	    	title = item.clip_name;
	    }

	    var date = "";
	    if(item.date){
	    	date = moment(item.date, "YYYY/MM/DD").format("DD/MM/YY");
	    }

	    var schTime = "";
	    if(item.schedule_time){
	    	schTime = "  Scheduled Time:   "+item.schedule_time+"  ";
	    }

	    var orderedSpots = 0;
        if(item.ordered_spots != undefined && item.ordered_spots != null){
        	orderedSpots = item.ordered_spots;
        } 
        var SpotType = "";
        if(item.spot_type != undefined && item.spot_type != null){
        	SpotType = item.spot_type;
        } 
        var ClipCaption = "";
        if(item.clip_caption != undefined && item.clip_caption != null){
        	ClipCaption = item.clip_caption;
        } 

	    var prdctType = "";
    	if(item.product_type){
    		prdctType = item.product_type;
    	}

	    var dragStr = 'draggable="true" ondragstart="unallocated_drag_start(event)"  ondragend="unallocated_drag_end(event)"  ';

	    did_not_air_str += '<li id="unslot-'+item._id+'" class="dslot slot did_not_air_slot" name="'+item.order_id+'" title="'+title+'" '+dragStr+'>'
		    					+'<span class="prelog_clip_info" data="dna" value="'+item._id+'" title="Clip details"><i class="fa fa-info-circle"></i></span>'
								+'<span class="clip_name_preview" value="'+item.clip_id+'" title="'+item.clip_name+'">'+clip_caption+'</span>'
								+'<span class="unslot_type" style="display:none;">'+item.slot_type+'</span>'
								+'<span class="uns_clip_type" style="display:none;">did_not_air</span>'
								+'<span class="unslot_clip_id" id="'+item.clip_id+'" style="display:none;"></span>'
								+'<span class="comm_dur_wrapper align-right">'
									// +'<font class="prgm_comm_date" style="margin-right:10px;margin-left:5px;font-size:11px;" title="'+schTime+'">'+date+'</font>'
									+'<font class="prgm_comm_dp" style="margin-right:10px" title="Day Part Start and End Time">'+dpStr+'</font>'
									+'<font class="prgm_comm_dur" style="margin-right:8px;" title="Duration">'+dur+'</font>'
								+'</span>'
								+'<span class="unslot_ordered_spots" style="display:none;"> '+orderedSpots+' </span>'
								+'<span class="product_type" style="display:none;">'+prdctType+'</span>'
								+'<span class="unslot_spot_type" style="display:none;">'+SpotType+'</span>'
								+'<span class="clip_caption" style="display:none;">'+ClipCaption+'</span>'
							+'</li>';

		if(!item.advt_type){
			item.advt_type = "commercial";
		}
		var advtId = getAdvtTypeLocalId(item.advt_type);

		$('#did_not_air_wraper_div #brk-dna-'+advtId).append(did_not_air_str);
    }

    // $("#did_not_air_ul").html(did_not_air_str);

    console.log("DID NOT AIR LENGTH : "+did_not_air_list.length);
    if(did_not_air_list.length){
    	$("#dna_count").html(did_not_air_list.length);
    	// $("#dna_count").show();
    } else {
    	$("#dna_count").html(0);
    	$("#dna_count").hide();
    }

}



var run_with_disc_map = {};
function display_run_with_disc(){

	$("#run_with_disc_wraper_div .comm_wrapper_ul").html("");
	run_with_disc_map = {};

	for(var i=0; i<run_with_disc_list.length; i++){
		var run_with_disc_str = '';
		var item = run_with_disc_list[i];
		run_with_disc_map[item._id] = item;

		var clipName = item['clip_name'];
		clipName = trimClipNameWithExtn(clipName, 20);

		var clip_caption = clipName
		if(item['clip_caption']!=undefined && item['clip_caption']!=null &&
			item['clip_caption']!='')
			clip_caption = item['clip_caption']
			clip_caption = trimClipNameWithExtn(clip_caption, 20);

		dpStr = item['dp_start_time'] + '-' +item['dp_end_time'];
		if (item['duration']!=undefined){
			dur = item['duration'].toFixed(2) + "&nbsp;Sec";
		} else {
	    	dur = ""; 	
	    }

	    var title = "";
	    if(item.customer){
	    	title = item.customer+": "+item.clip_name;
	    } else {
	    	title = item.clip_name;
	    }

	    var date = "";
	    if(item.date){
	    	date = moment(item.date, "YYYY/MM/DD").format("DD/MM/YY");
	    }

	    var schTime = "";
	    if(item.schedule_time){
	    	schTime = "  Scheduled Time:   "+item.schedule_time+"  ";
	    }

	    var orderedSpots = 0;
        if(item.ordered_spots != undefined && item.ordered_spots != null){
        	orderedSpots = item.ordered_spots;
        } 
        var SpotType = "";
        if(item.spot_type != undefined && item.spot_type != null){
        	SpotType = item.spot_type;
        } 
        var ClipCaption = "";
        if(item.clip_caption != undefined && item.clip_caption != null){
        	ClipCaption = item.clip_caption;
        } 

         
	    var prdctType = "";
    	if(item.product_type){
    		prdctType = item.product_type;
    	}

	    var dragStr = 'draggable="true" ondragstart="unallocated_drag_start(event)"  ondragend="unallocated_drag_end(event)"  ';

	    run_with_disc_str += '<li id="unslot-'+item._id+'" class="dslot slot run_with_discr_slot" name="'+item.order_id+'" title="'+title+'" '+dragStr+'>'
	    					+'<span class="prelog_clip_info" data="rwd" value="'+item._id+'" title="Clip details"><i class="fa fa-info-circle"></i></span>'
							+'<span class="clip_name_preview" value="'+item.clip_id+'" title="'+item.clip_name+'">'+clip_caption+'</span>'
							+'<span class="unslot_type" style="display:none;">'+item.slot_type+'</span>'
							+'<span class="uns_clip_type" style="display:none;">run_with_discr</span>'
							+'<span class="unslot_clip_id" id="'+item.clip_id+'" style="display:none;"></span>'
							+'<span class="comm_dur_wrapper align-right">'
								// +'<font class="prgm_comm_date" style="margin-right:10px;margin-left:5pxfont-size:11px;" title="'+schTime+'">'+date+'</font>'
								+'<font class="prgm_comm_dp" style="margin-right:10px" title="Day Part Start and End Time">'+dpStr+'</font>'
								+'<font class="prgm_comm_dur" style="margin-right:8px;" title="Duration">'+dur+'</font>'
							+'</span>'
							+'<span class="unslot_ordered_spots" style="display:none;">'+orderedSpots+'</span>'
							+'<span class="product_type" style="display:none;">'+prdctType+'</span>'
							+'<span class="unslot_spot_type" style="display:none;">'+SpotType+'</span>'
						    +'<span class="clip_caption" style="display:none;">'+ClipCaption+'</span>'
						+'</li>';

		if(!item.advt_type){
			item.advt_type = "commercial";
		}
		var advtId = getAdvtTypeLocalId(item.advt_type);
		$('#run_with_disc_wraper_div #brk-rwd-'+advtId).append(run_with_disc_str);
    }

    console.log("run_with_disc_list length : "+run_with_disc_list.length);
    if(run_with_disc_list.length){
    	$("#rwd_count").html(run_with_disc_list.length);
    	// $("#rwd_count").show();
    } else {
    	$("#rwd_count").html(0);
    	$("#rwd_count").hide();
    }

    showPrevAdvtTypeLists();

    setTimeout(function(){
    	initClipInfoClick();
    }, 400);

}


function load_logs(date){

	schedule_date = date.split("/");
	var url = '/programs';
	//yymmdd_date = schedule_date[2] + "/" +schedule_date[1] + "/" + schedule_date[0]; 
	var prgm_id = $("#prelog-prgm-combobox").val();

	s = {};
	s['date'] = date;
	s['channel_id'] = channel;
	s['breaks'] = true;
	

	if(prgm_id && prgm_id != -1){
		var prgm = prgmTimeMap[prgm_id];
		s["from_time"] = prgm.split("-")[0];
		s["to_time"] = prgm.split("-")[1];
		s['programId'] = prgm_id;
	} 
	// else{
	// 	s["from_time"] = "00:00:00";
	// 	s["to_time"] = "23:59:59";
	// }

	
	url += '?s='+JSON.stringify(s);
	$("#prelog-list").html("");
    // $('#did_not_air_div').find('.did_not_air_slot').remove()
	//var url = '/programs?s={"date":"'+date+'","channel_id":"'+channel+',"breaks":"true"}';				
	
	$.ajax({
		global : true,
		dataType: 'JSON',
		url: url,
		success: function(data) {
			for (var key  in data) {

				if(key == "programs"){
					var prgms = data[key];
					console.log("length:: "+prgms.length)
					for (i = 0; i < prgms.length; i++) {
						var prgm = prgms[i];
						if(prgm){
							buildProgramWrapper(prgm, data);
						}
					}
				} else if(key == "program"){
					buildProgramWrapper(data.program, data);
				}
			}
			getLog(logDate);
			initClickOnExpColIcons();
			setTimeout(function(){
				
				var prgm_id = $("#prelog-prgm-combobox").val();
				console.log("prgm_id: "+prgm_id);

				if(prgm_id != -1){
					$(".prgm-all").hide();
					console.log("#prgm_"+prgm_id);
					$("#prgm_"+prgm_id).show();
				} else {
					showProgramsGroup('init');
				}

			}, 100);
		}
	});
}

function buildProgramWrapper(program, data){
	var break_type = 'None';

	if(program.break_type == 1){
		break_type = "Template";
	}else if(program.break_type == 2){
		break_type = "Manual";
	}

	var cls = getPrgmGroupClass(program.start_time, program.end_time);

	var elapsedCls = 'elapsed-time';
	if( !checkIsElapsedTime(program.end_time) ){
		elapsedCls = '';
	}

	var programHeader = '<div id="prgm_'+program._id+'" class="program-wrapper '+cls+' '+elapsedCls+' ">'
							+'<div class="program-header">'
								+'<span class="advt-type-icon pgm-icon" title="Program"> PGM</span>'
								+'<span class="prgm-start-time" title="Program Start Time">'+program.start_time+'</span>'
								+'<span class="prgm-to-label"> - </span><span class="prgm-end-time" title="Program End Time">'+program.end_time+' </span>'
								+'<span class="prgm-title list_title">'+program.program_name+'</span>'
								+'<div class="align-right">'
									+'<i class="fa fa-caret-up exp_col_icons" id="icon_'+program._id+'"></i>'
								+'</div>'
							+'</div>'
							+'<div id="prgm_body_'+program._id+'" class="program-body"></div>'
						+'</div>';
	$("#prelog-list").append(programHeader);
	programs_map[program._id] = program;
}



function getLog(logDate) {

	get_notify_count();
	var url = "/scheduled-report?date="+logDate+"&channel_id="+channel;

	var prgm_id = $("#prelog-prgm-combobox").val();
	var prgm_grp = $("#prgm-group-combobox").val();

	if(prgm_id && prgm_id != -1){
		var prgm = prgmTimeMap[prgm_id];
		url += "&from_time="+prgm.split("-")[0]+"&to_time="+prgm.split("-")[1];
	} else if(prgm_grp){
		var tb = tbTime[prgm_grp].split("-");
		if(tb.length){
			url += "&from_time="+tb[0]+"&to_time="+tb[1];
		} else {
			url += "&from_time=00:00:00&to_time=23:59:59";	
		}
	} else {
		url += "&from_time=00:00:00&to_time=23:59:59";
	}

	$.ajax({
		global : true,
		type : "GET",
		url : url,
		success : function(data) {
			
			logs = data;
			slots = logs.slots;
			unallocSlots = logs.unallocatedSlots;
			createUnallocatedSlots();

			var make_good_date = $("#makeGoodsDate").val();
			if(makeGoodsDate){
				var logDate_1 = moment(logDate, "DD/MM/YYYY").subtract(1, 'days').format("YYYYMMDD");
				make_good_date = moment(make_good_date, "DD/MM/YYYY").format("YYYYMMDD");
				if( make_good_date ==  logDate_1 ){
					
					if(logs.recon_did_not_air != undefined){
						did_not_air_list = logs.recon_did_not_air;
						display_did_not_air();
					}
					if(logs.recon_run_with_descr != undefined){
						run_with_disc_list = logs.recon_run_with_descr;
						display_run_with_disc();
					}

				} else {
					log_loadMakeGoods();
				}
			} else {
				if(logs.recon_did_not_air != undefined){
					did_not_air_list = logs.recon_did_not_air;
					display_did_not_air();
				}

				if(logs.recon_run_with_descr != undefined){
					run_with_disc_list = logs.recon_run_with_descr;
					display_run_with_disc();
				}
			}

			nodeData = logs.programs;          
			nodeData[0] = dummyNodeData;
			nodeData[99999] = unallocSlotsNodeData;
			addDetails();

			scrollProgramDiv();
		}
	});
}

function addDetails() {
	console.log("====== addDetails ==========");
	$(".program-wrapper").each(function() {
		var program_id = this.id.split("_")[1];
		if(program_id){
			createSlotNodeNew(program_id);
			disableLogReorder(logDate);
		}
	});

	setTimeout(function(){
		getExpColPrgm();
		initBrkExpColClick();
		highlightSameProductType();
	}, 500);
}

function getLogsOnSelect(date) {
	if (date != null) {
		logDate = date;
	} else {
		logDate = getCurrentDate();
	}	
	$("#logDate").datepicker("setDate", date);	
	log_loadPrograms();

	setTimeout(function(){
		updateTBDropDown();
		updatePrgmsDropDown();
		load_logs(logDate);
	}, 200);
	disableLogReorder(logDate);
}

function createSlotNodeNew(prg_id) {

	var program = nodeData[prg_id];
	if (program != undefined) {
       var program_id = program._id;

       $("#prgm_body_"+program_id).empty();
       
		break_order = [];
		if(program.break_order!=undefined)
		   break_order = program.break_order
		   
		segment_order = [];
		if(program.segment_order!=undefined)
		   segment_order = program.segment_order
		   
        $.each(segment_order,function(index, seg_id) {	
			var segment = program.segments[seg_id];	
			var brk;

			$.each(break_order,function(brk_index, brk_id) {
				if(index == brk_index){
			       brk = program.breaks[brk_id];
			    }
			});

			if(segment!=undefined){
				var segTime = getSegmentDisplayTimeString(program._id, segment.id);
				var segName = trimString(segment.segment_name, 35);

				var dragDropEventStr = '', overOnDivStr = '', elapsedCls = 'elapsed-time';
            	if( !checkIsElapsedTime(segment.end_time) ){
            		dragDropEventStr =  ' ondrop="drop_on_seg(event)" dragenter="cancel_default()" dragover="cancel_default()"';
            		overOnDivStr = 'ondragover="over_on_seg(event)';
            		elapsedCls = '';
            	}

				var seg = '<ul id="seg_'+segment.id+'" class="prgm-seg-wrapper '+elapsedCls+' " '+dragDropEventStr+' >'
							+'<div id="seg_'+ segment.id+ '" class="segment" name="'+segment.start_time+'" '+overOnDivStr+' "><span class="advt-type-icon seg-icon" title="Segment"> SEG </span>'
							+'<div style="display:inline;">'
							+ '<span id="prgm-time-seg-'+ segment.id+ '"><span title="Segment Start Time" class="seg_dp_start">'+segment.start_time+'</span> - <span title="Segment End Time" class="seg_dp_end">'+segment.end_time+' </span>'
							+'</span>'
							+ '<span class="list_title" title="'+segment.segment_name+'">'+segName+'</span>'
							+'</div></div>'
							+'</ul>'
				$("#prgm_body_"+program_id).append(seg);
			}

            if(program!=undefined && brk!=undefined){
            	var brkTime = getDisplayTimeString(program._id, brk.id);
            	var brkName = trimString(brk.break_name, 16);
            	// var brkName = brk.break_name;
            	// var prelog_lw = $(".prelog-left-div").width();

            	// if(prelog_lw < 500){
            	// 	brk_w = "10%";
            	// } else if(prelog_lw > 500 && prelog_lw < 600){
            	// 	brk_w = '12%';
            	// } else if(prelog_lw > 600 && prelog_lw < 650){
            	// 	brk_w = '20%';
            	// } else if(prelog_lw > 650 && prelog_lw < 700){
            	// 	brk_w = '35%';
            	// } else {
            	// 	brk_w = '38%';
            	// }
            	

            	var dragDropEventStr = '', overOnDivStr = '', elapsedCls = 'elapsed-time';
            	if( !checkIsElapsedTime(brk.end_time) ){
            		dragDropEventStr =  'ondrop="drop_on_brk(event)" dragenter="cancel_default()" dragover="cancel_default()"';
            		overOnDivStr = 'ondragover="over_on_brk(event)"';
            		elapsedCls = '';
            	}

            	var brkStr = '<ul id="brk_'+brk.id+'" class="prgm-brk-wrapper '+elapsedCls+' " '+dragDropEventStr+'>'
            					+'<div '+overOnDivStr+'>'
            						+'<div id="prgm-brk-'+ brk.id+ '" class="break" name="'+brk.start_time+'">'
            							+'<span class="advt-type-icon brk-icon" title="Break"> BRK-'+(index+1)+'</span>'
										+'<div style="display:inline">'
										+'<span class="brk-time" title="Break Start and End time">'+brk.start_time+' - '+brk.end_time+' </span>'
										+'<span class="brk_name list_title" title="'+brk.break_name+'">'+brkName+'</span>'
										+ '<span class="align-right" id="prgm-time-'+brk.id+ '">'
										+'<span class="alloc-status" style="display:none">..</span>'
										+brkTime
										+'<i class="fa fa-caret-up brk_exp_col_icons" id="icon-'+brk.id+'"></i>'
										+'</span>'
							  			+'</div>'
							  		+'</div>'
							  	+'</div>'
							 +'</ul>';
				$("#prgm_body_"+program_id).append(brkStr);
            }

            var emptyBreak = true;
			var emptySegment = true;

			/*------------------L Band Scheduling------------------*/
			if(segment!=undefined){
				slot_order = [];

				// console.log(segment);

				if(segment.slot_order!=undefined)
				slot_order = segment.slot_order 

				// console.log(slot_order);

				$.each(slot_order,function(index, slot_id) {
					var slot = slots[slot_id];
                     console.log("thisssssssssss:"+JSON.stringify(slot))
					if(slot!=undefined && slot.slot_type == 'segment' ){
						emptySegment = false;
						var clip_name = "Clip not found";
						var clip_caption  = ''
						
						if(slot.clip_name != null) {
							clip_name = slot.clip_name;
							clip_caption = slot.clip_name;
							if (slot.clip_name.length > 40) {
								// clip_name = slot.clip_name.substring(0, 40)+ "...";
								clip_name = trimClipNameWithExtn(slot.clip_name, 30);
                              
							}
							 
							 if(slot.clip_caption!=undefined && slot.clip_caption!=null &&
							 slot.clip_caption!=''){
							 clip_caption = slot.clip_caption
							 clip_caption =  trimClipNameWithExtn(clip_caption, 30);
							}
						}
							
						var cust = "", customerFullName = "";
						if(slot.customer_name){
							customerFullName = slot.customer_name;
							cust = comm_trimString(slot.customer_name, 10);
							// cust = slot.customer_name;
						}
						var color = "#fdfdd2";
						if(advt_color_map[slot.advt_type]){
							color = advt_color_map[slot.advt_type];
						}

						var dragDropEventStr = '', deleteClass = 'elapsed-slots-del';

						if( !$('#seg_' + segment.id).hasClass('elapsed-time') ){
			            	if( !checkIsElapsedTime(slot.end_time) ){
			            		dragDropEventStr =  'draggable="true" ondragover="alloc_lband_drag_over(event)" ondrag="alloc_lband_drag_event(event)" ondragstart="alloc_lband_drag_start(event)" ondragend="alloc_lband_drag_end(event)"';
			            		deleteClass = '';
			            	}
			            }


			            var slotComId = slot.commercial_id.replace("{", "");
			            slotComId = slotComId.replace("}", "");
			            var remarks_or_clip_name = cust;

			            if (slot.remarks != null && slot.remarks != undefined && slot.remarks != ""){
                              remarks_or_clip_name = "REMARKS : " + slot.remarks;
                        }

                        var prdctType = "";
                    	if(slot.product_type){
                    		prdctType = slot.product_type;
                    	}
                        
						// draggable="true" ondragover="alloc_slot_drag_over(event)" ondrag="alloc_slot_drag_event(event)" ondragstart="alloc_slot_drag_start(event)" ondragend="alloc_slot_drag_end(event)" 
						var slot_html = '<li id="slot-'+slot._id+'" class="slot" value="'+slot.slot_type+'" title="Customer: '+customerFullName+'" '+dragDropEventStr+' style="background:'+color+' !important">'
											+'<div class="dslot order_'+slot.order_id+'">'
												// +'<span class="advt-type-icon lband-icon" title="'+slot.slot_type+'">'+getSlotTypeFirstLetter(slot.slot_type)+'</span>'
												+'<span class="clip-start-time" style="margin-left:10px;">'+ slot.start_time+'</span>'
												+'<span style="margin-left:10px;"><span class="customer_name captilize">'+cust +'&nbsp;&nbsp;</span>'
													+'<span class="clip_name_preview" value="'+slotComId+'" title="'+remarks_or_clip_name+'">'+ clip_caption+'</span>'
												+'</span>'
												+'<span class="align-right">'
													+ '<span style="margin-right:10px;font-size:10px;" title="Duration">'+ parseInt(slot.duration)+' Sec </span>'
													+'<i class="fa fa-times align-right del-slot del-alloc-slot '+deleteClass+' " id="del_'+slot._id+'" title="Remove"></i>'
												+'</span>'
												+'<span class="product_type" style="display:none;">'+prdctType+'</span>'
											+'</div>'
										+'</li>';
										// console.log(slot_html);

						$('#seg_' + segment.id).append(slot_html);

				    }
			    });	
			}

			/*------------------ Commercials Scheduling  ----------------------------p*/
			if(brk!=undefined){
				slot_order = [];

				// console.log(brk);
				if(brk.slot_order!=undefined)
				   slot_order = brk.slot_order
					// console.log(slot_order);

				$.each(slot_order,function(index, slot_id) {
					var slot = slots[slot_id];
					// console.log("commmmm:::"+JSON.stringify(slot));
					if(slot!=undefined){
						emptyBreak = false;
						var clip_name = "Clip not found";
						var clip_caption = ''
						
						if(slot.clip_name != null) {
							clip_name = slot.clip_name;
							clip_caption = slot.clip_name
							if (slot.clip_name.length > 50) {
								// clip_name = slot.clip_name.substring(0,50)+ "...";
								clip_name = trimClipNameWithExtn(slot.clip_name, 30);
								
								
							}
							if(slot.clip_caption!=undefined && slot.clip_caption!=null &&
									slot.clip_caption!=''){
								clip_caption = slot.clip_caption	
								clip_caption =  trimClipNameWithExtn(clip_caption, 30);
							}
						}
						
						
						var className = "dslot";
						var bumper_class = "", bumperStr = "";
						if(slot.break_bumper){
							className += " "+slot.break_bumper;
							bumper_class = " "+slot.break_bumper;
							bumperStr = '<i class="fa fa-flash bumper_icon '+bumper_class+'" title="Bumper: '+bumper_class.replace('_', ' ')+'"></i>';
						}
						
						// console.log(slot.clip_name);
						if(slot.slot_type == 'break'){

							var cust = '', customerFullName = "";
							if(slot.customer_name){
								customerFullName = slot.customer_name;
								cust = comm_trimString(slot.customer_name, 10);
							}
							var color = "#fdfdd2";
							if(advt_color_map[slot.advt_type]){
								color = advt_color_map[slot.advt_type];
							}


							var dragDropEventStr = '', deleteClass = 'elapsed-slots-del';
							if( !$('#brk_' + brk.id).hasClass('elapsed-time') ){
				            	if( !checkIsElapsedTime(slot.end_time) ){
				            		dragDropEventStr =  'draggable="true" ondragover="alloc_slot_drag_over(event)" ondrag="alloc_slot_drag_event(event)" ondragstart="alloc_slot_drag_start(event)" ondragend="alloc_slot_drag_end(event)" ';
				            		deleteClass = '';
				            	}
				            }

				            var slotComId = slot.commercial_id.replace("{", "");
			            	slotComId = slotComId.replace("}", "");
			            	var remarks_or_clip_name = cust;

			            	if (slot.remarks != null && slot.remarks != undefined && slot.remarks != ""){
                               remarks_or_clip_name = "REMARKS : " + slot.remarks;
                        	}

                        	var slotFromType = "unallocated", mgId = "", custColor = "#334db7";
                        	var mgStr = "";
                        	if(slot.make_good_id){
                        		slotFromType = "make_goods";
                        		mgId = slot.make_good_id;
                        		color = "#f2e2e2";
                        		custColor = "#920909";
                        		mgStr = '<span class="advt-type-icon mg-icon" title="Make Goods">MG</span>';
                        	}

                        	var prdctType = "";
                        	if(slot.product_type){
                        		prdctType = slot.product_type;
                        	}
                        	                        	
							var slot_html = '<li id="slot-'+slot._id+'" class="slot dslot '+slotFromType+'" value="'+slot.slot_type+'" title="Customer: '+customerFullName+'" '+dragDropEventStr+' style="background:'+color+' !important">'+
												'<div class="order_'+slot.order_id+'">'
													+mgStr
													// +'<span class="advt-type-icon" title="'+slot.slot_type+'">'+getSlotTypeFirstLetter(slot.slot_type)+'</span>'
													+'<span class="clip-start-time" style="margin-left:10px;">'+ slot.start_time+'</span>'
													+'<span style="margin-left:10px;"><span class="customer_name captilize" style="color:'+custColor+';">'+cust +'&nbsp;&nbsp;</span>'
														+'<span class="clip_name_preview" value="'+slotComId+'"title="'+remarks_or_clip_name+'" >'+ clip_caption+'</span>'
													+'</span>'
													+'<span class="align-right">'
														+bumperStr
														+ '<span style="margin-right:10px;font-size:10px;" title="Duration">'+ parseInt(slot.duration)+' Sec </span>'
														+'<i class="fa fa-times align-right del-slot del-alloc-slot '+deleteClass+'" id="del_'+slot._id+'" value="'+slotFromType+'" data="'+mgId+'" title="Remove"></i>'
													+'</span>'
													+'<span class="product_type" style="display:none;">'+prdctType+'</span>'
												+'</div>'
											+'</li>';

						    $('#brk_' + brk.id).append(slot_html);
					    }
				    }
				});
			}
		});
	}

	setTimeout(function(){
		initDelSlotClick();
		// CSS for spot allocation exceeded breaks.
		$(".alloc-exceeds").closest(".prgm-brk-wrapper .break").addClass("slot-alloc-exceeds");
		$(".alloc-exceeds").addClass("margin-right-0");

		var childrens = $(".alloc-exceeds").closest(".align-right").children();
		$.each(childrens, function(index, item) {
			if( $(item).hasClass("alloc-status") ){
				$(item).html("<i class='fa fa-warning info-icon animate-info-icon' data-toggle='tooltip' title='Spots allocation exceeded break time'></i>");
				$(item).show();
				$("[data-toggle='tooltip']").tooltip();
			}

			if( $(item).hasClass("used") ){
				$(item).addClass("margin-right-0");
			}
			if( $(item).hasClass("total") ){
				$(item).addClass("margin-right-0");
			}

		});

	}, 400);

}

function getDisplayTimeString(prg_id, brk_id) {
	var returnStr = '';
	try {
		var prg = nodeData[prg_id];
		var brk = prg.breaks[brk_id];
		returnStr += '<span class="total brk-alloc-status" style="color:#EAE9FF;">Total: ' + brk.duration+ ' sec</span>';
		var resDuration = 0;
		$.each(brk.slot_order, function(index, slot_id) {
			resDuration += slots[slot_id].duration;
		});
		var rem = (brk.duration - resDuration);
				
		if(rem < 0){
			returnStr += ' <span class="used brk-alloc-status" style="color:#BDFFBD;">Used: ' + parseInt(resDuration) + ' sec</span>';
			returnStr += ' <span class="used brk-alloc-status alloc-exceeds" style="background-color:#ac4444;color:#fff;">Exceeds: ' + parseInt(rem * -1) + '</font> sec</span>';
		}else{
			returnStr += ' <span class="rem brk-alloc-status" style="color:#BDFFBD;">Used: ' + parseInt(resDuration) + ' sec</span>';
			returnStr += ' <span class="rem brk-alloc-status" style="color:#FFDBDB;">Rem: '+ parseInt(rem) + ' sec</span>';
		}
	} catch (error) {
		console.log("error: "+JSON.stringify(error));
	}
	return returnStr;
}

function getSegmentDisplayTimeString(prg_id, segment_id) {
   var returnStr = '';
	try {
		var prg = nodeData[prg_id];
		var seg = prg.segments[segment_id];

		returnStr += '<span class="total">Total: ' + seg.duration+ ' sec</span>';
		var resDuration = 0;

		$.each(seg.slot_order, function(index, seg_id) {
			resDuration += slots[segment_id].duration;
		});

		var rem = (seg.duration - resDuration);		
		if(rem < 0){
			returnStr += ' <span class="used">Used: ' + resDuration + ' sec</span>';
			returnStr += ' <span class="used">Rem: ' + rem + '</font> sec</span>';
		}else{
			returnStr += ' <span class="rem">Used: ' + resDuration + ' sec</span>';
			returnStr += ' <span class="rem">Rem: '+ rem + ' sec</span>';
		}
	} catch (error) {
		console.log("error: "+JSON.stringify(error));
	}
	return returnStr;
}


$('#genSchedule').on('click',function(event) {
	logDate = $("#logDate").val();
	// Check if there are programs created
	if ($(".program-wrapper").size() == 0) {
		jAlert('Logs cannot be generated as there are no programs,kindly create/generate the programs');
		return;
	}
	// If there are program entries in the rows,then proceed
	// with the order checks like expiration date & missing
	// clips
	// console.log("lennn:::"+$('#did_not_air_div').find('.did_not_air_slot').length)
	// $('#did_not_air_div').find('.did_not_air_slot').remove()

	if(!logDate.match(/^(([012]\d)|3[01])\/((0\d)|(1[012]))\/\d{4}$/)){		
		var msg = "Please Enter valid date in dd/mm/yyyy format";
        return;
	}    

	jConfirm('Do you want to generate the log?','Generate log',function(response) {
		if (response) {
			$.ajax({
				global : true,
				url : "/orders?status=active&channel_id="+channel,
				type : "GET",
				success : function(data) {
					if (data['OrdersList'].length > 0) {
						$.ajax({
							global : true,
							url : "/schedule?date="+logDate+"&channel_id="+channel,
							type : "GET",
							success : function(data) {
								if (data.order_ids !=undefined && data.order_ids != "") {
									jConfirm('Spots can\'t be generated for the <i>order#</i> <b>'+ data.order_ids+ '</b> <br/> Possible cases could be : <br/> 1.Expiration of end date <br/> 2.Missing clips attachment <br/> Do you want to proceed anyhow?','Proposed Schedule',
										function(response) {
											if (response) {
												load_logs(logDate);

											}
										});// jConfirm
								} else {
									load_logs(logDate);
									
									console.log("Precheck needs to implement");
								}
							}// confirmSchedule
								// success
						});

					} else {
						jAlert("Logs can\'t be generated as there are no order items");
					}

				}
								
			});
		}
	});

});

function growl() {
	$.jGrowl.defaults.pool = 1; // This will display only 1 message at a time
	var msg = "Scheduler running completed";
	var position = "top-right";
	var scrollpos = $(document).scrollTop();
	if (scrollpos < 50)
		position = "customtop-right";
	$.jGrowl(msg, {
		life : 3000,
		position : position,
		closer : true
	});
}

function disableLogReorder(logDate) {
	var year = logDate.substring(6, 10);
	var month = logDate.substring(3, 5);
	var date = logDate.substring(0, 2);
	var dateToCompare = new Date(year, month - 1, date);

	var currentDate = new Date().setHours(0, 0, 0, 0);
	dateToCompare = dateToCompare.setHours(0, 0, 0, 0);
	if (dateToCompare > currentDate) {
		
		$('div.overlay').removeClass('disableSlotsOverlay');
		$('#exportPlaylist').show();
		if (auto == 0){
            $('#genSchedule').hide();
		} else {
		     $('#genSchedule').show();
	    }
		$('.unallocdslot').draggable('enable');
		$('#unallocatedlist').show();
	}else if(dateToCompare == currentDate) {
		$('#exportPlaylist').show();
		$('div.overlay').addClass('disableSlotsOverlay');
		//$('#exportPlaylist').hide();
		$('#genSchedule').hide();
		$('.unallocdslot').draggable('disable');
		$('#unallocatedlist').hide();
	} else {
		$('div.overlay').addClass('disableSlotsOverlay');
		$('#exportPlaylist').hide();
		$('#genSchedule').hide();
		$('.unallocdslot').draggable('disable');
		$('#unallocatedlist').hide();
	}
}

function showDialog(modal){
	$("#overlay").show();
	$("#dialog").fadeIn(300);

	if(modal){
		$("#overlay").unbind("click");
	} else {
		$("#overlay").click(function (e){
			HideDialog();
		});
	}
}

function HideDialog() {
	$("#overlay").hide();
	$("#dialog").fadeOut(300);
} 

function sec_to_hhmmss(totalSec){
	//var totalSec = new Date().getTime() / 1000;
	var hours = parseInt( totalSec / 3600 ) % 24;
	var minutes = parseInt( totalSec / 60 ) % 60;
	var seconds = totalSec % 60;
	return  (hours < 10 ? "0" + hours : hours) + ":" + (minutes < 10 ? "0" + minutes : minutes) + ":" + (seconds  < 10 ? "0" + seconds : seconds);
}

$('#startTime').timepicker({ 'timeFormat': 'H:i:s','scrollDefaultNow': true, 'minTime':'00:10:00','step': 10});
$('#endTime').timepicker({ 'timeFormat': 'H:i:s','scrollDefaultNow': true, 'minTime':'00:10:00','step': 10});

$('#logStartTime').timepicker({ 'timeFormat': 'H:i:s','scrollDefaultNow': true, 'minTime':'00:10:00','step': 10});
$('#logEndTime').timepicker({ 'timeFormat': 'H:i:s','scrollDefaultNow': true, 'minTime':'00:10:00','step': 10});


function showAdvtTypeLists(){
	var type = $("#prelog_advt_types").val();
    $("#unallocated_wrapper_div .unalocated_list_wrapper").hide();
    var id = getAdvtTypeLocalId(type);
	$("#unallocated_wrapper_div ."+id+"_list").show();
}

function showPrevAdvtTypeLists(){

	$(".make_goods_wrapper, .make_goods_count").hide();

	var mkType = $("#make_goods_id").val();
	var wrapperDivId = "";
	if(mkType == "dna"){
		wrapperDivId = "#did_not_air_wraper_div";
		$("#run_with_disc_wraper_div").hide();
		if( $("#dna_count").text() != 0){
			$("#dna_count").show();
		}
	}
	if(mkType == "rwd"){
		wrapperDivId = "#run_with_disc_wraper_div";
		$("#did_not_air_wraper_div").hide();

		if( $("#rwd_count").text() != 0){
			$("#rwd_count").show();
		}
	}
	
	$(wrapperDivId).show();

	var type = $("#prelog_prev_advt_types").val();
    $(wrapperDivId+" .unalocated_list_wrapper").hide();
    var id = getAdvtTypeLocalId(type);
	$(wrapperDivId+" ."+id+"_list").show();
}

function initDelSlotClick(){
	$(".del-alloc-slot").click(function(){
		var id = $(this).attr('id');
		var slot_id = id.split('_')[1];
		var slotFromType = $(this).attr('value');
		if(!slot_id){
			jAlert(" Invalid Slot ID ");
			return;
		}

		var url = "/proposed_schedule/"+ slot_id;

		if(slotFromType == "make_goods"){
			var mgId = $(this).attr("data");
			console.log("make good Id: "+mgId);
			if(mgId){
				url += "?make_good_id="+mgId;
			} else {
				jAlert("Invalid Make Goods ID");
			}
		}

		if(slot_id){
			jConfirm('Do you wish to delete selected spot?','Delete Spot',function(response) {
				if (response) {
					$.ajax({
						global : true,
						type : "DELETE",
						url : url,
						success : function(data) {
							scroll_top = $(".prelog-left-div").scrollTop();
							load_logs($("#logDate").val());
							// getLog($("#logDate").val());
							if(slotFromType == "make_goods"){
								log_loadMakeGoods();
							}
						},
						error: function(error){

						}
					});
				}
			});
		}

	});
}

function initClickOnExpColIcons(){
	$(".exp_col_icons").unbind('click');
	$(".exp_col_icons").click(function(){
	 	var idInfo = $(this).attr('id').split("_");
	 	var containerId = "prgm_body_"+idInfo[1];
	 	var isColapsed = false;

	 	if($(this).hasClass('fa-caret-up')){
	 		$("#"+containerId).slideUp();
	 		$(this).removeClass('fa-caret-up').addClass('fa-caret-down');
	 		isColapsed = true;
	 	} else {
	 		$("#"+containerId).slideDown();
	 		$(this).removeClass('fa-caret-down').addClass('fa-caret-up');
	 	}

	 	if(hasLocalStorage){
	 		if(isColapsed && col_exp_prgm.indexOf(idInfo[1]) == -1){
	 			col_exp_prgm.push(idInfo[1]);
	 		} else {
	 			var index = col_exp_prgm.indexOf(idInfo[1]);
				col_exp_prgm.splice(index, 1);
	 		}
	 		localStorage.setItem("col_exp_prgm", col_exp_prgm);
	 	}

	 });
}

function initBrkExpColClick(){
	$(".brk_exp_col_icons").unbind('click');
	$(".brk_exp_col_icons").click(function(){
	 	var idInfo = $(this).attr('id').split("-");
	 	console.log(idInfo);
	 	var containerId = "brk_"+idInfo[1];

	 	if($(this).hasClass('fa-caret-up')){
	 		$("#"+containerId+" li").slideUp();
	 		$(this).removeClass('fa-caret-up').addClass('fa-caret-down');
	 	} else {
	 		$("#"+containerId+" li").slideDown();
	 		$(this).removeClass('fa-caret-down').addClass('fa-caret-up');
	 	}
	});
}

function getExpColPrgm(){
	var col_exp = [];
   	if(hasLocalStorage && localStorage.getItem('col_exp_prgm')){
 		col_exp = localStorage.getItem('col_exp_prgm').split(",");
 	}

 	if(col_exp.length > 0){
 		$('.program-wrapper').each(function() {
    		var id = this.id.split("_")[1];

    		if(col_exp.indexOf(id) != -1){
    			$("#prgm_body_"+id).hide();
	 			$("#icon_"+id).removeClass('fa-caret-up').addClass('fa-caret-down');
    		}

    	});
 	}


}






/* Allocated slot drag/drop events handling */
var from_brk_id = null, from_sub_brk_id = null, target_idx = null, dragged_slot_id = null, dragged_slot_pos = null, from_prgm_id = null;
function alloc_slot_drag_event(event){
	// console.log("....... alloc_slot_drag ..........");

	var from_brk = null, info = [];
	from_brk_id = null, from_sub_brk_id = null, dragged_slot_id = null, dragged_slot_pos = null, from_prgm_id = null;
	isLband = false;

	from_brk = $("#"+event.target.id).closest('ul.prgm-brk-wrapper').prop('id');
	//To highlight dragging slot
	$(event.target).closest("li.slot").addClass("uns_draging_item");

	var id = $(event.target).closest("li.slot").attr('id');

	if(id){
		dragged_slot_id = id.split("-")[1];
		dragged_slot_pos = $(event.target).closest("li.slot").index();

		var prgm_id = $("#"+id).closest('.program-wrapper').attr('id');
		if(prgm_id){
			from_prgm_id = prgm_id.split('_')[1];
		}
	}
	
	info = from_brk.split("_");
	if(info.length){
		from_brk_id = info[1];
		from_sub_brk_id = info[2];
	} 
}

function alloc_slot_drag_start(event){
	//Below line required to make drag/drop working in IE and Firefox
	event.dataTransfer.setData('text', event.target.id); 
}

var to_slot = null;
function alloc_slot_drag_over(event){
	console.log("..........alloc_slot_drag_over...........");
	if(isLband){
		return;
	}
	$('.placeholder').remove(); //remove old drop placeholder

	var ele = $(event.target).closest("li.slot");
	var alloc_slot_drag = ele.attr('id');

	// console.log("alloc_slot_drag ==>> "+alloc_slot_drag);

    if(alloc_slot_drag!=undefined){
	    var drag_slot_details = alloc_slot_drag.split("_");
	    // clip_id = drag_slot_details[1];
	    // com_details = clip_details_map[clip_id];
    

	    var target_brk = ele.closest('ul.prgm-brk-wrapper').prop('id');
    	var to_brk = null, info = [];
		// to_brk_id = null, to_sub_brk_id = null, to_prgm_id = null;
		target_idx = parseInt(ele.index());
		to_brk = $(event.target).closest('ul.prgm-brk-wrapper').prop('id');

	    //to get To program id
	    var prgm_id = $("#"+to_brk).closest('.program-wrapper').attr('id');
		if(prgm_id){
			to_prgm_id = prgm_id.split('_')[1];
		}

	    info = to_brk.split("_");
	    console.log("info:: "+info);
	    if(info.length){
	    	to_brk_id = info[1];
	    	to_sub_brk_id = info[2];
	    }


    var dp = [], isSameProduct = false, prdct = "";
    if(dragged_unslot_id){
    	dp = $("#unslot-"+dragged_unslot_id+" .prgm_comm_dp").text().split("-");
    	//getting produt type of unallocated dragged slot.
    	prdct = $("#unslot-"+dragged_unslot_id+" .product_type").text();
    }
    if(dragged_slot_id){   
    	var slot = slots[dragged_slot_id];
    	if(slot){
    		dp[0] = slot.dp_start_time;
    		dp[1] = slot.dp_end_time;
    	}
    	//getting product type of allocated dragged slot.
    	prdct = $("#slot-"+dragged_slot_id+" .product_type").text();
    }

    //if next li has same product type, show message. 
    var next_slot_product = "";
    var nxtLiId = $("#"+alloc_slot_drag).next("li.dslot").attr("id");
    if( nxtLiId ){
    	next_slot_product = $("#"+nxtLiId+" .product_type").text();
    }

    //checking if dragged slot and allocated slot(prev slot and next slot) has same product type.
    var prev_slot_product = $("#"+alloc_slot_drag+" .product_type").text();
    if(prdct && (prev_slot_product || next_slot_product ) ){
    	prdct = prdct.trim();
    	prev_slot_product = prev_slot_product.trim();
    	next_slot_product = next_slot_product.trim();

    	if( (prdct == prev_slot_product) || (prdct == next_slot_product) ){
    		isSameProduct = true;
    	}
    }

    if(dp.length){
	    var slotInDayPart = check_within_day_part(dp[0],dp[1],to_prgm_id,to_sub_brk_id, "breaks");

	    console.log("slotInDayPart ==>> "+slotInDayPart);
	    var endTime = $("#prgm-brk-"+to_brk_id+"_"+to_sub_brk_id+" .brk-time").html().split(" - ")[1];
	    var isElapsed = checkIsElapsedTime(endTime);

	    if(to_brk_id && slotInDayPart && target_idx && !isElapsed){

	    	var drop_placeholder = '<li class="placeholder slot"> Inserting at position: '+(target_idx+1)+'</li>';
	    	if(isSameProduct){
	    		drop_placeholder = '<li class="placeholder slot" style="color:#c90000;text-align:left;padding-left:20px;"> <i class="fa fa-warning" style="color:red;font-size:14px;margin-right:10px;"></i>Same product type inserting at position: '+(target_idx+1)+'</li>';
	    	}

	    	$("#"+to_brk+" li:eq("+(target_idx-1)+")").after(drop_placeholder);
	    } else {
	    	to_brk = null, info = [];
	    	to_brk_id = null, to_sub_brk_id = null, to_prgm_id = null;
	    }
	} else {
		to_brk = null, info = [];
	    to_brk_id = null, to_sub_brk_id = null, to_prgm_id = null;
	}
   }
}

function alloc_slot_drag_end(event){
	if(isLband){
		return;
	}

	var to_brk = null, info = [], type = null, un_slot_type = null;
	$("li.slot").removeClass("uns_draging_item");
	if( !$('.placeholder').is(":visible") ){
		//if no placeholder, return back.
		return;
	}

	var brk = $('.placeholder').closest('ul.prgm-brk-wrapper').prop('id');
	var to_prgm = $("#"+brk).closest('.program-wrapper').prop('id');

	if(to_prgm){
		to_prgm_id = to_prgm.split("_")[1];
	}

	info = brk.split("_");
    if(info.length){
    	to_brk_id = info[1];
    	to_sub_brk_id = info[2];
    }

    $('.placeholder').remove();

	// console.log("============= alloc slot drag end ===============");
	console.log("from brk id: "+from_brk_id+" :: from sub brk: "+from_sub_brk_id+" :::: to brk id: "+to_brk_id+" :: to sub brk: "+to_sub_brk_id); 
	//To handle reordering in same sub break, bottom -> top reordering case.
	if(from_brk_id == to_brk_id && from_sub_brk_id == to_sub_brk_id && dragged_slot_pos > target_idx){
		dragged_slot_pos = dragged_slot_pos - 1;
	}
	console.log(" Slot id => "+dragged_slot_id+" :: From POSITION : "+dragged_slot_pos+" ==> To POSITION : "+target_idx);
	console.log("from_prgm_id : "+from_prgm_id+" :: to_prgm_id : "+to_prgm_id);
	// console.log("==========================================");


	if(from_sub_brk_id == to_sub_brk_id 
		&& from_prgm_id == to_prgm_id
		&& dragged_slot_pos == target_idx
		){
    	console.log("=== No Change In Position => returning with no action ====");
    	return;
    } else {
    	
    	if(dragged_slot_pos < target_idx && 
    		from_prgm_id == to_prgm_id &&
    		from_sub_brk_id == to_sub_brk_id){
    		target_idx = target_idx - 1;
    	}
    	
		prelog_reorder_existing_proposed_schedule(from_prgm_id, to_prgm_id, to_prgm_id, dragged_slot_id, from_brk_id, from_sub_brk_id, to_brk_id, to_sub_brk_id, dragged_slot_pos, target_idx);
		isLband = false, dragged_slot_id = null, dragged_unslot_id = null;
	}


}

var to_brk_id = null, to_sub_brk_id = null, to_prgm_id = null;
function over_on_brk(event){
	console.log("------------ over_on_brk --------------");

	if(isLband){
		return;
	}

	var to_brk = null, info = [];
	to_brk_id = null, to_sub_brk_id = null, to_prgm_id = null;

    to_brk = $(event.target).closest('ul.prgm-brk-wrapper').attr('id');
	console.log("to_brk : "+to_brk);
    
    //set target_brk => for break which has Zero slots.
    to_brk = $(event.target).closest('ul.prgm-brk-wrapper').prop('id');

    //to get To program id
    var prgm_id = $("#"+to_brk).closest('.program-wrapper').attr('id');
    console.log(prgm_id);
	if(prgm_id){
		to_prgm_id = prgm_id.split('_')[1];
	}

    info = to_brk.split("_");
    if(info.length){
    	to_brk_id = info[1];
    	to_sub_brk_id = info[2];
    }

    var dp = [], prdct = "", isSameProduct = false;
    console.log("dragged_unslot_id:::: "+dragged_unslot_id);
    if(dragged_unslot_id){
    	dp = $("#unslot-"+dragged_unslot_id+" .prgm_comm_dp").text().split("-");
    	prdct = $("#unslot-"+dragged_unslot_id+" .product_type").text();
    }

    console.log("dragged_slot_id:::: "+dragged_slot_id);
    if(dragged_slot_id){   
    	var slot = slots[dragged_slot_id];
    	if(slot){
    		dp[0] = slot.dp_start_time;
    		dp[1] = slot.dp_end_time;
    	}
    	prdct = slot.product_type;
    }

    if( $("#"+to_brk+" li").size() > 0){
    	
    	// as li size inside brk = li + placeholder li, so take 1st li product type on over.
    	var firstSlotProduct = $("#"+to_brk+" li:eq(1) .product_type").text();

    	if(prdct && firstSlotProduct){
    		prdct = prdct.trim();
    		firstSlotProduct = firstSlotProduct.trim();
    		if(prdct == firstSlotProduct){
    			isSameProduct = true;
    		}
    	}
    }


    if(dp.length){
	    var slotInDayPart = check_within_day_part(dp[0],dp[1],to_prgm_id,to_sub_brk_id, "breaks");

	    console.log("slotInDayPart ==>> "+slotInDayPart);

	    var endTime = $("#prgm-brk-"+to_brk_id+"_"+to_sub_brk_id+" .brk-time").html().split(" - ")[1];
	    var isElapsed = checkIsElapsedTime(endTime);

	    console.log("isElapsed...........=========== "+isElapsed);


	    if(to_brk && slotInDayPart && !isElapsed){
	    	$(".placeholder").remove();
	    	target_idx = 0;

	    	var drop_placeholder = '<li class="placeholder slot"> Inserting at position: '+(target_idx+1)+'</li>';
	    	if(isSameProduct){
	    		drop_placeholder = '<li class="placeholder slot" style="color:#c90000;text-align:left;padding-left:20px;">  <i class="fa fa-warning" style="color:red;font-size:14px;margin-right:10px;"></i>Same product type inserting at position: '+(target_idx+1)+'</li>';
	    	}

	    	if($("#"+to_brk+" li").size() > 0){
	    		$("#"+to_brk+" li:eq(0)").before(drop_placeholder); //over on brk, show placeholder at 0th position.
	    	} else {
	    		$("#"+to_brk).append(drop_placeholder); //to show placeholder on zero'th position, if no existing slots are there. 
	    	}
	    } else {
	    	to_brk = null, info = [];
	    	to_brk_id = null, to_sub_brk_id = null, to_prgm_id = null;
	    }
	} else {
		to_brk = null, info = [];
	    to_brk_id = null, to_sub_brk_id = null, to_prgm_id = null;
	}

}

function drop_on_brk(event){
	console.log("DROP ON BREAK");
	if(isLband){
		return;
	}
	// console.log("from brk id: "+from_brk_id+" :: from sub brk: "+from_sub_brk_id+" :::: to brk id: "+to_brk_id+" :: to sub brk: "+to_sub_brk_id);
}


/* L-band drag-drop event handling functions */
var from_seg_id = null, from_sub_seg_id = null, target_idx = null, dragged_lband_id = null, dragged_lband_pos = null, from_prgm_id = null, isLband = false;
function alloc_lband_drag_event(event){
	// console.log("....... alloc_slot_drag ..........");

	var from_seg = null, info = [];
	from_seg_id = null, from_sub_seg_id = null, dragged_lband_id = null, dragged_lband_pos = null, from_prgm_id = null;
	isLband = true;

	from_seg = $("#"+event.target.id).closest('ul.prgm-seg-wrapper').prop('id');
	//To highlight dragging slot
	$(event.target).closest("li.slot").addClass("uns_draging_item");

	var id = $(event.target).closest("li.slot").attr('id');

	if(id){
		dragged_lband_id = id.split("-")[1];
		dragged_lband_pos = $(event.target).closest("li.slot").index();

		var prgm_id = $("#"+id).closest('.program-wrapper').attr('id');
		if(prgm_id){
			from_prgm_id = prgm_id.split('_')[1];
		}
	}
	
	info = from_seg.split("_");
	if(info.length){
		from_seg_id = info[1];
		from_sub_seg_id = info[2];
	} 

}

function alloc_lband_drag_start(event){

	if(!isLband){
		return;
	}

	//Below line required to make drag/drop working in IE and Firefox
	event.dataTransfer.setData('text', event.target.id); 

}

var to_lband = null;
function alloc_lband_drag_over(event){
	console.log("..........alloc_lband_drag_over...........");

	if(!isLband){
		return;
	}

	$('.placeholder').remove(); //remove old drop placeholder

	var ele = $(event.target).closest("li.slot");
	var alloc_lband_drag = ele.attr('id');

	// console.log("alloc_lband_drag ==>> "+alloc_lband_drag);

    if(alloc_lband_drag!=undefined){
	    var drag_lband_details = alloc_lband_drag.split("-");

	    var target_seg = ele.closest('ul.prgm-seg-wrapper').prop('id');
	    target_idx = parseInt(ele.index());
	   
    	// var drop_placeholder = '<li class="placeholder lband-placeholder slot"> Inserting L-band at position: '+(target_idx+1)+'</li>';
    	// $("#"+target_seg+" li:eq("+(target_idx-1)+")").after(drop_placeholder);


    	var to_seg = null, info = [];

		to_seg = $(event.target).closest('ul.prgm-seg-wrapper').prop('id');

	    //to get To program id
	    var prgm_id = $("#"+to_seg).closest('.program-wrapper').attr('id');
		if(prgm_id){
			to_prgm_id = prgm_id.split('_')[1];
		}

	    info = to_seg.split("_");
	    if(info.length){
	    	to_seg_id = info[1];
	    	to_sub_seg_id = info[2];
	    }



	    var dp = [];
	    // console.log("dragged_unslot_id: "+dragged_unslot_id+" type: "+type);
	    if(dragged_unslot_id){
	    	dp = $("#unslot-"+dragged_unslot_id+" .prgm_comm_dp").text().split("-");
	    }

	    if(dragged_lband_id){   
	    	var slot = slots[dragged_lband_id];
	    	if(slot){
	    		dp[0] = slot.dp_start_time;
	    		dp[1] = slot.dp_end_time;
	    	}
	    }
	    
	    if(dp.length){
	    	// console.log("to_sub_seg_id:: "+to_sub_seg_id+" isLband => "+isLband);
	    	var slotInDayPart = check_within_day_part(dp[0],dp[1],to_prgm_id,to_sub_seg_id, "segments");

		    console.log("slotInDayPart ==>> over_on_slot........ "+slotInDayPart);
		    if(to_seg_id && slotInDayPart && target_idx){
		    	var drop_placeholder = '<li class="placeholder slot"> Inserting at position: '+(target_idx+1)+'</li>';
	    		$("#"+to_seg+" li:eq("+(target_idx-1)+")").after(drop_placeholder);
		    } else {
		    	to_brk = null, info = [];
		    }
		} else {
			to_brk = null, info = [];
		}


   }

}

function alloc_lband_drag_end(event){

	if(!isLband){
		return;
	}

	var to_seg = null, info = [], type = null, un_slot_type = null;
	$("li.slot").removeClass("uns_draging_item");
	var seg = $('.placeholder').closest('ul.prgm-seg-wrapper').prop('id');
	var to_prgm = $("#"+seg).closest('.program-wrapper').prop('id');

	if(to_prgm){
		to_prgm_id = to_prgm.split("_")[1];
	}

	info = seg.split("_");
    if(info.length){
    	to_seg_id = info[1];
    	to_sub_seg_id = info[2];
    }

    $('.placeholder').remove();

	console.log("============= alloc lband drag end ===============");
	console.log("from seg id: "+from_seg_id+" :: from sub seg: "+from_sub_seg_id+" :::: to seg id: "+to_seg_id+" :: to sub seg: "+to_sub_seg_id); 
	//To handle reordering in same sub break, bottom -> top reordering case.
	if(from_seg_id == to_seg_id && from_sub_seg_id == to_sub_seg_id && dragged_lband_pos > target_idx){
		dragged_lband_pos = dragged_lband_pos - 1;
	}
	// console.log(" Lband id => "+dragged_lband_id+" :: From POSITION : "+dragged_lband_pos+" ==> To POSITION : "+target_idx);
	// console.log("from_prgm_id : "+from_prgm_id+" :: to_prgm_id : "+to_prgm_id);
	// console.log("==========================================");


	if(from_sub_seg_id == to_sub_seg_id && dragged_lband_pos == target_idx){
    	console.log("=== No Change In Position => returning with no action ====");
    	dragged_lband_id = null;
    	return;
    } else {
    	if(dragged_lband_pos < target_idx){
    		target_idx = target_idx - 1;
    	}
		prelog_reorder_existing_lbands(from_prgm_id, to_prgm_id, dragged_lband_id, from_seg_id, from_sub_seg_id, to_seg_id, to_sub_seg_id, dragged_lband_pos, target_idx);
		isLband = false, dragged_lband_id = null;
	}

}

var to_seg_id = null, to_sub_seg_id = null, to_prgm_id = null;
function over_on_seg(event){
	console.log("------------ over_on_seg --------------");
	if(!isLband){
		return;
	}
	var to_seg = null, info = [];
	to_seg_id = null, to_sub_seg_id = null, to_prgm_id = null;

    to_seg = $(event.target).closest('ul.prgm-seg-wrapper').attr('id');
	// console.log("to_seg : "+to_seg);
    //set target_brk => for break which has Zero slots.
    to_seg = $(event.target).closest('ul.prgm-seg-wrapper').prop('id');

    //to get To program id
    var prgm_id = $("#"+to_seg).closest('.program-wrapper').attr('id');
    // console.log("prgm_id:: "+prgm_id);
	if(prgm_id){
		to_prgm_id = prgm_id.split('_')[1];
	}

    info = to_seg.split("_");
    if(info.length){
    	to_seg_id = info[1];
    	to_sub_seg_id = info[2];
    }

    var dp = [];
    if(dragged_unslot_id){
    	console.log("#unslot-"+dragged_unslot_id);

    	dp = $("#unslot-"+dragged_unslot_id+" .prgm_comm_dp").text().split("-");
    	console.log("dragged_unslot_id.......");
    }

    if(dragged_lband_id){   
    	var slot = slots[dragged_lband_id];
    	if(slot){
    		dp[0] = slot.dp_start_time;
    		dp[1] = slot.dp_end_time;
    	}
    }

    if(dp.length){
    	console.log("to_sub_seg_id:: "+to_sub_seg_id+" isLband => "+isLband);
    	var slotInDayPart = check_within_day_part(dp[0],dp[1],to_prgm_id,to_sub_seg_id, "segments");

	    console.log("slotInDayPart ==>> over_on_seg........ "+slotInDayPart);

	    var endTime = $("#seg_"+to_seg_id+"_"+to_sub_seg_id+" .seg_dp_end").html().trim();
	    var isElapsed = checkIsElapsedTime(endTime);

	    console.log("isElapsed...........=========== "+isElapsed);
	    
	    if(to_seg && slotInDayPart && !isElapsed){
    		$(".placeholder").remove();
	    	target_idx = 0;
	    	var drop_placeholder = '<li class="placeholder lband-placeholder slot"> Inserting at position: '+(target_idx+1)+'</li>';

	    	if($("#"+to_seg+" li").size() > 0){
	    		$("#"+to_seg+" li:eq(0)").before(drop_placeholder); //over on brk, show placeholder at 0th position.
	    	} else {
	    		$("#"+to_seg).append(drop_placeholder); //to show placeholder on zero'th position, if no existing slots are there. 
	    	}

	    } else {
	    	to_brk = null, info = [];
	    }
	} else {
		to_brk = null, info = [];
	}

}

function drop_on_seg(event){
	console.log("DROP ON SEGMENT");
	if(!isLband){
		return;
	}
	// console.log("from seg id: "+from_seg_id+" :: from sub seg: "+from_sub_seg_id+" :::: to seg id: "+to_seg_id+" :: to sub seg: "+to_sub_seg_id);
}

/* Unallocated slot drag event handling functions */
var dragged_unslot_id = null, type = null, un_slot_type = null
function unallocated_drag_start(event){
	//Below line required to make drag/drop working in IE and Firefox
	event.dataTransfer.setData('text', event.target.id);  
	from_prgm_id = null;

	var drag_unslot = null, info = [];
	dragged_unslot_id = null, from_brk_id = null, from_sub_brk_id = null, target_idx = null, type = null, un_slot_type = null;
	
	var drag_unslot = event.target.id;
	if(!drag_unslot){
		drag_unslot = $(event.target).closest('li.slot').attr('id');
	}
	$("#"+drag_unslot).addClass("uns_draging_item");

	info = drag_unslot.split('-');
	if(info.length){
		dragged_unslot_id = info[1];
	}

	un_slot_type = $("#"+drag_unslot+" .unslot_type").text();
	if(un_slot_type == "segment"){
		isLband = true;
	} else {
		isLband = false;
	}

	// console.log("Unsolt Dragged type: "+type+" :: UnSlot ID: "+dragged_unslot_id);
}

function check_within_day_part(dp_start,dp_end,program_id,sub_break, group){
  prog_details = undefined
  // console.log("dp_start:: "+dp_start+" dp_end::: "+dp_end+"  pgrIdddd: "+program_id + " sub_break::: "+sub_break)
  
  // console.log("prog_details::::"+programs_map[program_id])
  if(programs_map[program_id]!=undefined && dp_start!=undefined && 
  	dp_end!=undefined && program_id!=undefined && sub_break!=undefined){
    prog_details = programs_map[program_id];
	
	// console.log(prog_details);
	// console.log(group);

	var type = "sub_break";
	if(group == "segments"){
		type = "sub_seg";
	}

	if(!group){
		group = "breaks";
	}

    if(prog_details!=undefined && prog_details[group]!=undefined){
     	brk_list = prog_details[group];

     	for(i=0;i<brk_list.length;i++){
     		if(brk_list[i][type] == sub_break){
                if(!brk_list[i]){
                	return false;
                }
                var sub_brk = brk_list[i];

                // console.log(sub_brk.start_time+" >= "+dp_start +"&&"+ sub_brk.end_time +" <= "+dp_end);
                if( sub_brk.start_time != undefined && sub_brk.end_time != undefined){

                	// console.log("checking....");

	     		    if(sub_brk.start_time >= dp_start && sub_brk.end_time <= dp_end){
	     		    	return true;
     		    	}
	     		}else{
	     		 	return false;
	     		}
     		}
     	}
     }else{
     	console.log("invalid program/breaks")
     }
  }else{
  	console.log("Invalid programmmmmmmmm")
  	return false
  }
    return false;
}

function unallocated_drag_end(event){
	event.preventDefault();
	$('.placeholder').remove();
	$("li.slot").removeClass("uns_draging_item");

	// console.log(event.clientX +" > "+ $(".prelog-right-div").position().left);
	if(event.clientX > $(".prelog-right-div").position().left){
		console.log("Slot dropped on same div");
		to_brk_id = null, to_sub_brk_id = null, to_prgm_id = null;
		dragged_unslot_id = null, from_brk_id = null, from_sub_brk_id = null, target_idx = null, type = null, un_slot_type = null;
		return;
	}

	// console.log("from brk id: "+from_brk_id+" :: from sub brk: "+from_sub_brk_id+" :::: to brk id: "+to_brk_id+" :: to sub brk: "+to_sub_brk_id);
	// console.log("Slot Id : "+dragged_unslot_id+" :: To POSITION => "+target_idx);
	// console.log("from_prgm_id : "+from_prgm_id+" :: to_prgm_id : "+to_prgm_id);

	console.log("to_seg_id: "+to_seg_id+" :: to_sub_seg_id: "+to_sub_seg_id+" ::un_slot_type "+un_slot_type);
	
	var isDNA = false, isRWD = false, isPoweredBy = false;
	if($("#unslot-"+dragged_unslot_id+" .uns_clip_type").size()){
		var txt = $("#unslot-"+dragged_unslot_id+" .uns_clip_type").text();
		if(txt == "did_not_air"){
			isDNA = true;
		} 
		if(txt == "run_with_discr"){
			isRWD = true;
		}

		if(txt == "powered by"){
			 isPoweredBy = true;
		}
	}


	if(!dragged_unslot_id || !to_prgm_id || (!to_brk_id && !to_seg_id) || (!to_sub_brk_id && !to_sub_seg_id ) || target_idx == null || !un_slot_type){
		console.log("========== Some parameter is undefined/null in prelog_insert_proposed_schedule() =============");
		return;
	}

	if(un_slot_type != "segment"){
		console.log("! lband");
		prelog_insert_proposed_schedule(dragged_unslot_id, to_prgm_id, to_brk_id, to_sub_brk_id, target_idx, un_slot_type, isDNA, isRWD, isPoweredBy);
		isLband = false, dragged_slot_id = null, dragged_unslot_id = null;
	} else {
		console.log("Lband");
		if( to_seg_id != null && to_sub_seg_id != null ){
			prelog_insert_proposed_schedule(dragged_unslot_id, to_prgm_id, to_seg_id, to_sub_seg_id, target_idx, un_slot_type, isDNA, isRWD, isPoweredBy);
			isLband = false, dragged_slot_id = null, dragged_unslot_id = null;
		}
	}

}

var scroll_top = 0;
var slot_data = {};
function prelog_insert_proposed_schedule(unslotId, prgm_id, brk_id, sub_brk_id, position, uns_type, isDna, isRwd, isPoweredBy){
	var unslot = {}, clip = {};
	var advt_type = 'commercial';
    var sch_date = $("#logDate").val();
    var unsDetails = {}, orderedSpots = 0, productType = "", spot_type = "", clip_pos = "";
    productType = $("#unslot-"+dragged_unslot_id+" .product_type").text();

    if(isDna == false && isRwd == false){
    	unsDetails = unsIdMap[unslotId];
    	unslot = unallocSlots[unsDetails.order_id];
    } else if(isDna == true){
    	unsDetails = did_not_air_map[unslotId];
    	unslot = did_not_air_map[unslotId];
    } else if(isRwd == true){
    	unsDetails = run_with_disc_map[unslotId];
    	unslot = run_with_disc_map[unslotId];
    }

    orderedSpots = $("#unslot-"+unslotId+" .unslot_ordered_spots").text();
    spot_type = $("#unslot-"+unslotId+" .unslot_spot_type").text();
    clip_pos = $("#unslot-"+unslotId+" .uns_clip_pos").text();

	 
	var unslot_id = unsDetails.clip_id;
	slot_data = {};

	if($.isEmptyObject(unslot)){
		console.log("Empty unslot Data");
		return;
	}

   
	if(isDna == false && isRwd == false){
		//to get details of unallocated slot and clip object.
		for(var j=0; j<unslot.clips.length; j++){
			var clipObj = unslot.clips[j]
			for(var key in clipObj){
				if(unslot_id == clipObj['clip_id']){
					clip = clipObj;
					break;
				}
			}
		}
	}
	else{
		clip["rate"] = unslot.rate;
	}

    var clipId = unslot_id;
    if(!clipId){
    	console.log("Clip Id undefined");
    	return;
    }

    var dp_start_time = "", dp_end_time = "";
    if(isDna == false && isRwd == false){
	    dp_start_time = unsDetails.day_part_start;
	    dp_end_time = unsDetails.day_part_end;
	} else {
		dp_start_time = unsDetails.dp_start_time;
	    dp_end_time = unsDetails.dp_end_time;
	}
    
    var with_in_dp = true, endTime = null, isElapsed = false;
    if(un_slot_type == "segment"){
    	with_in_dp = check_within_day_part(dp_start_time,dp_end_time,prgm_id,sub_brk_id, 'segments');
    	endTime = $("#seg_"+brk_id+"_"+sub_brk_id+" .seg_dp_end").html().trim();
    } else {
    	with_in_dp = check_within_day_part(dp_start_time,dp_end_time,prgm_id,sub_brk_id, 'breaks');
    	endTime = $("#prgm-brk-"+brk_id+"_"+sub_brk_id+" .brk-time").html().split(" - ")[1];
    }

    if(endTime){
		isElapsed = checkIsElapsedTime(endTime);
	}

    if(!with_in_dp){
    	console.log("DP MIS MATCHHHHHHHHHHHHH")
    	jAlert("Timeband mis match");
    	return false;
    }

    if(isElapsed){
    	console.log("Elapsed Brk/Seg");
    	jAlert("Elapsed Time");
    	var date = $("#logDate").val();
		load_logs(date);
    	return false;
    }
    
    var clipName = "", dur = 0, orderDur = 0, cust = "", custId = "", brkBumpr = null, advType = "" , clip_caption = "";
    var tb_id = ''
    if(isDna == false && isRwd == false){
    	clipName = clip.clip_name;
    	clip_caption = clip.clip_caption
    	dur = clip.duration;
    	orderDur = clip.order_duration;
    	cust = clip.customer_name;
    	custId = clip.customer_id;
    	brkBumpr = clip.break_bumper;
    	advType = clip.advt_type;
    	if(clip.tb_id!=undefined)
    	tb_id = clip.tb_id
    } else {
    	clipName = unslot.clip_name;
    	clip_caption = unslot.clip_caption
    	dur = unslot.duration;
    	orderDur = unslot.order_duration;
    	cust = unslot.customer;
    	custId = unslot.customer_id;
    	advType = unsDetails.advt_type;
    	if(clip.tb_id!=undefined)
    	tb_id = clip.tb_id
    }

	slot_data = {
		"commercial_id": clipId,
	    "order_id":  unslot.order_id,
	    "duration": dur,
        "sid": advType,
        "advt_type": advType,
	    "program_id":  prgm_id,
	    "order_duration": orderDur,
	    "dp_start_time": dp_start_time,
	    "dp_end_time": dp_end_time,
	    "schedule_type": "auto",
	    "clip_name":  clipName,
	    "clip_caption": clip_caption,
	    "customer_name":  cust,
	    "customer_id":  custId,
	    "break_bumper": brkBumpr,
	    "channel_id": $("#channel").val(),
	    "remarks" : clip.remarks,
	    "date": sch_date,
        "position": position+1,
        "uns": true,
        "slot_type": uns_type,
        "ordered_spots": orderedSpots,
        "spot_type":spot_type,
        "product_type": productType,
        "tb_id":tb_id
	}

	console.log(slot_data);
	
	if(uns_type == "segment"){
		slot_data["segment_id"] =  brk_id;
	    slot_data["sub_segment"] = parseInt(sub_brk_id);
	} else {
		slot_data["break_id"] =  brk_id;
	    slot_data["sub_break"] = parseInt(sub_brk_id);
	}

	if(unslot.duration!=null && !isDna && !isRwd){
		slot_data["duration"] =  clip['duration'];
	}

	if(unslot.customer_id!=null){
		slot_data["customer_id"] = unslot.customer_id
	}

	if (unslot.customer_name !=null && !isDna && !isRwd){
		slot_data["customer_name"] = unslot.customer_name
	}
    
    if(clip.rate){
    	slot_data['rate'] = clip.rate;
    } else {
    	slot_data['rate'] = 0;
    }
    if(clip.break_bumper != null){
    	slot_data['break_bumper'] = clip.break_bumper;
    }

    if(clip_pos){
    	slot_data['clip_position'] = clip_pos;
    }
    
    scroll_top = $(".prelog-left-div").scrollTop();
    var url = "/proposed_schedule";
    
    //set extra fields if slot type is make_goods.
    if(isDna || isRwd){
    	slot_data["make_good_id"] = unslotId;
    	slot_data["reschedule_on"] = $("#logDate").val();
    	slot_data["schedule_type"] = "manual";
    }

    if(isPoweredBy){
    	slot_data["schedule_type"] = "manual";
    	slot_data["value_ads"] = true;
    }

    console.log("########################"+JSON.stringify(slot_data));

	$.ajax({
		global : true,
		url : url,
		type : 'POST',
		data : JSON.stringify(slot_data),
		success : function(data) {
			var date = $("#logDate").val();
			load_logs(date);
			// getLog(date);

			target_idx = null, target_old_idx = null, to_sub_brk = null, from_sub_brk = null; //reset all to null after drag end.
		},
		error: function(data){
			comm_handleAjaxError(data);
			target_idx = null, target_old_idx = null, to_sub_brk = null, from_sub_brk = null; //reset all to null after drag end.
		}
	});

}


function prelog_reorder_existing_proposed_schedule(from_prgm, to_prgm, to_prgm, slot_id, from_brk, from_sub_break, to_brk, to_sub_break, from_idx, to_idx){
	var slot_data = {}, allc_slot_data = {};

	if(slot_id == undefined || from_sub_break == undefined || to_sub_break == undefined || from_idx == undefined || to_idx == undefined || isNaN(to_idx)){
		// target_idx = null, target_old_idx = null, to_sub_brk = null, from_sub_brk = null; //reset all to null after drag end.
		console.log(slot_id+" : "+from_sub_break+" : "+to_sub_break+" : "+from_idx+" : "+to_idx);
		console.log("==== Some parameter is undefined/NaN in prelog_reorder_existing_proposed_schedule() ====");
		return;
	}

	console.log("BRK :: "+from_sub_break+" => TO => "+to_sub_break);
	console.log("POS :: "+from_idx+" => TO => "+ (to_idx+1) );

	allc_slot_data = slots[slot_id]; //get dragged item info

    if( $("#brk_"+to_brk+"_"+to_sub_break+" > li").size() == (to_idx+1) 
    	&& from_sub_break == to_sub_break && 
    	from_idx == (to_idx+1) && 
    	from_prgm == to_prgm &&
    	from_sub_brk_id == to_sub_brk_id
    	){
    	console.log(" == "+(to_idx+1)+" :: "+from_sub_break+" == "+to_sub_break);
    	console.log("======= Same From and To Position: returning before reorder ======");
    	return;
    }

	if(!allc_slot_data){
		console.log("undefined commercial details OR same from and to position");
		// target_idx = null, target_old_idx = null, to_sub_brk = null, from_sub_brk = null; //reset all to null after drag end.
		return;
	}

	slot_data = {
	    "from_break_id": from_brk,
	    "to_break_id": to_brk,
		"from_sub_break": parseInt(from_sub_break),
	    "to_sub_break": parseInt(to_sub_break),
	    "clip_name": allc_slot_data.clip_name,
	    "commercial_id": allc_slot_data.commercial_id,
	    "from_program_id": from_prgm,
	    "to_program_id": to_prgm,
	    "from_position": from_idx,
	    "to_position":  to_idx+1,
	    "slot_id": slot_id,
	    "uns": false,
	    "slot_type": "break"
	}

	console.log("============== DRAG END : Reorder ==================");
	// console.log(slot_data['to_position']);
	console.log(slot_data);

	scroll_top = $(".prelog-left-div").scrollTop();
	url = 'reorder_proposed_schedule'
     $.ajax({
     	global : true,
		url : url,
		type : 'PUT',
		data : JSON.stringify(slot_data),
		success : function(data) {	
			console.log("Sorting completed");
			var date = $("#logDate").val();
			load_logs(date);
			// getLog(date);
			target_idx = null, target_old_idx = null, to_sub_brk = null, from_sub_brk = null; //reset all to null after drag end.
		}, 
		error: function(data){
			console.log("Error while sorting slots..");
			target_idx = null, target_old_idx = null, to_sub_brk = null, from_sub_brk = null; //reset all to null after drag end.
		}
	});
}


function prelog_reorder_existing_lbands(from_prgm, to_prgm, lband_id, from_seg, from_sub_seg, to_seg, to_sub_seg, from_idx, to_idx){
	var lband_data = {}, allc_lband_data = {};

	if(lband_id == undefined || from_sub_seg == undefined || to_sub_seg == undefined || from_idx == undefined || to_idx == undefined || isNaN(to_idx)){
		// target_idx = null, target_old_idx = null, to_sub_brk = null, from_sub_brk = null; //reset all to null after drag end.
		console.log(lband_id+" : "+from_sub_seg+" : "+to_sub_seg+" : "+from_idx+" : "+to_idx);
		console.log("==== Some parameter is undefined/NaN in prelog_reorder_existing_lband() ====");
		return;
	}

	console.log("SEG :: "+from_sub_seg+" => TO => "+to_sub_seg);
	console.log("POS :: "+from_idx+" => TO => "+to_idx);

	allc_lband_data = slots[lband_id]; //get dragged item info

    if($("#seg_"+to_seg+"_"+to_sub_seg+" > li").size() == (to_idx+1) 
    	&& from_sub_seg == to_sub_seg && 
    	from_idx == (to_idx+1) &&
    	from_prgm == to_prgm &&
    	from_sub_brk_id == to_sub_brk_id
    	){
    	console.log((to_idx+1)+" :: "+from_sub_seg+" == "+to_sub_seg);
    	console.log("======= Same From and To Position: returning before reorder in LBand ======");
    	return;
    }

	if(!allc_lband_data){
		console.log("undefined lband details OR same from and to position");
		// target_idx = null, target_old_idx = null, to_sub_seg = null, from_sub_seg = null; //reset all to null after drag end.
		return;
	}

	lband_data = {
	    "from_segment_id": from_seg,
	    "to_segment_id": to_seg,
		"from_sub_segment": parseInt(from_sub_seg),
	    "to_sub_segment": parseInt(to_sub_seg),
	    "clip_name": allc_lband_data.clip_name,
	    "commercial_id": allc_lband_data.commercial_id,
	    "from_program_id": from_prgm,
	    "to_program_id": to_prgm,
	    "from_position": from_idx,
	    "to_position":  to_idx+1,
	    "slot_id": lband_id,
	    "uns": false,
	    "slot_type": "segment"
	}

	console.log("============== DRAG END : Reorder ==================");
	// console.log(slot_data['to_position']);
	console.log(lband_data);

	scroll_top = $(".prelog-left-div").scrollTop();
	url = 'reorder_proposed_schedule'
     $.ajax({
		url : url,
		type : 'PUT',
		data : JSON.stringify(lband_data),
		success : function(data) {	
			console.log("Lband Sorting completed");
			var date = $("#logDate").val();
			load_logs(date);
			// getLog(date);
			target_idx = null, target_old_idx = null, to_sub_seg = null, from_sub_seg = null; //reset all to null after drag end.
		}, 
		error: function(data){
			console.log("Error while sorting slots..");
			target_idx = null, target_old_idx = null, to_sub_seg = null, from_sub_seg = null; //reset all to null after drag end.
		}
	});
}

$(document).ready(function(){
	var height = $(window).height() - 120;
	$(".prelog-left-div").css({'min-height': height+'px','max-height':height+'px'});
	    height = height/2
	$(".prelog-right-div").css({'min-height': height+'px','max-height':height+'px'});

	var h = ( $(window).height() - 110 )/2;
	h = h-40;
	$("#did_not_air_wraper_div, #run_with_disc_wraper_div").css({'min-height': h+'px','max-height':h+'px'});
	$(".comm_wrapper_ul").css({'min-height': h+'px','max-height':h+'px'});

	$("#exp_col_all").click(function(){

		if($(this).hasClass('fa-caret-up')){
			$(this).removeClass('fa-caret-up').addClass('fa-caret-down').html("&nbsp; Expand All");
			$(".exp_col_icons").removeClass('fa-caret-up').addClass('fa-caret-down');
			$(".program-body").hide();

			if(hasLocalStorage){

				$(".program-wrapper").each(function(){
					var idInfo = this.id.split("_");

			 		if(col_exp_prgm.indexOf(idInfo[1]) == -1){
			 			col_exp_prgm.push(idInfo[1]);
			 		}
			 	});

		 		localStorage.setItem("col_exp_prgm", col_exp_prgm);
		 	}

		} else {
			$(this).removeClass('fa-caret-down').addClass('fa-caret-up').html("&nbsp; Colapse All");
			$(".exp_col_icons").removeClass('fa-caret-down').addClass('fa-caret-up');
			$(".program-body").show();
			col_exp_prgm = [];
			localStorage.setItem("col_exp_prgm", col_exp_prgm);
		}
	});
});

function cancel_default(){
	event.preventDefault();
}

function scrollProgramDiv(){
	setTimeout(function(){
		if(scroll_top > 0){
			$(".prelog-left-div").animate({scrollTop: scroll_top}, 0);
		}
	}, 200);
}
			
function trimString(name, size){
	// console.log(clipName)
	if(name!=undefined && name.length>size){
        name = name.substring(0, size)+"..";
    }
    return name
}

function trimClipNameWithExtn(name, len){
	if(name!=undefined ){
		if(name.length <= len){
			return name;
		} else {
			return name.substring(0, len-18)+"....."+name.substring(name.length-16, name.length);
		}
   }
}

//for program group (morning, evening, etc..) selection 
function getPrgmGroupClass(startTime, endTime){
	var cls = " prgm-all ";

  	var start_time = moment(startTime, 'HH:mm:ss').format('HH');
  	var end_time = moment(endTime, 'HH:mm:ss').format('HH');
  	var day_end_time = moment(endTime, 'HH:mm:ss').format('HH:mm');

	if(start_time >= moment("00", "HH").format("HH") && start_time < moment("06", "HH").format("HH")){
		cls += "prgm-mid-night";
	}

	if(start_time >= moment("06", "HH").format("HH") && start_time < moment("12", "HH").format("HH")){
		cls += "prgm-morning";
	}

	if(start_time >= moment("12", "HH").format("HH") && start_time < moment("16", "HH").format("HH")){
		cls += "prgm-afternoon";
	}

	if(start_time >= moment("16", "HH").format("HH") && start_time < moment("20", "HH").format("HH")){
		cls += "prgm-evening";
	}

	if(start_time >= moment("20", "HH").format("HH") && day_end_time <= moment("23:59", "HH:mm").format("HH:mm") ){
		cls += "prgm-prime-time";
	}

	return cls;
}

var prgm_grp = "all";
var tbTime = {"all": "00:00:00-23:59:59", "mid-night": "00:00:00-06:00:00", "morning": "06:00:00-12:00:00", "afternoon": "12:00:00-16:00:00", "evening": "16:00:00-20:00:00", "prime-time": "20:00:00-23:59:59"};
function showProgramsGroup(type){

	prgm_grp = $("#prgm-group-combobox option:selected").val();

	if(type == 'init'){
		console.log("prgm_grp: "+prgm_grp)
		if(prgm_grp == "all" ){
			$(".prgm-all").show();
		} else {
			$(".prgm-all").hide();
			$(".prgm-"+prgm_grp).show();
		}
	}

	var date = $("#logDate").val();
	if($("#logDate").val() && type != 'init'){
		$("#prelog-prgm-combobox").val("-1");
		load_logs(date);
	}

	var tb = {};
	if(localStorage.getItem("tb")){
		tb = JSON.parse(localStorage.getItem("tb"));
	}
	tb[date] = prgm_grp;

	var prgms = {};
	if( localStorage.getItem("prgms") ){
		prgms = JSON.parse(localStorage.getItem("prgms"));
		if( !$.isEmptyObject(prgms) ){
			prgms[date] = "-1";
			localStorage.setItem("prgms", JSON.stringify(prgms));
		}
	}
	

	localStorage.setItem("tb", JSON.stringify(tb));

}

var advt_color_map = {};
var advtTypeNameIdMap = {};
function load_advt_types(){
    $.ajax({
    dataType: "json",
    url: '/advertisement_types',
    success: function( result) {
      advt_type_list = [], advtTypeNameIdMap = {};
      if(result.ad_types!=undefined)
        advt_type_list = result.ad_types;
      	var options = "", com_div = "", dna_div = "", rwd_div = "";

      	var h = ( $(window).height() - 110 )/2;
		h = h-40;

        for(j=0;j<advt_type_list.length;j++){

        	if( advt_type_list[j].schedule != "off" ){
        		var advtName = advt_type_list[j].name;
        		var advt_identity = advt_type_list[j].ad_type_identity
	            options += '<option value="' + advt_identity + '">' + advtName + '</option>';  
	            com_div += '<div class="unalocated_list_wrapper advt'+j+'_list" id="prg-advt'+j+'">'
	    						+'<ul class="comm_wrapper_ul brk-advt'+j+'" id="brk-advt'+j+'" style="min-height:200px;max-height:'+h+'px;overflow:auto"></ul>'
	  						+'</div>';

	  			dna_div += '<div class="unalocated_list_wrapper advt'+j+'_list" id="prg-dna-advt'+j+'">'
	    						+'<ul class="comm_wrapper_ul brk-advt'+j+'" id="brk-dna-advt'+j+'" style="min-height:200px;max-height:'+h+'px;overflow:auto"></ul>'
	  						+'</div>';

	  			rwd_div += '<div class="unalocated_list_wrapper advt'+j+'_list" id="prg-rwd-advt'+j+'">'
	    						+'<ul class="comm_wrapper_ul brk-advt'+j+'" id="brk-rwd-advt'+j+'" style="min-height:200px;max-height:'+h+'px;overflow:auto"></ul>'
	  						+'</div>';

	  			var colr =  "#fdfdd2";
	  			if(advt_type_list[j].color){
	        		colr = advt_type_list[j].color;
	        	}
	        	advt_color_map[advtName] = colr;
	        	advtTypeNameIdMap[advt_identity] = "advt"+j;
	        }
        	
        }

          $("#prelog_advt_types").html(options);
          $("#prelog_prev_advt_types").html(options);
          $("#unallocated_wrapper_div").html(com_div);
          $("#did_not_air_wraper_div").html(dna_div);
          $("#run_with_disc_wraper_div").html(rwd_div);

          var comUnslotDivId = "";
          //if advt type is having name 'commercial'
        if(advtTypeNameIdMap['commercial'] != undefined){
        	comUnslotDivId = advtTypeNameIdMap['commercial'];
        	$("#prelog_advt_types option[value='commercial']").attr("selected", true);
          	$("#prelog_prev_advt_types option[value='commercial']").attr("selected", true);
        } else if( $("#prelog_advt_types option:eq(0)").val() ){
        	//if advt type is not having name 'commercial', show default as first one.
        	var initialAdvtName = $("#prelog_advt_types option:eq(0)").val();
        	comUnslotDivId = advtTypeNameIdMap[initialAdvtName];
        	$("#prelog_advt_types option:eq(0)").attr("selected", true);
          	$("#prelog_prev_advt_types option:eq(0)").attr("selected", true);
        }
		
		if(comUnslotDivId){
			$(".unalocated_list_wrapper#prg-"+comUnslotDivId).show();
			$(".unalocated_list_wrapper#prg-dna-"+comUnslotDivId).show();
		}
          
          // $(".unalocated_list_wrapper#prg-rwd-"+comUnslotDivId).show();
    },
     error: function(xhr, status, text) {
	       var response = $.parseJSON(xhr.responseText);
	       var err = response.errors;
		  if(err.toString()=='session_expired'){
		  	window.location.href= "index.html";
		  } else {         
	           jAlert(err.toString());
	       }
	 }
  });
}

load_advt_types();

function getSlotTypeFirstLetter(slotType){
	var letter = '';
	if(slotType){
		letter = slotType.substring(0,1);
	}
	return letter.toUpperCase();
}

function darkerColor(x){
	x = x.replace("#", "");
    var a = x.substring(0, 2);
    var b = x.substring(2, 4);
    var c = x.substring(4, 6);

    a = parseInt( parseInt(a, 16)/2 );
    b = parseInt( parseInt(b, 16)/2 );
    c = parseInt( parseInt(c, 16)/2 );

    a = a.toString(16);
    b = b.toString(16);
    c = c.toString(16);

    return "#"+a+b+c;
}


function checkIsElapsedTime(endTime){
	var isElapsed = false;
	var prgDate = moment($("#logDate").val(), "DD/MM/YYYY").format('YYYYMMDD')
	var curDate = moment().format('YYYYMMDD');
	var curTime = moment().format('HH:mm:ss')

	if(prgDate == curDate){
		if(endTime < curTime){
			isElapsed = true;
		}
	} 

	if(prgDate < curDate){
		isElapsed = true;
	}
	// console.log(endTime+ " isElapsed : "+isElapsed);
	return isElapsed;
}


function getAdvtTypeLocalId(advtType){
	var id = "";
	if( !$.isEmptyObject(advtTypeNameIdMap) ){
		if(advtTypeNameIdMap[advtType]){
			id =  advtTypeNameIdMap[advtType];
		}
	} 
	return id;
}

$(document).on("click", ".clip_name_preview", function(){
	var id = $(this).attr('value');
	console.log("clip id..."+id);
	var title = $(this).attr('title');
	showClipPreview(id, title, '#prelog-playVideo');
});

$('#prelog-playVideo').dialog({
	width:650,
	height:450,
	modal:true,
	title:"video Details",
	autoOpen:false,
	close:function() {
		$("video")[0].pause();
	}
});

prelog_loadCustomers();
function prelog_loadCustomers(){
    var url = "/customers?status=active&channel_id="+channel;
    $.ajax({
		url: url,
		method: 'GET',
		success: function(data) {
			if(!data.customers.length){
				console.log("Empty Customers List");
				return;
			}
			$("#cutomer-combobox").html('');
			var custStr = '<option value="-1">All Customer</option>';
            for(var i=0; i<data.customers.length; i++){
            	var item = data.customers[i];
            	custStr += '<option value="'+item['name']+'">'+item['name']+'</option>';
            }
            $("#cutomer-combobox").html(custStr);
		},
		error: function(xhr, status, text) {
			comm_handleAjaxError(xhr);
		}
	});
}

function showCustomerClips(){
	var cust = $("#cutomer-combobox").attr('value');
	if(cust){
		if(cust != -1){
			$(".prelog-left-div .slot").hide();
			$(".prelog-left-div .slot").each(function(){
				var title = $(this).attr('title');
				if(title){
					title = title.replace("Customer: ", "");
					if(cust == title){
						$(this).show();
					} else {
						$(this).hide();
					}
				} else {
					$(this).hide();
				}
			});
		} else {
			$(".prelog-left-div .slot").show();
		}
	}
}


// function showMakeGoodsType(){
// 	var mkType = $("#make_goods_id").val();
// 	$(".make_goods_wrapper").hide();
// 	if(mkType == "dna"){
// 		$("#did_not_air_wraper_div").show();
// 	}
// 	if(mkType == "rwd"){
// 		$("#run_with_disc_wraper_div").show();
// 	}
// }

$('#prelog-clip-info').dialog({
	width : 600,
	height : 400,
	modal : true,
	autoOpen:false,
	title: 'Clip Details'
});

function initClipInfoClick(){
	$(".prelog_clip_info").click(function(){
		var type = $(this).attr("data");
		var slotId = $(this).attr("value");
		console.log(type+" ::: "+slotId);

		var unslot = {};
		if(type == "dna"){
			unslot = did_not_air_map[slotId];
		}

		if(type == "rwd"){
			unslot = run_with_disc_map[slotId];	
		}

		var unsDetails = {}, clip = {};
		if(type == "uns"){
			unsDetails = unsIdMap[slotId];
    		unslot = unallocSlots[unsDetails.order_id];

    		var unslot_id = unsDetails.clip_id;

			for(var j=0; j<unslot.clips.length; j++){
				var clipObj = unslot.clips[j]
				for(var key in clipObj){
					if(unslot_id == clipObj['clip_id']){
						clip = clipObj;
						break;
					}
				}
			}
		}

		try{
			$('#prelog-clip-info').dialog('close');
		} catch(e){
			console.log("dialog not exist");
		}
		$(".clip_value").html("");
		$(".ci_remarks, .ci_brk_bmpr, .ci_status, .ci_ro_id, .ci_ro_num").hide();

		// $("#prelog-clip-info").dialog({ title: title });

		var clipName = "", dur = "", orderDur = "", cust = "", advType = "", tb = "", roId = "", roNum = "";
		if(type == "uns" ){
	    	clipName = clip.clip_name;
	    	dur = clip.duration.toFixed(2);
	    	orderDur = clip.order_duration;
	    	cust = clip.customer_name;
	    	custId = clip.customer_id;
	    	// brkBumpr = clip.break_bumper;
	    	advType = clip.advt_type;
	    	tb = $("#unslot-"+slotId+" .prgm_comm_dp").text();
	    	$("#ci_date").html($("#logDate").val());
	    	if(clip.remarks){
	    		$("#ci_remarks").html(clip.remarks);
	    		$(".ci_remarks").show();
	    	}
	    	if(clip.break_bumper){
	    		$("#ci_brk_bmpr").html(clip.break_bumper);
	    		$(".ci_brk_bmpr").show();
	    	}
	    	if(clip.ro_id){
	    		roId = clip.ro_id;
	    	}
	    	if(clip.ci_ro_num){
	    		roNum = clip.ci_ro_num;
	    	}

	    } else {
	    	clipName = unslot.clip_name;
	    	dur = unslot.duration.toFixed(2);
	    	orderDur = unslot.order_duration;
	    	cust = unslot.customer;
	    	custId = unslot.customer_id;
	    	advType = unslot.advt_type;
	    	tb = unslot.dp_start_time+" - "+unslot.dp_end_time;
	    	var d = moment(unslot.date_time, "YYYY/MM/DD HH:mm:ss").format("DD/MM/YYYY HH:mm:ss");
	    	$("#ci_date").html(d);
	    	if(unslot.status){
	    		$("#ci_status").html(unslot.status);
	    		$(".ci_status").show();
	    	}

	    	if(unslot.ro_id){
	    		roId = unslot.ro_id;
	    	}
	    	if(unslot.ci_ro_num){
	    		roNum = unslot.ci_ro_num;
	    	}
	    }

		$("#ci_name").html(clipName);
		$("#ci_tb").html(tb);
		$("#ci_dur").html(dur+" sec");
		$("#ci_customer").html(cust);
		$("#ci_order_dur").html(orderDur+" Sec");
		$("#ci_advt_type").html(advType);

		if(roId){
			$("#ci_ro_id").html(roId);
			$(".ci_ro_id").show();
		}
		if(roNum){
			$("#ci_ro_num").html(roNum);
			$(".ci_ro_num").show();
		}
		
		$('#prelog-clip-info').dialog('open');
	});
			
}

function log_loadMakeGoods(){
	var date = $("#makeGoodsDate").val();
	var channel_id = $("#channel").val();

	if(!date || !channel_id){
		console.log("Invalid make good date or channel_id ");
		return;
	}
	var url = "make_goods?from_date="+date+"&to_date="+date+"&channel_id="+channel_id;
	$.ajax({
		global: true,
		url : url,
		type : "GET",
		success : function(data) {

			did_not_air_list = [], run_with_disc_list = [];

			did_not_air_list = data["did_not_air-report"];
			if(did_not_air_list != undefined){
				display_did_not_air();
			}

			run_with_disc_list = data["run_with_descre-report"];
			if(run_with_disc_list != undefined){
				display_run_with_disc();
			}
		},
		error: function(error){
			comm_handleAjaxError(error);
		}
	});

}

function highlightSameProductType(){
	var brks = $(".prgm-brk-wrapper");
	$.each(brks, function(index, brk) {

		var brkId = $(this).attr("id");

		if( $("#"+brkId+" li ").length > 0 ) {
			var prdctType = "", prevPrdctType = "", prevSlotId = "";
			$("#"+brkId+" li ").each(function(idx, slot) {
				var slotId = $(this).attr("id");
				prdctType = "";
				prdctType = $("#"+slotId+" .product_type").text();

				if(prdctType != null && prdctType != undefined && prdctType != ""){
					if(prevPrdctType == prdctType){
						$("#"+slotId+" , #"+prevSlotId).css({"background": "#ffcc98", "border-bottom": "1px solid #f78df8"});
						$("#"+slotId).css({"margin-top": "0"});
						if( $("#"+slotId+" span.align-right i.fa-warning").length == 0){
							$("#"+slotId+" span.align-right").prepend('<i class="fa fa-warning" title="Same Product type back to back" style="color:#8b8b8b;margin-right:8px;cursor:pointer;"></i>');
						}
					} else {
						prevPrdctType = prdctType;
					}
				} else {
					prevPrdctType = "";
				}
				prevSlotId = slotId;
			});
		}
	});
		
}

