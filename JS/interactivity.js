// Function to process the row data for the bar chart
function processRowDataForBarChart(rowData, columnNames, controlName, treatmentName) {
  var result = [];
  for (var i = 0; i < columnNames.length; i++) {
    if (columnNames[i].startsWith(controlName) || columnNames[i].startsWith(treatmentName)) {
      result.push({name: columnNames[i], value: +rowData[i]});
    }
  }
  return result;
}

//sanitaize string
//https://stackoverflow.com/questions/4562756/replacing-tab-characters-in-javascript
function removeNewlines(str) {
  //remove line breaks from str
  str = str.replace(/\s{2,}/g, ' ');
  str = str.replace(/\t/g, ' ');
  str = str.toString().trim().replace(/(\r\n|\n|\r)/g," ");
  return str
}

function addHilight(table, scatterPlot1, scatterPlot2, updateBarPlot, controlName, treatmentName) {


  let columnNames = table.columns().header().map(function(header) {
    return $(header).html();
  }).toArray();

  //console.log('columnNames',columnNames);

  // Create the tooltip
  const tooltip = d3.select('body').append('div')
    .attr('class', 'tooltip')
    .style('opacity', 0)
    .style('background', 'rgba(255, 255, 255, 255)');  // Start invisible

  const handleMouseOver = function(event, d, circlesOther) {
    // Highlight row in table
    table.rows().every(function(rowIdx, tableLoop, rowLoop) {
      var data = this.data(); // Get the data of the current row
      
      if (data[1] === d.Gene_id) {
        var node = this.node();
        $(node).css('background-color', 'orange');
        //console.log('data raw', data);

        

        var BarPlotData = processRowDataForBarChart(data, columnNames, controlName, treatmentName);

        updateBarPlot(BarPlotData);



      }
    });

    // Show the tooltip
    let geneId = d.Gene_id.split(';')[0].split(':')[0];

    d3.select("#plotTitle").text(geneId.split(';')[0].split(':')[0]);
    
    let desc = d.Desc.split(';')[0].split(':')[0].split(',')[0];  
    tooltip.style('opacity', 1)
      .html(`
        <table>
          <tr><td>Gene ID</td><td>${geneId}</td></tr>
          <tr><td>Description</td><td>${desc}</td></tr>
        </table>`);

     // Highlight the circle being hovered over
     d3.select(event.currentTarget).attr('fill', 'red').attr('r', 8);
  
    // Highlight the corresponding circle in the other scatter plot
    const correspondingCircle = circlesOther.filter(dOther => dOther.Gene_id === d.Gene_id);
    correspondingCircle
      .attr('fill', 'red')
      .attr('r', 8);
  };

  const handleMouseOut = function(event, d, circlesOther) {
    // Unhighlight row in table
    table.rows().every(function(rowIdx, tableLoop, rowLoop) {
      var data = this.data(); // Get the data of the current row
      if (data[1] === d.Gene_id) {
        var node = this.node();
        $(node).css('background-color', '');
      }
    });

    // Hide the tooltip
    tooltip.style('opacity', 0);

    d3.select(event.currentTarget).attr('fill', 'steelblue').attr('r', 4);

    // Unhighlight the corresponding circle in the other scatter plot
    const correspondingCircle = circlesOther.filter(dOther => dOther.Gene_id === d.Gene_id);
    correspondingCircle
      .attr('fill', 'steelblue')
      .attr('r', 4);
  };

  // Select all circles from both scatter plots
  const circles1 = scatterPlot1.selectAll('circle');
  const circles2 = scatterPlot2.selectAll('circle');

  circles1.on('mouseover', function(event, d) { handleMouseOver(event, d, circles2); })
          .on('mouseout', function(event, d) { handleMouseOut(event, d, circles2); });

  circles2.on('mouseover', function(event, d) { handleMouseOver(event, d, circles1); })
          .on('mouseout', function(event, d) { handleMouseOut(event, d, circles1); });

  // Handle mousemove for both scatter plots
  d3.selectAll('circle').on('mousemove', function(event) {
    tooltip.style('top', (event.pageY - 10) + 'px')
           .style('left', (event.pageX + 10) + 'px');
  });


  const rows = table.rows().nodes().to$();


  rows.on('mouseover', function() {
    const rowData = table.row(this).data();
    const geneId = rowData[1];  // Assuming gene_id is in the second column
    
    // Highlight the corresponding circle in both scatter plots
    scatterPlot1.selectAll('circle').filter(d => d.Gene_id === geneId)
      .attr('fill', 'red')
      .attr('r', 8).raise();
    scatterPlot2.selectAll('circle').filter(d => d.Gene_id === geneId)
      .attr('fill', 'red')
      .attr('r', 8).raise();


    var BarPlotData = processRowDataForBarChart(rowData, columnNames, controlName, treatmentName) // Process data for bar chart
    //console.log(barData)
    updateBarPlot(BarPlotData);

    d3.select("#plotTitle").text(geneId.split(';')[0].split(':')[0]);
  
  });

  rows.on('mouseout', function() {
    const rowData = table.row(this).data();
    const geneId = rowData[1];  // Assuming gene_id is in the second column
    
    // Unhighlight the corresponding circle in both scatter plots
    scatterPlot1.selectAll('circle').filter(d => d.Gene_id === geneId)
      .attr('fill', 'steelblue')
      .attr('r', 4).raise();
    scatterPlot2.selectAll('circle').filter(d => d.Gene_id === geneId)
      .attr('fill', 'steelblue')
      .attr('r', 4).raise();
    
  });

  document.getElementById('myForm').addEventListener('submit', function(e) {
    e.preventDefault();
    var colorpicker_value = document.getElementById('colorpicker_value').value;
    var geneIds = document.getElementById("textAreaIDs").value;
    geneIds =  removeNewlines(geneIds).split(" ")

    //console.log('submitting form', colorpicker_value, geneIds);

    table.columns(1).search(geneIds.join('|'), true, false).draw();


    scatterPlot1.selectAll('circle')
        .filter(d => geneIds.includes(d.Gene_id))
        .attr('fill', colorpicker_value)
        .attr('r', 4).raise();

    scatterPlot2.selectAll('circle')
        .filter(d => geneIds.includes(d.Gene_id))
        .attr('fill', colorpicker_value)
        .attr('r', 4).raise();
  });


  document.getElementById('myForm').addEventListener('reset', function(e) {

    scatterPlot1.selectAll('circle')
        
        .attr('fill', 'steelblue')
        .attr('r', 4).raise();

    scatterPlot2.selectAll('circle')
        
        .attr('fill', 'steelblue')
        .attr('r', 4).raise();

    table.search('').columns().search('').draw(); 
        
  });


  document.getElementById('search-visible').addEventListener('click', function(e) {
    e.preventDefault();
    var colorpicker_value = document.getElementById('colorpicker_value_table').value;
    //console.log(colorpicker_value)
    //var colorpicker_value='red'
    var selectedRows = table.rows({ search: 'applied' }).data()
    var geneIds = [];
    for (i = 0; i < selectedRows.length; i++){geneIds.push(selectedRows[i][1])}
    
    scatterPlot1.selectAll('circle')
        .filter(d => geneIds.includes(d.Gene_id))
        .attr('fill', colorpicker_value)
        .attr('r', 4).raise();
  
    scatterPlot2.selectAll('circle')
        .filter(d => geneIds.includes(d.Gene_id))
        .attr('fill', colorpicker_value)
        .attr('r', 4).raise();
  });




}




function addInteractivity(table, scatterPlot1, scatterPlot2, completedBarPlot, controlName, treatmentName) {

    addHilight(table, scatterPlot1, scatterPlot2, completedBarPlot,  controlName, treatmentName);

    //activateBarPlor(table, scatterPlot1, scatterPlot2, completedBarPlot);

  }




