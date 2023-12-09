$(function () {
  function applyFilters() {
    var filterObjectName = $('#filterObjectName').val().toLowerCase();
    var filterPollutantName = $('#filterPollutantName').val().toLowerCase();
    var filterYear = $('#filterYear').val().toLowerCase();

    $('#sortableTable tbody tr').each(function () {
      var objectName = $(this).find('td:eq(0)').text().toLowerCase();
      var pollutantName = $(this).find('td:eq(1)').text().toLowerCase();
      var year = $(this).find('td:eq(2)').text().toLowerCase();

      var objectNameMatch = objectName.includes(filterObjectName);
      var pollutantNameMatch = pollutantName.includes(filterPollutantName);
      var yearMatch = year.includes(filterYear);

      if (objectNameMatch && pollutantNameMatch && yearMatch) {
        $(this).show();
      } else {
        $(this).hide();
      }
    });
  }

  $('#filterObjectName, #filterPollutantName, #filterYear').on('input', function () {
    applyFilters();
  });

  applyFilters();
});