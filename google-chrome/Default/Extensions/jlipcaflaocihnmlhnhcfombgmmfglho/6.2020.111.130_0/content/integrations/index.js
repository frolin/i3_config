function IntegrationsRouter(data) {

    var searchIntegrations = {
            yandex: /^(www\.)?(beta\.)?yandex\.(ua|ru|by|kz)/,
            //yandex_catalog: /^(www\.)?yandex\.(ua|ru|by|kz|com\.tr|com)/,
            ya: /^(www\.)?ya\.ru/,
            //google: /^(www\.)?google\.(am|az|bg|by|ee|kz|lv|md|ru|ua|com\.ua|uz|com|us|fr|de|es|it|pl|pt)/
            google: /^(www\.)?google(?=.(?:[^\.]{2,3}\.)*)/
        },
        domain = document.location.host;

    for (var pattern in searchIntegrations) {
        if (data.integration[pattern] && searchIntegrations[pattern].test(domain)) {
            window.rdz.integrations.search[pattern](data); // start the search integration
            window.rdz.integrations.search.isRunning = true; // flag the search integration has been started
        }
    }
}