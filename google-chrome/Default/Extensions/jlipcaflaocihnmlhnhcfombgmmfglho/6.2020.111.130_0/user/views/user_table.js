UserTable = Backbone.View.extend({
    tagName: 'table',
    className: 'table user',
    id: 'user-table',

    render: function() {
        // rendering table's header
        var table_header = new TableHeader();
            $(this.el).html(table_header.render().el);

        // rendering table's body
        var at_least_one_row = false,
            self = this;

            LibRouter.get().each(function(e,i) {

                self.renderUserTableTr(e, i);

                //in this point user will have some result
                at_least_one_row = true;

            });

            var start_check_panel = LibRouter.get({str:true});
            if (start_check_panel === 'CheckSitesLibrary' ||
                start_check_panel === 'CheckPagesLibrary')
            {
                this.renderStartCheckPanel();
            }

            if (!at_least_one_row && DataPaging.get('PerPage').get('page') !== 1) {
                var paging = DataPaging.get('PerPage');
                AppRouter.navigate(paging.get('path') + '/' + paging.get('id')+'/1', {trigger: true});
            }
            else if (!at_least_one_row)
            {
                //no data to show
                var message = new MessageErr({model: AppLocale.errors.nodata});
                    $(this.el).empty();
                    $('.content').html(message.render().el);
            }

        return this;
    },

    renderUserTableTr: function(row, num) {
        var view = new UserTableTr({model: row, num:num+(DataPaging.get('PerPage').get('page') - 1) * DataPaging.get('PerPage').get('value')});
            this.$el.append(view.render().el);
    },
    renderStartCheckPanel: function(){
        this.$el.append((new StartCheckPanel()).render().el);
    }
});

UserTableTr = Backbone.View.extend({

    tagName: 'tr',

    template: _.template(templates.user_table.td),

    initialize: function() {
        //this.model.bind('change', this.render, this);

    },
    render: function() {
        var cell_num = new window['TableCellNum']({model: this.options.num});
        $(this.el).append(cell_num.render().el);

        var cell_check = new window['TableCellCheck']({model: this.model});
        $(this.el).append(cell_check.render().el);

        var row = this.model.toJSON(),
            lib = LibRouter.get({str:true});

        for (var i in row)
        {
            //filter out hidden fields
            /*var shown = false;
             LibRouter.get({ends:'TableFields'}).each(function(e,n) {
             e.get('name') === i ?
             e.get('value') !== 0 ? shown = true : shown = false : '';

             sortorder = e.get('sortorder');
             });

             if (!shown) continue;*/

            var field = LibRouter.get({ends:'TableFields'}).get(i);

            if(!field) continue;

            var name = field.get('name');

            if (field.get('value') !== 0  &&
                //проверка скрытого поля
                window.rdz.TableFields.hidden.indexOf(name) == -1 &&
                //проверка скрытого поля в массовых проверках
                (window.rdz.TableFields.hidden_in_mass_checks.indexOf(name) == -1 || ["Recipients", "SitesLibrary", "PagesLibrary"].indexOf(lib) !== -1 ) &&

                (AppLocale.locale === 'ru' || AppLocale.ru_params.indexOf(name) === -1)
                )
            {

                var view = new window['TableCell' + i]({
                    model: row[i],
                    params: row,
                    sorted: Boolean(field.get('sortorder')),
                    checking: field.get('checking')
                });
                $(this.el).append(view.render().el);

            }

        }

        var c = this.model.get('Uri');
        if (c.checked) {
            $(this.el).addClass('checked');
        }

        return this;
    }
});

StartCheckPanel = Backbone.View.extend({
    tagName: 'tr',
    
    className: 'scp',

    render: function() {
        this.$el.append(['<td/>', '<td/>']);

        var self = this,
            fields = LibRouter.get({ends:'TableFields'}),
            lib = LibRouter.get({str:true});

        fields.each(function(field) {
            var name = field.get('name');

            if (field.get('value') !== 0  &&
                //проверка скрытого поля
                window.rdz.TableFields.hidden.indexOf(name) == -1 &&

                //проверка скрытого поля в массовых проверках
                (window.rdz.TableFields.hidden_in_mass_checks.indexOf(name) == -1 || ["Recipients", "SitesLibrary", "PagesLibrary"].indexOf(lib) !== -1 ) &&

                (AppLocale.locale === 'ru' || AppLocale.ru_params.indexOf(name) === -1))
            {

                var view = window['TableCheck'];
                if (window['TableCheck' + name]) {
                    view = view.extend(window['TableCheck' + name]);
                }

                var field_which_was_sent = AppRequest.get(DataPaging.get_hash(name));

                view = new view({model: field_which_was_sent && field_which_was_sent.get('model') || field});

                // small magic
                var td = $('<td/>');
                td.html(view.el);
                
                /* if one column has more than one button */
                if (typeof TableCheckMoreButtons.buttons[name] !== 'undefined') {
                    td.append(TableCheckMoreButtons.buttons[name](field));
                }
                self.$el.append(td);
            }
        });

        return this;
    }
});

TableCheckMoreButtons = {
    return_instance: function(obj) {
        var name = obj.model.get('name'),
            view = window['TableCheck'];

        if (window['TableCheck' + name]) {
            view = view.extend(window['TableCheck' + name]);
        }

        return new view(obj);
    },
    buttons: {
        TYC: function(parent_field) {
            var self = TableCheckMoreButtons,
                views = [];

            parent_field.get('sub_field').forEach(function(sub_field) {
                views.push(self.return_instance({model: sub_field}).el);
            });

            return views;
        },
        Counters: function(parent_field) {
            var self = TableCheckMoreButtons,
                views = [];

            parent_field.get('sub_field').forEach(function(sub_field) {
                views.push(self.return_instance({model: sub_field}).el);
            });

            return views;
        },
        CountersPage: function(parent_field) {
            var self = TableCheckMoreButtons,
                views = [];

            parent_field.get('sub_field').forEach(function(sub_field) {
                views.push(self.return_instance({model: sub_field}).el);
            });

            return views;
        }
    }
};
