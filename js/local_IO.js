import {queryCache, selectedNode, vGraph,linkCache} from './wikigrafoDataRepositories.js'
import { update } from "./force_directed_graph.js";
import {directTree,reverseTree} from './collapsibleIndentTree.js'
import {quantityTree} from './quantityTree.js'
import {resourcesTree} from './resourcesTree.js'


const download=document.getElementById('download'),
    upload=document.getElementById('loadFileBtn'),
    uploadFile=document.getElementById('myFile'),
    loadModal=document.getElementById('loadModal'),
    saveModal=document.getElementById('saveModal'),
    resultsContainer = document.getElementById("result"),
    imgContainer = document.getElementById("img"),
    reverseContainer = document.getElementById("reverse"),
    quantityContainer=document.getElementById("quantity"),
    resourcesContainer=document.getElementById("resources"),
    languageSelector = document.getElementById("languageSelector"),
    graphSvg= document.getElementById('svg');

download.onclick=function(){
    console.log(languageSelector.value)
    const exportObj ={
        queryCache:queryCache.data,vGraph:vGraph.data,language:languageSelector.value
    }
    downloadObjectAsJson(exportObj, 'wikigrafo') 
    saveModal.style.display="none"
}
function downloadObjectAsJson(exportObj, exportName){

    const blob = new Blob([JSON.stringify(exportObj, null, 2)], {
        type: "application/json",
      });
    const jsonUrl = URL.createObjectURL(blob);

    var downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href",jsonUrl);
    downloadAnchorNode.setAttribute("download", exportName + ".json");
    
    document.body.appendChild(downloadAnchorNode); // required for firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();

    URL.revokeObjectURL(jsonUrl);

  }
upload.onclick=function upload(){
    // If there's no file, do nothing
	if (!uploadFile.value.length) return;
    let reader = new FileReader();
    // Setup the callback event to run when the file is read
	reader.onload = updateFromFile;
    reader.readAsText(uploadFile.files[0]);
}

function updateFromFile (event) {
	let str = event.target.result;
    try{
        let json = JSON.parse(str);
        console.log(json)
        vGraph.data={"nodes":[],"links":[]};
        vGraph.data.nodes=json.vGraph.nodes;
        linkCache.data={};
        json.vGraph.links.forEach(element => {
            linkCache.data[element.source.wid+element.target.wid]=element.target.wid;
            vGraph.pushLink({"source":vGraph.data.nodes[element.source.index],"target":vGraph.data.nodes[element.target.index],"weight":1,name:element.name})
        });

    queryCache.data=json.queryCache;
    const item=vGraph.data.nodes[0];
    selectedNode.value=item;
    if(resultsContainer.hasChildNodes()){
        resultsContainer.removeChild(resultsContainer.lastChild);
        quantityContainer.removeChild(quantityContainer.lastChild);
        resourcesContainer.removeChild(resourcesContainer.lastChild);
        reverseContainer.removeChild(reverseContainer.lastChild);
    }
    update(vGraph.data);
    resultsContainer.appendChild(directTree.restart(queryCache.data[item.wid].direct.root));
    reverseContainer.appendChild(reverseTree.restart(queryCache.data[item.wid].reverse.root));
    quantityContainer.appendChild(quantityTree(queryCache.data[item.wid].quantity.root));
    resources.appendChild(resourcesTree(queryCache.data[item.wid].resources.root));
    imgContainer.src=queryCache.data[item.wid].img; 
    document.getElementById('description').textContent=queryCache.data[item.wid].description;
    document.getElementById('wikilink').href =queryCache.data[item.wid].article;
    languageSelector.value = json.language;
    
    loadModal.style.display="none";
    }
    catch{
        alert('Algo salio mal cargando el archivo')
    }
}