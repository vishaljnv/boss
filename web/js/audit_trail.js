
var defaultPage = 1, totalPages = 0, auditList = [];
var channel = $('#channel').val();
var auditTrailTable =  $('#auditTrailList').dataTable({
	"iDisplayLength": 25,
	"aLengthMenu": [[25, 50, 75, 100, -1], [25, 50, 75, 100, "All"]],
	"bAutoWidth": false,
	"bSort": false,
    "bStateSave":true,
    "paging": false,
    "bInfo":false,
    "bFilter":false
});

function audit_getUsersList(){
	$.ajax({
	   dataType: 'JSON',
	   url: "users?channel_id="+channel,
	   async:false,
	   success: function(data) {
		   	if( $.isEmptyObject(data) ){
		   		console.log("Empty Audit Trail Users");
		   		$('#paginationTab').empty();
		   		return;
		   	}

		   	var usersList = data.users;
		   	var optionStr = "<option value='0'>--choose--</option>";
	        for (var i = 0; i < usersList.length; i++) {		  
	        	var user = usersList[i]      		;
	        	optionStr += "<option value='"+user._id+"'>"+user.username+"</option>";
	        }
		    $("#users").html(optionStr);
		},
		error: function(xhr, status, text) {
			comm_handleAjaxError(xhr);
		}
	});
}


audit_getUsersList();

	

function loadContent(pageNumber){
    var fromDate = $("#startDateFrom").val();
    var toDate = $("#startDateTo").val();
    var selUsr = $('#users').val();
    auditTrailTable.fnClearTable();
    defaultPage = pageNumber;
    
    var userId = -1;
    if(selUsr!=0){
    	userId = selUsr;
    }
    
    var url = "audit-trail-report?userId="+userId+"&channel_id="+channel+"&page="+defaultPage;
	if(!fromDate ||  !toDate){
		url += "&dateFlag=0&fromDate=None&toDate=None";
	} else {
		url += "&dateFlag=1&fromDate="+fromDate+"&toDate="+toDate;
	}

    $.ajax({
		dataType: 'JSON',
		url: url,
		async:false,
		success: function(data) {
			if(!data.auditTrailReport.length){
				console.log("Empty Audit List");
				$('#paginationTab').empty();
				return;
			}

	  		auditList = data.auditTrailReport;
	        for (var i = 0; i < auditList.length; i++) {
	        	var audit_channel_id = ""
	        	if (auditList[i]["channel_id"] != undefined){
				    		audit_channel_id = auditList[i]["channel_id"]
				    	} 
	        	var action_time = moment(auditList[i]['event_datetime'],"YYYY/MM/DD hh:mm:ss").format("DD/MM/YYYY hh:mm:ss");;

	        	auditTrailTable.fnAddData([auditList[i]['username'] || '',
	        		auditList[i]['description']+formatAuditData(auditList[i]['data']) || '',
	        		action_time || '',audit_channel_id]);
	        }
		},
		error: function(xhr, status, text) {
			comm_handleAjaxError(xhr);
		}
	});
}

function formatAuditData(data){
	var dataStr = "";
	if( $.isEmptyObject(data) ){
		return dataStr
	}
	dataStr = "<div class='audi_data_wrapper'>"
	for(var key in data){
		//skipping id's from dataTable content.
		if( key != "_id"){
			dataStr += "<span class='audit_key'>"+key+":</span> <span class='audit_value'>"+data[key]+"</span>";	
		}
	}
	dataStr += "</div>"
	return dataStr;
}


function loadDefaultAuditTrail(){
	$.ajax({
	    dataType: 'JSON',
	    url: "audit-trail-report?userId=-1&dateFlag=0&fromDate=None&toDate=None&page=1&channel_id="+channel,
	    async:false,	   
	    success: function(data) {
	    	$('#paginationTab').empty();
	   		if(!data.auditTrailReport.length){
	   			console.log("Empty Audit data Deafult.");
	   			$('#paginationTab').empty();
				return;
			}
	  		
	  		auditList = data.auditTrailReport;
	        for(var i = 0; i < auditList.length; i++) {
	        	var audit_channel_id = ''
	        	if (auditList[i]["channel_id"] != undefined){
				    		audit_channel_id = auditList[i]["channel_id"]
				    	} 
	        	var action_time = moment(auditList[i]['event_datetime'],"YYYY/MM/DD hh:mm:ss").format("DD/MM/YYYY hh:mm:ss");
	        	auditTrailTable.fnAddData([auditList[i]['username'] || '',
	        	auditList[i]['description']+formatAuditData(auditList[i]['data']) || '',
	        	action_time || '', audit_channel_id ||'']);
	        }
	        totalPages = data.totalPageCount;
	        var total_ln = auditList.length
			var total_audit = data.auditcount

			if(totalPages > 1){
		        $("#paginationTab").pagination({
			    	items: total_audit,
			    	itemsOnPage: total_ln,
			        pages : totalPages,
			        cssStyle: 'light-theme',
			        onPageClick: function(pageNumber, event){
	        			loadContent(pageNumber);          
	    		 	}
			    });
			}
	    },
	    error: function(xhr, status, text) {
			comm_handleAjaxError(xhr);
		}
	});
}
loadDefaultAuditTrail();

$(document).ready(function(){

	$('#filterResult').click(function(event) {

		auditTrailTable.fnClearTable();
		var fromDate = $('#startDateFrom').val();
		var toDate = $('#startDateTo').val();
		var selUsr = $('#users').val();
		var userId = -1;

	    if(selUsr!=0){
	    	userId = selUsr;
	    }
	    
		if(checkDates(fromDate,toDate)){
			var  url =  "audit-trail-report?userId="+userId+"&dateFlag=1&fromDate="+fromDate+"&toDate="+toDate+"&page=1&channel_id="+channel;
			$.ajax({
				async:false,	  
				dataType: 'JSON',
				url: url,
				success: function(data) {
					if(!data.auditTrailReport.length){
						console.log("Empty audit data in Filter");
						$('#paginationTab').empty();
						return;
					}

					auditList = data.auditTrailReport;
				    for(var i = 0; i < auditList.length; i++) {
                        var audit_channel_id = '' 
				    	var action_time = moment(auditList[i]['event_datetime'],"YYYY/MM/DD hh:mm:ss").format("DD/MM/YYYY hh:mm:ss");
				    	if (auditList[i]["channel_id"] != undefined){

				    		audit_channel_id = auditList[i]["channel_id"]
				    	} 
				    	auditTrailTable.fnAddData([auditList[i]['username'] || '',
				    		auditList[i]['description']+formatAuditData(auditList[i]['data']) || '',
				    		action_time || '', audit_channel_id || '']);
				    }
				    totalPages = data.totalPageCount;
				    var total_ln = auditList.length
				    var total_audit = data.auditcount;

				    $("#paginationTab").pagination({
				    	items: total_audit,
				    	itemsOnPage: total_ln,
				        pages : totalPages,
				        cssStyle: 'light-theme',
				        onPageClick: function(pageNumber, event){
		        			loadContent(pageNumber);          
		    		 	}
				    });
				},
				error: function(xhr, status, text) {
					comm_handleAjaxError(xhr);
				}
			});
		}

	});

	/* Table initialisation */  
	$('#auditTrailList').on("mouseover","tr",function(event){
		$(this).css({background:"#C8D9E8"});	  	
	});
	$('#auditTrailList').on("mouseout","tr",function(event){
		$(this).css({background:"#ffffff"}); 
	});
	 
	/* Highlight tab menu */
	$('ul#usertabmenu > li.current').removeClass('current');            
	$('#usertabmenu_user_list').addClass('current');

	$("#startDateFrom").datepicker({
		dateFormat : 'dd/mm/yy',
		maxDate: 0,
		showOn: "both",
		buttonImage: "images/calendar.gif",
		buttonImageOnly: true
	});

	$("#startDateTo").datepicker({
		dateFormat : 'dd/mm/yy',
		maxDate: 0,
		showOn: "both",
		buttonImage: "images/calendar.gif",
		buttonImageOnly: true
	});

	var h = $(window).height() - 220;
	$("#auditTrailList_wrapper").css({"max-height": h+"px", "overflow-x": "hidden", "overflow-y": "scroll"});

});