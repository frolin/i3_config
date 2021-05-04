define(
    function () {
        return Backbone.View.extend({
            el: '.bar-filter-domain',
            events: {
                "focus  .list": "focusList",
                "blur   .list": "blurList"
            },
            template: function () {
                var html = $('<label title=""><span class="name"></span></label><textarea class="list" cols="6" rows="12"></textarea>');

                html[0].setAttribute('title', AppLocale.get('bar.bar_filter_domain.ttl'));
                html.find('.name').html(AppLocale.get('bar.bar_filter_domain.name'));
                html[1].setAttribute('title', AppLocale.get('bar.bar_filter_domain.ttl'));

                if (!Bar.get('active')) html[1].setAttribute('disabled', 'disabled');

                return html;
            },
            render: function () {
                var html = this.template();
                $(html[1]).val(Bar.get('filter_domain'));

                this.$el.html(html);
            },
            focusList: function (e) {
                var self = this;
                if (e) self.e = e;
                if ($(self.e.currentTarget).val() === Bar.get('filter_domain')) {
                    self.timer = setTimeout(function () {
                        self.focusList();
                    }, 500);
                }
                else {
                    $('#save').removeAttr('disabled');
                }
            },
            blurList: function () {
                var domains =
                    $(this.e.currentTarget).val().split('*')
                        .map(function (e) {
                            var domain = '';
                            if (e) {
                                domain = '*' + punycode.ToASCII(e.replace('\n', '')) + '\n';
                            }
                            return domain;
                        });

                Bar.changeFilterDomain(domains.join(''));
                clearTimeout(this.timer);
            }
        });
    });

