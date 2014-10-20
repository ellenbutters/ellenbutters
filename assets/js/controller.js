var Controller = {};

Controller.home = function(){
    $('body').insertView('home', {
        home_page: true
    });
};

Controller.about = function(){
    $('body').insertView('about', {
        about_page: true
    });
};

Controller.contact = function(){
    $('body').insertView('contact', {
        contact_page: true
    });
};