
//Set var to remove injected Performance Picker and PerformancePicker Script
var performancePicker = document.getElementById("performancePicker");
var performancePickerScript = document.getElementById("performancePickerScript");

//Check if PerformancePicker & Script is in DOM and remove from DOM
if (performancePicker) {
    performancePicker.parentNode.removeChild(performancePicker);
}
if (performancePickerScript) {
    performancePickerScript.parentNode.removeChild(performancePickerScript);
}

var elt = document.createElement("script");
elt.id ="performancePickerScript";
var input = document.createElement("input");
input.setAttribute("type", "hidden");
input.id="performancePicker";
document.body.appendChild(input);
elt.innerHTML = "document.getElementById('performancePicker').value = JSON.stringify(window.performance.timing)";
document.head.appendChild(elt);

var timingAPIObject = JSON.parse(document.getElementById('performancePicker').value);
var domComplete = timingAPIObject.domComplete;
var connectStart = timingAPIObject.connectStart;
var loadEventEnd = timingAPIObject.loadEventEnd;
var responseEnd = timingAPIObject.responseEnd;
var loadTimeDiff = timingAPIObject.domContentLoadedEventEnd - timingAPIObject.domContentLoadedEventStart;


// Set Timeout to get rendered Dom-Data...
setTimeout(function() {


  //  console.log('Content Script Injected!');


    function MessageToWindow (object)
    {
        window.postMessage(object,'*');
    }

    chrome.storage.onChanged.addListener(function (changes,areaName)
    {
    //    console.log('Storage has been updated');
    });


    chrome.runtime.onMessage.addListener(function(request, sender)
    {
        //console.log("From BG",request,sender);
      //  console.log("action:",request.action);
        if (request.action == 'refresh')
        {
            parseSEOdata();
        }
        return true;
    });

    parseSEOdata();

},loadTimeDiff);


function parseSEOdata() {

    var metaTags = document.querySelectorAll('meta');
    var metaTagsCustom = [];
    for (var s = 0; s < metaTags.length; s++)
    {
        var metaTag = metaTags[s];
        var myTag = {id: s, tagName: metaTag.tagName};
        for (var t = 0; t < metaTag.attributes.length; t++)
        {
            var attr = metaTag.attributes[t];
            myTag[attr.name] = attr.value;
        }
        metaTagsCustom.push(myTag);
    }
    // Soll wirklich react und Angular geprüft werden? Sichere Methode wählen...
    //var reactJSDetection = document.querySelectorAll('*[data-reactroot]').length >= 1 ? true : false;
    //angurlar : window.angular === undefined dann nicht vorhanden sonst alles gut....

    var data = {};
    data.metaTags ={};
    data.html5 ={};
    data.metaTags.pageTitleCheck = pageTitle.init();
    data.metaTags.metaDescriptionCheck = metaDescription.init(metaTags,metaTagsCustom);
    data.metaTags.canonicalCheck = canonical.init();
    data.metaTags.relNextPrevCheck = relNextPrev.init();
    data.metaTags.mobileCheck = mobileURL.init();
    data.metaTags.foundAmp = amp.init();
    data.metaTags.noindexCheck = noindex.init(metaTags,metaTagsCustom);
    data.headerElements = hElements.init();
    data.html5.Elements = html5.init();
    data.schemaOrg = schemaOrg.init();

   // console.log("Content.js: Data-Object:" ,data);

    // HOW COMMUNICATION WITH APPTESTERPANEL.JS WORKS
    // content.js -> bg.js -> devtools.js -> AppTesterPanel.js
    //Send Data from content.js to bg.js
    chrome.extension.sendMessage({action: 'Send', data: data});
}


var metaDescription = {};
metaDescription.init = function (metaTags,metaTagsCustom)
{
    var metaDescriptionCheck = {name:"Meta-Description", data:{description:'<b>'+"Description: "+'</b>'+ "not set", metaLength:'<b>'+"Length: "+'</b>' + "no length", status:"DESCRIPTION IS MISSING"}};

    //Get Meta-Description
    for (var y = 0; y < metaTagsCustom.length; y++)
    {
        var metaTag = metaTagsCustom[y];
        //console.log("content.js: meta-Tags: ",metaTag);
        if (metaTag.name == "description" || metaTag.name == "Description" || metaTag.name == "DESCRIPTION")
        {
            metaDescriptionCheck.data.description ='<b>'+"Description: "+'</b>'+ metaTag.content;
            metaDescriptionCheck.data.metaLength = '<b>'+"Description Length: "+'</b>'+ metaTag.content.length;

            if (metaTag.content.length <= 165)
            {
                metaDescriptionCheck.data.status = "OK";
            } else
            {
                metaDescriptionCheck.data.status = "WARNING - Description > 165 characters";
            }

        }
    }
    return metaDescriptionCheck;
};


//Loop to get Canonical URL & Rel next / prev from Head-Links
var hElements = {};
hElements.init = function ()
{
    var headerElements =  [].slice.call(document.querySelectorAll("h1, h2, h3, h4, h5"));
    var headerElementsArray = [];
        for ( var i = 0; i < headerElements.length; i++)
        {
            var hElement = headerElements[i].nodeName;
            var hText = headerElements[i].innerText;
            headerElementsArray.push({hElement:hElement,hText:hText});
        }

    headerElementsArray.sort(function(a, b) {
        var hElementA = a.hElement.toUpperCase(); // ignore upper and lowercase
        var hElementB = b.hElement.toUpperCase(); // ignore upper and lowercase
        if (hElementA < hElementB) {
            return -1;
        }
        if (hElementA > hElementB) {
            return 1;
        }

        // names must be equal
        return 0;
    });
    return headerElementsArray;
};
var canonical ={};
canonical.init  = function ()
{
    var headLinks = document.head.querySelectorAll('link');
    var domainURL = window.location.href;
    var canonicalURL = [];
    var canonicalCheck = {name:"",data:{canonicalURL: "", domainURL: "", status: ""}};


    for (var z = 0; z < headLinks.length; z++)
    {
        var headerLink = headLinks[z];

        if (headerLink.rel == "canonical")
        {
            canonicalURL.push(headerLink.href);
        }
        if (headerLink.rel == "next" || headerLink.rel == "NEXT" || headerLink.rel == "Next")
        {
            relNext = headerLink.href;
        }
        if (headerLink.rel && headerLink.rel.toLowerCase() == "prev")
        {
            relPrev = headerLink.href;
        }
    }


    // Create canonical URL object
    //If no canonicalURL found set N/A
    if (canonicalURL == "")
    {
        canonicalURL.push(" not set ");
    }

    //If canonical URL == domain URL set status = true
    if (canonicalURL == domainURL)
    {
        canonicalCheck.data.status = "OK";
    }
    if (canonicalURL != domainURL && canonicalURL != "")
    {
        canonicalCheck.data.status = "WARNING: CANONICAL DOES NOT MATCH";
    }
    if (canonicalURL != domainURL && canonicalURL != "")
    {
        canonicalCheck.data.status = "CANONICAL NOT SET";
    }
    canonicalCheck.data.canonicalURL ='<b>'+"Canonical URL: "+'</b>'+ canonicalURL[0];
    canonicalCheck.data.domainURL ='<b>'+"Domain-URL: "+'</b>'+  domainURL;
    canonicalCheck.name ="Canonical-URL";

    return canonicalCheck;
};


var relNextPrev = {};
relNextPrev.init = function ()
{
    var relPrev = "not set";
    var relNext = "not set";
    var relNextPrevCheck = {name:"",data:{relNext:"", relPrev:""}};
    var headLinks = document.head.querySelectorAll('link');

    //Loop to get Canonical URL & Rel next / prev from Head-Links
    for (var z = 0; z < headLinks.length; z++)
    {
        var headerLink = headLinks[z];

        if (headerLink.rel && headerLink.rel.toLowerCase() == "next")
        {
            relNext = headerLink.href;
        }
        if (headerLink.rel && headerLink.rel.toLowerCase() == "prev")
        {
            relPrev = headerLink.href;
        }
    }

    //Create relPrev Object
    relNextPrevCheck.data.relNext ='<b>'+"Rel-Next: "+'</b>' + relNext;
    relNextPrevCheck.data.relPrev ='<b>'+"Rel-Prev: "+'</b>'+ relPrev;
    relNextPrevCheck.name ="Rel/Prev-URL";

    return relNextPrevCheck;
};

var mobileURL = {};
mobileURL.init = function()
{
    var headLinks = document.head.querySelectorAll('link');
    var mobileCheck = {name:"Mobile-Check-URL", data:{mobileURL:'<b>'+"Mobile URL: " +'</b>'+"not set"}};

    //Loop to get Canonical URL & Rel next / prev from Head-Links
    for (var z = 0; z < headLinks.length; z++)
    {
        var headerLink = headLinks[z];

        if (headerLink.rel == "alternate" || headerLink.rel == "ALTERNATE" || headerLink.rel == "Alternate")
        {
            mobileCheck.data.mobileURL ='<b>'+"Mobile-URL: "+'</b>' + headerLink.href;
        }
    }
    return mobileCheck;
};

var pageTitle = {};
pageTitle.init = function ()
{
    var pageTitleCheck = {name:"Page-Title", data: {pageTitle:"not set", pageTitleLength:"no length", status:"TITLE IS MISSING"}};

    var pageTitleLength = document.querySelectorAll('title').length;

    if (pageTitleLength > 0)
    {
        var Title = document.querySelectorAll('title')[0].innerHTML;
        pageTitleCheck.data.pageTitle = '<b>'+"Title: "+'</b>'+Title;
        pageTitleCheck.data.pageTitleLength = '<b>'+"Title length: "+'</b>' + Title.length;
        if (Title.length >= 60 )
        {
            pageTitleCheck.data.status = "WARNING - Title > 60 characters";
        }
        else
        {
            pageTitleCheck.data.status = "OK";
        }
    }
    return pageTitleCheck;
};


var noindex = {};
noindex.init = function (metaTags,metaTagsCustom)
{
    var noindexCheck = {name:"No-Index-Check",data:{indexStatus: '<b>'+"Robots: "+'</b>' +"not set", placeholder:"", status:""}};

    for (var y = 0; y < metaTagsCustom.length; y++)
    {
        var metaTag = metaTagsCustom[y];

        if (metaTag.name == "robots" || metaTag.name == "Robots" || metaTag.name == "ROBOTS")
        {
            noindexCheck.data.indexStatus ='<b>'+"Robots: "+'</b>'+ metaTag.content;
            if (metaTag.content.match(/NOINDEX/g)) {
                noindexCheck.data.status = "Status: WARNING - noindex is set";
            }
        }
    }
    return noindexCheck;
};

var html5 = {};
html5.init = function ()
{

    var foundHtml5Elements =[];
    var html5Elements ={};
    html5Elements.sections = document.getElementsByTagName("SECTION");
    html5Elements.nav = document.getElementsByTagName("NAV");
    html5Elements.article = document.getElementsByTagName("ARTICLE");
    html5Elements.aside = document.getElementsByTagName("ASIDE");
    html5Elements.header = document.getElementsByTagName("HEADER");
    html5Elements.footer = document.getElementsByTagName("FOOTER");
    html5Elements.main = document.getElementsByTagName("MAIN");
    //console.log(html5Elements);

    for (var property in html5Elements)
    {
        var value = html5Elements[property];
        if ( value.length > 0 && value[0].nodeName !== 'undefined')
        {
            var element = {name:value[0].nodeName, status:"found"};
            foundHtml5Elements.push(element);
        }
    }
    return foundHtml5Elements;
};




var schemaOrg = {};
schemaOrg.init = function()
{
    var schemaOrg = [];
    var scriptTags = document.getElementsByTagName("SCRIPT");
    var microData = document.querySelectorAll('[itemscope]');
    var richData = document.querySelectorAll('[vocab]');
    var helperArray = [];
    function detectSchemaORG()
    {

        getJSONschemaORG();
        getMicroData();
        getRichData();
    }
    detectSchemaORG();
    //var itemtype = microData.getAttribute("itemtype");
    //console.log(itemtype);
    //console.log(microData['itemtype']);
    //console.log(microData.length);
    //console.log(microData);
    //console.log(schemaOrg);


    function getJSONschemaORG()
    {
        for (var i = 0; i < scriptTags.length; i++)
        {
            //console.log(scriptTags[i].type);
            if (scriptTags[i].type == 'application/ld+json')
            {
                var schemaORGjson = JSON.parse(document.getElementsByTagName("SCRIPT")[i].textContent);
                var context = schemaORGjson['@context'];
                var type = schemaORGjson['@type'];
                //Create special Array because JSONLD and RichData have same type. Add +JSONLD to make a difference between RichData and JSONLD
                if(helperArray.indexOf(type+"JSONLD") == -1)
                {
                    helperArray.push(type+"JSONLD");
                    var schemaOrgObjectJSON = {type:type ,context:context,markup:"application/ld+json"};
                    schemaOrg.push(schemaOrgObjectJSON);
                    //BREAK HIER EINBAUEN????
                }

            }
        }
    }


    function getMicroData()
    {
        if (microData.length > 0 )
            for (var z = 0; z < microData.length; z++)
            {
                var type = microData[z].getAttribute("itemtype");
                // Check for duplicates, if the value in helper Array exists do not push ( prevent duplicates )
                if (helperArray.indexOf(type) == -1)
                {
                    helperArray.push(type);
                    var schemaOrgObjectMicroData = {type:type ,context:"http://schema.org",markup:"MicroData"};
                    schemaOrg.push(schemaOrgObjectMicroData);
                }

            }
    }

    function getRichData()
    {
        if (richData.length > 0 )
            for (var y = 0; y < richData.length; y++)
            {
                var type = richData[y].getAttribute("typeof");
                // Check for duplicates, if the value in helper Array exists do not push ( prevent duplicates )
                if (helperArray.indexOf(type) == -1)
                {
                    helperArray.push(type);
                    var schemaOrgObjectMicroData = {type:type ,context:"http://schema.org",markup:"RichData"};
                    schemaOrg.push(schemaOrgObjectMicroData);
                }

            }
    }


    //console.log(schemaOrg);
    return schemaOrg;
};




var amp = {};
amp.init = function()
{
    var headLinks = document.head.querySelectorAll('link');
    var ampData = {name: "AMP Data", data:{ampURL:"",desktopURL:"",status:"not found"}};

    if (document.getElementsByTagName("html")[0].getAttribute("⚡") != null || document.getElementsByTagName("html")[0].getAttribute("amp") != null)
    {
        getDesktopURL();
    }
    else
    {
        getAmpURL();
    }



    function getDesktopURL()
    {
        ampData.data.status = "AMP is in use";
        ampData.data.ampURL = '<b>'+"AMP URL: "+'</b>'+ window.location.href;
        for (var z = 0; z < headLinks.length; z++)
        {
            var headerLink = headLinks[z];

            if (headerLink.rel == "canonical")
            {
                ampData.data.desktopURL ='<b>'+"Desktop URL: "+'</b>'+ headLinks[z].href;
            }
            else
            {
                ampData.data.desktopURL = '<b>'+"Desktop URL: "+'</b>'+"No Desktop Version set";
            }
        }
    }

    function getAmpURL()
    {
        if (headLinks.length > 0)
        {
            for (var y = 0; y < headLinks.length; y++)
            {
                var headerLink = headLinks[y];
                if (headerLink.rel == "amphtml")
                {
                    ampData.data.status = "AMP Version found - Check AMP-URL";
                    ampData.data.ampURL ='<b>'+"AMP URL: "+'</b>'+ headLinks[y].href;
                    ampData.data.desktopURL ='<b>'+"Desktop URL: "+'</b>'+  window.location.href;
                }
                else
                {
                    ampData.data.status = "NO AMP VERSION FOUND";
                    ampData.data.ampURL ='<b>'+"AMP URL: "+'</b>'+ "not set";
                    ampData.data.desktopURL ='<b>'+"Desktop URL: "+'</b>'+ "not set";
                }
            }
        }
        else
        {
            ampData.data.status = "NO AMP VERSION FOUND";
            ampData.data.ampURL = "not set";
            ampData.data.desktopURL = "not set";
        }

    }
    //console.log(ampData);
    return ampData;
}
