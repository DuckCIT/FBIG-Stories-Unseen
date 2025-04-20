(function () {
    'use strict';

    // Intercept and override window.fetch
    const originalFetch = window.fetch;
    window.fetch = function (resource, config) {
        const requestURL = resource instanceof Request ? resource.url : resource;

        // Block requests related to seen status on Facebook/Instagram
        if (config?.body && typeof config.body === 'string') {
            if (
                config.body.includes('PolarisStoriesV3SeenMutation') ||
                config.body.includes('storiesUpdateSeenStateMutation')
            ) {
                console.log('Blocked fetch request to:', requestURL);
                return new Promise(() => { }); // Prevent fetch from resolving
            }
        }

        return originalFetch.apply(this, arguments);
    };

    // Intercept and override XMLHttpRequest
    const originalOpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function (method, url) {
        this._method = method;
        this._url = url;
        originalOpen.apply(this, arguments);
    };

    const originalSend = XMLHttpRequest.prototype.send;
    XMLHttpRequest.prototype.send = function (body) {
        if (typeof body === 'string') {
            if (
                this._url.includes('graphql') &&
                (body.includes('PolarisStoriesV3SeenMutation') || body.includes('storiesUpdateSeenStateMutation'))
            ) {
                console.log('Blocked XMLHttpRequest to:', this._url);
                this.abort(); // Cancel the request
                return;
            }
        }

        originalSend.apply(this, arguments);
    };
})();
