function Initialized(response) {
  function cleanContent() {
    const content = document.querySelector(".tree-headers-structure");
    const treeElem = document.querySelector(".tree");

    if (treeElem) {
      content.removeChild(treeElem);
    }
  }

  function insertAfter(newNode, referenceNode) {
    referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
  }

  function generateAlertIcon() {
    const img = document.createElement("img");
    img.setAttribute("src", "/img/alert-icon.png");
    img.setAttribute("class", "alert-icon");
    return img;
  }

  function checkIfMoreThenOneH1(oneMoreH1) {
    const headersH1OnPage = document.getElementsByTagName("h1");
    const length = headersH1OnPage.length;

    if (length > 1) {
      const isMissingHeader = headersH1OnPage[0].hasAttribute("class");
      const index = isMissingHeader ? 2 : 1;

      for (let i = index; i < length; i++) {
        const span = headersH1OnPage[i].querySelector("span");
        const img = generateAlertIcon();
        const warning = document.createElement("span");

        span.classList.remove("label-success-h1");
        span.classList.add("label-warning");

        warning.innerHTML = oneMoreH1;
        warning.setAttribute("class", "one-more-h1");

        insertAfter(warning, span);

        headersH1OnPage[i].insertBefore(img, span);
      }
    }
  }

  function goToSerpstat(logoLink) {
    window.open(logoLink, "_blank");
  }

  function getHeadersCount(headerLevel, headerNotFoundText) {
    const headers = document.getElementsByTagName(headerLevel);
    let headersLength = headers.length;
    for (let i = 0; i < headers.length; i++) {
      if (headers[i].lastChild.textContent === headerNotFoundText) {
        headersLength--;
      }
    }
    return headersLength;
  }

  function showHeadersCount(headerNotFoundText) {
    document.querySelector(
      ".hierarchy-colors"
    ).innerHTML = `<div class="H1-color">H1 - ${getHeadersCount(
      "h1",
      headerNotFoundText
    )}</div>
    <div class="H2-color">H2 - ${getHeadersCount(
      "h2",
      headerNotFoundText
    )}</div>
    <div class="H3-color">H3 - ${getHeadersCount(
      "h3",
      headerNotFoundText
    )}</div>
    <div class="H4-color">H4 - ${getHeadersCount(
      "h4",
      headerNotFoundText
    )}</div>
    <div class="H5-color">H5 - ${getHeadersCount(
      "h5",
      headerNotFoundText
    )}</div>
    <div class="H6-color">H6 - ${getHeadersCount(
      "h6",
      headerNotFoundText
    )}</div>`;
  }

  try {
    cleanContent();
    const { url, headersHierarchy, locales, logoLink } = response;
    const {
      title,
      description,
      headerNotFound,
      oneMoreH1,
      headerIsEmpty,
      tooltip
    } = locales;

    document.querySelector("title").innerHTML = tooltip;

    document.querySelector(
      ".hierarchy-title"
    ).innerHTML = `<p class='title'>${title}: <a href=${url} title=${url} class='link'  target="_blank">${url}</a></p>`;

    document.querySelector(
      ".about-serpstat"
    ).innerHTML = `<p class='description'>${description}</p>`;

    const headings = headersHierarchy;
    const headingsLength = headings.length;

    if (headingsLength > 0) {
      let childElement = null;
      let heading = null;
      let headingLevel = null;
      let headingText = null;
      let headingTextWrapper = null;
      let previousHeadingLevel = 0;

      const content = document.querySelector(".tree-headers-structure");
      const container = document.createElement("div");

      container.setAttribute("class", "tree");

      for (let j = 0; j < headingsLength; j++) {
        heading = headings[j];
        headingLevel = heading.level;
        headingText = heading.text;

        for (let k = previousHeadingLevel + 1; k < headingLevel; k++) {
          const img = generateAlertIcon();
          childElement = document.createElement("span");
          heading = document.createElement("h" + k);

          childElement.appendChild(document.createTextNode("H" + k));
          childElement.setAttribute("class", "label label-warning");

          heading.appendChild(childElement);
          heading.appendChild(document.createTextNode(headerNotFound));
          heading.setAttribute("class", "text-muted");

          container.appendChild(heading);

          heading.insertBefore(img, childElement);
        }

        childElement = document.createElement("span");
        heading = document.createElement(`h${headingLevel}`);
        childElement.appendChild(document.createTextNode(`H${headingLevel}`));

        if (!headingText.trim()) {
          const img = generateAlertIcon();
          headingText = headerIsEmpty;

          childElement.setAttribute("class", "label label-header-is-empty");

          heading.appendChild(childElement);

          headingTextWrapper = document.createElement("span");
          headingTextWrapper.innerHTML = headingText;
          heading.setAttribute("class", "text-muted");

          heading.appendChild(headingTextWrapper);
          container.appendChild(heading);

          heading.insertBefore(img, childElement);
        } else {
          childElement.setAttribute(
            "class",
            `label label-success-h${headingLevel}`
          );
          heading.appendChild(childElement);

          headingTextWrapper = document.createElement("span");
          headingTextWrapper.innerHTML = headingText;

          heading.appendChild(headingTextWrapper);
          container.appendChild(heading);
        }
        previousHeadingLevel = headingLevel;
      }
      content.appendChild(container);
    }

    checkIfMoreThenOneH1(oneMoreH1);

    document.querySelector(".logo-prod").onclick = () => goToSerpstat(logoLink);

    showHeadersCount(headerNotFound);
  } catch (error) {
    console.log("Error in generated tab:", error);
  }
}
