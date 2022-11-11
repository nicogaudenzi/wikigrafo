"use strict"
import {getPic,  directRelationsQuery,reverseRelationsQuery} from './predefinedQueries.js';
import {selectedNode,queryCache,imageDict, vGraph, reverseQueryCache, linkCache} from './wikigrafoDataRepositories.js'
import {setupForceGraph,render,renderReverse,renderPic,redraw, updateGraphData} from './force_directed_graph.js';
import {d3sparql} from './d3sparql.js'
export {TreeHandler as demoQueries}
var TreeHandler= {
  version: "v01",
}
TreeHandler.customTreeParser = function(json) {
  var data = json.results.bindings
  var folder = {}
  folder["root"] = {"name":data[0]["sLabel"]["value"],"children":[],"wid":data[0]["s"]["value"].split("/").pop()}
  var setProps = {};
  for (var i = 0; i < data.length; i++) {
  		var propertyName = data[i]["propLabel"]["value"]
		if(!setProps[propertyName]){
  			folder["root"]["children"].push({"name":propertyName,"_children":[],"wid":data[i]["propUrl"]["value"].split("/").pop()})
			setProps[propertyName]=folder["root"]["children"].length;
		}
	}
	for (var i = 0; i < data.length; i++) {

		var propertyName = data[i]["propLabel"]["value"]
		var index = setProps[propertyName];
		folder["root"]["children"][index-1]["_children"].push(
      {"name":data[i]["valLabel"]["value"],
      "wid":data[i]["valUrl"]["value"].split("/").pop(),
      "widlabel":data[i]["valLabel"]["value"].split("/").pop(),
      "pwid":data[i]["propUrl"]["value"].split("/").pop(),
      "pwidlabel":data[i]["propLabel"]["value"].split("/").pop(),
  })
	}	 
  return folder
}

TreeHandler.renderFolder = function(json,config){
  var opts = {
      "width":    config.width    || 300,
      "height":   config.height   || 2000,
      "margin":   config.margin   || 350,
      "radius":   config.radius   || 5,
      "selector": config.selector || null
    }
  var margin = {top: 30, right: 20, bottom: 30, left: 20},
      width = 600 - margin.left - margin.right,
      barHeight = 20,
      barWidth = width * .4;

  var i = 0,
      duration = 400,
      localroot;

  var tree = d3.layout.tree()
      .nodeSize([0, 20]);

  var graph = {'inData':json["root"]}

  d3.select(opts.selector).selectAll("svg").remove();

  var svg = d3.select(opts.selector).append("svg")
      .attr("width", width)
      .attr("height",2500)
      .append("g");

  graph['inData'].x0 = 0;
  graph['inData'].y0 = 0;

  update(localroot = graph["inData"]);

  function update(source) {
  // Compute the flattened node list. TODO use d3.layout.hierarchy.
    var nodes = tree.nodes(localroot);
    var height = Math.max(500, nodes.length * barHeight + margin.top + margin.bottom);

    d3.select("svg").transition()
        .duration(duration)

    d3.select(self.frameElement).transition()
        .duration(duration)
        .style("height", height + "px");

    // Compute the "layout".
    nodes.forEach(function(n, i) {
      n.x = i * barHeight +10;
    });

    // Update the nodes…
    var node = svg.selectAll("g.node")
        .data(nodes, function(d) { return d.id || (d.id = ++i); });

    var nodeEnter = node.enter().append("g")
        .attr("class", "node")
        .attr("transform", function(d) { return "translate(" + source.y0 + "," + source.x0 + ")"; })
        .attr("wid",function(d){ return d.wid})
        .attr("widlabel",function(d){return d.widlabel})
        .attr("pwid",function(d){ return d.pwid})
        .attr("pwidlabel",function(d){return d.pwidlabel})
        .style("opacity", 1e-6);

    // Enter any new nodes at the parent's previous position.
    nodeEnter.append("rect")
        .attr("y", -barHeight / 2)
        .attr("height", barHeight)
        .attr("width", barWidth)
        .style("fill", color)
        .style("stroke", "#000")
        .on("click", click)
        

    nodeEnter.append("text")
        .attr("dy", 3.5)
        .attr("dx", 5.5)
        .text(function(d) { return d.name.charAt(0).toUpperCase() + d.name.slice(1);})
        .on({"mouseover": function(d) {
          d3.select(this).style("cursor", "default"); 
          }, 
        "mouseout": function(d) {
          d3.select(this).style("cursor", "default"); 
          }
        })
        .on("click", click);
    nodeEnter.append("text")
        .attr("dy",3.5)
        .attr("dx",200)
        .text(function(d){
          if(!selectedNode.value){
            if(queryCache.data[d.wid]) {return "L"}
            return d._children==null?"+":""
          }
          if(linkCache.data[selectedNode.value["wid"]+d.wid]===d.wid){return "S"}

          if(queryCache.data[d.wid]) {return "L"}
          return "+"})
        .on("click", appendAndSelect)
        .on({"mouseover": function(d) {
          d3.select(this).style("cursor", "pointer"); 
          }, 
        "mouseout": function(d) {
          d3.select(this).style("cursor", "default"); 
        }
      });
    // Transition nodes to their new position.
    nodeEnter.transition()
        .duration(duration)
        .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; })
        .style("opacity", 1);

    node.transition()
        .duration(duration)
        .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; })
        .style("opacity", 1)
        .select("rect")
        .style("fill", color);

    // Transition exiting nodes to the parent's new position.
    node.exit().transition()
        .duration(duration)
        .attr("transform", function(d) { return "translate(" + source.y + "," + source.x + ")"; })
        .style("opacity", 1e-6)
        .remove();

    // Update the links…
    var link = svg.selectAll("path.link")
        .data(tree.links(nodes), function(d) { return d.target.id; });

    // Stash the old positions for transition.
    nodes.forEach(function(d) {
      d.x0 = d.x;
      d.y0 = d.y;
    });
  }

// Toggle children on click.
  function click(d) {
  

    if(d.children == null && d._children == null){

  //HERE GOES THE CODE FOR CLICKING BUT NOT ADDING

        // var endpoint = "https://query.wikidata.org/sparql"
        // var sparqltemp = query2.replace('$queryInput', d.wid)
        // var sparql = sparqltemp
        // if($("#flip-1").val() == "off"){
        //   sparql = sparqltemp.replace(/langInput/g, "es")
        // }else{
        //   sparql = sparqltemp.replace(/langInput/g, "en")
        // }
      }
      else{
        if (d.children) {
          d._children = d.children;
          d.children = null;
        } else {
          d.children = d._children;
          d._children = null;
        }
        update(d);
      }
    }

  function append(d){
    var index = vGraph.nodesLength();
    if(!queryCache.data[d.wid]){
      vGraph.pushNode({"id":index,"name":d.widlabel,"wid":d.wid,"group":2})
      vGraph.pushLink({"source":selectedNode.value,"target":vGraph.data.nodes[index],"weight":1})
      linkCache.data[selectedNode.value["wid"]+d.wid]=d.wid;
      queryCache.data[d.wid]={"index":index};
    }
    else{
      vGraph.pushLink({"source":selectedNode.value,"target":vGraph.data.nodes[queryCache.data[d.wid]["index"]],"weight":1})
        linkCache.data[selectedNode.value["wid"]+d.wid]=d.wid;
      }
    }


  function appendAndSelect(d){
    var index = vGraph.nodesLength();
    if(d.text=="S"){
      selectedNode.value = vGraph.data.nodes[queryCache.data[d.wid]]["index"]
      return
    }
    if(d._children){
      d3.select("#graph").selectAll("svg").remove();
      d._children.forEach(function(e){
        append(e)
      })
      setupForceGraph();
      return
    }
    if(d.children){
      d3.select("#graph").selectAll("svg").remove();
      d.children.forEach(function(e){
        append(e)
      })
      setupForceGraph();
      return
    }
    const relation=queryCache.data[d.wid];
    if(!relation){
      vGraph.pushNode({"id":index,"name":d.widlabel,"wid":d.wid,"group":2})
      vGraph.pushLink({"source":selectedNode.value,"target":vGraph.data.nodes[index],"weight":1})
      linkCache.data[selectedNode.value["wid"]+d.wid]=d.wid;
      selectedNode.value=vGraph.data.nodes[index];
    }
    else{
      vGraph.pushLink({"source":selectedNode.value, "target":vGraph.data.nodes[queryCache.data[d.wid]["index"]],"weight":1})
      linkCache.data[selectedNode.value["wid"]+d.wid]=d.wid;  
      selectedNode.value=vGraph.data.nodes[queryCache.data[d.wid]["index"]];
    }

    d3.select("#graph").selectAll("svg").remove();
     if(true){
    // if(!getDirectRelation(d.wid)){
      var endpoint = "https://query.wikidata.org/sparql"
      var sparqltemp = directRelationsQuery.replace('$queryInput', d.wid)
      var sparql = sparqltemp.replace(/langInput/g, languageSelector.value)
    
      d3sparql.query(endpoint, sparql, render)
      
      var sparqltempRev = reverseRelationsQuery.replace('$queryInput', d.wid)
      var sparqlRev =sparqltempRev.replace(/langInput/g, languageSelector.value)
    
      d3sparql.query(endpoint, sparqlRev, renderReverse)
      var pic = getPic.replace('$queryInput', d.wid)
      d3sparql.query(endpoint, pic, renderPic)
      setupForceGraph()
    }
    else{
      var config = {
        "width": 300,
        "height": 750,
        "selector": "#result",
        "value": 10
        }
      render(queryCache.data[d.wid]);
      renderReverse(reverseQueryCache[d.wid]);
      renderPic(imageDict.data[d.wid]);
      setupForceGraph();
    }
}


function color(d) {
    return d._children ? "#1b70ff" : d.children ? "blue" : "lightblue";
}
}
var jsonmio = {'data':"Ramiro"}

function Guarda(){
  const xhr = new XMLHttpRequest();
  xhr.open('POST', '/guardaWikiGrapho', true);
  xhr.setRequestHeader("Content-type","application/json");
  xhr.send(JSON.stringify(nodes));

//   console.log("Guarda");
//    // $.post("/guardaWikiGrapho","jsonmio",Success);
//   $.ajax({
//   type: "POST",
//   url: "/guardaWikiGrapho",
//   json:  {
//           action: 'wbsearchentities',
//           format: 'json',
//           formatversion: 2,
//           language:'en'
//         },
//   data: {
//           action: 'wbsearchentities',
//           format: 'json',
//           formatversion: 2,
//           language:'en'
//         },
//   success: Success(),
//   dataType: 'json'
// });
}

