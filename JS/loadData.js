d3.csv('indata_927.csv').then(async data => {


  var table = createTable(data);
  const completedTable = await table;

  //here we reset the table
  document.getElementById('reset-button').addEventListener('click', function() {
    completedTable.search('').columns().search('').draw(); 
  });

  //here we caputer the circle ids at the end of brush
  //to drow the datatable
  //this logic is too complicated to implement outside the brush, so
  //using callback
  function onBrushEnd(data) {
    completedTable.columns(1).search(data.join('|'), true, false).draw();
  }

  const scatterPlot1  = createScatterPlot(data, 'logFC', 'FDR', 'scatterplot1', onBrushEnd);
  const scatterPlot2  = createScatterPlot(data, 'log_AveExpr', 'logFC', 'scatterplot2', onBrushEnd);

  //var exampleRowData = ["", "", "", "", "", "", "10", "20", "30", "40", "50", "60"];
  var firstRowData = completedTable.row(0).data();
  let columnNames = completedTable.columns().header().map(function(header) {
    return $(header).html();
  }).toArray();

  var BarPlotData = processRowDataForBarChart(firstRowData, columnNames);
  const updateBarPlot = createBarPlot("#barPlotID", BarPlotData);


  const completedScatterPlot1 = await scatterPlot1;
  const completedScatterPlot2 = await scatterPlot2;
  //const completedBarPlot = await barPlot;



  //adding most of the interactivity table -> plot; plot -> table
  addInteractivity(completedTable, completedScatterPlot1, completedScatterPlot2, updateBarPlot);
  
  console.log('addInteractivity done');

});