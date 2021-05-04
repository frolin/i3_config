// Copyright 2013 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

var _window;

var mypanel = chrome.devtools.panels.create(
    'SEO',
    null, // No icon path
    'Panel/AppTesterPanel.html',
    function (extensionPanel)
    {

        //Created a port with background page for continous message communication
        var port = chrome.extension.connect({
            name: "Sample Communication" //Given a Name
        });
        //Posting message to background page
        port.postMessage("Request Tab Data");


        //Handle response received from background page
        port.onMessage.addListener(function (msg)
        {
            chrome.devtools.inspectedWindow.eval("console.log('RECEIVED MSG')");
            if (msg.action == 'Inspect')
            {
                chrome.devtools.inspectedWindow.eval("console.log('Do Inspect')");
                chrome.devtools.inspectedWindow.eval("inspect(document.elementFromPoint("+msg.X+","+msg.Y+"))");
                port.postMessage("Inspect has been Received");
            }
            if (msg.action) // FROM BG TO PANEL
            {
                _window.ResponseFromBackground(msg);
            }
        });

        extensionPanel.onShown.addListener(function tmp(panelWindow)
        {
            extensionPanel.onShown.removeListener(tmp); // Run once only
            _window = panelWindow;

           /* chrome.devtools.network.getHAR(function(result) {
                console.log(result);
              //  _window.ResponseFromBackground({action: 'Techdata', data: result});
            });*/


            _window.RespondToBackground = function(msg) { // FROM PANEL TO BG

                chrome.devtools.inspectedWindow.eval("console.log('dev to bg')");
                port.postMessage(msg);
            };
        })
    });

function checkTechData()
{
  var intervalId =  setInterval(function()
  {
        chrome.devtools.network.getHAR(function(result) {
          //  console.log("RESUUUUUULT",result);
            if (result.entries.length >0 && _window &&  _window.ResponseFromBackground)
            {
                _window.ResponseFromBackground({action: 'Techdata', data: result});
                clearInterval(intervalId);
            }
        });
    },2000);
}
checkTechData();


