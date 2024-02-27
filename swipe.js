let btnFilter = document.querySelector(".btn-filter") 
let filterBar = document.querySelector(".left-bar") 
let filterBody = document.querySelector(".filter-body") 
function showFilterBtn() {
    if (document.querySelector('.catalog').getBoundingClientRect().top - window.innerHeight < 0) {
        if (document.querySelector(".catalog__section-content").getBoundingClientRect().bottom < window.innerHeight) {
          filterBar.classList.remove("btn-visible")
        } else {
          filterBar.classList.add("btn-visible")
        }
      } else {
        filterBar.classList.remove("btn-visible")
      }
}
function swipeRight(e) {
  if (e.deltaX > 0) {
    if (e.deltaX >= filterBody.clientWidth) {
      filterBar.style.transform = 'translate3d('+ filterBody.clientWidth +'px, 0, 0)'
    } else {
      filterBar.style.transform = 'translate3d('+ e.deltaX +'px, 0, 0)'
    }
  }
}
function swipeLeft(e) {
  if (e.deltaX < 0 && filterBar.classList.contains("show")) {
    if (Math.abs(e.deltaX) <= filterBody.clientWidth) {
      filterBar.style.transform = 'translate3d('+ e.deltaX +'px, 0, 0)'
    } else {
      filterBar.style.transform = 'translate3d('- filterBody.clientWidth +'px, 0, 0)'
    }
  }
}
function swipeEnd(e) {
  if ( Math.abs(e.deltaX) > filterBody.clientWidth / 3) {  
    if (e.deltaX > 0) {
      showBar()
    } else {
      unShowBar()
    }
  }
  filterBar.style.transform = 'translate3d(0, 0, 0)'
}
showFilterBtn()
window.addEventListener("scroll", showFilterBtn)
window.addEventListener("resize", showFilterBtn)
let btnSwipe = new Hammer(btnFilter);
let filterSwipe = new Hammer(filterBody);
function showBar() {
  document.body.classList.add("modal-open")
  filterBar.classList.add("show");
  btnFilter.classList.add("open")
}
function unShowBar() {
  document.body.classList.remove("modal-open")
  filterBar.classList.remove("show");
  btnFilter.classList.remove("open")
}
btnSwipe.on("pan", function(e) {
  swipeRight(e)
  swipeLeft(e)
})
btnSwipe.on("panend", e => swipeEnd(e)) 
filterSwipe.on("pan", e => swipeLeft(e))
filterSwipe.on("panend", e => swipeEnd(e)) 
btnFilter.addEventListener("click", () => {
  if (!filterBar.classList.contains("show")) {
    showBar()
  } else {
    unShowBar()
  }
}) 