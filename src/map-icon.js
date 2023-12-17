"use strict";

// init choreogrphy inspired by good map
let initCalled;
const callbackPromise = new Promise((r) => (window.__initMap = r));

function loadGoogleMaps(apiKey) {
  if (!initCalled) {
    const script = document.createElement("script");
    script.src =
      "https://maps.googleapis.com/maps/api/js?" +
      (apiKey ? `key=${apiKey}&` : "") +
      "callback=__initMap";
    document.head.appendChild(script);
    initCalled = true;
  }
  return callbackPromise;
}

const MAX_ZOOM = 15;

class MapIcon extends HTMLElement {
  constructor() {
    super();

    this.map = null;
    this.apiKey = null;
    // // zoom, lat, lng exposed at top level, but passed to map init within mapOptions
    this.zoom = null;
    this.center = null;
    this.mapOptions = {
      zoomControl: true,
      mapTypeControl: false,
      scaleControl: false,
      streetViewControl: false,
      rotateControl: false,
      fullscreenControl: false,
    };
    this.markers = [];
  }

  static get observedAttributes() {
    return ["api-key", "zoom", "center", "options", "markers"];
  }

  connectedCallback() {
    // called after the attributes have been set via attributeChangedCallback

    loadGoogleMaps(this.apiKey).then(() => {
      this.mapOptions.zoom = this.zoom || 12;
      this.mapOptions.center = this.mapOptions.center || this.center;
      this.map = new google.maps.Map(this, this.mapOptions);

      google.maps.event.addListenerOnce(this.map, "idle", () => {
        const markers = JSON.parse(this.getAttribute("markers")) || [];
        this.attachMarkers(markers);
      });
    });
  }

  attributeChangedCallback(name, oldVal, val) {
    // console.log(name, val);
    switch (name) {
      case "api-key":
        this.apiKey = val;
        break;

      case "zoom":
        this.zoom = parseInt(val);
        if (this.map) {
          this.map.setZoom(this.zoom);
        }
        break;

      case "center":
        try {
          const center = JSON.parse(val);
          if (center.lat && center.lng) {
            this.center = center;
            if (this.map) {
              // setCenter allows us to pass a literal
              this.map.setCenter(center);
            }
          }
        } catch (e) {}
        break;

      case "options":
        this.mapOptions = JSON.parse(val);
        break;

      case "markers":
        const markerPositions = JSON.parse(val);
        this.attachMarkers(markerPositions);
        break;
    }
  }

  attachMarkers(markers) {
    try {
      if (typeof google != "undefined" && google.maps) {
        this.addRemoveMarkers(markers);
      }
    } catch (e) {
      console.error(e);
    }
  }

  addRemoveMarkers(markers) {
    if (this.map) {
      this.markers.forEach((marker) => marker.setMap(null));

      if (markers.length > 0) {
        markers.forEach((r, idx) => {
          const newMarker = this.makeMarker(r);
          newMarker.setMap(this.map);
          this.markers[idx] = newMarker;
        });

        this.fitMap();
      }
    }
  }

  makeMarker(r) {
    const marker = new google.maps.Marker(r);
    google.maps.event.addListener(
      marker,
      "click",
      ((d) => {
        this.dispatchEvent(new CustomEvent("markerClicked", { detail: d }));
      }).bind(this, r)
    );
    return marker;
  }

  fitMap() {
    let markers = this.markers;

    const mybounds = new google.maps.LatLngBounds();

    // if there are no markers (and no location) we end up at 0,0
    if (markers.length) {
      markers
        .filter((m) => m.getMap())
        .forEach((marker) => mybounds.extend(marker.getPosition()));
    }
    this.map.fitBounds(mybounds);

    if (this.map.getZoom() > MAX_ZOOM) {
      this.map.setZoom(MAX_ZOOM);
    }
  }
}

customElements.define("map-icon", MapIcon);
