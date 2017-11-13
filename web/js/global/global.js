<div id="dialog-confirm"><div>

jQuery("#dialog-confirm").dialog({
 resizable: false,
  autoOpen: false,
height:140,
modal: true,
buttons: {
	'Delete all items': function() {
		jQuery(this).dialog('close');
},
Cancel: function() {
	jQuery(this).dialog('close');
}

} });


