/*append new option on load to drop down menu related to customer agency and sales*/
jQuery.validator.addMethod("regex", function(value, element, param) { 
	return value.match(new RegExp("^" + param + "$")); 
},"Alphabets only");
var ALPHA_REGEX = "[a-zA-Z]*";
/*Form Submission and validation for adding customer*/
jQuery("#customer_add_form").validate({
	errorClass: 'error',
    validClass: 'valid',
	//The errorPlacement doesn't append the error placement <label> tag. 
	errorPlacement: function(error, element) { 
		console.log("2");
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
	success: function(error) {		// Hide tooltips on valid elements
        setTimeout(function() {jQuery("#customer_add_form").find('.valid').qtip('hide');
        }, 1);     
        
    },	
	onkeyup: false,
	rules: {
		/*company: {
			required: true,
			"remote": {
				type: "post",
				url: "/customer/0/validate",
				data: {
					company: function() {
						var dataString = "0&"+jQuery("#company").val();
						return dataString;
					}
				}
			}
		},*/
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
	/*	pan_no:{
		required: true,	
		},
		ser_tax_no:{
			required: true,
		},*/
		
		//contactPerson:{required:true}
		/*pan_no:{required:true},
		ser_tax_no:{required:true}*/
	},
	messages: {
		company: {
			required: "Please enter company name.",
			remote:"Name already exists."
		},
		//contactPerson:{required:"Please enter contact name"},
	    telephone: "Please enter valid telephone number",
	    
	 /*   pan_no:"Please enter PAN num",
	    ser_tax_no:"Please enter service tax number"*/
	}
});

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

/*Cancel Button Redirect for customer add*/
