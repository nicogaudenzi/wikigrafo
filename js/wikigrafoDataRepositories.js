"use strict"

window.test=()=>{
    Object.keys(queryCache).forEach(element => {
        console.log(element);
        console.log(queryCache[element]);
    });
    }
export const inVgraphButNotQueryCache = (function(){
      let _inVgraph = {};
      return {
        get data(){return _inVgraph}
      }
})();
export const queryCache =(function(){
    let _queryCache = {};
    return{
        get data(){return _queryCache},
        set data(value){_queryCache=value},
        add: function(id,label,description,article,picture){
            const rootNode = {name:label,children:[],wid:id};
            _queryCache[id]={
            wid:id,
            index:-1,
            label:label,
            description:description,
            article:article,
            direct:{root:{name:label,children:[],wid:id}},
            reverse:{root:{name:label,children:[],wid:id}},
            img:picture,
            quantity:{root:{name:label,children:[],wid:id}},
            resources:{root:{name:label,children:[],wid:id}}
            }
        },
        reverseParceAndStore(json){
            let _reverse = {};
            const listResult =json.results.bindings,
            currentItem = listResult[0],
            id=currentItem.s.value.split('/').pop();
            json.results.bindings.forEach((element) =>{ 
                let propertyName = element.propLabel.value;
                if(!_reverse[propertyName]){
                    queryCache.data[id].reverse.root.children.push({"name":propertyName,"children":[],"wid":element.propUrl.value.split("/").pop()})
                    _reverse[propertyName]=queryCache.data[id].reverse.root.children.length;
                    }
                queryCache.data[id].reverse.root.children[_reverse[propertyName]-1].children.push({
                    "name":element.val_Label.value,
                    "wid":element.valUrl.value.split("/").pop(),
                    "widlabel":element.val_Label.value.split("/").pop(),
                    "pwid":element.propUrl.value.split("/").pop(),
                    "pwidlabel":element.propLabel.value.split("/").pop()
                })
            })
        },
        parceAndStore(json){
            const listResult =json.results.bindings,
            currentItem = listResult[0],
            id=currentItem.s.value.split('/').pop(),
            label=currentItem.sLabel.value,
            article=currentItem.article.value;
            let description='Sin descripcion';
            if(currentItem.description)
                description=currentItem.description.value;
            let picture='https://www.clker.com/cliparts/A/Y/O/m/o/N/placeholder-md.png';
            if(currentItem.picture)
                picture=currentItem.picture.value;
  
            queryCache.add(id,label,description,article,picture);

            let _direct = {},
                _quantity={},
                _resources={};

            json.results.bindings.forEach((element) =>{
                const type = element.wbtype.value.split('#').pop()
                let propertyName = element.propLabel.value

                switch(type){
                case 'WikibaseItem':
                    if(!_direct[propertyName]){
                    queryCache.data[id].direct.root.children.push({"name":propertyName,"children":[],"wid":element.propUrl.value.split("/").pop()})
                    _direct[propertyName]=queryCache.data[id].direct.root.children.length;
                    }
                    queryCache.data[id].direct.root.children[_direct[propertyName]-1].children.push({
                        "name":element.val_Label.value,
                        "wid":element.val_.value.split("/").pop(),
                        "widlabel":element.val_Label.value.split("/").pop(),
                        "pwid":element.propUrl.value.split("/").pop(),
                        "pwidlabel":element.propLabel.value.split("/").pop()
                    })
                    // console.log('WikibaseItem: '+i+' '+element.propLabel.value+' '+element.val_Label.value)
                    break;
                case 'Quantity':
                    if(!_quantity[propertyName]){
                    queryCache.data[id].quantity.root.children.push({"name":propertyName,"children":[],"wid":element.propUrl.value.split("/").pop()})
                    _quantity[propertyName]=queryCache.data[id].quantity.root.children.length;
                    }
                    queryCache.data[id].quantity.root.children[_quantity[propertyName]-1].children.push({
                        "name":element.val_Label.value,
                        // "wid":element.propUrl.value.split("/").pop(),
                        "widlabel":element.val_Label.value.split("/").pop(),
                        "pwid":element.propUrl.value.split("/").pop(),
                        "pwidlabel":element.propLabel.value.split("/").pop()
                    })
                    // console.log('Quantity: '+i+' '+element.propLabel.value+' '+element.val_Label.value) 
                    break;
                case 'String':
                    // console.log('String: '+i+' '+element.propLabel.value+' '+element.val_Label.value) 
                    break;
                case 'CommonsMedia':
                    if(!_resources[propertyName]){
                    queryCache.data[id].resources.root.children.push({"name":propertyName,"children":[],"wid":element.propUrl.value.split("/").pop()})
                    _resources[propertyName]=queryCache.data[id].resources.root.children.length;
                    }
                    queryCache.data[id].resources.root.children[_resources[propertyName]-1].children.push({
                        "name":element.val_Label.value,
                        // "wid":element.propUrl.value.split("/").pop(),
                        "widlabel":element.val_Label.value.split("/").pop(),
                        "pwid":element.propUrl.value.split("/").pop(),
                        "pwidlabel":element.propLabel.value.split("/").pop()
                    })
            // console.log('CommonsMedia: '+i+' '+element.propLabel.value+' '+element.val_Label.value) 
            break;
            }
        
            })

        },
        noResultsFor(id,label){
            console.log(id);
            queryCache.add(id,label,'Sin informacion','Sin informacion','https://www.clker.com/cliparts/A/Y/O/m/o/N/placeholder-md.png');
            queryCache.data[id].direct.root.children.push({"name":'Sin informacion',"children":[{name:'Sin informacion',widlabel:'Sin informacion'}],"wid":id})
            queryCache.data[id].quantity.root.children.push({"name":'Sin informacion',"children":[{name:'Sin informacion',widlabel:'Sin informacion'}],"wid":id})
            queryCache.data[id].resources.root.children.push({"name":'Sin informacion',"children":[{name:'Sin informacion',widlabel:'Sin informacion'}],"wid":id})
        },
        noReverseFor(id,label){
            queryCache.data[id].reverse.root.children.push({"name":'Sin informacion',"children":[{name:'Sin informacion',widlabel:'Sin informacion'}],"wid":id})
        }
    }
})();


export const linkCache=(function(){
    let _link = {};
    return {
        get data(){return _link},
        set data(value){_link=value}
    }
})();
export const selectedNode =  (function() {
    let _selectedNode = null;
    return{
        get value() {return this._selectedNode},
        set value(node) {this._selectedNode=node;},
        isSelected:function(node){
            return node.wid===selectedNode.value.wid}
    }
})();

export const selectedLink =  (function() {
    let _selectedLink = null;
    return{
        get value() {return this._selectedLink},
        set value(link) {this._selectedLink=link},
        isSelected:function(link){return link===this._selectedLink}
    }
})();

export const imageDict =(function(){
    let _imgDict={};
     return {
         get data() {return _imgDict},
     }
 })();

export const vGraph =(function(){
    let _graph = {"nodes":[],"links":[]};
    return{
        get data(){return _graph},
        set data(value){_graph=value},
        pushNode:(node)=>{
            // console.log(node)
            if(queryCache.data[node.wid]){
                queryCache.data[node.wid].index=_graph.nodes.length;
                _graph.nodes.push(node)
            return queryCache.data[node.wid].index;
            }
            else{
                let index =_graph.nodes.length; 
                _graph.nodes.push(node);
                return index
            }
        },
        nodesLength:()=>{return _graph.nodes.length},
        pushLink:(link)=>{_graph.links.push(link)},
        reset:()=>{_graph={"nodes":[],"links":[]}}
    }
})();

export function resetMouseVars() {
    selectedNode.value =null;
    selectedLink.value=null;
  }
