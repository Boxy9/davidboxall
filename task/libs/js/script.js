const CCjson = {
    "CountryCodes": [
        {
            "countryCode": "AT",
            "country": "Austria"
        },
        {
            "countryCode": "AU",
            "country": "Australia"
        },
        {
            "countryCode": "AX",
            "country": "Aland"
        },
        {
            "countryCode": "CC",
            "country": "Cocos [Keeling] Islands"
        },
        {
            "countryCode": "CH",
            "country": "Switzerland"
        },
        {
            "countryCode": "CL",
            "country": "Chile"
        },
        {
            "countryCode": "CX",
            "country": "Christmas Island"
        },
        {
            "countryCode": "CZ",
            "country": "Czechia"
        },
        {
            "countryCode": "DK",
            "country": "Denmark"
        },
        {
            "countryCode": "EE",
            "country": "Estonia"
        },
        {
            "countryCode": "ES",
            "country": "Spain"
        },
        {
            "countryCode": "FI",
            "country": "Finland"
        },
        {
            "countryCode": "FR",
            "country": "France"
        },
        {
            "countryCode": "GF",
            "country": "French Guiana"
        },
        {
            "countryCode": "GP",
            "country": "Guadeloupe"
        },
        {
            "countryCode": "HK",
            "country": "Hong Kong"
        },
        {
            "countryCode": "IS",
            "country": "Iceland"
        },
        {
            "countryCode": "LU",
            "country": "Luxembourg"
        },
        {
            "countryCode": "MQ",
            "country": "Martinique"
        },
        {
            "countryCode": "NF",
            "country": "Norfolk Island"
        },
        {
            "countryCode": "NL",
            "country": "Netherlands"
        },
        {
            "countryCode": "NO",
            "country": "Norway"
        },
        {
            "countryCode": "PL",
            "country": "Poland"
        },
        {
            "countryCode": "PR",
            "country": "Puerto Rico"
        },
        {
            "countryCode": "PT",
            "country": "Portugal"
        },
        {
            "countryCode": "RE",
            "country": "Reunion"
        },
        {
            "countryCode": "SG",
            "country": "Singapore"
        },
        {
            "countryCode": "SI",
            "country": "Slovenia"
        },
        {
            "countryCode": "SJ",
            "country": "Svalbard and Jan Mayen"
        },
        {
            "countryCode": "SK",
            "country": "Slovakia"
        },
        {
            "countryCode": "US",
            "country": "United States"
        },
        {
            "countryCode": "YT",
            "country": "Mayotte"
        }
    ]
};
const sel = document.getElementById('selCountry');
CCjson.CountryCodes.forEach((ele, indx) => {
    const opt = document.createElement("option");
    opt.key = indx;
    opt.value = ele.countryCode;
    opt.innerText = ele.country;
    sel.appendChild(opt);
});

$('#subBtnPop').click(function () {

    $.ajax({
        url: "libs/php/pop.php",
        type: 'GET',
        dataType: 'json',
        data: {
            lat: $('#selLat').val(),
            lng: $('#selLng').val()
        },
        success: function (result) {

            console.log(JSON.stringify(result))

            if (result.status.name == "ok") {
                if (result['data'] !== null && Object.keys(result['data']).length > 0) {
                    var gmtOffset = parseFloat(result['data'][0]['timezone']['gmtOffset']);
                    var gmtOffsetTxt = " ";
                    if (gmtOffset >= 0) {
                        gmtOffsetTxt = "+" + gmtOffset.toString();
                    } else {
                        gmtOffsetTxt = gmtOffset.toString();
                    }
                    $('#results0').html('Town/City : ' + result['data'][0]['asciiName']);
                    $('#results1').html('Time Zone : ' + result['data'][0]['timezone']['timeZoneId'] + ' (GMT ' + gmtOffsetTxt + ')');
                    $('#results2').html('County : ' + result['data'][0]['adminName2']);
                    $('#results3').html('Country : ' + result['data'][0]['countryName']);
                } else {
                    $('#results0').html('Sorry no details have been found !');
                    $('#results1').html(' ');
                    $('#results2').html(' ');
                    $('#results3').html(' ');
                }
            }

        },
        error: function (jqXHR, textStatus, errorThrown) {
            alert(jqXHR.status + "," + textStatus + "," + errorThrown);
        }
    });

});

$('#subBtnEle').click(function () {

    $.ajax({
        url: "libs/php/GTOPO30.php",
        type: 'GET',
        dataType: 'json',
        data: {
            lat: $('#selLat1').val(),
            lng: $('#selLng1').val()
        },
        success: function (result) {

            console.log(JSON.stringify(result))

            if (result.status.name == "ok") {
                if (result['data'] !== null && Object.keys(result['data']).length > 0) {
                    $('#results0').html('Elevation : ' + result['data']['gtopo30'] + 'm');
                    $('#results1').html(' ');
                    $('#results2').html(' ');
                    $('#results3').html(' ');
                } else {
                    $('#results0').html('Sorry no details have been found !');
                    $('#results1').html(' ');
                    $('#results2').html(' ');
                    $('#results3').html(' ');
                }
            }

        },
        error: function (jqXHR, textStatus, errorThrown) {
            alert(jqXHR.status + "," + textStatus + "," + errorThrown);
        }
    });

});

$('#subBtnAdd').click(function () {

    $.ajax({
        url: "libs/php/address.php",
        type: 'GET',
        dataType: 'json',
        data: {
            street: $('#selStreet').val(),
            city: $('#selCity').val(),
            countryCode: $('#selCountry').val()
        },
        success: function (result) {

            console.log(JSON.stringify(result))

            if (result.status.name == "ok") {
                if (result['data'] !== null && Object.keys(result['data']).length > 0) {
                    $('#results0').html('Latitude : ' + result['data']['lat']);
                    $('#results1').html('Longitude : ' + result['data']['lng']);
                    $('#results2').html(' ');
                    $('#results3').html(' ');
                } else {
                    $('#results0').html('Sorry no details have been found !');
                    $('#results1').html(' ');
                    $('#results2').html(' ');
                    $('#results3').html(' ');
                }
            }

        },
        error: function (jqXHR, textStatus, errorThrown) {
            alert(jqXHR.status + "," + textStatus + "," + errorThrown);
        }
    });

});	