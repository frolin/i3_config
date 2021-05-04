window.Paging = Backbone.Model.extend({
    idAttribute: 'name',
    getSortedUri: function() {
        var n =  AppTableSort.get('sortedparam'),
            p = n ? '/' + n + '/' + LibRouter.get({lib:AppTableSort.get('sortedlib'), ends:'TableFields'}).get(n).get('sortorder') : '';
        return p;
    }
});
Paging.prototype.sync = mozStore;


