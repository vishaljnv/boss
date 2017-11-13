

inv_loadMasterPrograms();
inv_loadCustomers();
inv_loadAgencies();
inv_loadAdvtTypes();

$("#inv_start_time").timepicker({ 'timeFormat': 'H:i:s','scrollDefaultNow': true, 'minTime':'00:10:00','step': 10});
$("#inv_end_time").timepicker({ 'timeFormat': 'H:i:s','scrollDefaultNow': true, 'minTime':'00:10:00','step': 10});

$("#inv_customer_filter").on('keydown', function(){
    $("#inv_customer_id").val('');
});

$("#inv_customer_filter").focusout(function(){
    var custId = $("#inv_customer_id").val();
    var custStr = $("#inv_customer_filter").val();
    custStr = custStr.trim();

    if(!custId && custStr){
        if( !$.isEmptyObject(invCustMap) ){
            for(key in invCustMap){
                var name = invCustMap[key];
                if ( name.toUpperCase() === custStr.toUpperCase() ) {
                    $("#inv_customer_id").val(key);
                    return;
                }   
            }
        }
    }
});

$("#inv_agency_filter").on('keydown', function(){
    $("#inv_agency_id").val('');
});

$("#inv_agency_filter").focusout(function(){
    var agencyId = $("#inv_agency_id").val();
    var agencyStr = $("#inv_agency_filter").val();
    agencyStr = agencyStr.trim();

    if(!agencyId && invAgencyMap){
        if( !$.isEmptyObject(invAgencyMap) ){
            for(key in invAgencyMap){
                var name = invAgencyMap[key];
                if ( name.toUpperCase() === agencyStr.toUpperCase() ) {
                    $("#inv_agency_id").val(key);
                    return;
                }   
            }
        }
    }
});

function inv_loadAdvtTypes(){
    var channel = $("#channel").val();
    if(!channel){
        return;
    }
    $("#inv_advt_type").html("");
    var url =  '/advertisement_types?"channel_id":"'+channel;
    $.ajax({
        dataType: 'JSON',
        url: url,
        success: function(data) {
            if(data.ad_types){
                var advtList = data.ad_types;
                var optionStr = '';
                for(var i=0; i<advtList.length; i++){
                    var item = advtList[i];
                    if( item.schedule_type != "off" ){
                        optionStr += '<option value="'+item._id+'"> '+item.name+' </option>';
                    }
                }
                $("#inv_advt_type").html(optionStr);
                getInventory();
            }
        }, 
        error: function(data) {
            comm_handleAjaxError(data);
        }
    });
}


function inv_showHideFields(){
    var type = $("#inv_filter_type").val();
    $(".inv_filter_field").hide();

    switch(type){
        case "prime_non_prime": 
                $(".inv_prime_non_prime").show();
                break;
        case "program":
                $(".inv_programs").show();
                break;
        case "timeband":
                $(".inv_timeband").show();
                break;
        case "customer":
                $(".inv_customer").show();
                break;
        case "agency":
                $(".inv_agency").show();
                break;
    }
}

function inv_loadMasterPrograms(){
    var invMasterPrgmsArr = [];
    var channel = $("#channel").val();
    if(!channel){
            return;
    }

    var url =  '/master-programs?channel_id='+channel;
    $.ajax({
        dataType: 'JSON',
        url: url,
        success: function(data) {
            invMasterPrgmsArr = [];
            invMasterPrgmsArr = data["master-programs"];
            $("#inv_programs").html("");
        
            if(invMasterPrgmsArr.length){
                $("#inv_programs").html("");
                var prgmStr = '<option value="-1">Select Program</option>';
                for(var i=0; i< invMasterPrgmsArr.length; i++){
                    var item = invMasterPrgmsArr[i];
                    prgmStr += '<option value="'+item._id+'">'+item.program_name+'</option>';
                }
                $("#inv_programs").html(prgmStr);
            }
        },
        error: function(data) {
                invMasterPrgmsArr = [];
                comm_handleAjaxError(data);
        }
    });
}


var invAgencyArr = [], agencyList = [], invAgencyMap = {};
function inv_loadAgencies(){
  url = '/agencies?channel_id='+channel;

  invAgencyArr = [];
  $.ajax({
        dataType: "json",
        url: url,
        success: function( result) {
            agencyList = [];
            invAgencyMap = {};

            if(result.agencies == undefined){
                return;
            } else {
                agencyList = result.agencies;
            }
        
            for(var j=0;j<agencyList.length;j++){
                var name = agencyList[j].name, id = agencyList[j]._id;

                invAgencyArr.push({"label": name.toUpperCase(), "value": id });
                invAgencyMap[id] = name;
            }

            // Autocomplete initialization
            $("#inv_agency_filter").autocomplete({
                minLength:0,
                source: function( request, response ) {
                    var matches = [];   
                    for(var i=0; i<invAgencyArr.length; i++){
                        var item = invAgencyArr[i];
                        var name = item.label;
                        if ( name.toUpperCase().indexOf(request.term.toUpperCase()) === 0 ) {
                            matches.push(item);
                        }
                    }
                    if(request.term == ""){
                        matches = invAgencyArr;
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
                    $("#inv_agency_id").val(ui.item.value);
                }
            });

            $("#inv_agency_filter").unbind("click");
            $("#inv_agency_filter").on("click, focus", function(){
                if($("#inv_agency_filter").val() == ""){
                    $("#inv_agency_filter").autocomplete("search", "");
                }
            });

        },
        error: function(xhr, status, text) {
            comm_handleAjaxError(xhr);
        }
    });
}


var invCustArr = [], cust = [], invCustMap = {};
function inv_loadCustomers(){

    $.ajax({
        dataType: "json",
        url: 'customers?status=active&channel_id='+channel,
        success: function(result) {
            invCustArr = [], invCustMap = {};
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

                for(var i=0; i<cust.length; i++){
                    invCustArr.push({"label": cust[i].name.toUpperCase(), "value": cust[i]._id });
                    invCustMap[cust[i]._id] = cust[i].name;
                }
                inv_initCustAutocomplete();
            }

        },
        error: function(xhr, status, text) {
            comm_handleAjaxError(xhr);
        } 
    });
}

function inv_initCustAutocomplete(){
    $("#inv_customer_filter").autocomplete({
        minLength: 0,
        source: function( request, response ) {
            var matches = [];   
            for(var i=0; i<invCustArr.length; i++){
                var item = invCustArr[i];
                var name = item.label;
                if ( name.toUpperCase().indexOf(request.term.toUpperCase()) === 0 ) {
                    matches.push(item);
                }
            }

            if(request.term == ""){
                matches = invCustArr;
            }

            response(matches);
        },
        focus: function(event, ui) {
            event.preventDefault();
            $(this).val(ui.item.label);
            console.log("focus");
        },
        select: function(event, ui) {
            event.preventDefault();
            $(this).val(ui.item.label);
            $("#inv_customer_id").val(ui.item.value);

            var customerId = $('#inv_customer_id').val();

            if(customerId!="" && customerId!="0"){
                // load_agencies();
                console.log("valid cust...");
            }else{
                jAlert("Please select a customer");
            }
            return;
        }
    });
    
    $("#inv_customer_filter").unbind("click");
    $("#inv_customer_filter").on("click, focus", function(){
        if($("#inv_customer_filter").val() == ""){
            $("#inv_customer_filter").autocomplete("search", "");
        }
    });
}


$("#get_inventory").click(function(){
    getInventory();
});

// $(function(){
//     getInventory();
// });

function getInventory(){
    var type = $("#inv_filter_type").val();
    var s = {};
    console.log("type: "+type);

    // switch(type){
    //     case "prime_non_prime": 
    //         var pnp = $("#inv_prime_non_prime").val();
    //         s["prime_non_prime"] = pnp;
    //         break;
    //     case "program":
    //         var prgm_id = $("#inv_programs").val();
    //         if(prgm_id != -1){
    //             s["program_id"] = prgm_id;
    //         }
    //         break;
    //     case "timeband":
    //         var tb_start = $("#inv_start_time").val();
    //         var tb_end = $("#inv_end_time").val();
    //         s["start_time"] = tb_start;
    //         s["end_time"] = tb_end;
    //         break;
    //     case "customer":
    //         var cust_id = $("#inv_customer_id").val();
    //         if(cust_id){
    //             s["customer_id"] = cust_id;
    //         }
    //         break;
    //     case "agency":
    //         var agency_id = $("#inv_agency_id").val();
    //         if(agency_id){
    //             s["agency_id"] = agency_id;
    //         }
    //         break;
    // }

    var value_type = $("#inv_advt_type option:selected").text();
    var url = "bro_inventory?category="+type+"&ad_type="+value_type;

    console.log(url);
    $("#inventory_tbl tbody").html("");

    $.ajax({
        url : url,
        type : "GET",
        success: function(data) {
            var monthArr = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
            var dataObj = {};
            for(var type in data){
                if(data[type] != null && data[type] != undefined && !$.isEmptyObject(data[type]) ){
                    var wrapperObj = data[type];

                    for(var key in wrapperObj ){
                        if(wrapperObj[key] != undefined && wrapperObj[key] != null && !$.isEmptyObject(wrapperObj[key]) ) {
                            dataObj = wrapperObj[key];

                        }
                    }

                    console.log(dataObj);

                    if( !$.isEmptyObject(dataObj) ){
                        var rowStr = "";
                        for(var key in dataObj){
                            var item = dataObj[key];
                            if( !$.isEmptyObject(item) ){

                                rowStr += '<tr><td>'+key+'</td>';
                                for(var i=0; i<monthArr.length; i++){
                                    var month = monthArr[i];
                                    var value = item[month].available;
                                    if(value){
                                        rowStr += '<td class="available_month">FREE</td>';
                                    } else {
                                        rowStr += '<td class="non_available_month">ALLOCATED</td>';
                                    }
                                }

                                rowStr += "</tr>";
                            } else {
                               rowStr += '<tr><td>'+key+'</td>';
                                for(var i=0; i<monthArr.length; i++){
                                    rowStr += '<td class="available_month">FREE</td>';
                                } 
                                rowStr += "</tr>";
                            }
                        }
                    }
                    $("#inventory_tbl tbody").html(rowStr);
                }
            }
        },
        error: function(error){
         comm_handleAjaxError(error);
        }
    });
}

