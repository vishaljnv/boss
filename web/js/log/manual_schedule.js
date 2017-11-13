var programs = [];

var col_exp = {};
var hasLocalStorage = false;
$(document).ready(function() {
	if (typeof(Storage) !== "undefined") {
    	hasLocalStorage = true;
    	localStorage.setItem('col_exp', JSON.stringify({}));
	}

$('#ms_brkDuration').timepicker({ 'timeFormat': 'H:i:s','scrollDefaultNow': true, 'minTime':'00:00:30','step': .5,'maxTime':'00:40:00'});
$('#ms_brkStartTime').timepicker({ 'timeFormat': 'H:i:s','scrollDefaultNow': true, 'minTime':'00:10:00','step': 10});

	//console.log("readyyyyyyyyyy")
	if($.cookie("prgm_id")!=null){
		  $("#program_id").val($.cookie("prgm_id"));
		
		} 
	 prgmId = $("#program_id").val();	
	 
	 get_program_details(prgmId);
	 getProgramListsForDropDown();
	 //get_program_break_details(prgmId);
	 //get_commercials();
	 //create_slot_node();

	$("#filter_input").on('keypress', function(event){
		if(event.keyCode == 13){
			$("#filter_commercial").trigger('click');
		}
	});


	
	$("#filter_commercial").on("click", function(){
		var active_nav_menu = $("#ms_advt_types").val();
		$("#filter_input").focusout();
	 	var keyword = $("#filter_input").val();
	 	keyword = keyword.trim();
	 	if(keyword){
		 	url = "/manual_unallocated?status=active&channel_id="+channel+"&start_time="+schedule_program.start_time+"&keyword="+encodeURIComponent(keyword)+
	       "&end_time="+schedule_program.end_time+"&date="+formatDate(schedule_program.start_date);

	        if(active_nav_menu){
	        	url += "&advt_type="+active_nav_menu;
	        }
	        
	       	$.ajax({
				dataType: 'JSON',
				url: url,
				global: true,
				success: function(data) {
					if(!data){
						return;
					}
					//  promo_list = [];
					//  psa_list = [];
					//  clip_list = [];
				   	setUnallocatedSlots(data.manual_unallocated, active_nav_menu);
				   	loadUnallocatedSlots();
				   	$(".ms_unallocated_slots").hide();
				   	console.log("#"+active_nav_menu+"_list");
				   	$("#"+active_nav_menu+"_list").show();
				   	$("#filter_input").val('');

				}, 
				error: function(data){
					get_program_details($("#program_id").val());
				   	$(".ms_unallocated_slots").hide();
				   	$("#"+active_nav_menu+"_list").show();
				}
			});
		} else {
			get_program_details($("#program_id").val());
			$(".ms_unallocated_slots").hide();
			$("#"+active_nav_menu+"_list").show();
		}
	 });

	 $("#refresh_program_details").click(function(){
	 	get_program_details($("#program_id").val());
	 });

	$("#brk_add_form_btn").click(function(){
		$(".ms_add_brk_from_wrapper").toggle(200);
	});

	$("#ms_saveBreaks").click(function(){
		var name = ($("#ms_brkName").val()).trim();
		var start_time = $("#ms_brkStartTime").val();
		var dur = $("#ms_brkDuration").val();

		if(name && start_time && dur){

		}


	});

});


function get_slot_details(slot_id){
	slot_details = {};
	$.each(proposed_slots, function(sub_break, p_slots) {
		for(i=0;i<p_slots.length;i++){
			if(slot_id==p_slots[i]['_id'])
			{
				slot_details = p_slots[i];
			}
			
		}
	})
	return slot_details;
}

$(document).on("click",".del_slot", function(event){
		event.stopImmediatePropagation();
		//console.log("delete slot");
		p_slot_id = this.id;
        p_slot_del_id =  p_slot_id.split("_"); 
		var url = "/proposed_schedule/" + p_slot_del_id[1];
		// console.log("DELETE SLOT: "+url);
       $.ajax({
        	url : url,
		    type : 'DELETE',
		    success : function(data) {	

		    	 //console.log("delete sucess blk::::")

			     $("#s_"+p_slot_del_id[1]).remove();

			     
                 //src_pos = source_slot['position']
                 //sub_break_pslots = [];
                 //console.log(source_slot['sub_break']);
                 //sub_break_pslots = proposed_slots[source_slot['sub_break']];

                 //old_pos_index = sub_break_pslots.length - 1;
                 //new_pos_index =  source_slot['position'] - 1;

               
                 //temp_slots_list = [];
			     //update_slots_above(new_pos_index,old_pos_index,sub_break_pslots)
                
                /* n = 0
			     while(n!=src_pos-1 && n < sub_break_pslots.length){
			     	
			     	temp_slots_list.push(sub_break_pslots[n])
			     	n ++ ;
			     }*/

			     //set_clip_start_end_time();

			     get_program_details(prgmId);
                                             

						     
					    }
			       })
		return false;
})

channel = $("#channel").val();

var schedule_program, proposed_slots, dd_mm_yy_date, temp_slots_list;
drag_slot = undefined, alloc_slot_drag = undefined;

function alloc_slot_drag_event(event){
	from_sub_brk = $("#"+event.target.id).closest('div').prop('id');
	// console.log("ALLOC DRAG START");
}

function alloc_slot_drag_start(event){
	//Below line required to make drag/drop working in IE and Firefox
	event.dataTransfer.setData('text', event.target.id);  
}

function comm_drag_end(event) {
	event.preventDefault();
	$('.placeholder').remove();
	$(".each_comm").removeClass("draging_item");
}


//Function to execute after completion/'End' of drag
function alloc_slot_drag_end(event) {
	$('.placeholder').remove();
    alloc_slot_drag =  event.target.id;
    target_brk = $(event.target).closest('div').prop('id');
    var drag_slot_id = alloc_slot_drag, target_brk_id = target_brk;

    var idx = parseInt($(event.target).attr('position'));
    target_old_idx = idx;

   /* if(from_sub_brk && to_sub_brk){
	    if(from_sub_brk != to_sub_brk){
	    	jAlert("Reordering Slots across two Breaks is not allowed");
	    	return;
	    }
	}*/

    if(from_sub_brk == to_sub_brk && target_old_idx == target_idx){
    	console.log("=== No Change In Position => returning with no action ====");
    	return;
    } else {
    	if(target_old_idx < target_idx && from_sub_brk == to_sub_brk){
    		target_idx = target_idx - 1;
    	}
    	reorder_existing_proposed_schedule(alloc_slot_drag, from_sub_brk, to_sub_brk, target_old_idx, target_idx);
    }
    target_idx = null, target_old_idx = null, to_sub_brk = null, from_sub_brk = null; //reset all to null after drag end.
}

//Function to execute on 'Hover' of any sortable list.
var target_idx = null, to_sub_brk = null, from_sub_brk = null, target_old_idx = null;
function alloc_slot_drag_over(event){
	$('.placeholder').remove(); //remove old drop placeholder

	alloc_slot_drag = $(event.target).attr('id');
    if(alloc_slot_drag!=undefined){
	    drag_slot_details = alloc_slot_drag.split("_");
	    clip_id = drag_slot_details[1];
	    com_details = clip_details_map[clip_id];
    

	    target_brk = $(event.target).closest('div').prop('id');
	    target_idx = parseInt($(event.target).attr('position'));
	    to_sub_brk = target_brk;
	   
    	var drop_placeholder_span = '<span class="placeholder"> Inserting at position: '+(target_idx+1)+'</span>';
    	$("#"+event.target.id).after(drop_placeholder_span); //add new placeholder for drop
   }
}

function allow_alloc_slot_end(event){
    $('.placeholder').remove();
}

//drop 
function drop_alloc_slot(event){
	if(alloc_slot_drag!=undefined && event.target.id!=undefined){
		src_slot_id = alloc_slot_drag.split("_")[1];
		tar_slot_id = event.target.id.split("_")[1];
	 	re_order_slots(tar_slot_id,src_slot_id);
	 	get_program_break_details(prgmId);
	 	alloc_slot_drag = undefined;
	 	return false;
	}
}

function allow_drop_on_brk(event) {
    event.preventDefault();
    var drop_brk_id = $(event.target).closest('.brk_bg').attr('id');

    if(drop_brk_id){
    	$(".placeholder").remove();

    	var drop_placeholder_span = '<span class="placeholder"> Inserting at position: 1</span>';
    	$("#"+drop_brk_id).after(drop_placeholder_span);
    	target_idx = 0;
    }

    //set target_brk => for break which has Zero slots.
    target_brk = $(event.target).closest('div').prop('id');
    to_sub_brk = target_brk;
} 

function drag_commercial(event){
	//Below line required to make drag/drop working in IE and Firefox
    event.dataTransfer.setData("text", event.target.id);
  
  drag_slot = event.target.id;
  if(!drag_slot){
  	drag_slot = $(event.target).closest('.each_comm').attr('id');
  }
  $("#"+drag_slot).addClass("draging_item");
}

function drop_commercial(event) { 
	console.log("DROP commercial");
    event.preventDefault();

	// console.log($(event.target).closest('div'));
	target_brk = $(event.target).closest('div').prop('id');
	to_sub_brk = target_brk;

	$(".placeholder").remove(); // remove only after taking its closest div ID
	// console.log(drag_slot+" :: "+target_idx);

	if(drag_slot!=undefined){
	    drag_slot_details = drag_slot.split("_");
	    clip_id = drag_slot_details[1];

	    com_details = clip_details_map[clip_id];
	    if(com_details == undefined){
	    	return;
	    }

	    clip_name = com_details.clip_name;
	    clip_dur = com_details.duration;

	    if(clip_name!=undefined && clip_name.length>50){
	        clip_name = clip_name.substring(0,50)+"...";
	    }

		inserted_slot = insert_proposed_schedule(clip_id,target_brk,target_idx);
   }
   drag_slot = undefined;
	return;
   
}

function add_new_proposed_schedule_with_position(clip_id,tar_brk_id, position){
	brk_id = "", sub_break = 0, slot_data = {};
	if( $("#program_id").val() == undefined || position == undefined || tar_brk_id == undefined){
		return
	}

    var brk_info = tar_brk_id.split("_"); //local variable
    brk_id = brk_info[1]
    sub_break = brk_info[2];
	com_details = clip_details_map[clip_id];

	slot_data["sub_break"] =  sub_break;
	slot_data["break_id"] =  brk_id;
	slot_data["clip_name"] =  com_details.clip_name;
	slot_data["commercial_id"] = com_details.clip_id;
	slot_data["program_id"] =  $("#program_id").val();
	slot_data["position"] =  position;

	console.log("============= DROP COMMERCIAL : Insert new ==================");
	console.log(slot_data);
}

function reorder_existing_proposed_schedule(slot_id, from_sub_break, to_sub_break, from_idx, to_idx){
	slot_data = {};
	com_details = {};
	if(slot_id == undefined || from_sub_break == undefined || to_sub_break == undefined || from_idx == undefined || to_idx == undefined || isNaN(to_idx)){
		target_idx = null, target_old_idx = null, to_sub_brk = null, from_sub_brk = null; //reset all to null after drag end.
		console.log(slot_id+" : "+from_sub_brk+" : "+to_sub_brk+" : "+from_idx+" : "+to_idx);
		console.log("==== Some parameter is undefined/NaN in reorder_existing_proposed_schedule() ====");
		return;
	}

	console.log(from_sub_brk+" => TO => "+to_sub_break);
	var clip_id = slot_id.split("_")[1];
	var brk_info = from_sub_break.split("_"); //local variable
    brk_id = brk_info[1];
    from_sub_break_id = brk_info[2];
    to_sub_break_id = to_sub_break.split('_')[2];

	var item = proposed_slots[from_sub_break_id]; //get dragged item info
	console.log("from_sub_break_id:::::"+from_sub_break_id)
	if(item.length){
    	com_details =  item[from_idx-1];
    }

    console.log(from_idx+" : "+to_idx+" : "+item.length);
    // console.log(from_sub_brk+" == ............"+to_sub_brk);

    if(item.length == (to_idx+1) && 
    	from_sub_brk == to_sub_brk && 
    	from_idx == (to_idx+1) ){
    	console.log(item.length+" == "+(to_idx+1)+" :: "+from_sub_brk+" == "+to_sub_brk);
    	console.log("======= Same From and To Position: returning before reorder ======");
    	return;
    }

	if(!com_details){
		console.log("undefined commercial details OR same from and to position");
		target_idx = null, target_old_idx = null, to_sub_brk = null, from_sub_brk = null; //reset all to null after drag end.
		return;
	}

	slot_data["from_sub_break"] =  parseInt(from_sub_break_id);
	slot_data["to_sub_break"] =  parseInt(to_sub_break_id);
	slot_data["break_id"] =  brk_id;
	slot_data["clip_name"] =  com_details.clip_name;
	slot_data["commercial_id"] = com_details.commercial_id;
	slot_data["program_id"] =  $("#program_id").val();
	slot_data["from_position"] =  from_idx;
	slot_data["to_position"] =  to_idx+1;
	slot_data['slot_id'] = slot_id.split('_')[1];

	console.log("============== DRAG END : Reorder ==================");
	// console.log(slot_data['to_position']);
	console.log(slot_data);

	url = 'reorder_proposed_schedule'
     $.ajax({
		url : url,
		type : 'PUT',
		data : JSON.stringify(slot_data),
		success : function(data) {	
			console.log("Sorting completed");
			get_program_break_details(schedule_program._id);
			update_rem_alloc(to_sub_brk);
			target_idx = null, target_old_idx = null, to_sub_brk = null, from_sub_brk = null; //reset all to null after drag end.
		}, 
		error: function(data){
			console.log("Error while sorting slots..");
			target_idx = null, target_old_idx = null, to_sub_brk = null, from_sub_brk = null; //reset all to null after drag end.
		}
	});
}

var slot_data ;
function insert_proposed_schedule(clip_id,tar_brk_id, position){
	//console.log("insert proposed slotttttttttttttt:::::::::::::::::"+tar_brk_id);

	//alert("insert slot");
	//console.log(JSON.stringify(program))
     brk_id = "";
     sub_break = 0;
	 if(tar_brk_id!=undefined){
        brk_id = tar_brk_id.split("_")[1];
        sub_break = tar_brk_id.split("_")[2];
    }
     //console.log("sub_break:::::::::::"+sub_break);
	slot_data = {};
	com_details = clip_details_map[clip_id];
	console.log("COMMMMMMMMMMM"+JSON.stringify(com_details));
	var advt_type = 'commercial';
	slot_data["commercial_id"] = com_details.commercial_id;
	slot_data["order_id"] =  com_details.order_id;
	slot_data["program_id"] =  schedule_program._id;
	slot_data["duration"] =  com_details.duration;
	slot_data["order_duration"] = com_details.order_duration;
	slot_data["dp_start_time"] = com_details.dp_start_time;
	slot_data["dp_end_time"] = com_details.dp_end_time;
	slot_data["break_bumper"] = com_details.break_bumper;
	slot_data["sub_break"] = parseInt(sub_break);
	slot_data["schedule_type"] = "manual";
	if(com_details.duration!=null)
	slot_data["duration"] =  com_details['duration'];
	if(com_details.customer_id!=null){
		slot_data["customer_id"] = com_details.customer_id
		//slot_data["customer_name"] = com_details.customer_name;
	}
	if (com_details.customer_name !=null){
		slot_data["customer_name"] = com_details.customer_name
	}
    if(com_details.rate!=null)
    	slot_data['rate'] = com_details.rate
    prg_date = schedule_program.start_date.split("/");
    sch_date = prg_date[2] + "/"  + prg_date[1] + "/" +prg_date[0]
	slot_data["date"] = sch_date;
	
	slot_data["break_id"] =  brk_id;
	slot_data["clip_name"] =  com_details['clip_name'];
	slot_data["channel_id"] = channel;
	slot_data["advt_type"] = com_details.advt_type; 

    set_break_details(sub_break); 
    slot_data['position'] = position+1; //set New position.

    console.log("sub_break: "+sub_break);
    console.log(JSON.stringify(slot_data));
    
    var url = "/proposed_schedule"
	$.ajax({
		url : url,
		global: true,
		type : 'POST',
		data : JSON.stringify(slot_data),
		success : function(data) {	
			response = data;
			get_program_break_details(schedule_program._id);
			get_unallocated();

			target_idx = null, to_sub_brk = null, from_sub_brk = null, target_old_idx = null;
		},
		error: function(data){
			target_idx = null, to_sub_brk = null, from_sub_brk = null, target_old_idx = null;
		}
	});
}

function update_slots_below(old_po_index,new_po_index,sub_break_pslots){
	
/*	for(var i=new_po_index;i<old_po_index;i++)  {

       nxt_slot = sub_break_pslots[i];
       nxt_slot['position'] = i + 2;
       // console.log("below::::"+nxt_slot["clip_name"] +"Pos:::"+ nxt_slot["position"])
	   nxt_slot["date"] = dd_mm_yy_date;
       temp_slots_list.push(nxt_slot);
	}
	var  n = 0
	while(n!=new_po_index && n < sub_break_pslots.length){
	   	temp_slots_list.push(sub_break_pslots[n])
	     	n ++ ;
    }*/
}

function update_slots_above(old_po_index,new_po_index,sub_break_pslots){

	/*for(var i=new_po_index;i>old_po_index;i--){
       nxt_slot = sub_break_pslots[i];
       nxt_slot['position'] = i;
      // console.log( "above:::"+nxt_slot['clip_name'] + "::::"+nxt_slot['position']);
	   nxt_slot["date"] = dd_mm_yy_date;
       temp_slots_list.push(nxt_slot)
    }
    var n = 0;
    while(n!=old_po_index && n < sub_break_pslots.length){
		temp_slots_list.push(sub_break_pslots[n])
		n ++ ;
    }*/
}


function re_order_slots(target_slot_id,source_slot_id){
	/*var target_slot, source_slot;
	console.log("reorder slots -----------------");

	target_slot = get_slot_details(target_slot_id);
	source_slot = get_slot_details(source_slot_id);
	
	if(source_slot!=undefined && target_slot!=undefined){

		temp_slots_list = [];

		old_pos = source_slot['position']
		new_pos = target_slot['position'];

		if(new_pos!=undefined && old_pos!=undefined) {

			source_slot['position'] = target_slot['position']
						            
		    sub_break_pslots = [] 
		    sub_break_pslots = proposed_slots[source_slot['sub_break']]
		  	  
	       
	       if(new_pos < old_pos){
	       	old_pos_index = old_pos-1;
	       	new_pos_index = new_pos-1;
		    update_slots_below(old_pos_index,new_pos_index,sub_break_pslots)
		   }
		 
		    last_brk = source_slot
		    src_pos = source_slot['position'] - 1;

		    if(new_pos > old_pos){
		    	old_pos_index = old_pos-1;
	       	   new_pos_index = new_pos-1;	
		       update_slots_above(old_pos_index,new_pos_index,sub_break_pslots);
	        }

		    temp_slots_list.push(source_slot);

            if(new_pos>1){
		    	set_clip_start_end_time();
		    } else {
		    	set_clip_start_end_time(); 
		    }
	    }
    }*/
}

function update_proposed_slot(modified_slot){

	//alert("update:::"+modified_slot['clip_name'] + ""+ modified_slot['position']);
	var url = 'proposed_schedule/'+modified_slot['_id'];
	console.log("MODIFY SLOT: "+url);

  $.ajax({
		url : url,
		type : 'PUT',
		data : JSON.stringify(modified_slot),
		success : function(data) {	
			response = data;
		},
	});
}

function set_clip_start_end_time(){
     
	/*temp_slots_list.sort(function(a, b){return a.position - b.position});
	for(k=0;k<temp_slots_list.length;k++) {
		var start_time = "";
		var end_time = "";
	    each_slot = temp_slots_list[k];

	    if(each_slot['position']==1){
	       start_time = each_slot['break_start_time'];
	    } else{
	   	  start_time = last_up_brk['end_time'];
	   	}

       end_time = get_end_time(start_time, parseInt(each_slot['duration']))
       each_slot['start_time'] = start_time;
       each_slot['end_time'] = end_time;

       last_up_brk = each_slot;
	   // console.log(each_slot['clip_name'] +"::"+ each_slot['position'] +"::"+each_slot['start_time'] + "::"+each_slot['end_time']);    
	   each_slot['date'] = dd_mm_yy_date
	   // update_proposed_slot(each_slot);
	}*/
}

function update_rem_alloc(tar_brk){
  if(tar_brk!=undefined){
        brk_id = tar_brk.split("_")[1];
        sub_break = tar_brk.split("_")[2];
        brk_index = parseInt(sub_break)-1;
		each_brk_slot =  schedule_program.breaks[brk_index];
		tot_dur = each_brk_slot['duration'];
		alloc = 0;
		p_slots = [];
		p_slots = proposed_slots[sub_break]
		for(i=0;i<p_slots.length;i++){
			alloc = alloc +  p_slots[i]['duration']/1000;

		}

        alloc = alloc.toFixed(2) ;
        tot_dur = tot_dur.toFixed(2);
         rem = tot_dur - alloc;
         rem = parseInt(rem);
	     rem_time = "  rem: "+parseInt(rem) + "    ";
	     alloc_time = "  Used: "+parseInt(alloc) + "   ";

	     $("#rem_"+sub_break).text(rem_time);
	     $("#alloc_"+sub_break).text(alloc_time);
    }
}

function get_program_break_details(prgmId){
	$("#filter_input").val('');
    //console.log("get_program_break_details::::::::::::"+prgmId);
	if(prgmId!=undefined && prgmId!="" && prgmId!=0){
		url = '/program_break_details?program_id='+prgmId+'&channel_id='+channel;
		$.ajax({
		   global : true,
		   dataType: 'JSON',
		   url: url,
		   async:false,
		   success: function(json) {
			  	if(json.proposed_slots!=undefined){
			   	   proposed_slots = {};
			   	   proposed_slots = json.proposed_slots
                   //alert("Size::::"+proposed_slots.length);  
                  
                   create_segment_break();
                   //alert("create_segment_break exit")
			   	   create_slot_node();
			   	    //alert("create_slot_node exit");

			   	    $(".manual_schedule_wrapper").css({'max-height': ($(window).height()-80)+'px'});
			   	    $(".ms_unallocated_slots").css({'max-height':  ($(window).height()-150)+'px'});
			   	   return false;
			   	}
		    }
		}); 
    }
}

function get_start_time(end_time,duration){
	
	/*var ss = end_time.split(':');
	var dt = new Date();
	dt.setHours(ss[0]);
	dt.setMinutes(ss[1]);
	dt.setSeconds(ss[2]);
	var et =  new Date(dt.getTime() - duration*1000);	
	
	return et.toTimeString().split(" ")[0];*/
}

function get_end_time(start_time,duration){
	
	/*var ss = start_time.split(':');
	var dt = new Date();
	dt.setHours(ss[0]);
	dt.setMinutes(ss[1]);
	dt.setSeconds(ss[2]);
	var et =  new Date(dt.getTime() + duration*1000);	
	
	return et.toTimeString().split(" ")[0];*/
}

function set_break_details(sub_break){
	
	/*sub_break_details = [];
	
	sub_break_details = proposed_slots[sub_break]
	
	  if(schedule_program.breaks!=undefined && proposed_slots!=undefined && sub_break_details.length==0){
            brk_index = parseInt(sub_break)-1;
		  	slot_data['break_start_time'] = schedule_program.breaks[brk_index].start_time;
		  	slot_data['break_end_time'] = schedule_program.breaks[brk_index].end_time;
		  	slot_data['start_time'] = slot_data['break_start_time'];
		  	slot_data['end_time'] = get_end_time(schedule_program.breaks[brk_index].start_time,
		  		                     parseInt(slot_data["duration"]));
		  	slot_data['break_name'] = schedule_program.breaks[brk_index].break_name;
		  	slot_data['position'] = 1
	  	
	  }else{

	  	    sub_break_details =  proposed_slots[sub_break]
	  	    
	  	    if(sub_break_details.length==1){

	  	    last_brk_details = sub_break_details[0]
	  	   
	  	    }
	  	    else{
	  	    	last_brk_index = sub_break_details.length-1;
	  	        last_brk_details = sub_break_details[last_brk_index];
	  	       
	  	    }
	  	    
	  	    brk_index = parseInt(sub_break)-1

		  	slot_data['break_start_time'] = schedule_program.breaks[brk_index].start_time;
		  	slot_data['break_end_time'] = schedule_program.breaks[brk_index].end_time;
		  	slot_data['start_time'] = last_brk_details['end_time'];
		  	slot_data['end_time'] = get_end_time(slot_data['start_time'],
		  		                     parseInt(slot_data["duration"]));
		  	slot_data['break_name'] = schedule_program.breaks[brk_index].break_name;
		  	slot_data['position'] = last_brk_details['position'] + 1;
	  }
	  return false;*/
}

function get_program_details(prg_id){
	// if($.isEmptyObject(advt_color_map)){
		ms_load_advt_types();
	// }

	if(prg_id!=undefined && prg_id!="" && prg_id!=0){
		prgmId = prg_id;
		var url = '/programs?s={"programId":"'+prg_id+'","channel_id":"'+channel+'"}';
		$.ajax({
		   dataType: 'JSON',
		   url: url,
		   success: function(data) {
			   	if(data.program!=undefined){
			   	   schedule_program = {};
			   	   schedule_program = data.program;
			   	   $('#manual_scheduling').dialog({ title: schedule_program.program_name });
			   	   create_segment_break();
			   	   prg_date = schedule_program.start_date.split("/");
                   dd_mm_yy_date = prg_date[2] + "/"  + prg_date[1] + "/" +prg_date[0]
			   	   
			   	   get_program_break_details(prgmId); 
			   	   	get_unallocated();
			   	}
		    }
		});
    }
}

clip_list = [];
clip_details_map = {};
orders = [];
function get_unallocated(){
	url = "/manual_unallocated?status=active&channel_id="+channel+"&start_time="+schedule_program.start_time+
       "&end_time="+schedule_program.end_time+"&date="+formatDate(schedule_program.start_date);
    var active_nav_menu = $("#ms_advt_types").val();     
   	$.ajax({
		dataType: 'JSON',
		url: url,
		success: function(data) {
			if(!data){
				return;
			}
		   	if(data.manual_unallocated){
		   		setUnallocatedSlots(data.manual_unallocated);
		   		loadUnallocatedSlots();
		   	}
		}
	});
}

function loadUnallocatedSlots() {

	$(".ms_unallocated_slots").empty();

	// for(var key in unallocated_slots){


		for (var i = 0; i<unallocated_slots.length ;i++) {
			clip_dict = unallocated_slots[i];

			var clip_details  = unallocated_slots[i];
			var clip_id = clip_details.commercial_id;
			var clip_name = clip_details.clip_name;
			var clip_dur = parseInt(clip_details.duration);
			var count = clip_details.num_spots;
	        var count_id = 'count_'+clip_id; 
	        var cust_name = '';

			if(clip_details.customer_name!=undefined){
				cust_name = clip_details.customer_name;
			}
			if(clip_name!=undefined && clip_name.length>44){
				clip_name = ms_trimClipNameWithExtn(clip_name, 40);
			}

	        var cust_name = clip_details.customer_name != undefined? clip_details.customer_name: '';

	        var color = "#fdfdd2";
			if(advt_color_map[clip_details.advt_type]){
				color = advt_color_map[clip_details.advt_type];
			}

			if(clip_details.slot_type == "segment"){
				//skipping lband unallocated slots.
				continue;
			}

			// console.log("A: "+clip_name);
			var count_color = darkerColor(color);
	        //construct commercials list str with draggable events.
	        var each_com_html =  "<span id='unslot_"+clip_details._id+"' title='"+cust_name+"' class='each_comm' title='"+cust_name+"' draggable='true'"+
		                     "ondragstart='drag_commercial(event)' ondragend='comm_drag_end(event)'  style='background-color:"+color+" !important'>"+ clip_name+
		                     "<span class='comm_dur_wrapper'>"+
		                     "<font class='clip_dur' style='margin-right:40px;'>"+clip_dur+" sec</font>"+
				             "<font  class='comm_count' id='"+count_id+"'  style='background-color: "+count_color+" !important'> "+count+" </font>"+
				             "</span>"+
		                     "</span>";

		    var advtId = ms_getAdvtTypeLocalId(clip_details.advt_type);
		    $("#"+advtId+"_list").append(each_com_html);
		    clip_details_map[clip_details._id] = clip_details;                
		}


	   			var menu = $("#ms_advt_types").val();
	   			$(".ms_unallocated_slots").hide();
	   			var id = ms_advtTypeNameIdMap[menu];
	   			$("#"+id+"_list").show();
	// }
}

function create_segment_break(){

   //console.log("create segments");

   $('#manual_schedule').empty();

	for (i=0;i<schedule_program.segments.length;i++){

		if(schedule_program.segments[i]!=undefined){

			//to set title str length to 30 characters.
			var seg_name = schedule_program.segments[i].segment_name;
			if(seg_name.length > 35){
				seg_name = seg_name.substring(0,40)+"...";
			}
	     seg_time = schedule_program.segments[i].start_time + '-' + schedule_program.segments[i].end_time;

		 var seg_html =  "<div class='brk_div' style='border:none;'>"+
		 	"<div class='seg_div'>"+
		 	"<span class='advt-type-icon seg-icon' title='Segment'> SEG </span>"+
		 	"<font class='brk_time'> "+seg_time+" </font>"+
		 	"<font class='brk_title' title='"+schedule_program.segments[i].segment_name+"'> &nbsp;"+seg_name+"</font>"+
		 	"</div>"+
		   "</div>";

		   $('#manual_schedule').append(seg_html);
		}

          if(schedule_program.breaks[i]!=undefined){

          	  var title = schedule_program.breaks[i].break_name;
          	  //if break_type is template split it n display second string as break name
          	  if(schedule_program.breaks[i].break_type == 1){
          	  	title = title.split("_")[1];
          	  } 
          	  // else if(schedule_program.breaks[i].break_type == 2){
          	  	//for mannual break_type display 15 letters.
          	  	title = title.substring(0, 20);
          	  // }
			  brk_id = schedule_program.break_id + "_" + schedule_program.breaks[i].sub_break;
			 
		      brk_time = schedule_program.breaks[i].start_time + '-' + schedule_program.breaks[i].end_time;
              remaing_time = 'rem: '+parseInt(schedule_program.breaks[i].duration) + 'sec'; 
              rem_id = "rem_" + schedule_program.breaks[i].sub_break ;
              alloc_id = "alloc_" + schedule_program.breaks[i].sub_break;
              var sub_brk_id = schedule_program.breaks[i].sub_break;
               

              //segment brk string with draggable
			  var brk_html = "<div id='b_"+brk_id+"' class='brk_div brk_div_wrapper' ondrop='drop_commercial(event)'" +
			     "ondragover='allow_drop_on_brk(event)'>"+
			     "<span class='brk_bg' id='brk_"+brk_id+"'>"+
			     "<span class='advt-type-icon brk-icon' title='Break'> BRK </span>"+
			     "<font class='brk_time'>"+brk_time+"</font>"+ 
		 	     "<font class='brk_title' title='"+schedule_program.breaks[i].break_name+"'> &nbsp;"+title+" </font>"+
		 	     "<span class='rem_alloc_right'>"+
		 	     "<span class='badge slots_count slots_count_"+sub_brk_id+"' title='Allocated Slots'></span>"+
		 	     "<font class='remaining_brk' id='"+rem_id+"'> "+remaing_time+" </font >"+
			      "<font class='alloc_brk' id='"+alloc_id+"'> Used: 00 sec</font>"+
			      "<i class='fa fa-caret-up brk_icons collapse' id='collapse_"+brk_id+"' title='Collapse'></i>"+
			      "<i class='fa fa-caret-down brk_icons expand' id='expand_"+brk_id+"'  title='Expand'></i>"+
			     "</span>"+
			      
			      "</span>";

			      brk_html = brk_html + "</div>"
                  
                  brkID = "b_"+brk_id;

                  clear_slots(brkID);

			    $('#manual_schedule').append(brk_html);

		}


	}

	initClickForBrkIcons();
	 return false;

}


function clear_slots(brkID){
	$("#"+brkID).children('.pslot').each(function () {
     this.remove();
  })
}


function create_slot_node(){
	//console.log("create slot nodeeeeeeeee:::::::::");
	
	$.each(proposed_slots, function(sub_break, p_slots) {

		
		brk_index = parseInt(sub_break)-1;
		each_brk_slot =  schedule_program.breaks[brk_index];
		tot_dur = each_brk_slot['duration'];
		alloc = 0;

		if(p_slots.length){
			$(".slots_count_"+sub_break).html(p_slots.length);
			$(".slots_count_"+sub_break).show();
		} else {
			$(".slots_count_"+sub_break).hide();
		}

	     for(i=0;i<p_slots.length;i++){
	     	clip_name = "";
			clip_name = p_slots[i].clip_name;
			if(p_slots[i].duration!=undefined)
			clip_dur =parseInt(p_slots[i].duration);
		    else
		    clip_dur = p_slots[i].duration;	
			break_id = p_slots[i].break_id;
			sub_break = p_slots[i].sub_break;
			slot_id = "s_"+p_slots[i]['_id'];
			d_slot_id = 'd_'+p_slots[i]['_id'];
            
            if(clip_name!=undefined && clip_name.length>40){
         	  clip_name = ms_trimClipNameWithExtn(clip_name, 40);
            }
            //console.log("this slottttttttt"+JSON.stringify(p_slots[i]));
            //constructing slot str with draggable.
            var className = "dslot";
		    var bumper_class = "", bumperStr = "";
			if(p_slots[i].break_bumper){
				className += " "+p_slots[i].break_bumper;
				bumper_class = " "+p_slots[i].break_bumper;
				bumperStr = '<i class="fa fa-flash bumper_icon '+bumper_class+'" title="Bumper: '+bumper_class.replace('_', ' ')+'"></i>';
			}
            
            var clsType = '';
		   	if(p_slots[i]['advt_type']){
		   		clsType = p_slots[i]['advt_type'];
		   	}
		   	var color = "#fdfdd2";
			if(advt_color_map[p_slots[i].advt_type]){
				color = advt_color_map[p_slots[i].advt_type];
			}

			var cust = "";
			if(p_slots[i].customer_name){
				cust = p_slots[i].customer_name.substring(0, 10);
			}

		   	var alocSlotStr = "<span id='"+slot_id+"' class='brk_clip "+clsType+"_color pslot brk_clip_"+break_id+"_"+sub_break+"' draggable='true' ondrop='drop_alloc_slot(event)'"+
		    "ondragover='alloc_slot_drag_over(event)' ondrag='alloc_slot_drag_event(event)' ondragstart='alloc_slot_drag_start(event)' ondragend='alloc_slot_drag_end(event)' position='"+p_slots[i].position+"' style='background:"+color+" !important'>"+
	           "<font class='clip_dur clip_start_time' title='Clip Start Time'>"+p_slots[i].start_time+"</font>"+"&nbsp;&nbsp;"+
	           "<span class='customer_name' title='Customer Name'>"+cust +"&nbsp;&nbsp;&nbsp;&nbsp;</span><span title='"+p_slots[i].clip_name+"'>"+
	            clip_name+ "&nbsp;&nbsp;</span>" +
	            "<span class='clip_dur_wrapper'>"+bumperStr+
		       "<font class='clip_dur clip_dur_time' title='Duration'> "+clip_dur+" sec</font>"+
		       "<span style='float:right;cursor:pointer;' class='del_slot' id='"+d_slot_id+"'><i class='fa fa-times'></i></span>"+
		       "</span>"+
		       "</span>";

			$("#b_"+break_id+"_"+sub_break).append(alocSlotStr); 
			alloc = alloc + clip_dur; 
	    }

		alloc = alloc.toFixed(2) ;
		tot_dur = tot_dur.toFixed(2);
		rem = tot_dur - alloc;
		rem = rem.toFixed(2);

		rem_time = "  rem: "+parseInt(rem) + "    ";
		alloc_time = "  Used: "+parseInt(alloc) + "   ";

		if(rem<0){
			var ex_brk_id = $($(".brk_div_wrapper").get(sub_break-1)).attr('id');
			var info_icon = "<i class='fa fa-warning info-icon animate-info-icon' data-toggle='tooltip' title='Spots allocation exceeded break time'></i>";
			$("#"+ex_brk_id+" span.brk_bg").css({"background": "#FBB4B4"});
			$("#"+ex_brk_id+" span.brk_bg .rem_alloc_right").prepend(info_icon);
			$("[data-toggle='tooltip']").tooltip();
		}
		$("#rem_"+sub_break).text(rem_time);
		$("#alloc_"+sub_break).text(alloc_time);
    });

	setTimeout(function(){
	    expColSlots();
	}, 200);
}

var programsList = [];
function getProgramListsForDropDown(){
	var prm_date = $("#programDate").val();
	var url = '/programs?s={"date":"'+prm_date+'","channel_id":"'+channel+'"}';		
	
	$.ajax({
	    global : true,
	    dataType: 'JSON',
	    url: url,
	    success: function(data) {
			programsList = data['programs'];
			var date = moment(prm_date, 'DD/MM/YYYY').format('Do MMM YY');
			$("#prgm_date_text").html(date);
			constructProgramsDropDrown();
	    }
	});
}

function constructProgramsDropDrown(){
	if(!programsList.length){
		return;
	}
	var optionStr = "<option value='-1'>-- Select --</option>";
	for(var i=0; i<programsList.length; i++){
		var program = programsList[i];

		var cur_date = moment().format('DD/MM/YYYY');
		var p_date = moment(program.start_date).format('DD/MM/YYYY');

		if(p_date == cur_date){ //for today programs, checking time for not to include elapsed program.
			var cur_time = moment().format("HH:mm"); //ignoring seconds from moment format
		  	var start_time = moment(program.start_time, 'HH:mm:ss').format('HH:mm');
		  	if(start_time > cur_time){
				optionStr += "<option value='"+program._id+"'>"+program.program_name+"</option>";
			}
		} else {
			optionStr += "<option value='"+program._id+"'>"+program.program_name+"</option>";
		}
	}
	$("#program_list_combobox").html(optionStr);

	var prgm_id = $("#program_id").val();
	// console.log(prgm_id);
	$("#program_list_combobox option[value='"+prgm_id+"']").attr('selected','selected');
}

function getSelectedProgramDetails(){
	var prgm_id = $("#program_list_combobox option:selected").val();
	if(prgm_id != -1){
		$("#program_id").val(prgm_id);
		get_program_details(prgm_id);
	} else {
		var p_id = $("#program_id").val();
		$("#program_list_combobox option[value='"+p_id+"']").attr('selected','selected');
	}

}

function initClickForBrkIcons(){
	// $(".expand").hide();

	$(".brk_icons").click(function(){
	 	var eventInfo = $(this).attr('id').split("_");
	 	var type = eventInfo[0];
	 	var breakId = eventInfo[1]+"_"+eventInfo[2];

	 	if(type == "collapse"){
	 		$(".brk_clip_"+breakId).slideUp();
	 		$("#collapse_"+breakId).hide();
	 		$("#expand_"+breakId).show();
	 	}
	 	if(type == "expand"){
	 		$(".brk_clip_"+breakId).slideDown();
	 		$("#expand_"+breakId).hide();
	 		$("#collapse_"+breakId).show();
	 	}

	 	if(hasLocalStorage){
	 		col_exp[breakId] = type;
	 		localStorage.setItem("col_exp", JSON.stringify(col_exp));
	 	}

	 });
}

function expColSlots(){
	return;
	var col_exp = {};
   	var isEmptyLocalStorage = true;
   	if(hasLocalStorage){
 		col_exp = JSON.parse(localStorage.getItem('col_exp'));
 		if(!$.isEmptyObject(col_exp)){
 			isEmptyLocalStorage = false;
 		}
 	}

	if(!isEmptyLocalStorage){

		$('.brk_div_wrapper').each(function() {
    		var id = this.id;
			var brk_id = id.substring(2, id.length);

			if(brk_id in col_exp){

		    	if(col_exp[brk_id] == "collapse"){
		    		$(".brk_clip_"+brk_id).hide();
		    		$("#collapse_"+brk_id).hide();
					$("#expand_"+brk_id).show();
		    	} else {
		    		$(".brk_clip_"+brk_id).show();
		    		$("#expand_"+brk_id).hide();
					$("#collapse_"+brk_id).show();
		    	}
		    } else {
		    	$(".brk_clip_"+brk_id).show();
		    	$("#expand_"+brk_id).hide();
				$("#collapse_"+brk_id).show();
		    }
	   	});
    } else {
    	$("#expand_"+brk_id).hide();
    	$(".brk_clip").show();
    }
}

function showRelatedContent(){
	var type = $("#ms_advt_types").val();
    // console.log("type => "+type)
    if(type){
	    $(".ms_unallocated_slots").hide();
	    var id = ms_getAdvtTypeLocalId(type);
	    $("#"+id+"_list").show();
	}
}

var advt_color_map = {}, ms_advtTypeNameIdMap = {};
function ms_load_advt_types(){
	$("#ms_advt_types").html("");
	$("#ms_unslot_container").html("");
    $.ajax({
    dataType: "json",
    url: '/advertisement_types',
    success: function( result) {
      advt_type_list = [], ms_advtTypeNameIdMap = {};
      if(result.ad_types!=undefined)
        advt_type_list = result.ad_types;
      	var options = "";
      	var com_div = "";
        for(j=0;j<advt_type_list.length;j++) {
        	if("modules" in advt_type_list[j]){
        	var modules = advt_type_list[j].modules;
        	if(modules.indexOf("break") != -1){
	        	var advtName = advt_type_list[j].name;
	            options += '<option value="' + advtName + '">' + advtName + '</option>';  
	            com_div += '<div id="advt'+j+'_list" class="ms_unallocated_slots"></div>';

	            var colr =  "#fdfdd2";
	  			if(advt_type_list[j].color){
	        		colr = advt_type_list[j].color;
	        	}
	        	advt_color_map[advtName] = colr;
	        	ms_advtTypeNameIdMap[advtName] = "advt"+j;
	        }
        }
    }

        var selVal = "";
    	if($("#ms_advt_types option").size() ){
      		selVal = $("#ms_advt_types").val();
      	}

      	if(!selVal){
      		selVal = "commercial";
      	}

      	var selUnslotDivId = ms_advtTypeNameIdMap[selVal];
          $("#ms_advt_types").html(options);
          $("#ms_advt_types option[value='"+selVal+"']").attr("selected", true);
          $("#ms_unslot_container").html(com_div);

          //show corresponding div after some delay.
          setTimeout(function(){
          	$(".ms_nav_wrapper #"+selUnslotDivId+"_list").css({'display': 'block'});
          }, 500);
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

// ms_load_advt_types();


var unallocated_slots = [];
function get_unallocatedSlots(){
    if(schedule_program!=undefined){	
       url = "/timebandwise_clip_details?status=active&channel_id="+channel+"&start_time="+schedule_program.start_time+
       "&end_time="+schedule_program.end_time+"&date="+formatDate(schedule_program.start_date);
       	$.ajax({
			   global : true,
			   dataType: 'JSON',
			   url: url,
			   success: function(data) {
				   	if(data.timebandwise_clip_details!=undefined){
				   		setUnallocatedSlots(data);
	                    loadUnallocatedSlots(data.timebandwise_clip_details);
				   	 }
			   	}    
		});
	} else{
		console.log("program undefined");
	}
	 return false;
}

function ms_trimClipName(clipName, length){
	if(clipName!=undefined && clipName.length> length){
        clipName = clipName.substring(0, length)+"...";
    }
    return clipName
}

function setUnallocatedSlots(data, searchType){
	// console.log("searchType: "+searchType);

	if(searchType){
		var temp = [];
		for(var i=0; i<unallocated_slots.length; i++){
			var item = unallocated_slots[i];

			if(searchType != item.advt_type){
				temp.push(item);
			}
		}
		//copying unallocated to temp list.
		unallocated_slots = [];
		for(var i=0; i<temp.length; i++){
			unallocated_slots.push(temp[i]);
		}

	} else {
		unallocated_slots = [];
	}

	for(var key in data){
		var array = data[key];
		for(var i=0; i<array.length; i++){
			unallocated_slots.push(array[i]);
		}
	}
	console.log("unallocated_slots length after append :: "+unallocated_slots.length);
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

function ms_trimClipNameWithExtn(name, len){
	if(name.length <= len){
		return name;
	} else {
		return name.substring(0, len-18)+"....."+name.substring(name.length-16, name.length);
	}
}


function ms_getAdvtTypeLocalId(advtType){
	var id = "";
	if( !$.isEmptyObject(ms_advtTypeNameIdMap) ){
		if(ms_advtTypeNameIdMap[advtType]){
			id =  ms_advtTypeNameIdMap[advtType];
		}
	} 
	return id;
}