define(['new_options/storages/localStorageModel'], function (localStore) {

    var localStoreModel = function (name) {
        this.name = name;

        this.data = function (o, settings) {
            //return JSON.parse(localStorage.getItem('Bar')) || main.options.Bar;
            let options = main.rdz.setting.options;
            return JSON.parse(JSON.stringify((!o.reset && settings[this.name]) ||
                (typeof options[this.name] == "function" ? options[this.name]() : options[this.name])
            )); // deep copy (for Yandex and Google functions)
        };

    };
    _.extend(localStoreModel.prototype, localStore.methods);
    return localStoreModel;
});