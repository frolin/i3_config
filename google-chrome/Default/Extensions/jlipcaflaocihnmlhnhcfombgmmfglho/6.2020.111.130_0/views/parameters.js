if (!window.rdz.view) window.rdz.view = {};
/** @namespace namespace for basic classes which is extended by "content" or "popup" script classes */
if (!window.rdz.view.parameters) window.rdz.view.parameters = {};

/**@class Superclass for all parameters
 *
 * @property {Function} template creates html
 * @property {Function} valueChanged calls showResult and updates view through model's method valueChanged
 * @property {Function} showResult modifys html depending from value (update href, append values, etc.)
 * @property {Function} setHref sets URL (should returns false if set event handler for click)
 * @property {Function} checkError checks through list of exeptions, returns String to formatValue if value in exeption's list
 * @property {Function} formatValue first compares with null (null is default value, also is set when clearing cache) than with other possible values is being returned from parser
 * @property {Function} showCached add CSS class if "show cached" was turned on in options
 */
window.rdz.view.parameters.Parameter = rdz.Backbone.View.extend({
    tagName: 'div',
    className: 'rds-cnt',
    initialize: function () {
        this.model.on("change:value", this.valueChanged, this);
    },
    callParentMethod: function (a) {
        this.__proto__.__proto__[a.method].call(a.object, a.arg || arguments);
    },
    render: function () {
        var template = this.template(this.model);
        this.$el.append(template);
        return template !== null ? this.el : null;
    },
    template: function (model) {
        var name = model.get('name'),
            html = rdz.$(`<div class="rds-nm">${rdz.locale.parameters[name].name}</div><div class="rds-prm"><a target="_blank" class="rds-value">?</a></div><div class="rds-rate"><ins></ins></div>`);

        //this.el.setAttribute('title', rdz.locale.parameters[name].ttl);
        return html;
    },
    valueChanged: function () {
        this.model.valueChanged(this);
    },
    showCached: function (a) {
        a = a || {};
        a.parent = a.parent || this.el;

        if (this.isCached(a)) {
            rdz.$(a.parent).find(this.show_cached_el).addClass(a.class || 'rds-italic');
        }
        else {
            rdz.$(a.parent).find(this.show_cached_el).removeClass(a.class || 'rds-italic');
        }
    },
    show_cached_el: '.rds-prm',
    isCached: function (a) {
        var requests = this.model.get('requests'),
            cached = requests[a.name] ? requests[a.name].cached : requests.cached,
            value = this.model.get('value');
        return this.model.get('options').italic && (value && value[a.name] ? value[a.name] : value) !== null && cached;
    },
    setHref: function (id, href) {
        /** undefined when this.setHref calls from this.click (core/bar.js)
         * and null when clearing cache
         */
        if (typeof id === 'undefined' || href === null) return null;
        if (typeof id === 'string') id = { parent: this.el, child: id };
        rdz.$(id.parent).find(id.child).attr('href', href ? href : (this.model.get('requests').displayUrl ? this.model.get('requests').displayUrl : this.model.get('requests').serviceUrl));
    },
    checkError: function (value) {
        if (value === rdz.errors.GLUED) {
            value = rdz.locale.glued;
        }
        else if (value === rdz.errors.PARSE) {
            value = 'parse error';
        }
        else if (value === rdz.errors.CAPTCHA) {
            value = 'captcha';
        }
        else if (value === rdz.errors.APIOFF) {
            value = rdz.locale.api_off;
        }
        else if (value === rdz.errors.BUNKRUPT) {
            value = rdz.locale.bunkrupt;
        }
        else if (value === rdz.errors.AUTHOR) {
            value = rdz.locale.author;
        }
        else if (value === rdz.errors.ACCESS) {
            value = rdz.locale.no_access;
        }
        else if (value === rdz.errors.VIRUS) {
            value = rdz.locale.no_data;
        }
        else if (value === rdz.errors.AGS) {
            value = rdz.locale.ags;
        }
        else if
        (value === rdz.errors.HTTP || value === null) {
            value = '?';
        }


        return value;
    },
    formatValue: function (value) {
        return this.model.get('value') === null ? value : this.model.get('value') >= 0 ? rdz.utils.formatNumber.apply(value, [0, "", "\u2009"]) : value;
    },
    showResult: function () {
        this.setHref('.rds-value');
        var value = this.checkError(this.model.get('value'));
        this.$el.find('.rds-value').html(this.formatValue(value));
        this.showCached();
        this.apiError();
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
    },
    api_error_el: '.rds-prm'
});


window.rdz.view.parameters.IYD = {
    formatValue: function (value) {
        var data = this.model.get('value');
        return data === null ? '?' : data < 0 ? value : data == 0 ? 'Нет' : rdz.utils.prettyDate(new Date(value));
    }
};


window.rdz.view.parameters.IYDP = {
    formatValue: function (value) {
        var data = this.model.get('value');
        return data === null ? '?' : data < 0 ? value : data == 0 ? 'Нет' : rdz.utils.prettyDate(new Date(value));
    }
};


window.rdz.view.parameters.IYP = {
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
};

window.rdz.view.parameters.IG = {
    template: function (model) {
        var name = model.get('name'),
            html = rdz.$(`<div class="rds-nm">${rdz.locale.parameters[name].name + '(' + this.model.get('extra').domain_zone.active + ')'}</div>` +
                '<div class="rds-prm"><a target="_blank" class="rds-value_IG">?</a></div><div class="rds-rate"><ins></ins></div>');
                //'<div class="rds-prm"><a target="_blank" class="rds-value_IG">?</a> <span  class="rds-cnt_MIG">(<a target="_blank" class="rds-value_MIG rds-green">?</a>)</span></div><div class="rds-rate"><ins></ins></div>');

        //this.el.setAttribute('title', rdz.locale.parameters[name].ttl);
        // html[1].getElementsByClassName('rds-value_MIG')[0].setAttribute('title', rdz.locale.parameters.MIG.ttl);
        return html;
    },
    formatValue: function (value, val) {
        return value === null ? '?' :
                (value[val] >= 0 ? rdz.utils.formatNumber.apply(value[val], [0, "", "\u2009"]) : value[val]);
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
        //     this.$el.find('.rds-value_MIG').html(this.formatValue({IG: value_IG, MIG: value_MIG}, 'MIG'));
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
        this.apiError(value);
    }
};


window.rdz.view.parameters.IGP = {
    template: function (model) {
        var name = model.get('name'),
            html = rdz.$(`<div class="rds-nm">${rdz.locale.parameters[name].name}</div><div class="rds-prm"><a target="_blank" class="rds-value">?</a></div><div class="rds-rate"><ins></ins></div>`);

        //this.el.setAttribute('title', rdz.locale.parameters[name].ttl);
        return html;
    },
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
};


window.rdz.view.parameters.TYC = {
    template: function (model) {
        var name = model.get('name'),
            html = rdz.$(`<div class="rds-nm">${rdz.locale.bar.parameters[name].name}</div><div class="rds-prm"><a target="_blank" class="rds-value_TYC">?</a> <span class="cnt_value_TYCBar">(<a target="_blank" class="rds-value_TYCBar"></a>)</span></div><div class="rds-rate"><ins></ins></div>`);

        //this.el.setAttribute('title', rdz.locale.bar.parameters[name].ttl);
        return html;
    },
    formatValue: function (a) {
        var p = this.model.get('value');
        var value = p && p.TYC ? (a.model || p.TYC)[a.val] : p;
        return value === null ? a.value : rdz._.isNumber(value) && value >= 0 ? rdz.utils.formatNumber.apply(a.value, [0, "", "\u2009"]) :
            value === false ? '\u2014' : a.value;
    },
    showResult: function () {
        this.setHref('.rds-value_TYC', this.model.get('requests').TYC.serviceUrl);


        var value = this.model.get('value');
        var value_TYC = this.checkError(value && value.TYC ? value.TYC.TYC : value);
        this.$el.find('.rds-value_TYC').html(this.formatValue({value: value_TYC, val: 'TYC'}));

        this.showYaBarTYC(value);
        this.show_mirros(value);
        this.showCached();
    },
    showYaBarTYC: function (value) {
        //var YaBar = (window.rdz.app.content || window.rdz.app.popup).parameters.get('YaBar');
        if (value && value.YaBar) {
            var values_YaBar = value.YaBar,
                values_YaCatalog = value.TYC;

            if (values_YaCatalog && values_YaBar && values_YaBar.TYC !== values_YaCatalog.TYC) {
                this.setHref('.rds-value_TYCBar', this.model.get('requests').YaBar.serviceUrl);
                this.$el.find('.cnt_value_TYCBar').css({display: 'inline-block'})
                    .find('.rds-value_TYCBar').html(this.formatValue({
                        value: this.checkError(values_YaBar.TYC),
                        val: 'TYC',
                        model: values_YaBar
                    }));
            }

            var YT = (window.rdz.app.content || window.rdz.app.popup).parameters.get('YT'),
                value;

            if (YT) {
                value = this.model.get('value').YaBar;
                YT.set({
                    value: value === null ? null : value.topic,
                    requests: this.model.get('requests').YaBar
                });
            }
            var YR = (window.rdz.app.content || window.rdz.app.popup).parameters.get('YR');
            if (YR) {
                value = this.model.get('value').YaBar;
                YR.set({
                    value: value === null ? null : value.region,
                    requests: this.model.get('requests').YaBar
                });
            }
        }
        else {
            this.$el.find('.cnt_value_TYCBar').css({display: 'none'});
        }
    },
    show_mirros: function (value) {
        if (value && value.MirrorsCount > 0) {
            this.$el.find('.rds-value_TYC').addClass('rds-red');
        } else {
            this.$el.find('.rds-value_TYC').removeClass('rds-red');
        }
    },
    isCached: function (a) {
        var requests = this.model.get('requests'),
            value = this.model.get('value');

        return this.model.get('options').italic && value !== null && value.TYC && rdz._.isNumber(value.TYC.TYC) && requests['TYC'] && requests['TYC'].cached;
    }
};


window.rdz.view.parameters.YaBar = {
    showResult: function () {
        var value = this.model.get('value');

        if (value) {
            this.setHref('.rds-value', this.model.get('requests').serviceUrl);
            this.$el.find('.rds-value').html(this.formatValue(this.checkError(value.TYC)));
            this.showCached({name: 'YaBar'});

            var YT = (window.rdz.app.content || window.rdz.app.popup).parameters.get('YT');
            if (YT) {
                YT.set({
                    value: value === null ? null : value.topic,
                    requests: this.model.get('requests')
                });
            }

            var YR = (window.rdz.app.content || window.rdz.app.popup).parameters.get('YR');
            if (YR) {
                YR.set({
                    value: value === null ? null : value.region,
                    requests: this.model.get('requests')
                });
            }
        }
    }
};

window.rdz.view.parameters.YT = {
    formatValue: function (value) {
        return this.model.get('value') === false ? rdz.locale.no : value;
    }
};

window.rdz.view.parameters.Subdomains = {
    formatValue: function (value) {
        var v = this.model.get('value');
        return v === null || v < 0 ? value : v === 0 ? "\u2014" : rdz.utils.formatNumber.apply(value, [0, "", "\u2009"]);
    }
};

window.rdz.view.parameters.YR = window.rdz.view.parameters.YT;

window.rdz.view.parameters.PR = {
    template: function (model) {
        var name = model.get('name'),
            html = rdz.$(`<div class="rds-nm">${rdz.locale.bar.parameters[name].name}</div><div class="rds-prm"><a target="_blank" class="rds-value_PR">?</a> <span class="cnt_value_PRMain">(<a target="_blank" class="rds-value_PRMain"></a>)</span></div><div class="rds-rate"><ins></ins></div>`);

        // this.el.setAttribute('title', rdz.locale.bar.parameters[name].ttl);
        // rdz.$('.rds-value_PRMain', html[1]).attr('title', rdz.locale.bar.parameters.PR.PRMain);
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
            this.$el.find('.cnt_value_PRMain').css({display: p === null ? 'none' : 'inline-block'}).find('.rds-value_PRMain').html(formated.PRMain);

            //highlight RED
            if (p !== null && p.PRgMain && p.PRgMain === rdz.errors.CAPTCHA) this.$el.find('.rds-value_PRMain').addClass('rds-red');
            else this.$el.find('.rds-value_PRMain').removeClass('rds-red');
        }

        this.showCached({name: 'PR', class: 'rds-italic_PR'});
        this.showCached({name: 'PRMain', class: 'rds-italic_PRMain'});

        if (typeof this.title === 'function') {
            this.title(['PR', 'PRg']);
            this.title(['PRMain', 'PRgMain']);
        }
    }
};


window.rdz.view.parameters.Dmoz = {
    formatValue: function (value) {
        return this.model.get('value') === false ? rdz.locale.no : value;
    }
};


window.rdz.view.parameters.WA = {
    formatValue: function (value) {
        var v = this.model.get('value');
        return v > 0 ? window.rdz.utils.prettyDate(value, {
            withoutDays: true,
            year: true
        }) : v === rdz.errors.PARSE ? '?' : (v === 0 ? rdz.locale.no : value);
    }
};


window.rdz.view.parameters.MozRank = {

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

};

window.rdz.view.parameters.SeoM = {
    template: function (model) {
        var name = model.get('name'),
            html = rdz.$(`<div class="rds-nm">${rdz.locale.parameters[name].name}</div><div class="rds-prm"><div class="rds-rate"><ins></ins></div><a target="_blank" class="rds-value_in">?</a> <span class="rdz-cnt_value">(<a target="_blank" class="rds-value_out">?</a>)</span></div></div>`);

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
        if (value_page && typeof value_page !== 'string') {
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
};

window.rdz.view.parameters.Age = {
    template: function (model) {
        var name = model.get('name'),
            html = rdz.$(`<div class="rds-nm">${rdz.locale.parameters[name].name}</div><div class="rds-prm Age"><a target="_blank" class="rds-value">?</a></div><div class="rds-rate"><ins></ins></div>`);

        return html;
    },
    formatValue: function (value) {
        var data = this.model.get('value');
        return data === null || data < 0 ? value : data === 0 ? rdz.locale.unknown : rdz.utils.prettyDate(new Date(value), {
            withoutDays: true,
            year: true
        });
    },
    showResult: function () {
        var value = this.model.get('value');
        var date = this.checkError(value);
        if (value === rdz.errors.AUTHOR || value === rdz.errors.BUNKRUPT) {
            this.$el.find('.rds-value').addClass('rds-red');
        }
        this.$el.find('.rds-value').html(this.formatValue(date));
        this.showCached();
    }
};

window.rdz.view.parameters.Majestic = {
    template: function (model) {
        var name = model.get('name'),
            html = rdz.$(`<div class="rds-nm">${rdz.locale.parameters[name].name}</div><div class="rds-prm"><div class="rds-rate"><ins></ins></div><a target="_blank" class="rds-value_in">?</a> <span class="rdz-cnt_value">(<a target="_blank" class="rds-value_out">?</a>)</span></div></div>`);

        return html;
    },
    formatValue: function (value, val) {
        var data = this.model.get('value');
        return data !== null ? rdz.utils.formatNumber.apply(value, [0, "", "\u2009"]) : value;
    },
    showResult: function () {
        this.setHref('.rds-value_in', this.model.get('requests').displayUrl);
        this.setHref('.rds-value_out', this.model.get('requests').displayUrl);
        var value = this.model.get('value');
        var value_urlefd = this.checkError(value ? value.urlrefd : value);
        this.$el.find('.rds-value_in').html(this.formatValue(value_urlefd, 'urlefd'));
        if (value !== null) {
            var value_refd = this.checkError(value ? value.refd : value);
            this.$el.find('.rds-value_out').html(this.formatValue(value_refd, 'refd'));
            this.$el.find('.rdz-cnt_value').css({display: 'inline-block'});
        }
        else {
            this.$el.find('.rdz-cnt_value').hide();
        }

        this.showCached({name: 'Majestic'});
    }
};

window.rdz.view.parameters.CF = {
    template: function (model) {
        var name = model.get('name'),
            html = rdz.$(`<div class="rds-nm">${rdz.locale.parameters[name].name}</div><div class="rds-prm"><div class="rds-rate"><ins></ins></div><a target="_blank" class="rds-value_in">?</a> <span class="rdz-cnt_value">(<a target="_blank" class="rds-value_out">?</a>)</span></div></div>`);

        return html;
    },
    formatValue: function (value, val) {
        var data = this.model.get('value');
        return data !== null ? rdz.utils.formatNumber.apply(value, [0, "", "\u2009"]) : value;
    },
    showResult: function () {
        this.setHref('.rds-value_in', this.model.get('requests').Majestic.displayUrl);
        this.setHref('.rds-value_out', this.model.get('requests').Majestic.displayUrl);
        var value = this.model.get('value');
        var value_urlcf = this.checkError(value ? value.Majestic.urlcf : value);
        this.$el.find('.rds-value_in').html(this.formatValue(value_urlcf, 'urlcf'));
        if (value !== null) {
            var value_cf = this.checkError(value ? value.Majestic.cf : value);
            this.$el.find('.rds-value_out').html(this.formatValue(value_cf, 'cf'));
            this.$el.find('.rdz-cnt_value').css({display: 'inline-block'});
        } else {
            this.$el.find('.rdz-cnt_value').hide();
        }

        this.showCached({name: 'Majestic'});
    }
};


window.rdz.view.parameters.TF = {
    template: function (model) {
        var name = model.get('name'),
            html = rdz.$(`<div class="rds-nm">${rdz.locale.parameters[name].name}</div><div class="rds-prm"><div class="rds-rate"><ins></ins></div><a target="_blank" class="rds-value_in">?</a> <span class="rdz-cnt_value">(<a target="_blank" class="rds-value_out">?</a>)</span></div></div>`);

        return html;
    },
    formatValue: function (value, val) {
        var data = this.model.get('value');
        //return data > 0 ? rdz.utils.formatNumber.apply(data[val], [0, "", "\u2009"]) : value;
        return data !== null ? rdz.utils.formatNumber.apply(value, [0, "", "\u2009"]) : value;
    },
    showResult: function () {
        this.setHref('.rds-value_in', this.model.get('requests').Majestic.displayUrl);
        this.setHref('.rds-value_out', this.model.get('requests').Majestic.displayUrl);
        var value = this.model.get('value');
        var value_urltf = this.checkError(value ? value.Majestic.urltf : value);
        this.$el.find('.rds-value_in').html(this.formatValue(value_urltf, 'urltf'));

        if (value !== null) {
            var value_tf = this.checkError(value ? value.Majestic.tf : value);
            this.$el.find('.rds-value_out').html(this.formatValue(value_tf, 'tf'));
            this.$el.find('.rdz-cnt_value').css({display: 'inline-block'});
        } else {
            this.$el.find('.rdz-cnt_value').hide();
        }

        this.showCached({name: 'Majestic'});
    }
};

//window.rdz.view.parameters.Ahrefs = {
//    formatValue: function(value, val) {
//        var p = this.model.get('value');
//        return p === null ? value : value[val] >= 0 ? rdz.utils.formatNumber.apply(value[val], [0, "", "\u2009"]) : "\u2014";
//    },
//    showResult: function() {
//        this.setHref('.rds-value', this.model.get('requests').Ahrefs.displayUrl);
//        
//        var value = this.model.get('value');
//        var value_ahrefs = this.checkError(value ? value.Ahrefs : value);
//        this.$el.find('.rds-value').html(this.formatValue(value_ahrefs, 'referring_domains'));
//        this.showCached({name: 'Ahrefs'});
//    }
//};

window.rdz.view.parameters.AhrefsTB = {
    template: function (model) {
        var name = model.get('name'),
            locale = rdz.locale.bar.tooltips[name],
            html = rdz.$(
            '<div class="rds-ahrefs-Page">' +
                `<div class="rds-nm">${locale.Page.name}</div>` +
                '<div class="rds-prm">' +
                    '<span class="rds-sw-value">AR:</span><a target="_blank" class="rds-value_ar">?</a> ' +
                    '<span class="rds-sw-value">BL:</span><a target="_blank" class="rds-value_bl">?</a> ' +
                    '<span class="rds-sw-value">RD:</span><a target="_blank" class="rds-value_rd rds-green">?</a> ' +
                '</div>' +
            '</div>' +

            '<div class="rds-ahrefs-Domain">' +
                `<div class="rds-nm">${locale.Domain.name}</div>` +
                '<div class="rds-prm">' +
                    '<span class="rds-sw-value">DR:</span><a target="_blank" class="rds-value_dr">?</a> ' +
                    '<span class="rds-sw-value">BL:</span><a target="_blank" class="rds-value_bl">?</a> ' +
                    '<span class="rds-sw-value">RD:</span><a target="_blank" class="rds-value_rd rds-green">?</a> ' +
                '</div>' +
            '</div>' +
            '<div class="rds-rate"><ins></ins></div>'
            );

        return html;
    },
    formatValue: function (value) {
        let v = this.model.get('value'),
            s = '';

            if (value / 1000000 >= 1) {
                value = Math.ceil(value / 100000) / 10;
                s = 'M';
            } else if (value / 1000 >= 1) {
                value = Math.ceil(value / 100) / 10;
                s = 'K';
            }

        return v === null ? value : (typeof value === 'number' ? rdz.utils.formatNumber.apply(Math.floor(value), [0, "", "\u2009"]) + s : value);
    }
};

window.rdz.view.parameters.AhrefsPage = {
    template: function (model) {
        var name = model.get('name'),
            html = rdz.$(`<div class="rds-nm">${rdz.locale.parameters[name].name}</div>` +
            '<div class="rds-prm">' +
            '<span>AR:</span><a target="_blank" class="rds-value_ar">?</a> ' +
            '<span>BL:</span><a target="_blank" class="rds-value_bl">?</a> ' +
            '<span>RD:</span><a target="_blank" class="rds-value_rd rds-green">?</a> ' +
            '</div>' +
            '<div class="rds-rate"><ins></ins></div>');

        return html;
    },
    formatValue: function (value) {
        var val = this.model.get('value');
        return val === null ? '?' : value >= 0 ? rdz.utils.formatNumber.apply(Math.floor(value), [0, "", "\u2009"]) : value;
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
};

window.rdz.view.parameters.AhrefsDomain = {
    template: function (model) {
        var name = model.get('name'),
            html = rdz.$(`<div class="rds-nm">${rdz.locale.parameters[name].name}</div>` +
            '<div class="rds-prm">' +
            '<span>DR:</span><a target="_blank" class="rds-value_dr">?</a> ' +
            '<span>BL:</span><a target="_blank" class="rds-value_bl">?</a> ' +
            '<span>RD:</span><a target="_blank" class="rds-value_rd rds-green">?</a> ' +
            '</div>' +
            '<div class="rds-rate"><ins></ins></div>');

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
};

window.rdz.view.parameters.Alexa = {
    template: function (model) {
        var name = model.get('name'),
            html = rdz.$(`<div class="rds-nm">${rdz.locale.parameters[name].name}</div><div class="rds-prm"><a target="_blank" class="rds-value_popularity">?</a> ` +
            '<span class="cnt_value_regional">(<a target="_blank" class="rds-value_regional">?</a>)</span></div><div class="rds-rate"><ins></ins></div>');

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
};

window.rdz.view.parameters.BackA = {
    formatValue: function (value) {
        var v = this.model.get('value');
        return v === null ? value : v === 0 ? rdz.locale.no : v > -1 ? rdz.utils.formatNumber.apply(v, [0, "", "\u2009"]) : v === -1 ? rdz.locale.glued : value;
    }
};


window.rdz.view.parameters.YaBlogs = {
    template: function (model) {
        var name = model.get('name'),
            html = rdz.$('<div class="rds-nm">${rdz.locale.parameters[name].name}</div><div class="rds-prm"><a target="_blank" class="rds-value_authority">?</a> <span class="cnt_value_readers">(<a target="_blank" class="rds-value_readers">?</a>)</span></div><div class="rds-rate"><ins></ins></div>');

        //this.el.setAttribute('title', rdz.locale.parameters[name].ttl);
        return html;
    },
    formatValue: function (value, val) {
        var p = this.model.get('value');
        return p === null ? value : this.model.get('value')[val] === null ? '\u2014' : this.model.get('value')[val] >= 0 ? rdz.utils.formatNumber.apply(value, [0, "", "\u2009"]) : value;
    },
    showResult: function () {
        this.setHref('.rds-value_authority');
        this.setHref('.rds-value_readers');
        var value = this.model.get('value');
        var value_authority = this.checkError(value ? value.authority : value),
            value_readers = this.checkError(value ? value.readers : value);

        this.$el.find('.rds-value_authority').html(this.formatValue(value_authority, 'authority'));
        if (value && value.authority >= 0 && value.authority !== null) {
            this.$el.find('.cnt_value_readers').css({display: 'inline-block'}).find('.rds-value_readers').html(this.formatValue(value_readers, 'readers'));
        }
        else {
            this.$el.find('.cnt_value_readers').css({display: 'none'});
        }

        this.showCached();
    }
};
window.rdz.view.parameters.SemRush = {
    template: function (model) {
        var name = model.get('name'),
            sz = this.model.get('extra').semrush_zone,
            html = rdz.$(`<div class="rds-nm">${rdz.locale.parameters[name].name + '(.' + (sz && sz.active) + ')'}</div>` +
            '<div class="rds-prm">' +
            '<div class="rds-rate"><ins></ins></div>' +
            '<a target="_blank" class="rds-value">' +
            '<div class="rds-value_rank">?</div>' +
            '<div class="rdz-cnt_value">/' +
            '<div class="rds-value_traffic"></div> ' +
            '<div class="rdz-cnt_value2">($<div class="rds-value_costs"></div>)</div> ' +
            '</div>' +
            '</a>' +
            '</div>');

        return html;
    },
    formatValue: function (value) {
        var data = this.model.get('value');
        return data === null ? '?' : value !== 0 ? rdz.utils.formatNumber.apply(value, [0, "", "\u2009"]) : value;
    },
    showResult: function () {
        this.setHref('.rds-value', this.model.get('requests').displayUrl);
        var value = this.model.get('value');
        var value_costs = this.checkError(value ? value.costs : value);
        var value_rank = this.checkError(value ? value.rank : value);
        var value_traffic = this.checkError(value ? value.traffic : value);

        if (value == 0 || value === null) {
            this.$el.find('.rdz-cnt_value').css({display: 'none'});
            this.$el.find('.rdz-cnt_value2').css({display: 'none'});
            this.$el.find('.rds-value_rank').html(this.formatValue(value_rank));
        }
        else {
            if (value_costs > 0) {
                this.$el.find('.rds-value_costs').html(this.formatValue(value_costs));
                this.$el.find('.rdz-cnt_value2').css({display: 'inline-block'});
            }

            this.$el.find('.rds-value_rank').html(this.formatValue(value_rank));
            this.$el.find('.rds-value_traffic').html(this.formatValue(value_traffic));
            this.$el.find('.rdz-cnt_value').css({display: 'inline-block'});
        }
        this.showCached({name: 'SemRush'});

    }
};
window.rdz.view.parameters.Pictures = {


    template: function (model) {
        var name = model.get('name'),
            html = rdz.$(`<div class="rds-nm">${rdz.locale.parameters[name].name}</div>` +
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
        var requests = this.model.get('requests');

        this.setHref('.rds-value_Go', this.model.get('requests')['Pictures'].serviceUrl);
        //this.setHref('.rds-value_Ao', this.model.get('requests')['PicturesAol'].serviceUrl);

        //show PicturesYa if not "en" locale
        if (this.model.get('requests')['PicturesYa']) {
            this.setHref('.rds-value_Ya', this.model.get('requests')['PicturesYa'].serviceUrl);
            this.$el.find('.rdz-cnt_value').css({'display': 'inline-block'});
        }

        var v = this.model.get('value');

        var value_Go = this.checkError(v ? v.Pictures : v),
            value_Ya = this.checkError(v && rdz._.isNumber(v.PicturesYa) ? v.PicturesYa : v)/*,
         value_Ao = this.checkError(v ? v.PicturesAol : v)*/;

        this.$el.find('.rds-value_Go').html(this.formatValue(value_Go));
        this.$el.find('.rds-value_Ya').html(this.formatValue(value_Ya));
        /*this.$el.find('.rds-value_Ao').html(this.formatValue(value_Ao));*/

        //this.showCached({name: 'Pictures'});
        for (let request in requests) {
            this.showCached({name: request, class: 'rds-italic_' + request});
        }
    }

};

window.rdz.view.parameters.Aggregators = {
    template: function (model) {
        var name = model.get('name'),
            html = rdz.$(`<div class="rds-nm">${rdz.locale.parameters[name].name}</div>` +
            '<div class="rds-prm">' +
            '<a target="_blank" class="rds-value">?</a>' +
            '<a target="_blank" class="rds-value_Ya rds-red">Я </a>' +
            '<a target="_blank" class="rds-value_Go rds-blue">G </a>' +
            '<a target="_blank" class="rds-value_Bi rds-black">B </a>' +
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
            value_Bi = this.checkError(v ? v.AggregatorsBing : v),
            //value_No = this.checkError(v ? v.AggregatorsNovoteka : v),
            requests = this.model.get('requests');

        this.$el.find('.rds-value_Ya').html(this.formatValue(value_Ya, 'Я') + ' ')
            .css({'display': value_Ya.value > 0 || value_Ya === 'captcha' ? 'inline' : 'none'});
        this.$el.find('.rds-value_Go').html(this.formatValue(value_Go, 'G') + ' ')
            .css({'display': value_Go.value > 0 || value_Go === 'captcha' ? 'inline' : 'none'});
        this.$el.find('.rds-value_Bi').html(this.formatValue(value_Bi, 'B') + ' ')
            .css({'display': value_Bi.value > 0 || value_Bi === 'captcha' ? 'inline' : 'none'});
        // this.$el.find('.rds-value_No').html(this.formatValue(value_No, 'N') + ' ')
        //     .css({'display': value_No.value > 0 || value_No === 'captcha' ? 'inline' : 'none'});

        this.$el.find('.rds-value').html(value_Ya.value === 0 && value_Go.value === 0 && value_Bi.value === 0 /*&& value_No.value === 0*/ ? '\u2014' : '?')
            .css({
                'display': value_Ya.value > 0 || value_Ya === 'captcha' ||
                value_Go.value > 0 || value_Go === 'captcha' ||
                value_Bi.value > 0 || value_Bi === 'captcha' ||
                //value_No.value > 0 || value_No === 'captcha' ||
                (value_Ya === 0 && value_Go === 0 && value_Bi === 0/* && value_No === 0*/) ?
                    'none' : 'inline'
            });

        //this.showCached({name: 'AggregatorsNovoteka'});
        for (let request in requests) {
            this.showCached({name: request, class: 'rds-italic_' + request});
        }
    }
};

window.rdz.view.parameters.ISolomono = {
    // override to show without rate
    template: function (model) {
        var name = model.get('name'),
            html = rdz.$(`<div class="rds-nm">${rdz.locale.parameters[name].name}</div><div class="rds-prm"><a target="_blank" class="rds-value">?</a></div>`);

        return html;
    },
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
};

window.rdz.view.parameters.Solomono = {
    template: function (model) {
        var name = model.get('name'),
            html = rdz.$(`<div class="rds-nm">${rdz.locale.parameters[name].name}</div><div class="rds-prm"><a target="_blank" class="rds-value_in rds-green">?</a>/<a target="_blank" class="rds-value_out rds-red">?</a></div></div>`);

        // this.el.setAttribute('title', rdz.locale.parameters[name].ttl);
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
};

window.rdz.view.parameters.SimilarWeb = {
    template: function (model) {
        var name = model.get('name'),
            locale = rdz.locale.bar.tooltips[name],
            html = rdz.$('<div class="rds-prm SimilarWeb">' +
                `<div class="rds-sw-Visits"><a target="_blank" class="rds-sw-link">${locale.Visits.name}<span class="rds-sw-value">?</span></a></div>` +
                `<div class="rds-sw-TimeOnSite"><a target="_blank" class="rds-sw-link">${locale.TimeOnSite.name}<span class="rds-sw-value">?</span></a></div>` +
                `<div class="rds-sw-PagePerVisit"><a target="_blank" class="rds-sw-link">${locale.PagePerVisit.name}<span class="rds-sw-value">?</span></a></div>` +
                `<div class="rds-sw-BounceRate"><a target="_blank" class="rds-sw-link">${locale.BounceRate.name}<span class="rds-sw-value">?</span></a></div>` +
                `<div class="rds-sw-CountryShares"><a target="_blank" class="rds-sw-link">${locale.CountryShares.name}<span class="rds-sw-value">?</span></a></div>` +
                `<div class="rds-sw-Sources"><a target="_blank" class="rds-sw-link">${locale.Sources.name}<span class="rds-sw-value">?</span></a></div>` +
                // `<div class="rds-sw-Referrals">` +
                //     `<div class="rds-sw-Referring" style="display: flex; margin: 0px;"><a target="_blank" class="rds-sw-link">${locale.Referring.name}<span class="rds-sw-value">?</span></a></div>` +
                //     `<div class="rds-sw-Destinations" style="float: left; margin: 0px;"><a target="_blank" class="rds-sw-link">${locale.Destinations.name}<span class="rds-sw-value">?</span></a></div>` +
                // `</div>` +
                // `<div class="rds-sw-OrganicKeywords"><a target="_blank" class="rds-sw-link">${locale.OrganicKeywords.name}<span class="rds-sw-value">?</span></a></div>` +
                '</div>');

        return html;
    },
    formatValue: function (value) {
        var v = this.model.get('value');
        return v === null ? value : (typeof value === 'number' ? rdz.utils.formatNumber.apply(value, [0, "", "\u2009"]) : value);
    }
};

window.rdz.view.parameters.Webmoney = {
    // override to show without rate
    template: function (model) {
        var name = model.get('name'),
            html = rdz.$(`<div class="rds-nm">${rdz.locale.parameters[name].name}</div><div class="rds-prm"><a target="_blank" class="rds-value">?</a></div>`);

        return html;
    },
    formatValue: function (value) {
        var v = this.model.get('value');
        if (v === null) {
            return value;
        } else if (v.WMAdvisor || v.Webmoney) {
            var html = '';

            if (v.WMAdvisor.iconType || v.Webmoney) {
                var iconTypes = ['grey', 'green', 'yello', 'service'];
                var icon = iconTypes[v.WMAdvisor.iconType];

                if (icon === 'grey' && v.Webmoney > 0) icon = 'service';

                let imgURL = chrome.extension.getURL('icons/webmoney/webmoney_' + icon + '.png');
                html += '<img class="rds-value-webmoney-icon" src="' + imgURL + '"></img>';
            }

            if (v.WMAdvisor.danger) {
                let imgURL = chrome.extension.getURL('icons/webmoney/webmoney_danger.png');
                html += '<img class="rds-value-webmoney-icon" src="' + imgURL + '"></img>';
            }

            if (v.WMAdvisor.feedbacksGT || v.WMAdvisor.feedbacksLT) {
                html += '<span class="rds-value-webmoney-feedbacks_gt rds-green">+' + v.WMAdvisor.feedbacksGT + '</span>';
                html += '<span class="rds-value-webmoney-feedbacks_lt rds-red">-' + v.WMAdvisor.feedbacksLT + '</span>';
            }

            if (!v.Webmoney && !v.WMAdvisor.iconType && !v.WMAdvisor.danger && !v.WMAdvisor.feedbacksGT && !v.WMAdvisor.feedbacksLT
            ) {
                html = '\u2014';
            }

            return html;

        } else {
            return '\u2014';
        }

        return v === null ? value : v;
    },
    showResult: function () {
        this.setHref('.rds-value');
        var value = this.checkError(this.model.get('value'));
        this.$el.find('.rds-value').html(this.formatValue(value));
        this.showCached();
        this.apiError();
    }
};

window.rdz.view.parameters.IPSitesCount = {
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
};

window.rdz.view.parameters.Geo = {
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
            this.$el.find('.rds-prm').prepend('<img src="' + imgURL + '"></img>');
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
};

window.rdz.view.parameters.Host = {
    showResult: function () {
        var v = this.model.get('value');

        var host = this.checkError(v ? v.host : v);
        this.$el.find('.rds-value').html(this.formatValue(host));
        this.setHref('.rds-value');
        this.showCached();
        this.apiError();
    },
    apiError: window.rdz.view.parameters.Geo.apiError
};

window.rdz.view.parameters.Provider = {
    showResult: function () {
        var v = this.model.get('value');

        var provider = this.checkError(v ? v.provider : v);
        this.$el.find('.rds-value').html(this.formatValue(provider));
        this.setHref('.rds-value');
        this.showCached();
        this.apiError();
    },
    apiError: window.rdz.view.parameters.Geo.apiError
};

window.rdz.view.parameters.UniqueContent = {
    formatValue: function (value) {
        var v = this.model.get('value');
        return v === null ? 'Уник' : v === rdz.errors.HARDSITE ? '\u2014' : v && typeof v.Percent !== 'undefined' ? Math.round(v.Percent) + '%' : value;
    },
    showResult: function () {
        var v = this.model.get('value'),
            percent,
            className;

        this.setHref('.rds-value');
        var value = this.checkError(v);
        this.$el.find('.rds-value').html(this.formatValue(value));

        this.$el.find('.rds-value').removeClass('rds-green rds-red');
        if (v && v.Percent) {
            percent = Math.round(v.Percent);
            className = percent > 80 ? 'rds-green' : percent < 40 ? 'rds-red' : '';
            this.$el.find('.rds-value').addClass(className);
        }

        this.showCached();
        this.apiError();
    }
};

window.rdz.view.parameters.Prodvigator = {
    className: 'rds-cnt rds-icons',
    template: function (model) {
        return rdz.$('<div class="rds-prm"><div class="rds-icon-element">' +
        '<div class="rds-icon-element-item"><a target="_blank" class="rds-icon-element-icon"></a> <span class="rds-value"></span></div>' +
        '</div></div>');
    },
    formatValue: function (value) {
        var v = this.model.get('value'),
            yandex_active = this.model.get('extra').prodvigator_yandex.active,
            google_active = this.model.get('extra').prodvigator_google.active,
            daily_traffic = this.model.get('extra').daily_traffic.active,
            result = value;

        if (v) {
            if (value.Prodvigator_y_traff === rdz.errors.AUTHOR ||
                value.Prodvigator_y_count === rdz.errors.AUTHOR ||
                value.Prodvigator_y_visible === rdz.errors.AUTHOR ||
                value.Prodvigator_g_traff === rdz.errors.AUTHOR ||
                value.Prodvigator_g_count === rdz.errors.AUTHOR ||
                value.Prodvigator_g_visible === rdz.errors.AUTHOR) {
                result = rdz.locale.author;
            } else {
                result = '';

                if (yandex_active) {
                    result += '<span class="rds-red">Я</span>:<a target="_blank" class="rds-icon-element-small-icon prodvigator-user"></a>' +
                    '<span class="rds-prodvigator-value">' + rdz.utils.formatNumber.apply(daily_traffic ? Math.round(value.Prodvigator_y_traff / 30) : value.Prodvigator_y_traff, [0, '', '\u2009']) + '</span>' +
                    '<a target="_blank" class="rds-icon-element-small-icon prodvigator-silver_cup"></a>' + '<span class="rds-prodvigator-value">' + rdz.utils.formatNumber.apply(value.Prodvigator_y_count, [0, '', '\u2009']) + '</span>' +
                    '<a target="_blank" class="rds-icon-element-small-icon prodvigator-loupe"></a>' + '<span class="rds-prodvigator-value">' + value.Prodvigator_y_visible + '</span>';
                }

                if (google_active) {
                    result += '<span class="rds-blue">G</span>:<a target="_blank" class="rds-icon-element-small-icon prodvigator-user"></a>' +
                    '<span class="rds-prodvigator-value">' + rdz.utils.formatNumber.apply(daily_traffic ? Math.round(value.Prodvigator_g_traff / 30) : value.Prodvigator_g_traff, [0, '', '\u2009']) + '</span>' +
                    '<a target="_blank" class="rds-icon-element-small-icon prodvigator-silver_cup"></a>' + '<span class="rds-prodvigator-value">' + rdz.utils.formatNumber.apply(value.Prodvigator_g_count, [0, '', '\u2009']) + '</span>' +
                    '<a target="_blank" class="rds-icon-element-small-icon prodvigator-loupe"></a>' + '<span class="rds-prodvigator-value">' + value.Prodvigator_g_visible + '</span>';
                }
            }
        }

        return result;
    },
    showResult: function () {
        //this.setHref('.rds-value');
        var value = this.checkError(this.model.get('value'));
        var requests = this.model.get('requests');
        this.$el.find('.rds-value').html(this.formatValue(value));
        for (let request in requests) {
            this.showCached({name: request, class: 'rds-italic_' + request});
        }
    }
};

window.rdz.view.parameters.SpyWords = {
    className: 'rds-cnt rds-icons',
    template: function (model) {
        return rdz.$('<div class="rds-prm"><div class="rds-icon-element">' +
        '<div class="rds-icon-element-item"><a target="_blank" class="rds-icon-element-icon"></a> <a target="_blank" class="rds-value"></a></div>' +
        '</div></div>');
    },
    formatValue: function (value) {
        var v = this.model.get('value'),
            daily_traffic = this.model.get('extra').daily_traffic.active;
        return rdz._.isObject(value) ? '<span class="rds-red">Я</span>:<a target="_blank" class="rds-icon-element-small-icon spywords-user"></a>' +
        rdz.utils.formatNumber.apply(daily_traffic ? Math.round(value.yandexTraffic / 30) : value.yandexTraffic, [0, '', '\u2009']) +
        '<a target="_blank" class="rds-icon-element-small-icon spywords-gold_cup"></a>' + rdz.utils.formatNumber.apply(value.yandexTopQueries, [0, '', '\u2009']) +
        '<a target="_blank" class="rds-icon-element-small-icon spywords-silver_cup"></a>' + rdz.utils.formatNumber.apply(value.yandexQueries, [0, '', '\u2009']) +
        '<span class="rds-blue">G</span>:<a target="_blank" class="rds-icon-element-small-icon spywords-user"></a>' +
        rdz.utils.formatNumber.apply(daily_traffic ? Math.round(value.googleTraffic / 30) : value.googleTraffic, [0, '', '\u2009']) +
        '<a target="_blank" class="rds-icon-element-small-icon spywords-gold_cup"></a>' + rdz.utils.formatNumber.apply(value.googleTopQueries, [0, '', '\u2009']) +
        '<a target="_blank" class="rds-icon-element-small-icon spywords-silver_cup"></a>' + rdz.utils.formatNumber.apply(value.googleQueries, [0, '', '\u2009'])
            : value;
    },
    setHref: function () {
    }
};

window.rdz.view.parameters.LIO = {
    template: function (model) {
        var name = model.get('name'),
            html = rdz.$(`<div class="rds-nm">${rdz.locale.parameters[name].name}</div><div class="rds-prm"><a target="_blank" class="rds-value_in rds-green">?</a>/<a target="_blank" class="rds-value_out rds-red">?</a></div></div>`);

        return html;
    },
    formatValue: function (value, val) {
        var v = this.model.get('value');
        return v === null ? value : v === rdz.errors.HARDSITE ? '-' : v[val].length >= 0 ? rdz.utils.formatNumber.apply(value.length, [0, "", "\u2009"]) : value;
    },
    showResult: function () {
        this.setHref('.rds-value_in', this.model.get('requests').displayUrl);
        this.setHref('.rds-value_out', this.model.get('requests').displayUrl);

        var value = this.model.get('value');
        var value_in = this.checkError(value ? value.innerLinks : value),
            value_out = this.checkError(value ? value.outerLinks : value);
        this.$el.find('.rds-value_in').html(this.formatValue(value_in, 'innerLinks'));
        this.$el.find('.rds-value_out').html(this.formatValue(value_out, 'outerLinks'));
        this.showCached();
    }
};

window.rdz.view.parameters.SocialNetworks = {
    formatValue: function (value) {
        var v = this.model.get('value');
        return v === null ? value : (typeof value === 'number' ? rdz.utils.formatNumber.apply(value, [0, "", "\u2009"]) : value);
    }
};

window.rdz.view.parameters.Validation = {
    formatValue: function (value) {
        var p = this.model.get('value');
        return p === null ? value : (p.value ? rdz.locale.yes : rdz.locale.no);
    }
};

window.rdz.view.parameters.RSS = {
    className: 'rds-cnt rds-icons',
    template: function (model) {
        var html = rdz.$('<div class="rds-prm"><a target="_blank" class="rds-value"></a></div></div>'),
            name = model.get('name');

        rdz.$(html).find('.rds-value').addClass(name);
        return html;
    },
    formatValue: function (value) {
        var v = this.model.get('value');
        return !v ? 'none' : (v.length ? 'yes' : 'no');
    },
    showResult: function () {
        var value = this.model.get('value');
        if (value !== null) {
            this.$el.find('.rds-value').addClass(this.formatValue(this.checkError(value)));
        }
        else {
            this.$el.find('.rds-value').removeClass('yes no none');
        }
    }
};

window.rdz.view.parameters.CMS = {};

window.rdz.view.parameters.StatHistory = {
    formatValue: function (value) {
        var v = this.model.get('value');
        return v === null ? rdz.locale.parameters.StatHistory.value :
            v === rdz.errors.RECEIVING ? '...' :
            v === rdz.errors.HARDSITE ? '\u2014' :
            v.length === 0 ? '—' :
            rdz._.isArray(v) ? rdz.utils.formatNumber.apply(v[v.length - 1].Value, [0, "", "\u2009"]) :
            value;
    },
    showResult: function () {
        var v = this.model.get('value');

        this.setHref('.rds-value');
        var value = this.checkError(v);
        this.$el.find('.rds-value').html(this.formatValue(value));

        this.showCached();
        this.apiError();
    }
};

window.rdz.view.parameters.Counters = {
    template: function (model) {
        var html = rdz.$('<div class="rds-prm"><span class="counter-val rds-bold"></span><a target="_blank" class="rds-value"></a></div></div>'),
            name = model.get('name');
        rdz.$(html).find('.rds-value').addClass(name);
        return html;
    },
    formatValue: function (value) {
        var val = this.model.get('value');
        if (typeof(value) == 'object') {
            return val === value ? (val ? 'yes' : 'no') : 'none';
        }
        else {
            //return value === null ? '' : typeof value === 'number' ?  rdz.utils.formatNumber.apply(value, [0, "", "\u2009"]) : typeof value === 'string' ? value : '';
            return val === null ? '' : typeof value === 'number' ? rdz.utils.formatNumber.apply(value, [0, "", "\u2009"]) : value;
        }
    },
    showResult: function () {
        var value = this.model.get('value'),
            sortredval = [],
            item, val;
        if (value && value.Alexa.value == false) {

            if (value.Alexa.value == false) {
                delete value.Alexa;
            }
            this.model.set({value: value}, {silent: true});
        }
        if (value) {
            sortredval = rdz.utils.sortCounters(value);
            for (var i in sortredval) {
                if (sortredval[i][0] == 'Alexa') {
                    sortredval.splice(i, 1);
                }
            }
            if (sortredval.length > 0) {
                item = sortredval[0][0];
                val = this.checkError(value && typeof value[item].value !== "undefined" ? value[item].value : value);
            }

        }
        var domen = this.model.get('domen');
        if (val != true) {
            this.$el.find('.counter-val').html(this.formatValue(val));
        }
        if (sortredval.length > 0) {
            this.$el.find('.rds-value').addClass(this.formatValue(this.checkError(value)));

        }
        else {
            this.$el.find('.rds-value').removeClass('yes no none');
        }
    }
};

window.rdz.view.parameters.CheckDangerous = {
    className: 'rds-cnt rds-icons',
    template: function (model) {
        return rdz.$('<div class="rds-prm"><a target="_blank" class="rds-value Dangerous"></a></div>');
    },
    formatValue: function (value) {
        var v = this.model.get('value');
        return v === null ? 'unchecked' :
            v < 0 ? (v === rdz.errors.BUNKRUPT ? 'bunkrupt' : 'auth') :
                /*v.Dangerous &&*/ v.Dangerous === 'None' ? 'no' :
                v.Dangerous ? 'yes' : 'unchecked';
    },
    showResult: function () {
        //this.setHref('.rds-value', this.model.get('requests').displayUrl);
        var value = this.checkError(this.model.get('value'));
        this.$el.find('.rds-value').removeClass('unchecked yes no auth bunkrupt').addClass(this.formatValue(value));
    }
};

window.rdz.view.parameters.Seo = {
    className: 'rds-cnt rds-icons',
    template: function (model) {
        return rdz.$('<div class="rds-prm"><div class="Seo">' +
        '<a target="_blank" class="rds-value Sape unchecked"></a>' +
        '<a target="_blank" class="rds-value Trustlink unchecked"></a>' +
        '<a target="_blank" class="rds-value Liex unchecked"></a>' +
        '</div></div>');
    },
    formatValue: function (value) {
        var v = this.model.get('value');

        return v === null ? 'unchecked' :
            v < 0 ? (v === rdz.errors.BUNKRUPT ? 'bunkrupt' : 'auth') : v;
    },
    showResult: function () {
        //this.setHref('.rds-value', this.model.get('requests').displayUrl);
        var value = this.checkError(this.model.get('value'));
        var sortedSeosObj = null;
        var sortedSeos = null;
        var formatedValue = this.formatValue(value);

        if (formatedValue === "unchecked") {
            sortedSeos = [
                ["Sape", "unchecked"], ["Trustlink", "unchecked"], ["Liex", "unchecked"]
            ];
        } else if (formatedValue === "bunkrupt") {
            sortedSeos = [
                ["Sape", "bunkrupt"], ["Trustlink", "bunkrupt"], ["Liex", "bunkrupt"]
            ];
        } else if (formatedValue === "auth") {
            sortedSeos = [
                ["Sape", "auth"], ["Trustlink", "auth"], ["Liex", "auth"]
            ];
        } else {
            // getting sum, that indicates active markets
            var extra = this.model.get("extra"),
                activeMarketsSum = 0;
            for (var name in extra) {
                if (name !== "api") {
                    if (extra[name].active === true) {
                        activeMarketsSum += rdz.utils.Seo_NumberByName[name];
                    }
                }
            }

            sortedSeosObj = rdz.utils.sortSeoMarkets(formatedValue, activeMarketsSum);
            sortedSeos = sortedSeosObj.sorted;
        }

        var links = this.$el[0].getElementsByTagName("a");
        for (var i = 0; i < links.length; i++) {
            if (sortedSeos[i]) {
                links[i].className = "rds-value " + sortedSeos[i][0] + " " + sortedSeos[i][1];
            }
        }

        //this.$el.find('.rds-value').removeClass('yes no auth').addClass(this.formatValue(value));

    }
};

window.rdz.view.parameters.LinksBuy = {
    className: 'rds-cnt rds-icons',
    template: function (model) {
        return rdz.$('<div class="rds-prm"><a target="_blank" class="rds-value LinksBuy"></a></div>');
    },
    formatValue: function (value) {
        var v = this.model.get('value');
        return v === null ? 'no' :
            v < 0 ? (v === rdz.errors.BUNKRUPT ? 'bunkrupt' : 'auth') :
                v > 3 ? 'yes' : 'no';
    },
    showResult: function () {
        this.setHref('.rds-value', this.model.get('requests').displayUrl);
        var value = this.checkError(this.model.get('value'));
        this.$el.find('.rds-value').removeClass('yes no auth').addClass(this.formatValue(value));

    },
    getTooltipData: function () {
        var v = this.model.get('value');

        //TODO: перенести в локаль
        return v === null ? 'Вероятнее всего данный сайт не приобретает SEO ссылки или нам о них пока не известно.' :
            v < 0 ? (v === rdz.errors.BUNKRUPT ? rdz.locale.bar.contextmenu.no_money : 'Для получения этих значений необходимо авторизоваться') :
                v && v > 3 ?
                'Данный сайт приобретает SEO ссылки. В базе RDS их около ' + v + ' шт. Для просмотра их анкоров и проверки достоверности значения рекомендуем использовать параметр Linkpad.' :
                    'Вероятнее всего данный сайт не приобретает SEO ссылки или нам о них пока не известно.';
    }
};

window.rdz.view.parameters.Robots = rdz.view.parameters.Validation;

window.rdz.view.parameters.Nesting = {
    className: 'rds-cnt rds-icons',
    template: function (model) {
        var html = rdz.$('<div class="rds-prm"><a target="_blank" class="rds-value"></a></div></div>'),
            name = model.get('name');

        rdz.$(html).find('.rds-value').addClass(name);
        return html;
    },
    formatValue: function (value) {
        var v = this.model.get('value');
        return !v ? 'none' : (v.value === 1 ? 'one' : v.value === 2 ? 'two' : v.value === 3 ? 'three' : 'none' );
    },
    showResult: function () {
        this.setHref('.rds-value');
        var value = this.model.get('value');
        if (value !== null) {
            this.$el.find('.rds-value').addClass(this.formatValue(this.checkError(value)));
        }
        else {
            this.$el.find('.rds-value').removeClass('one two three none');
        }
        this.$el.find('.rds-value').removeClass('ru en').addClass(rdz.locale.locale);
    }
};

window.rdz.view.parameters.Sitemap =  {
    formatValue: function (value) {
        var v = this.model.get('value');
        return v === null ? value : ( (v && v['Sitemap'] && v['Sitemap'].value ||
        v && !rdz._.isEmpty(v['CurrSitemap'])) ? rdz.locale.yes : rdz.locale.no);
    }
};













