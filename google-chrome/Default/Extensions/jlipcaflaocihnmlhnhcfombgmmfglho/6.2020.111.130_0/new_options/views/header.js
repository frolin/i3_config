define([
        'new_options/views/support'
    ],
    function (Support) {
        var support = new Support();

        return Backbone.View.extend({
            id: 'header',
            render: function () {
                support.render();
            }
        });
    });

