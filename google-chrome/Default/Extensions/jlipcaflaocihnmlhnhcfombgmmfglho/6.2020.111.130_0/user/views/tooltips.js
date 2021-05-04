Tooltip = Backbone.View.extend({
    el: '.tooltip-cnt',
    template: _.template(templates.tooltip.container),

    initialize: function() {
        this.render();
    },

    render: function(){
        $(this.el).html(this.template());
    },


    show: function(p) {
        var view = new window[p.tooltip]({model: p.name || '', event:p.event || {}});
            view.render();
           // $(this.el).find('.cnt').html(view.render().el);

    },

    close: function() {
        $(this.el).find('.tooltip').css({display: 'none'});
    }

});


THUserTableTooltip = Backbone.View.extend({
    el: '.tooltip',

    render: function() {
       this.el.className = 'tooltip';
       var view = new THUserTableTooltips({model: this.model});
           $(this.el).find('.cnt').html(view.render().el);

      //show popup
       var coordinates = {
           parent: {
               offsetTop: $('a.param', this.options.event.currentTarget).offset().top,
               offsetLeft:  $('a.param', this.options.event.currentTarget).offset().left + $('a.param', this.options.event.currentTarget).width()/2 + 8, // 8 is tooltop's right-padding
               height: $('a.param', this.options.event.currentTarget).outerHeight(true),
               width:  $('a.param', this.options.event.currentTarget).outerWidth(true)
           },
           object: {
               height: $(this.el).outerHeight(true),
               width:  $(this.el).outerWidth(true)
           },
           window: {
               height: $(window).outerHeight(true),
               width:  $(window).outerWidth(true),
               scrollTop: $(window).scrollTop(),
               scrollLeft:  $(window).scrollLeft()
           }
       };

       var c = this.getCoordinates(coordinates);
           $(this.el).addClass(c.class).css({display: 'block', left: c.left , top:c.top});

       // return this;
    },
    getCoordinates: function(p) {
        var c = {};

        c.top = p.parent.offsetTop - p.object.height;
        c.left = p.parent.offsetLeft - p.object.width;
        c.class = 'br';

        if (p.window.scrollTop >= c.top)
        {
            c.top = p.parent.offsetTop + p.parent.height;
            c.class = 't' + c.class.substr(1,1);
        }

        if (p.window.scrollLeft >= c.left)
        {
            c.left = p.parent.offsetLeft;
            c.class = c.class.substr(0,1) + 'l';
        }

        return c;
    }

});

THUserTableTooltips = Backbone.View.extend({
    tagName: 'div',

    initialize: function() {
        $(this.el).html(_.template(AppLocale.table.tooltip[this.model] || templates.user_table.tooltip.miss));
        return this;
    }
});

CheckButtonTooltip = Backbone.View.extend({
    el: '.tooltip',

    render: function() {
        this.el.className = 'tooltip check';
        this.$el.find('.cnt').html(_.template(templates.tooltip.check_buttons)({action: 'Проверить', list: '- УВ', selected:4, sum: 0.0111}));

        //show popup
        var coordinates = {
            parent: {
                offsetTop: $(this.options.event.currentTarget).offset().top,
                offsetLeft:  $(this.options.event.currentTarget).offset().left,
                height: $(this.options.event.currentTarget).outerHeight(true),
                width:  $(this.options.event.currentTarget).outerWidth(true)
            },
            object: {
                height: $(this.el).outerHeight(true),
                width:  $(this.el).outerWidth(true)
            },
            window: {
                height: $(window).outerHeight(true),
                width:  $(window).outerWidth(true),
                scrollTop: $(window).scrollTop(),
                scrollLeft:  $(window).scrollLeft()
            }
        };

        var c = this.getCoordinates(coordinates);
        $(this.el).css({display: 'block', left: c.left , top:c.top});

        // return this;
    },
    getCoordinates: function(p) {
        var c = {};

        c.top = p.parent.offsetTop - p.object.height;
        c.left = p.parent.offsetLeft;


        if (p.window.scrollTop >= c.top)
        {
            c.top = p.parent.offsetTop + p.parent.height;
        }

        if (p.window.scrollLeft >= c.left + p.object.width)
        {
            c.left = p.parent.offsetLeft - (p.window.scrollLeft - (c.left + p.object.width));
        }

        return c;
    }

});