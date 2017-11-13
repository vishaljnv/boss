
function get_user_privileges(){
	var modules = [];
	$('.modules input[type=checkbox]:not(".subModules")').each(function () {
       if (this.checked) {
           modules.push($(this).val());
       }
	});

	crud_oper = {};
	if(modules.length){
		var invoiceOptions = [];
		if( modules.indexOf("Invoice") != -1 ){
			if( $("#Invoice_Edit").is(":checked") ){
				invoiceOptions.push("Edit");
			}
			if( $("#Invoice_View").is(":checked") ){
				invoiceOptions.push("View");
			}
			if( $("#Invoice_sync").is(":checked") ){
				invoiceOptions.push("sync");
			}
			if( $("#Invoice_Delete").is(":checked") ){
				invoiceOptions.push("Delete");
			}
			if(invoiceOptions.length){
				crud_oper["invoice"] = [];
				crud_oper["invoice"] = invoiceOptions;
			}
		}
		var OrderOptions = [];
		if( modules.indexOf("Orders") != -1 ){
			if( $("#Order_Edit").is(":checked") ){
				OrderOptions.push("Edit");
			}
			if( $("#Order_View").is(":checked") ){
				OrderOptions.push("View");
			}
			if( $("#Order_Add").is(":checked") ){
				OrderOptions.push("Add");
			}
			if( $("#Order_Delete").is(":checked") ){
				OrderOptions.push("Delete");
			}
			if( $("#Order_sync").is(":checked") ){
						OrderOptions.push("sync");
			}
			if( $("#Order_sync_all_ro").is(":checked") ){
				OrderOptions.push("sync_all");
			}
			if( $("#Order_spot_edit").is(":checked") ){
				OrderOptions.push("spot_edit");
			}
			if(OrderOptions.length){
				crud_oper["orders"] = [];
				crud_oper["orders"] = OrderOptions;
			}
		}


		var customer_options = []
		if( modules.indexOf("Customers") != -1 ){
			
           if( $("#customer_sync").is(":checked") ){
				customer_options.push("sync");
			} 
			if(customer_options.length){
			    crud_oper["customers"] = customer_options;
		    }
		}
		var agency_options = []
		if( modules.indexOf("Agency") != -1 ){
			agency_options = []
           if( $("#agency_sync").is(":checked") ){
				agency_options.push("sync");
			}
			if(agency_options.length) {
				crud_oper["agency"] = agency_options;
			}
		}
		var settings_options = []
		if( modules.indexOf("Settings") != -1 ){
			settings_options = []
           if( $("#user_sync").is(":checked") ){
				settings_options.push("user_sync");
			} 
			if(settings_options.length) {
				crud_oper["settings"] = settings_options;
			}
		}

	}

    var usr_priv = {}
    usr_priv['modules'] = modules
    usr_priv['actions'] = crud_oper
	return usr_priv
}