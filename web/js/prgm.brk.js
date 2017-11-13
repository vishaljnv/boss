function validateBreaktime(){
	var st = $("#startTime").val();
	var ed = $("#endTime").val();
	var brksttime = $("#brkStartTime").val();
	var brkedtime = $("#brkEndTime").val();
	var duration = $("#duration").val();

 	var pst = st.split(":");
	var ped = ed.split(":");
	var brksttime = brksttime.split(":");
	var brkedtime = brkedtime.split(":");
	var dur = duration.split(":");

	if(isNaN(brksttime[0])||isNaN(brksttime[1])||isNaN(brksttime[2])){
		jAlert("Invalid start time");
		return false;
	}
	

	if(brksttime[0]<0 || brksttime[0]>24 || brksttime[1]<0 || brksttime[1]>60 || brksttime[2]<0 || brksttime[2]>60){
		jAlert("Invalid start time");
		return false;
	}
	
	if(dur[0]<0 || dur[0]>24 || dur[1]<0 || dur[1]>60 || dur[2]<0 || dur[2]>60){
		jAlert("Invalid duration");
		return false;
	}

	if(isNaN(dur[0])||isNaN(dur[1])||isNaN(dur[2])){
		jAlert("Invalid duration");
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
	$("#brkEndTime").val(arr[0]+":"+arr[1]+":"+arr[2]);
	if(endTime<breakstTime){ 
		jAlert("Break start time exceeds prgm end time");
		return false;
	}else if(breakstTime<stTime){
		jAlert("Break start time is before prgm start time");
		return false;
	}else if(endTime<breakendTime){
		jAlert("Break end time exceeds prgm end time");
		return false;
	}else if(breakendTime<stTime){
		jAlert("Break end time is before prgm start time");
		return false;
	}
	return true;
}

function validateDuration(){
	var hhmmss = $("#duration").val();
	hhmmss = hhmmss.split(":");
	if(isNaN(hhmmss[0])||isNaN(hhmmss[1])||isNaN(hhmmss[2])){
		jAlert("Invalid duration");
		return false;
	}
	if(hhmmss[0]<0 || hhmmss[0]>24 || hhmmss[1]<0 || hhmmss[1]>60 || hhmmss[2]<0 || hhmmss[2]>60){
		jAlert("Invalid duration");
		return false;
	}
	else{
		return true;
	}
}