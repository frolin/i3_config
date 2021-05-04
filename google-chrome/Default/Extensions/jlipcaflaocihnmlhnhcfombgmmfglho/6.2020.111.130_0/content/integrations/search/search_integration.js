window.rdz.integrations = window.rdz.integrations || {};
window.rdz.integrations.search = window.rdz.integrations.search || {};
window.rdz.integrations.search.hash = window.rdz.integrations.search.hash || {}; // hash for storing data for each search result
window.rdz.integrations.search.targets = window.rdz.integrations.search.targets || {}; // to avoid duplication of the requests

window.rdz.integrations.search.models = {

    Parameter: rdz.Backbone.Model.extend({
        defaults: {
            value: null
        },

        idAttribute: 'name',

        sendMessage: function (message) {
            message.method = 'message';
            message.model = this.toJSON();
            rdz.cmessenger.post(message);
        },

        valueChanged: function (view) {
            try {
                view.showResult();
            } catch (e) {
            }
        }
    }),

    Competition: rdz.Backbone.Model.extend({
        defaults: {
            value: null
        },
        initialize: function () {
            this.on("change:ahrefs_data", this.check, this);
            this.check();
        },
        check: function () {
            if (!this.get('urls')) {
                this.getURLs();
                this.getAhrefsData();
            }
            if (this.get('ahrefs_data')) {
                this.getDocumentData();
                this.calculate();
            }
        },

        getURLs: function() {
            var urls = rdz._.keys(window.rdz.integrations.search.hash),
                top_urls;

            if (urls.length) {
                top_urls = urls.slice(0, 10); // get top 10
                this.set({urls: urls, top_urls: top_urls});
            }
        },
        getAhrefsData: function() {
            rdz.cmessenger.post({method: 'message', request: 'COMPETITION_AHREFS_ContentRequest',
                urls: this.get('top_urls')});
        },
        getDocumentData: function () {
            var that = this,
                integration = this.get('integration'),
                top_urls = this.get('top_urls'),
                query,
                titles = [];
            if (integration === 'yandex') {
                query = rdz.$('input[type="search"].input__control').val();
                rdz.$.each(top_urls, function(i, e) {
                    title = rdz.$('a.serp-item__title-link[href="' + e + '"]').text();
                    titles.push(that.canonize(title));
                });
            } else if (integration === 'google') {
                query = rdz.$('.gsc_b').text();
                rdz.$.each(top_urls, function(i, e) {
                    title = rdz.$('a[href="' + e + '"]').text();
                    titles.push(that.canonize(title));
                });
            }
            this.set('query', that.canonize(query));
            this.set('titles', titles);
            this.parseResultsCount();
        },
        canonize: function (text) {
            text = text.replace(/[^a-zа-яё\d]/ig, ' ')
                .replace(/\s{2,}/g, ' ')
                .replace(/(^\s+)|(\s+$)/g, '')
                .toLowerCase();
            return text;
        },
        parseResultsCount: function() {
            var integration = this.get('integration'),
                result = null;
            if (integration === 'yandex') {
                result = rdz.$('.input__found').text();
            } else if (integration === 'google') {
                result = rdz.$('#resultStats').text();
                result = result.split('<')[0];
            }
            if (result) {
                result = result.replace(/^([а-яё\s]+)/, "");
                result = result.replace(/\s$/, "");
                result = result.replace(/тыс\.*/, "000");
                result = result.replace(/тис\.*/, "000");
                result = result.replace(/млн/, "000000");
                result = result.replace(/&nbsp;/, "");
                result = result.replace(/[^\d]/g, '');

                this.set('results_count', result);
            }
        },
        calculate: function() {
            var that = this,
                top_urls = this.get('top_urls'),
                ahrefs_data = this.get('ahrefs_data'),
                value = 0,
                tmp_sum, tmp_count,
                results = this.get('results_count');

            // the algorithm

            // step 1
            console.log('-------------------- Шаг 1 --------------------');
            rdz.$.each(top_urls, function(i, e) {
                if (rdz.utils.isMainPage(e)) {
                    console.log(e + ' - главная страница');
                    value += 10;
                }
            });
            console.log('После шага 1 значение = ' + value);

            // step 2
            console.log('-------------------- Шаг 2 --------------------');
            tmp_sum = 0;
            tmp_count = 0;
            rdz.$.each(top_urls.slice(0, 5), function(i, e) {
                if (!rdz.utils.isMainPage(e)) {
                    tmp_sum += ahrefs_data[e]['rd'];
                    tmp_count++;
                    console.log(e + ' :  RD = ' + ahrefs_data[e]['rd']);
                }
            });
            if (tmp_count) value += 5 * (tmp_sum / tmp_count);
            console.log('После шага 2 значение = ' + value);

            // step 3
            console.log('-------------------- Шаг 3 --------------------');
            tmp_sum = 0;
            tmp_count = 0;
            rdz.$.each(top_urls.slice(5, 10), function(i, e) { // not (6, 10) !
                if (!rdz.utils.isMainPage(e)) {
                    tmp_sum += ahrefs_data[e]['rd'];
                    tmp_count++;
                    console.log(e + ' :  RD = ' + ahrefs_data[e]['rd']);
                }
            });
            if (tmp_count) value += 3 * (tmp_sum / tmp_count);
            console.log('После шага 3 значение = ' + value);

            // step 4
            console.log('-------------------- Шаг 4 --------------------');
            rdz.$.each(top_urls, function(i, e) {
                if (ahrefs_data[e]['rd'] >= 500) {
                    value += ahrefs_data[e]['rd'] < 1000 ? 2 : 4;
                    console.log(e + ' :  RD = ' + ahrefs_data[e]['rd']);
                }
            });
            console.log('После шага 4 значение = ' + value);

            // step 5
            console.log('-------------------- Шаг 5 --------------------');
            rdz.$.each(that.get('titles'), function(i, title) {
                if ((new RegExp(that.get('query'), 'i')).test(title)) {
                    value += 5;
                    console.log(title + '   содержит   ' + that.get('query'));
                }
            });
            console.log('После шага 5 значение = ' + value);

            // step 6
            console.log('-------------------- Шаг 6 --------------------');
            value += (30 / that.get('query').split(' ').length);
            console.log('Кол-во слов в запросе  = ' + that.get('query').split(' ').length);
            console.log('После шага 6 значение = ' + value);

            // step 7
            console.log('-------------------- Шаг 7 --------------------');
            console.log('Найдено результатов  = ' + rdz.utils.formatNumber.apply(results, [0, "", "\u2009"]));
            if (results >= 50000 && results <= 100000) {
                value += 1;
            } else if (results >= 100000 && results <= 1000000) {
                value += 5;
            } else if (results >= 1000000 && results <= 30000000) {
                value += 10;
            } else if (results >= 30000000 && results <= 50000000) {
                value += 15;
            } else if (results > 50000000) {
                value += 20;
            }
            console.log('После шага 7 значение = ' + value);

            that.set('value', value);
        }
    }),
    
    RecipientsPositions: rdz.Backbone.Model.extend({
        defaults: {
            recipients: null
        }        
    })
};

window.rdz.integrations.search.collections = {

    Parameters: rdz.Backbone.Collection.extend({

        model: window.rdz.integrations.search.models.Parameter,

        updateModel: function (o) {
            var model = this.get(o.model.name);

            model.set({value: o.model.value, requests: o.model.requests || model.get('requests')}, {silent: true});
            model.trigger("change:value");
        },

        sendURLRequests: function (url) {
            var domain = rdz.utils.domainFromUri(url).domain,
                name;

            this.each(function (param) {
                name = param.get('name');

                if (rdz.utils.pageParameters.indexOf(name) !== -1) {
                    param.sendMessage({url: url, request: 'PARAMETER_ContentRequest', receiver: 'integration'});
                } else if (domain && rdz.integrations.search.targets &&
                    rdz.integrations.search.targets[domain] &&
                    rdz.integrations.search.targets[domain].indexOf(name) === -1
                ) {
                    rdz.integrations.search.targets[domain].push(name);
                    param.sendMessage({url: url, request: 'PARAMETER_ContentRequest', receiver: 'integration'});
                }
            });
        },

        removeURLView: function (url) {
            var searchContainer = window.rdz.integrations.search.hash[url].searchContainer;
            rdz.$('.rds-bar-search-parameters', searchContainer).remove();
            rdz.$(searchContainer).find('.b-serp-url__item, .serp-url__item, .b-result__url').removeClass('rds-seo-blue');
            rdz.$(searchContainer).removeClass('huckster');
            rdz.$(searchContainer).find('.rds-full-url').remove();
            rdz.$(searchContainer).find('.rds-sa').remove();
        }

    })

};

window.rdz.integrations.search.views = {

    Notification: rdz.Backbone.View.extend({
        tagName: 'div',

        className: 'rds-bar-notification',

        render: function () {
            this.$el.append(this.template());

            return this;
        },

        template: function () {
            var html = rdz.$('<div class="rds-bar-notification-container">' +
            '</div>');


            html.append(new window.rdz.integrations.search.views.NotificationLogo({
                model: new (rdz.Backbone.Model.extend({
                    defaults: {name: 'notification-logo'}
                }))
            }).el);
            html.append(new window.rdz.integrations.search.views.NotificationContent({
                model: new (rdz.Backbone.Model.extend({
                    defaults: {name: 'notification-content', integration: this.model.get('integration')}
                }))
            }).el);
            html.append(new window.rdz.integrations.search.views.NotificationClose({
                model: new (rdz.Backbone.Model.extend({
                    defaults: {name: 'notification-close'}
                }))
            }).el);

            return html;
        }
    }),

    NotificationLogo: window.rdz.view.buttons.Button.extend({
        clicked: function () {
        }
    }),

    NotificationContent: window.rdz.view.buttons.Button.extend({
        events: {
            "click .rds-notification-options": "clicked",
        },
        template: function (model) {
            var html = rdz.$('<div class="rds-prm"></div>');
            html.append('<span>' + rdz.locale.notification[this.model.get('integration')] + '</span>' +
            '<a class="rds-notification-options">' + rdz.locale.notification['options'] + '</a>' +
            '<span>' + rdz.locale.notification['good_day'] + '</span>');

            this.$el.addClass('rds-' + model.get('name'));
            return html;
        },
        clicked: function (e) {
            var hash = this.model.get('integration');
            rdz.cmessenger.post({method: 'message', request: 'OPTION_PAGE_ContentRequest', hash: hash});
        }
    }),

    NotificationClose: window.rdz.view.buttons.Button.extend({
        clicked: function () {
            rdz.$('.rds-bar-notification').remove();
        }
    }),

    Updates: rdz.Backbone.View.extend({
        tagName: 'div',

        className: 'rds-bar-search-updates',

        render: function () {
            this.$el.append(this.template());

            return this;
        },

        template: function () {
            var html = rdz.$('<div class="rds-updates">' +
                '<div class="rds-updates-label">' +
                '<span class="rds-black">RDS</span>' +
                '<span class="rds-orange"> bar</span>' +
                '</div>' +
                '</div>'),
                updateView;

            this.collection.each(function (update) {
                updateView = new window.rdz.integrations.search.views.Update({model: update});
                html.append(updateView.render().el);
            });

            return html;
        }
    }),

    Update: rdz.Backbone.View.extend({
        tagName: 'div',

        className: 'rds-update',

        render: function () {
            this.$el.append(this.template());

            return this;
        },

        template: function () {
            var name = this.model.get('name'),
                updateData = this.getUpdateData(),
                html = rdz.$(`<span class="update-nm">${rdz.locale.updates[name]}</span>:` +
                    `<span class="update-prm">${updateData.stringDate}</span>` +
                    `<span class="update-sup">${updateData.diffDays > 2 ? updateData.diffDays : ""}</span>`);

            return html;
        },

        getUpdateData: function () {
            var value = this.model.get('value'),
                parsedDate = new Date(value),
                now = new Date(),
                neededDate = new Date(parsedDate.getFullYear(), parsedDate.getMonth(), parsedDate.getDate()),
                diffDays = Math.floor((now - neededDate) / 86400000);

            switch (diffDays) {
                case 0:
                    return {stringDate: rdz.locale.today, diffDays: diffDays};
                case 1:
                    return {stringDate: rdz.locale.yesterday, diffDays: diffDays};
                case 2:
                    return {stringDate: rdz.locale.day_before_yesterday, diffDays: diffDays};
                default:
                    return {
                        stringDate: (parsedDate.getDate() < 10 ? ("0" + parsedDate.getDate()) : parsedDate.getDate()) +
                        "-" +
                        (parsedDate.getMonth() + 1 < 10 ? ("0" + (parsedDate.getMonth() + 1)) : parsedDate.getMonth() + 1) +
                        "-" +
                        parsedDate.getFullYear(),
                        diffDays: diffDays
                    };
            }
        }
    }),

    EnableButton: rdz.Backbone.View.extend({
        tagName: 'div',

        className: 'rds-bar-search-enable_button',

        render: function () {
            var data = this.model.get('data');
            this.$el.addClass(data.options.id.toLowerCase());
            if (!data.options.active) this.$el.addClass('disabled');
            return this;
        },

        events: {
            'click': 'click'
        },

        click: function() {
            var data = this.model.get('data');
            rdz.cmessenger.post({
                method: 'message',
                request: 'ENABLE_INTEGRATION_ContentRequest',
                data: data,
                url: window.rdz.url
            });
        }
    }),
    
    RecipientsPositions: rdz.Backbone.View.extend({        
        initialize: function () {
            this.model.on('change:recipients', this.render, this);
        },

        render: function () {
            this.$el.before(this.template());
            return this;
        },

        template: function () {
            var hash = this.model.get('hash'),
                urls = rdz._.keys(hash),
                recipients = this.model.get('recipients'),
                html = "",
                i, len, domain, li, v;
            if (recipients && recipients.length && !this.allWithSameDomain()) {
                html = rdz.$('<ol class="rds-recipients_positions-list"></ol>');
                for (i = 0, len = urls.length; i < len; i += 1) {
                    domain = rdz.utils.domainFromUri(urls[i]).domain;
                    if (recipients.indexOf(domain) !== -1) { // is a recipient
                        li = rdz.$('<li class="rds-recipients_positions-li"></li>');
                        li.val(i + 1).css('list-style-type', 'decimal');
                        a = rdz.$('<a class="rds-recipients_positions-link"></a>');
                        a.html(urls[i]).css({'text-decoration': 'underline', cursor: 'pointer'});
                        a.click(function () {
                                // if we clicked two times on the same link
                                if (rdz.$(this).parent().find('.rds-recipients-snippet').length) {
                                    rdz.$(this).parent().find('.rds-recipients-snippet').remove();
                                } else {
                                    rdz.$('.rds-recipients-snippet').remove();
                                    v = rdz.$(this).parent().val() - 1;
                                    snippet = rdz.$(hash[rdz.$(this).html()]['searchContainer']).clone();
                                    if (snippet.find('.rds_isa_image').length) { // remove SA
                                        snippet.find('.rds_isa_image').parent().remove();
                                    }
                                    snippet.addClass('rds-recipients-snippet')
                                        .insertAfter(this);
                                }
                            });
                        li.append(a);
                        html.append(li);
                    }                    
                }                                
            }          
            return html;
        },
        
        allWithSameDomain: function () {
            var urls = rdz._.keys(this.model.get('hash')),
                all_with_same_domain = false,
                first_domain = rdz.utils.domainFromUri(urls[0]);
            all_with_same_domain = urls.every(function(e, i, arr) {
                return rdz.utils.domainFromUri(e).domain === first_domain;
            });            
            return all_with_same_domain;
        }
    }),

    Competition: rdz.Backbone.View.extend({
        initialize: function () {
            this.model.on('change:value', this.render, this);
        },

        render: function () {
            this.$el.append(this.template());
            return this;
        },

        template: function () {
            var value = this.model.get('value'),
                html = value ? ( rdz.$('<div class="rds-search_competition" title="' +
                    rdz.locale.search.competition.ttl + '"><span style="color:#ed8b26">' +
                    rdz.locale.search.competition.name + '</span> ' +
                    rdz.utils.formatNumber.apply(value, [0, "", "\u2009"]) + ' </div>') ) :
                    "";
            if (this.model.get('integration') === 'google') {
                rdz.$(html[0]).css({'margin-left': '5px', 'margin-top': '-3px'});
            }
            return html;
        }
    }),

    SearchResult: rdz.Backbone.View.extend({
        render: function (url) {
            var that = this,
                hash = window.rdz.integrations.search.hash,
                data = window.rdz.integrations.search.data;

            this.el = hash[url].searchContainer;

            // SA
            if (data.options.functions.SiteAnalysis.active && !rdz.$(this.el).find('.rds-sa').length && hash[url].saContainer) {
                // create the views of the button and the popup
                var sa = new window.rdz.integrations.search.views.SA();
                rdz.$(hash[url].saContainer).prepend(sa.render(url).el);

                // create the content of the popup
                var saPopup = rdz.$(this.el).find('.rds-sa-popup');
                // setTimeout(function() {
                rdz.$(saPopup).prop('contentWindow').postMessage({
                    method: 'createPopup',
                    parameters: data.bar_parameters,
                    url: url,
                    SA: data.options.functions.SiteAnalysis
                }, '*');
                // }, 300);
            }

            if (data.options.functions.FullURL.active) {
                var fullURL = new window.rdz.integrations.search.views.FullURL();
                rdz.$(this.el).append(fullURL.render(url).el);
            }
            var parameters = new window.rdz.integrations.search.views.Parameters();
            rdz.$(this.el).append(parameters.render(url).el);

            return this;
        }
    }),

    SA: rdz.Backbone.View.extend({
        tagName: 'div',

        className: 'rds-sa',

        render: function (url) {
            var saButton = new window.rdz.integrations.search.views.SA_Button();
            var saPopup = new window.rdz.integrations.search.views.SA_Popup();

            rdz.$(this.el).append(saButton.render(url).el)
                .append(saPopup.render(url).el);

            return this;
        }
    }),

    SA_Button: rdz.Backbone.View.extend({
        tagName: 'div',

        className: 'rds-sa-button',

        events: {
            'mouseenter': 'createPopup',
            'click': 'checkSAParameters'
        },

        render: function (url) {
            rdz.$(this.el).data('url', url);
            return this;
        },

        createPopup: function () {
            var url = this.$el.data('url'),
                searchContainer = window.rdz.integrations.search.hash[url].searchContainer,
                saPopup = rdz.$(searchContainer).find('.rds-sa-popup'),
                data = window.rdz.integrations.search.data;

            rdz.$(saPopup).prop('contentWindow').postMessage({
                method: 'createPopup',
                parameters: data.bar_parameters,
                url: url,
                SA: data.options.functions.SiteAnalysis
            }, '*');
        },

        checkSAParameters: function (e) {
            e.preventDefault();

            var url = this.$el.data('url'),
                searchContainer = window.rdz.integrations.search.hash[url].searchContainer,
                saPopup = rdz.$(searchContainer).find('.rds-sa-popup');

            rdz.$(saPopup).prop('contentWindow').postMessage({
                method: 'resetHistoryCounters'
            }, '*');

            rdz.cmessenger.post({
                url: url,
                SA: window.rdz.integrations.search.data.options.functions.SiteAnalysis,
                receiver: 'integration_sa',
                method: 'message',
                request: 'ALL_PARAMETERS_PopupRequest'
            });
        }
    }),

    SA_Popup: rdz.Backbone.View.extend({
        tagName: 'iframe',

        className: 'rds-sa-popup',

        render: function (url) {
            this.$el.attr('src', chrome.extension.getURL("content/integrations/search/popup.html"));

            return this;
        }
    }),

    FullURL: rdz.Backbone.View.extend({
        tagName: 'div',

        className: 'rds-full-url',

        render: function (url) {
            rdz.$(this.el).text(url);
            return this;
        }
    }),

    Parameters: rdz.Backbone.View.extend({
        tagName: 'div',

        className: 'rds-bar-search-parameters',

        render: function (url) {
            rdz.$(this.el).append(window.rdz.integrations.search.views.Factory.createParameters(url));

            return this;
        }
    }),

    Factory: {
        createParameters: function (url) {
            var elements = rdz.$(),
                parameter,
                name;

            //append html
            window.rdz.integrations.search.hash[url].parameters.each(function (value, index) {
                name = value.get('name');
                parameter = rdz.view.parameters.Parameter.extend(window.rdz.integrations.search.views.Parameter);
                if (window.rdz.integrations.search.views[name]) {
                    parameter = parameter.extend(window.rdz.integrations.search.views[name]);
                }
                parameter = new parameter({model: value});

                //here we check if view don't return null from method. Null is no html for parameter
                var html = parameter.render();

                if (html) {
                    rdz.$(html).attr('title', rdz.locale.parameters[name].ttl);
                    elements.push(html);
                }

            });

            return elements;
        }
    },

    Parameter: {
        events: {
            'mouseleave': 'hover',
            'mouseenter': 'hover',
            'click': 'click'
        },
        initialize: function () {
            this.model.on("change:value", this.valueChanged, this);
        },
        template: function (model) {
            var name = model.get('name'),
                html = rdz.$(`<div class="rds-nm">${rdz.locale.parameters[name].name}</div>: <div class="rds-prm"><a target="_blank" class="rds-value">?</a></div>`);

            return html;
        },
        apiError: function (value) {
            var extra = this.model.get('extra'), el;

            //increase performance
            if (extra && typeof extra.api !== 'undefined') {
                //set css
                value = value || this.model.get('value');
                el = this.$el.find(this.api_error_el);
                value === rdz.errors.BUNKRUPT || value === rdz.errors.AUTHOR ?
                    el.addClass('rds-red') :
                    el.removeClass('rds-red');

                if (value === rdz.errors.BUNKRUPT) {
                    el.find('a').attr({
                        href: 'http://www.recipdonor.com/pay/',
                        title: rdz.locale.bar.tooltips.bunkrupt
                    }).text(rdz.locale.bunkrupt);
                } else if (value === rdz.errors.AUTHOR) {
                    el.find('a').attr({
                        href: 'http://www.recipdonor.com/',
                        title: rdz.locale.bar.tooltips.author
                    }).text(rdz.locale.author);
                }
            }
        },
        /*tooltip methods*/
        hover: function (event) {
            return true;
        },
        hover_mouse_move: function (event) {
            window.rdz.app.content.tooltip.open(this.getTooltipData(event), event, '', 'integration');
        },
        getTooltipData: function (event) {
            var name = this.model.get('name'),
                value = this.validateTooltipData();

            //return value === -7 ? rdz.locale.bar.tooltips.author : (rdz.locale.bar.parameters[name] ? rdz.locale.bar.parameters[name].ttl : rdz.locale.parameters[name].ttl);
            return 'Hello World!';
        },
        validateTooltipData: function () {
            return this.model.get('value');
        }
    },

    IYP: {
        formatValue: function (value) {
            var p = this.model.get('value');

            return p === null ? value :
                //had been got link from Yandex and had been parsed Date
                rdz._.isObject(p.IYP) && (p.IYPCache != 0) ? (p.IYPCache > 0 ? rdz.utils.prettyDate(p.IYPCache) : rdz.locale.yes) :

                    //had been got link from Yandex and hadn't been parsed Date
                    rdz._.isObject(p.IYP) && p.IYPCache === 0 ||

                        //had been found only link
                    p.IYP === 1 ? rdz.locale.yes :

                        //hadn't been found results in Yandex
                        p.IYP === 0 ? rdz.locale.no :

                            //if an Error
                            value;

        },
        showResult: function () {
            var p = this.model.get('value');
            this.setHref('.rds-value', /*p && p.IYP && p.IYP.cacheLink || */ this.model.get('requests').IYP.serviceUrl);//in some time cacheLink is not working, redirect to 404
            var value = this.checkError(p && p.IYP || p); //TODO: test Error with  p.IYPCache
            this.$el.find('.rds-value').html(this.formatValue(value));
            this.showCached({name: 'IYP'});
            this.apiError(p && p.IYP);
        }
    },

    IYDP: {
        formatValue: function (value) {
            var data = this.model.get('value');
            return data === null ? '?' : data < 0 ? value : data == 0 ? rdz.locale.no : rdz.utils.prettyDate(new Date(value));
        }
    },

    IG: {
        template: function (model) {
            var name = model.get('name'),
                html = rdz.$(`<div class="rds-nm">${rdz.locale.parameters[name].name + '(' + this.model.get('extra').domain_zone.active + ')'}</div>:` +
                    ` <div class="rds-prm"><a target="_blank" class="rds-value_IG">?</a></div>`);
                    //` <div class="rds-prm"><a target="_blank" class="rds-value_IG">?</a> <span  class="rds-cnt_MIG">(<a target="_blank" class="rds-value_MIG rds-green">?</a>)</span></div>`);

            return html;
        },
        formatValue: function (value, val) {
            return this.model.get('value') === null ? '?' :
                    (this.model.get('value')[val] >= 0 ? rdz.utils.formatNumber.apply(value[val], [0, "", "\u2009"]) : value[val]);
            // return this.model.get('value') === null ? '?' :
            //     val === 'MIG' && value.IG >= 0 && value.MIG >= 0 ?
            //     Math.min(Math.round(value.MIG * 100 / (value.IG !== 0 ? value.IG : 1 )), 100) + '%' :
            //         (this.model.get('value')[val] >= 0 ? rdz.utils.formatNumber.apply(value[val], [0, "", "\u2009"]) : value[val]);
        },
        showResult: function () {
            //this.setHref('.rds-value_IG', this.model.get('requests').IG.serviceUrl);
            //this.setHref('.rds-value_MIG', this.model.get('requests').MIG && this.model.get('requests').MIG.serviceUrl);
            this.setHref('.rds-value_IG', this.model.get('requests').serviceUrl);

            var value = this.model.get('value');
            //var value_IG = this.checkError(value ? value.IG : value);
            var value_IG = this.checkError(value);
            this.$el.find('.rds-value_IG').html(this.formatValue({IG: value_IG}, 'IG'));

            // if (value !== null) {
            //     var value_MIG = this.checkError(value ? value.MIG : value);
            //     this.$el.find('.rds-cnt_MIG').css({display: 'inline-block'});
            //     this.$el.find('.rds-value_MIG').html(this.formatValue({IG: value_IG, MIG: value_MIG}, 'MIG'))
            //         .attr('title', rdz.locale.parameters['MIG'].ttl);
            // }
            // else {
            //     this.$el.find('.rds-cnt_MIG').hide();
            // }

            //hide MIG if API is on
            // var extra = this.model.get('extra');
            // if (extra.api.active) {
            //     this.$el.find('.rds-cnt_MIG').hide();
            // }

            this.showCached({name: 'IG'});
            //this.apiError(value && value.IG);
            this.apiError(value);
        }
    },

    IGP: {
        formatValue: function (value) {
            var p = this.model.get('value');
            if (p === null) return value;

            return p.IGP === 0 ? rdz.locale.no :
                rdz._.isObject(p.IGP) || p.IGP > 0 ? (p.IGPCache > 0 ? rdz.utils.prettyDate(p.IGPCache) : rdz.locale.yes) :
                    value;
        },
        showResult: function () {
            var p = this.model.get('value');
            this.setHref('.rds-value', this.model.get('requests').IGP.serviceUrl);
            var value = this.checkError(p && p.IGP || p);
            this.$el.find('.rds-value').html(this.formatValue(value));
            this.showCached({name: 'IGP'});
            this.apiError(p && p.IGP);
        }
    },

    TYC: {
        template: function (model) {
            return rdz.$(`<div class="rds-nm">${rdz.locale.bar.contextmenu.TYC.TYC.name}</div>: ` +
                `<div class="rds-prm"><a target="_blank" class="rds-value_TYC">?</a></div>`);
        },
        formatValue: function (a) {
            var p = this.model.get('value');
            var value = p && p.TYC ? (a.model || p.TYC)[a.val] : p;
            return value === null ? a.value : rdz._.isNumber(value) && value >= 0 ? rdz.utils.formatNumber.apply(a.value, [0, "", "\u2009"]) :
                value === false ? 0 : a.value;
        },
        showResult: function () {
            this.setHref('.rds-value_TYC', this.model.get('requests').TYC.serviceUrl);

            var value = this.model.get('value');
            var value_TYC = this.checkError(value && value.TYC ? value.TYC.TYC : value);
            this.$el.find('.rds-value_TYC').html(this.formatValue({value: value_TYC, val: 'TYC'}));

            this.showYaCatalog();
            this.showCached();
        },
        showYaCatalog: function () {
            var value = this.model.get('value'),
                url = this.model.get('url'),
                YaCatalog = window.rdz.integrations.search.hash[url].parameters.get('YaCatalog');

            if (value && value.TYC && value.TYC.YaCatalog) {
                this.$el.find('.rds-prm').addClass('rds-bold');
            } else {
                this.$el.find('.rds-prm').removeClass('rds-bold');
            }

            if (YaCatalog) {
                value = this.model.get('value').TYC;
                YaCatalog.set({
                    value: value === null ? null : value.YaCatalog,
                    requests: this.model.get('requests').TYC
                });
                YaCatalog.trigger("change:value");
            }
        },
        isCached: function (a) {
            var requests = this.model.get('requests'),
                value = this.model.get('value');

            return this.model.get('options').italic && value !== null && value.TYC &&
                (rdz._.isNumber(value.TYC.TYC) || value.TYC.TYC === false) && requests['TYC'] && requests['TYC'].cached;
        }
    },

    YaCatalog: {
        formatValue: function (value) {
            return this.model.get('value') === false ? rdz.locale.no : value;
        }
    },

    YaBar: {
        formatValue: function (a) {
            var value = this.model.get('value');

            return value === null ? value : rdz._.isNumber(a.value) && a.value >= 0 ? rdz.utils.formatNumber.apply(a.value, [0, "", "\u2009"]) :
                a.value.TYC === 0 ? a.value.TYC : a.value;
        },
        showResult: function () {
            this.setHref('.rds-value', this.model.get('requests').serviceUrl);

            var value = this.model.get('value');
            var value_TYC = this.checkError(value && value.TYC ? value.TYC : value);
            this.$el.find('.rds-value').html(this.formatValue({value: value_TYC, val: 'TYC'}));

            this.showYT(value);
            this.showYR(value);
            this.showCached();
        },
        showYT: function (value) {
            var url = this.model.get('url'),
                YT = window.rdz.integrations.search.hash[url].parameters.get('YT');
            if (YT) {
                value = this.model.get('value');
                YT.set({
                    value: value === null ? null : value.topic,
                    requests: this.model.get('requests')
                });
                YT.trigger("change:value");
            }
        },
        showYR: function (value) {
            var url = this.model.get('url'),
                YR = window.rdz.integrations.search.hash[url].parameters.get('YR');
            if (YR) {
                value = this.model.get('value');
                YR.set({
                    value: value === null ? null : value.region,
                    requests: this.model.get('requests')
                });
                YR.trigger("change:value");
            }
        },
        isCached: function (a) {
            var requests = this.model.get('requests'),
                value = this.model.get('value');

            return this.model.get('options').italic && value !== null && rdz._.isNumber(value.TYC) && requests.cached;
        }
    },

    PR: {
        template: function (model) {
            var name = model.get('name'),
                html = rdz.$(`<div class="rds-nm">${this.model.get('name')}</div>: ` + 
                '<div class="rds-prm"><a target="_blank" class="rds-value_PR">?</a> <span class="cnt_value_PRMain">(<a target="_blank" class="rds-value_PRMain">?</a>)</span></div>');

            return html;
        },
        formatValue: function (value) {

            var p = this.model.get('value');
            var v = {};
            v.PR = p === null ? value.PR : rdz._.isString(p.PRg) || p.PRg === true ? rdz.locale.glued : //p.PRg === true - from api? value without domain string
                /*rdz._.isNumber(p.PRg) && p.PRg < -1 ? value.PRg : */value.PR;

            //show only if not on main page
            if (value.PRMain !== undefined) {
                v.PRMain = p === null ? value.PRMain : rdz._.isString(p.PRgMain) || p.PRgMain === true ? rdz.locale.glued :
                    /*rdz._.isNumber(p.PRgMain) && p.PRgMain < -1 ? value.PRgMain : */ value.PRMain;
            }

            return v;

        },
        showResult: function () {

            var p = this.model.get('value');
            this.setHref('.rds-value_PR', this.model.get('requests').PRg && this.model.get('requests').PRg.serviceUrl || this.model.get('requests').PR.serviceUrl);

            var value = {
                PR: this.checkError(p ? p.PR : p),
                PRg: this.checkError(p ? p.PRg : p),
                PRMain: this.checkError(p ? p.PRMain : p),
                PRgMain: this.checkError(p ? p.PRgMain : p)
            };

            var formated = this.formatValue(value);

            this.$el.find('.rds-value_PR').html(formated.PR);

            //highlight RED
            if (p !== null && p.PRg && p.PRg === rdz.errors.CAPTCHA) this.$el.find('.rds-value_PR').addClass('rds-red');
            else this.$el.find('.rds-value_PR').removeClass('rds-red');
            this.apiError(p && p.PRg);


            //show only if not on main page
            if (value.PRMain !== undefined) {
                this.setHref('.rds-value_PRMain', this.model.get('requests').PRgMain && this.model.get('requests').PRgMain.serviceUrl || this.model.get('requests').PRMain && this.model.get('requests').PRMain.serviceUrl || null);
                this.$el.find('.cnt_value_PRMain').css({display: p === null ? 'none' : 'inline-block'})
                    .find('.rds-value_PRMain').html(formated.PRMain).attr('title', rdz.locale.parameters['PR']['PRMain']);

                //highlight RED
                if (p !== null && p.PRgMain && p.PRgMain === rdz.errors.CAPTCHA) this.$el.find('.rds-value_PRMain').addClass('rds-red');
                else this.$el.find('.rds-value_PRMain').removeClass('rds-red');
            } else {
                this.$el.find('.cnt_value_PRMain').css({'display': 'none'});
            }

            this.showCached({name: 'PR', class: 'rds-italic_PR'});
            this.showCached({name: 'PRMain', class: 'rds-italic_PRMain'});

            if (typeof this.title === 'function') {
                this.title(['PR', 'PRg']);
                this.title(['PRMain', 'PRgMain']);
            }


            this.showDmoz();
        },
        showDmoz: function () {
            if (this.model.get('Dmoz')) {
                if (this.model.get('value') === null) {
                    this.$el.find('.rds-prm').removeClass('rds-bold');
                } else {
                    this.$el.find('.rds-prm').addClass('rds-bold');
                }

            }
        }
    },

    Dmoz: {
        formatValue: function (value) {
            return this.model.get('value') === null ? value : this.model.get('value') === false ? rdz.locale.no : value;
        },
        showResult: function () {
            this.callParentMethod({method: 'showResult', object: this});
            this.showPR();
        },
        showPR: function () {
            var url = this.model.get('url');
            var PR = window.rdz.integrations.search.hash[url].parameters.get('PR');
            if (PR) {
                PR.set({Dmoz: this.model.get('value')}, {silent: true});

                //if PR displayed value before
                if (PR.get('value') !== null) {
                    PR.trigger('change:value');
                }
            }
        }
    },

    WA: {
        formatValue: function (value) {
            var v = this.model.get('value');
            return v > 0 ? window.rdz.utils.prettyDate(value, {
                withoutDays: true,
                year: true
            }) : v === rdz.errors.PARSE ? '?' : (v === 0 ? rdz.locale.no : value);
        }
    },

    MozRank: {
        formatValue: function (value, val) {
            var data = this.model.get('value');
            return data > 0 ? value[val] : value;
        },
        showResult: function () {
            this.setHref('.rds-value', this.model.get('requests').MozRank.displayUrl);
            var value = this.model.get('value');
            var value_linkp = this.checkError(value ? value.MozRankCache.linkp : value);
            this.$el.find('.rds-value').html(this.formatValue(value_linkp, 'p'));
            this.showCached({name: 'MozRankCache'});
        }
    },

    SeoM: {
        template: function (model) {
            var name = model.get('name'),
                html = rdz.$(`<div class="rds-nm">${rdz.locale.parameters[name].name}</div>: ` +
                    '<div class="rds-prm"><div class="rds-rate"><ins></ins></div><a target="_blank" class="rds-value_in">?</a> <span class="rdz-cnt_value">(<a target="_blank" class="rds-value_out">?</a>)</span></div></div>');

            return html;
        },
        formatValue: function (value, val) {
            var data = this.model.get('value');
            return data > 0 ? value[val] : value;
        },
        showResult: function () {
            this.setHref('.rds-value_in', this.model.get('requests').displayUrl);
            this.setHref('.rds-value_out', this.model.get('requests').displayUrl);
            var value = this.model.get('value');
            var value_page = this.checkError(value);
            if (value_page) {
                value_page = this.checkError(value ? value.page : value);
                this.$el.find('.rds-value_in').html(this.formatValue(value_page, 'p'));
                if (value !== null) {
                    var value_domain = this.checkError(value ? value.domain : value);
                    this.$el.find('.rds-value_out').html(this.formatValue(value_domain, 'd'));
                    this.$el.find('.rdz-cnt_value').css({display: 'inline-block'});
                } else {
                    this.$el.find('.rdz-cnt_value').hide();
                }
            } else {
                this.$el.find('.rds-value_in').html(this.formatValue(value_page, 'p'));
            }


            this.showCached();
        }
    },

    Age: {
        formatValue: function (value) {
            var data = this.model.get('value');
            return data === null || data < 0 ? value : data === 0 ? rdz.locale.unknown : rdz.utils.prettyDate(new Date(value), {
                withoutDays: true,
                year: true
            });
        }
    },

    AhrefsPage: {
        template: function (model) {
            var name = model.get('name'),
                html = rdz.$(`<div class="rds-nm">${rdz.locale.parameters[name].name}</div>` +
                '<div class="rds-prm">' +
                '<span>AR:</span><a target="_blank" class="rds-value_ar">?</a> ' +
                '<span>BL:</span><a target="_blank" class="rds-value_bl">?</a> ' +
                '<span>RD:</span><a target="_blank" class="rds-value_rd rds-green">?</a> ' +
                '</div>');

            return html;
        },
        formatValue: function (value) {
            var val = this.model.get('value');
            return val === null ? '?' : value >= 0 ? rdz.utils.formatNumber.apply(value, [0, "", "\u2009"]) : value;
        },
        showResult: function () {
            var requests = this.model.get('requests');

            this.setHref('.rds-value_ar', requests.AhrefsPage.displayUrl);
            this.setHref('.rds-value_bl', requests.AhrefsPage.displayUrl);
            this.setHref('.rds-value_rd', requests.AhrefsPage.displayUrl);

            var v = this.model.get('value');
            v = v && v.AhrefsPage ? v.AhrefsPage : v;

            var value_ar = this.checkError(v && isFinite(v.ar) ? v.ar : v),
                value_bl = this.checkError(v && isFinite(v.bl) ? v.bl : v),
                value_rd = this.checkError(v && isFinite(v.rd) ? v.rd : v);

            this.$el.find('.rds-value_ar').html(this.formatValue(value_ar));
            this.$el.find('.rds-value_bl').html(this.formatValue(value_bl));
            this.$el.find('.rds-value_rd').html(this.formatValue(value_rd));

            this.showCached({name: 'AhrefsPage', 'class': 'rds-italic_Ahrefs'});
        }
    },

    AhrefsDomain: {
        template: function (model) {
            var name = model.get('name'),
                html = rdz.$(`<div class="rds-nm">${rdz.locale.parameters[name].name}</div>` +
                '<div class="rds-prm">' +
                '<span>AR:</span><a target="_blank" class="rds-value_dr">?</a> ' +
                '<span>BL:</span><a target="_blank" class="rds-value_bl">?</a> ' +
                '<span>RD:</span><a target="_blank" class="rds-value_rd rds-green">?</a> ' +
                '</div>');

            return html;
        },
        formatValue: function (value) {
            var val = this.model.get('value');
            return val === null ? '?' : value >= 0 ? rdz.utils.formatNumber.apply(value, [0, "", "\u2009"]) : value;
        },
        showResult: function () {
            var requests = this.model.get('requests');

            this.setHref('.rds-value_dr', requests.AhrefsDomain.displayUrl);
            this.setHref('.rds-value_bl', requests.AhrefsDomain.displayUrl);
            this.setHref('.rds-value_rd', requests.AhrefsDomain.displayUrl);

            var v = this.model.get('value');
            v = v && v.AhrefsDomain ? v.AhrefsDomain : v;

            var value_dr = this.checkError(v && isFinite(v.dr) ? v.dr : v),
                value_bl = this.checkError(v && isFinite(v.bl) ? v.bl : v),
                value_rd = this.checkError(v && isFinite(v.rd) ? v.rd : v);

            this.$el.find('.rds-value_dr').html(this.formatValue(value_dr));
            this.$el.find('.rds-value_bl').html(this.formatValue(value_bl));
            this.$el.find('.rds-value_rd').html(this.formatValue(value_rd));

            this.showCached({name: 'AhrefsDomain', 'class': 'rds-italic_Ahrefs'});
        }
    },

    YT: {
        formatValue: function (value) {
            return this.model.get('value') === false ? rdz.locale.no : value;
        }
    },

    YR: {
        formatValue: function (value) {
            return this.model.get('value') === false ? rdz.locale.no : value;
        }
    },

    Alexa: {
        //formatValue: function(value) {
        //    var v = this.model.get('value');
        //    return v === null ? value : v.value === false ? rdz.locale.no : v.value > -1 ? rdz.utils.formatNumber.apply(v.value, [0, "", "\u2009"]) : v.value === -1 ? rdz.locale.glued : value.value;
        //}
        template: function (model) {
            var name = model.get('name'),
                html = rdz.$(`<div class="rds-nm">${rdz.locale.parameters[name].name}</div>: <div class="rds-prm"><a target="_blank" class="rds-value_popularity">?</a> ` +
                    '<span class="cnt_value_regional">(<a target="_blank" class="rds-value_regional">?</a>)</span></div>');

            return html;
        },
        formatValue: function (value) {
            var v = this.model.get('value');
            return v === null ? value : value === 0 ? rdz.locale.no : v.value > -1 ? rdz.utils.formatNumber.apply(value, [0, "", "\u2009"]) : value === -1 ? rdz.locale.glued : value;
        },
        showResult: function () {
            this.setHref('.rds-value_popularity');
            this.setHref('.rds-value_regional');

            var value = this.model.get('value'),
                value_popularity = this.checkError(value ? value.popularity : value),
                value_regional = value && value.rank || null,
                value_flag = value && value.code || null;

            this.$el.find('.rds-value_popularity').html(this.formatValue(value_popularity));
            if (this.model.get('extra').RegionalRank.active && value && value_regional) {
                this.$el.find('.cnt_value_regional').css({display: 'inline-block'}).find('.rds-value_regional').html(this.formatValue(value_regional));
                if (value_flag) {
                    var imgURL = chrome.extension.getURL('icons/flags/' + value_flag + '.png');
                    this.$el.find('.rds-value_regional').prepend('<img src="' + imgURL + '"></img> ');
                }
            } else {
                this.$el.find('.cnt_value_regional').css({display: 'none'});
            }

            this.showCached();
        }
    },

    Pictures: {
        template: function (model) {
            var name = model.get('name'),
                html = rdz.$(`<div class="rds-nm">${rdz.locale.parameters[name].name}</div>:` +
                '<div class="rds-prm">' +
                '<span class="rds-blue">G:</span><a target="_blank" class="rds-value_Go">?</a> ' +
                '<span class="rdz-cnt_value"><span class="rds-red">Я:</span><a target="_blank" class="rds-value_Ya">?</a></span> ' +
                '<!--span class="rds-green">A:</span><a target="_blank" class="rds-value_Ao">?</a-->' +
                '</div>' +
                '<div class="rds-rate"><ins></ins></div>');

            return html;
        },
        formatValue: function (value) {
            var val = this.model.get('value');
            return val === null ? '?' : value >= 0 ? rdz.utils.formatNumber.apply(value, [0, "", "\u2009"]) : value;
        },
        showResult: function () {
            this.setHref('.rds-value_Go', this.model.get('requests')['Pictures'].serviceUrl);

            //show PicturesYa if not "en" locale
            if (this.model.get('requests')['PicturesYa']) {
                this.setHref('.rds-value_Ya', this.model.get('requests')['PicturesYa'].serviceUrl);
                this.$el.find('.rdz-cnt_value').css({'display': 'inline-block'});
            }

            var v = this.model.get('value');

            var value_Go = this.checkError(v ? v.Pictures : v),
                value_Ya = this.checkError(v && rdz._.isNumber(v.PicturesYa) ? v.PicturesYa : v);

            this.$el.find('.rds-value_Go').html(this.formatValue(value_Go));
            this.$el.find('.rds-value_Ya').html(this.formatValue(value_Ya));

            this.showCached({name: 'Pictures'});
        }
    },

    Aggregators: {
        template: function (model) {
            var name = model.get('name'),
                html = rdz.$(`<div class="rds-nm">${rdz.locale.parameters[name].name}</div>:` +
                '<div class="rds-prm">' +
                '<a target="_blank" class="rds-value">?</a>' +
                '<a target="_blank" class="rds-value_Ya rds-red">Я </a>' +
                '<a target="_blank" class="rds-value_Go rds-blue">G </a>' +
                '<a target="_blank" class="rds-value_Bi rds-black">G </a>' +
                '<a target="_blank" class="rds-value_No rds-green">N </a>' +
                '</div>' +
                '<div class="rds-rate"><ins></ins></div>');

            html.find('.rds-value_Ya, .rds-value_Go, .rds-value_No').css({'display': 'none'});

            return html;
        },
        formatValue: function (value, letter) {
            return value && value.value === 1 ? letter : value;
        },
        showResult: function () {
            this.setHref('.rds-value_Ya', this.model.get('requests')['AggregatorsYandex'].serviceUrl);
            this.setHref('.rds-value_Go', this.model.get('requests')['AggregatorsGoogle'].serviceUrl);
            this.setHref('.rds-value_Bi', this.model.get('requests')['AggregatorsBing'].serviceUrl);
            //this.setHref('.rds-value_No', this.model.get('requests')['AggregatorsNovoteka'].serviceUrl);

            var v = this.model.get('value'),
                value_Ya = this.checkError(v ? v.AggregatorsYandex : v),
                value_Go = this.checkError(v ? v.AggregatorsGoogle : v),
                value_Bi = this.checkError(v ? v.AggregatorsBing : v);
                //value_No = this.checkError(v ? v.AggregatorsNovoteka : v);

            this.$el.find('.rds-value_Ya').html(this.formatValue(value_Ya, 'Я') + ' ')
                .css({'display': value_Ya.value > 0 || value_Ya === 'captcha' ? 'inline' : 'none'});
            this.$el.find('.rds-value_Go').html(this.formatValue(value_Go, 'G') + ' ')
                .css({'display': value_Go.value > 0 || value_Go === 'captcha' ? 'inline' : 'none'});
            this.$el.find('.rds-value_Bi').html(this.formatValue(value_Bi, 'B') + ' ')
                .css({'display': value_Bi.value > 0 || value_Bi === 'captcha' ? 'inline' : 'none'});
            // this.$el.find('.rds-value_No').html(this.formatValue(value_No, 'N') + ' ')
            //     .css({'display': value_No.value > 0 || value_No === 'captcha' ? 'inline' : 'none'});

            this.$el.find('.rds-value').html(value_Ya.value === 0 && value_Go.value === 0/* && value_No.value === 0*/ ? '\u2014' : '?')
                .css({
                    'display': value_Ya.value > 0 || value_Ya === 'captcha' ||
                    value_Go.value > 0 || value_Go === 'captcha' ||
                    //value_No.value > 0 || value_No === 'captcha' ||
                    (value_Ya === 0 && value_Go === 0/* && value_No === 0*/) ?
                        'none' : 'inline'
                });

            //this.showCached({name: 'AggregatorsNovoteka'});
        }
    },

    SocialNetworks: {
        className: 'rds-cnt rds-icons',
        template: function (model) {
            var name = model.get('name'),
                html = rdz.$(`<div class="rds-nm">${rdz.locale.parameters[name].name}</div>:` +
                '<div class="rds-prm"><div class="SocialNetworks">' +
                //'<div class="rds-network-GooglePlus"><a target="_blank" class="rds-network-icon"></a> <span class="rds-network-value">?</span></div>' +
                '<div class="rds-network-Facebook"><a target="_blank" class="rds-network-icon"></a> <span class="rds-network-value">?</span></div>' +
                //'<div class="rds-network-Twitter"><a target="_blank" class="rds-network-icon"></a> <span class="rds-network-value">?</span></div>' +
                '<div class="rds-network-VK"><a target="_blank" class="rds-network-icon"></a> <span class="rds-network-value">?</span></div>' +
                '</div></div>');

            return html;
        },
        formatValue: function (value) {
            var v = this.model.get('value');
            return v === null ? value : (typeof value === 'number' ? rdz.utils.formatNumber.apply(value, [0, "", "\u2009"]) : value);
        },
        showResult: function () {
            var v = this.model.get('value'),
                extra = this.model.get('extra'),
                values = {
                    value_GooglePlus: this.checkError(v ? v.GooglePlus : v),
                    value_GooglePlusMain: this.checkError(v ? v.GooglePlusMain : v),
                    value_Facebook: this.checkError(v ? v.Facebook : v),
                    value_FacebookMain: this.checkError(v ? v.FacebookMain : v),
                    value_Twitter: this.checkError(v ? v.Twitter : v),
                    value_TwitterMain: this.checkError(v ? v.TwitterMain : v),
                    value_VK: this.checkError(v ? v.VK : v),
                    value_VKMain: this.checkError(v ? v.VKMain : v)
                },
                network,
                requests = this.model.get('requests'),
                request;

            if (v && typeof v.Twitter === 'number' && typeof v.Twitter2 === 'number') {
                values.value_Twitter = v.Twitter + v.Twitter2;
            }
            if (v && typeof v.TwitterMain === 'number' && typeof v.TwitterMain2 === 'number') {
                values.value_TwitterMain = v.TwitterMain + v.TwitterMain2;
            }

            if (v && typeof v.VK === 'number' && typeof v.VK2 === 'number' &&
                typeof v.VK3 === 'number' && typeof v.VK4 === 'number') {
                values.value_VK = v.VK + v.VK2 + v.VK3 + v.VK4;
            }

            if (v && typeof v.VKMain === 'number' && typeof v.VKMain2 === 'number' &&
                typeof v.VKMain3 === 'number' && typeof v.VKMain4 === 'number') {
                values.value_VKMain = v.VKMain + v.VKMain2 + v.VKMain3 + v.VKMain4;
            }

            // this.setHref('.rds-value');

            for (network in extra) {
                this.$el.find('.rds-network-' + network).css('display', extra[network].active ? 'inline' : 'none')
                    .attr('title', rdz.locale.bar.tooltips.SocialNetworks[network]);

                this.$el.find('.rds-network-' + network + ' .rds-network-value').html(
                    v && requests && requests[network] && requests[network + 'Main'] &&
                    (requests[network].serviceUrl !== requests[network + 'Main'].serviceUrl)
                    && (typeof v[network + 'Main'] === 'number') ?
                    this.formatValue(values['value_' + network]) + ' (' + this.formatValue(values['value_' + network + 'Main']) + ')' : this.formatValue(values['value_' + network])
                );
            }

            for (request in requests) {
                this.showCached({name: request, class: 'rds-italic_' + request});
            }
        }
    },

    ISolomono: {
        formatValue: function (value, val) {
            var p = this.model.get('value');
            return p === null ? value : p[val] >= 0 ? rdz.utils.formatNumber.apply(value, [0, "", "\u2009"]) : value;
        },
        showResult: function () {
            this.setHref('.rds-value', this.model.get('requests').displayUrl.index);

            var value = this.model.get('value');
            var value_index = this.checkError(value ? value.index : value);
            this.$el.find('.rds-value').html(this.formatValue(value_index, 'index'));
            this.showCached();
        }
    },

    Solomono: {
        template: function (model) {
            var name = model.get('name'),
                html = rdz.$(`<div class="rds-nm">${rdz.locale.parameters[name].name}</div>: ` +
            '   <div class="rds-prm"><a target="_blank" class="rds-value_in rds-green">?</a>/<a target="_blank" class="rds-value_out rds-red">?</a></div></div>');

            return html;
        },
        formatValue: function (value, val) {
            var p = this.model.get('value');
            return p === null ? value : p[val] >= 0 ? rdz.utils.formatNumber.apply(value, [0, "", "\u2009"]) : value;
        },
        showResult: function () {
            this.setHref('.rds-value_in', this.model.get('requests').displayUrl.in);
            this.setHref('.rds-value_out', this.model.get('requests').displayUrl.out);

            var value = this.model.get('value');
            var value_in = this.checkError(value ? value.in : value),
                value_out = this.checkError(value ? value.out : value);
            this.$el.find('.rds-value_in').html(this.formatValue(value_in, 'in'));
            this.$el.find('.rds-value_out').html(this.formatValue(value_out, 'out'));
            this.showCached();
        }
    },

    StatHistory: {
        formatValue: function (value) {
            var v = this.model.get('value');
            return v === null ? rdz.locale.parameters.StatHistory.value : v === rdz.errors.RECEIVING ? '...' : v === rdz.errors.HARDSITE ? '\u2014' : rdz._.isArray(v) ?
                rdz.utils.formatNumber.apply(v[v.length - 1].Value, [0, "", "\u2009"]) : value;
        }
    },

    APICounters: {
        template: function (model) {
            var name = model.get('name'),
                html = rdz.$(`<div class="rds-nm">${rdz.locale.parameters[name].name}</div>:` +
                    ' <div class="rds-prm"><a target="_blank" class="rds-value">?</a><a target="_blank" class="counters-icon"></a></div>');

            rdz.$(html).find('.rds-value').addClass(name);
            return html;
        },
        formatValue: function (value) {
            var val = this.model.get('value'),
                v = val && val.APICounters || val;
            return v === null || (v < 0 && v > -666) ? value :
                typeof value === 'number' ?
                    (value === -666 ? rdz.locale.glued : value === 0 ? '' : rdz.utils.formatNumber.apply(value, [0, "", "\u2009"])) :
                    v.length === 0 ? '' :
                        value;
        },
        showResult: function () {
            var val = this.model.get('value'),
                v = val && val.APICounters || val,
                sortedCounters = [],
                value;

            this.$el.removeAttr('title');
            this.$el.find('.counters-icon').removeClass('yes no none');

            if (v && v.length) {
                sortedCounters = v.sort(function (a, b) {
                    return b.Value - a.Value;
                });
                value = this.formatValue(sortedCounters[0].Value);
                this.$el.find('.counters-icon').addClass('yes');
            } else if (v && v.length === 0) {
                value = this.formatValue(v);
                this.$el.find('.counters-icon').addClass('no');
            } else {
                value = this.formatValue(this.checkError(v));
            }

            this.$el.find('.rds-value').html(value);
        },
        hover: function (event) {
            switch (event.type) {
                case "mouseenter":
                    this.hover_mouse_move(event);
                    break;
                case "mouseleave":
                    window.rdz.app.content.tooltip.close();
                    break;
            }
        },
        getTooltipData: function () {
            var val = this.model.get('value'),
                value = val && val.APICounters || val,
                name = this.model.get("name"),
                itemDiv,
                itemLink,
                itemValue,
                itemName,
                data;

            value = value && value.APICounters || value;

            if (value && value.length > 0) {
                data = rdz.$('<div/>');
                value.forEach(function (c) {
                    itemDiv = rdz.$('<div/>', {class: 'counters-item'});
                    itemValue = rdz.$('<a/>', {
                        class: 'counters-value rds-bold' + (c.Access === 2 ? ' rds-red' : ''),
                        text: c.Value === -666 ? rdz.locale.glued : c.Value === 0 ? '' : rdz.utils.formatNumber.apply(c.Value, [0, "", "\u2009"])
                    });
                    itemName = rdz.$('<a/>', {
                        class: 'counters-name',
                        html: rdz.locale.bar.contextmenu.Counters[rdz.utils.RDSBarCountersNames[c.CounterType]].name
                    });
                    itemLink = rdz.$('<a/>', {class: 'counters-link'}).append(itemValue).append(itemName);
                    itemDiv.append(itemLink);
                    data.append(itemDiv);
                });
            } else {
                data = rdz.locale.bar.parameters[name] ? rdz.locale.bar.parameters[name].ttl : rdz.locale.parameters[name].ttl;
            }

            return data;
        }
    },

    Seo: {
        formatValue: function (value) {
            var v = this.model.get('value');

            return v === null ? 'unchecked' :
                v < 0 ? (v === rdz.errors.BUNKRUPT ? 'bunkrupt' : 'auth') : v;
        },
        showResult: function () {
            var value = this.checkError(this.model.get('value')),
                formatedValue = this.formatValue(value),
                url = this.model.get('url'),
                searchContainer = window.rdz.integrations.search.hash[url].searchContainer,
                name,
                markets = [],
                html = '';

            if (formatedValue === "bunkrupt") {
                html = rdz.$('<a/>', {
                    class: 'seo-bunkrupt',
                    title: rdz.locale.bar.contextmenu.no_money,
                    target: '_blank'
                })[0].outerHTML;
            } else if (formatedValue === "auth") {
                html = rdz.locale.author;
            } else {
                for (name in window.rdz.utils.Seo_NumberByName) {
                    if (formatedValue[name] === 'yes') {
                        markets.push(name);
                    }
                }
                if (markets.length > 0) {
                    markets.forEach(function (name) {
                        html += rdz.$('<a/>', {class: name + ' yes', title: name})[0].outerHTML;
                    });

                    rdz.$(searchContainer).find('.b-serp-url__item, .serp-url__item, .b-result__url').addClass('rds-seo-blue');
                } else {
                    html = rdz.locale.no;
                }
            }

            this.$el.find('.rds-value').html(html).addClass('seo-markets');

            this.showCached();
            this.apiError();
        }
    },

    LinksBuy: {
        template: function (model) {
            if (rdz.$('.b-serp-item__favicon').length ||
                rdz.$('.favicons__icon-image').length) {
                return null;
            } else {
                var name = model.get('name'),
                    html = rdz.$(`<div class="rds-nm">${rdz.locale.parameters[name].name}</div>: <div class="rds-prm"><a target="_blank" class="rds-value">?</a></div>`);

                return html;
            }
        },
        formatFaviconValue: function (value) {
            var v = this.model.get('value');
            return v === null ? 'no' :
                v < 0 ? (v === rdz.errors.BUNKRUPT ? 'bunkrupt' : 'auth') :
                    v > 3 ? 'yes' : 'no';
        },
        formatValue: function (value) {
            var v = this.model.get('value');
            return v === null ? value : rdz._.isNumber(v) ? v > 3 ? rdz.locale.yes : rdz.locale.no : value;
        },
        showResult: function () {
            var url = this.model.get('url'),
                searchContainer = window.rdz.integrations.search.hash[url].searchContainer;
            // add to the favicon
            if (rdz.$(searchContainer).find('.b-serp-item__favicon').length ||
                rdz.$(searchContainer).find('.favicons__icon-image').length) {
                if (this.formatFaviconValue() === 'yes') {
                    rdz.$(searchContainer).addClass('huckster');
                }
            } else {
                this.setHref('.rds-value');
                var value = this.checkError(this.model.get('value'));
                this.$el.find('.rds-value').html(this.formatValue(value));
                this.showCached();
                this.apiError();
            }
        }
    },

    Nesting: {
        formatValue: function (value) {
            var v = this.model.get('value');
            return v === null ? value : (v.value === 1 || v.value === 2 ? v.value : v.value === 3 ? '3+' : value );
        }
    },

    IPSitesCount: {
        template: function (model) {
            var name = model.get('name'),
                html = rdz.$(`<div class="rds-nm"></div><div class="rds-prm">${rdz.locale.parameters[name].name}:` +
                '<span  class="rds-cnt_SC_Bing">B:<a target="_blank" class="rds-value_SC_Bing">?</a></span>' +
                ' <span  class="rds-cnt_SC_Solomono">L:<a target="_blank" class="rds-value_SC_Solomono">?</a></span>' +
                ' <span  class="rds-cnt_SC_RDS">R:<a target="_blank" class="rds-value_SC_RDS">?</a></span>' +
                '</div>');

            this.el.setAttribute('title', rdz.locale.parameters[name].ttl);
            return html;
        },
        formatValue: function (value) {
            var v = this.model.get('value');
            return v === null ? value : rdz._.isNumber(value) && value >= 0 ? rdz.utils.formatNumber.apply(value, [0, "", "\u2009"]) : value;
        },
        showResult: function () {
            var v = this.model.get('value');
            var requests = this.model.get('requests');

            // Bing
            var value_B = this.checkError(v ? v.IPSitesCountBing : v);
            this.$el.find('.rds-value_SC_Bing').html(this.formatValue(value_B));
            if (this.model.get('requests')['IPSitesCountBing']) {
                this.setHref('.rds-value_SC_Bing', this.model.get('requests')['IPSitesCountBing'].serviceUrl);
            }
            // Solomono
            var value_S = this.checkError(v ? v.IPSitesCountSolomono : v);
            this.$el.find('.rds-value_SC_Solomono').html(this.formatValue(value_S));
            if (this.model.get('requests')['IPSitesCountSolomono']) {
                this.setHref('.rds-value_SC_Solomono', this.model.get('requests')['IPSitesCountSolomono'].displayUrl);
            }
            // RDS
            var value_R = this.checkError(v ? v.IPSitesCountRDS : v);
            this.$el.find('.rds-value_SC_RDS').html(this.formatValue(value_R));
            if (this.model.get('requests')['IPSitesCountRDS']) {
                this.setHref('.rds-value_SC_RDS', this.model.get('requests')['IPSitesCountRDS'].displayUrl);
            }

            for (let request in requests) {
                this.showCached({name: request, class: 'rds-italic_' + request});
            }
            this.apiError();
        },
        apiError: function (value) {
            var el = this.$el.find(this.api_error_el);

            value = value || (this.model.get('value') && this.model.get('value').IPSitesCountRDS);

            if (value === rdz.errors.AUTHOR) {
                el.find('.rds-value_SC_RDS').addClass('rds-red')
                    .attr({href: 'http://www.recipdonor.com/', title: rdz.locale.bar.tooltips.author})
                    .text(rdz.locale.author);
            }
        }
    },

    Geo: {
        showResult: function () {
            var v = this.model.get('value');

            var country = this.checkError(v ? v.country : v);
            this.$el.find('.rds-value').html(this.formatValue(country));
            this.setHref('.rds-value');
            this.showCached();
            this.apiError();

            var flag = v && v.flag || null;
            if (flag) {
                var imgURL = chrome.extension.getURL('icons/flags/' + flag + '.png');
                if (this.$el.find('.rds-prm img').length === 0) {
                    this.$el.find('.rds-prm').prepend('<img src="' + imgURL + '"></img>');
                }
            }
        },
        apiError: function (value) {
            var extra = this.model.get('extra'), el;

            //increase performance
            if (extra && typeof extra.api !== 'undefined') {
                //set css
                value = value || this.model.get('value');
                el = this.$el.find(this.api_error_el);
                value === -6 || value === -7 ?
                    el.addClass('rds-red') :
                    el.removeClass('rds-red');
            }

            if (value === rdz.errors.BUNKRUPT) {
                el.find('a').attr({
                    href: 'http://www.recipdonor.com/pay/',
                    title: rdz.locale.bar.tooltips.bunkrupt
                }).text(rdz.locale.bunkrupt);
            } else if (value === rdz.errors.AUTHOR) {
                el.find('a').attr({
                    href: 'http://www.recipdonor.com/',
                    title: rdz.locale.bar.tooltips.author
                }).text(rdz.locale.author);
            }
        }
    },

    Host: {
        showResult: function () {
            var v = this.model.get('value');

            var host = this.checkError(v ? v.host : v);
            this.$el.find('.rds-value').html(this.formatValue(host));
            this.setHref('.rds-value');
            this.showCached();
            this.apiError();
        },
        apiError: window.rdz.view.parameters.Geo.apiError
    },

    Provider: {
        showResult: function () {
            var v = this.model.get('value');

            var provider = this.checkError(v ? v.provider : v);
            this.$el.find('.rds-value').html(this.formatValue(provider));
            this.setHref('.rds-value');
            this.showCached();
            this.apiError();
        },
        apiError: window.rdz.view.parameters.Geo.apiError
    },

    CMS: {
        showResult: function () {
            //var domain = rdz.utils.domainFromUri(window.rdz.tab.url).domain;
            var value = this.model.get('value'),
                CMSTypes = {
                    sites: [],
                    blogs: [],
                    forums: [],
                    shops: [],
                    galleries: []
                },
                nameCMS = {
                    sites: ['1C-Bitrix', '2z Project', 'CMS Made Simple', 'Amiro.CMS', 'BIGACE', 'XOOPS', 'BigDump',
                        'BPanel', 'Xevian', 'Bugzilla', 'Kentico CMS', 'KMStudio', 'cPanel', 'Kolibri CMS', 'Koobi',
                        'cutephp', 'MantisBT', 'MaxSite CMS', 'DirectAdmin', 'MediaWiki', 'Microsoft ASP.NET', 'DLE',
                        'MODx', 'Moogo', 'DokuWiki', 'Movable Type', 'Neocrome', 'DotNetNuke', 'Next Generation',
                        'openEngine', 'DreamWeaver', 'papaya CMS', 'Perl', 'Drupal', 'PHP-Fusion', 'phpPgAdmin',
                        'JS Developer', 'tryasko@gmail.com', 'PHP-Nuke', 'eZ Publish', 'Plesk', 'Plone', 'Flyspray',
                        'Ruxe', 'Redmine', 'FrontPage', 'S.Builder', 's9y', 'InstantCMS', 'SiteEdit', 'SLAED',
                        'InSales', 'sNews', 'SPIP', 'Joomla', 'SQL Buddy', 'Squarespace', 'swift.engine', 'Swiftlet',
                        'Textpattern CMS', 'Trac', 'TYPO3', 'TYPOlight', 'uCoz', 'Webalizer', 'WCPS', 'webEdition',
                        'WebGUI', 'WebPublisher', 'WikkaWiki', 'phpMyAdmin', 'e107'].join(' '),
                    forums: ['vBulletin', 'phpBB', 'SMF', 'IPB', 'MyBB', 'punBB', 'Vanilla', 'FluxBB', 'YaBB', 'XMB',
                        'MiniBB', 'YAF'].join(' '),
                    blogs: ['Envos', 'WordPress', 'Blogger', 'LiveInternet', 'LiveJournal', 'Tumblr', 'TypePad',
                        'posterous', 'Vox'].join(' '),
                    shops: ['Magento', 'osCommerce', 'Prestashop', 'Zen Cart', 'xtCommerce', 'Ubercart', 'OpenCart',
                        'CS Cart', 'CubeCart', 'Vamshop', 'VP-ASP', 'osCSS'].join(' '),
                    galleries: ['Coppermine'].join(' ')
                },
                imgURL,
                html = '',
                t;

            if (value && value.length > 0) {
                value.forEach(function (cms) {
                    for (t in nameCMS) {
                        if ((new RegExp(cms)).test(nameCMS[t])) {
                            CMSTypes[t].push(cms);

                        }
                    }
                });
                for (t in CMSTypes) {
                    if (CMSTypes[t].length > 0) {
                        html += '<span>';
                        html += rdz.locale.popup.parameters.CMS[t] + ': ';
                        CMSTypes[t].forEach(function (cms) {
                            imgURL = chrome.extension.getURL('icons/engines/' + cms + '.png');
                            html += '<a title="' + cms + '"><img src="' +
                            imgURL + '"></img></a>';
                        });
                        html += '</span>';
                    }
                }
            } else if (value && value.length === 0) {
                html = rdz.locale.no;
            }

            this.$el.addClass('cms');

            this.$el.find('.rds-value').html(html);
        }
    },

    Validation: {
        formatValue: function (value) {
            var p = this.model.get('value');
            return p === null ? value : (p.value ? rdz.locale.yes : rdz.locale.no);
        }
    }
};

window.rdz.integrations.search.methods = {
    showNotification: function (integration) {
        var container = document.body && document.body.tagName === 'BODY' ?
                document.body : document.getElementsByTagName('html')[0],
            view = new window.rdz.integrations.search.views.Notification({
                model: new (rdz.Backbone.Model.extend({
                    defaults: {integration: integration.toLowerCase()}
                }))
            });

        rdz.$('.rds-bar-notification').remove();
        rdz.$(container).prepend(view.render().el);

        rdz.cmessenger.post({
            method: 'message',
            request: 'INTEGRATION_Notified_ContentRequest',
            integration: integration
        });
    },

    // searchResults is an array of objects {url: url, searchContainer}
    checkParameters: function (searchResults, data) {
        this.resetParameters();

        this.saveSearchContainers(searchResults, data);

        //this.saveURLs();

        this.checkOptionsChanged(data);

        this.createCollections(data);

        this.createViews();


        // sends the message to fetch data from DB
        this.fetchData(data);
    },

    saveSearchContainers: function (searchResults, data) {
        var hash = window.rdz.integrations.search.hash;

        // save the container for each search result to the hash
        searchResults.forEach(function (searchResult) {
            if (!hash[searchResult.url]) {
                hash[searchResult.url] = {
                    searchContainer: searchResult.container,
                    saContainer: searchResult.saContainer
                };
            }
        });
    },

    // save each URL to DB
    saveURLs: function () {
        var hash = window.rdz.integrations.search.hash,
            url,
            urlsSQL = [], // sql data to save urls to DB
            uriObj;

        for (url in hash) {
            if (!hash[url].appended) {
                uriObj = rdz.utils.get_uri_obj(url);
                // domain
                urlsSQL.push({
                    sql: 'INSERT OR IGNORE INTO SitesLibrary (SlUrl, SlCreateDate) VALUES (?, ?)',
                    params: [uriObj.domain, +new Date()]
                });
                // page
                urlsSQL.push({
                    sql: 'INSERT OR IGNORE INTO PagesLibrary (PlSlId, PlCreateDate, PlUri, PlWwwFlag) VALUES ( (SELECT SlId FROM SitesLibrary WHERE SlUrl = ?), ?, ?, ?)',
                    params: [uriObj.domain, +new Date(), uriObj.path, uriObj.www ? 1 : 0]
                });
            }
        }

        if (urlsSQL.length > 0) {
            rdz.cmessenger.post({method: 'message', request: 'INTEGRATION_Save_URLs_ContentRequest', sql: urlsSQL});
        }
    },

    checkOptionsChanged: function (data) {
        var hash = window.rdz.integrations.search.hash,
            url;

        for (url in hash) {
            // if the integration settins have been changed
            // then destroy view of each search result
            if (data.options_changed && hash[url].parameters) {
                hash[url].parameters.removeURLView(url);
                hash[url].appended = false;
            }
        }
    },

    createCollections: function (data) {
        var hash = window.rdz.integrations.search.hash,
            url,
            parameters = data.parameters;

        for (url in hash) {
            if (!hash[url].appended) {
                if (parameters && parameters.length) {
                    parameters.forEach(function (p) {
                        p['url'] = url;
                    });
                }
                hash[url].parameters = new window.rdz.integrations.search.collections.Parameters(data.parameters);
            }
        }
    },

    createViews: function () {
        var hash = window.rdz.integrations.search.hash,
            url;

        for (url in hash) {
            if (!hash[url].appended) {
                hash[url].view = new window.rdz.integrations.search.views.SearchResult();
                hash[url].view.render(url);
                hash[url].appended = true;
            }
        }
    },

    fetchData: function (data) {
        var hash = window.rdz.integrations.search.hash,
            url,
            urls = [];

        for (url in hash) {
            urls.push(url);
        }

        // fetch data for each URL from DB
        if (urls.length > 0) {
            rdz.cmessenger.post({
                method: 'message',
                request: 'INTEGRATION_Fetch_ContentRequest',
                urls: urls,
                data: data
            });
        }
    },

    sendRequests: function (data) {
        var hash = window.rdz.integrations.search.hash,
            url,
            domain,
            urls = Object.keys(hash),
            count = Math.min(urls.length, data.options.urls_to_check),
            resultNumber = 0; // check the number of results specified in the settings

        rdz.integrations.search.targets = {};

        function getData() {
            if (resultNumber < count) {
                url = urls[resultNumber];
                domain = rdz.utils.domainFromUri(url).domain;
                if (domain && !rdz.integrations.search.targets[domain]) {
                    rdz.integrations.search.targets[domain] = [];
                }
                hash[url].parameters.sendURLRequests(url);
                resultNumber++;
                setTimeout(getData, 100);
            }
        }

        getData();

        //for (url in hash) {
        //  if (resultNumber < data.options.urls_to_check) {
        //    hash[url].parameters.sendURLRequests(url);
        //  }
        //  resultNumber++;
        //}
    },

    resetSearchIntegration: function () {
        rdz.$('.rds-bar-search-parameters').remove();
        rdz.$('.b-serp-url__item, .serp-url__item, .b-result__url').removeClass('rds-seo-blue');
        rdz.$('li').removeClass('huckster');
        rdz.$('.rds-bar-search-updates').remove();
        rdz.$('.rds-updates').removeClass('rds-updates');
        rdz.$('.rds-ups').removeClass('rds-ups');
        rdz.$('.rds-full-url').remove();
        rdz.$('.rds-sa').remove();
        rdz.$('.b-pager__current, .b-pager__page:link').removeClass('rds-paging');
        rdz.$('.rds-search_competition').remove();
        window.rdz.integrations.search.hash = {};
        window.rdz.integrations.search.targets = {};
    },

    resetParameters: function () {
        rdz.$('.rds-recipients_positions-list').remove();
        rdz.$('.rds-bar-search-parameters').remove();
        rdz.$('.b-serp-url__item, .serp-url__item, .b-result__url').removeClass('rds-seo-blue');
        rdz.$('li').removeClass('huckster');
        rdz.$('.rds-full-url').remove();
        rdz.$('.rds-sa').remove();
        window.rdz.integrations.search.hash = {};
        window.rdz.integrations.search.targets = {};
    },

    updateParameter: function (m) {
        var model = JSON.parse(m),
            hash = rdz.integrations.search.hash,
            resultDomain,
            url,
            urlDomain;


        if (model.url && hash) {
            if (rdz.utils.pageParameters.indexOf(model.name) !== -1) {
                if (hash[model.url]) {
                    rdz.integrations.search.hash[model.url].parameters.updateModel({model: model});
                }
            } else {
                resultDomain = rdz.utils.domainFromUri(model.url).domain;

                for (url in hash) {
                    urlDomain = rdz.utils.domainFromUri(url).domain;
                    if (urlDomain === resultDomain) {
                        if (hash[url]) {
                            rdz.integrations.search.hash[url].parameters.updateModel({model: model});
                        }
                    }
                }
            }
        }

        //if (model.url && rdz.integrations.search.hash[model.url]) {
        //  rdz.integrations.search.hash[model.url].parameters.updateModel({model: model});
        //}
    },

    getSearchResultsData: function (a) {
        //return rdz._.keys(window.rdz.integrations.search.hash);
        var container_selector,
            link_selector, desc_selector,
            link_filter,  containers,
            options = a.functions.CopyResults.extra,
            url, output_arr;

        // yandex
        if (a.id === 'Yandex') {
          container_selector = '.serp-item';
          link_selector = 'a.link_cropped_no';
          desc_selector = '.serp-item__text, .organic__text, .social-snippet2__descr, .organic__text';
          //link_filter = 'div.serp-item__greenurl div.i-bem';
          link_filter = 'a.link_cropped_no';
          containers = rdz.$(container_selector).filter( // search results
            function (index) {
              return rdz.$(link_filter, this).length > 0;
            }
          );
        } else if (a.id === 'Google') { //google
            container_selector = '#rso';
            link_selector = '.yuRUbf a';
            desc_selector = '.aCOpRe span';
            containers = [...document.querySelectorAll('#rso li, #rso div.g')].filter(function (item) { // search results (tags "li")
                return !item.id && item.className.replace('rds-recipient', '').trim() === 'g' && item.offsetParent.id;
            });
        }

        if (container_selector) { // if we're on an integration page
            var isBlankLine = options.res_ttl.active || options.res_desc.active ? '\r\n' : '';
            output_arr = rdz.$.map(containers, function (e, i) {
                url = rdz.$(link_selector, e).attr('href');
                if (/\/infected\?url=/.test(url)) {
                    url = decodeURIComponent(url).match(/url=([^&]+)/)[1];
                }
                return (options.res_ttl.active ? rdz.$(link_selector, e).text() + '\r\n' : '') +
                    (options.res_desc.active ? rdz.$(desc_selector, e).text() + '\r\n' : '') +
                    (options.res_url.active ? url + '\r\n' : '') + isBlankLine;
            });
        }

        return output_arr;
    },

    //isSearchIntegrationPage: function () {
    //    return window.rdz.integrations.search.isRunning === true;
    //},

    showUpdates: function (updatesContainer, updatesData, integration, page, isFirst) {
        var updates = [],
            names = ['TYC', 'IY', 'USER', 'PR'],
            updatesCollection,
            updatesView;

        rdz.$('.rds-bar-search-updates').remove();
        rdz.$('.rds-updates').removeClass('rds-updates');
        rdz.$('.rds-ups').removeClass('rds-ups');

        names.forEach(function (name) {
            updates.push({name: name, value: updatesData[name]});
        });

        updatesCollection = new rdz.Backbone.Collection(updates);
        updatesView = new window.rdz.integrations.search.views.Updates({collection: updatesCollection});

        if (isFirst) {
            rdz.$(updatesContainer).prepend(updatesView.render().el);
        } else {
            rdz.$(updatesContainer).append(updatesView.render().el);
        }


        rdz.$('.rds-bar-search-updates').addClass(integration + '-' + page);
    },

    // add numeration to the search results
    addNumeration: function (integration) {
        var hash = window.rdz.integrations.search.hash,
            url,
            i = 1,
            start = 0,
            href = document.location.href,
            p,
            resNum,
            matches,
            containerSelector = '';

        if (integration === 'google') {
          containerSelector = '.rc > div > a';
            if ((matches = href.match(/start=(\d*)/))) {
                start = +matches[1];
            }
        } else if (integration === 'yandex_new') {
          //containerSelector = '.serp-item__title';
          containerSelector = '.organic__title-wrapper';
            matches = href.match(/p=(\d*)/);
            if (matches && matches[1]) {
                p = +matches[1];

                matches = document.location.search.match(/numdoc=(\d*)/);
                resNum = matches.length ? +matches[1] : 10;

                start = resNum * p;
            }
        } else if (integration === 'yandex_catalog') {
          //containerSelector = 'li.yaca-snippet';
          matches = document.location.href.match(/\/(\d+)\.html/);
          if (matches) {
            p = +matches[1];
            start = 1 + p * 10;
          }
        }

        for (url in hash) {
            if (hash[url].searchContainer) {
                if (integration === 'yandex_new') {
                    //rdz.$(hash[url].searchContainer).css('padding-left', '35px');
                    //rdz.$(rdz.$(hash[url].searchContainer).find('.favicon')).css('left', '12px');
                }

                rdz.$(hash[url].searchContainer).find('.rds-result-number-' + integration).remove();
                if (integration === 'yandex_catalog') {
                  rdz.$(hash[url].searchContainer).prepend('<span class="rds-result-number-' + integration + '">' + (start + i) + '</span>');
                } else {
                  rdz.$(hash[url].searchContainer).find(containerSelector).prepend('<span class="rds-result-number-' + integration + '">' + (start + i) + '</span>');
                }
                if (rdz.$(hash[url].searchContainer).find('.b-link__pseudo').length) { // new yandex
                    rdz.$(hash[url].searchContainer).find('.rds-result-number-' + integration).css('left', '-15px');
                }
                i++;
            }
        }
    },

    disableAdv: function () {
      rdz.$(//'.serp-adv-item, .serp-block.serp-adv, .b-spec-adv, .b-adv, .b-line_adv, .serp-adv__banner,' +
            '.serp-adv__block, .serp-adv__all, .serp-adv-item,' + 
            ' #tvcap, .topstuff, .tadsd, #bottomads, #mbEnd, .b-hub-reklama, .b-gap_line-bottom')
          .add(rdz.$('.serp-block').filter(function (index) {return rdz.$(this).find('.serp-adv__title-text').length > 0;}))
          .add(rdz.$('.serp-item').filter(function (index) {return rdz.$('.serp-adv-item__label, .label_color_yellow', this).length > 0;}))
          .css('display', 'none');

      // Yandex.Catalog
      let direct = document.querySelectorAll('.direct__category, .direct__search');
      for (let i = 0; i < direct.length; i++) direct[i].style.display = 'none';
    },

    showPaging: function (integration, data) {
        'use strict';
        var doc = document,
            results = this.ParseIYResult(doc.firstElementChild.innerHTML);

        // results per page
        // matches = document.cookie.match(/yp=[^]+?nd%3a(\d+)/i);
        // if (matches) {
        //     resultsPerPage = +matches[1];
        // }
        let matches = document.location.search.match(/numdoc=(\d*)/);
        let resultsPerPage = matches.length ? +matches[1] : 10;

        if (integration === 'yandex_new') {
            // Проверяем наличие блока пагинации
            let pagerDiv = doc.getElementsByClassName('pager__items')[0];
            if (!pagerDiv || !pagerDiv.childElementCount) return ;

            // Получаем общее кол-во выводимых результатов
            //let results = +nsRDS.parser.ParseResponse('IY', doc.firstElementChild.innerHTML),
            //    resultsPerPage = nsRDS.I.Yandex.YandexResultsPerPage(doc);
            if (results > 250) results = resultsPerPage === 30 ? 240 : 250;
            let totalPages = Math.ceil(results / resultsPerPage);

            pagerDiv.setAttribute('style', 'width: 666px;');

            // Сокрытие блока "В начало"
            if (/pager__item_kind_begin/.test(pagerDiv.firstElementChild.getAttribute('class'))) {
                pagerDiv.firstElementChild.setAttribute('style', 'display: none;');
            }
            // Сокрытие блока "дальше"
            if (/pager__item_kind_next/.test(pagerDiv.lastElementChild.getAttribute('class'))) {
                pagerDiv.lastElementChild.setAttribute('style', 'display: none;');
            }

            let readyPages = pagerDiv.getElementsByClassName('pager__item_kind_page'),
                currentPage = pagerDiv.getElementsByClassName('pager__item_current_yes')[0],
                // Получение блока, не являющегося текущим (у него иной стиль)
                modelLink = currentPage.nextElementSibling || currentPage.previousElementSibling,
                first = +readyPages[0].firstChild.textContent,
                last = +readyPages[readyPages.length - 1].firstChild.textContent,
                // http://yandex.ua/yandsearch?text=buy%20bicycle&lr=24901&p=13
                hrefParts = modelLink.getAttribute('href').match(/(.*[\?&]p=)\d+(.*)/);

            // Дописывание в начало блока
            if (first !== 1) {
                let fragment = doc.createDocumentFragment();
                for (let from = 0, to = first - 1, currLink; from < to;) {
                    currLink = modelLink.cloneNode(true);
                    currLink.setAttribute('href', hrefParts[1] + from + hrefParts[2]);
                    currLink.firstChild.textContent = ++from;
                    fragment.appendChild(currLink);
                }
                pagerDiv.insertBefore(fragment, pagerDiv.childNodes[1]);
            }
            // Дописывание в конец блока
            if (last !== totalPages) {
                let fragment = doc.createDocumentFragment();
                for (let from = last, to = totalPages, currLink; from < to;) {
                    currLink = modelLink.cloneNode(true);
                    currLink.setAttribute('href', hrefParts[1] + from + hrefParts[2]);
                    currLink.firstChild.textContent = ++from;
                    fragment.appendChild(currLink);
                }
                pagerDiv.insertBefore(fragment, pagerDiv.lastChild);
            }
        } else if (integration === 'yandex_catalog') {
          let insertAfter = function(elem, refElem) {
            let parent = refElem.parentNode;
            let next = refElem.nextSibling;
            if (next) {
              return parent.insertBefore(elem, next);
            } else {
              return parent.appendChild(elem);
            }
          };
          
          // Проверяем наличие блока пагинации
          let pagerDiv = doc.getElementsByClassName('pager__pages')[0];
          if (!pagerDiv) return ;

          // Получаем общее кол-во выводимых результатов
          let results = doc.getElementsByClassName('info')[0];
          results = parseInt(results.textContent.replace(/\D/g, ''), 10);
          if (results > 1000) results = 1000;
          // В Я.Каталоге 10 результатов за страницу
          let totalPages = Math.ceil(results / 10);
          // Я.Каталог: минимум 8 ссылок на страницы
          if (totalPages < 8) return ;

          let readyPages = pagerDiv.children,
              currentPage = pagerDiv.getElementsByClassName('button_checked')[0],
              // Получение блока, не являющегося текущим (у него стандартный стиль)
              modelLink = currentPage.nextElementSibling || currentPage.previousElementSibling,
              first = +readyPages[0].textContent || +readyPages[1].textContent,
              last = +readyPages[readyPages.length - 1].textContent || +readyPages[readyPages.length - 2].textContent,
              // Для "/yca/cat/Rest/13.html?text=Alice%20in%20Wonderland" номер страницы 13
              hrefParts = modelLink.getAttribute('href').match(/(.*\/)\d+(.*)/);

          // Добавляем доп. стили
          rdz.$('.b-pager__current, .b-pager__page:link').addClass('rds-paging');

          // Дописывание в начало блока
          if (first !== 1) {
            let fragment = doc.createDocumentFragment(), currLink;
            for (let from = 0, to = first; from < to;) {
              currLink = modelLink.cloneNode(true);
              currLink.setAttribute('href', hrefParts[1] + from + hrefParts[2]);
              currLink.firstChild.textContent = ++from;
              fragment.appendChild(currLink);
            }
            pagerDiv.insertBefore(fragment, pagerDiv.childNodes[0]);
          }

          // Дописывание в конец блока
          if (last !== totalPages) {
            let fragment = doc.createDocumentFragment(), currLink;
            for (let from = last + 1, to = totalPages; from < to;) {
              currLink = modelLink.cloneNode(true);
              currLink.setAttribute('href', hrefParts[1] + from + hrefParts[2]);
              currLink.firstChild.textContent = ++from;
              fragment.appendChild(currLink);
            }
            insertAfter(fragment, pagerDiv.lastChild);
          }
        }
    },

    ParseIYResult: function (response) { // TODO modify and remove
        var result = -2;
        if (response) {
            if (/<div class=\"b-captcha\">/.test(response) || /Доступ к нашему сервису временно запрещён/i.test(response)) {
                result = -3;
            } else {
                var matches = response.match(/<div class=\"input__found[^]+?>(\B|([^]+?))<\/div>/);
                if (matches && matches[1]) {
                    result = this.NumberParser(matches[1]);
                } else if (matches && (matches[1] === "")) {
                    result = 0;
                } else {
                    matches = response.match(/<title>[\S\s]+Яндекс:[^\d]+(.*)<\/title>/i);
                    if (matches && matches[1]) {
                        result = this.NumberParser(matches[1]);
                    }
                }
            }
        }
        return result;
    },

    NumberParser: function (result) {
        result = result.replace(/^([а-яё\s]+)/, "");
        result = result.replace(/\s$/, "");
        result = result.replace(/тыс\.*/, "000");
        result = result.replace(/тис\.*/, "000");
        result = result.replace(/млн/, "000000");
        result = result.replace(/&nbsp;/, "");
        result = result.replace(/[^\d]/g, '');

        return result;
    },

    updateSAParameter: function (arg) {
        var url = arg.model.url,
            hash = rdz.integrations.search.hash,
            searchContainer;

        if (url) {
            searchContainer = window.rdz.integrations.search.hash[url].searchContainer;
            rdz.$(rdz.$(searchContainer).find('.rds-sa-popup')).prop('contentWindow').postMessage({
                method: 'updateParameter',
                model: arg.model
            }, '*');
        }

    },
    updateSAHistoryCounter: function (arg) {
        var url = arg.url,
            hash = rdz.integrations.search.hash,
            searchContainer;

        if (url) {
            searchContainer = window.rdz.integrations.search.hash[url].searchContainer;
            rdz.$(rdz.$(searchContainer).find('.rds-sa-popup')).prop('contentWindow').postMessage({
                method: 'updateHistoryCounter',
                model: arg.model
            }, '*');
        }

    },
    
    highlightRecipients: function(recipients) {
        var hash = rdz.integrations.search.hash,
            url, domain;
            
        for (url in hash) {
            domain = rdz.utils.domainFromUri(url).domain;
            if (recipients.indexOf(domain) !== -1) {
                rdz.$(hash[url]['searchContainer']).addClass('rds-recipient');
            }            
        }
    }
};

// added for SA in the integrations
addEventListener("message", receiveIFrameMessage, false);

function receiveIFrameMessage(event) {

    if (event.origin + '/' !== chrome.extension.getURL("")) {
        return;
    }

    if (event.data.request === 'ALL_PARAMETERS_PopupRequest') {
        rdz.cmessenger.post(event.data);
    }
}