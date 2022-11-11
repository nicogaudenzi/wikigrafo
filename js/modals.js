// Get the modal
const newSearchModal = document.getElementById("newSearchModal"),
   saveModal = document.getElementById('saveModal'),
   loadModal=document.getElementById('loadModal'),
   learnModal=document.getElementById('learnModal'),
   exampleModal=document.getElementById('exampleModal'),
   aboutModal=document.getElementById('aboutModal'),
   supportModal=document.getElementById('supportModal');

// Get the button that opens the modal
const newSearchBtn = document.getElementById("newSearchBtn"),
    saveBtn=document.getElementById('saveBtn'),
    loadBtn=document.getElementById('loadBtn'),
    learnBtn=document.getElementById('learnBtn'),
    exampleBtn=document.getElementById('exampleBtn'),
    aboutBtn=document.getElementById('aboutBtn'),
    supportBtn=document.getElementById('supportBtn');

// Get the <span> element that closes the modal
const spans = document.getElementsByClassName("close");
// When the user clicks on the button, open the modal
newSearchBtn.onclick = function() {
  newSearchModal.style.display = "block";
}
saveBtn.onclick=function(){
  saveModal.style.display="block";
}
loadBtn.onclick=function(){
  loadModal.style.display="block";
}
learnBtn.onclick=function(){
  learnModal.style.display="block";
}
exampleBtn.onclick=function(){
  exampleModal.style.display="block";
}
aboutBtn.onclick=function(){
  aboutModal.style.display="block";
}
supportBtn.onclick=function(){
  supportModal.style.display="block"
}
Array.prototype.forEach.call(spans, function(element) {
  element.onclick = function() {
    newSearchModal.style.display = "none";
    saveModal.style.display="none";
    loadModal.style.display="none";
    learnModal.style.display="none";
    exampleModal.style.display="none";
    aboutModal.style.display="none";
    supportModal.style.display="none";
  }
});

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
  if (event.target == newSearchModal) {
    newSearchModal.style.display = "none";
  }
  if(event.target==saveModal){
    saveModal.style.display="none";
  }
  if(event.target==loadModal){
    loadModal.style.display="none"
  }
  if(event.target==learnModal){
    learnModal.style.display="none";
  }
  if(event.target==exampleModal){
    exampleModal.style.display="none";
  }
  if(event.target==aboutModal){
    aboutModal.style.display="none";
  }
  if(event.target==supportModal){
    supportModal.style.display="none";
  }
}