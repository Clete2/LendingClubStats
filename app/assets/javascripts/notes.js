//= require datatables
//= require amcharts/amcharts
//= require amcharts/serial

ready = function() {
    var notesData = null;

    $.ajax({
        url: 'notes/retrieve',
        async: false
    }).success(function(data) {
        if(data && data["myNotes"].length > 0 && data['myNotes'][0]['mockedData']) {
            $("#sampleData").removeAttr("hidden");
        }
        notesData = data;
    });

   populateNotesData(notesData);
};

$(document).ready(ready);
$(document).on('page:load', ready);

populateNotesData = function (data) {
    var interestRates = {};
    var loanAmounts = {};
    var grades = {};
    var paymentsReceived = {};
    var defaultsByGrade = {};
    var defaultedDollarsByGrade = {};

    populateNotesMetadata(data);

    var notesDataTableApi = $("#notesDataTable").dataTable().api();
    notesDataTableApi.rows().remove();

    var notIssuedStatuses = ["In Review", "In Funding"];

    $.each(data["myNotes"], function (index, value) {
        var rate = value["interestRate"];
        interestRates[rate] = rate in interestRates ? ++interestRates[rate] : 1;

        var amount = value["loanAmount"];
        loanAmounts[amount] = amount in loanAmounts ? ++loanAmounts[amount] : 1;

        var grade = value["grade"];
        grades[grade] = grade in grades ? ++grades[grade] : 1;

        var paymentReceived = value["paymentsReceived"];
        paymentsReceived[paymentReceived] = paymentReceived in paymentsReceived ? ++paymentsReceived[paymentReceived] : 1;

        var status = value["loanStatus"];
        if(status === "Charged Off") {
            defaultsByGrade[grade] = grade in defaultsByGrade ? ++defaultsByGrade[grade] : 1;
            var defaultedDollars = value["noteAmount"] - value["paymentsReceived"];
            defaultedDollarsByGrade[grade] = grade in defaultedDollarsByGrade ? defaultedDollarsByGrade[grade] + defaultedDollars : defaultedDollars;
        }

        var issueDate = new Date(value["issueDate"]);
        var issueDateString = (issueDate.getMonth() + 1) + "/" + issueDate.getDate() + "/" + issueDate.getFullYear();

        var orderDate = new Date(value["orderDate"]);
        var orderDateString = (orderDate.getMonth() + 1) + "/" + orderDate.getDate() + "/" + orderDate.getFullYear();

        issueDateString = notIssuedStatuses.indexOf(status) != -1 ? "Not Yet Issued" : issueDateString;
        orderDateString = notIssuedStatuses.indexOf(status) != -1 ? "Not Yet Issued" : orderDateString;

        var row = [value["loanId"],
            value["noteId"],
            value["orderId"],
            value["interestRate"] + "%",
            value["loanLength"],
            value["loanStatus"],
            value["grade"],
            "$" + value["loanAmount"],
            "$" + value["noteAmount"],
            "$" + value["paymentsReceived"],
            issueDateString,
            orderDateString];

        notesDataTableApi.row.add(row);
    });

    notesDataTableApi.draw();

    var interestRatesChartData = buildFloatChartData(interestRates);
    makeChart("interestRateChart", "Interest Rate", "Number of Loans", "Interest Rates", "[[title]] [[category]]%: [[value]] loans", interestRatesChartData);

    var loanAmountsChartData = buildFloatChartData(loanAmounts, "$");
    makeChart("loanAmountChart", "Loan Amount", "Number of Loans", "Loan Amounts", "[[title]] [[category]]: [[value]] loans", loanAmountsChartData);

    var gradeChartData = buildStringChartData(grades);
    makeChart("gradeChart", "Grade", "Number of Loans", "Grades", "[[title]] [[category]]: [[value]] loans", gradeChartData);

    var paymentsReceivedChartData = buildFloatChartData(paymentsReceived, "$");
    makeChart("paymentsReceivedChart", "Dollars", "Dollars", "Payments Received", "[[title]] [[category]]: [[value]] loans", paymentsReceivedChartData);

    var defaultsByGradeChartData = buildStringChartData(defaultsByGrade);
    makeChart("defaultsByGradeChart", "Grade", "Number of Loans", "Defaults", "[[title]] [[category]]: [[value]] loans", defaultsByGradeChartData);

    var defaultedDollarsByGradeChartData = buildStringChartData(defaultedDollarsByGrade);
    makeChart("defaultedDollarsByGradeChart", "Grade", "Dollars", "Dollars Lost", "[[title]] [[category]]: $[[value]]", defaultedDollarsByGradeChartData);
};

populateNotesMetadata = function(data) {
    populateInterestRateMetadata(data);
    populatePaymentsReceivedMetadata(data);
};

populateInterestRateMetadata = function(data) {
    var stats = determineStats(data["myNotes"], "interestRate");

    populateMetadata("InterestRate", roundTwoPlaces(stats[0]) +"%", roundTwoPlaces(stats[1]) +"%", roundTwoPlaces(stats[2]) +"%");
};

populatePaymentsReceivedMetadata = function(data) {
    var stats = determineStats(data["myNotes"], "paymentsReceived");

    populateMetadata("Payments", "$"+ roundTwoPlaces(stats[0]), "$"+ roundTwoPlaces(stats[1]), "$"+ roundTwoPlaces(stats[2]));
};

populateMetadata = function (field, min, max, average) {
    $("#minimum"+ field).text(min);
    $("#maximum"+ field).text(max);
    $("#average"+ field).text(average);
};

determineStats = function(data, field) {
    var min = Number.MAX_VALUE;
    var max = 0;
    var average = 0;

    $.each(data, function(index, value) {
        var dataPoint = value[field];

        if(dataPoint < min) {
            min = dataPoint;
        }

        if(dataPoint > max) {
            max = dataPoint;
        }

        average += dataPoint;
    });

    average /= data.length;

    return [min, max, average];
};

roundTwoPlaces = function(num) {
    return Math.round((num + 0.00001) * 100) / 100;
};

buildFloatChartData = function (dict, keyPrefix) {
    keyPrefix = keyPrefix ? keyPrefix : "";

    var chartData = [];

    var keys = [];
    for (var key in dict) {
        keys.push(key);
    }
    keys.sort(function (a, b) {
        return a - b;
    });

    $.each(keys, function (index, key) {
        var value = dict[key];
        chartData.push({"category": keyPrefix + key, "count": value});
    });

    return chartData;
};

buildStringChartData = function (dict, keyPrefix) {
    keyPrefix = keyPrefix ? keyPrefix : "";

    var chartData = [];

    var keys = [];
    for (var key in dict) {
        keys.push(key);
    }
    keys.sort();

    $.each(keys, function (index, key) {
        var value = dict[key];
        chartData.push({"category": keyPrefix + key, "count": value});
    });

    return chartData;
};

makeChart = function (chartDiv, title, valueAxisTitle, vertAxisTitle, balloonText, data) {
    AmCharts.makeChart(chartDiv,
        {
            "type": "serial",
            "pathToImages": "http://cdn.amcharts.com/lib/3/images/",
            "categoryField": "category",
            "angle": 30,
            "startDuration": 1,
            "categoryAxis": {
                "gridPosition": "start"
            },
            "trendLines": [],
            "graphs": [
                {
                    "balloonText": balloonText,
                    "fillAlphas": 1,
                    "id": "AmGraph-1",
                    "title": title,
                    "type": "column",
                    "valueField": "count"
                }
            ],
            "guides": [],
            "valueAxes": [
                {
                    "id": "ValueAxis-1",
                    "stackType": "3d",
                    "title": valueAxisTitle
                }
            ],
            "allLabels": [],
            "balloon": {},
            "legend": {
                "useGraphSettings": true
            },
            "titles": [
                {
                    "id": "Title-1",
                    "size": 15,
                    "text": vertAxisTitle
                }
            ],
            "dataProvider": data
        }
    );
};