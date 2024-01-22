function updateTable(data) {
    var filterValue = document.getElementById('filterInput').value.toLowerCase();
    chrome.storage.local.set({ 'filterValue': filterValue }); // Uloží hodnotu filtra

    var table = document.getElementById('requestTable');
    table.innerHTML = "<tr><th>Request URL</th><th>Count</th><th>Average Duration</th></tr>"; // Reset tabuľky

    for (var url in data) {
        if (filterValue && !url.toLowerCase().startsWith(filterValue)) {
            continue; // Preskočí requesty, ktoré nezodpovedajú filtru
        }
        var row = table.insertRow(-1);
        var cell1 = row.insertCell(0);
        var cell2 = row.insertCell(1);
        var cell3 = row.insertCell(2);
        
        var trimmedUrl = url.length > 50 ? url.substring(0, 47) + '...' : url;
        cell1.innerHTML = `<span class="trim-url" data-toggle="tooltip" title="${url}">${url}</span>`;

        cell2.textContent = data[url].count;
        cell3.textContent = (data[url].totalTime / data[url].count).toFixed(2);
    }

    $('[data-toggle="tooltip"]').tooltip(); // Inicializácia Bootstrap tooltipov
}

document.getElementById('filterInput').addEventListener('input', function () {
    chrome.runtime.sendMessage({}, function (response) {
        updateTable(response.requestDetails);
    });
});

chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        if (request.requestDetails) {
            updateTable(request.requestDetails);
        }
    }
);

document.addEventListener('DOMContentLoaded', function () {
    chrome.runtime.sendMessage({}, function (response) {
        updateTable(response.requestDetails);
    });
    chrome.storage.local.get('filterValue', function (data) {
        if (data.filterValue) {
            document.getElementById('filterInput').value = data.filterValue;
            updateTable(response.requestDetails); // Aktualizuje tabuľku s uloženým filtrom
        }
    });
});

document.getElementById('clearButton').addEventListener('click', function () {
    chrome.storage.local.set({ 'requestDetails': {} }, function () {
        updateTable({});
    });
    chrome.runtime.sendMessage({}, function (response) {
        response.requestDetails = {};
        requestStartTimes = {};
        console.log('Cleared request details');
    });
});

function exportTableToCSV(filename) {
    var csv = [];
    var rows = document.querySelectorAll("table tr");

    for (var i = 0; i < rows.length; i++) {
        var row = [], cols = rows[i].querySelectorAll("td, th");

        for (var j = 0; j < cols.length; j++)
            row.push(cols[j].innerText);

        csv.push(row.join(","));
    }

    // Vytvorenie linku na stiahnutie
    var csvFile = new Blob([csv.join("\n")], { type: "text/csv" });
    var downloadLink = document.createElement("a");
    downloadLink.download = filename;
    downloadLink.href = window.URL.createObjectURL(csvFile);
    downloadLink.style.display = "none";
    document.body.appendChild(downloadLink);
    downloadLink.click();
}

document.getElementById('exportButton').addEventListener('click', function () {
    exportTableToCSV('requests.csv');
});
