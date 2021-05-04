define(function () {
    var parameter = Backbone.View.extend({
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
                name;

            name = this.model.get('name');
            $(this.el).addClass(name);

            html.find('.name').html(this.returnLocale(name).name);
            html.attr('title', this.returnLocale(name).ttl);
            if (this.model.get('active')) html.find('.param').attr('checked', 'checked');
            if (!Yandex.get('active') && !Yandex.get('catalog_active')) html.find('.param').attr('disabled', 'disabled');

            html = this.renderExtra(html);

            this.$el.html(html);
            return this;
        },

        renderExtra: function (html) {
            var extra = this.model.get('extra'),
                price = main.rdz.cache.get(['API', 'Prices', this.model.get('name')]),
                hideCoins = false, // flag to hide coins
                extraElement,
                coinsElement;

            // Seo - total price    
            if (this.model.get('name') === "Seo") {
                var activeMarkets = [];
                for (var name in extra) {
                    if (name !== "api" && extra[name].active) {
                        activeMarkets.push(name);
                    }
                }
                price = rdz.utils.toFixed(price * activeMarkets.length, 5);
                hideCoins = activeMarkets.length === 0 ? true : false;
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
                            title: price ? AppLocale.get('options.parameters.options.coins.ttl') + ' ' + price + '$' : ''
                        }).html('<img alt="" src="icons/new_options/img-13.png"/>');

                        html.push(coinsElement[0]);
                    }
                }
            }
            return html;
        },
        showOptions: function (event) {
            Contextmenu.open({e: event, m: this.model, parent: this});
        },
        toggle: function (e) {
            this.model.toggle({extra: null});

            $('#save').removeAttr('disabled');
        },
        returnLocale: function (name) {
            /*if (name === 'TYC') {
                return AppLocale.get('options.yandex.' + name);
            }*/
            return AppLocale.get('options.parameters.' + name) || AppLocale.get('parameters.' + name);
        },
        activeChanged: function (model, value) {

            //activate YaBar and YABar from Я.Тематика or Я.Регион
            if (['YT', 'YR'].indexOf(model.get('name')) > -1 && value) {
                YaParameters.get('YaBar').set({active: true});
            }
            //deactivate Я.Тематика or Я.Регион from YaBar
            if (['YaBar'].indexOf(model.get('name')) > -1 && !value) {
                YaParameters.get('YT').set({active: false});
                YaParameters.get('YR').set({active: false});
            }

            //activate TYC from Я.Каталог
            /*if (['YaCatalog'].indexOf(model.get('name')) > -1 && value) {
                YaParameters.get('TYC').set({active: true});
            }
            //deactivate Я.Каталог from TYC
            if (['TYC'].indexOf(model.get('name')) > -1 && !value) {
                YaParameters.get('YaCatalog').set({active: false});
            }*/

            // activate Sape market from activated Seo if any market is not checked 
            if (['Seo'].indexOf(model.get('name')) > -1 && value) {
                var extra = YaParameters.get('Seo').get('extra'),
                    price = main.rdz.cache.get(['API', 'Prices', YaParameters.get('Seo').get('name')]),
                    name,
                    activeMarkets = [];

                for (name in extra) {
                    if (name !== "api" && extra[name].active) {
                        activeMarkets.push(name);
                    }
                }

                if (activeMarkets.length === 0) {
                    extra.Sape.active = true;
                    YaParameters.get('Seo').set({extra: extra});
                    this.$el.find('.coins').css({visibility: 'visible'}).attr("title", AppLocale.get('options.parameters.options.coins.ttl') + ' ' + price + '$');
                    if ($('.contextmenu').find('.Sape').length > 0) {
                        $('.contextmenu').find('.Sape').find('.extra_param').prop('checked', true);
                    }
                }
            }

            this.$el.find('.param').prop('checked', value);

        }
    });

    return Backbone.View.extend({
        //el:'.yandex-integration-parameters', opera doesn't understand this syntax

        render: function () {
            this.template();
        },
        template: function () {
            var elements = $(),
                view;

            elements.push($('<p><b>' + AppLocale.get('options.view.parameters_ttl') + '</b></p>'));  // add parameters' title      

            YaParameters.each(function (value, key, list) {
                if (Bar.get('locale') === 'ru' || rdz.utils.locale.ru.parameters.indexOf(value.get('name')) === -1) {
                    view = new parameter({model: value});
                    elements.push(view.render().el);
                }
            });
            $('.yandex-parameters').html(this.buildTableView(elements));

        },

        buildTableView: function (elements) {
            var parent_width = $('.bar-parameters').width();
            var num_columns = 4; //parseInt(parent_width/140, 10); //140 is columns width
            var num_rows = 13; // Math.ceil(elements.length/num_columns);

            return this.renderTableGrid({elements: elements, columns: num_columns, rows: num_rows});
        },
        renderTableGrid: function (a) {
            var table_grid = $(),
                table_column;

            for (var i = 0, l = a.elements.length - 1; i <= l; i += 1) {

                //create new column
                if (i % a.rows === 0) {
                    table_column = $('<div class="col"></div>');
                }

                //add elements in column
                $(table_column).append(a.elements[i]);

                //append column in grid
                if ((i + 1) % a.rows === 0 || i === l) {
                    table_grid.push(table_column[0]);
                }
            }
            return table_grid;
        }
    });
});
