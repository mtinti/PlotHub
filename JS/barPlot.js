function createBarPlot(data, svgElementId) {
    // Define the dimensions of your chart
    var margin = {top: 20, right: 20, bottom: 30, left: 40},
        width = 960 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;
  
    // Define the x and y scales
    var x = d3.scaleBand()
        .rangeRound([0, width])
        .paddingInner(0.1)
        .domain(data.map(function(d) { return d.name; }));
  
    var y = d3.scaleLinear()
        .range([height, 0])
        .domain([0, d3.max(data, function(d) { return d.value; })]);
  
    // Select the SVG container for the chart
    var svg = d3.select("#" + svgElementId)
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // Add X Axis label
    svg.append("text")
        .attr("transform", `translate(${width / 2}, ${height + margin.bottom + 10})`)  // Position at the middle of the x-axis, slightly below
        .style("text-anchor", "middle")
        .text("X Axis Label");

    // Add Y Axis label
    svg.append("text")
        .attr("transform", "rotate(-90)")  // Rotate counterclockwise 90 degrees
        .attr("y", 0 - margin.left + 20)  // Position slightly to the left of the y-axis
        .attr("x", 0 - (height / 2))  // Position at the middle of the y-axis
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Y Axis Label");

  
    // Create the bars
    svg.selectAll(".bar")
        .data(data)
      .enter().append("rect")
        .attr("class", "bar")
        .attr("x", function(d) { return x(d.name); })
        .attr("width", x.bandwidth())
        .attr("y", function(d) { return y(d.value); })
        .attr("height", function(d) { return height - y(d.value); });

        





  }
  


  function updateBarPlot(newData, svgElementId) {
    // Define the dimensions of your chart
    var margin = {top: 20, right: 20, bottom: 30, left: 40},
        width = 960 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;
  
    // Define the x and y scales
    var x = d3.scaleBand()
        .rangeRound([0, width])
        .paddingInner(0.1)
        .domain(newData.map(function(d) { return d.name; }));
  
    var y = d3.scaleLinear()
        .range([height, 0])
        .domain([0, d3.max(newData, function(d) { return d.value; })]);
  
    // Select the SVG container for the chart
    var svg = d3.select("#" + svgElementId)
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .select("g");
  
    // Update the bars
    var bars = svg.selectAll(".bar")
      .data(newData);
  
    bars.enter().append("rect")
        .attr("class", "bar")
        .attr("x", function(d) { return x(d.name); })
        .attr("width", x.bandwidth())
        .attr("y", function(d) { return y(d.value); })
        .attr("height", function(d) { return height - y(d.value); });
  
    bars.transition()
        .duration(750)
        .attr("x", function(d) { return x(d.name); })
        .attr("width", x.bandwidth())
        .attr("y", function(d) { return y(d.value); })
        .attr("height", function(d) { return height - y(d.value); });
  
    bars.exit().remove();
  
    // Update the x-axis
    svg.select(".x.axis")
        .transition()
        .duration(750)
        .call(d3.axisBottom(x));
  
    // Update the y-axis
    svg.select(".y.axis")
        .transition()
        .duration(750)
        .call(d3.axisLeft(y));
  }
  