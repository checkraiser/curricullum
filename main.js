 
    var fill = d3.scale.category10();  
  $('#btn').click(
  function () {
    var msv = $('#msv').val();   
    
    
  
	$.getJSON('check/' + msv, function(data) {
		  if (data) {
		  $('#tags').empty();
			callback();
		  }
		  else 
			alert('No student');
	});
	
	function callback() {

		var arrow = d3.select('#tags').append("svg:defs")		
			   	.append("svg:marker").attr("id", "arrow");

			    arrow
			    .attr("viewbox","0 -25 50 25")			    
			    .attr("refX", 100)
			    .attr("refY", 0)			   
			    .attr("markerUnits","userSpaceOnUse")
			    .attr("orient", "auto")
			    .attr("markerWidth", 25)
    			.attr("markerHeight", 25)
			  .append("svg:path")			   
			    .attr('d',"M 0 -25 L -25 50 L 50 25 z")
			   .attr("fill", "red");	    

		var vis = d3.select('#tags').append('svg:g');  

			d3.json('/get/' + msv, function(json) {
			   
			  

				var dis = 500;
			  var force = d3.layout.force()
				.charge(-2000)
				.distance(300)  
				.gravity(0.1)
				.nodes(json.nodes)
				.links(json.links)
				.size([dis * 2, dis * 6])
				.start();
			

				
			  var link = vis.selectAll('line.link')
				  .data(json.links)
				.enter().append('svg:line')
				  .attr("class", "link")  	
				   .attr("marker-end", "url(#arrow)")
					.attr("stroke", "black")	
					.style('stroke-width', "2")			 
				  .attr("x1", function(d) { return d.source.x; })
				  .attr("y1", function(d) { return d.source.y; })
				  .attr("x2", function(d) { return d.target.x; })
				  .attr("y2", function(d) { return d.target.y; })
				  ;
				  
			  var node = vis.selectAll("circle.node")
				  .data(json.nodes)
				.enter().append("svg:circle")
				  .attr("class", "node")
				  .attr("name", function(d) { return d.name; })
				  .attr("cx", function(d) { return d.x; })
				  .attr("cy", function(d) { return d.y ; })
				  .attr("r", 40)
				  .style("fill", function(d) { return d.color; })				
				  .call(force.drag);
				  
				var text = vis.selectAll("text")
					.data(json.nodes)
					.enter().append("svg:text")
					.attr("x", function(d) { return d.x ; })
					.attr("y", function(d) { return d.y ; })
					.attr("stroke", function(d) { return fill(d.color); })
					.text(function(d) { return d.name ; })
					.attr("font-size","40")
					.call(force.drag);
				
			  node.append('title')
				  .text(function(d) { return d.group; });
				  
		   
				
			
			  force.on("tick", function(e) {    



				node.each(function(d) { 			
					d.x += ((5-d.group) * dis - d.x) ; 	
					d.x = dis * 5 - d.x;		
						 			 
				});
				
				text.each(function(d) { 			
					d.x += ((5-d.group) * dis - d.x) ; 	
					d.x = dis * 5 - d.x;
					
				});
				
				link.
				attr("x1", function(d) { return d.source.x; })
					.attr("y1", function(d) { return d.source.y + dis/10 ; })
					.attr("x2", function(d) { return d.target.x; })
					.attr("y2", function(d) { return d.target.y + dis/10 ; })
					.attr("marker-end","url(#arrow)");
			  
				node.attr("cx", function(d) { return d.x ; })
					.attr("cy", function(d) { return d.y + dis/10; });
				
				text.attr("x", function(d) { return d.x + 35; })
					.attr("y", function(d) { return d.y + 20; });
			  });

			});
		}
	});
	