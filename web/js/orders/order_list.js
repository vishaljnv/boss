
var ro_customer_name_id_map = {};
var branchOptionsArr = [], branchMap = {};
var salesMap = {}, sales_ex_name_list = [], sales_ex_name_id_map = {};
var agencyOptionsArr = [], agencyMap = {}, agency_name_list = [], ro_agency_name_id_map = {}

var channel = $("#channel").val();
var colsObj = {1: true, 2: true, 3: true, 4: true, 5: true, 6: true, 7: true, 8: true,9:true};
if(localStorage.getItem("cols")){
	colsObj = JSON.parse(localStorage.getItem("cols"));
} else {
	localStorage.setItem("cols", JSON.stringify(colsObj) )
}

var ro_id_list = [];
comm_loadInvoiceMaster(); //to load invoiceMaster details, which is used in invoice view page.

var oTable = $('#order_item_list').dataTable({
	   
		"fnRowCallback": function( nRow, aData, iDisplayIndex, iDisplayIndexFull ) {
			var dt = new Date();
			today = moment()
			end_moment = moment(aData[6],"DD/MM/YYYY")
			
			if(today.isSame(end_moment,'day')){
				$(nRow).css('color', '#FF9900');
			}

			else if(end_moment.isBefore(today,'day')){
				
			}else if(aData[11]=='deleted' || aData[11]=='deactive'){
                $(nRow).css('color', 'red');
			}

			var newRoId = localStorage.getItem("roId");
			if(newRoId && newRoId == aData[1] ){
				$(nRow).addClass("latest_row");
					localStorage.setItem("roId", "");
			}

			// $("#order_item_list tbody tr:eq(0)").addClass("latest_row");

		 },
		"bInfo":false,
		"autoWidth":false,
		"columns": [
              	{ "width": "15%", "visible": true },
              	{ "width": "15%", "visible": colsObj[1]  },
              	{ "width": "12%", "visible": colsObj[2] },
              	{ "width": "12%", "visible": colsObj[3] },
              	{ "width": "10%", "visible": colsObj[4] },
              	{ "width": "10%", "visible": colsObj[5] },
              	{ "width": "10%", "visible": colsObj[6] },
              	{ "width": "10%", "visible": colsObj[7]},
    	        { "width": "20%", "className": "clips", "visible": colsObj[8]},
    	    	{ "width": "20%", "visible": colsObj[9]},
    	    	{"width":"10%","visible":true},
    	    	{ "width": "10%", "visible": true },

    	    	{ "width": "5%",  "className": "hideStatus" }
		 ],
		'fixedHeader': true,
		
		"paging": false,
		"bSort":false,
      	"pagingType": 'full_numbers',
      	"bFilter": false,
      	dom: 'Bfrtip',
        buttons: [
        	{
            	extend: 'colvis',
            	columns: '1, 2, 3, 4, 5, 6, 7, 8, 9',
            }
        ],
	});


$('#order_item_list').on('column-visibility.dt', function(e, settings, column, state ){
    // console.log('Column:', column, "State:", state);    
	colsObj[column] = state;
	localStorage.setItem("cols", JSON.stringify(colsObj) );
});

$("#order_item_list tbody tr").on("mouseover", function(event){
	var companyName = $(this).attr("id");
	$("#order_item_list tbody tr td.companyName").attr("title",companyName);
	
});

function loadContent(){
	var selected  =  "";
	if($("#search_status").val()!=undefined){
		selected = $("#search_status").val();
	}

	if (selected!= null){
		url = '/orders?status='+selected+"&channel_id="+channel;
		if (user_type == "Client"){
			url = url+"&customer="+client_id;
		}
		load_orders(url);
	}	
}

$(function() {
	jQuery('#filterResultFieldSet').coolfieldset({collapsed:true});
});

jQuery("#startDateTo").datepicker({
	dateFormat : 'yy/mm/dd'
});

jQuery('#orderAdd').click(function(event){   
	event.preventDefault();
	$.removeCookie('pre_sale_id', null, { path: '/' });
	jQuery('#main').load("order/spotsAdd.html");
});

jQuery('#order_item_list').on("mouseover","tr",function(event){
		if( !$(this).hasClass("latest_row") && !$(this).hasClass("suspended") ){
	  		$(this).css({background:"#C8D9E8"});	  	
	  	}
   });

jQuery('#order_item_list').on("mouseout","tr",function(event){
		if( !$(this).hasClass("latest_row") && !$(this).hasClass("suspended")){
	  		$(this).css({background:"#ffffff"}); 
	  	}
});

 function load_orders(url, type, pNum){
   	oTable.fnClearTable(); 

   	$.cookie("orders_path", url);

   	 $.ajax({
		   dataType: 'JSON',
		   url: url,
		   success: function(data) {
		   	if( !isAddOrder){
		 		$("#orderAdd").hide();
		 	}
		   	if(!data.OrdersList.length){
				console.log("Empty Order data in Filter");
				$('#paginationTab').empty();
				return;
			}

              json = data.OrdersList;
             
              totalPages = data.totalPageCount;
          
	          var total_ln = json.length
			  var total_orders = data.orderscount		  	
				  
		      for (var k= 0; k< json.length; k++) {
		      	var customerName = "",ro_num = "",ro_id = "",priority = "", booking_date = "", agency = "", ro_date = "";
		      	var item = json[k];
		        	   id = item['_id'];
		        	   cust = item['customer'];
		        	  // salesman = json[hash][i]['salesman'];
		        	   startDate = item['start_date'];
		        	   endDate = item['end_date'];
		        	   end_dt_moment = moment(endDate,"YYYY/MM/DD")
		        	   priorityValue = item['priority'];
		        	   
		        	   if(priorityValue==1){
		        		   priority = "Highest";
		        	   }else if(priorityValue==2){
		        		   priority = "High";
		        	   }else if(priorityValue==3){
		        		   priority = "Medium";
		        	   }
		        	   else if(priorityValue==4){
		        		   priority = "Low";
		        	   }else if(priorityValue==5){
		        		   priority = "Any";
		        	   }
		        		        	   
		        	  if(item['customer_name']!=null) 
		        	  	  customerName =  item['customer_name']

		        	  else if (item['customer_name']!=undefined ){
                           customerName =  "PROMO"
		        	  }	
		        	  else
		        		  customerName =  "Customer deleted";
		        	   
		        	   if(item['ro_id']!=null) 
		        	   {
		        	  	 ro_id  =  item['ro_id']
		        	   }

		        	   if(item['ro_num']!=null) 
		        	   {
		        	  	 ro_num  =  item['ro_num']
		        	   }
                        if(item['booking_date']!=null) 
		        	   {
		        	   	 
		        	  	 booking_date  =  item['booking_date']
		        	  	 booking_date = moment(booking_date, "YYYY/MM/DD").format("DD/MM/YYYY")
		        	   }

		        	   if(item["agency_id"] != undefined && item["agency_id"] != null && item["agency_id"] != ""){
		        	   		if(!$.isEmptyObject(agencyMap)){
		        	   			if( agencyMap[ item["agency_id"] ] ){
		        	   				agency = agencyMap[ item["agency_id"] ] ;
		        	   			}
		        	   		}
		        	   }

		        	   var ro_date = ''

		        	   if(item['ro_date'] != undefined && item["ro_date"] != null && item["ro_date"] != ""){
		        	   		ro_date = item['ro_date'];
		        	        ro_date = moment(ro_date,"YYYY/MM/DD").format("DD/MM/YYYY")
		        	   }

		        	  
		     
		               
		        	   clips = "";
		        	   spanClips = "";
		        	   var clips_array = []
		        	   
		        	   if(item['timebands']!=null){
			        	   tb = [];
			        	   tb = item['timebands'];
			        	   
			        	   comList = [];
			        	   for(j=0;j<tb.length;j++){
		        	           advtType = tb[j]['type'];
			        		   clip_map = {};
			        	      
				        	    if (tb[j][advtType]!=undefined){
				        		    clip_map = tb[j][advtType]
				        		    var clp_id = clip_map.clip_id
				        		    if($.inArray(clp_id,clips_array)<0){
				        		       clips_array.push(clip_map.clip_id)
				        		       clips += '<span class="ro_clip_name_preview" value="'+clip_map.clip_id+'" title="'+clip_map.caption+'">'+ clip_map['caption'] + "</span>,";
				        			}
				        		}
				        		}
			        	   }
			        	  
			        	   clips = clips.replace(/'/g, '\'');
			        	   
			        	   if(clips!="")
			        	   clips = clips.substring(0,clips.length-1);
			        	
			        	   spanClips = '<span>'+comList+'</span>';
		        	   
		        	   if(item['status']=="deleted" || 
		        	   	   item['status']=="deactive")			
       	   					actionMessg = "--"; 


       	   			    else if(item['status']=="suspended")				
       	   			   	    actionMessg = "<a  data-action='resume' id='d_"+id+"' class='suspended' style='cursor:pointer;'>"+   	        
       	   							"<i class='fa fa-reply' style= 'color:#666;width:5px;margin-right:10px;':title='Resume Order'></i>"+
       	   							"</a >";			        	                                                                      
		        	   else if(item['status']=="active"){

		        	   	todays_date = moment()

		        	    if (item["status"] != "deactive" || "deleted"){

                         if (user_type != "Client"){

                         	actionMessg = "";
                         	if(isEditOrder ){
       	   			  			 actionMessg = "<a data-action='edit' id='e_"+id+"' style='cursor:pointer;font-size:14px;'>"
       	   							+"<i class='fa fa-edit' title='Edit Order' style='margin-right:10px;'></i></a>";
       	   							

       	   					}

       	   					if(isDeleteOrder){
       	   						actionMessg += "<a  data-action='del' id='d_"+id+"' style='cursor:pointer;font-size:14px;'>"
       	   							+"<i class='fa fa-trash text-danger' title='Delete Order' style='margin-right:10px;'></i></a>";
       	   					}

       	   					if(isDeleteOrder){
	       	   					actionMessg += "<a  data-action='suspend' id='d_"+id+"' style='cursor:pointer;font-size:14px;'>"
	       	   							+"<i class='fa fa-ban text-warning' style='margin-right:10px;' title='Suspend Order'></i>"
	       	   							+"</a >";
	       	   				}

       	   			  
       	   			   }


       	   			   else if (todays_date.isSameOrAfter(end_dt_moment,"day") &&
       	   			             user_type != "Client" && isDeleteOrder){
       	   			   	actionMessg = "<a  data-action='del' id='d_"+id+"' style='cursor:pointer;'>"
       	   							+"<img src='images/icons/trash.png' style='margin-right:8%' title='Delete Order'></a>";
       	   			   }
       	   			   else {
       	   			   	actionMessg = "--";
       	   			   }

                       }     
       	   				}

       	   			  var isView = "";
       	   			  if(isViewOrder){ 
       	   			  	isView = "data-action='view'"
       	   			  }
       	   			   var invStr = "";
			            if(item.invoice_num_list != null){
			            	var invoiceNums = item.invoice_num_list;
			            	for(var j=0; j<invoiceNums.length; j++){
			            		var inv_num = invoiceNums[j];
			            		invStr += "<a  data-action='view_invoice' id='ro_"+inv_num+"' title='View Invoice' class='view_invoice' style='cursor:pointer;'>"+inv_num+"</a> &nbsp;&nbsp;"
							}

			            }




                     if(isSyncOrder){
       	   			 actionMessg += "<a data-action='sync' id='ROSync_"+ro_id+"'><button type='button' class='btn btn-xs btn-default ROSync' style='cursor: pointer;margin-top:10px;padding:0 0;' title='Sync RO'> SYNC RO</button></a>";
       	   			}

       	   			 if(item.ro_scan){
       	   			 	 actionMessg+= "<a  data-action='ro_scan' id='scan_"+item.ro_scan+"' style='cursor:pointer;font-size:14px;'>"
       	   							+"<i class='fa fa-eye' title='View Ro Scan' style='margin-right:10px;'></i></a>";
			            
			         }  

			         var billing_status = ""
			         if(item.send_ro_to_billing_status)
			         	billing_status = item.send_ro_to_billing_status

       	   			  view =  "<a "+isView+" id='e_"+item['_id']+"' title='View Order' class='"+item["status"]+"' style='cursor:pointer;'>"+customerName+"</a>";
       	   			   
		              var rowIndex =  oTable.fnAddData([view,agency,ro_id,ro_num, ro_date, formatDate(startDate),formatDate(endDate), booking_date, clips, invStr, billing_status,actionMessg, item['status']]);
                      var row = $('#order_item_list').dataTable().fnGetNodes(rowIndex);
                      $(row).attr( 'id', 'ro_'+item['ro_id'] );  
		                  
		            }
		            
		            var curPage = data.currentPage;
					if( totalPages <= 1){
						$('#paginationTab').empty();
					} else if(pNum == undefined || pNum == 1){
					    $("#paginationTab").pagination({
					    	items: total_orders,
					    	itemsOnPage: total_ln,
					        pages : totalPages,
					        cssStyle: 'light-theme',
					        currentPage: curPage,
					        onPageClick: function(pageNumber, event){
			        			load_orders(url+"&page="+pageNumber, type, pageNumber);          
			    		 	}
					    });
					}

					$(".ro_clip_name_preview").unbind('click');
					$(".ro_clip_name_preview").click(function(){
						var id = $(this).attr('value');
						var title = $(this).attr('title');
						showClipPreview(id, title, '#ro-playVideo');
					});
			if(type != "search"){
		     	loadSearchSelectBox();
		    }

		    setTimeout(function(){
		    	$("a.suspended").closest("tr").css({"background-color": "#F7F7F7", "color": "#888"});
		    	$("a.suspended").css({"color": "#888"});
		    	$("a.suspended").closest("tr").addClass("suspended");
		    }, 200);
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
                                       if(type != "search"){
                                       	loadSearchSelectBox();
                                       }
                                   }
                                   
	});
   }

    function loadSearchSelectBox(){

   		if(!$.isEmptyObject(agencyMap)){
   			var agencyStr = "<option value='-1'>Select</option>";
   			for(var key in agencyMap){
   				agencyStr += "<option value='"+key+"'>"+agencyMap[key]+"</option>";
   			}
   			//$("#search_agency").html(agencyStr);
   		}

   		if(!$.isEmptyObject(custMap)){
   			var custStr = "<option value='-1'>Select</option>";
   			for(var key in custMap){
   				custStr += "<option value='"+key+"'>"+custMap[key]+"</option>";
   			}
   			//$("#search_cust").html(custStr);
   		}

   		if(!$.isEmptyObject(salesMap)){
   			var salesStr = "<option value='-1'>Select</option>";
   			for(var key in salesMap){
   				salesStr += "<option value='"+key+"'>"+salesMap[key]+"</option>";
   			}
   			//$("#search_sales").html(salesStr);
   		}
   }

    	$("#close_advance_search").click(function(){
   		$("#advance_search_wrapper").slideUp('fast');
   	});

   	$("#ro_search_reset").click(function(){
   		//$(".search_select").val("-1");
   		//$("#search_ro_id").html("<option value='0'>Select</option>");
   		//$(".search_input").val("");
   		$("#search_status").val("any");
   		$("#search_cust").val("");
   		$("#search_agency").val("");
        $("#search_sales").val("");
        $("#search_ro_id").val("");
   	});

    function loadSearchRoid(){
		var custId = $('#search_cust').val();
		if(custId == -1){
			console.log("Invalid customer ID");
			return;
		}

		$("#search_ro_id").html("<option value='0'>Select</option>");
		if(custId){
			$.ajax({
	        	global:true,
	        	dataType:'JSON',
	        	url:'customers/'+custId,
	        	success:function(data){
	        		/*var roIds = data.customer.ro_id_list;
	        		var roIdStr = "<option value='0'>Choose one</option>";
	        		console.log(roIds);
	        		if(roIds != undefined){
		        		if(roIds.length){
		        			for(var i=0; i<roIds.length; i++){
		        				if(roIds[i]){
		        					roIdStr += "<option value='"+roIds[i]+"'>"+roIds[i]+"</option>";
		        				}
		        			}
		        		}
		        	}
	        		$("#search_ro_id").html(roIdStr);*/
	        	},
	        	error: function(error){
	        		comm_handleAjaxError(error);
	        	}
	        });
		}
	}

	$("#search_cust").change(function(event){
		//var c = $('#search_cust').val()
    	//loadSearchRoid();
	});
    
   	$("#ro_search_btn").click(function(){
   		var cust = "", agency = "", sales = "", roId = "", status = "";
   		var url = "orders?channel_id="+$("#channel").val()+"&";

        console.log("customer==========="+ $("#search_cust").val()) 
        console.log(JSON.stringify(ro_customer_name_id_map))
   		if( $("#search_cust").val() != -1 ){
   			var cust_name = $("#search_cust").val();
   			cust_name_to_lower =  cust_name.toLowerCase()
   			console.log('lower case cust:::'+cust_name_to_lower)
            var cust_id = ro_customer_name_id_map[cust_name_to_lower] 
            if(cust_id!=undefined)
   			url += "customer_id="+cust_id+"&";
   		}
   		if( $("#search_agency").val()  != -1 ){
   			var agency_name = $("#search_agency").val();
   			var agency_id = ro_agency_name_id_map[agency_name]
   			if(agency_id!=undefined)
   			url += "agency_id="+agency_id+"&";
   		}
   		if( $("#search_sales").val() != -1 ){
   			var sales = $("#search_sales").val();
   			var sales_ex_id = sales_ex_name_id_map[sales]
   			if(sales_ex_id!=undefined)
   			url += "sales_ex="+sales_ex_id+"&";
   		}
   		if( $("#search_ro_id").val() != -1 && $("#search_ro_id").val() != 0 ){
   			roId = $("#search_ro_id").val();
   			url += "ro_id="+roId+"&";
   		}
   		if( $("#search_status").val() != -1 ){
   			status = $("#search_status").val();
   			url += "status="+status+"&";
   		}

   		console.log("url........ "+url);
   		load_orders(url, "search");

   	});

   	$('#ro-playVideo').dialog({
		width:650,
		height:450,
		modal:true,
		title:"video Details",
		autoOpen:false,
		close:function() {
			$("video")[0].pause();
		}
	});
load_agencies();
$(document).ready(function() { 
    //check_user_privileges()
	loadCustomers();
   	load_branches();
   	load_sales_executives();
   	load_ro_ids();
   	init_auto_suggest();

   	$('#sync_all_ro').click(function(){
	    var url = "/sync_ros";
	 	jQuery.ajax({
	 		type: "GET",
	 		url: url,
	 		success: function(data){
	 			if( data.response){
	 			var response = data.response
	 			if (response == "Not allowed"){
	 				jAlert("Operation not permitted")
	 			}
	 		    }else{
	 			   jAlert("Sync Successfull");
	 		    }
	 		},
	 		error: function(xhr, status, text){
	 			   comm_handleAjaxError(xhr);
	 		}
	 	});
	});

   	// $("#order_item_list_wrapper, #accordion, .footer").click(function(){
   	// 	$("#advance_search_wrapper").hide();
   	// });

   	// var h = $("#advance_search_label").position().top + 30;
   	// $("#advance_search_wrapper").css({"top": h+"px"});

   	// $("#advance_search_label").click(function(){
   	// 	$("#advance_search_wrapper").slideToggle('fast');
   	// });

   	 var url = '/orders?status='+"any"+"&page=1&channel_id="+channel;
   
    if(sessionStorage.getItem("user_id")!=undefined && sessionStorage.getItem("user_id")!=null){
		user_id = sessionStorage.getItem("user_id");
	}
	if(sessionStorage.getItem("client_id")!=undefined && sessionStorage.getItem("client_id")!=null){
		client_id = sessionStorage.getItem("client_id");
	}
      if (user_type != "Client")
	{
		$("#orderAdd").show()

	}
	else{
		$("#orderAdd").hide()
	}   
	if(user_type == "Client" && client_id != undefined){
        url = url +"&customer="+client_id;
    }
    if(user_type == "Sales" && user_id != undefined){
        url = url +"&sales_ex="+user_id;
    }
 
    var exp_orders = ''
    if($.cookie('expiring_orders')!=null){
    	exp_orders = $.cookie('expiring_orders')
    }
    $("#orderAdd").show();
    $("#order_status_filter_div").show()
    if(exp_orders!=undefined && exp_orders!='' && exp_orders=='expiring_orders'){
       url =  url + '&expiring=1'
        $("#orderAdd").hide();
        $("#order_status_filter_div").hide()
    }
   
   	if( $.cookie("orders_path") != undefined && $.cookie("orders_path") != "") {
   		url = $.cookie("orders_path");
   		setTimeout(function(){
   			loadSearchSelectBox();
   			ro_setSearchFields(url);
   		}, 2000);
   	}
	load_orders(url);

	jQuery('#filterResult').click(function(event) {
		
		oTable.fnClearTable();
		var start_date= jQuery('#startDateFrom').val();
		var end_date = jQuery('#startDateTo').val();
		channel = $("#channel").val();


	    if(checkDates(start_date,end_date)){
	    	//console.log("checkDates");
	    	current_tab = "active";
	    	$(".submenu").children('li').each(function () {
	    		flag = $(this).hasClass('current')
	    		if(flag)
	    		   current_tab = $(this).prop('id');
	    	})
	    	url = '/orders?status='+current_tab+"&start_date="+start_date+"&end_date="+end_date+"&channel_id="+channel;
	    	load_orders(url);
		}

    });

    function sync_individual_ro(order_id){
    	console.log("ro iddddddd"+order_id)
    	 var url = "/sync_ro/"+order_id;
	 	jQuery.ajax({
	 		type: "GET",
	 		url: url,
	 		success: function(data){
	 			if(data.response){
	 				var res_data = data.response
	 			   if(res_data['status'] && res_data['status']=='success'){	
	 			       jAlert("Sync Successfull");
	 			       $("#ro_"+order_id).css({'background-color':'b3fff0'})
	 			    }
	 			   else if (res_data['status'] && res_data['status']=='failure'){	
	 			   	var err_msg = res_data['msg']
	 			   	jAlert("Sync failure!!!!"+err_msg);

	 			   }else if(res_data  && res_data =="Not allowed"){
	 			   	   jAlert("Operation not permitted")
	 			   }
	 		    }else{
	 		    	jAlert('Some thing went wrong in sync')
	 		    }
	 		},
	 		error: function(xhr, status, text){
	 			comm_handleAjaxError(xhr);
	 		}
	 	});
    }

     $('#ro_scan_copy').dialog({
		   			 width:1000,
		   			 height:900,
		  			 modal:true,
		   			 title:"RO Details",
		   			 autoOpen: false,
		   			 });

    $('#order_item_list').on("click","a",function(event){  
	    var order_id = jQuery(this).attr('id').split('_')[1];
	    var da=jQuery(this).attr('data-action');
	    console.log("daaaaaaaaaaaaaa"+da)

        if(da=="ro_scan"){
	       console.log("##############3333"+this.id)
		   $.ajax({
			type:"GET",
			url:"commercials/"+order_id,
			success:function(data){
	            console.log("dataaaaaaaaaaaa"+JSON.stringify(data))
	            if(data && data.commercial.sid=='ro_scan'){

		   			 var thumbnail = data.commercial.thumbnail.replace("mw:/","");
		   			 var thumbnail = thumbnail.replace(/'/g,"&#39;");
		  			 thumbnail = 'ads/' + thumbnail
		   			

	             $("#ro_scan_copy #ro_scan_copy_img").prop('src',thumbnail)
	  		     jQuery('#ro_scan_copy').dialog('open');
		    		
	    	    }
	          }
	       })
     }
	    else if (da== 'view'){
	    	 
	    	//console.log("inside");
	    	var w = $(window).width();
	    	var h = $(window).height()-50;
	  		$('#orderInfo').dialog({

	  			width:w,
	  			height:h,
	  			modal:true,
	  			autoOpen:false,
	  			title:"Release Order Details",
	  			beforeClose: function(event){
	  				$(window).trigger('resize'); 
	  				$("#orderInfo").html("");
	  			}
	  		});
	  		
	  		$.cookie("orderId",order_id);
	  	  
	  	  $("#orderInfo").load('order/orderView.html', function() {	  		  
	  	      $("#orderInfo").dialog("open");
	  	      $("#print_view").focus();
	      });
	  		jQuery('#orderInfo').dialog('open');
	    }
	    else if(da=='edit') {
			jQuery('#main').load("order/spotsEdit.html");
		  	$.cookie("orderId",order_id);

		 }
		 else if(da == 'suspend'){
		 	orderssuspend(order_id);
		 }
		  else if(da == 'resume'){
		 	ordersresume(order_id);
		 }
		 else if(da == "del"){
			ordersDelete(order_id);
		  } else if(da =="sync" ){
		  	jConfirm('Do you want to sync this Order?', 'Order', function(response) {
	    		if(response){
			  		sync_individual_ro(order_id);
			 	}
			 });
		  } else if(da == "view_invoice"){
		  		var inv_id = order_id;
				if(inv_id!=undefined && inv_id!=""){
					$.cookie("invoice_id",inv_id)
					console.log("inv id:::"+inv_id)
					var w = $(window).width();
					var h = $(window).height();

					$('#ro-view-invoice').dialog({
				  			width:w,
				  			height:h,
				  			modal:true,
				  			autoOpen:false,
				  			title:"Invoice",
				  			beforeClose: function(event){
				  				$(window).trigger('resize'); 
				  				$("#ro-view-invoice").html("");
				  			}
				  		});
					//$("#invoice_view_dialog").load('report/invoice.html', function() {	
						if(INVOICE_FILE_NAME){
				          $("#ro-view-invoice").load('report/'+INVOICE_FILE_NAME, function() {	    
					  	      $("#ro-view-invoice").dialog("open");
					  	      //$("#print_view").focus();
					      });
					    }
				}else{
					console.log("Invoice ID Undefineddddddddddd")
				}
		  }
     });
})

function init_auto_suggest(){
	console.log("cust size::::"+customer_name_list.length)
	$("#search_cust" ).autocomplete({
				      source: customer_name_list,
				      minLength:0
				       }).focus(function(){            
				           $(this).autocomplete("search");
				     });
	$("#search_agency").autocomplete({
				      source: agency_name_list,
				      minLength:0
				       }).focus(function(){            
				           $(this).autocomplete("search");
				     });
	$("#search_sales").autocomplete({
				      source: sales_ex_name_list,
				      minLength:0
				       }).focus(function(){            
				           $(this).autocomplete("search");
				     });			     			       
}

function load_ro_ids(){
	 jQuery.ajax({
	  			url:'get_ro_ids',
	  			success:function(data){
	  				var ro_ids = []
	  				if(data.ro_list!=undefined){
                        ro_id_list = data.ro_list
	  				}
	  				 $("#search_ro_id" ).autocomplete({
				      source: ro_id_list,
				      minLength:0
				       }).focus(function(){            
				           $(this).autocomplete("search");
				     });
	  			}
     })
}

function ordersresume(order_id) {
	    	jConfirm('Do you want to Resume this Order?', 'Order', function(response) {
	    	if(response){
	    		order_status = {}
	    		order_status["status"] = "resume"
 		    	custUrl = "/orders/url2/"+order_id;
				 custType = "DELETE";
				    jQuery.ajax({
				    	type:custType,
			  			url:custUrl,
			  			data : JSON.stringify(order_status), 
			  			success:function(data){
			  				//jQuery('#main').load("order/ordersList.html")
			  				loadContent();
							return false;
			  			},
			  			 error: function(xhr, status, text) {
                                       var response = $.parseJSON(xhr.responseText);

                                       var err = response.errors;

                                   //    if (response) {
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
	   	   });
	    }

function orderssuspend(order_id) {
	    	jConfirm('Do you want to Suspend this Order?', 'Order', function(response) {
	    	if(response){
	    		order_status = {}
	    		order_status["status"] = "suspended"
 		    	custUrl = "/orders/url2/"+order_id;
				 custType = "DELETE";
				    jQuery.ajax({
				    	type:custType,
			  			url:custUrl,
			  			data : JSON.stringify(order_status), 
			  			success:function(data){
			  				jQuery('#main').load("order/ordersList.html")
							return false;
			  			},
			  			 error: function(xhr, status, text) {
                                       var response = $.parseJSON(xhr.responseText);

                                       var err = response.errors;

                                   //    if (response) {
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
	   	   });
    }


  function ordersDelete(order_id) {
	    	jConfirm('Do you want to delete this Order?', 'Order', function(response) {
	    	if(response){
	    		order_status = {}
	    		order_status["status"] = "deleted"
		    	custUrl = "/orders/url2/"+order_id;
				 custType = "DELETE";
				    jQuery.ajax({
				    	type:custType,
			  			url:custUrl,
			  			data : JSON.stringify(order_status), 
			  			success:function(data){
                            loadContent()
							return false;
			  			},
			  			 error: function(xhr, status, text) {
                                       var response = $.parseJSON(xhr.responseText);

                                       var err = response.errors;

                                   //    if (response) {
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
	   	   });
	} 

	/*function dateformatter(jsonDt) {
  	  var currentTime = new Date(jsonDt)
  	  var month = currentTime.getMonth() + 1
  	  var day = currentTime.getDate()
  	  var year = currentTime.getFullYear()
  	  var dateString = day + "/" + month + "/" + year
  	  return dateString;
  	}*/

  	function ro_setSearchFields(url){
  		var query = url.split("?")[1];
  		var fieldsArr = query.split("&");

  		for(var i=0; i<fieldsArr.length; i++){
  			var key = fieldsArr[i].split("=")[0];
  			var value = fieldsArr[i].split("=")[1];

	  		if( key ==  "customer_id"){
	  			if(custMap[value]){
	   				$("#search_cust").val(custMap[value]);
	   			}
	   		}
	   		if( key == "agency_id" ){
	   			$("#search_agency").val(value);
	   		}
	   		if( key == "sales_ex" ){
	   			$("#search_sales").val(value);
	   		}
	   		if( key == "ro_id" ){
	   			$("#search_ro_id").val(value);
	   		}
	   		if( key == "status" ){
	   			$("#search_status").val(value);
	   		}
	   	}
  	}



