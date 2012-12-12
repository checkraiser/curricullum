 $('#focusmsv').click(function(){
  $('#msv').focus();
 })
    var fill = d3.scale.category10();  
  $('#btn').click(
  function () {
    var msv = $('#msv').val();   
    
    
  
  $.getJSON('check/' + msv, function(data) {    
      if (data) {
        if (data.error == 'khongtontai') {
          alert('Mã sinh viên này không tồn tại');
        } else if (data.error == 'nienche') {
          alert('Hệ thống này không dành cho hệ đào tạo niên chế');
        } else{
          $('#tags').empty();
        callback();  
        }      
      }
      else 
        alert(data);
  });
  
  function callback() {

     

    var vis = d3.select('#tags').append('svg:g');  

      d3.json('/get/' + msv, function(json) {
         
        
        var parsed = {}       
          
          parsed['tuchon'] = {};
          parsed['tuchon']['nodes']= [];
          parsed['batbuoc'] = {};
          parsed['batbuoc']['nodes'] = [];
        for (var i = 0,ilen = json.nodes.length; i < ilen; i++){          
          var item = json.nodes[i];
          if (item['tuchon'] == 0) {
            parsed['batbuoc']['nodes'].push(item);            
          } else {
            parsed['tuchon']['nodes'].push(item);
          }
          
        }
        if (json.other) {
          
          for (var i = 0; i < json.other.length; i++) {
            $('#othercourses').append('<span class="label label-info">' + json.other[i].name + '</span>\t');
          }          
           
        }
        

        var dis = 500;
        var force = d3.layout.force()
        .charge(-900)
        .distance(150)  
        .gravity(0.05)
        .nodes(json.nodes)
        .links(json.links)
        .size([dis * 2, dis * 6])
        .start();
      

        
        var link = vis.selectAll('line.link')
          .data(json.links)
        .enter().append('svg:line')
          .attr("class", "link")              
          .attr("stroke", "black")  
          .attr('stroke-width', "1") 
          .attr('stroke-opacity', ".6")
          .attr("x1", function(d) { return d.source.x; })
          .attr("y1", function(d) { return d.source.y; })
          .attr("x2", function(d) { return d.target.x; })
          .attr("y2", function(d) { return d.target.y; })
          ;
      
        
        var node = vis.selectAll("circle.node")
         // .data(json.nodes)
         .data(parsed['batbuoc']['nodes'])
        .enter().append("svg:circle")
          .attr("class", "node")
          .attr("name", function(d) { return d.name; })
          .attr("cx", function(d) { return d.x; })
          .attr("cy", function(d) { return d.y ; })
          .attr("r", 20)
          .style("fill", function(d) { return d.color; })       
          .call(force.drag);
         
       var node2 = vis.selectAll("rect.node")
         // .data(json.nodes)
         .data(parsed['tuchon']['nodes'])
        .enter().append("svg:rect")         
          .attr("name", function(d) { return d.name; })
          .attr("x", function(d) { return d.x; })
          .attr("y", function(d) { return d.y ; })
          .attr("width", 30)
          .attr("height", 30)
          .style("fill", function(d) { return d.color; })       
          .call(force.drag); 

        var text = vis.selectAll("text")
          .data(json.nodes)
          .enter().append("svg:text")
          .attr("x", function(d) { return d.x ; })
          .attr("y", function(d) { return d.y ; })         
          .attr('stroke-width', "1") 
          .attr('stroke-opacity', ".3")
          .attr("stroke", function(d) {
            if (d.tuchon == 1)
             return 'orange'; 
            else return 'black';
          })
          .text(function(d) { return  d.name ; })
          .attr("font-size","18px")
          .call(force.drag);
        
         node.append('title')
          .text(function(d) { return 'Mã môn:\t' + d.mamon +
               '\nSố tín chỉ:\t' + d.dvht + 
             '\nKhối kiến thức:\t' + d.khoikienthuc +
             '\nNhóm tự chọn:\t' + d.tuchon +
              '\nTên nhóm:\t' + d.tennhom; });
          node2.append('title')
          .text(function(d) { return 'Mã môn:\t' + d.mamon +
               '\nSố tín chỉ:\t' + d.dvht + 
             '\nKhối kiến thức:\t' + d.khoikienthuc +
             '\nNhóm tự chọn:\t' + d.somontuchon  +
             '\nTên nhóm:\t' + d.tennhom; });
       
        
      
        force.on("tick", function(e) {    


          dis2 = dis/2
        node.each(function(d) {       
          d.x += ((5-d.group) * dis2 - d.x) ;  
          d.x = dis2 * 5 - d.x;    
               
        });
        node2.each(function(d) {      
          d.x += ((5-d.group) * dis2 - d.x) ;  
          d.x = dis2 * 5 - d.x;    
                
        });
        text.each(function(d) {       
          d.x += ((5-d.group) * dis2 - d.x) ;  
          d.x = dis2 * 5 - d.x;
          
        });
        
        link.
        attr("x1", function(d) { return d.source.x; })
          .attr("y1", function(d) { return d.source.y ; })
          .attr("x2", function(d) { return d.target.x; })
          .attr("y2", function(d) { return d.target.y  ; })
          .attr("marker-end","url(#arrow)");
        
        node.attr("cx", function(d) { return d.x ; })
          .attr("cy", function(d) { return d.y ; });

        node2.attr("x", function(d) { return d.x - 20 ; })
          .attr("y", function(d) { return d.y - 10 ; });
        
        text.attr("x", function(d) { 
            if (d.leaf == 1)
              return d.x + 18; 
            else {
              return d.x - 50;
            }
              
          })
          .attr("y", function(d) { 
              if (d.leaf == 0) {
                return d.y - 20; 
              }                
              else
                return d.y + 5;
            });
        });

      });
    }
  });
  
