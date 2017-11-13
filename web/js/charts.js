$(document).ready(function(){
	   channel = $("#channel").val();
       $('#spots_booked').removeClass('report_tab')
	   $('#spots_booked').addClass('report_tab_active')
	   $('#aired_spots').removeClass('report_tab_active')
	   $('#aired_spots').addClass('report_tab')
	   $('#aired_spots_options').hide();
	   $('#booked_spots_options').show();
	   $("#months_div").hide();
	   $("#datesDiv").show();
	   reset_filter();
	   jQuery("#chart3").load("report/sales_audit.html");
	

	$(".datepick").datepicker({
		dateFormat : 'dd/mm/yy',
		onSelect : function(date, picker) {
			//filterResults();
		},
		showOn: "both",
    	buttonImage: "images/calendar.gif",
        buttonImageOnly: true
	}).datepicker()


	 $("#srch2").click(function(event){
		    //load_booked_spots_chart()
			console.log("srch2222")
	  	    var active_tab = get_active_tab()

	  	    if(active_tab=='spots_booked'){
               load_booked_spots_chart(); 
	  	    }else if(active_tab=='aired_spots'){
                load_spots_aired_chart();
	  	    }
	 })

	  $("#srch1").click(function(event){
	  	    var active_tab = get_active_tab()
	  	    if(active_tab=='spots_booked'){
	  	    	console.log("spots booked")
               load_booked_spots_chart(); 
	  	    }else if(active_tab=='aired_spots'){
                load_spots_aired_chart();
	  	    }
	  	    /*load_booked_spots_chart()

	  	    event.stopImmediatePropagation();
			cat = category = $(".category").val();
		    if(cat=="timeband"){
		    	drawTimebandChart();
		    }
		    else if (cat == "clientwise_timebandwise"){
		    	loadClientWiseTimebandWiseDate();
		    }
		    else if(cat=="sales_audit"){
				loadSaleAudit();}*/
		})

	  $("#srch3").click(function(event){
     	  	event.stopImmediatePropagation();
			cat = category = $(".category").val();
		    if(cat=="datewise"){
		    	drawDatewiseChart();
		    }
		})
	
	$("#booked_spots_category").change(function(){
	   reset_filter()
	   console.log("valueeeeee"+$("#booked_spots_category").val());	
       load_booked_spots_chart()
       //reset_filter()
    })

    $("#aired_spots_category").change(function(){
       reset_filter()
       load_spots_aired_chart()
       //reset_filter()

    })

    jQuery("#for_date").datepicker({
			dateFormat : 'dd/mm/yy',
			showOn : "both",
			buttonImage : "javascripts/jquery-ui/development-bundle/demos/images/calendar.gif",
			buttonImageOnly : true,
			onSelect : function(date, picker) {
				filterResults();
			}
    }); 

})

$("#print").click(function(event){
	event.preventDefault();demo-1
	window.print();
})

function get_active_tab(){
   var active_tab =	$("#chart_tab_div .report_tab_active").prop('id')
   return active_tab;
}

function filterResults(){
	console.log("filter results");
	var category =  $("#aired_spots_category").val();
	if(category=="datewise_inventory"){
		loadDateWiseInventory()
	}else if(category=="spots_aired_customerwise"){
		loadSpotsAiredcustomerWise();
	}else if(category=="booking_activity"){
		loadBookingActivity();
	}
	return;
}	
		
function checkDataExists(data){
	console.log(data);
	for(i=0;i<data.length;i++){
		if(data[i][1]>0)
			return true;
	}
	return false;
}
function fillMonthAndYear(from_yr, to_yr) {
	console.log("here",from_yr, to_yr);

	frm_yr = from_yr.toString().split("/");
	$("#from_year").val(frm_yr[0]);
	$("#from_month").val(frm_yr[1]);
 
    to_yy = to_yr.toString().split("/");	
    $("#to_year").val(to_yy[0]);
    $("#to_month").val(to_yy[1]);
}		

$.ajax({
	dataType: "json",
	url: '/customers?status=active&channel_id='+channel,
	async:false,
	success: function( result) {
		cust = [];
    	cust = result.customers;
    	var options = '';
    	for(k=0;k<cust.length;k++){
		    	options += '<option value="' + cust[k]._id + '">' + cust[k].name + '</option>';
    	}
	    $("#cust").html(options);
	} ,
	error: function(xhr, status, text) {
			       var response = $.parseJSON(xhr.responseText);
			       var err = response.errors;
			
			        if (response) {
			            jAlert(err.toString());
			        }
	}
});

$('.month').datepicker({
	dateFormat:'mm/yy',
		showOn: "both",
    	buttonImage: "images/calendar.gif",
	 buttonImageOnly: true
});


 $('.month_pick').MonthPicker({
 	Button: '<img src="images/calendar.gif" title="Select date" />'
 });

$(".chart_tab").click(function(){
   sel_tab = $(this).prop('id')
   if(sel_tab=='spots_booked'){
	   $('#spots_booked').removeClass('report_tab')
	   $('#spots_booked').addClass('report_tab_active')
	   $('#aired_spots').removeClass('report_tab_active')
	   $('#aired_spots').addClass('report_tab')
	   $('#aired_spots_options').hide()
	   $('#booked_spots_options').show();

       //$("#booked_spots_category").val(0)
       reset_filter();
	   load_booked_spots_chart()
	  
   }else{
       $('#aired_spots').addClass('report_tab_active')
	   $('#aired_spots').removeClass('report_tab')
	   $('#spots_booked').addClass('report_tab')
	   $('#spots_booked').removeClass('report_tab_active')
	   $('#aired_spots_options').show()
	   $('#booked_spots_options').hide();

	   //$("#aired_spots_category").val(0)
	   reset_filter();
	   load_spots_aired_chart()
	   
   }
   
})

function reset_filter(){
	$("#rep_start_date").val("");
	$("#rep_end_date").val("");
	$("#rep_from").val("");
	$("#rep_to").val("");
	jQuery("#for_date").val("");
}

function showHideDateDivs(){
	$("#cust_div, #datesDiv, #months_div, #singleDate, #single_month_div, #single_month").hide();
	
	$("#from_label").text('From')
	$("#month_div_to").show();
}

function load_spots_aired_chart(){
	   
		var category = $("#aired_spots_category").val();
		console.log("load chart========="+category)
		if(category=="customer"){
			jQuery("#chart3").load("report/customer_spots.html");
			showHideDateDivs();
			$("#months_div").show();
		}else if(category=="product_type"){
			showHideDateDivs();
			$("#months_div").show();

			jQuery("#chart3").load("report/product_type_spots.html");
		}else if(category=="timeband"){
			showHideDateDivs();
			$("#datesDiv").show();
			jQuery("#chart3").load("report/timeband_spots.html");
		}else if(category=="datewise"){
			showHideDateDivs();
			$("#months_div").show();
			$("#from_label").text('Month')
			$("#month_div_to").hide();
			jQuery("#chart3").load("report/datewise_spots.html");
		}else if(category=="monthly"){
			showHideDateDivs();
			$("#months_div").show();
			jQuery("#chart3").load("report/monthwise_spots.html");
		}else if(category=="revenue_monthly"){
			showHideDateDivs();
			$("#months_div").show();
			jQuery("#chart3").load("report/monthly_revenue.html");
		}else if(category=="as_run_spots"){
			showHideDateDivs();
			$("#months_div").show();
			jQuery("#chart3").load("report/customer_as_run_spots.html");
			jQuery("#cust_div").show();
		}else if(category=="revenue_customer"){
			showHideDateDivs();
			$("#months_div").show();
			jQuery("#chart3").load("report/customer_wise_revenue.html");
        	jQuery("#cust_div").show();
		}else if(category=="spots_aired_customerwise"){
			showHideDateDivs();
			$("#singleDate").show();
			jQuery("#chart3").load("report/spots_aired_customerwise.html");
		}else if(category=="datewise_inventory"){
			showHideDateDivs();
			jQuery("#singleDate").show();
			jQuery("#chart3").load("report/datewise_inventory.html");
		}else if(category=="clientwise_timebandwise"){
			showHideDateDivs();
			jQuery("#chart3").load("report/clientwise_timebandwise.html");
			jQuery("#datesDiv").show();
		}else if(category=="timebandwise_inventory"){
			showHideDateDivs();
			jQuery("#chart3").load("report/timebandwise_inventory.html");
		}else if(category=="log_report"){
			showHideDateDivs();
			jQuery("#chart3").load("report/log_report.html");
		}
		
   }


  function load_booked_spots_chart(){
  	    console.log("enteredddddddd load booked spots chart section:::")
  	  
   	    var category = $("#booked_spots_category").val();
   	    console.log("category :::::"+category)
   	    if(category=="sales_audit"){
   	    	showHideDateDivs();
			jQuery("#datesDiv").show();
			jQuery("#chart3").load("report/sales_audit.html");
			
		}else if(category=="booking_activity"){
			//showHideDateDivs();
			jQuery("#singleDate").show();
			jQuery("#chart3").load("report/booking_activity.html");
		}else if(category=="sales_ex_wise_spots"){
			showHideDateDivs();
			$("#months_div").show();
			console.log("start dat:::"+ $("#startDate").val())
			jQuery("#chart3").load("report/sales_ex_wise_spots_booked.html");
		}else if(category=="sales_ex_wise_revenue"){
			showHideDateDivs();
			$("#months_div").show();
			jQuery("#chart3").load("report/sales_ex_wise_revenue.html");
		}else if(category=="agency_wise_spots"){
			showHideDateDivs();
			$("#months_div").show();
			jQuery("#chart3").load("report/agency_wise_spots.html");
		}else if(category=="agency_wise_revenue"){
			showHideDateDivs();
			$("#months_div").show();
            jQuery("#chart3").load("report/agency_wise_revenue.html"); 
		}
		
}

