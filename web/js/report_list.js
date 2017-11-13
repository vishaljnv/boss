
var MODULE_NAME = 'Invoice'
channel = $("#channel").val();
var  invoice_details_map = {}
var tc_ro_num = '', tc_invoice_num = '', agency_name_list = [], agency_name_id_map = {}, customer_name_list = [];
var customer_name_id_map = {}, sales_ex_name_list = [], sales_ex_name_id_map = {}, branch_name_list = [], branch_name_id_map = {}; 
var vertical_name_list = [], vetical_name_id_map = {}, sub_vertical_name_list = [], sub_vetical_name_id_map = {};
var reportCustArr = []
//Reconcillation RO table colVis from localstorage.
var reconRoColsObj = {1: true, 2: true, 3: true, 4: true, 5: true, 6: true, 7: true, 8: true};
if(localStorage.getItem("reconProposedCols")){
	reconRoColsObj = JSON.parse(localStorage.getItem("reconRoCols"));
} else {
	localStorage.setItem("reconRoCols", JSON.stringify(reconRoColsObj) )
}

//Reconcillation Proposed table colVis from localstorage.
var reconProposedColsObj = {1: true, 2: true, 3: true, 4: true, 5: true, 6: true, 7: true, 8: true};
if(localStorage.getItem("reconProposedCols")){
	reconProposedColsObj = JSON.parse(localStorage.getItem("reconProposedCols"));
} else {
	localStorage.setItem("reconProposedCols", JSON.stringify(reconProposedColsObj) )
}

//As_run_log table colVis from localstorage.
var asRunLogColsObj = {1: true, 2: true, 3: true, 4: true, 5: true, 6: true, 7: true, 8: true, 9: true, 10: true};
if(localStorage.getItem("asRunLogCols")){
	asRunLogColsObj = JSON.parse(localStorage.getItem("asRunLogCols"));
} else {
	localStorage.setItem("reconProposedCols", JSON.stringify(asRunLogColsObj) )
}

var channel = $("#channel").val();
var channel_logo = getChannelLogo(channel);


var as_run_table = $('#report_list').dataTable( {
	"iDisplayLength": 200,
    "aLengthMenu": [[200, 400, 500, 600, -1], [200, 400, 500, 600, "All"]],
    "autoWidth":false,

	"paging" : false,
	"searching": false,
	"fixedHeader": true,
	
	 "bInfo":false,
	"columns": [
				{ "width": "6%", "orderable": false, "visible": true },
			    { "width": "7%", "orderable": false, "visible": asRunLogColsObj[1] },
				{ "width": "15%", "orderable": false, "visible": asRunLogColsObj[2] },
				{ "width": "20%", "orderable": false, "visible": asRunLogColsObj[3] },
				{ "width": "20%", "orderable": false, "visible": asRunLogColsObj[4] },
				{ "width": "8%", "orderable": false, "visible": asRunLogColsObj[5] },
				{ "width": "8%", "orderable": false, "visible": asRunLogColsObj[6] },
				{ "width": "8%", "orderable": false, "visible": asRunLogColsObj[7] },
				{ "width": "6%", "orderable": false, "visible": asRunLogColsObj[8] },
				{ "width": "8%", "orderable": false, "visible": asRunLogColsObj[9] },
				{ "width": "10%", "orderable": false, "visible": asRunLogColsObj[10] },
	    ],
	    dom: 'Bfrtip',
        buttons: [
        	{
            	extend: 'colvis',
            	columns: '1, 2, 3, 4, 5, 6, 7, 8, 9, 10',
            },
            // {
            //     extend: 'print',
            //     title: "",
            //     text:"<i class='fa fa-print fa-lg' style='padding-right:10px;'></i>Print",
            //     // exportOptions: {
            //     //     columns: ':visible'
            //     // },
            //     customize: function ( win ) {
            //         $(win.document.body).prepend('<table style="width: 100%" border="0" class="print_table"><tr><td><strong class="print_title">As run log</strong><strong class="print_date"> - '+$("#startDateFrom").val()+'</strong></td><td><img src="'+channel_logo+'"  width="160px;"/></td><tr></table>'); 
            //         $(win.document.body).find( 'table' ).addClass( 'compact' ).css( 'font-size', 'inherit' );
            //         $(win.document.body).find( 'table' ).css( 'border', 'none' );
            //         $(win.document.title).css( 'font-size', '5pt' );
            //         $(win.document.body).css("background","white");
            //     }
            // }
        ]
    });

	$('#report_list').on('column-visibility.dt', function(e, settings, column, state ){
		asRunLogColsObj[column] = state;
		localStorage.setItem("asRunLogCols", JSON.stringify(asRunLogColsObj) );
	});

    var day_revenue_tab = $('#day_revenue_list').dataTable( {
	"iDisplayLength": 200,
    "aLengthMenu": [[200, 400, 500, 600, -1], [200, 400, 500, 600, "All"]],
    "autoWidth":false,
	"info":   false,
	"bSort": false,
	"filter":false,
	"paging":   false
    });

   $(".datepicker_cls").datepicker({
		dateFormat : 'dd/mm/yy',
		showOn : "both",
		buttonImage : "javascripts/jquery-ui/development-bundle/demos/images/calendar.gif",
		buttonImageOnly : true,
	}); 

   $("#revenue_filter").click(function(){
   	    var revenue_type = $("#revenue_type").val()

   	   	load_day_revenue(revenue_type)
   })


    function load_day_revenue(type){
    	//var branch_id = $("#report_branch").val()
    	var from_revenue_date = $("#day_revenue_from_date").val()
    	var to_revenue_date = $("#day_revenue_to_date").val()
    	if(!(from_revenue_date!=undefined && from_revenue_date!='')){
    		jAlert("Please select from date")
    		return false;
    	}
    	if(!(to_revenue_date!=undefined && to_revenue_date!='')){
             jAlert("Please select to date")
             return false;
    	}
    	console.log("type::::"+type)
    	var url = ''
    	if (type=='generated'){
    	 url =  'calculate_revenue?&channel_id='+channel+"&from_date="+from_revenue_date
    	    url = url + "&to_date="+to_revenue_date
    	    url = url + '&flag='+type
    	}
    	else if (type=='expected'){
    		 url =  'proposed_revenue?&channel_id='+channel+"&from_date="+from_revenue_date
    	    url = url + "&to_date="+to_revenue_date
    	 
    	}else if (type=='invoice'){
    		url =  'calculate_revenue?&channel_id='+channel+"&from_date="+from_revenue_date
    	    url = url + "&to_date="+to_revenue_date
    	    url = url + '&flag='+type
    	}

    	/*if (branch_id!=undefined && branch_id!='')
    	    url = url + '&branch_id='+branch_id  */
    	console.log("urllllll"+url)      
   	    $.ajax({
			dataType: "json",
			url:url,
			success: function(data) {
				var tot_com = 0, paid_spots_dur = 0,paid_spots_cost = 0, bonus_spots_dur = 0;
				var  paid_spots_count = 0, bonus_spots_count = 0;
                day_revenue_tab.fnClearTable()
				if(data.result!=undefined){
					var res_map = data.result;
                    for (key in res_map){
                    	res = res_map[key]
                    	if(res!=null && res){
                    	//res['total_comm']!=undefined
	                    tot_com = res['total_comm']
	                   
	                     tot_com = 0  
	                    paid_spots_dur = res['total_paid_spot_duration']
	                    paid_spots_gross = res['gross']
                        paid_spots_net = res['net']
	                    paid_spots_count = res['total_paid_spots']
	                    bonus_spots_dur  = res['total_bonus_spot_duration']
	                    bonus_spots_count = res['total_bonus_spots']

                       var dt = moment(key,"YYYY/MM/DD").format("DD/MM/YYYY")
	                   day_revenue_tab.fnAddData([dt, 
	                   	        paid_spots_count,
	                     		paid_spots_dur.toFixed(0),
	                     		bonus_spots_count,
	                     		bonus_spots_dur,
	                     		paid_spots_gross.toFixed(2),
	                     		paid_spots_net.toFixed(2)
	                     		])

	                 
				}
			}
			  }
			}
		})
   }


    var total_revenue_tab = $('#total_revenue_list').dataTable( {
	"iDisplayLength": 200,
    "aLengthMenu": [[200, 400, 500, 600, -1], [200, 400, 500, 600, "All"]],
    "autoWidth":false,
	"info":   false,
	"bSort": false,
	"filter":false,
	"paging":   false
    });

    

    var report_ro_list_tab = $('#report_ro_list').dataTable( {
	"iDisplayLength": 200,
    "aLengthMenu": [[200, 400, 500, 600, -1], [200, 400, 500, 600, "All"]],
    "autoWidth":false,
	"info":   false,
	"bSort": false,
	"filter":false,
	"paging":   false
    });

     $("#total_revenue_date").datepicker({
		dateFormat : 'dd/mm/yy',
		showOn : "both",
		buttonImage : "javascripts/jquery-ui/development-bundle/demos/images/calendar.gif",
		buttonImageOnly : true,
		onSelect : function(date, picker) {
			load_total_revenue(1)
		}
	}); 


    $("#day_revenue_xls").on("click", function(){
       //var file_name = "day_revenue"	
       var from_date = $("#day_revenue_from_date").val();
       var to_date =  $("#day_revenue_to_date").val();
       var channel_id = $("#channel").val();

       /*if(from_date!=undefined && from_date!='')
       	  file_name = file_name + '_' + from_date
       if(to_date!=undefined && to_date!='')	
       	file_name = file_name + '_' + to_date
        var file_name_with_extn = file_name */



      /* $("#day_revenue_list").table2excel({
          	exclude: ".noExl",
            name: "Estimate revenue",
           filename:  file_name//do not include extension
       });*/

       if(!(from_date!=undefined && from_date!='')){
       	jAlert('Please enter From date')
       	return false;
       }
       if(!(to_date!=undefined && to_date!='')){
       	jAlert('Please enter To date')
       	return false;
       }
       var revenue_type = $("#revenue_type").val()
       if(revenue_type=='expected')
       exportToXls(from_date,to_date,"proposed_revenue",undefined,undefined);
       else if (revenue_type=='generated')
       exportToXls(from_date,to_date,"estimated_revenue",'generated',undefined);	
       else if(revenue_type=='invoice')
       exportToXls(from_date,to_date,"invoice_revenue",'invoice',undefined);		
      
       
   }); 

	function getAsRunLogFileName(){
		var filename = "asRunLog";
		if($("#startDateFrom").val()){
			var date = moment($("#startDateFrom").val(), "DD/MM/YYYY").format("DD-MM-YYYY");
			filename += "_"+date;
		}
		return filename;
	}

	function load_total_revenue(pageNum){
		total_revenue_tab.fnClearTable();
		var total_revenue_date = $('#total_revenue_date').val();
				
		var url = 'as-run-logs?from_date='+total_revenue_date+'&to_date='+total_revenue_date+
		'&channel_id='+channel;

		
		if(pageNum){
			url += '&page='+pageNum;
		}
		
		if(checkDates(total_revenue_date,total_revenue_date)){
			$.ajax({
				global:true,
				dataType: 'JSON',
				url:url,
				success:function(data){
					var as_run_logs = data.as_run_log_report;
					for (var i = 0; i < as_run_logs.length; i++) {
					 	var log = as_run_logs[i];	
					 	var clip_caption = ''
					 	var advt_type = ''
					 	var schedule_type = ''
					 	var scheduled_date = ''
					 	var agency_type = ''
					 	var rate = ''

                        
                        if(log.agency_type!=undefined)
                        	agency_type = '' 

					 	if (log.advt_type != undefined)
					 		advt_type = log.advt_type
					 	
					 	if(log.schedule_type != undefined)
					 		schedule_type = log.type
					 	if(log.make_good_id!= undefined)
					        if(log.scheduled_date != undefined)
					        	scheduled_date = log.scheduled_date
					    if(log.rate!=undefined)    
					    	rate = log.rate
		
					 	if(log.clip_caption!=undefined)
					 	   caption = log.clip_caption	
					 	else if(log.commercial_id!=undefined)
					 	   caption = get_clip_name_without_extn(log.commercial_id)	
					 	if (log.device != undefined){
					 		device = log.device;
					 	}   
					 	console.log(device)	
					 	console.log(scheduled_date,schedule_type)		
						total_revenue_tab.fnAddData([log.real_start_time,caption,sec_to_hhmmss(log.duration),
							advt_type,agency_type,schedule_type,scheduled_date,rate,device]);						
					}
					totalPages = data.totalPageCount;
					total_ln = as_run_logs.length
					total_asrun = data.as_run_count

					console.log("totalPages::::"+totalPages)
                    console.log("page no:::"+pageNum) 
					if(pageNum == 1){
					    $("#totalrevenuePaginationTab").pagination({
					    	items: total_asrun,
					    	itemsOnPage:total_ln,
					        pages : totalPages,
					        cssStyle: 'light-theme',
					        onPageClick:function(pageNumber, event){
					        	event.preventDefault();
					        	load_total_revenue(pageNumber);            
					    	}
					    });
					}

					if(totalPages <= 1){
						$("#totalrevenuePaginationTab").hide();
					}
					else {
						$("#totalrevenuePaginationTab").show();
					}
				},
				error: function(xhr, status, text) {
					comm_handleAjaxError(xhr);
				}
			});
		}
   
	}

	var recons_ro_table = $("#recons_list_ro").dataTable({
		"autoWidth":false,
		"paging":   false,
		"destroy": true,
		"filter":false,
		"info":   false,
		"bInfo" : false,
		"bSort": false,
		'fixedHeader': true,
		"columns": [
			{ "width": "8%",  "orderable": false, "visible": true},
		    { "width": "20%", "orderable": false, "visible": reconRoColsObj[1] },
			{ "width": "6%", "orderable": false, "visible": reconRoColsObj[2] },
			{ "width": "20%", "orderable": false, "visible": reconRoColsObj[3] },
	       	{ "width": "20%", "orderable": false, "visible": reconRoColsObj[4] },
	        { "width": "12%", "orderable": false, "visible": reconRoColsObj[5] },
			{ "width": "5%",  "orderable": false, "visible": reconRoColsObj[6] },
			{ "width": "4%",  "orderable": false, "visible": reconRoColsObj[7] },
			{ "width": "6%",  "orderable": false, "visible": reconRoColsObj[8] },
	    ],
	    dom: 'Bfrtip',
        buttons: [
        	{
            	extend: 'colvis',
            	columns: '1, 2, 3, 4, 5, 6, 7, 8',
            }
        ],
	});

	$('#recons_list_ro').on('column-visibility.dt', function(e, settings, column, state ){
		reconRoColsObj[column] = state;
		localStorage.setItem("reconRoCols", JSON.stringify(reconRoColsObj) );
	});

	$("#recons_list_ro_wrapper").hide();

	var recons_table = $('#recons_list').dataTable( {
	    "autoWidth":false,
		"processing": false,
		"paging":   false,
		"destroy": true,
		"filter":false,
		"info":   false,
		"bInfo" : false,
		"bSort": false,
		'fixedHeader': true,
		"fnRowCallback": function( nRow, aData, iDisplayIndex, iDisplayIndexFull ) {
			if(aData[8] == "Did not Air"){
				$(nRow).css('color', 'red');
			}
			console.log("here:::"+aData[7])
			if(aData[8] == "Run with discrepancy"){
				$(nRow).css('color', 'orange');

			}			
		 },
		// "dom": 'Bfrtip',
		"columns": [
						{ "width": "8%", "className": "center", "orderable": false, "visible": true },
					    { "width": "6%", "className": "center", "orderable": false, "visible": reconProposedColsObj[1] },
						{ "width": "5%", "className": "center", "orderable": false, "visible": reconProposedColsObj[2] },
						{ "width": "8%", "className": "center", "orderable": false, "visible": reconProposedColsObj[3] },
				       	{ "width": "26%", "className": "center", "orderable": false, "visible": reconProposedColsObj[4] },
					    { "width": "3%", "className": "center", "orderable": false, "visible": reconProposedColsObj[5] },
				        { "width": "4%", "className": "center", "orderable": false, "visible": reconProposedColsObj[6] },
						{ "width": "5%", "className": "center", "orderable": false, "visible": reconProposedColsObj[7] },
						{ "width": "7%", "className": "center", "orderable": false, "visible": reconProposedColsObj[8] },
						{ "width": "6%", "className": "center", "orderable": false, "visible": reconProposedColsObj[9] },
	    ],
	    dom: 'Bfrtip',
        buttons: [
        	{
            	extend: 'colvis',
            	columns: '1, 2, 3, 4, 5, 6, 7, 8, 9',
            }
        ],
	    // buttons: [
     //    {
     //            extend: 'print',
     //            title: "",
     //            text:"<i class='fa fa-print fa-lg' style='padding-right:10px;'></i>Print",
               
     //            // exportOptions: {
     //            //     columns: ':visible'

     //            // },
     //            customize: function ( win ) {                   
     //                $(win.document.body).prepend('<table style="width: 100%" border="0" class="print_table"><tr><td><strong class="print_title">Reconciliation</strong><strong class="print_date"> - '+$("#reconsFromDate").val()+'</strong></td><td><img src="'+channel_logo+'"  width="160px;"/></td><tr></table>'); 
     //                $(win.document.body).find( 'table' ).addClass( 'compact' ).css( 'font-size', 'inherit' );
     //                $(win.document.body).find( 'table' ).css( 'border', 'none' );
     //                $(win.document.title).css( 'font-size', '5pt' );
     //                $(win.document.body).css("background","white");                    
     //            }
     //        }
            // ,
            //   {            	
            //     extend: 'colvis',   
            //     title: "Reconciliation report",  
            //     text:"<i class='fa fa-tasks fa-lg' style='padding-right:10px;'></i>Column visibility"          
            // }

            // {
            // 	extend:"excelHtml5",
            // 	text:"<i class='fa fa-table fa-lg' style='padding-right:10px;'></i>Export Xls",
            //     action : function(e, dt, button, config){
            //     	config.title = getReconFileName();
            //     	$.fn.dataTable.ext.buttons.excelHtml5.action(e, dt, button, config);
            //     }
            // }
        // ]
    } );

	$('#recons_list').on('column-visibility.dt', function(e, settings, column, state ){
		reconProposedCols[column] = state;
		localStorage.setItem("reconProposedCols", JSON.stringify(reconProposedCols) );
	});
    
    function getReconFileName(){
		var filename = "reconciliation";
		if($("#reconsFromDate").val()){
			var date = moment($("#reconsFromDate").val(), "DD/MM/YYYY").format("DD-MM-YYYY");
			filename += "_"+date;
		}
		return filename;
	}

// affitavitTable = jQuery('#affidavit_list').dataTable( {							
// 							"iDisplayLength": 50,
// 						    "aLengthMenu": [[50, 100, 150, 200, -1], [50, 100, 150, 200, "All"]],
// 						    "autoWidth":false,						
// 							"paging" : false,
					        
// 							"destroy" : true,
// 							//"pagingType": "full_numbers",
// 							"filter" : false,
// 							"info" : false,
// 							"dom" : 'Bfrtip',							
// 								"columns" : [ {
// 								"width" : "8%",
// 								"className" : "center width_50",
// 								"orderable" : false
// 							},
// 							{
// 								"width" : "10%",
// 								"className" : "center width_50",
// 								"orderable" : false
// 							},
// 							{
// 								"width" : "50%",
// 								"className" : "clipName width_300",
// 								"orderable" : false
// 							}, {
// 								"width" : "8%",
// 								"className" : "center width_30",
// 								"orderable" : false
// 							}, {
// 								"width" : "8%",
// 								"className" : "center width_50",
// 								"orderable" : false
// 							},{
// 								"width" : "8%",
// 								"className" : "center width_50",
// 								"orderable" : false
// 							}
							
// 							], 

// 			 dom: 'Bfrtip',
// 			 footerCallback: function ( row, data, start, end, display ) {
// 			    var api = this.api(),data
	 
// 	            // Remove the formatting to get integer data for summation
// 	            var intVal = function ( i ) {
// 	                return typeof i === 'string' ?
// 	                    i.replace(/[\$,]/g, '')*1 :
// 	                    typeof i === 'number' ?
// 	                        i : 0;
// 	            };
	 
// 	            // Total over all pages
// 	            	if(data.length >0){
// 		            total = api.column( 2 ).data().reduce( function (a, b) {
// 		                    return intVal(a) + intVal(b);
// 		             } );
		            	            
// 		            // Update footer
// 		            $( api.column( 2 ).footer() ).html(total);
// 	        	}
// 			},
// 		     buttons: [
// 		            {
// 		                extend: 'print',
// 		                  text:"<i class='fa fa-print fa-lg' style='padding-right:10px;'></i>Print",
// 		                title: "",
// 		                autoPrint:true,
		                
// 		                footer: true, 
// 		                customize: function ( win ) {   
// 		                	var tblStr = ''
//                             tblStr =  get_print_data()
		                   
// 		                    $(win.document.body).prepend(tblStr);
// 		                    $(win.document.body).find( 'table' ).addClass( 'compact' ).css( 'font-size', '8px' );
// 		                     $(win.document.body).find( 'table thead tr th').css({'color': '#555', 'text-align': 'left' });
// 		                     $(win.document.body).find( 'td').css({'color': '#555', 'text-align': 'left'});
// 		                     $(win.document.body).find( '.print_table td').css({'color': '#555', 'text-align': 'left'});
// 		                     $(win.document.body).find( 'th.affd_total').css({'text-align': 'right !important'});
// 		                     $(win.document.body).find('strong').css({"color": "#555"});
// 		                     $(win.document.body).find( 'th#telecast_tbl_title').css({'color': '#555', 'text-align': 'center !important'});

// 		                     $(win.document.body).find('td.clipName').css({"min-width": "250px"});
// 		                    $(win.document.body).find( 'table' ).css( 'border', 'none' );
// 		                    $(win.document.title).css( 'font-size', '5pt' );
// 		                    $(win.document.body).css("background","white");                    
// 		                }
// 		            }
		           
// 		        ]
//     } );

function get_print_data(){
	var agency = "", customer = "";
	if($("#affidavitAgencyId").val() != 0){
		agency = $("#affidavitAgencyId option:selected").text();
	}

	if($("#affidavitCustomerId").val() != 0){
		customer = $("#affidavitCustomerId option:selected").text();
	}

	var tc_from_date = "", tc_to_date = '' , tc_ref_no = '';
	tc_from_date =  $("#affidavitFromDate").val()
    tc_to_date =  $("#affidavitToDate").val()
    tc_ref_no = $("#affidavitRoId").val()
    var tc_todays_date = moment().format("DD/MM/YYYY")
	var adrs = "";
			var channel = $("#channel").val();
			if(channelsMap[channel]){
				adrs = channelsMap[channel].address;
			}

			var channel_caption = getChannelCaption(channel);

			var street  = '', area = '', landmark = '', city = '', pincode = '';

			if(adrs.street!=undefined && adrs.street!=null)
				street = adrs.street
			if(adrs.area!=undefined && adrs.area!=null)
				area = adrs.area
			if(adrs.landmark!=undefined && adrs.landmark!=null)
				landmark = adrs.landmark
			if(adrs.city!=undefined && adrs.city!=null)
				city = adrs.city
			if(adrs.pincode!=undefined && adrs.pincode!=null)
				pincode = adrs.pincode


			

				var tblStr =

				"<div class='telecast' id='telecast_content'>"+
	
                "<table class='print_table' style='width:100%;background: #e7e7e7;'>"+
				"<tr>"+

				"<td style='width:70%;padding-top:10px;border:0 !important;'>" +
					"<div id='telecast_header'> "+
						"<div id='telecast_channel_name'>"+
							"<h1 style='padding-bottom:0px;text-align:center'>"+channel_caption+"</h1>"+
							"<p class='address' style='border:0px solid red;text-align:center'>"+
								"<span id='telecast_street'>"+street+" </span>"+
								"<span id='telecast_area'>"+area+" </span>"+
								"<span id='telecast_landmark'>"+landmark+" </span>"+
								
								"<span id='telecast_city'>"+city+" </span>"+
								"<span id='telecast_pin'>"+pincode+" </span>"+
							"</p>"+
							
						"</div>"+
						"</div>"+
					"</td>"+
					"<td style='width:30%;border:0 !important;text-align: right !important;'>"+
					"<div id='telecast_channel_logo'>"+
					"<img src = '"+channel_logo+"' style='height:100px;'/>"+
					"</div>"+
					
					"</td>"+
				"</tr>"+
			"</table>"      

				  "<table id='telecast_details_table'"+
				      "class='invoice_details_table' cellpadding='5' cellspacing='0'> "+
				     "<tbody>" +
					"<tr style='text-align:center;color:#222;font-size:16px;'>" +
					"<th colspan='4' id='telecast_tbl_title'> "+
					"TELECAST CERTIFICATE</th></tr>" +
					"<tr>" +
						
					"<td class='td_label'  style='width:20%;'>From Date: </td>"+
					"<td id='telecast_from_date' class='td_val invoice_val' "+
					"style='width:12%;'>"+tc_from_date+"</td>"+
				    "<td class='td_label'  style='width:20%;'>Date: </td>"+
					"<td class='td_val invoice_val'  id='tc_cur_date'  style='width:12%;'>"+
					tc_todays_date +"</td>"+
					"</tr>"+

					"<tr>"+
						"<td class='td_label'  style='width:20%;'>To Date: </td>"+
						"<td id='telecast_to_date' class='td_val invoice_val' "+
						"style='width:12%;'>"+tc_to_date+"</td> "+	

					"<td class='td_label'  style='width:20%;'>Ref No: </td>"+
					"<td id='telecast_ro_id' class='td_val invoice_val'"+ 
					"style='width:12%;'>"+tc_ref_no+"</td>"+						
					"</tr>"+

					"<tr>" +

					"<td class='td_label'  style='width:20%;'> Agency Name: </td>"+
						
					"<td id='telecast_agency_name' "+
					"class='td_val invoice_val agency_td'" + 
					"style='width:30%;'>"+agency+"</td>"+

				    "<td class='td_label'>RO No:</td><td class='td_val invoice_val'>"+
				    " "+tc_ro_num+"</td>"+
									
					"</tr>"+

					"<tr>"+

					"<td class='td_label  " +
					 "width_100' style='text-align:left;'>" +
					 "Client Name: </td>"+
					 "<td id='telecast_client_name' class='"+
					  "td_val invoice_val' style='width:30%;'>"+customer+"</td> "+

					"<td class='td_label'>Invoice No:</td>"+
					"<td class='td_val invoice_val'>"+tc_invoice_num+"</td>"+
				
					"</tr>"+
					"<tr>"+
				"</tbody>"+
			"</table>"

			return tblStr;
}



	function getAffidavitFileName(){
		var filename = "affidavit";
		if($("#affidavitCustomerId").val() != "0"){
			filename += "_"+$("#affidavitCustomerId option:selected").text();
		}
		if($("#affidavitFromDate").val()){
			var date = moment($("#affidavitFromDate").val(), "DD/MM/YYYY").format("DD-MM-YYYY");
			filename += "_"+date;
		}
		if($("#affidavitToDate").val()){
			var date = moment($("#affidavitToDate").val(), "DD/MM/YYYY").format("DD-MM-YYYY");
			filename += "_"+date;
		}

		return filename;
	}
    
invoiceTable = $('#invoice_list').dataTable( {
							"iDisplayLength": 50,
						    "aLengthMenu": [[50, 100, 150, 200, -1], [50, 100, 150, 200, "All"]],
						    "autoWidth":false,							
							"paging" : false,
							"destroy" : true,
							//"pagingType": "full_numbers",
							"filter" : false,
							"info" : false,
							"columns" : [ {
								"width" : "50%",
								"className" : "center",
								"orderable" : false
							}, {
								"width" : "20%",
								"className" : "center",
								"orderable" : false
							}, {
								"width" : "6%",
								"className" : "center",
								"orderable" : false
							}, {
								"width" : "6%",
								"className" : "center",
								"orderable" : false
							},{
								"width" : "8%",
								"className" : "center",
								"orderable" : false
							},{
								"width" : "10%",
								"className" : "center",
								"orderable" : false
							}],
	 dom: 'Bfrtip',
     buttons: [
            {
                extend: 'print',
                  text:"<i class='fa fa-print fa-lg' style='padding-right:10px;'></i>Print",
                exportOptions: {
                    columns: ':visible'
                },
                customize: function ( win ) {
                    $(win.document.body)
                        .css( 'font-size', '10pt' )
                        .prepend('<table class="print_table" style="width: 100%" border="0"><tr><td><img src="'+channel_logo+'"  width="160px;"/></td><td align="center" colspan="2"><strong class="print_title">Invoice</strong></td></tr></table><table><tr><td><h3>Bill To</h3></td></tr><tr><td id="customer_details"></td></tr></table></td><td align="right"><table><tr><td><strong>From Date:</strong></td><td id="invoice_from">  </td></tr><tr><td><strong>To Date:</strong></td><td id="invoice_to"></td></tr></table></td></tr></table>');
 
                    $(win.document.body).find( 'table' )
                        .addClass( 'compact' )
                        .css( 'font-size', 'inherit' );
                }
            },
            {            	
                extend: 'pdf'               
            }
            // ,
            // 'colvis'
        ]        
    });
    

	$("#startDateFrom").datepicker({
		dateFormat : 'dd/mm/yy',
		showOn : "both",
		buttonImage : "javascripts/jquery-ui/development-bundle/demos/images/calendar.gif",
		buttonImageOnly : true,
		//onSelect : function(date, picker) {
			//getAsRunLogs(1);
		//}
	});

	$("#reconsFromDate").datepicker({
		dateFormat : 'dd/mm/yy',
		showOn : "both",
		buttonImage : "javascripts/jquery-ui/development-bundle/demos/images/calendar.gif",
		buttonImageOnly : true,
		// onSelect : function(date, picker) {
		// 	getReconsReport();
		// }
	});

	$("#reconsRoDate").datepicker({
		dateFormat : 'dd/mm/yy',
		showOn : "both",
		buttonImage : "javascripts/jquery-ui/development-bundle/demos/images/calendar.gif",
		buttonImageOnly : true,
		// onSelect : function(date, picker) {
		// 	getReconsReport();
		// }
	});
	$("#inv_from_date").datepicker({
		dateFormat : 'dd/mm/yy',
		showOn : "both",
		buttonImage : "javascripts/jquery-ui/development-bundle/demos/images/calendar.gif",
		buttonImageOnly : true,
		// onSelect : function(date, picker) {
		// 	getReconsReport();
		// }
	});
	$("#inv_to_date").datepicker({
		dateFormat : 'dd/mm/yy',
		showOn : "both",
		buttonImage : "javascripts/jquery-ui/development-bundle/demos/images/calendar.gif",
		buttonImageOnly : true,
		// onSelect : function(date, picker) {
		// 	getReconsReport();
		// }
	});

	$("#reconsToDate").datepicker({
		dateFormat : 'dd/mm/yy',
		showOn : "both",
		buttonImage : "javascripts/jquery-ui/development-bundle/demos/images/calendar.gif",
		buttonImageOnly : true,
		onSelect : function(date, picker) {
			getReconsReport();
		}
	});
	
	var reconsReportDate = '';
	$("#report-container").easytabs({
		cache:false,
		animate: false,
        updateHash: false,
	}).bind('easytabs:after', function (event, $clicked, $targetPanel, settings) {
		$.removeCookie("tc_num", null, {path: '/' });
    	selected_tab = $($targetPanel).attr('id');
    	$(".pgTitle").text($("#report-container .tab.active").text())
    	if(selected_tab=="invoice"){
    		// get_invoice_list(1);
    		
    		$("#invoice").show()
    		$("#invoice_reset_filter").trigger("click");
    		//$("#inv_xls_download_div").show()

    		$("#invoice_preview").show();
    		$("#gen_invoice_div").show();
    	}else{
    		$("#invoice").hide()
    		$("#invoice_preview").hide();
    		$("#gen_invoice_div").hide();
    		//$("#inv_xls_download_div").hide()
    	}
	});

	$("#as_run_log_todate").datepicker({
 		dateFormat : 'dd/mm/yy',
 		showOn : "both",
 		buttonImage : "javascripts/jquery-ui/development-bundle/demos/images/calendar.gif",
 		buttonImageOnly : true,
 		onSelect : function(date, picker) {
 			$("#asRunKey").val("");
 			load_as_run_clips();
 		}
 	});


 	var yesterday = moment().add("days",-1).format("DD/MM/YYYY")

 	$("#as_run_log_todate").datepicker({
 		dateFormat : 'dd/mm/yy',
 		maxDate: 0,
 	}).datepicker("setDate", yesterday);
	
	var d = new Date();

	d.setDate(d.getDate() - 1);
	$("#startDateFrom").datepicker({
		dateFormat : 'dd/mm/yy',
		maxDate: 0,
	}).datepicker("setDate", yesterday);
	
	$("#reconsFromDate").datepicker({
		dateFormat : 'dd/mm/yy',
		maxDate: 0
	}).datepicker("setDate",d);
	
	$("#reconsToDate").datepicker({
		dateFormat : 'dd/mm/yy',
		maxDate: 0
	}).datepicker("setDate",d);
	
	d = new Date();
	d.setDate(1);
	$("#invoiceFromDate").datepicker({
		dateFormat : 'dd/mm/yy',
		maxDate: 0,
		showOn : "both",
		buttonImage : "javascripts/jquery-ui/development-bundle/demos/images/calendar.gif",
		buttonImageOnly : true,
	}).datepicker("setDate", d);

	$("#invoiceToDate").datepicker({
		dateFormat : 'dd/mm/yy',
		maxDate: 0,
		defaultDate: 15,
		showOn : "both",
		buttonImage : "javascripts/jquery-ui/development-bundle/demos/images/calendar.gif",
		buttonImageOnly : true,
	}).datepicker("setDate", new Date());	

	$("#affidavitFromDate").datepicker({
		dateFormat : 'dd/mm/yy',
		maxDate: 0,
		showOn : "both",
		buttonImage : "javascripts/jquery-ui/development-bundle/demos/images/calendar.gif",
		buttonImageOnly : true,
	}).datepicker("setDate", d);

	$("#affidavitToDate").datepicker({
		dateFormat : 'dd/mm/yy',
		maxDate: 0,
		defaultDate: 15,
		showOn : "both",
		buttonImage : "javascripts/jquery-ui/development-bundle/demos/images/calendar.gif",
		buttonImageOnly : true,
	}).datepicker("setDate", new Date());	

	var reportCustMap = {};
	function report_loadCusetomers(type){

			$.ajax({
				dataType: "json",
				url: 'customers?status=active&channel_id='+channel,
				success: function(result) {
					console.log(result);
					reportCustArr = [];
					if(type == undefined){
						reportCustMap = {};
					}
					if( result.customers == undefined){
						return;
					}
					if( !result.customers.length ){
						console.log("Empty customers");
						return;
					}
					var cust = [];
			    	cust = result.customers;
			    	if(cust.length){
				    	var options = '<option value="0">-- Choose One--</option>';

				    	for(var i=0; i<cust.length; i++){
						    options += '<option value="' + cust[i]._id + '">' + cust[i].name + '</option>';
						    reportCustArr.push({"label": cust[i].name.toUpperCase(), "value": cust[i]._id });

						    reportCustMap[cust[i]._id] = cust[i].name.trim();
						    customer_name_list.push(cust[i].name);
						    customer_name_id_map[cust[i].name] = cust[i]['_id']
				    	}
					    $("#affidavitCustomerId").html(options);
					    $("#invoiceCustomerId").html(options);
					    $("#recon_cust").html(options);

					    report_initCustAutosuggest("recon_cust_filter", "recon_cust", reportCustArr);
					    report_initCustAutosuggest("affidavitCustomerFilter", "affidavitCustomerId", reportCustArr);
					    report_initCustAutosuggest("invoiceCustomerFilter", "invoiceCustomerId", reportCustArr);
					}

				},
				error: function(xhr, status, text) {
					comm_handleAjaxError(xhr);
				} 
			});
		}


		function report_initCustAutosuggest(filterId, eleId, custArr){
			if( custArr.length ){
				$("#"+filterId).autocomplete({
					minLength:0,
			    	source: function( request, response ) {
			    		var matches = [];
			    		for(var i=0; i<custArr.length; i++){
			    			var item = custArr[i];
			    			var name = item.label;
							if ( name.toUpperCase().indexOf(request.term.toUpperCase()) === 0 ) {
								matches.push(item);
							}
			    		}
			    		if(request.term == ""){
							matches = custArr;
						}
					    response(matches);
					},
					focus: function(event, ui) {
						event.preventDefault();
						$(this).val(ui.item.label);
					},
					select: function(event, ui) {
						event.preventDefault();
						$(this).val(ui.item.label);
						$("#"+eleId).val(ui.item.value);

						if(eleId == "affidavitCustomerId"){
							console.log("CCccc"+JSON.stringify(ui.item))
							loadTelecastRoId(ui.item.value);
						}
						if(eleId == "invoiceCustomerId"){
							loadRoIdList(ui.item.value);
						}
					}
				});

				$("#"+filterId).on("click, focus", function(){
					if($("#"+filterId).val() == ""){
						$("#"+filterId).autocomplete("search", "");
					}
				});

				$("#"+filterId).on('keydown', function(){
					$("#"+eleId).val('');
				});

				$("#"+filterId).unbind("focusout");
				$("#"+filterId).focusout(function(){
					console.log("focusout.........");
					//var custId = $("#"+eleId).val();
					//var custStr = $("#"+filterId).val();
					var custStr = $("#"+filterId).val();
					custStr = custStr.trim();
					var custId = customer_name_id_map[custStr.toLowerCase()]

					console.log("custId:::"+custId+"custStr:::"+custStr)

					if( custId && custId != 0  && custStr){
						
						console.log("custStr: "+custStr+" ......... "+custId);
                        console.log("eleId:::"+eleId)

						/*if( !$.isEmptyObject(reportCustMap) ){

							for(key in reportCustMap){
								var name = reportCustMap[key];
								if ( name.toUpperCase() == custStr.toUpperCase() ) {
									$("#"+eleId).val(key);

									if(eleId == "affidavitCustomerId"){
										loadTelecastRoId(key);
									}
									if(eleId == "invoiceCustomerId"){
										loadRoIdList(key);
									}
									return;
								}	
							}
						}*/

                        if(eleId == "affidavitCustomerId"){
                        	$("#affidavitCustomerId").val(custId);
                        	console.log("iiiiiiiiii"+$("#affidavitCustomerId").val())
							loadTelecastRoId(custId);
						}
						if(eleId == "invoiceCustomerId"){
							$("#invoiceCustomerId").val(custId);
							loadRoIdList(custId);
						}
						  return;

					}else{
						console.log("NO customer ::::::::")
					}
				});
			}
		}

		var reportAgencyArr = [], reportAgencyMap = {};
		function report_loadAgencies(){
			$.ajax({
				dataType: "json",
				url: 'agencies?channel_id='+channel,
				success: function( result) {
					agency_list = [], reportAgencyArr = [], reportAgencyMap = {};

					if(result.agencies!=undefined){
				    	agency_list = result.agencies;
				    	var options = '<option value="0">---Choose one---</option><option value="1">Direct</option>';

				    	reportAgencyArr.push({"label": "DIRECT", "value": 1});
				    	reportAgencyMap[1] = "DIRECT";

				    	for(var j=0;j<agency_list.length;j++){
				    		var item = agency_list[j];
						    options += '<option value="'+item._id+'">'+item.name+'</option>'; 	
						    reportAgencyArr.push({"label": item.name.toUpperCase(), "value": item._id});
						    reportAgencyMap[item._id] = item.name;
						    agency_name_list.push(item.name)
						    agency_name_id_map[item.name] = item._id
				    	}
			    		$("#invoiceAgencyId").html(options);
			    		$("#affidavitAgencyId").html(options);

			    		report_initAgencyAutosuggest("affidavitAgencyFilter", "affidavitAgencyId", reportAgencyArr);
			    		report_initAgencyAutosuggest("invoiceAgencyFilter", "invoiceAgencyId", reportAgencyArr);
			    	}
				},
				error: function(xhr, status, text) {
		            comm_handleAjaxError(xhr);
		        }
			});   
		}

		function report_initAgencyAutosuggest(filterId, eleId, reportAgencyArr){
			if( reportAgencyArr.length ){
				$("#"+filterId).autocomplete({
					minLength:0,
			    	source: function( request, response ) {
			    		var matches = [];
			    		for(var i=0; i<reportAgencyArr.length; i++){
			    			var item = reportAgencyArr[i];
			    			var name = item.label;
							if ( name.toUpperCase().indexOf(request.term.toUpperCase()) === 0 ) {
								matches.push(item);
							}
			    		}
			    		if(request.term == ""){
							matches = reportAgencyArr;
						}
					    response(matches);
					},
					focus: function(event, ui) {
						event.preventDefault();
						$(this).val(ui.item.label);
					},
					select: function(event, ui) {
						event.preventDefault();
						$(this).val(ui.item.label);
						$("#"+eleId).val(ui.item.value);
						filterCustomers(ui.item.value);
					}
				});

				$("#"+filterId).unbind("click");
				$("#"+filterId).on('click, focus', function(){
					if($("#"+filterId).val() == ""){
						$("#"+filterId).autocomplete("search", "");
					}
				});

				$("#"+filterId).on('keydown', function(){
					$("#"+eleId).val('');
				});

				$("#"+filterId).unbind("focusout");
				$("#"+filterId).focusout(function(){
					var agencyId = $("#"+eleId).val();
					var agencyStr = $("#"+filterId).val();
					agencyStr = agencyStr.trim();

					if( (!agencyId || agencyId == 0) && agencyStr){
						if( !$.isEmptyObject(reportAgencyMap) ){
							for(key in reportAgencyMap){
								var name = reportAgencyMap[key];
								if ( name.toUpperCase() === agencyStr.toUpperCase() ) {
									$("#"+eleId).val(key);
									filterCustomers(key);
									return;
								}	
							}
						}
					}
				});
			}
		}
	var invoice_tab_lst = null
	$(document).ready(function(){

		$('#recon_ro_info_dialog').dialog({
	  			width:600,
	  			height:350,
	  			modal:true,
	  			autoOpen:false,
	  			title:"Playtime info"
	  		});

		$("#recons_list_ro").on("click", "i.recon_info_icon", function(){
			var index = $(this).attr("id");
			var id = index.replace("reconRO_", "");
			var item = reconROIdMap[id];
			var validList = [], invalidList = [], validSharedList = [], invalidSharedList = [];
			var clipName = "";
			if(item.commercial_name){
				clipName = item.commercial_name;
			}
			//validList = [ "00:20:23", "20:00:24", "14:00:23" ];  item.valid_playtime_list
			//invalidList = [ "12:20:23", "21:00:24", "13:00:23" ]; item.invalid_playtime_list;
			//validSharedList = [ "13:20:23", "22:00:24", "17:00:23" ]; item.valid_but_shared_playtime_list;
			//invalidSharedList = [ "04:20:23", "23:00:24", "19:00:23" ]; item.invalid_and_shared_playtime_list

			validList = item.valid_playtime_list
			validSharedList = item.valid_but_shared_playtime_list;
			invalidSharedList =item.invalid_and_shared_playtime_list
			invalidList = item.invalid_playtime_list;

            var lists = [validList, invalidList, validSharedList, invalidSharedList];
            var clsList = ["play_time valid_play_time", "play_time invalid_play_time", "play_time valid_shared", "play_time invalid_shared"];
            var titleList = ["Valid Playtime list", "Invalid Playtime list", "Valid but Shared Playtime list", "Invalid but Shared Playtime list"];
            
            var str = "";
            for(var i=0; i<lists.length; i++){
            	var list = lists[i];
            	var cls = clsList[i];
            	var timeStr = "<br>";
            	for(var j=0; j<list.length; j++){
            		var time = list[j];
            		timeStr += '<span class="'+cls+'" title="'+titleList[i]+'">'+time+'</span>';
            	}
            	str += timeStr;
            }

            var tbVersionStr = '';
			if(item.tb_version_info){
				tbVersionStr = '<br/><p style="color:#666;"><span class="text-danger" style="font-style:italic;">Info: </span> '+item.tb_version_info+'</p>';
			}

			$(".playtime_list").html("");
			$("#ro_playtime_list").html( "<span style='color:#555;'>"+clipName+"</span> <br> "+str +tbVersionStr);
			$("#recon_ro_info_dialog").dialog("open");

		});

        $.removeCookie("tc_num", null, {path: '/' }); 
		$(".pgTitle").text($("#report-container .tab.active").text())
		$("#recon_tab").hide()
		$("#telecast_tab").hide()
		$("#invoice_tab").hide()
		$("#as_run_tab").hide()
		var user_id = sessionStorage.getItem("user_id")
		var modules = []

		$.ajax({
		url: "/users/"+user_id,
		type:"GET",
		dataType:"json",
		success: function (data) {
			var privileges = data['user']['privileges']
		    var modules = []
		    var actions = {}
		    if(privileges['modules']!=undefined)
		       modules = privileges['modules']
			 
			 console.log("MODULESSSS" +JSON.stringify(modules));
			     
			
				 if (modules.indexOf("Reports") > -1)
				{
					
				  if(modules.indexOf("Asrunlogs") > -1)
				   {
				   	console.log("as run tab in:::::::::")
				   	$("#as_run_tab").css({'display': 'inline-block'});

				   }
				    if(modules.indexOf("Reconciliation") > -1)
				   {
				   	   console.log("as reconciliation tab in:::::::::")
	                   $("#recon_tab").css({'display': 'inline-block'});
	
				   }
				    if(modules.indexOf("Invoice") > -1)
						{
							console.log("as invoice tab in:::::::::")
			                $("#invoice_tab").css({'display': 'inline-block'});
					   }
					   if(modules.indexOf("Telecast") > -1)
					   {
					   	console.log("as telecast tab in:::::::::")
					   $("#telecast_tab").css({'display': 'inline-block'});
					   }
                   }

                   show_hide_tabs(modules);
               }
	     })
	
	

	function show_hide_tabs(modules)
	{
		 if (modules.indexOf("Reports") > -1)
				{
						  if(modules.indexOf("Asrunlogs") > -1)
						   {
						   	console.log("as run tab in:::::::::")
						   	$("#as_run_tab a").trigger("click");

						   }
						    else if(modules.indexOf("Reconciliation") > -1)
						   {
						   	   console.log("as reconciliation tab in:::::::::")
						   	$("#recon_tab a").trigger("click");
			
						   	
						   }
						    else if(modules.indexOf("Invoice") > -1)
						{
							console.log("as invoice tab in:::::::::")
						   	$("#invoice_tab a").trigger("click");
						   }
						   else if(modules.indexOf("Telecast") > -1)
						   {
						   	console.log("as telecast tab in:::::::::")
						   	$("#telecast_tab a").trigger("click");
						   }
                   }
	}

		//$("#invoicereport").load("report/invoice.html");
		report_loadCusetomers();
		report_loadAgencies();
		report_load_branches();
		load_sales_executives()
		setTimeout(function(){
		   report_auto_suggest_init();
		},200)
        
       

		$('#filterResultFieldSet').coolfieldset({ collapsed : true });

		$('.widgetbox h3, .widgetbox2 h3').click(function(){
			if($(this).next().css('display') != 'none'){
				$(this).next().slideUp('fast');
				$(this).css({MozBorderRadius: '3px', WebkitBorderRadius: '3px', borderRadius: '3px'});
				$(this).next().css({display:'none'});
				$(this).removeClass('arrowdn');
				$(this).addClass('arrow');
			}else{
				$(this).next().slideDown('fast');
				$(this).css({MozBorderRadius: '3px 3px 0 0', WebkitBorderRadius: '3px 3px 0 0', borderRadius: '3px 3px 0 0'});
				$(this).next().css({display:'block'});
				$(this).removeClass('arrow');
				$(this).addClass('arrowdn');
				drawChart();
			}
		});	

		invoice_tab_lst = $('#gen_invoice_list').dataTable({
		"iDisplayLength": -1,	
	    "aLengthMenu": [[25, 50, 75, 100, -1], [25, 50, 75, 100, "All"]],	
		"paging":   false,
		"destroy": true,
		"filter":false,
		"info":   false,
		"bSort": false,
		"searching": false,
		"columns": [
               { "width": "15%"},
               { "width": "20%"},
    	       { "width": "20%" },
    	       { "width": "10%" },
    	       { "width": "10%" },
    	       { "width": "10%" },
    	       { "width": "10%" },
    	       { "width": "10%", "className": "bold" },
    	       { "width": "7%" },
    	       {"width":"10%"},
    	       { "width": "7%" },
		 ],
		 'bAutoWidth': false,
	     "pagingType": 'full_numbers'	   
	    });
	    
	    // get_invoice_list();

	    $("#invoice_preview").click(function(){
	    	$("#invoice").show();
		   	$("#invoicereport").load("report/invoice_spots_details.html");
		   	$("#gen_invoice_div").hide();
		   	$("#invoice_preview").hide();
		   	
	   })
        

    	

		
        load_ro_ids()
        init_autosuggest()
        autosuggest_invoice_number()

	}); //END of document ready
	
 function report_load_branches(){
  var url = '/branches'
  $.ajax({
		dataType: "json",
		url: url,
		success: function( result) {
			branch_list = [];
			if(result.branches!=undefined){
				
		    	branch_list = result.branches;
		    	var options = '<option value="">---Choose one---</option>';
		    	for(var j=0;j<branch_list.length;j++){
		    		var item = branch_list[j];
				    options += '<option value="' + item._id + '">' + item.name + '</option>';
				    branch_name_list.push(item.name)
				    branch_name_id_map[item.name] = item._id
		    	}
		    	$("#report_branch").html(options);
	    	
			}
	    	
		},
		error: function(xhr, status, text) {
            comm_handleAjaxError(xhr);
        }
	});
}

function get_commercials(){
	var url = 'commercials?s={}&type=commercial&pagination=false&channel_id='+channel
	$.ajax({
		dataType: "json",
		url: url,
		success: function( result) {
			if(result.medias!=undefined){
				var com_list = []
				com_list = result.medias
				for(var i=0;i<com_list.length;i++){
					clip_name_list.push(com_list[i]['name'])
					clip_name_id_map[com_list[i]['name']] = clip_name_id_map[com_list[i]['_id']]
				}
			}
		}
	})
}



function load_sales_executives(){
   $.ajax({
		dataType: "json",
		url: '/users?channel_id='+channel+'&role=Sales',
		success: function( result) {
			users_list = [];
			salesMap = {};
			if(result.users!=undefined){
		    	users_list = result.users;
		    	
		    	for(var j=0;j<users_list.length;j++){
		    		sales_ex_name_list.push(users_list[j]['username'].toUpperCase())   
				    sales_ex_name_id_map[users_list[j]['username'].toUpperCase()] =  users_list[j]['_id']
		    	}
		    		
	    	}
		},
		error: function(xhr, status, text) {
        	comm_handleAjaxError(xhr);   
		}
	});
}



function report_auto_suggest_init(){
	
	 $("#ro_report_agency" ).autocomplete({
      source: agency_name_list,
      minLength:0
       }).focus(function(){            
           $(this).autocomplete("search");
        });
	  $("#ro_report_customer" ).autocomplete({
      source: customer_name_list,
      minLength:0
       }).focus(function(){            
           $(this).autocomplete("search");
        });
       $("#report_branch_id" ).autocomplete({
           source: branch_name_list,
           minLength:0
       }).focus(function(){            
           $(this).autocomplete("search");
       });
        $("#report_sales_ex" ).autocomplete({
           source: sales_ex_name_list,
           minLength:0
       }).focus(function(){            
           $(this).autocomplete("search");
       });
}
    

	function get_invoice_list(pageNumber){
		console.log("invoice listttttttttt")
		var channel = $("#channel").val();
 		var filter_param = BuildInvoiceURL();
 		console.log("flter paramerter"+filter_param)
 		var url = "list_invoice?channel_id="+channel+"&filter="+JSON.stringify(filter_param);
 		url += "&pagination=true&page="+pageNumber;

		$.ajax({
				url : url,
				dataType:"json",
				global: true,
				success : function(data) {
					buildInvoiceList(data);
				},
				error: function(xhr, status, text) {
		                    var response = $.parseJSON(xhr.responseText);
		                    var err = response.errors;
		
		                    if (response) {
		                        jAlert(err);
		                    }
		                }


			})
	}

	function BuildInvoiceURL(){
		var invoice_num = '', cust = '', agency = '', ro_id = '', ro_num = '', status = "";
     	var refId = '', from_date = '', to_date = ''
     	 invoice_num = $("#invoice_num").val();
     	 cust = $("#inv_customer").val();
     	 agency = $("#inv_agency").val();
     	 ro_id = $("#inv_roid").val();
     	 ro_num = $("#inv_ronum").val();
     	 refId = $("#inv_refId").val();
     	 from_date = $("#inv_from_date").val();
     	 to_date = $("#inv_to_date").val();
     	 if(from_date){
	     	 if (!to_date){
	     	 	jAlert("Please Enter End Date");
	     	 	return false;
	     	 }
	     }
	     if(to_date){
	     	 if (!from_date){
	     	 	jAlert("Please Enter Start Date");
	     	 	return false;
	     	 }
	     }
     	 status = $("#inv_status").val();
     	 var filter_param = {}
     	 if(invoice_num!=undefined && invoice_num!=''){
             filter_param["invoice_num"] = invoice_num
     	 }
     	 if(cust!=undefined && cust!=''){
     	 	console.log("customer_name_id_map[cust]::::::::;"+customer_name_id_map[cust])
     	 	
     	 	filter_param["customer.name"] = encodeURIComponent(cust);
     	 	filter_param["customer_id"] = customer_name_id_map[cust];
     	  

     	 }
     	 if(agency!=undefined && agency!=''){
     	 	
	        filter_param["customer.agency_name"] = encodeURIComponent(agency);
	        filter_param["customer.agency_id"] = agency_name_id_map[agency];
	        
     	 }
     	 if(ro_id!=undefined && ro_id!=''){
             filter_param["ro_id"] = ro_id
     	 }
     	 if(ro_num!=undefined && ro_num!=''){
             filter_param["ro_details.ro_num"] = ro_num
     	 }
         if(from_date!=undefined && from_date!=''){
         	filter_param['from_date'] = from_date
         }
         if(to_date!=undefined && to_date!=''){
         	filter_param['to_date'] = to_date
         }

         if(status){
         	filter_param['status'] = status;
         }

         return filter_param;
	}


	function buildInvoiceList(data, pNum){

		invoice_tab_lst.fnClearTable();

		if(!data){
			$('#inv_paginationTab').empty();
 			console.log("Empty invoice list...");
 			return false;
 		}

 		if(!data.invoice_list){
 			$('#inv_paginationTab').empty();
 			console.log("Empty invoice list...");
 			return false;
 		}

		var invoice_list = [];

		if(data.invoice_list!=undefined){
			invoice_list =  data.invoice_list

			for(var i=0; i<invoice_list.length; i++){
				var item = {}, cust_name  = '';
				var invoice_date = ""
				item = invoice_list[i];

				if(item.customer != undefined){
					cust_name = item.customer.name;
				}
				if(item.invoice_date!= undefined){
					invoice_date =  moment(item.invoice_date,"YYYY/MM/DD").format("DD/MM/YYYY"); 
				}

				var agency_name  = '';
				if(item.customer != undefined && item.customer.agency_name != undefined){
					agency_name = item.customer.agency_name; 
				}

				var inv_st_dt = item.from_date;
				var inv_ed_dt = item.to_date;

				var inv_num =  undefined;
				if( item.telecast_num ){
					inv_num = item.telecast_num;
				} else if( item.invoice_num ){
					inv_num = item.invoice_num;
				}

				var  view =  "<a  id='"+inv_num+"'" +
				"title='View Invoice' class='view_invoice' style='cursor:pointer;'>"+inv_num+"</a>";

				var view_tc = "<a  id='"+inv_num+"'" +
				"title='View TC' class='view_tc' style='cursor:pointer;'>"+'View TC'+"</a>"

                 var action_msg = '<a id="'+inv_num+'"  class="tc_inv_export" title="Export as xls" style="cursor:pointer;"><i class="fa fa-table"></i></a>';

                 if(isDeleteInvoice && $("#inv_status").val() == "active"){
                 	action_msg += '<a id="delete_'+inv_num+'"  class="invoice_delete" title="Delete Invoice" style="margin-left: 10px;color: #BF5050;font-size: 14px;cursor:pointer;"><i class="fa fa-trash"></i></a>';
                 }


                 if(isSyncInvoice){
                    action_msg = action_msg + "<button type='button' id='"+inv_num+"' class='btn btn-xs btn-default invoice-sync' style='cursor: pointer;margin-left:10px;padding:0 0;' title='Sync Invoice'> SYNC</button>";
                 }


                 var total_cost = 0;
                 if( item.tax_and_final_cost){
                 	if(item.tax_and_final_cost.final_cost != undefined ){
                 		total_cost = item.tax_and_final_cost.final_cost;
                 	}
                 }

                 var sync_status = ''
                 if (item.send_invoice_to_billing_status){
                 	sync_status = item.send_invoice_to_billing_status
                   }
             
                // action_msg = action_msg + "<button type='button' id='"+inv_num+"' class='btn btn-xs btn-default invoice-sync' style='cursor: pointer;margin-left:10px;padding:0 0;' title='Sync Invoice'> SYNC</button>";
                console.log("action ::::::::::::::"+action_msg)

				  var rowIndex = invoice_tab_lst.fnAddData([view || '', 
					agency_name || '',
					 cust_name || '',
					inv_st_dt ||'',
					inv_ed_dt ||'',
					item.ro_id ||'',
					invoice_date ||'',
					total_cost ||0,
					sync_status || '',
					view_tc || '',action_msg])


             
              var row = $('#gen_invoice_list').dataTable().fnGetNodes(rowIndex);
              $(row).attr( 'id', 'inv_'+inv_num );  
			}

			var curPage = data.currentPage;
 			var totalPages = data.totalPageCount;
 	        var total_ln = invoice_list.length;
 			var total_orders = data.invoice_count;

 			console.log("length...."+invoice_list.length);
 
 			if( totalPages <= 1){
 				$('#inv_paginationTab').empty();
 			} else if(pNum == undefined || pNum == 1){
 				console.log(total_orders, total_ln, totalPages, curPage);
 			    $("#inv_paginationTab").pagination({
 			    	items: total_orders,
 			    	itemsOnPage: total_ln,
 			        pages : totalPages,
 			        cssStyle: 'light-theme',
 			        currentPage: curPage,
 			        onPageClick: function(pageNumber, event){
 	        			get_invoice_list(pageNumber);          
 	    		 	}
 			    });
 			}

		}
	}
   

    $("#gen_invoice_div").on('click','a.tc_inv_export',function(){
    console.log("downlaod invoice and tc:::::::"+this.id)	
        query = {}
        
        query["channel_id"] = channel;
        query["type"] = "invoice_and_tc";
    	var inv_num = ''
    	inv_num = this.id;
    	query["inv_num"] = inv_num;
        query = JSON.stringify(query);
    	if(inv_num!=undefined && inv_num!=''){
        var url = 'export_to_xls?s='+query
    	$.ajax({
				url : url,
				dataType:"json",
				success : function(data) {
				console.log("data::::::::::::;"+JSON.stringify(data))
				inv_file_name = data["telecast"]
    			if (inv_file_name != undefined && inv_file_name["filename"]) {
    				$.fileDownload('/downloadfile/'+inv_file_name['filename']);

    			}
    			tele_file_name = data["invoice"]
    			if (tele_file_name != undefined && tele_file_name["filename"]) {
    				$.fileDownload('/downloadfile/'+tele_file_name['filename']);

    			}


					
				}
			})
        }
    })

    $('#gen_invoice_div').on('click', 'button.invoice-sync', function(){
    	 console.log($(this).prop('id'))
    	 invoice_num = $(this).prop('id')
    	 var url = "/sync_invoice/"+invoice_num;
	 	jQuery.ajax({
	 		type: "GET",
	 		url: url,
	 		success: function(data){
	 			 if(data.reponse){
	 			 	var res_data = data.reponse
                    if(res_data['status']=='sucsess'){
	 			       jAlert("Sync Successfull");
	 			       $("#inv_"+invoice_num).css({'background-color':'b3fff0'})
	 			    }else if (res_data['status']=='failure'){
	 		    	   jAlert("Sync Failure")
	 		      }
	 		    }else{
	 		    	jAlert('Some thing went wrong in sync')
	 		    }
	 		},
	 		error: function(xhr, status, text){
	 			comm_handleAjaxError(xhr);
	 		}
	 	});
	    	
	    });

    $("#gen_invoice_div").on('click','a.view_invoice',function(){
    //$(".view_invoice").unbind("click")
    //$(document).off('click')
	//$(document).on('click',".view_invoice", function(){
		var inv_id = "";
		inv_id = $(this).prop('id')
		if(inv_id!=undefined && inv_id!=""){
			$.cookie("invoice_id",inv_id)
			console.log("inv id:::"+inv_id)
			var w = $(window).width();
			var h = $(window).height();

			$('#invoice_view_dialog').dialog({
		  			width:w,
		  			height:h,
		  			modal:true,
		  			autoOpen:false,
		  			title:"Invoice",
		  			beforeClose: function(event){
		  				$(window).trigger('resize'); 
		  			}
		  		});
			//$("#invoice_view_dialog").load('report/invoice.html', function() {	
				if(INVOICE_FILE_NAME){
		          $("#invoice_view_dialog").load('report/'+INVOICE_FILE_NAME, function() {	    
			  	      $("#invoice_view_dialog").dialog("open");
			  	      //$("#print_view").focus();
			      });
			     }
		}else{
			console.log("Invoice ID Undefineddddddddddd")
		}
	  		
	})
     $("#gen_invoice_div").on('click','a.view_tc',function(){
	//$("#dialog_container").on('click','.view_tc',function(){
	//$(".view_tc").unbind("click")
    //$(document).off('click')
	//$(document).on('click',".view_tc", function(){
		var tc_id = "";
		tc_id = $(this).prop('id')
		if(tc_id!=undefined && tc_id!=""){
			$.cookie("tc_num",tc_id)
			console.log("tc nuum:::"+tc_id)
			var w = $(window).width();
			var h = $(window).height();

			$('#tc_view_dialog').dialog({
		  			width:w,
		  			height:h,
		  			modal:true,
		  			autoOpen:false,
		  			title:"Telecast",
		  			beforeClose: function(event){
		  				$(window).trigger('resize'); 
		  				$('#tc_view_dialog').html("");
		  				$(".telecast-certificate button").show();
		  				$(".telecast-certificate .teleSlotDelete_col").show();
		  				$(".telecast-certificate select, .tele_remarks").attr("disabled", "false");
		  			}
		  		});
			//$("#invoice_view_dialog").load('report/invoice.html', function() {	
	          $("#tc_view_dialog").load('report/telecast_certificate.html', function() {	    
		  	      $("#tc_view_dialog").dialog("open");
		  	      //$("#print_view").focus();
		  	      $(".telecast-certificate button").hide();
		  	      $(".telecast-certificate .print_btn").show();
		  	      $(".telecast-certificate .teleSlotDelete_col").hide();
		  	     
		      });
		}else{
			
		}
	  		
	});
	
	$('#gen_invoice_div').on('click', '.invoice_delete', function(){
    	var id = $(this).prop('id');
    	if(id){
    	 	id = id.replace("delete_", "");
    	} else {
    		console.log("Invalid Invoice Id");
    		return false;
    	}
    	jConfirm('Do you want to delete this Invoice?',  'Invoice', function(response) {
    		if(response){
		    	var url = "/invoice/"+id;

			 	$.ajax({
			 		type: "DELETE",
			 		url: url,
			 		success: function(data){
			 			console.log("Delete Successfull");
			 			$('#invoice_list_filter').trigger("click"); //load invoice list 
			 		},
			 		error: function(xhr, status, text){
			 			comm_handleAjaxError(xhr);
			 		}
			 	});
			}
		});
	    	
	});

	$("#invoice_reset_filter").click(function(){
		$("#invoice_num").val("");
     	$("#inv_roid").val("");

		$("#inv_customer").val("");
     	$("#inv_agency").val("");

     	$("#inv_status").val("active");

     	$("#inv_ronum").val("");
     	$("#inv_refId").val("");
     	$("#inv_from_date").val("");
     	$("#inv_to_date").val("");

     	$("#invoice_list_filter").trigger("click");
	});

     $("#invoice_list_filter").click(function(){
     	 
     	 var filter_param = BuildInvoiceURL();
     	 console.log("fiter while bulding invoice::::::::::"+filter_param)
         var url = 'list_invoice?channel_id='+$("#channel").val()+'&filter='+JSON.stringify(filter_param)
         url += "&pagination=true&page=1";

         $.ajax({
				global:true,
				dataType: 'JSON',
				url: url,
				success:function(data){
					buildInvoiceList(data, 1);
				},
				error: function(xhr, status, text) {
		                    var response = $.parseJSON(xhr.responseText);
		                    var err = response.errors;
		
		                    if (response) {
		                        jAlert(err);
		                    }
		                }
			})

     })

	function getAsRunLogs(pageNum) {
		as_run_table.fnClearTable();
		var startDateFrom = $('#startDateFrom').val();

		if(startDateFrom == ""){
			startDateFrom = startDateFrom.trim();
			if(startDateFrom == ""){
				jAlert("Empty Start date");
				return false;
			}	
		}

		var startDateTo = $('#as_run_log_todate').val();
		if(startDateTo == ""){
			startDateTo = startDateTo.trim();
			if(startDateTo == ""){
				jAlert("Empty End date");
				return false;
			}	
		}

		var keyword = $('#asRunKey').val();

		var url = buildAsRunUrl(pageNum);

		// if($("#device_as_run_filter").val() != 0 )
		// 	var device = $('#device_as_run_filter').val();
		// var url = 'as-run-logs?&channel_id='+channel
		// if(startDateFrom!=undefined && startDateFrom!='')
		// url = url + '&from_date='+startDateFrom;
	 //    if(startDateTo!=undefined && startDateTo!='')
	 //     url = url + '&to_date='+startDateTo;

		// if (device != undefined && device !=null){
		// 	url += '&device='+device;
		// }
		// if(pageNum){
		// 	url += '&page='+pageNum;
		// }
		// keyword = keyword.trim();
		// if(keyword){
		// 	url += "&keyword="+keyword
		// }
		if(checkDates(startDateFrom,startDateTo)){
			$.ajax({
				global:true,
				dataType: 'JSON',
				url:url,
				success:function(data){
					var as_run_logs = data.as_run_log_report;
					for (var i = 0; i < as_run_logs.length; i++) {
					 	var log = as_run_logs[i];	
					 	var clip_caption = ''
					 	var advt_type = ''
					 	var schedule_type = ''
					 	var scheduled_date = ''
					 	var device = ''
					 	var ro_id = ''
					 	var agency_name = ''
					 	var customer_name = ''
					 	if (log.advt_type != undefined)
					 		advt_type = log.advt_type
					 	if(log.ro_id != undefined)
					 		ro_id = log.ro_id
					 	if(log.type != undefined)
					 		schedule_type = log.type
					 	if(log.make_good_id!= undefined)
					        if(log.scheduled_date != undefined)
					        	scheduled_date = log.scheduled_date
		
					 	if(log.clip_caption!=undefined)
					 	   caption = log.clip_caption	
					 	else if(log.commercial_id!=undefined)
					 	   caption = get_clip_name_without_extn(log.commercial_id)	
					 	if (log.device != undefined){
					 		device = log.device;

					 	}  
					 	if (log.agency_name != undefined){
					 		agency_name = log.agency_name;

					 	}  
					 	if (log.customer_name != undefined){
					 		customer_name = log.customer_name;

					 	}   
					 	console.log("DEVICE::::::::;"+device)	
					 	//console.log(scheduled_date,schedule_type)		
					 	var air_date = ''
					 	if(log.date!=undefined && log.date!='')
					 	air_date = moment(log.date,"YYYY/MM/DD").format('DD/MM/YYYY')
					    console.log("device::::::::::"+device)
					    customer_name = '<span style="word-break:break-all;">'+customer_name+'</span>';
					    caption = '<span style="word-break:break-all;">'+caption+'</span>';
					    agency_name = '<span style="word-break:break-all;">'+agency_name+'</span>';

						as_run_table.fnAddData([air_date, log.real_start_time,customer_name,agency_name,caption,ro_id,sec_to_hhmmss(log.duration),
							advt_type,schedule_type,scheduled_date,device]);						
					}
					totalPages = data.totalPageCount;
					total_ln = as_run_logs.length
					total_asrun = data.as_run_count

					if(pageNum == 1){
					    $("#asrunPaginationTab").pagination({
					    	items: total_asrun,
					    	itemsOnPage:total_ln,
					        pages : totalPages,
					        cssStyle: 'light-theme',
					        onPageClick:function(pageNumber, event){
					        	event.preventDefault();
					        	getAsRunLogs(pageNumber);            
					    	}
					    });
					}

					if(totalPages <= 1){
						$("#asrunPaginationTab").hide();
					}
					else {
						$("#asrunPaginationTab").show();
					}
				},
				error: function(xhr, status, text) {
					comm_handleAjaxError(xhr);
				}
			});
		}
		
	}
	
	var detailRows = [];
	$("#reconsReportDate").datepicker({
	    dateFormat: 'yy-mm-dd',
	    showOn: "both",
	    buttonImage: "javascripts/jquery-ui/development-bundle/demos/images/calendar.gif",
	    buttonImageOnly: true,
	    onSelect: function(date, picker){ getReconsReport(date); }
	});

	
	function getReconsReport(date,filter,pageNum=1) {		
		
		var startDateFrom = $('#reconsFromDate').val();
		var startDateTo = $('#reconsToDate').val();
		var custId = $("#recon_cust").val();
		var device = '';
		var sch_type = $('#recon_schedule_type').val()


		if($("#device_recon_filter").val() != 0 )
			var device = $('#device_recon_filter').val();

		console.log(device,"!!!!!!!!!!!!!!!!")
		if($("#recon_filter").val() != 0){
			var filter = $("#recon_filter").val();
		}
		
		var url = 'reconciliation?channel_id='+channel+'&from_date='+startDateFrom+'&to_date='+startDateTo;

  		if(custId!=undefined && custId != null && custId != '0' ){
			url = url + "&custId="+custId
		}
		if(filter!=undefined && filter !=null){
			url = url + "&status="+filter;
		}
		if(device != undefined && device !=null){
			url += '&device='+device;
		}
		if(sch_type && sch_type!='0'){
		   url += '&schedule_type='+sch_type	
		}

		var report_type = $("#recon_type_filter").val();
		if(report_type == "ro"){
			var recon_ro_date = $("#reconsRoDate").val();
			if( !recon_ro_date){
				jAlert("Empty date");
				return false;
			}
			//change URL for RO reconcilation report.
			url = 'reconciliation?channel_id='+channel+'&ordered_report=true&date='+recon_ro_date+'&pagination_flag=true';
			recons_ro_table.fnClearTable();
		} else {
			recons_table.fnClearTable();
		}

		if(pageNum){
			url = url +'&page='+pageNum;
		}

		if( report_type == "proposed" && checkDates(startDateFrom,startDateTo) == false){ 
			console.log("checkDates fails.....");
			return false;
		}

		console.log(url);

		$.ajax({
			global:true,
			dataType: 'JSON',
			url:url,
			success:function(data){	 
				console.log(data);
				if(report_type == "proposed"){
					buildProposedRecons(data, pageNum);

					$("#recons_list_wrapper, #reconcilationXlsExport").show();
					$("#recons_list_ro_wrapper").hide();
				} else {
					buildRoRecons(data, pageNum);

					$("#recons_list_ro_wrapper").show();
					$("#recons_list_wrapper, #reconcilationXlsExport").hide();
				}

			}, error: function(xhr, status, text) {
				comm_handleAjaxError(xhr);
			}
		});
	}

	var reconROIdMap = {};
	function buildRoRecons(data, pageNum){
		var reportList = data["ro_reconciliation_report"];
		// $.getJSON( "recon_ro.json", function(data) {
		// 	reportList = data["ro_reconciliation_report"];
		for (var i=0; i<reportList.length; i++) {
			var item = reportList[i];
			reconROIdMap[i] = item;
			var date = moment(item.date, "YYYY/MM/DD").format("DD-MM-YYYY");

			var tb_caption = '<i class="fa fa-info-circle recon_info_icon" id="reconRO_'+i+'" title="Playtime info" style="color:#83B0EF;cursor:pointer;"></i> ';
			if(item.tb_caption){
				tb_caption += comm_trimString(item.tb_caption, 22);
			}
			recons_ro_table.fnAddData( [ item.ro_id_num, tb_caption, item.spot_type, item.customer_name, item.agency_name, item.timeband_ordered, item.ordered_spots, item.total_matched_spots, item.total_unmatched_spots ] );
		}

		var totalPages = data.totalPageCount;
		var total_ln = reportList.length;
		// total_recon = data.auditcount;
		if(pageNum == 1){
		    $("#reconRoPaginationTab").pagination({
		    	items: total_ln,
		    	itemsOnPage: total_ln,
		        pages : totalPages,
		        cssStyle: 'light-theme',
		        onPageClick:function(pageNumber, event){
		        	event.preventDefault();
		        	var date = $("#reconsRoDate").val();
		        	if(date){
		        		getReconsReport(date,"",pageNumber);
		        	}
		    	}
		    });
		}
		if(totalPages <=1 ){
		 	$("#reconRoPaginationTab").hide();
		}
		else {
			$("#reconRoPaginationTab").show();
		}

		// $("#totalitems_display").hide();
		recons_ro_table.dataTable().fnDraw();
		// });
	}


	function buildProposedRecons(data, pageNum){
		var as_run_logs = data["reconciliation-report"]['reconcilationReport'];
		for (var i = 0; i < as_run_logs.length; i++) {				 	
			var schedule_type = '', timeband = '', scheduled_date = '', schedule_time = '', device = '', clip_cap = '';
			var log = as_run_logs[i];		

			//console.log("Each log============"+JSON.stringify(log))	
           
			var date = moment(log.date, "YYYY/MM/DD").format("DD-MM-YYYY");
			
			if(log.timeband != undefined)
				timeband = log.timeband
			if(log.clip_caption!=undefined)
				clip_cap = log.clip_caption
			else if(log.clip_name!=undefined)
				clip_cap = get_clip_name_without_extn(log['clip_name'])
			schedule_type = log.type
			
			if(log.make_good_id!= undefined && log.make_good_id!=null){
		        if(log.scheduled_date != undefined && log.scheduled_date != null)
		        	scheduled_date = log.scheduled_date
		         
		        if(log.schedule_type != undefined && log.schedule_type != null)
					schedule_type = log.schedule_type     
			}

			if (log.device != undefined){
				device = log.device;
			}
			if(log.schedule_time != undefined)
				schedule_time = log.schedule_time
           
			
			recons_table.fnAddData([date,schedule_time,log.run_time,timeband,clip_cap,
				log.duration,log.type,scheduled_date,log.status,device],false);					 	
		}
		
		totalPages = data["reconciliation-report"].totalPageCount;
		total_ln = as_run_logs.length;
		total_recon = data["reconciliation-report"].auditcount;
		if(pageNum == 1){
		    $("#reconcilationPaginationTab").pagination({
		    	items: total_recon,
		    	itemsOnPage:total_ln,
		        pages : totalPages,
		        cssStyle: 'light-theme',
		        onPageClick:function(pageNumber, event){
		        	event.preventDefault();
		        	getReconsReport(date,"",pageNumber);            
		    	}
		    });
		}
		if(totalPages <=1 ){
		 	$("#reconcilationPaginationTab").hide();
		} else {
			$("#reconcilationPaginationTab").show();
		}

		// $("#totalitems_display").hide();
		recons_table.dataTable().fnDraw();
	}


	
	$('#report_list').on("mouseover", "tr", function(event) {
		$(this).css({ background : "#C8D9E8" });
	});
	$('#report_list').on("mouseout", "tr", function(event) {
		$(this).css({ background : "#ffffff" });
	});

	$('#filterResult').click(function(event) {
		getAsRunLogs(1);
	});

	function exportToXls(start_date, end_date, type, format, customer_id,device,ro_id,keyword){
		var query = {}
		query["channel_id"] = channel;
		query["from_date"] = start_date;
		query["to_date"] = end_date;
		query["type"] = type;
		query["format"] = format;
		
		var keyword = $('#asRunKey').val();
		if (ro_id){
			query['ro_id'] = ro_id;
		}
		if (device != undefined){
			query["device"] = device;
		}
		if(customer_id != undefined){
			query["customer_id"] = customer_id;
		}
        
       		
		/*if(filter != undefined){
			query["filter"] = filter;
		}*/
		if(keyword){
		   query['clip_caption_keyword'] = keyword
		}

		var agency_name = $("#as_run_agency").val();
		var agency_id = agency_name_id_map[agency_name]
		if(agency_id){
			query['agency_id'] = agency_id
		}
		
		query = JSON.stringify(query);


		var url = '/export_to_xls?s='+query

		if (type=='reconciliation'){
			var startDateFrom = $('#reconsFromDate').val();
			var startDateTo = $('#reconsToDate').val();
			var custId = $("#recon_cust").val();
			var device = '';
			var sch_type = $('#recon_schedule_type').val()


			if($("#device_recon_filter").val() != 0 )
				var device = $('#device_recon_filter').val();

			console.log(device,"!!!!!!!!!!!!!!!!")
			if($("#recon_filter").val() != 0){
				var filter = $("#recon_filter").val();
			}
			
			var url = url + '&channel_id='+channel+'&from_date='+startDateFrom+'&to_date='+startDateTo;

	  		if(custId!=undefined && custId != null && custId != '0' ){
				url = url + "&custId="+custId
			}
			if(filter!=undefined && filter !=null){
				url = url + "&status="+filter;
			}
			if(device != undefined && device !=null){
				url += '&device='+device;
			}
			if(sch_type && sch_type!='0'){
			   url += '&schedule_type='+sch_type	
			}

		}
	
		$.ajax({
    		global : true,
    		type : "GET",
    		dataType : "JSON",
    		url : url,
    		success : function(data) {
    			console.log("data::::::::::::;"+JSON.stringify(data))
    			if (data["filename"]) {
    				$.fileDownload('/downloadfile/'+data['filename']);
    			}
    		},
    		error : function(xhr,status, text) {
    			comm_handleAjaxError(xhr);
    		}
    	});
	}


	$("#invoice_xls").click(function(){
		var query = {}
		query['type'] = 'invoice_report'
		query['channel_id'] = channel
		inv_frm_date = $("#inv_from_date").val()
		if(inv_frm_date){
		    query["from_date"] = moment(inv_frm_date,"DD/MM/YYYY").format("YYYY/MM/DD");
		}
		inv_to_date = $("#inv_to_date").val();
		if(inv_to_date){
            query["to_date"] = moment(inv_to_date,"DD/MM/YYYY").format("YYYY/MM/DD");
		}else{
			jAlert("Please enter end date");
			return false
		}

		var inv_num = $("#invoice_num").val()
		if(inv_num){
			query['invoice_num'] = inv_num
		}

		var ro_id = $("#inv_roid").val()
		if(ro_id){
			query['ro_id'] = ro_id
		}


        
        var agency_name = $("#inv_agency").val();
        if(agency_name){
        	var agency_id = agency_name_id_map[agency_name]
        	query['agency_id'] = agency_id
        	query["agency_name"] = agency_name
	    }

        var cust_name = $("#inv_customer").val()
        if(cust_name){
        var cust_id = customer_name_id_map[cust_name]
        	query['customer_id'] = cust_id
        	query["customer_name"] = cust_name
        }
        
        var inv_status = $("#inv_status").val()
        if(inv_status){
        	query['status'] = inv_status
        }


        console.log("query dataaaaaaaaaaaaaa"+JSON.stringify(query))

 		$.ajax({
    		global : true,
    		type : "GET",
    		dataType : "JSON",
    		url : '/export_to_xls?s='+JSON.stringify(query),
    		success : function(data) {
    			console.log("data::::::::::::;"+JSON.stringify(data))
    			if (data["filename"]) {
    				$.fileDownload('/downloadfile/'+data['filename']);
    			}
    		},
    		error : function(xhr,status, text) {
    			comm_handleAjaxError(xhr);
    		}
    	});
	})

	$('#asRunLogsXlsExport').click(function(event) {
		var format = ["Date","Time","Clip Name", "Customer Name","Agency Name", "Ro Id","Duration","Advt_Type","Device"];
		var start_date = $("#startDateFrom").val();
		var end_date = $("#as_run_log_todate").val();
		var keyword = $('#asRunKey').val();
		var customer_id = ''
		var ro_id = $("#as_run_ro_id").val();
		var device =  $('#device_as_run_filter').val();
		var cust_name = $("#as_run_cust").val();
		// cust_name_to_lower =  cust_name.toLowerCase().trim();
        var cust_id = customer_name_id_map[cust_name] 
        console.log(cust_name);
        

	    //var	filter["keyword"] = $('#asRunKey').val();
	    //start_date, end_date, type, format, filter, customer_id,device,ro_id,keyword)
		exportToXls(start_date, end_date,"as_run_logs", format,cust_id,device,ro_id,keyword);

	});
	

	$('#reconcilationXlsExport').click(function(event) {
		var format = ["Date", "Scheduled", "Run", "Clip", "Duration", "Schedule_Type", "Status","Device","Cusotmer name","Agency Name"];
		var start_date = $("#reconsFromDate").val();
		var end_date = $("#reconsToDate").val();
		var filter = $("#recon_filter").val();
		var device = $('#device_recon_filter').val();
		var cust_name = $("#recon_cust_filter").val();
        var cust_id = customer_name_id_map[cust_name]
		exportToXls(start_date, end_date, 'reconciliation', format, cust_id,device,undefined,undefined)
		
	});

	$('#affidavitXlsExport').click(function(event) {
		var format = ["Telecast Date","Ad Type", "Timeband","Programme Name","Caption/Version","Telecast Time","Dur","Paid/Bonus","Dp start","Dp End","Rate"];
		var start_date = $("#affidavitFromDate").val();
		var end_date = $("#affidavitToDate").val();
		var cust_id  = $("#affidavitCustomerId").val();
		var ro_id = $('#affidavitRoId').val();
	
		if(!start_date){
			jAlert("Please select Start date")
			return false
		}
		if(!end_date){
			jAlert("Please select end date")
			return false
		}
		if(cust_id!=undefined && cust_id!=null && cust_id=='0'){
			jAlert('Please select customer')
			return false
		}
		if(ro_id!=undefined && ro_id=='0'){
			jAlert('Please select RO Id')
			return false
		}

		console.log("11111111111",cust_id)
		console.log('22222222222222',ro_id)
		exportToXls(start_date, end_date, 'customer-report', format, cust_id,undefined,ro_id,undefined)
	}); 

	$(".affidavitRefreshBtn").click(function(){
		refreshTC();
	});
	
	$('#filterReconsResult').click(function(event) {
		getReconsReport();
	});
	
	$("#invoiceAgencyId").change(function(event){
		var agencyId = $('#invoiceAgencyId').val();
    	filterCustomers(agencyId);
	});

	$("#affidavitAgencyId").change(function(event){
		var agencyId = $('#affidavitAgencyId').val();
    	filterCustomers(agencyId);
	});

	 $("#main").on("focusout", "#affidavitAgencyFilter", function(event){
        var agencyId = $('#affidavitAgencyId').val();
        filterCustomers(agencyId);
        });

	function loadTelecastRoId(){
		var custId = $('#affidavitCustomerId').val();
		$("#affidavitRoId").html("<option value='0'>Choose one</option>");
		if(custId){
			$.ajax({
	        	global:true,
	        	dataType:'JSON',
	        	url:'customers/'+custId+'?ro_id=1'+"&channel_id="+channel,
	        	success:function(data){
	        		var roIds = data.customer.ro_id_list;
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
	        		$("#affidavitRoId").html(roIdStr);
	        	},
	        	error: function(error){
	        		comm_handleAjaxError(error);
	        	}
	        });
		}
	}

	function loadRoIdList(){
		console.log("loadRoIdList......");
		var custId = $('#invoiceCustomerId').val();
		$("#invoiceRoId").html("<option value='0'>Choose one</option>");
		if(custId){
			$.ajax({
	        	global:true,
	        	dataType:'JSON',
	        	url:'customers/'+custId+'?ro_id=1',
	        	success:function(data){
	        		var roIds = data.customer.ro_id_list;
	        		var roIdStr = "<option value='0'>Choose one</option>";
	        		console.log("roIds: "+roIds);
	        		if(roIds.length){
	        			for(var i=0; i<roIds.length; i++){
	        				if(roIds[i]){
	        					roIdStr += "<option value='"+roIds[i]+"'>"+roIds[i]+"</option>";
	        				}
	        			}
	        		}
	        		$("#invoiceRoId").html(roIdStr);
	        	},
	        	error: function(error){
	        		comm_handleAjaxError(error);
	        	}
	        });
		}
	}
	

	function filterCustomers(agencyId){
		console.log("filterCustomers")
		
		$("#affidavitCustomerFilter, #invoiceCustomerFilter").val("");
		$("#affidavitCustomerId, #invoiceCustomerId").val(0);
		

		if (agencyId==null || agencyId==undefined){
			agencyId = 1
		}

        if (agencyId != undefined){
        	if(agencyId == 1){
			//report_loadCusetomers('direct');
			report_initCustAutosuggest("affidavitCustomerFilter", "affidavitCustomerId", reportCustArr);

			var options = '<option value="0">---Choose one---</option>';
						for(var i=0; i<reportCustArr.length; i++) {
							options += '<option value="' + reportCustArr[i].value + '">' + reportCustArr[i].label + '</option>'; 	
							
						}
						$("#invoiceCustomerId").html(options);
						$("#affidavitCustomerId").html(options);
			return;
		}

        

        url = 'agencies/'+agencyId+'?invoice_flag=true'

        $.ajax({
        	global:true,
        	dataType:'JSON',
        	url:url,
        	success:function(data){
        		var filterCustArr = [];

        		if(data['customer_details']){
        			if( !$.isEmptyObject(data["customer_details"]) ){
        				console.log(" CUSTOMERS LIST");
		        		var customer_details = data['customer_details'];
		        		var options = '<option value="0">---Choose one---</option>';
						$.each(customer_details,function (key, value) {
							options += '<option value="' + key + '">' + value + '</option>'; 	
							filterCustArr.push({"label": value.toUpperCase(), "value": key});
							reportCustMap[key] = value.trim();
						});
						$("#invoiceCustomerId").html(options);
						$("#affidavitCustomerId").html(options);

						report_initCustAutosuggest("affidavitCustomerFilter", "affidavitCustomerId", filterCustArr);
						report_initCustAutosuggest("invoiceCustomerFilter", "invoiceCustomerId", filterCustArr);
					} else {
						console.log("EMPTY CUSTOMERS");
						 $( "#affidavitCustomerFilter" ).autocomplete('option', 'source', []);
						 $( "#invoiceCustomerFilter" ).autocomplete('option', 'source', []);
					}
				}
        	},
        	error:function(xhr, status, text){
        		comm_handleAjaxError(xhr);
        	}
        });
        }
	}

	var currency = null;
	var sales_tax_label =null;
	var agency_commission_label = null;

	$('#filterInvoiceResult').click(function(event) {
		invoiceTable.fnClearTable();
		var startDateFrom = $('#invoiceFromDate').val();
		var startDateTo = $('#invoiceToDate').val();
		var customerId = $('#invoiceCustomerId').val();
		var roId = $('#invoiceRoId').val();
		if( !customerId ){
			jAlert("Please select customer");
			return false;
		}

		if(roId=="0"){
			jAlert("Please select Ro ID");
			return false;
		}

		channel_id = $("#channel").val();
		sales_tax_label = comm_getLabelValue("invoice", "Sales Tax");
		currency = comm_getLabelValue("invoice", "Currency");
		agency_commission_label = comm_getLabelValue("invoice", "Agency Commission");

        if(checkDates(startDateFrom,startDateTo) && customerId != ""){
		    $.ajax({
				global: true,
				url:'invoice?from_date='+startDateFrom+'&to_date='+startDateTo+'&customer_id='+customerId+'&ro_id='+roId+'&channel_id='+channel,
				success:function(response){
					load_invoice_table(response);
				},
				error: function(xhr, status, text) {
			    	comm_handleAjaxError(xhr);
			    }
			}); 
        } 
	}); 	

	function checkUndefined(key){
		if(key != undefined && key != null){
			return key;
		} else {
			return "";
		}
	}

	var channelsMap = {};
	function getChannels(){
		$.ajax({
			global: true,
			url:'channels',
			success:function(data){
				if(data.channels){
					for(var i=0; i<data.channels.length; i++){
						var item = data.channels[i];
						channelsMap[item.channel_identity] = item;
					}
				}
			},
			error: function(error){
				comm_handleAjaxError(error);
			}
		});
	}
	getChannels();

	function load_cust_agency_info(){
		console.log("callllled load customer agency infoooooooooooooooooooooo")
	    var validCust = null, validAgency = null;
	    var cust = $("#invoiceCustomerId option:selected").text();
		var agency = $("#invoiceAgencyId option:selected").text();
		if(cust && $("#invoiceCustomerId").val() != 0 ){
			$("#invoice_client_name").html(cust);
			validCust = $("#invoiceCustomerId").val();
		} else {
			$("#invoice_client_name").html("");
		}

		if(agency){

			if( $("#invoiceAgencyId").val() != 1 ){
				$("#invoice_agency_name").html(agency);
				validAgency = $("#invoiceAgencyId").val();
			} else {
				$("#invoice_agency_name").html("");
			}

			if( validCust ){

				$.ajax({
					type:'GET',
					url:'/customers/'+validCust,
					success:function(data){
						if(data.customer.address){
							var custAdrs = data.customer.address;
							var adrsStr = "";
							if(checkUndefined(custAdrs.street) ){
								adrsStr += checkUndefined(custAdrs.street);
							}
							if(checkUndefined(custAdrs.landmark) ){
								adrsStr += ", "+checkUndefined(custAdrs.landmark)
							}
							if(checkUndefined(custAdrs.area) ){
								adrsStr += ", "+checkUndefined(custAdrs.area)
							}
							if(checkUndefined(custAdrs.city) ){
								adrsStr += ", "+checkUndefined(custAdrs.city)
							}
							if(checkUndefined(custAdrs.pincode) ){
								adrsStr += " - "+checkUndefined(custAdrs.pincode)
							}

							$("#invoice_client_address").html(adrsStr);
							$("#invoice_client_address").show();
						}
					}, 
					error: function(data){
						comm_handleAjaxError(data);
					}
				});
				if (agency.toLowerCase() == 'direct' || $("#invoiceAgencyId").val() == 0 ){
					$("#invoice_agency_address").html("");
					$(".agency_td").hide();
				}
			} 

			if(validAgency){
				// console.log("validAgency: "+validAgency);
				$.ajax({
					type:'GET',
					url:'/agencies/'+validAgency,
					success:function(data){
						if(data.agency){
							if(data.agency.address){
								var agencyAdrs = data.agency.address;
								var adrsStr = "";
								if(checkUndefined(agencyAdrs.street) ){
									adrsStr += checkUndefined(agencyAdrs.street);
								}
								if(checkUndefined(agencyAdrs.landmark) ){
									adrsStr += ", "+checkUndefined(agencyAdrs.landmark)
								}
								if(checkUndefined(agencyAdrs.area) ){
									adrsStr += ", "+checkUndefined(agencyAdrs.area)
								}
								if(checkUndefined(agencyAdrs.city) ){
									adrsStr += ", "+checkUndefined(agencyAdrs.city)
								}
								if(checkUndefined(agencyAdrs.pincode) ){
									adrsStr += " - "+checkUndefined(agencyAdrs.pincode)
								}

								if(adrsStr == ", , , - "){
									adrsStr = "";
								}

								$("#invoice_agency_address").html(adrsStr);
								$("#invoice_agency_address").show();
								$(".agency_td").show();
							}
						}
					}, 
					error: function(data){
						comm_handleAjaxError(data);
					}
				});
				if(!validCust){
					$("#invoice_client_address").html("");
				}
			}
		}
	}


	var agency_disc_pct = 0;
	function load_invoice_table(data){
		agency_disc_pct = 0;
		console.log("agency_disc_pct:::::::::::"+agency_disc_pct)
		$(".invoice_val").html("");
		$("#invoice_ro_id").html("");

	
		$("#cur_date").html(moment().format("DD/MM/YYYY"));

		if( $("#invoiceFromDate").val() ){
			$("#invoice_from_date").html($("#invoiceFromDate").val())
		} else {
			$("#invoice_from_date").html("");
		}

		if( $("#invoiceToDate").val() ){
			$("#invoice_to_date").html($("#invoiceToDate").val())
		} else {
			$("#invoice_to_date").html("");
		}

		if( $("#invoiceRoId").val() != 0 ){
			$("#invoice_ro_id").html( $("#invoiceRoId").val() );
		}
		
	

		$("#invoice_data_tbl tbody").html("");

		var totalPrice = 0;
		var rowStr = "", srCount = 0;
		console.log("dTAAAAAAAAAAAAA"+JSON.stringify(data))
		for(var key in data){
			if(key != "cust_details"){
				var clip = data[key];
				if(clip != undefined){

					if( clip["invoice_master"] ){
						if(clip["invoice_master"][0]["agency_commission"]){
							agency_disc_pct = clip["invoice_master"][0]["agency_commission"];
						}
					}

					var tbInfo = clip.timeband_info;

					if(tbInfo != undefined){
						for(var i=0; i<tbInfo.length; i++){
							var item = tbInfo[i];
							var d = moment(item.date, "YYYY/MM/DD").format("DD/MM/YYYY");
							var day = moment(item.date, "YYYY/MM/DD").format("ddd");
							var time = "", tb = "", st = "";
							
							if(item.real_start_time){
								time = item.real_start_time;
							}

							if(item.timeband){
								tb = item.timeband;
							}

							if(item.spot_type){
								st = item.spot_type;
							}

							var spotValCls = "";
							if( item.price <= 0 && isEditInvoice){
								spotValCls = "input_val_span";
							}

							var srNo = srCount+1;
							var sch_type = '',sch_date = ''
							if(item.type!=undefined && item.type!=null)
								sch_type = item.type
							if(item.scheduled_date!=undefined && item.scheduled_date!=null){
								sch_date_str = item.scheduled_date
								sch_date = moment(sch_date_str,'YYYY/MM/DD').format("DD/MM/YYYY")
							}
							rowStr += '<tr id="invoice_'+srNo+'"><td style="text-align:center">'+ srNo +'</td>';
							rowStr += '<td class="invoice_clip_name" style="text-align:left;min-width:250px;">'+key+'</td> <td style="text-align:center">'+parseInt(item.duration)+'</td> <td style="text-align:center;width:120px;">'+tb+'</td> <td style="text-align:center">'+d+'</td> <td style="text-align:center">'+day+'</td> <td style="text-align:center">'+time+'</td> <td style="text-align:center">'+item.rate+'</td> <td></td>'+sch_type+'<td>'+sch_date+'</td><td style="text-align:center">'+st+'</td> <td style="text-align:right" class="spot_val_net_td"><span id="val_'+srNo+'" class="'+spotValCls+' invoice_spot_val">'+item.price.toFixed(2)+'</span><input type="number" id="input_'+srNo+'" class="input_edit" /></td> ';

							// if('spot_type' in item){
							// 	rowStr += '<td>'+item.spot_type+'</td>'
							// } else {
							// 	rowStr += '<td></td>'
							// }
							rowStr += '</tr>';
							srCount ++;
							invoice_details_map[srCount] = item
						}
						
						totalPrice += parseFloat(clip.total_price);
					}
				}
			}
		}
		//console.log("rowwwwwwwwwwwwwwww"+rowStr)
		$("#invoice_data_tbl tbody").html(rowStr);
		setTimeout(function(){
			initEditInvoiceClick();
		}, 300);

		// if(totalPrice){
			updateTotalPrices(totalPrice);
		// }

		var cust_details = data["cust_details"];
		if(cust_details){
			$("#invoice_pan_no").html(cust_details.pan_num);
			$("#invoice_service_tax_no").html(cust_details.service_tax_num);
			$("#invoice_cust_name").html(cust_details.cust_name);

			var adrs = "";
			var channel = $("#channel").val();
			if(channelsMap[channel]){
				adrs = channelsMap[channel].address;
			}

			if(adrs && adrs!= undefined){
				if(adrs.street){
					$("#invoice_street").html(adrs.street+", ");
				} else {
					$("#invoice_street").html("");
				}

				if(adrs.area){
					$("#invoice_area").html(adrs.area+", ");
				} else {
					$("#invoice_area").html("");
				}

				if(adrs.landmark){
					$("#invoice_landmark").html(adrs.landmark+", ");
				} else {
					$("#invoice_landmark").html("");
				}

				if(adrs.city){
					$("#invoice_city").html(adrs.city+", ");
				} else {
					$("#invoice_city").html("");
				}

				if(adrs.pincode){
					$("#invoice_pincode").html(adrs.pincode);
				} else {
					$("#invoice_pincode").html("");
				}
			}
		}

	}

	$('#filterAffidavitResult').click(function(event) {
		// getAffidavitResult();
		console.log("clicked");
		$("#update_telecast_btn, #refresh_telecast").show();
		$("#telecast_report_tbl select").attr("disabled", "false");
		getTelecastCertificate();
	});

    $('#telecast_tab').click(function(event) {
		 $('#affidavitreport').load("report/telecast_certificate.html");
	});

	

	$("#affidavitRoId").change(function(){
		$("#ronumdate").val($("#affidavitRoId").val())
	})
	
	function getAffidavitResult(pageNum=1){
		 affitavitTable.fnClearTable();
		$('#total').text(' ');
		var startDateFrom = $('#affidavitFromDate').val();
		var startDateTo = $('#affidavitToDate').val();
		var customerId = $('#affidavitCustomerId').val(); 
		var roId = $('#affidavitRoId').val(); 
		if($("#device_affidavit_filter").val() != 0 )
			var device = $('#device_affidavit_filter').val();

		if(customerId=="0"){
			jAlert("Please select customer");
			return false;
		}

		if(roId=="0"){
			jAlert("Please select RO ID");
			return false;
		}
		var affidavit_url = 'customer-report?from_date='+startDateFrom+'&to_date='+startDateTo+'&customer_id='+customerId+'&channel_id='+channel+'&page='+pageNum+'&ro_id='+roId
		if (device != undefined && device !=null){
			affidavit_url += '&device='+device;
		}
        if(checkDates(startDateFrom,startDateTo)){
		        $('#tc_invoice_num').val('');
		        $('#tc_ro_num').val('');

			$.ajax({
				global: true,
				url: affidavit_url,
				success:function(response){		
					// console.log(response)				
					 var as_run_logs = response["customer-report"]["customerReport"];
					 var customer = response["customer"];
					 var schedule_type = "";
					 var scheduled_date = "";
					 $("#agency").val(customer.agency_name);
					 $("#client").val(customer.name);

					 var ro_details = undefined;
					 if(response['customer']['ro_details'])
					 {
					 	console.log(JSON.stringify(response['customer']['ro_details']))
					 	ro_details = response['customer']['ro_details']
						console.log("RO details:::"+ro_details)
					 	
						if(ro_details['ro_num'] && ro_details['ro_num'] != undefined && ro_details['ro_num'] != null ){
							console.log("Received RO Details");
					 		$("#tc_ro_num").val(ro_details['ro_num'])
					 		tc_ro_num = ro_details['ro_num']
					 	}

					 	if(ro_details["invoice_num"] && ro_details["invoice_num"] != undefined && ro_details["invoice_num"] != null){
					 		$("#tc_invoice_num").val(ro_details["invoice_num"])
					 		tc_invoice_num = ro_details["invoice_num"]
					 	}
					 }else{
					 	console.log("ro details undefineddddddddddd")
					 }
					 
					 var rowStr = "";
					 for (i = 0; i < as_run_logs.length; i++) {
					 	var log = as_run_logs[i];
					 	duration = 	log.duration;
					 	if(log.order_dur != undefined && log.order_dur!='None'){
					 		duration = 	log.order_dur;
					 	}
					 	var clip_cap = ''
					 	if(log.clip_caption!=undefined)
					 		clip_cap = log.clip_caption
					 	else if(log.commercial_id!=undefined)
					 		clip_cap = get_clip_name_without_extn(log.commercial_id)
					 	if (log.type != undefined)
                            schedule_type = log.type;
                            //console.log("schedule_type"+schedule_type)
                        if(log.scheduled_date != undefined)    
                            scheduled_date = log.scheduled_date;
                        var advt_type = '';
                        if(log.advt_type!=undefined && log.advt_type!=null)
                        	advt_type = log.advt_type;
                            //console.log("scheduled_date"+scheduled_date)
                        if (log.device != undefined){
					 		device = log.device;
					 	}   
					 	//console.log(device)    
					 	tc_date = moment(log.date,"YYYY/MM/DD").format("DD/MM/YYYY")

						affitavitTable.fnAddData([tc_date,advt_type.toUpperCase(),clip_cap, parseInt(duration),log.real_start_time,'PAID'],false);				

						rowStr += '<tr> <td>'+tc_date+'</td> <td>'+advt_type.toUpperCase()+'</td>  <td>'+clip_cap+'</td>  <td>'+parseInt(duration)+'</td> <td>'+log.real_start_time+'</td> <td>PAID</td> </tr>';
					}

					$("#telecast_report_tbl tbody").html(rowStr);

					totalPages = response["customer-report"].totalPageCount;
					total_ln = as_run_logs.length;
					total_recon = response["customer-report"].auditcount;
					if(pageNum == 1){
					    $("#affidavitPaginationTab").pagination({
					    	items: total_recon,
					    	itemsOnPage:total_ln,
					        pages : totalPages,
					        cssStyle: 'light-theme',
					        onPageClick:function(pageNumber, event){
					        	event.preventDefault();
					        	getAffidavitResult(pageNumber);            
					    	}
					    });
					}
					if(totalPages <=1 ){
					 	$("#affidavitPaginationTab").hide();
					}
					else {
						$("#affidavitPaginationTab").show();
					}
					affitavitTable.dataTable().fnDraw();
				},
				error: function(xhr, status, text) {
			      comm_handleAjaxError(xhr);
			    }
			});
		}	
	}
	function createSlotNode(orderId,breaks,asruns){
		$('div#prg-' + orderId).html('');
		var progName = '';
		var progDivId = '';
		$.each(breaks,function(index,brk){
			var isinasrun = false;
			$.each(asruns,function(arindex,asrun){
				if(asrun.itemId=='qet-'+brk.id){
					isinasrun = true;
					return isinasrun;
				}
			});
			if(progName != brk.progName){
				progName = brk.progName;
				progDivId = "prog-"+brk.id; 
				$('div#prg-'+orderId).append('<div id="prog-'+brk.id+'" class="break"><div class="horizontal_line"></div><div>'+progName+'</div>');
			}
			
			if(isinasrun)
		     	$('div#'+progDivId).append('<div id="brk-'+brk.id+'" class="break"><div class="horizontal_line"></div><div>'+brk.brkName+'&nbsp;&nbsp;&nbsp'+brk.startTime+'&nbsp;&nbsp;&nbsp;'+brk.endTime+'</div>');
			else
				$('div#'+progDivId).append('<div id="brk-'+brk.id+'" class="break"><div class="horizontal_line"></div><div><font color="red"> '+brk.brkName+'&nbsp;&nbsp;&nbsp'+brk.startTime+'&nbsp;&nbsp;&nbsp;'+brk.endTime+'</font></div>');
		  });   
	}
	
	function getDisplayTimeString(prg_id, brk_id) {
		var returnStr = '';
		try {
			var prg = nodeData[prg_id];
			var brk = prg.breaks[brk_id];
			returnStr += '<span class="total">Total: ' + brk.duration + ' sec</span>';
			var resDuration = 0;
			$.each(brk.slot_order, function(index, slot_id) {
				resDuration += slots[slot_id].duration;
			});
			var rem = (brk.duration - resDuration);
			returnStr += ' <span class="used">Used: ' + resDuration + ' sec</span>';
			returnStr += ' <span class="rem">Rem: ' + rem + ' sec</span>';
		} catch (error) {
		}
		return returnStr;
	}
	
	$('#getAsRunLogs').click(function(event) {
	  	$.ajax({
    		global : true,
    		type : "GET",
    		url : "write-as-run-logs?channel_id="+channel,
    		success : function(data) {
    			if (data == 'success' || data == "") {
    				jAlert("Successfully imported as run logs");
    			} else {
    				jAlert("Error in getting logs");
    			}
    		},
    		error : function() {
    			comm_handleAjaxError(xhr);
    		}
    	});
	});
	
	function sec_to_hhmmss(totalSec){
	   	//var totalSec = new Date().getTime() / 1000;
	   	var hours = parseInt( totalSec / 3600 ) % 24;
	   	var minutes = parseInt( totalSec / 60 ) % 60;
	   	var seconds = totalSec % 60;
	   	return  (hours < 10 ? "0" + hours : hours) + ":" + (minutes < 10 ? "0" + minutes : minutes) + ":" + (seconds  < 10 ? "0" + seconds : seconds);
	   }


	function updateTotalPrices(totalPrice){
		totalPrice = parseFloat(totalPrice).toFixed(2)
		$(".invoice_gross_amount").html(totalPrice);
		var agency = $("#invoiceAgencyId option:selected").text();
		var validCust = $("#invoiceCustomerId option:selected").text();

		var isAgency = true;
		if( (agency.toLowerCase() == 'direct' || $("#invoiceAgencyId").val() == 0 ) && (validCust || $("#invoiceCustomerId").val() != 0 )  ){
			$(".invoice_agency_discount").html("");
			isAgency = false;
		}

		var agency_disc = 0;

		if(isAgency){

			var agency_disc_amt = totalPrice * ( agency_disc_pct / 100)
			$(".invoice_agency_discount").html(agency_disc_amt.toFixed(2));
			$("#invoice_note_div").css({"padding-bottom": "5px"});
			$(".agency_disc_span").text("@ "+agency_disc_pct+ "%");
			$(".agency_val_td").show();

			agency_disc = totalPrice - agency_disc_amt;

		} else {
			agency_disc = totalPrice;

			$(".invoice_agency_discount").html("");
			$("#invoice_note_div").css({"padding-bottom": "20px"});
			$(".agency_val_td").hide();
		}
		agency_disc = parseFloat(agency_disc);

		var service_tax = agency_disc * ( 14 / 100 );
		var swatch_bharat = agency_disc  * ( 0.5 / 100 );
		var krishi_kalyan = agency_disc * ( 0.5 / 100);
		var round_off = parseFloat(agency_disc + service_tax + swatch_bharat + krishi_kalyan)

		$(".invoice_net_tax").html(agency_disc.toFixed(2));
		$(".invoice_service_tax").html(service_tax.toFixed(2));
		$(".invoice_swatch_bharat").html(swatch_bharat.toFixed(2));
		$(".invoice_krishi_kalyan").html(krishi_kalyan.toFixed(2));
		$(".invoice_round_off").html( Math.round(round_off).toFixed(2) );
		$(".invoice_total_payable").html( Math.round(round_off).toFixed(2) );

	}


	function initEditInvoiceClick(){
		$(".input_val_span").unbind("click");
		$(".input_val_span").click(function(){
			var rowId = $(this).attr('id');
			var rowNum = rowId.split("_")[1];
			$(this).hide();
			$("#input_"+rowNum).show();
			$("#input_"+rowNum).focus();

		});

		$(".input_edit").focusout(function(){
			console.log(JSON.stringify(invoice_details_map))
			var rowId = $(this).attr('id');

			var rowNum = rowId.split("_")[1];
			var value = $(this).val();
			if( !$.isNumeric(value) || value < 0){
				$(this).val("");
				value = "0.00";
			}
			$(this).hide();
			if(value){
				$("#val_"+rowNum).text( parseFloat(value).toFixed(2) );
				$("#val_"+rowNum).show();
				if( invoice_details_map[rowNum]!=undefined){
				  var temp_spot = invoice_details_map[rowNum]
				  temp_spot['price'] = parseFloat(value)
				  calculateTotalPrice();
			    }
			}

		});

	}

	function calculateTotalPrice(){
		var totalPrice = 0;
		console.log("row_len: "+$(".invoice_spot_val").length );

		$(".invoice_spot_val").each(function(index){
			var value = $(this).text();
			if(value != 0){
				totalPrice = parseFloat(totalPrice) + parseFloat(value);
			}
		});

		updateTotalPrices(totalPrice);
	}


	var isEditInvoice = false, isViewInvoice = false, isSyncInvoice = false, isDeleteInvoice=false;
	function report_loadPrivileges(){
		check_user_privileges()
	}
	report_loadPrivileges();
     
     function get_invoice_details_list(){
     	var invoice_details_lst = [];
     	for(each_spot in invoice_details_map){
     		invoice_details_lst.push(invoice_details_map[each_spot])
     	}
     	return invoice_details_lst;
     }
    

    $("#ro_list_filter").click(function(){
    	load_ro_list();
    })

    $('#roReportXlsExport').click(function(event) {
		var format = ["Client","Agency", "Clips","Ro Num","Ro Id",
		"Ro Start Date","Ro End Date","Status","Ro Date",
		"Branch","Booking Date","Bill type","Paid Spots","Paid Spots Dur",
		"Bonus Spots","Bonus Spots Dur","Net","Gross","Agency Commission",
		"GST(%)","Total Payable Amount", "Invoice details","Sales Executive"];
		var start_date = $("#ro_from_date").val();
		var end_date = $("#ro_to_date").val();
		if(!(start_date!=undefined && start_date!='')){
			jAlert("Please select start date");
			return false;
		}
		if(!(end_date!=undefined && end_date!='')){
			jAlert("Please select end date");
			return false;
		}


		exportToXls(start_date, end_date, "RO_report", format);
	});


    function load_ro_list(pageNum=1){
    	var url = 'release_orders_search?'
    	var search_data = {}
    	
    	var ro_num = $("#report_ro_num").val();
    	var agency = $("#ro_report_agency").val();
    	var customer = $("#ro_report_customer").val();
    	var sales_ex = $("#report_sales_ex").val();
    	var receipt_num = $("#report_receipt_num").val();
    	var bill_type = $("#report_bill_type").val()
    	var bill_to = $("#report_bill_to").val()
    	var branch = $("#report_branch_id").val()
    	var booking_date = $("#report_booking_date").val();
    	var from_date = $("#ro_from_date").val();
    	var to_date = $("#ro_to_date").val();
    	var ro_id = $("#report_ro_id").val();
    	var ro_date = $("#report_ro_date").val();
    	
    	var agency_id  = ''
        agency_id = agency_name_id_map[agency]
        var customer_id = ''
        customer_id = customer_name_id_map[customer]

        var sales_ex_id = ''
        sales_ex_id = sales_ex_name_id_map[sales_ex]  

        var branch_id = ''
        branch_id = branch_name_id_map[branch]


    	search_data['channel_id'] = channel
    	if(ro_num!=undefined && ro_num!='')
    	   search_data['ro_num'] = ro_num
    	if(agency_id!=undefined && agency_id!='')
    	  search_data['agency_id'] = agency_id
    	if(customer_id!=undefined && customer_id!='')
    	  search_data['customer'] = customer_id
    	if(sales_ex_id!=undefined && sales_ex_id!='')
    	  search_data['sales_ex'] = sales_ex_id
    	if(receipt_num!=undefined && receipt_num!='')
    	  search_data['receipt_no'] = receipt_num
    	if(bill_type!=undefined && bill_type!='' &&bill_type!='0')
    	  search_data['bill_type'] = bill_type
    	if(bill_to!=undefined && bill_to!='' && bill_to!='0')
    	  search_data['bill_to'] = bill_to
    	if(branch_id!=undefined && branch_id!='')
    	  search_data['branch_id'] = branch_id
    	if(booking_date!=undefined && booking_date!='')
    	  search_data['booking_date'] = booking_date
    	if(booking_date!=undefined && booking_date!='')
    	  search_data['booking_date'] = booking_date
    	if(ro_id!=undefined && ro_id!='')
    	  search_data['ro_id'] = ro_id
        
        if (from_date!=undefined && from_date!='')
           //url = url + 'start_date='+from_date
          search_data['start_date'] = from_date

        if(to_date!=undefined && to_date!='')
           //url = url +'&end_date='+to_date         	
           search_data['end_date'] = to_date

        url = url + '&filter='+JSON.stringify(search_data)

    	if(pageNum){
			url = url +'&page='+pageNum;
		}


    	$.ajax({
				url: url,
				type:"GET",
				dataType:"json",
				success: function(data) {
                var cust_name = "",agency_name = "",ro_num = "",ro_id = "",ro_date = ""
                var branch_name = "",booking_date = '',paid_spots = "",paid_spots_dur=""
                var bonus_spots="",bonus_spots_dur="",net = "",gross="", bill_type = ""
                var sales_ex="",clips = '',status =''
				
				report_ro_list_tab.fnClearTable()
				if(data.orders_list != undefined && data.orders_list != null){
			    var other_details = data.orders_list		
			     
				var orders_dict = data.orders_list
				var orders_list = orders_dict.Ro_search
				
				var total_ln = orders_list.length
				
				for(var i=0; i<orders_list.length; i++){
					if(orders_list[i]['customer_name']!=undefined)
						 cust_name = orders_list[i]['customer_name']
					    //console.log("cust nmae::::"+cust_name)
					if(orders_list[i]['agency_name']!=undefined)
						 agency_name = orders_list[i]['agency_name']
					    //console.log("age cy naeme::::"+agency_name)
					if(orders_list[i]['ro_num']!=undefined)
						 ro_num = orders_list[i]['ro_num'] 
				    if(orders_list[i]['ro_id']!=undefined)
						 ro_id = orders_list[i]['ro_id']
			         if(orders_list[i]['ro_date']!=undefined)
						 ro_date = orders_list[i]['ro_date'] 			 		   
				    if(orders_list[i]['branch_name']!=undefined)
						 branch_name = orders_list[i]['branch_name']    
				    if(orders_list[i]['booking_date']!=undefined)
						 booking_date = orders_list[i]['booking_date']
					if(orders_list[i]['paid_spots']!=undefined)
						 paid_spots = orders_list[i]['paid_spots']
					if(orders_list[i]['paid_spots_dur']!=undefined)
						 paid_spots_dur = orders_list[i]['paid_spots_dur']
					if(orders_list[i]['bonus_spots']!=undefined)
						 bonus_spots = orders_list[i]['bonus_spots']
					if(orders_list[i]['bonus_spots_dur']!=undefined)
						 bonus_spots_dur = orders_list[i]['bonus_spots_dur']
					if(orders_list[i]['net']!=undefined)
						 net = orders_list[i]['net']
					if(orders_list[i]['gross']!=undefined)
						 gross = orders_list[i]['gross']
				    if(orders_list[i]['bill_type']!=undefined)
						 bill_type = orders_list[i]['bill_type']
					if(orders_list[i]['sales_executive']!=undefined)
					    sales_ex = orders_list[i]['sales_executive']
					if(orders_list[i]['clips']!=undefined)
						clips = orders_list[i]['clips']
					if(orders_list[i]['status']!=undefined)
						status = orders_list[i]['status']


					clips_span = '<span>' + clips + '</span>'


                    var  inv_info = []
                    var  inv_info_str = ''
                    if(orders_list[i]['invoice_details']!=undefined){
                    	 inv_details  = orders_list[i]['invoice_details']
                    	 inv_info =  inv_details.split(",")
                    	 for(var j=0;j<inv_info.length;j++){
                    	  
                           inv_info_str = inv_info_str + '<div>' + inv_info[j] + '</div>'
                          
                    	}
                    }

                    console.log("inv_info::::::::::"+inv_info)
                    booking_date = moment(booking_date,"YYYY/MM/DD").format("DD/MM/YYYY")  
					report_ro_list_tab.fnAddData([cust_name, 
			           agency_name, clips_span, ro_num, ro_id,status,ro_date, 
			           branch_name, booking_date, bill_type,
			           paid_spots, paid_spots_dur.toFixed(2), bonus_spots,
		 	         	bonus_spots_dur.toFixed(2), net, gross, inv_info_str, sales_ex
		 		     ])
				   
					}
					var totalPages = other_details.totalPageCount;
					var total_ro = other_details.auditcount;
					if(pageNum == 1){
					    $("#report_ro_Tab").pagination({
					    	items: total_ro,
					    	itemsOnPage: total_ln,
					        pages : totalPages,
					        cssStyle: 'light-theme',
					        onPageClick:function(pageNumber, event){
					        	event.preventDefault();
					        	load_ro_list(pageNumber);            
					    	}
					    });
					}
					if(totalPages <=1 ){
					 	$("#report_ro_Tab").hide();
					} else {
						$("#report_ro_Tab").show();
					}

				
		}
					
				},
               error: function(xhr, status, text) {
					comm_handleAjaxError(xhr);
				}

			})
    	
         

    }

    $("#generate_invoice").click(function(){
        var startDateFrom = $('#invoiceFromDate').val();
		var startDateTo = $('#invoiceToDate').val();
		var customerId = $('#invoiceCustomerId').val();
		var agencyId = $('#invoiceAgencyId').val();
		var roId = $('#invoiceRoId').val(); 
		if(startDateFrom==undefined || startDateFrom==''){
			jAlert('From date empty')
			return false;
		}
		if(startDateTo==undefined || startDateTo==''){
			jAlert('To date empty')
			return false;
		}
		if(customerId==undefined || customerId==''){
			jAlert('Customer empty')
			return false;
		}
		if(roId==undefined || roId==''){
			jAlert('ROID empty')
			return false;
		}

    	var invoice_data = {}
         invoice_data['channel_id'] = channel
         invoice_data['customer_id'] = customerId
         invoice_data['from_date'] = startDateFrom
         invoice_data['to_date'] = startDateTo
         invoice_data['ro_id'] = roId
         var inv_list = get_invoice_details_list();
         if(inv_list==0){
         	jAlert("No spot details");
         	return false;
         }
         invoice_data['invoice_details'] = inv_list

         if(agencyId!=undefined && agencyId!="" &&agencyId!="1"){
         	invoice_data['agency_id'] = agencyId
         }

		$.ajax({
				type : "POST",
				url : "invoice",
				dataType:"json",
				data : JSON.stringify(invoice_data),
				success : function(data) {
					console.log(JSON.stringify(data))
					if(data.invoice_num!=undefined){
						jAlert("Invoice Num  <b>"+data.invoice_num+'</b>')
					}
				  // get_invoice_list();
				  $("#invoice_tab a").trigger("click");
				}
			})
    })

function load_ro_ids(){
	 jQuery.ajax({
	  			url:'get_ro_ids',
	  			success:function(data){
	  				var ro_ids = []
	  				if(data.ro_list!=undefined){
                        ro_id_list = data.ro_list
	  				}
	  				 $("#inv_roid" ).autocomplete({
				      source: ro_id_list,
				      minLength:0
				       }).focus(function(){            
				           $(this).autocomplete("search");
				     });
	  			}
     })
}

function autosuggest_invoice_number(){
	 jQuery.ajax({
	  			url:'get_invoice_nums',
	  			success:function(data){
	  				var inv_num = []
	  				if(data.inv_no_list!=undefined){
                        inv_num = data.inv_no_list
	  				}
	  				 $("#invoice_num" ).autocomplete({
				      source: inv_num,
				      minLength:0
				       }).focus(function(){            
				           $(this).autocomplete("search");
				     });
	  			}
     })
}

function init_autosuggest(){
	 $("#inv_customer" ).autocomplete({
				      source: customer_name_list,
				      minLength:0
				       }).focus(function(){            
				           $(this).autocomplete("search");
				     });
      $("#inv_agency" ).autocomplete({
				      source: agency_name_list,
				      minLength:0
				       }).focus(function(){            
				           $(this).autocomplete("search");
				     });
	}				       


	$("#ro_detailed_export").click(function(){
		var start_date = $("#ro_from_date").val();
		if(!(start_date!=undefined && start_date!='')){
	            jAlert("Please enter start date");
	            return false;
		}
		var end_date = $("#ro_to_date").val();
		if(!(end_date!=undefined && end_date!='')){
	            jAlert("Please enter end date");
	            return false;
		}
		exportToXls(start_date, end_date, "ro_report_timebandwise",'');
	});

	$("#recon_type_filter").change(function(){
		var recon_type = $("#recon_type_filter").val();

		if(recon_type == "proposed"){
			$("#schedule_type_wrap").show()
			$(".recon_proposed_filters").show();
			$(".recon_ro_filters").hide();

			$("#recons_list_wrapper, #reconcilationPaginationTab, #reconcilationXlsExport").show();
			$("#recons_list_ro_wrapper, #reconRoPaginationTab").hide();

		} else {
			$("#schedule_type_wrap").hide()
			$(".recon_ro_filters").show();
			$(".recon_proposed_filters").hide();

			$("#recons_list_ro_wrapper, #reconRoPaginationTab").show();
			$("#recons_list_wrapper, #reconcilationPaginationTab, #reconcilationXlsExport").hide();
			
		}
	});


	function init_asrun_auto_suggest(){
		$("#as_run_cust" ).autocomplete({
		    source: customer_name_list,
		   minLength:0
		}).focus(function(){            
		   $(this).autocomplete("search");
		});

		$("#as_run_agency").autocomplete({
		   source: agency_name_list,
		   minLength:0
		}).focus(function(){            
		   $(this).autocomplete("search");
		});                            
  }
  init_asrun_auto_suggest();
      
 var all_ro_ids = [];
 function load_as_run_ro_ids(){
   	$.ajax({
           url:'get_ro_ids',
           success:function(data){
			if(data.ro_list!=undefined){
                all_ro_ids = data.ro_list
            }

            $("#as_run_ro_id" ).autocomplete({
                source: all_ro_ids,
                minLength:0
            }).focus(function(){            
                $(this).autocomplete("search");
            });
          }
      });
  }
  load_as_run_ro_ids();
      
function load_as_run_clips(){

	var fromDate = $("#startDateFrom").val();
	var toDate = $("#as_run_log_todate").val();
	var channel = $("#channel").val();

	if( !channel || !fromDate || !toDate ){
		console.log("empty inputs for get clips list in AS RUN LOG...");
		return false;
	}

	var filter_param = {}
	if(channel){
		filter_param['channel_id'] = channel
	}

	if(fromDate){
		filter_param['from_date'] = fromDate
	}

	if(toDate){
		filter_param['to_date'] = toDate
	}

	//var url = 'as_run_log_caption_list?channel_id='+channel+'&from_date='+fromDate+'&to_date='+toDate+"&";
	var url = 'as_run_log_caption_list?filter_param='+JSON.stringify(filter_param)

      //   	if( $("#as_run_agency").val() ){
	   		// 	var agency_name = $("#as_run_agency").val();
	   		// 	var agency_id = agency_name_id_map[agency_name]
	   		// 	if(agency_id){
	   		// 		url += "agency_id="+agency_id+"&";
	   		// 	}
	   		// }

		    // if( $("#as_run_cust").val() ){
	   		// 	var cust_name = $("#as_run_cust").val();
	   		// 	// cust_name_to_lower =  cust_name.toLowerCase().trim();
	     //        var cust_id = customer_name_id_map[cust_name] 
	     //        console.log(cust_name);
	     //        if(cust_id){
	   		// 		url += "customer_id="+cust_id+"&";
	   		// 	}
	   		// }
	   		
	   		// if( $("#as_run_ro_id").val() != -1 && $("#as_run_ro_id").val() != 0 ){
	   		// 	roId = $("#as_run_ro_id").val();
	   		// 	url += "ro_id="+roId+"&";
	   		// }

	$.ajax({
       url: url,
       method: "GET",
       success:function(data){
          var clips = []
          if(data.clip_caption_list!=undefined){
             clips = data.clip_caption_list
          }

                $("#asRunKey" ).autocomplete({
                    source: clips,
                    minLength:0
                }).focus(function(){            
                    $(this).autocomplete("search");
                });
      }
  });
}
load_as_run_clips();
      
function buildAsRunUrl(pageNum){
	var cust = "", agency = "", sales = "", roId = "", status = "";

	var startDateFrom = $('#startDateFrom').val();
	var startDateTo = $('#as_run_log_todate').val();
	var keyword = $('#asRunKey').val();
	var channel = $("#channel").val();
	var device = "";

	var search_param = {}

	//var url = 'as-run-logs?&channel_id='+channel+"&"
	var url = 'as-run-logs'


	search_param['channel_id'] = channel

	if(startDateFrom!=undefined && startDateFrom!=''){
	 //url = url + 'from_date='+startDateFrom+"&";
	  search_param['from_date'] = startDateFrom
	}

    if(startDateTo!=undefined && startDateTo!=''){
    	//url = url + 'to_date='+startDateTo+"&";
    	search_param['to_date'] = startDateTo
    }

    if( $("#as_run_agency").val() ){
		var agency_name = $("#as_run_agency").val();
		var agency_id = agency_name_id_map[agency_name]
		if(agency_id){
			//url += "agency_id="+agency_id+"&";
			search_param['agency_id'] = agency_id
		}
	}

    if( $("#as_run_cust").val() ){
		var cust_name = $("#as_run_cust").val();
		// cust_name_to_lower =  cust_name.toLowerCase().trim();
        var cust_id = customer_name_id_map[cust_name] 
        console.log(cust_name);
        if(cust_id){
			//url += "customer_id="+cust_id+"&";
			search_param['customer_id'] = cust_id
		}
	}
	
	if( $("#as_run_ro_id").val() != -1 && $("#as_run_ro_id").val() != 0 ){
		roId = $("#as_run_ro_id").val();
		//url += "ro_id="+roId+"&";
		search_param['ro_id'] = roId
	}

	keyword = keyword.trim();
	if(keyword){
		//url += "&clip_caption_keyword="+keyword
		search_param['clip_caption_keyword'] = keyword
	}

    if($("#device_as_run_filter").val() != 0 ){
		device = $('#device_as_run_filter').val();
		if(device){
			//url += '&device='+device;
			search_param['device'] = device
		}
	}

	if(pageNum){
		//url += '&page='+pageNum;
		search_param['page'] = pageNum
	}

	url = url + "?filter_param=" + JSON.stringify(search_param)

	console.log("url........ "+url);
	return url;
}
      
$("#as_run_reset").click(function(){
	$(".as_run_filter_wrapper input").val("");
	$(".as_run_filter_wrapper select").val(0);
});
      


 	// $("#as_run_agency").off("focusout");
 	// $("#as_run_agency").on("focusout", function(){
 	// 	var agencyStr = $("#as_run_agency").val();
 	// 	if(agencyStr){
 	// 		$("#as_run_cust").val("");
 	// 		$( "#as_run_cust" ).autocomplete('option', 'source', []);
 
 	// 		var agencyId = agency_name_id_map[agencyStr];
 	// 		if(agencyId){
 	// 			// load_as_run_clips();
 	// 			filterAsRunCust(agencyId);
 	// 		} else {
 	// 			resetAsRunCustAll();
 	// 		}
 	// 	} else {
 	// 		resetAsRunCustAll();
 	// 	}
 	// });
 
 	// $("#as_run_cust").off("focusout");
 	// $("#as_run_cust").on("focusout", function(){
 	// 	var custStr = $("#as_run_cust").val();
 	// 	if(custStr){
 	// 		$("#as_run_ro_id").val("");
 	// 		$( "#as_run_ro_id" ).autocomplete('option', 'source', []);
 
 	// 		var custId = customer_name_id_map[custStr];
 	// 		if(custId){
 	// 			// load_as_run_clips();
 	// 			filterAsRunRoId(custId);
 	// 		} else {
 	// 			resetAsRunRoIdAll();
 	// 		}
 	// 	} else {
 	// 		resetAsRunRoIdAll();
 	// 	}
 	// });
 
 	// $("#as_run_ro_id").off("focusout");
 	// $("#as_run_ro_id").on("focusout", function(){
 	// 	var ro_id = $("#as_run_agency").val();
 	// 	if(ro_id){
 	// 		load_as_run_clips();
 	// 	}
 	// });
 
 	function resetAsRunCustAll(){
 		$("#as_run_cust" ).autocomplete({
              source: customer_name_list,
              minLength:0
          }).focus(function(){            
              $(this).autocomplete("search");
          });
 	}
 
 	function resetAsRunRoIdAll(){
 		$("#as_run_ro_id" ).autocomplete({
              source: all_ro_ids,
              minLength:0
          }).focus(function(){            
              $(this).autocomplete("search");
          });
 	}
 
 	function filterAsRunCust(agencyId){
         var url = 'agencies/'+agencyId+'?invoice_flag=true'
         $.ajax({
         	url: url,
         	dataType: 'JSON',
         	global: true,
         	success:function(data){
         		var filterCustArr = [];
 
         		if(data['customer_details']){
         			if( !$.isEmptyObject(data["customer_details"]) ){
 		        		var customer_details = data['customer_details'];
 
 						$.each(customer_details,function (key, value) {
 							filterCustArr.push( value.toUpperCase().trim() );
 						});
 
 						$("#as_run_cust" ).autocomplete({
 			            	source: filterCustArr,
 			            	minLength:0
 				        }).focus(function(){            
 				            $(this).autocomplete("search");
 				        });
 
 					} else {
 						console.log("EMPTY CUSTOMERS");
 						$( "#as_run_cust" ).autocomplete('option', 'source', []);
 					}
 
 					
 				}
         	},
         	error:function(xhr, status, text){
         		comm_handleAjaxError(xhr);
         	}
         });
 	}
 
 
 	function filterAsRunRoId(custId){
 
 		if(custId){
 			$.ajax({
 	        	global:true,
 	        	dataType:'JSON',
 	        	url:'customers/'+custId+'?ro_id=1'+"&channel_id="+channel_id,
 	        	success:function(data){
 	        		var roIds = data.customer.ro_id_list;
 	        		if(roIds != undefined){
 		        		if(roIds.length){
 
 							$("#as_run_ro_id" ).autocomplete({
 				            	source: roIds,
 				            	minLength:0
 					        }).focus(function(){            
 					            $(this).autocomplete("search");
 					        });
 
 		        		} else {
 		        			$( "#as_run_ro_id" ).autocomplete('option', 'source', []);
 		        		}
 		        	} else {
 		        		$( "#as_run_ro_id" ).autocomplete('option', 'source', []);
 		        	}
 	        		
 	        	},
 	        	error: function(error){
 	        		comm_handleAjaxError(error);
 	        		$( "#as_run_ro_id" ).autocomplete('option', 'source', []);
 	        	}
 	        });
 		}
	}