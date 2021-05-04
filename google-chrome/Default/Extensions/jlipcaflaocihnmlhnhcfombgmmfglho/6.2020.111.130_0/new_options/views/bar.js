define([
        'new_options/views/position',
        'new_options/views/bar-check',
        'new_options/views/parameters'
    ],
    function (Position, Bar_Check, Parameters) {
        var position = new Position();
        var check_by_button = new Bar_Check();
        var parameters = new Parameters();

        return Backbone.View.extend({
            render: function () {
                position.render();
                check_by_button.render();
                parameters.render();
            }
        });
    });

