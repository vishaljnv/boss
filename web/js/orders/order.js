  var order_id = 0

  var MODULE_NAME = 'orders'

  var isVertical = true;


  $(function() {

  	if( !$.isEmptyObject(channelConfigObj) ){
        var orderConfig = "";
        //checking for order configurations
        if("order" in channelConfigObj){
            orderConfig = channelConfigObj.order;

            if("vertical_sub_vertical" in orderConfig){
                if(!orderConfig.vertical_sub_vertical){
                    isVertical = false;
                    $(".clp_vertical_mandatory,  .clp_subvertical_mandatory").hide();
                }
            }
        }
    }else{
    	isVertical = false;
    }


  	try{
  		$("#view_tb_info").dialog('close');
  	} catch(e){
  		console.log("dialog not opened");
  	}

  	var isBulkRO = $("#menu_bulk_ro").is(":visible");
	if( !isBulkRO){
		$(".bulk_ro_div").hide();
	}

	/*$("#rate").on("keyup", function(){
		var val = $("#rate").val();
		var reg = new RegExp('^[0-9]+$');
		if( reg.test(val) == false ){
			console.log("Invalid Rate, rate should be in Integers");
			$("#rate").val("");
		}
	});
*/

	$("#all_days").attr("checked", true);
	$("#days_fieldset input.days").each(function(){
		$(this).attr("checked", true);
	});

	$("#all_days").click(function(){
		var isChecked = $("#all_days").is(":checked");
		$("#days_fieldset input.days").each(function(){
			if(isChecked){
				$(this).attr("checked", "checked");
			} else {
				$(this).attr("checked", false);
			}
		});
	});

	$("#days_fieldset input.days").click(function(){
		var days = [];
		$("#days_fieldset input.days").each(function(){
			if( $(this).is(":checked") ){
				days.push($(this).val());
			}
		});

		if(days.length == 7){
			$("#all_days").attr("checked", "checked");
		}
		if(days.length < 7){
			$("#all_days").attr("checked", false);
		}
	});

  	var today = moment().format("DD/MM/YYYY")

  	$(".start_end_dates").datepick({
		rangeSelect: true, 
		//minDate:today,
		monthsToShow: 1,
		showTrigger: '#calImg',
		dateFormat:'dd/mm/yyyy',
		maxDate:'+7m',
		onClose : function(date, picker) {

			var startDate = $("#stDate").val();
			var prevEndDate = $("#edDate").val();
			var endDate = ''
			if(startDate!=""){
				
				endDate = $(".start_end_dates").val().split(" - ")[1]
				if (endDate==undefined){
				 endDate = $("#edDate").val()
				}
				$(".start_end_dates").val(startDate+" - "+endDate);
				
			}

			var start_dt_moment  = moment(startDate,"DD/MM/YYYY")
            var end_dt_moment = moment(endDate,"DD/MM/YYYY")



			if (start_dt_moment.isAfter(end_dt_moment)){
            	jAlert("Invalid start and end date");
            	$(".start_end_dates").val(startDate+" - "+prevEndDate);
            	return;
            }

            if( (startDate && endDate) || $(".start_end_dates").val() ) {
     		    init_start_end_date()	
     	    }else{
     	    	jAlert("Invalid start and end date");
     	    }
          
          

	    },
	    renderer: $.extend({}, $.datepick.defaultRenderer, 
        {picker: $.datepick.defaultRenderer.picker. 
            replace(/\{link:clear\}/, '')})
   });

  	   get_verticals_list()

       $( ".months_tab" ).tabs({
       })

        jQuery("#ro_date").datepicker({ 
    			dateFormat: "dd/mm/yy",
    	});   


     $("#add_customer").on("click", function() {
     	    $.cookie("from_ro",true);
     	 	jQuery('#create-customer-dialogue').dialog({
	  			width:1200,
	  			height:550,
	  			modal:true,
	  			autoOpen:false,
	  			title:"Customer Add"
	  		});
	  		
	  	  $("#create-customer-dialogue").load('customer/customer_add.html', function() {	  		  
	  	      $("#create-customer-dialogue").dialog("open");
	      });
	  		jQuery('#create-customer-dialogue').dialog('open');
       });

     $("#add_sales_ex").on("click", function() {
     	 $.cookie("from_ro",true);
     	 	jQuery('#create-sale_ex-dialogue').dialog({
	  			width:1200,
	  			height:550,
	  			modal:true,
	  			autoOpen:false,
	  			title:"Sales Executive add"
	  		});
	  		
	  	  $("#create-sale_ex-dialogue").load('user/user_add.html', function() {	  		  
	  	      $("#create-sale_ex-dialogue").dialog("open");
	      });
	  		jQuery('#create-sale_ex-dialogue').dialog('open');
	  		
     })

       $("#add_agency").on("click", function() {
     	 $.cookie("from_ro",true);
     	 	jQuery('#create-agency-dialogue').dialog({
	  			width:1200,
	  			height:550,
	  			modal:true,
	  			autoOpen:false,
	  			title:"Agency add"
	  		});
	  		
	  	  $("#create-agency-dialogue").load('agency/agencyAdd.html', function() {	  		  
	  	      $("#create-agency-dialogue").dialog("open");
	      });
	  		jQuery('#create-agency-dialogue').dialog('open');
     })
     
      

      $("#clp_vertical").change(function(){
      	$("#clp_subvertical").empty()
      	var sel_ver = $(this).val()
      	if(sel_ver!=undefined && sel_ver!='0'){
      	  var sub_vert_opts = get_sub_vertical_options(sel_ver);
      	  $("#clp_subvertical").append(sub_vert_opts)
        }
      })

  
  });

var timebands_map = {}
var  MONTH_CONSTANTS = ['January','February','March','April','May','June','July','August','September','October','November','December']
 
var advt_type_map = {}, order_months_map = {}, months_list = [], order_start_date = "", order_end_date = "", timeband_counter = 0;
var total_spots_map = {}, duplicate_tb = false, vertical_list_map = {}, db_data_start_date = '', db_data_end_date = '';

$(document).on('change paste  keyup',".each_spot", function(){
    //console.log($(this).val());
    var changed_input = $(this).prop('id')
    var changed_input_str = changed_input.split("_")
    update_total_spots(changed_input_str[0],changed_input_str[1]);
    total_spots_count(changed_input_str[0]);
    update_total_column_count(changed_input_str[0], changed_input_str[2])
});  


function update_total_column_count(month, colDate){
	if(!month || !colDate){
		console.log("Invalid input values....");
		return;
	}
	var destColId = month+"_"+colDate;
	var monthTableId = month+"_tab";
	var tbRowCls = month+"_tb_row";
	var colCount = 0;

	$("#"+monthTableId+" tr."+tbRowCls).each(function(){

		var rowId = $(this).attr("id");
		var val = $("#"+rowId+" td input."+destColId).val();
		if(val){
			colCount += parseInt(val);
		}

	});

	if(colCount){
		$("#"+destColId).val(colCount);
	} else {
		$("#"+destColId).val("");
	}

	var totalSpots = 0;
	$("#"+monthTableId+" tr."+month+"_row td.day_total_spots input").each(function(){
		var val = $(this).val();
		if(val){
			totalSpots += parseInt(val);
		}
	});

	$("#"+month+"_col_ts").html(totalSpots);

}

function get_verticals_list(){
	//console.log("get_verticals_list::::::::::")
     $.ajax({
		url : "verticals",
		type : 'GET',
		dataType : "json",
		success: function(json) {
			var verticals_list = []
			var sub_verticals = []
			
			if(json.verticals!=undefined){
               verticals_list = json.verticals
               // console.log("verticals_list"+JSON.stringify(verticals_list))
               for(var i=0;i<verticals_list.length;i++){
                var vert_name = verticals_list[i]['name']
                var sub_vert_list = []
                // console.log("vertname::::"+vert_name)
                //var sub_vert = verticals_list[i]['sub_verticals']
                sub_verticals = verticals_list[i]['sub_verticals']
                //console.log("sub veticcc"+JSON.stringify(sub_verticals))
                for(var j=0;j<sub_verticals.length;j++){
                   sub_vert_list.push(sub_verticals[j]["name"])
                   vertical_list_map[vert_name] = sub_vert_list;
                }
               	vertical_list_map[vert_name] = sub_vert_list;
               }
               // console.log("VErtical map list::::::;"+JSON.stringify(vertical_list_map))
               var verticals_opts =  get_vertical_options()
			   $("#clp_vertical").append(verticals_opts);
			}

			
		}
   })
}

function get_vertical_options(){
	var vert_opts = ""
	for(each_vert in vertical_list_map){
       if(each_vert.length>25){
       	ver_trim = each_vert.substring(0,25)+'...'
       }else{
       	ver_trim = each_vert
       }   
       vert_opts = vert_opts + '<option value="'+each_vert+'">'
       +each_vert+'</option>'
       
	}
	return vert_opts
}

function get_sub_vertical_options(vertical_name){
	var sub_vert_opts = "<option value='0'>--- Choose one ---</option>"
	//console.log("vertical_name:::::::::::"+vertical_name)
    if(vertical_name!=undefined && vertical_name!='0'){
	   var sub_ver_lst = vertical_list_map[vertical_name]

	   for(var j=0;j<sub_ver_lst.length;j++){
	   	if(sub_ver_lst[j].length>40){
	   		sub_ver_tirm = sub_ver_lst[j].substring(0,40)+'...'
	   	}else{
	   		sub_ver_tirm = sub_ver_lst[j]
	   	}
	   	sub_vert_opts = sub_vert_opts + 
	   	'<option title="'+sub_ver_lst[j]+'" value="'+sub_ver_lst[j]+'">'+sub_ver_tirm+'</option>'
	   }
   }
   return sub_vert_opts
}

function load_branches(){
  //customer_id = $("#customer_id").val();
  url = '/branches'
  /*if (customer_id!=undefined && customer_id!=""){
      url = url + "&customer_id="+customer_id
  }*/
  branchMap = {};
  $.ajax({
		dataType: "json",
		url: url,
		success: function( result) {
			branch_list = [];
			if(result.branches!=undefined){
				branchOptionsArr = [];
		    	branch_list = result.branches;
		    	var options = '<option value="0">---Choose one---</option>';
		    	for(var j=0;j<branch_list.length;j++){
		    		var item = branch_list[j];
				    options += '<option value="' + item._id + '">' + item.name + '</option>';
				    branchOptionsArr.push({"label": item.name.toUpperCase(), "value": item._id });
				    branchMap[item._id] = item.name;
		    	}
		    	$("#branch_id").html(options);
	    	
			    // $("#customer_id").html(options);
			    $("#branch_filter").autocomplete({
			    	minLength:0,
			    	source: function( request, response ) {
			    		var matches = [];
			    		for(var i=0; i<branchOptionsArr.length; i++){
			    			var item = branchOptionsArr[i];
			    			var name = item.label;
							if ( name.toUpperCase().indexOf(request.term.toUpperCase()) === 0 ) {
								matches.push(item);
							}
			    		}
			    		if(request.term == ""){
							matches = branchOptionsArr;
						}
					    response(matches);
					},
					focus: function(event, ui) {
						// prevent autocomplete from updating the textbox
						event.preventDefault();
						// manually update the textbox
						$(this).val(ui.item.label);
					},
					select: function(event, ui) {
						// prevent autocomplete from updating the textbox
						event.preventDefault();
						// manually update the textbox and hidden field
						$(this).val(ui.item.label);
						$("#branch_id").val(ui.item.value);

					}
				});

				$("#branch_filter").unbind("click");
				$("#branch_filter").on("click, focus", function(){
					if($("#branch_filter").val() == ""){
						$("#branch_filter").autocomplete("search", "");
					}
				});
			}
	    	//console.log("branchessss loaded")
		},
		error: function(xhr, status, text) {
            comm_handleAjaxError(xhr);
        }
	});
}


function load_ro_versions(){
	
	if ($.cookie("orderId") != null ){
	  	 	var orderId = $.cookie("orderId");
	} 	 	
	var optionStr = '<option value="0">Latest</option>';

    $.ajax({
		url : url = '/orders_archive?channel_id='+channel+"&order_id="+orderId,
		type : 'GET',
		dataType : "json",
		success: function(data) {
			var version_list = data["version_list"]
			for (i = 0; i < version_list.length; i++) {
		        var item = version_list[i];
				optionStr += '<option value="'+item.version_id+'">'+item.version_name+'</option>';
			}

			$('#ro_version').html(optionStr);
		},
		error: function(xhr, status, text) {
			$('#ro_version').html(optionStr);
			comm_handleAjaxError(xhr);
		}
	});

}


$("#ro_version").change(function(){
	var url = "";
	var selected_version = $("#ro_version").val();
	var versionName = $("#ro_version option:selected").text();

	if(selected_version != 0){
		url = '/orders_archive/'+selected_version;
	    $("#placeOrder, #spots_edit_tb_btns_div").hide();
	    jAlert("You navigated to "+versionName+" version of the Order");

	} else if ($.cookie("orderId") != null ){
  	 	var orderId = $.cookie("orderId");
  	 	var  url = '/orders/'+orderId;
		$("#placeOrder, #spots_edit_tb_btns_div").show();
 	}

	console.log("version URL :: "+url);

	if(!url){
		console.log("Empty Version URL....");
		return false;
	}

    $.ajax({
		url : url,
		type : 'GET',
		dataType : "json",
		global: true,
		success: function(data) {
			var ord_details = undefined;
			if(selected_version != 0){
				ord_details = data["version_details"];
			} else {
				ord_details = data["order"];
			}

			if (ord_details!=undefined){
				$(".months_tab, .spots_view").html(""); //clear populated table and tabs to create fresh spots table.
				load_order_details(ord_details)
			}
		},
		error: function(xhr, status, text) {
               comm_handleAjaxError(xhr);
        }
	});

});


function load_agencies(){
  customer_id = $("#customer_id").val();
  url = '/agencies?channel_id='+channel;
  /*if (customer_id!=undefined && customer_id!=""){
      url = url + "&customer_id="+customer_id
  }*/
  agencyOptionsArr = [];
  $.ajax({
		dataType: "json",
		url: url,
		success: function( result) {
			agency_list = [];
			agencyMap = {};
			if(result.agencies!=undefined){
		    	agency_list = result.agencies;
		    	var options = '<option value="0">---Choose one---</option>';
		    	var agencyId = $("#agency_id").val()
		    	for(var j=0;j<agency_list.length;j++){
		    		   
				         // options += '<option value="' + agency_list[j]._id + '">' + agency_list[j].name + '</option>'; 	
		    	// }
		    		// $("#agency_id").html(options);
		    		var name = agency_list[j].name;
		    		var id = agency_list[j]._id;
		    		var agencycode = ""; 
		    		if("agencycode" in agency_list[j]){
		    			var agencycode = agency_list[j].agencycode;
		    		}
		    		if(agencyId && agencyId == id){
		    			$("#agency_filter").val(name.toUpperCase());
		    		}
		    		agencyOptionsArr.push({"label": name.toUpperCase(), "value": id ,
		    			              "agencycode":agencycode});
		    		agencyMap[id] = name;
		    		agency_name_list.push(name.toUpperCase())
		    		ro_agency_name_id_map[name.toUpperCase()] = agency_list[j]._id
		    	}
			    // $("#customer_id").html(options);
			    $("#agency_filter").autocomplete({
			    	minLength:0,
			    	source: function( request, response ) {
			    		var matches = [];	
			    		for(var i=0; i<agencyOptionsArr.length; i++){
			    			var item = agencyOptionsArr[i];
			    			var name = item.label;
							if ( name.toUpperCase().indexOf(request.term.toUpperCase()) === 0 ) {
								matches.push(item);
							}
			    		}
			    		if(request.term == ""){
							matches = agencyOptionsArr;
						}
					    response(matches);
					},
					focus: function(event, ui) {
						// prevent autocomplete from updating the textbox
						event.preventDefault();
						// manually update the textbox
						$(this).val(ui.item.label);
					},
					select: function(event, ui) {
						// prevent autocomplete from updating the textbox
						event.preventDefault();
						// manually update the textbox and hidden field
						$(this).val(ui.item.label);
						$("#agency_id").val(ui.item.value);
						$('#agency_code').val(ui.item.agencycode);
						//console.log()
						agency_validation($("#agency_code").val());
						// if(ui.item.value || $("#advance_payment").is(":checked") == false ){
						// 	$("#receipt_number_div").hide();
						// } else {
						// 	$("#receipt_number_div").show();
						// }

					}
				});

				$("#agency_filter").unbind("click");
				$("#agency_filter").on("click, focus", function(){
					if($("#agency_filter").val() == ""){
						$("#agency_filter").autocomplete("search", "");
					}
				});
	    	}
	    	loadSearchSelectBox();
		},
		error: function(xhr, status, text) {
            comm_handleAjaxError(xhr);
        }
	});
}

 function agency_validation(agency_code){
 	// console.log(agency_code)
 	
 	var url = '/agency_validation?s={"agency_code":'+JSON.stringify(agency_code)+'}';
 	// console.log(url);
 	
 	$.ajax({
 		url: url,
		success: function(result) {
			//console.log("resulttttttttttttt",result)
			if (result['data'][0]['STATUS']!="*"){
				var msg = result['data'][0]['STATUS'].toString();
				jAlert(msg);
				$.removeCookie("landing_page", null, {path: '/' });
				$("#main").load('order/ordersList.html');
			}
		},
		error : function(result){
			console.log(result)
		}
 	});
 }

function load_sales_executives(){
   $.ajax({
		dataType: "json",
		url: '/users?channel_id='+channel+'&role=Sales',
		success: function( result) {
			users_list = [];
			sales_ex_name_list = []
			salesMap = {};
			console.log("33333333333"+sales_ex_name_list)
			if(result.users!=undefined){
		    	users_list = result.users;
		    	var options = '<option value="0">---Choose one---</option>';
		    	for(var j=0;j<users_list.length;j++){
		    		   
				    options += '<option value="' + users_list[j]._id + '">' + users_list[j].username + '</option>'; 	
				    salesMap[users_list[j]._id] = users_list[j].username;
				    sales_ex_name_list.push(users_list[j].username.toUpperCase())
				    sales_ex_name_id_map[users_list[j].username.toUpperCase()] = users_list[j]._id
		    	}
		    		//$("#sales_ex").html(options);

		    		$("#sales_ex").autocomplete({
				      source: sales_ex_name_list,
				      minLength:0
				       }).focus(function(){            
				           $(this).autocomplete("search");
				     });		
	    	}
		},
		error: function(xhr, status, text) {
        	comm_handleAjaxError(xhr);   
		}
	});
}

var masterPrgmsMap = {}, programIdMap = {};
function load_master_programs(){
	masterPrgmsMap = {};
	$.ajax({
		dataType: "json",
		url : "/master-programs?channel_id="+channel,		
		success: function( json) {
		
			options = "";
            programs = [];
            if(json["master-programs"]!=undefined){
	            programs = json["master-programs"];

				 for (hash in json) {
				 	  var options = '<option value="0">---Choose One---</option>';
				        for (i = 0; i < json[hash].length; i++) {
				        	if(json[hash][i]['break_type']!=0){
				        		title = '';
				        		program_type = '';
				        		if(json[hash][i]['program_type']!=undefined)
				        			program_type = json[hash][i]['program_type']
				        		start_time = json[hash][i]['start_time'] ;
				        		pg_name = json[hash][i]['program_name']
				        		
				        		title = pg_name +'-'+ start_time ;

				        		if(program_type!="" && program_type==1) 
				        			title = title + '-' + '(L)'
				        		if(program_type!="" && program_type==0) 
				        			title = title + '-' + '(R)'
				        	    
				        		options = options +"<option value='"+json[hash][i]['_id']+  "'>"+title+"</option>";

				        		masterPrgmsMap[json[hash][i]['_id']] = pg_name;
				        		programIdMap[json[hash][i]['_id']] = json[hash][i];
				        }
				       
				    }
				}
				 $("#master_programs").html(options);
			}
		},
		error: function(xhr, status, text) {
            comm_handleAjaxError(xhr);
        }
	});
}

$("#customer_id").change(function(){
	var dataString = "";
	spot_type = $("#spotType_id").val();
	var customerId = $('#customer_id').val();
	if(customerId!="" && customerId!="0"){
			  load_medias(customerId);
			  load_agencies();
              set_cust_agency(); 
              ro_loadCustBroId(customerId);

		
	}else{
		jAlert("Please select a customer");
	}
}); 

function set_cust_agency(){

	var customerId = $('#customer_id').val();
	$.ajax({
		dataType: "json",
		url: 'customers/'+customerId,
		success: function( result) {
			if(result.customer!=undefined){
				cust_info = result.customer
				
				if(cust_info['agency']!=undefined){
					$("#agency_id").val(cust_info['agency'])
				}
				if(cust_info['branch']!=undefined){
					//console.log("BRANNNN"+cust_info['branch'])
					$("#branch_id").val(cust_info['branch'])
				}
			}
		}
	})
}

var custOptionsArr = [];
var custMap = {};
var customer_name_list = []
function loadCustomers(){
	$.ajax({
		dataType: "json",
		url: '/customers?status=active&channel_id='+channel,
		success: function( result) {
			cust = [];
			custMap = {};
			if(result.customers!=undefined){
		    	cust = result.customers;
		    	// var options = '<option value="0">-- Choose One--</option>';
		    	custOptionsArr = [];
		    	for(k=0;k<cust.length;k++){
				    // options += '<option value="' + cust[k]._id + '">' + cust[k].name + '</option>';
				    var clientcode = "";
				    if("clientcode" in cust[k]){
				    	clientcode = cust[k].clientcode;
				    }
				    custOptionsArr.push({"label": cust[k].name.toUpperCase(), "value": cust[k]._id ,
				    					 "clientcode" : clientcode});
				    custMap[cust[k]._id] = cust[k].name;
				    customer_name_list.push(cust[k].name.toUpperCase())
				    ro_customer_name_id_map[cust[k].name.toLowerCase()] = cust[k]._id
		    	}

		    	console.log("Construct::::::::::::::::"+JSON.stringify(ro_customer_name_id_map))
			    // $("#customer_id").html(options);
			    $("#customer_filter").autocomplete({
			    	 minLength: 0,
			    	source: function( request, response ) {
			    		var matches = [];	
			    		for(var i=0; i<custOptionsArr.length; i++){
			    			var item = custOptionsArr[i];
			    			var name = item.label;
							if ( name.toUpperCase().indexOf(request.term.toUpperCase()) === 0 ) {
								matches.push(item);
							}
			    		}

			    		if(request.term == ""){
							matches = custOptionsArr;
						}

					    response(matches);
					},
					focus: function(event, ui) {
						// prevent autocomplete from updating the textbox
						event.preventDefault();
						// manually update the textbox
						$(this).val(ui.item.label);
						// console.log("focus");
					},
					select: function(event, ui) {
						// prevent autocomplete from updating the textbox
						event.preventDefault();
						// manually update the textbox and hidden field
						$(this).val(ui.item.label);
						//console.log(ui.item.value);
						$("#customer_id").val(ui.item.value);
						$("#clientcode").val(ui.item.clientcode);

						var dataString = "";
						spot_type = $("#spotType_id").val();
						var customerId = $('#customer_id').val();

						if(customerId!="" && customerId!="0"){
								  load_medias(customerId);
								  load_agencies();
					              set_cust_agency();
					              ro_loadCustBroId(customerId);
					              ro_loadBulkROIds(customerId);
					              load_scanned_ros(customerId);
							
						}else{
							jAlert("Please select a customer");
						}
						return;

					}
				});
				
				$("#customer_filter").unbind("click");
				$("#customer_filter").on("click, focus", function(){
					if($("#customer_filter").val() == ""){
						$("#customer_filter").autocomplete("search", "");
					}
				});

		  }
		},
		error: function(xhr, status, text) {
	        comm_handleAjaxError(xhr);
	    } 
	});
}

function load_scanned_ros(customerId){
	console.log("load scanned rosssssssssssss")
	if(customerId){
	    $.ajax({
				type : "GET",
				url : "commercials/customer/"+customerId+"?advt_type=ro_scan",
				success : function(data) {
					var ro_list = [];
					if(data.commercials!=undefined){
							ro_list = data.commercials;
							var options = '';
							for(var i=0;i<ro_list.length;i++){
								if(ro_list[i]['name']!='CLIP_NOT_FOUND'){
								   options += '<option value="' + ro_list[i]._id + '">' +  ro_list[i].name + '</option>';
							    }
						    }
							$("#ro_scan_copies").html(options);
					}
				}
			})
    }
}

function load_medias(customerId){
        
        var spot_type = $("#spotType_id").val();
        
        var time_consumable = advt_type_map[spot_type]['time_consumable']
               
        var is_slot = false;
        if(advt_type_map[spot_type]['recorded_slot']!=undefined &&
         advt_type_map[spot_type]['recorded_slot']){
        	is_slot = true;
        }

        if(advt_type_map[spot_type]['live_slot']!=undefined &&
         advt_type_map[spot_type]['live_slot']){
        	is_slot = true;
        }

       
        $('#media').html('')
        $('#media').text('')
        $('#duration').val('')
       
		if(customerId!=undefined && customerId!="0"){
		   	if(time_consumable && !is_slot){ 
		   		
		   		$("#media_div").show();
                $("#cg_media_div").hide();
                
			    $.ajax({
				type : "GET",
				url : "commercials/customer/"+customerId+"?advt_type="+spot_type,
				success : function(data) {
					media_list = [];
					if(data.commercials!=undefined){
						media_list = data.commercials;
						var options = '';
				    	for(k=0;k<media_list.length;k++){
				    		if(media_list[k]['caption']!=undefined && media_list[k]['caption']!=null &&
				    			media_list[k]['caption']!='')
				    		   name = 	media_list[k].caption
				    		else
				    		  name = media_list[k].name;
				    		if(name.length>50)
				    			name = name.substring(0,49)+"..";
				    		if(media_list[k].language!=undefined &&
				    		    media_list[k].language!="")
				    			name = name +'_' +media_list[k].language
				    		if(media_list[k].version!=undefined && 
				    			media_list[k].version!="")
				    			name = name + '_' + media_list[k].version

						    options += '<option value="' + media_list[k]._id + '">' +  name + '</option>';
				    	}
				    	$("#media").html(options);
				    	if(media_list.length>0){
				    		if(media_list[0]['dur']!=undefined){
				    		   media_dur = media_list[0]['dur']
				    		   $("#duration").val(media_dur)
				    		}

				    	}
				    	var clip_name = $("#media option:selected").text()
				    	console.log("tb caption set to media name:::"+clip_name)
				    	$("#tb_caption").val(clip_name)
			       }
			    	
				},
				 error: function(xhr, status, text) {
		            comm_handleAjaxError(xhr);
				 }
		     });

	   }
	   else if(!time_consumable){
			$("#media_div").hide()
            $("#cg_media_div").show();

          }
      else if(time_consumable && is_slot){
            $("#media_div").hide()
            $("#cg_media_div").hide();
      }    
         

  }else{
  	jAlert("Please customer")
  }

}

function getMonthDateRange(year, month) {
    var startDate = moment([year, month]).format("YYYY/MM/DD");
    var endDate = moment(startDate).endOf('month').format("YYYY/MM/DD");

    return { start: startDate, end: endDate };
}

function months_cal_init(){
    order_months_map = {}

	var start_end = $(".start_end_dates").val()
	start_end_arr =  start_end.split("-");
	var st_dt = start_end_arr[0];
	var ed_dt = start_end_arr[1];
    
    order_start_date = moment(st_dt, "DD/MM/YYYY");	 
	order_end_date = moment(ed_dt, "DD/MM/YYYY"); 
	
	if(st_dt!=undefined && ed_dt!=undefined) {
		var order_month_st = moment([order_start_date.year(),
		 order_start_date.month()])

		if(order_start_date.month()==order_end_date.month()){
           st_ed_dts = {}
           
           var temp_st = order_month_st.clone()
           var month_ed = moment(temp_st).endOf('month');
           st_ed_dts['start'] = order_month_st.format("YYYY/MM/DD")
           st_ed_dts['end'] = month_ed.format("YYYY/MM/DD")
           ord_mth_str = MONTH_CONSTANTS[order_end_date.month()]
           if(order_months_map[ord_mth_str]==undefined)
           order_months_map[ord_mth_str] = st_ed_dts
		}
		else{
			   if(order_start_date.year() == order_end_date.year()){
			      diff_in_month = order_end_date.month() - order_start_date.month()
               }
			   else{
			   	  diff_in_month = 12 - order_start_date.month()
			   	  diff_in_month = diff_in_month + order_end_date.month()
			   }
               count  = 0; 
              var temp_st = order_month_st.clone()
              var nxt_mnth = temp_st
               while(count<=diff_in_month){
                 var st_ed_dts = {}
                 var st_ed_dts = getMonthDateRange(nxt_mnth.year(),nxt_mnth.month()) 
                 
                 ord_mth_str = MONTH_CONSTANTS[nxt_mnth.month()]
                 if(order_months_map[ord_mth_str]==undefined)
                 order_months_map[ord_mth_str] = st_ed_dts
                 
                 nxt_mnth = temp_st.add(1,"months")
                 temp_st = nxt_mnth
                 count++
            }
		}
	}
	// console.log("order_months_map:::::::"+JSON.stringify(order_months_map))

}

var advt_type_map = {}
function load_advt_types(){
	$.ajax({
		dataType: "json",
		url: '/advertisement_types',
		success: function( result) {
			advtTypes = [];
			if(result.ad_types!=undefined){
		    	advtTypes = result.ad_types;
		    	var options = '';
		    	for(j=0;j<advtTypes.length;j++){

		    		    if(advtTypes[j].name!=undefined && advtTypes[j].name=="commercial")
				    	options += '<option value="' + advtTypes[j].ad_type_identity + '" selected="selected">' + advtTypes[j].name + '</option>';
				        else
				         options += '<option value="' + advtTypes[j].ad_type_identity + '">' + advtTypes[j].name + '</option>'; 	
				
				    advt_type_map[advtTypes[j].ad_type_identity] = advtTypes[j]
				 }
	    	}
	    	$("#spotType_id").html(options);	
	    	load_advt_type_modules()
		
	},
		error: function(xhr, status, text) {
            comm_handleAjaxError(xhr);
		}
                               
	});
}


function load_advt_type_modules(){
	display_modules = []
	spot_type = $("#spotType_id").val();
	
	$("#position_div").hide();
	$("#time_btwn_spots_div").hide();
	$("#time_btwn_product_type_div").hide();
	//$("#priority_div").hide();
	$("#break_num_div").hide();
	$("#seg_num_div").hide();
	$("#dur_div").hide();
	
    var pkg_detail = ''
	if(advt_type_map[spot_type]['package_detail']!=undefined){
	   pkg_detail = advt_type_map[spot_type]['package_detail']
	  
	  if(pkg_detail=='per_day'){
          $("#rate_label").text('Rate/day')
	  }else if(pkg_detail=='per_15_sec'){
	  	$("#rate_label").text('Rate/15s')
	  }else if(pkg_detail=='per_30_min'){
	  	$("#rate_label").text('Rate/30min')
	  }else if(pkg_detail=='per_unit'){
        $("#rate_label").text('Rate/Unit')
	  }else{
	  	$("#rate_label").text('Rate/10s')
	  }
	}else{
		$("#rate_label").text('Rate/10s')
	}
    //console.log("here::pkg_detail:::"+pkg_detail)

    if(advt_type_map[spot_type]['time_consumable'])   
       $("#dur_div").show()
   
	if(advt_type_map[spot_type]!=undefined){
		display_modules = advt_type_map[spot_type]['modules']
		for(i=0;i<display_modules.length;i++){
			if(display_modules[i]!='priority'){
				module_div_id = display_modules[i] + "_div"
				$("#"+module_div_id).show();
				if(display_modules[i]=="break"){
					$("#break_num_div").show();
				}
				if(display_modules[i]=="segment"){
					$("#seg_num_div").show();
				}
		    }
		}
	}else{
		// console.log("undefined spot type:::::::::::::"+spot_type);
	}
}	

$("#spotType_id").change(function(){
	var dataString = "";
	spot_type = $("#spotType_id").val();

	var customerId = $('#customer_id').val();
	$("#tb_caption").val("")
	
	load_advt_type_modules();
	if(customerId!=""){
	  load_medias(customerId)
    }else{
    	jAlert("Please select customer")
    }
	$("#duration").val('')
})

function validateTimeband(){
	var cust =$("#customer_id").val()
	var st = $("#startTime").val();
    //var program_id = $("#genprograms").val();
	var ed = $("#endTime").val();
	var media = $("#media").val();
	var cg_media = $("#cg_media").val()
	var duration = $("#duration").val();
	var st_ed =  $(".start_end_dates").val();
	var spot_type = $("#spotType_id").val();
	var isProgram = $("#schedule_type").val();
	var paidBonus = $("#spot_type").val();
	var rate = $("#rate").val();

	var days = [];
	var tb_caption = ''
    tb_caption = $("#tb_caption").val()
    if(!(tb_caption!=undefined && tb_caption!='')){
    	jAlert("Please enter timeband caption")
    	return false
    }
       

	if(isProgram == 0){
		start_time_valid = validateTime(st,"Start time");
		end_time_valid = validateTime(ed,"End time");
	} else {
		start_time_valid = true;
		end_time_valid = true;
	}
	

	var customerId = $('#customer_id').val();
	var branch = $('#branch_id').val();
	if(branch == "" || branch == "0"){
		var txt = $('#customer_filter').val();
		var msg = "Please select a Customer"
		if(txt != ""){
			msg = "Please select a Valid Branch"
		}
		jAlert(msg);
		return false;
	}
	if(customerId == "" || customerId == "0"){
		var txt = $('#customer_filter').val();
		var msg = "Please select a Customer"
		if(txt != ""){
			msg = "Please select a Valid Customer"
		}
		jAlert(msg);
		return false;
	}
	if(cust=="" || cust=="0"){
		jAlert("Select Customer");
		return false;
	}
	if(st_ed==""){
		jAlert("Enter start and end date");
		return false;
	}
	if(st=="" && isProgram == 0){
		jAlert("Enter start time");
		return false;
	}
	if(!start_time_valid)
		return false;
	if(ed=="" && isProgram == 0){
		jAlert("Enter end time");
		return false;
	}
	if(!end_time_valid)
		return false;
	if(!checkStartEndTime(st,ed))
		return false;

	if(isProgram == 1){
		st == "00:30:00";
		ed == "24:00:00";
	}

    var advt_params = {}

    advt_params =  advt_type_map[spot_type]
    
    var is_slot = false;
    if(advt_type_map[spot_type]['is_slot']){
    	is_slot = true;
    }
   
     if(advt_params['time_consumable']!=undefined && advt_params['time_consumable']
     	&&  !is_slot && !media){
     		jAlert("Please select media");
     		return false;
     	
     }
     /*else if(advt_params['time_consumable']!=undefined && advt_params['time_consumable']
     	&&  is_slot && !cg_media){
            jAlert('Please enter media name');
        	return false;
     
     }*/
     else if(advt_params['time_consumable']!=undefined && !advt_params['time_consumable']
     	&& !cg_media){
     	 
     	  jAlert('Please enter media name');
        	return false;
     }
     

     /*if(advt_params['time_consumable']!=undefined && !advt_params['time_consumable']){
        if(cg_media==''){
        	jAlert('Please enter media name');
        	return false;
        }
     }*/

     if(rate){
     	rate = rate.trim();
     }

     if(paidBonus == "paid" && (!rate || rate <= 0) ){
     	jAlert("Please enter valid Rate");
     	return false;
     }


    
    var dur = 0;
    if(advt_params['time_consumable']!=undefined){
    	time_consumable = advt_params['time_consumable'];
    	if(time_consumable){
    		dur = 0;
    		dur = $("#duration").val();
    		var selMedia = $("#media option:selected").text();
    		selMedia = selMedia.trim();
    		if(selMedia == "CLIP_NOT_FOUND"){
    			$("#duration").val(0);
    			dur = 0;
    		}
    	}
        if(time_consumable){
	    	if(dur==undefined  || dur ==""  ||  
	    		(dur==0 && selMedia != "CLIP_NOT_FOUND" ) || isNaN(dur) ){
	    			jAlert("Please enter valid duration");
	    		    return false;
	    		}

	        if(dur%5!=0 && dur/5<=1){
	        	jAlert("Clip dur is not multiple of 5")
	        }	
	        
    	}
    }

    
    break_num = 0;
    break_num = $("#break_num").val();

    if(break_num!="" && break_num!=0){
    	if(break_num<1){
    		jAlert('Please enter valid break number');
    		return false;
    	}
    }

    return true;
}

function get_all_spots(){
	
	var month_spots_map = {} 
	var tb_spots_map = {}
		for (each_tb in timebands_map){
		tb_data = timebands_map[each_tb];
		tb_st = tb_data['start_time']
		tb_ed = tb_data['end_time']
		tb_class = tb_st+"_"+tb_ed
		tb_class = tb_class.replace(/:/g, "_")

		spot_type = tb_data['type']
		tb_clip_details = undefined;
		tb_clip_details =  tb_data[spot_type]
		tb_clip_id = '';
		tb_clip_id = tb_clip_details['clip_id']
        month_wise_spots_list = []
		for(month in order_months_map){
			tab_id = month + "_" + 'tab'
			month_wise_spots_list = [];
			$("#"+tab_id+" .each_spot").each(function(i){
				
				if($(this).hasClass(tb_clip_id) && $(this).hasClass(tb_class)){
			        val = $(this).prop('value')
			        if(val!="")
			         month_wise_spots_list.push(val)
			        else
			         month_wise_spots_list.push(0)  
			    }
            });
            var tb_clip_key = "";
            tb_clip_key = tb_class + '_'+tb_clip_id;
            temp = {}
            var dt_rn = []
            var mnth_key_val = {}
            mnth_key_val = order_months_map[month] 
            
            var mnth_start = {};
            mnth_start = mnth_key_val['start']
            mnth_start_moment = moment(mnth_start,"YYYY/MM/DD")
            mnth_end = mnth_key_val['end']
            mnth_end_moment = moment(mnth_end,"YYYY/MM/DD")
            //diff_dur = mnth_end_moment.diff(mnth_start_moment)
            diff_dur = moment.duration(mnth_end_moment.diff(mnth_start_moment));
            total_days_in_month = diff_dur.asDays() + 1
            var for_yr = mnth_start_moment.year()
            var for_mnt = mnth_start_moment.month() + 1
            dt_rn = [];

            //console.log("get_all_spots:::"+month,month_wise_spots_list,month_wise_spots_list.length)
            dt_rn = construct_date_range(month_wise_spots_list,total_days_in_month,for_yr,for_mnt)
            //console.log("IIIIIIIII"+JSON.stringify(dt_rn))
            if(dt_rn.length>0) {
	            if(month in month_spots_map){
	             temp = month_spots_map[month]
	             temp[tb_clip_key]= dt_rn
	             month_spots_map[month] = temp
	           }else{
	           	 temp[tb_clip_key]= dt_rn
	             month_spots_map[month] = temp
	           }
	       }
           
          
		}
	
	}
	//console.log("all spots:::::::::::"+JSON.stringify(month_spots_map))
  
   return month_spots_map;
}



function set_tb_date_ranges(){
	
	var tb_wise_spots = {}
	//month_wise_spots_map = get_all_spots()
	var month_wise_spots_map = get_all_tb_spots()
	//console.log("thissssssssssss"+JSON.stringify(month_wise_spots_map))
    for (month_key in month_wise_spots_map){
    	 month_tbs = month_wise_spots_map[month_key]
         for(tb_key in month_tbs){
         	if(tb_key in tb_wise_spots){
         	
                count = 0;
         	    while(count<month_tbs[tb_key].length){
         		  tb_wise_spots[tb_key].push(month_tbs[tb_key][count])
         		  count ++;
         	    }
            }else{
            	
                tb_wise_spots[tb_key] = month_tbs[tb_key]
            } 
         }
    }
    //console.log("set_tb_date_ranges ::::"+JSON.stringify(tb_wise_spots))
    
	return tb_wise_spots
}


function set_tb_spots(){
	
	var tb_wise_spots_map = {}
	   tb_wise_spots_map = set_tb_date_ranges();
	   //console.log("thissssssssss"+JSON.stringify(tb_wise_spots_map))
	for(tb_ind in timebands_map){
		each_tb = undefined;
		each_tb = timebands_map[tb_ind]
		tb_st = ""
		tb_st = each_tb['start_time']
		tb_ed = ""
		tb_ed = each_tb['end_time']
		tb_key = ''
		tb_clip_map = {}
		var type = ''
		type = each_tb['type']
		tb_clip_map = each_tb[type]
		tb_key = tb_st +'_'+ tb_ed + '_' +tb_clip_map['clip_id'] + '_' + tb_ind
		tb_key = tb_key.replace(/:/g,'_')
		spot_details = tb_wise_spots_map[tb_key]
		tb_clip_map['date_ranges'] = spot_details
	    
		each_tb[type] =  tb_clip_map
		timebands_map[tb_ind][type] = tb_clip_map
	}

}

function drawTable(month_start_date,view_only){
	
	tabExists = $(".spots_view").children("table").length;
   
    mnth_st_moment = moment(month_start_date,"YYYY/MM/DD")

    month_cont = MONTH_CONSTANTS[mnth_st_moment.month()]

	month_div_id = month_cont + '_' + 'view'

	month_tab_id = month_cont + '_' +'tab'

	month_st_ed_map = order_months_map[month_cont]
    
	if(tabExists==0){

		table_rows = get_th_rows_with_date(month_start_date,month_st_ed_map['end'],view_only);
        //console.log("2222222222222"+table_rows)

		var monthTableStr = "";
		monthTableStr = "<div id='"+month_div_id+"' class='month_div' style='display:none;'>"+
		"<table id='"+month_tab_id+"'>";
		var header = "<tr class='table_header_row' style='background-color: #c8d9ed;'>";
			if(view_only){
			 header = header + "<th><div style='width:60px;'>Month</div></th>";
		    }else{
		      header = header + "<th>Sel</th>";	
		    } 

			header += "<th><div style='width:60px;'>Time Band / Program</div></th>"+
				 "<th><div style='width:120px;'>Caption</div></th>"+
				 "<th><div style='width:50px;'>Advt. Type</div></th>"+
				   table_rows + 
				 "<th>Rate</th>"+
				 "<th>TS</th>"+
				 "<th>TC</th>"+
				 "</tr>";

			monthTableStr += header;

			monthTableStr += get_tb_col_count_row(month_start_date,month_st_ed_map['end'],view_only);

			// to add table header once at the last if needed for long list.
			// monthTableStr += header 
				 /*Total spots excluded
				 "<th>Spots</th>"+
				 "<th>Amt</th>"*/
			

           var tb_row = "";

		  monthTableStr += tb_row + "</table></div>";
			
		 $(".spots_view").append(monthTableStr);
		 $(".spots_view").show();
	}
}

var tr_id_info_map = {};
function get_tb_row(month_start,month_end,tb_details,tb_index,display_month, fromType){

    // console.log("INSIDEEEEE GET TB ROWWWWWWWWWWWWWW"+month_start)
    // console.log(tb_details);
	
	var month_st_moment = moment(month_start,"YYYY/MM/DD")
	
	var month_ed_moment = moment(month_end,"YYYY/MM/DD")

	var month_ed_moment = moment(month_end,"YYYY/MM/DD")

    var month_cont = MONTH_CONSTANTS[month_st_moment.month()]
	var month_div_id = month_cont + '_' + 'view'
	var month_tab_id = month_cont + '_' +'tab'
	var advt_type = tb_details.type;

	if(fromType == undefined && "bulk_ro" in tb_details){
		fromType = "bulk_ro";
	}

    var clip_dur = 0 ;
    var lang = ''
    var ver = ''
    var usr_cap = ''
    var usr_com_id = ''
    var media_ver = ''
    var media_sub_ver = ''
	//index = timeband_counter;
	index = tb_index;
	month_div_id = month_cont + '_view'	
    tr_id = 'tb_'+index
     
    start_time = tb_details.start_time
    end_time = tb_details.end_time
    spot_type = tb_details.type
    media_details = tb_details[spot_type]

    if(media_details != undefined){
    	clip_name = media_details['caption']
    	clip_id = media_details['clip_id']

    	if(!clip_name){
    		clip_name = "CLIP_NOT_FOUND";
    		var mediaId = $("#media option:contains(CLIP_NOT_FOUND)").attr("value");
			clip_id = mediaId;
    	}

	    if(media_details['duration']!=undefined)
	       clip_dur = media_details['duration']
	    
	    if(media_details['language']!=undefined)
	       lang = media_details['language']	
	    if(media_details['version']!=undefined)
	    	ver = media_details['version']

	    if(media_details['user_media_caption']!=undefined)
	    usr_cap = media_details['user_media_caption']
	     
	    if(media_details['user_media_id']!=undefined)
	    usr_com_id = media_details['user_media_id']	

		// if(isVertical){
		    if(media_details['media_vertical']!=undefined && media_details['media_vertical']!='0'){
		    	media_ver = media_details['media_vertical'];
			}
	    
		    if(media_details['media_subvertical']!=undefined && media_details['media_subvertical']!='0'){
		    	media_sub_ver = media_details['media_subvertical'];
			}
		// }

	} else if(fromType == "bulk_ro"){
		var mediaId = $("#media option:contains(CLIP_NOT_FOUND)").attr("value");
		clip_id = mediaId;
		clip_name = "CLIP_NOT_FOUND";
	}

	//console.log(fromType);

    order_end_date_moment = moment(order_end_date,"DD/MM/YYYY")
    order_start_date_moment = moment(order_start_date,"DD/MM/YYYY")

    tb_name = ""
    tb_name = tb_details['time_band']
    tb_name = tb_name.replace(/:/g, "_")
    class_name = 'each_spot '+tb_name+' '+clip_id

    /*total_spots_id = month_cont +'_'+index+'_'+start_time+'_'+end_time+'_'+clip_id
    total_spots_id = total_spots_id.replace(/:/g, "_")*/

    if(start_time!=undefined && start_time!="" && end_time!=undefined &&
     end_time!="" && clip_name!=undefined && clip_name!=""){
        	
        start_time = start_time.substring(0,5)	
        end_time = end_time.substring(0,5)
        var clipName = "";

        var tb_text = "";
        // console.log(tb_details);
        var prgmFrom = "";
        if('program_wise' in tb_details){
        	if(tb_details['program_wise'] == true){
        		if(tb_details['program_gen_from'] == "master"){
        			tb_text = masterPrgmsMap[tb_details.program_id];
        			prgmFrom = "master";
        		} else {
        			tb_text = specialPrgmsMap[tb_details.program_id];
        			prgmFrom = "special";
        		}
        	} else{
        		tb_text = start_time+'-'+end_time
        	}
        } else {
        	tb_text = start_time+'-'+end_time
        }


        if(clipName =='CLIP_NOT_FOUND' || clip_name == 'CLIP_NOT_FOUND'){
        	 	clipName = tb_details.tb_caption
        	 	clip_name = tb_details.tb_caption
        	 
        }
        
        var clip_info = clip_name;
        var actual_clip_name = clip_name;
        if(clip_name.length>15)
           clip_name = clip_name.substring(0,15) + '..'
        clipName = clip_name;


       


         if(tb_details.tb_caption!=undefined && tb_details.tb_caption!=''){
        	clip_info += "<br><span class='text-primary' style='width:130px;display:inline-block;'>TB Caption: </span> <span>"+tb_details.tb_caption + "</span>"
        }

        if(lang!=undefined && lang!=''){
        	clip_info += "<br><span class='text-primary' style='width:130px;display:inline-block;'>Language: </span> <span style='color:green;'>"+lang + "</span>"
        }

         if(ver!=undefined && ver!=''){
        	clip_info += "<br><span class='text-primary' style='width:130px;display:inline-block;'>Version: </span> <span style='color:blue'>"+ver + "</span>"
        }
         
        if(usr_cap!=undefined && usr_cap!='')
        	clip_info += "<br><span class='text-primary' style='width:130px;display:inline-block;'>Caption: </span> <span style='color:#BDAE19'>"+usr_cap + "</span>"

        if(usr_com_id!=undefined && usr_com_id!='')
        	clip_info += "<br><span class='text-primary' style='width:130px;display:inline-block;'>Commercial ID: </span> <span style='color:#6BC82E'>"+usr_com_id + "</span>"

        if(media_ver!=undefined && media_ver!='')
        	clip_info += "<br><span class='text-primary' style='width:130px;display:inline-block;'>Vertical: </span> <span style='color:#2EC8B8'>"+media_ver + "</span>"

        if(media_sub_ver!=undefined && media_sub_ver!='')
        	clip_info += "<br><span class='text-primary' style='width:130px;display:inline-block;'>Sub Vertical: </span> <span style='color:#2E68C8'>"+media_sub_ver + "</span>"

        if(media_details && media_details.duration != undefined){
        	clip_info += "<br><span class='text-primary' style='width:130px;display:inline-block;'>Duration: </span> <span>"+media_details.duration + "</span>"
        }

        if(tb_details["spot_type"]){
        	clip_info += "<br><span class='text-primary' style='width:130px;display:inline-block;'>Spot Type: </span> <span>"+tb_details.spot_type + "</span>"
        }

        var advtTypeTd = "<td style='min-width:50px;'></td>";
        if(advt_type){
        	advtTypeTd = "<td  style='min-width:50px;'>"+advt_type+"</td>";
        }

        var metadata_details = ""
        var tb_details = undefined 
        tb_details = timebands_map[index]
       if(tb_details!=undefined){
        	/*if(tb_details['priority']!=undefined){
        		metadata_details = '<br><span class="text-primary" style="width:180px;">Priority: </span>' + tb_details['priority'] ;
        		clip_info += '<br><span class="text-primary" style="width:130px;display:inline-block;">Priority: </span>' + tb_details['priority'] ;
        	}*/
        	if(tb_details['position']!=undefined){
        		metadata_details = metadata_details + ' <br><span class="text-primary" style="width:180px;"> Position: </span>' + tb_details['position'] ;
        		clip_info += ' <br><span class="text-primary" style="width:130px;display:inline-block;"> Position: </span>' + tb_details['position'] ;
        	}
        	if(tb_details['min_between_spots']!=undefined){
        		metadata_details = metadata_details + ' <br><span class="text-primary" style="width:180px;"> Min bwn spt: </span>'+ tb_details['min_between_spots'];
        		clip_info += ' <br><span class="text-primary" style="width:130px;display:inline-block;"> Min bwn spt: </span>'+ tb_details['min_between_spots'];
        	}
        	if(tb_details['min_between_product_type']!=undefined){
        		metadata_details = metadata_details + ' <br><span class="text-primary" style="width:180px;"> Min bwn prod type: </span>'+ tb_details['min_between_product_type'];
        		clip_info += ' <br><span class="text-primary" style="width:130px;display:inline-block;"> Min bwn prod type: </span>'+ tb_details['min_between_product_type'];
        	}
        	if(tb_details['break_num']!=undefined){
        		metadata_details = metadata_details + '<br> <span class="text-primary" style="width:180px;"> Break num: </span>' +tb_details['break_num'];
        		clip_info += '<br> <span class="text-primary" style="width:130px;display:inline-block;"> Break num: </span>' +tb_details['break_num'];
        	}
        	if(tb_details['seg_num']!=undefined){
        		metadata_details = metadata_details + ' <br><span class="text-primary" style="width:180px;"> Seg num: </span>'+tb_details['seg_num'];
        		clip_info += ' <br><span class="text-primary" style="width:130px;display:inline-block;"> Seg num: </span>'+tb_details['seg_num'];
        	}
        }

        tr_id_info_map[tr_id] = clip_info;

       


        var tab_row = "";
        if(!display_month){
        //tab_row = "<tr id='"+tr_id+"' title ='"+metadata_details+"' class='metadata'><td><input type='radio' name='tb_row' data='"+tb_details.bulk_ro+"' value='"+tr_id+"' checked='true'></td><td style='width:60px;font-size:10px;'>"+tb_text+"</td><td style='text-align:left;word-break:break-all;'>"
        //
        tab_row = "<tr id='"+tr_id+"' class='metadata "+month_cont+"_tb_row'><td><input type='radio' name='tb_row' data='"+tb_details.bulk_ro+"' value='"+tr_id+"' checked='true'></td><td style='width:60px;font-size:10px;'>"+tb_text+"</td><td style='text-align:left;word-break:break-all;'>"
        		  +'<i class="fa fa-info-circle tb_info" id="tb_info-'+tr_id+'" style="color: #7ab0cf;float:left;cursor:pointer;margin:5px;"></i>  <span class="roedit_clip_name_preview" value="'+clip_id+'" title="'+actual_clip_name+'" style="font-size:10px;">'+clipName+"</span></td>"+advtTypeTd;
        }else{
        	//tab_row = "<tr id='"+tr_id+"' title ='"+metadata_details+"' class='metadata'><td><div style='width:70px;'>"+month_cont+"</div></td><td><div style='width:60px;font-size10px'>"+tb_text+"</div></td><td style='text-align:left;word-break:break-all;'><div class='ro_view_clipname' style='width:120px;font-size:10px'>"+clip_name+"</div></td>"+advtTypeTd;
        	tab_row = "<tr id='"+tr_id+"' class='metadata "+month_cont+"_tb_row'><td><div style='width:60px;'>"+month_cont+"</div></td><td><div style='width:60px;font-size:12px'>"+tb_text+"</div></td><td style='text-align:left;word-break:break-all;'><div class='ro_view_clipname' style='width:120px;font-size:12px'>"+clipName+"</div></td>"+advtTypeTd;
        }
        month_st_moment = moment([month_st_moment.year(),month_st_moment.month()])   
        
        curr_dt_moment = month_st_moment
        todays_date = moment()

        //console.log("month_ed_moment::::"+month_ed_moment.date(),month_ed_moment.month(),month_ed_moment.year())
        //console.log("order_start_date_moment::::"+order_start_date_moment.date(),order_start_date_moment.month(),order_start_date_moment.year())
        //console.log("order_end_date_moment::::"+order_end_date_moment.date(),order_end_date_moment.month(),order_end_date_moment.year())
        // t = curr_dt_moment.format("DD/MM/YYYY")

        var isOrderView = $(".ro_table_view_container").is(":visible");
        while(month_ed_moment.isSameOrAfter(curr_dt_moment)){
        	//console.log("curr_dt_moment::::"+curr_dt_moment.date(),curr_dt_moment.month(),curr_dt_moment.year())
        	 // console.log(todays_date.isSameOrAfter(order_start_date_moment,'day'),t)  
        	 var curDay = curr_dt_moment.format("dddd");

              //if(curr_dt_moment.isSameOrAfter(todays_date,'day') 
              	if(order_end_date_moment.isSameOrAfter(curr_dt_moment) && 
              		curr_dt_moment.isSameOrAfter(order_start_date_moment,'day')){
              		var spot_id = month_cont +'_'+index +'_' +curr_dt_moment.date();
              		var column_class = month_cont +'_' +curr_dt_moment.date();

              		var isEditable = true;
              		//checking day with master_program days.
              		isEditable = checkIsSpotEditable(tb_details, curDay, curr_dt_moment, prgmFrom, fromType);

              		console.log( "Is editableeeeeeeeeeeeeee"+ isEditable)
              		if(isEditable && isOrderView == false){
              			tab_row  = tab_row + "<td class='"+curDay+"'><input class='"+class_name+" "+column_class+"' draggable='true'  ondragstart='drag(event)'" +
            						"ondrop='drop(event)' style='width:25px;' ondragover='allowDrop(event)' type='number' id='"+spot_id+"'/></td>";
              		} else {
              			tab_row  = tab_row + "<td class='"+curDay+"'><input class='"+class_name+" "+column_class+" transparent' "+
	            					"style='width:25px;' readonly='readonly' type='number' id='"+spot_id+"'/></td>"; 
              		}
              	
            	
            }else if(curr_dt_moment.isSameOrAfter(order_start_date_moment) &&
            	    curr_dt_moment.isSameOrBefore(order_end_date_moment)){
                	var spot_id = month_cont +'_'+index +'_' +curr_dt_moment.date();
            	tab_row  = tab_row + "<td class='"+curDay+"'><input class='"+class_name+" "+column_class+" transparent' "+
            	"style='width:25px;' readonly='readonly' type='number' id='"+spot_id+"'/></td>"; 

            }else{
            	var spot_id = month_cont +'_'+index +'_' +curr_dt_moment.date()
            	tab_row  = tab_row + "<td class='"+curDay+"'><input  draggable='false'  ondragstart='drag(event)'" +
            	"ondrop='drop(event)' style='width:25px;' ondragover='allowDrop(event)'  id='"+spot_id+"' type='number' class='transparent "+ class_name+" "+column_class+"' readonly='readonly' size='1'/></td>";
            }

            curr_dt_moment.add(1,"days");

        }

           var tb_rate = ""
           var tc = ""
           if(tb_details['rate']!=undefined){
             tb_rate = tb_details['rate'] 
             rate_id =  month_cont +'_'+index 
             tab_row = tab_row + "<td id='"+rate_id+"_rate'>"+tb_rate+"</td>";
             
         }else{
         	  rate_id =  month_cont +'_'+index 
         	  tab_row = tab_row + "<td id='"+rate_id+"_rate'></td>";
         	 
         }

           var total_spots_id = month_cont +'_'+index 
           //console.log("tb row:::"+total_spots_id);
           tab_row = tab_row + "<td id='"+total_spots_id+"_ts'></td>";
           var tot_cost_id = month_cont +'_'+ index
           tab_row = tab_row + "<td id='"+tot_cost_id+"_tc'></td>";

           tab_row = tab_row + "</tr>";

           setTimeout(function(){
           		initClickOnTBInfo();
           	}, 1000);
           return tab_row;
       } else {
       	return "";
       }

}

function initClickOnTBInfo(){
	$(".tb_info").unbind("click");
	$(".tb_info").click(function(){
		var trId = this.id;
		trId = trId.replace("tb_info-", "");
		$("#view_tb_info").html("")

		if(trId){
			
			$("#view_tb_info").html(tr_id_info_map[trId]);
			$("#view_tb_info").dialog({
									title: "Timeband Details",
									width:500,
  			 						height:300,
									autoOpen: false,
									beforeClose: function(){
										$(".ui-dialog").removeAttr("z-index");
										$("#view_tb_info").dialog("destroy");
									}
								});	

			$("#view_tb_info").dialog('open');
			$(".ui-dialog").css({"z-index": "10000"});
		}
	});
}

/*$('input[type=radio][name=schedule_type]').change(function() {
	var schedule_type = $('input[name=schedule_type]:checked').val();
	if(schedule_type=='1'){
		
		$("#master_program_div").show()
		$("#master_programs").prop('disabled',false)
		$("#startTime").prop('readonly',true)
		$("#endTime").prop('readonly',true)
		$("#startTime, #endTime").css({"background-color": "#eee"});
	}
	else{
		
		$("#startTime").prop('readonly',false)
		$("#endTime").prop('readonly',false)
		
		$("#master_program_div").hide()
	}
})*/

$('#schedule_type').change(function() {
	var schedule_type = $('#schedule_type').val();
	if(schedule_type=='1'){ //if type == program_wise
		
		$("#master_program_div").show()
		$("#master_programs").prop('disabled',false)
		$("#startTime").prop('readonly',true)
		$("#endTime").prop('readonly',true)

		$(".time_input").hide();
		$(".prgm_type").show();
		$("#days_fieldset").hide();
	}
	else{ //if type == timeband_wise
		
		$("#startTime").prop('readonly',false)
		$("#endTime").prop('readonly',false)
		
		$("#master_program_div").hide()
		$("#startTime, #endTime").css({"background-color": "#fff"});

		$(".prgm_type").hide();
		$(".time_input").show();
		$("#days_fieldset").show();
	}
})

function get_end_time(start_time,duration){
	var ss = start_time.split(':');
	var dt = new Date();
	dt.setHours(ss[0]);
	dt.setMinutes(ss[1]);
	dt.setSeconds(ss[2]);
	var et =  new Date(dt.getTime() + parseInt(duration)*1000);	
	return et.toTimeString().split(" ")[0];
}

$("#master_programs").change(function(){
	var prgm_id = $("#master_programs").val();
	
    if (prgm_id!= 0)
       { 	
	        for(j=0;j<programs.length;j++){
	            if (programs[j]._id == 	prgm_id){
	               $('#startTime').val(programs[j].start_time);
	               end_time = get_end_time(programs[j].start_time,hhmmss_to_sec(programs[j].duration))
	               if(end_time=='00:00:00'){
	               	end_time = '23:59:59';
	               }
	               $('#endTime').val(end_time);
	              }
		    	}
	    }
  
});

$(document).on("click",".months_tab .month_tab",function(event){
	    month_id = this.id
		month_view = this.id + '_' + 'view';
	   
		$(".month_div").each(function() {
			$(this).hide();
		})

		$(".month_tab").each(function() {
			//$(this).css({'background-color':'#7da8ed','border':'1px solid #2a6fdd'})
			$(this).css({'background-color':'#fff','border':'1px solid #CFCDCD'})
			$(this).removeClass('active')
		})

		$(".spots_view").show();
		$("#"+month_view).show();
		$("#"+this.id).css({'background-color':'#7da8ed','border':'1px solid #2a6fdd'})
		$("#"+this.id).addClass('active')
		//$("#"+this.id).css({'background-color':'#fff'})
		value = "";
		value= month_view+"_0"
		$("input[name=tb_row][value=" + value + "]").prop('checked', true);
		// update_timeband_list();
		total_spots_count(this.id)

})

function get_th_rows_with_date(mnt_st_dt,mnth_ed_dt){
	var weekday = new Array(7);
	weekday[0]=  "Sun";
	weekday[1] = "Mon";
	weekday[2] = "Tue";
	weekday[3] = "Wed";
	weekday[4] = "Thu";
	weekday[5] = "Fri";
	weekday[6] = "Sat";

    
	mnth_st_momt = moment(mnt_st_dt,"YYYY/MM/DD")
	month_ed_momt = moment(mnth_ed_dt,"YYYY/MM/DD")
	mnth_st_momt = moment([mnth_st_momt.year(),mnth_st_momt.month()])
	tab_rows = "";
	curr_dt_momt = mnth_st_momt;
	while(month_ed_momt.isSameOrAfter(curr_dt_momt)){
		//while(month_ed_momt.isSameOrAfter(curr_dt_momt)){

		if(curr_dt_momt.day()!=0 && curr_dt_momt.day()!=6){
			tab_rows = tab_rows + "<th class='border'>"+curr_dt_momt.date()+"<br> "+weekday[curr_dt_momt.day()] + "</th>";
		}else{
			tab_rows = tab_rows + "<th class='weekend border'>"+curr_dt_momt.date()+" <br>"+weekday[curr_dt_momt.day()] + "</th>";
		}
		curr_dt_momt = curr_dt_momt.add(1,"days")
		//console.log(curr_dt_momt.format("DD/MM/YYYY"),month_ed_momt.format("DD/MM/YYYY"))

	}
	return tab_rows;
}

function removeUnusedMonthElements(){
	var monthArr = [];
		$.each(order_months_map, function(month, month_val) {
			monthArr.push(month);
		});

	    $(".months_tab .month_tab").each(function(){
			var tabId = $(this).attr("id");
			if(monthArr.indexOf(tabId) == -1){
				$(this).remove();
				$(".spots_view #"+tabId+"_view").remove();
			} else {
				$(this).show();
			}
		});
}

$("#spot_type").change(function(){
	var sp_type = $("#spot_type").val()
		if(sp_type=='bonus'){
			$("#rate").val(0)
			$("#rate").hide()
			$("#rate_div").hide()
		}else{
			$("#rate").show()
			$("#rate_div").show()
		}
})

function init_month_tabs(is_view_only){

	removeUnusedMonthElements();

	 	$.each(order_months_map, function(month, month_val) {
	 		var mnth_tab_len = $(".months_tab").find('#'+month).length
	 		if(mnth_tab_len==0){
		   		$(".months_tab").append("<span class='month_tab' id='"+month+"'>"+month+"</span>")
		   		
		   		o_st = month_val['start'];
		   		o_st_momemt = moment(o_st,"YYYY/MM/DD")

		   		drawTable(o_st_momemt,is_view_only);
		   		//$.each(timebands_map, function(){
		   			for(tb_key in timebands_map){

		   			// console.log(JSON.stringify(timebands_map[tb_key]));

		   			var new_tb_row = get_tb_row(month_val['start'], month_val['end'], timebands_map[tb_key], tb_key, false);
		   			var tab_id = month+"_tab";

		   			if( $("#"+tab_id +" tr."+month+"_row").length > 0){
				   	  	$(new_tb_row).insertBefore("#"+tab_id +" tr."+month+"_row");
				   	} else {
				   	  	$("#"+tab_id).append(new_tb_row);
				   	}

		   		}
		   		//});
	     	} else {

	     		// console.log("month start date ..........."+month_val['start']);
	     		// console.log("order start: "+order_start_date);
	     		// console.log("order_end_date...."+order_end_date);

	     		var  order_end_date_moment = order_end_date;
                var order_start_date_moment = order_start_date;
	     		var o_st = month_val['start'];
	     		var cur_dt_mom = moment();

	     		$("#"+month+"_tab tbody tr td input[type=number]").each(function() {
	     			var spt_dt = "";

	     			if(this.id!=undefined){
	     				spt_dt = this.id.split("_")[2];
	     			}
	     		    
	     		    // console.log(o_st+" :: "+spt_dt);

	     		    var spt_dt_mom = moment(o_st,"YYYY/MM/DD")
	     		    spt_dt_mom.set('date',parseInt(spt_dt))
	     		    var todays_date = moment();

	     			if(spt_dt_mom.isSameOrAfter(order_start_date_moment,'day') &&
	     				spt_dt_mom.isSameOrBefore(order_end_date_moment,'day') && spt_dt_mom.isSameOrAfter(todays_date,'day')){

	     				$(this).removeClass('transparent')
	     			    $(this).removeAttr('readonly')
	     			    $(this).prop('draggable',true);

	     			}else if (isSpotEditable &&
	     			    spt_dt_mom.isSameOrBefore(cur_dt_mom) &&
	     			    spt_dt_mom.isSameOrAfter(order_start_date_moment,'day') &&
	     				spt_dt_mom.isSameOrBefore(order_end_date_moment,'day') ){

	     				/*$(this).addClass('transparent');
	     				$(this).attr('readonly');*/

	     				$(this).removeClass('transparent')
	     			    $(this).removeAttr('readonly')
	     			    $(this).prop('draggable',true);

	     			}
	     			 else if (spt_dt_mom.isSameOrBefore(cur_dt_mom)){

	     				$(this).addClass('transparent');
	     				$(this).attr('readonly');

	     			} else {
                           $(this).addClass('transparent');
	     				   $(this).val('');
	     			}     
	     		});

	     	}
	   	});

	    months_list = Object.keys(order_months_map)
	    order_start_date_moment = moment(order_start_date,"DD/MM/YYYY")
	    first_mnth =  MONTH_CONSTANTS[order_start_date_moment.month()] 

	    $(".spots_view  .month_div").each(function(){
             $(this).hide();    
	    });

	   	$("#"+first_mnth+"_view").show();
		//$("#"+first_mnth).css({'background-color':'#fff'})
		$("#"+first_mnth).css({'background-color':'#7da8ed','border':'1px solid #2a6fdd'})
        $("#"+first_mnth).addClass('active') 
		$("#month_view_div").hide();
		$("#delete_tb_div").show();
		$("#edit_tb_div").show();
		$("#update_tb_div").hide();
		$("#clone_tb_div").show();
		$("#add_tb_div").show();
		$("#spots_save").show();

		// calculateAllColumnCount();

	/*	setTimeout(function(){
			$(".spots_view div table tr.metadata").tooltip({
		        position: {
			        my: "center bottom-20",
			        at: "center top",
			        using: function( position, feedback ) {
			          $( this ).css( position );
			          $( "<div>" )
			            .addClass( "arrow" )
			            .addClass( feedback.vertical )
			            .addClass( feedback.horizontal )
			            .appendTo( this );
			        }
		        },
		        content: function () {
		        	// console.log("contenttttttttttt")
	                return $(this).attr('title');
	            }
		    });
		}, 1000);*/
}

$("#month_view").click(function(){
	// alert("clicked");
	order_start_end_dates = $(".start_end_dates").val()
	if(order_start_end_dates!=undefined && order_start_end_dates!=""){
	    months_cal_init()
	    init_month_tabs(false)
	    if(validateTimeband()){
	      timeband_counter++;
	      get_timeband_data(update_timeband_list, timeband_counter,'');
	    var active_mnth =  $('.months_tab').find('.active').prop('id');
		total_spots_count(active_mnth)
	   }
	  
   }else{
   	jAlert("Please enter start and end date");
   	return;
   }
   
})

function get_all_tb_spots(){
	var all_tb_spots = {}
	for (each_key in timebands_map){
         var each_tb_spots =  get_tb_spots(each_key)   
         //console.log("jsonnnnnnnnnnn::::"+JSON.stringify(each_tb_spots))
         for(each_tb_key in each_tb_spots){
             //console.log(each_tb_key +"========="+JSON.stringify(each_tb_spots[each_tb_key]))
         	 all_tb_spots[each_tb_key] = each_tb_spots[each_tb_key]
         }
	}
	return all_tb_spots
}


function get_spots_value(cloned_tb,sel_tb_ind){
	//var sel_tb_ind = 0
	if(sel_tb_ind==0)
	    all_spots = get_all_tb_spots();
    else{
    	sel_tb_ind = get_selected_tb()
    	// console.log("sel_tb_ind::::::::::"+sel_tb_ind)
    	all_spots = get_tb_spots(sel_tb_ind)
    }
	// console.log("get_spots_value:::::"+JSON.stringify(all_spots))
	var clip_details = undefined
	var spot_type = ""
	var spot_type = cloned_tb['type']
	var clip_details = cloned_tb[spot_type]
	var tb_clip_key = ""
	var exitsing_spots = {}
	var tb_name = ""
	var tb_name = cloned_tb['time_band']
	var tb_name = tb_name.replace(/:/g, "_")
	if(clip_details!=undefined){
		tb_clip_key = tb_name + "_" + clip_details['clip_id']+ '_' +  sel_tb_ind
		for(each_month in all_spots){
			spots_map = {}
			spots_map = all_spots[each_month]

            for(each_tb_clip_key in spots_map){
                each_tb_clip =  each_tb_clip_key
            	each_tb_clip = each_tb_clip.replace(/:/g,'_')

            	if(each_tb_clip == tb_clip_key){
            	   exitsing_spots[each_month] = spots_map[each_tb_clip]
                }
                //console.log("11111"+JSON.stringify(exitsing_spots))
            }
		}


   }else{
   	console.log("Clip details UNDEFINED")
   }
   console.log("111111111111"+JSON.stringify(exitsing_spots))
   return exitsing_spots
}


function set_spots(date_range_list,month,tb_pos,is_cloned_tb){
	//console.log("################set_spots")
	//console.log(JSON.stringify(date_range_list),month,tb_pos)
	var todays_moment = moment()
	var input_spot_id = month +'_' + tb_pos + '_';
	for(var i=0;i<date_range_list.length;i++){
	   each_dt_map = {}	
       each_dt_map = date_range_list[i]
       from_dt_rn = each_dt_map['from']
       to_dt_rn = each_dt_map['to']
       from_dt_rn_moment = moment(from_dt_rn,"YYYY/MM/DD")
       to_dt_rn_moment = moment(to_dt_rn,"YYYY/MM/DD")
       step_date_momemt = from_dt_rn_moment
       //while(to_dt_rn_moment.isSame(step_date_momemt)){
       	while(step_date_momemt.isSameOrBefore(to_dt_rn_moment)){
       	
          spot_id = input_spot_id + step_date_momemt.date()
           
            if(is_cloned_tb!=undefined){
            	if(is_cloned_tb && todays_moment.isSameOrBefore(step_date_momemt,'day')){
                       $("#"+spot_id).val(each_dt_map['num_spots'])
            	}else{
            		$("#"+spot_id).val('')
            	}

            }else{
             	$("#"+spot_id).val(each_dt_map['num_spots'])
            }

          step_date_momemt = step_date_momemt.add(1,"days")
          // console.log(step_date_momemt.format("DD/MM/YYYY"))
       }
	}
}

function init_start_end_date(){
	console.log("init_start_end_date")
	months_cal_init();
	init_month_tabs();
}

$("#add_tb").click(function(){
	if(validateTimeband() && check_duplicate_tb() && validateIsVertical() ){
		timeband_counter++;
		var status = get_timeband_data(update_timeband_list, timeband_counter,'');
		var active_mnth =  $('.months_tab').find('.active').prop('id');
		total_spots_count(active_mnth);
    }
});

function validateIsVertical(){
	var status = true;
	if(isVertical){
    	var media_vertical = $("#clp_vertical").val();
    	var media_subvertical = $("#clp_subvertical").val();
    	var errStr = "";
        if(media_vertical!=undefined && media_vertical!="" && media_vertical!='0'){
         	console.log("verticals selected...");
        } else {
        	errStr = " Verticals"
        }

        if(media_subvertical!=undefined && media_subvertical!="" && media_subvertical!='0'){
        	console.log("sub verticals selected...")
        } else {
        	if(errStr){
        		errStr += " and Sub verticals"
        	} else {
        		errStr += " Sub Verticals"
        	}

        	if(errStr){
        		jAlert("Empty "+errStr);
        		status = false;
        	}
        }
	}

	return status;
}

$("#delete_tb").click(function(){
	var confirm_del = "Are you sure you want to delete this timeband"
   
    jConfirm(confirm_del, 'Delete Timeband', function (ans) {
    	if(ans){
	        var	tb_index = "";
			var tb_index = get_selected_tb();
			if(tb_index!=undefined && tb_index!=""){
				 delete_timeband(tb_index)
				 $("#delete_tb_div").show();
				 $("#edit_tb_div").show();
				 $("#update_tb_div").hide();
				 $("#update_clone_tb_div").hide();
				 $("#clone_tb_div").show();
				 $("#add_tb_div").show();
				 $("#spots_save").show();
				 clearFields();
			}
		    
		    var active_mnth =  $('.months_tab').find('.active').prop('id');
			total_spots_count(active_mnth)
			calculateAllColumnCount();
		}

		$('input[name=tb_row]').attr("disabled",false);
	    
    });
})
   
 

function check_duplicate_tb(){
	
  return true
}


$("#update_tb").click(function(){

  if(validateTimeband() && check_duplicate_tb() && validateIsVertical() ){	
	    var tb_index = "";
		tb_index = get_selected_tb();
		
	    edited_tb = undefined
		if(tb_index in timebands_map){
		   edited_tb = timebands_map[tb_index]
		}

		var tb_id = ''
		if(edited_tb['tb_id']!=undefined)
		tb_id = edited_tb['tb_id']

	    existing_spots = {}
	    existing_spots = get_spots_value(edited_tb,tb_index)
	   
	
	    console.log("existing spots::::::::::"+JSON.stringify(existing_spots))

	    var clip_dur_mismatch = false
        
        if(edited_tb['tb_id']!=undefined) {
	        var new_clip_dur = $("#duration").val() 	
	        compare_clip_dur(edited_tb,new_clip_dur)
       }
      
        console.log("afterrrrrrrrrrrrrrr")
	    delete_timeband(tb_index)

	    console.log("deleted timeband::::::::")

	    var bulk_ro = undefined;
	    if("bulk_ro" in edited_tb && edited_tb["bulk_ro"] == true){
	    	bulk_ro = "bulk_ro";
	    }

		get_timeband_data(update_timeband_list, tb_index, bulk_ro, "edit",tb_id);

	    
	    setTimeout(function(){ 
		   for(each_month in existing_spots){
		   	    var mnth_str = each_month.split('_')[0]
				set_spots(existing_spots[each_month],mnth_str,tb_index)
				update_total_spots(mnth_str,tb_index) 
		   }
		   var active_mnth =  $('.months_tab').find('.active').prop('id');
		   total_spots_count(active_mnth)
		   calculateAllColumnCount();
	    },500);

	    

	    $("#delete_tb_div").show();
		$("#edit_tb_div").show();
		$("#update_tb_div").hide();
		$("#update_clone_tb_div").hide()
	    $("#clone_tb_div").show();
		$("#add_tb_div").show();
		$("#spots_save").show();

		$("#all_days").attr("checked", true);
		$("#days_fieldset input.days").each(function(){
			$(this).attr("checked", true);
		});
		$('input[name=tb_row]').attr("disabled",false);
  }

})

function compare_clip_dur(old_tb_details,new_clip_dur){
   var old_tb_type = old_tb_details['type']
   var new_advt_type = $("#spotType_id").val()
   var old_clip_dur = 0 
   old_clip_details = old_tb_details[old_tb_type]
   if(old_clip_details)
     old_clip_dur = old_clip_details['duration']

   if(old_tb_type && new_advt_type && old_tb_type.toLowerCase() == new_advt_type.toLowerCase()
  	&& old_clip_dur!=0){

	   	 console.log("Old clip dur::::::::"+old_clip_dur)
	     console.log("New clip dur:::::::::"+new_clip_dur)

		  	if(parseInt(old_clip_dur)!=parseInt(new_clip_dur)){
		  		      
	          var confirm_msg = "Clip duration changed from "+old_clip_dur+" to "+new_clip_dur + " do u want to continue?"

			   var res = confirm(confirm_msg)
			   if(res==false){
	              $("#duration").val(old_clip_dur)
			   }

	        }
	  	}
  }

 

  




$("#update_clone_tb").click(function(){

  if(validateTimeband() && check_duplicate_tb()){	
	    var tb_index = "";
		tb_index = get_selected_tb();
		
	    edited_tb = undefined
		if(tb_index in timebands_map){
		   edited_tb = timebands_map[tb_index]
		}

	    existing_spots = {}
	    existing_spots = get_spots_value(edited_tb,tb_index)
	   
	    
	    delete_timeband(tb_index)

		get_timeband_data(update_timeband_list, tb_index,'');

	    
	    setTimeout(function(){ 
		   for(each_month in existing_spots){
		     	var mnth_str = each_month.split('_')[0]
				set_spots(existing_spots[each_month],mnth_str,tb_index)
				update_total_spots(mnth_str,tb_index) 
		   }
		   var active_mnth =  $('.months_tab').find('.active').prop('id');
		   total_spots_count(active_mnth);
		   calculateAllColumnCount();
	    },500);

	    $("#delete_tb_div").show();
		$("#edit_tb_div").show();
		$("#update_tb_div").hide();
		$("#update_clone_tb_div").hide();
	    $("#clone_tb_div").show();
		$("#add_tb_div").show();
		$("#spots_save").show();
		$('input[name=tb_row]').attr("disabled",false);
  }

})

$("#edit_tb").click(function(){
	var tb_selected = get_selected_tb();
	if(tb_selected!=undefined && tb_selected!=""){
	    //console.log(tb_selected)
	    edit_tb(tb_selected);

	    $("#delete_tb_div").show();
		$("#edit_tb_div").hide();
		$("#update_tb_div").show();
		$("#update_clone_tb_div").hide();
		$("#clone_tb_div").hide();
		$("#add_tb_div").hide();
		$("#spots_save").hide();
		$('input[name=tb_row]').attr("disabled",true);
   }
})



$("#clone_tb").click(function(){
	var tb_sel = get_selected_tb();
	
		var cloned_tb = undefined
		if(tb_sel!=undefined){
		if (tb_sel in timebands_map){
			cloned_tb = timebands_map[tb_sel]
		}

		var	existing_spots = {}
		existing_spots = get_spots_value(cloned_tb,tb_sel);
		timeband_counter++
		edit_tb(tb_sel);

		update_timeband_list(cloned_tb,timeband_counter)
	
		// console.log("cloneexisting:::::"+JSON.stringify(existing_spots))
		// console.log("timeband_counter:::::::::"+timeband_counter)
		
		setTimeout(function(){ 
			for(each_month in existing_spots){
				var mnth_str = each_month.split('_')[0]
				 set_spots(existing_spots[each_month],mnth_str,timeband_counter,true)
				 update_total_spots(mnth_str,timeband_counter)
			}
	        var active_mnth =  $('.months_tab').find('.active').prop('id');
			total_spots_count(active_mnth);
			calculateAllColumnCount();
		},200);
	    
		$("#delete_tb_div").show();
		$("#edit_tb_div").hide();
		$("#update_tb_div").hide();
		$("#clone_tb_div").hide();
		$("#update_clone_tb_div").show()
		$("#add_tb_div").hide();
		$("#spots_save").hide();
		$('input[name=tb_row]').attr("disabled",true);
   }
})

function get_selected_tb(){
	var sel_tb_id = $('input[name=tb_row]:checked').val()
	if(sel_tb_id!=undefined && sel_tb_id!=""){
	   var sel_tb_id_split = sel_tb_id.split("_");
	   var tb_index = sel_tb_id_split[1];
	   return tb_index
   }else{
   	jAlert("Please select timeband")
   }
}

function edit_tb(tb_index){
	var tb_details = undefined
	if(tb_index in timebands_map){
	   tb_details = timebands_map[tb_index]
    }
       
    var tb_caption = ''
    if(tb_details['tb_caption']!=undefined)
    	tb_caption = tb_details['tb_caption']
    $("#tb_caption").val(tb_caption)
   
	$("#startTime").val(tb_details.start_time)
	$("#endTime").val(tb_details.end_time)
	spot_type = ""
	spot_type = tb_details.type
	$("#spotType_id").val(spot_type)

	var media = undefined
	media = tb_details[spot_type]
	var cust_id = $("#customer_id").val();

	var pkg_type = ''
	if(tb_details.spot_type!=undefined)
		$('#spot_type').val(tb_details['spot_type'])
	    if(tb_details.spot_type== "bonus"){
	    	$("#rate_div").hide();
	    
	    } 

	if(tb_details['package_detail']!=undefined){
		if(tb_details['package_detail']=='per_10_sec'){
			$('#rate_label').text('Rate/10s')
		}else if(tb_details['package_detail']=='per_day'){
			$('#rate_label').text('Rate/day')
		}else if(tb_details['package_detail']=='per_unit'){
			$('#rate_label').text('Rate/Unit')
		}
	}
  
   
   var is_slot =  false;
   if(advt_type_map[spot_type]['is_slot'])
   is_slot =   true;


    if(advt_type_map[spot_type]['time_consumable'] && 
		!is_slot){
		$('#cg_media_div').hide();
		$('#media_div').show()
	}else{
		$('#cg_media_div').show();
		$('#media_div').hide()
		$('#cg_media').val(media['clip_id'])
	}

	load_medias(cust_id)
	load_advt_type_modules()
	
	setTimeout(function(){
	$("#duration").val(media['duration'])
	$("#media").val(media['clip_id'])
	},200)

	if(media['user_media_id']!=undefined)
       $("#user_commercial_id").val(media['user_media_id'])

    if(media['user_media_caption']!=undefined)
       $("#user_caption").val(media['user_media_caption'])	

    if(media['media_vertical']!=undefined){
    	$("#clp_vertical").val(media['media_vertical']);
    	$("#clp_subvertical").empty();
    	if(media['media_vertical']!='0'){
			var sub_vert_opts = get_sub_vertical_options(media['media_vertical'])
			$("#clp_subvertical").append(sub_vert_opts)
        }
   }
    
    setTimeout(function(){
        if(media['media_subvertical']!=undefined){
    		$('#clp_subvertical').val(media['media_subvertical']);
    	}
    },200);

	//if(tb_details['priority']!=undefined)
		//$("#priority_id").val(tb_details['priority'])
	if(tb_details['position']!=undefined)
		$("#position").val(tb_details['position'])
	if(tb_details['min_between_product_type']!=undefined)
		$("#minsBtwnProductType").val(tb_details['min_between_product_type'])
	if(tb_details['min_between_spots']!=undefined)
		$("#minsBtwnSpots").val(tb_details['min_between_spots'])
	if(tb_details['break_num']!=undefined)
		$("#break_num").val(tb_details['break_num'])
	if(tb_details['seg_num']!=undefined)
		$("#seg_num").val(tb_details['seg_num'])
	if(tb_details['rate']!=undefined)
		$("#rate").val(tb_details['rate'])
	if(media['break_bumper']!=undefined)
		$("#break_bumpers").val(media['break_bumper']);
	setTimeout(function(){
	if(tb_details['tb_caption']!=undefined && tb_details["tb_caption"]!=""){
		$("#tb_caption").val(tb_details['tb_caption'])
	}
   },100)

	setProgramDropdown(tb_details);
}

function delete_timeband(tb_index){
	var deleted_tb_details = undefined
	var deleted_tb_details = timebands_map[tb_index]

 	if (tb_index in timebands_map){
     	delete  timebands_map[tb_index]
 	}	
  	spot_type = ""
  	spot_type = deleted_tb_details['type']
  	del_tb_clip_details = deleted_tb_details[spot_type]
    del_tb_id = "tb_"+tb_index 
    $('.spots_view table').each(function () { 
       tab_id = this.id
     
	     $('#'+tab_id+' > tbody  > tr').each(function() {
	     	  row_id = this.id
	         
	          if(row_id!=undefined && row_id!="" && row_id==del_tb_id){
	          	$(this).remove();
	          }
	     });
   });
}
 
function get_timeband_data(callback, tb_index, isBulkRO, action,tb_id){

	var tb = {}
	start_time = "";
	end_time = "";
	var isProgram = $("#schedule_type").val();
	if(tb_id!='')
		tb['tb_id'] = tb_id
	
	
	if(isProgram == 0){
		start_time = $("#startTime").val();
		end_time = $("#endTime").val();
		tb["program_wise"] = false;
		var selDays = [];
			$("fieldset#days_fieldset input.days").each(function(){
			var isChecked = $(this).is(":checked");
			if(isChecked){
				selDays.push($(this).val());
			}
		});
		tb["days"] = selDays;

	} else {
		start_time = "00:30:00";
		end_time = "24:00:00";
		tb["program_wise"] = true;
		var type = $("#prgm_gen_from").val();
		tb["program_gen_from"] = type;
		var prgm_id = $("#"+type+"_programs").val();

		if(prgm_id != 0){
			tb["program_id"] = prgm_id;
		} else {
			jAlert("Please choose valid Program");
			return;
		}
	}

	rpts = $("#rate").val();
	spot_type = $("#spotType_id").val();
	media_id = $("#media").val();
	var pkg_type = ''
	pkg_type = $('#spot_type').val();
	var tb_caption = $("#tb_caption").val();
    
    if(tb_caption!=undefined && tb_caption!='')
    	tb['tb_caption'] = tb_caption

	if(start_time!=undefined && start_time!="")
	   tb['start_time'] = start_time.trim()
    else{
    	jAlert("Start time empty")
    	return;
    }
    if(spot_type!=undefined && spot_type!="")
    	tb['type'] = spot_type
      else{
      	jAlert('Invalid advertisement type')
      	return
      }
      // console.log('pkg_type::::'+pkg_type)
      if(pkg_type!=undefined && pkg_type!=''){
      	tb['spot_type'] = pkg_type
      }

    if(end_time!=undefined && end_time!=""){
	   tb['end_time'] = end_time.trim()
	   tb_name = "";
	   tb_name = start_time.trim() + '_' +  end_time.trim()
	   tb['time_band'] =  tb_name
    }else{
    	jAlert("End time empty")
    	return
    }

    if(advt_type_map[spot_type]['package_detail']!=undefined){
    	var pkg_detail = advt_type_map[spot_type]['package_detail']
    	tb['package_detail'] = pkg_detail
    }


 
   	  if(rpts!=undefined && rpts!="") { 
		   tb['rate'] = parseFloat(rpts)
	    }
  

    selected_media = $("#media").val();

    if(advt_type_map[spot_type]['best_effort']!=undefined){
    	break_bumper = $("#break_bumpers").val();
    	if(break_bumper!=undefined && break_bumper!="0")
    	tb['break_bumper'] = break_bumper
    }

    //Set Advt type parameters
    var advt_type_param = {}
    advt_type_param = advt_type_map[spot_type]['modules']
   
    if(advt_type_param!=undefined){
	   /* if(advt_type_param.indexOf('priority')>-1){
		    priority = $("#priority_id").val()
		    if(priority!=undefined){
		       tb["priority"] = priority
		    }
	    }*/

	    if(advt_type_param.indexOf('position')>-1){
		    position = $("#position").val()
		    if(position!=undefined){
		    	tb["position"] = position
		    }
	    }

	    if(advt_type_param.indexOf('time_btwn_spots')>-1){
		    minsBtwnSpots = $("#minsBtwnSpots").val()
		    if(minsBtwnSpots!=undefined){
		    	tb["min_between_spots"] = minsBtwnSpots
		    }
	    }

	    if(advt_type_param.indexOf('time_btwn_product_type')>-1){
		    minsBtwnProductType = $("#minsBtwnProductType").val()
		    if(minsBtwnProductType!=undefined){
		    	tb["min_between_product_type"] = minsBtwnProductType
		    }
	    }

	    if(advt_type_param.indexOf('break')>-1){
	    	break_num = $("#break_num").val()
	    	if(break_num!="")
	    	   tb['break_num'] = parseInt(break_num)
	    	//console.log("set break")
	    }

	    if(advt_type_param.indexOf('segment')>-1){
	    	tb['seg_num'] = $("#seg_num").val()
	    }
    }

    // console.log("tbbbbbbbbbbb"+JSON.stringify(tb))
 
    tb_clip = {}
   	url = '/commercials/'+media_id
   	var timeband_clip = undefined
   	// console.log("type....."+isBulkRO);
   	if(isBulkRO != "bulk_ro" || action == "edit"){
   		if(isBulkRO == "bulk_ro"){
   			tb["bulk_ro"] = true;
   		}
        

      var is_slot = false;
      if(advt_type_map[spot_type]['is_slot'])         
      	is_slot = true;


        var user_media_caption = "";
       	user_media_caption = $("#user_caption").val()
       	if(user_media_caption!=undefined && user_media_caption!="")
       	tb_clip['user_media_caption'] = user_media_caption	
   
	    if(advt_type_map[spot_type]['time_consumable'] && 
	       !is_slot){  
			$.ajax({
				type : "GET",
				url : url,
				success : function(data) {
		            date_ranges = []
					if(data.commercial!=undefined){
		               var timeband_clip = data.commercial

		                if(timeband_clip!=undefined){
					       tb_clip['clip_id'] = timeband_clip['_id']
					       if(timeband_clip['caption']!=undefined && timeband_clip['caption']!='')
					       tb_clip['caption'] = timeband_clip['caption']
					       else
					       	tb_clip['caption'] = timeband_clip['name']

					       if(timeband_clip['language']!=undefined){
					         tb_clip['language'] = timeband_clip['language']
					       }
					       if(timeband_clip['version']!=undefined){
					         tb_clip['version'] = timeband_clip['version']
					       }
					       if(advt_type_map[spot_type]['best_effort']!=undefined){
	                         	break_bumper = $("#break_bumpers").val();
	                     	if(break_bumper!=undefined && break_bumper!="0")
	                        	tb_clip['break_bumper'] = parseInt(break_bumper)
	                        }
					       dur = 0
					       dur = $("#duration").val();
					       if(dur!=undefined && dur!="" && dur!=0){
					       	 tb_clip['duration'] = dur
					       	 //console.log("durrrrrrrrrrrrr"+dur);
					       }
					       var user_id_media = ""
					       user_media_id = $("#user_commercial_id").val()
					       if(user_media_id!=undefined && user_media_id!="")
					       	 tb_clip['user_media_id'] = user_media_id

					       	var user_media_caption = "";
					       	user_media_caption = $("#user_caption").val()
					       	if(user_media_caption!=undefined && user_media_caption!="")
					       	tb_clip['user_media_caption'] = user_media_caption	

					        var media_vertical = $("#clp_vertical").val();
	                        var media_subvertical = $("#clp_subvertical").val();
	                        if(media_vertical!=undefined && media_vertical!="" && media_vertical!='0'){
	                         	tb_clip['media_vertical'] = media_vertical;

	                         	if(media_subvertical!=undefined && media_subvertical!="" && media_subvertical!='0'){
		                        	tb_clip['media_subvertical'] = media_subvertical;
		                        }
	                        }

	                        if(isVertical){
	                        	var errStr = "";
		                        if(media_vertical == undefined || media_vertical =="" || media_vertical == '0') {
		                        	errStr = " Verticals"
		                        }
		                        if(media_subvertical == undefined || media_subvertical == "" || media_subvertical == '0') {
		                        	if(errStr){
		                        		errStr += " and Sub verticals"
		                        	} else {
		                        		errStr += " Sub Verticals"
		                        	}
		                        }

	                        	if(errStr){
	                        		jAlert("Empty "+errStr);
	                        		return false;
	                        	}
		                	}

		                   tb[spot_type] = tb_clip;
		                   
		                   if(callback != undefined){
		                   		callback(tb, tb_index, isBulkRO);
		                   		clearFields();
		                   } 
					    }else{
					    	console.log("Clip UNDEFINED")
					    	return;
					    }
					}else{
						console.log("Clip UNDEFINED")
						return;
					}
				}
			})
		}else{
			tb_clip['clip_id'] = $("#cg_media").val()
			tb_clip['caption'] = $("#cg_media").val()
			tb_clip['duration'] = $("#duration").val()
			tb[spot_type] = tb_clip

			// if(isVertical){
				// var media_vertical = $("#clp_vertical").val();
	   //          var media_subvertical = $("#clp_subvertical").val();

				// if(media_vertical!=undefined && media_vertical!="" && media_vertical!='0'){
				// 	tb_clip['media_vertical'] = media_vertical;
				// }
	   //          if(media_subvertical!=undefined && media_subvertical!="" && media_subvertical!='0'){
	   //          	tb_clip['media_subvertical'] = media_subvertical;
	   //         	}
	        // }

	        var media_vertical = $("#clp_vertical").val();
            var media_subvertical = $("#clp_subvertical").val();
            if(media_vertical!=undefined && media_vertical!="" && media_vertical!='0'){
             	tb_clip['media_vertical'] = media_vertical;

             	if(media_subvertical!=undefined && media_subvertical!="" && media_subvertical!='0'){
                	tb_clip['media_subvertical'] = media_subvertical;
                }
            }

            if(isVertical){
            	var errStr = "";
                if(media_vertical == undefined || media_vertical =="" || media_vertical == '0') {
                	errStr = " Verticals"
                }
                if(media_subvertical == undefined || media_subvertical == "" || media_subvertical == '0') {
                	if(errStr){
                		errStr += " and Sub verticals"
                	} else {
                		errStr += " Sub Verticals"
                	}
                }

            	if(errStr){
            		jAlert("Empty "+errStr);
            		return false;
            	}
        	}

			if(callback != undefined){
				callback(tb, tb_index, isBulkRO);
				clearFields();
			} 
		}
	} else {
			tb_clip['clip_id'] = $("#cg_media").val()
			tb_clip['caption'] = $("#cg_media").val()
			tb[spot_type] = tb_clip
			if(callback != undefined){
				callback(tb, tb_index, isBulkRO);
				clearFields();
			} 
	}

 }

function update_timeband_list(time_band_data,key, type){

	    timebands_map[key] = time_band_data;
	   	$.each(order_months_map, function(month, month_val) {
	   	  var new_tb_row = "";
	   	  new_tb_row = get_tb_row(month_val['start'],month_val['end'],time_band_data,key,false, type);
	   	  var tab_id = ''
	   	  tab_id = month + '_' +'tab';

	   	  if( $("#"+tab_id +" tr."+month+"_row").length > 0){
	   	  	$(new_tb_row).insertBefore("#"+tab_id +" tr."+month+"_row");
	   	  } else {
	   	  	$("#"+tab_id).append(new_tb_row);
	   	  }

	   	});

	   	setTimeout(function(){
            $(".roedit_clip_name_preview").unbind('click');
			$(".roedit_clip_name_preview").click(function(){
				var id = $(this).attr('value');
				var title = $(this).attr('title');
				showClipPreview(id, title, '#ro-playVideo');
			});
		}, 1000);

		if(Object.keys(timebands_map).length>0)
			$('.total_amount_spots').show();
	   
}


function allowDrop(ev) {
    ev.preventDefault();
}

function drag(ev) {
	class_name = $("#"+ev.target.id).prop('class')
	if(class_name=='transparent'){
		//console.log('returning false::::')
		return false;
	}
    ev.dataTransfer.setData("text", ev.target.id);
}

function drop(ev) {
	
	if(class_name=='transparent'){
		return false;
	}
    ev.preventDefault();
    var src_id = ev.dataTransfer.getData("text");
    var src_date =  src_id.split("_")[2];

    var dst_id = ev.target.id;
    var dst_date = dst_id.split("_")[2];

    var src_row = src_id.split("_")[1];
    var dst_row = dst_id.split("_")[1]

    var month = src_id.split("_")[0];
    var src_month = month +"_" + src_row;
    
    var val = $("#"+src_id).val();

    if(src_row == dst_row && src_date != dst_date){
    	copyValues(parseInt(src_date),parseInt(dst_date),val,src_month);
    }

    if(src_date == dst_date && src_row != dst_row){
    	copyValuesToColumn(parseInt(src_row), parseInt(dst_row), val, month, src_date);
    }


    var class_name = $("#"+ev.target.id).prop('class');
    var class_name_split = class_name.split(" ");
	var this_id = $("#"+ev.target.id).prop('id');
	var this_id_split = this_id.split("_");

    tb_key = this_id_split[1]
    tb_details = undefined
    tb_details = timebands_map[tb_key]
    for_month = this_id_split[0]
    tb_index = this_id_split[1]

    update_total_spots(for_month,tb_index);
    // calculateAllColumnCount();
   
}

function update_total_spots(mnth,tb_ind){
    	var mnth_key_dic = order_months_map[mnth]
    	var tb_details = undefined
    	
        var mnth_st = mnth_key_dic['start']
        var mnth_st_moment = moment(mnth_st,"YYYY/MM/DD")
        var mnth_ed = mnth_key_dic['end']
        var mnth_ed_moment = moment(mnth_ed,"YYYY/MM/DD")
        //diff_dur = mnth_end_moment.diff(mnth_start_moment)
        var diff_dur = moment.duration(mnth_ed_moment.diff(mnth_st_moment));
        var total_days_in_month = diff_dur.asDays() + 1
        var spots_cnt = 0
        var total_days_count = 0
        var cur_date_mom = mnth_st_moment
        for(var p=0; p<total_days_in_month;p++){
            if(cur_date_mom.isSameOrAfter(order_start_date,'day') && 
            	cur_date_mom.isSameOrBefore(order_end_date,'day')){
                //console.log(cur_date_mom.format("YYYY/MM/DD hh:mm:ss")+"==="+p)
	        	var dt = p+1
	        	var input_id = mnth+'_'+tb_ind+'_'+dt
	        	var len =  $("#"+input_id).length
	        	if(len!=0){
	        		var val = $("#"+input_id).val()
	        		if(val!=""){
	        		   spots_cnt = spots_cnt + parseInt(val) 
	        		   total_days_count = total_days_count + 1
	        	    }
	        	}
	        	// else{
	        	// 	console.log(input_id + ":::::0")
	        	// }
           }
           cur_date_mom.add(1,"days")

        }
        var  t_sp_id = mnth+"_"+tb_ind+"_ts"
        $("#"+mnth+"_"+tb_ind+"_ts").text(spots_cnt)

        tb_details = timebands_map[tb_ind]
        if(tb_details!=undefined){
        	var sp_type = tb_details['type']
        	var media_details = undefined
        	var clip_dur = 0
        	media_details = tb_details[sp_type]
            var tc = 0
            var rate = 0
            var pkg_detail = ''
            if(tb_details['package_detail']!=undefined)
               pkg_detail = tb_details['package_detail']              
            //console.log("pkg_detail::::::::::"+pkg_detail)
            if(tb_details['rate']!=undefined)
            rate = tb_details['rate']
            if(media_details['duration']!=undefined)
            clip_dur = media_details['duration']  



            if(pkg_detail=='per_day'){
             tc = rate * total_days_count
            }else if(pkg_detail=='per_10_sec'){
               if(clip_dur==0)
            	clip_dur = 10	
              tc = parseFloat(clip_dur/10)*rate*parseInt(spots_cnt)
              tc = tc.toFixed(2)
            }else if(pkg_detail=='per_15_sec'){
               tc = rate * spots_cnt
            }else if(pkg_detail=='per_30_min'){
               //var  prgm_count = clip_dur/1800
               tc = rate * spots_cnt	
            }else if(pkg_detail=='per_unit'){
               tc = rate * spots_cnt   
            }

            $("#"+mnth+"_"+tb_ind+"_tc").text(tc)
        }
        total_spots_count(mnth)
}

function total_spots_count(month_key){
  var ts = 0
  var ta = 0	
  // console.log(month_key);
  for(each_key in timebands_map){
  	// console.log("each_key:::::"+each_key)
  	  var ts_id = month_key + '_' + each_key + '_'+'ts'
  	  var tc_id = month_key + '_' + each_key + '_'+'tc'
  	  if($("#"+ts_id)!=undefined){
          var tb_spts = $("#"+ts_id).text() 
          if(tb_spts!=''){
          	ts = ts + parseInt(tb_spts)
          }
  	  }
  	  //console.log("kkkkkkkkkkk"+tc_id)
  	  if($("#"+tc_id)!=undefined){

          var tb_cost = $("#"+tc_id).text() 
          if(tb_cost!=''){
          	//console.log("jjjjjjjjj"+tc_id+"======"+tb_cost)
          	ta = ta + parseFloat(tb_cost)
          }
  	  }

  }
  ta = ta.toFixed(2)
  var total_spts = 'Total Spots: '+ts
  $("#total_spots_count").text(total_spts)
  var total_amt = 'Total cost: '+ta
  $("#total_amount_count").text(total_amt)
 
 
  var tot_spts_left = $("#"+month_key+"_tab").width()-$(".total_amount_spots").width();
  $(".total_amount_spots").css({'left': tot_spts_left+'px','position':'relative'})


}

function copyValues(src,tar,value,src_month){
	
	if(src>tar){
		dif = src - tar;
		tar = tar;
		src = parseInt(src) + 1;
		if(!isNaN(src) && !isNaN(tar)){
			for(i=tar;i<src;i++){
				slot_id = src_month + "_" + i
				if( !$("#"+slot_id).hasClass("transparent") ){
			    	$("#"+slot_id).val(value).trigger("change");
			    }
			}
		}
	}else{
		dif = tar - src;
		src = parseInt(src) + 1;
		tar = parseInt(tar) + 1;
		
		for(i=src;i<tar;i++){
			slot_id = src_month + "_" + i
			if( !$("#"+slot_id).hasClass("transparent") ){
				$("#"+slot_id).val(value).trigger("change");
			}
		}
	}
}

function copyValuesToColumn(srcRow, tarRow, value, month, date){
	
	if(srcRow > tarRow){
		var dif = srcRow - tarRow;
		var srcRow = parseInt(srcRow) + 1;
		var tarRow = tarRow;

		if(!isNaN(srcRow) && !isNaN(tarRow)){
			for( var i=tarRow; i<srcRow; i++ ){
				var slot_id = month+"_"+i+"_"+date;
				if( !$("#"+slot_id).hasClass("transparent") ){
			    	$("#"+slot_id).val(value).trigger("change");
			    }
			}
		}
	}else{
		var dif = tarRow - srcRow;
		var srcRow = parseInt(srcRow) + 1;
		var tarRow = parseInt(tarRow) + 1;

		for( var i=srcRow; i<tarRow; i++ ){
			var slot_id = month+"_"+i+"_"+date;
			if( !$("#"+slot_id).hasClass("transparent") ){
				$("#"+slot_id).val(value).trigger("change")
			}
		}
	}
}

function calculate_total_spots(month_tb_total_spots,month_val){
	spots_list = []
	total_spots_count=0
	//console.log(month_key,month_val)
	for (month_key in month_tb_total_spots){
		if(month_val==month_key){
		spots_list =  month_tb_total_spots[month_key]
		for(k=0;k<spots_list.length;k++){
			each_dt = spots_list[k];
			days_diff = 0
			if(each_dt!=undefined){
				if('from' in each_dt && 'to' in each_dt){
                   var start = moment(each_dt['from']);
                   var end = moment(each_dt['to']);
                   days_diff = end.diff(start, "days")
                   days_diff = parseInt(days_diff)+ 1
                   spots_sum = days_diff *parseInt(each_dt['num_spots'])
                   total_spots_count = total_spots_count + spots_sum
				}
			}
		}
	  }   
	}

    //console.log("calculate_total_spots::::"+total_spots_count);
    return total_spots_count;
}


function hhmmss_to_sec(hhmmss){
	var hms = hhmmss; 
	var a = hms.split(':');
	var seconds = parseInt(((a[0]) * 60 * 60)) + parseInt(((a[1]) * 60)) + parseInt(((a[2])));	
	return seconds; 
}



$("#media").change(function(){
	sel_clip_id = $("#media").val()
	spot_type = $("#spotType_id").val();
	var clip_name = $("#media option:selected").text()
	var url = '/commercials/'+sel_clip_id
		$.ajax({
			type : "GET",
			url : url,
			success : function(data) {
				if(data.commercial!=undefined){
				  clp_dur = data.commercial['dur']	
				  clp_dur = hhmmss_to_sec(clp_dur)
	              $("#duration").val(clp_dur)
	              $("#tb_caption").val(clip_name)
	           }
	        }
	    })
   })


function clearFields(){
	$("#startTime").val('');
	$("#endTime").val('');
	$("#clip").val('');
	$("#rate").val('');
	
	$("#duration").val('');
	$("#media").val(0);
	$("#master_programs").val('0')
	$("#position").val('any')
	//$("#priority_id").val('5')
	$("#minsBtwnSpots").val('00:00:00')
	$("#minsBtwnProductType").val('00:00:00')
    $("#break_num").val('') 
    $("#seg_num").val('') 
    $("#break_bumpers").val('0')
    $('#user_commercial_id').val('')
    $('#user_caption').val('')
    // $('#clp_vertical').val('0')
    // $('#clp_subvertical').val('0')
    $('#cg_media').val('')
    $('#tb_caption').val('')
}



function construct_date_range(spots_assigned,total_days_in_month,year,month){
	//console.log("total_days_in_month"+total_days_in_month)
	i=0;
	st_dt = -1;ed_dt = -1;
	date_array = [];
	prev = 0;
	
	while(i < spots_assigned.length){
		if(st_dt==-1){
			
			if(spots_assigned[i]!=0){
				st_dt = i + 1;
				st_dt = ("0"+st_dt).slice(-2);
			}
		}else if(st_dt!=-1 && ed_dt==-1 && i!=0){

				diff = Math.abs( (spots_assigned[i]) - (spots_assigned[prev]))
				if(diff!=0){
					ed_dt = prev + 1;
                    try{
						json_dt = {};
						spot_start_str = year +"/" +month  + "/" +st_dt;
						spot_start = moment(spot_start_str,"YYYY/MM/DD")
						spot_end_str = year + "/" + month + "/"+ed_dt;
						spot_end =  moment(spot_end_str,"YYYY/MM/DD")
						if(spot_start.isValid() && spot_end.isValid()){
							json_dt['from'] = spot_start.format("YYYY/MM/DD")
							json_dt['to'] = spot_end.format("YYYY/MM/DD")
							json_dt['num_spots'] = parseInt(spots_assigned[prev]);
							date_array.push(json_dt);
					    }
						
				   }catch(ex){
                      console.log("Exception in construct_date_range:::::"+ex)
				   }
					st_dt = -1;
					ed_dt = -1;
					if(spots_assigned[i]!=0){
						st_dt = i + 1;
						st_dt = ("0"+st_dt).slice(-2);
					}
				}
		}
		
		if(st_dt!=-1 && i==total_days_in_month-1){
			ed_dt = i+1;
			try{
				json_dt = {};
				spt_start_str = year+ "/" + month +"/" + st_dt;
				spt_start = moment(spt_start_str,"YYYY/MM/DD")
				spt_end_str = year + "/" + month + "/" +ed_dt;
				spt_end = moment(spt_end_str,"YYYY/MM/DD")
				if(spt_start.isValid() && spt_end.isValid()){
					json_dt['from'] = spt_start.format("YYYY/MM/DD")
					json_dt['to'] = spt_end.format("YYYY/MM/DD")
					json_dt['num_spots'] = parseInt(spots_assigned[i]);
					date_array.push(json_dt);
			    }
	    	}catch(Ex){
	    		console.log("Exception in construct_date_range::::::"+Ex)
	    	}
			st_dt = -1;
			ed_dt = -1;
		}
		prev = i;
		i++;
	}
	/*if(date_array.length==0){
		jAlert("Please enter spots");
	}*/
	
	return date_array;
}

function set_existing_spots(tb_details,tb_index){
	//console.log("tbbb dtailssssss"+JSON.stringify(tb_details))
	spot_type = "";
	spot_type = tb_details['type']
	clip_details = tb_details[spot_type]
	dt_rn_list = []
	if(clip_details['date_ranges']!=undefined)
	   dt_rn_list = clip_details['date_ranges']
	//console.log("date range list::::"+ JSON.stringify(dt_rn_list))
   
    month_cont = 0 
	rate = tb_details['rate']
	//console.log("RATE:::"+rate)
	for(l=0;l<dt_rn_list.length;l++){
		dt_rn = dt_rn_list[l]
		from_dt_obj = new Date(dt_rn['from'])
		to_dt_obj = new Date(dt_rn['to'])
		//console.log("for month:::"+from_dt_obj.getMonth())
		
		step_date = from_dt_obj
		while(to_dt_obj>=step_date){
			//console.log(step_date.getDate());
             
			  input_spot_id = MONTH_CONSTANTS[from_dt_obj.getMonth()] + "_" + tb_index + "_" +step_date.getDate()
			  //console.log("input psot idddd:::"+input_spot_id)
			  // if( !$("#"+input_spot_id).hasClass("transparent") ){
              	$("#"+input_spot_id).val(dt_rn['num_spots']);
              // } else {
              // 	$("#"+input_spot_id).val("");
              // }
             
              step_date.setDate(step_date.getDate() + 1);
		}

	}
     
     for(month_key in order_months_map){
	    var rate_id = month_key+"_" +tb_index +"_"+"rate";
	
	    $("#"+rate_id).text(rate);
     }
 
}

function commonDetails(){
	var cust = $("#customer_id").val();
	var priority = $("#priority_id").val();
	var start_date = order_start_date.format("YYYY/MM/DD");
	var end_date = order_end_date.format("YYYY/MM/DD");
    var ro_date = $("#ro_date").val();	
    var ro_num = $("#ro_number").val();
    var remarks = $("#ro_remarks").val();
	var sales_ex = $("#sales_ex").val();
	var agency_id = $("#agency_id").val();
	var agency_code = $('#agency_code').val();
	var client_code = $('#clientcode').val();
    var branch_id = $("#branch_id").val();
    var receipt_num = $("#receipt_number").val();

    var billing_type = $("#billing_type").val()
    var bill_to = $("#bill_to").val()
    var bill_type = $("#bill_type").val()
    var ro_scan = $("#ro_scan_copies").val()

	var jsonObj = {};
	jsonObj["agencycode"] = agency_code;
	jsonObj['clientcode'] = client_code;
	if ($('#advance_payment').is(':checked')){
    	jsonObj['advance_payment'] = true;	
    }
	jsonObj["customer"] = cust;
	if(ro_date!=undefined && ro_date!="")
	jsonObj["ro_date"] = moment(ro_date,"DD/MM/YYYY").format("YYYY/MM/DD");
    if(ro_num != undefined && ro_num != "")
    jsonObj["ro_num"] = ro_num 
    if(remarks != undefined && remarks != "")
    jsonObj["remarks"] = remarks   	
	jsonObj["start_date"] = start_date;
	jsonObj["end_date"] = end_date;
	console.log("RO Scannnnnnnnnnnnn"+ro_scan)
	if(ro_scan)
	   jsonObj['ro_scan'] = ro_scan
	
	if(sales_ex!=undefined && sales_ex!=null && sales_ex!="null" && 
	    sales_ex!="0" && sales_ex !="" ){
    var sales_ex_id = ''
    sales_ex = sales_ex.toUpperCase()		
    sales_ex_id = sales_ex_name_id_map[sales_ex]
    if(sales_ex_id!=undefined)
	jsonObj["sales_ex"] = sales_ex_id;
    }
    if(agency_id!=undefined && agency_id!=null && agency_id!="null"  &&
       agency_id!="0" && agency_id !=""){
		jsonObj["agency_id"] = agency_id;
	}  

	//advance payment validations.
	if($('#advance_payment').is(':checked')== true){
		if(receipt_num){
			jsonObj["receipt_no"] = receipt_num;
		} else {
			jAlert("Empty Reciept number");
			return;
		}
	}
    if(branch_id!=undefined && branch_id!=null && branch_id!="null"  && 
       branch_id!="0" && branch_id !="")
	jsonObj["branch"] = branch_id;
    if(billing_type!=undefined && billing_type!='')
       jsonObj['billing_type'] = billing_type
   if(bill_type!=undefined && bill_type!='')
   	  jsonObj['bill_type'] = bill_type
   	if(bill_to!=undefined && bill_to!='')
   	  jsonObj['bill_to'] = bill_to	
   	if(priority!=undefined)
   		jsonObj['priority'] = priority
	return jsonObj;
}

function get_timeband_list(){
	timeband_list = []
	for (key in timebands_map){
		tb = timebands_map[key]
		timeband_list.push(tb)
	}
	return timeband_list
}

function validate_date_range(tb_details){
	var todays_moment = moment()
	if(tb_details!=undefined){
		var spot_type = tb_details['type']
		if(tb_details[spot_type]!=undefined){
			var media_details = undefined
			media_details = tb_details[spot_type]
			if(media_details['date_ranges']!=undefined){
				var spot_st_dt = ''
				if(media_details['date_ranges']['from']!=undefined && 
					media_details['date_ranges']['to']!=undefined){
					var spt_st_moment = mmoment(media_details['date_ranges']['from'],"YYYY/MM/DD")
				    var spt_ed_moment = mmoment(media_details['date_ranges']['to'],"YYYY/MM/DD")
				    if(!(spt_st_moment.isSameOrAfter(order_start_date_moment) && 
				    	spt_st_moment.isSameOrBefore(order_end_date_moment) && 
				    	spt_ed_moment.isSameOrAfter(order_start_date_moment) && 
				    	spt_ed_moment.isSameOrBefore(order_end_date_moment))){
				    	if(spt_st_moment.isSameOrAfter(todays_moment,'day')){
				    	   media_details['date_ranges']['num_spots'] = 0  
				    	   tb_details[spot_type] = media_details
				        }
				    }

				}
			}
		}

	}
	return tb_details;
}

/*function sales_ex_agency_validation(){
	sales_ex = $("#sales_ex").val()
	agency_id = $("#agency_id").val()
	if(sales_ex!="0" && agency_id!="0"){
		jAlert("Please select sales ex or agency")
		return false
	}
	return true
}*/


function check_unsaved_data_exists(){

	 if($("#startTime").val()!="" && $("#endTime")!="" && $("#media").val()!=""){
	 	return false;
	 }else{
	 	return true;
	 }
}
function update_pre_sales(){
	 
	 	value = {}
	 	value['status'] = 'exported'
	 	if(pre_sales_id!=""){
	 		jQuery.ajax({
						type : "PATCH",
						dataType:"json",
					   data : JSON.stringify(value),	
					 	url : "pre_sales/"+pre_sales_id,
						success:function(data){
								//jQuery('#main').load("order/presales_list.html");
							 	//return false;
				   		},
				   		error: function(xhr, status, text) {
		                    var response = $.parseJSON(xhr.responseText);
		                    var err = response.errors;
		
		                    if (response) {
		                        jAlert(err.toString());
		                    }
		                }
					});
	 	   }
	
}

function get_tb_spots(tb_index){
	    var tb_spots_map = {}
        //var tb_index = get_selected_tb()

        tb_data = timebands_map[tb_index];
        if(tb_data!=undefined){
			tb_st = tb_data['start_time']
			tb_ed = tb_data['end_time']
			tb_class = tb_st+"_"+tb_ed
			tb_class = tb_class.replace(/:/g, "_")

			spot_type = tb_data['type']
			tb_clip_details = undefined;
			tb_clip_details =  tb_data[spot_type]

			tb_clip_id = '';
			tb_clip_id = tb_clip_details['clip_id']
			var tb_clip_key = "";
	        tb_clip_key = tb_class + '_'+tb_clip_id + '_'+tb_index ; 
	    for (each_month in order_months_map){
	    	var mnth_key_dic = order_months_map[each_month]
	        var mnth_st = mnth_key_dic['start']
	        var mnth_st_moment = moment(mnth_st,"YYYY/MM/DD")
	        var mnth_ed = mnth_key_dic['end']
	        var mnth_ed_moment = moment(mnth_ed,"YYYY/MM/DD")
	        //diff_dur = mnth_end_moment.diff(mnth_start_moment)
	        var diff_dur = moment.duration(mnth_ed_moment.diff(mnth_st_moment));
	        var total_days_in_month = diff_dur.asDays() + 1
	        var spots_lst = []
	        var temp = {} 
	        for(var p=0; p<total_days_in_month;p++){
	        	var dt = p+1
	        	var input_id = each_month+'_'+tb_index+'_'+dt

	        	var len =  $("#"+input_id).length;
	        	if(len==0){
	        		spots_lst.push(0);
	        	}else{
	        		if( !$("#"+input_id).hasClass("transparent") ){
	        			var val = $("#"+input_id).val();
	        			spots_lst.push(val);
	        		} else {

	        			var val = $("#"+input_id).val();
	        			if(val){
                           spots_lst.push(val);
	        			} else{
	        			spots_lst.push(0);

	        		}
	        		}
	        	}
	        }

	        var dt_rn = []
	            dt_rn = construct_date_range(spots_lst,total_days_in_month,
	        	mnth_ed_moment.year(),mnth_ed_moment.month()+1)
	             var month_tb_index = each_month + '_' + tb_index
	        	 if(dt_rn.length>0) {
		            if(month_tb_index in tb_spots_map){
		             temp = tb_spots_map[month_tb_index]
		             temp[tb_clip_key]= dt_rn
		             tb_spots_map[month_tb_index] = temp
		           }else{
		           	 temp[tb_clip_key]= dt_rn
		             tb_spots_map[month_tb_index] = temp
		           }
		       }
		       //console.log(each_month)
		      // console.log(JSON.stringify(tb_spots_map))
	    }
    }
    return tb_spots_map;
}


$("#placeOrder").on("click",function(){
	// alert("clicked");
	cust_id = $("#customer_id").val()
	start_end_dates = $(".start_end_dates").val()
	if(check_unsaved_data_exists()){
	if(cust_id!=undefined && cust_id!="" && cust_id!="0" && 
		start_end_dates!=undefined && start_end_dates!=""){
	    save_ro_details();
     }
   }else{
	   	//jConfirm('Unsaved data exists do you want to proceed', 'Release Order', function(response) {
	   	 //if(response){
	   	 	//save_ro_details();
	   	 //}
	   	//})
	   	jAlert("Unsaved data exists, please save or discard");
   }

})

function validate_mandatory_fields(){
	var ro_num = '',ro_date = '', branch = '';
	
	ro_num = $("#ro_number").val();
	ro_date = $("#ro_date").val();
	branch = $('#branch_id').val();
	sales_ex = $("#sales_ex").val();



	if(!ro_num){
        jAlert('Empty Ro number')
        return false;
	}
	if(!ro_date){
        jAlert('Empty Ro date')
        return false;
	}
	if(!branch){
		jAlert('Empty branch name')
		return false;
	}
	if(!sales_ex){
		jAlert('Please Select sales executive');
		return false;
	}
    sales_ex_name = '';

	sales_ex_name = sales_ex_name_id_map[sales_ex]

	if(sales_ex==undefined || sales_ex==''){
		jAlert('Please Select sales executive');
		return false;
	}
	return true;


}



function save_ro_details(){

	if(validate_mandatory_fields()){
		var order_data = {}
			order_data = commonDetails();

			if(order_data == undefined){
				console.log("Empty order details..");
				return;
			}
			console.log(order_data);

			if( $("#ro_add_bro_id").is(":visible") ){
				if( $("#ro_add_bro_id").val() != -1){
					order_data["iro_number"] = $("#ro_add_bro_id option:selected").text();
				}
			}
		
			set_tb_spots();
			order_data['timebands'] = get_timeband_list()
			
			order_data['channel_id'] = channel
			console.log(JSON.stringify(order_data))
			if(order_id==0){
				$("#placeOrder").attr("disabled", true);
				setTimeout(function(){
					$("#placeOrder").attr("disabled", false);
				}, 6000);
				$.ajax({
						type : "POST",
						url : "/orders",
						dataType:"json",
						data : JSON.stringify(order_data),
						success : function(data) {
							//console.log("sucess"+JSON.stringify(data));
							if(data.order!=undefined){
								var new_ro_num = ''
								new_ro_num = data.order['ro_id']
							    $.removeCookie("landing_page", null, {path: '/' });
								if(!from_presale_export){
									localStorage.setItem("roId", new_ro_num);
									jAlert("RO saved sucessfully  <b>"+new_ro_num+"</b>")
								   $('#main').load("order/ordersList.html");
							    }
							    else{
							       update_pre_sales();
							       jAlert("RO saved sucessfully  <b>"+new_ro_num+"</b>")
							       $('#main').load("order/presales_list.html");	

							     }
						    }
						},
						 error: function(xhr, status, text) {
			                comm_handleAjaxError(xhr);
						}			
					});
		  }else{
		  		$.ajax({
				type : "PUT",
				url : "/orders/url1/"+order_id,
				dataType:"json",
				data : JSON.stringify(order_data),
				success : function(data) {
					//console.log("sucess");	
					$.removeCookie("landing_page", null, {path: '/' });
					$('#main').load("order/ordersList.html");
				},
				 error: function(xhr, status, text) {
	                comm_handleAjaxError(xhr);
	            }				
			});
		  }
		}
}





var isAddOrder = false, isEditOrder = false, isViewOrder = false,
 isDeleteOrder = false, isSuspendOrder = false ,isSyncOrder = false,
 isSpotEditable = false;
 function order_loadPrivileges(){
 	check_user_privileges()
 }
/*function order_loadPrivileges(){
	var user_id = sessionStorage.getItem("user_id")
	if(user_type && user_id){
		$.ajax({
			url: "/users/"+user_id,
			type:"GET",
			dataType:"json",
			success: function(data) {
				if(data.user!=undefined){
					var privileges = data['user']['privileges']
					var modules = []
					var actions = {}
					if(privileges && privileges['actions']!=undefined) 
					actions	= privileges['actions']
				    var operations = []
				    if (actions['orders']!=undefined){
				    	operations = actions['orders']
						
						if(operations.indexOf("Add") != -1 ){
							isAddOrder = true;
						} 
						if(operations.indexOf("Edit") != -1 ){
							isEditOrder = true;
						} 
						if(operations.indexOf("View") != -1 ){
							isViewOrder = true;
						}
						if(operations.indexOf("Delete") != -1 ){
							isDeleteOrder = true;
						}
						if(operations.indexOf("Suspend") != -1 ){
							isSuspendOrder = true;
						}
						if(operations.indexOf("sync") != -1 ){
							isSyncOrder = true;
						}

					}
				}
			},
			error: function(error){

			}
		});
	}
}*/

order_loadPrivileges();

function ro_loadCustBroId(cust_id){
		var isBulkRO = $("#menu_bulk_ro").is(":visible");
		if( !isBulkRO){
			$(".bulk_ro_div").hide();
			return;
		}
  		$("#bulk_ro_id_add, #bulk_ro_id_edit").html("");
  		if(cust_id){
  			var url = 'bro?customer_id='+cust_id;
  			// $.ajax({
		   //      url : url,
		   //      type : "GET",
		   //      success: function(data) {

		   	var data = {'bro_id_list': ["2349131", "2321312", "31231231"]};
		   	if(data.bro_id_list.length){
		   		var optionStr = "<option value='-1'>Select</option>";
		   		for(var i=0; i<data.bro_id_list.length; i++){
		   			var item = data.bro_id_list[i];
		   			optionStr += "<option value='"+item+"'>"+item+"</option>";
		   		}
		   		$("#bulk_ro_id_add, #bulk_ro_id_edit").html(optionStr);
		   		$(".bro_info_wrapper").show();
		   	} else {
		   		$(".bro_info_wrapper").hide();
		   	}

		   //      },
		   //      error: function(error){
		   //       comm_handleAjaxError(error);
		   //      }
		   //  });
  		} else {
  			console.log("INVALID CUSTOMER ID.....");
  		}

  	}

  	var specialPrgmsMap = {};
  	function load_special_programs(){
		$.ajax({
			dataType: "json",
			url : "/special-programs?channel_id="+channel,		
			success: function( json) {
			
				options = "";
	            programs = [];
	            specialPrgmsMap = {};
	            if(json["special-programs"]!=undefined){
		            programs = json["special-programs"];
					 for (hash in json) {
					 	  var options = '<option value="0">---Choose One---</option>';
					        for (i = 0; i < json[hash].length; i++) {
					        	var item = json[hash][i];
					        	var date = moment(item.date, "YYYY/MM/DD").format("YYYYMMDD");
					        	var curDateTime = moment().format("YYYYMMDDHHmmss");
					        	// var curTime = moment().format("HHmmss");
								var time = moment(item.start_time, "HH:mm:ss").format("HHmmss");
								var dateTime = date+time;

								// console.log(dateTime+" :: "+curDateTime);
								
					        	if(item['break_type']!=0 && dateTime >= curDateTime ){
					        		title = '';
					        		program_type = '';
					        		if(item['program_type']!=undefined)
					        			program_type = item['program_type']
					        		start_time = item['start_time'] ;
					        		pg_name = item['program_name']
					        		
					        		title = pg_name +'-'+ start_time ;

					        		if(program_type!="" && program_type==1) 
					        			title = title + '-' + '(L)'
					        		if(program_type!="" && program_type==0) 
					        			title = title + '-' + '(R)'
					        	    
					        		options = options +"<option value='"+item['_id']+  "'>"+title+"</option>";
					        		
					        		specialPrgmsMap[json[hash][i]['_id']] = pg_name;
					        		programIdMap[json[hash][i]['_id']] = json[hash][i];
					        }
					       
					    }
					}
					$("#special_programs").html(options);
				}
			},
			error: function(xhr, status, text) {
	            comm_handleAjaxError(xhr);
	        }
		});
	}

  	$("#bulk_ro_id_add").on("change", function(){
  		var id = $("#bulk_ro_id_add").val();
  	});

  	$("#bulk_ro_id_edit").on("change", function(){
  		var id = $("#bulk_ro_id_edit").val();
  	});

  	$("#prgm_gen_from").on("change", function(){
  		var type = $(this).val();
  		if(type == "master"){
  			$("#special_programs").hide();
  			$("#master_programs").show();
  		} else {
  			$("#master_programs").hide();
  			$("#special_programs").show();
  		}
  	});
  	

  	function setProgramDropdown(obj){

  		if('program_wise' in obj){
        	if(obj['program_wise'] == true){
        		$("#schedule_type").val(1);
        		$(".prgm_type").show();
        		$("#master_program_div").show();
        		$(".time_input, #days_fieldset").hide();
        		if(obj['program_gen_from'] == "master"){
        			$("#prgm_gen_from").val("master");
        			$("#master_programs").val(obj.program_id);
        			$("#special_programs").hide();
  					$("#master_programs").show();
        		} else {
        			$("#prgm_gen_from").val("special");
        			$("#special_programs").val(obj.program_id);
        			$("#master_programs").hide();
  					$("#special_programs").show();
        		}
        	} else{
        		$("#schedule_type").val(0);
        		$(".prgm_type").hide();
        		$(".time_input, #days_fieldset").show();
        		$("#master_program_div").hide();
        		set_tb_days(obj);
        	}
        } else {
        	$("#schedule_type").val(0);
    		$(".prgm_type").hide();
    		$(".time_input, #days_fieldset").show();
    		$("#master_program_div").hide();
    		set_tb_days(obj);
        }
  	}

  	function set_tb_days(obj){
  		$("#all_days").attr("checked", false);
  		$("#days_fieldset input").attr("checked", false);

  		var days = [];
  		if("days" in obj){
  			days = obj.days;
  		}

  		for(var i=0; i<days.length; i++){
  			$("#days_fieldset input#d_"+days[i]).attr("checked", "checked");
  		}
  		if(days.length == 7){
			$("#all_days").attr("checked", "checked");
  		}
  	}

  	// ro_loadBulkROIds("58bed120efe1d31802e606d6");

  	var broIroIdMap = {};
  	function ro_loadBulkROIds(custId, iroNum){
  		$("#ro_add_bro_id").html("");
  		
  		if(custId && custId != undefined){
  			broIroIdMap = {};
	  		$.ajax({
				dataType: "json",
				url : "/bro_id/"+custId+"?channel_id="+channel,		
				success: function(data) {
					var idList = data.bulk_order_ids;
					var optionStr = '<option value="-1">Select</option>';
					for(var i=0; i<idList.length; i++){
						optionStr += '<option value="'+idList[i]._id+'">'+idList[i].iro_number+'</option>';
						broIroIdMap[idList[i].iro_number] = idList[i]._id;
					}
					$("#ro_add_bro_id").html(optionStr);

					if(iroNum){
						ro_getBulkRODetails(broIroIdMap[iroNum]);
					}
				},
				error: function(xhr, status, text) {
		            comm_handleAjaxError(xhr);
		        }
			});
		} else {
			console.log("Invalid customer ID");
		}
  	}

  	function ro_getBulkRODetails(bulkId){
  		// console.log("bulkId:: "+bulkId);
  		var st_ed_date = $(".start_end_dates").val();
		if(st_ed_date){
	  		var broId = $("#ro_add_bro_id").val();
	  		if(broId != -1 || bulkId != undefined){
	  			var id = broId;
	  			if(bulkId != undefined){
	  				id = bulkId;
	  			}

	  			$.ajax({
					dataType: "json",
					url : "/bulk_ro/"+id+"?channel_id="+channel,		
					success: function(data) {
						var data = data.bulk_order;
						
						var st_date = st_ed_date.split(" - ")[0];
  						var ed_date = st_ed_date.split(" - ")[1];
  						st_date = moment(st_date, "DD/MM/YYYY").format("YYYYMMDD");
  						ed_date = moment(ed_date, "DD/MM/YYYY").format("YYYYMMDD");

						var bro_st_date = data.start_date;
						var bro_ed_date = data.end_date;
						bro_st_date = moment(bro_st_date, "YYYY/MM/DD").format("YYYYMMDD");
  						bro_ed_date = moment(bro_ed_date, "YYYY/MM/DD").format("YYYYMMDD");

  						// console.log(st_date, ed_date, bro_st_date, bro_ed_date);
  						
						// if( (st_date <= bro_st_date && bro_st_date <= ed_date) && (st_date <= bro_ed_date && bro_ed_date <= ed_date) ){

							var programs = data.programs;
							if(programs.length){
								ro_initAutoRowBuild(programs, st_ed_date, bulkId);
							} else {
								console.log("Empty Bulk RO Programs");
							}
						// } else {
						// 	bro_st_date = moment(bro_st_date, "YYYY/MM/DD").format("DD/MM/YYYY");
  				// 			bro_ed_date = moment(bro_ed_date, "YYYY/MM/DD").format("DD/MM/YYYY");
						// 	jAlert("Date ranges not matches with Bulk RO date ranges: "+bro_st_date+" - "+bro_ed_date);
						// 	$("#ro_add_bro_id").val("-1");
						// 	return;
						// }

					},
					error: function(xhr, status, text) {
			            comm_handleAjaxError(xhr);
			        }
				});
	  		}
	  	} else{
	  		$("#ro_add_bro_id").val("-1");
	  		jAlert("Please select start and end dates to apply Bulk ro details");
	  		return;
	  	}
  	}

  	var broPrgmDaysMap = {};
  	function ro_initAutoRowBuild(programs, st_ed_date, bulkId){
  		var st_date = st_ed_date.split(" - ")[0];
  		var ed_date = st_ed_date.split(" - ")[1];
  		st_date = moment(st_date, "DD/MM/YYYY").format("YYYYMMDD");
  		ed_date = moment(ed_date, "DD/MM/YYYY").format("YYYYMMDD");

  		if(programs.length <= 0){
  			console.log("Empty programs from BULK RO");
  			return;
  		}

  		broPrgmDaysMap = {};
		timeband_counter = 0;
  		for(var i=0; i<programs.length; i++){
  			var item = programs[i];
  			
  			// console.log(item.program_id);
  			if(item.program_id != "any"){
	  			if(item.clip_id == undefined || item.clip_id == ""){ //Skipping Auto Scheduled Ad types.
		  			var prgm_st_date = item.start_date;
		  			var prgm_ed_date = item.end_date;
		  			prgm_st_date = moment(prgm_st_date, "YYYY/MM/DD").format("YYYYMMDD");
		  			prgm_ed_date = moment(prgm_ed_date, "YYYY/MM/DD").format("YYYYMMDD");

		  			// console.log(prgm_st_date +" > = "+ st_date +" && "+prgm_ed_date +" < ="+ ed_date)

		  			// if( ed_date <= prgm_ed_date){
		  				broPrgmDaysMap[item.program_id] = item.days;
		  				if(bulkId == undefined){ //if func call is from edit page.
							timeband_counter++;
			  				var mediaId = $("#media option:contains(CLIP_NOT_FOUND)").attr("value");
							$("#media").val(mediaId);


			  				var temp = {};
			  				var clipDetails = {};

			  				clipDetails = {
			  					"clip_id": mediaId,
			  					"caption": "CLIP_NOT_FOUND",
			  					"duration": "0"
			  				};

			  				var type = item.type;
			  				type = type.trim();

			  				temp = {
			  					"program_id": item.program_id,
			  					"program_gen_from": item.program_gen_from,
			  					"program_wise": true,
			  					"start_time": "00:00:00",
			  					"end_time": "24:00:00",
			  					"time_band": "00:00:00_24:00:00",
			  					"package_detail": "per_10_sec",
			  					"spot_type": "paid",
			  					"type": type,
			  					"bulk_ro": true,
			  				};
			  				temp[type] = clipDetails;

			  				update_timeband_list(temp, timeband_counter, "bulk_ro");
			  			} else {
			  				for(var p=0;p<tbList.length;p++){
							 	timeband_counter++
							 	timebands_map[timeband_counter] = tbList[p]
							 	
							 	update_timeband_list(tbList[p],timeband_counter, "bulk_ro")
							 	set_existing_spots(tbList[p],timeband_counter)
							 	for(var ech_mnt in order_months_map){
							 	   update_total_spots(ech_mnt,timeband_counter)
							 	}
						 	}
							 var active_mnth =  $('.months_tab').find('.active').prop('id');
							 //console.log("active month::::::::"+active_mnth)
							 total_spots_count(active_mnth);
							 calculateAllColumnCount();
			  			}

		  			// }
		  		} else {
		  			console.log("advertisement type has auto_gen_id");
		  		}
		  	} else {
		  		console.log("ANY program type from BULK RO");
		  	}
  		}

  		if(bulkId == undefined){
	  		setTimeout(function(){
				set_spots_default_val();
			}, 300);
		}
  	}

  	function set_spots_default_val(){
  		$(".spots_view td input.each_spot").each(function() {
  			if( !$(this).hasClass("transparent") ){
  				$(this).val(1);
  				// $(this).trigger("change");
  			}

  			// $(this).closest("td").css({"background": "#ddd"});
  		});

  	}

  	function getBroPrgmDays(prgmId){
  		var daysArr = [];
  		if( !$.isEmptyObject(broPrgmDaysMap) ){
  			var days = broPrgmDaysMap[prgmId];
  			if(days != undefined){
  				if(days.length){
  					daysArr = days;
  				}
  			}
  		}
  		return daysArr;
  	}

  	function checkIsSpotEditable(tb_details, curDay, curr_dt_moment, prgmFrom, fromType){
  		var isEditable = true;
  		// console.log( prgmFrom, fromType)

  		if(fromType != "bulk_ro"){
      		if(prgmFrom && "program_id" in tb_details){
      			isEditable = getDaysFromProgram(tb_details, curDay, curr_dt_moment, prgmFrom, fromType);
      		} else {
      			//if row is of type timeband, and if days selected for program.
      			var selDays = [];
      			if("days" in tb_details){
      				selDays = tb_details.days;
      			}
                  
               

                var todays_date = moment() 

                // console.log("selDays::::"+selDays)
                if(selDays.length==0)
                	selDays = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"]
      			if(selDays.length){
      				if(selDays.indexOf(curDay) == -1){ //if curday not in day.
    					isEditable = false;
    				} 
    				else if(order_id !=0 && isSpotEditable){
    					isEditable = true;
    				}

    				else if(order_id !=0 && curr_dt_moment.isBefore(todays_date,'day')){
    					isEditable = false;
    				}
    				else{
    					isEditable = true;
    				}
      			} else {
      				isEditable = true;
      			}
      		}

      	} else { //If program added from bulk_ro, get days from bulkro program.
      		if("program_id" in tb_details){
      			if(prgmFrom == "master"){
	      			var days = getBroPrgmDays(tb_details.program_id);
	      			if(days.length){
	      				
	      				if(days.indexOf(curDay) == -1){ //if curday not in day.
	    					isEditable = false;
	    				} else {
	    					isEditable = true;
	    				}
	      			} else {
	      				//taking days from program, if days not selected in bulk ro for program.
	      				isEditable = getDaysFromProgram(tb_details, curDay, curr_dt_moment, prgmFrom, fromType);
	  				}
	  			} else if(prgmFrom == "special"){
					var date = programIdMap[tb_details.program_id].date;
					date = moment(date, "YYYY/MM/DD").format("YYYYMMDD");
					var curDate = curr_dt_moment.format("YYYYMMDD");

					if(curDate == date){
						isEditable = true;
					} else {
						isEditable = false;
					}

				} else {
					isEditable = true;
				}
      		} else {
      			isEditable = true;
      		}
      	}

      	return isEditable;
  	}

  	function getDaysFromProgram(tb_details, curDay, curr_dt_moment, prgmFrom, fromType){
  		var isEdit = true;
  		if(prgmFrom == "master"){
			var daysArr = programIdMap[tb_details.program_id].days;

			if(daysArr.length){
				
				if(daysArr.indexOf(curDay) == -1){ //if curday not in day.
				isEdit = false;
			} else {
				isEdit = true;
			}
			} else {
				isEdit = false;
			}
		} else if(prgmFrom == "special"){
			var date = programIdMap[tb_details.program_id].date;
			date = moment(date, "YYYY/MM/DD").format("YYYYMMDD");
			var curDate = curr_dt_moment.format("YYYYMMDD");

			if(curDate == date){
				isEdit = true;
			} else {
				isEdit = false;
			}

		} else {
			isEdit = true;
		}

		return isEdit;
  	}

  	var broIdMap = {};
  	function ro_getBulkRO(){
  		$.ajax({
			url:'bulk_ro?channel_id='+$("#channel").val(),
			method: 'GET',
			success:function(data){
				if('bulk_orders' in data){
					var broData = data.bulk_orders;
					for(var i=0; i<broData.length; i++){
						var item = broData[i];
						broIdMap[item.iro_number] = item;
					}
				}
			},
			error: function(error){
				comm_handleAjaxError(error);
			}
		});
  	}
  	ro_getBulkRO();

function load_order_details(order_details){
		if(order_details!=undefined){
			order_months_map = {}
			timeband_counter = 0
			timebands_map = {}
			var obj = order_details;
			$("#orderId").val(obj._id);
			order_id = obj._id
			//$(".spots_view").empty();

			$("#stDate").val(formatDate(obj.start_date));
			$("#edDate").val(formatDate(obj.end_date));
			if(obj.ro_date!=undefined){
				var ro_dt = moment(obj.ro_date,"YYYY/MM/DD").
				              format("DD/MM/YYYY")
			   $("#ro_date").val(ro_dt);
		    }
		    if(obj.ro_num!=undefined){
				var ro_num = obj.ro_num 
			   $("#ro_number").val(ro_num);
		    }
		    if(obj.remarks!=undefined){
				var remarks = obj.remarks 
			   $("#ro_remarks").val(remarks);
		    }
		    if(obj.advance_payment != undefined){
		    	var advance_payment = obj.advance_payment;
		    	$('#advance_payment').prop("checked", true);
		    }else{
		    	$('#advance_payment').prop("checked", false);
		    }

		    console.log("IRO_NUMBER......"+obj.iro_number);
		    var isBulkRO = $("#menu_bulk_ro").is(":visible");
			if( isBulkRO){
			    if(obj.iro_number != undefined){
			    	$(".ro_edit_bro_id").show();
			    	$("#ro_edit_bro_id").val(obj.iro_number);
			    } else {
			    	$(".ro_edit_bro_id").hide();
			    }
			}
			st_ed = formatDate(obj.start_date) + " - " +formatDate(obj.end_date);
			$(".start_end_dates").val(st_ed);
			//to update customer field label
			for(var i=0; i<custOptionsArr.length; i++){
				var item = custOptionsArr[i];
				if(obj.customer == item.value){
					$("#customer_filter").val(item.label);
					ro_loadBulkROIds(item.value, obj.iro_number);
				}
			}
			$("#customer_id").val(obj.customer);
		    //alert("set cust")
			if(obj.agency_id!=undefined && obj.agency_id!=null){
				//to update agency field label
				for(var i=0; i<agencyOptionsArr.length; i++){
					var item = agencyOptionsArr[i];
					if(obj.agency_id == item.value){
						$("#agency_filter").val(item.label);
					}
				}
				$("#agency_id").val(obj.agency_id);

				// var isChecked = $("#advance_payment").is(":checked");

				// if(isChecked){
				// 	$("#receipt_number_div").show();
				// } else {
				// 	$("#receipt_number_div").hide();
				// }
				// if(obj.sales_ex_name!=undefined){
				//  	$("#sales_ex").val(obj.sales_ex_name)
				// }
			} 
			var isChecked = $("#advance_payment").is(":checked");

			if(isChecked){
				$("#receipt_number_div").show();
			} else {
				$("#receipt_number_div").hide();
			}
            

           	console.log("sales ex"+obj.sales_ex_name)

				if(obj.sales_ex_name!=undefined){
				 	$("#sales_ex").val(obj.sales_ex_name)
				}else{
					console.log("No sales ex::::::::::::")
				}

			if(obj["receipt_no"] != undefined){
				$("#receipt_number").val(obj["receipt_no"]);
			}
				

			if(obj.branch_id!=undefined){
				for(var i=0; i<branchOptionsArr.length; i++){
					var item = branchOptionsArr[i];
					if(obj.branch_id == item.value){
						$("#branch_filter").val(item.label);
					}
				}
				$("#branch_id").val(obj.branch_id)	
			}
			if(obj.billing_type!=undefined && obj.billing_type!='')
				$("#billing_type").val(obj.billing_type)

			if(obj.bill_to!=undefined && obj.bill_to!='')
				$("#bill_to").val(obj.bill_to)

			if(obj.bill_type!=undefined && obj.bill_type!='')
				$("#bill_type").val(obj.bill_type)

			if(obj.priority!=undefined)
				$("#priority_id").val(obj.priority)

            //If priority is Any (means 5) reset priority to medium (value 3)

			if(obj.priority!=undefined && obj.priority=="5")
				$("#priority_id").val("3")

			load_medias(obj.customer);
			 months_cal_init();
			 init_month_tabs();
			 ro_loadCustBroId(obj.customer);
			 load_scanned_ros(obj.customer)
			 
			 tbList = [];
			 tbList = obj.timebands;
			 console.log("SIZE:::"+tbList.length)

			 timebands_map = {};
			 // $(".spots_view .month_div").html("");

			 if(obj.iro_number == undefined){
				 for(p=0;p<tbList.length;p++){
				 	timeband_counter++
				 	timebands_map[timeband_counter] = tbList[p]
				 	
				 	update_timeband_list(tbList[p],timeband_counter)
				 	set_existing_spots(tbList[p],timeband_counter)
				 	for(ech_mnt in order_months_map){
				 		
				 	   update_total_spots(ech_mnt,timeband_counter)
				 	}
				 }
				 var active_mnth =  $('.months_tab').find('.active').prop('id');
				 //console.log("active month::::::::"+active_mnth)
				 total_spots_count(active_mnth);
				 calculateAllColumnCount();
			 }
			} 
	}





function get_tb_col_count_row(month_start,month_end,display_month){

	var month_st_moment = moment(month_start,"YYYY/MM/DD")	
	var month_ed_moment = moment(month_end,"YYYY/MM/DD")
    var month_cont = MONTH_CONSTANTS[month_st_moment.month()]
	var month_div_id = month_cont + '_' + 'view'
	var month_tab_id = month_cont + '_' +'tab'
	
    var curr_dt_moment = month_st_moment;
    //to append last colun_count row;
    var columnStr = "<tr class='"+month_cont+"_row'> <td colspan='4' style='text-align:right'><span style='margin-right:20px;'>Day Spots Count </span></td>";

    // var isOrderView = $(".ro_table_view_container").is(":visible");
    while(month_ed_moment.isSameOrAfter(curr_dt_moment)){
    	 var curDay = curr_dt_moment.format("dddd");
    	 var column_id = month_cont +'_' +curr_dt_moment.date();
        //to append last colun_count row;
        columnStr += "<td class='"+curDay+" day_total_spots'><input id='"+column_id+"' class='transparent' style='width:25px;margin:0;padding:0;color:#777;' readonly='readonly' type='number'  /></td>";

        curr_dt_moment.add(1,"days");
    }
	//to append last colun_count row;
	columnStr += "<td colspan='3' style='text-align:left' title='Total Spots'>TS: <span style='margin-left:10px' id='"+month_cont+"_col_ts'></td> </tr>";

	return columnStr;

   setTimeout(function(){
   		initClickOnTBInfo();
   	}, 1000);
    
}


function calculateAllColumnCount(){
	// console.log("calculateAllColumnCount..............");
	$.each(order_months_map, function(month, month_val) {
		// console.log(month);

		var o_st = month_val['start'];
		var o_st_momemt = moment(o_st,"YYYY/MM/DD")
		var month_st_moment = moment(o_st_momemt,"YYYY/MM/DD");
		var month_cont = MONTH_CONSTANTS[month_st_moment.month()]
		var month_end = order_months_map[month_cont].end;
		var month_ed_moment = moment(month_end,"YYYY/MM/DD");
		
	    var curr_dt_moment = month_st_moment;
	    // var isOrderView = $(".ro_table_view_container").is(":visible");
	    while(month_ed_moment.isSameOrAfter(curr_dt_moment)){
	        update_total_column_count(month_cont, curr_dt_moment.date());
	        curr_dt_moment.add(1,"days");
	    }

	});
}

