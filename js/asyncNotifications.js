import {queryRequested,directResponseRecived} from './wikigrafo_events.js'
import {directTree,reverseTree} from './collapsibleIndentTree.js'
import {quantityTree} from './quantityTree.js'
import {resourcesTree} from './resourcesTree.js'
import {queryCache} from './wikigrafoDataRepositories.js'
import {queryHandler} from './queryHandler.js'
import {reverseRelationsQuery} from './predefinedQueries.js';

let loadSpinners = document.getElementsByClassName("loader"),
    imgContainer = document.getElementById("img"),
    resultsContainer = document.getElementById("result"),
    reverseContainer = document.getElementById("reverse"),
    imgLoader= document.getElementById("imgLoader"),
    quantityContainer=document.getElementById("quantity"),
    quantityLoader=document.getElementById("quantity"),
    resourcesContainer=document.getElementById("resources"),
    resourceLoader=document.getElementById("resourcesLoader")

let showSpinners=function(){
    for (var i=0; i<loadSpinners.length; i++){
        loadSpinners[i].style.visibility = "visible";
        loadSpinners[i].style.display="block";
   }
   imgContainer.style.display="none";
   resultsContainer.style.display="none";
   reverseContainer.style.display="none";
   quantityContainer.style.display="none";
   resourcesContainer.style.display="none";
}
queryRequested.subscribe(showSpinners);

let hideSpinners=function(){
    for (var i=0; i<loadSpinners.length; i++){
        loadSpinners[i].style.visibility = "hidden";
        loadSpinners[i].style.display="none";
   }
   imgContainer.style.display="block";
   resultsContainer.style.display="block";
   reverseContainer.style.display="block";
   quantityContainer.style.display="block";
   resourcesContainer.style.display="block";
}

let showImg = function(){
    imgLoader.style.display="none";
    imgContainer.style.display="block";    
}
let showResults = function(){
    resultsLoader.style.display="none";
    resultsContainer.style.display="block";    
}
let showReverse = function(){
    reverseLoader.style.display="none";
    reverseContainer.style.display="block";    
}
function renderDirect(){
    hideSpinners();
    let item = queryCache.data[this];//Here 'this' comes from the call() when the event is invoked. It brings the wid 
    if(resultsContainer.hasChildNodes()){
      resultsContainer.removeChild(resultsContainer.lastChild);
      quantityContainer.removeChild(quantityContainer.lastChild);
      resourcesContainer.removeChild(resourcesContainer.lastChild);
    }
    resultsContainer.appendChild(directTree.restart(item.direct.root))
      
    quantityContainer.appendChild(quantityTree(item.quantity.root));
    resources.appendChild(resourcesTree(item.resources.root));
    document.getElementById('img').src=item.img; 
    document.getElementById('description').textContent=item.description;
    document.getElementById('wikilink').href =item.article;
  // Now we search the reverse properties
    const languageSelector = document.getElementById("languageSelector");

    let sparqlRev = reverseRelationsQuery.replace('$queryInput', this)
      .replace(/langInput/g, languageSelector.value);
    queryHandler.reverse(this, sparqlRev, renderReverse,'');
  }
  directResponseRecived.subscribe(renderDirect);

function renderReverse(key){
    if(reverseContainer.hasChildNodes())
      reverseContainer.removeChild(reverseContainer.lastChild);
    if(queryCache.data[key].reverse){
      reverseContainer.appendChild(reverseTree.restart(queryCache.data[key].reverse.root))
    }
    else{
      reverseContalner.appendChild(reverseTree.restart({name:"no information found"}))
    }
  }
  
