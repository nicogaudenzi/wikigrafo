import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
import {queryCache, selectedNode,linkCache} from './wikigrafoDataRepositories.js'
export function quantityTree(data, options = {}) {
      const {
        indentSpacing = 12,
        lineSpacing = 18,
        duration = 300,
        radius = 6, // radius of curve for links
        minHeight = 20,
        boxSize = 9.5,
        ease = d3.easeQuadInOut, 
        marginLeft = Math.round(boxSize/2)+1,
        marginRight = 120,
        marginTop = 10,
        marginBottom = 10,
      } = options;
      // WARNING: x and y are switched because the d3.tree is vertical rather than the default horizontal
      // settings
      
      let plus  = {shapeFill: "black", shapeStroke: "black", textFill:"white", text: "+"}
      let minus = {shapeFill: "white", shapeStroke: "black", textFill:"black", text: "−"}
      
      //
      let tree = d3.tree()
        .nodeSize([lineSpacing, indentSpacing])
      
      let root = d3.hierarchy(data); 
      
      root.x0 = 0;
      root.y0 = 0; 
      root.descendants().forEach((d, i) => {
        d.id = i;
        d._children = d.children;
        if (d.depth && d.data.name.length !== 7) d.children = null;
      });
    
      let index = -1;
      root.eachBefore(function(n) {++index}) // counts original number of items
      
      const svg = d3.create("svg")
          .attr("viewBox", [-marginLeft, -marginTop, 200, Math.max(minHeight, index * lineSpacing + marginTop + marginBottom )])
          .style("font", "10px sans-serif")
          .style("user-select", "none");
    
      const gLink = svg.append("g")
          .attr("fill", "none")
          .attr("stroke", "#AAA")
          .attr("stroke-width", .75);
    
      const gNode = svg.append("g")
          .attr("cursor", "pointer")
          .attr("pointer-events", "all");
    
      let indexLast
      function update(source) {
        const nodes = root.descendants().reverse();
        const links = root.links();
    
        // Compute the new tree layout.
        tree(root);
        
        // node position function
        index = -1;
        root.eachBefore(function(n) {
          n.x = ++index * lineSpacing;
          n.y = n.depth * indentSpacing;
        });
    
        const height = Math.max(minHeight, index * lineSpacing + marginTop + marginBottom );
    
        svg.transition().delay(indexLast<index ? 0 : duration).duration(0)
          .attr("viewBox", [-marginLeft,  - marginTop, 200, height])
    
        // Update the nodes…
        const node = gNode.selectAll("g")
          .data(nodes, d => d.id);
    
        // Enter any new nodes at the parent's previous position.
        const nodeEnter = node.enter().append("g")
            .attr("transform", d => `translate(${d.y},${source.x0})`)
            .attr("fill-opacity", 0)
            .attr("stroke-opacity", 0)
            
          nodeEnter.append("rect")
          .attr("stroke","white ")
          .attr("fill",'#aaa')
          .attr("width",150)
          .attr("stroke-width",.5)
          .attr("x",4.5)
          .attr("y",-5.5)
          .attr("height",15)
          .on("click", (event, d) => {
              
            d.children = d.children ? null : d._children;
            update(d);
        });
  

        // label text
        let label = nodeEnter.append("text")
          .attr("x", 5+boxSize/2)
          .attr("text-anchor", "start")
          .attr("dy", "0.35em")
          .attr("fill","black")
          .text(d => d.data.name.slice(0,30))
          .on("click", (event, d) => {
              
            d.children = d.children ? null : d._children;
            update(d);
          });
  
       
        

        // Transition nodes to their new position.
        const nodeUpdate = node.merge(nodeEnter).transition().duration(duration).ease(ease)
            .attr("transform", d => `translate(${d.y},${d.x})`)
            .attr("fill-opacity", 1)
            .attr("stroke-opacity", 1)
    
        // Transition exiting nodes to the parent's new position.
        const nodeExit = node.exit().transition().duration(duration).ease(ease).remove()
            .attr("transform", d => `translate(${d.y},${source.x})`)
            .attr("fill-opacity", 0)
            .attr("stroke-opacity", 0);
    
        // Update the links…
        const link = gLink.selectAll("path")
          .data(links, d => d.target.id);
    
        // Enter any new links at the parent's previous position.
        const linkEnter = link.enter().append("path")
            .attr("stroke-opacity", 0)
            .attr("d", d => makeLink([d.source.y,source.x] , [d.target.y + (d.target._children ? 0 : boxSize/2 ), source.x] , radius) );
    
        // Transition links to their new position.
        link.merge(linkEnter).transition().duration(duration).ease(ease)
            .attr("stroke-opacity", 1)
            .attr("d", d => makeLink([d.source.y,d.source.x] , [d.target.y + (d.target._children ? 0 : boxSize/2 ), d.target.x] , radius));
    
        // Transition exiting nodes to the parent's new position.
        link.exit().transition().duration(duration).ease(ease).remove()
            .attr("stroke-opacity", 0)
            .attr("d", d => makeLink([d.source.y, source.x] , [d.target.y + (d.target._children ? 0 : boxSize/2 ), source.x] , radius) );
    
        // Stash the old positions for transition.
        root.eachBefore(d => {
          d.x0 = d.x;
          d.y0 = d.y;
        });
    
        indexLast = index // to know if viewbox is expanding or contracting
      }
    
      update(root);
    
      return svg.node();
    }

    const makeLink = (start, end, radius) => {
      const path = d3.path();
      const dh = 4/3*Math.tan(Math.PI/8) // tangent handle offset
    
      //flip curve
      let fx, fy
      if(end[0] - start[0] == 0){ fx = 0}
      else if(end[0] - start[0] > 0) {fx = 1} 
      else {fx = -1}
      if(end[1] - start[1] == 0){ fy = 0}
      else if(end[1] - start[1] > 0) {fy = 1} 
      else {fy = -1}
    
      //scale curve when dx or dy is less than the radius
      if( radius == 0 ){ fx=0; fy=0}
      else{
        fx *= Math.min( Math.abs(start[0]-end[0]), radius) / radius
        fy *= Math.min( Math.abs(start[1]-end[1]), radius) / radius
      }
    
      path.moveTo(...start);
      path.lineTo(...[start[0], end[1]-fy*radius]);
      path.bezierCurveTo(
        ...[start[0], end[1]+fy*radius*(dh-1)] , 
        ...[start[0]+fx*radius*(1-dh), end[1]], 
        ...[start[0]+fx*radius, end[1]]);
      path.lineTo(...end);
      return path
    }
    
