import { Polymer } from '../../@polymer/polymer/lib/legacy/polymer-fn.js';
import './google-js-api.js';

// Stores whether the API client is done loading.
let _clientLoaded = false;

// Loaders and loading statuses for all APIs, indexed by API name.
// This helps prevent multiple loading requests being fired at the same time
// by multiple google-api-loader elements.
const _statuses = {};
const _loaders = {};

Polymer({

  is: 'google-client-loader',

  /**
   * Fired when the requested API is loaded. Override this name
   * by setting `successEventName`.
   * @event google-api-load
   */

  /**
   * Fired if an error occurs while loading the requested API. Override this name
   * by setting `errorEventName`.
   * @event google-api-load-error
   */

  properties: {
    /**
     * Name of the API to load, e.g. 'urlshortener'.
     *
     * You can find the full list of APIs on the
     * <a href="https://developers.google.com/apis-explorer"> Google APIs
     * Explorer</a>.
     */
    name: String,

    /**
     * Version of the API to load, e.g. 'v1'.
     */
    version: String,

    /**
     * App Engine application ID for loading a Google Cloud Endpoints API.
     */
    appId: String,

    /**
     * Root URL where to load the API from, e.g. 'http://host/apis'.
     * For App Engine dev server this would be something like:
     * 'http://localhost:8080/_ah/api'.
     * Overrides 'appId' if both are specified.
     */
    apiRoot: String,

    /**
     * Name of the event fired when API library is loaded.
     */
    successEventName: {
      type: String,
      value: 'google-api-load',
    },

    /**
     * Name of the event fired when there is an error loading the library.
     */
    errorEventName: {
      type: String,
      value: 'google-api-load-error',
    },
  },

  hostAttributes: {
    hidden: true, // remove from rendering tree.
  },

  // Used to fix events potentially being fired multiple times by
  // iron-jsonp-library.
  _waiting: false,

  /**
   * Returns the loaded API.
   */
  get api() {
    if (window.gapi && window.gapi.client &&
        window.gapi.client[this.name]) {
      return window.gapi.client[this.name];
    }
    return undefined;
  },

  /**
   * Wrapper for `gapi.auth`.
   */
  get auth() {
    return gapi.auth;
  },

  ready() {
    this._loader = document.createElement('google-js-api');

    if (!this.shadowRoot) { this.attachShadow({ mode: 'open' }); }
    this.shadowRoot.appendChild(this._loader);

    this.listen(this._loader, 'js-api-load', '_loadClient');
  },

  detached() {
    this.unlisten(this._loader, 'js-api-load', '_loadClient');
  },

  _loadClient() {
    gapi.load('client', this._doneLoadingClient.bind(this));
  },

  _handleLoadResponse(response) {
    if (response && response.error) {
      _statuses[this.name] = 'error';
      this._fireError(response);
    } else {
      _statuses[this.name] = 'loaded';
      this._fireSuccess();
    }
  },

  _fireSuccess() {
    this.fire(
      this.successEventName,
      { name: this.name, version: this.version },
    );
  },

  _fireError(response) {
    if (response && response.error) {
      this.fire(this.errorEventName, {
        name: this.name,
        version: this.version,
        error: response.error,
      });
    } else {
      this.fire(this.errorEventName, {
        name: this.name,
        version: this.version,
      });
    }
  },

  _doneLoadingClient() {
    _clientLoaded = true;
    // Fix for API client load event being fired multiple times by
    // iron-jsonp-library.
    if (!this._waiting) {
      this._loadApi();
    }
  },

  _createSelfRemovingListener(eventName) {
    var handler = function () {
      _loaders[this.name].removeEventListener(eventName, handler);
      this._loadApi();
    }.bind(this);

    return handler;
  },

  _loadApi() {
    if (_clientLoaded && this.name && this.version) {
      this._waiting = false;
      // Is this API already loaded?
      if (_statuses[this.name] == 'loaded') {
        this._fireSuccess();
      // Is a different google-api-loader already loading this API?
      } else if (_statuses[this.name] == 'loading') {
        this._waiting = true;
        _loaders[this.name].addEventListener(
          this.successEventName,
          this._createSelfRemovingListener(this.successEventName),
        );
        _loaders[this.name].addEventListener(
          this.errorEventName,
          this._createSelfRemovingListener(this.errorEventName),
        );
      // Did we get an error when we tried to load this API before?
      } else if (_statuses[this.name] == 'error') {
        this._fireError(null);
      // Otherwise, looks like we're loading a new API.
      } else {
        let root;
        if (this.apiRoot) {
          root = this.apiRoot;
        } else if (this.appId) {
          root = `https://${this.appId}.appspot.com/_ah/api`;
        }
        _statuses[this.name] = 'loading';
        _loaders[this.name] = this;
        gapi.client.load(
          this.name, this.version,
          this._handleLoadResponse.bind(this), root,
        );
      }
    }
  },
});
