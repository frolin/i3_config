/**@namespace */
window.rdz.contextmenu = {};

window.rdz.contextmenu.Contextmenu = window.rdz.Backbone.View.extend({
    className: 'rds-bar-cm',

    render: function () {
        rdz.$('.rds-bar', rdz.app.content.view.el).append(this.el);
    },

    open: function (model, el) {
        this.close();
        this.current_el = el;
        this.current_event_name = model.get('name');

        var message = {
            method: 'message',
            request: 'CONTEXTMENU_ContentRequest',
            url: window.rdz.url,
            model: model.toJSON()
        };
        window.rdz.cmessenger.post(message);
    },
    show: function (data) {
        //prevent showing previous context menu
        if (this.current_event_name != data.model.name) return;

        //prevent creating model which isn't contextmenu
        delete data.model.name;

        //save data in collection to be able to control in future
        this.collection = new (rdz.Backbone.Collection.extend({model: rdz.Backbone.Model.extend({idAttribute: 'name'})}));
        this.collection.add(data.model.data);

        if (this.collection.length === 0) {
            rdz.app.content.contextmenu.close();
            return;
        } // added for Uniqueness

        rdz.$(window).on('click.rds_contextmenu scroll.rds_contextmenu', function () {
            rdz.app.content.contextmenu.close();
        });

        this.show_menu();
        this.render();
        this.set_columns();
        this.set_position();
    },

    set_columns: function () { // added for Services
        var param_el = this.current_el,
            param_offset = param_el.offset(),
            pos_menu = [param_offset.left - rdz.$(window).scrollLeft(), param_offset.top - rdz.$(window).scrollTop()],
            size_menu = [this.$el.outerWidth(), this.$el.outerHeight()],
            size_window = [rdz.$(window).width(), rdz.$(window).height()];

        if (pos_menu[1] + param_el.outerHeight() + size_menu[1] > size_window[1]) {
            this.$el.addClass('rds-col2');
        }
    },

    set_position: function () {
        var param_el = this.current_el,
            param_offset = param_el.offset(),
            rect = param_el[0].getBoundingClientRect();

        var pos_menu = [param_offset.left - rdz.$(window).scrollLeft(), param_offset.top - rdz.$(window).scrollTop()],
            size_menu = [this.$el.outerWidth(), this.$el.outerHeight()],
            size_window = [rdz.$(window).width(), rdz.$(window).height()];

        this.$el.css({
            left: pos_menu[0] + size_menu[0] <= size_window[0] ? pos_menu[0] : pos_menu[0] + rect.width - size_menu[0],
            top: rect.top <= 25 ? pos_menu[1] + param_el.outerHeight() : pos_menu[1] - size_menu[1],
            visibility: 'visible'
        });
    },
    show_menu: function () {

        var fragment = document.createDocumentFragment();
        this.collection.forEach(function (model) {
            model = model.toJSON();
            fragment.appendChild(new window.rdz.contextmenu[rdz.utils.toCapitaliseCase(model.type)]({model: model}).el);
        });

        this.$el.html(fragment);
    },
    show_submenu: function (model) {
        rdz.$(window).on('click.rds_context_menu scroll.rds_context_menu', function () {
            rdz.app.content.contextmenu.close();
        });

        var menu = new window.rdz.contextmenu[model.name + '_menu']({model: model});
        this.$el.html(menu.el);
        this.$el.css({visibility: 'visible'});
        menu.height();
        this.set_position();
    },
    close: function () {
        if (!this.dont_hide) {
            rdz.$(window).off('click.rds_context_menu scroll.rds_context_menu');
            this.$el.css({visibility: 'hidden'}).find('.rds-bar-sm').css({visibility: 'hidden'});
            this.$el.removeClass('rds-col2');
        }
    }
});

window.rdz.contextmenu.Page = window.rdz.Backbone.View.extend({
    className: 'rds-cm-cnt',
    element: '<a/>',
    initialize: function () {
        this.render();
    },
    template: function (m) {
        this.$el.addClass(('rds-cm-' + m.type + ' ' + (m.class ? m.class : '')));

        var href;
        if (typeof m.parameter !== 'undefined') {
            href = rdz.app.content.parameters.get(m.parameter).get('requests');
            if (href[m.name]) href = href[m.name];
        }

        var element = rdz.$(this.element, {
            target: "_blank",
            title: m.title,
            href: m.url ? m.url : href ? (href.displayUrl ? href.displayUrl : href.serviceUrl) : '',
            class: 'rds-cm-item'
        });

        element.append(m.history_count ? m.text + ' (' + m.history_count + ' ' + rdz.utils.endings(m.history_count, rdz.locale.bar.contextmenu.count) + ')' : m.text);

        if (m.parameter === 'Counters') {
            var red = m.red === true ? ' rds-red' : false;

            if (m.name == 'GA') {
                if (m.domains && m.domains != null && m.domains >= 2) {
                    element.append(" (").append(rdz.$('<span/>', {
                        class: 'rds-blue',
                        text: m.domains + rdz.locale.bar.contextmenu.Counters.GA.domains
                    }).css('text-decoration', 'underline')).append(')');
                }
            }
            else {
                element.prepend(rdz.$('<span/>', {
                    class: red !== false ? 'rds-bold' + red : 'rds-bold',
                    text: m.value
                }));
            }
        }


        if (m.name === 'History' && typeof m.history_count === 'undefined' && rdz.app.content.bar.get('logged')) {
            element.append(rdz.$('<span/>', {class: 'rds-preload-16x16'}));
        }

        if (m.type === 'submenu' || m.type === 'news') {
            element.append(rdz.$('<span/>', {class: 'rds-cm-submenu-arrow'}));
        }

        return element;
    },
    render: function () {
        this.$el.html(this.template(this.model));
        return this;
    }
});

window.rdz.contextmenu.PageHover = window.rdz.contextmenu.Page.extend({
    element: '<a/>',
    events: {
        'mouseleave': 'hover',
        'mouseenter': 'hover'
    },
    hover: function (event) {
        switch (event.type) {
            case "mouseenter":
                this.hover_mouse_move();
                break;
            case "mouseleave":
                window.rdz.app.content.tooltip.close();
                break;
        }
    },
    hover_mouse_move: function () {
        var item = this.model;
        var value = rdz.app.content.parameters.get(item.parameter).get('value')[item.name];
        if (typeof(value) == 'object' && value.image) {
            window.rdz.app.content.tooltip.open(this.getTooltipData(), event,
                {'max-width': 600});
        }
    },
    getTooltipData: function () {
        var item = this.model;
        var value = rdz.app.content.parameters.get(item.parameter).get('value')[item.name];
        var data = rdz.$('<img/>', {src: value.image, width: value.image.indexOf('yadro.ru') !== -1 ? '100%' : 500});
        return data;

    }
});

window.rdz.contextmenu.Recipient = window.rdz.contextmenu.Page.extend({
    template: function (m) {
        this.$el.addClass(('rds-cm-' + m.type + ' ' + (m.class ? m.class : '')));

        var element = rdz.$(this.element, {
            target: "_blank",
            title: m.title,
            href: m.url,
            class: 'rds-cm-item'
        });

        element.append(m.text);

        // the favicon of the recipient
        var img = rdz.$('<img />', {src: 'https://favicon.yandex.net/favicon/www.' + m.name});
        element.prepend(img);

        return element;
    }
});

window.rdz.contextmenu.UniqueContentItem = window.rdz.contextmenu.Page.extend({
    element: '<div/>',
    template: function (m) {
        this.$el.addClass(('rds-cm-' + m.type + ' ' + (m.class ? m.class : '')));

        var element = rdz.$(this.element, {
            title: m.title,
            class: 'rds-cm-item'
        });

        element.append(m.html);

        return element;
    }
});

window.rdz.contextmenu.SitemapItem = window.rdz.contextmenu.Page.extend({
    element: '<div/>',
    template: function (m) {
        this.$el.addClass(('rds-cm-' + m.type + ' ' + (m.class ? m.class : '')));

        var element = rdz.$(this.element, {
            title: m.title,
            class: 'rds-cm-item'
        }),
            url = m.value[0],
            domain = rdz.utils.domainFromUri(url).domain,
            re = new RegExp('^https?:\\/\\/(www\\.)?' + domain),
            mod_date = new Date(m.value[1]),
            mod_month = mod_date.getMonth(),
            mod_year = mod_date.getFullYear(),
            mod_day = mod_date.getDate(),
            html = '<div class="sitemap-cm-item">' +
                '<div class="sitemap-cm-date"> ' + (mod_day < 10 ? '0' + mod_day : mod_day) + ' ' +
                    rdz.locale.months[mod_month] + ' ' + mod_year +
                '</div>' +
                '<div class="sitemap-cm-url"><a href="' + url + '" target="_blank" >' + url.replace(re, '') + '</a></div>' +
                '</div>';

        element.append(html);

        return element;
    }
});

window.rdz.contextmenu.Background = window.rdz.contextmenu.Page.extend({
    element: '<span/>',
    events: {
        "click ": "click"
    },
    click: function () {
        rdz.cmessenger.post({method: 'message', request: this.model.request, url: window.rdz.url});
    }
});

window.rdz.contextmenu.Background_UserAgent = window.rdz.contextmenu.Page.extend({
    element: '<span/>',
    events: {
        "click ": "click"
    },
    click: function () {
        rdz.cmessenger.post({method: 'message', request: this.model.request, url: window.rdz.url, agent_name: this.model.name});
    }
});

window.rdz.contextmenu.Age_background = window.rdz.contextmenu.Background.extend({
    element: '<span/>',
    className: "rds-preload-24x24",
    events: {
        "click": "click"
    },
    click: function () {
        console.log(1111);
    }
});

window.rdz.contextmenu.UniqueContent_background = window.rdz.contextmenu.Background.extend({
    click: function () { // we can collect the data in the model
        var ucItems = rdz.$('.rds-cm-UniqueContentItem'),
            text = '';

        rdz.$.each(ucItems, function (index, value) {
            text += rdz.$(value).find('.uc-cm-url').text() +
            ' ' +
            rdz.$(value).find('.uc-cm-percent').text() +
            '\n';
        });
        rdz.cmessenger.post({method: 'message', request: this.model.request, url: window.rdz.url, text: text});
    }
});

window.rdz.contextmenu.History = window.rdz.contextmenu.Page.extend({
    element: '<span/>',
    events: {
        "click ": "click"
    },
    click: function (a) {
        //prevent bubbling to window
        a.stopPropagation();
        //remove handlers from window
        rdz.app.content.contextmenu.close();

        //don't show contextmenu if waiting response from Mirrors
        rdz.app.content.contextmenu.donot_show = true;

        rdz.app.content.contextmenu.show_submenu(this.model);
        rdz.cmessenger.post({method: 'message', request: this.model.request, url: window.rdz.url, model: this.model});
    }
});

window.rdz.contextmenu.Mirrors = window.rdz.contextmenu.History.extend({});

window.rdz.contextmenu.Submenu = window.rdz.contextmenu.Page.extend({
    element: '<span/>',
    events: {
        "mouseenter ": "hover",
        "mouseleave ": "hover"
    },
    hover: function (event) {
        switch (event.type) {
            case "mouseenter":
                this.$el.children('.rds-bar-sm').css({visibility: 'visible'});
                break;
            case "mouseleave":
                this.$el.children('.rds-bar-sm').css({visibility: 'hidden'});
                break;
        }
    },
    submenu_template: function (m) {
        var fragment = document.createElement('div');
        fragment.setAttribute('class', 'rds-bar-sm');
        m.submenu.forEach(function (model) {
            fragment.appendChild(new window.rdz.contextmenu[rdz.utils.toCapitaliseCase(model.type)]({model: model}).el);
        });
        return fragment;

    },
    render: function () {
        this.$el.html(this.template(this.model));
        this.$el.append(this.submenu_template(this.model));
        return this;
    }
});

window.rdz.contextmenu.News = window.rdz.contextmenu.Submenu.extend({
    hover: function (event) {
        switch (event.type) {
            case "mouseenter":
                // show if the news have been received
                if (this.model.news && this.model.news.length > 0) {
                    this.$el.children('.rds-bar-sm').css({visibility: 'visible'});
                }
                break;
            case "mouseleave":
                this.$el.children('.rds-bar-sm').css({visibility: 'hidden'});
                break;
        }
    },
    submenu_template: function (m) {
        var fragment = document.createElement('div');
        fragment.setAttribute('class', 'rds-bar-sm');
        if (m.news && m.news.length > 0) {
            m.news.forEach(function (n) {
                fragment.appendChild(new window.rdz.contextmenu.Page({
                    model: {
                        type: 'page',
                        name: m.name.toLowerCase() + '_item' + m.news.indexOf(n),
                        title: '',
                        text: n.title,
                        url: n.link,
                        class: ''
                    }
                }).el);
            });
        }
        return fragment;
    }
});

window.rdz.contextmenu.History_menu = window.rdz.contextmenu.Page.extend({
    className: 'rds-history-menu',
    events: {
        'mouseenter': 'hover',
        'mouseleave': 'hover'
    },
    initialize: function () {
        this.render();
    },
    template: function (model) {

        var fragment = document.createDocumentFragment();

        //title
        fragment.appendChild(new window.rdz.contextmenu[model.name + '_title']({model: model.parameter}).el);

        //list
        fragment.appendChild(new window.rdz.contextmenu[model.name + '_container']({model: model}).el);

        //footer
        fragment.appendChild(new window.rdz.contextmenu[model.name + '_footer']({model: model}).el);

        this.$el.html(fragment);
    },
    render: function () {
        this.template(this.model);
        return this;
    },
    height: function () {
        var window_height = rdz.$(window).height(),
            menu_height = rdz.app.content.contextmenu.$el.height();

        if (menu_height > window_height - 200) {
            this.$el.children('.rds-hs-list-cnt').css({height: window_height - 200, 'overflow-y': 'scroll'});
        }
    },
    hover: function () {
        switch (event.type) {
            case "mouseover"://mouseover
                rdz.app.content.contextmenu.dont_hide = true;
                break;
            case "mouseout"://mouseout
                rdz.app.content.contextmenu.dont_hide = false;
                break;
        }

    }
});

window.rdz.contextmenu.History_container = window.rdz.contextmenu.Page.extend({
    className: 'rds-hs-list-cnt',
    initialize: function () {
        this.render();
    },
    template: function (model) {
        var list_cnt = rdz.$('<div/>', {class: 'rds-hs-list'});

        if (rdz._.isArray(model.value)) {
            model.value.forEach(function (m, i) {
                //sub only for History
                if (model.name === "History")
                    m.sub = (model.value[i + 1] && m.Value !== model.value[i + 1].Value && (m.Value >= 0 || model.value[i + 1].Value >= 0) ?
                    (m.Value >= 0 ? m.Value : 0) - (model.value[i + 1].Value >= 0 ? model.value[i + 1].Value : 0 ) : null);

                list_cnt.append(new window.rdz.contextmenu[model.name + '_list']({model: m}).el);
            });
        } else if (model.value === -6) {
            list_cnt.append(rdz.$('<div/>', {
                class: 'rds-red rds-bold rds-error',
                text: rdz.locale.bar.contextmenu.no_money
            }));
        } else {
            list_cnt.append(rdz.$('<span/>', {class: 'rds-preload-24x24'}));
        }


        this.$el.html(list_cnt);
    },
    render: function () {
        this.template(this.model);
        return this;
    }
});

window.rdz.contextmenu.History_title = window.rdz.contextmenu.Page.extend({
    className: 'rds-sm-history-title',
    initialize: function () {
        this.render();
    },
    template: function (parameter) {
        this.$el.html(rdz.$('<div/>', {
                class: 'rds-hs-item'
            }).append(rdz.locale.bar.contextmenu.History.ttl_p1 +
            rdz.locale.bar.contextmenu.History[parameter] +
            rdz.locale.bar.contextmenu.History.ttl_p2 + '<br/>').append(rdz.$('<a/>', {
                target: "_blank",
                href: 'http://' + rdz.utils.domainFromUri(rdz.url).domain,
                text: rdz.utils.domainFromUri(rdz.url).domain
            }))
        );

        var ttl = rdz.$('<div/>', {class: 'rds-hs-cl-ttl'});
        ttl.append(rdz.$('<div/>', {class: 'rds-hs-cl', text: rdz.locale.bar.contextmenu.History.date}));
        ttl.append(rdz.$('<div/>', {class: 'rds-hs-cl'}).append(rdz.locale.bar.contextmenu.History[parameter] + rdz.locale.bar.contextmenu.History.change));
        this.$el.append(ttl);
    },
    render: function () {
        this.template(this.model);
        return this;
    }

});

window.rdz.contextmenu.History_footer = window.rdz.contextmenu.Page.extend({
    className: 'rds-sm-history-title',
    initialize: function () {
        this.render();
    },
    template: function (m) {

        var ttl = rdz.$('<div/>', {class: 'rds-hs-cl-ttl rds-hs-cl-btm'});

        ttl.append(rdz.$('<div/>', {class: 'rds-hs-cl', text: rdz.locale.bar.contextmenu.cost}));
        if (m.parameter === 'StatHistory') {
            ttl.append(rdz.$('<div/>', {class: 'rds-hs-cl'}).append((rdz._.isArray(m.value) ? rdz.utils.toFixed(m.price[m.parameter] * (m.value && m.value.length - 1 || 0), 5) : 0) + '$'));
        } else {
            ttl.append(rdz.$('<div/>', {class: 'rds-hs-cl'}).append((rdz._.isArray(m.value) ? rdz.utils.toFixed(m.price[m.parameter] * (m.value && m.value.length || 0), 5) : 0) + '$'));
        }

        this.$el.html(ttl);
        this.$el.append(rdz.$('<div/>', {
                class: 'rds-hs-btm'
            }).append(rdz.$('<a/>', {
                target: "_blank",
                href: this.return_href(m),
                text: rdz.locale.bar.contextmenu.look_at_recip
            }))
        );

    },
    return_href: function (m) {
        var converter = {
            IY: 'Iy',
            TYC: 'Cy',
            PR: 'Pr',
            StatHistory: 'StatHistory'
        };
        return 'http://www.recipdonor.com/info?TaDomains=http://' + rdz.utils.domainFromUri(rdz.url).domain + '&Check' + converter[m.parameter] + '=true';
    },
    render: function () {
        this.template(this.model);
        return this;
    }

});

window.rdz.contextmenu.History_list = window.rdz.contextmenu.Page.extend({
    className: 'rds-hs-item',
    initialize: function () {
        this.render();
    },
    template: function (m) {
        this.$el.html(rdz.$('<div/>', {
            class: 'rds-hs-cl',
            text: rdz.utils.prettyDate(m.Date, {digit: true, year: true, today: true})
        }));
        this.$el.append(rdz.$('<div/>', {
            class: 'rds-hs-cl' + (m.Yac ? ' rds-bold' : ''),
            text: m.Value === -666 ? rdz.locale.glued : ( m.Value === rdz.errors.AGS ? rdz.locale.ags : m.Value )
        }).append(rdz.$('<ins/>', {
            class: 'rds-hs-sub ' + ( m.sub < 0 ? 'rds-red' : 'rds-green'),
            text: m.Value !== -666 && (m.sub > 0 ? '+' + m.sub : m.sub ) || ''
        })));
    },
    render: function () {
        this.template(this.model);
        return this;
    }

});

window.rdz.contextmenu.Mirrors_menu = window.rdz.contextmenu.History_menu.extend({
    className: 'rds-mirrors-menu'
});

window.rdz.contextmenu.Mirrors_title = window.rdz.contextmenu.History_title.extend({
    className: 'rds-sm-mirrors-title',
    template: function (parameter) {
        this.$el.html(rdz.$('<div/>', {
                class: 'rds-mr-item'
            }).append(rdz.locale.bar.contextmenu.Mirrors.ttl).append(rdz.$('<a/>', {
                target: "_blank",
                href: 'http://' + rdz.utils.domainFromUri(rdz.url).domain,
                text: rdz.utils.domainFromUri(rdz.url).domain
            }))
        );

    }
});
window.rdz.contextmenu.Mirrors_container = window.rdz.contextmenu.History_container.extend({});
window.rdz.contextmenu.Mirrors_footer = window.rdz.contextmenu.History_footer.extend({
    return_href: function (m) {
        return 'http://www.recipdonor.com/info?TaDomains=' + rdz.utils.domainFromUri(rdz.url).domain + '&CheckBonding=true';
    }
});
window.rdz.contextmenu.Mirrors_list = window.rdz.contextmenu.History_list.extend({
    template: function (m) {
        this.$el.html(rdz.$('<div/>', {class: 'rds-mr-cl', text: m}));
    }
});

window.rdz.contextmenu.Age_menu = window.rdz.contextmenu.Page.extend({
    className: 'rds-age-menu',
    initialize: function () {
        this.render();
    },
    template: function (model) {
        var params = ['Cr', 'Exp', 'Info', 'Email', 'Dns', 'Phone', 'RegInfo'],
            item = rdz.$('<div/>'),
            historyElement,
            data = model.Whois,
            count = model.Counts,
            val = rdz.app.content.parameters.get('Age').get('value'),
            subdomain = false;

        if (rdz.utils.get_uri_obj(rdz.url).subdomain) {
            subdomain = true;
        }

        if (val !== rdz.errors.AUTHOR && val !== rdz.errors.BUNKRUPT && !subdomain) {
            /** Блок данных Whois */
            if (data) {
                rdz._.each(params, function (name) {
                    var html = rdz.$('<div/>', {class: 'rds-cm-cnt'});
                    if (data && data[name] && data[name].value != null) {
                        html.append(rdz.$('<div/>', {
                            class: 'rds-prm rds-bold rds-age',
                            text: rdz.locale.bar.contextmenu.Age[name].name + ": "
                        }));
                        var value = data[name].value;
                        if (typeof(data[name].value) == 'number') {
                            value = rdz.utils.prettyDate(data[name].value, {digit: true, year: true, future: true});
                        }
                        if (typeof(data[name].value) == 'string' && value.length > 45) {
                            //value = value.replace(/[\r\n\t]/g, '');
                            value = value.replace('\u21B5', '');
                            value = (data[name].value).substring(0, 40) + '...';
                        }
                        html.append(rdz.$('<span/>', {class: 'rds-value', text: value}));

                        /**Выводим каунт параметра Whois*/
                        if (count && count[name]) {
                            var hrefname;
                            if (name == 'Info') {
                                hrefname = 'person';
                            } else if (name == 'RegInfo') {
                                hrefname = 'registrar';
                            } else {
                                hrefname = name.toLowerCase();
                            }

                            var link = rdz.$('<a/>', {
                                target: '_blank',
                                class: "rds-value",
                                style: 'color:#0066ff; cursor:pointer; text-decoration: underline;',
                                text: (rdz.utils.formatNumber.apply(count[name], [0, "", "\u2009"])) + '' + rdz.locale.dom,
                                href: 'http://www.recipdonor.com/infowhois?' + hrefname + '=' + encodeURIComponent(value) + '&ln=ru'
                            });

                            html.append("(").append(link).append(")");
                        }
                    }

                    item.append(html);
                });
            } else {
                item.append(rdz.$('<span/>', {class: 'rds-preload-24x24'}));
            }
        } else {
            var mes = val === rdz.errors.AUTHOR ? rdz.locale.bar.tooltips.author :
                      val === rdz.errors.BUNKRUPT ? rdz.locale.bar.tooltips.bunkrupt :
                      rdz.locale.bar.tooltips.subdomain;
            var error = rdz.$('<div>', {class: 'rds-prm rds-red', text: mes});
            item.append(error);
        }

        /**Выводим две ссылки 'Возраст по' */
        var age_by = rdz.$('<div>', {class: 'rds-prm', style: 'margin-top: 5px;'});
        age_by.append(
            rdz.$('<a>', {
                target: '_blank',
                class: "rds-value",
                style: 'color:#0066ff; cursor:pointer; text-decoration: underline;',
                text: rdz.locale.bar.contextmenu.Age['age_by'].name + ' Whois',
                href: 'http://www.nic.ru/whois/?domain=' + rdz.utils.domainFromUri(rdz.url).domain
            }), " ",
            rdz.$('<a>', {
                target: '_blank',
                class: "rds-value",
                style: 'color:#0066ff; cursor:pointer; margin-left:5px; text-decoration: underline;',
                text: rdz.locale.bar.contextmenu.Age['age_by'].name + ' WebArchive',
                href: 'http://web.archive.org/web/*/http://' + rdz.utils.domainFromUri(rdz.url).domain
            })
        );
        item.append(age_by);

        /**Выводим историю изменений*/
        if (val !== rdz.errors.AUTHOR && !subdomain) {
            if (data && data.HistoryCount) {
                historyElement = rdz.$('<div/>', {class: 'rds-cm-cnt age-history'});
                historyElement.append(rdz.$('<div/>', {
                    class: 'rds-prm-age-history rds-bold',
                    text: rdz.locale.bar.contextmenu.Age['HistoryCount'].name + ": "
                }));
                historyElement.append(
                    rdz.$('<a/>', {
                        id: 'age-history-count',
                        class: 'rds-value',
                        style: 'color:#0066ff; cursor:pointer; text-decoration: underline;',
                        target: '_blank',
                        text: data.HistoryCount + ' ' + rdz.utils.getRecordFromNum(data.History),
                        href: 'http://www.recipdonor.com/infowhoishist?domain=' + rdz.utils.domainFromUri(rdz.url).domain
                    })
                );
                item.append(historyElement);
            }
        }
        this.$el.html(item.html());
    },
    render: function () {
        this.template(this.model);
        return this;
    },
    height: function () {
        var window_height = rdz.$(window).height(),
            menu_height = rdz.app.content.contextmenu.$el.height();

        if (menu_height > window_height - 200) {
            this.$el.children('.rds-hs-list-cnt').css({height: window_height - 200, 'overflow-y': 'scroll'});
        }
    }
});

window.rdz.contextmenu.UniqueContent_menu = window.rdz.contextmenu.Page.extend({
    className: 'rds-UniqueContent_menu-menu',

    initialize: function () {
        this.render();
    },

    render: function () {
        this.template(this.model);
        return this;
    },

    template: function (model) {
        var html = rdz.$('<div/>'),
            value = rdz.app.content.parameters.get('UniqueContent').get('value');

        if (value === null) {
            html.append(rdz.$('<span/>', {class: 'rds-preload-24x24'}));
        } else {
            rdz.app.content.contextmenu.close();
        }

        this.$el.html(html.html());
    }
});

window.rdz.contextmenu.Subdomains_menu = window.rdz.contextmenu.History_menu.extend({
    className: 'rds-subdomains-menu'
});
window.rdz.contextmenu.Subdomains_title = window.rdz.contextmenu.History_title.extend({
    className: 'rds-sm-mirrors-title',
    template: function (parameter) {
        this.$el.html(rdz.$('<div/>', {
                class: 'rds-mr-item'
            }).append(rdz.locale.bar.contextmenu.Subdomains.ttl).append(rdz.$('<a/>', {
                target: "_blank",
                href: 'http://' + rdz.utils.domainFromUri(rdz.url).domain,
                text: rdz.utils.domainFromUri(rdz.url).domain
            }))
        );

    }
});
window.rdz.contextmenu.Subdomains_container = window.rdz.contextmenu.History_container.extend({
    template: function (model) {
        var list_cnt = rdz.$('<div/>', {class: 'rds-hs-list'});

        if (model.value && model.value.Collection) {
            model.value.Collection.forEach(function (m, i) {
                m['number'] = i + 1;
                list_cnt.append(new window.rdz.contextmenu[model.name + '_list']({model: m}).el);
            });
        } else if (model.value === rdz.errors.AUTHOR) {
            list_cnt.append(rdz.$('<div/>', {
                class: 'rds-red rds-bold rds-error',
                text: rdz.locale.bar.contextmenu.authorize
            }));
        } else if (model.value === rdz.errors.BUNKRUPT) {
            list_cnt.append(rdz.$('<div/>', {
                class: 'rds-red rds-bold rds-error',
                text: rdz.locale.bar.contextmenu.no_money
            }));
        } else {
            list_cnt.append(rdz.$('<span/>', {class: 'rds-preload-24x24'}));
        }

        this.$el.html(list_cnt);
    }
});
window.rdz.contextmenu.Subdomains_footer = window.rdz.contextmenu.History_footer.extend({
    template: function (m) {
        var ttl = rdz.$('<div/>', {class: 'rds-hs-cl-ttl rds-hs-cl-btm'}),
            count = rdz.app.content.parameters.get('Subdomains').get('value');

        ttl.append(rdz.$('<span/>', {class: 'rds-sd-total', text: rdz.locale.bar.contextmenu.total + ' '}));
        ttl.append(rdz.$('<a/>', {
            target: "_blank",
            href: this.return_href(m),
            text: count
        }));
        ttl.append(rdz.$('<span/>', {
            text: ' ' + rdz.utils.endings(count, {
                nom: rdz.locale.bar.contextmenu.sd_nom,
                gen: rdz.locale.bar.contextmenu.sd_gen,
                plu: rdz.locale.bar.contextmenu.sd_plu
            })
        }));
        this.$el.html(ttl);
    },
    return_href: function (m) {
        return 'http://www.recipdonor.com/infosubdomen?url=' + rdz.utils.domainFromUri(rdz.url).domain;
    }
});
window.rdz.contextmenu.Subdomains_list = window.rdz.contextmenu.History_list.extend({
    template: function (m) {
        this.$el.html(rdz.$('<div/>', {class: 'rds-sd-cl'})
                .append(rdz.$('<a/>', {
                    target: "_blank",
                    href: 'http://' + m.Url,
                    text: m.Url
                }))
                .append(rdz.$('<span/>', {class: 'rds-sd-nm', text: m.number}))
        );
    }
});
