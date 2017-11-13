var product_type_list = []


 var  prod_type_clip_map = {};
 var lang_type_clip_map = {};
 var ver_clip_map = {}

 var vertical_list_map = {}

 var caption_map = {}
 var comID_map = {}
 var vertical_map = {}
 var sub_vertical_map = {}
 var from_ro = false;

var ibf_agency_list = []
var non_ibf_agency_list = []

$(function(){ 
   //get_product_types()
   get_verticals_list()
   get_agencies()

if($.cookie("from_ro")!=undefined){
	from_ro = $.cookie("from_ro")
}
})


$("#agency_type").change(function(){
       var agn_type = $("#agency_type").val()
      if(agn_type!=undefined && agn_type!="0"){
      	 $("#agency_div").show()
         if(agn_type=="ibf"){
         	get_agencies("ibf")
         }else if(agn_type=="non_ibf"){
         	get_agencies("non_ibf")
         }else if(agn_type=="all"){
         	get_agencies();
         }
       }else if(agn_type!=undefined && agn_type=="0"){
       	 $("#agency_div").hide()
       }
 })


jQuery.ajax({
		url : "languages",
		type : 'GET',
		dataType : "json",

		success: function(json) {
			for (hash in json) {
				//console.log("hasssss"+hash)

				for (i = 0; i < json[hash].length; i++) {

					jQuery('#lang_id').append(jQuery('<option></option>').val(json[hash][i]).html(json[hash][i]));
				}
			}
		},
		error: function(xhr, status, text) {
                                       var response = $.parseJSON(xhr.responseText);

                                       var err = response.errors;

                                       //if (response) {
                            	if(err.toString()=='session_expired')
                          {
                          window.location.href= "index.html";
                           } 
                        else{  
                                           jAlert(err.toString());
                                       }
                                   }

	});

$('#customersSync').click(function(){
		console.log("HHHHHHHHHHHHH")
	    var url = "/sync_customers";
	 	jQuery.ajax({
	 		type: "GET",
	 		url: url,
	 		success: function(data){
	 			jAlert("Sync Successfull");
	 		},
	 		error: function(xhr, status, text){
	 			var response = $.parseJSON(xhr.responseText);
			    var err = response.errors;
			
			     //   if (response) {
			    if(err.toString()=='session_expired')
	            {
	                window.location.href= "index.html";
	            } 
	            else{   	
			        jAlert(err.toString());
			    }
	 		}
	 	});
	 });

function getSelectedVideos(){
	var selectedVideosId=jQuery('#commercialId').val();
	var selectedVideos = selectedVideosId.split(",");

		for(i=0;i<selectedVideos.length;i++){
			jQuery('input#commercialId_'+selectedVideos[i]).attr("checked",true);
		}
}

$.ajax({
		url : "branches",
		type : 'GET',
		dataType : "json",
		success: function(json) {
			for (hash in json) {
				for (i = 0; i < json[hash].length; i++) {
					$('#branch').append($('<option></option>').val(json[hash][i]['_id']).html(json[hash][i]['name']));
				}
			}
		},
		error: function(xhr, status, text) {
                                       var response = $.parseJSON(xhr.responseText);

                                       var err = response.errors;

                                       //if (response) {
                            	if(err.toString()=='session_expired')
                          {
                          window.location.href= "index.html";
                           } 
                        else{  
                                           jAlert(err.toString());
                                       }
                                   }

	});

function get_verticals_list(){
	//console.log("get_verticals_list::::::::::")
     $.ajax({
		url : "verticals",
		type : 'GET',
		dataType : "json",
		success: function(json) {
			var verticals_list = []
			if(json.verticals!=undefined){
               verticals_list = json.verticals
               for(var i=0;i<verticals_list.length;i++){
                var vert_name = verticals_list[i]['name']
                var sub_vert = verticals_list[i]['sub_verticals']
               	vertical_list_map[vert_name] = sub_vert
               }
			}
		}
   })
}

function attach_clips(){
	
	 if($.cookie('selectedComm')!=null){
		    selComm = $.cookie('selectedComm');
		    //console.log(selComm);
		    if (selComm!=null && selComm!="0")
		    jQuery('#commercialId').val(selComm.toString());
		     else
		     	jQuery('#commercialId').val("");
		    displayThumbnail();
	    }
		jQuery("#viewCommercials").dialog ('destroy').remove();
}

function display_each_clip(comId){
	       console.log("display_each_clip")
           each_clip_html = "";

            row_id = "r_"+comId
            checkbox_id = "c_"+comId

            clip_name_trim = name;
            if(name!=undefined && name.length>35){
            	clip_name_trim = name.substring(0,35) + "...";
            }

            clip_title = "";
            clip_title = name.replace(/\'/g, '44');


            each_clip_html = "<div class='each_com'  id='"+row_id+"'>"+
           			
			"<span class='clip_name' title='"+clip_title+"'>"+
			clip_name_trim+"</span>";

			//var meta_data_opt = meta_data_options(comId);
			var meta_data_opt = attach_meta_data(comId);
			
             //not attaching clip caption
		    //each_clip_html = each_clip_html + meta_data_opt
             
            var del_clp = "<span class='del' id='"+comId+"'><i class='fa fa-times' title='Remove'></i></span>"

            each_clip_html = each_clip_html + del_clp +"</div>"

			return each_clip_html;
}
function get_product_types(){

	$.ajax({
			url : "product_types?channel_id="+channel,
			type : 'GET',
			dataType : "json",
			success: function(json) {
				product_type_list = json.product_types
			},
			error: function(xhr, status, text) {
	                                       var response = $.parseJSON(xhr.responseText);

	                                       var err = response.errors;

	                                       //if (response) {
	                            	if(err.toString()=='session_expired')
	                          {
	                          window.location.href= "index.html";
	                           } 
	                        else{  
	                                 jAlert(err.toString());
	                               }
	                }

		});
}




$(document).off('change',".vertical")
$(document).on('change',".vertical", function(){
	var sel_ver_id = this.id
	if(sel_ver_id!=undefined){
     var sel_ver_val = $(this).val()
     var sub_vet_opts = get_sub_vertical_options(sel_ver_val)  
     clp_id = sel_ver_id.split('_')[1] 
     $('#sub_vertical_'+clp_id).empty()
     $('#sub_vertical_'+clp_id).append(sub_vet_opts)
    }
})


function get_sub_vertical_product_type(clp_id){
	var sub_ver_html = "";
	var prod_type_id = "product_type_"+clp_id
	var prod_type_wapper = "product_type_wrapper_" + clp_id
	var prod_type_html = "<span class='sub_vertical_option'"+ 
	                    "id='"+prod_type_wapper+"'>"+
	                     "<select class='select_cls' id='"+prod_type_id+"'>"

	var prod_options = ""
	for(var i=0;i<product_type_list.length;i++){
		var prod_name = product_type_list[i]['name']
		prod_options = prod_options + 
		             "<option value='"+prod_name+"'>"+prod_name+"</option>"
	}
   
    prod_type_html = prod_type_html +  prod_options + "</select></span>"

    var cap_id = "caption_"+clp_id
    var cap_wrapper = 'cap_wrapper_'+clp_id
    var cap_html = "<span class='sub_vertical_option' style='display:none;'  id='"+cap_wrapper+"' >"+
                   "<input class='inp_cls' id='"+cap_id+"' size='42' type='text'/></span>"

    var com_id = "ID_"+ clp_id
    var com_wrapper = "ID_wrapper_"+clp_id

    var ID_html = "<span class='sub_vertical_option' style='display:none;' id='"+com_wrapper+"'>"+
                  "<input class='inp_cls' id='"+com_id+"'  size='42' type='text'/></span>"

    sub_ver_html = prod_type_html + cap_html + ID_html

    return sub_ver_html
}

function meta_data_options(commer_id){
  //console.log("11111111111")
  var ver_opts = get_vertical_options(commer_id);	
  var sub_ver_opt = get_sub_vertical_product_type(commer_id)
  
  //console.log("sub vertical optionssssssssssss"+sub_ver_opt)
  var meta_data_html = ver_opts + sub_ver_opt
                       
  return meta_data_html                    
}

function get_vertical_options(){
	var vert_opts = ""
	for(each_vert in vertical_list_map){
       if(each_vert.length>15){
       	ver_trim = each_vert.substring(0,15)+'...'
       }else{
       	ver_trim = each_vert
       }   
       vert_opts = vert_opts + '<option value="'+each_vert+'">'
       +each_vert+'</option>'
       
	}
	return vert_opts
}

function tag_meta_data(){

	$(".each_com").each(function(){
            	if($(this).prop('id')!=undefined){
                var  com_id = $(this).prop('id').split("_")[1];

		        comID_map[com_id] = $("#user_com_id_"+com_id).val()
		        caption_map[com_id] = $("#caption_"+com_id).val()
		        vertical_map[com_id] = $("#vertical_"+com_id).val()
		        sub_vertical_map[com_id] = $("#sub_vertical_"+com_id).val()
		        
		        }
                 
             })

}

function get_agencies(type){
		
	var url = "agencies?channel_id="+channel;
	if(type!=undefined && type!=""){
		url = url + "&agency_type="+type
	}
	
  $.ajax({
		url : url,
		type : 'GET',
		dataType : "json",
		async:false,
		success: function(json) {
			for (hash in json) {
				$('#agency_id').empty();
				for (i = 0; i < json[hash].length; i++) {
					$('#agency_id').append($('<option></option>').val(json[hash][i]['_id']).html(json[hash][i]['name']));
				}
				
			}
		},
		error: function(xhr, status, text) {
                                       var response = $.parseJSON(xhr.responseText);

                                       var err = response.errors;

                                       //if (response) {
                          	if(err.toString()=='session_expired')
                          {
                          window.location.href= "index.html";
                           } 
                        else{  
                                           jAlert(err.toString());
                                       }
                                   }

	});
}  	  

function get_attached_clips_metadata(){
	var attached_clips = []
	 $(".each_com").each(function(){
	 	   if($(this).prop('id')!=undefined){
                var clp_id = $(this).prop('id').split("_")[1];
                var clp = {};
                clp["status"] = "active";
				clp['id'] = clp_id

			   /*Commented temporarily for VRL Requirements	
                   
               /* if(prod_type_clip_map[clp_id]!=undefined){
                   clp['product_type'] = prod_type_clip_map[clp_id];
                }else{
                	 clp['product_type'] = 'Any'
                }

                if(lang_type_clip_map[clp_id]!=undefined){
		          clp['lang_id'] = lang_type_clip_map[clp_id];
		        }
		      

		        if(ver_clip_map[clp_id]!=undefined){
		        	clp['version'] = ver_clip_map[clp_id];
		        }*/

		        clp['commercial_id'] = $("#user_com_id_"+clp_id).val()
		        clp['caption'] = $("#caption_"+clp_id).val()
		        clp['vertical'] = $("#vertical_"+clp_id).val()
		        clp['sub_vertical'] = $("#sub_vertical_"+clp_id).val()

                //clp['product_type'] = prod_clip_map[clp_id];
		        //clp['version_id'] = ver_clip_map[clp_id];
               
		        attached_clips.push(clp);
		    }
              
              console.log(attached_clips.length)   
       })
	 return attached_clips
}

function display_tagged_metadata(){
	console.log("Display tagged metadata")
	console.log(JSON.stringify(comID_map))
	console.log(JSON.stringify(caption_map))
	console.log(JSON.stringify(vertical_map))
	console.log(JSON.stringify(sub_vertical_map))

	for(clp in comID_map){
		$("#user_com_id_"+clp).val(comID_map[clp])
	}
	for(clp in caption_map){
		$("#caption_"+clp).val(caption_map[clp])
	}
    var sub_ver_opts  = ""
	for(clp in vertical_map){
		$("#vertical_"+clp).val(vertical_map[clp])
		var sub_ver_opts = get_sub_vertical_options(vertical_map[clp])
		$("#sub_vertical_"+clp).append(sub_ver_opts)
	}
	setTimeout(function(){
		for(clp in sub_vertical_map){
			console.log("sub verical::::"+sub_vertical_map[clp])
			$("#sub_vertical_"+clp).val(sub_vertical_map[clp])
		}
	},500)
}

function get_sub_vertical_options(vertical_name){
	var sub_vert_opts = ""
	console.log("vertical_name:::::::::::"+vertical_name)
    if(vertical_name!=undefined && vertical_name!='0'){
	   var sub_ver_lst = vertical_list_map[vertical_name]
	   for(var j=0;j<sub_ver_lst.length;j++){
	   	if(sub_ver_lst[j].length>18){
	   		sub_ver_tirm = sub_ver_lst[j].substring(0,18)+'...'
	   	}else{
	   		sub_ver_tirm = sub_ver_lst[j]
	   	}
	   	sub_vert_opts = sub_vert_opts + 
	   	'<option title="'+sub_ver_lst[j]+'" value="'+sub_ver_tirm+'">'+sub_ver_tirm+'</option>'
	   }
   }
   return sub_vert_opts
}

function attach_meta_data(commer_id){
	var caption_id = "caption_"+commer_id
	var caption_span = "<span><span class='font_bold'>Caption&nbsp;</span>"+
	"<span><input id='"+caption_id+"' size='60' class='inp_cls' type='text'/></span></span>";
    
    var usr_comm_id = "user_com_id_"+commer_id
	var commercial_id_span = "<span><span class='font_bold'>ID&nbsp;</span>"+
	"<span><input id='"+usr_comm_id+"' class='inp_cls' type='text'/></span></span>";
    
    var com_vertical_id = 'vertical_'+commer_id
   
	var verticals_span = "<span><span class='font_bold'>Vertical&nbsp;</span>"+
	"<select style='width:150px' id='"+com_vertical_id+"' class='select_cls vertical'><option value='0'>----Choose One----</option></select></span>";
   
    
    var sub_ver_com_id = 'sub_vertical_'+commer_id
	var sub_vertical_span = "<span><span class='font_bold'>Sub-vertical&nbsp;</span>"+
	"<select style='width:150px' id='"+sub_ver_com_id+"' class='select_cls'><option value='0'>----Choose One----</option></select></span>";
  
     //Tag only caption for each clip
    //var clp_meta_data = commercial_id_span + caption_span +
                      // verticals_span + sub_vertical_span

    var clp_meta_data = caption_span                    
    return clp_meta_data                   
}

$(".cancelbutton").click(function() {
		if(!from_ro){
			$.ajax({		
				url: "customer/customer_list.html",
				success: function(data) {
					$('#main').html(data);
					
					$.removeCookie('custId', null, { path: '/' });
					$.removeCookie("type",null, {path: '/' });
					$.removeCookie("selectedComm", null, {path: '/' });
					
				}
			});
	   }else{
	   	$("#create-customer-dialogue").dialog("close");
	   	$.removeCookie('from_ro', null, { path: '/' });
	   }
	});