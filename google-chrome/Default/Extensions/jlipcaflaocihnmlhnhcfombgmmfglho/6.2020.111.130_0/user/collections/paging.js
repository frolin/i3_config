window.PagingCollection = Backbone.Collection.extend({
    model: Paging,
    mozStorage: new MozStorePaging('PerPage'),
    get_hash: function(name) {
        return document.location.hash + '/' + name
    }
});

PagingCollection.prototype.sync = mozStore;
