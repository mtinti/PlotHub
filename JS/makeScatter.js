function drag_this(selector_id, container_id) {


  var dragItem = document.querySelector(`#${selector_id}`);
  var container = document.querySelector(`#${container_id}`);
  
  var active = false;
  var currentX;
  var currentY;
  var initialX;
  var initialY;
  var xOffset = 0;
  var yOffset = 0;
  
  container.addEventListener("touchstart", dragStart, false);
  container.addEventListener("touchend", dragEnd, false);
  container.addEventListener("touchmove", drag, false);
  
  container.addEventListener("mousedown", dragStart, false);
  container.addEventListener("mouseup", dragEnd, false);
  container.addEventListener("mousemove", drag, false);
  
  function dragStart(e) {
    if (e.type === "touchstart") {
      initialX = e.touches[0].clientX - xOffset;
      initialY = e.touches[0].clientY - yOffset;
    } else {
      initialX = e.clientX - xOffset;
      initialY = e.clientY - yOffset;
    }
  
    if (e.target === dragItem) {
      active = true;
    }
  }
  
  function dragEnd(e) {
    initialX = currentX;
    initialY = currentY;
  
    active = false;
  }
  
  function drag(e) {
    if (active) {
    
      e.preventDefault();
    
      if (e.type === "touchmove") {
        currentX = e.touches[0].clientX - initialX;
        currentY = e.touches[0].clientY - initialY;
      } else {
        currentX = e.clientX - initialX;
        currentY = e.clientY - initialY;
      }
  
      xOffset = currentX;
      yOffset = currentY;
  
      setTranslate(currentX, currentY, dragItem);
    }
  }
  
  function setTranslate(xPos, yPos, el) {
    el.style.transform = "translate3d(" + xPos + "px, " + yPos + "px, 0)";
  }
  
  }

  
function createScatterPlot(data, xColumn, yColumn, chartElementId, onBrushEnd) {

  return new Promise((resolve) => {
    const margin = {top: 20, right: 20, bottom: 30, left: 40};
    const width = 960 - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;

    const clipId = `clip-${chartElementId}`;

    const svg = d3.select(`#${chartElementId}`)
      .attr("viewBox", [0, 0, width, height]);

    const clip = svg.append("defs").append("svg:clipPath")
      .attr("id", clipId)
      .append("svg:rect")
      .attr("width", width - margin.left - margin.right)
      .attr("height", height - margin.top - margin.bottom)
      .attr("x", margin.left)
      .attr("y", margin.top);
    
    
    const scatter = svg.append('g').attr("id", clipId + "scatterplot")
      .attr("clip-path", `url(#${clipId})`);


    const xDomain = d3.extent(data, d => Number(d[xColumn]));
    const yDomain = d3.extent(data, d => Number(d[yColumn]));

    const xRange = xDomain[1] - xDomain[0];
    const yRange = yDomain[1] - yDomain[0];

    xDomain[0] -= xRange * 0.05;  // 5% padding on the left
    xDomain[1] += xRange * 0.05;  // 5% padding on the right

    yDomain[0] -= yRange * 0.05;  // 5% padding on the bottom
    yDomain[1] += yRange * 0.05;  // 5% padding on the top

    const xScale = d3.scaleLinear()
      .domain(xDomain)
      .range([margin.left, width - margin.right]);

    const yScale = d3.scaleLinear()
      .domain(yDomain)
      .range([height - margin.bottom, margin.top]);

    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3.axisLeft(yScale);

    svg.append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(xAxis)
      .attr('class', 'x axis');

    svg.append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(yAxis)
      .attr('class', 'y axis');

    // After the x-axis is created...
    svg.selectAll(".x.axis .tick text")
      .style("font-size", "16px");  // Change this to your desired font size

    // After the y-axis is created...
    svg.selectAll(".y.axis .tick text")
      .style("font-size", "16px");  // Change this to your desired font size

    // After the x-axis is created...
    svg.selectAll(".x.axis .tick line")
      .style("stroke-width", "2px");  // Change this to your desired stroke width

    // After the y-axis is created...
    svg.selectAll(".y.axis .tick line")
      .style("stroke-width", "2px");  // Change this to your desired stroke width

    // Add X Axis label
    svg.append("text")
    .attr("transform", `translate(${width - 20}, ${height - margin.bottom -10})`)  // Position at the far right of the x-axis, halfway up the bottom margin
    .style("text-anchor", "end")  // Right-align the text
    .text(xColumn);

    // Add Y Axis label
    svg.append("text")
    .attr("transform", `rotate(-90)`)  // Rotate counterclockwise 90 degrees
    .attr("y", margin.left +10)  // Position halfway through the left margin
    .attr("x", 0 - margin.top)  // Position at the top of the y-axis
    .attr("dy", "1em")
    .style("text-anchor", "end")  // Right-align the text (after rotation, this is actually top-alignment)
    .text(yColumn)      


    //brush to happen before circle
    const brush = d3.brush() // Create a 2D brush
      .extent([[margin.left, margin.top], [width - margin.right, height - margin.bottom]])
      .on("end", brushended);

    //attach brush to the scatter
    //so that tooltip can be visualize
    scatter.append("g")
        .attr("class", "brush")
        .call(brush);   

  const defaultRadius = 4;
  const defaultColor = "steelblue";
  const circles = scatter.selectAll(".dot")
    .data(data)
    .join("circle")
    .attr("cx", d => xScale(d[xColumn]))
    .attr("cy", d => yScale(d[yColumn]))
    .attr("r", d => d.radius || defaultRadius)
    .attr("fill", d => d.color || defaultColor)
    .on("click", function(event, d) {
        // Replace periods in the gene id with underscores
        const textId = chartElementId+"_text_box_" + d.Gene_id.replace(/[^a-zA-Z0-9_-]/g, "_");
        
        // Check if a text element with this ID already exists
        if (!d3.select("#" + textId).empty()) {
            // If it does, remove it
            d3.select("#" + textId).remove();
        } else {
            // Otherwise, ask the user for a label
            const label = prompt("Please enter a name", d.Gene_id);
            // Add a text label near the clicked circle
            svg.append("text")
                .attr("id", textId)
                .attr("x", xScale(d[xColumn]))
                .attr("y", yScale(d[yColumn]) - 10)  // Offset the label slightly above the circle
                .text(label)
                .attr("font-family", "sans-serif")
                .attr("font-size", "16px")
                .attr("fill", "black");

            drag_this(textId, chartElementId);
        }
    });






    function brushended(event) {
      if (!event.selection) return; // Ignore empty selections.
    
      // Coords of the selection
      const [[x0, y0], [x1, y1]] = event.selection;
    
      // Transform these coordinates to the corresponding data values using the scales
      const xSelection = [x0, x1].map(xScale.invert, xScale);
      const ySelection = [y1, y0].map(yScale.invert, yScale);
    
      // Initialize an empty array to hold the selected IDs
      const selectedIDs = [];
    
      // Loop over all circles
      circles.each(function(d) {
        // Check if this circle's coordinates fall within the brushed area
        if (xSelection[0] <= d[xColumn] && d[xColumn] <= xSelection[1] &&
            ySelection[0] <= d[yColumn] && d[yColumn] <= ySelection[1]) {
          // If they do, add this circle's ID to the selectedIDs array
          selectedIDs.push(d.Gene_id);
        }
      });
    
      //console.log('selectedIDs', selectedIDs);

      onBrushEnd(selectedIDs);

    
      // Set new domain for xScale and yScale based on the brush selection
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

    console.log('Scatter plot', chartElementId, 'created');
    resolve( scatter );
  });
}