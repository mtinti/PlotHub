// Function to create the bar plot
function createBarPlot(svgID, data, controlName, treatmentName) {
    // Set the dimensions and margins of the graph
    var margin = {top: 30, right: 30, bottom: 30, left: 100},
        width = 460 - margin.left - margin.right,
        height = 200 - margin.top - margin.bottom;

    // Append the svg object to the specified div
    var svg = d3.select(svgID)
      //.append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom+40)
      .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // X scale and X axis
    var x = d3.scaleLinear()
        .range([0, width]);

    var xAxis = svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .attr("class", "x-axis")
        .call(d3.axisBottom(x).tickFormat(function(d) {
            var formatted = d3.format(".2s")(d);
            //console.log('formatted',formatted);
            return formatted;
        }));
    
    // Y scale and Y axis
    var y = d3.scaleBand()
        .range([height, 0])
        .padding(0.1);
    var yAxis = svg.append("g")
        .attr("class", "y-axis");
    
    var color = d3.scaleOrdinal()
        .range(["#1f77b4", "#ff7f0e"])  // Set your colors here
        .domain([controlName, treatmentName]);

    // Append the legend
    var legend = svg.selectAll('.legend')
        .data(color.domain())
        .enter().append('g')
        .attr('class', 'legend')
        .attr('transform', function(d, i) { 
            return 'translate(' + i * 120 + ',' + (height + 50) + ')';  // Adjust the position here
        });

    legend.append('circle')
        .attr('class', d => `${d}`)  // Assign a class based on control or treatment name
        .attr('cx', 0)
        .attr('cy', 9)  // Adjust the vertical position to center the circle
        .attr('r', 9)  // The radius of the circle
        .style('fill', function(d) { return color(d); })
        .on("mouseover", function(event, d) {
            svg.selectAll(`rect:not(.${d})`)
                .transition()
                .duration(200)
                .style("opacity", 0.3);
        })
        .on("mouseout", function(event, d) {
            svg.selectAll("rect")
                .transition()
                .duration(200)
                .style("opacity", 1);
        });
        

    // Draw legend text
    // Draw legend text
    legend.append('text')
        .attr('x', 22)  // Position the text a little to the right of the rectangle
        .attr('y', 9)
        .attr('dy', '.35em')
        .style('text-anchor', 'start')  // Align the text to the start of the text area
        .text(function(d) { return d === controlName ? controlName : treatmentName; });
    
    console.log('treatmentName : controlName inside barplot', treatmentName , controlName);
    // Add X Axis label
    svg.append("text")
        .attr("transform", `translate(${width / 2}, ${height + margin.top + 10})`)  // Position at the middle of the x-axis, slightly below
        .attr("id", 'box_plot_xAxis_name')
        .style("text-anchor", "middle")
        .text("Intensity")
        .style("font-family", "sans-serif")
        .style("font-size", "12px")
        .style("fill", "black");

    // Add title to plot
    svg.append("text")
        .attr("id", "plotTitle")  // Assign id to the text element
        .attr("transform", `translate(${width / 2}, ${-10})`)  // Position at the top, centered
        .style("text-anchor", "middle")  // Center the text
        .text("Your Plot Title")
        .style("font-family", "sans-serif")
        .style("font-size", "16px")
        .style("fill", "black");


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



    // Update function
    function update(data) {

        //console.log('data in update bar', data);
        // Compute the minimum value in the data
        const minValue = d3.min(data, d => d.value);
        // Calculate the lower bound as minValue - 20% of minValue
        const lowerBound = minValue - Math.abs(minValue * 0.2);



       // x.domain([minValue < 0 ? minValue : 0, d3.max(data, d => d.value)]);
        x.domain([lowerBound, d3.max(data, d => d.value)]);
        y.domain(data.map(d => d.name));
        color.domain(data.map(d => d.name.startsWith(controlName) ? controlName : treatmentName));  // Define the domain for the color scale

        const range = x.domain();

        xAxis.transition().duration(500).call(d3.axisBottom(x).tickFormat( customTickFormat(range) ));
        yAxis.transition().duration(500).call(d3.axisLeft(y));

        // Update the bars
        var bars = svg.selectAll("rect")
            .data(data, d => d.name);
        
        bars.enter()
            .append("rect")
            .attr("y", d => y(d.name))
            .attr("height", y.bandwidth())
            .attr("class", d => d.name.startsWith(controlName) ? controlName : treatmentName) // add this line
            .merge(bars)  // Merging the new nodes with the existing ones
            .transition().duration(1000)
                .attr("width", d => x(d.value))
                .attr("fill", d => color(d.name.startsWith(controlName ) ? controlName : treatmentName));  // Use the color scale to set the fill color

        bars.exit().remove();
    }

    // Initial update
    update(data);

    // Return the update function
    console.log('BarPlot created');
    return update;
}
