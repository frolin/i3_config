define([
        'new_options/storages/localStorageModel',
        'new_options/storages/localStoreModel'
    ],
    function (localStore, StoreMethods) {

        var model = Backbone.Model.extend({
            localStorage: new StoreMethods('Bar'),
            changePosition: function (p) {
                this.set({left: p.left, top: p.top});
            },
            changeVisibility: function () {
                this.set({active: !this.get("active")});
            },
            toggleItalic: function () {
                this.set({italic: !this.get("italic")});
            },
            changeFilterDomain: function (p) {
                this.set({filter_domain: p});
            },
            changeCheckByButton: function (v) {
                this.set({check_by_button: v === '1' /*!this.get("check_by_button")*/});
            },
            changeLocale: function (e) {
                this.set({locale: e.currentTarget.value});
            },
            changeHighlighting: function () {
                this.set({highlight_pages: !this.get("highlight_pages")});
            }
        });
        model.prototype.sync = localStore;

        return model;
    });

