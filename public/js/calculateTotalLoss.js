$(function () {

  function calculateTotalLoss() {
    let totalLoss = 0;

    $('#sortableTable tbody tr:visible').each(function () {
      let lossValue = parseFloat($(this).find('td:eq(9)').text().replace(',', '.')) || 0;
      totalLoss += lossValue;
    });

    $('#totalLossLabel').text('Сума збитків (грн): ' + totalLoss.toFixed(2));
  }

  $(function () {
    calculateTotalLoss();
  });

  $('#filterObjectName, #filterPollutantName, #filterYear').on('input', function () {
    calculateTotalLoss();
  });

});