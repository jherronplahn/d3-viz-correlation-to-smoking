//  The code for the chart is wrapped inside a function that
// automatically resizes the chart
function makeResponsive() {

  // if the SVG area isn't empty when the browser loads,
  // remove it and replace it with a resized version of the chart
  var svgArea = d3.select("body").select("svg");

  // clear svg is not empty
  if (!svgArea.empty()) {
    svgArea.remove();
  }


  var svgWidth = 960;
  var svgHeight = 500;

  var margin = {
    top: 25,
    right: 40,
    bottom: 80,
    left: 100
  };

  var width = svgWidth - margin.left - margin.right;
  var height = svgHeight - margin.top - margin.bottom;

  // Create an SVG wrapper, append an SVG group that will hold our chart,
  // and shift the latter by left and top margins.
  var svg = d3
    .select(".chart")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight + 100);

  // Append an SVG group
  var chartGroup = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

  // Initial Params
  var chosenXAxis = "poverty";

  // function used for updating x-scale var upon click on axis label
  function xScale(demographicsData, chosenXAxis) {
    // create scales
    var xLinearScale = d3.scaleLinear()
      .domain([d3.min(demographicsData, d => d[chosenXAxis]) * 0.8,
      d3.max(demographicsData, d => d[chosenXAxis]) * 1.2
      ])
      .range([0, width]);

    return xLinearScale;

  }

  // function used for updating xAxis var upon click on axis label
  function renderAxes(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);

    xAxis.transition()
      .duration(1000)
      .call(bottomAxis);

    return xAxis;
  }

  // function used for updating circles group with a transition to
  // new circles
  function renderCircles(circlesGroup, newXScale, chosenXaxis) {

    circlesGroup.transition()
      .duration(1000)
      .attr("cx", d => newXScale(d[chosenXAxis]));

    return circlesGroup;
  }
// *******************************************************************
  // FUNCTION FOR CIRCLE TEXT - STATE ABBR - DISABLED
  // function textScatter(textGroup, newXScale, chosenXAxis){
    
  //   textGroup.transition()
  //   .duration(1000)
  //   .attr("x", d => newXScale(d[chosenXAxis]))
  //   .attr("y", d => yLinearScale(d.smokes));

  //   return textGroup;
  // }
// *******************************************************************

  // function used for updating circles group with new tooltip
  function updateToolTip(chosenXAxis, circlesGroup) {

    if (chosenXAxis === "poverty") {
      var label = "% in Poverty:";
    }
    else if (chosenXAxis === "age") {
      var label = "Median Age:";
    }
    else if (chosenXAxis === "obesity") {
      var label = "% Obese:";
    }
    else if (chosenXAxis === "income") {
      var label = "Median Income";
    }
    else {
      var label = "% Lack Healthcare"
    }

    var toolTip = d3.tip()
      .attr("class", "tooltip")
      .offset([100, -70])
      .html(function (d) {
        return (`${d.abbr}<br>${label} ${d[chosenXAxis]}<br>% that Smoke: ${d.smokes}`);
      });

    circlesGroup.call(toolTip);

    circlesGroup.on("mouseover", function (data) {
      toolTip.show(data);
    })
      // onmouseout event
      .on("mouseout", function (data, index) {
        toolTip.hide(data);
      });

    return circlesGroup;
  }

  // Retrieve data from the CSV file and execute everything below
  d3.csv("demographicsData.csv", function (err, demographicsData) {
    if (err) throw err;

    // parse data
    demographicsData.forEach(function (data) {
      data.poverty = +data.poverty;
      data.smokes = +data.smokes;
      data.age = +data.age;
      data.obesity = +data.obesity;
      data.healthcare = +data.healthcare;
      data.income = +data.income;
    });

    // xLinearScale function above csv import
    var xLinearScale = xScale(demographicsData, chosenXAxis);

    // Create y scale function
    var yLinearScale = d3.scaleLinear()
      .domain([0, d3.max(demographicsData, d => d.smokes)])
      .range([height, 0]);

    // Create initial axis functions
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    // append x axis
    var xAxis = chartGroup.append("g")
      .classed("x-axis", true)
      .attr("transform", `translate(0, ${height})`)
      .call(bottomAxis);

    // append y axis
    chartGroup.append("g")
      .call(leftAxis);

    // append initial circles

    var scatterGroup = chartGroup.selectAll("circle")
      .data(demographicsData)
      .enter()

    var circlesGroup = scatterGroup
      .append("circle")
      .attr("cx", d => xLinearScale(d[chosenXAxis]))
      .attr("cy", d => yLinearScale(d.smokes))
      .attr("r", 15)
      .classed("stateCircle", true)

// ****************************************************
  // APPEND CIRCLE TEXT - STATE ABBR - DISABLED
    // var textGroup = scatterGroup
    //   .append("text")
    //   .attr("x", d => xLinearScale(d[chosenXAxis]))
    //   .attr("y", d => yLinearScale(d.smokes))
    //   .style("font-size", "13px")
    //   .style("text-anchor", "middle")
    //   .style('fill', 'white')
    //   .text(d => (d.abbr));
// ****************************************************
    
    // Create group for  5 x- axis labels
    var labelsGroup = chartGroup.append("g")
      .attr("transform", `translate(${width / 2}, ${height + 20})`);

    var povertyLabel = labelsGroup.append("text")
      .attr("x", 0)
      .attr("y", 20)
      .attr("value", "poverty") // value to grab for event listener
      .classed("active", true)
      .classed("axis-text", true)
      .text("Demographics Factor: Percent in Poverty Per State");

    var ageLabel = labelsGroup.append("text")
      .attr("x", 0)
      .attr("y", 50)
      .attr("value", "age") // value to grab for event listener
      .classed("inactive", true)
      .classed("axis-text", true)
      .text("Demographics Factor: Median Age Per State");

    var incomeLabel = labelsGroup.append("text")
      .attr("x", 0)
      .attr("y", 80)
      .attr("value", "income")
      .classed("inactive", true)
      .classed("axis-text", true)
      .text("Demographics Factor: Median Income Per State");

    var obesityLabel = labelsGroup.append("text")
      .attr("x", 0)
      .attr("y", 110)
      .attr("value", "obesity")
      .classed("inactive", true)
      .classed("axis-text", true)
      .text("Health Risk Factor: Percent Obese Per State");

    var healthcareLabel = labelsGroup.append("text")
      .attr("x", 0)
      .attr("y", 140)
      .attr("value", "healthcare")
      .classed("inactive", true)
      .classed("axis-text", true)
      .text("Health Risk Factor: Percent Lacking Healthcare Per State")

    // append y axis
    chartGroup.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 40 - margin.left)
      .attr("x", 0 - (height / 2))
      .attr("dy", "1em")
      .classed("axis-text", true)
      .text("Percent that Smoke Per State");

    // updateToolTip function above csv import
    var circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

    // x axis labels event listener
    labelsGroup.selectAll("text")
      .on("click", function () {
        // get value of selection
        var value = d3.select(this).attr("value");
        if (value !== chosenXAxis) {

          // replaces chosenXAxis with value
          chosenXAxis = value;

          // functions here found above csv import
          // updates x scale for new data
          xLinearScale = xScale(demographicsData, chosenXAxis);

          // updates x axis with transition
          xAxis = renderAxes(xLinearScale, xAxis);

          // updates circles with new x values
          circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis);

        // ***********************************************
          // UPDATE CIRCLE TEXT WITH NEW X VALUES - DISABLED 
          // textGroup = textScatter(textGroup, xLinearScale, chosenXAxis);
        // ***********************************************

          // updates tooltips with new info
          circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

          // changes classes to bold text
          if (chosenXAxis === "age") {
            ageLabel
              .classed("active", true)
              .classed("inactive", false);
            povertyLabel
              .classed("active", false)
              .classed("inactive", true);
            incomeLabel
              .classed("active", false)
              .classed("inactive", true);
            obesityLabel
              .classed("active", false)
              .classed("inactive", true);
            healthcareLabel
              .classed("active", false)
              .classed("inactive", true);

          }
          else if (chosenXAxis === "poverty") {
            ageLabel
              .classed("active", false)
              .classed("inactive", true);
            povertyLabel
              .classed("active", true)
              .classed("inactive", false);
            incomeLabel
              .classed("active", false)
              .classed("inactive", true);
            obesityLabel
              .classed("active", false)
              .classed("inactive", true);
            healthcareLabel
              .classed("active", false)
              .classed("inactive", true);
          }
          else if (chosenXAxis === "income") {
            ageLabel
              .classed("active", false)
              .classed("inactive", true);
            povertyLabel
              .classed("active", false)
              .classed("inactive", true);
            incomeLabel
              .classed("active", true)
              .classed("inactive", false);
            obesityLabel
              .classed("active", false)
              .classed("inactive", true);
            healthcareLabel
              .classed("active", false)
              .classed("inactive", true);
          }
          else if (chosenXAxis === "obesity") {
            ageLabel
              .classed("active", false)
              .classed("inactive", true);
            povertyLabel
              .classed("active", false)
              .classed("inactive", true);
            incomeLabel
              .classed("active", false)
              .classed("inactive", true);
            obesityLabel
              .classed("active", true)
              .classed("inactive", false);
            healthcareLabel
              .classed("active", false)
              .classed("inactive", true);
          }
          else {
            ageLabel
              .classed("active", false)
              .classed("inactive", true);
            povertyLabel
              .classed("active", false)
              .classed("inactive", true);
            incomeLabel
              .classed("active", false)
              .classed("inactive", true);
            obesityLabel
              .classed("active", false)
              .classed("inactive", true);
            healthcareLabel
              .classed("active", true)
              .classed("inactive", false);
          }
        }
      });
  });

}

// When the browser loads, makeResponsive() is called.
makeResponsive();

// When the browser window is resized, makeResponsive() is called.
d3.select(window).on("resize", makeResponsive);