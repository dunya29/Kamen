const btnFilter = document.querySelector(".btn-filter") 
const filterBar = document.querySelector(".left-bar") 
const filterBody = document.querySelector(".filter-body") 
let btnSwipe 
let filterSwipe
function showFilterBtn() {
  if (document.querySelector('.catalog').getBoundingClientRect().top - window.innerHeight < 0) {
    if (document.querySelector(".catalog__section-content").getBoundingClientRect().bottom < window.innerHeight) {
      filterBar.classList.remove("btn-visible")
      filterBar.classList.remove("show")
    } else {
      filterBar.classList.add("btn-visible")
    }
  } else {
    filterBar.classList.remove("btn-visible")
    filterBar.classList.remove("show")
}
}
function swipeRight(e) {
  if (e.deltaX > 0 && !filterBar.classList.contains("show")) {
    if (e.deltaX >= (filterBody.clientWidth + 10)) {
      filterBar.style.transform = 'translate3d('+ (filterBody.clientWidth + 10)+'px, 0, 0)'
    } else {
      filterBar.style.transform = 'translate3d('+ e.deltaX +'px, 0, 0)'
    }
  }
}
function swipeLeft(e) {
  if (e.deltaX < 0 && filterBar.classList.contains("show")) {
    if (Math.abs(e.deltaX) <= (filterBody.clientWidth + 10)) {
      filterBar.style.transform = 'translate3d('+ e.deltaX +'px, 0, 0)'
    } else {
      filterBar.style.transform = 'translate3d('- (filterBody.clientWidth + 10) +'px, 0, 0)'
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
function initSwipeEvent() {
  if(filterBar && window.innerWidth <= 764) {
    showFilterBtn()
    btnSwipe = new Hammer(btnFilter);
/*     filterSwipe = new Hammer(filterBody); */
    btnSwipe.on("pan", function(e) {
      swipeRight(e)
      swipeLeft(e)
    })
    btnSwipe.on("panend", e => swipeEnd(e)) 
/*     filterSwipe.on("pan", e => swipeLeft(e))
    filterSwipe.on("panend", e => swipeEnd(e))  */
    btnFilter.addEventListener("click", () => {
      if (!filterBar.classList.contains("show")) {
        showBar()
      } else {
        unShowBar()
      }
    }) 
  } else if( filterBar && window.innerWidth > 764 && filterSwipe) {
   /*  filterSwipe.destroy()
    filterSwipe.off("pan", e => swipeLeft(e))
    filterSwipe.off("panend", e => swipeEnd(e)) */
  }
}
initSwipeEvent()
window.addEventListener("resize", initSwipeEvent)
window.addEventListener("scroll", () => {
  if(filterBar && window.innerWidth <= 764) {
    showFilterBtn()
  }
})