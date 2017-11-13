var TELECAST_CERTIFICATE_FILTER_DATA = {}; // This is to temporarily hold the filter results
var TELECAST_DURATION_SUMMARY = {}; // Id as the key, Clip name, Paid Duration and Bonus duration as the value
var TELECAST_NFPC_DURATION_SUMMARY = {}; 
var tc_num = '', billType = "";

comm_loadInvoiceMaster();

var customer_details = "";
TELECAST_CERTIFICATE_FILTER_DATA["cg_log_map"] = {};

var tcNum = "", tc_cost = {};
function get_tc_details(tc_num){
	$(".telecast-certificate #nfpc-summary-table tbody").html("");
	resetTCValues();

	TELECAST_DURATION_SUMMARY = {};
    TELECAST_NFPC_DURATION_SUMMARY = {};
    TELECAST_CERTIFICATE_FILTER_DATA["telecast_log_map"] = {};
    TELECAST_CERTIFICATE_FILTER_DATA["cg_log_map"] = {};
    $(".activity_period, .brand").html("");


	$.ajax({
			global: true,
			url: 'telecast/'+tc_num,
			success:function(response){
				console.log(response);
				tcNum = tc_num;
				$(".invoice_date_picker_div").hide();

				customer_details = "";
				 var tc_info = response["telecast_info"];
                 customer_details = tc_info['customer'];
                 var as_run_log_details = tc_info['ads_log'];
                 var roId = tc_info['ro_id'];

                 tc_cost = tc_info.tax_and_final_cost;

                 console.log("invoice_date.........."+tc_info.invoice_date);

                 if("invoice_date" in tc_info){
                 	$(".invoice-date").html(moment(tc_info.invoice_date, "YYYY/MM/DD").format("DD/MM/YYYY"));
                 } else {
                 	$(".invoice-date").html("-");
                 }

                 if("from_date" in tc_info){
                 	$('.certificate-content .meta-data .month').html(moment(tc_info.from_date, "YYYY/MM/DD").format("MMMM YYYY"));
                 } else {
                 	$('.certificate-content .meta-data .month').html("-");
                 }

                 if(tc_info.customer){
	                 if(tc_info.customer.ro_details){
	                 	if(tc_info.customer.ro_details.activity_period){
					   		var dateArr = tc_info.customer.ro_details.activity_period.split("_");
					   		var fromDate = moment(dateArr[0], "YYYY/MM/DD").format("DD/MM/YYYY");
					   		var toDate = moment(dateArr[1], "YYYY/MM/DD").format("DD/MM/YYYY");
					   		$(".activity_period").html(fromDate +" - "+toDate);
	                 	}
	                 }
	               }

                 $(".cg-summary-table, .nfpc-summary-table").hide();
                 if("cg_data" in tc_info){
				 	if(tc_info.cg_data.length > 0){
				 		$(".cg-summary-table, .nfpc-summary-table").show();
				 		display_tc_cg_data(customer_details,tc_info.cg_data,roId, true);
				 	} else if("cg_summary" in tc_info){
				 		if(tc_info.cg_summary.length > 0){
					 		TELECAST_NFPC_DURATION_SUMMARY = tc_info.cg_summary;
					 		loadCommonDetails(customer_details, [], roId);
					 		loadCGDurSummayTable();
					 		$(".nfpc-summary-table").show();
					 	}
				 	}
				 } else if("cg_summary" in tc_info){
				 	if(tc_info.cg_summary.length > 0){
				 		TELECAST_NFPC_DURATION_SUMMARY = tc_info.cg_summary;
				 		loadCGDurSummayTable();
				 		loadCommonDetails(customer_details, [], roId);
				 		$(".nfpc-summary-table").show();
				 	}
				 }

				 $(".telecast_report_tbl, .duration-summary-table").hide();

				 if(as_run_log_details){
				 	if(as_run_log_details.length > 0){
				 		$(".telecast_report_tbl, .duration-summary-table").show();
                 		display_tc_spot_details(customer_details,as_run_log_details,roId);
                 	} 
                 }
                 
                 $(".invoice-no").text(tc_info['telecast_num']);
                 $(".brand").html("")
                 if(tc_info.brand){
                 	$(".brand").html(tc_info.brand);
                 }
                 $(".update_telecast_btn").hide();
                 if('remarks' in tc_info){
                 	$(".tele_remarks").val(tc_info['remarks']);
                 	$(".tele_remarks_span").html(tc_info['remarks']);
                 }
                 updateAddressedTo(tc_info.address_to, customer_details);

                setTimeout(function(){
					$(".telecast-certificate select, .tele_remarks").attr("disabled", "true");
					$(".cg_count_span").unbind("click");
				}, 500);
			},
			error: function(xhr, status, text) {
		      comm_handleAjaxError(xhr);
		    }
		});
}

function updateAddressedTo(adrs_to, cust_details){
	if(!adrs_to){
		$(".tc_agency").html("");
		$(".agency-addr").html("");
		return;
	}

	if(adrs_to.toLowerCase() == "client" && cust_details.address ){
		var adrs = get_client_details(cust_details.address);
   	  	$(".agency-addr").text(adrs);

   	  	if(cust_details.name){
     		$(".tc_agency").text(cust_details.name.toUpperCase())
     	}

	} else if(adrs_to.toLowerCase() == "agency" && cust_details.agency_address ){
		var adrs = get_client_details(cust_details.agency_address);
   	  	$(".agency-addr").text(adrs);

   	  	if(cust_details.agency_name){
	   	  	$(".tc_agency").text(cust_details.agency_name.toUpperCase())
	   	} else {
	   		$(".tc_agency").html("Direct");
		 	$(".agency-addr").html("");
	   	}

	} else {
		$(".tc_agency").html("");
		$(".agency-addr").html("");
	}
}

function display_tc_spot_details(customer, as_run_logs, roId){
		// resetTCValues();
		var billType = "";
        TELECAST_CERTIFICATE_FILTER_DATA['customer'] = customer;
		TELECAST_CERTIFICATE_FILTER_DATA['telecast_log_map'] = {};

		loadCommonDetails(customer,as_run_logs,roId);
		 
		var rowStr = "";
		var totalDuration = 0;
		 
		for (i = 0; i < as_run_logs.length; i++) {
			var log = as_run_logs[i];

			TELECAST_CERTIFICATE_FILTER_DATA['telecast_log_map'][log._id] = log;
		 	duration = 	log.duration;
			if(log.order_dur!=undefined){
		 		duration = 	log.order_dur;
		 		totalDuration += parseInt(duration);
		 	}

		 	var prgm_name = '';
		 	if(log.program_name)
		 		prgm_name = log.program_name;

		 	var timeband = '';
		 	if(log.timeband)
		 		timeband = log.timeband;
		 	
		 	var clip_cap = '', brand = '', captionStr = '';
		 	if(log.clip_caption){
		 		clip_cap = log.clip_caption;
		 	}else if(log.commercial_id){
		 		clip_cap = get_clip_name_without_extn(log.commercial_id);
		 	}

		 	if(log.commercial_id){
		 		if(ro_clip_brand_map[log.commercial_id.toLowerCase()]){
		 			brand = ro_clip_brand_map[log.commercial_id.toLowerCase()];
		 		}
		 		captionStr = log.commercial_id.toUpperCase();
		 	}
		 	log["brand"] = brand;

            var tb_caption = clip_cap
		 	if (log.tb_caption){
		 		tb_caption = log.tb_caption
		 	}

		 	tb_caption = tb_caption.toUpperCase()
            
            var advt_type = '';
            if(log.advt_type)
            	advt_type = log.advt_type;  

            var infoExists = false;
            var info = ''; 
            if(log.info){
            	infoExists = true;
               	info = log.info;
            }

            var is_recorded_slot = false;
            if(log.is_recorded){
            	is_recorded_slot = true;
            }

            var cls = ''
            if(is_recorded_slot){
            	cls = 'blue_bg'
            }

		 	tc_date = moment(log.date,"YYYY/MM/DD").format("DD/MM/YYYY");


		 	if(infoExists){
		 		rowStr += '<tr class="'+cls+'"><td class="disabled">'+(i+1)+'</td><td>'+tc_date+'</td> <td>'+advt_type.toUpperCase()+'</td><td class="timeband">'+timeband+' </td><td > '+prgm_name + '</td> <td class="clip-caption" title="'+info+'">'+tb_caption+'<span style="margin-left: 5px; font-size: 14px; color: #245aaf;" class="fa fa-info-circle"></span></td><td class="disabled"  style="word-break: break-all;">'+captionStr+' </td> <td>'+log.real_start_time+'</td> <td>'+brand+'</td> <td>'+parseInt(duration)+'</td>';
		 	}else{
		 		rowStr += '<tr class="'+cls+'"><td class="disabled">'+(i+1)+'</td><td>'+tc_date+'</td> <td>'+advt_type.toUpperCase()+'</td><td class="timeband">'+timeband+' </td><td > '+prgm_name + '</td> <td class="clip-caption" title="'+clip_cap+'">'+tb_caption+'</td><td class="disabled" style="word-break: break-all;">'+captionStr+' </td><td>'+log.real_start_time+'</td> <td>'+brand+'</td> <td>'+parseInt(duration)+'</td>';
		 	}
		 	
		 	// Spot Type
		 	if("package_detail" in log){
		 		var type = log.spot_type.toUpperCase();
		 		var remarksIconStr = '<i class="fa fa-pencil-square remarksIcon" style="margin-left:5px;font-size: 14px; color: #245aaf;" id="slotRemarks-'+log._id+'" title="Edit Remarks"></i>'
		 		var remarksInfoStr = "";
		 		if(log.remarks){
		 			remarksInfoStr = '<i class="fa fa-info-circle remarksInfo" style="cursor:pointer;margin-left:5px;font-size: 14px; color: #245aaf;" title="Remarks: '+log.remarks+'"></i>'
		 		}
			 	if(log.package_detail.toLowerCase() != "per_day"){
				 	rowStr += '<td><span class="spotTypePrint" id="realSpotVal-'+log._id+'" data="'+type+'"  style="display:none;">'+log.spot_type.toUpperCase()+'</span>'+remarksInfoStr+' <select class="spotTypeScreen spotTypeSel" id="spotType-'+log._id+'">';
				 	if( log.spot_type.toUpperCase() == "PAID" ){
				 		rowStr += '<option value="bonus">BONUS</option><option selected value="paid">PAID</option></select>'+remarksIconStr+'</td>';
				 	} else if( log.spot_type.toUpperCase() == "BONUS" ){
				 		rowStr += '<option selected value="bonus">BONUS</option><option value="paid">PAID</option></select>'+remarksIconStr+'</td>';
				 	} else {
				 		rowStr += '<option selected value="bonus">BONUS</option><option value="paid">PAID</option></select>'+remarksIconStr+'</td>';
				 	}
				} else {
					rowStr += '<td><span class="spotTypePrint" id="realSpotVal-'+log._id+'" data="'+type+'" style="display:none;">'+log.spot_type.toUpperCase()+'</span>'+log.spot_type.toUpperCase()+'</td>';
				}
			}else {
				rowStr += '<td><span class="spotTypePrint" style="display:none;">--</span>--</span></td>';
			}
		 	
			rowStr += '<td id="spotRate-'+log._id+'" data="'+log.rate+'" class="disabled">'+parseFloat(log.rate).toFixed(2)+'</td>';
			rowStr += '<td id="slotDelete-'+log._id+'" class="disabled teleSlotDelete teleSlotDelete_col" title="Delete entry"><i class="fa fa-trash"></i></td>';

		}

		rowStr += '<tr class="disabled"><td  colspan="8" style="text-align:right;"><span style="margin-right:10px;">Total Duration</span></td><td colspan="3" style="text-align:left;"><span style="margin-left:8px;">'+totalDuration+'</span></td></tr>';

		$("#telecast_report_tbl tbody").html(rowStr);
		
		loadTelecastDurationSummary();
		initClickOnRemarks();
	}

function initClickOnRemarks(){
	$(".remarksIcon").unbind("click");
	$(".remarksIcon").click(function(){
		var slotId = this.id.replace("slotRemarks-", "");
		setTimeout(function(){
			$(".remarksIcon").html("");
		}, 200);

		showHideRemarksDialog(slotId);
	});

	$(".teleSlotDelete").unbind("click");
	$(".teleSlotDelete").click(function(){
		var slotId = this.id.replace("slotDelete-", "");
		if(slotId){
			jConfirm('Do you want to delete this Telecast entry', 'Telecast', function(response) {
				if(response){
					if(slotId in TELECAST_CERTIFICATE_FILTER_DATA['telecast_log_map'] ){
						delete TELECAST_CERTIFICATE_FILTER_DATA['telecast_log_map'][slotId];
						$("#slotDelete-"+slotId).closest("tr").remove();
						loadTelecastDurationSummary();
						resetDetailsTableSerialNo();
					}
				}
			});
		}
	});
}

function resetDetailsTableSerialNo(){
	$("#telecast_report_tbl tbody tr").each(function(index){
		var firstTD = $(this).children("td:eq(0)");
		var text = firstTD.text();
		if(text){
			text = text.trim();
		}

		if(text.toLowerCase() != "total duration"){
			firstTD.text(index+1);
		}

	});
}

$("#regenerate_tc").click(function(){

})

// Updates the spot type for the given id
function updateTelecastPaidBonus(slotId, val, remarks){
	$("#slot_rate_remarks_div").dialog('close');
	TELECAST_CERTIFICATE_FILTER_DATA['telecast_log_map'][slotId].spot_type = val;
	TELECAST_CERTIFICATE_FILTER_DATA['telecast_log_map'][slotId].remarks = remarks;
	var remarksId = "slotRemarks-"+slotId;
	if(remarks){
		$("#"+remarksId).show();
	} else {
		$("#"+remarksId).hide();
	}

	getClipTimebandRate(slotId, val);
}

function showHideRemarksDialog(slotId){
	var remarks = TELECAST_CERTIFICATE_FILTER_DATA['telecast_log_map'][slotId].remarks;
		
	$("#slot_rate_remarks_div").dialog('open');
	setTimeout(function(){
		$("#slot_rate_remarks_div textarea").attr("data", slotId);
		$("#slot_rate_remarks_div textarea").val(remarks);
		$(".ui-dialog-titlebar-close").hide();
	}, 300);
	
}

function getClipTimebandRate(slotId, val){
	var spotObj = TELECAST_CERTIFICATE_FILTER_DATA['telecast_log_map'][slotId];

	var spotRate = $("#spotRate-"+slotId).attr("data");

	if( val.toUpperCase() == "PAID" && spotRate > 0 ){
		$("#spotRate-"+slotId).html(spotRate);
		spotObj.rate = spotRate;
		loadTelecastDurationSummary(); // Reload the table with new data
		return false;
	} else if(val.toUpperCase() == "BONUS"){
		var realVal = $("#realSpotVal-"+slotId).attr("data");
		if( "bonus" == realVal.toLowerCase() ){
			$("#spotRate-"+slotId).html(spotRate);
			spotObj.rate = spotRate;
		} else {
			$("#spotRate-"+slotId).html("0");
			spotObj.rate = 0;
		}
		loadTelecastDurationSummary(); // Reload the table with new data
		return false;
	}
	
	var  tb = "00:00:10_23:59:59", orderId = "";
	if( spotObj.timeband ){
		tb = spotObj.timeband;
	}
	if(spotObj.order_id){
		orderId = spotObj.order_id;
	}

	var values = getRates(spotObj);
    
    

	if(values.length){
		var rateStr = "";
		if(values.length == 1){
			rateStr = values[0].rate.split(" :: ")[0];
			rateStr = parseFloat(rateStr).toFixed(2);
		} else {
			rateStr = '<select id="spot_rate_'+slotId+'" class="spot_rate_select">';
			for(var i=0; i<values.length; i++){

				// rateStr += '<option value="'+values[i].tb+'">'+values[i].rate+'</option>';
				rateStr += '<option value="tb_'+i+'">'+values[i].rate+'</option>'

			}
			rateStr += '</select>';
		}
		$("#spotRate-"+slotId).html(rateStr);

		//set default rate for slot.
		TELECAST_CERTIFICATE_FILTER_DATA['telecast_log_map'][slotId].rate = values[0].rate.split(" :: ")[0];

		loadTelecastDurationSummary(); // Reload the table with new data
	}
	initRateSelClick();
}

function initRateSelClick(){
	$("#telecast_report_tbl select.spot_rate_select").off("change");
	$("#telecast_report_tbl select.spot_rate_select").on("change", function() {
		var id = $(this).attr("id");
		var value = $("#"+id+" option:selected").text().split(" :: ")[0];
		value = value.trim();
		var slotId = id.replace("spot_rate_", "");
		
		TELECAST_CERTIFICATE_FILTER_DATA['telecast_log_map'][slotId].rate = parseFloat(value).toFixed(2);

		loadTelecastDurationSummary(); // Reload the table with new data
	});
}


var TB_KEY_MAP = {}
function loadTelecastDurationSummary(){
	var display_caption = 'clip_caption'
	if(invoiceMaster.invoice_caption_type!=undefined)
	var display_caption = invoiceMaster.invoice_caption_type
	TELECAST_DURATION_SUMMARY = {}; 

	$.each(TELECAST_CERTIFICATE_FILTER_DATA['telecast_log_map'], function(key, val){
		var obj, key;
		var caption = val.clip_caption;
		var id = key;
		var tb_caption = '' 
        
		if(!caption){
			caption = get_clip_name_without_extn(val.commercial_id);
		}
        
        tb_caption = caption
        if (val.tb_caption!=undefined && val.tb_caption!='')
			tb_caption = val.tb_caption.toUpperCase()

		if (val.tb_id!=undefined && 
			val.tab_id!='' && val.tb_id!=null){
            key = val.tb_id + '_' + val.spot_type;
            TB_KEY_MAP[key] = tb_caption + "###" + val.timeband + "###" + val.rate;
		}
        else
		   key = caption + "###" + val.timeband + "###" + val.rate; // key combination(caption+timeband+rate)

		// console.log("KEY"+key)
		if(TELECAST_DURATION_SUMMARY[key]){
			obj = TELECAST_DURATION_SUMMARY[key];
		}

		var sp_t = "";
		if(val.spot_type){
			sp_t = val.spot_type;
		}

		if(!obj){
			//new FCT summary entry row.
			obj = {'clip_caption': tb_caption, 'paid_duration': 0, 'bonus_duration': 0, 'timeband': val.timeband, 'rate': parseFloat(val.rate), 'count': 0, 'spot_type': sp_t.toLowerCase(), "id":  id,"package_detail":val.package_detail};
			TELECAST_DURATION_SUMMARY[key] = obj;
		} else if( $.isNumeric(val.rate) ){
			if(parseFloat(obj.rate).toFixed(2) != parseFloat(val.rate).toFixed(2) ){
				obj = {'clip_caption': tb_caption, 'paid_duration': 0, 'bonus_duration': 0, 'timeband': val.timeband, 'rate': parseFloat(val.rate), 'count': 0, 'spot_type': sp_t.toLowerCase(), "id": id ,"package_detail":val.package_detail};
				TELECAST_DURATION_SUMMARY[key] = obj;
			}
		} else {
			console.log("rate is not Numeric...");
		}

		obj.count = obj.count + 1;
		if(sp_t.toLowerCase() == 'paid'){

			if ("order_dur" in val)
				obj.paid_duration += parseInt(val.order_dur);
			else if("duration" in val)
				obj.paid_duration +=parseInt(val.duration);
		}else{

			if ("order_dur" in val)
				obj.bonus_duration += parseInt(val.order_dur);
			else if ("duration" in val)
				obj.bonus_duration +=parseInt(val.duration);
		}
		
	});

    // console.log(JSON.stringify(TELECAST_DURATION_SUMMARY))

	var tbody = "", grossAmt = 0, totalPaidDur = 0, totalBonusDur = 0;
	$.each(TELECAST_DURATION_SUMMARY, function(key, val){
		var tb = "-";
		if(val.timeband != undefined && val.timeband){
			tb = val.timeband;
		}

	    if(val.paid_duration != 0){ 
	        if(val.package_detail!=undefined && val.package_detail!='per_unit')	{
	    	 var amount = (val.paid_duration/10) * val.rate; 
	    	 grossAmt += amount;
	        }
	        else{
	          var amount =  val.rate * val.count;	
	          grossAmt += amount;
	        }
	        totalPaidDur += val.paid_duration;
	    	
			tbody += "<tr><td>"+tb+"</td><td>"+val.clip_caption.toUpperCase()+"</td><td>"+val.paid_duration+"</td><td>"+val.count+"</td><td>PAID</td><td class='duration_rate_col disabled'>"+val.rate.toFixed(2)+"</td><td class='duration_rate_col'>"+amount.toFixed(2)+"</td></tr>";	
		}

		if(val.bonus_duration!=0){
			if(val.package_detail!=undefined && val.package_detail!='per_unit'){
			   var amount = (val.paid_duration/10) * val.rate;
			   grossAmt += amount;
			}
		    else{
		     var amount =  val.rate * val.count;	
		     grossAmt += amount;
		    }

		    totalBonusDur += val.bonus_duration;
			
		   tbody += "<tr><td>"+tb+"</td><td>"+val.clip_caption.toUpperCase()+"</td><td>"+val.bonus_duration+"</td><td>"+val.count+"</td><td>BONUS</td><td class='duration_rate_col disabled'>"+val.rate.toFixed(2)+"</td><td class='duration_rate_col'>"+amount.toFixed(2)+"</td></tr>";	
	    }
	});

	if(tbody != ""){
		var totalPaidBonus = "<span style='color:#888;'>Total Paid Duration: </span> <span>"+totalPaidDur+"</span> ";
		totalPaidBonus += ", &nbsp;&nbsp;&nbsp;<span style='color:#888;'>Total Bonus Duration: </span> <span>"+totalBonusDur+"</span> ";
		$(".duration-summary-table-total-dur").html(totalPaidBonus);
	}

	$('#duration-summary-table tbody').html(tbody);
	calculateTotalAmount();
}

function calculateTotalAmount(cgFrom){
	var grossAmt = 0;
	$.each(TELECAST_DURATION_SUMMARY, function(key, val){
		if(val.package_detail!=undefined && val.package_detail!='per_unit'){
		var amount = (val.paid_duration/10) * val.rate;
		grossAmt += parseFloat(amount);
	    }else{
	    	var amount =  val.rate * val.count;	
	    	grossAmt += parseFloat(amount);
	    }
		
	});

	
    if ('cg_log_map' in TELECAST_CERTIFICATE_FILTER_DATA){
		$.each(TELECAST_CERTIFICATE_FILTER_DATA['cg_log_map'], function(key, val){
			if(cgFrom != "manual_cg_row"){
				grossAmt += parseFloat(val.rate);
			} else {
				grossAmt += parseFloat(val.amount);
			}
		});
	}
	
	$(".tele_amt").html("");
	var agencyId = $("#affidavitAgencyId").val();
	var validAgencyId = "";
	if(agencyId !=0 && agencyId != -1){
		validAgencyId = agencyId;
	}

	var gst_no = "", gst_status = "", custState = "";
	var gstInfoObj = getTCGSTInfo();
	gst_no = gstInfoObj[0];
	gst_status = gstInfoObj[1];
	custState = gstInfoObj[2];

	var tax_type = "";
	if(TELECAST_CERTIFICATE_FILTER_DATA.tax_type){
		tax_type = TELECAST_CERTIFICATE_FILTER_DATA.tax_type;
	}

	var amtObj = {};
	if( $.isEmptyObject(tc_cost) && tcNum == ""){
	 	amtObj = comm_calculateTelecastAmount(grossAmt, billType, gst_no, tax_type, gst_status, custState);
	 	console.log("amtObj........");

	} else if( $.isEmptyObject(tc_cost) && tcNum != "" ){
		amtObj = comm_calculateTelecastAmount( grossAmt, billType, undefined, "service_tax", gst_status, custState);
	} else {
		console.log("...........amtObj");
		amtObj = tc_cost;
	}

	if( !$.isEmptyObject(tc_cost) ){
		// For a newley and already/old saved TC with cost details

		if(tcNum){ //saved TC   (for view_tc link)
			if(amtObj.tax_type != "gst"){
				setNonGSTValues(amtObj);
			} else {
				setGSTValues(amtObj);
			}
		} else { //new TC
			console.log("else tcNum");
			//check GST with invoice_master status
			if( comm_checkIsGST() == false ){
				setNonGSTValues(amtObj);
			} else {
				console.log("A");
				setGSTValues(amtObj);
			}
		}

	} else if($.isEmptyObject(tc_cost) && tcNum != ""){ //generated TC with no cost details.
		setNonGSTValues(amtObj);
	} else {
		// for new TC
		//check GST with invoice_master status
		if( comm_checkIsGST() == false ){
			setNonGSTValues(amtObj);
		} else {
			setGSTValues(amtObj);
		}
	}

	$(".tele_gross_amt").html( amtObj.gross_amount );
	$(".tele_agency_disc").html( amtObj.agency_discount );
	$(".tele_net_amt").html( amtObj.net_taxable_amount );

	// if( comm_checkIsGST() == false && tax_type != "gst" ){
	// 	$(".tele_service_tax").html( amtObj.service_tax );
	// 	$(".tele_swatch_bharat").html( amtObj.swatch_bharat );
	// 	$(".tele_krishi_kalyan").html( amtObj.krishi_kalyan_cess );

	// 	$(".tc_non_gst_tr").show();
	// 	$(".tc_gst_tr").hide();
	// } else {
	// 	$(".tele_cgst_tax").html( amtObj.cgst );
	// 	$(".tele_sgst_tax").html( amtObj.sgst );
	// 	$(".tele_igst_tax").html( amtObj.igst );
	// 	$(".tele_total_gst").html( amtObj.tgst );

	// 	$(".tc_gst_tr").show();
	// 	$(".tc_non_gst_tr").hide();
	// }

	console.log(amtObj);

	$(".tele_round_off").html( amtObj.round_off );
	$(".tele_total_amt").html( amtObj.final_cost);
}

function setGSTValues(amtObj){

	console.log("setGSTValues.........");
	$(".tele_cgst_tax").html( amtObj.cgst );
	$(".tele_sgst_tax").html( amtObj.sgst );
	$(".tele_igst_tax").html( amtObj.igst );
	$(".tele_total_gst").html( amtObj.tgst );

	$(".gst_percnt").hide();
	if(amtObj.cgst > 0){
		$(".cgst_sgst_percnt").show();
	}

	if(amtObj.igst > 0){
		$(".igst_percnt").show();
	}

	$(".tc_gst_tr").show();
	$(".tc_non_gst_tr").hide();
}

function setNonGSTValues(amtObj){
	console.log("setNonGSTValues.........");
	$(".tele_service_tax").html( amtObj.service_tax );
	$(".tele_swatch_bharat").html( amtObj.swatch_bharat );
	$(".tele_krishi_kalyan").html( amtObj.krishi_kalyan_cess );

	$(".tc_non_gst_tr").show();
	$(".tc_gst_tr").hide();
}

function updateTelecastCertificate(){

	var addressTo = $(".tele_address_to").val();
	addressTo = addressTo.toUpperCase();
	jConfirm('Address to '+addressTo+' selected, do you want to continue with the same?', 'Telecast', function(response) {
		if(response){
			generateTelecast();
		}
	});

}

function generateTelecast(){
	var postData = {}, addressTo = "";
	postData = tele_getCommonDetails();
	addressTo = $(".tele_address_to").val();
	if(!addressTo){
		jAlert("Invalid Address to");
		return false;
	}
   	if(!postData){
		console.log("Empty postData");
		return false;
	}
	
	postData['ads_log'] = [];
	if('telecast_log_map' in TELECAST_CERTIFICATE_FILTER_DATA){
		$.each(TELECAST_CERTIFICATE_FILTER_DATA['telecast_log_map'], function(key, val){        
			postData['ads_log'].push(val);
		});
	}

	postData['cg_data'] = [];
	postData['cg_summary'] = [];
	if('cg_log_map' in TELECAST_CERTIFICATE_FILTER_DATA){
		if( !checkIsManualCGEntry() ){
			$.each(TELECAST_CERTIFICATE_FILTER_DATA['cg_log_map'], function(key, val){        
				postData['cg_data'].push(val);
			});
		}
	}

	if( !$.isEmptyObject(TELECAST_NFPC_DURATION_SUMMARY) ) {
			$.each(TELECAST_NFPC_DURATION_SUMMARY, function(key, val){
				postData['cg_summary'].push(val);
			});
		}

		console.log(postData);

	if( !postData['ads_log'].length && !postData['cg_data'].length && !postData['cg_summary'].length ){
		console.log("Empty ads_log OR cg_data....");
		return false;
	}

	var userId = sessionStorage.getItem("user_id");
	if(userId){
		postData["generated_by"] = userId;
	}
	var remarks = $(".tele_remarks").val();
	if(remarks){
		postData["remarks"] = remarks;
	}
	postData["address_to"] = addressTo;

	var tax_type = "service_tax";
	if( comm_checkIsGST()){
		tax_type = "gst";
	}
	postData["tax_type"] = tax_type;

	var grossAmt = 0;
	$.each(TELECAST_DURATION_SUMMARY, function(key, val){
	    if(val.paid_duration != 0 && val.package_detail!='per_unit'){ 	
	    	var amount = (val.paid_duration/10) * val.rate;
	    	grossAmt += amount;
		}else{
			var amount =  val.rate * val.count;
	    	grossAmt += amount;
		}
	});

	if ('cg_log_map' in TELECAST_CERTIFICATE_FILTER_DATA){
		$.each(TELECAST_CERTIFICATE_FILTER_DATA['cg_log_map'], function(key, val){
			if( checkIsManualCGEntry() ){
				grossAmt += parseFloat(val.amount);
			} else {
				grossAmt += parseFloat(val.rate);
			}
		});
	}

	var amtObj = {};
	var agencyId = $("#affidavitAgencyId").val();
	var validAgencyId = "";
	if(agencyId !=0 && agencyId != -1){
		validAgencyId = agencyId;
	}

	var gst_no = "", gst_status = "", custState = "";
	var gstInfoObj = getTCGSTInfo();
	gst_no = gstInfoObj[0];
	gst_status = gstInfoObj[1];
	custState = gstInfoObj[2];

	var isAgencyGST = gstInfoObj[3];
	if(isAgencyGST){
		postData.customer.agency_gst = true;
		postData.customer.agency_gst_status = gstInfoObj[1];
		postData.customer.agency_gst_no = gstInfoObj[0];
		postData.customer.agency_gst_state = gstInfoObj[2];
		postData.customer.agency_pan_num = gstInfoObj[4];
	}


	amtObj = comm_calculateTelecastAmount(grossAmt, billType, gst_no, "",  gst_status, custState);
	var final_cost = {};
	postData["tax_and_final_cost"] = amtObj;

    postData["channel_id"] = $("#channel").val();

    if(checkIsManualInvoiceBillDate()){ 
    	var inv_bill_date = $(".invoice_date_picker").val();
    	if(!inv_bill_date){
	    	jAlert("Invalid Invoice Bill Date");
	    	return false;
	    } else {
	    	postData["invoice_date"] = moment(inv_bill_date, "DD/MM/YYYY").format("YYYY/MM/DD");
	    }
    } else {
    	postData["invoice_date"] = moment().format("YYYY/MM/DD");
    }

    postData["created_date_time"] = moment().format("YYYYMMDDHHmmss");

    console.log("++++++++++++++++++++++++++++");
    console.log(postData);

	$.ajax({
			type : "POST",
			url : "/telecast ",
			dataType:"json",
			data : JSON.stringify(postData),
			success : function(response) {
				$("#update_telecast_btn, #refresh_telecast").hide();
				$('.telecast-certificate .certificate-content .meta-data .invoice-no').html(response.telecast_num);
				// jAlert("Telecast data saved successfully. Invoice No. " + response.telecast_num);
				$("#telecast_report_tbl select").attr("disabled", "true");
				$("#tele_invoice_id").html("Generated Invoice No. " + response.telecast_num);
				$("#tele_invoice_id").fadeIn(500);
				saveInvoiceData(response.telecast_num);
				//animate tele_invoice_id.
				setTimeout(function(){
					$("#tele_invoice_id").fadeOut(200);
					$("#tele_invoice_id").fadeIn(600);
				}, 700);

				get_invoice_list();
				//$('#invoice_tab a').trigger('click');
			},
			error: function(xhr, status, text) {
				console.log("AD Filter Save Failed");
			    comm_handleAjaxError(xhr);
			}			
	});
}


function getTelecastCertificate(){
	tcNum = ""; //to check tc is generated or new one.
	tc_cost = {};
	// $("#tele_invoice_id").html("");
	// $("#telecast_report_tbl tbody").html("");
	// $('#total').text('');
	var startDateFrom = $('#affidavitFromDate').val();
	var startDateTo = $('#affidavitToDate').val();
	var customerId = $('#affidavitCustomerId').val(); 
	var roId = $('#affidavitRoId').val(); 

	if($("#device_affidavit_filter").val() != 0 )
		var device = $('#device_affidavit_filter').val();

	if(customerId == "0"){
		jAlert("Please select customer");
		return false;
	}

	if(roId == "0"){
		jAlert("Please select RO ID");
		return false;
	}

	var affidavit_url = 'customer-report?from_date='+startDateFrom+'&to_date='+startDateTo+'&customer_id='+customerId+'&channel_id='+channel+'&ro_id='+roId;
	if (device){
		affidavit_url += '&device='+ device;
	}

	// TELECAST_CERTIFICATE_FILTER_DATA['from_date'] = startDateFrom;
	// TELECAST_CERTIFICATE_FILTER_DATA['to_date'] = startDateTo;
	// TELECAST_CERTIFICATE_FILTER_DATA['customer_id'] = customerId;
	// TELECAST_CERTIFICATE_FILTER_DATA['roId'] = roId;

	// TELECAST_DURATION_SUMMARY = {};
 //    TELECAST_NFPC_DURATION_SUMMARY = {};
 //    TELECAST_CERTIFICATE_FILTER_DATA["telecast_log_map"] = {};
 //    TELECAST_CERTIFICATE_FILTER_DATA["cg_log_map"] = {};

    if(checkDates(startDateFrom,startDateTo)){
    	// $(".telecast-certificate #nfpc-summary-table tbody").html("");
    	// $(".activity_period").text("");
    	// resetTCValues();
		$.ajax({
			global: true,
			url: affidavit_url,
			success:function(response){
				
				if(checkIsManualInvoiceBillDate() == false){
					$(".invoice_date_picker_div").hide();
				} else {
					$(".invoice_date_picker_div").show();
				}

				var inv_num_list = "";
				if(response.customer){

					if( comm_checkIsGST() ){
						var gst_no = "", gst_status = "", custState = "";

						if(response.customer){
							var isBillToAgency = false, agencyInfo = {};
							//check RO bill_to, to calculate amount with cutomer/agency gst status.
							if(response.customer.ro_details){
								if(response.customer.ro_details.bill_to == "agency"){
									isBillToAgency = true;
									if(response.customer.agency_id){
										var info = agencyMapObj[response.customer.agency_id];
										if(info){
											agencyInfo = info;
										}
									}
								}

								if(response.customer.ro_details.activity_period == undefined && checkIsManualCGEntry() ){
									var actv_period = moment(startDateFrom, "DD/MM/YYYY").format("YYYYMMDD") +"_"+ moment(startDateTo, "DD/MM/YYYY").format("YYYYMMDD")
									response.customer.ro_details["activity_period"] = actv_period;
								}
							}

							// if bill_to is of type "Agency", consider Agency GST status.
							if(isBillToAgency && !$.isEmptyObject(agencyInfo) ){
								if( !agencyInfo.gst_status ){
									var agencyName = response.customer.agency_name;

									jAlert("Please update Agency '"+agencyName+"' GST Status");
									return false;
								} else if(agencyInfo.gst_status == "registered" && !agencyInfo.gst_no){
									jAlert("Please update Agency '"+agencyName+"' GST Number");
									return false;
								} else {
									if(agencyInfo.gst_status == "unregistered" &&  !agencyInfo.address && !agencyInfo.address.state) {
										jAlert("Please update Agency '"+agencyName+"' State");
										return false;
									}
								}
							} else {
								//if bill_to is not of type "Agency", consider customer GST status.
								if(response.customer.gst_status){
									gst_status = response.customer.gst_status;
								}

								console.log("Customer GST:::"+gst_status)

								if(!gst_status){
									console.log("customer gst_status... "+gst_status);
									jAlert("Please update customer "+response.customer.name+" GST Status");
									return false;
								} else if(gst_status == "registered" && !response.customer.gst_no){
									jAlert("Please update customer '"+response.customer.name+"' GST Number");
									return false;
								} else {
									if(gst_status == "unregistered" && !response.customer.address && !response.customer.address.state) {
										jAlert("Please update customer '"+response.customer.name+"' State");
										return false;
									}
								}
							}
						}
					}

					if(response.customer.ro_details){
						
					   	if(response.customer.ro_details.activity_period){
					   		var dateArr = response.customer.ro_details.activity_period.split("_");
					   		var fromDate = moment(dateArr[0], "YYYY/MM/DD").format("DD/MM/YYYY");
					   		var toDate = moment(dateArr[1], "YYYY/MM/DD").format("DD/MM/YYYY");
					   		$(".activity_period").text(fromDate +" - "+toDate);
					   	}


						if(response.customer.ro_details.invoice_num_list){
							var list = response.customer.ro_details.invoice_num_list;
							for(var i=0; i<list.length; i++){

								if( typeof(list[i]) == "object" ){
									if(list[i].invoice_num){
										inv_num_list += list[i].invoice_num;
										if(i < list.length-1 ){
											inv_num_list += ", "
										}
									}
								} else if( typeof(list[i]) == "string" ){
									inv_num_list += list[i];
									if(i < list.length-1 ){
										inv_num_list += ", "
									}
								}
							}
						}
					}
				}

				if(inv_num_list){
					jConfirm("Invoice already generated for the selected Customer and RO ID, "+inv_num_list+", Do you want to generate again?", 'Telecast', function(userResponse) {
						if(userResponse){ 
							
							$("#tc_pwd_field").val("");
							$('#tc_password_dialog').dialog({
					  			width:300,
					  			height:150,
					  			modal:true,
					  			autoOpen:false,
					  			title:"Telecast Password",
								 buttons: [
					            {
					                id: "submit_tc",
					                text: "Submit",
					                click: function () {
					                	var tc_pwd = $("#tc_pwd_field").val()
					                	if(tc_pwd == $("#channel option:selected").text() ){
					                	  $("#tc_password_dialog").dialog('close');	
					                	  console.log(response);
					                	  setInitTelecastDetails(response, roId);
					                    }else{
					                    	jAlert("Invalid Password");
					                    }
					                }
					            }
         
           					 ],
           					 beforeClose: function(){
           					 	$('#tc_password_dialog').dialog('destroy');
           					 	//Unbind submit TC password key press.
           					 	$("#tc_pwd_field").off("keyup");
           					 },
           					 open: function( event, ui ) {
           					 	//submit TC password ENTER key press.
           					 	$("#tc_pwd_field").off("keyup");
								$("#tc_pwd_field").on("keyup", function(event){
									if(event.which == 13){
										$("#submit_tc").trigger("click");
									}
								});
           					 }
					  		});

							//Added settimeout to avoid showing invalid password dialog onEnter "Ok" of generated invoice number alert.
							setTimeout(function(){
					  			$('#tc_password_dialog').dialog('open');
					  		}, 200);
							
						}
					});
				} else {
					setInitTelecastDetails(response, roId);
				}
			},
			error: function(xhr, status, text) {
		      comm_handleAjaxError(xhr);
		    }
		});
	}	
}


function setInitTelecastDetails(response, roId){

	var startDateFrom = $('#affidavitFromDate').val();
	var startDateTo = $('#affidavitToDate').val();

	var customerId = $('#affidavitCustomerId').val(); 
	var roId = $('#affidavitRoId').val(); 

	TELECAST_CERTIFICATE_FILTER_DATA['from_date'] = startDateFrom;
	TELECAST_CERTIFICATE_FILTER_DATA['to_date'] = startDateTo;
	TELECAST_CERTIFICATE_FILTER_DATA['customer_id'] = customerId;
	TELECAST_CERTIFICATE_FILTER_DATA['roId'] = roId;

	TELECAST_DURATION_SUMMARY = {};
    TELECAST_NFPC_DURATION_SUMMARY = {};
    TELECAST_CERTIFICATE_FILTER_DATA["telecast_log_map"] = {};
    TELECAST_CERTIFICATE_FILTER_DATA["cg_log_map"] = {};

    $(".telecast-certificate #nfpc-summary-table tbody").html("");
    $(".activity_period").text("");
    $("#tele_invoice_id").html("");
	$("#telecast_report_tbl tbody").html("");
	$('#total').text('');
	$(".duration-summary-table-total-dur").html("");
    resetTCValues();

	var as_run_logs = response["customer-report"];
	customer_details = response["customer"];
	var ro_date = '';
	var cg_data = {};

	if(checkIsManualInvoiceBillDate() == false){
		$(".invoice-date").html(moment().format("DD/MM/YYYY"));
	}

	 var date = $("#affidavitFromDate").val();
	 if(date){
     	$('.certificate-content .meta-data .month').html(moment(date, "DD/MM/YYYY").format("MMMM YYYY"));
     } else {
     	$('.certificate-content .meta-data .month').html("-");
     }

	 $(".cg-summary-table, #nfpc-summary-table").hide();
	 if("cg_logs" in response && checkIsManualCGEntry() == false ){
	 	display_tc_cg_data(customer_details,response.cg_logs,roId, true);
	 	if( !$.isEmptyObject(response.cg_logs) ){
	 		$(".cg-summary-table, #nfpc-summary-table").show();
	 	}
	 }else{
	 	loadCommonDetails(customer_details, [], roId);
	 } 

	 //to show cg_summary_table for cg_manual entry.
	 if( checkIsManualCGEntry() ){
	 	$(".nfpc-summary-table").show();
	 	$(".cg_custom_entry_header").show();
	 }
	 
	 $(".telecast_report_tbl, .duration-summary-table").hide();
	 if(as_run_logs){
	 	if(as_run_logs.length > 0){
	 		$(".telecast_report_tbl, .duration-summary-table").show();
	 		$(".duration-summary-table-total-dur").html("");
			display_tc_spot_details(customer_details,as_run_logs,roId);
		} 
	}


    TELECAST_CERTIFICATE_FILTER_DATA['customer'] = customer_details;

	updateAddressedTo($(".tele_address_to").val(), customer_details);
}

function saveInvoiceData(invoiceNum){
	var postData = {};
	postData = tele_getCommonDetails();
	addressTo = $(".tele_address_to").val();
	if(!addressTo){
		jAlert("Invalid Address to");
		return false;
	}
	if(!postData){
		console.log("Empty postData");
		return false;
	}

	postData["address_to"] = addressTo;
    postData["channel_id"] = $("#channel").val() 
	var grossAmt = 0;
	$.each(TELECAST_DURATION_SUMMARY, function(key, val){
	    if(val.paid_duration != 0 && val.package_detail!='per_unit'){ 	
	    	var amount = (val.paid_duration/10) * val.rate;
	    	grossAmt += amount;
		}else{
			var amount =  val.rate * val.count;
	    	grossAmt += amount;
		}
	});

	if ('cg_log_map' in TELECAST_CERTIFICATE_FILTER_DATA){
		$.each(TELECAST_CERTIFICATE_FILTER_DATA['cg_log_map'], function(key, val){
			if( checkIsManualCGEntry() ){
				grossAmt += parseFloat(val.amount);
			} else {
				grossAmt += parseFloat(val.rate);
			}
		});
	}

	var amtObj = {};
	// if(grossAmt){
		var agencyId = $("#affidavitAgencyId").val();
		var validAgencyId = "";
		if(agencyId !=0 && agencyId != -1){
			validAgencyId = agencyId;
		}
		var gst_no = "", gst_status = "", custState = "";
		var gstInfoObj = getTCGSTInfo();
		gst_no = gstInfoObj[0];
		gst_status = gstInfoObj[1];
		custState = gstInfoObj[2];

		amtObj = comm_calculateTelecastAmount(grossAmt, billType, gst_no, "", gst_status, custState);
		var final_cost = {};
		postData["tax_and_final_cost"] = amtObj;
	// }

	if(invoiceNum){
		postData["invoice_num"] = invoiceNum;
	}

	var invData = formatInvoiceClipsData();

	postData['cg_data'] = [];
	postData['cg_summary'] = [];
	if('cg_log_map' in TELECAST_CERTIFICATE_FILTER_DATA){

		if( !checkIsManualCGEntry() ){
			$.each(TELECAST_CERTIFICATE_FILTER_DATA['cg_log_map'], function(key, val){        
				if("package_detail" in val){
					if(val.package_detail != "per_day"){
						postData['cg_data'].push(val);
					}
				}
			});
		}
		
	}

	if( !$.isEmptyObject(TELECAST_NFPC_DURATION_SUMMARY) ) {
			$.each(TELECAST_NFPC_DURATION_SUMMARY, function(key, val){
				postData['cg_summary'].push(val);
			});
		}

	if(invData.length < 0 && postData.cg_data.length < 0 && postData.cg_summary.length < 0 ){
		console.log("Empty invoice data and CG data");
		return false;
	}

	postData["clips"] = invData;
	// postData["invoice_date"] = moment().format("YYYY/MM/DD");

	if(checkIsManualInvoiceBillDate()){ 
    	var inv_bill_date = $(".invoice_date_picker").val();
    	if(!inv_bill_date){
	    	jAlert("Invalid Invoice Bill Date");
	    	return false;
	    } else {
	    	postData["invoice_date"] = moment(inv_bill_date, "DD/MM/YYYY").format("YYYY/MM/DD");
	    }
    } else {
    	postData["invoice_date"] = moment().format("YYYY/MM/DD");
    }

    postData["created_date_time"] = moment().format("YYYYMMDDHHmmss");
	
	var userId = sessionStorage.getItem("user_id");
	if(userId){
		postData["generated_by"] = userId;
	}

	postData["status"] = "active";
	console.log(postData);

	$.ajax({
		type : "POST",
		url : "/invoice ",
		dataType:"json",
		data : JSON.stringify(postData),
		success : function(response) {
			console.log(response);
			console.log("successfully saved invoice data");
		},
		error : function(xhr) {
			comm_handleAjaxError(xhr);
		}
	});

}


function tele_getCommonDetails(){
	var data = {};
	if( $.isEmptyObject( TELECAST_CERTIFICATE_FILTER_DATA) ){
		console.log(" Empty TELECAST_CERTIFICATE_FILTER_DATA object ");
		return "";
	}

	data['from_date'] = TELECAST_CERTIFICATE_FILTER_DATA['from_date'];
	data['to_date'] = TELECAST_CERTIFICATE_FILTER_DATA['to_date'];
	data['customer_id'] = TELECAST_CERTIFICATE_FILTER_DATA['customer_id'];
	data['ro_id'] = TELECAST_CERTIFICATE_FILTER_DATA['roId'];

	// if($(".brand").html()){
	// 	data["brand"] = $(".brand").html();
	// }

	if(TELECAST_CERTIFICATE_FILTER_DATA['customer']){
		data['customer'] = TELECAST_CERTIFICATE_FILTER_DATA['customer'];
		data['channel_id'] = $("#channel").val();
		return data;
	} else {
		console.log("Empty customer info");
		return "";
	}
}

function formatInvoiceClipsData(){
	var invoiceData = [];
	data = TELECAST_DURATION_SUMMARY;

	for(var key in data){
		var caption = "", tb = "", rate = "", spotType = "", item = {};
		var info = key.split("###");
		if (key.indexOf("###")<0){
          var tb_name_details = TB_KEY_MAP[key]
          info = tb_name_details.split("###")
		}
		
		caption = info[0];
		tb = info[1];
		rate = info[2];

		item = data[key];
		spotType = item.spot_type.toLowerCase();
		var obj = TELECAST_CERTIFICATE_FILTER_DATA['telecast_log_map'][ data[key].id ];

		var temp = { 
                     "caption": caption,
                     "timeband": tb,
					 "count": item.count,
                     "package_detail": obj.package_detail,
                     "Ad_type": obj.advt_type,
                     "rate": rate,
                     "spot_type": spotType,
                     "date": obj.date,
                    };

        if( spotType == "paid" ){
        	temp.duration = item.paid_duration;
        }

        if( spotType == "bonus" ){
        	temp.duration = item.bonus_duration;
        }

        if (temp.package_detail!='per_unit')
        temp["net_amt"] = temp.duration/10 * rate;
        else
        temp["net_amt"] =  rate * temp.count; 	

        invoiceData.push(temp);
	}

	return invoiceData;
}

var ro_clip_tb_rate_map = {}, ro_clip_brand_map = {};
function buildClipTBRateMap(data){
	ro_clip_tb_rate_map = {};
	for( var i=0 ; i <data.length; i++){
		var item = data[i];
		var key = item.clip_name +"###"+ item.timeband +"###"+ item.spot_type+"###"+ item.rate;
		//keeping unique key for all clip_timeband_type map
		ro_clip_tb_rate_map[key] = item.rate;
		
		if("brand" in item){
			ro_clip_brand_map[item.clip_name.toLowerCase()] = item.brand;
		}
	}
}


function getRates(obj){
	
	var rates = [], tb = "", caption = "", spotType = "";

	var is_recorded = false

	if (obj.is_recorded){
		is_recorded = obj.is_recorded
	}
	
	for(var key in ro_clip_tb_rate_map){
		var info = key.split("###");
		caption = info[0];
		tb = info[1];
		spotType = info[2];

		var clipRate = ro_clip_tb_rate_map[key];

		if(!is_recorded){

			if( (obj.clip_caption == caption || obj.commercial_id == caption) && clipRate > 0){

				clipRate = parseFloat(clipRate).toFixed(2);

				rates.push({"tb": tb, "rate": clipRate+" :: "+tb });
			}
	   }else{
	   	  clipRate = parseFloat(clipRate).toFixed(2);
	   	  rates.push({"tb": tb, "rate": clipRate+" :: "+tb });
	   }


	}

	return rates;
}

function loadOrderView(){
	var order_num = $("#reference_num_span").html();
	var order_id = "";

	var custObj = TELECAST_CERTIFICATE_FILTER_DATA["customer"];
	if('ro_details' in custObj){
		var orderObj = custObj.ro_details;
		if('order_id' in orderObj){
			order_id = orderObj.order_id;
		}
	}
	
	// for(var key in TELECAST_CERTIFICATE_FILTER_DATA["telecast_log_map"] ){
	// 	order_id = TELECAST_CERTIFICATE_FILTER_DATA["telecast_log_map"][key].order_id;
	// }

	console.log("order ID from TC.......", order_id);
	
	if(order_num && order_id){
		$.cookie("orderId",order_id);

		$("#tele_orderInfo").load('order/orderView.html', function(){
			$("#ro_print_btns").hide();
			$('#tele_orderInfo').dialog('open');
		});
		
	}
}

function refreshTC(){
	resetTCValues();
	$("#affidavitAgencyFilter, #affidavitCustomerFilter").val("");

	$("#affidavitRoId").html('<option value="0">Choose one</option>');
	$("#affidavitAgencyId, #affidavitCustomerId, #affidavitRoId").val("0");

	report_loadCusetomers();
}

function resetTCValues(){
	//reset old values
	// TELECAST_CERTIFICATE_FILTER_DATA = {};
	// TELECAST_DURATION_SUMMARY = {};
	// tc_num = '', billType = "";

	// TELECAST_CERTIFICATE_FILTER_DATA = {};
	// TELECAST_DURATION_SUMMARY = {};
 	// TELECAST_NFPC_DURATION_SUMMARY = {};

	$(".telecast-certificate .col-value").html("");
	$(".telecast-certificate .agency-addr-value").html("<span class='agency-addr'></span>");
	$(".telecast-certificate .cust-addr-value").html("<span class='cust_addr'></span>");

	$(".telecast-certificate #telecast_report_tbl tbody").html("");
	$(".telecast-certificate #duration-summary-table tbody").html("");
	$(".cg-summary-table tbody, .nfpc-summary-table tbody").html("");
	$(".telecast-certificate .tele_amt").html("");
	$(".telecast-certificate .tele_remarks").val("");
}

function loadCommonDetails(customer, data, roId){
	$(".advertiser").html(customer.name);	
	$(".refence-no").html('<span id="reference_num_span" onclick="loadOrderView()">'+roId+'</span>');

	$(".ref_code").text("");
	if(customer.agencycode){
		$(".ref_code").text(customer.agencycode);
	} else {
		$(".ref_code").text("107625");
	}
	 
	 var ro_details = undefined;
	 if(customer.address){
			var custAdrs = customer.address;
			var adrsStr = "";
			if(checkUndefined(custAdrs.street) ){
				adrsStr += checkUndefined(custAdrs.street);
			}
			if(checkUndefined(custAdrs.landmark) ){
				adrsStr += ", "+checkUndefined(custAdrs.landmark)
			}
			if(checkUndefined(custAdrs.area) ){
				adrsStr += ", "+checkUndefined(custAdrs.area)
			}
			if(checkUndefined(custAdrs.city) ){
				adrsStr += ", "+checkUndefined(custAdrs.city)
			}
			if(checkUndefined(custAdrs.pincode) ){
				adrsStr += " - "+checkUndefined(custAdrs.pincode)
			}

			$(".cust_addr").html(adrsStr);							
		}

		 if(customer.agency_address){
			var agencyAdrs = customer.agency_address;
			var address = "";
			if(checkUndefined(agencyAdrs.street) ){
				address += checkUndefined(agencyAdrs.street);
			}
			if(checkUndefined(agencyAdrs.landmark) ){
				address += ", "+checkUndefined(agencyAdrs.landmark)
			}
			if(checkUndefined(agencyAdrs.area) ){
				address += ", "+checkUndefined(agencyAdrs.area)
			}
			if(checkUndefined(agencyAdrs.city) ){
				address += ", "+checkUndefined(agencyAdrs.city)
			}
			if(checkUndefined(agencyAdrs.pincode) ){
				address += " - "+checkUndefined(agencyAdrs.pincode)
			}

			$(".agency-addr").html(address);							
		}


	 if(customer['ro_details'])
	 {
	 	ro_details = customer['ro_details'];

		if(ro_details['ro_num']){
	 		$(".ro-no").html(ro_details['ro_num']);
	 	}

	 	if(ro_details['ro_date']){
	        ro_date = moment(ro_details['ro_date'],"YYYY/MM/DD").format("DD/MM/YYYY") 		;
	 		$(".ro_date").html(ro_date);
	 	}

	 	if(ro_details["invoice_num"]){
	 		$(".invoice-no").html(ro_details["invoice_num"]);
	 		tc_invoice_num = ro_details["invoice_num"];
	 	}

	 	if(ro_details["bill_type"]){
	 		billType = ro_details["bill_type"];
	 	}

	 	// $(".brand").html("");
	 	if(ro_details["ro_timeband_clip_list"]){
	 		buildClipTBRateMap(ro_details["ro_timeband_clip_list"]);
	 	}
	 }else{
	 	console.log("RO Details undefined");
	 }
}


function display_tc_cg_data(customer, cg_data, roId, init){
	// resetTCValues();

	//to stop create /calculating cg summary details.	
	if( checkIsManualCGEntry() && tcNum == ""){
		$(".cg_custom_entry_header").show();
		return false;
	}  
	// else if(tcNum != "" && cg_data == )
	// TELECAST_NFPC_DURATION_SUMMARY

	$(".cg_summary_action_col").hide();

	TELECAST_CERTIFICATE_FILTER_DATA['customer'] = customer;
	loadCommonDetails(customer, cg_data, roId);

	var rowStr = "";
	cg_data = mergeCommonPerDayEntries(cg_data);
	TELECAST_CERTIFICATE_FILTER_DATA["cg_log_map"] = {};

	for (i = 0; i < cg_data.length; i++) {
		var val = cg_data[i];
		var obj;
		var caption = val.clip_caption;

		if(init){
			val["real_spot_type"] = val.spot_type;
			val["real_spot_rate"] = val.rate;
		}

		if(val.package_detail == "per_day"){
			TELECAST_CERTIFICATE_FILTER_DATA["cg_log_map"][val.uuid] = val;
		}else{
			TELECAST_CERTIFICATE_FILTER_DATA["cg_log_map"][val._id] = val;	
		}
		

		var date = val.date;
		if(date){
			date = moment(date, "YYYY/MM/DD").format("DD/MM/YYYY");
		}

		var spotTypeStr = "";
		var tb = "";

		if(val.dp_start_time && val.dp_end_time){
			tb = val.dp_start_time +"_"+ val.dp_end_time;
		}

        var infoExists = false;
        var info = ''; 
           
        if(val.info){
            infoExists = true;
            info = val.info;
        }

		var type = val.real_spot_type.toUpperCase();

 		if( val.spot_type.toUpperCase() == "BONUS" ){
			val.rate = 0;
		}

		var count = 0, id, captionEditStr = "";
		if(val.package_detail.toLowerCase() == "per_unit" ){
			id = val._id;
			count = 1;			
		}else if (val.package_detail.toLowerCase() == "per_day"){
			id = val.uuid;
			tb = val.timeband;
			count = val.count;
			if(!tcNum){
				captionEditStr = '&nbsp;&nbsp; <i class="fa fa-edit editClipCaption" id="caption_'+val.uuid+'" ></i>';
			}
		}

		var brand = "";

		if(val.clip_caption){
	 		if(ro_clip_brand_map[val.clip_caption.toLowerCase()]){
	 			brand = ro_clip_brand_map[val.clip_caption.toLowerCase()];
	 		}
	 	}
	 	val["brand"] = brand;


		var remarksInfoStr = "";
 		if(val.remarks){
 			remarksInfoStr = '<i class="fa fa-info-circle cgRemarksInfo" id="slotCGRemarks-'+id+'" style="cursor:pointer;margin-left:5px;font-size: 14px; color: #245aaf;" title="Remarks: '+val.remarks+'"></i>';
 		}
 		
		spotTypeStr += '<span class="spotTypePrint" id="realCGSpotVal-'+id+'" data="'+type+'"  style="display:none;">'+val.spot_type.toUpperCase()+'</span><select class="spotTypeScreen cgSpotTypeSel" id="CGSpotType-'+id+'">';
		if( val.spot_type.toUpperCase() == "PAID" ){
		 	spotTypeStr += '<option value="bonus">BONUS</option><option selected value="paid">PAID</option></select>';
		} else if( val.spot_type.toUpperCase() == "BONUS" ){
		 	spotTypeStr += '<option selected value="bonus">BONUS</option><option value="paid">PAID</option></select>';
		} else {
		 	spotTypeStr += '<option selected value="bonus">BONUS</option><option value="paid">PAID</option></select>';
		}

		if(infoExists){
		 	rowStr += '<tr><td class="disabled">'+(i+1)+'</td><td>'+date+'</td> <td>'+tb+'</td></td> <td class="clip-caption" title="'+info+'">'+val.clip_caption+captionEditStr+'<span style="margin-left: 5px; font-size: 14px; color: #245aaf;" class="fa fa-info-circle"></span></td> <td>'+brand+'</td> <td>'+val.advt_type.toUpperCase()+'</td> <td class=""> '+count+' </td> <td>'+spotTypeStr+remarksInfoStr+'</td> <td class="disabled" id="spotCGRate-'+id+'" data="'+val.real_spot_rate+'">'+parseFloat(val.rate).toFixed(2)+'</td></tr>';
		}
		else{
			rowStr += '<tr><td class="disabled">'+(i+1)+'</td><td>'+date+'</td> <td>'+tb+'</td> <td style="min-width:400px;">'+val.clip_caption+captionEditStr+'</td> <td>'+brand+'</td> <td>'+val.advt_type.toUpperCase()+'</td> <td class=""> '+count+' </td> <td>'+spotTypeStr+remarksInfoStr+'</td> <td class="disabled" id="spotCGRate-'+id+'" data="'+val.real_spot_rate+'">'+parseFloat(val.rate).toFixed(2)+'</td></tr>';
		}
	}

	calculateNFPCDurationSummary(cg_data);
	calculateTotalAmount();

	$(".cg-summary-table tbody").html(rowStr);

	setTimeout(function(){
		initClickOnCGRemarks();
	}, 500);

}


function mergeCommonPerDayEntries(cg_data){
	var cgData = [];
	var matchedList = [];

	console.log("CG DATA length........"+cg_data.length);

	for (i = 0; i < cg_data.length; i++) {
		var item1 = cg_data[i];
		var caption = item1.clip_caption;

		var idStr = item1.clip_caption+"##"+item1.spot_type.toLowerCase()+"##"+item1.timeband+"##"+item1.date;

		if(matchedList.indexOf(idStr) == -1){
			matchedList.push(idStr);

			if(item1.package_detail.toLowerCase() == "per_day"){
				var temp = $.extend(true, {},item1 );
				var remarks = "";
				if(temp.remarks){
					remarks = temp.remarks;
				}

				for(var j=0; j<cg_data.length; j++){
					var item2 = cg_data[j];

					if(item1.uuid != item2.uuid){
						if(item1.clip_caption == item2.clip_caption && item1.spot_type.toLowerCase() == item2.spot_type.toLowerCase() && item1.timeband == item2.timeband && item1.date == item2.date){
							
							console.log(item1.clip_caption +" == "+ item2.clip_caption +" :: "+ item1.spot_type.toLowerCase() +" == "+ item2.spot_type.toLowerCase() +" :: "+ item1.timeband +" == "+ item2.timeband +" :: "+ item1.date +" == "+ item2.date);
							console.log("Matched different items of same details");

							temp.count = parseInt(parseInt(item1.count) + parseInt(item2.count));

							if(item2.remarks){
								remarks += " "+item2.remarks;
							}
						}
					}
				}
				if(remarks){
					temp["remarks"] = remarks;
				}
				cgData.push(temp);
			}else{
				cgData.push(item1);
			}
		}
	}

	console.log("CG DATA length after merge........"+cgData.length);

	return cgData;
}

function initClickCGCount(){
	$(".cg_count_span").unbind("click");
	$(".cg_count_span").click(function(){
		var rate = $(this).attr("data");
		$(this).hide();
		$(this).next(".cg_count_input").show();
		$(this).next(".cg_count_input").focus();
	});

	$(".cg_count_input").unbind("focusout");
	$(".cg_count_input").focusout(function(){
		var count = $(this).val();
		$(this).hide();
		if(count){
			$(this).prev(".cg_count_span").html(count);
		}

		$(this).prev(".cg_count_span").show();

		var cgId =  $(this).closest("tr").attr("id");
		cgId = cgId.replace("cg_", "");

		var cgDurSumKey = $("#"+cgId).attr("data");

		if( TELECAST_CERTIFICATE_FILTER_DATA['cg_log_map'][cgId] && count){
			TELECAST_CERTIFICATE_FILTER_DATA['cg_log_map'][cgId].count = count;
			TELECAST_NFPC_DURATION_SUMMARY[cgDurSumKey].count = count;
			var rate = TELECAST_NFPC_DURATION_SUMMARY[cgDurSumKey].rate;
			TELECAST_NFPC_DURATION_SUMMARY[cgDurSumKey].amount = parseFloat(count) * parseFloat(rate);
			loadCGDurSummayTable();
		}

	});

}

function calculateNFPCDurationSummary(data){
	TELECAST_NFPC_DURATION_SUMMARY = {}; 

	$.each(TELECAST_CERTIFICATE_FILTER_DATA['cg_log_map'], function(key, val){
		var obj, key;
		var caption = val.clip_caption;
		var id = key;
		
		if(!caption){
			caption = get_clip_name_without_extn(val.commercial_id);
		}

		key = caption + "###" + val.spot_type.toUpperCase() + "###" + val.package_detail;
		if(TELECAST_NFPC_DURATION_SUMMARY[key]){
			obj = TELECAST_NFPC_DURATION_SUMMARY[key];
		}

		if(!obj){
			var id = val._id;
			if(val.package_detail == "per_day"){
				id = val.uuid;
			}

       		obj = {'clip_caption': caption, 'timeband': val.timeband, 'rate': parseFloat(val.rate), 'count': 0, 'spot_type': val.spot_type.toLowerCase(), "id": id, "advt_type": val.advt_type, "package_detail": val.package_detail };
			TELECAST_NFPC_DURATION_SUMMARY[key] = obj;
		} 

		obj.count = obj.count + 1;
        obj.amount = parseFloat(obj.count) * parseFloat(obj.rate);
		
	});

	loadCGDurSummayTable();

}

function loadCGDurSummayTable(cgFrom){

	if(tcNum != ""){
		$(".cg_summary_action_col").hide();
	}

	var tbody = "", grossAmt = 0;
	$.each(TELECAST_NFPC_DURATION_SUMMARY, function(key, val){
		var amount = 0;
		amount = val.count * val.rate;

		//for manual_cg or generated CG amount calculation.
		if(cgFrom == "manual_cg_row" || tcNum != ""){
			//set amount to ZERO for spot_type BONUS.
			if(val.spot_type.toLowerCase() == "bonus"){
				amount = 0;
			}
		}

		val.amount = amount;
		var countStr = val.count;
		var advType = "-", pkg = "-";
		
		if(val.advt_type){
			advType =  val.advt_type.toUpperCase();
		}

		if(val.package_detail){
			pkg = val.package_detail;
		}


	    tbody += "<tr id='cg_'"+val.id+"' data='"+val.id+"'><td>"+val.clip_caption+"</td><td>"+advType+"</td><td>"+val.spot_type.toUpperCase()+"</td><td>"+pkg+"</td><td class=''>"+countStr+"</td><td class=''>"+val.rate.toFixed(2)+"</td><td class=''>"+parseFloat(val.amount).toFixed(2)+"</td>";

	    if(cgFrom == "manual_cg_row"){
	    	tbody += "<td><i class='fa fa-edit manual_cg_row_action_icons' id='edit_"+val.id+"' data='"+key+"'></i> &nbsp;&nbsp;&nbsp; <i class='fa fa-trash manual_cg_row_action_icons' id='delete_"+val.id+"' data='"+key+"'></i> </td>"
	    }
	    tbody += "</tr>";	


	});

	$('#nfpc-summary-table tbody').html(tbody);

	if(cgFrom == "manual_cg_row" || tcNum != ""){
		setTimeout(function(){
			initClickOnManualCGIcons();

			calculateTotalAmount(cgFrom);

		}, 200);
	}

	// setTimeout(function(){
	// 	var isInvoiceView = $("#tc_view_dialog").html();

	// 	if( !isInvoiceView ){
			// initClickCGCount();
	// 	} else {
	// 		$(".cg_count_span").css({"color": "#555", "text-decoration": "none"});
	// 	}
	// }, 1000);
}



// Updates the spot type for the given id
function updateTelecastCGPaidBonus(slotId, val, remarks){
	$("#cg_rate_remarks_div").dialog('close');

	TELECAST_CERTIFICATE_FILTER_DATA['cg_log_map'][slotId].spot_type = val;
	TELECAST_CERTIFICATE_FILTER_DATA['cg_log_map'][slotId].remarks = remarks;
	var remarksId = "slotCGRemarks-"+slotId;
	if(remarks){
		$("#"+remarksId).show();
	} else {
		$("#"+remarksId).hide();
	}

	var spotObj = TELECAST_CERTIFICATE_FILTER_DATA['cg_log_map'][slotId];
	var spotRate = $("#spotCGRate-"+slotId).attr("data");

	if( val.toUpperCase() == "PAID" && spotRate > 0 ){
		$("#spotCGRate-"+slotId).html(spotRate);
		spotObj.rate = spotRate;
	} else if(val.toUpperCase() == "BONUS"){
		var realVal = $("#realCGSpotVal-"+slotId).attr("data");
		if( "bonus" == realVal.toLowerCase() ){
			$("#spotCGRate-"+slotId).html(spotRate);
			spotObj.rate = spotRate;
		} else {
			$("#spotCGRate-"+slotId).html("0");
			spotObj.rate = 0;
		}
	}


	var temp = [];
	for(var key in TELECAST_CERTIFICATE_FILTER_DATA['cg_log_map']){
		temp.push(TELECAST_CERTIFICATE_FILTER_DATA['cg_log_map'][key]);
	}
	display_tc_cg_data(TELECAST_CERTIFICATE_FILTER_DATA["customer"], temp, TELECAST_CERTIFICATE_FILTER_DATA.roId); // Reload the table with new data
}

function showHideCGRemarksDialog(slotId){
	var remarks = "";
	if(TELECAST_CERTIFICATE_FILTER_DATA['cg_log_map'][slotId]){
		remarks = TELECAST_CERTIFICATE_FILTER_DATA['cg_log_map'][slotId].remarks;
	}
	
	$("#cg_rate_remarks_div").dialog('open');
	setTimeout(function(){
		$("#cg_rate_remarks_div textarea").attr("data", slotId);
		$("#cg_rate_remarks_div textarea").val(remarks);
		$(".ui-dialog-titlebar-close").hide();
	}, 300);
}

function initClickOnCGRemarks(){
	$(".cgRemarksInfo").unbind("click");
	$(".cgRemarksInfo").click(function(){
		var slotId = this.id.replace("slotCGRemarks-", "");
		setTimeout(function(){
			$(".cgRemarksInfo").html("");
		}, 200);

		showHideCGRemarksDialog(slotId);
	});

}

function getTCGSTInfo(){
	var gst_no = "", gst_status = "", state = "", pan_num = "";

	var obj = TELECAST_CERTIFICATE_FILTER_DATA;
	if(obj.customer){
		var isBillToAgency = false, agencyInfo = {};
		if(obj.customer.ro_details){
			if(obj.customer.ro_details.bill_to == "agency"){
				isBillToAgency = true;
				if(obj.customer.agency_id){
					var info = agencyMapObj[obj.customer.agency_id];
					if(info){
						agencyInfo = info;
					}
				}
			}
		}

		if(isBillToAgency && !$.isEmptyObject(agencyInfo) ){
			console.log(agencyInfo);

			if(agencyInfo.gst_status){
				if(agencyInfo.gst_no){
					gst_no = agencyInfo.gst_no;
				}

				if(agencyInfo.gst_status){
					gst_status = agencyInfo.gst_status;
				}

				if(agencyInfo.address && agencyInfo.address.state){
					state = agencyInfo.address.state;
				}

				if(agencyInfo.pan_num){
					pan_num = agencyInfo.pan_num;
				}
			}
		} else {

			if(obj.customer.gst_no){
				gst_no = obj.customer.gst_no;
			}

			if(obj.customer.gst_status){
				gst_status = obj.customer.gst_status;
			}

			if(obj.customer.address && obj.customer.address.state){
				state = obj.customer.address.state;
			}

			if(obj.customer.pan_num){
				pan_num = obj.customer.pan_num;
			}
		}
	}

	console.log("gst_no......"+gst_no+" gst_status......"+gst_status+"  state......"+state);
	// gst_no = "32cdcdss", gst_status = "registered", state = "TEST AGENCY STATE";

	return [gst_no, gst_status, state, isBillToAgency, pan_num];
}


//Updates the slot caption for the given id
function updateTelecastCGCaption(slotId, caption){
	$("#cg_clip_caption_div").dialog('close');

	TELECAST_CERTIFICATE_FILTER_DATA['cg_log_map'][slotId].clip_caption = caption;
	var spotObj = TELECAST_CERTIFICATE_FILTER_DATA['cg_log_map'][slotId];

	var temp = [];
	for(var key in TELECAST_CERTIFICATE_FILTER_DATA['cg_log_map']){
		temp.push(TELECAST_CERTIFICATE_FILTER_DATA['cg_log_map'][key]);
	}
	display_tc_cg_data(TELECAST_CERTIFICATE_FILTER_DATA["customer"], temp, TELECAST_CERTIFICATE_FILTER_DATA.roId); // Reload the table with new data
}

