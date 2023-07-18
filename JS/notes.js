
const brush = d3.brush() // Create a 2D brush
    .extent([[margin.left, margin.top], [width - margin.right, height - margin.bottom]])
    .on("start", brushstarted)
    .on("end", brushended);

  //not used at the moment
  function brushstarted() {

  }

  const gBrush = svg.append("g")
        .attr("class", "brush")
        .call(brush);


  // When the shift key is held down, re-enable the brush
  d3.select(window).on("keydown", function () {
    if(d3.event.shiftKey) {
      gBrush.call(brush);
    }
  });

  // When the shift key is released, disable the brush
  d3.select(window).on("keyup", function () {
    if(!d3.event.shiftKey) {
      gBrush.call(brush.move, [[null, null], [null, null]]);
    }
  });

  // Function to handle brush end event
  function brushended(event) {
    if (!event.selection) return; // Ignore empty selections.

    // Coords of the selection
    const [[x0, y0], [x1, y1]] = event.selection;

    // Transform these coordinates to the corresponding data values using the scales
    xScale.domain([x0, x1].map(xScale.invert, xScale));
    yScale.domain([y1, y0].map(yScale.invert, yScale));

    // Remove the brush selection
    svg.select(".brush").call(brush.move, null);

    // Zoom in
    zoomTo();
  }

  function zoomTo() {
    // Update the x and y axis with the new scale.
    svg.selectAll(".x.axis").call(xAxis.scale(xScale));
    svg.selectAll(".y.axis").call(yAxis.scale(yScale));

    // Update the points' positions with the new scale.
    svg.selectAll("circle")
      .attr("cx", d => xScale(d[xColumn]))
      .attr("cy", d => yScale(d[yColumn]));
  }

  // Add reset on double click
  svg.on("dblclick", function() {
    xScale.domain(xDomain);
    yScale.domain(yDomain);
    zoomTo();
  });



  var xs_box = {
      };
  xs_box['CONDITION_1']='x1';
  xs_box['CONDITION_2']='x2';

  var box_plot_chart = c3.generate({

    oninit: function() {
      this.svg.attr('id', 'bar_chart_svg')
    },
    
    bindto: '#bar_chart',
    title: {
      text: ''
    },


    data: {

      type: 'bar',
      columns: [

      ]
      
    },


    xs: xs_box,

    axis: {
    y: {
      label: Y_LABEL_BARPLOT,
      tick: {
        format: d3.format(".1e")
      }
    },

    x: {
    }
    }

  });


  async function createBarPlot(data) {
    return new Promise(resolve => {
      var chart = bb.generate({
        data: {
          columns: [],
          type: "bar",
        },
  
        bar: {
          width: {
            ratio: 0.5
          },
          padding: 5,
          
        },
        color: {
          pattern: ["#1f77b4", "#ff7f0e"],  // Different colors for conditions A and B
        },
        
        bindto: "#barPlotID"
      });
      resolve( chart );
    });
  }


  function processRowDataForBarChart(rowData) {
    var barData = [];
  
    // Go through each key-value pair in rowData
    for (var key in rowData) {
        console.log('key', key);
        // Check if the key starts with 'A_' or 'B_'
        if (key.startsWith('A_') || key.startsWith('B_')) {
            // If so, add a new object to barData with the key as the name and the value as the value
            barData.push({name: key, value: rowData[key]});
        }
    }
  
    return barData;
  }



 

  async function processFile(data) {
  
    //here we capture the circle ids at the end of brush
    //to draw the datatable
    //this logic is too complicated to implement outside the brush, so
    //using callback
    function onBrushEnd(data) {
      completedTable.columns(1).search(data.join('|'), true, false).draw();
    }
  
    const scatterPlot1  = createScatterPlot(data, 'logFC', 'FDR', 'scatterplot1', onBrushEnd);
    const scatterPlot2  = createScatterPlot(data, 'log_AveExpr', 'logFC', 'scatterplot2', onBrushEnd);
  
    const completedScatterPlot1 = await scatterPlot1;
    const completedScatterPlot2 = await scatterPlot2;
  
    var table = createTable(data);
    const completedTable = await table;
  
    //here we reset the table
    document.getElementById('reset-button').addEventListener('click', function() {
      completedTable.search('').columns().search('').draw(); 
    });
  
  
  
    var firstRowData = completedTable.row(0).data();
    let columnNames = completedTable.columns().header().map(function(header) {
      return $(header).html();
    }).toArray();
  
    var BarPlotData = processRowDataForBarChart(firstRowData, columnNames);
    const updateBarPlot = createBarPlot("#barPlotID", BarPlotData);
  
  
  
    //adding most of the interactivity table -> plot; plot -> table
    addInteractivity(completedTable, completedScatterPlot1, completedScatterPlot2, updateBarPlot);
    
    console.log('addInteractivity done');
  }
  
  
  
  
  document.getElementById('csvFile').addEventListener('change', function(evt) {
  
      var file = evt.target.files[0];
      var reader = new FileReader();
  
      reader.onload = (function(file) {
        return function(e) {
            var data = d3.csvParse(this.result);
    
            //document.getElementById('loadingSpinner').style.display = 'block';
            
            processFile(data).then(function() {
                //document.getElementById('loadingSpinner').style.display = 'none';
            });
        };
    })(file);
     
      reader.readAsText(file);
  });





  
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




  async function processFile(data, controlName, treatmentName) {

    console.log('controlName, treatmentName inside processFile', controlName, treatmentName);
    
    //here we capture the circle ids at the end of brush
    //to draw the datatable
    //this logic is too complicated to implement outside the brush, so
    //using callback
    function onBrushEnd(data) {
      completedTable.columns(1).search(data.join('|'), true, false).draw();
    }
  
    const scatterPlot1  = createScatterPlot(data, 'logFC', 'FDR', 'scatterplot1', onBrushEnd);
    const scatterPlot2  = createScatterPlot(data, 'log_AveExpr', 'logFC', 'scatterplot2', onBrushEnd);
  
    const completedScatterPlot1 = await scatterPlot1;
    const completedScatterPlot2 = await scatterPlot2;
  
    var table = createTable(data);
    const completedTable = await table;
  
    //here we reset the table
    document.getElementById('reset-button').addEventListener('click', function() {
      completedTable.search('').columns().search('').draw(); 
    });
  
  
  
    var firstRowData = completedTable.row(0).data();
    let columnNames = completedTable.columns().header().map(function(header) {
      return $(header).html();
    }).toArray();
  
    var BarPlotData = processRowDataForBarChart(firstRowData, columnNames);
    const updateBarPlot = createBarPlot("#barPlotID", BarPlotData, controlName, treatmentName);
  
  
  
    //adding most of the interactivity table -> plot; plot -> table
    addInteractivity(completedTable, completedScatterPlot1, completedScatterPlot2, updateBarPlot);
    
    console.log('addInteractivity done');
  }
  
  
  document.querySelector('.dropdown-menu form').addEventListener('submit', function(evt) {
    evt.preventDefault();
  
    var fileInput = document.getElementById('csvFile');
    var file = fileInput.files[0];
  
    if (!file) {
        alert('Please select a file to upload.');
        return;
    }
  
    var reader = new FileReader();
  
    // Get control name and treatment name from form inputs
    var controlName = document.getElementById('controlName').value;
    var treatmentName = document.getElementById('treatmentName').value;
  
    console.log('1 controlName',controlName);
  
    // Provide default names if inputs are empty
    if (!controlName) {
        controlName = 'Default Control Name';
    }
    if (!treatmentName) {
        treatmentName = 'Default Treatment Name';
    }
  
    reader.onload = (function(file) {
        return function(e) {
            var data = d3.csvParse(this.result);
  
            // Add control name and treatment name to data
            //data.controlName = controlName;
            //data.treatmentName = treatmentName;
  
            //document.getElementById('loadingSpinner').style.display = 'block';
            
            processFile(data, controlName, treatmentName).then(function() {
                //document.getElementById('loadingSpinner').style.display = 'none';
            });
        };
    })(file);
   
    reader.readAsText(file);
  });
  