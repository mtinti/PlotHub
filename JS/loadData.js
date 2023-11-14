
  async function processFile(data, controlName, treatmentName) {

    //d3.select("#scatterplot1").selectAll("*").remove();
    //d3.select("#scatterplot2").selectAll("*").remove();
    //d3.select("#barPlotID").selectAll("*").remove();
    //if ($.fn.dataTable.isDataTable('#table_id')) {
    //  $('#table_id').DataTable().destroy();
    //}

 

    console.log('controlName, treatmentName inside processFile', controlName, treatmentName);
    
    //here we capture the circle ids at the end of brush
    //to draw the datatable
    //this logic is too complicated to implement outside the brush, so
    //using callback to pass to the scatterplot
    function onBrushEnd(data) {
      completedTable.columns(1).search(data.join('|'), true, false).draw();
    }
  
    const scatterPlot1  = createScatterPlot(data, 'logFC', 'FDR', 'scatterplot1', onBrushEnd);
    const scatterPlot2  = createScatterPlot(data, 'log_AveExpr', 'logFC', 'scatterplot2', onBrushEnd);
  
    const completedScatterPlot1 = await scatterPlot1;
    const completedScatterPlot2 = await scatterPlot2;
  
    var table = createTable(data, controlName, treatmentName);
    const completedTable = await table;
  
    //here we reset the table
    document.getElementById('reset-button').addEventListener('click', function() {
      completedTable.search('').columns().search('').draw(); 
    });
  
  
  
    var firstRowData = completedTable.row(0).data();
    let columnNames = completedTable.columns().header().map(function(header) {
      return $(header).html();
    }).toArray();
  
    var BarPlotData = processRowDataForBarChart(firstRowData, columnNames, controlName, treatmentName);
    const updateBarPlot = createBarPlot("#barPlotID", BarPlotData, controlName, treatmentName);
  
  
  
    //adding most of the interactivity table -> plot; plot -> table
    addInteractivity(completedTable, completedScatterPlot1, completedScatterPlot2, updateBarPlot, controlName, treatmentName);
    
    console.log('addInteractivity done');
  }
  
  function extractConditions(header) {
    // Split the header into an array of column names
    var columnNames = header.split(',');

    // Initialize an empty array to hold condition names
    var conditionNames = [];

    // Flag to track when we start seeing condition columns
    var startProcessing = false;

    // Loop through the column names
    for (let i = 0; i < columnNames.length; i++) {
        // Check if we have encountered 'Desc' yet
        if (columnNames[i] === 'Desc') {
            startProcessing = true;
        }

        // If we have encountered 'Desc', start processing condition names
        if (startProcessing) {
            // Split the column name on the underscore
            let parts = columnNames[i].split('_');

            // If the column name contains an underscore and the part before the underscore is not in the array, add it
            if (parts.length > 1 && !conditionNames.includes(parts[0])) {
                conditionNames.push(parts[0]);
            }
        }
    }

    // Return the array of unique condition names
    return conditionNames;
  } 


//if file is submitted
  document.querySelector('.dropdown-menu form').addEventListener('submit', function(evt) {
    evt.preventDefault();

    var fileInput = document.getElementById('csvFile');
    var file = fileInput.files[0];

    if (!file) {
        alert('Please select a file to upload.');
        return;
    }

    // Disable the submit button and display the message
    var submitButton = document.querySelector('.dropdown-menu form button[type="submit"]');
    submitButton.disabled = true;
    submitButton.innerText = "File uploaded. Please refresh the page to upload another file.";

    var submitButton = document.querySelector('#uploadTestFile');
    submitButton.disabled = true;
    submitButton.innerText = "File uploaded. Please refresh the page to upload another file.";

    var reader = new FileReader();



    document.getElementById('loadingSpinner').style.display = 'block';
    
    reader.onload = (function(file) {
        return function(e) {
            var data = d3.csvParse(this.result);
            var headers = this.result.split('\n')[0];
            var conditionNames = extractConditions(headers);
            var controlName = conditionNames[0];
            var treatmentName = conditionNames[1];

            processFile(data, controlName, treatmentName).then(function() {
                document.getElementById('loadingSpinner').style.display = 'none';
            });
        };
    })(file);
   
    reader.readAsText(file);

});


//if example file is submitted
document.getElementById('uploadTestFile').addEventListener('click', function() {
  // Show loading spinner
  document.getElementById('loadingSpinner').style.display = 'block';

  var submitButton = document.querySelector('#uploadTestFile');
  submitButton.disabled = true;
  submitButton.innerText = "File uploaded. Please refresh the page to upload another file.";

  var submitButton = document.querySelector('.dropdown-menu form button[type="submit"]');
  submitButton.disabled = true;
  submitButton.innerText = "File uploaded. Please refresh the page to upload another file.";

  
  // AJAX request to get the test file from the server
  fetch('df_for_web.csv') // adjust the path accordingly
  .then(response => response.text())
  .then(data => {
      // Parse the CSV data
      var parsedData = d3.csvParse(data);
      var headers = data.split('\n')[0];
      var conditionNames = extractConditions(headers);
      var controlName = conditionNames[0];
      var treatmentName = conditionNames[1];

      return processFile(parsedData, controlName, treatmentName);
  })
  .then(() => {
      // Hide loading spinner after processing the file
      document.getElementById('loadingSpinner').style.display = 'none';
  })
  .catch(error => {
      console.error("Error fetching the test file:", error);
      document.getElementById('loadingSpinner').style.display = 'none';
  });
});

