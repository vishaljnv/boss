
var bro_colsObj = {1: true, 2: true, 3: true, 4: true, 5: true, 6: true, 7: true, 8: true};

if(localStorage.getItem("bro_cols")){
	bro_colsObj = JSON.parse(localStorage.getItem("bro_cols"));
} else {
	localStorage.setItem("bro_cols", JSON.stringify(bro_colsObj) )
}

	var masterPrgmsArr = [], specialPrgmsArr = [];
	bro_loadMasterPrograms();
	bro_loadSpecialPrograms();
				
	var bulk_ro_tbl = $('#bulk_ro_tbl').dataTable({
		"paging": false,
		"bSort":false,
		"bInfo": false,
		"searching": false,
        "columns": [
        	{"width": "18%", "visible": true},
        	{"width": "15%", "visible": bro_colsObj[1] },
        	{"width": "6%", "visible": bro_colsObj[3] },
        	{"width": "10%", "visible": bro_colsObj[4] },
        	{"width": "10%", "visible": bro_colsObj[5] },
        	{"width": "8%", "visible": bro_colsObj[6] },
        	{"width": "8%", "visible": bro_colsObj[7] },
        	{"width": "10%", "visible": bro_colsObj[8] },
        	{"width": "10%", "visible": bro_colsObj[9] },
        	{"width": "8%", "visible": true},
        ],
        dom: 'Bfrtip',
        buttons: [
        	{
            	extend: 'colvis',
            	columns: '1, 2, 3, 4, 5, 6, 7, 8',
            }
        ],
	});

	$('#bulk_ro_tbl').on('column-visibility.dt', function(e, settings, column, state ){
		bro_colsObj[column] = state;
		localStorage.setItem("bro_cols", JSON.stringify(bro_colsObj) );
	});

	bro_loadBulkRo();

	function bro_loadBulkRo(){
		$.ajax({
			url:'bulk_ro?channel_id='+$("#channel").val(),
			method: 'GET',
			success:function(data){
				bro_buildRows(data)
			},
			error: function(error){
				comm_handleAjaxError(error);
			}
		});
	}

	var broObjMap = {};
	function bro_buildRows(data){
		bulk_ro_tbl.fnClearTable();

		if(data.bulk_orders.length){
			var bulkOrders = data.bulk_orders;
			for(var i=0; i<bulkOrders.length; i++){
				var item = bulkOrders[i];

				var clientStr = "<a data-action='view' id='v_"+item._id+"' title='View Bulk RO details' style='cursor:pointer;'>"
       	   							+item.client_name
       	   						 +"</a>";

				var actionStr = "<a data-action='edit' id='e_"+item._id+"' title='Edit Bulk RO' style='cursor:pointer;font-size:16px;'>"
       	   							+"<i class='fa fa-edit'></i>"
       	   						 +"</a>"
       	   						 +"<a data-action='delete' id='d_"+item._id+"' title='Delete Bulk RO' style='cursor:pointer;margin-left:20px;font-size:16px;'>"
       	   							+"<i class='fa fa-trash text-danger'></i>"
       	   						 +"</a>";

       	   		var agency = "", agency_commission = "";
       	   		if('agency_name' in item){
       	   			agency = item.agency_name;
       	   		}
       	   		if("agency_commission" in item){
       	   			agency_commission = item.agency_commission;
       	   		}
       	   		
				bulk_ro_tbl.fnAddData([clientStr, agency , agency_commission , item.iro_number, item.ro_number, item.bill_to, item.bill_according_to, item.fct_details.total, item.rate_details.amount_payable, actionStr]);

				broObjMap[item._id] = item;
			}
		}
	}

	$('#bulk_ro_tbl').on("click","a",function(event){  		    
	    var order_id = $(this).attr('id').split('_')[1];
	    var da = $(this).attr('data-action');
	    if (da == 'view'){

	    	var w = $(window).width();
	    	var h = $(window).height()-50;

	    	$('#bro-view').dialog({
				width:w,
				height:h,
				modal:true,
				title:"Bulk RO Details",
				autoOpen:false,
				close:function() {
					console.log("CLOSE.....");
					$("#bro_title, #bulk_ro_tbl, .bro_input_row, #btns_wrapper_div, .action_col").show();
					$("#bro_sign_tbl").hide();
					$("#bulk_ro_form_wrapper input, #bulk_ro_form_wrapper select").removeAttr("disabled");
					
					$("#bro_print").hide();
					$(".view_sel, .table_header_icon, .bro_mandatory_icon").show();
					$(".print_sel").hide();
				}
			});

	    	var item = broObjMap[order_id];
	    	if( !$.isEmptyObject(item) ){
		    	$("#bro-view").load("bulkRO/bulk_ro_form.html", function(){
		    		bro_fillInputValues(item);

		    		$("#bro_title, #bulk_ro_tbl, .bro_input_row, #btns_wrapper_div, .action_col, .table_header_icon, .bro_mandatory_icon").hide();
					$("#bulk_ro_form_wrapper input, #bulk_ro_form_wrapper select").attr("disabled", "disabled");
					
					$("#print_bill_to").html($("#bro_bill_to option:selected").text());
					$("#print_bill_according_to").html($("#bro_bill_according_to option:selected").text());
					$("#print_prgm_gen_from").html($("#bro_prgm_gen_from option:selected").text());

					$(".view_sel").hide();
					$(".print_sel").show();

					$("#bro_print").show();
		  	        $("#bro-view").dialog("open");

		        });
		    } else {
		    	console.log("Empty bro object to view ...");
		    }
	    }
	    if (da == 'edit'){
	    	var item = broObjMap[order_id];
	    	if( !$.isEmptyObject(item) ){
		    	$('#main').load("bulkRO/bulk_ro_form.html", function(){
		    		$("#bro_print").hide();
		    		$("#bro_header_context").html("Edit");
		    		bro_fillInputValues(item);
		    		$(".bro_prgm_clip").show();
		    	});
		    } else {
		    	console.log("Empty bro object ...");
		    }

	    }
	    if (da == 'delete'){
	    	jConfirm('Do you want to delete this Bulk RO Entry ?', 'Bulk RO', function(response) {
				if(response){
					delete_bulkRo(order_id);
				}
			});
	    }
	});

	function delete_bulkRo(objId){
		$.ajax({
			url : "bulk_ro/"+objId,
			type : "DELETE",
			success: function(data) {
				console.log("Successfully Deleted BULK RO Entry.....");
				$('#main').load("bulkRO/bulk_ro_list.html");
			},
			error: function(error){
				comm_handleAjaxError(error);
			}
		});
	}
