define([
        'new_options/views/go_on',
        'new_options/views/go_urls_to_check',
        'new_options/views/go_parameters',
        'new_options/views/go_functions'
    ],
    function (GoOn, GoUrlsToCheck, GoParameters, GoFunctions) {
        var go_on = new GoOn();
        var go_urls_to_check = new GoUrlsToCheck();
        var go_parameters = new GoParameters();
        var go_functions = new GoFunctions();

        return Backbone.View.extend({
            render: function () {
                var ruLocale = (window.Bar.get('locale') === 'ru');

                go_on.render();
                go_urls_to_check.render();
                go_parameters.render();
                go_functions.render();
            }
        });
    });

