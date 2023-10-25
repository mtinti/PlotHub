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

function createTable(data, controlName, treatmentName) {
    return new Promise((resolve) => {
        // make the table
        buildTable(data, controlName, treatmentName)

        var columns = Object.keys(data[0]);
        //console.log('columns in createTable', columns);

        var formatter = d3.format(".1s");

        let columnDefs = columns.map((column, index) => {
          let defs = {
            "targets": index,
            "searchable": false,
            render: function(data, type, raw) { 
              
  
                // Apply formatter only to columns starting with controlName or treatmentName
                if (column.startsWith(controlName) || column.startsWith(treatmentName)) {
                  if (isNaN(data)) {
                    return data;
                  } else {
                    return formatter(+data);  // apply the d3 formatter
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


  