define(function () {
    return Backbone.View.extend({
        el: '.bar_language .box',

        events: {
            "change .locale": "toggle"
        },

        render: function () {


            var html = $('<div class="cnt"><select class="locale">' +
            '<option value="ru">Russian</option>' +
            '<option value="en">English</option>' +
            '</select></div>');


            html.find('option[value="' + Bar.get('locale') + '"]').attr('selected', 'selected');


            this.$el.html(html);
            this.$el.prepend($('<div/>', {class: 'header', text: AppLocale.get('options.language.header')}));
        },

        toggle: async function (e) {
            Bar.changeLocale(e);
            await AppLocale.init(e.currentTarget.value);

            $('#save').removeAttr('disabled');
            rdz.AppView.render();

            // Don't know where to do it
            chrome.contextMenus.update('rdz-toggle_bar', {"title": AppLocale.get('context_menu.toggle_bar')});
        }
    });
});
