define([
        'new_options/models/page',
        'new_options/storages/localStorageCollection',
        'new_options/storages/localStore'
    ],
    function (Model, localStore, StoreMethods) {

        var collection = Backbone.Collection.extend({
            model: Model,
            localStorage: new StoreMethods('OuterLinks'),
            save: function () {
                var p = [];
                this.each(function (e) {
                    p.push(e.toJSON());
                });
                chrome.storage.local.set({OuterLinks: p});
            }
        });
        collection.prototype.sync = localStore;

        return collection;
    });
