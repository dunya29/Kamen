/* let btnMenu = document.querySelector(".btn-filter") 
function showBtn() {
  console.log(document.querySelector('.catalog').getBoundingClientRect().top)
    if (document.querySelector('.catalog').getBoundingClientRect().top - window.innerHeight < 0) {
        if (document.querySelector(".catalog__section-content").getBoundingClientRect().bottom < window.innerHeight) {
            btnMenu.classList.remove("show")
        } else {
            btnMenu.classList.add("show")
        }
      } else {
        btnMenu.classList.remove("show")
      }
}
showBtn()
window.addEventListener("scroll", showBtn)


 const sliderWrapper =  document.querySelector(".left-bar") */
/* let animation = false
let startX
let diff = 0
function onMouseMove(event) {
    let x = event.touches[0].clientX;
    diff = startX - x;
  }
btnMenu.addEventListener('touchstart', e => {
    if (animation) return;
    startX = e.touches[0].clientX;
  }) 
btnMenu.addEventListener('touchmove', e =>  onMouseMove(e))
btnMenu.addEventListener('touchend', e => {
  if(animation) return;
  animation = true
  if (diff <= -50 && !sliderWrapper.classList.contains("show")) {
    document.body.classList.add("modal-open")
    sliderWrapper.classList.add("show");
    btnMenu.classList.add("transform")
  }else {
    document.body.classList.remove("modal-open")
    sliderWrapper.classList.remove("show");
    btnMenu.classList.remove("transform")
  }
  sliderWrapper.style.transform = 'translate3d(0, 0, 0)'
  setTimeout(() => {
    animation = false
  }, 300);
});  */


  
/* let swipeRight = new Hammer(btnMenu);
let swipeLeft = new Hammer(sliderWrapper);
console.log(swipe)
// detect swipe and call to a function
swipe.on('swiperight swipeleft', function(e) {
  e.preventDefault();
  console.log("d")
  if (e.type == 'swiperight') {
    sliderWrapper.classList.add("show");
    btnMenu.classList.add("transform")
  } else {
    sliderWrapper.classList.remove("show");
    btnMenu.classList.remove("transform")
  }
}); */
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
showFilterBtn()
window.addEventListener("scroll", showFilterBtn)
window.addEventListener("resize", showFilterBtn)
let btnSwipe = new Hammer(btnFilter);
let barSwipe = new Hammer(filterBar);
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
// detect swipe and call to a function
btnSwipe.on('swiperight', function(e) {
  e.preventDefault();
  showBar()
});
barSwipe.on('swipeleft', function(e) {
  e.preventDefault();
  unShowBar()
});
filterSwipe.on('swipeleft', function(e) {
  e.preventDefault();
  unShowBar()
});
btnFilter.addEventListener("click", () => {
  if (!btnFilter.classList.contains("open")) {
    showBar()
  } else {
    unShowBar()
  }
}) 