function hhmmss_to_sec(hhmmss){
	var hms = hhmmss; 
	var a  = [];
	if(hms!=undefined)
	var a = hms.split(':');
	// minutes are worth 60 seconds. Hours are worth 60 minutes.
	var seconds = parseInt(((a[0]) * 60 * 60)) + parseInt(((a[1]) * 60)) + parseInt(((a[2])));	
	return seconds; 
}

function sec_to_hhmmss(totalSec){
	//var totalSec = new Date().getTime() / 1000;
	var hours = parseInt( totalSec / 3600 ) % 24;
	var minutes = parseInt( totalSec / 60 ) % 60;
	var seconds = totalSec % 60;
	return  (hours < 10 ? "0" + hours : hours) + ":" + (minutes < 10 ? "0" + minutes : minutes) + ":" + (seconds  < 10 ? "0" + seconds : seconds);
}

function updateBreak(){
		var id = jQuery('#breakId').val();
		var breakName = jQuery('#brkName').val();
		var breakStartTime = jQuery('#brkStartTime').val();
		var breakEndTime = jQuery('#brkEndTime').val();
		var cnt = 0;
		var url = "";
		var url = "/manual-breaks/"+id;

	    var pg = $("#page").val();
		if(pg=="reprise"){
		  if( $("#master_sync").is(":checked") ){
				url = url + "?sync="+true;
                }
            }
	
			checkExist(1);
			if (itemExists != true){
				if(id!=""){
					start_time = $("#startTime").val();
			 		end_time = $("#endTime").val();
					if(validateBreaktime(start_time,end_time) && validateDuration()){
						breakEndTime = jQuery('#brkEndTime').val();
						if(breakName!="" && breakStartTime!="" && breakEndTime!=""){
							jQuery('#brkName').removeClass("error");
							jQuery('#brkStartTime').removeClass("error");
							jQuery('#brkEndTime').removeClass("error");
							
							var fmTime = formatTime(breakStartTime);
							$("#brkStartTime").val(fmTime);
							
							var value = {};
							value['break_name'] = $("#brkName").val();
							value['start_time'] = $("#brkStartTime").val();
							value['break_duration'] = parseInt(hhmmss_to_sec($("#brkDuration").val()));
							value['program_id'] = $("#programId").val();
							value['channel_id']=channel;
			
							jQuery.ajax({
								type : 'PUT',
								url : url,
								datatype:'JSON',
								data : JSON.stringify(value),
								success : function(data) {
									console.log("success");
									manualBrk = data['manual-break'];
									console.log(manualBrk);
									var brkId = manualBrk._id;
								 	var breakName = manualBrk.break_name;
									var breakStartTime = manualBrk.start_time;
									var breakEndTime = manualBrk.end_time;
									var checkString = breakName+"-"+breakStartTime+"-"+breakEndTime;
									console.log(checkString);
									
									//console.log("brkId:"+brkId);
									$(".comboBox option[value='"+brkId+"']").remove();
									jQuery('.comboBox').append(jQuery('<option id="breaks_'+brkId+'" class="editBreaks"></option>').val(brkId).html(checkString));
									jQuery('#brkId').val("");
									jQuery('#brkName').val("");
									jQuery('#brkStartTime').val("");
									jQuery('#brkEndTime').val("");
									jQuery('#saveBreaks').css('display','inline');
									//jQuery('.cancelBrk').css('display','inline');
									jQuery('.cancel').css('display','inline');
									jQuery('#updateBreaks').css('display','none');
									$('#updateBreaks').removeAttr('disabled');
									jQuery('#cancelBreaks').css('display','none');
									jQuery('#deleteBreaks').css('display','none');
								}, error: function(xhr, status, text) {
							        var response = $.parseJSON(xhr.responseText);

							        var err = response.errors;

							        if (response) {
							            jAlert(err.toString());
							        }
							    }	
								
							});
						}else if(breakName==""){
							jAlert("Please Enter Break Name")
						}else if(breakStartTime==""){
							jQuery('#brkStartTime').addClass("error");
						}else if(breakEndTime==""){
							jQuery('#brkEndTime').addClass("error");
						}
					}
				}
			} 
		// }
		 /* else{
			 jAlert("Break Name cannot include '-'");
		 } */
	}
	
var itemExists=false;
var DELAY = 500, clicks = 0, timer = null;
 jQuery(function() {
 	
	 channel = $("#channel").val();
	
	 var flag;	 
	 	jQuery('#saveBreaks').click(function(event) {
	 		console.log("ENTERING MANUAL BRKKK POST")
	 		var url = "/manual-breaks";

	 		var pg = $("#page").val();
			if(pg=="reprise"){
				if( $("#master_sync").is(":checked") ){
				url = url + "?sync="+true;
                }
            }
                
	 		//console.log("I am Saving bre/ak--------------------->");
	 		//validation to be done, pass parameters for validateBreaktime(), validateDuration()
	 		start_time = $("#startTime").val();
	 		end_time = $("#endTime").val();
			if(validateBreaktime(start_time,end_time) && validateDuration()){
	 		//if(true){
				// checkExist(0);temporarily commented
				 if (itemExists != true){
					 console.log("itemExists");
					 	var cnt = 0;
						var breakName = jQuery('#brkName').val();
						var breakStartTime = jQuery('#brkStartTime').val();
						var breakEndTime = jQuery('#brkEndTime').val();				
					console.log("cnt--->"+cnt);
							if(cnt==0){
								if(breakName!="" && breakStartTime!="" && breakEndTime!=""){
									//jQuery('#brkName').removeClass("error");
									//jQuery('#brkStartTime').removeClass("error");
									//jQuery('#brkEndTime').removeClass("error");
									
									var fmTime = formatTime(breakStartTime);
									$("#brkStartTime").val(fmTime);	
									var value = {};
									value['break_name'] = breakName
									value['start_time'] = breakStartTime;
									value['break_duration'] = parseInt(hhmmss_to_sec(jQuery('#brkDuration').val()));
									value['program_id'] = jQuery('#programId').val();
									value['channel_id'] = channel;
									console.log("if cnt 0");
									/*jQuery.ajax({										
										type : 'POST',
										data : JSON.stringify(value),
										beforeSend: function() {
											$('#saveBreaks').attr('disabled', 'disabled');
										},
										dataType : "json",
										success : function(data) {
											if(flag==0){
												loadList();
											}
											else{
												if(pg=="reprise"){
													url = "/master-programs";
												}else{
													url = "/special-programs";
												}*/
												jQuery.ajax({
													type : 'POST',
													url : url,
													datatype:'JSON',
													data : JSON.stringify(value),
													success : function(data) {
														console.log("success");
														manualBrk = data['manual-break'];
														console.log(manualBrk);
														var brkId = manualBrk._id;
													 	var breakName = manualBrk.break_name;
														var breakStartTime = manualBrk.start_time;
														var breakEndTime = manualBrk.end_time;
														var checkString = breakName+"-"+breakStartTime+"-"+breakEndTime;
														console.log(checkString);
														//console.log("brkId:"+brkId);
														jQuery('.comboBox').append(jQuery('<option id="breaks_'+brkId+'" class="editBreaks"></option>').val(brkId).html(checkString));
													}
												
											})											
											jQuery('#brkName').val("");
											jQuery('#brkStartTime').val("");
											jQuery('#brkEndTime').val("");
											$('#saveBreaks').removeAttr('disabled');
										
									
								}else if(breakName==""){
									jAlert("Please Enter Break Name")
								}else if(breakStartTime==""){
									jQuery('#brkStartTime').addClass("error");
								}else if(breakEndTime==""){
									jQuery('#brkEndTime').addClass("error");
								}
							}else{
								console.log("cnt is not 0");
							}
						}
					}
					else if(breakName==""){
						jQuery('#brkName').addClass("error");
					}else if(breakStartTime==""){
						jQuery('#brkStartTime').addClass("error");
					}else if(breakEndTime==""){
						jQuery('#brkEndTime').addClass("error");
					}
		});
		
		jQuery('.comboBox').on("click", function() {
		    var selectedId = $('.comboBox option:selected').val();
		    var selectedText = $('.comboBox option:selected').text(); 
		    clicks++;  //count clicks

		   var selected = $('.comboBox option:selected').size();
	        if(clicks === 1) {

	            timer = setTimeout(function() {
	            	if(selected==1)
	            		editBreaks(selectedId,selectedText);
	                clicks = 0;             //after action performed, reset counter
	                
	            	var id = new Array();
	    			var idToBeDeleted=new Array();
	    			var i =0;
	    			var ids="";
	    			
	    			$("select#breaksSelect option:selected").each(function() {
	    	    		id = jQuery(this).attr("id");
	    	    		if(id!=undefined){
		    	    		id = id.split("_")[1];
		    	    		idToBeDeleted[i] = id;
		    	    		i++;
	    	    		}
	    	    	});
	    			if(idToBeDeleted != ''){
		    			if(idToBeDeleted.length>1){
		    		    	//jQuery('#deleteAllBreaks').css('display','inline');
		    		    	//jQuery('#updateBreaks').css('display','none');
		    				//jQuery('#deleteBreaks').css('display','none');
		    		    }else{
		    		    	//jQuery('#deleteAllBreaks').css('display','none');
		    		    	jQuery('#updateBreaks').css('display','inline');
		    				jQuery('#deleteBreaks').css('display','inline');
		    		    }
	    			}
	            }, DELAY);

	        } else {
	            clearTimeout(timer);    //prevent single-click action
	            clicks = 0;             //after action performed, reset counter
	        }
		});
		
		
		jQuery('#brkName').keypress(function(event) {
		    if (event.keyCode == 13) {
		        event.preventDefault();
		    }
		});
		
	});
 
/* function loadList(){
		flag= 1;
		var programId = "";
		 var url = "";
		 var pg = $("#page").val();
			var url = "";
			if(pg=="reprise"){
				programId = jQuery('#programId').val();
				
				url = "/breaks/"+programId+"/loadBreaksProgRep";
			}else{
				programId = jQuery('#id').val();
				url = "/breaks/"+programId+"/loadBreaks";
			}
		jQuery.ajax({
			url : url,
			type : 'GET',
			dataType : "json",
			success : function(data) {
				for (var i=0; i<data.length; i++ ){
					var breakName = data[i].brkName;
					var breakStartTime = data[i].brkStartTime;
					var breakEndTime = data[i].brkEndTime;
					var checkString = breakName+"-"+breakStartTime+"-"+breakEndTime;
					jQuery('.comboBox').append(jQuery('<option id="breaks_'+data[i].id+'" class="editBreaks"></option>').val(data[i].id).html(checkString));
				}
			}
		});
	}
	*/
	function checkExist(toggle){
			
			//var checkString = breakName+" - "+breakStartTime+" - "+breakEndTime;
			var count=0;
			
			jQuery(".comboBox option").each(function() {
				var checkText = jQuery(this).text();
				var brkName = "";
				var brkStartTime = "";
				var brkEndTime = "";
				
				if(checkText!=undefined){
					var brkName = "";
					if(checkText!=undefined)
					   var brkName = checkText.split("-")[0];
					
					var brkStartTime = "";
					if(checkText!=undefined)
  					   var brkStartTime = checkText.split("-")[1];
					
					var brkEndTime = "";
					if(checkText!=undefined)
					var brkEndTime = checkText.split("-")[2];
				}
				
				
				if(toggle==0){
					count = matchValues(brkName,brkStartTime,brkEndTime);
				}else{
					var id = jQuery('#breakId').val();
					var checkId = jQuery(this).val();
					if(id!=checkId){
						
						count = matchValues(brkName,brkStartTime,brkEndTime);
					}
				}
				
				
	            if (count > 0) {
	                itemExists = true;
	                return false;
	            }else{
	            	itemExists = false;
	            }
	        });
	}
	
	function matchValues(brkName,brkStartTime,brkEndTime){
	
		var breakStartTime = jQuery('#brkStartTime').val();
		var breakEndTime = jQuery('#brkEndTime').val();
		var breakName = jQuery('#brkName').val();
		var count=0;
		
		//alert("start"+breakStartTime);
		//alert("end"+breakEndTime);
		var newBrSt = [];
		var newBrEnd = [];
		
		if(breakStartTime!=undefined)
		var newBrSt = breakStartTime.split(":");
		
		if(breakEndTime!=undefined)
		var newBrEnd = breakEndTime.split(":");
        
		var brSt = [];
		var brEd = [];
		
		if(brkStartTime!=undefined)
		var brSt = brkStartTime.split(":");
		
		if(brkEndTime!=undefined)
		var brEd = brkEndTime.split(":");
				
		var yr = 2015;
		var month = 1;
		var dt = 15;
		
		if(newBrSt.length>2)
		    var newDateStart = new Date(yr,month,dt,newBrSt[0],newBrSt[1],newBrSt[2]);
		else
			var newDateStart = new Date()
		
		
		if(newBrEnd.length>2)
		    var newDateEnd = new Date(yr,month,dt,newBrEnd[0],newBrEnd[1],newBrEnd[2]);
		else
			var newDateEnd = new Date();
		
		if(brSt.length>2)
		  var oldDateStart = new Date(yr,month,dt,brSt[0],brSt[1],brSt[2]);
		else
		  var oldDateStart = new Date();
		  
		if(brEd.length>2)
    		var oldDateEnd = new Date(yr,month,dt,brEd[0],brEd[1],brEd[2]);
		else
			var oldDateEnd = new Date();
	
		if(newDateStart.getTime()==newDateEnd.getTime()){
			jAlert("Break Start Time and Break End Time cannot be same");
			jQuery('#brkStartTime').addClass("error");
			jQuery('#brkEndTime').addClass("error");
			count++;
		}else if(brkName==breakName){
			jAlert("Break Name already exist");
			count++;
			jQuery('#brkName').addClass("error");
			jQuery('#brkStartTime').removeClass("error");
			jQuery('#brkEndTime').removeClass("error");
		}else if(newDateStart.getTime()>=oldDateStart.getTime() && newDateStart.getTime() <= oldDateEnd.getTime()){
			//over lap else if(breakStartTime>=brkStartTime && breakStartTime < brkEndTime )		
			//jAlert("Break Start Time already exist");
			jAlert("Break time overlaps ");
			count++;
			jQuery('#brkStartTime').addClass("error");
			jQuery('#brkName').removeClass("error");
			jQuery('#brkEndTime').removeClass("error");
		}else if(oldDateEnd.getTime()>=newDateStart.getTime() && oldDateEnd.getTime()<=newDateEnd.getTime()){
			//over lap	(breakEndTime>=brkStartTime && breakEndTime<brkEndTime)
			//jAlert("Break End Time already exist");
			jAlert("Break time overlaps ");
			count++;
			jQuery('#brkEndTime').addClass("error");
			jQuery('#brkName').removeClass("error");
			jQuery('#brkStartTime').removeClass("error");
		}else if(oldDateStart.getTime()==newDateStart.getTime()){
			jAlert("Break start time exists");
			count++;
			jQuery('#brkEndTime').addClass("error");
			jQuery('#brkName').removeClass("error");
			jQuery('#brkStartTime').removeClass("error");
		}
		
		return count;
	}
	
	
	function editBreaks(id,optValue){
		
		if(optValue.length>0){
			if(optValue!=undefined)
			   var brkName = optValue.split("-")[0];
			else
				var brkName = "";
			
			if(optValue!=undefined)
			   var brkStartTime = optValue.split("-")[1];
			else
				var brkStartTime = "";
			
			if(optValue!=undefined)
			   var brkEndTime = optValue.split("-")[2];
			else
				var brkEndTime = "";
			
			
			var dur = getDuration(brkStartTime,brkEndTime);
			
			jQuery('#brkDuration').val(dur);
			jQuery('#breakId').val(id);
			jQuery('#brkName').val(brkName);
			jQuery('#brkStartTime').val(brkStartTime);
			jQuery('#brkEndTime').val(brkEndTime);
			jQuery('#saveBreaks').css('display','none');
			//jQuery('.cancelBrk').css('display','none');
			jQuery('.cancel').css('display','none');
			jQuery('#updateBreaks').css('display','inline');
			$('#cancelBreaks').removeAttr('disabled');
			jQuery('#cancelBreaks').css('display','inline');
			jQuery('#deleteBreaks').css('display','inline');
			jQuery('#brkName').removeClass("error");
			jQuery('#brkStartTime').removeClass("error");
			jQuery('#brkEndTime').removeClass("error");
		}
	}
	
	
	function deleteBreak(){
		//console.log("delete break###################");
		var id = new Array();
		var idToBeDeleted=new Array();
		var i =0;
		var ids="";
		var url = "";
		 var pg = $("#page").val();
		$("select#breaksSelect option:selected").each(function() {
			id = jQuery(this).attr("id");
			if(id!=undefined){
		    	id = id.split("_")[1];
			    idToBeDeleted[i] = id;
			    i++;
			}
		});

		//console.log(idToBeDeleted);
               

				
				jConfirm('Do you wish to delete break(s)?', 'Break', function(response) {
					if(response) {
						var value = {};
						if(idToBeDeleted.length!=0){
							for(m=0;m<idToBeDeleted.length;m++){
								del_id = idToBeDeleted[m];
								 var url = "";
		                         var url = "/manual-breaks/"+del_id;
	                             var pg = $("#page").val();
		                         if(pg=="reprise"){
		                         if( $("#master_sync").is(":checked") ){
				                         url = url + "?sync="+true;
                                 }
                                }
								url = url;
								console.log("URLLLL"+url)
								jQuery.ajax({	
								    						
									url : url,
									type : 'Delete',
									async:false,
									data : jQuery("#breaks_form").serialize(),
									dataType : "json",
									success : function(data) {
										$(".comboBox option[value='"+del_id+"']").remove();
										jQuery('#brkId').val("");
										jQuery('#brkName').val("");
										jQuery('#brkStartTime').val("");
										jQuery('#brkEndTime').val("");
										jQuery('#saveBreaks').css('display','inline');
										//jQuery('.cancelBrk').css('display','inline');
										jQuery('.cancel').css('display','inline');
										jQuery('#updateBreaks').css('display','none');
										jQuery('#cancelBreaks').css('display','none');
										jQuery('#deleteBreaks').css('display','none');
									}
								});	
							}
					    }
			      }
	        });
   } 
	
	

	
	