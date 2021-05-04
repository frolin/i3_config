window.RecipientsCollection = Backbone.Collection.extend({
    model: Site,
    sqlite: new RecipientsSQLite
});
RecipientsCollection.prototype.sync = AppSync;

window.SitesLibraryCollection = Backbone.Collection.extend({
    model: Site,
    sqlite: new SitesLibrarySQLite
});
SitesLibraryCollection.prototype.sync = AppSync;

window.PagesLibraryCollection = Backbone.Collection.extend({
    model: Page,
    sqlite: new PagesLibrarySQLite
});
PagesLibraryCollection.prototype.sync = AppSync;



