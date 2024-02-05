function numberParser(value) {
  return (+value) ? parseFloat(value).toFixed(2) : value;
}

function buildTable(data, controlName, treatmentName) {


  var columns = Object.keys(data[0]);
  //console.log('columns in buildTable', columns);

  var table = d3.select("#table_id"),
      thead = table.append("thead"),
      tbody = table.append("tbody");

  // append the header row
  thead.append("tr")
      .selectAll("th")
      .data(columns)
      .enter()
      .append("th")
      .text(function(column) { return column; });

  // create a row for each object in the data
  var rows = tbody.selectAll("tr")
      .data(data)
      .enter()
      .append("tr");

  // create a cell in each row for each column
  var cells = rows.selectAll("td")
      .data(function(row) {
          return columns.map(function(column) {
              return {column: column, value: row[column]};
          });
      })
      .enter()
      .append("td")
      .text(function(d) { return d.value; });

  return table;
}
    // Sample function to decide format based on data range or type
function customTickFormat(range) {
      const [min, max] = range;
  
      // Example condition for log scale with negative values
      if (max <= 100) {
      // More precision for smaller ranges, e.g., log scale data
      return d3.format(".2f"); // Fixed point notation
      } else {
      // SI-prefix for larger ranges, suitable for raw values in the range 0 to millions
      return d3.format(".1s");
      }
  }


function createTable(data, controlName, treatmentName) {

    return new Promise((resolve) => {
        // make the table
        buildTable(data, controlName, treatmentName)



        var columns = Object.keys(data[0]);
        //console.log('columns in createTable', columns);


        const columnRanges = {};
        columns.forEach(column => {
          if (column.startsWith(controlName) || column.startsWith(treatmentName)) {
            const values = data.map(row => +row[column]).filter(value => !isNaN(value));
            columnRanges[column] = [Math.min(...values), Math.max(...values)];
          }
        });
        //console.log('columnRanges',columnRanges);




        var formatter = d3.format(".1s");

        let columnDefs = columns.map((column, index) => {
          let defs = {
            "targets": index,
            "searchable": false,
            "orderable": true,
            render: function(data, type, raw) {
              // Check if the current column is 'Gene_id'
              if (column === 'Gene_id') {
                // Set the maximum length for the text
                const maxLength = 15;  // Adjust maxLength as needed
                // Check if the data exceeds the maximum length
                if (data.length > maxLength) {
                  // Return a span with the full data in the title attribute for the tooltip
                  // and the truncated data for display
                  return `<span title="${data}">${data.substr(0, maxLength)}...</span>`;
                }
              }

              if (column === 'Desc') {
                // Set the maximum length for the text
                const maxLength = 25;  // Adjust maxLength as needed
                // Check if the data exceeds the maximum length
                if (data.length > maxLength) {
                  // Return a span with the full data in the title attribute for the tooltip
                  // and the truncated data for display
                  return `<span title="${data}">${data.substr(0, maxLength)}...</span>`;
                }
              }       

              // Apply formatter only to columns starting with controlName or treatmentName
              if (column.startsWith(controlName) || column.startsWith(treatmentName)) {
                
                if (isNaN(data)) {
                  return data;
                } else {
                  const range = columnRanges[column];
                  const format = customTickFormat(range);
                  //console.log('data formatter',data)
                  return format(+data);  // Apply the d3 formatter
                }
              } else {
                return numberParser(data);
              }
            }
          };
        
          if (['Gene_acc', 'Gene_id', 'Desc'].includes(column)) {
            defs.searchable = true;
          }
        
          if (column === 'Gene_acc') {
            defs.visible = false;
          }

          if (column.startsWith(controlName) || column.startsWith(treatmentName)) {
            defs.orderable = false;
          };
        
          return defs;
        });
        


        var dataTable = $('#table_id').DataTable(

            {
              
                "dom": 'lfrtipB',
                "buttons": [{ extend: 'csv', text: 'Download table as csv' }],
                "search": {"regex": true},
                "lengthMenu": [[-1, 5, 10, 20, 25, 50, 100 ], 
                [ 'Show all', '5 rows', '10 rows', '20 rows', '25 rows', '50 rows', '100 rows' ]],
                "pageLength": 6,
                "scrollX": true,
                "columnDefs": columnDefs,
      
                "fnInfoCallback": function( oSettings, iStart, iEnd, iMax, iTotal, sPre ) {
                  return 'Showing '+iStart +" to "+ iEnd +' of '+iTotal+' entries. Scroll right to see more columns.';},
      
                
                "bSortClasses": false,
                //https://stackoverflow.com/questions/38575079/
                'createdRow': function(nRow, aData, iDataIndex) {
                  //console.log('aData',aData);
                  $(nRow).attr('id', 'row_' + aData[0]); // or if you prefer 'row' + aData.aid + aData.bid
                }
 
            }

        );
  
  
        console.log('Table created');
        //dataTable.setFontSizeColumn(2,2)
        resolve(dataTable);
    });
  }


  