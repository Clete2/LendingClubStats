//= require datatables
//= require amcharts/amcharts
//= require amcharts/serial

ready = function () {
    var notesData = null;

    $.ajax({
        url: 'notes/retrieve',
        async: false
    }).success(function (data) {
        if (data && data["myNotes"].length > 0 && data['myNotes'][0]['mockedData']) {
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
    var nextPaymentDates = {};

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

        var nextPaymentDate = value["nextPaymentDate"];
        var now = new Date();
        // Only include dates in the future
        if (nextPaymentDate && new Date(nextPaymentDate) > now) {
                nextPaymentDates[nextPaymentDate] = nextPaymentDate in nextPaymentDates ? ++nextPaymentDates[nextPaymentDate] : 1;
        }

        var status = value["loanStatus"];
        if (status === "Charged Off") {
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
    makeChart("loanAmountChart", "Loan Amount", "Number of Loans", "Loan Amounts", null, loanAmountsChartData);

    var gradeChartData = buildStringChartData(grades);
    makeChart("gradeChart", "Grade", "Number of Loans", "Grades", null, gradeChartData);

    var paymentsReceivedChartData = buildFloatChartData(paymentsReceived, "$");
    makeChart("paymentsReceivedChart", "Dollars", "Dollars", "Payments Received", null, paymentsReceivedChartData);

    var defaultsByGradeChartData = buildStringChartData(defaultsByGrade);
    makeChart("defaultsByGradeChart", "Grade", "Number of Loans", "Defaults", null, defaultsByGradeChartData);

    var defaultedDollarsByGradeChartData = buildStringChartData(defaultedDollarsByGrade);
    makeChart("defaultedDollarsByGradeChart", "Grade", "Dollars", "Dollars Lost", "[[title]] [[category]]: $[[value]]", defaultedDollarsByGradeChartData);

    var nextPaymentDateChartData = buildDateChartData(nextPaymentDates);
    makeChart("nextPaymentDateChart", "Date", "Number of Loans", "Date", null, nextPaymentDateChartData, 45);
};

populateNotesMetadata = function (data) {
    populateInterestRateMetadata(data);
    populatePaymentsReceivedMetadata(data);
    populateAccrualMetadata(data);
};

populateInterestRateMetadata = function (data) {
    var stats = determineStats(data["myNotes"], "interestRate");
    delete stats["total"];

    populateMetadata("InterestRate", stats, roundTwoPlaces, null, "%");
};

populatePaymentsReceivedMetadata = function (data) {
    var stats = determineStats(data["myNotes"], "paymentsReceived");

    populateMetadata("Payments", stats, roundTwoPlaces, "$");
};

populateAccrualMetadata = function (data) {
    var stats = determineStats(data["myNotes"], "accruedInterest");

    populateMetadata("Accrual", stats, roundTwoPlaces, "$");
}

populateMetadata = function (field, stats, valueFunction, prefix, suffix) {
    valueFunction = valueFunction ? valueFunction : function () {
    };
    prefix = prefix ? prefix : "";
    suffix = suffix ? suffix : "";
    $.each(stats, function (key, value) {
        // Apply custom function to the value
        value = valueFunction(value);
        $("#" + key + field).text(prefix + String(value) + suffix);
    });
};

determineStats = function (data, field) {
    var min = Number.MAX_VALUE;
    var max = 0;
    var average = 0;
    var total = 0;

    $.each(data, function (index, value) {
        var dataPoint = value[field];

        if (dataPoint < min) {
            min = dataPoint;
        }

        if (dataPoint > max) {
            max = dataPoint;
        }

        total += dataPoint;
    });

    average = total / data.length;

    return {"minimum": min, "maximum": max, "average": average, "total": total};
};

roundTwoPlaces = function (num) {
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

buildDateChartData = function (dict) {
    var chartData = [];

    var keys = [];
    for (var key in dict) {
        keys.push(key);
    }
    keys.sort(function (a, b) {
        return new Date(a) - new Date(b);
    });

    $.each(keys, function (index, key) {
        var value = dict[key];
        var date = new Date(key);
        chartData.push({"category": (date.getMonth() + 1) +"/"+ date.getDate() +"/"+ date.getFullYear(), "count": value});
    });

    return chartData;
};

makeChart = function (chartDiv, title, valueAxisTitle, vertAxisTitle, balloonText, data, labelRotation) {
    balloonText = balloonText ? balloonText : "[[title]] [[category]]: [[value]] loans";
    labelRotation = labelRotation ? labelRotation : 0;
    AmCharts.makeChart(chartDiv,
        {
            "type": "serial",
            "pathToImages": "http://cdn.amcharts.com/lib/3/images/",
            "categoryField": "category",
            "angle": 30,
            "startDuration": 1,
            "categoryAxis": {
                "gridPosition": "start",
                "labelRotation": labelRotation
            },
            "trendLines": [],
            "graphs": [
                {
                    "balloonText": balloonText,
                    "fillAlphas": 1,
                    "id": "AmGraph-1",
                    "title": title,
                    "type": "column",
                    "valueField": "count",
                }
            ],
            "guides": [],
            "valueAxes": [
                {
                    "id": "ValueAxis-1",
                    "stackType": "3d",
                    "title": valueAxisTitle,
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