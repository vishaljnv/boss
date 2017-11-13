

$(function() {
	channel = $("#channel").val();
	com_load_advt_types();
	$('#filter').focus();
});

function loadPaginationTabs(){
	var totalRecords = $('#totalCountAfterSearch').val();
	var itemsPerPage = $('#itemsPerPage').val();
	return totalRecords;
}

function com_load_advt_types(){
    $.ajax({
        dataType: "json",
        url: 'advertisement_types',
        success: function( result) {
          advt_type_list = [];
            if(result.ad_types == undefined){
                console.log("Empty Advt Types");
                return;
            }
            advt_type_list = result.ad_types;

            var options = "";
            for(var i=0; i<advt_type_list.length; i++){
            if (advt_type_list[i].time_consumable != false){
                var name = advt_type_list[i].name;
                var advt_identity = advt_type_list[i].ad_type_identity
                options += '<option value="'+advt_identity+'">'+name+'</option>';  
            }
            }
            options = options + "<option value='ro_scan'>Ro Scan</option>"
            $("#com_advt_types").html(options);
            //$("#com_advt_types").val("commercial")
            loadContent(1);
        },
        error: function(xhr, status, text) {
            comm_handleAjaxError(xhr);
        }
    });
}


function loadContent(pageNumber){
    var count = 0, totalRecords = 0, selected  =  "", defaultPage = pageNumber, search = $('#filter').val();
    var itemsPerPage = $('#itemsPerPage').val();
    var url = 'commercials?page='+defaultPage+'&commercialsPerPage='+itemsPerPage+"&channel_id="+channel;

    if(search!=null &&  search!="null" && search!=""){
      url += '&s={"keyword":["'+search+'"]}';
    } else{
      url += '&s={}';
    }
    selected = $("#com_advt_types").val();
    type = selected;
    if (type != null){
		$("#comTitle #title").text(type);
    }

    $.ajax({
        global:true,
        dataType: 'JSON',
        url:url+"&type="+type,
        success:function(comList){
            $("#gridview ul, .sTableWrapper .sTable").empty();
            if(!comList.medias || comList.medias == undefined || comList.medias.length == 0){
                $("#media_paginationTab").empty();
            }

            var list_html = "", grid_html = "", thumbnailPathMap = {};
            if(comList.medias!=undefined || comList.medias.length){
                var mediaList = comList.medias;
                totalRecords = comList.total_media_count;

                for (var i=0; i<mediaList.length; i++) {
                    var com = mediaList[i], product_type = "", language = "", version = "", cu_id = "", name = com.name, comId = com._id, dur = com.dur, shortName = com.name, fullName = com.name, thumbnail = "";
                    var imgpath = "ads/"+thumbnail, lowres = "";

                    if("thumbnail" in com){
                        thumbnail = com.thumbnail.replace("mw:/","");
                        thumbnail = thumbnail.replace(/'/g,"&#39;");
                    }
                    if("lowres" in com){
                        lowres = com.lowres.replace("mw:/","");
                        lowres = lowres.replace(/'/g,"&#39;");
                    }
                    if("product_type" in com && com.product_type != null){
                        product_type = com.product_type;
                    }
                    if("language" in com && com.language != null){
                        language = com.language;
                    }
                    if("version" in com && com.version != null){
                        version = com.version;
                    }
                    if(name.length>100){
                        name = name.substring(0,99) + "..";
                    }
                    if(shortName.length>20){
                        shortName = shortName.substring(0,17)+"..";
                    }
                    if("customer_id" in com){
                        cu_id = com.customer_id;
                    }

                    if(cu_id !=undefined && cu_id != null && cu_id != "null" && cu_id!=""){
                        $.ajax({
                            async : false,
                            url : "customers/"+cu_id,
                            dataType:"json",
                            success : function(data) {
                                if(data.customer!=undefined){
                                    cust_com_list = data.customer['commercials']
                                    for(var k=0; k<cust_com_list.length; k++){
                                        var cust_com_dict = cust_com_list[k];
                                        if(cust_com_dict['id']==com._id){
                                            ver = cust_com_dict['version_id'];
                                        }
                                    }
                                }
                            }
                        });
                    }
                    //map to set img src after construction of html element, to avoid skipping of img path having apstrophe.
                    thumbnailPathMap[comId] = imgpath;
         
                    list_html += "<tr>"+              
                    "<td align='center' width='10%'><img src='' class='media_list' data='"+comId+"' style='width:50px;height:50px;cursor: pointer;' onclick=playVideo('"+comId+"') /></td>"
                    +"<td width='70%'>"+name+"</td>"+"<td width='10%'>"+language+"</td>"+"<td width='10%'>"+version+"</td>"
                    +"<td width='10%'>"+dur+"</td>"+ "<td width='10%'>"+product_type+"</td>" 
                    +"<td align='center' width='10%'><a class='deleteimage' id='"+comId+"' name='"+fullName+"'>Delete</a></td>"+"</tr>";


                    //media grid view construction.
                    if(name.length>30){
                        name = name.substring(0,30) + "..";
                    }
                    var infoClipName = com.name;
                    if(infoClipName.length > 80){
                    	infoClipName = infoClipName.substring(0,78)+"..";
                    }
                    grid_html += "<li class='media_grid_li'>"
                    					+"<div class='thumb' id='thumb_"+comId+"'>"
                    						+"<div class='hover'>"
                    							+"<img src='' class='media_list' data='"+comId+"' style='width:138px'/>"
                    							+"<div id='info_"+comId+"' class='info media_info_wrapper'>"
	                    							+"<p class='media_grid_info_name' style='word-break: break-all;'>"+infoClipName+"</p>"
								                    +"<p class='media_grid_dur'>"+dur+"</p>"
								                    +"<p class='media_info_prdc_type' style='word-break: break-all;'>"+product_type+"</p>"
								                    +"<p class='media_info_lang' style='word-break: break-all;'>"+language+"</p>"
							                	+"</div>"
							            		+"<div class='media_name_div'>"
									            	+"<span id='fileName_"+comId+"' class='fileName media_name'>"+shortName+"</span>"
									            	+"<p class='menu media_grid_action_wrapper'>"
								                    	+"<a class='media_grid_icon' onclick=playVideo('"+comId+"') title='Play Media'><i class='fa fa-play'></i></a>"
								                    	+"<a class='delete media_grid_icon' id='"+comId+"' name='"+fullName+"' title='Delete Media'><i class='fa fa-trash'></i></a>"
								                    +"</p>"
								                +"</div>"
								            +"</div>"
							            +"</div>"
							        +"</li>";

                }
                $("#gridview ul").html(grid_html);
                $(".sTableWrapper .sTable").html(list_html);  

                //setting img path after loading of dynamic html elements, to avoid skipping apstrophe during dynamic construction.
                setTimeout(function(){
                    var data = "", path = "";
                    $("#commercialInfo .media_list").each(function(){
                        data = "", path = "";
                        data = $(this).attr("data"); //comId
                        path = thumbnailPathMap[data];
                        $(this).attr("src", path); //set actual img path.
                        $(this).attr("alt", "NO IMAGE FOUND"); //set alternative img path.
                    });
                }, 300);        

                if(pageNumber==1 && comList.medias.length ){
                    $("#media_paginationTab").pagination({
                        items: totalRecords,
                        itemsOnPage: itemsPerPage,
                        cssStyle: 'light-theme',
                        onPageClick:function(pageNumber, event){
                            loadContent(pageNumber);            
                        }
                    });
                }
            }
        },
        error: function(xhr, status, text) {
            comm_handleAjaxError(xhr);
        }
    }); 
}


$(document).on("mouseenter", ".media_name", function() {
	var comId = $(this).attr('id').split("_")[1];
	$(".info").hide();
	$("#info_"+comId).slideDown();
});

$(document).on("mouseleave", ".media_name", function(){
	var comId = $(this).attr('id').split("_")[1];
	$("#info_"+comId).fadeOut();
});

function generatePagination(currentPage){
	var url = "";
	var currentPageNo = currentPage;
	var search = $('#filter').val();
	var itemsPerPage = $('#itemsPerPage').val();
    if(search == ""){
        search = "null";
    }

    var dataString = currentPageNo+"&"+itemsPerPage+"&"+search + "&channel_id="+channel;
    url="commercials/"+dataString+"/getInfo";
    $.ajax({
        url:url,
        success:function(data){
            $('#commercialInfo').html(data);
        },
        error: function(xhr, status, text) {
           comm_handleAjaxError(xhr);
        }
    });
}

function searchTags(){
	var search = $('#filter').val();
	if(search!=""){
		loadContent(1);
	}
} 

$('#filter').keypress(function(event) {
	if (event.keyCode == 13) {
		loadContent(1);
	}
});

function playVideo(id){
	$.ajax({
		type:"GET",
		url:"commercials/"+id,
		success:function(data){
            console.log("dataaaaaaaaaaaa"+JSON.stringify(data))
            if(data && data.commercial.sid!='ro_scan'){
            console.log('if blkkkkkkkkkkkk')
			var lowres = data['commercial']['lowres'].replace("mw:/","");
			var str = '<video width="560" height="340" controls > <source src="ads'+lowres+'" type="video/ogg"></source></video>';
			$('#playVideo').html(str);

            $('#playVideo').dialog({
            width:650,
            height:450,
            modal:true,
            title:"video Details",
            autoOpen:false,
            close:function() {
            $("video")[0].pause();
            }
           });
           $('#playVideo').dialog('open');
           }else{
            console.log("in else blkkkkkkkkkkkkkkk")
            var thumbnail = data.commercial.thumbnail.replace("mw:/","");
            var thumbnail = thumbnail.replace(/'/g,"&#39;");
            thumbnail = 'ads/' + thumbnail
            $('#view_ro_scan').dialog({
            width:1000,
            height:900,
            modal:true,
            title:"RO Details",
            });
            $("#view_ro_scan #ro_scan_view").prop('src',thumbnail)
           }
		},
        error: function(xhr, status, text) {
            comm_handleAjaxError(xhr);
        }
	});	
	
}

$("#list").click(function(){
	$("#list, #gridview").hide();
	$("#grid, #listview").show();
});

$("#grid").click(function(){
    $("#listview, #grid").hide();
	$("#list, #gridview").show();
});

$('#commercials_list').on("mouseover","tr",function(event){
    $(this).css({background:"#C8D9E8"});	  	
});

$('#commercials_list').on("mouseout","tr",function(event){
    $(this).css({background:"#ffffff"}); 
});

$(".thumb .view").colorbox({rel:'view'});
$(".listview .view").colorbox({rel:'listview'});

$(document.body).on('click', '.thumb .delete' ,function(event){
	event.preventDefault();
    var id  = $(this).attr('id');    
    deleteMedia(id);
});

$(document.body).on('click', '.deleteimage' ,function(event){
    event.preventDefault();
    var id  = $(this).attr('id');    
    deleteMedia(id);
    return false;
});

function deleteMedia(id){
    jConfirm("Are you sure you want to delete","Delete Commercial",function(response){
        if(response){
            $.ajax({             
                type:"DELETE",
                url:"commercials/"+id,
                success:function(data){
                    loadContent(1);
                },
                error: function(xhr, textStatus, errorThrown) {
        			comm_handleAjaxError(xhr);
        		}
            });
        }
    });
}

$('.submenu a').click(function(){
    var id = $(this).attr('href');
    $('.submenu a').each(function(){
        $(this).parent().removeClass('current');
        $($(this).attr('href')).hide();
    });
    $(this).parent().addClass('current');
    $(id).fadeIn();
});