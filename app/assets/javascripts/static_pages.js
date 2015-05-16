function clearCookies() {
    $.ajax({
        url: 'delete_cookies',
        type: 'POST'
    });

    $("#complete").addClass("hide");
    $("#apiKey").attr("value", "");
    $("#accountNumber").attr("value", "");
}

var apiVersion = "v1";
var baseURL = "https://api.lendingclub.com/api/investor/" + apiVersion;

function setCookies() {
    var accountNumber = $("#accountNumber").val();
    var apiKey = $("#apiKey").val();

    $.ajax({
        url: 'set_cookies',
        type: 'POST',
        data: {'api_key': apiKey, 'account_number': accountNumber}
    });

    $("#complete").removeClass("hide");
};