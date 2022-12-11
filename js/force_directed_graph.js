import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
import {selectedNode,selectedLink, queryCache, inVgraphButNotQueryCache} from './wikigrafoDataRepositories.js'
import {directResponseRecived} from './wikigrafo_events.js'
import {vGraph} from './wikigrafoDataRepositories.js'
import {betterDirectRelations} from './predefinedQueries.js'
import {queryHandler} from './queryHandler.js'


const svg = d3.selectAll("#svg")

//Get computed size of container. I suspect there is a simpler way to do this
const width = +svg.node().getBoundingClientRect().width,
      height = +svg.node().getBoundingClientRect().height

const color = d3.scaleOrdinal(d3.schemeTableau10)

let simulation = d3.forceSimulation()
    .force('center', d3.forceCenter(width / 2, height / 2))
    .force("charge", d3.forceManyBody().strength(-50))
    .force("link", d3.forceLink().id(d => d.id).distance(70))
    .on("tick", ticked)

const g = svg.append('g')

let link = g.append("g")
    .attr("stroke", "#fff")
    .attr("stroke-width", 1)
    .selectAll("path");

let node = g.append("g")
    .attr("stroke", "#fff")
    .attr("stroke-width", 1)
    .selectAll("g");

let tooltip = d3.select("body")
    .append("div")
    .style("position", "absolute")
    .style("z-index", "10")
    .style("visibility", "hidden")
    .style("background", "#000")
    .style("color","#fff")
    .text("a simple tooltip");

const handleZoom = (e) => {
    g.attr('transform', e.transform);
  }
const zoom = d3.zoom().on('zoom', handleZoom);
d3.select('svg').call(zoom);
  
function ticked() {
  link.attr("d",linkArc)
  node
    .attr("transform", d => `translate(${d.x},${d.y})`)
  }

export function update({nodes, links}){
  simulation.nodes(nodes);
  simulation.force("link").links(links);
  simulation.alpha(1).restart();
  node = node
    .data(nodes, d => d.wid)
    .join(
      enter =>{ 
        let nodeContainer = enter.append("g");
        nodeContainer.attr("class","nodeContainer")
          .append("circle")
            .attr("r", 5)
            .on("mousedown",function(d){
              const wid=d.target.__data__.wid;
              const item=queryCache.data[wid];
              if(!item){
                var sparql = betterDirectRelations.replace('$queryInput', wid)
                  .replace(/langInput/g, languageSelector.value)
                  queryHandler.direct(wid, sparql,'');
              }else{
                if (!selectedNode.isSelected(vGraph.data.nodes[item.index])){
                      selectedNode.value=vGraph.data.nodes[item.index];
                      selectedLink.value = null;
                      directResponseRecived.invoke(wid)
                  }
              }
            })
            .attr("fill", d => color(d.id))
            .classed("node_selected", function(d) {return d.id === selectedNode.value.id;})
            .call(drag(simulation))

        nodeContainer.append("text")
            .text(d => d.name)  
            .attr("class","nodelabel")
            .attr("dy", "-1em")
            .attr("text-anchor", "middle")
            .style("pointer-events","none")
        return nodeContainer
      }
     )
     .classed("node_selected", function(d){return d.wid === selectedNode.value.wid;});
  
  link = link
    .data(links, d => `${d.source.id}\t${d.target.id}`)
    .join(
      enter=>enter.append("path")
        .on("mouseover", function(d){tooltip.text(d.target.__data__.name); return tooltip.style("visibility", "visible");})
        .on("mousemove", function(d){return tooltip.style("top", (d.pageY-10)+"px").style("left",(d.pageX+10)+"px");})
        .on("mouseout", function(){return tooltip.style("visibility", "hidden");})
    )         
}

function drag(simulation) {    
  function dragstarted(event) {
   
    if (!event.active) simulation.alphaTarget(1).restart();
    event.subject.fx = event.subject.x;
    event.subject.fy = event.subject.y;
  }
  
  function dragged(event) {
    event.subject.fx = event.x;
    event.subject.fy = event.y;
  }
  
  function dragended(event) {
    if (!event.active) simulation.alphaTarget(0);
    event.subject.fx = null;
    event.subject.fy = null;
  }
  
  return d3.drag()
    .on("start", dragstarted)
    .on("drag", dragged)
    .on("end", dragended);
}

function linkArc(d){
  var dx = d.target.x - d.source.x,
      dy = d.target.y - d.source.y,
      dr = Math.sqrt(dx*dx+dy*dy)
  return "M" + d.source.x + "," + d.source.y + "A" + dr + "," + dr + " 0 0,1 " + d.target.x + "," + d.target.y;
}

function updateFromRequest(){
  const item = queryCache.data[this]; //Here 'this' comes from the call() when the event is invoked. It brings the wid
  if(inVgraphButNotQueryCache[this]){
    selectedNode.value=vGraph.data.nodes[inVgraphButNotQueryCache[this].index];
    item.index=inVgraphButNotQueryCache[this].index;
    delete inVgraphButNotQueryCache[this];
  }
  else{
    if(item.index===-1){
      const index = vGraph.pushNode({name:item.label,wid:item.direct.root.wid});
      selectedNode.value=vGraph.data.nodes[index];
      }
  }
  update(vGraph.data);
}

directResponseRecived.subscribe(updateFromRequest);
