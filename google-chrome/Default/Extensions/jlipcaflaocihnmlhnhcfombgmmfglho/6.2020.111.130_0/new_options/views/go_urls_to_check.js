define(function () {
    return Backbone.View.extend({
        el: '.google-urls-to-check',

        events: {
            "change .google-select": "toggle"
        },

        render: function () {
            var html = $('<div style="margin-bottom: 10px;">' +
            AppLocale.get('options.google.urls_to_check') +
            '<select class="google-select">' +
            '<option value="3">3</option>' +
            '<option value="5">5</option>' +
            '<option value="10">10</option>' +
            '<option value="20">20</option>' +
            '<option value="50">50</option>' +
            '</select>' +
            '</div>');

            html.find('option[value="' + Google.get('urls_to_check') + '"]').attr('selected', 'selected');

            this.$el.html(html);
            this.disableGoogleOptions();
        },

        disableGoogleOptions: function () {
            if (Google.get('active')) {
                this.$el.find('.google-select').removeAttr('disabled');
            } else {
                this.$el.find('.google-select').attr('disabled', 'disabled');
            }
        },

        toggle: function (e) {
            Google.changeUrlsToCheck(e);
            $('#save').removeAttr('disabled');
        }
    });
});
