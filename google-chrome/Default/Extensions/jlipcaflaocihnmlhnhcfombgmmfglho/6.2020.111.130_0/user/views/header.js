AppHeader = Backbone.View.extend({
    render: function() {

        var header_navigation = new HeaderNavigation();
            $(this.el).html(header_navigation.render().el);

        var header_menu = new HeaderMenu();
            $(this.el).append(header_menu.render().el);

        var breadcrumbs = new HeaderBreadcrumbs();
            $(this.el).append(breadcrumbs.render().el);

        var auth = new HeaderAuth();
            $(this.el).append(auth.render().el);

        return this;
    }
});
HeaderNavigation = Backbone.View.extend({
    tagName: 'div',
    className: 'navigation',
    template: _.template(templates.header.navigation),
    events: {
        "click .empty"    : "empty",
        "click .rds-db"    : "openFolder"
    },
    render: function() {
          $(this.el).html(this.template({size: 50000000, path: '/' }));

        return this;
    },
    empty: function(){
        AppPopup.show('PopupDeteteFromTabels');
    },
    openFolder: function(){
        console.log('bebebe how to open who do know')
    }

});

HeaderMenu = Backbone.View.extend({
    tagName: 'div',
    className: 'menu',
    template: _.template(templates.header.menu),
    render: function() {
        $(this.el).html(this.template({
                id: DataPaging.get('PerPage').get('id'),
                path: DataPaging.get('PerPage').get('path'),
                sites: DataPaging.get('PerPage').get('siteslength'),
                pages: DataPaging.get('PerPage').get('pageslength')
        }));
        return this;
    }

});

HeaderBreadcrumbs = Backbone.View.extend({
    tagName: 'div',
    className: 'breadcrumbs',
    template: _.template(templates.header.breadcrumbs),
    render: function() {
        $(this.el).html(this.template({page: AppLocale.menu[DataPaging.get('PerPage').get('path')]}));
        return this;
    }

});

HeaderAuth = Backbone.View.extend({
    tagName: 'div',
    className: 'auth',
    template: _.template(templates.header.auth),
    render: function() {
        $(this.el).html(this.template({account: rdz.user.get('email'),
            balance: parseFloat(rdz.user.get('balance'),10)}));
        
        $(this.el).append('<div class="indicators"><div class="timer"></div><div class="progress"></div></div>');
     
        return this;
    }
});

HeaderProgress = Backbone.View.extend({
    tagName: 'div',
    events: {
        "mouseenter .progressbar": "toggleTooltip",
        "mouseleave .progressbar": "toggleTooltip"
    },
    template: _.template(templates.header.indicators.progress),
    render: function() {
        $(this.el).html(this.template({indicatorsState: checkIndicators ? checkIndicators.getState() : null}));
        return this;
    },
    
    toggleTooltip: function(e) {
        var that = this;
            
        if (e.type === "mouseenter") {
            rdz.user.tooltipOpened = true;
            this.$el.find('.progress').append(_.template(templates.tooltip.indicators)(this.tooltip_data()));
            rdz.user.indicators_tooltip_timers.push(window.setInterval(function() {
                    that.$el.find('.tooltip').remove();      
                    that.$el.find('.progress').append(_.template(templates.tooltip.indicators)(that.tooltip_data()));
                }, 200)
            );     
        } else if (e.type === "mouseleave") {
            rdz.user.tooltipOpened = false;
            this.$el.find('.tooltip').remove();
            rdz.user.indicators_tooltip_timers.forEach(function(t) {
                window.clearInterval(t);
            });         
        }
    },
    
    tooltip_data: function() {
        var data = [],
            totalData = checkIndicators.getCheckingCount();
        
        checkIndicators.each(function(m) {
            // if the column hasn't been checked yet
            //if (m.getCheckedCount() !== m.get('count')) {
                data.push({
                    name: AppRequest.get(m.id).toJSON().model.id,
                    time: m.getTimeString(),
                    checked: m.getCheckedCount(),
                    total: m.get('count')
                });
            //}            
        });        
        
        return {
            list: data,
            total: {checked: totalData.checked, total: totalData.total}
        };
    }
});

HeaderTimer = Backbone.View.extend({
    tagName: 'span',    
    template: _.template(templates.header.indicators.timer),
    render: function() {
        $(this.el).html(this.template({indicatorsState: checkIndicators ? checkIndicators.getState() : null}));
        return this;
    }
});

