define(function () {
    return Backbone.View.extend({
        el: '.bar_italic .box',

        events: {
            "change .param": "toggle"
        },

        render: function () {
            var html = $('<div class="cnt"><label title=""><input type="checkbox" class="param"/><span class="name"></span></label></div>');
            html.find('.name').html(AppLocale.get('options.italic.name'));
            html.find('label').attr('title', AppLocale.get('options.italic.ttl'));

            if (Bar.get('italic')) html.find('.param').attr('checked', 'checked');


            this.$el.html(html);
            this.$el.prepend($('<div/>', {class: 'header', text: AppLocale.get('options.italic.header')}));
        },

        toggle: function (e) {
            Bar.toggleItalic();
            $('#save').removeAttr('disabled');
        }
    });
});
