$(function () {

    var screenWidth = screen.width;  //ширина экрана

    /*
     *  Баннер
     */

    $('.banner').slick({
        dots: false,
        infinite: true,
        speed: 600,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 4000
    });

    /*
     *  Модальные окна
     */

    $('.js-modal-show').on('click', function () {
        event.preventDefault();
        var currentModal = $(this).attr('href');
        $(currentModal).fadeIn(500);
        $('body').append('<div class="overlay" id="js-overlay"></div>');
    });

    $('.js-registr-show').on('click', function () {
        var currentModal = $(this).attr('href');
        $('.js-modal').fadeOut(100);
        $('#js-overlay').remove();
        $(currentModal).fadeIn(500);
        $('body').append('<div class="overlay" id="js-overlay"></div>');
    });


    $('.js-modal-forgot').on('click', function () {
        var currentModal = $(this).attr('href');
        $('.js-modal').fadeOut(100);
        $('#js-overlay').remove();
        $(currentModal).fadeIn(500);
        $('body').append('<div class="overlay" id="js-overlay"></div>');
    });


    $('.js-modal-auth').on('click', function () {
        var currentModal = $(this).attr('href');
        $('.js-modal').fadeOut(100);
        $('#js-overlay').remove();
        $(currentModal).fadeIn(500);
        $('body').append('<div class="overlay" id="js-overlay"></div>');
    });

    $('.js-modal-close').on('click', function (e) {
        e.preventDefault();
        $('.js-modal').fadeOut(100);
        $('#js-overlay').remove();
    });

    $('body').on('click', '#js-overlay', function () {
        $('.js-modal').fadeOut(100);
        $('#js-overlay').remove();
    });


    /*
     *   Маска телефона
     */

    $('.phone').mask('+7 (999) 999-99-99');
    $('[name="form_text_3"]').mask('+7 (999) 999-99-99');
    /*
     *  Mobile-menu
     */

    $('.js-menu-show').click(function () {
        if($('.mobile-menu').hasClass('open')) {
            $('.mobile-menu').removeClass('open');
        }
        else {
            $('.mobile-menu').addClass('open');
        }
    });

    $('.js-menu-close').click(function () {
        $('.mobile-menu').removeClass('open');
    });

    /*
     *  Форма поиска
     */

    if (screenWidth < 992) {

        $('.search__show-btn').on('click', function (e) {
            e.preventDefault();
            $('.search').fadeIn();
            $('body').append('<div class="overlay" id="js-overlay"></div>');
            e.stopPropagation();
        });

        $('.search__input, .search__btn').click(function (e) {
            e.stopPropagation();
        });

        $('body').on('click', function (e) {
            $('.search').fadeOut();
        });

    }
    ;

    /*
     *  Form select
     */

    $(document).on('click','.form-select__input',function () {
        $(this).toggleClass('open');
        $(this).siblings('.form-select__list').slideToggle();
    });

    $(document).on('click','.form-select__list li',function () {
        //$(this).parent().siblings('.form-select__input').html($(this).html()).removeClass('open');
        //$(this).parent().siblings('input').val($(this).attr('data-value'));
        $(this).parent().slideUp();
    });

    /*
     *  Табы в кабинете
     */

    $('.cabinet__nav-item a').click(function (e) {
        e.preventDefault();
        var obj = $($(this).attr('href'));
        $(this).parent('.cabinet__nav-item').addClass('active').siblings('.cabinet__nav-item').removeClass('active');
        $('.cabinet__content').removeClass('active');
        obj.addClass('active');
    });

    /*
     *  Catalog + left-bar
     */

    /*

    var menu_selector = ".left-bar__menu";


    function onScroll() {
      var menu_selector = ".left-bar__menu";
      var scroll_top = $(window).scrollTop();
      $(menu_selector + " a").each(function () {
        var hash = $(this).attr("data-section");
        var target = $(hash);
        if (target.position().top <= scroll_top && target.position().top + target.outerHeight() > scroll_top) {
          $(menu_selector + " a.active").removeClass("active");
          $(this).addClass("active");
        } else {
          $(this).removeClass("active");
        }
      });
    }

      if (screenWidth > 768 && $('.left-bar').length && !$('.filter-body').length) {

          var leftBarOffset = $('.left-bar').offset().top;
          var leftBar = $('.left-bar__menu');
          var fromTop = $(window).scrollTop();
          var footerOffset = $('footer').offset().top;

          if (fromTop > leftBarOffset) {
              leftBar.addClass('left-bar--fix');
          } else {
              leftBar.removeClass('left-bar--fix');
          };

          onScroll();

          $(document).on("scroll", onScroll);

          window.addEventListener('scroll', Ascroll2, false);

          $(document).ajaxComplete(function () {
              Ascroll2();
          });

          function Ascroll2() {
              var leftBar = $('.left-bar__menu');
              var filter = $('.filter');
              var footerOffset = $('footer').offset().top;
              var fromTop = $(document).scrollTop();
              var leftBar = $('.left-bar__menu');
              var leftBarHeight = leftBar.height() + filter.height();

              if (leftBarOffset < fromTop) {
                  leftBar.addClass('left-bar--fix');
              } else {
                  leftBar.removeClass('left-bar--fix');
              }
              ;

              var leftBarHeight = leftBar.height() + filter.height();
              if (fromTop + leftBarHeight > footerOffset) {

                  leftBar.css('display', 'none');
              } else {

                  leftBar.css('display', 'block');
              };
          }

          $(".js-anchor").on('click', function (e) {
              e.preventDefault();
              $(document).off("scroll");
              $(menu_selector + " a.active").removeClass("active");
              $(this).addClass("active");
              var hash = $(this).attr("data-section");
              var target = $(hash);

              $("html, body").animate({
                  scrollTop: target.offset().top
              }, 500, function () {
                  $(document).on("scroll", onScroll);
              });

          });

          /*$('.left-bar__item a').on('click',function () {
              var link = $(this).attr('href');
              $(this).addClass('active').parent('.left-bar__item').siblings('.left-bar__item').find('a').removeClass('active');

              $(link).find('.catalog__section-title').removeClass('closed').siblings('.catalog__section-content').slideDown();
          });*/

    /*$('.catalog__section-title').on('click',function () {
        $(this).toggleClass('closed').siblings('.catalog__section-content').slideToggle();
    });

}*/
    /*
      if (screenWidth > 768 && $('.left-bar').length && $('.filter-body').length) {

          $(document).on("scroll", onScroll);
          onScroll();

          /* + прилипание левого блока к экрану

          var leftBarOffset = $('.left-bar').offset().top;
          var leftBar = $('.left-bar__menu');
          var fromTop = $(window).scrollTop();
          var footerOffset = $('footer').offset().top;

          if (fromTop > leftBarOffset) {
              leftBar.addClass('left-bar--fix');
          } else {
              leftBar.removeClass('left-bar--fix');
          };


          var filterOffset = $('.filter-body').offset().top - 40;
          var filter = $('.filter');
          if (fromTop > filterOffset) {
              $('.filter').addClass('filter--fix');
          } else {
              filter.removeClass('filter--fix');
          };


          if ($(".filter").hasClass("filter--fix")) {
              leftBar.addClass('left-bar--fix');
          };

          if ($(".filter").hasClass("filter--fix")) {
              var leftBarHieght = $('.filter--fix').height() + 45;
              leftBar.css('top', leftBarHieght);
          } else {
              var leftBarHieght = '10px';
              leftBar.css('top', leftBarHieght);
          };

          var leftBarHeight = leftBar.height() + filter.height();
          if (fromTop + leftBarHeight > footerOffset) {
              filter.css('display', 'none');
              leftBar.css('display', 'none');
          } else {
              filter.css('display', 'block');
              leftBar.css('display', 'block');
          };


          window.addEventListener('scroll', Ascroll, false);

          $(document).ajaxComplete(function () {
              Ascroll();
          });

          function Ascroll() {
              var leftBar = $('.left-bar__menu');
              var filter = $('.filter');
              var footerOffset = $('footer').offset().top;
              var fromTop = $(document).scrollTop();
              var leftBar = $('.left-bar__menu');
              var leftBarHeight = leftBar.height() + filter.height();

              if (leftBarOffset < fromTop) {
                  leftBar.addClass('left-bar--fix');
              } else {
                  leftBar.removeClass('left-bar--fix');
              };


              if (fromTop > filterOffset) {
                  $('.filter').addClass('filter--fix');
              } else {
                  filter.removeClass('filter--fix');
              };

              if ($(".filter").hasClass("filter--fix")) {
                  leftBar.addClass('left-bar--fix');
              };

              if ($(".filter").hasClass("filter--fix")) {
                  var leftBarHieght = $('.filter--fix').height() + 45;
                  leftBar.css('top', leftBarHieght);
              } else {
                  var leftBarHieght = '10px';
                  leftBar.css('top', leftBarHieght);
              };

              if (fromTop + leftBarHeight > footerOffset) {
                  filter.css('display', 'none');
                  leftBar.css('display', 'none');
              } else {
                  filter.css('display', 'block');
                  leftBar.css('display', 'block');
              };



          }


          $(document).ajaxComplete(function () {
              onScroll();

              $(".js-anchor").on('click', function (e) {
                  e.preventDefault();
                  $(document).off("scroll");
                  $(menu_selector + " a.active").removeClass("active");
                  $(this).addClass("active");
                  var hash = $(this).attr("data-section");
                  var target = $(hash);

                  $("html, body").animate({
                      scrollTop: target.offset().top
                  }, 500, function () {
                      $(document).on("scroll", onScroll);
                  });

              });
          });

          $(".js-anchor").on('click', function (e) {
              e.preventDefault();
              $(document).off("scroll");
              $(menu_selector + " a.active").removeClass("active");
              $(this).addClass("active");
              var hash = $(this).attr("data-section");
              var target = $(hash);

              $("html, body").animate({
                  scrollTop: target.offset().top
              }, 500, function () {
                  $(document).on("scroll", onScroll);
              });

          });


        /* - прилипание */



    /*$('.left-bar__item a').on('click',function () {
      var link = $(this).attr('href');
      $(this).addClass('active').parent('.left-bar__item').siblings('.left-bar__item').find('a').removeClass('active');

      $(link).find('.catalog__section-title').removeClass('closed').siblings('.catalog__section-content').slideDown();
    });

    $('.catalog__section-title').on('click',function () {
      $(this).toggleClass('closed').siblings('.catalog__section-content').slideToggle();
    });

  } else {

    $('.left-bar__item a').on('click',function (e) {
      e.preventDefault();
      var link = $(this).attr('href');
      $(this).addClass('active').parent('.left-bar__item').siblings('.left-bar__item').find('a').removeClass('active');
      $(link).siblings('.catalog__section').find('.catalog__section-content').fadeOut();
      $(link).find('.catalog__section-content').fadeIn();
    });

  };*/



    /*
     *  right-bar
     */



    function windowSize(){


        if ($(window).width() > 974 && $('.right-bar').length) {

            (function right_bar(){
                var a = document.querySelector('#aside1'), b = null, K = null, Z = 0, P = 20, N = 20;  // если у P ноль заменить на число, то блок будет прилипать до того, как верхний край окна браузера дойдёт до верхнего края элемента, если у N — нижний край дойдёт до нижнего края элемента. Может быть отрицательным числом
                window.addEventListener('scroll', Ascroll, false);
                document.body.addEventListener('scroll', Ascroll, false);
                Ascroll();
                function Ascroll() {
                    var Ra = a.getBoundingClientRect(),
                        R1bottom = document.querySelector('#article').getBoundingClientRect().bottom;
                    if (Ra.bottom < R1bottom) {
                        if (b == null) {
                            var Sa = getComputedStyle(a, ''), s = '';
                            for (var i = 0; i < Sa.length; i++) {
                                if (Sa[i].indexOf('overflow') == 0 || Sa[i].indexOf('padding') == 0 || Sa[i].indexOf('border') == 0 || Sa[i].indexOf('outline') == 0 || Sa[i].indexOf('box-shadow') == 0 || Sa[i].indexOf('background') == 0) {
                                    s += Sa[i] + ': ' +Sa.getPropertyValue(Sa[i]) + '; '
                                }
                            }
                            b = document.createElement('div');
                            b.className = "stop";
                            b.style.cssText = s + ' box-sizing: border-box; width: ' + a.offsetWidth + 'px;';
                            a.insertBefore(b, a.firstChild);
                            var l = a.childNodes.length;
                            for (var i = 1; i < l; i++) {
                                b.appendChild(a.childNodes[1]);
                            }
                            a.style.height = b.getBoundingClientRect().height + 'px';
                            a.style.padding = '0';
                            a.style.border = '0';
                        }
                        var Rb = b.getBoundingClientRect(),
                            Rh = Ra.top + Rb.height,
                            W = document.documentElement.clientHeight,
                            R1 = Math.round(Rh - R1bottom),
                            R2 = Math.round(Rh - W);
                        if (Rb.height > W) {
                            if (Ra.top < K) {  // скролл вниз
                                if (R2 + N > R1) {  // не дойти до низа
                                    if (Rb.bottom - W + N <= 0) {  // подцепиться
                                        b.className = 'sticky';
                                        b.style.top = W - Rb.height - N + 'px';
                                        Z = N + Ra.top + Rb.height - W;
                                    } else {
                                        b.className = 'stop';
                                        b.style.top = - Z + 'px';
                                    }
                                } else {
                                    b.className = 'stop';
                                    b.style.top = - R1 +'px';
                                    Z = R1;
                                }
                            } else {  // скролл вверх
                                if (Ra.top - P < 0) {  // не дойти до верха
                                    if (Rb.top - P >= 0) {  // подцепиться
                                        b.className = 'sticky';
                                        b.style.top = P + 'px';
                                        Z = Ra.top - P;
                                    } else {
                                        b.className = 'stop';
                                        b.style.top = - Z + 'px';
                                    }
                                } else {
                                    b.className = '';
                                    b.style.top = '';
                                    Z = 0;
                                }
                            }
                            K = Ra.top;
                        } else {
                            if ((Ra.top - P) <= 0) {
                                if ((Ra.top - P) <= R1) {
                                    b.className = 'stop';
                                    b.style.top = - R1 +'px';
                                } else {
                                    b.className = 'sticky';
                                    b.style.top = P + 'px';
                                }
                            } else {
                                b.className = '';
                                b.style.top = '';
                            }
                        }
                        window.addEventListener('resize', function() {
                            a.children[0].style.width = getComputedStyle(a, '').width
                        }, false);
                    }
                }
            })()

        }

        else {
            var rightBar = $('.right-bar-inner');
            rightBar.removeClass('right-bar--fix');
        };

    }


    $(window).on('load resize',windowSize);


    /*
     *  Кнопка купить в карточке товара
     */

    function windowSize2(){


        if ($(window).width() < 480 && $('.product__btn-fon').length) {

            var btnBarOffset = ($('#aside1').offset().top)-30;

            if ($(window).width() < 973 && $('.product__btn-fon').length) {
                var btnBar = $('.product__btn-fon');
                var fromTop = $(window).scrollTop();
                if (fromTop < btnBarOffset) {
                    btnBar.addClass('product__fon--fix');
                } else {
                    btnBar.removeClass('product__fon--fix');
                }
            }


        }

        else {
            var btnBar = $('.product__btn-fon');
            btnBar.removeClass('product__fon--fix');
        };

    }
    windowSize2();
    window.addEventListener('scroll', windowSize2, false);
    $(window).on('load resize',windowSize2);



    /*
     *  Галерея продукта

  $('.product__thumbs').on("click", '.product__thumb-img', function () {
      $('.product__thumb-img').removeClass('active');
      $('.product__thumb-img a').addClass('lightbox');
      $('.product__thumb-img a').attr('data-imagelightbox', 'f');
      $(this).addClass('active');
      $('.active a').removeClass('lightbox');
      $('.active a').removeAttr('data-imagelightbox');
      var puth = $(this).find('img').attr('src');
      $('#first-photo').attr('href', puth);
      $('.product__img img').attr('src', puth);
  });   */

    /*
     *  Удаление выбранных товаров
     */

    $('.product__order-del').click(function () {
        $(this).parent('.product__order-item').remove();
    });

    /*$('.cart__del button').click(function () {
      $(this).parents('.cart__item').remove();
    });*/

    /*
     *  Datepicker
     */

    $.datepicker.setDefaults($.datepicker.regional['ru']);

    $('.datepicker').datepicker({
        dateFormat: "dd.mm.yy"
    });

    /*
     *  Согласие в форме
     */

    $('.agree').change(function () {
        if ($(this).prop('checked')) {
            $(this).parents('form').find('.btn--submit').prop({disabled: false});
            $(this).parents('form').find('.error-agree').css({'display': 'none'});
        } else {
            $(this).parents('form').find('.btn--submit').prop({disabled: true});
            $(this).parents('form').find('.error-agree').css({'display': 'block'});
        }
    });

    /*
     *   Доставка
     */

    $('.js-delivery').change(function () {
        var link = $(this).attr('data-target');
        $('.order__delivery').removeClass('active');
        $(link).addClass('active');
    });

});

/* NEW BLOCK*/
$(function(){
    $('[data-service-id]').click(function(){
        var id = $(this).data('service-id');
        $('[data-service-id].active').removeClass('active');
        $(this).addClass('active');
        $('[data-block]').hide();
        $('[data-block="'+id+'"]').show();
    })

    /* AUTHORIZE */
    $('[data-type="auth-button"]').click(function(e){

        var email = $('[name="auth_email"]');
        var password = $('[name="auth_password"]');
        var errors = false;
        var recaptchaDiv = $('[id="auth_recaptcha"]');
        var recaptcha = grecaptcha.getResponse(jQuery('#auth_recaptcha').attr('data-widget-id'));

        $('[data-type="auth-error"]').html('')

        if(typeof($(email).val())!='undefined' && $(email).val().length>0) {
            $(".error_email").remove()
        }else{
            $(".error_email").remove()
            $(email).after('<p class="error_form error_email">Введите Ваш логин</p>');
            errors = true;
        }


        if(typeof($(password).val())!='undefined' && $(password).val().length>0) {
            $(".error_password").remove()
        }else{
            $(".error_password").remove()
            $(password).after('<p class="error_form error_password">Введите Ваш пароль</p>');
            errors = true;
        }

        if(recaptcha.length>0) {
            $(".error_recaptcha").remove()
        }else{
            $(".error_recaptcha").remove()
            $(recaptchaDiv).after('<p class="error_form error_recaptcha">Подтвердите что вы не робот</p>');
            errors = true;
        }

        if(errors){

        }else{
            e.preventDefault();
            $.post('/local/ajax/ajax.php',{action:'auth',auth_email:$(email).val(),auth_password:$(password).val()},function(data){
                data = $.parseJSON(data);
                switch(checkJSON(data)){
                    case 1:
                        if(typeof(data.TYPE) !='undefined' && data.TYPE == 'ERROR'){
                            var message = data.MESSAGE;
                            $('[data-type="auth-error"]').html(message);
                        }
                        break;
                    case 0:
                        document.location.href="";
                        break;
                    default:
                        document.location.href="";
                        break;
                }
            });

        }

    });

    /* REGISTRATION */
    $('[data-type="signs-button"]').click(function(e){

        var name = $('[name="signs_name"]');
        var email = $('[name="signs_email"]');
        var password = $('[name="signs_password"]');
        var password2 = $('[name="signs_password2"]');
        var errors = false;
        var recaptchaDiv = $('[id="signs_recaptcha"]');
        var recaptcha = grecaptcha.getResponse(jQuery('#signs_recaptcha').attr('data-widget-id'));

        e.preventDefault();

        if(typeof($(name).val())!='undefined' && $(name).val().length>0) {
            $(".error_name").remove()
        }else{
            $(".error_name").remove()
            $(name).after('<p class="error_form error_name">Введите Ваше имя</p>');
            errors = true;
        }


        if(typeof($(email).val())!='undefined' && $(email).val().length>0) {
            $(".error_email").remove()
        }else{
            $(".error_email").remove()
            $(email).after('<p class="error_form error_email">Введите Вашу электронную почту</p>');
            errors = true;
        }

        if(typeof($(password).val())!='undefined' && $(password).val().length>0) {
            $(".error_password").remove()
        }else{
            $(".error_password").remove()
            $(password).after('<p class="error_form error_password">Введите Ваш пароль</p>');
            errors = true;
        }

        if(typeof($(password2).val())!='undefined' && $(password2).val().length>0) {
            $(".error_password2").remove()
        }else{
            $(".error_password2").remove()
            $(password2).after('<p class="error_form error_password2">Введите Ваш пароль еще раз</p>');
            errors = true;
        }

        if(recaptcha.length>0) {
            $(".error_recaptcha").remove()
        }else{
            $(".error_recaptcha").remove()
            $(recaptchaDiv).after('<p class="error_form error_recaptcha">Подтвердите что вы не робот</p>');
            errors = true;
        }

        if(!errors){
            if($(password).val() != $(password2).val()){
                e.preventDefault();
                $(".error_password2").remove()
                $(password2).after('<p class="error_form error_password2">Введенные пароли не совпадают</p>');
                errors = true;
            }else{
                $(".error_password2").remove()
            }
        }

        if(errors){
            e.preventDefault();
        }else{
            e.preventDefault();
            $.post('/local/ajax/ajax.php',{action:'sign',sign_email:$(email).val(),sign_password:$(password).val(),sign_name:$(name).val()},function(data){
                var dataTemp = data;
                data = $.parseJSON(data);
                switch(checkJSON(data)){
                    case 1:
                        if(typeof(data.TYPE) !='undefined' && data.TYPE == 'ERROR'){
                            var message = data.MESSAGE;
                            $('[data-type="sign-error"]').html(message);
                        }else{
                            document.location.href="";
                        }

                        break;
                    case 0:
                        $('[data-type="sign-error"]').html(dataTemp);
                        break;
                    default:
                        $('[data-type="sign-error"]').html(dataTemp);
                        break;
                }
            });

        }

    });

    // CALLBACK FUNCTION


    $('.one_click').on('click', function(e){
        var name = $(this).data('name');
        $('[name="form_hidden_19"]').val(name);
    });

    $('.buy_one_click').on('click', function(e){
        var name = $(this).data('name');
        $('[name="form_hidden_26"]').val(name);
    });

    $('[name="web_form_submit"]').click(function(e){



        e.preventDefault();
        var parent = $(this).parent();
        var id_form = $(parent).attr('id');
		
        var errors = 0;
        var page = $('#' + id_form + ' [type="hidden"]');
        var name = $('#' + id_form + ' [form-input="name"]');
        var phone = $('#' + id_form + ' [form-input="phone"]');
        var text = $('#' + id_form + ' [form-input="text"]');
        var email = $('#' + id_form + ' [form-input="email"]');
        var recaptchaDiv = $('[id="callback_recaptcha"]');
        var recaptcha = grecaptcha.getResponse(jQuery('#callback_recaptcha').attr('data-widget-id'));
		var g_recaptcha_response = $('#' + id_form + ' [name="g-recaptcha-response"]');
		console.log(id_form);
        if (id_form == "js-modal-application") {
            var recaptchaDiv = $('[id="application_recaptcha"]');
            var recaptcha = grecaptcha.getResponse(jQuery('#application_recaptcha').attr('data-widget-id'));
        }
        if (id_form == "js-modal-add-review") {
            var recaptchaDiv = $('[id="add_review_recaptcha"]');
            var recaptcha = grecaptcha.getResponse(jQuery('#add_review_recaptcha').attr('data-widget-id'));
        }
        if (id_form == "js-modal-price-drop") {
            var recaptchaDiv = $('[id="price_drop_recaptcha"]');
            var recaptcha = grecaptcha.getResponse(jQuery('#price_drop_recaptcha').attr('data-widget-id'));
        }
        if (id_form == "js-modal-individ-order") {
            var recaptchaDiv = $('[id="individ_order_recaptcha"]');
            var recaptcha = grecaptcha.getResponse(jQuery('#individ_order_recaptcha').attr('data-widget-id'));
			
        }
		if (id_form == "js-modal-one-click") {
            var recaptchaDiv = $('[id="one_click_recaptcha"]');
            var recaptcha = grecaptcha.getResponse(jQuery('#one_click_recaptcha').attr('data-widget-id'));
        }



        if(typeof($(name).val().length)!='undefined' && $(name).val().length>0){
            $(".error_name").remove()
        }else{
            //Обработка ошибки незаполненного имени
            $(".error_name").remove()
            $(name).after('<p class="error_form error_name">Введите Ваше имя</p>');
            errors++;
        }

        if(typeof($(phone).val().length)!='undefined' && $(phone).val().length>0){
            $(".error_phone").remove()
        }else{
            // Обработка ошибки незаполненного телефона
            $(".error_phone").remove()
            $(phone).after('<p class="error_form error_phone">Введите Ваш телефон</p>');
            errors++;
        }

        if(recaptcha.length>0) {
            $(".error_recaptcha").remove()
        }else{
            $(".error_recaptcha").remove()
            $(recaptchaDiv).after('<p class="error_form error_recaptcha">Подтвердите что вы не робот</p>');
            errors++;
        }

        if (id_form == "js-modal-application") {
            if(typeof($(text).val().length)!='undefined' && $(text).val().length>0){
                $(".error_text").remove()
            }else{
                // Обработка ошибки незаполненного комментария
                $(".error_text").remove()
                $(text).after('<p class="error_form error_text">Введите текст заявки</p>');
                errors++;
            };
        }
		//console.log("page:"+$(page).val()+",id_form:"+id_form+",g_recaptcha_response:"+$(g_recaptcha_response).val()+",name:"+$(name).val()+",phone:"+$(phone).val()+",text:"+$(text).val()+",email:"+$(email).val());
		
        if(errors == 0){
            $.post('/local/ajax/ajax.php',{action:'callback',page:$(page).val(),id_form:id_form,g_recaptcha_response:$(g_recaptcha_response).val(),name:$(name).val(),phone:$(phone).val(),text:$(text).val(),email:$(email).val()},function(data){
				if(data=="erorCaptcha"){
					$(".error_recaptcha").remove()
					$(recaptchaDiv).after('<p class="error_form error_recaptcha">Вы не прошли проверку на робота!</p>');
				}else{
					console.log(data);
					$('#' + id_form +' .modal__group input').attr('disabled','disabled');
					$('#' + id_form +' .modal__group textarea').attr('disabled','disabled');
					$('#' + id_form +' [name="web_form_submit"]').attr('disabled','disabled');



					$('#' + id_form + ' .form-checkbox').after('<p class="success_form">Ваша заявка была отправлена</p>');

					setTimeout(function () {
						$('#' + id_form +' .modal__group input').val("").removeAttr('disabled');
						$('#' + id_form +' .modal__group textarea').val("").removeAttr('disabled');
						$('#' + id_form +' [name="web_form_submit"]').removeAttr('disabled');
						$(".success_form").remove();
						$('#' + id_form).hide();
						$("#js-overlay").remove()
					}, 3000);
				}
            });

        }





    });

    /* FORGOT PASSWORD */

    $('[data-type="forgot-button"]').click(function(e){

        var email = $('[name="forgot_email"]');
        var errors = false;

        if(typeof($(email).val())!='undefined' && $(email).val().length>0) {
            $(".error_email").remove()
        }else{
            $(".error_email").remove()
            $(email).after('<p class="error_form error_email">Введите Вашу электронную почту</p>');
            errors = true;
        }




        if(errors){

        }else{
            e.preventDefault();
            $.post('/local/ajax/ajax.php',{action:'forgot',email:$(email).val()},function(data){
                if(data=='1'){
                    $('[data-forgot-block="1"]').hide();
                    $('[data-type="forgot-button"]').hide();
                    $('[data-forgot-block="2"]').show();
                    $('[data-type="checkword-button"]').show();
                    $('[data-type="forgot-error"]').text('Контрольная строка выслана вам на электронную почту, введите ее в поле ниже').css({'color':'green'});

                }else{
                    $('[data-type="forgot-error"]').text(data).css({'color':'#d0021b'});
                }
            });

        }

    });

    /* CHECKWORD */

    $('[data-type="checkword-button"]').click(function(e){

        var email = $('[name="forgot_email"]');
        var checkword = $('[name="forgot_checkword"]');

        var errors = false;

        if(typeof($(checkword).val())!='undefined' && $(checkword).val().length>0) {
            $(".error_checkword").remove()
        }else{
            $(".error_checkword").remove()
            $(checkword).after('<p class="error_form error_checkword">Укажите контрольную строку</p>');
            errors = true;
        }


        if(errors){

        }else{
            e.preventDefault();
            $.post('/local/ajax/ajax.php',{action:'checkword',email:$(email).val(),checkword:$(checkword).val()},function(data){
                if(data=='1'){
                    $('[data-forgot-block="1"]').hide();
                    $('[data-forgot-block="2"]').hide();
                    $('[data-type="forgot-error"]').text('Спасибо, данные высланы на Вашу электронную почту.').css({'color':'green'});

                }else{
                    $('[data-type="forgot-error"]').html(data).css({'color':'#D0021B'});
                }
            });

        }

    });

    $('a[data-href=infoATexpert-kamenDOTru]').html('info@expert-kamen.ru').attr('href','mailto:info@expert-kamen.ru');
$('a[data-href=borATexpert-kamenDOTru]').html('bor@expert-kamen.ru').attr('href','mailto:bor@expert-kamen.ru');

    /*$(".sort_but").click(function() {
            event.preventDefault();
            var sort = $(this).data('sort');
            var by = $(this).data('by');
            var car_url = '<?=$_SERVER["SCRIPT_URL"]?>';
            var bxajaxid = $('input[name=bxajaxid]').val();
            var url = car_url+"?"+"sort="+sort+"&by="+by+"&bxajaxid="+bxajaxid;
            var comp = 'comp_'+bxajaxid;
            console.log ('123');
            $.when($.post('/local/ajax/ajax.php',{
                    action:'filterGet',
                    arrFilter_735:'<?=$_GET["arrFilter_735"]?>',
                    arrFilter_736:'<?=$_GET["arrFilter_736"]?>',
                    arrFilter_737:'<?=$_GET["arrFilter_737"]?>',
                    set_filter:'<?=$_GET["set_filter"]?>'
                },
                function(data){}))
                .then(
                    BX.ajax.insertToNode(url, comp)
                )
        }
    );*/


    $('.messengers_buttom').on('click', function(){
        if ($('.messengers').hasClass('hidden')) {
            $('.messengers').removeClass('hidden')
        } else {
            $('.messengers').addClass('hidden')
        }
    });

    $('.messengers .close-btn').on('click', function(e){
        e.preventDefault();
        if ($('.messengers').hasClass('hidden')) {
            $('.messengers').removeClass('hidden')
        } else {
            $('.messengers').addClass('hidden')
        }
    });

    $(document).on('click', '.load_more', function(){


        if ($('.load_more').hasClass('wait_loading')) {
        } else {

            var html = $('.load_more').html();

            $('.load_more').html(html + '<img class="loading" src="/images/giphy.webp">');


            var targetContainer = $('.catalog__section-content .row'),          //  Контейнер, в котором хранятся элементы
                url =  $('.load_more').attr('data-url');    //  URL, из которого будем брать элементы

            if (url !== undefined) {
                $.ajax({
                    type: 'GET',
                    url: url,
                    dataType: 'html',
                    success: function(data){

                        //  Удаляем старую навигацию
                        $('.load_more').remove();

                        var elements = $(data).find('.catalog__item'),  //  Ищем элементы
                            pagination = $(data).find('.load_more');//  Ищем навигацию

                        targetContainer.append(elements);   //  Добавляем посты в конец контейнера
                        targetContainer.append(pagination); //  добавляем навигацию следом

                    }
                })
            }

            $('.load_more').addClass('wait_loading');

        }

    });

    $(document).on('click', '.filter-btn', function(){
        if ($('.left-bar').hasClass('show')) {
            $('.left-bar').removeClass('show');
            $('body').removeClass('modal-open');
            $('.filter-btn').css('show');

        } else {
            $('.left-bar').addClass('show');
            $('body').addClass('modal-open');
        }

    });

    $(document).on('click', '.filter .close-btn', function(e){
        e.preventDefault();
        $('.left-bar').removeClass('show');
        $('body').removeClass('modal-open');
    });



});

function checkJSON(response) {

    if (typeof response == 'object') {
        return 1;
    }
    else {
        if (response === false) {
            return -1;
        }
        else {
            return 0;
        }
    }

}



