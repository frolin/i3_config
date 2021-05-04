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
            if (!Bar.get('active')) html.find('.param').attr('disabled', 'disabled');

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

            // Seo - total price    
            if (this.model.get('name') === "Seo") {
                var activeMarkets = [];
                for (name in extra) {
                    if (name !== "api" && extra[name].active) {
                        activeMarkets.push(name);
                    }
                }
                price = rdz.utils.toFixed(price * activeMarkets.length, 5);
                hideCoins = activeMarkets.length === 0 ? true : false;

            } else if (this.model.get('name') === 'SiteAnalysis') {
                var extraSEO = window.Parameters.get('Seo').get('extra'); //rdz.utils.getOptions({options: ['Parameters']}).filter(function(p) {return p.name === 'Seo';})[0].extra;
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
                            title: price ? (this.model.get('name') === 'DisableAd' ? AppLocale.get('options.parameters.options.disable_ad_coins.ttl') : AppLocale.get('options.parameters.options.coins.ttl') ) +
                            ' ' + rdz.utils.toFixed(price, 5) + '$' : ''
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
            return AppLocale.get('options.parameters.' + name) || AppLocale.get('parameters.' + name);
        },
        activeChanged: function (model, value) {

            //activate TYC and YABar from Я.Тематика or Я.Регион
            if (['YT', 'YR'].indexOf(model.get('name')) > -1 && value) {
                //Parameters.get('TYC').set({active: true});
                //var extra = Parameters.get('TYC').get('extra');
                //extra.YaBar.active = true;
                //Parameters.get('TYC').set({extra: extra}, {silent: true});
                Parameters.get('YaBar').set({active: true});
            }

            //deactivate Я.Тематика or Я.Регион from TYC
            if (['YaBar'].indexOf(model.get('name')) > -1 && !value) {
                Parameters.get('YT').set({active: false});
                Parameters.get('YR').set({active: false});
            }

            // activate Sape market from activated Seo if any market is not checked 
            if (['Seo'].indexOf(model.get('name')) > -1 && value) {
                var extra = Parameters.get('Seo').get('extra'),
                    price = main.rdz.cache.get(['API', 'Prices', Parameters.get('Seo').get('name')]),
                    name,
                    activeMarkets = [];

                for (name in extra) {
                    if (name !== "api" && extra[name].active) {
                        activeMarkets.push(name);
                    }
                }

                if (activeMarkets.length === 0) {
                    extra.Sape.active = true;
                    Parameters.get('Seo').set({extra: extra});
                    this.$el.find('.coins').css({visibility: 'visible'}).attr("title", AppLocale.get('options.parameters.options.coins.ttl') + ' ' + price + '$');
                    if ($('.contextmenu').find('.Sape').length > 0) {
                        $('.contextmenu').find('.Sape').find('.extra_param').prop('checked', true);
                    }
                }
            }

            // activate Visits from activated SimilarWeb if any options is not checked 
            if (['SimilarWeb'].indexOf(model.get('name')) > -1 && value) {
                let extra = Parameters.get('SimilarWeb').get('extra');

                if (Object.values(extra).every(item => item.active === false)) {
                    extra.Visits.active = true;
                    Parameters.get('SimilarWeb').set({extra: extra});
                    $('.contextmenu').find('.Visits').find('.extra_param').prop('checked', true);
                }
            }

            // activate AhrefsTB Page if any options is not checked 
            if ('AhrefsTB' === model.get('name') && value) {
                let extra = Parameters.get('AhrefsTB').get('extra');

                if (Object.values(extra).every(item => item.active === false)) {
                    extra.Page.active = true;
                    Parameters.get('AhrefsTB').set({extra: extra});
                    $('.contextmenu').find('.Page').find('.extra_param').prop('checked', true);
                }
            }

            this.$el.find('.param').prop('checked', value);

        }
    });

    return Backbone.View.extend({
        //el:'.bar-parameters', opera doesn't understand this syntax

        render: function () {
            this.template();
        },
        template: function () {
            var elements = $(),
                view;

            elements.push($('<p><b>' + AppLocale.get('options.view.parameters_ttl') + '</b></p>'));  // add parameters' title  

            Parameters.each(function (value, key, list) {
                if ((Bar.get('locale') === 'ru' || rdz.utils.locale.ru.parameters.indexOf(value.get('name')) === -1) && !value.get('popup')) {
                    if (value.get('name') === 'DisableAd') { // add functions' title
                        elements.push($('<p><b>' + AppLocale.get('options.view.functions_ttl') + '</b></p>'));
                    }
                    view = new parameter({model: value});
                    elements.push(view.render().el);
                }
            });

            $('.bar-parameters').html(this.buildTableView(elements));

        },

        buildTableView: function (elements) {
            var parent_width = $('.bar-parameters').width();
            var num_columns = 4; //parseInt(parent_width/140, 10); //140 is columns width
            var num_rows = 16; // Math.ceil(elements.length/num_columns);

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
