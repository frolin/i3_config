/**
 *
 * @returns {Test Test}
 */
var value ="";
var activeTab ="metaTags";
var refreshStatus = false;
//untereinader schreiben!!!!
var tabs = {metaTags:"metaTags",heading:"heading",jsFramework:"jsFramework",analytics:"analytics",HTML5detection:"HTML5detection",schemaOrg:"schemaOrg",techData:"techData"};
var seoData = {};

/**
 *
 * @returns {Element}
 */
function ResponseFromBackground(msg)
{
    if (msg.action == 'Send')
    {
        document.getElementById("seoData").innerHTML = "";
        //console.log("AppTesterPanel.js: seoData: ResponseFromBackground: ",msg.data);
        seoData = Object.assign(seoData,msg.data);
       // console.log("AppTesterPanel.js: seoData: ",seoData);

        refreshStatus = true;

        changeTab(activeTab);

        //RespondToBackground({Action:'GetAllRecords',Records:Records});
    }
    if (msg.action == 'Techdata')
    {
        //vllt. clear Tab funktion schreiben... das beschreibt das alles nicht gut genug
        //document.getElementById("seoData").innerHTML = "";
        seoData.techData = msg.data;
       //console.log("techData: ",msg.data);
     //  console.log("Seo Data: ",seoData);
        // TODO: Diese funktion deaktivieren
        //changeTab(activeTab);
    }

    //chrome.devtools.inspectedWindow.eval("console.log('DO SOMETHING IN PANEL')");
}


/**
 *
 * @returns {Element}
 */
var WindowLoad = function ()

{
    var data = document.getElementsByClassName('data')[0];
    var sidebar =document.getElementById("sidebar");
    var sidebarMouseDown =false;
    sidebar.addEventListener("mousedown", function(e) {
        //console.log(e);
        if (e.offsetX >= sidebar.getBoundingClientRect().width - 3) {
            sidebarMouseDown =true;
        }

    });

    sidebar.addEventListener("mouseup", function(e)
    {
        //console.log(e);
            sidebarMouseDown =false;
        data.style.userSelect = "auto";
    });

    document.body.addEventListener("mousemove", function(e)
    {
        //console.log(e);
        //sidebar.innerHTML = e.clientX;
        if(sidebarMouseDown == true && e.clientX >= 120 && e.clientX <=250) {
            sidebar.style.width = e.clientX + "px";
            setWidth(sidebar,data);
            data.style.userSelect = "none";
        }
    });

setWidth(sidebar,data);
};

window.addEventListener('load', WindowLoad);


/**
 *
 * @returns {Element}
 */
function getLiFrom(e)
{
    var currentTarget = e;
   // console.log(currentTarget);
    var currentTargetHasProperty = e.target.getAttribute('data-type');
    var activeElements = document.querySelectorAll("#sidebar li.active");
    //console.log(activeElements);
    if (activeElements.length == 1) {
      activeElements[0].classList.remove("active");
    }


    if (!currentTargetHasProperty)
    {
        if (currentTarget.target.parentNode.getAttribute('data-type'))
        {
            value = currentTarget.target.parentNode.getAttribute('data-type');
            e.target.parentNode.classList.add("active");
            if(refreshStatus == true) {
                changeTab(value);
            }

            //console.log(currentTarget.target.parentNode.getAttribute('data-type'));
            //return currentTarget.target.parentNode.getAttribute('data-type');
        }
    } else
    {
        e.target.classList.add("active");
        //console.log(currentTargetHasProperty);
        value = currentTargetHasProperty;
        if (refreshStatus == true) {
            changeTab(value);
        }

       // return currentTargetHasProperty;
    }
}
var sidebar = document.getElementById('sidebar');
sidebar.addEventListener('click', getLiFrom);




/**
 *
 * @returns {Element}
 */
function setWidth (sidebar,data)
{
    data.style.width = "calc(100% - "+sidebar.getBoundingClientRect().width+"px)";
}



/**
 *
 * @returns {Element}
 */
/*
document.getElementsByClassName("refresh")[0].addEventListener("click",function()
{
    //console.log("refresh clicked");
    RespondToBackground({action:"refresh"})
});*/



/**
 *
 * @returns {Element}
 */
function changeTab(value)
{

    activeTab = value;
    document.getElementById("seoData").innerHTML ="";
    var content;

    if  (activeTab == tabs.metaTags && refreshStatus)
    {
        content = loadTabs.loadTabMetaTags();
    }
    if  (activeTab == tabs.analytics && refreshStatus)
    {

    }
    if  (activeTab == tabs.heading && refreshStatus)
    {
        content = loadTabs.loadTabHeaderElements();
    }
    if  (activeTab == tabs.HTML5detection && refreshStatus)
    {
        content = loadTabs.loadTabHTML5Elements();
    }
    if  (activeTab == tabs.jsFramework && refreshStatus)
    {

    }
    if  (activeTab == tabs.schemaOrg && refreshStatus)
    {
        content = loadTabs.loadSchemaOrg();
    }
    if  (activeTab == tabs.techData && refreshStatus)
    {
        content = loadTabs.loadTechData();
    }
    if (content)
    {
        document.getElementById("seoData").appendChild(content);

        if (activeTab == tabs.metaTags) {
            tableFixer();
        }

    }
    else
    {
        document.getElementById("seoData").innerHTML ="leer";
    }

    //console.log(content);
}





/**
 *
 * @returns {Element}
 */
function tableFixer()
{
    var tableRowElements = document.getElementsByClassName('tableDataRow');
    //console.log("AppTesterPanel.js: Table Row Elements:", tableRowElements);

    for (var i = 0; i <  tableRowElements.length; i++)
    {
        var currentRowElement = tableRowElements[i];
        var currentRowChildrenLength = currentRowElement.children.length;
        //console.log(currentRowChildrenLength);
        var missingRows  = 4-currentRowChildrenLength;

        if (missingRows != 0)
        {
            for (var z = 1; z <= missingRows; z++)
            {
                var tableDataElement = document.createElement("td");
                currentRowElement.appendChild(tableDataElement);
            }

        }
    }
}



var loadTabs = {};
loadTabs.helper = {};
loadTabs.loadTabMetaTags = function()
{
    var metaTags = seoData.metaTags;
    var tableElement = document.createElement("table");
    var tableHeadElement = document.createElement("th");
    var tableHeadProperty1 = document.createElement("th");
    var tableHeadProperty2 = document.createElement("th");
    var tableHeadStatus = document.createElement("th");

    tableHeadElement.innerHTML = "Element";
    tableHeadProperty1.innerHTML = "Property 1";
    tableHeadProperty2.innerHTML = "Property 2";
    tableHeadStatus.innerHTML = "Status";

    tableElement.appendChild(tableHeadElement);
    tableElement.appendChild(tableHeadProperty1);
    tableElement.appendChild(tableHeadProperty2);
    tableElement.appendChild(tableHeadStatus);

    for (var s in metaTags)
    {
        var metaTag = metaTags[s];
        var tableRow = document.createElement("tr");
        var tableData1 = document.createElement("td");
        tableRow.className +="tableDataRow";
        tableRow.appendChild(tableData1);
        tableData1.innerHTML = '<b>'+ metaTag.name+'</b>';

        for (var n in metaTag.data)
        {
            var metaTagProperty = metaTag.data[n];
            var tableData2 = document.createElement("td");
            tableRow.appendChild(tableData2);
            tableData2.innerHTML =metaTagProperty;
        }
        tableElement.appendChild(tableRow);
    }
    return tableElement;
};




loadTabs.loadTabHeaderElements = function()
{
    var headerElements = seoData.headerElements;
    var tableElement = document.createElement("table");

    var tableHeadHeadingElement = document.createElement("th");
    var tableHeadHeadingTitle = document.createElement("th");

    tableHeadHeadingElement.innerHTML = "H-Element";
    tableHeadHeadingTitle.innerHTML ="H-Element Title";

    tableElement.appendChild(tableHeadHeadingElement);
    tableElement.appendChild(tableHeadHeadingTitle);
    //console.log(seoData.headerElements);

        if (seoData.headerElements.length > 0)
        {
            for ( var i = 0; i < seoData.headerElements.length; i++)

            {

                var tableRow = document.createElement("tr");
                var tableData1 = document.createElement("td");
                var tableData2 = document.createElement("td");
                tableRow.className +="tableDataRow";

                tableData1.innerHTML = '<b>'+ seoData.headerElements[i].hElement+'</b>';
                tableData2.innerHTML = seoData.headerElements[i].hText;

                tableRow.appendChild(tableData1);
                tableRow.appendChild(tableData2);

                tableElement.appendChild(tableRow);
            }
            return tableElement;
        }
        else
        {
            var flexBoxDiv = document.createElement("div");
            var noticeDiv = document.createElement("div");

            flexBoxDiv.style = "display:flex;justify-content:center;align-items:center;";
            noticeDiv.className ="reloadNotice";
            noticeDiv.innerHTML ="no Heading-Elements found";
            flexBoxDiv.appendChild(noticeDiv);
            return flexBoxDiv;
        }

};




loadTabs.loadTabHTML5Elements = function()
{
    var html5Elements = seoData.html5.Elements;


    //SET var to create HTML5 Chart
    var seoDataContent =document.getElementById("seoData");
    var flexContainer = document.createElement("div");
    var html5Container = document.createElement("div");
    var header = document.createElement("div");
    var nav = document.createElement("div");
    var div = document.createElement("div");
    var article = document.createElement("div");
    var section = document.createElement("div");
    var aside = document.createElement("div");
    var footer = document.createElement("div");

    //Set var to create HTML5 Chart Legend
    var legend = document.createElement("div");
    var legendGreenBox =document.createElement("div");
    var legendGreen =document.createElement("div");
    var legendGreyBox =document.createElement("div");
    var legendGrey =document.createElement("div");
    var legendGreenName = document.createElement("div");
    var legendGreyName =document.createElement("div");

    // Set Name for each HTML5 element & Legend
    header.innerHTML = "HEADER";
    nav.innerHTML = "NAV";
    article.innerHTML = "ARTICLE";
    section.innerHTML ="SECTION";
    aside.innerHTML ="ASIDE";
    footer.innerHTML ="FOOTER";
    legendGreenName.innerHTML = "HTML5-Tag found";
    legendGreyName.innerHTML ="HTML5-Tag not found";

    //Styling for flexContainer
    flexContainer.style.display = "flex";
    flexContainer.style.justifyContent ="center";
    flexContainer.style.alignItems = "center";
    // Set classes for each html 5 element
    header.className ="html5Element clear notFound";
    nav.className ="html5Element clear notFound";
    article.className = "html5Element box notFound";
    section.className = "html5Element clear section notFound";
    aside.className ="html5Element box notFound";
    footer.className ="html5Element clear notFound";

    // Set classes for HTML5 Legend
    legendGreenBox.className ="legendBoxGreen";
    legendGreyBox.className ="legendBoxGrey";
    legendGreenName.className = "legendName";
    legendGreyName.className = "legendName";
    legendGrey.className = "legendGrey";

    legendGreen.appendChild(legendGreenBox);
    legendGreen.appendChild(legendGreenName);

    legendGrey.appendChild(legendGreyBox);
    legendGrey.appendChild(legendGreyName);

    legend.appendChild(legendGreen);
    legend.appendChild(legendGrey);



    for (var i = 0; i < html5Elements.length; i++)
    {
     //   console.log(html5Elements[i]);
        if (html5Elements[i].name == "HEADER")
        {
            header.className ="html5Element clear found";
        }
        if (html5Elements[i].name == "NAV")
        {
            nav.className ="html5Element clear found";
        }
        if (html5Elements[i].name == "ARTICLE")
        {
            article.className = "html5Element box found";
        }
        if (html5Elements[i].name == "SECTION")
        {
            section.className = "html5Element clear section found";
        }
        if (html5Elements[i].name == "ASIDE")
        {
            aside.className ="html5Element box found";
        }
        if (html5Elements[i].name == "FOOTER")
        {
            footer.className ="html5Element clear found";
        }
    }

    //Append flexContainer to seoData Wrapper
    var html5Data =seoDataContent.appendChild(flexContainer);

    // Append all elements
    article.appendChild(section);
    div.appendChild(article);
    div.appendChild(aside);
    html5Container.appendChild(header);
    html5Container.appendChild(nav);
    html5Container.appendChild(div);
    html5Container.appendChild(footer);
    flexContainer.appendChild(html5Container);
    flexContainer.appendChild(legend);
    return  html5Data;
};


loadTabs.loadSchemaOrg = function()
{
    var schemaOrgData = seoData.schemaOrg;

    var tableElement = document.createElement("table");
   // var tableHead = document.createElement("th");
    var tableHeadContext = document.createElement("th");
    var tableHeadMarkup = document.createElement("th");
    var tableHeadType = document.createElement("th");

    tableHeadContext.innerHTML = "Context";
    tableHeadMarkup.innerHTML ="Markup";
    tableHeadType.innerHTML = "Type";

    tableElement.appendChild(tableHeadContext);
    tableElement.appendChild(tableHeadMarkup);
    tableElement.appendChild(tableHeadType);

    if (schemaOrgData.length > 0)
    {
        for ( var i = 0; i < schemaOrgData.length; i++)
        {

            var tableRow = document.createElement("tr");
            var tableData1 = document.createElement("td");
            var tableData2 = document.createElement("td");
            var tableData3 = document.createElement("td");
            tableRow.className +="tableDataRow";

            tableData1.innerHTML = schemaOrgData[i].context;
            tableData2.innerHTML = schemaOrgData[i].markup;
            tableData3.innerHTML = schemaOrgData[i].type;

            tableRow.appendChild(tableData1);
            tableRow.appendChild(tableData2);
            tableRow.appendChild(tableData3);

            tableElement.appendChild(tableRow);
        }
        return tableElement;
    }
    else
    {
        var flexBoxDiv = document.createElement("div");
        var noticeDiv = document.createElement("div");

        flexBoxDiv.style = "display:flex;justify-content:center;align-items:center;";
        noticeDiv.className ="reloadNotice";
        noticeDiv.innerHTML ="no schema.org found";
        flexBoxDiv.appendChild(noticeDiv);
        return flexBoxDiv;
    }

};


loadTabs.loadTechData = function()
{
    var techData = [];

    var ipAddress = {};
    ipAddress.name = "IP-Address";
    ipAddress.value = seoData.techData.entries[0].serverIPAddress;
    techData.push(ipAddress)

    var httpVersion = {};
    httpVersion.name = "HTTP-Version";
    httpVersion.value =  seoData.techData.entries[0].response.httpVersion;
    techData.push(httpVersion)

    var redirectURL = {};
    redirectURL.name = "Redirect URL";
    redirectURL.value = seoData.techData.entries[0].response.redirectURL;
    techData.push(redirectURL)

    var statusCode = {};
    statusCode.name = "Status Code";
    statusCode.value = seoData.techData.entries[0].response.status;
    techData.push(statusCode)

    var statusText = {};
    statusText.name = "Status Text";
    statusText.value = seoData.techData.entries[0].response.statusText;
    techData.push(statusText)

    var contentType = {};
    contentType.name = "Content Type";
    contentType.value =seoData.techData.entries[0].response.content.mimeType;
    techData.push(contentType)

    var tableElement = document.createElement("table");
    var tableHeadValue = document.createElement("th");
    var tableHeadResponse = document.createElement("th");


    tableHeadValue.innerHTML = "Value";
    tableHeadResponse.innerHTML ="Response";

    tableElement.appendChild(tableHeadValue);
    tableElement.appendChild(tableHeadResponse);


    for ( var i = 0; i < techData.length; i++)
    {

        var tableRow = document.createElement("tr");
        var tableData1 = document.createElement("td");
        var tableData2 = document.createElement("td");
        tableRow.className +="tableDataRow";

        tableData1.innerHTML = techData[i].name;
        tableData2.innerHTML = techData[i].value;

        tableRow.appendChild(tableData1);
        tableRow.appendChild(tableData2);

        tableElement.appendChild(tableRow);
    }
    //console.log("TechData", techData);
    return tableElement;
   // console.log(seoData.techData);
};
