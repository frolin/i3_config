define(function () {
    var Option = {};
    Option.Base = Backbone.View.extend({
        tagName: 'div',
        events: {
            "change .extra_param": "toggle"
        },
        initialize: function (options) {
            this.options = options || {};
            this.render();
        },
        template: function () {

            var html = $('<label/>'),
                m = this.model,
                o = this.options,
                attr = {
                    type: 'checkbox',
                    class: 'extra_param',
                    title: AppLocale.get('options.parameters.options.' + m.get('name'))[o.attr]
                };
            if (m.get('extra')[o.attr].active) {
                attr.checked = 'checked';
            }
            html.append($('<input/>', attr));
            html.append($('<span/>', {class: 'name'}).html(AppLocale.get('options.parameters.options.' + m.get('name'))[o.attr]));

            this.$el.addClass(o.attr).html(html);
        },
        render: function () {
            this.template();
            return this;
        },
        toggle: function (e) {
            this.changeModel(e);
            this.changeView(e);
        },
        changeModel: function (e) {
            this.model.toggle({extra: this.options.attr, value: e.currentTarget.checked});
        },
        changeView: function (e) {
            $('#save').removeAttr('disabled');
        }
    });

    Option.api = Option.Base.extend({
        template: function () {

            this.$el.addClass('api');
            this.$el.html($('<div/>', {text: AppLocale.get('options.parameters.options.api.ttl'), class: 'ttl'}));
            var api = this.model.get('extra').api.active;
            this.$el.append(this.template_label({locale: this.model.get('name'), value: 0, checked: api === false}));

            // example: IGP
            var apiExtra = this.model.get('extra').api.extra;
            if (apiExtra !== undefined) {
                for (var opt in apiExtra) {
                    this.$el.append(this.template_label({apiExtra: apiExtra, optName: opt}));
                }
            }

            this.$el.append(this.template_label({locale: 'with_api', value: 1, checked: api === true}));

        },
        template_label: function (a) {
            // example: IGP
            if (a.apiExtra) {
                var label = $('<label/>'),
                    attr = {
                        type: 'checkbox',
                        class: 'extra_param',
                        title: AppLocale.get('options.parameters.options.api')[a.optName],
                        name: a.optName
                    };
                if (this.model.get('extra').api.extra[a.optName]) {
                    attr.checked = 'checked';
                }
                label.append($('<input/>', attr));
                label.append($('<span/>', {
                    class: 'name',
                    text: AppLocale.get('options.parameters.options.api')[a.optName]
                }));
                label.addClass("extra_api");
                if (this.model.get('extra').api.active) {
                    label.addClass("disabled");
                    label.find('input').attr('disabled', 'disabled');
                }

                return label;
            }

            var label = $('<label/>'),
                attr = {
                    value: a.value,
                    type: 'radio',
                    class: 'extra_param',
                    name: 'param_api',
                    title: AppLocale.get('options.parameters.options.api')[a.locale]
                };
            if (a.checked) {
                attr.checked = 'checked';
            }
            label.append($('<input/>', attr));
            label.append($('<span/>', {
                class: 'name',
                text: AppLocale.get('options.parameters.options.api')[a.locale]
            }));
            if (a.locale === "with_api") {
                var price = main.rdz.cache.get(['API', 'Prices', this.model.get('name')]);

                label.append($('<span/>', {
                    class: 'coins',
                    title: price ? AppLocale.get('options.parameters.options.coins.ttl') + ' ' + price + '$' : ''
                }));
                label.find('.coins').html('<img alt="" src="icons/new_options/img-13.png"/>');
            }
            return label;
        },
        changeModel: function (e) {
            switch (e.currentTarget.type) {
                case 'radio':
                    this.model.toggle({extra: 'api', value: Boolean(parseInt(e.currentTarget.value), 2)});

                    // TODO: change in the future
                    // disable IGP indexation date
                    if (e.currentTarget.value === '0') {
                        if ($('.extra_api').length > 0) {
                            $('.extra_api').removeClass('disabled').find('input').removeAttr('disabled');
                        }
                    } else if (e.currentTarget.value === '1') {
                        if ($('.extra_api').length > 0) {
                            $('.extra_api').addClass('disabled').find('input').prop('checked', false).attr('disabled', 'disabled');
                            this.model.toggle({
                                extra: 'api_extra',
                                value: false,
                                opt_name: $('.extra_api').find('input').attr('name')
                            });
                        }
                    }

                    break;
                case 'checkbox':
                    this.model.toggle({
                        extra: 'api_extra',
                        value: e.currentTarget.checked,
                        opt_name: e.currentTarget.name
                    });
                    break;
            }
        },
        changeView: function (e) {
            //call parent methods
            var api = Boolean(parseInt(e.currentTarget.value), 2),
                coins = this.options.parent.$el.find('.coins');
            api ? coins.css({visibility: 'visible'}) : coins.css({visibility: 'hidden'});

            $('#save').removeAttr('disabled');
        }
    });

    Option.YaBar = Option.Base.extend({
        initialize: function (options) {
            this.options = options || {};
            this.model.on("change:extra", this.activeChanged, this);
            this.render();
        },
        activeChanged: function (model, value) {
            //deactivate Я.Тематика or Я.Регион from YaBar
            if (!value) {
                Parameters.get('YT').set({active: false});
                Parameters.get('YR').set({active: false});
            }
        }
    });

    Option.RegionalRank = Option.Base.extend({});

    Option.PRMain = Option.Base.extend({});
    Option.PRg = Option.Base.extend({});

    Option.title = Option.Base.extend({
        template: function () {
            var m = this.model,
                o = this.options;

            this.$el.html($('<div/>', {
                text: AppLocale.get('options.parameters.options.' + m.get('name'))['ttl'],
                class: 'ttl'
            }));

            this.$el.addClass(o.attr);
        }
    });

    Option.noindex = Option.Base.extend({});
    Option.rel_nofollow = Option.Base.extend({});
    Option.subdomains = Option.Base.extend({});

    Option.SEOTags = Option.Base.extend({
        changeView: function (e) {
            var extra = this.model.get('extra'),
                checkbox = this.options.parent.$el.find('.param'),
                activeTags = [];

            for (var name in extra) {
                if (extra[name].active) {
                    activeTags.push(name);
                }
            }

            if (activeTags.length > 2) {
                checkbox.prop('checked', true);
                this.model.set('active', true);
            } else {
                checkbox.prop('checked', false);
                this.model.set('active', false);
            }

            $('#save').removeAttr('disabled');
        }
    });

    Option._title = Option.SEOTags.extend({});
    Option.description = Option.SEOTags.extend({});
    Option.keywords = Option.SEOTags.extend({});
    Option.h1 = Option.SEOTags.extend({});
    Option.h2_h4 = Option.SEOTags.extend({});
    Option.canonical = Option.SEOTags.extend({});
    Option.metaRobots = Option.SEOTags.extend({});

    Option.exceptions = Option.Base.extend({
        events: {
            "input .list": "changeList"
        },
        template: function () {
            var m = this.model,
                o = this.options;

            this.$el.html($('<div/>', {
                text: AppLocale.get('options.parameters.options.exceptions.ttl'),
                class: 'ttl'
            }));
            this.$el.append(
                $('<textarea class="list" cols="6" rows="12"></textarea>').val(this.model.get('extra').exceptions.value)
            );

            this.$el.addClass(o.attr);
        },
        changeList: function (e) {
            var extra = this.model.get('extra');
            var domains =
                $(e.currentTarget).val().split('*')
                    .map(function (e) {
                        var domain = '';
                        if (e) {
                            domain = '*' + punycode.ToASCII(e.replace('\n', '')) + '\n';
                        }
                        return domain;
                    });

            extra.exceptions.value = domains.join('');
            this.model.set('extra', extra);
            $('#save').removeAttr('disabled');
        }
    });

    Option.exceptionsBar = Option.Base.extend({
        events: {
            "input .list": "changeList"
        },
        template: function () {
            var m = this.model,
                o = this.options;

            this.$el.html($('<div/>', {
                text: AppLocale.get('options.parameters.options.exceptions.ttl'),
                class: 'ttl'
            }));
            this.$el.append(
                $('<textarea class="list" cols="6" rows="12"></textarea>').val(this.model.get('filter_domain'))
            );

            this.$el.addClass(o.attr);
        },
        changeList: function (e) {
            var filter_domain = this.model.get('filter_domain');
            var domains =
                $(e.currentTarget).val().split('*')
                    .map(function (e) {
                        var domain = '';
                        if (e) {
                            domain = '*' + punycode.ToASCII(e.replace('\n', '')) + '\n';
                        }
                        return domain;
                    });

            filter_domain = domains.join('');
            this.model.set('filter_domain', filter_domain);
            $('#save').removeAttr('disabled');
        }
    });

    Option.SocialNetwork = Option.Base.extend({
        changeView: function (e) {
            var extra = this.model.get('extra'),
                checkbox = this.options.parent.$el.find('.param'),
                activeNetworks = [];

            for (var name in extra) {
                if (extra[name].active) {
                    activeNetworks.push(name);
                }
            }

            if (activeNetworks.length > 0) {
                checkbox.prop('checked', true);
                this.model.set('active', true);
            } else {
                checkbox.prop('checked', false);
                this.model.set('active', false);
            }

            $('#save').removeAttr('disabled');
        }
    });
    Option.GooglePlus = Option.SocialNetwork.extend({});
    Option.Facebook = Option.SocialNetwork.extend({});
    Option.Twitter = Option.SocialNetwork.extend({});
    Option.VK = Option.SocialNetwork.extend({});

    Option.APIParameter = Option.Base.extend({
        template: function () {
            var html = $('<label/>'),
                m = this.model,
                o = this.options,
                attr = {
                    type: 'checkbox',
                    class: 'extra_param',
                    title: AppLocale.get('options.parameters.options.' + m.get('name'))[o.attr]
                },
                complexParams = ['Seo'],
                price = complexParams.indexOf(o.attr) !== -1 ? this.getPrice(o.attr) : main.rdz.cache.get(['API', 'Prices', o.attr]);

            if (m.get('extra')[o.attr].active) {
                attr.checked = 'checked';
            }
            html.append($('<input/>', attr));
            html.append($('<span/>', {class: 'name'}).html(AppLocale.get('options.parameters.options.APIParameters')[o.attr]));
            html.append($('<span/>', {
                class: 'coins',
                title: price ? AppLocale.get('options.parameters.options.coins.ttl') + ' ' + price + '$' : ''
            }));
            html.find('.coins').html('<img alt="" src="icons/new_options/img-13.png"/>');

            this.$el.addClass(o.attr).html(html);
        },
        getPrice: function (name) {
        },
        changeView: function (e) {
            var extra = this.model.get('extra'),
                o = this.options,
                price = 0,
                name,
                hasActiveElements = false,
                coins = this.options.parent.$el.find('.coins'),
                checkbox = this.options.parent.$el.find('.param'),
                activeMarkets = [],
                extraSEO = window[o.parameters_branch || 'Parameters'].get('Seo').get('extra'), //rdz.utils.getOptions({options: ['Parameters']}).filter(function(p) {return p.name === 'Seo';})[0].extra,
                n;

            for (name in extra) {
                if (name !== "api" && name !== "title" && name !== "Seo" && extra[name].active) {
                    price += rdz.utils.toFixed(main.rdz.cache.get(['API', 'Prices', name]), 5);
                    hasActiveElements = true;
                } else if (name === "Seo" && extra[name].active) { // total markets count is from Parameters brach
                    hasActiveElements = true;
                    for (n in extraSEO) {
                        if (n !== "api" && extraSEO[n].active) {
                            activeMarkets.push(n);
                        }
                    }
                    price += rdz.utils.toFixed(main.rdz.cache.get(['API', 'Prices', 'Seo']) * activeMarkets.length, 5);
                }
            }

            coins.attr("title", AppLocale.get('options.parameters.options.coins.ttl') + ' ' + rdz.utils.toFixed(price, 5) + '$');
            if (hasActiveElements) {
                coins.css({visibility: 'visible'});
                if (!o.parameters_branch) { // uncheck only for 'Parameters' tab
                    checkbox.prop('checked', true);
                    this.model.set('active', true);
                }
            } else {
                coins.css({visibility: 'hidden'});
                if (!o.parameters_branch) { // uncheck only for 'Parameters' tab
                    checkbox.prop('checked', false);
                    this.model.set('active', false);
                }
            }

            $('#save').removeAttr('disabled');
        }
    });
    Option.Seo = Option.APIParameter.extend({
        getPrice: function (name) { // count total price
            var o = this.options,
                SEO,
                price = main.rdz.cache.get(['API', 'Prices', name]),
                count = 0;

            try {
                SEO = window[o.parameters_branch || 'Parameters'].get('Seo'); //_.find(rdz.utils.getOptions({options: ['Parameters']}), function(e) {return e.name === name});
            } catch (e) {
            }

            if (SEO) {
                for (let m in SEO.extra) {
                    if (m !== "api" && SEO.extra[m].active) {
                        count++;
                    }
                }

            } else {
                count = 16;
            }
            price = rdz.utils.toFixed(price * count, 5);
            return price;
        }
    });
    Option.Host = Option.APIParameter.extend({});
    Option.Provider = Option.APIParameter.extend({});
    Option.CheckDangerous = Option.APIParameter.extend({});
    Option.Geo = Option.APIParameter.extend({});
    Option.Age = Option.APIParameter.extend({});

    Option._Seo = Option.Base.extend({
        changeView: function (e) {
            var extra = this.model.get('extra'),
                price = main.rdz.cache.get(['API', 'Prices', this.model.get('name')]),
                coins = this.options.parent.$el.find('.coins'),
                checkbox = this.options.parent.$el.find('.param'),
                activeMarkets = [];

            // count total price for parameter Seo    
            for (var name in extra) {
                if (name !== "api" && extra[name].active) {
                    activeMarkets.push(name);
                }
            }
            price = rdz.utils.toFixed(price * activeMarkets.length, 5);
            coins.attr("title", AppLocale.get('options.parameters.options.coins.ttl') + ' ' + price + '$');
            if (activeMarkets.length > 0) {
                coins.css({visibility: 'visible'});
                checkbox.prop('checked', true);
                this.model.set('active', true);
            } else {
                coins.css({visibility: 'hidden'});
                checkbox.prop('checked', false);
                this.model.set('active', false);
            }

            $('#save').removeAttr('disabled');
        }
    });
    Option.Sape = Option._Seo.extend({});
    Option.Trustlink = Option._Seo.extend({});
    Option.Liex = Option._Seo.extend({});
    Option.Mainlink = Option._Seo.extend({});
    Option.Linkfeed = Option._Seo.extend({});
    Option.Setlinks = Option._Seo.extend({});
    Option.Xap = Option._Seo.extend({});
    Option.Propage = Option._Seo.extend({});
    Option.Seozavr = Option._Seo.extend({});
    Option.SapeArticles = Option._Seo.extend({});
    Option.SapePr = Option._Seo.extend({});
    Option.Miralinks = Option._Seo.extend({});
    Option.Gogetlinks = Option._Seo.extend({});
    Option.Blogun = Option._Seo.extend({});
    Option.RotaPost = Option._Seo.extend({});
    Option.Rds = Option._Seo.extend({});

    Option.domain_zone = Option.Base.extend({
        template: function () {

            var html = $('<label/>'),
                m = this.model,
                o = this.options;

            html.append($('<span/>', {class: 'name'}).html(AppLocale.get('options.parameters.options.' + m.get('name'))[o.attr]));
            html.append($('<select/>', {class: 'extra_param'}).append(this.select_options()));

            this.$el.addClass(o.attr).html(html);
        },
        select_options: function () {
            var options = [],
                self = this;
            rdz.utils.google.zones.forEach(function (e) {
                var option = $('<option/>', {value: e, text: e});
                if (e === self.model.get('extra').domain_zone.active) {
                    option.prop({'selected': 'selected'});
                }
                options.push(option);
            });
            return options;
        },
        changeModel: function (e) {
            this.model.toggle({extra: this.options.attr, value: e.currentTarget.value});
        }
    });
    
    Option.semrush_zone = Option.domain_zone.extend({
        select_options: function () {
            var options = [],
                self = this;
            rdz.utils.semrush.zones.forEach(function (e) {
                var option = $('<option/>', {value: e, text: '.' + e});
                if (e === self.model.get('extra').semrush_zone.active) {
                    option.prop({'selected': 'selected'});
                }
                options.push(option);
            });
            return options;
        }
    });

    Option.prodvigator_item = Option.Base.extend({
        changeView: function (e) {
            var extra = this.model.get('extra'),
                checkbox = this.options.parent.$el.find('.param'),
                param_is_active = extra['prodvigator_yandex'].active || extra['prodvigator_google'].active;

            if (param_is_active) {
                checkbox.prop('checked', true);
                this.model.set('active', true);
            } else {
                checkbox.prop('checked', false);
                this.model.set('active', false);
            }

            $('#save').removeAttr('disabled');
        }
    });

    Option.prodvigator_yandex = Option.prodvigator_item.extend({});

    Option.prodvigator_google = Option.prodvigator_item.extend({});

    Option.prodvigator_google_source = Option.domain_zone.extend({
        template: function () {

            var html = $('<label/>'),
                m = this.model,
                o = this.options;

            html.append($('<span/>', {class: 'name'}).html(AppLocale.get('options.parameters.options.' + m.get('name'))[o.attr]));
            html.append($('<select/>', {class: 'extra_param'}).append(this.select_options()));

            this.$el.addClass(o.attr).html(html);
        },
        select_options: function () {
            var options = [],
                self = this;
            rdz.utils.prodvigator_google_sources.forEach(function (e) {
                var option = $('<option/>', {value: e, text: e.replace('_', '.')});
                if (e === self.model.get('extra').prodvigator_google_source.active) {
                    option.prop({'selected': 'selected'});
                }
                options.push(option);
            });
            return options;
        },
        changeModel: function (e) {
            this.model.toggle({extra: this.options.attr, value: e.currentTarget.value});
        }
    });

    Option.daily_traffic = Option.Base.extend({});

    Option.check_always = Option.Base.extend({});

    Option.res_ttl = Option.Base.extend({});

    Option.res_desc = Option.Base.extend({});

    Option.res_url = Option.Base.extend({});

    Option.SimilarWeb = Option.Base.extend({
        changeView: function (e) {
            var extra = this.model.get('extra'),
                checkbox = this.options.parent.$el.find('.param'),
                activeOpts = [];

            for (var name in extra) {
                if (extra[name].active) {
                    activeOpts.push(name);
                }
            }

            if (activeOpts.length > 0) {
                checkbox.prop('checked', true);
                this.model.set('active', true);
            } else {
                checkbox.prop('checked', false);
                this.model.set('active', false);
            }

            $('#save').removeAttr('disabled');
        }
    });
    ['Visits', 'TimeOnSite', 'PagePerVisit', 'BounceRate', 'CountryShares',
    'Sources' //, 'Referrals', 'OrganicKeywords'
    ].forEach(opt => {
        Option[opt] = Option.SimilarWeb.extend({});
    });

    Option.AhrefsTB = Option.Base.extend({
        changeView: function (e) {
            var extra = this.model.get('extra'),
                checkbox = this.options.parent.$el.find('.param'),
                activeOpts = [];

            for (var name in extra) {
                if (extra[name].active) {
                    activeOpts.push(name);
                }
            }

            if (activeOpts.length > 0) {
                checkbox.prop('checked', true);
                this.model.set('active', true);
            } else {
                checkbox.prop('checked', false);
                this.model.set('active', false);
            }

            $('#save').removeAttr('disabled');
        }
    });
    ['Page', 'Domain'].forEach(opt => {
        Option[opt] = Option.AhrefsTB.extend({});
    });

    return Backbone.View.extend({
        el: '.contextmenu',
        events: {
            "click .cm-close": "close"
        },

        close: function () {
            this.$el.css({visibility: 'hidden'});
        },

        open: function (a) {
            this.$el.find('.cm-cnt').empty();
            this.$el.find('.cm-cnt').html(this.parameters_options(a));

            var param_el = $(a.e.currentTarget),
                param_offset = param_el.offset();

            var pos_menu = [param_offset.left, param_offset.top],
                size_menu = [this.$el.outerWidth(), this.$el.outerHeight()],
                size_window = [$(window).width(), $(window).height()],
                window_scroll = [$(window).scrollLeft(), $(window).scrollTop()];


            this.$el.css({
                left: pos_menu[0] + size_menu[0] <= size_window[0] + window_scroll[0] ? pos_menu[0] : pos_menu[0] + param_el.outerWidth() - size_menu[0],
                top: pos_menu[1] + param_el.outerHeight() + size_menu[1] <= size_window[1] + window_scroll[0] ? pos_menu[1] + param_el.outerHeight() : pos_menu[1] - size_menu[1],
                visibility: 'visible'
            });

        },
        parameters_options: function (a) {
            // flag - don't display "api" element for the Seo parametr 
            var toAdd;

            var fragment = document.createDocumentFragment();

            if (a.m.id === 'Bar') { // Extra
                fragment.appendChild(new Option['exceptionsBar']({
                    model: a.m,
                    parent: a.parent,
                    attr: 'exceptionsBar'
                }).el);
            } else if (a.name) {
                var div = document.createElement('div');
                div.className = 'cm-' + a.name.toLowerCase();
                fragment.appendChild(div);
            } else {
                if (a.m.id === "Seo"/* || a.m.id === "SocialNetworks"*/) {
                    this.$el.find('.cm-cnt').addClass('rds-col2');
                } else {
                    this.$el.find('.cm-cnt').removeClass('rds-col2');
                }

                _.keys(a.m.get('extra')).forEach(function (attr) {
                    toAdd = true;
                    // check current option
                    if (a.m.id === "Seo" && attr === "api" ||
                        a.m.id === "UniqueContent" && (attr === "api" || attr === "pause") ||
                        a.m.id === "SiteAnalysis" && attr === "api" ||
                        a.m.id === "StatHistory" && attr === "api" ||
                        (AppLocale.get_locale_str() !== 'ru' && rdz.utils.locale.ru.parameters.indexOf(attr) !== -1)
                    ) {
                        toAdd = false;
                    }

                    if (toAdd) {
                        fragment.appendChild(new Option[attr]({
                            model: a.m,
                            parent: a.parent,
                            attr: attr,
                            parameters_branch: a.parameters_branch
                        }).el);
                    }
                });

            }

            this.$el.find('.cm-cnt').html(fragment);
        }
    });
});
