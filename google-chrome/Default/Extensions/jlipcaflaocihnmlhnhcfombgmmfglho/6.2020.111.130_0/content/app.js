window.rdz.app = {

    /** @namespace namespace for content application */
    content: {

        /**@description instance of window.rdz.model.content.Bar */
        bar: new window.rdz.model.content.Bar,

        /**@description instance of window.rdz.collection.content.Parameters*/
        parameters: new window.rdz.collection.content.Parameters,

        /**@description instance of window.rdz.view.content.App */
        view: new window.rdz.view.content.App,

        /**@description instance of window.rdz.tooltips.Tooltip */
        tooltip: new window.rdz.tooltips.Tooltip,


        contextmenu: new window.rdz.contextmenu.Contextmenu,

        /**@description flag for appended html for bar*/
        appended: false
    }
};

//initialize first rendering. adding parameters-objects in Collection from "background" will fired rendering Bar
rdz.app.content.parameters.on("add", function (model) {
    if (!rdz.app.content.appended) rdz.app.content.view.render();
});





