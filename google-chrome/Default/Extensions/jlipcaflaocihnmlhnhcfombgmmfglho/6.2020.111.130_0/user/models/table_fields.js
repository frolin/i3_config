window.LibraryFields = Backbone.Model.extend({

    idAttribute: 'name',

    toggle: function(v) {
        var path = DataPaging.get('PerPage').get('path'),
            fields = (path === "siteslibrary" || path === "checksites") ? 'Sites' : 'Pages';

        this.set({value: v ? rdz.TableFields[fields][this.get("name")] : 0});
        this.set({export: Boolean(this.get("value"))}, {silent: true});
        this.saveAll();
    },
    saveAll: function() {
        var path = DataPaging.get('PerPage').get('path'),
            fields = (path === "siteslibrary" || path === "checksites") ? 'Sites' : 'Pages';


        var v = BigInteger.parse('0', 10);

        for (var i in rdz.TableFields[fields]) {
            var s = (LibRouter.get({ends:'TableFields'}).get(i).get('value')).toString();

            v =  BigInteger(v).add(BigInteger.parse(s, 10));
        }

          rdz.storage.version_update([{path:'User', key:LibRouter.get({ends:'TableFields',str:true}), value: BigInteger(v).toString(10)}]);
    },
    toggleExport: function(v) {
        this.set({export: v});
    },
    toggleCheck: function() {
        this.set({checked: !this.get('checked')});
        this.toggleCheckTr(this.get('checked'));
    },
    toggleCheckTr: function (v) {

        //mark checkbox in all tr
        var self = this;
        LibRouter.get().each(function(e,i) {
            e.toggleCheck(v);
        });

        //show all tr marked
        AppView.render();
    }
});
LibraryFields.prototype.sync = mozStore;





