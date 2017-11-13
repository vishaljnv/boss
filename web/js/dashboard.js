
var yesterday_str = moment().subtract(1, 'days').format("DD MMMM");
var today_str = moment().format("DD MMMM");
var tomorrow_str = moment().add(1, 'days').format("DD MMMM");
var allocated = [], available = [], spots_dist = [];
var channel = $("#channel").val();

$(document).ready(function(){
    getDashboardData();

    $('#expiring').click(function(){  
        get_session_details(function(modules){

            if (modules && modules.indexOf("Orders") > -1) {
                $.cookie('expiring_orders','expiring_orders');
                //resetting advance search path on click of left-side menu.
                $.cookie("orders_path", "");
                $('#main').load("order/ordersList.html");
            }      
        });
    });
    $('#scheduled').click(function(){   
        get_session_details(function(modules){

            if (modules && modules.indexOf("Orders") > -1) {
                if ($(".dashboard").hasClass("tomorrow") == true){
                        var today = moment();
                        var tomorrow = today.add('days', 1);
                        var date = moment(tomorrow).format("DD/MM/YYYY");                       
                }
                else{
                    var today = moment();
                    var date = moment(today).format("DD/MM/YYYY");
                }
                $('#main').load("order/scheduled_orders_info.html",function(){
                    $("#sch_order_date").datepicker("setDate", date);
                    $.cookie("scheduled_orders_cookie",date);
                });
            }      
        });
     });

    $('#allocated').click(function(){  
        get_session_details(function(modules){

            if (modules && modules.indexOf("Logs") > -1) {
                $('#main').load("log/prelog_list.html");
            }      
        }); 
        
     });

    $('#unallocated').click(function(){   
        get_session_details(function(modules){

            if (modules && modules.indexOf("Logs") > -1) {
                $('#main').load("log/prelog_list.html");
            }      
        }); 
     });

    $('#did_not_air_f').click(function(){ 
        get_session_details(function(modules){

            if (modules && modules.indexOf("Reports") > -1) {
                if(modules.indexOf("Reconciliation") > -1){
                    $('#main').load("report/report_list.html",function(){
                        setTimeout(function(){
                            $("#recon_tab a").trigger("click");
                            $("#recon_filter").val("did_not_air");
                            getReconsReport("","did_not_air"),100
                        }, 100);
                         
                    });                    
                }
            }      
        });   

     });

    $('#run_with_d').click(function(){   
        get_session_details(function(modules){

            if (modules && modules.indexOf("Reports") > -1) {
                if(modules.indexOf("Reconciliation") > -1){
                    $('#main').load("report/report_list.html", function(){
                        setTimeout(function(){
                            $("#recon_tab a").trigger("click");
                            $("#recon_filter").val("run_with_discrepency");
                            getReconsReport("","run_with_discrepency");
                        },100);
                         
                     });
                }
            }      
        });        
     });

     $('#orders_for_day').click(function(){   
        get_session_details(function(modules){
            if (modules && modules.indexOf("Orders") > -1) {
                 if ($(".dashboard").hasClass("tomorrow") == true){
                        var today = moment();
                        var tomorrow = today.add('days', 1);
                        var date = moment(tomorrow).format("DD/MM/YYYY");                       
                }
                else{
                    var today = moment();
                    var date = moment(today).format("DD/MM/YYYY");
                }
                $('#main').load("order/orders_for_day.html", function(){
                    $("#order_date").datepicker("setDate", date);
                    $.cookie("orders_for_today_cookie",date);
                })
            }      
        });        
     });
});

function get_session_details(callback){
    if(sessionStorage.getItem("user_type")!=undefined && sessionStorage.getItem("user_type")!=null){
            user_type = sessionStorage.getItem("user_type"); 
            console.log("hhhhhhhhhhh"+JSON.stringify(user_type))
            $.ajax({
                url: "/security-roles/"+user_type,
                type:"GET",
                dataType:"json",
                success: function (data) {
                    sec_role = data['security-role_obj'];
                    modules = [];
                    modules = sec_role['modules']; 
                    console.log("modules",modules)
                    callback(modules);
                }
            });
        }
}
function checkUndefinedReturnZero(val){
    var returnVal = 0;
    if(val == undefined || val == null || !val || val < 0){
        returnVal = 0;
    } else {
        returnVal = val;
    }
    return returnVal;
}
	
function getDashboardData(){
	 $.ajax({
		type:"GET",
		async:false,
		url:"dashboard-data?channel_id="+channel,
		success:function(data){
            
			var dash_board_data = data['dashboard-data'];
            var exp_ords = 0, schd_ords = 0, alloc_spots = 0, unalloc_spots = 0, did_not_air = 0,run_with_disc = 0, spots_consumption = {};
            allocated = [], available = [], spots_dist = [];

            /*$(".today").text(today_str);
            $(".yesterday").text(yesterday_str);*/
            if(data["date_flag"]){
                $(".dashboard").addClass("tomorrow");
                $("#orders_for_day_").html("Tomorrow's Orders")
                $(".tomorrow").text("Tomorrow - "+tomorrow_str);
            }
            else{
                $(".dashboard").addClass("today");
                $("#orders_for_day_").html("Today's Orders")
                $(".today").text("Today - "+today_str);
            }
            $(".yesterday").text("Yesterday - "+yesterday_str);


            $("#expiring_orders").text( checkUndefinedReturnZero(dash_board_data['expiring_orders']) );
            $("#scheduled_orders").text( checkUndefinedReturnZero(dash_board_data['scheduled_orders']) );
            $("#allocated_spots").text( checkUndefinedReturnZero(dash_board_data['allocated_spots']) );
            $("#unallocated_spots").text( checkUndefinedReturnZero(dash_board_data['unallocated_spots']) );
            $("#did_not_air").text( checkUndefinedReturnZero(dash_board_data['did_not_air']) );
            $("#run_with_discrepency").text( checkUndefinedReturnZero(dash_board_data['run_with_discrepency']) );
            $("#orders_for_day_count").text(checkUndefinedReturnZero(dash_board_data['today_orders']))
            if(data['spots_consumption']!=undefined)
            	spots_consumption =  data['spots_consumption']
            if(spots_consumption['allocated']!=undefined) 
            	allocated = spots_consumption['allocated']
            if(spots_consumption['available']!=undefined)
            	available = spots_consumption['available']
            if(data['spots_distribution']!=undefined)
            	spots_dist = data['spots_distribution']
			
			//building charts after loading ajax data
			spotsconsumption(allocated,available);
			spotsDistribution(spots_dist);
		}
    });
}
	 
function spotsconsumption(allocated_list,available_list){
    var title = 'Available slots ' +' - ' +  '<span style="font-size:12px;">Tomorrow '+tomorrow_str+'</span>'
	$('#chart2').highcharts({
        chart: {
            type: 'bar'
        },
        title: {
            text: title
        },
        xAxis: {
            categories: ['00-06', '06-12', '12-18', '18-24']
        },
        yAxis: {
            min: 0,
            title: {
                text: 'Total duration'
            }
        },

        legend: {
            reversed: true
        },
        tooltip: {
            //valueSuffix: ' sec'
            formatter: function () {
                return  '[ ' + this.x +
                    ' ] <br><b>'+' ' + this.y.toLocaleString() + ' sec </b>';
            },
            valueDecimals: 2,
        },
        plotOptions: {
            series: {
                stacking: 'normal'
            }
        },
        series: [{
            name: 'Consumed',
            data: allocated_list
        },{
            name: 'Available',
            data: available_list
        }]
    });
    $("#chart2 text:last").css('display','none')
}
		
function spotsDistribution(spots_dist_list){
    var title = 'Spots Distribution ' +' - ' +  '<span style="font-size:12px;">Tomorrow '+tomorrow_str+'</span>'
	$('#donut').highcharts({
        chart: {
            type: 'pie',
            options3d: {
                enabled: true,
                alpha: 45
            }
        },
        title: {
            text: title
        },
        subtitle: {
            
        },
        plotOptions: {
            pie: {
                innerSize: 100,
                depth: 45
            }
        },
        series: [{
            name: 'Allocated spots',
             data :spots_dist_list 
        }]
    });
    $("#donut text:last").css('display','none')
}
