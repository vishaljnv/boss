
var jQuery=jQuery;
var labelsList = [];
var labelsMapObj = {};
var channelConfigObj = {};
var INVOICE_FILE_NAME = "invoice_volume_vrl.html"
var CHANNEL_TYPE = "vrl";

loadLabels();
loadLabelsValues();

function ajaxindicatorstart(text){
	if($('body').find('#resultLoading').attr('id') != 'resultLoading'){
		$('body').append('<div id="resultLoading" style="display:none"><div><img src="/images/loaders/loader10.gif"><div>'+text+'</div></div><div class="bg"></div></div>');
	}

	$('#resultLoading').css({
		'width':'100%',
		'height':'100%',
		'position':'fixed',
		'z-index':'10000000',
		'top':'0',
		'left':'0',
		'right':'0',
		'bottom':'0',
		'margin':'auto',
		'color':'#265e84'
	});

	$('#resultLoading .bg').css({
		'background':'#000000',
		'opacity':'0.7',
		'width':'100%',
		'height':'100%',
		'position':'absolute',
		'top':'0'
	});

	$('#resultLoading>div:first').css({
		'width': '250px',
		'height':'75px',
		'text-align': 'center',
		'position': 'fixed',
		'top':'0',
		'left':'0',
		'right':'0',
		'bottom':'0',
		'margin':'auto',
		'font-size':'16px',
		'z-index':'10',
		'color':'#ffffff'

	});

	$('#resultLoading .bg').height('100%');
	$('#resultLoading').show();
	$('body').css('cursor', 'wait');
}

function ajaxindicatorstop(){
	$('#resultLoading .bg').height('100%');
	$('#resultLoading').fadeOut();
	$('body').css('cursor', 'default');
}

$(document).ajaxStart(function () {
	//show ajax indicator
	ajaxindicatorstart('Loading...');
}).ajaxStop(function () {
	//hide ajax indicator
	ajaxindicatorstop();
});

//onclick logged in user name.
function accountInfo(){
	var id = $("#user_id").val();
	$.ajax({
		url : "users/"+id,
		success : function(data) {
			
		},
		error: function(xhr, status, text) {
			handleAjaxError(xhr);
		}
	});
}


		
	
function loadLabels(){
    $.getJSON( "data/labels.json", function( data ) {
    	labelsList = data.labels;
    });
} 

function loadLabelsValues(){
    $.ajax({
        url : "labels",
        type : 'GET',
        dataType : "json",
        success: function(data) {
            if(data != undefined && data != null){
                labelsMapObj = data;
            }
        },
        error: function(xhr, status, text) {
            comm_handleAjaxError(xhr);
        }
    });
}


function updateClock(){
	var now = moment().format('MMMM Do YYYY, h:mm:ss a');
	$('#clock').html(now);
}

function getCurrentDate() {
    return moment().format("YYYY-MM-DD");
}
		        
function addSidebar(){
	NS_PRIVILEGES.addMenu('<li class="side_menu programs"><a id="sidebar_program" class="cPrograms" name="/programs/tabmenu" accesskey="/program/'+getCurrentDate()+'/list">Programs</a></li>',5,'mainmenuidentifier');
	NS_PRIVILEGES.addMenu('<li class="side_menu orders"><a id="sidebar_contracts" class="cOrders" name="/order/tabmenu" accesskey="/order/listOrderItems">Orders</a></li>',3,'mainmenuidentifier');
	NS_PRIVILEGES.addMenu('<li class="side_menu logs"><a id="sidebar_logs" class="cLogs" name="/log/tabmenu" accesskey="/log/'+getCurrentDate()+'/prelogdisplay">Logs</a></li>',6,'mainmenuidentifier');
	NS_PRIVILEGES.addMenu('<li class="side_menu reports"><a id="sidebar_statistics" class="cReports" name="/statistics/tabmenu" accesskey="report/report_list.html">Reports</a></li>',7,'mainmenuidentifier');
	NS_PRIVILEGES.addMenu('<li class="side_menu customers"><a id="sidebar_customer" class="cCustomers" name="/customers/tabmenu" accesskey="/customers/0/list">Customers</a></li>',2,'mainmenuidentifier');
	NS_PRIVILEGES.addMenu('<li class="side_menu agency"><a id="sidebar_agency" class="cAgency" name="/agency/tabmenu" accesskey="/agency/0/list">Agency</a></li>',1,'mainmenuidentifier');
	NS_PRIVILEGES.addMenu('<li class="side_menu commercials"><a id="sidebar_commercials" class="cCommercials" name="/commercials/commercials_tab" accesskey="/commercials/list">Commercials</a></li>',4,'mainmenuidentifier');
	NS_PRIVILEGES.addMenu('<li class="side_menu settings"><a id="sidebar_settings" class="cSettings"  accesskey="/settings/menu">Settings</a></li>',8,'mainmenuidentifier');
	NS_PRIVILEGES.addMenu('<li class="side_menu audit_trail"><a id="sidebar_settings" class="cSettings"  accesskey="/settings/user_audit_trail.html">Audit Trail</a></li>',8,'mainmenuidentifier');
} 



 function update_current_channel(){
    	var value = {}
    	var cur_channel = $("#channel").val()
    	if(cur_channel){
	    	value['current_channel'] = cur_channel
		   	$.ajax({
				dataType: "json",
				type:"PUT",
				data : JSON.stringify(value),
				url: "/sessions/mine",
				success: function (data) {
				}
			})
	   }
    }

// DOCUMENT READY starts.

$(document).ready(function(){
	

	//to show/hide "scroll to top" button based on scroll position of content wrapper.
    $(".maincontent_inner").scroll(function(){
    	console.log("scroll")
        if ($(this).scrollTop() > 100) {
            $('.scrollToTop').fadeIn();
        } else {
            $('.scrollToTop').fadeOut();
        }
    });
    
    //Click event to scroll to top
    $('.scrollToTop').click(function(e){
        $(".maincontent_inner").animate({scrollTop : 0},300);
        return false;
    });

	$("#main_sidebar").slimscroll({
        height: ($(window).height() - 90) + "px",
        color: "#333",
        size: "3px"
      });

	//to set scrollbar to inner content, instaed of whole page.
	var h = $(window).height() - 70;
	$(".maincontent_inner").css({"max-height": h+"px", "overflow": "auto"});
	
    user_type = sessionStorage.getItem("user_type");
   
	$.removeCookie("landing_page", null, {path: '/' });
	$.ajaxSetup({
		global:false,
		cache: false
	});
	
	$.ajax({
		dataType: "json",
		url: "/sessions/mine",
		async:false,
		success: function (data) {
			if(data!=null && data.users!=null){
			channels = [];
	    	channels =  data.users.channel_list;
	    	//console.log("here"+JSON.stringify(channels));
	    	console.log("user_id: "+data.users['_id']);
	    	//sessionStorage.setItem("user_id", data.users['_id']);
	    	$("#user_id").val(data.users['_id']);
	    	var channel_options = "";
	    	for(k=0;k<channels.length;k++){
	    		//console.log(channels[k]);
	    		if(channels[k]['name'].length>15){
	    			ch_name = channels[k]['name'].substring(0,15)+"...";
	    		}else{
	    			ch_name = channels[k]['name'];
	    		}
	    		ch_full_name = channels[k]['name'];
	    		ch_identity = channels[k]['channel_identity'];
	    		channel_options = channel_options + "<option title='"+ch_full_name+"' value='"+ch_identity+"'>"+ch_name+"</option>";
		    }
		    //console.log(channel_options);
		$("#channel").html(channel_options);

       


		if(user_type!=undefined && user_type != "Client") 
			$('#main').load("dashboard.html");
			 else if(user_type!=undefined && user_type=="Client"){ 
			 	console.log("CALLING CLIENT DASHBOARDDDDDDDDD")
			    $('#main').load("client_dashboard.html");	
			}else{
				  sessionStorage.setItem("client_id","" );
				  sessionStorage.setItem("user_type", "");
				  sessionStorage.setItem("user_id","");
				  window.location.href= "index.html";	
			}
		}
	  },
	  error: function(xhr, status, text) {
			comm_handleAjaxError(xhr);
	    }
	});
	showUsername();
	setInterval('updateClock()', 1000);
	checkSession();
	getVersion();
    
    load_channels();
	//load channel configurations.
	comm_loadChannelConfig();

   
	
	$("#channel").change(function(){
		$("#main").load("dashboard.html");
		$(".leftmenu .side_menu").removeClass("current");
		$(".leftmenu #menu_current").addClass("current");
		update_current_channel()
		//load channel configurations.
		comm_loadChannelConfig();
	});

	$(".side_menu").click(function(){
		var nav_falg = true;
		var liId = $(this).attr('id');
		var filePath = $("#"+liId+">a").attr('accesskey');
		var clazz = $("#"+liId+">a").attr("class");

		$.removeCookie("expiring_orders", null, {path: '/' });
		//resetting advance search path on click of left-side menu.
		$.cookie("orders_path", "");

		
		if (user_type != undefined && user_type == "Client"
		    && clazz=='cDashboard'){
			filePath = "client_dashboard.html"
		}
		if(!filePath || filePath == undefined || filePath == null){
			console.log("Invalid filePath");
			return;
		}
		
		var isNotRO = false;
		var isNotRO = confirm_page_nav();

        if(isNotRO){
        	console.log("not ro::::"+filePath)
        	$("#main").load(filePath);
            
            // for setting menu click, animate submenus.
			if(liId.replace("menu_", "") == "settings"){
				animateSettingSubMenu();
			}
	    }else{
	    	nav_falg = false;
	    	jConfirm('RO not saved...Do you want to navigate?', 'Order', function(response) {
		      	if(response){
				  $("#main").load(filePath);

				  if(liId.replace("menu_", "") == "settings"){
				     animateSettingSubMenu();
        			}

        			$('div.content ul li').removeClass('current');
			        $('div.content ul li.'+clazz).addClass('current');
			        $.removeCookie("landing_page", null, {path: '/' });
			    }
	       });
	    }

	   
	    console.log(clazz,nav_falg)
	    if(nav_falg && clazz != undefined){
			$('div.content ul li').removeClass('current');
			$('div.content ul li.'+clazz).addClass('current');
		}else{
			console.log("in else blk::::")
		}
		//to avoid default redirect/load of accesskey file to main div.
		return false;
	});

	$("#logout").click(function(){
		$.ajax({
			type:"DELETE",
			url:"sessions/mine",
			success:function(data){
				sessionStorage.setItem("client_id","" );
				sessionStorage.setItem("user_type", "");
				sessionStorage.setItem("user_id","");
				window.location.href= "index.html";
			},
			error: function(xhr, status, text) {
				comm_handleAjaxError(xhr);
			}
		});
	});

	function animateSettingSubMenu(){
		if(!$(".sub_menus").is(":visible")){
			$(".sub_menus").slideDown(300);
			$(".helper-icons").removeClass("fa-angle-double-down");
			$(".helper-icons").addClass("fa-angle-double-up");
		} else {
			$(".sub_menus").slideUp(300);
			$(".helper-icons").removeClass("fa-angle-double-up");
			$(".helper-icons").addClass("fa-angle-double-down");
		}
	}

	$("#helpMenu").click(function(e){	
		 window.open('help/Start.html','_blank');
	});

	$("#notify").click(function(){
		$("#main").load("notification.html");
  
	});
	
	// $('#expiring').click(function(){   
 //        $('#main').load("order/ordersList.html");
 //     });

 //    $('#scheduled').click(function(){   
 //        $('#main').load("order/ordersList.html");
 //     });

 //    $('#allocated').click(function(){   
 //        $('#main').load("log/prelog_list.html");
 //     });

 //    $('#unallocated').click(function(){   
 //        $('#main').load("log/prelog_list.html");
 //     });

 //    $('#did_not_air_f').click(function(){   
 //        $('#main').load("report/report_list.html");
 //        $("#report-contanier").easytabs('select', '#recon_tab');
 //     });

 //    $('#run_with_d').click(function(){   
 //        $('#main').load("report/report_list.html");
 //        $("#report-contanier").easytabs('select', '#recon_tab');
 //     });

	$(".sub_menus.settings_sub_menu").click(function(event){
		var pageUrl = $(this).attr('data-url');
		if(pageUrl){
			var isNotRO = false;
			var isNotRO = confirm_page_nav();
			var nav_falg = true;
			var liId = $(this).attr('id');
			var clazz = $("#"+liId+">a").attr("class");

	        if(isNotRO){
				$('#main').html("");
				$('#main').load(pageUrl);
			} else{
		    	nav_falg = false;

		    	jConfirm('RO not saved...Do you want to navigate?', 'Order', function(response) {
		      	if(response){
				  $("#main").load(pageUrl);

        			$('div.content ul li').removeClass('current');
			        $('div.content ul li.'+clazz).addClass('current');
			        $.removeCookie("landing_page", null, {path: '/' });
			    }
	            });
		    }

			if(nav_falg){
				$('div.content ul li').removeClass('current');
				$('div.content ul li.settings').addClass('current');
			}
			
			//to remove click event handled somewhere for same class/list.
			event.stopImmediatePropagation();
		}

	});

	get_notify_count();

	function get_channel_inv_file(){
		var channel = $("#channel").val();
		$.ajax({
			url : "invoice_file_format?channel_id="+channel,
			success : function(data) {
				if(data){
					INVOICE_FILE_NAME = data;
				}
				console.log("INVOICE_FILE_NAME...."+INVOICE_FILE_NAME);
			},
			error: function(xhr, status, text) {

				INVOICE_FILE_NAME = "invoice_volume_vrl.html"
			}
		});
	}
	get_channel_inv_file();
});

