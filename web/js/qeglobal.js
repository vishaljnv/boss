/**
 * 
 */

/**
 * home page funcions
 */

jQuery(function() {
	  jQuery('div.tabmenu > ul > li').click(function(obj){        	
      	jQuery('div.tabmenu > ul > li.current').removeClass('current');
      	jQuery(this).addClass('current');
      });
//			jQuery.ajax({
//				url : "/getCount",
//				type : 'GET',
//				success : function(data) {
//					/*var strProg = "Program("+data.progCount+")";
//					var strUser = "Customer("+data.customerCount+")";
//					var strContract = "Contract("+data.contractCount+")";*/
//					
//					var strProg = "Program(1)";
//					var strUser = "Customer(2)";
//					var strOrder = "Contract(3)";
//					
//					jQuery('ul.widgetlist li a span#programSpan').text(strProg);
//					jQuery('ul.widgetlist li a span#userSpan').text(strUser);
//					jQuery('ul.widgetlist li a span#orderSpan').text(strOrder);
//					jQuery('#main').html(data);
//				}
//			});
			
			 jQuery('div.sidebar').on("click","li",function(event){ 
		        	var id =jQuery(this).find('a').attr('id');
//		        	 var tabMenu= jQuery(this).find('a').attr('name');
		        	 var listMenu=jQuery(this).find('a').attr('accesskey');
		        	jQuery('div.sidebar li.current').removeClass('current');        	
		        	jQuery(this).addClass('current');   
		        	if(id=='sidebar_dashboard')
		        	{
		        		jQuery.ajax({url:listMenu,success:function(data){jQuery('#main').html(data);}});
//		        		 jQuery('.tabmenu').html("");
		        	}
		        	else
		        	{
//		        			jQuery.ajax({url:tabMenu,success:function(data){jQuery('.tabmenu').html(data);}});
		              		jQuery.ajax({url:listMenu,success:function(data){jQuery('#main').html(data);}});
		        	}
		     });
	});