PagingView = Backbone.View.extend({
    tagName: 'div',
    className: 'paging',

    template: _.template(templates.user_table.paging.stat),

    events: {
        "click .export"    : "action",
        "click .delete"    : "action"
    },

    render: function() {
        $(this.el).html(this.template({
            total: DataPaging.get('PerPage').get('length')
        }));

        //button in the bottom pagination
        if (this.options.button) {
            $(this.el).append(_.template(templates.user_table.paging.export));
            $(this.el).append(_.template(templates.user_table.paging.delete));
        }

        for (var i in DataPaging.models)
        {
            var m = DataPaging.models[i];
            var view = new window['PagingView'+m.get('name')]({model: m});
                $(this.el).append(view.render().el);
        }

        return this;
    },
    action: function(e) {


        // rendering xml
        var at_least_one_row = false;

            LibRouter.get().each(function(e,i) {
                var c = (e).get('Uri');
                if ((c).checked)
                {
                    //in this point user will have some result
                    at_least_one_row = true;
                }
            });

            var action = $(e.currentTarget).prop('class');

            if (action=== 'export')
            {
                AppPopup.show('PopupExportTableFields' /*at_least_one_row?'PopupExportTableFields':'PopupExportNoData'*/);
            } else {
                AppPopup.show(at_least_one_row?'PopupDeleteRows':'PopupDeleteNoData');
            }
    }
});

PagingViewPerPage = Backbone.View.extend({
    tagName: 'div',
    className: 'pagination',
    template: _.template(templates.user_table.paging.per_page),
    events: {
        "change select"    : "change"
    },
    initialize: function() {
        //every time when object is initialized event is binded
        //this cause rendering user's table unnecessary times
        this.model.off('change:value');
        this.model.on('change:value', this.render_user_table, this);
    },
    render: function() {
        //paging
        var paging = new window['PagingViewPages']({model: this.model});
            $(this.el).html(paging.render().el);

        $(this.el).append(this.template());
        this.select = $(this.el).find('select');
        this.select.find('option').removeAttr('selected');
        this.select.find('option[value="'+ this.model.get('value') +'"]').attr('selected','selected');
        return this;
    },
    change: function() {
        AppBlockMassage.show('BlockLoading');
        this.model.save({value: parseInt(this.select.val(),10), page: 1});
    },
    render_user_table: function() {
        var paging = DataPaging.get('PerPage');
        AppRouter.navigate(paging.get('path') + '/' + paging.get('id') + '/' + 1 + paging.getSortedUri());
        LibRouter.get().fetch({reset:true});
    }
});

PagingViewPages = Backbone.View.extend({
    tagName: 'div',
    className: 'pages',
    template: _.template(templates.user_table.paging.pages),
    render: function() {
        var pages = this.arraying(Math.ceil(this.model.get('length') / this.model.get('value')));

        $(this.el).html(this.template({
            pages: pages,
            page: this.model.get('page'),
            path: this.model.get('path') + '/' +this.model.get('id'),
            sortpath: DataPaging.get('PerPage').getSortedUri()
        }));

        //hide paging if only one page
        if (this.model.get('length') <= this.model.get('value')) $(this.el).addClass('hidden');

        return this;
    },
    arraying: function (arg) {
        var arr = [];
        while (arg--) {
            arr.unshift(arg+1)
        }
        return arr;
    }
});
