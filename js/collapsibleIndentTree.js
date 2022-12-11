import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
import {queryCache, selectedNode,linkCache,vGraph,inVgraphButNotQueryCache} from './wikigrafoDataRepositories.js'
import {betterDirectRelations} from './predefinedQueries.js';
import {queryHandler} from './queryHandler.js'
import { update } from "./force_directed_graph.js";
import {directResponseRecived} from './wikigrafo_events.js'

export const directTree = collapsibleIndentTree();
export const reverseTree = collapsibleIndentTree();
function collapsibleIndentTree(data, options = {}) {
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
  
  let root,index; 

  let svg, gNode,gLink
  function restartTree(data){
    updateData(data);
    update(root);
    return svg.node();
  }
      
  function updateData(data){
    root = d3.hierarchy(data); 
  
    root.x0 = 0;
    root.y0 = 0; 
    root.descendants().forEach((d, i) => {
      d.id = i;
      d._children = d.children;
      if (d.depth && d.data.name.length !== 7) d.children = null;
    });
  
    index = -1;
    root.eachBefore(function(n) {++index}); // counts original number of items

  svg = d3.create("svg")
      .attr("viewBox", [-marginLeft, -marginTop, 200, Math.max(minHeight, index * lineSpacing + marginTop + marginBottom )])
      .style("font", "10px sans-serif")
      .style("user-select", "none");

    gLink = svg.append("g")
      .attr("fill", "none")
      .attr("stroke", "#AAA")
      .attr("stroke-width", .75);

    gNode = svg.append("g")
      .attr("cursor", "pointer")
      .attr("pointer-events", "all");
    };
  let indexLast;

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
    const Node = gNode.selectAll("g")
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

      
    //Operations text
    if(d.children!=null){
    nodeEnter.append("text")
    .attr("dy", "0.32em")
    .attr("dx",145)
    .attr('fill','black')
    .text(function(d){
      if(!selectedNode.value){
        if(queryCache.data[d.data.wid]) {return "L"}
        return d._children==null?"+":""
      }
      if(linkCache.data[selectedNode.value.wid+d.data.wid]===d.data.wid){
        return "S"}

      if(queryCache.data[d.data.wid]) {return "L"}

      return "+"})
      .on("click",d=> appendAndSelect(d))
    }

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
  return {restart:function(data){return restartTree(data)}};
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
function append(d){
  var index = vGraph.nodesLength();
  const item = queryCache.data[d.data.wid];
  const wid = d.data.wid;
  if(!item){
    linkCache.data[selectedNode.value.wid+wid]=wid;
    const index = vGraph.pushNode({name:d.data.widlabel,wid:d.data.wid});
    vGraph.pushLink({"source":selectedNode.value,"target":vGraph.data.nodes[index],"weight":1,name:d.data.pwidlabel})
    inVgraphButNotQueryCache[d.data.wid]={index:index};
  }
  else{
      linkCache.data[selectedNode.value.wid+wid]=wid;
      vGraph.pushLink({"source":selectedNode.value,"target":vGraph.data.nodes[item.index],"weight":1,name:d.data.pwidlabel})
    }
  }

function appendAndSelect(d){
  const wid = d.target.__data__.data.wid;
  var index = vGraph.nodesLength();
  if(d.target.innerHTML=="S"){
    console.log(queryCache.data[wid])
    const item =queryCache.data[wid];
    if(item){
    selectedNode.value = vGraph.data.nodes[queryCache.data[wid].index];
    directResponseRecived.invoke(wid)
    return}
    else{
      console.log(d.target.__data__.data);
      var sparql = betterDirectRelations.replace('$queryInput', d.target.__data__.data.wid)
                    .replace(/langInput/g, languageSelector.value);
      queryHandler.direct(d.target.__data__.data.wid, sparql,d.target.__data__.data.name);
      return
    }
  }
  if(d.target.__data__._children){
    
    d.target.__data__._children.forEach(function(e){
      append(e)
    })
    update(vGraph.data);
    return
  }
  if(d.target.__data__.children){
    d.target.__data__.children.forEach(function(e){
      append(e)
    })
    update(vGraph.data);
    return
  }

  const item = queryCache.data[wid];
  if(!item||item===undefined){
    vGraph.pushLink({"source":selectedNode.value,"target":vGraph.data.nodes[index],"weight":1,name:d.target.__data__.data.pwidlabel})
    linkCache.data[selectedNode.value.wid+wid]=wid;
    
    const sparql = betterDirectRelations.replace('$queryInput', wid)
      .replace(/langInput/g, languageSelector.value)
    queryHandler.direct(wid, sparql,d.target.__data__.data.name);

  }
  else{
    console.log(selectedNode.value===vGraph.data.nodes[item.index])
    vGraph.pushLink({"source":selectedNode.value,"target":vGraph.data.nodes[item.index],"weight":1,name:d.target.__data__.data.pwidlabel})
    linkCache.data[selectedNode.value.wid+wid]=wid;
    selectedNode.value=vGraph.data.nodes[item.index]; 
    directResponseRecived.invoke(wid);
  }
}
///////////////////////////////////////

// update(graph);

// d3.timeout(function() {
//   graph.nodes.push(Q2);
//   graph.nodes.push(Q3); 
//   // graph.links.push({source: 'Q1', target: 'Q3',name:'Prim@'}); 
//   graph.links.push({source:'Q1',target:'Q2',name:'Herman@'})
//   update(graph);
// }, 3000);

// d3.timeout(function() {
//   graph.nodes.push(Q4);
//   // graph.nodes.push(Q5); 
//   // graph.links.push({source: 'Q3', target: 'Q4',name:'Amig@'}); 
//   graph.links.push({source: 'Q4', target: 'Q2',name:'Herman@'}); 
//   graph.links.push({source: 'Q2', target: 'Q4',name:'Amig@'}); 
//   // graph.links.push({source: 'Q3', target: 'Q5'}); 
//   // graph.links.push({source: 'Q5', target: 'Q2'}); 
//   update(graph);
// }, 6000);

