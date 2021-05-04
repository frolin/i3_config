chrome.tabs.query({'active': true}, function(tabs) {

    //console.log(tabs);
    //chrome.tabs.update(tabs[0].id, {url: 'http://google.com'});
});

chrome.tabs.onUpdated.addListener(function(tabId , info) {
    if (info.status == "complete") {
        // your code ...
        //console.log('ready',tabId,info);
        chrome.tabs.executeScript(tabId,{file: "content.js"}, function() {
         //   console.log("Tabs has been loaded");
        });

    }
});


chrome.extension.onConnect.addListener(function (port)
{
   // console.log('Connected');
    port.onMessage.addListener(function (message) // From DevTools
    {
      //  console.log('From Dev:',message);

        //search for acitve Tab...
        chrome.tabs.query({'active': true, currentWindow: true}, function(tabs)
        {
        //    console.log(tabs);
            chrome.tabs.sendMessage(tabs[0].id, message); // To Content
        });
    });

    chrome.extension.onMessage.addListener(function (msg, sender)  // From Content
    {
       // console.log('From Tab',msg,sender);
        port.postMessage(msg);//To Dev-Tools
        chrome.tabs.get(msg.to,function(tab)
        {
         //   console.log("TABBBB",tab);
            chrome.tabs.reload(tab.id, {}, function()
            {

            })
        });
    });
});
