//jQuery validation messages,the custom messages can be overridden here
// var channel_logo = document.location.origin+'/images/'+'vrl_logo.png'

jQuery(document).ready(function() {
	jQuery.extend(jQuery.validator.messages, {
		required: "This field is required.",
		remote: "Already exists.",
		email: "Please enter a valid email address..........",
		url: "Please enter a valid URL.",
		date: "Please enter a valid date.",
		dateISO: "Please enter a valid date (ISO).",
		number: "Please enter a valid number.",
		digits: "Please enter only digits.",
		creditcard: "Please enter a valid credit card number.",
		equalTo: "Please enter the same value again.",
		accept: "Please enter a value with a valid extension.",
		maxlength: jQuery.validator.format("Please enter no more than {0} characters."),
		minlength: jQuery.validator.format("Please enter at least {0} characters."),
		rangelength: jQuery.validator.format("Please enter a value between {0} and {1} characters long."),
		range: jQuery.validator.format("Please enter a value between {0} and {1}."),
		max: jQuery.validator.format("Please enter a value less than or equal to {0}."),
		min: jQuery.validator.format("Please enter a value greater than or equal to {0}.")
	});

	
});



function checkSession(){
	$.ajax({
		url: "/sessions/mine",
		type:"GET",
		dataType:"json",
		success: function (data) {
			if(data!=null && data.users.username!=null )
				$('#myname').html(data.users.username);
			//for (var i = 0, len = data.users.privileges.length; i < len; i++) {
				if  (data.users.role== "Administrator")
					$('.settings-menu').show();
			//}                          
		},
		error: function(data) {
			window.location.assign('index.html');
		}
	});
}

function showUsername(){
	$.ajax({
		url: "/sessions/mine",
		type:"GET",
		aync:false,
		dataType:"json",
		success: function (data) {
			if(data!=null && data.users.username!=null )
				$("#userInfo").html(data.users.username);
			 user_channel_id = data.users.assigned_channel;
			 // console.log("channel_id::::"+user_channel_id+"size:"+user_channel_id.length);
			 def_channel = user_channel_id[0];
			 $("#channel").val(def_channel);
			 
			// console.log("showUsername::::::::::::::"+JSON.stringify(data.users)) 
			getPrivileges(data.users.privileges);
			
		},
		error: function(data) {

		}
	});
}

function getPrivileges(privileges){
		 modules = [];
		 modules = privileges['modules'];
			
	     $("#menu_programs").hide();
	     $("#menu_pre_sales").hide();
	     $("#menu_orders").hide();
	     $("#menu_special_packages").hide();
	     $("#menu_logs").hide();
	     $("#menu_reports").hide();
	     $("#menu_customers").hide();
	     $("#menu_agency").hide();
	     $("#menu_commercials").hide();
	     $("#menu_order_summary").hide();
	     $("#menu_audit_trail").hide();
	     $("#menu_settings").hide(); 
	     $("#menu_bulk_ro").hide(); 

		 for(i=0;i<modules.length;i++){
			 mod = modules[i].toLowerCase();
		
		
		    if(mod=='programs'){
				 $("#menu_programs").show();
			} else if(mod=='ro_proposal'){
				 $("#menu_pre_sales").show();
			}else if(mod=='orders'){
				 $("#menu_orders").show();
			}
			else if(mod=='media'){
				 $("#menu_commercials").show();
			}
			else if(mod=='special_packages'){
				 $("#menu_special_packages").show();
			}
			else if(mod=='logs'){
				 $("#menu_logs").show();
		    }	
			else if(mod=='reports'){
				 $("#menu_reports").show();
            }
            else if(mod=='bulk_orders') {
             	$("#menu_bulk_ro").show()
            } 
            else if(mod=='inventory') {
             	$("#menu_inventory").show()
            } 

			else if(mod=='customers'){
				 $("#menu_customers").show();
			}else if(mod=='agency'){
				 $("#menu_agency").show();
			}
			else if(mod=='charts'){
				 $("#menu_order_summary").show();
			}
			else if(mod=='audit'){
				 $("#menu_audit_trail").show();
			}
			else if(mod=='settings'){
				 $("#menu_settings").show();
		    }else if(mod == "Bulk_Orders"){
		    	$("#menu_bulk_ro").show(); 
		    }else{
		      	console.log("no match:::::::::"+mod)
		    }


	    }
    
	 
}

function getVersion(){
	var version ;
	$.ajax({
		url: "/version",
		type:"GET",
		dataType:"json",
		success: function (data) {
			console.log(data);
			version ="QETraffic v"+data['version'];  
			$('#title-id').html(version);               
		} 
	});
}

/*
 * popup function
 * 
 * 
 */
 function showPopUp(url,header,bool){
 	jQuery('html').css({'overflow':'hidden'});
 	if(bool!=false)
 	{
 		
 		var dialog = jQuery("<div></div>");
		 /* if (jQuery("#dialogId").length == 0) {
			 
		        dialog = jQuery('<div id="dialogId" style="display:none;overflow:hidden;"></div>').appendTo('body');
		    }*/
		  // load remote content
		  dialog.load(
		  	url,
		  	{},
		  	function(responseText, textStatus, XMLHttpRequest) {
		  		dialogBox(dialog,header);
		  	});
		}
	}
	function dialogBox(content,header)
	{
		content.dialog(getDialogStyle(header));
	}

	function showQEDialog(data,header){
		//jQuery('html').css({'overflow':'hidden'});
		 var tag = jQuery("<div></div>");
		tag.html(data).dialog(getDialogStyle(header));
		
	}
	function showQEDialogId(Id,header){
		//jQuery('html').css({'overflow':'hidden'});
		jQuery("#"+Id).dialog(getDialogStyle(header));
	}
	function getDialogStyle(header){
		var getArr={
			resizable:false,
			modal: true,
			
			height : 'auto',
			width : 'auto',
			maxWidth : 1000,
			minWidth : 600,
			title: header,	          
			close: function(event, ui) {
        	//jQuery(this).dialog ('destroy');
        	jQuery('html').css({'overflow-y':'visible','overflow-x':'hidden'});
        }
        
    };
    return getArr;
}

function dateformatter(jsonDt) {
    //incoming json date string is of the form "/Date(946702800000)/"
    var currentTime = new Date(jsonDt)
    var month = currentTime.getMonth() + 1
    var day = currentTime.getDate()
    var year = currentTime.getFullYear()
    var hrs = currentTime.getHours()
    var min = currentTime.getMinutes()
    var sec = currentTime.getSeconds()
    var dateString ="";
    if(sec==0){
    	dateString = day + "/" + month + "/" + year + " " + hrs + ":" + min + ":00"  
    }else{
    	dateString = day + "/" + month + "/" + year + " " + hrs + ":" + min + ":" + sec 
    }
    return dateString;
}

function alphaOnly(ele) {
	$(ele).keypress(function(key) {
		if((key.charCode < 97 || key.charCode > 122) && (key.charCode < 65 || key.charCode > 90) && (key.charCode != 45) 
			&& key.charCode != 0 && key.charCode != 8 && key.charCode != 9 && key.charCode != 46
			) 
			return false;
	});
}

function numOnly(ele) {
	$(ele).keypress(function(key) {
		if((key.charCode < 48 || key.charCode > 57) && key.charCode != 0 && key.charCode != 8 && key.charCode != 9 && key.charCode != 46 
			&& key.charCode != 190 && key.charCode != 110) 
			return false;
	});
}

function alphaNumOnly(ele) {
	$(ele).keypress(function(key) {
		if((key.charCode != 95) && (key.charCode != 32) && (key.charCode < 48 || key.charCode > 57) && key.charCode != 0 && key.charCode != 8 && key.charCode != 9 && key.charCode != 46
			&& (key.charCode < 97 || key.charCode > 122) && (key.charCode < 65 || key.charCode > 90) && (key.charCode != 45)
			)
			return false;
	});
}

function disableTextSelection(ele) {
	$(ele).on('dragstart', function(event) { 
		event.preventDefault(); 
	});
}

function disableCutCopyPaste(ele) {
	$(ele).on("cut copy paste",function(e) {
		e.preventDefault();
	});
}

function days_between(date1, date2) {
	//alert(date1 + ":" + date2);
	var d1 = moment(date1,'YYYY/M/D');
	var d2 = moment(date2,'YYYY/M/D');
	//alert(d1 + ": "  + d2);
	var diffDays = d2.diff(d1, 'days');
	//alert(diffDays);
	return diffDays;
}

function getDateYYYYMMDDWithHyphen(date) {
	var res_date = "";
	if(date.length > 6) {
		var dt = new Array();
		dt = date.split("/");
		var day = dt[0];
		var month = dt[1];
		var year = dt[2];
		
		if(dt[0].length == 1) {
			day = '0' + dt[0];
		}
		if(dt[1].length == 1) {
			month = '0' + dt[1];
		}	
		res_date = year + "-" + month + "-" + day; 
		return res_date;
	}
}

function getCurrentDate() {
	var currentDate = new Date();
	var day = currentDate.getDate();
	var month = currentDate.getMonth() + 1;
	var year = currentDate.getFullYear();
	
	if(currentDate.getDate() <= 9) {
		day = '0' + currentDate.getDate();
	}
	if( (currentDate.getMonth()+1) <= 9) {
		month = '0' + (currentDate.getMonth()+1);
	}	
	
	var today = day + "/" + month + "/" +year ; 
	return today;
}

  var notification_count = 0;
  var total_count = 0;
  var total_notify_len =0
  var channel_id = ""
 
function get_notify_count(callback, date){
	if( date == undefined) {
		//date = moment().add(1,'days').format("DD/MM/YYYY");
		date = moment().format("DD/MM/YYYY");
	}

	channel_id = $("#channel").val();
	var user_id = "";
	if(sessionStorage.getItem("user_id")!=undefined && sessionStorage.getItem("user_id")!=null){
		user_id = sessionStorage.getItem("user_id");
	}
	
	if(!user_id || !channel_id){
		console.log("Invalid user_id or channel_id in get_notify_count()");
		return;
	}
	//var total_count = 0
  
   $.ajax({
		type:"GET",
		url : "/notifications?date="+date+"&channel_id="+channel_id+"&user_id="+user_id,
		success:function(data){
			if(data!= undefined){
				var notifications = [];
				notification = data.notifications;
				total_notify_len = notification.length
				notification_count = data.unread_count;
				if (notification_count == 0 && total_notify_len>0){
	                total_count = total_notify_len
	                $("#notify_count").text(total_count); 
				} else if(parseInt(total_notify_len) > 0  && parseInt(notification_count) > 0){
				 total_count = total_notify_len - notification_count
				 if(total_count > 0){
				     $("#notify_count").text(total_count); 
				     $("#notify_count").show(); 
				 }
				 if(total_count == 0){
				     $("#notify_count").hide(); 
				 }

				}
			}

			if(callback != undefined){
				return callback(data);
			}
			
		},
		error: function(xhr, status, text) {
			comm_handleAjaxError(xhr);
		}
	});
    return notification_count;
}
