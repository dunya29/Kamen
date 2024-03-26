const filterBar = document.querySelector(".left-bar") 
const filterBody = document.querySelector(".filter-body") 
const filterSubmit = document.querySelector(".filter-submit") 
let filterSwipe
Hammer.defaults.touchAction = "compute";
function swipeEnd(e) {
  if ( Math.abs(e.deltaX) > filterBody.clientWidth / 3 && window.innerWidth <= 764) {  
    if (e.deltaX > 0) {
      showBar()
    } else {
      unShowBar()
    }
  }
}
function showBar() {
  document.body.classList.add("modal-open")
  filterBar.classList.add("show");
}
function unShowBar() {
  document.body.classList.remove("modal-open")
  filterBar.classList.remove("show");
}
btnSwipe = new Hammer(filterBar);
btnSwipe.on("panend", e => swipeEnd(e)) 
filterBar.addEventListener("click", e => {
  if (window.innerWidth <= 764 && !filterBody.contains(e.target)) {
    unShowBar()
  }
})
filterSubmit.addEventListener("click", unShowBar)

