import {json} from "https://cdn.skypack.dev/d3-fetch@3";

import { queryCache } from "./wikigrafoDataRepositories.js";
import {queryRequested,directResponseRecived} from './wikigrafo_events.js'

export {queryHandler}

const endpoint = "https://query.wikidata.org/sparql";
var queryHandler = {
  version: "queryHandler.js version 2020-10-24",
  debug:false  // set to true for showing debug information
}
queryHandler.fetchDirect = async function(id, url,label) {
  queryRequested.invoke();
  const data = await json(url);
  if(data.results.bindings.length!=0)
    queryCache.parceAndStore(data);
  else{
    queryCache.noResultsFor(id,label)
  }
  this.reciveRequest(id);
}
queryHandler.direct = function(id, sparql,label) {
  if(this.debug) console.log(queryCache.data[id])
  if(queryCache.data[id])
    this.reciveRequest(id);
  else {  
    var url = endpoint + "?format=json&query=" + encodeURIComponent(sparql)
    queryHandler.fetchDirect(id, url,label)
  }
}
  queryHandler.fetchReverse = async function(id, url, callback,label) {

    const data = await json(url);
    if(data.results.bindings.length!=0)
      queryCache.reverseParceAndStore(data);
    else
      queryCache.noReverseFor(id,label);
    callback(id);
  }

  queryHandler.reverse = function(id, sparql, callback,label) {
    if(this.debug)console.log(id)

    if(this.debug)console.log(queryCache.data[id])

    if(queryCache.data[id].reverse.root.children.length!=0){
      callback(id);
    }
    else {  
      var url = endpoint + "?format=json&query=" + encodeURIComponent(sparql)
      queryHandler.fetchReverse(id, url, callback,label)
    }
  }
  queryHandler.reciveRequest= function(id){
    directResponseRecived.invoke(id)
  }


