// Copyright (c) 2012 The Chromium Authors. All rights reserved.
// https://code.google.com/google_bsd_license.html

// https://github.com/Maluen/Backbone-Debugger
// The function below is executed in the context of the inspected page.
var page_getProperties = function() {
    var data = window.jQuery && $0 ? jQuery._data( $($0)[0], 'events' ) : {}
      , props
      , copy

    //if the element isnt using jQUery
    if( data === undefined )
        return { message: "This dom element isn't tied to jQuery :(" }
    
    // shallow copy with a null prototype, so that sidebar doesnt expose prototype.
    props = Object.getOwnPropertyNames(data);
    copy = { __proto__: null };
    for (var i = 0; i < props.length; ++i) {
        copy[props[i]] = data[props[i]];
    }

    return copy;
}

chrome.devtools.panels.elements.createSidebarPane("jQuery events", function(sidebar) {
    function updateElementProperties() {
        sidebar.setExpression("(" + page_getProperties.toString() + ")()");
    }
    updateElementProperties();

    //listener for when the element selection changes, it updates the pane info
    chrome.devtools.panels.elements.onSelectionChanged.addListener(updateElementProperties);
});