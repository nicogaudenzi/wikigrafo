export {  directRelationsQuery,wikiPageFromId,reverseRelationsQuery,getPic,betterDirectRelations}
var query0= `
		PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
		PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
		PREFIX dbpedia-owl: <http://dbpedia.org/ontology/>
		PREFIX dbpprop: <http://dbpedia.org/property/>
		PREFIX dbpedia: <http://dbpedia.org/resource/>

		SELECT DISTINCT ?lang1 ?lang2 ?lang1label ?lang2label ?lang1value ?lang2value ?lang1year ?lang2year
		WHERE {
		  ?lang1 rdf:type dbpedia-owl:ProgrammingLanguage ;
		         rdfs:label ?lang1name ;
		         dbpprop:year ?lang1year .
		  ?lang2 rdf:type dbpedia-owl:ProgrammingLanguage ;
		         rdfs:label ?lang2name ;
		         dbpprop:year ?lang2year .
		  ?lang1 dbpedia-owl:influenced ?lang2 .
		  FILTER (?lang1 != ?lang2)
		  FILTER (LANG(?lang1name) = 'en')
		  FILTER (LANG(?lang2name) = 'en')
		  BIND (replace(?lang1name, " .programming language.", "") AS ?lang1label)
		  BIND (replace(?lang2name, " .programming language.", "") AS ?lang2label)
		  FILTER (?lang1year > 1950 AND ?lang1year < 2020)
		  FILTER (?lang2year > 1950 AND ?lang2year < 2020)
		  # To render older language larger than newer
		  BIND ((2020 - ?lang1year) AS ?lang1value)
		  BIND ((2020 - ?lang2year) AS ?lang2value)
	}
	`

var query1 = `
			PREFIX entity: <http://www.wikidata.org/entity/>
			SELECT DISTINCT ?propUrl ?propLabel ?valUrl ?valLabel ?picture
			WHERE
			{
			    hint:Query hint:optimizer 'None' .
			    {BIND(entity:$queryInput AS ?valUrl) . 
			        BIND("N/A" AS ?propUrl ) .
			        BIND("identity"@en AS ?propLabel ) .
			    }
			    UNION 
			    {entity:$queryInput ?propUrl ?valUrl .
			        ?property ?ref ?propUrl .
			        ?property a wikibase:Property .
			        ?property rdfs:label ?propLabel
			    }
			    
			    ?valUrl rdfs:label ?valLabel
			    FILTER (LANG(?valLabel) = 'en') .
			    OPTIONAL{ ?valUrl wdt:P18 ?picture .}
			    FILTER (lang(?propLabel) = 'en' )
			}
			ORDER BY ?propUrl ?valUrl
			`
var directRelationsQuery = `PREFIX entity: <http://www.wikidata.org/entity/>
        SELECT DISTINCT ?s ?sLabel ?propUrl ?propLabel ?valUrl ?valLabel ?picture ?type ?description ?quantityUrl ?quantity ?quantityLabel
        WHERE
        {
            BIND(entity:$queryInput AS ?s) . 

            ?s ?propUrl ?valUrl .
            ?s rdfs:label ?sLabel . 
            ?property ?ref ?propUrl .
            ?property a wikibase:Property .
            ?property rdfs:label ?propLabel .
            ?valUrl rdfs:label ?valLabel .

			
            FILTER (LANG(?valLabel) = 'langInput') .
            FILTER (lang(?propLabel) = 'langInput') .
            FILTER (lang(?sLabel) = 'langInput')  .
			OPTIONAL{
				?s ?quantity ?quantityUrl .
				?quantity ?ref ?quantityUrl .
				?quantity a wikibase:Quantity .
				?quantity rdfs:label ?quantityLabel .
				FILTER (lang(?quantityLabel) = 'langInput') . 
			}
			OPTIONAL{
				?s schema:description ?description .
				FILTER (lang(?description) = 'langInput')  .
				}
		    }`
//https://w.wiki/5pT7
//https://query.wikidata.org/#PREFIX%20entity%3A%20%3Chttp%3A%2F%2Fwww.wikidata.org%2Fentity%2F%3E%0ASELECT%20%3FpropLabel%20%3FpropUrl%20%3Fval_Label%20%3FwdpqLabel%20%3Fpq_Label%20%3Fval_%20%3Fwbtype%20%3Fdescription%20%3Farticle%7B%0A%20%20BIND%28entity%3AQ405%20AS%20%3Fs%29%20.%20%0A%20%20%3Fs%20%3FpropUrl%20%3FvalUrl%20.%0A%20%20%3FvalUrl%20%3Fval%20%3Fval_%20.%0A%20%20%0A%20%20%3Fproperty%20%3Fref%20%3FpropUrl%20.%0A%20%20%3Fproperty%20rdfs%3Alabel%20%3FpropLabel%20.%0A%20%20%3Fproperty%20wikibase%3ApropertyType%20%20%3Fwbtype.%0A%20%20%0A%20%20%3Fwd%20wikibase%3Aclaim%20%3FpropUrl.%0A%20%20%3Fwd%20wikibase%3AstatementProperty%20%3Fval.%0A%20%20%0A%20%20OPTIONAL%20%7B%0A%20%20%20%20%3FvalUrl%20%3Fpq%20%3Fpq_%20.%0A%20%20%20%20%3Fwdpq%20wikibase%3Aqualifier%20%3Fpq%20.%0A%20%20%7D%0A%20%20FILTER%20%28lang%28%3FpropLabel%29%20%3D%20%27en%27%29%20.%0A%20%20OPTIONAL%7B%0A%09%09%3Fs%20schema%3Adescription%20%3Fdescription%20.%0A%09%09FILTER%20%28lang%28%3Fdescription%29%20%3D%20%27en%27%29%20%20.%0A%09%09%7D%0A%20%20%3Farticle%20schema%3Aabout%20%3Fs.%0A%20%20%3Farticle%20schema%3AinLanguage%20%22en%22%20.%0A%20%20FILTER%20%28SUBSTR%28str%28%3Farticle%29%2C%201%2C%2025%29%20%3D%20%22https%3A%2F%2Fen.wikipedia.org%2F%22%29%0A%20%20%0A%20%20SERVICE%20wikibase%3Alabel%20%7B%20bd%3AserviceParam%20wikibase%3Alanguage%20%22en%22%20%7D%0A%7D%20%0A%0A
var betterDirectRelations =`
	PREFIX entity: <http://www.wikidata.org/entity/>
	SELECT ?s ?sLabel ?propLabel ?propUrl ?val_Label ?wdpqLabel ?pq_Label ?val_ ?wbtype ?description ?article ?picture{
	BIND(entity:$queryInput AS ?s) . 
	?s ?propUrl ?valUrl .
	?valUrl ?val ?val_ .
	?s rdfs:label ?sLabel .

	?property ?ref ?propUrl .
	?property rdfs:label ?propLabel .
	?property wikibase:propertyType  ?wbtype.
	
	?wd wikibase:claim ?propUrl.
	?wd wikibase:statementProperty ?val.
	
	OPTIONAL {
	?valUrl ?pq ?pq_ .
	?wdpq wikibase:qualifier ?pq .
	}
	FILTER (lang(?propLabel) = 'langInput' ).
	FILTER (lang(?sLabel) = 'langInput' ).
	OPTIONAL{
		?s schema:description ?description .
		FILTER (lang(?description) = 'langInput'  )
		}
	?article schema:about ?s.
	?article schema:inLanguage 'langInput'.
	FILTER (SUBSTR(str(?article), 1, 25) = "https://langInput.wikipedia.org/")
	OPTIONAL{
		?s  wdt:P18     ?picture  .
	 }			
  SERVICE wikibase:label { bd:serviceParam wikibase:language 'langInput'}
}
` 
var getPic=`
        PREFIX entity: <http://www.wikidata.org/entity/>
        SELECT DISTINCT ?s ?picture
        WHERE
        {
            BIND(entity:$queryInput AS ?s) . 
            OPTIONAL{
               ?s  wdt:P18     ?picture  .
            }
        }`
 
var query3 = `
PREFIX entity: <http://www.wikidata.org/entity/>

#  In addition to the original query this one comes with some advantages:
#  - You will get only literals as results, (even if the values are stored as IRI in wikibase)
#  - That means you will also get properties as birth date, alphanumeric identifier and so on.
#  - The list is ordered numerically by property number. (So P19 comes before P100) 
#  - All label, altLabel and description in a given Language are included.
#  You may open a separate column ?valUrl if you need also the IRI
#
#  Please advise, if there is an option to put the Q-Number  and/or the Language 
#  code into a runtime variable. 

SELECT ?propNumber ?propLabel ?val
WHERE
{
	hint:Query hint:optimizer 'None' .
	{	BIND(entity:$queryInput AS ?valUrl) .
		BIND("N/A" AS ?propUrl ) .
		BIND("Name"@'langInput' AS ?propLabel ) .
       entity:$queryInput rdfs:label ?val .
      
        FILTER (LANG(?val) = 'langInput') 
	}
    UNION
    {   BIND(entity:$queryInput AS ?valUrl) .
      
        BIND("AltLabel"@de AS ?propLabel ) .
        optional{entity:$queryInput skos:altLabel ?val}.
        FILTER (LANG(?val) = 'langInput') 
    }
    UNION
    {   BIND(entity:$queryInput AS ?valUrl) .
      
        BIND("Beschreibung"@de AS ?propLabel ) .
        optional{entity:$queryInput schema:description ?val}.
        FILTER (LANG(?val) = 'langInput') 
    }
   	UNION
	{	entity:$queryInput ?propUrl ?valUrl .
		?property ?ref ?propUrl .
		?property rdf:type wikibase:Property .
		?property rdfs:label ?propLabel.
     	FILTER (lang(?propLabel) = 'langInput' )
        filter  isliteral(?valUrl) 
        BIND(?valUrl AS ?val)
	}
	UNION
	{	entity:$queryInput ?propUrl ?valUrl .
		?property ?ref ?propUrl .
		?property rdf:type wikibase:Property .
		?property rdfs:label ?propLabel.
     	FILTER (lang(?propLabel) = 'langInput' ) 
        filter  isIRI(?valUrl) 
        ?valUrl rdfs:label ?valLabel 
		FILTER (LANG(?valLabel) = 'langInput') 
         BIND(CONCAT(?valLabel) AS ?val)
	}
        BIND( SUBSTR(str(?propUrl),38, 250) AS ?propNumber)
}
ORDER BY xsd:integer(?propNumber)
`
var reverseRelationsQuery = `PREFIX entity: <http://www.wikidata.org/entity/>
        SELECT DISTINCT ?s ?sLabel ?propUrl ?propLabel ?valUrl ?val_Label 
        WHERE
        {
            BIND(entity:$queryInput AS ?s) . 

            ?valUrl ?propUrl  ?s.
            ?property ?ref ?propUrl .
            ?property a wikibase:Property .
            ?property rdfs:label ?propLabel .
            ?valUrl rdfs:label ?val_Label .
            ?s rdfs:label ?sLabel .   
            FILTER (LANG(?val_Label) = 'langInput') .
            FILTER (lang(?propLabel) = 'langInput') .
            FILTER (lang(?sLabel) = 'langInput')  
            
    }LIMIT 100`
const wikiPageFromId =`
prefix schema: <http://schema.org/>
PREFIX wikibase: <http://wikiba.se/ontology#>
PREFIX wd: <http://www.wikidata.org/entity/>
PREFIX wdt: <http://www.wikidata.org/prop/direct/>

SELECT ?article WHERE {
      ?article schema:about wd:Q1.
      ?article schema:inLanguage "es" .
      FILTER (SUBSTR(str(?article), 1, 25) = "https://es.wikipedia.org/")
} 
`