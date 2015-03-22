$(document).ready(function () {
    retrieveSummaryData();

    // LendingClub API only allows one call per second
    setTimeout(retrievePortfolioData(), 1000);
});

var retrieveSummaryData = function () {
    $.ajax({
        url: 'summary/retrieve_summary_data'
    }).success(function (data) {
        if (data && data['mockedData']) {
            $("#sampleData").removeAttr("hidden");
        }
        populateSummaryData(data);
    });
};

var notDollar = ['totalNotes', 'totalPortfolios'];

var populateSummaryData = function (data) {
    $.each(data, function (key, value) {
        value = notDollar.indexOf(key) >= 0 ? value : "$" + value;
        $("#" + key).html(value);
    });
};

var retrievePortfolioData = function () {
    $.ajax({
        url: 'summary/retrieve_portfolio_data'
    }).success(function (data) {
        if (data && data["myPortfolios"].length > 0 && data["myPortfolios"][0]["mockedData"]) {
            $("#sampleData").removeAttr("hidden");
        }
        populatePortfoliosData(data);
    });
};

var populatePortfoliosData = function (data) {
    var tbodyHtml = "";

    $.each(data["myPortfolios"], function (index, row) {
        portfolioDescription = row["portfolioDescription"] ? row["portfolioDescription"] : "";
        tbodyHtml += "<tr>";
        tbodyHtml += "<td>" + row['portfolioId'] + "</td>";
        tbodyHtml += "<td>" + row['portfolioName'] + "</td>";
        tbodyHtml += "<td>" + portfolioDescription + "</td>";
        tbodyHtml += "</tr>";
    });

    $("#portfolio tbody").html(tbodyHtml);
};