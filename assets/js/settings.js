var Settings = {
    API: {
        url: '', //must have trailing slash,
        default_timeout: 30000, //in microseconds
        timeout_message: 'Sorry, there may be a problem with your connection.',
        generic_error_message: 'Sorry, we messed up! We are experiencing technical difficulties. Please try again later.'
    },
    Misc: {
        templates_dir: 'assets/templates/',
        loadingDisplayDelay: 120 //in milliseconds,
    },
    MsgLib: {
        cannot_connect: "Sorry, we're having trouble connecting to our server. Please check your connection and try again.",
        buttons: {
            default_button_ok: 'OK',
            default_button_cancel: 'Cancel'
        }
    },
    Templates: {
        //templates
        'home': 'home.mustache',
        'about': 'about.mustache',
        'contact': 'contact.mustache',

        //partials
        'header': 'partials/header.mustache',
        'footer': 'partials/footer.mustache',
        'nav': 'partials/nav.mustache'
    },
    Routes: {
        "home": "home",
        "about": "about",
        "contact": "contact"
    }
};