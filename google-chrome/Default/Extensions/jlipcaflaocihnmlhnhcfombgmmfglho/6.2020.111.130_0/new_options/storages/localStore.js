define(['new_options/storages/localStorageCollection'], function (localStore) {

    var localStoreAll = function (name) {
        this.name = name;

        this.data = function (o, settings) {
            /*JSON.parse(JSON.stringify()) remove links between original Object and Model property where Object is copied.
             Example: main.rdz.setting.options.Parameters[8].extra and Parameters.get('PR').get('extra')*/
            let options = main.rdz.setting.options;
            return JSON.parse(JSON.stringify((!o.reset && settings[this.name]) ||
                (typeof options[this.name] == "function" ? options[this.name]() : options[this.name])
            ));
        };

    };
    _.extend(localStoreAll.prototype, localStore.methods);

    return localStoreAll;
});