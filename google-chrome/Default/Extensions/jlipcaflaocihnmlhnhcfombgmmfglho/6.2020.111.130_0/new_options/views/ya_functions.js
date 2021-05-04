define(function () {
    var FunctionView = Backbone.View.extend({
        tagName: 'div',

        className: 'cnt',

        events: {
            "change input.param": "toggle",
            "click  .extra": "showOptions"
        },

        initialize: function () {
            this.model.on("change:active", this.activeChanged, this);
        },
        render: function () {
            var html = $('<label title=""><input type="checkbox" class="param"/><span class="name"></span></label>'),
                name = this.model.get('name');

            $(this.el).addClass(name);
            html.find('.name').html(this.returnLocale(name).name);
            html.attr('title', this.returnLocale(name).ttl);
            if (this.model.get('active')) html.find('.param').attr('checked', 'checked');
            if (this.model.get('no_checkbox')) this.$el.addClass('no_checkbox');
            if (!Yandex.get('active') && !Yandex.get('catalog_active')) html.find('.param').attr('disabled', 'disabled');

            html = this.renderExtra(html);

            this.$el.html(html);

            return this;
        },
        renderExtra: function (html) {
            var extra = this.model.get('extra'),
                price = rdz.utils.toFixed(main.rdz.cache.get(['API', 'Prices', this.model.get('name')]), 5),
                name,
                hideCoins = false, // flag to hide coins
                extraElement,
                coinsElement;

            if (this.model.get('name') === 'SiteAnalysis') {
                var extraSEO = window.YaParameters.get('Seo').get('extra');
                price = 0;
                hideCoins = true;
                for (name in extra) {
                    if (name !== "api" && name !== "title" && name !== "Seo" && extra[name].active) {
                        price += rdz.utils.toFixed(main.rdz.cache.get(['API', 'Prices', name]), 5);
                        hideCoins = false;
                    } else if (name === "Seo" && extra[name].active) { // total markets count is from Parameters brach
                        hideCoins = false;
                        var activeMarkets = [];
                        for (var n in extraSEO) {
                            if (n !== "api" && extraSEO[n].active) {
                                activeMarkets.push(n);
                            }
                        }

                        price += rdz.utils.toFixed(main.rdz.cache.get(['API', 'Prices', 'Seo']) * activeMarkets.length, 5);
                    }
                }
            }

            if (extra) {
                // show gear
                if (!extra.hidden) {
                    if (!extra.no_cogwheel) {
                        extraElement = $('<div/>', {class: 'extra'}).html('<img alt="" src="icons/new_options/img-12.png"/>');
                        html.push(extraElement[0]);
                    }

                    if (typeof extra.api !== 'undefined') {
                        // show coins
                        coinsElement = $('<div/>', {
                            class: 'coins',
                            css: {visibility: extra.api.active && !hideCoins ? 'visible' : 'hidden'},
                            title: price ? AppLocale.get('options.parameters.options.coins.ttl') + ' ' + rdz.utils.toFixed(price, 5) + '$' : ''
                        }).html('<img alt="" src="icons/new_options/img-13.png"/>');

                        html.push(coinsElement[0]);
                    }
                }
            }
            return html;
        },
        showOptions: function (event) {
            Contextmenu.open({e: event, m: this.model, parent: this, parameters_branch: 'YaParameters'});
        },
        toggle: function (e) {
            this.model.toggle();
            Yandex.changeFunction(e, this.model);

            $('#save').removeAttr('disabled');
        },
        returnLocale: function (name) {
            return AppLocale.get('options.yandex.functions.' + name);
        },
        activeChanged: function (model, value) {
            this.$el.find('.param').prop('checked', value);
        }
    });

    return Backbone.View.extend({
        // el:'.yandex-integration-functions',
        el: '.yandex-parameters',

        render: function () {
            var html = $('<div class="col"><p><b>' + AppLocale.get('options.view.functions_ttl') + '</b></p></div>' //'<div class="functions-title">' +
                    /*AppLocale.get('options.yandex.functions.ttl') +
                     '</div>'*/),
                functions = Yandex.get('functions'),
                f,
                view,
                extra,
                FunctionModel = Backbone.Model.extend({   // :)
                    idAttribute: 'name',
                    toggle: function (a) {
                        if (a && a.extra) {
                            extra = this.get('extra');
                            extra[a.extra].active = a.value;
                            this.set({extra: extra});
                            this.trigger("change:extra", this, a.value);
                        } else {
                            this.set({active: !this.get('active')});
                        }
                    }
                });

            for (f in functions) {
                view = new FunctionView({
                    model: new FunctionModel({
                        name: f,
                        active: functions[f].active,
                        extra: functions[f].extra,
                        no_checkbox: functions[f].no_checkbox
                    })
                });
                html.append(view.render().el);
            }

            this.$el.find('.col:last').after(html);
            //this.disableYandexOptions();
        }
    });
});
