define(function () {
    return Backbone.View.extend({
        el: '.yandex-urls-to-check',

        events: {
            "change .yandex-select": "toggle"
        },

        render: function () {
            var html = $('<div style="margin-bottom: 10px;">' +
            AppLocale.get('options.yandex.urls_to_check') +
            '<select class="yandex-select">' +
            '<option value="3">3</option>' +
            '<option value="5">5</option>' +
            '<option value="10">10</option>' +
            '<option value="20">20</option>' +
            '<option value="50">50</option>' +
            '</select>' +
            '</div>');

            html.find('option[value="' + Yandex.get('urls_to_check') + '"]').attr('selected', 'selected');

            this.$el.html(html);
            this.disableYandexOptions();
        },

        disableYandexOptions: function () {
            if (Yandex.get('active')) {
                this.$el.find('.yandex-select').removeAttr('disabled');
            } else {
                this.$el.find('.yandex-select').attr('disabled', 'disabled');
            }
        },

        toggle: function (e) {
            Yandex.changeUrlsToCheck(e);
            $('#save').removeAttr('disabled');
        }
    });
});
