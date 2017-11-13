
// var channel_logo = document.location.origin+'/images/'+'vrl_logo.png';

var gstStateMap = { "35": "Andaman and Nicobar Islands", "28": "Andhra Pradesh", "37":"Andhra Pradesh (New)",
				    "12": "Arunachal Pradesh", "18": "Assam", "10": "Bihar", "04": "Chandigarh", "22":"Chattisgarh", 
				    "26": "Dadra and Nagar Haveli", "25": "Daman and Diu ", "07": "Delhi", "30": "Goa", "24":"Gujarat",
				    "06": "Haryana", "02": "Himachal Pradesh", "01":" Jammu and Kashmir", "20":"Jharkhand", 
				    "29": "Karnataka", "32": "Kerala", "31": "Lakshadweep Islands", "23": "Madhya Pradesh ", 
				    "27": "Maharashtra", "14": "Manipur", "17": "Meghalaya", "15": "Mizoram", "13": "Nagaland",
				    "21": "Odisha", "34": "Pondicherry", "03": "Punjab", "08": "Rajasthan", "11": "Sikkim", 
				    "33": "Tamil Nadu", "36": "Telangana", "16": "Tripura", "09": "Uttar Pradesh", "05": "Uttarakhand",
				    "19": "West Bengal"
				};


var stateCodeMap = { "AN": "Andaman and Nicobar Islands", "AP": "Andhra Pradesh", "AD":"Andhra Pradesh (New)",
				    "AR": "Arunachal Pradesh", "AS": "Assam", "BR": "Bihar", "CH": "Chandigarh", "CG":"Chattisgarh", 
				    "DN": "Dadra and Nagar Haveli", "DD": "Daman and Diu ", "DL": "Delhi", "GA": "Goa", "GJ":"Gujarat",
				    "HR": "Haryana", "HP": "Himachal Pradesh", "JK":" Jammu and Kashmir", "JH":"Jharkhand", 
				    "KA": "Karnataka", "KL": "Kerala", "LD": "Lakshadweep Islands", "MP": "Madhya Pradesh ", 
				    "MH": "Maharashtra", "MN": "Manipur", "ML": "Meghalaya", "MZ": "Mizoram", "NL": "Nagaland",
				    "OR": "Odisha", "PY": "Pondicherry", "PB": "Punjab", "RJ": "Rajasthan", "SK": "Sikkim", 
				    "TN": "Tamil Nadu", "TS": "Telangana", "TR": "Tripura", "UP": "Uttar Pradesh", "UK": "Uttarakhand",
				    "WB": "West Bengal"
				};


$(document).ready(function(){
	setTimeout(function(){
		comm_loadAgencies();
		comm_loadBranches();
		comm_loadCustomers();
	}, 1000);
});


var channelsMap = {};
function load_channels(){
	$.ajax({
		url:'channels',
		success:function(data){
			if(data.channels){
				for(var i=0; i<data.channels.length; i++){
					var item = data.channels[i];
					channelsMap[item.channel_identity] = item;
				}
			}
		},
		error: function(error){
			comm_handleAjaxError(error);
		}
	});
}
load_channels();

function getDealConditions(channel_id){
	var deal_terms = "";
	if( !$.isEmptyObject(channelsMap) ){
		var channelObj = channelsMap[channel_id];
		if( channelObj ){
			if( channelObj["deal_terms_and_cond"] ){
				deal_terms = channelObj["deal_terms_and_cond"];
			}
		}
	}

	return deal_terms;
}

function getInvoiceConditions(channel_id){
	var inv_terms = "";
	if( !$.isEmptyObject(channelsMap) ){
		var channelObj = channelsMap[channel_id];
		if( channelObj ){
			if( channelObj["inv_terms_and_cond"] ){
				inv_terms = channelObj["inv_terms_and_cond"];
			}
		}
	}

	return inv_terms;
}

function getChannelLogo(channel_id){
	var logo_name = "", channel_logo = document.location.origin+'/images/logo/';
	if( !$.isEmptyObject(channelsMap) ){
		var channelObj = channelsMap[channel_id];
		if( channelObj ){
			if( channelObj["channel_logo_name"] ){
				logo_name = channelObj["channel_logo_name"];
			}
		}
	}

	if(logo_name){
		channel_logo += logo_name;
	}

	return channel_logo;
}

function getChannelGST(channel_id){
	var gst = "";
	if( !$.isEmptyObject(channelsMap) ){
		var channelObj = channelsMap[channel_id];
		if( channelObj ){
			if( channelObj["gst_no"] ){
				gst = channelObj["gst_no"];
			}
		}
	}
	return gst;
}

function getChannelCaption(channel_id){
	var caption = "";
	if( !$.isEmptyObject(channelsMap) ){
		var channelObj = channelsMap[channel_id];
		if( channelObj ){
			if( channelObj["channel_caption"] ){
				caption = channelObj["channel_caption"];
			} else {
				caption = channelObj.name;
			}
		}
	}

	return caption;
}

function getChannelTelephone(channel_id){
	var tel = "";
	if( !$.isEmptyObject(channelsMap) ){
		var channelObj = channelsMap[channel_id];
		if( channelObj ){
			if( channelObj["telephone"] ){
				tel = channelObj["telephone"];
			}
		}
	}

	return tel;
}


function getChannelPanNo(channel_id){
	var panNo = "";
	if( !$.isEmptyObject(channelsMap) ){
		var channelObj = channelsMap[channel_id];
		if( channelObj ){
			if( channelObj["pan_no"] ){
				panNo = channelObj["pan_no"];
			}
		}
	}

	return panNo;
}


function getChannelServiceTaxNo(channel_id){
	var serviceTaxNo = "";
	if( !$.isEmptyObject(channelsMap) ){
		var channelObj = channelsMap[channel_id];
		if( channelObj ){
			if( channelObj["service_tax_no"] ){
				serviceTaxNo = channelObj["service_tax_no"];
			}
		}
	}

	return serviceTaxNo;
}

function loadPagination(){
	var totalRecords = $('#totalCountSearch').val();
	return totalRecords;
}


function getSelectedItems(){
	var commId = new Array();
	var commercialsId="";
	var finalCommId = new Array();
	var k=0;
	
	var itemsSelected = $('#itemsSelected').val();
	
	$('input:checkbox[name=commId]:checked').each(function(i){
		commId[i] = $(this).val();
	});
	
	if(commId.length == 0){
		commercialsId="0";
	}else{
		commercialsId=commId.join(",");
	}
	
	if(itemsSelected != "0"){
		if(commercialsId!="0"){
			commercialsId = itemsSelected +","+commercialsId;
		}else{
			commercialsId = itemsSelected;
		}
	}
	
	commId = commercialsId.split(",");
	
	finalCommId = commId.filter( function( item, index, inputArray ) {
        return inputArray.indexOf(item) == index;
	});
	
	return finalCommId;
}

$.validator.addMethod("validateName", function (value,element){
    var patt = new RegExp("^[a-zA-Z0-9_\\s.]+$");
    var res = patt.test(value);
	return res;
},"Special characters not allowed");

function validateName(name){
	  var patt = new RegExp("^[a-zA-Z0-9_\\s.&-]+$");
		 var res = patt.test(name);
		 if(!res)
			 return false;
		 else
			 return true;
}

function checkSessionExists(){
	var sessionId = $("#sessionId").val();
	 var flag = true;
	jQuery.ajax({
		async: false,
		url : "/checkSessionExists/"+sessionId,
		type : "GET",
		success : function(data) {
			if(data.sessionExists=="no"){
				flag = false;
			}else
				flag = true;
		}
	});
	return flag;
}

function validateTime(value,element){
	//console.log("element"+element+"-------value"+value);
	var hhmmss;
	hhmmss = value.split(":");
	
	if(isNaN(hhmmss[0])||isNaN(hhmmss[1])||isNaN(hhmmss[2])){
		jAlert("Invalid "+element);
		return false;
	}
	if(hhmmss[0]=="" || hhmmss[1]=="" || hhmmss[2]==""){
		jAlert("Invalid "+element);
		return false;
	}
	if(hhmmss[0]<0 || hhmmss[0]>24 || hhmmss[1]<0 || hhmmss[1]>60 || hhmmss[2]<0 || hhmmss[2]>60){
		jAlert("Invalid "+element);
		return false;
	}else{
		return true;
	}
}

function comm_validateDuration(hhmmss){
	
	hhmmss = hhmmss.split(":");
	if(hhmmss!=undefined && hhmmss.length>2){
		if(isNaN(hhmmss[0])||isNaN(hhmmss[1]) || isNaN(hhmmss[2])){
			jAlert("Invalid duration");
			return false;
		}

		if(hhmmss[0]<0 || hhmmss[0]>24 || hhmmss[1]<0 || hhmmss[1]>60 || hhmmss[2]<0 || hhmmss[2]>60){
			jAlert("Invalid duration");
			return false;
		}
		if(hhmmss[0]=="" || hhmmss[1]=="" || hhmmss[2]==""){
			jAlert("Invalid duration");
			return false;
		}
		if(hhmmss[0]=="00" && hhmmss[1]=="00" && hhmmss[2]=="00"){
			jAlert("Duration can't be 00:00:00");
			return false;
		}
	}else{
		jAlert("Invalid Duration");
		return false;
	}
		return true;
}

function checkStartEndTime(startTime,endTime){
	var start = startTime.split(":");
	var end = endTime.split(":");
	var yr = 2014;
	var month = 01;
	var dt = 15;
	var st = new Date(yr,month,dt,start[0],start[1],start[2]);
	var ed = new Date(yr,month,dt,end[0],end[1],end[2]);
	if(st.getTime()>ed.getTime() || st.getTime()==ed.getTime()){
		jAlert("End time should be greater than start time");
		return false;
	}
	return true;
}

function checkDates(frmDt,toDt){
	// var fromDate = frmDt.split("-");
	// var toDate = toDt.split("-");
	// var frm = new Date(fromDate[0],fromDate[1],fromDate[2]);
	// var to = new Date(toDate[0],toDate[1],toDate[2]);

	var frm = moment(frmDt, "DD/MM/YYYY").format("YYYYMMDD");
	var to = moment(toDt, "DD/MM/YYYY").format("YYYYMMDD");
	if(frm > to){
		jAlert("From date greater than to date");
		return false;
	} else {
		return true;
	}
}

function getCurrentDateTime() {
    return moment().format("DD/MM/YYYY HH:mm:ss");
}

function formatDate (input) {
	var datePart = input.match(/\d+/g),
	year = datePart[0], // get only two digits
	month = datePart[1], day = datePart[2];

	return day+'/'+month+'/'+year;
}

function checkIsUndefined(val){
	var returnVal = "";
	if(val == undefined || val == null || !val){
		returnVal = "";
	} else {
		returnVal = val;
	}
	return returnVal;
}

function comm_getLabelValue(module, label){
    var val = label;
    if($.isEmptyObject(labelsMapObj)){
    	if(label == "Currency" ){
    		label = "Rs"
    	}
        return label;
    }

    if( !$.isEmptyObject(labelsMapObj[module]) ){
    	var value = labelsMapObj[module][label];
        val = value != undefined ? value : label;
    }

    return val;
}

function comm_handleAjaxError(xhr){
    //var response = $.parseJSON(xhr);
   
    var err = '';
    if(xhr.errors){
       err = xhr.errors;
    }
    var resTxt;
    if(xhr.responseText){
       resTxt = xhr.responseText;
    }
 

    if(err.toString()=='session_expired'){
        window.location.href= "index.html";
    } else if(xhr.status==401){
    	jAlert("Unauthorized");
    	return;
    } else if(xhr.status==404){
    	 jAlert("Not Found");
    	 return;
    }else if(xhr.status==400){
    	var res = $.parseJSON(resTxt)
    	if(res.errors){
    		jAlert(res.errors.toString());
    	}
    	return;
    } else {   
        jAlert(err.toString());
        return;
    }
}

function confirm_page_nav(){
	var prev_page = "";
	if($.cookie("landing_page")!=null){
		prev_page = $.cookie("landing_page");
		
		if(prev_page=="ro"){
			return false;
		}else{
			return true;
		}
   }else{
   	
   	return true;
   }
		
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

function showClipPreview(id, title, eleId){
	if(id!=undefined && id.length==24){
		$.ajax({
			type:"GET",
			url:"/commercials/"+id,
			success:function(data){
				var lowres = data['commercial']['lowres'].replace("mw:/","");
				var str = '<video width="560" height="340" controls > <source src="ads'+lowres+'" type="video/ogg"></source></video>';
				$(eleId).html(str);
				$(eleId).dialog({ title: title });
				$(eleId).dialog('open');
			},
			error: function(xhr, status, text) {
				console.log("play video get error");
				comm_handleAjaxError(xhr);
			}
		});
	}	
}

function get_clip_name_without_extn(clip_name){
  var last_ind = clip_name.lastIndexOf('.')
  var clip_without_ext = clip_name
  if(last_ind>-1){
   clip_without_ext = clip_name.substring(0,last_ind)
  }
  return clip_without_ext
}

function getEndTime(st_time, dur){
	if(!st_time || !dur){
		console.log("Empty values in getEndTime");
		return "";
	}
	var ed_time = "";
	var durList = dur.split(":");
	var h = durList[0], m = durList[1], s = durList[2];
	
	ed_time = moment(st_time, "HH:mm:ss").add(h, "hours").format("HH:mm:ss");
	ed_time = moment(ed_time, "HH:mm:ss").add(m, "minutes").format("HH:mm:ss");
	ed_time = moment(ed_time, "HH:mm:ss").add(s, "seconds").format("HH:mm:ss");

	return ed_time;
}

function sec_to_hhmmss(totalSec){
	//var totalSec = new Date().getTime() / 1000;
	var hours = parseInt( totalSec / 3600 ) % 24;
	var minutes = parseInt( totalSec / 60 ) % 60;
	var seconds = totalSec % 60;
	return  (hours < 10 ? "0" + hours : hours) + ":" + (minutes < 10 ? "0" + minutes : minutes) + ":" + (seconds  < 10 ? "0" + seconds : seconds);
}

function hhmmss_to_sec(hhmmss){
	var hms = hhmmss; 
	var a = hms.split(':');
	// minutes are worth 60 seconds. Hours are worth 60 minutes.
	var seconds = parseInt(((a[0]) * 60 * 60)) + parseInt(((a[1]) * 60)) + parseInt(((a[2])));	
	return seconds; 
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

function comm_calculateTelecastAmount(gross_amt, billType, custGst, taxType, gstStatus, custState){
	console.log("comm_calculateTelecastAmount.......", gross_amt);

	var SWACHH_BHARAT_PERCENTAGE = 0.5, KRISHI_KALYAN_CESS_PERCENTAGE = 0.5, SERVICE_TAX = 14;
	var final_cost = 0, agency_comm = 0.0, discounted_amt = 0.0, service_tax = 0.0, swatch_bharat = 0.0, krishi_kalyan = 0.0, net_taxable_amount = 0.0, round_off = 0.0;
	var cgst = 0, sgst = 0, igst = 0;
	var tax_type = "service_tax", GST_TAX = 0;

	var inv_master = comm_getInvoiceMaster();

    net_taxable_amount = parseFloat(gross_amt);

    // console.log("billType:: "+billType);
    

    if( inv_master ){

    	if(inv_master.invoice_tax_type){
            tax_type =  inv_master.invoice_tax_type;
        }

        if(taxType){
        	tax_type = taxType;
        }

        if(tax_type == "gst"){
            GST_TAX = inv_master.gst_value;
        }

    	if(billType == "gross" && inv_master.agency_commission){
        	agency_comm = parseFloat(gross_amt) * (parseFloat(inv_master.agency_commission)/ 100);
        	discounted_amt = parseFloat(gross_amt) - parseFloat(agency_comm);
        	net_taxable_amount = discounted_amt;
        }
    }

    if(tax_type == "gst" && gstStatus){
    	console.log("GST TRUE...");
        var isIntegratedGST = true;

        isIntegratedGST = checkIsIntegratedGST(custGst, gstStatus, custState);

        if(isIntegratedGST){
        	console.log("isIntegratedGST TRUE");
        	// igst <== gst
        	igst = parseFloat( net_taxable_amount * (parseFloat(GST_TAX)/ 100) );

        	final_cost = parseFloat(igst +  net_taxable_amount);
        } else {
        	//apply 50% GST each for central and state 
        	cgst = parseFloat( net_taxable_amount * (parseFloat(GST_TAX/2)/ 100) );
        	sgst = parseFloat( net_taxable_amount * (parseFloat(GST_TAX/2)/ 100) );

        	final_cost = parseFloat(cgst + sgst +  net_taxable_amount);
        }

    } else {
    	
	    service_tax = parseFloat( net_taxable_amount * (parseFloat(SERVICE_TAX)/ 100) );

	    swatch_bharat = net_taxable_amount * (parseFloat(SWACHH_BHARAT_PERCENTAGE)/ 100);
	    
	    krishi_kalyan = net_taxable_amount * (parseFloat(KRISHI_KALYAN_CESS_PERCENTAGE)/ 100);

    	final_cost = parseFloat(service_tax + swatch_bharat + krishi_kalyan + net_taxable_amount);
	}

	round_off = Math.round(final_cost) - parseFloat(final_cost);


    if(round_off.toFixed(2) == -0.00){
    	round_off = 0.00;
    }


    var obj = {"final_cost": Math.round(final_cost), 
            "agency_discount": agency_comm.toFixed(2), 
            "gross_amount": gross_amt.toFixed(2),
            "net_taxable_amount": net_taxable_amount.toFixed(2), 
            "round_off": round_off.toFixed(2),
            "tax_type": tax_type
        };

        if( tax_type == "gst" ){
        	obj["cgst"] = cgst.toFixed(2);
            obj["sgst"] = sgst.toFixed(2);
            obj["igst"] = igst.toFixed(2);
            var total_gst = parseFloat(cgst) + parseFloat(sgst) + parseFloat(igst);
            obj["tgst"] = total_gst.toFixed(2);
        } else {
        	obj["krishi_kalyan_cess"] = krishi_kalyan.toFixed(2);
            obj["swatch_bharat"] = swatch_bharat.toFixed(2);
            obj["service_tax"] = service_tax.toFixed(2);
            obj["tax_type"] = "service_tax";
        }

    return obj;
}

function checkIsIntegratedGST(custGst, gstStatus, custState){
	var isIntegratedGST = true;
	var channel_gst = "";

	//get channel GST Number
    var channel = $("#channel").val();
    var channel_gst = "";
    if(channel){
    	channel_gst = getChannelGST(channel);
    } else {
    	console.log("Empty Channel GST.......");
    }

    console.log(gstStatus , custState , channel_gst );

    if(gstStatus == "registered"){
        if(custGst && channel_gst){
            if(custGst.length && channel_gst.length){
                if( custGst.substr(0, 2) == channel_gst.substr(0, 2) ){
                    isIntegratedGST = false;
                }
            }
        }
    } else if (gstStatus == "unregistered" && custState && channel_gst.length){
    	var channelGSTCode = channel_gst.substr(0, 2);
    	custState = custState.toUpperCase();

    	if(channelGSTCode != undefined && gstStateMap[channelGSTCode]!= undefined && stateCodeMap[custState] != undefined ){
      	    var customerState = stateCodeMap[custState].toLowerCase();
      	    var channelState = gstStateMap[channelGSTCode].toLowerCase();

      	    console.log("customerState: "+customerState+" ::: channelState: "+channelState);
    	    if( customerState ==  channelState){
    		    isIntegratedGST = false;
    		}
    	}
    } else {
    	console.log(gstStatus, custState);
    }

    console.log("isIntegratedGST..........."+isIntegratedGST);
    return isIntegratedGST;

}

// function calculate_each_spot_netprice(billing_type,cost){
//     var net_price = 0.0
//     switch(billing_type){
// 	    case 'gross':
// 	        net_price = cost - cost*.15 //agency comission deducted;
// 	        break;
      
// 	    case 'net':
// 	        net_price = cost;
// 	        break;
          
//      	case 'direct':
//          	//x+(x-.15x)*.15 = final_price, //tax part deducted
//         	net_price = float(cost/1.1275);
//           	break;
          
//      	case 'lumsome':
//           //x + .15x + (x-0.15x)*.15 = final_price # agency and tax part deducted
//           net_price = float(cost/1.2775);
//           break;
          
//      	case 'lumsome_bill_customer':
//           //x + .15x + (x-0.15x)*.15 = final_price # agency and tax part deducted 
//           net_price = float(cost/1.2775);
//           break;
          
//      	case 'lumsome_bill_stinger':
//           //x+(x-.15x)*.15 = final_price, #tax part deducted
//           net_price = float(cost/1.1275);
//           break;
//     }
//     return net_price  
// }

var invoiceMaster = null;
function comm_loadInvoiceMaster(){
	$.ajax({
		type : "GET",
		url : "/invoice_master",
		dataType:"json",
		success : function(response) {
			invoiceMaster = response.invoice_master[0];
		},
		error : function(xhr) {
			comm_handleAjaxError(xhr);
		}
	});
}

function comm_getInvoiceMaster(){
	if( !$.isEmptyObject( invoiceMaster ) ) {
		return invoiceMaster;
	} else {
		return "";
	}
}

function get_client_details(client){
	var client_addr = ""
   if(client!=undefined){
   	  
   	  if(client.street!=undefined && client.street!=''){
   	  	client_addr = client_addr + client.street 
   	  }
   	  if(client.area!=undefined && client.area!=''){
   	  	client_addr = client_addr + client.area + ' '
   	  }
   	  if(client.landmark!=undefined && client.landmark!=''){
   	  	client_addr = client_addr + client.landmark + ' '
   	  }
   	   if(client.city!=undefined && client.city!=''){
   	  	client_addr = client_addr + client.city + ' '
   	  }
   	  if(client.state!=undefined && client.state!=''){
   	  	client_addr = client_addr + client.state + ' '
   	  }
   	  if(client.pincode!=undefined && client.pincode!=''){
   	  	client_addr = client_addr + client.pincode 
   	  }
   }
   return client_addr.toUpperCase()
}

var branchArr = [], branchMap = {}, branch_name_list = [], branch_name_id_map = {} ;
function comm_loadBranches(){

	var channel = $("#channel").val();

	$.ajax({
		dataType: "json",
		url: 'branches?status=active&channel_id='+channel,
		success: function(result) {
			branchArr = [], branchMap = {}, branch_name_list = [], branch_name_id_map = {} ;

			if( result.branches == undefined){
				return;
			}
			if( !result.branches.length ){
				console.log("Empty branches");
				return;
			}

			var branch = [];
	    	branch = result.branches;
	    	if(branch.length){

		    	for(var i=0; i<branch.length; i++){
		    		var item = branch[i];

				    // custArr.push({"label": item.name.toUpperCase(), "value": item._id });

				    branchMap[item._id] = item.name.trim();
				    branch_name_list.push(item.name);
				    branch_name_id_map[item.name] = item['_id']
		    	}
			}
		},
		error: function(xhr, status, text) {
			comm_handleAjaxError(xhr);
		} 
	});
}

function comm_getBranchNameList(){
	return branch_name_list;
}

function comm_getBranchIdByName(name){
	if(!name){
		return "";
	}

	name = name.trim();
	var branchId = "";
	if( !$.isEmptyObject(branch_name_id_map) ){
		if( branch_name_id_map[name] ){
			branchId = branch_name_id_map[name];
		}
	}

	return branchId;
}

var custArr = [], custMap = {}, customer_name_list = [], customer_name_id_map = {} ;
function comm_loadCustomers(){

	var channel = $("#channel").val();

	$.ajax({
		dataType: "json",
		url: 'customers?status=active&channel_id='+channel,
		success: function(result) {
			custArr = [], custMap = {}, customer_name_list = [], customer_name_id_map = {} ;

			if( result.customers == undefined){
				return;
			}
			if( !result.customers.length ){
				console.log("Empty customers");
				return;
			}

			var cust = [];
	    	cust = result.customers;
	    	if(cust.length){

		    	for(var i=0; i<cust.length; i++){
		    		var item = cust[i];

				    // custArr.push({"label": item.name.toUpperCase(), "value": item._id });

				    custMap[item._id] = item.name.trim();
				    customer_name_list.push(item.name);
				    customer_name_id_map[item.name.trim()] = item['_id']
		    	}
			}
		},
		error: function(xhr, status, text) {
			comm_handleAjaxError(xhr);
		} 
	});
}

function comm_getCustNameList(){
	return customer_name_list;
}

function comm_getCustIdByName(name){
	if(!name){
		return "";
	}

	name = name.trim();
	var custId = "";
	if( !$.isEmptyObject(customer_name_id_map) ){
		if( customer_name_id_map[name] ){
			custId = customer_name_id_map[name];
		}
	}

	return custId;
}

function comm_loadChannelConfig(){
	var channel = $("#channel").val()

    if(!channel){
    	console.log("Empty channel ID...");
    	return;
    }

	$.ajax({                     
         type:"GET",
         url : "configurations?channel_id="+channel,
        success:function(data){
            channelConfigObj = data.configurations;
        },
        error: function(xhr, status, text) {
            comm_handleAjaxError(xhr);
        }
    });
}


function get_user_privileges_list(callback){
	var user_id = sessionStorage.getItem("user_id")
	if(user_type && user_id){
		$.ajax({
			url: "/users/"+user_id,
			type:"GET",
			dataType:"json",
			success: function(data) {
				var modules = []
				var actions = {}

				if(data.user!=undefined){
					var privileges = data['user']['privileges']
					if(privileges && privileges['actions']!=undefined) 
					actions	= privileges['actions']
				    if(privileges && privileges['modules']!=undefined)
				     modules = privileges['modules']  
			    }

			    if(callback){
			    	
			    	console.log("get_user_privileges actions::"+JSON.stringify(actions))	
			    	callback(actions);
			    }
			}
		})
	}
}

function check_user_privileges(){
		console.log("check_user_privileges method")
        get_user_privileges_list(setBtnVisibility)
	}

function is_user_privileged(user_priv,module){
	module = module.toLowerCase()
	if(module == 'customers' && user_priv && user_priv['customers']!=undefined && 
	   	user_priv['customers'].indexOf('sync')>-1){

	   	$("#customers_sync").show()
	     isSyncCustomer = true
	   }
	else if(module == 'agency' && user_priv && user_priv['agency']!=undefined && 
	   	user_priv['agency'].indexOf('sync')>-1){
	   	$("#agencies_sync").show()
	     isSyncAgency = true
	   }

	 else if(module == 'orders' && user_priv && user_priv['orders']!=undefined){
	 	   operations = user_priv['orders']
	    	if(operations.indexOf('sync_all')>-1){
	     	   $("#sync_all_ro").show()
	        }
	        if(operations.indexOf("Add") != -1 ){
				isAddOrder = true;
			} 
			if(operations.indexOf("Edit") != -1 ){
				isEditOrder = true;
			} 
			if(operations.indexOf("View") != -1 ){
				isViewOrder = true;
			}
			if(operations.indexOf("Delete") != -1 ){
				isDeleteOrder = true;
			}
			if(operations.indexOf("Suspend") != -1 ){
				isSuspendOrder = true;
			}
			if(operations.indexOf("sync") != -1 ){
				isSyncOrder = true;
			}
			if(operations.indexOf("spot_edit") != -1 ){
				isSpotEditable = true;
			}
			
			console.log("isSyncOrder::::::::::"+operations,isSyncOrder)

	   }
       else if(module == 'invoice' && user_priv && user_priv['invoice']!=undefined){
	 	   operations = user_priv['invoice']
	       if(operations.indexOf("Edit") != -1 ){
					isEditInvoice = true;
			} 
			if(operations.indexOf("View") != -1 ){
				isViewInvoice = true;
			}
			if(operations.indexOf("sync") != -1 ){
			   isSyncInvoice = true;
		    }
		    if(operations.indexOf("Delete") != -1 ){
				isDeleteInvoice = true;
			}
		}
		else if(module == 'settings' && user_priv && user_priv['settings']!=undefined){
          operations = user_priv['settings']
          if(operations.indexOf("user_sync") != -1 ){
			  	$("#users_sync").show()
		    }
		}

}

	function setBtnVisibility(data){
       is_user_privileged(data,MODULE_NAME)
	}


var agencyMap = {}, agency_name_list = [], agency_name_id_map = [], agencyMapObj = {};
function comm_loadAgencies(){
	$.ajax({
		dataType: "json",
		url: 'agencies?channel_id='+channel,
		success: function( result) {
			agencyMap = {}, agency_name_list = [], agency_name_id_map = [], agencyMapObj = {};
			var agency_list = [];

			if(result.agencies!=undefined){
		    	agency_list = result.agencies;
                // console.log("agency listttttt"+JSON.stringify(agency_list))
		    	for(var j=0;j<agency_list.length;j++){
		    		var item = agency_list[j];
                    // console.log("each item:::::::::"+JSON.stringify(item))
				    agencyMap[item._id] = item.name;
				    agency_name_list.push(item.name)
				    agency_name_id_map[item.name] = item._id
				    agencyMapObj[item._id] = item;

		    	}
	    	}
		},
		error: function(xhr, status, text) {
            comm_handleAjaxError(xhr);
        }
	});   
	// console.log("agency map:::::::::;"+JSON.stringify(agencyMapObj))
}


function comm_trimString(name, size){
	// console.log(clipName)
	if(name!=undefined && name.length>size){
        name = name.substring(0, size)+"..";
    }
    return name
}

function comm_checkIsGST(){
	var inv_master = comm_getInvoiceMaster();
	var isGst = false;

	if( inv_master ){
		console.log("***********************");
		console.log(inv_master.invoice_tax_type);

    	if(inv_master.invoice_tax_type){
            if(inv_master.invoice_tax_type == "gst"){
            	isGst = true;
        	}
        }
    }

    return isGst;
}


function comm_getInvGSTValue(){
	var inv_master = comm_getInvoiceMaster();
	var gstVal = 0;
	if(inv_master){
		if(inv_master.invoice_tax_type){
			if(inv_master.invoice_tax_type == "gst"){
				gstVal = inv_master.gst_value;
			}
		}
	}

	return gstVal;
}

function comm_getGSTState(stateCode){
	var gstState = "";
	if(stateCode && gstStateMap[stateCode]){
		gstState = gstStateMap[stateCode];
	}
	return gstState;
}

function checkIsManualCGEntry(){
	var isManualCG = false;
	if( !$.isEmptyObject(channelConfigObj) ){
	    var reportConfig = "";
	    //checking for report configurations
	    if("report" in channelConfigObj){
	        reportConfig = channelConfigObj.report;
	        if(reportConfig.manual_cg_entry){
	        	isManualCG = true;
	        }
	    }
	}

	return isManualCG;
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


function comm_getStatenameByStateCode(code){
	var stateName = "";
	if(code){
		code = code.toUpperCase();
		if( stateCodeMap[code] ){
			stateName = stateCodeMap[code];
		}
	}

	return stateName;
}


function checkIsManualInvoiceBillDate(){
	var invBillDate = false;
	if( !$.isEmptyObject(channelConfigObj) ){
	    var printConfig = "";
	    //checking for report configurations
	    if("print" in channelConfigObj){
	        printConfig = channelConfigObj.print;
	       if("invoice_bill_date" in printConfig){
                if(printConfig.invoice_bill_date){
                    invBillDate = true;
                }
            }

	    }
	}
	return invBillDate;
}

