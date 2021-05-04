define([
        'new_options/views/ya_on',
        'new_options/views/ya_urls_to_check',
        'new_options/views/ya_parameters',
        'new_options/views/ya_functions'
    ],
    function (YaOn, YaUrlsToCheck, YaParameters, YaFunctions) {
        var ya_on = new YaOn();
        var ya_urls_to_check = new YaUrlsToCheck();
        var ya_parameters = new YaParameters();
        var ya_functions = new YaFunctions();

        return Backbone.View.extend({
            render: function () {
                var ruLocale = (window.Bar.get('locale') === 'ru');

                // display yandex integration only for russian locale
                //$('.yandex-integration').css('display', ruLocale ? 'block' : 'none');

                if (ruLocale) {
                    ya_on.render();
                    ya_urls_to_check.render();
                    ya_parameters.render();
                    ya_functions.render();
                }
            }
        });
    });

