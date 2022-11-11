const details_list=document.getElementsByTagName('details')

Array.prototype.forEach.call(details_list, function(element) {
    element.onclick = function() {
        console.log(this)
        const clicked = this;
        Array.prototype.forEach.call(details_list, function(detail) {
            if(detail!=clicked){
                detail.open=false;
            }

        })
    }
  });