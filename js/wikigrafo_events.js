export const queryRequested = (function(){
    let _subscribers = []
    return{
        subscribe: (fn)=>_subscribers.push(fn),
        unsubscribe: (fnToRemove)=>{_subscribers.filter(fn=>{
            if(fn!=fnToRemove)return fn
        })},
        invoke: ()=> _subscribers.forEach(fn=>fn.call())
    }
})()

export const directResponseRecived = (function(){
    let _subscribers = []
    return{
        subscribe: (fn)=>_subscribers.push(fn),
        unsubscribe: (fnToRemove)=>{_subscribers.filter(fn=>{
            if(fn!=fnToRemove)return fn
        })},
        invoke: (id)=> _subscribers.forEach(fn=>fn.call(id))
    }
})()
export const reverseResponseRecived = (function(){
    let _subscribers = []
    return{
        subscribe: (fn)=>_subscribers.push(fn),
        unsubscribe: (fnToRemove)=>{_subscribers.filter(fn=>{
            if(fn!=fnToRemove)return fn
        })},
        invoke: ()=> _subscribers.forEach(fn=>fn.call())
    }
})()
export const pictureResponseRecived = (function(){
    let _subscribers = []
    return{
        subscribe: (fn)=>_subscribers.push(fn),
        unsubscribe: (fnToRemove)=>{_subscribers.filter(fn=>{
            if(fn!=fnToRemove)return fn
        })},
        invoke: ()=> _subscribers.forEach(fn=>fn.call())
    }
})()