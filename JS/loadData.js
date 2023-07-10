async function createBarPlot(data) {
  return new Promise(resolve => {
    var chart = bb.generate({
      data: {
        columns: [],
        type: "bar",
      },

      transition: {
        duration: 500  // set duration of transitions in milliseconds
      },

      bar: {
        width: {
          ratio: 0.5
        },
        padding: 5,
        
      },

      tooltip: {
        show: false  // This line disables tooltips
      },

      axis: {
        rotated: true // this makes the bar chart horizontal
      },

      color: {
        pattern: ["#1f77b4", "#ff7f0e"],  // Different colors for conditions A and B
      },
      bindto: "#barPlotID"
    });
    resolve( chart );
  });
}


d3.csv('indata.csv').then(async data => {

  var table = createTable(data);
  const completedTable = await table;

  //here we creset the table
  document.getElementById('reset-button').addEventListener('click', function() {
    completedTable.search('').columns().search('').draw(); 
  });


  //here we caputer the circle ids at the end of brush
  //to drow the datatable
  function onBrushEnd(data) {
    completedTable.columns(1).search(data.join('|'), true, false).draw();
  }

  
  const scatterPlot1  = createScatterPlot(data, 'logFC', 'FDR', 'scatterplot1', onBrushEnd);
  const scatterPlot2  = createScatterPlot(data, 'log_AveExpr', 'logFC', 'scatterplot2', onBrushEnd);

  
  const barPlot = createBarPlot(data);


  const completedScatterPlot1 = await scatterPlot1;
  const completedScatterPlot2 = await scatterPlot2;
  const completedBarPlot = await barPlot;

  d3.selectAll(".bb-axis.bb-axis-x path.domain")
  .style("stroke-width", "0.5");

  //adding most of the interactivity table -> plot; plot -> table
  addInteractivity(completedTable, completedScatterPlot1, completedScatterPlot2, completedBarPlot);
  
  console.log(data);

});