jQuery(function() {
	//This is the workaround dirty fix for @select scala scode (dropdownlists)	as the auto-generated label can't be easily styled
	var mandatory=" <span style='color:red'>*</span>";
		
	var customer = jQuery('label[for="customer_id"]');
	var user = jQuery('label[for="user_id"]');
	var spotType = jQuery('label[for="spotType_id"]');
	var startDate = jQuery('label[for="startDate"]');
	var endDate = jQuery('label[for="endDate"]');
	var spotName = jQuery('label[for="spotName"]');
	var priority = jQuery('label[for="priority_id"]');
	
	customer.text(customer.text()).append(mandatory);
	user.text(user.text()).append(mandatory);
	spotType.text(spotType.text()).append(mandatory);
	startDate.text(startDate.text()).append(mandatory);
	endDate.text(endDate.text()).append(mandatory);
	spotName.text(spotName.text()).append(mandatory);
	priority.text(priority.text()).append(mandatory);
});

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
    var startDate = jQuery("#startDate").datepicker('getDate');
    var endDate = jQuery("#endDate").datepicker('getDate');
    
    if( !startDate || !endDate){
        return false;
    }

    if(endDate >= startDate) {
        return true;

    } else {
        var endTime = endDate.getTime() + jQuery('#endDate').parseValToNumber();
        var startTime = startDate.getTime() + jQuery('#startDate').parseValToNumber();
        return endTime > startTime;
    }
}


jQuery.fn.parseValToNumber = function() {
    return parseInt(jQuery(this).val().replace(':',''), 10);
}

    jQuery('select').change(function(){
       jQuery('#startDate, #endDate').keyup()
    })

jQuery("#startDate").datepicker({
    dateFormat: 'dd/mm/yy',
    minDate: 0,
    showOn: "both",
    buttonImage: 'assets/jquery-ui/development-bundle/demos/images/calendar.gif',
    buttonImageOnly: true,
    onSelect:function(){
    	jQuery(this).valid(); 
        if(jQuery(this).hasClass('error')){
          jQuery(this).trigger('keyup')
        }
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
    onSelect:function(){
        if(jQuery(this).hasClass('error')){
          jQuery(this).trigger('keyup')
        }
        jQuery(this).valid(); 
    },
   	onClose: function(selectedDate) {
        //jQuery("#startDate").datepicker("option", "maxDate", selectedDate);
    }
});

////////////////////////////////////////////////////////////////////////////////////////////////////////
function daypartSpotsDefaultCount() {
	/****Monday****/
	var monCount = new Array();
	var totalMonCount = 0;
	var i=0;
	$(".monday").each(function() {
		if($(this).val()==''){
			monCount.push(0);
		}else{
			monCount.push($(this).val());
		}	
		i++;
	});
	for(var i in monCount) { totalMonCount += parseInt(monCount[i]); }
	$('#monCount').html("("+totalMonCount+")");

	/****Tuesday****/
	var tueCount = new Array();
	var totalTueCount = 0;
	var i=0;
	$(".tuesday").each(function() {
		if($(this).val()==''){
			tueCount.push(0);
		}else{
			tueCount.push($(this).val());
		}	
		i++;
	});
	for(var i in tueCount) { totalTueCount += parseInt(tueCount[i]); }
	$('#tueCount').html("("+totalTueCount+")");
	
	/****Wednesday****/
	var wedCount = new Array();
	var totalWedCount = 0;
	var i=0;
	$(".wednesday").each(function() {
		if($(this).val()==''){
			wedCount.push(0);
		}else{
			wedCount.push($(this).val());
		}	
		i++;
	});
	for(var i in wedCount) { totalWedCount += parseInt(wedCount[i]); }
	$('#wedCount').html("("+totalWedCount+")");
	
	/****Thursday****/
	var thrCount = new Array();
	var totalThrCount = 0;
	var i=0;
	$(".thursday").each(function() {
		if($(this).val()==''){
			thrCount.push(0);
		}else{
			thrCount.push($(this).val());
		}	
		i++;
	});
	for(var i in thrCount) { totalThrCount += parseInt(thrCount[i]); }
	$('#thuCount').html("("+totalThrCount+")");
	
	/****Friday****/
	var friCount = new Array();
	var totalFriCount=0;
	var i=0;
	$(".friday").each(function() {
		if($(this).val()==''){
			friCount.push(0);
		}else{
			friCount.push($(this).val());
		}	
		i++;
	});
	for(var i in friCount) { totalFriCount += parseInt(friCount[i]); }
	$('#friCount').html("("+totalFriCount+")");
	
	/****Saturday****/
	var satCount = new Array();
	var totalSatCount=0;
	var i=0;
	$(".saturday").each(function() {
		if($(this).val()==''){
			satCount.push(0);
		}else{
			satCount.push($(this).val());
		}	
		i++;
	});
	for(var i in satCount) { totalSatCount += parseInt(satCount[i]); }
	$('#satCount').html("("+totalSatCount+")");
	
	/****Sunday****/
	var sunCount = new Array();
	var totalSunCount=0;
	var i=0;
	$(".sunday").each(function() {
		if($(this).val()==''){
			sunCount.push(0);
		}else{
			sunCount.push($(this).val());
		}	
		i++;
	});
	for(var i in sunCount) { totalSunCount += parseInt(sunCount[i]); }
	$('#sunCount').html("("+totalSunCount+")");
}



