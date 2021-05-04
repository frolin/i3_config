define(
    function () {
        return Backbone.View.extend({
            el: '#yandex-small-tab',
            events: {
                "change  input": "change"
            },
            template: function () {
                var html = '<input type="checkbox" class="param"/>' +
                    '<div class="active"><img alt="" src="icons/new_options/img-9.png"/> ' + AppLocale.get('options.yandex.ttl') + '</div>';

                return html;
            },
            render: function () {
                this.$el.html(this.template());
                if (Yandex.get('active')) {
                    this.$el.find('.param').attr('checked', 'checked');
                }
                this.disableYandexOptions();
            },
            change: function () {
                this.changeVisibility();
            },
            changeVisibility: function (e) {
                Yandex.changeVisibility();
                this.disableYandexOptions();

                $('#save').removeAttr('disabled');
            },
            disableYandexOptions: function () {
                if (Yandex.get('active')) {
                    $('#yandex-small-panel').removeClass('disabled');
                    $('.yandex-select').removeAttr('disabled');
                    $('#yandex-small-panel input').removeAttr('disabled');
                } else {
                    $('#yandex-small-panel').addClass('disabled');
                    $('.yandex-select').attr('disabled', 'disabled');
                    $('#yandex-small-panel input').attr('disabled', 'disabled');
                }
            }
        });
    });

