HM.ViewHelper = (function(my){
    my.home = function(data){

        var $scope = this;
        var timeout;

        /**
         * Stuff to do once DOM loads (init slider, etc.)
         * @param $item
         */
        function onSliderDomLoad($item){
            var $slider = $item.find('.slider');
            $slider.imagesLoaded().always(instantiateSlider);

            function instantiateSlider(){

                //create slider
                var slider = $item.find('.slider').SimpleTouchSlider({
                    onPageChange: function(index){
                        var $dot = $('#slider-position li');
                        $dot.removeClass('selected');
                        $($dot[index]).addClass('selected');
                    },
                    auto_play: false
                });

                //show slider
                Utilities.hideLoading();
                $slider.addClass('loaded');

                //create controls
                setTimeout(function(){
                    //---dots---//
                    $item.append('<ul id="slider-position"></ul>');
                    var $dots = $('#slider-position');
                    var items = '';
                    for(var i = 0; i < slider.getNumSlides(); i++){
                        items += '<li data-index="' + i + '"></li>';
                    }
                    $dots.html(items).on('PointerTap', 'li', function(e){
                        e.stopPropagation();
                        slider.goToSlide($(this).data('index'));
                    });
                    $dots.find('li').first().addClass('selected');

                    //---arrows---//
                    var contrls = '<i class="controls previous icon-arrow-slider-prev"></i><i class="controls next icon-arrow-slider-next"></i>';
                    $('body').prepend(contrls);
                    posArrows($item);
                    $('.previous').on('PointerTap', function(){slider.prev(true);});
                    $('.next').on('PointerTap', function(){slider.next(true);});
                }, 500);
            }

        }

        function showModal(e){
            e.preventDefault();
            e.stopPropagation();

            if($(window).width() < 600){
                return;
            }

            Utilities.showLoading();
            var $img_div = $(this);
            $('body').prepend('<div id="modal_overlay"></div><div id="modal"><img src="' + $img_div.data('modal') + '" /><i class="close icon-img-close"></i></div>');

           timeout = setTimeout(function(){
               var $modal = $('#modal');
               $modal.imagesLoaded().always(function(){

                   setTimeout(function(){
                       //position and size modal
                       var maxWidth = $('.item').first().outerWidth() - 100;
                       if($modal.outerWidth() > maxWidth){
                           $modal.css('width', maxWidth + 'px');
                       }
                       $modal.css('top', $(window).scrollTop() + 50);
                       $modal.centerPos({axis: 'x', container: $(window)});

                       setTimeout(function(){
                           $modal.addClass('loaded');
                           $('#modal_overlay').css('display','block');
                           Utilities.hideLoading();
                       }, 50);

                   }, 200);
               });
           }, 100);
        }


        /**
         * Expand item
         * @param $item
         */
        function expand($item){

            var desktop = $(window).width() > 1000 ? '_desktop' : '';
            var template_name = $item.data('name') + desktop;
            var url = Settings.Misc.templates_dir + 'partials/items/' + template_name + '.mustache';

            //first, close all others, to save system resources, and because at the moment, only one slider
            //can be open at a time

            $scope.find('.slider, #slider-position').remove();
            $('.controls').remove();
            $scope.find('.item').removeClass('expanded');

            //scroll to $item, in case it moved, since we're manipulating the DOM in previous step
            $('html,body').animate({scrollTop: $item.offset().top},{
                duration:300
            });

            clearTimeout(timeout);

            //wait for animation to finish, then load template.
            timeout = setTimeout(function(){
                Utilities.showLoading();

                //load slider HTML via AJAX
                $.ajax({
                    url: url,
                    success: function(html){

                        var template = {};
                        template[template_name] = html;
                        HM.add(template);
                        $item.addClass('expanded');
                        $item.appendView(template_name, {}, function(){
                            onSliderDomLoad($item);
                        }, null, 'slider');

                    },
                    error: function(){console.log('there was an error loading template at: ' + url);}
                });
            }, 400);
        }

        /**
         * Bind events for this page
         */
        function bindEvents(){

            var $expandables = $scope.find('.item.expandable');

            //on tapping an item
            $expandables.on('PointerTap', function(){
                var $this = $(this);
                if($this.hasClass('expanded')){
                    collapse($this);
                    return;
                }
                expand($this);
            });

            //on pointerdown one of the items
            $expandables.on('PointerDown', Utilities.onButtonDown);

            //prevent any taps inside slider to close the slider
            $expandables.on('PointerDown PointerTap', '.slider', function(e){
                e.stopPropagation();
            });

            //open modal on tap
            $expandables.on('PointerTap', '[data-modal]', showModal);

            //close modal on body tap
            $('body').on('PointerTap', function(){
               $('#modal_overlay').remove();
               $('#modal').remove();
            });

            //reposition arrows on window resize
            $(window).on('resize.slider', Utilities.debounce(function(){posArrows()}, 100, false));
        }

        /**
         * Position the arrows
         */
        function posArrows(){
            var $item = $('.item.expanded');
            var pos = $item.offset();
            var $controls = $('.controls');
            var arrow_height = $controls.first().height();
            $controls.css({
                top: pos.top + $item.height() / 2 - arrow_height / 2
            });
            $('#slider-position').centerPos({axis:'x'});
        }

        /**
         * Collpase the item.
         * @param $item
         */
        function collapse($item){
            clearInterval(timeout);
            $item.find('.slider, #slider-position').remove();
            $('.controls').remove();
            $item.removeClass('expanded');
        }

        bindEvents();

    };

    return my;
})(HM.ViewHelper || {});