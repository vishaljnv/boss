/*jQuery(".clipId").click(function() {
	var customerId = jQuery('#customer_id').val();
	if(customerId!=""){
		dataString = "id="+id+"&customerId="+jQuery('#customer_id').val();
		jQuery.ajax({
			type : "GET",
			url : "/order/" + dataString + "/getCommercials",
			success : function(data) {
				jQuery(".clipmodal").html(data);
			}
		});
		jQuery(".clipmodal").dialog({
			width : 800,
			height : 500,
			modal : true,
			autoOpen : false,
			title : "Clip Details",
			close:function(){
			}
		});
		jQuery(".clipmodal").dialog('open');
	}else{
		alert("Please select a customer before selecting commercial.");
	}
});
*/

function showPopUpOrder(id,header){
    $("#"+id).dialog(getDialogStyleOrder(id,header));
    $('html').css({'overflow':'hidden'});
}

function getDialogStyleOrder(id,header){
   var getArr={
		 width : 700,
		 height : 500,
		 modal : true,
		 title: header,                  
		 close: function(event, ui) {
			jQuery('html').css({'overflow-y':'visible','overflow-x':'hidden'});
			//jQuery(this).dialog ('destroy');
		 }
   };
   return getArr;
}

//set dropdown width
$('select.minsBtwnSpots').css('width','25%');

//total spot counts for weekdays dayparts
function daypartSpotsCount() {
	jQuery('.monday').change(function() {
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
		//totalMonCount=eval(monCount.join('+'));
		for(var i in monCount) { totalMonCount += parseInt(monCount[i]); }
		$('#monCount').html("("+totalMonCount+")");
	 });

	jQuery('.tuesday').change(function() {
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
		//totalTueCount=eval(tueCount.join('+'));
		for(var i in tueCount) { totalTueCount += parseInt(tueCount[i]); }
		$('#tueCount').html("("+totalTueCount+")");
	 });

	jQuery('.wednesday').change(function() {
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
		//totalWedCount=eval(wedCount.join('+'));
		for(var i in wedCount) { totalWedCount += parseInt(wedCount[i]); }
		$('#wedCount').html("("+totalWedCount+")");
	 });

	jQuery('.thursday').change(function() {
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
		//totalThrCount=eval(thrCount.join('+'));
		for(var i in thrCount) { totalThrCount += parseInt(thrCount[i]); }
		$('#thuCount').html("("+totalThrCount+")");
	 });

	jQuery('.friday').change(function() {
		var friCount = new Array();
		var totalFriCount = 0;
		var i=0;
		$(".friday").each(function() {
			if($(this).val()==''){
				friCount.push(0);
			}else{
				friCount.push($(this).val());
			}	
			i++;
		});
		//totalFriCount=eval(friCount.join('+'));
		for(var i in friCount) { totalFriCount += parseInt(friCount[i]); }
		$('#friCount').html("("+totalFriCount+")");
	 });

	jQuery('.saturday').change(function() {
		var satCount = new Array();
		var totalSatCount = 0;
		var i=0;
		$(".saturday").each(function() {
			if($(this).val()==''){
				satCount.push(0);
			}else{
				satCount.push($(this).val());
			}	
			i++;
		});
		//totalSatCount=eval(satCount.join('+'));
		for(var i in satCount) { totalSatCount += parseInt(satCount[i]); }
		$('#satCount').html("("+totalSatCount+")");
	 });

	jQuery('.sunday').change(function() {
		var sunCount = new Array();
		var totalSunCount = 0;
		var i=0;
		$(".sunday").each(function() {
			if($(this).val()==''){
				sunCount.push(0);
			}else{
				sunCount.push($(this).val());
			}	
			i++;
		});
		//totalSunCount=eval(sunCount.join('+'));
		for(var i in sunCount) { totalSunCount += parseInt(sunCount[i]); }
		$('#sunCount').html("("+totalSunCount+")");
	 });
		 
}


function set_total_days(){
	//total number of days spots is been ordered
	var sDate = jQuery("#startDate").val();
	var eDate = jQuery("#endDate").val();
	if(sDate!='' && eDate !=''){
		var totalDays = days_between(sDate,eDate);
	    jQuery('#totalDays').text(totalDays);
	}
}

function set_total_count(sel){
	var totalCount = 0;
	var totalGross = 0;
	//console.log($('#'+sel).html());
	$('#'+sel).each(function () {
		var spot = 0;
		spot = $(this).val() || 0
		//console.log("next Rate: " + $(this).parent().html());
		var next = $(this).next().text();
		var rate =  next.split('₹')[1] | 0;
		totalCount = totalCount + parseInt(spot);
		totalGross = totalGross + (parseInt(spot) * parseInt(rate));
		//console.log("next Rate: " + next);
	});
	jQuery('#totalSpots').text(totalCount);
	jQuery('#totalGross').text(totalGross);
}

function set_total_gross(sel){
	//alert(sel);
	/* var totalGross = 0;
	var spot = 0,rate = 0;
	var ele = $('#dpTable input[type=text]');
	ele.each(function (i) {
		spot = $(this).val() || 0;
		var next = $(this).next().text();
		var rate =  next.split('₹')[1] | 0;
		console.log($(next).text());
		console.log("next Rate: " + next+" "+rate);
		totalGross = totalGross + (parseInt(spot) * parseInt(rate));
	});
	jQuery('#totalGross').text(totalGross);*/
}
