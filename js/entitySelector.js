import {betterDirectRelations} from './predefinedQueries.js';
import {queryHandler} from './queryHandler.js'
import { queryCache, vGraph } from './wikigrafoDataRepositories.js';
//Global variables
let midDictionary = {};
let selectedSuggestion = null;
//Static DOM Elements Config

// Fill languageSelector options
const addToCurrentSearch=document.getElementById('addToCurrentSearch');
const languageSelector = document.getElementById("languageSelector");
const possibleLanguages=[{'text':'Español','value':'es'},{'text':'English','value':'en'}]
const suggestionList =document.getElementsByTagName('datalist')[0]; 

for(var language in possibleLanguages){
  languageSelector.options[languageSelector.options.length] = new Option(possibleLanguages[language].text,possibleLanguages[language].value);
}; 


//Entity Suggestions
const entitySelectionWidget=document.getElementById('suggestions-choice');
//Intercept 'Enter' keydown event
entitySelectionWidget.addEventListener("keydown",(e)=>{
  if(e.code == 'Enter'){
    e.preventDefault();
    if(entitySelectionWidget.value=='')return false;
    entitySelectionWidget.value=suggestionList.firstChild.value;
    removeChilds(suggestionList);
    getIdOfSelectedEntity(entitySelectionWidget.value,languageSelector.value);
  };
})
//Runs when text is inserted 
entitySelectionWidget.addEventListener("keyup",(e)=>{
  if(selectedSuggestion===null && entitySelectionWidget.value!='')getSuggestions(e);
  else selectedSuggestion=null;
  })

//Ask for a list of suggestions
async function getSuggestions(e){
  if(e.which!=38&&e.which!=40&&e.which!=13){
    const suggestionsUrl=
      'https://'+languageSelector.value+
      '.wikipedia.org/w/api.php?'+
      'action=opensearch&'+
      'format=json&'+
      'origin=*&search='+
      entitySelectionWidget.value;   
    try { 
      const response = await fetch(suggestionsUrl);
      const results = await response.json();
      removeChilds(suggestionList);
      fillSuggestions(results);
    }
    catch{
    console.log('Something failed while asking for suggestions')
    }
  }
}

//Fill the options using results from query
function fillSuggestions(results){
  results[1].forEach(function(result){
    var option = document.createElement('option');
    option.value = result;
    suggestionList.appendChild(option);
 });
}

//Clean suggestions list
const removeChilds = (parent) => {
  while (parent.lastChild) {
      parent.removeChild(parent.lastChild);
  }
};

//Runs when a suggestion is selected
entitySelectionWidget.addEventListener("input", function(event){
  if(event.inputType == "insertReplacementText" || event.inputType == null) {
    selectedSuggestion = event.target.value;
    removeChilds(suggestionList);
    var option = document.createElement('option');
    option.value = result;
    suggestionList.appendChild(option);
    getIdOfSelectedEntity(selectedSuggestion,languageSelector.value);
  }
});

//Self explanatory?
async function getIdOfSelectedEntity(selection,language){
  const idFromSelectionUrl=
  'https://www.wikidata.org/w/api.php?'+
  'action=wbgetentities&'+
  'sites='+language+'wiki&'+
  'titles='+selection+'&'+
  'languages='+language+'&'+
  'origin=*&'+
  'format=json&'+
  'sitefilter='+language+'wiki'
  // try { 
    const response = await fetch(idFromSelectionUrl);
    const results = await response.json();
    midDictionary[selection]=results['entities'][0];
    initialQuery(Object.keys(results['entities'])[0]);
    newSearchModal.style.display = "none";
  // }
  // catch{
  //   console.log('Something failed while getting the Id from the title')
  // }
}

function initialQuery(key){
  entitySelectionWidget.value='';
  removeChilds(suggestionList); 
  if(addToCurrentSearch.checked===false){
    vGraph.data={"nodes":[],"links":[]};
    queryCache.value={};
  }
  let sparql = betterDirectRelations.replace('$queryInput', key)
                    .replace(/langInput/g,languageSelector.value);
  queryHandler.direct(key, sparql,'');

}
 
// initialQuery('Q1');