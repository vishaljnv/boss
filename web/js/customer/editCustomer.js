jQuery(function() {
	//This is the workaround dirty fix for @select scala scode (dropdownlists)	as the auto-generated label can't be easily styled
	var mandatory=" <span style='color:red'>*</span>";
	var productType = jQuery('label[for="productType_id"]');
	productType.text(productType.text()).append(mandatory);
	
	var company = jQuery('label[for="company"]');
	company.text(company.text()).append(mandatory);
	
	var contactPerson = jQuery('label[for="contactPerson"]');
	contactPerson.text(contactPerson.text()).append(mandatory);
	
	var telephone = jQuery('#customer_edit_form label[for="telephone"]');
	telephone.text(telephone.text()).append(mandatory);
});

jQuery.validator.addMethod("regex", function(value, element, param) { 
	return value.match(new RegExp("^" + param + "$")); 
},"Alphabets only");
var ALPHA_REGEX = "[a-zA-Z]*";

var commId = '';
/*Customer edit and add*/
jQuery("#customer_edit_form").validate({
	//The errorPlacement doesn't append the error placement <label> tag. 
	onkeyup: false,
	errorClass: 'error',
    validClass: 'valid',
	//The errorPlacement doesn't append the error placement <label> tag. 
	errorPlacement: function(error, element) { 
		 // Set positioning based on the elements position in the form
        var elem = $(element),
            corners = ['right center', 'left center'],
            flipIt = elem.parents('span.right').length > 0;

        // Check we have a valid error message
        if (!error.is(':empty')) {
            // Apply the tooltip only if it isn't valid
            elem.filter(':not(.valid)').qtip({
                overwrite: false,
                content: error,
                position: {
                    my: corners[flipIt ? 0 : 1],
                    at: corners[flipIt ? 1 : 0],
                    viewport: $(window)
                },
                show: {
                    event: 'click mouseenter',
                    ready: true
                },
                hide: {
                	event: 'unfocus'
                },
                events: {
                    hide: function(event, api) {
                    	$(this).qtip('destroy');
                    }
                },
                style: {
                    classes: 'qtip-red' // Make it red... the classic error colour!
                }
            }) // If we have a tooltip on this element already, just update its content
            .qtip('option', 'content.text', error);
        } // If the error is empty, remove the qTip
        else {
            elem.qtip('destroy');
        }
	},
	success: function(error) {
        // Hide tooltips on valid elements
        setTimeout(function() {
        	jQuery("#customer_add_form").find('.valid').qtip('hide');
        }, 1);
        
        //success: $.noop // Odd workaround for errorPlacement not firing!
    },
	submitHandler: function(form_obj) {
		var form = jQuery('#customer_edit_form');
		var id = document.getElementById('id').value;
		
		
		$('#thumbnailVideo ul li').each(function(){
			commId += $(this).attr('id').split('_')[1] + ",";
		});
		//console.log("commId: "+commId);
		if(commId) {
			commId = commId.substring(0,commId.length-1);
			$('#commercialId').val(commId);
			//console.log("commId again"+commId);
		}
		
		jQuery.ajax({
			type: "POST",
			url: "/customer/"+id+"/update",
			data: form.serialize(),
			beforeSend: function() {
				$('#editCustomer').attr('disabled', 'disabled');
				$('#editCustomer').text('processing...');
			},
			success: function(data) {
				jQuery('#main').html(data);
				$('#editCustomer').removeAttr('disabled');
			},
			error: function() {
				alert("Error in request...");
			}
		});
	},
	rules: {
		company: {
			required: true,
			/*"remote": {
				type: "post",
				url: "/customer/1/validate",
				data: {
					company: function() {
						var dataString = jQuery("#id").val()+"&"+jQuery("#company").val();
						return dataString;
					}
				}
			}*/
		},
		email: {
			required: false,
			email: true
		},
		telephone: {
			//required: true,
			number: true,
			//minlength:10,
			//maxlength:15
		},
		"productType.id" : {required: true},
		contactPerson:{required: true,validateName:true}
	},
	messages: {
		company: {
			required: "Please enter company name.",
			remote:"Name already exists."
		},
		contactPerson:{required:"Please enter contact name"},
		telephone: "Numbers only (min:10 max:15 digits)",
	    "productType.id": "Select Product type"
	}
});

jQuery.validator.messages.required = "";
jQuery("#customer_edit_form").validate();


/*Modal window related to add new agency and add new sales*/

jQuery.validator.addMethod("customFloat", function(value, element) {
	//var RE = ^\d*\.?\d{0,2}$/;
	 var RE = /^\d*\.?\d*$/;
   	if(RE.test(value)){
   		return true;
    }
   	else{
    	return false;
    }
}, "Value should be numeric"); 

jQuery(".cancelbutton").click(function() {
	jQuery.ajax({
		
		url: "/customer/customer_list.html",
		success: function(data) {
			jQuery('#main').html(data);
		}
	});
});