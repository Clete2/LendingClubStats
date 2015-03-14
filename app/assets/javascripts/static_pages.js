//= require jquery
//= require bootstrap
//= require amcharts/amcharts
//= require amcharts/serial
//= require datatables

clearCookies = function() {
    $.ajax({
        url: 'delete_cookies',
        type: 'POST'
    });

    $("#complete").addClass("hide");
}

var apiVersion = "v1";
var baseURL = "https://api.lendingclub.com/api/investor/" + apiVersion;

setCookies = function () {
    var accountNumber = $("#accountNumber").val();
    var apiKey = $("#apiKey").val();

    $.ajax({
        url: 'set_cookies',
        type: 'POST',
        data: {'api_key': apiKey, 'account_number': accountNumber}
    });

    $("#complete").removeClass("hide");
};