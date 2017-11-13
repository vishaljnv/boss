var title =null
var id;
var flag;
var date;
var d ;
var m ;
var y ;
jQuery(document).ready(function() {
	date = new Date();
	d = date.getDate();
	m = date.getMonth();
	y = date.getFullYear();
	// page is now ready, initialize the calendar...
	jQuery('#calendar').fullCalendar({
		timeFormat:'H:mm{ - H:mm}',	
		height: 450,
		header: {
			left: 'prev,next today',
			center: 'title',
			right: 'month,agendaWeek,agendaDay'
		},
		viewDisplay: function(view) {viewDisplay( view )},
		selectable: true,
		selectHelper: true,
		editable: true,
		select: function(start, end, allDay) {
			jQuery("#updateSpot").hide();
			jQuery("#addSpot").show();
			jQuery('#dialog').dialog('option', 'title', 'Add Spot');
			jQuery('#dialog').dialog('open');
			jQuery("#stylized").show();
				jQuery("#newTitle").val(title);
				jQuery("#newStart").val(convertDate(start));
				jQuery("#newEnd").val(convertDate(end));
				jQuery("#newAllDay").val("false");
		},

		eventClick: function(calEvent, jsEvent, view) {
			
			id = calEvent.id;
			//alert(calEvent.contractNum);
			jQuery('#contractNum_id "option[value='+ calEvent.contractNum +']"').attr('selected', 'selected');
			jQuery('#customer_id "option[value='+ calEvent.customer +']"').attr('selected', 'selected');
			jQuery("#spotLength").val(calEvent.spotLength);
			jQuery("#quantity").val(calEvent.quantity);
			jQuery("#position").val(calEvent.position);
			jQuery("#preemption").val(calEvent.preemption);
			jQuery("#rate").val(calEvent.rate);
			jQuery('#clientType_id "option[value='+ calEvent.clientType +']"').attr('selected', 'selected');
			jQuery('#spotType_id "option[value='+ calEvent.spotType +']"').attr('selected', 'selected');
			jQuery("#newTitle").val(calEvent.title);
			jQuery("#newStart").val(convertDate(calEvent.start));
			jQuery("#newEnd").val(convertDate(calEvent.end));
			
			jQuery("#newAllDay").val(calEvent.allDay);

		},

		  eventDrop:function(event,dayDelta,minuteDelta,allDay,revertFunc, date, allDay, jsEvent, ui ){
			 jQuery("a").removeAttr('href');
	            if (typeof event.id == "undefined"){
	                alert("This event can not be changed!");
	                revertFunc();
	                return false;
	            }
	            jQuery("#moveId").val(event.id);
	            jQuery("#moveDayDelta").val(dayDelta);
	            jQuery("#moveMinuteDelta").val(minuteDelta);
	            jQuery("#moveAllDay").val(allDay);
	            jQuery.ajax({
	            	url : "/spot-move",
					type : 'POST',
					data : jQuery("#spotFormMove").serialize(),
					dataType : "json",
					success : function(data) {
                        jQuery("#calendar").fullCalendar('refetchEvents');
					}
	            });
	            
	        },

	        eventResize: function(event,dayDelta,minuteDelta,revertFunc) {
	        	jQuery("a").removeAttr('href');
	            if (typeof event.id == "undefined"){
	                alert("This event can not be changed!");
	                revertFunc();
	                return false;
	            }
	            jQuery("#resizeId").val(event.id);
	            jQuery("#resizeDayDelta").val(dayDelta);
	            jQuery("#resizeMinuteDelta").val(minuteDelta);
//	            jQuery.post(jQuery("#eventFormResize").attr("action"), jQuery("#eventFormResize").serialize());
	            jQuery.ajax({
	            	url : "/spot-resize",
					type : 'POST',
					data : jQuery("#spotFormResize").serialize(),
					dataType : "json",
					success : function(data) {
                        alert(data.responseText);
                        
					}
	            });
	            
	        },
	    	events: {
				url:"/spots.json",
				cache: true
			},
			
});
	jQuery.contextMenu({
		selector: '.fc-event',//note the selector this will apply context to all events 
		trigger: 'left',
		callback: function(key, options) {
			var m = "clicked: " + key;
			window.console && console.log(m) || alert(m); 
		},

		items: {

			"edit": {
				name: "Edit", 
				icon: "edit", 
				// superseeds "global" callback
				callback: function(key, options) {
					editEvent(); 
				}
			},

			"delete": {
				name: "Delete", 
				icon: "edit", 
				// superseeds "global" callback
				callback: function(key, options) {
					deleteEvent(); 
				}
			}
		}
	});

	jQuery('.fc-event').on('click', function(e){
		console.log('clicked', this);
	});

	jQuery('#updateSpot').click(function(){ 
		flag =1;
	});
}); 

function viewDisplay( view ) {
	if(view.name === 'agendaDay' || view.name === 'agendaWeek') {
		var select = jQuery('<select class="schedule_change_slots input_select"/>')
		.append('<option value="1">1m</option>')
		.append('<option value="5">5m</option>')
		.append('<option value="10">10m</option>')
		.append('<option value="15">15m</option>')
		.append('<option value="30">30m</option>')
		.append('<option value="60">60m</option>').change(function(){
			var slotMin = jQuery(this).val();
			var opt = view.calendar.options;
			var date = jQuery('#calendar').fullCalendar('getDate');
			var month = jQuery('#calendar').fullCalendar('getMonth');
			opt.slotMinutes = parseInt(slotMin);
			opt.defaultView = view.name;
			opt.events = getFullCalendarEvents;
			//re-initialize calendar with new slotmin options
			jQuery('#calendar').fullCalendar('destroy').fullCalendar(opt).fullCalendar( 'gotoDate', date ).fullCalendar('refetchEvents');
		});
		var topLeft = jQuery(view.element).find("table.fc-agenda-days > thead th:first");
		select.width(topLeft.width()).height(topLeft.height());
		topLeft.empty().append(select);
		var slotMin = view.calendar.options.slotMinutes;
		jQuery('.schedule_change_slots option[value="'+slotMin+'"]').attr('selected', 'selected');
	}

}   

function spotId(){
	jQuery.ajax({
		url:'/spot/'+id+'/update',
		type: 'POST',
		data: jQuery("#spotForm").serialize() ,
		dataType: "json",
		success:function(data){
			
		}
	});
	jQuery("#calendar").fullCalendar('refetchEvents');
	jQuery('#overlay, #lightbox').hide();
}
function convertDate(date){
	return(date.getDate()+"."+(date.getUTCMonth()+1)+"."+date.getUTCFullYear()+" "+date.getHours()+":"+date.getMinutes());
}

function getFullCalendarEvents(start, end, callback) {
	var url, start_date, end_date;

	start_date = makeTimeStamp(start);
	end_date = makeTimeStamp(end);

	url:"/spots.json";

	var d = new Date();

	jQuery.post(url, {format: "json", start: start_date, end: end_date, cachep: d.getTime()}, function(json){
		callback(json.events);
	});
}

function makeTimeStamp(date){
	var sy, sm, sd, h, m, s, timestamp;
	sy = date.getFullYear();
	sm = date.getMonth() + 1;
	sd = date.getDate();
	h = date.getHours();
	m = date.getMinutes();
	s = date.getSeconds();

	timestamp = sy+"-"+ pad(sm, 2) +"-"+ pad(sd, 2) +" "+ pad(h, 2) +":"+ pad(m, 2) +":"+ pad(s, 2);
	return timestamp;
}


function deleteEvent(){
	jQuery.ajax({
		url:'/spot/'+id+'/delete',
		type: 'GET',
		dataType: "json",
		success:function(data){
		calendar.fullCalendar( 'removeEvents' , event.id  );
		}
	});

	jQuery("#calendar").fullCalendar('refetchEvents');
	jQuery('#overlay, #lightbox').hide();

}
function editEvent(){
	jQuery('#dialog').dialog('open');
	jQuery("#updateSpot").show();
	jQuery("#addSpot").hide();
	jQuery('#dialog').dialog('option', 'title', 'Edit Spot');
	
}