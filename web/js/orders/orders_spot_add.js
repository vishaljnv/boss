jQuery(function() {
	//This is the workaround dirty fix for @select scala scode (dropdownlists)	as the auto-generated label can't be easily styled
	var mandatory=" <span style='color:red'>*</span>";
		
	var customer = jQuery('label[for="customer_id"]');
	var user = jQuery('label[for="user_id"]');
	var spotType = jQuery('label[for="spotType_id"]');
	var priority = jQuery('label[for="priority_id"]');
	
	customer.text(customer.text()).append(mandatory);
	user.text(user.text()).append(mandatory);
	spotType.text(spotType.text()).append(mandatory);
	priority.text(priority.text()).append(mandatory);
	
});

function getCommericals(){
	var customerId = jQuery('#customer_id').val();
	if(customerId!=""){
		var id = 0;
		dataString = "id=" + id + "&customer_id="+ jQuery('#customer_id').val();
		jQuery.ajax({
			
			type : "GET",
			url : "/order/" + dataString + "/getCommercials",
			success : function(data) {
				//showPopUpOrder('order_add_dialog',"Clip details");
				var getArr={
						 width : 700,
						 height : 500,
						 modal : true,
						 title: 'Clip details',                     
						 close: function(event, ui) {
							//jQuery('html').css({'overflow-y':'visible','overflow-x':'hidden'});
							jQuery(this).dialog ('destroy').remove();
						 }
				};
				
				$('<div id="order_add_dialog" class="gallery clipmodalAdd"></div>').dialog(getArr);
				jQuery("#order_add_dialog").html(data);
			}
		});
	}else{
		alert("Please select a customer before selecting commercial.");
	}
}

/*jQuery("#clipId").click(function() {
	
})*/;


jQuery.validator.addMethod("customFloat", function(value, element) {
	//var RE = ^\d*\.?\d{0,2}$/;
	 var RE = /^\d*\.?\d*$/;
   	if(RE.test(value)){
   		return true;
    }
   	else{
    	return false;
    }
}, "Value should be numeric"); 

/*Order add and validate*/
jQuery("#orders_add_form").validate({
	//The errorPlacement doesn't append the error placement <label> tag. 
			   errorClass: 'error',
			    validClass: 'valid',
				errorPlacement: function(error, element) { 
					 // Set positioning based on the elements position in the form
			        var elem = $(element),
			            corners = ['right center', 'left center'],
			            flipIt = elem.parents('span.right').length > 0;

			        // Check we have a valid error message
			        if (!error.is(':empty')) {
			            // Apply the tooltip only if it isn't valid
			            elem.filter(':not(.valid)').qtip({
			                overwrite: false,
			                content: error,
			                position: {
			                    my: corners[flipIt ? 0 : 1],
			                    at: corners[flipIt ? 1 : 0],
			                    viewport: $(window)
			                },
			                show: {
			                    event: 'click mouseenter',
			                    ready: true
			                },
			                hide: {
			                	event: 'unfocus'
			                },
			                events: {
			                    hide: function(event, api) {
			                    	$(this).qtip('destroy');
			                    }
			                },
			                style: {
			                    classes: 'qtip-red' // Make it red... the classic error colour!
			                }
			            }) // If we have a tooltip on this element already, just update its content
			            .qtip('option', 'content.text', error);
			        } // If the error is empty, remove the qTip
			        else {
			            elem.qtip('destroy');
			        }
				},
				success: function(error) {
			        // Hide tooltips on valid elements
			        setTimeout(function() {
			        	jQuery("#orders_add_form").find('.valid').qtip('hide');
			        }, 1);
			        
			        //success: $.noop // Odd workaround for errorPlacement not firing!
			    },
	submitHandler: function(form_obj) {
		var form = jQuery('#orders_add_form');
	//	alert("Submit----");
		var startDate = $('#startDate').val();
		var endDate = $('#endDate').val();
    	var customerId = $('#customer_id').val();
    	var commercialsId = $('.commercialsId').val();
    	
    	var prgm = $("#program_name").val();
    	
    	//alert("CommercialId---------"+commercialId);
    	
    	var sdate_res = checkIfOrderExists(customerId,commercialsId,startDate);
    	var edate_res = checkIfOrderExists(customerId,commercialsId,endDate);
    	
    	
    	//orderDateCheck('startDate');
		//orderDateCheck('endDate');
		
    	if(sdate_res) {
    		jQuery('#startDate').addClass('error');
    	}
    	else {
    		jQuery('#startDate').valid(); 
            if(jQuery('#startDate').hasClass('error')){
              jQuery('#startDate').removeClass('error');
              jQuery('#startDate').trigger('keyup')
            }
    	}
    	if(edate_res) {
    		jQuery('#endDate').addClass('error');
    	}
    	else {
    		jQuery('#endDate').valid(); 
            if(jQuery('#endDate').hasClass('error')){
              jQuery('#endDate').removeClass('error');
              jQuery('#endDate').trigger('keyup')
            }
    	}
    	
		if(!sdate_res && !edate_res){
			jQuery.ajax({
				type: "POST",
				url: "/order/addOrderItem",
				data: form.serialize() +"&program="+prgm,
				beforeSend: function() {
					$('.saveBtn').attr('disabled', 'disabled');
					$('.saveBtn').text('processing...');
				},
				success: function(data) {
					jQuery('#main').html(data);
					$('.saveBtn').removeAttr('disabled');
				},
				error: function() {
					alert("Error in request...");
				}
			});
		}	
	},
	rules: {
		"customer.id": {required:true},
		"user.id": {required:true},
		"spotName": {required:true},
		"spotType.id": {required:true},
		"priority.id":{required:true},
		"clipId": {required:true},
		startDate: {required:true},
		endDate: {required:true,checkDates:true},
		"monday": {required:false,number:true},
		"tuesday": {required:false,number:true},
		"wednesday": {required:false,number:true},
		"thursday": {required:false,number:true},
		"friday": {required:false,number:true},
		"saturday": {required:false,number:true},
		"sunday": {required:false,number:true},
		"orderSpotType": {required:true}
	},
	messages:{
		"customer.id":"select customer",
		"spotName":"Enter spot name",
		"user.id":"Select sales person",
		"priority.id":"Select priority",
		startDate:"Enter start date",
		endDate:"Enter end date",
		"clipId":"Select clip"
		
	}

});

//jQuery.validator.messages.required = "error";
jQuery("#orders_add_form").validate();

jQuery(".cancel").click(function() {
	jQuery.ajax({
		
		url: "/order/listOrderItems",
		success: function(data) {
			jQuery('#main').html(data);
		}
	});
}); 


//Date time validation for range selection (i.e End date should be greater than start date)
jQuery.validator.addMethod("checkDates", function(value, element) { 
  return  compareDates() ;
}, "End date/time must be greater than start date");


function compareDates() {
    var startDate = $("#startDate").datepicker('getDate');
    var endDate = $("#endDate").datepicker('getDate');
    
    if( !startDate || !endDate){
        return false;
    }

    if(endDate >= startDate) {
        return true;

    } else {
        var endTime = endDate.getTime() + $('#endDate').parseValToNumber();
        var startTime = startDate.getTime() + $('#startDate').parseValToNumber();
        return endTime > startTime;
    }
}


jQuery.fn.parseValToNumber = function() {
    return parseInt(jQuery(this).val().replace(':',''), 10);
}

jQuery('select').change(function(){
       jQuery('#startDate, #endDate').keyup();
})

$('#customer_id').change(function(){
  $('.clipId').val('').removeClass('valid');
  $('#gridview').remove();
});

function orderDateCheck(sOrEdate){
    	var date = $('#'+sOrEdate).val();
    	var customerId = $('#customer_id').val(); 
    	var commercialsId = $('.commercialsId').val();
    	
    	var result = checkIfOrderExists(customerId,commercialsId,date);
    	//console.log("date: " + date + " result: " + result);
    	if(result) {
    		jQuery('#'+sOrEdate).addClass('error');
    	}
    	else {
    		jQuery('#'+sOrEdate).valid(); 
            if(jQuery('#'+sOrEdate).hasClass('error')){
              jQuery('#'+sOrEdate).removeClass('error');
              jQuery('#'+sOrEdate).trigger('keyup')
            }
            //total number of days spots is been ordered
            set_total_days();
    	}
 }

jQuery("#startDate").datepicker({
    dateFormat: 'dd/mm/yy',
    minDate: 0,
    showOn: "both",
    buttonImage: 'assets/jquery-ui/development-bundle/demos/images/calendar.gif',
    buttonImageOnly: true,
    onSelect:function() {
    	//orderDateCheck('startDate');
    },
    onClose: function(selectedDate) {
        jQuery("#endDate").datepicker("option", "minDate", 1);
    }
});
    
jQuery("#endDate").datepicker({
    dateFormat: 'dd/mm/yy',
    minDate: 0,
    showOn: "both",
    buttonImage: 'assets/jquery-ui/development-bundle/demos/images/calendar.gif',
    buttonImageOnly: true,
    onSelect:function() {
    	//orderDateCheck('endDate');
    },
    onClose: function(selectedDate) {
        jQuery("#startDate").datepicker("option", "maxDate", selectedDate);
    }
});

//Date validation ends

function checkIfOrderExists(cust_id,commercial_id,date) {
	var result;
	$.ajax({
		
		type:'GET',
		async:false,
		url:'/order/checkIfOrderExists',
		data:"&cust_id="+cust_id+"&commercial_id="+commercial_id+"&date="+date,
		success: function(res){
			result = res;
			if(res) 
			{
				jAlert("Order already exists for this date & clip.! Please choose other");
			}
		}
	});
	return result;
}

//Reset to defaults if no selection
function defaultValues(){
	$.ajax({
		
		dataType: "json",
		url: '/user/salesDropdown',
		async:false,
		success: function( result) {
	    	salesJson = result;
	    	var options = '<option value="">-- Choose One--</option>';
			$.each( salesJson, function( key, value ) {
		    	options += '<option value="' + key + '">' + value + '</option>';
		    });
		    $("#user_id").html(options);
		}
	});
}

