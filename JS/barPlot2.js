// Function to create the bar plot
function createBarPlot(svgID, data) {
    // Set the dimensions and margins of the graph
    var margin = {top: 20, right: 30, bottom: 40, left: 90},
        width = 460 - margin.left - margin.right,
        height = 400 - margin.top - margin.bottom;

    // Append the svg object to the specified div
    var svg = d3.select(svgID)
      .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // X scale and X axis
    var x = d3.scaleLinear()
        .range([0, width]);
    var xAxis = svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .attr("class", "x-axis");
    
    // Y scale and Y axis
    var y = d3.scaleBand()
        .range([height, 0])
        .padding(0.1);
    var yAxis = svg.append("g")
        .attr("class", "y-axis");
    
    // Update function
    function update(data) {
        x.domain([0, d3.max(data, d => d.value)]);
        y.domain(data.map(d => d.name));

        xAxis.transition().duration(1000).call(d3.axisBottom(x));
        yAxis.transition().duration(1000).call(d3.axisLeft(y));

        // Update the bars
        var bars = svg.selectAll("rect")
            .data(data, d => d.name);
        
        bars.enter()
            .append("rect")
            .attr("y", d => y(d.name))
            .attr("height", y.bandwidth())
            .merge(bars)  // Merging the new nodes with the existing ones
            .transition().duration(1000)
                .attr("width", d => x(d.value))
                .attr("fill", (d, i) => i < 3 ? "#1f77b4" : "#ff7f0e");

        bars.exit().remove();
    }

    // Initial update
    update(data);

    // Return the update function
    return update;
}

