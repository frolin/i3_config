window.rdz.integrations = window.rdz.integrations || {};
window.rdz.integrations.search = window.rdz.integrations.search || {};

window.rdz.integrations.search.ya = function (data) {
    var that = this, // window.rdz.integrations.search
        updatesContainer = rdz.$('.suggest2-form__node'),
        updates,
        updatesView;

    that.data = data;

    // if yandex integration is disabled
    if (!that.data.options.active) {
        that.methods.resetSearchIntegration();
        return;
    }

    // updates
    if (updatesContainer.length > 0) {
        rdz.$('.rds-bar-search-updates').remove();
        if (data.updates && data.options.functions.Updates.active) {
            window.rdz.integrations.search.methods.showUpdates(updatesContainer[0].parentNode, data.updates, 'ya', 'main');
        }
    }
};