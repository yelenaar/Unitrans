$(document).ready(function(){
//insert javascript drop down selection list
//all stops // stopTag, stopTitle, stopLat, stopLon
var routeStops = new Array(), prev = 0, allrStops = new Array();
    d3.csv("routeStops.csv", function(data){
        d3.select("#selectedStop")
           .append("option")
           .text("");
        data.forEach(function(d){
            allrStops.push(d);
            if(prev != d.stopTitle){
                prev = d.stopTitle;
                d3.select("#selectedStop")
                     .append("option")
                     .text(d.stopTitle);
            }
        });
    });//take in all stop's information
var formatx = d3.time.format("%Y-%m-%dT%X").parse;
    d3.csv("totalInfo.csv", function(data){
        data.forEach(function(d){
            d.epoch = formatx(d.date+"T"+d.time);
            d.epoch = +d.epoch;
            d.boarding = +d.boarding;
            d.deboarding = -d.deboarding;
            routeStops.push(d);
        });
           var tempA = routeStops.filter(function(d){return d.route == "J"&&d.stopTitle=="Anderson Rd & Hanover Dr (SB)";});
           tempA.sort(function(a,b){return -(a.epoch - b.epoch);});
           stackx.domain(d3.extent(tempA, function(d){return new Date(d.epoch);}));
           stacky.domain([d3.min(tempA, function(d) {return d.deboarding;}), d3.max(tempA, function(d) {return d.boarding;})]);
           
        barea.x(function(d){return stackx(new Date(d.epoch));})
           .y0(stacky(0))
           .y1(function(d){return stacky(d.boarding);})
           .interpolate("monotone");
        darea.x(function(d){return stackx(new Date(d.epoch)); })
           .y0(function(d){return stacky(d.deboarding);})
           .y1(stacky(0))
           .interpolate("monotone");
           
        svg.append("path")
           .attr("transform", "translate(0," + 340 + ")")
            .datum(tempA)
            .attr("class", "area")
            .attr("d", barea)
            .style("opacity", 0.5)
           .style("fill", colors("J"));
           
        svg.append("path")
           .attr("transform", "translate(0," + 340 + ")")
           .datum(tempA)
           .attr("class", "area")
           .attr("d", darea)
           .style("opacity", 0.5)
           .style("fill", colors("J"));
  
        svg.append("g")
           .attr("class", "x axis")
           .attr("id","stackXaxis")
           .attr("transform", "translate(0," + 490 + ")")
           .call(stackxAxis);
           
        svg.append("g")
           .attr("class", "y axis")
           .attr("id", "stackYaxis")
           .attr("transform", "translate(0," + 340 + ")")
           .call(stackyAxis)
           .append("text")
           .attr("id", "stacktt")
           .attr("transform", "rotate(-90)")
           .attr("y", 6)
           .attr("dy", ".71em")
           .style("text-anchor", "end")
           .text("Load");
        svg.append("g")
           .attr("id", "stackt")
           .attr("transform", "translate(0," + 460 + ")")
           .append("text")
           .attr("transform", "rotate(-90)")
           .attr("y", 6)
           .attr("dy", ".71em")
           .style("text-anchor", "end")
           .text("Unload");
           svg.selectAll(".area, #stackYaxis, #stacktt, #stackt, #stackXaxis, .areaclose").style("visibility", "hidden");
    });//take in all logs' information
                  
var selectedStop, routesForStop;
d3.select("#selectedStop").on("change",
function stopSelect(){
    var mylist=document.getElementById("selectedStop");
    selectedStop = mylist.options[mylist.selectedIndex].text;
    routesForStop = allrStops.filter(function(d){return d.stopTitle == selectedStop});
    if(selectedStop != "") updateArea();
}
);
 
function updateArea(){
    var upper, lower;
    svg.selectAll(".area, .areaRoutes").remove();
    if(selectedPeriod.length == 0 && selectedDay == 0){upper =new Date(2012, 9, 31); lower = new Date(2012, 9, 1);}
                  else if(selectedDay != 0 && selectedPeriod.length == 0){upper = new Date(selectedDay+86400000); lower = new Date(selectedDay);console.log(upper + "," + lower);}
    else{upper = new Date(selectedPeriod[1]); lower = new Date(selectedPeriod[0]);}
        //          console.log(upper + "," + lower);
                  
    var tempx = routeStops.filter(function(d){return d.stopTitle==selectedStop && new Date(d.epoch) < upper && new Date(d.epoch) > lower;});
        tempx.sort(function(a,b){return (a.epoch - b.epoch);});
        stackx.domain(d3.extent(tempx, function(d){return new Date(d.epoch);}));
        stacky.domain([d3.min(tempx, function(d) {return d.deboarding;}), d3.max(tempx, function(d) {return d.boarding;})]);
                  svg.select("#stackXaxis").call(stackxAxis);
                  svg.select("#stackYaxis").call(stackyAxis);
    
    var areaRoutes = svg.selectAll(".areaRoutes")
                  .data(routesForStop.map(function(d){return d.route;}))
                  .enter().append("g")
                  .attr("class", "areaRoutes")
                  .attr("transform", function(d,i) {return "translate("+(width*3/4+30)+","+(i*23+350)+")";});
                areaRoutes.append("rect")
                  .attr("x", 0)
                  .attr("width", 18)
                  .attr("height", 18)
                  .style("stroke","black")
                  .style("fill", function(d){return colors(d);});
                areaRoutes.append("text")
                  .attr("x", 0)
                  .attr("y", 9)
                  .attr("dx", "1.4em")
                  .attr("dy", ".35em")
                  .style("fill", "white")
                  .style("text-anchor", "end")
                  .text(function(d){return d;});
        areaRoutes.on("mouseover", function(){d3.select("body").style("cursor","pointer");})
                  .on("mouseout", function(){d3.select("body").style("cursor","auto");});
        areaRoutes.on("click", function(d,i){
                if(d3.select(this).select("rect").style("fill") != "#adadad"){
                    d3.select(this).select("rect").style("fill","#adadad").style("stroke","none");
                    svg.selectAll("#"+d+"Area").style("visibility", "hidden");
                }//deselect routes
                else{
                    d3.select(this).select("rect").style("fill",colors(d)).style("stroke","black");
                    svg.selectAll("#"+d+"Area").style("visibility", "visible");
                }//select routes
        });
                  
    for(var k = 0; k < routesForStop.length; k++){
    var r = routesForStop[k].route;
    var tempA = routeStops.filter(function(d){return d.route == r&&d.stopTitle==selectedStop && new Date(d.epoch) < upper && new Date(d.epoch) > lower;});
        tempA.sort(function(a,b){return (a.epoch - b.epoch);});
                  
            barea.x(function(d){return stackx(new Date(d.epoch));})
                  .y0(stacky(0))
                  .y1(function(d){return stacky(d.boarding);})
                  .interpolate("monotone");
            darea.x(function(d){return stackx(new Date(d.epoch)); })
                  .y0(function(d){return stacky(d.deboarding);})
                  .y1(stacky(0))
                  .interpolate("monotone");
                  
            svg.append("path")
                  .attr("transform", "translate(0," + 340 + ")")
                  .datum(tempA)
                  .attr("class", "area")
                  .attr("id", r+"Area")
                  .attr("d", barea)
                  .style("opacity", 0.5)
                  .style("fill", colors(r));
                  
            svg.append("path")
                  .attr("transform", "translate(0," + 340 + ")")
                  .datum(tempA)
                  .attr("class", "area")
                  .attr("id", r+"Area")
                  .attr("d", darea)
                  .style("opacity", 0.5)
                  .style("fill", colors(r));
    }
    svg.selectAll("#stackYaxis, #stacktt, #stackt, #stackXaxis, .areaclose").style("visibility", "visible");
}
                  
//draw svg stuff
var margin = {top: 20, right: 80, bottom: 50, left: 50},
	width = 1440 - margin.left - margin.right,
    height = 780 - margin.top - margin.bottom;
    var parser = d3.time.format("%Y-%m-%d").parse;
//google map marker array
    var markers = []; var map;
//Selected day and lines
    var selectedDay = 0, selectedLines = new Array(), selectedPeriod = new Array(), allDaysRoutes = new Array(), selectedDaysOfMonth = [0,0,0,0,0,0,0];
    for(var i = 0; i < 7; i++){
        allDaysRoutes.push(new Array());
            for(var j = 0; j < 18; j++)
                allDaysRoutes[i].push(new Array());
    }
//line chart
    var page = 1;
    var cutouts = [new Date(2012,8,30), new Date(2012,9,31), new Date(2012,10,30), new Date(2012,11,31)];
    var x = d3.time.scale()
            .range([0, width]);
            
    var y = d3.scale.linear()
            .range([150, 0]);
            
    var xAxis = d3.svg.axis()
            .scale(x)
            .orient("bottom");
            
    var yAxis = d3.svg.axis()
            .scale(y)
            .orient("left");
//calendar view
    var cellSize = 10;
//boarding line
    var bline = d3.svg.line()
            .interpolate("monotone")
            .x(function(d) {return x(d.date);})
            .y(function(d) {return y(d.boarding);});
//deboarding line
    var dline = d3.svg.line()
            .interpolate("monotone")
            .x(function(d) {return x(d.date);})
            .y(function(d) {return y(d.deboarding);});

	var svg = d3.select("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
//arrow images
    svg.append("image")
        .attr("xlink:href", "right.svg")
        .attr("class", "arrow")
        .attr("id", "right")
        .attr("x", width-40)
        .attr("y", 15)
        .attr("width", 50)
        .attr("height", 50)
        .style("visibility", function(){return page==3 ? "hidden":"visible";});
    svg.append("image")
        .attr("xlink:href", "left.svg")
        .attr("class", "arrow")
        .attr("id", "left")
        .attr("x", width-cellSize * 8 -200)
        .attr("y", 15)
        .attr("width", 50)
        .attr("height", 50)
        .style("visibility", function(){return page==1 ? "hidden":"visible";});
    svg.append("image")
        .attr("xlink:href", "close.svg")
        .attr("class", "close")
        .attr("x", width-50)
        .attr("y", 350)
        .attr("width", 50)
        .attr("height", 50)
        .on("click", function(){svg.selectAll("#barx, #bary, #bart, #bartt, .bbar, .dbar, .barStops, .close").style("visibility", "hidden");});
    svg.append("image")
        .attr("xlink:href", "close.svg")
        .attr("class", "areaclose")
        .attr("x", width-50)
        .attr("y", 350)
        .attr("width", 50)
        .attr("height", 50)
        .style("visibility", "hidden")
        .on("click", function(){
            document.getElementById("selectedStop").selectedIndex = 0;
            svg.selectAll(".area, #stackYaxis, #stacktt, #stackt, #stackXaxis, .areaclose, .areaRoutes").style("visibility", "hidden");}
        );

    svg.selectAll(".arrow, .close, .areaclose")
        .style("opacity", 0.3)
        .on("mouseover", function(){
            d3.select("body").style("cursor","pointer");
            d3.select(this).style("opacity", 1);})
        .on("mouseout", function(){
            d3.select("body").style("cursor","auto");
            d3.select(this).style("opacity", 0.3);})
    svg.selectAll(".arrow").on("click", function(){
            if(d3.select(this).attr("id") == "right") page++;
            else page--;
            //update arrows
            d3.select("#right").style("visibility", function(){return page == 3 ? "hidden":"visible";});
            d3.select("#left").style("visibility", function(){return page == 1 ? "hidden":"visible";});
            //update calendars
            svg.selectAll(".calendar, .month").style("visibility", function(d){
                return (d < cutouts[page]) && (d >cutouts[page-1]) ? "visible":"hidden";});
        });
//array used to store each route's boarding and deboarding information
        var routeData = ["A","B","C","D","E","F","G","J","K","L","M","O","P","Q","S","T","V","W"];
        var colors = d3.scale.category20b()
                  .domain(["A","B","C","D","E","F","G","J","K","L","M","O","P","Q","S","T","V","W","2LAST","LAST"]);
        var allRoutes = new Array();
        for(var i = 0; i < routeData.length; i++) allRoutes.push(new Array());

//for area chart stuff
                  
        var parseDate = d3.time.format("%y-%b-%d").parse;
                  var stackx = d3.time.scale().range([0, width*3/4]);
                  var stacky = d3.scale.linear().range([150, 0]);
        var stackxAxis = d3.svg.axis()
                  .scale(stackx)
                  .orient("bottom");
                  
        var stackyAxis = d3.svg.axis()
                  .scale(stacky)
                  .orient("left");
                  
                  var barea = d3.svg.area();
                  var darea = d3.svg.area();
                  
//Information by stop
    d3.csv("unitrans1.csv", function(data){
            data.forEach(function(d){
                d.date = parser(d.date);
                d.boarding = +d.boarding;
                d.deboarding = -d.deboarding;
                allRoutesStops[routeData.indexOf(d.route)][day_of_month(d.date)-1].push(d);
            });
                         
            svg.append("g")
                .attr("class", "x axis")
                .attr("id", "barx")
                .attr("transform", "translate(0," + 490 + ")");
            svg.append("g")
                .attr("class", "y axis")
                .attr("id", "bary")
                .attr("transform", "translate(0," + 340 + ")")
            .append("text")
                .attr("id", "bartt")
                .attr("transform", "rotate(-90)")
                .attr("y", 6)
                .attr("dy", ".71em")
                .style("text-anchor", "end")
                .text("Load");
            svg.append("g")
                .attr("id", "bart")
                .attr("transform", "translate(0," + 460 + ")")
                .append("text")
                .attr("transform", "rotate(-90)")
                .attr("y", 6)
                .attr("dy", ".71em")
                .style("text-anchor", "end")
                .text("Unload");
           //svg.selectAll("#barx, #bary, #bart, #bartt, .bbar, .dbar, .barStops");
            smallx.domain(allRoutesStops[0][0].map(function(d){return d.stop;}));
            smally.domain([d3.min(allRoutesStops[0][0], function(d){return d.deboarding;}),d3.max(allRoutesStops[0][0], function(d){return d.boarding;})]);
           var tickArray = new Array();
           for(var k = 0; k < allRoutesStops[0][0].length; k++) tickArray.push(k+1);
           smallxAxis.tickValues(tickArray);
            svg.select("#barx").call(smallxAxis);
            svg.select("#bary").call(smallyAxis);
                         
            svg.selectAll(".bbar")
                .data(allRoutesStops[0][0])
                .enter().append("rect")
                .attr("transform", "translate(0," + 340 + ")")
                .attr("class", "bbar")
                .attr("x", function(d){return smallx(d.stop);})
                .attr("width", smallx.rangeBand())
                .attr("y", function(d){return smally(d.boarding);})
                .attr("height", function(d){return smally(smally.domain()[1]-d.boarding);})
                .style("fill", "#a6cee3");
            svg.selectAll(".dbar")
                .data(allRoutesStops[0][0])
                .enter().append("rect")
                .attr("transform", "translate(0," + 340 + ")")
                .attr("class", "dbar")
                .attr("x", function(d){return smallx(d.stop);})
                .attr("width", smallx.rangeBand())
                .attr("y", function(d){return smally(0);})
                .attr("height", function(d){return smally(d.deboarding)-smally(0);})
                .style("fill", "#fb9a99");
 
           var barStops = svg.selectAll(".barStops")
                            .data(allRoutesStops[0][0].map(function(d){return d.stop;}))
                            .enter().append("text")
                            .attr("class", "barStops")
                            .text(function(d,i){return (i+1)+". "+d})
                            .attr("transform",function(d,i){return "translate("+(width/3+50+Math.floor((i+1)/21)*300)+","+(340+(i%20)*15)+")";});
           svg.selectAll("#barx, #bary, #bart, #bartt, .bbar, .dbar, .barStops, .close").style("visibility", "hidden");
           
    });//
           
    function updateBars(day,route){
        svg.selectAll("#barx, #bary, #bart, #bartt, .bbar, .dbar, .barStops, .close").style("visibility", "visible");
        var j = day_of_month(new Date(day))-1,
            i = routeData.indexOf(route);
        smallx.domain(allRoutesStops[i][j].map(function(d){return d.stop;}));
        smally.domain([d3.min(allRoutesStops[i][j], function(d){return d.deboarding;}),d3.max(allRoutesStops[i][j], function(d){return d.boarding;})]);
            tickArray = new Array();
            for(var k = 0; k < allRoutesStops[i][j].length; k++) tickArray.push(k+1);
            smallxAxis.tickValues(tickArray);
        svg.select("#barx").call(smallxAxis);
        svg.select("#bary").call(smallyAxis);
        svg.selectAll(".bbar, .dbar, .barStops").remove();
        svg.selectAll(".bbar")
            .data(allRoutesStops[i][j])
            .enter().append("rect")
            .attr("transform", "translate(0," + 340 + ")")
            .attr("class", "bbar")
            .attr("x", function(d){return smallx(d.stop);})
            .attr("width", smallx.rangeBand())
            .attr("y", function(d){return smally(d.boarding);})
            .attr("height", function(d){return smally(smally.domain()[1]-d.boarding);})
            .style("fill", "#a6cee3");
        svg.selectAll(".dbar")
            .data(allRoutesStops[i][j])
            .enter().append("rect")
            .attr("transform", "translate(0," + 340 + ")")
            .attr("class", "dbar")
            .attr("x", function(d){return smallx(d.stop);})
            .attr("width", smallx.rangeBand())
            .attr("y", function(d){return smally(0);})
            .attr("height", function(d){return smally(d.deboarding)-smally(0);})
            .style("fill", "#fb9a99");
        barStops = svg.selectAll(".barStops")
                  .data(allRoutesStops[i][j].map(function(d){return d.stop;}))
                  .enter().append("text")
                  .attr("class", "barStops")
                  .text(function(d,i){return (i+1)+". "+d})
                  .attr("transform",function(d,i){return "translate("+(width/3+50+Math.floor((i+1)/21)*300)+","+(340+(i%20)*15)+")";});
    }
                  
    var convenientData = [], defaultX;
//Information by time
    d3.csv("unitransP1.csv", function(data){
            data.forEach(function(d){
                d.date = parser(d.date);
                d.boarding = +d.boarding;
                d.deboarding = -d.deboarding;
                allRoutes[routeData.indexOf(d.route)].push(d);
                convenientData.push(d);
                allDaysRoutes[day(d.date)][routeData.indexOf(d.route)].push(d);
            });
           defaultX = d3.extent(data, function(d){return d.date;});
           y.domain([0,d3.max(data, function(d){return d.boarding;})]);
           x.domain(defaultX);
           
        svg.append("g")
           .attr("class", "x axis")
           .attr("id","lineXaxis")
           .attr("transform", "translate(0," + 300 + ")")
           .call(xAxis);
           
        svg.append("g")
           .attr("class", "y axis")
           .attr("transform", "translate(0," + 150 + ")")
           .call(yAxis)
           .append("text")
           .attr("transform", "rotate(-90)")
           .attr("y", 6)
           .attr("dy", ".71em")
           .style("text-anchor", "end")
           .text("Passenger Count by Day");
        //update/draw line charts information
           updateLines(0);
    });
   
                  
function updateLines(status){
    if(status != 0){
        svg.selectAll(".dot").remove();
        for(var r = 0; r < routeData.length; r++) svg.selectAll("."+routeData[r]+"line").remove();
    }
                  
if(status < 2){ //&& selectedPeriod.length == 0){
        //for loop to draw all routes
    for(var r = 0; r < routeData.length; r++){
        svg.append("path")
            .attr("transform", "translate(0," + 150 + ")")
            .datum(allRoutes[r])
            .attr("class",(routeData[r]+"line"))
            .style("opacity", 0.6)
            .style("fill","none")
            .style("stroke-width", "1.5px")
            .style("stroke", "#d9d9d9")
            .attr("d", bline);
    }
    var dots = svg.selectAll(".dot")
            .data(convenientData)
            .enter().append("g")
            .attr("class", "dot")
            .attr("transform", "translate(0," + 150 + ")")
            .style("visibility", "hidden");
                  
        dots.append("circle")
            .attr("class", "bdot")
            .attr("id", function(d){var t = +d.date; return "bdot"+d.route+t;})
            .attr("r", 3.5)
            .attr("cx", function(d){return x(d.date);})
            .attr("cy", function(d){return  y(d.boarding);})
        dots.append("text")
            .attr("class", "bCount")
            .attr("id", function(d){var t = +d.date; return "bdot"+d.route+t;})
            .text(function(d,i){return d.route+" Line: " + d.boarding+" boardings";})
            .attr("x", function(d){return x(d.date)+5;})
            .attr("y", function(d){return  y(d.boarding);})
                  
        svg.selectAll(".bCount")
            .style("font-weight","light")
            .style("visibility", "hidden");
                  
        dots
            .on("mouseover", function(d,i){
                d3.select("body").style("cursor","pointer");
                d3.select(this).select("text").style("visibility","visible");
            })
            .on("mouseout", function(d,i){
                d3.select("body").style("cursor","auto");
                d3.select(this).select("text").style("visibility","hidden");
            })
            .on("click", function(d,i){
                svg.selectAll(".area, #stackYaxis, #stacktt, #stackt, #stackXaxis, .areaclose, .areaRoutes").style("visibility", "hidden");
                updateBars(selectedDay, d.route);});
}//if status == 1 status == 0
//else if(selectedPeriod != 0 && status < 2){

//}
else{
    for(var i = 0; i < selectedDaysOfMonth.length; i++){
        if(selectedDaysOfMonth[i]){
            for(var r = 0; r < routeData.length; r++){
                svg.append("path")
                  .attr("transform", "translate(0," + 150 + ")")
                  .datum(allDaysRoutes[i][r])
                  .attr("class",(routeData[r]+"line"))
                  .style("opacity", 0.8)
                  .style("fill","none")
                  .style("stroke-width", "1.5px")
                  .style("stroke", "#d9d9d9")
                  .attr("d", bline);
            }
                  var dots = svg.selectAll(".dot")
                  .data(convenientData)
                  .enter().append("g")
                  .attr("class", "dot")
                  .attr("transform", "translate(0," + 150 + ")")
                  .style("visibility", "hidden");
                  
                  dots.append("circle")
                  .attr("class", "bdot")
                  .attr("id", function(d){var t = +d.date; return "bdot"+d.route+t;})
                  .attr("r", 3.5)
                  .attr("cx", function(d){return x(d.date);})
                  .attr("cy", function(d){return  y(d.boarding);})
                  dots.append("text")
                  .attr("class", "bCount")
                  .attr("id", function(d){var t = +d.date; return "bdot"+d.route+t;})
                  .text(function(d,i){return d.route+" Line: " + d.boarding+" boardings";})
                  .attr("x", function(d){return x(d.date)+5;})
                  .attr("y", function(d){return  y(d.boarding);})
                  
                  svg.selectAll(".bCount")
                  .style("font-weight","light")
                  .style("visibility", "hidden");
                  
                  dots
                  .on("mouseover", function(d,i){
                      d3.select("body").style("cursor","pointer");
                      d3.select(this).select("text").style("visibility","visible");
                      })
                  .on("mouseout", function(d,i){
                      d3.select("body").style("cursor","auto");
                      d3.select(this).select("text").style("visibility","hidden");
                      })
                  .on("click", function(d,i){
                      updateBars(selectedDay, d.route);});
            }//if this day is selected
    }//for i
}//else status > 1
}//end of function updateLines
//bus selections
    var routes = svg.selectAll(".routes")
            .data(routeData)
            .enter().append("g")
            .attr("class", "routes")
            .attr("transform", function(d,i) {return "translate("+i*20+",50)";});
        routes.append("rect")
            .attr("x", 0)
            .attr("width", 18)
            .attr("height", 18)
            .style("fill", "#adadad");
        routes.append("text")
            .attr("x", 0)
            .attr("y", 9)
            .attr("dx", "1.4em")
            .attr("dy", ".35em")
            .style("fill", "white")
            .style("text-anchor", "end")
            .text(function(d) { return d; });
                  
//routes' mouse functionalities
        routes
            .on("mouseover", function(){d3.select("body").style("cursor","pointer");})
            .on("mouseout", function(){d3.select("body").style("cursor","auto");})
            .on("click", function(d,i){
            //update button itself and line charts
                clearDots();
                if(d3.select(this).select("rect").style("fill")=="#adadad"){
                    selectedLines.push(d);
                    for(var i = 0; i < selectedLines.length; i++)
                        svg.selectAll("circle#bdot"+selectedLines[i]+selectedDay).style("visibility", "visible");
                    d3.select(this).select("rect").style("fill", colors(d));
                    d3.select(this).select("rect").style("stroke", "black");
                    svg.selectAll("."+d+"line").style("stroke",colors(d));
                }
                else{
                    selectedLines.splice(selectedLines.indexOf(d), 1);
                    if(selectedLines.length == 0)
                        for(var i = 0; i < routeData.length; i++)
                            svg.selectAll("circle#bdot"+routeData[i]+selectedDay).style("visibility", "visible");
                    else
                        for(var i = 0; i < selectedLines.length; i++)
                            svg.selectAll("circle#bdot"+selectedLines[i]+selectedDay).style("visibility", "visible");
                    d3.select(this).select("rect").style("fill", "#adadad");
                    d3.select(this).select("rect").style("stroke", "none");
                    svg.selectAll("."+d+"line").style("stroke","#d9d9d9");
                }
            });
                  
function clear(){
        clearCalendar();
        clearLines();
        clearRoutes();
        clearDots();
        clearBars();
}

function clearBars(){
                  
}
function clearCalendar(){}
function clearLines(){
    for(var i = 0; i < routeData.length; i++)
        svg.selectAll("."+routeData[i]+"line").style("visibility", "hidden");
}
function clearDots(){
        svg.selectAll("circle.bdot").style("visibility", "hidden");
}
function clearRoutes(){}

//calendar view
    function isFirstDayofMonth(date){return day_of_month(date) == 1};

    var cellSize = 13;
    var day = d3.time.format("%w"),
        day_of_month = d3.time.format("%e"),
        week = d3.time.format("%U"),
        month = d3.time.format("%m"),
        year = d3.time.format("%Y"),
        format = d3.time.format("%b, %Y"),
        y_position = 0,
        previous_week = 1;
    var calendar = svg.selectAll(".day")
                  .data(d3.time.days(new Date(2012, 9, 1), new Date(2012, 11, 31)))
                .enter().append("g")
                  .attr("class", "day")
                  .attr("transform", function(d){
                        var x = day(d) * cellSize+cellSize*88-18, y;
                        if (isFirstDayofMonth(d) == 1) y_position = 0;
                        else if(previous_week != week(d)) y_position++;
                        
                        previous_week = week(d);
                        y = y_position * cellSize+5;
                        
                        return "translate("+ x + "," + y +")";
                    });
 //draw day of the month
        calendar.append("rect")
            .attr("class", "calendar")
            .attr("width", cellSize)
            .attr("height", cellSize)
            .attr("id",function(d){var t = +d; return "rect"+t;})
            .style("stroke", "#ccc")
            .style("fill", "#EEE0E5");
        calendar.append("text")
            .attr("class", "calendar")
            .style("fill", "#848484")
            .attr("id",function(d){var t = +d; return "text"+t;})
            .attr("dy", ".7em")
            .text(function(d){return day_of_month(d);});

//mouse actions
        var tempDate;
        calendar
            .on("mouseover", function(){d3.select("body").style("cursor","pointer")})
            .on("mouseout", function(){d3.select("body").style("cursor","auto")})
            .on("click", function(d){
                //if shift+click
                if(d3.event.shiftKey){
                    tempDate = +d;
                    if(!selectedDay && selectedPeriod.length == 0) return;
                    if(selectedPeriod.length == 0){
                        selectedPeriod.push(Math.min(selectedDay, tempDate));
                        selectedPeriod.push(Math.max(selectedDay, tempDate));
                    }
                    else{
                        if(tempDate < selectedPeriod[0]) selectedPeriod[0] = tempDate;
                        else selectedPeriod[1] = tempDate;
                    }
                    for(var i = selectedPeriod[0]; i <=selectedPeriod[1]; i+=86400){
                        d3.select("#rect"+i).style("fill", "#8B475D");
                        d3.select("#text"+i).style("fill", "#fff");
                    }//highlight calendars
                    selectedDay = 0;
                    x.domain([new Date(selectedPeriod[0]), new Date(selectedPeriod[1])]);
                    svg.select("#lineXaxis").call(xAxis);
                    updateLines(1);
                    svg.selectAll(".bdot, .bCount").style("visibility", "hidden");
                }
                //else click only
                else{
                //clean up
                    selectedPeriod = [];
                    d3.selectAll("text.dayOfweek").style("fill", "grey");
                    svg.selectAll(".bdot, .bCount").style("visibility", "hidden");
                    svg.selectAll("rect.calendar").style("fill", "#eee0e5");
                    svg.selectAll("text.calendar").style("fill", "#848484");
                    tempDate = +d;
                    selectedDay = tempDate;
                //back to default line charts
                    x.domain(defaultX);
                    svg.select("#lineXaxis").call(xAxis);
                    updateLines(1);                
                    d3.select(this).select("rect").style("fill", "#8B475D");
                    d3.select(this).select("text").style("fill", "#fff");
                //color
                if(selectedLines.length == 0)
                for(var i = 0; i < routeData.length; i++)
                svg.selectAll("circle#bdot"+routeData[i]+tempDate).style("visibility", "visible");
                else
                for(var i = 0; i < selectedLines.length; i++){
                svg.selectAll("circle#bdot"+selectedLines[i]+tempDate).style("visibility", "visible");
                svg.selectAll("path."+selectedLines[i]+"line").style("stroke", colors(selectedLines[i]));
                }
                }

                for(var i = 0; i < selectedLines.length; i++)
                    svg.selectAll("path."+selectedLines[i]+"line").style("stroke", colors(selectedLines[i]));
                //update area charts
                updateArea();
            });
            
            var monthIndicators = svg.selectAll(".month")
                  .data(d3.time.months(new Date(2012, 9), new Date(2012, 12)))
                  .enter().append("text")
                  .text(function(d){return format(d);})
                  .attr("class", "month")
                  .style("text-anchor", "start")
                  .style("fill", "gray")
                  .attr("transform", function(d,i){
                    return "matrix("+Math.cos(-90*Math.PI/180)+","+ Math.sin(-90*Math.PI/180)+","+(-Math.sin(-90*Math.PI/180))+","+ Math.cos(-90*Math.PI/180)+","+(cellSize*80+70) +","+cellSize*4.5+")";});
                svg.selectAll(".calendar, .month")
                  .style("visibility", function(d){return (d < cutouts[page])&&(d > cutouts[page-1]) ? "visible":"hidden";});
            var dayIndicators = svg.selectAll(".dayOfweek")
                  .data(["S","M","T","W","T","F","S"])
                  .enter().append("text")
                  .text(function(d){return d;})
                  .attr("class", "dayOfweek")
                  .style("text-anchor", "start")
                  .style("fill", "gray")
                  .style("font-size", 8)
                  .attr("transform", function(d,i){return "translate("+(width-cellSize*(14-i))+",0)";})
                  .on("mouseover", function(){d3.select("body").style("cursor","pointer");})
                  .on("mouseout", function(){d3.select("body").style("cursor","auto");})
                  .on("click", function(d,i){
                      //clean up
                      svg.selectAll(".bdot, .bCount").style("visibility", "hidden");
                      selectedDay = 0;
                      selectedDaysOfMonth = [0,0,0,0,0,0,0];
                      if(d3.select(this).style("fill") != "#808080"){
                        d3.selectAll("text.dayOfweek").style("fill", "grey");
                        if(selectedPeriod.length == 0) x.domain([new Date(2012, 9, 1), new Date(2012, 9, 31)]);
                        xAxis.ticks(d3.time.days, 2);
                        svg.select("#lineXaxis").call(xAxis);
                        updateLines(1);}
                      else{
                        d3.selectAll("text.dayOfweek").style("fill", "grey");
                        selectedDaysOfMonth[i]=1;
                        d3.select(this).style("fill", "red");
                            switch(i){
                                case 0: x.domain([new Date(2012, 9, 7), new Date(2012, 9, 28)]); xAxis.ticks(d3.time.sunday.range); break;
                                case 1: x.domain([new Date(2012, 9, 1), new Date(2012, 9, 29)]); xAxis.ticks(d3.time.monday.range);  break;
                                case 2: x.domain([new Date(2012, 9, 2), new Date(2012, 9, 30)]); xAxis.ticks(d3.time.tuesday.range);  break;
                                case 3: x.domain([new Date(2012, 9, 3), new Date(2012, 9, 31)]); xAxis.ticks(d3.time.wednesday.range);  break;
                                case 4: x.domain([new Date(2012, 9, 4), new Date(2012, 9, 25)]); xAxis.ticks(d3.time.thursday.range);  break;
                                case 5: x.domain([new Date(2012, 9, 5), new Date(2012, 9, 26)]); xAxis.ticks(d3.time.friday.range);  break;
                                case 6: x.domain([new Date(2012, 9, 6), new Date(2012, 9, 27)]); xAxis.ticks(d3.time.saturday.range);  break;
                            }
                            if(selectedPeriod.length > 0) x.domain([new Date(selectedPeriod[0]), new Date(selectedPeriod[1])]);
                            svg.select("#lineXaxis").call(xAxis);
                        updateLines(3);}
                      //update line charts
                      for(var i = 0; i < selectedLines.length; i++)
                            svg.selectAll("path."+selectedLines[i]+"line").style("stroke", colors(selectedLines[i]));
                    });
                  
//Bar Chart View
//array used to store each route's boarding and deboarding information
        var allRoutesStops = new Array();
        for(var i = 0; i < routeData.length; i++){
            allRoutesStops.push(new Array());
                  for(var j = 0; j < 31; j++) allRoutesStops[i].push(new Array());
        }
        var smallx = d3.scale.ordinal().rangeRoundBands([0, width/3], 0.1),
            smally = d3.scale.linear().range([150,0]),
            smallxAxis = d3.svg.axis()
                        .scale(smallx)
                        .orient("bottom");
            smallyAxis = d3.svg.axis()
                        .scale(smally)
                        .orient("left");
                  

/******************************************************************************************************************************************/
/******************************************************************************************************************************************/

//Google Map API
                  /*
        d3.select("#map").style("opacity", 0.5);
        var types = ["<p>Question:</p>","<p>Answer:</p>","<p>Comment:</p>"];
        map = new google.maps.Map(d3.select("#map").node(),{
                            zoom:2,
                            center: new google.maps.LatLng(38.5450, -121.7394),//lat and long of center of Davis
                            mapTypeId: google.maps.MapTypeId.TERRAIN });
                  // var stamParser = d3.time.format();
                  //Read in stop information
        d3.csv("haskell1.csv", function(data){
                data.forEach(function(d){
                            d.type = +d.type;
                            d.latitude = +d.latitude;
                            d.longitude = +d.longitude;
                             d.timestamp = +d.timestamp;
                            //draw markers
                            var marker = new google.maps.Marker({
                                                animation: null,
                                                icon: { fillColor : colors[d.type-1],
                                                        fillOpacity: 1,
                                                        path: google.maps.SymbolPath.CIRCLE,
                                                        strokeColor: "black",
                                                        scale: 3,
                                                        strokeWeight: 1,
                                                        strokeOpacity: 0.8},
                                                        position: new google.maps.LatLng(d.latitude, d.longitude),
                                                        map:map,
                                                        clickable:true,
                                                        cursor: "pointer",
                                                        title: d.title?d.title:"No title"});
                             var info = types[d.type-1] + d.content + "...";
                             var infowindow = new google.maps.InfoWindow({  content: info,
                                                                            maxWidth: 200});
                             marker.set("id", d.timestamp);
                             marker.set("class", d.type);
                             markers.push(marker);
                             google.maps.event.addListener(marker, 'click', function(){infowindow.open(map, marker);});
                                      
                    });
        });
 */
});//document ready function

