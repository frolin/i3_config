// ------- handle messages -------

// parent.postMessage({value: 1}, '*');

// receive message from parent window
addEventListener("message", receiveMessage, false);

function receiveMessage(event) {
    if (event.data.method === 'createPopup') {
        window.rdz.tab = {
            url: event.data.url,
            favicon: 'https://favicon.yandex.net/favicon/' + rdz.utils.get_uri_obj(event.data.url).domain
        };
        rdz.app.popup.SA = event.data.SA;
        rdz.app.popup.parameters.add(event.data.parameters);

        // render popup only if had url, there is somewhere bug with popup rendering
        if (!rdz.app.popup.appended) rdz.app.popup.view.render();
    } else if (event.data.method === 'resetHistoryCounters') {
        rdz.app.popup.history_counters.reset();
    } else if (event.data.method === 'updateParameter') {
        rdz.app.popup.parameters.updateModel({model: event.data.model});
    } else if (event.data.method === 'updateHistoryCounter') {
        rdz.app.popup.history_counters.add(JSON.parse(event.data.model));
    }

}

// ------------------------------


if (!window.rdz) window.rdz = {};

/**
 * @property rdz.locale { Object } is used by views in content script and also in popup because of inheritance
 */
// AppLocale.init();
// window.rdz.locale = AppLocale.locale;
chrome.storage.local.get('Bar', async (settings) => {
    if (!window.rdz.user) window.rdz.user = {};
    window.rdz.user.locale = window.rdz.utils.getOptions({ options: ['Bar'] }, settings).locale;
    await AppLocale.init();
    window.rdz.locale = AppLocale.locale;

    //initialize first rendering. adding parameters-objects in Collection from "background" will fired rendering Bar
    // if (!rdz.app.popup.appended) rdz.app.popup.view.render();
});

window.rdz.model = {
    popup: {
        /** @class Parameters */
        Parameters: rdz.Backbone.Model.extend({

            defaults: {
                value: null
            },
            idAttribute: 'name',
            valueChanged: function (view) {
                view.showResult();
                try {

                }
                catch (e) {
                    window.console.log(e);
                    window.console.log('Error by ' + this.get('name'));
                }
            }
        }),
        History_Counters: rdz.Backbone.Model.extend({
            defaults: {
                value: null,
                requests: null
            }
        })
    }
};

window.rdz.collection = {
    popup: {
        /** @class Parameters */
        Parameters: rdz.Backbone.Collection.extend({
            model: rdz.model.popup.Parameters,
            updateModel: function (o) {
                var model = this.get(o.model.name);
                model.set({
                    value: o.model.value, /*cached: o.model.cached,*/
                    requests: o.model.requests
                }, {silent: true});
                model.trigger("change:value");
            },
            sendALLRequest: function () {
                parent.postMessage({
                    url: window.rdz.tab.url,
                    SA: rdz.app.popup.SA,
                    receiver: 'integration_sa',
                    method: 'message',
                    request: 'ALL_PARAMETERS_PopupRequest'
                }, '*');
            }

        }),
        History_Counters: rdz.Backbone.Collection.extend({
            model: rdz.model.popup.History_Counters,

            comparator: 'number',

            updateModel: function (o) {
                var model = this.get(o.model.name);
                model.set({
                    value: o.model.value, /*cached: o.model.cached,*/
                    requests: o.model.requests
                }, {silent: true});
                model.trigger("change:value");
            }
        })
    }
};


window.rdz.view.popup = {
    /** @class App */
    App: rdz.Backbone.View.extend({
        render: function () {
            var self = this,
                parameter,
                name;

            //append html
            this.setTitle();
            this.set_block_titles();
            //this.history_counters_block();

            rdz.app.popup.parameters.each(function (value, index) {

                name = value.get('name');

                parameter = rdz.view.parameters.Parameter.extend(rdz.view.Popup.Parameter);

                if (rdz.view.parameters[name]) {
                    parameter = parameter.extend(rdz.view.parameters[name]);
                    if (rdz.view.Popup[name]) {
                        parameter = parameter.extend(rdz.view.Popup[name]);
                        parameter = new parameter({model: value});
                    }
                    else {
                        parameter = new parameter({model: value});
                    }
                }
                else {
                    parameter = new parameter({model: value});
                }

                rdz.$('body').find('.' + name).html(parameter.render());

                if (rdz.app.popup.SA.extra[name] &&
                    (!rdz.app.popup.SA.active || !rdz.app.popup.SA.extra[name].active)) {
                    rdz.$('body').find('.' + name).css('display', 'none');
                }
            });

            new window.rdz.view.Popup.History_Counters.Factory({model: rdz.app.popup.history_counters});

            // rdz.app.popup.parameters.sendALLRequest(); // moved to checkSAParameters() (search_integration.js)
            rdz.app.popup.appended = true;
            return this;

        },
        setTitle: function () {
            var siteIcon = document.getElementById('siteIcon');
            if (window.rdz.tab.favicon != null)
                siteIcon.setAttribute('src', window.rdz.tab.favicon);
            else
                siteIcon.style.display = 'none';

            var domain = rdz.utils.domainFromUri(window.rdz.tab.url).domain;
            var domainValue = document.getElementById('domainValue');
            domainValue.innerText = domain.toUpperCase();
            domainValue.setAttribute('href', 'http://' + domain);
        },
        set_block_titles: function () {
            rdz.$('#ttl_index').text(rdz.locale.popup.ttl_index);
            rdz.$('#ttl_indexed').text(rdz.locale.popup.ttl_indexed);
            rdz.$('#ttl_liks').text(rdz.locale.popup.ttl_liks);
            if (rdz.locale.yes !== "Yes") {
                rdz.$('#ttl_liks_more_cnt').show().find('#ttl_liks_more').text(rdz.locale.popup.ttl_liks_more);
            }
            rdz.$('#ttl_statistics').text(rdz.locale.popup.ttl_statistics);
            rdz.$('#ttl_catalogs').text(rdz.locale.popup.ttl_catalogs);
            rdz.$('#ttl_ip').text(rdz.locale.popup.ttl_ip);
            rdz.$('#ttl_others').text(rdz.locale.popup.ttl_others);
            rdz.$('#ttl_semrush').text(rdz.locale.popup.ttl_semrush);
        }

    })
};


/** @namespace popup script parameters*/
window.rdz.view.Popup = {};
/**@class Parent class for all parameters in  popup script
 * @property {Function} template replaces html according to popup script's needs
 */



window.rdz.view.Popup.Parameter = {
    template: function (model) {
        var name = model.get('name'),
            html = rdz.$(`<div class="rds-nm">${rdz.locale.parameters[name].name}:</div><div class="rds-prm"><a target="_blank" class="rds-value">?</a></div>`);

        this.el.setAttribute('title', rdz.locale.parameters[name].ttl);
        return html;
    }
};

window.rdz.view.Popup.History_Counters = {};

window.rdz.view.Popup.History_Counters.Factory = rdz.Backbone.View.extend({
    el: ".alignedColumn.history_count",
    template: function () {

        if (this.model.get('logged') != false) {
            //console.log(this.model))
            this.$el.find('#ttl_history_count').html(rdz.locale.popup.ttl_history_count);
        }
    },
    initialize: function (model) {
        //this.model.on("change:value", this.render, this)
        this.model.on("add", this.render, this);
    },
    render: function () {
        this.template();

        if (this.model.length > 0) {
            var html = rdz.$();

            this.model.each(function (value) {
                var name = value.get('parameter') || value.get('request');

                var parameter = rdz.view.parameters.Parameter.extend(window.rdz.view.Popup.History_Counters.SuperClass);


                if (rdz.view.Popup.History_Counters[name]) {
                    parameter = parameter.extend(rdz.view.Popup.History_Counters[name]);
                }

                parameter = new (parameter)({model: value});
                html.push(parameter.el);
            });

            this.$el.find('#history_count').html(html);
        }
    }
});

window.rdz.view.Popup.History_Counters.SuperClass = {
    initialize: function () {
        this.render();
        this.showResult();
    },
    formatValue: function (value) {
        return this.model.get('value') === null ? value : this.model.get('value') >= 0 ? rdz.utils.formatNumber.apply(value, [0, "", "\u2009"]) + ' ' + rdz.utils.endings(value, rdz.locale.notes) : value;
    },
    template: function () {
        var name = this.model.get('parameter') || this.model.get('request'),
            html = rdz.$(`<div class="rds-nm">${rdz.locale.popup.history_count[name].name}:</div><div class="rds-prm">(<a target="_blank" class="rds-value">?</a>)</div>`);

        this.el.setAttribute('title', rdz.locale.popup.history_count[name].ttl);
        return html;
    },
    api_error_el: '.rds-value',
    show_cached_el: '.rds-prm'

};
window.rdz.view.Popup.History_Counters.MirrorsCount = {
    template: function () {
        var html = rdz.$('<div class="rds-prm">Найдено <a target="_blank" class="rds-value">?</a> по <span class="rds-red">Я</span></div>'),
            name = this.model.get('parameter') || this.model.get('request');

        this.el.setAttribute('title', rdz.locale.popup.history_count[name].ttl);
        //html[0].innerHTML = rdz.locale.popup.history_count[name].name + ':';
        return html;
    },
    formatValue: function (value) {
        return this.model.get('value') === null ? value : this.model.get('value') >= 0 ? rdz.utils.formatNumber.apply(value, [0, "", "\u2009"]) + ' ' + rdz.utils.endings(value, rdz.locale.mirrors) : value;
    }
};


/*
 window.rdz.view.Popup.History_Counters.TYC = rdz.view.Popup.History_Counters.SuperClass;
 window.rdz.view.Popup.History_Counters.IY = rdz.view.Popup.History_Counters.SuperClass;
 window.rdz.view.Popup.History_Counters.PR = rdz.view.Popup.History_Counters.SuperClass;
 window.rdz.view.Popup.History_Counters.WhoisCount = rdz.view.Popup.History_Counters.SuperClass;
 window.rdz.view.Popup.History_Counters.MirrorsCount = rdz.view.Popup.History_Counters.SuperClass;*/


window.rdz.view.Popup.IG = {
    template: function (model) {
        var name = model.get('name'),
            html = rdz.$(`<div class="rds-nm">${rdz.locale.parameters[name].name}:</div>` +
            `<div class="rds-prm"><a target="_blank" class="rds-value_IG">?</a>` +
            `</div><div class="rds-rate"><ins></ins></div>`);
            //` <span  class="rds-cnt_MIG">(<a target="_blank" class="rds-value_MIG rds-green" title="${rdz.locale.parameters.MIG.ttl}">?</a>)</span></div><div class="rds-rate"><ins></ins></div>`);

        this.el.setAttribute('title', rdz.locale.parameters[name].ttl);
        return html;
    }
};
window.rdz.view.Popup.IGP = {
    template: function (model) {
        var name = model.get('name'),
            html = rdz.$(`<div class="rds-nm">${rdz.locale.parameters[name].name}:</div><div class="rds-prm"><a target="_blank" class="rds-value">?</a></div>`);

        this.el.setAttribute('title', rdz.locale.parameters[name].ttl);
        return html;
    }
};
window.rdz.view.Popup.TYC = {
    template: function (model) {
        var name = model.get('name'),
            html = rdz.$(`<div class="rds-nm">${rdz.locale.parameters[name].name}:</div>` +
                '<div class="rds-prm"> <a target="_blank" class="rds-value_TYC">?</a> <span class="cnt_value_TYCBar">(<a target="_blank" class="rds-value_TYCBar"></a>)</span></div>');

        this.el.setAttribute('title', rdz.locale.parameters[name].ttl);

        //Я.Каталог
        var html2 = rdz.$(`<div class="rds-cnt" title"${rdz.locale.popup.parameters.YaCatalog.ttl}"><div class="rds-nm"></div><div class="rds-prm"><a target="_blank" class="rds-value">?</a></div></div>`);
        rdz.$(html2).find('.rds-nm').html(rdz.locale.popup.parameters.YaCatalog.name + ':');
        rdz.$('#YaCatalog').html(html2);

        return html;
    },
    showResult: function () {
        this.callParentMethod({method: 'showResult', object: this});
        this.showYaCatalog();
        this.showYaBar();
    },
    showYaCatalog: function () {
        this.setHref({parent: '#YaCatalog', child: '.rds-value'}, this.model.get('requests').TYC.serviceUrl);
        var value = this.model.get('value');
        if (value && value.TYC) {
            value = value.TYC;
            rdz.$('#YaCatalog').find('.rds-value').html(value === rdz.errors.HTTP ? '?' : value.YaCatalog || rdz.locale.no);
            rdz.$('#YaCatalogTitle').html(value.title || '');
            rdz.$('#YaCatalogDescription').html(value.description || '');
            if (value.YaCatalog) {
                this.$el.find('.rds-prm').addClass('rds-bold');
            }
        }
        this.showCached({parent: '#YaCatalog'});

    },
    template_bar: function () {
        var html = rdz.$(`<div class="rds-nm">${rdz.locale.popup.parameters.YaBar.name}:</div><div class="rds-prm"><a target="_blank" class="topic">?</a> <span class="cnt_source">(<a target="_blank" class="source"></a> <a target="_blank" class="sector"></a> <a target="_blank" class="address"></a>)</span> <span class="cnt_region">(<a target="_blank" class="region"></a>)</span> </div>`);

        this.el.setAttribute('title', rdz.locale.popup.parameters.YaBar.ttl);

        this.html_bar = rdz.$('#YaBar').html(html);
    },
    showYaBar: function () {

        var value = this.model.get('value'),
            href;

        if (value && (value = value.YaBar)) {
            this.template_bar();
            href = this.model.get('requests').YaBar.serviceUrl;

            this.setHref({parent: '#YaBar', child: '.topic'}, href);
            this.html_bar.find('.topic').html(value === rdz.errors.HTTP ? '?' : value.topic || rdz.locale.no);

            if (value.source) {
                this.setHref({parent: '#YaBar', child: '.source'}, href);
                this.html_bar.find('.cnt_source').css({display: 'inline-block'}).find('.source').html(this.checkError(value.source));
            }

            if (value.sector) {
                this.setHref({parent: '#YaBar', child: '.sector'}, href);
                this.html_bar.find('.sector').html(this.checkError(value.sector));
            }

            if (value.address) {
                this.setHref({parent: '#YaBar', child: '.address'}, href);
                this.html_bar.find('.address').html(this.checkError(value.address));
            }

            if (value.region) {
                this.setHref({parent: '#YaBar', child: '.region'}, href);
                this.html_bar.find('.cnt_region').css({display: 'inline-block'}).find('.region').html(this.checkError(value.region));
            }
            this.showCached({parent: '#YaBar'});
        }
    }
};

window.rdz.view.Popup.PR = {
    template: function (model) {
        var name = model.get('name'),
            html = rdz.$(`<div class="rds-nm">${rdz.locale.parameters[name].name}:</div><div class="rds-prm"><a target="_blank" class="rds-value_PR">?</a> <span class="cnt_value_PRMain">(<a target="_blank" class="rds-value_PRMain"></a>)<span></div>`);

        this.el.setAttribute('title', rdz.locale.parameters[name].ttl);
        return html;
    },
    showResult: function () {
        this.callParentMethod({method: 'showResult', object: this});
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
    },
    title: function (PR) {
        var value = this.model.get('value');

        var title = value && value[PR[1]] === rdz.errors.CAPTCHA ? rdz.locale.bar.tooltips.PR_captcha :
            value && value[PR[1]] === rdz.errors.AUTHOR ? rdz.locale.bar.tooltips.PR_author :
                rdz.locale.parameters.PR[PR[0]];

        rdz.$('.rds-value_' + PR[0], this.$el).attr('title', title);
    }
};

window.rdz.view.Popup.Dmoz = {
    showResult: function () {
        this.callParentMethod({method: 'showResult', object: this});
        var PR = rdz.app.popup.parameters.get('PR');
        if (PR) {
            PR.set({Dmoz: this.model.get('value')}, {silent: true});

            // if PR displayed value before
            if (PR.get('value') !== null) {
                PR.trigger('change:value');
            }
        }
    }
};

window.rdz.view.Popup.Majestic = {
    template: function (model) {
        var name = model.get('name'),
            html = rdz.$(`<div class="rds-nm">${rdz.locale.parameters[name].name}:</div><div class="rds-prm"><div class="rds-rate"><ins></ins></div><a target="_blank" class="rds-value_in">?</a> (<a target="_blank" class="rds-value_out">?</a>)</div></div>`);
        this.el.setAttribute('title', rdz.locale.parameters[name].ttl);
        return html;
    }
};

window.rdz.view.Popup.YaBlogs = {
    template: function (model) {
        var name = model.get('name'),
            html = rdz.$(`<div class="rds-nm">${rdz.locale.parameters[name].name}:</div><div class="rds-prm"><a target="_blank" class="rds-value_authority">?</a> <span class="cnt_value_readers">(<a target="_blank" class="rds-value_readers">?</a>)</span></div>`);

        this.el.setAttribute('title', rdz.locale.parameters[name].ttl);
        return html;
    }
};
window.rdz.view.Popup.Solomono = {
    template: function (model) {
        var name = model.get('name'),
            html = rdz.$(`<div class="rds-nm">${rdz.locale.parameters[name].name}:</div><div class="rds-prm"><a target="_blank" class="rds-value_in rds-green">?</a>/<a target="_blank" class="rds-value_out rds-red">?</a></div>`);

        this.el.setAttribute('title', rdz.locale.parameters[name].ttl);
        return html;
    }
};

window.rdz.view.Popup.LIO = {
    template: function (model) {
        var name = model.get('name'),
            html = rdz.$(`<div class="rds-nm">${rdz.locale.parameters[name].name}:</div><div class="rds-prm"><a target="_blank" class="rds-value_in rds-green">?</a>/<a target="_blank" class="rds-value_out rds-red">?</a></div></div>`);

        this.el.setAttribute('title', rdz.locale.parameters[name].ttl);
        return html;
    }
};

window.rdz.view.Popup.SemRush = {
    template: function (model) {
        var name = model.get('name'),
            html = rdz.$(`<div class="rds-nm">${rdz.locale.popup.parameters[name].name}:</div><div class="rds-prm"><a target="_blank" class="rds-value"><div class="rds-value_rank">?</div></a></div>`);

        this.el.setAttribute('title', rdz.locale.popup.parameters[name].ttl);

        return html;
    },
    template_traffic: function () {
        var html2 = rdz.$('<div class="rds-cnt"><div class="rds-nm"></div><div class="rds-prm"><a class="rds-value_traffic"></a> <span class="rdz-cnt_value2">($<a class="rds-value_costs"></a>)</span> </div></div>');
        var value = this.model.get('value');

        html2[0].setAttribute('title', rdz.locale.popup.parameters.SemRush_traffic.ttl);
        rdz.$(html2).find('.rds-nm').html(rdz.locale.popup.parameters.SemRush_traffic.name + ':');

        rdz.$('#SemRush_traffic').html(html2);
    },
    showResult: function () {
        this.callParentMethod({method: 'showResult', object: this});
        this.showResultSemRush_traffic();
    },
    showResultSemRush_traffic: function () {
        var value = this.model.get('value');
        //this.setHref('.rds-value');
        //this.$el.find('.rds-value_traffic').html(this.checkError(value.traffic));

        if (value && value.traffic) {
            this.template_traffic();
            rdz.$('#SemRush_traffic').find('.rds-value_traffic').html(this.checkError(value.traffic));

            if (value && value.costs > 0) {
                rdz.$('#SemRush_traffic').find('.rds-value_costs').html(this.formatValue(value.costs));
                rdz.$('#SemRush_traffic').find('.rdz-cnt_value2').css({display: 'inline-block'});
            }

        }
        this.setHref({parent: '#SemRush_traffic', child: '.rds-value_traffic'});
        this.setHref({parent: '#SemRush_traffic', child: '.rds-value_costs'});
        this.showCached();
        this.showCached({parent: '#SemRush_traffic'});
    }
};

window.rdz.view.Popup.Seo = {
    template: function (model) {
        var html = rdz.$('<div class="rds-nm"></div><div class="rds-prm"><div class="Seo"></div></div>'),
            name = model.get('name');
        //this.el.setAttribute('title', rdz.locale.parameters[name].ttl);
        //html[0].innerHTML = rdz.locale.popup.parameters[name].name;
        return html;
    },
    showResult: function () {
        var value = this.checkError(this.model.get('value')),
            name = this.model.get('name'),
            formatedValue = this.formatValue(value),
            sortedSeosObj = null,
            sortedSeos = null,
            extra = this.model.get("extra"),
            activeMarketsSum = 0,
            e,
            that = this;

        if (formatedValue === "bunkrupt") {
            rdz.$('#ttl_seo').text(rdz.locale.popup.ttl_seo_2);
            that.$el.find('.rds-prm').prepend(rdz.$('<a/>', {
                href: 'http://www.recipdonor.com/pay/',
                target: '_blank',
                class: 'rds-bankrupt',
                text: rdz.locale.bunkrupt,
                title: rdz.locale.bar.tooltips.bunkrupt
            }));
        } else if (formatedValue === "auth") {
            rdz.$('#ttl_seo').text(rdz.locale.popup.ttl_seo_2);
            that.$el.find('.rds-prm').prepend(rdz.$('<a/>', {
                href: 'http://www.recipdonor.com/',
                target: '_blank',
                class: 'rds-author',
                text: rdz.locale.author,
                title: rdz.locale.bar.tooltips.author
            }));
        } else {
            // getting sum, that indicates active markets
            for (e in extra) {
                if (e !== "api") {
                    if (extra[e].active === true) {
                        activeMarketsSum += rdz.utils.Seo_NumberByName[e];
                    }
                }
            }
            sortedSeosObj = rdz.utils.sortSeoMarkets(formatedValue, activeMarketsSum);
            sortedSeos = sortedSeosObj.sorted;
            if (sortedSeos[0][1] === 'yes') {
                rdz.$('#ttl_seo').text(rdz.locale.popup.ttl_seo);
                that.$el.find('.rds-nm').html(rdz.locale.popup.parameters[name].name);
            }
            sortedSeos.forEach(function (market) {
                if (market[1] === 'yes') {
                    that.$el.find('.Seo').append(rdz.$('<a/>', {
                        target: '_blank',
                        class: market[0] + ' yes',
                        title: market[0]
                    }));
                }
            });
        }
    }
};

window.rdz.view.Popup.Pictures = {

    template: function (name) {
        var html = rdz.$('<div class="rds-cnt"><div class="rds-nm"></div><div class="rds-prm"><a target="_blank" class="rds-value"><div class="rds-value_rank">?</div></a></div></div>');

        html[0].setAttribute('title', rdz.locale.popup.parameters[name].ttl);
        rdz.$(html).find('.rds-nm').html(rdz.locale.popup.parameters[name].name + ':');
        return html;
    },
    render: function () {
        rdz.$('#PicturesGo').html(this.template('PicturesGo'));
    },
    showResult: function () {

        var v = this.model.get('value');

        var value_Go = this.checkError(v ? v.Pictures : v),
            value_Ya = this.checkError(v && v.PicturesYa ? v.PicturesYa : v);

        if (v && v.PicturesYa) {
            rdz.$('#PicturesYa').html(this.template('PicturesYa')).find('.rds-value').html(this.formatValue(value_Ya));
            this.setHref({
                parent: '#PicturesYa',
                child: '.rds-value'
            }, this.model.get('requests')['PicturesYa'].serviceUrl);
            this.showCached({parent: '#PicturesYa', name: 'PicturesYa'});
        }

        this.setHref({parent: '#PicturesGo', child: '.rds-value'}, this.model.get('requests')['Pictures'].serviceUrl);
        rdz.$('#PicturesGo').find('.rds-value').html(this.formatValue(value_Go));
        this.showCached({parent: '#PicturesGo', name: 'Pictures'});

    }
};

window.rdz.view.Popup.Counters = {
    template: function (model) {
        var v = model.get('value'),
            red;

        if (v !== null) {
            v = rdz.utils.sortCounters(v);
        }
        var template = rdz.$();
        for (var i in v) {
            if (v[i][1].value !== null && v[i][1].value !== false && v[i][0] !== "GA" ||

                    //ебашим проверку GAnalytics, если меньше -1 значит не показываем название
                v[i][0] === "GA" && v[i][1].domains >= -1) {

                red = (v[i][1].image && v[i][1].image.indexOf('yadro.ru') !== -1) ? true : false;
                var html = rdz.$('<div/>', {class: 'cnt ' + v[i][0]});
                html.append(rdz.$('<span/>', {
                    class: 'rds-nm',
                    text: ':'
                }).prepend(rdz.locale.popup.parameters[v[i][0]].name));
                html.append(rdz.$('<span/>', {class: 'rds-prm' + (this.isCached({name: v[i][0]}) ? ' rds-italic' : '')})
                    .append(rdz.$('<a/>', {
                        class: red ? 'rds-' + v[i][0] + '-value' + ' rds-red' : 'rds-' + v[i][0] + '-value',
                        target: '_blank'
                    })));

                template = template.add(html);
            }
        }
        return template;
    },
    setHref: function (id, name, href) {
        if (typeof id === 'undefined' || href === null) return null;
        if (typeof id === 'string') id = {parent: this.el, child: id};
        var param = this.model.get('requests');

        //sometimes GA doesn't have request
        if (param[name]) {
            rdz.$(id.parent).find(id.child).attr('href', href ? href : (param[name].displayUrl ? param[name].displayUrl : param[name].serviceUrl));
        }
    },
    showResult: function () {
        this.$el.html(this.template(this.model));
        var data = this.model.get('value');
        if (data !== null) {
            var datalist = rdz.utils.sortCounters(data);
            for (var i in datalist) {
                if (data[datalist[i][0]].value !== null && data[datalist[i][0]].value !== false) {
                    var value = this.checkError(data[datalist[i][0]].value);

                    if (datalist[i][0] == 'GA') {
                        if (data.GA && data.GA.domains != null && data.GA.domains >= -1) {
                            this.$el.find('.rds-' + datalist[i][0] + '-value').html(rdz.locale.isset);
                            this.$el.find('.cnt.GA .rds-prm').append(rdz.$('<span/>', {class: 'domains'}));
                            if (data.GA.domains >= 2) {
                                this.$el.find('.domains').append(" (").append(rdz.$('<a/>', {
                                    class: 'rds-value-GA-domains',
                                    text: data.GA.domains + rdz.locale.popup.parameters.GA.domains,
                                    target: '_blank'
                                })).append(')');
                            }

                            this.setHref('.rds-' + datalist[i][0] + '-value', datalist[i][0], 'https://www.google.com.ua/intl/ru_ALL/analytics/');
                            this.setHref('.rds-value-GA-domains', datalist[i][0]);
                        }
                    } else {
                        this.setHref('.rds-' + datalist[i][0] + '-value', datalist[i][0]);
                        this.$el.find('.rds-' + datalist[i][0] + '-value').html(
                            typeof(data[datalist[i][0]].value) == 'boolean' ?
                                rdz.locale.isset :
                                this.formatValue(value)
                        );
                    }


                }
            }
        }
    }
};

window.rdz.view.Popup.Age = {
    template: function (model) {
        var name = model.get('name'),
            html = rdz.$(`<div class="rds-nm">${rdz.locale.parameters[name].name}:</div><div class="rds-prm"><a target="_blank" class="rds-value">?</a></div>`);
        this.el.setAttribute('title', rdz.locale.parameters[name].ttl);
        return html;
    },
    showResult: function () {
        this.callParentMethod({method: 'showResult', object: this});
        var value = this.model.get('value');
        if (value === rdz.errors.AUTHOR || value === rdz.errors.BUNKRUPT) {
            this.setHref('.rds-value', value === rdz.errors.AUTHOR ? 'http://www.recipdonor.com/' :
                'http://www.recipdonor.com/pay/');
        } else {
            this.setHref('.rds-value');
        }
    }
};

window.rdz.view.Popup.IPSitesCount = {
    template: function (model) {
        var name = model.get('name'),
            html = rdz.$(`<div class="rds-nm">${rdz.locale.parameters[name].name}:</div><div class="rds-prm">` +
            '<span  class="rds-cnt_SC_Bing">B:<a target="_blank" class="rds-value_SC_Bing">?</a></span>' +
            ' <span  class="rds-cnt_SC_Solomono">L:<a target="_blank" class="rds-value_SC_Solomono">?</a></span>' +
            ' <span  class="rds-cnt_SC_RDS">R:<a target="_blank" class="rds-value_SC_RDS">?</a></span>' +
            '</div>');
        this.el.setAttribute('title', rdz.locale.parameters[name].ttl);
        return html;
    }
};

window.rdz.view.Popup.CheckDangerous = {
    template: function (model) {
        return rdz.$('<div class="rds-prm"></div>');
    },
    showResult: function () {
        var domain = rdz.utils.domainFromUri(window.rdz.tab.url).domain;
        var hrefs = {
            Yandex: 'http://yandex.ru/infected?url=http://' + domain,
            Google: 'https://www.google.com/safebrowsing/diagnostic?site=' + domain,
            WebmoneyAdvisor: 'http://advisor.wmtransfer.com/SiteDetails.aspx?url=' + domain,
            VirusTotal: 'https://www.virustotal.com/ru/url/submission/?force=1&url=http://' + domain
        };
        var value = this.model.get('value');
        var html = '';
        if (value === rdz.errors.AUTHOR) {
            html = '<a target="_blank" class="rds-value auth" href="http://www.recipdonor.com/"></a>';
        } else if (value === rdz.errors.BUNKRUPT) {
            html = '<a target="_blank" class="rds-value bankrupt" href="http://www.recipdonor.com/pay/"></a>';
        } else if (value && value.Dangerous) {
            for (var name in rdz.utils.Dangerous) {
                if (value.Dangerous.indexOf(name) !== -1) {
                    html += '<a target="_blank" class="rds-value ' + name + '" href="' + hrefs[name] + '"></a>';
                }
            }
        }

        rdz.$('.CheckDangerous').find('.rds-prm').html(html);
    }
};

window.rdz.view.Popup.CMS = {
    template: function (model) {
        return rdz.$('<div class="rds-prm"></div>');
    },
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
                sites: ['1C-Bitrix', '2z Project', 'CMS Made Simple', 'Amiro.CMS', 'BIGACE', 'XOOPS', 'BigDump', 'BPanel', 'Xevian', 'Bugzilla', 'Kentico CMS', 'KMStudio', 'cPanel', 'Kolibri CMS', 'Koobi', 'cutephp', 'MantisBT', 'MaxSite CMS', 'DirectAdmin', 'MediaWiki', 'Microsoft ASP.NET', 'DLE', 'MODx', 'Moogo', 'DokuWiki', 'Movable Type', 'Neocrome', 'DotNetNuke', 'Next Generation', 'openEngine', 'DreamWeaver', 'papaya CMS', 'Perl', 'Drupal', 'PHP-Fusion', 'phpPgAdmin', 'JS Developer', 'tryasko@gmail.com', 'PHP-Nuke', 'eZ Publish', 'Plesk', 'Plone', 'Flyspray', 'Ruxe', 'Redmine', 'FrontPage', 'S.Builder', 's9y', 'InstantCMS', 'SiteEdit', 'SLAED', 'InSales', 'sNews', 'SPIP', 'Joomla', 'SQL Buddy', 'Squarespace', 'swift.engine', 'Swiftlet', 'Textpattern CMS', 'Trac', 'TYPO3', 'TYPOlight', 'uCoz', 'Webalizer', 'WCPS', 'webEdition', 'WebGUI', 'WebPublisher', 'WikkaWiki', 'phpMyAdmin', 'e107'].join(' '),
                forums: ['vBulletin', 'phpBB', 'SMF', 'IPB', 'MyBB', 'punBB', 'Vanilla', 'FluxBB', 'YaBB', 'XMB', 'MiniBB', 'YAF'].join(' '),
                blogs: ['Envos', 'WordPress', 'Blogger', 'LiveInternet', 'LiveJournal', 'Tumblr', 'TypePad', 'posterous', 'Vox'].join(' '),
                shops: ['Magento', 'osCommerce', 'Prestashop', 'Zen Cart', 'xtCommerce', 'Ubercart', 'OpenCart', 'CS Cart', 'CubeCart', 'Vamshop', 'VP-ASP', 'osCSS'].join(' '),
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
                        html += '<a target="_blank" class="rds-value" href=""><img src="' + imgURL + '"></img></a>';
                    });
                    html += '</span>';
                }
            }

            rdz.$('.CMS').find('.rds-prm').html(html);
        }


    }
};

window.rdz.app = {
    popup: {
        parameters: new window.rdz.collection.popup.Parameters,
        history_counters: new window.rdz.collection.popup.History_Counters,
        view: new window.rdz.view.popup.App,
        appended: false
    }
};

//initialize first rendering. adding parameters-objects in Collection from "background" will fired rendering Bar
// rdz.app.popup.parameters.on("add", function () {
//     if (!rdz.app.popup.appended) rdz.app.popup.view.render();
// });
