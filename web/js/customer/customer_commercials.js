
var customer_id = "", channel = $("#channel").val();
$(function() {
	selComm = "";
	if($.cookie('selectedComm')!=null){
		selComm = $.cookie('selectedComm');
	}
	$('#itemsSelected').val(selComm);
	if ($.cookie("custId") != null ){
		customer_id = $.cookie("custId");
	}
	loadContent(1);
	$('#filter').focus();
	var commId = [], commercialsId="", itemsSelected = "";
	itemsSelected = $('#itemsSelected').val();  		
});

load_advt_types();
function load_advt_types(){
    $.ajax({
	    dataType: "json",
	    url: '/advertisement_types',
	    success: function( result) {
			var advt_type_list = [], options = "", hasCommercialStr = false;
			if( !result.ad_types ){
				console.log("Empty advt_type....");
				return false;
      		}

			advt_type_list = result.ad_types;
			var i = 0, len = advt_type_list.length, item = "";
			for(i; i<len; i++){
				item = "";
				item = advt_type_list[i];
				if (item.time_consumable != false){
					options += '<option value="'+item.ad_type_identity+'">'+item.name+'</option>';  
					//checking is "commercial" name advt exists.
					if(item.name.toLowerCase() == "commercial"){
						hasCommercialStr = true;
					}
				}
			}
			//one more option to attach ro scan copy.
			options += "<option value='ro_scan'>Ro Scan</option>";
			$("#media_advt_types").html(options);

			//if "commercial" advt name exists, set default as commercial
			if(hasCommercialStr){
				$("#media_advt_types").val("commercial");
			} else {
				//else set first advt_type name as default
				$("#media_advt_types option:eq(0)").attr("selected", true);
			}
			loadContent(1);
	    },
	    error: function(xhr, status, text) {
	        comm_handleAjaxError(error);
	    }
  	});
}

function loadPaginationTabs(){
	var totalRecords = $('#totalCountAfterSearch').val();
	var itemsPerPage = $('#itemsPerPage').val();
	return totalRecords;
}

function loadContent(pageNumber){
	var defaultPage = pageNumber, search = $('#filter').val(), count = 0, url = "", selectedAdType = "";
	var itemsPerPage = $('#itemsPerPage').val(), totalRecords = 0;
	var itemsSelected = $('#itemsSelected').val(), itemsSelectedList = itemsSelected.split(",");

	if(search!=null &&  search!="null" && search!=""){
		url = '/commercials/unused?s={"keyword":["'+search+'"]}&customer_id='+customer_id+'&page='+defaultPage+'&commercialsPerPage='+itemsPerPage;
	} else {
		url = '/commercials/unused?s={}&customer_id='+customer_id+'&page='+defaultPage+'&commercialsPerPage='+itemsPerPage;
	}
	url += "&channel_id="+channel;

	//set advertisement type as page title.
	selectedAdType = $("#media_advt_types").val();
	if (selectedAdType != null){
		$("#comTitle #title").text(selectedAdType);
	}
	
	$.ajax({
		global:true,
		dataType: 'JSON',
		url:url+"&type="+selectedAdType,
		success:function(comList){
			$("#gridview ul").empty();
			$(".sTableWrapper .sTable").empty();
			var data = comList.commercials, i = 0, isSelectedItem = false, j = 0, selectedLen = 0, lowres = "", list_html = "", grid_html = "";
			var com = "", name = "", comId = "", dur = "", shortName = "", fullName = "", thumbnail = "", imgpath = "", thumbnailPathMap = {};
			totalRecords = comList.total_commercials_count;
			count = data.length;
			for (i; i<count; i++) {
				id = data[i]._id;
				isSelectedItem = false, j = 0, selectedLen = 0;
				for(j; j<selectedLen; j++){
					if(data[i]._id == itemsSelectedList[j]){
						isSelectedItem = true;
					}				
				}

				com = data[i];
				name = com.name;
				comId = com._id;
				dur = com.dur;
				shortName = com.name;
				fullName = com.name;
    			thumbnail = ''

				if(name.length>100){
					name = name.substring(0,99) + "..";
				}
				if(shortName.length>20){
					shortName = shortName.substring(0,17)+"..";
				}
	    		if(com.thumbnail!=undefined){
				   thumbnail = com.thumbnail.replace("mw:/","");
				   thumbnail = thumbnail.replace(/'/g,"&#39;");
	    		}
				imgpath = "ads/"+thumbnail;
	    		if(com.lowres!=undefined){
					lowres = com.lowres.replace("mw:/","");
					lowres = lowres.replace(/'/g,"&#39;");
	    		}
	    		thumbnailPathMap[comId] = imgpath;

				list_html += "<tr>"
								+"<td align='center' width='10%'><img src='"+imgpath+"' alt='"+imgpath+"' class='cust_media_list' data='"+comId+"' onclick=playVideo('"+comId+"') style='width:50px;height:50px'/></td>"
								+"<td width='70%'>"+name+"</td>"
								+"<td width='10%'>"+dur+"</td>"
							+"<td width='15%'>";
	            if(isSelectedItem){
	            	list_html += "<button class='checked' onclick=updateCommercialsList(this.id) id='commercialId_"+comId+"' name='commId'  data-value="+comId+" disable='true'>"
	                				+"<i class='fa fa-check'></i> Attached"
	                		 	+"</button>"
	            } else {
	            	list_html += "<button onclick=updateCommercialsList(this.id)  id='commercialId_"+comId+"' name='commId' data-value="+comId+">Attach</button>"
	            }
	    		list_html += "</td></tr>";

				if(name.length>25){
					name = name.substring(0,25) + "..";
				}

				grid_html += "<li ><div class='thumb'>"
									+"<div class='hover'>"
										+"<img src='"+imgpath+"' alt='' class='cust_media_list' data='"+comId+"' style='width:138px'/>"
										+"<div class='info' style='width:138px;'>"
											+"<p>"
												+"<label>Name:</label>+ <span style='word-break:break-all;'>"+name+"</span>"
											+"</p>"
											+"<p>"
												+"<label>Dur:</label>"
												+"<span>"+dur+"</span>"
											+"</p>"
										+"</div>"
									+"<div>";
				if(isSelectedItem){
					grid_html += "<input type='checkbox' class='checkbox' style='margin-top:5px;' onchange=updateCommercialsGrid(this.id)   id='commercialId_"+comId+"' name='commId'  value="+comId+" checked>";
				}else{
					grid_html += "<input type='checkbox' class='checkbox' style='margin-top:5px;' onchange=updateCommercialsGrid(this.id)  id='commercialId_"+comId+"' name='commId'  value="+comId+">";
				}
				grid_html += "<span id='fileName_"+comId+"' class='fileName' onclick=playVideo('"+comId+"')><i class='fa fa-info-circle'></i> "+shortName+"</span>"
									+"</div>"
								+"</div>"
							+"</li>";
			}

			$(".sTableWrapper .sTable").html(list_html);
			$("#gridview ul").html(grid_html);

			 //setting img path after loading of dynamic html elements, to avoid skipping apstrophe during dynamic construction.
            setTimeout(function(){
                var data = "", path = "";
                $(".cust_media_list").each(function(){
                    data = "", path = "";
                    data = $(this).attr("data"); //comId
                    path = thumbnailPathMap[data];
                    $(this).attr("src", path); //set actual img path.
                    $(this).attr("alt", "NO IMAGE FOUND"); //set alternative img path.
                });
            }, 300); 
			
			//var totalRecords = loadPaginationTabs();
			if(pageNumber==1){
			  	$("#paginationTab").pagination({
			  		items: totalRecords,
			  		itemsOnPage: itemsPerPage,
			  		cssStyle: 'light-theme',
			  		onPageClick:function(pageNumber, event){
			  			loadContent(pageNumber);
				 	}
				});
			}
			//to close attach media dialog for ESC key press.
			$("#filter").focus();
			if(comList.totalPageCount>1){
				$("#paginationTab").show();
			} else {
				$("#paginationTab").hide();
			}

		},
		error: function(error){
	  		comm_handleAjaxError(error);
		}
	}); 
}

//show info div on mouseover of grid info icon.
$(document).on("mouseenter", "li .fa-info-circle", function() {
	var t = $(this).closest("li");
	t.find('.info').stop(true,true).fadeIn('slow');
});

//hide info div on mouseleave of grid info icon.
$(document).on("mouseleave", "li .fa-info-circle",function(){
	var t = $(this).closest("li");
	t.find('.info').stop(true,true).fadeOut('slow');
});

$('#filter').keypress(function(event) {
	if (event.keyCode == 13) {
		loadContent(1);
	}
});

function playVideo(id){
	$.ajax({
		type:"GET",
		url:"/commercials/"+id,
		success:function(data){

			$('#playVideo').dialog({
				width:650,
				height:450,
				modal:true,
				title: data['commercial']['name'],
				autoOpen:false,
				close:function() {
				  $("video")[0].pause();
				}
			});
			var lowres = data['commercial']['lowres'].replace("mw:/","");
			//lowres = lowres.replace(/'/g,"&#39;");
			var str = '<video width="560" height="340" controls > <source src="ads'+lowres+'" type="video/ogg"></source></video>';
			$('#playVideo').html(str);
      		$('#playVideo').dialog('open');
		},
		error: function(error){
	      comm_handleAjaxError(error);
	    }
	});	
}

$("#list").click(function(){ //click event on list icon.
	$("#list, #gridview, #cust_attach_clips").hide();
	$("#grid, #listview").show();
});

$("#grid").click(function(){ //click event on grid icon.
	$("#list, #gridview, #cust_attach_clips").show();
	$("#grid, #listview").hide();
});

function updateCommercialsList(id){
	var isChecked = false, com_id = "", temp = [], i = 0, len = 0, cust_id_len = 0
	selComm = "";
	if($.cookie('selectedComm')!=null){
	    selComm = $.cookie('selectedComm');
	}
	if( $(".sTable tr #"+id).hasClass('checked') ){
	    $(".sTable tr #"+id).removeClass('checked');
	    $(".sTable tr #"+id).html("Attach");
	} else {
	    $(".sTable tr #"+id).addClass('checked');
	    $(".sTable tr #"+id).html("<i class='fa fa-check'></i> Attached")
	}
	isChecked =  $(".sTable tr #"+id).hasClass('checked');
	//cust_id = $('#id').val();
	cust_id_len = $('#id').length;
	
	if(!isChecked  && cust_id_len!=0){ 
		com_id = id.split("_");
		checkLogsScheduled(com_id[1]);
		if(logs_scheduled>0){
			jAlert("Cannot delte this clip from customer, logs are  generated for this clip");
			$(".sTable tr #"+id).prop('checked',true);
			return false;
		}
	}
	
	if(isChecked && selComm!=null){
		com_id = id.split("_");
		selComm = selComm + com_id[1] + ",";
	}else{
		com_id = id.split("_");
		selCommArr =  selComm.split(",");
		temp = [], i = 0, len = selCommArr.length;
		
		for (i; i<len; i++){
			if(selCommArr[i]!=com_id[1]){
				temp.push( selCommArr[i]);
			}
		}
		selComm = temp.toString();
	}
	$.cookie('selectedComm',selComm);
}

function updateCommercialsGrid(id){
	var isChecked = false, com_id = "", cust_id_len = 0, temp = [], i = 0, len = 0;
	if($.cookie('selectedComm')!=null){
	    selComm = $.cookie('selectedComm');
	} else {
		selComm = [];
	}
	isChecked =  $("#gridview ul #"+id).prop('checked');
	com_id = id.split("_");
	cust_id_len = $('#id').length;
	if(!isChecked && cust_id_len!=0){
		checkLogsScheduled(com_id[1]);
		if(logs_scheduled>0){
			jAlert("Cannot delte this clip from customer, logs are generated for this clip");
			$("#gridview ul #"+id).prop('checked',true);
			return false;
		}	
	}
	
	if(isChecked && selComm!=null){
		com_id = id.split("_");
		selComm = selComm + com_id[1] + ",";
	} else{
		selCommArr =  selComm.split(",");
		temp = [], i = 0, len = selCommArr.length;
		for (i; i<len; i++){
			if(selCommArr[i]!=com_id[1]){
				temp.push( selCommArr[i]);
			}
		}
		selComm = temp.toString();
	}
	$.cookie('selectedComm',selComm);
}
