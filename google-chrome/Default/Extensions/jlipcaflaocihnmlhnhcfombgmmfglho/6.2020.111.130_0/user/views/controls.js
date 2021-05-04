AddToCheck = Backbone.View.extend({
    className: 'add_to_check',
    template: _.template(templates.controls.add_to_check),

    events: {
        "click  .add"   : "add_to_db",
        "keyup  .list"  : "change_list",
        "click  .list"  : "change_list",
        "input  .list"  : "change_list"
    },

    render: function(){
        this.$el.html(this.template({text: AppLocale.controls[this.model.path]}));

        if (this.model.status === 'ADDED_IN_CHECKING') {
            this.update_html(this.model.count, this.model.difference);
        } else {
            this.count($.proxy(this.update_html, this));
        }

        return this;
    },
    /* creates webworker, counting duplicates and non valid pages or domains in textarea
    * */
    count: function (callback) {
        var list = this.$el.find('.list').val(),
            self = this;

        if (!webworkers.mass_checks_add) {
            webworkers.mass_checks_add = new Worker("web_workers/mass_checks_add.js");
        }

        webworkers.mass_checks_add.onmessage = function (e) {

            self.process_list = false;

            switch (e.data.method) {
                case 'GET_LIST':
                    if (callback) {
                        callback(e.data)
                    }
                    self.count_data = e.data;

                    break;

                case 'GET_SAVED_LIST':
                    rdz.db.finish_add_checking(
                        function(arg) {
                            LibRouter.get().fetch({silent:true, args:arg, callback: function(arg){
                                /* Moved to take into account duplicates */
                                var update_obj = {'length': DataPaging.get('PerPage').get('length') + arg.difference.length};
                                update_obj[DataPaging.get('PerPage').get('path') + 'length'] = update_obj.length;
                                DataPaging.get('PerPage').set(update_obj);
                                
                                AppView.render(arg);
                            }});
                        },
                        e.data.new_uri_sql,
                        e.data.arg
                    );
                    break;
            }

        };

        if (!self.process_list) {
            self.process_list = true;
            webworkers.mass_checks_add.postMessage({list: list, method: 'GET_LIST'});
        }

    },

    add_to_db: function() {

        var count = this.count_data;
        if (!self.process_list && count.valid.length + count.nonvalid.length > 0) {
            AppBlockMassage.show('BlockLoading');
            
            /* Moved to take into account duplicates */
            //var update_obj = {'length': DataPaging.get('PerPage').get('length') + count.valid.length};
            //update_obj[DataPaging.get('PerPage').get('path') + 'length'] = update_obj.length;
            //DataPaging.get('PerPage').set(update_obj);

            var method  = 'add_checking_' +DataPaging.get('PerPage').get('path').replace('check', '');
            rdz.db[method](count);
        }


    },
    /**
     *
     * @param count {Object} Property <valid> and <nonvalid> contains arrays with strings from textarea
     * @param rows_from_db {Array} - arrays with strings from db
     */
    update_html: function(count, rows_from_db) {

        var box = this.$el.find('.box'),
            html = [];

            if (rows_from_db) {
                if (count.valid.length  - rows_from_db.length > 0) {
                    html.push(_.template(templates.controls.add_stat_row)({name: AppLocale.controls.duplicates, value: count.valid.length  - rows_from_db.length }))
                }

                if (count.nonvalid.length > 0) {
                    html.unshift(_.template(templates.controls.add_stat_row)({name: AppLocale.controls.not_valid, value: count.nonvalid.length }));

                    this.$el.find('.list').val(count.nonvalid.map(function(domain){return domain.match(/https?:\/\//)?domain:"http://"+domain}).join('\n'));
                    //this.count();
                }
                this.count($.proxy(this.update_html_count, this, html));
            }
            else
            {
                box.html(_.template(templates.controls.add_stat_row)({name: AppLocale.controls.count, value: count.valid.length + count.nonvalid.length }));
            }

    },
    update_html_count: function(html, count){
        html.unshift(_.template(templates.controls.add_stat_row)({name: AppLocale.controls.count, value: count.valid.length + count.nonvalid.length }));
        this.$el.find('.box').html(html);
    },

    change_list: function(e) {
        //TODO: checking key codes improves speed
        this.count($.proxy(this.update_html, this));
    }
});

OtherView = Backbone.View.extend({
    className: 'otherview',
    template: _.template(templates.controls.otherview),

    events: {
        "click  .mrk"      : "change"
    },

    render: function() {
        this.$el.html(this.template({flag:DataPaging.get('PerPage').get('width_date')}));

        var table_width = $('#user-table').width();
        this.$el.width(table_width+'px');

        var paging = $($('.content .paging')[0]),
            paging_length =  paging.children('.stats').width() + paging.children('.pagination').width();

        if (table_width - paging_length < 240 /*240 this width*/) {
            this.$el.hide();
        }

        return this;
    },
    change: function(e) {
        if (DataPaging.get('PerPage').get('width_date') !== !!$(e.target).data().flag) {
            AppBlockMassage.show('BlockLoading');
            DataPaging.get('PerPage').set({'width_date': !!$(e.target).data().flag});
            rdz.cache.set(["mass_checking", "show_with_date"], DataPaging.get('PerPage').get('width_date'));
            //it simple magic gives AppBlockMassage time to show message
            setTimeout(function(){ AppView.render(); }, 500)
        }
    }
});