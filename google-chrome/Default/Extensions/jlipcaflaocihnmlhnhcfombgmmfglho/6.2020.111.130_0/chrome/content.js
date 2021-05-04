function handleRequest(request, sender, sendResponse) {
    var message = {
        rss: []
    };

    var links = document.getElementsByTagName('link');
    for (var i = 0; i < links.length; i++) {
        var type = links[i].getAttribute('type');
        if (type)
            type = type.toLowerCase();
        if (type == 'application/rss+xml' || type == 'application/atom+xml')
            message.rss.push(links[i].getAttribute('href'));
    }
    sendResponse(message);
}
chrome.runtime.onMessage.addListener(handleRequest);

chrome.runtime.onConnect.addListener(function (port) {
    port.onMessage.addListener(function (data) {

        var bar = window.rdz.app.content.bar;

        /**
         * @function post depends from browser API
         */
        rdz.chrome = chrome;
        window.rdz.cmessenger.post = function (data) {
            port.postMessage(data);
        };

        //highlight urls, noindex and nofollow
        if (data.method === 'highlighting' && !window.rdz.highligted) {
            rdz.locale = data.locale; // for the notifications
            StartHilighting(data);
            window.rdz.highligted = true;
        }
        // an integration
        if (data.method === 'integration' && !window.rdz.integrated) {
            rdz.locale = data.locale;
            data.parameters = JSON.parse(data.parameters);
            data.bar_parameters = JSON.parse(data.bar_parameters);
            IntegrationsRouter(data);
        }
        else if (data.method === 'bar') {
            rdz.locale = data.locale;
            rdz.url = data.url;
            /*rdz.options = data.options;*/
            data.parameters = JSON.parse(data.parameters);
            //data.bar_parameters = JSON.parse(data.bar_parameters);

            bar.set({options: data.options}, {silent: true});
            bar.set({options_changed: data.options_changed}, {silent: true});
            bar.set({logged: data.logged}, {silent: true});
            bar.set({functions: data.functions}, {silent: true});

            if (bar.get('options_changed')) {
                window.rdz.app.content.view.barRestore(data.parameters);
            } else if (!window.rdz.selected) {
                window.rdz.app.content.parameters.add(data.parameters);
                if (data.parameters.length === 0) { // render the bar if there are no parameters
                    rdz.app.content.view.render();
                }
                window.rdz.selected = true;
            } else {
                if (!bar.get('options').check_by_button) {
                    window.rdz.app.content.parameters.sendALLRequest();
                }
            }
        }


        else if (data.method === 'message') {
            rdz.cmessenger.execute(data);
        }
    });
});

// add event listener to handle text selection
/*
document.addEventListener("selectionchange", function (e) {
    var selectedHTML = rdz.utils.getSelectedHTML(),
        urls;

    if (selectedHTML !== "") {
        urls = rdz.utils.findUrls(selectedHTML);
        if (urls && urls.length > 0) {
            rdz.cmessenger.post({
                method: 'message',
                request: 'ONSELECTIONCHANGE_ContentRequest',
                url: window.rdz.url,
                urls: urls
            });
        } else {
            rdz.cmessenger.post({
                method: 'message',
                request: 'ONSELECTIONCHANGE_ContentRequest',
                url: window.rdz.url,
                disabled: true
            });
        }
    } else {
        rdz.cmessenger.post({
            method: 'message',
            request: 'ONSELECTIONCHANGE_ContentRequest',
            url: window.rdz.url,
            disabled: true
        });
    }
}, false);
*/
