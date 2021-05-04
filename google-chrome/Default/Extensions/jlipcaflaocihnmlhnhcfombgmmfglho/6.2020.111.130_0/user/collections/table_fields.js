window.SitesLibraryTableFieldsCollection = Backbone.Collection.extend({
    model: LibraryFields,
    mozStorage: new MozStoreTableFields('SitesLibraryTableFields')
});
SitesLibraryTableFieldsCollection.prototype.sync = mozStore;

window.PagesLibraryTableFieldsCollection = Backbone.Collection.extend({
    model: LibraryFields,
    mozStorage: new MozStoreTableFields('PagesLibraryTableFields')
});
PagesLibraryTableFieldsCollection.prototype.sync = mozStore;

window.CheckSiteTableFieldsCollection = Backbone.Collection.extend({
    model: LibraryFields,
    mozStorage: new MozStoreTableFields('CheckSitesLibraryTableFields')
});
CheckSiteTableFieldsCollection.prototype.sync = mozStore;

window.CheckPageTableFieldsCollection = Backbone.Collection.extend({
    model: LibraryFields,
    mozStorage: new MozStoreTableFields('CheckPagesLibraryTableFields')
});
CheckPageTableFieldsCollection.prototype.sync = mozStore;


