$.validator.addMethod("isTimeElapsed", function (value,element){
   	var hhmmss;
   	var stDate = $("#startDate").val();
    var pgStDate  =[];
   	if(stDate!=undefined)
    var pgStDate = stDate.split("/");
   	
   	var hhmmss =[];
   	var curTime = new Date();
   	hhmmss = value.split(":");
   	
   	if(pgStDate!=undefined && pgStDate.length>0)
   	var month = parseInt(pgStDate[1])-1;
   	
   	if(pgStDate!=undefined && pgStDate.length>2  && hhmmss!=undefined && hhmmss.length>2)
   	var pgmDt = new Date(pgStDate[2],month,pgStDate[0],hhmmss[0],hhmmss[1],hhmmss[2],00);
   	else{
   	  alert("something is wrong::::::::"+pgStDate);	
      var pgmDt = new Date();
   	}
   	
    if(pgmDt<curTime){
   		return false;
   	}
   	else{
   		return true;
   	}
  },"Start time elapsed");
 	    
 function isTodaysTime(value){
	var endTime=[0,0,0],duration,startTime;
	duration = value.split(":");
	startTime = $("#startTime").val().split(":");
	
	if(startTime!=undefined && startTime.length>2){
		endTime[0]=parseInt(startTime[0])+parseInt(duration[0]);
		endTime[1]=parseInt(startTime[1])+parseInt(duration[1]);
		endTime[2]=parseInt(startTime[2])+parseInt(duration[2]);
	
	
//	alert(endTime[0] +":"+endTime[1]+":"+endTime[2]);
	
		if(endTime[2]>=60){
			endTime[2]= endTime[2]-60;
			endTime[1]=endTime[1]+1;
		}
		if(endTime[1]>=60){
			endTime[1]= endTime[1]-60;
			endTime[0]=endTime[0]+1;
		}
		 if(endTime[0]<0 || endTime[0]>24){
			 jAlert("End time exceeds 12 AM");
	   		return false;
	   	}
		else if(endTime[1]<0 || endTime[1]>60 ){
			jAlert("End time exceeds 12 AM");
			return false;
		}
		
		else if(endTime[2]<0 || endTime[2]>60){
			jAlert("End time exceeds 12 AM");
			return false;
		}
		else if(endTime[0]==24 && (endTime[1]>0 || endTime[2]>0)){
			jAlert("End time exceeds 12 AM");
			return false;
		}
	}else{
		return false;
	}
	 return true;
	
  }

function validateBreaktime(st,ed){
	
	var brksttime = $("#brkStartTime").val();
	var duration = $("#brkDuration").val();
	
	pst = [];
	if(st!=undefined)
 	  var pst = st.split(":");
	
	ped = [];
	if(ed!=undefined)
	   var ped = ed.split(":");
	
	
	if(brksttime!=undefined)
	   var brksttime = brksttime.split(":");
	
	var dur = [];
	if(duration!=undefined)
	   var dur = duration.split(":");
	
	
	if(brksttime!=undefined && brksttime.length>2){
		if(isNaN(brksttime[0])||isNaN(brksttime[1])||isNaN(brksttime[2])){
		  jAlert("Invalid start time");
		   return false;
	    }
	

		if(brksttime[0]<0 || brksttime[0]>24 || brksttime[1]<0 || brksttime[1]>60 || brksttime[2]<0 || brksttime[2]>60){
			jAlert("Invalid start time");
			return false;
		}
	
		if(brksttime[0]=="" || brksttime[1]=="" || brksttime[2]==""){
			jAlert("Invalid start time");
			return false;
		}
	}else{
        jAlert("Please Enter Break Start time");		
		return false;
	}
	
	if(dur!=undefined && dur.length>2){
		if(isNaN(dur[0])||isNaN(dur[1]) ||isNaN(dur[2])){
			jAlert("Invalid duration");
			return false;
		}
		
		if(dur[0]<0 || dur[0]>24 || dur[1]<0 || dur[1]>60 || dur[2]<0 || dur[2]>60){
			jAlert("Invalid duration");
			return false;
		}
	
		if(dur[0]=="" || dur[1]=="" || dur[2]==""){
			jAlert("Invalid duration");
			return false;
		}
	}else{
		 jAlert("Please Enter Break Duration");		
			return false;
	}

		
	var stTime = new Date(2000,01,12,pst[0],pst[1],pst[2],00);
	var endTime = new Date(2000,01,12,ped[0],ped[1],ped[2],00);
	var breakstTime = new Date(2000,01,12,brksttime[0],brksttime[1],brksttime[2],00);
	var breakendTime = new Date(2000,01,12,dur[0],dur[1],dur[2],00);
	var arr=[0,0,0];
	arr[0]=parseInt(dur[0])+parseInt(brksttime[0]);
	arr[1]=parseInt(dur[1])+parseInt(brksttime[1]);
	arr[2]=parseInt(dur[2])+parseInt(brksttime[2]);
	if(arr[2]>=60){
		arr[2]=arr[2]-60;
		arr[1]=arr[1]+1;
	}
	if(arr[1]>=60){
		arr[1]=arr[1]-60;
		arr[0]=arr[0]+1;
	}
	breakendTime = new Date(2000,01,12,arr[0],arr[1],arr[2],00);
	
	var brEd,hh = arr[0],mm = arr[1],ss = arr[2];
	if(hh<10){
		hh = "0" + hh;
	}
	if(mm<10){
		mm = "0"+ mm;
	}
	if(ss<10){
		ss = "0" + ss;
	}
	brEd = hh + ":" + mm + ":" + ss;
	
	console.log("brstart:"+breakstTime);
	
	console.log("brEd:"+breakendTime);
	
	console.log("st time:"+stTime);
	
	console.log("ed time:"+endTime);
	
	$("#brkEndTime").val(brEd);
	
	if(endTime<breakstTime){ 
		jAlert("Break start time exceeds program end time");
		return false;
	}else if(breakstTime<stTime){
		jAlert("Break start time is before program start time");
		return false;
	}else if(endTime<breakendTime){
		jAlert("Break end time exceeds program end time");
		return false;
	}else if(breakendTime<stTime){
		jAlert("Break end time is before program start time");
		return false;
	}
	return true;
}

function validateDuration(){
	var hhmmss = $("#duration").val();
	
	hhmmss = hhmmss.split(":");
	console.log("HHMMSS"+hhmmss)
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

function getDuration(startTime,endTime){
	var yr = 2014, month = 01, dt = 15;
	var brSt =[];
	if(startTime!=undefined)
	   var brSt = startTime.split(":");
	var brEnd = [];
	if(endTime!=undefined)
	   var brEnd = endTime.split(":");
	
	if(brSt!=undefined && brSt.length>2)
	var start = new Date(yr,month,dt,brSt[0],brSt[1],brSt[2],0);
	else
		var start = new Date();
	
	if(brEnd!=undefined && brEnd.length>2)
	var end = new Date(yr,month,dt,brEnd[0],brEnd[1],brEnd[2],0);
	else
		end = new Date();
	
	var milisecdiff =  end-start;
	var hh,mm,ss;
	 ss = parseInt((milisecdiff / 1000) % 60);
	 mm = parseInt((milisecdiff / (1000 * 60)) % 60);
	 hh = parseInt((milisecdiff / (1000 * 60 * 60)) % 24);
	
    var dur = "";
    
    if(hh<10){
    	hh = "0"+hh;
    }
    if(mm<10){
    	mm = "0"+mm;
    }
    if(ss<10){
    	ss = "0"+ss;
    }
    
    dur = hh+":"+mm+":"+ss;
    
    return dur;
}

function formatTime(str){
	 var ts = "";
	 ts = str;
	 if(ts!=undefined)
    	 var ti = ts.split(":");
	 
	 if(ti!=undefined && ti.length>2){
		 hh =  parseInt(ti[0]) + 100; 
		 hh = hh + "";
		 mm = parseInt(ti[1]) + 100;
		 mm = mm + "";
		 ss = parseInt(ti[2]) + 100;
		 ss = ss + "";
		 var fmtTime =  hh.valueOf(hh).substr(1)+ ":" +  mm.valueOf(mm).substr(1) + ":"+  ss.valueOf(ss).substr(1);
		 return fmtTime;
	 }else{
		 alert("something is wrong:::"+str);
	 }
}


/*function checkSlotAvailable(id){
	var startDate,startTime,duration;
	startDate = $("#startDate").val();
	startTime = $("#startTime").val();
	duration = $("#duration").val();
	var flag = true;
	jQuery.ajax({
		async: false,
		type : "GET",
		url : "/program/checkSlotAvailablity",
		data : {"progStartDate" : startDate,"startTime":startTime,"duration":duration,"id":id},
		success : function(data) {
			if(data.conflict!=""){
				jAlert("Program conflicts with "+data.conflict);
				flag = false;
			}
			else{ 
				flag = true;
			}
		}
	});
	return flag;
}*/

/*function checkSlotAvailableForMaster(id){
	var startTime,duration;
	startTime = $("#startTime").val();
	duration = $("#duration").val();
	var daysOfWeek= $.merge([], jQuery('#daysOfWeek').val());
	var daysOfWeekSelected = daysOfWeek.join(",");
	var flag = true;
	jQuery.ajax({
		async: false,
		type : "GET",
		url : "/program/checkSlotAvailablityForMaster",
		data : {"daysOfWeek" : daysOfWeekSelected,"startTime":startTime,"duration":duration,"id":id},
		success : function(data) {
			if(data.conflict!=""){
				jAlert("Program conflicts with "+data.conflict);
				flag = false;
			}
			else{ 
				flag = true;
			}
		}
	});
	return flag;
}*/


