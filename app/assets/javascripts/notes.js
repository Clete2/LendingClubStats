$(document).ready(function () {
    $.ajax({
        url: 'notes/retrieve'
    }).success(function (data) {
        if (data && data["myNotes"].length > 0 && data["myNotes"][0]['mockedData']) {
            $("#sampleData").removeAttr("hidden");
        }
        populateSummaryData(data);
    });
});

function populateSummaryData(data) {
    var interestRates = {};
    var loanAmounts = {};
    var grades = {};
    var paymentsReceived = {};
    var defaultsByGrade = {};
    var defaultedDollarsByGrade = {};
    var nextPaymentDates = {};
    var issueDates = {};
    var creditTrends = {};

    populateNotesMetadata(data);

    var notesDataTableApi = $("#notesDataTable").dataTable().api();
    notesDataTableApi.rows().remove();

    var notIssuedStatuses = ["In Review", "In Funding"];

    var now = new Date();

    $.each(data["myNotes"], function (index, value) {
        var rate = Math.round(value["interestRate"]);
        interestRates[rate] = rate in interestRates ? ++interestRates[rate] : 1;

        var amount = Math.round(value["loanAmount"] / 1000) * 1000;
        loanAmounts[amount] = amount in loanAmounts ? ++loanAmounts[amount] : 1;

        var grade = value["grade"];
        grades[grade] = grade in grades ? ++grades[grade] : 1;

        var paymentReceived = Math.round(value["paymentsReceived"]);
        paymentsReceived[paymentReceived] = paymentReceived in paymentsReceived ? ++paymentsReceived[paymentReceived] : 1;

        var nextPaymentDate = value["nextPaymentDate"];
        // Only include dates in the future
        if (nextPaymentDate && new Date(nextPaymentDate) > now) {
            nextPaymentDates[nextPaymentDate] = nextPaymentDate in nextPaymentDates ? ++nextPaymentDates[nextPaymentDate] : 1;
        }

        var issueDate = value["issueDate"];
        if (issueDate) {
            issueDates[issueDate] = issueDate in issueDates ? ++issueDates[issueDate] : 1;
        }

        var status = value["loanStatus"];
        if (status === "Charged Off") {
            defaultsByGrade[grade] = grade in defaultsByGrade ? ++defaultsByGrade[grade] : 1;
            var defaultedDollars = Math.round(value["noteAmount"] - value["paymentsReceived"]);
            defaultedDollarsByGrade[grade] = grade in defaultedDollarsByGrade ? defaultedDollarsByGrade[grade] + defaultedDollars : defaultedDollars;
        }

        var creditTrend = value["creditTrend"];
        creditTrends[creditTrend] = creditTrend in creditTrends ? ++creditTrends[creditTrend] : 1;

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

    var interestRatesChartData = buildChartData(interestRates, numberCompare, percentKey);
    makeSerialChart("interestRateChart", "Interest Rate", "Number of Loans", "Interest Rates (Rounded)", "[[title]] [[category]]%: [[value]] loans", interestRatesChartData);

    var loanAmountsChartData = buildChartData(loanAmounts, numberCompare, dollarKey);
    makeSerialChart("loanAmountChart", "Loan Amount", "Number of Loans", "Loan Amounts (Rounded to $1,000)", null, loanAmountsChartData);

    var gradeChartData = buildChartData(grades);
    makeSerialChart("gradeChart", "Grade", "Number of Loans", "Grades", null, gradeChartData);

    var paymentsReceivedChartData = buildChartData(paymentsReceived, numberCompare, dollarKey);
    makeSerialChart("paymentsReceivedChart", "Dollars", "Dollars", "Payments Received (Rounded)", null, paymentsReceivedChartData);

    var defaultsByGradeChartData = buildChartData(defaultsByGrade);
    makeSerialChart("defaultsByGradeChart", "Grade", "Number of Loans", "Defaults", null, defaultsByGradeChartData);

    var defaultedDollarsByGradeChartData = buildChartData(defaultedDollarsByGrade, numberCompare);
    makeSerialChart("defaultedDollarsByGradeChart", "Grade", "Dollars", "Dollars Lost", "[[title]] [[category]]: $[[value]]", defaultedDollarsByGradeChartData);

    var nextPaymentDateChartData = buildChartData(nextPaymentDates, dateCompare, dateKey);
    makeSerialChart("nextPaymentDateChart", "Date", "Number of Loans", "Next Payment Date", null, nextPaymentDateChartData, 45, true);

    var issueDateChartData = buildChartData(issueDates, dateCompare, dateKey);
    makeSerialChart("issueDateChart", "Date", "Number of Loans", "Issue Date", null, issueDateChartData, 45, true);

    var creditTrendChartData = buildChartData(creditTrends, creditTrendCompare);
    makePieChart("creditTrendChart", creditTrendChartData);

    notesDataTableApi.draw();
}

function populateNotesMetadata(data) {
    populateInterestRateMetadata(data);
    populatePaymentsReceivedMetadata(data);
    populateAccrualMetadata(data);
    populateLoanAmountMetadata(data);
}

function populateInterestRateMetadata(data) {
    var stats = determineStats(data["myNotes"], "interestRate");
    delete stats["total"];

    populateMetadata("InterestRate", stats, roundTwoPlaces, null, "%");
}

function populatePaymentsReceivedMetadata(data) {
    var stats = determineStats(data["myNotes"], "paymentsReceived");

    populateMetadata("Payments", stats, roundTwoPlaces, "$");
}

function populateAccrualMetadata(data) {
    var stats = determineStats(data["myNotes"], "accruedInterest");

    populateMetadata("Accrual", stats, roundTwoPlaces, "$");
}

function populateLoanAmountMetadata(data) {
    var stats = determineStats(data["myNotes"], "loanAmount");

    populateMetadata("LoanAmount", stats, roundTwoPlaces, "$");
}

function populateMetadata(field, stats, valueFunction, prefix, suffix) {
    valueFunction = valueFunction ? valueFunction : function (value) {
        return value;
    };
    prefix = prefix ? prefix : "";
    suffix = suffix ? suffix : "";
    $.each(stats, function (key, value) {
        // Apply custom function to the value
        value = valueFunction(value);
        $("#" + key + field).text(prefix + numberWithCommas(value) + suffix);
    });
}

function determineStats(data, field) {
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
}

function roundTwoPlaces(num) {
    return Math.round((num + 0.00001) * 100) / 100;
}

function buildChartData(dict, compareFunction, keyFunction, valueFunction) {
    keyFunction = keyFunction ? keyFunction : function (key) {
        return key;
    };
    valueFunction = valueFunction ? valueFunction : function (value) {
        return value;
    };

    var chartData = [];

    // Sort keys
    var keys = [];
    for (var key in dict) {
        keys.push(key);
    }

    if (compareFunction) {
        keys.sort(compareFunction);
    } else {
        keys.sort();
    }

    $.each(keys, function (index, key) {
        var value = dict[key];
        chartData.push({"category": keyFunction(key), "count": valueFunction(value)});
    });

    return chartData;
}

function dateCompare(a, b) {
    return new Date(a) - new Date(b);
}

function numberCompare(a, b) {
    return a - b;
}

var trends = ["UP", "FLAT", "DOWN"];

function creditTrendCompare(a, b) {
    return trends.indexOf(a) - trends.indexOf(b);
}

function dollarKey(key) {
    return "$" + key;
}

function percentKey(key) {
    return key + "%";
}

function dateKey(key) {
    var date = new Date(key);
    return (date.getMonth() + 1) + "/" + date.getDate() + "/" + date.getFullYear();
}

function makeSerialChart(chartDiv, title, valueAxisTitle, vertAxisTitle, balloonText, data, labelRotation, dates) {
    balloonText = balloonText ? balloonText : "[[title]] [[category]]: [[value]] loans";
    labelRotation = labelRotation ? labelRotation : 0;

    AmCharts.makeChart(chartDiv,
        {
            "type": "serial",
            "categoryField": "category",
            "startDuration": 1,
            "categoryAxis": {
                "gridPosition": "start",
                "labelRotation": labelRotation,
                "parseDates": dates
            },
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
            "valueAxes": [
                {
                    "id": "ValueAxis-1",
                    "stackType": "3d",
                    "title": valueAxisTitle
                }
            ],
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
}

function makePieChart(chartDiv, data) {
    AmCharts.makeChart(chartDiv, {
        "type": "pie",
        "titleField": "category",
        "valueField": "count",
        "dataProvider": data
    });
}

function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}