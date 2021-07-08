import L from "leaflet";
import $ from "jquery"
import 'leaflet-wfst/dist/leaflet-wfst.min'

L.TileLayer.BetterWMS = L.TileLayer.WMS.extend({

  onAdd: function (map) {
    // Triggered when the layer is added to a map.
    //   Register a click listener, then do all the upstream WMS things
    L.TileLayer.WMS.prototype.onAdd.call(this, map);
    map.on('click', this.getFeatureInfo, this);
  },

  onRemove: function (map) {
    // Triggered when the layer is removed from a map.
    //   Unregister a click listener, then do all the upstream WMS things
    L.TileLayer.WMS.prototype.onRemove.call(this, map);
    map.off('click', this.getFeatureInfo, this);
  },

  getFeatureInfo: function (evt) {
      if(evt.target.pm.Toolbar.buttons.removalMode._button.toggleStatus !== true){
          // Make an AJAX request to the server and hope for the best
          var url = this.getFeatureInfoUrl(evt.latlng),
              showResults = L.Util.bind(this.showGetFeatureInfo, this);
          $.ajax({
              url: url,
              success: function (data, status, xhr) {
                  var err = typeof data === 'string' ? null : data;
                  showResults(err, evt.latlng, data);
              },
              error: function (xhr, status, error) {
                  showResults(error);
              }
          });
      }

  },

  getFeatureInfoUrl: function (latlng) {
    // Construct a GetFeatureInfo request URL given a point
    var point = this._map.latLngToContainerPoint(latlng, this._map.getZoom()),
        size = this._map.getSize(),

        params = {
          request: 'GetFeatureInfo',
          service: 'WMS',
          srs: 'EPSG:4326',
          styles: this.wmsParams.styles,
          transparent: this.wmsParams.transparent,
          version: this.wmsParams.version,
          format: this.wmsParams.format,
          bbox: this._map.getBounds().toBBoxString(),
          height: size.y,
          width: size.x,
          layers: this.wmsParams.layers,
          query_layers: this.wmsParams.layers,
          info_format: 'text/html'
        };

    params[params.version === '1.3.0' ? 'i' : 'x'] = point.x;
    params[params.version === '1.3.0' ? 'j' : 'y'] = point.y;

    return this._url + L.Util.getParamString(params, this._url, true);
  },

  showGetFeatureInfo: function (err, latlng, content) {
    if (err) { console.log(err); return; } // do nothing if there's an error

      if(content.toString().includes("<table class=\"featureInfo\">")){

          var filter =
              new L.Filter.BBox('the_geom',
                  L.latLngBounds(
                      latlng,
                      latlng),
                  L.CRS.EPSG4326);

          const wfstPointOptions = {
              crs: L.CRS.EPSG4326,
              filter:filter.toGml(),
              showExisting: true,
              url: 'https://geonode.centralasiaclimateportal.org/geoserver/wfs',
              typeNS: 'geonode',
              typeName: this.wmsParams.layers,
              maxFeatures: 80,
              opacity: 1,
              style: function(layer) {
                  // you can use if statemt etc
                  return {
                      color: '#3388FF',
                      weight: 5,

                  }
              },

          };

          const wfstPoint = new L.WFST(
              wfstPointOptions,
              new L.Format.GeoJSON({
                  crs: L.CRS.EPSG4326
              }));

          wfstPoint.options.name = this.wmsParams.layers;
          wfstPoint.options.type = "WFS";
          wfstPoint.options.pane = this.wmsParams.layers;


          var geojson = wfstPoint.toGeoJSON();

          wfstPoint.addTo(this._map).once('load', function () {
              /*var geojson = wfstPoint.toGeoJSON();
              var geojsonLayer = L.geoJSON(geojson,{
                  onEachFeature: function (feature,layer) {
                      if (feature.properties) {
                          layer.bindPopup(JSON.stringify(feature.properties));
                      }
                      layer.on(
                          {
                              'dblclick': function (e) {
                                  this._map.downloadList.addLayer(e.sourceTarget);
                              }
                          }
                      )
                  }
              })
              geojsonLayer.addTo(this._map)*/
              //this._map.fitBounds(geojson.getBounds());

          });


          // Otherwise show the content in a popup, or something.
          L.popup({ maxWidth: 800})
              .setLatLng(latlng)
              .setContent(content)
              .openOn(this._map);
      }
  }
});

L.tileLayer.betterWms = function (url, options) {
  return new L.TileLayer.BetterWMS(url, options);
};
