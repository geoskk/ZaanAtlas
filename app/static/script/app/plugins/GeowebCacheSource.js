/**
 * Copyright (c) 2008-2011 The Open Planning Project
 * 
 * Published under the GPL license.
 * See https://github.com/opengeo/gxp/raw/master/license.txt for the full text
 * of the license.
 */

/**
 * @requires plugins/LayerSource.js
 * @requires OpenLayers/Layer/WMTS.js
 */

/** api: (define)
 *  module = gxp.plugins
 *  class = TileSource
 */

/** api: (extends)
 *  plugins/LayerSource.js
 */
Ext.namespace("gxp.plugins");

/** api: constructor
 *  .. class:: TileSource(config)
 *
 *    Plugin for using MapQuest layers with :class:`gxp.Viewer` instances.
 *
 *    Available layer names are "osm" and "naip"
 */
/** api: example
 *  The configuration in the ``sources`` property of the :class:`gxp.Viewer` is
 *  straightforward:
 *
 *  .. code-block:: javascript
 *
 *    "mapquest": {
 *        ptype: "gxp_tilesource"
 *    }
 *
 *  A typical configuration for a layer from this source (in the ``layers``
 *  array of the viewer's ``map`` config option would look like this:
 *
 *  .. code-block:: javascript
 *
 *    {
 *        source: "tiles",
 *        name: "osm"
 *    }
 *
 */
gxp.plugins.TileSource = Ext.extend(gxp.plugins.LayerSource, {
    
    /** api: ptype = gxp_tilesource */
    ptype: "gxp_gwcsource",

    /** api: property[store]
     *  ``GeoExt.data.LayerStore``. Will contain records with "osm" and
     *  "naip" as name field values.
     */
    
    /** api: config[title]
     *  ``String``
     *  A descriptive title for this layer source (i18n).
     */
    title: "GeoWebCache Layers",

    /** api: config[naipAttribution]
     *  ``String``
     *  Attribution string for NAIP generated layer (i18n).
     */
    attributionZaanstad: "<a href='http://www.zaanstad.nl/' target='_blank'><img src='../theme/app/img/logo.png' border='0'></a>",

    /** api: config[naipAttribution]
     *  ``String``
     *  Attribution string for NAIP generated layer (i18n).
     */
    attributionMapfactory: "<a href='http://www.mapfactory.nl/' target='_blank'><img src='../theme/app/img/mapfactory.png' border='0'></a>",


    /** api: method[createStore]
     *
     *  Creates a store of layer records.  Fires "ready" when store is loaded.
     */
    createStore: function() {
        
        var options = {
            projection: "EPSG:28992",
            resolutions: [53.76, 40.32, 26.88, 20.16, 13.44, 10.08, 6.72, 5.04, 3.36, 2.52, 1.68, 1.26, 0.84, 0.63, 0.42, 0.315, 0.21, 0.1575, 0.105, 0.07875, 0.0525],
			//maxExtent: [102009, 480557, 129270, 506221],
			maxExtent: new OpenLayers.Bounds(12628.0541,308179.0423,287879.2541,610955.3622999999),
            units: "m",
            buffer: 1,
            transitionEffect: "resize",
            //singleTile: true,
            tileSize: new OpenLayers.Size(256,256),
            tileOptions: {crossOriginKeyword: null}
        };
        
        var layers = [
            new OpenLayers.Layer.WMS(
                "Zaanstad 1812",
                "http://map16z/geowebcache/service/wms",
                {layers: "Zaanstad1812", format: "image/png"},
                OpenLayers.Util.applyDefaults({                
                    attribution: this.attributionMapfactory,
                    type: "Zaanstad1812"
                }, options)
            ),
            new OpenLayers.Layer.WMS(
                "Open Street Map",
                "http://geo.zaanstad.nl/geowebcache/service/wms",
                {layers: "OSM", format: "image/png"},
                OpenLayers.Util.applyDefaults({                
                    attribution: this.attributionZaanstad,
                    type: "osm"
                }, options)
            ),
            new OpenLayers.Layer.WMS(
                "Luchtfoto",
                "http://geo.zaanstad.nl/geowebcache/service/wms",
                {layers: "Luchtfoto", format: "image/png"},
                OpenLayers.Util.applyDefaults({                
                    attribution: this.attributionZaanstad,
                    type: "lufo"
                }, options)
            ),
            new OpenLayers.Layer.WMS(
                "Topkaart (top10nl)",
                "http://geo.zaanstad.nl/geowebcache/service/wms",
                {layers: "Top10nl", format: "image/png"},
                OpenLayers.Util.applyDefaults({                
                    attribution: this.attributionZaanstad,
                    type: "top10nl"
                }, options)
            ),
            new OpenLayers.Layer.WMS(
                "BAG",
                "http://geo.zaanstad.nl/geowebcache/service/wms",
                {layers: "BAG", format: "image/png"},
                OpenLayers.Util.applyDefaults({                
                    attribution: this.attributionZaanstad,
                    type: "bag"
                }, options)
            ),
            new OpenLayers.Layer.WMS(
                "GBKZ",
                "http://geo.zaanstad.nl/geowebcache/service/wms",
                {layers: "GBKZ", format: "image/png"},
                OpenLayers.Util.applyDefaults({
                    attribution: this.attributionZaanstad,
                    type: "gbkz"
                }, options)
            )
        ];
        
        this.store = new GeoExt.data.LayerStore({
            layers: layers,
            fields: [
                {name: "source", type: "string"},
                {name: "name", type: "string", mapping: "type"},
                {name: "abstract", type: "string", mapping: "attribution"},
                {name: "group", type: "string", defaultValue: "background"},
                {name: "fixed", type: "boolean", defaultValue: true},
                {name: "selected", type: "boolean"}
            ]
        });
        this.store.each(function(l) {
            l.set("group", "background");
        });
        this.fireEvent("ready", this);

    },
    
    /** api: method[createLayerRecord]
     *  :arg config:  ``Object``  The application config for this layer.
     *  :returns: ``GeoExt.data.LayerRecord``
     *
     *  Create a layer record given the config.
     */
    createLayerRecord: function(config) {
        var record;
        var index = this.store.findExact("name", config.name);
        if (index > -1) {

            record = this.store.getAt(index).copy(Ext.data.Record.id({}));            
            var layer = record.getLayer().clone();
 
            // set layer title from config
            if (config.title) {
                /**
                 * Because the layer title data is duplicated, we have
                 * to set it in both places.  After records have been
                 * added to the store, the store handles this
                 * synchronization.
                 */
                layer.setName(config.title);
                record.set("title", config.title);
            }

            // set visibility from config
            if ("visibility" in config) {
                layer.visibility = config.visibility;
            }
            
            record.set("selected", config.selected || false);
            record.set("source", config.source);
            record.set("name", config.name);
            if ("group" in config) {
                record.set("group", config.group);
            }

            record.data.layer = layer;
            record.commit();
        }
        return record;
    }

});

Ext.preg(gxp.plugins.TileSource.prototype.ptype, gxp.plugins.TileSource);
