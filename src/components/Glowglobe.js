import 'leaflet/dist/leaflet.css';
import L from "leaflet";
import React, {useEffect, useState,useRef} from "react";
import domtoimage from 'dom-to-image-more';


//import './leaflet-extensions/boundaries/mask'

import './leaflet-extensions/sliderbutton/leaflet-slider.css'
import './leaflet-extensions/sliderbutton/leaflet-slider'

import './leaflet-extensions/customcontrol/Leaflet.Control.Custom'


//Chroma
import chroma from "chroma-js";

//Leaflet Extensions


//Pan Control
import './leaflet-extensions/pancontrol/L.Control.Pan';
import './leaflet-extensions/pancontrol/L.Control.Pan.css';
import './leaflet-extensions/pancontrol/L.Control.Pan.ie.css';

//Geoman
import '@geoman-io/leaflet-geoman-free';
import '@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css';

//Style Editor
import 'leaflet-styleeditor-minified/dist/javascript/Leaflet.StyleEditor'
import 'leaflet-styleeditor-minified/dist/css/Leaflet.StyleEditor.css'

//Full Screen Button
import './leaflet-extensions/fullscreen/Control.FullScreen.css'
import './leaflet-extensions/fullscreen/Control.FullScreen'

//Scale Factor
import './leaflet-extensions/scalefactor/leaflet.scalefactor.css'
import './leaflet-extensions/scalefactor/leaflet.scalefactor'

//Mouse Coordinates
import './leaflet-extensions/mouseposition/L.Control.MousePosition.css'
import './leaflet-extensions/mouseposition/L.Control.MousePosition'

//Layer Control Minimaps
import './leaflet-extensions/layercontrolminimaps/control.layers.minimap.css'
import './leaflet-extensions/layercontrolminimaps/L.Control.Layers.Minimap'

//Easy Print
import 'leaflet-easyprint'

//Easy Button
//import './leaflet-extensions/easybutton/easy-button.css'
//import './leaflet-extensions/easybutton/easy-button'

import 'leaflet-easybutton'

import 'leaflet-easyprint'

//Slide Compare

import './leaflet-extensions/sidebyside/leaflet-side-by-side'
import './leaflet-extensions/sidebyside/layout.css'




//import 'leaflet-toolbar/dist/leaflet.toolbar.css'
//import 'leaflet-toolbar/dist/leaflet.toolbar.min'

import './leaflet-extensions/leafletpanels/leaflet-panel-layers'
import './leaflet-extensions/leafletpanels/leaflet-panel-layers.css'

import './leaflet-extensions/boundarycanvas/leaflet.mask'

import './leaflet-extensions/measurepath/leaflet-measure-path'
import './leaflet-extensions/measurepath/leaflet-measure-path.css'

import './leaflet-extensions/opacity/L.Control.Opacity'
import './leaflet-extensions/opacity/L.Control.Opacity.css'

import './leaflet-extensions/appearence/L.Control.Appearance'
import './leaflet-extensions/wms/L.TileLayer.BetterWMS'

import './leaflet-extensions/legend/leaflet.wmslegend.css'
import './leaflet-extensions/legend/leaflet.wmslegend'

import './leaflet-extensions/print/leaflet.browser.print'


import 'leaflet-timedimension/dist/leaflet.timedimension.control.css'
import 'leaflet-timedimension/dist/leaflet.timedimension.min'

import 'leaflet-wfst/dist/leaflet-wfst.min'
import 'leaflet-dialog/Leaflet.Dialog.css'
import 'leaflet-dialog/Leaflet.Dialog'

import './leaflet-extensions/attribution/leaflet-control-condended-attribution.css'
import './leaflet-extensions/attribution/leaflet-control-condended-attribution'

import './leaflet-extensions/minimap/Control.MiniMap.css'
import './leaflet-extensions/minimap/Control.MiniMap'

import { center,point,points,polygon,inside,multiPolygon,featureCollection,bbox,bboxPolygon } from '@turf/turf'
import QvantumService from "../service/QvantumService";
import CacipGeonode from "../service/CacipGeonode";



//Leaflet Basemap Providers
require("leaflet-providers");
require('leaflet-routing-machine');


var parse_georaster = require("georaster");
var GeoRasterLayer = require("georaster-layer-for-leaflet");
var tj = require('togeojson');
var shp = require('shpjs');
var JSZip = require("jszip");
var JSZipUtils = require("jszip-utils");



export const Glowglobe = (props) => {

    const glowglobe = useRef();
    const sidebyside = useRef();
    const legend = useRef();
    const panel = useRef();
    const routeDialog = useRef();
    const downloadList = useRef();

    //const server = "https://dev.scio.services:8000"
    const server = "http://localhost:8000"

    const [containerName, setContainerName] = useState("glowglobe");

    const fullToolbar = {
        position:'topright',
        drawMarker: true,
        drawCircleMarker: true,
        drawPolyline: true,
        drawRectangle: true,
        drawPolygon: true,
        drawCircle: true,
        editMode: true,
        dragMode: true,
        cutPolygon: true,
        removalMode: true
    }
    const simpleToolbar = {
        position:'topright',
        drawMarker: false,
        drawCircleMarker: false,
        drawPolyline: false,
        drawRectangle: true,
        drawPolygon: true,
        drawCircle: true,
        editMode: true,
        dragMode: true,
        cutPolygon: true,
        removalMode: true
    }
    const markerToolbar = {
        position:'topright',
        drawMarker: true,
        drawCircleMarker: false,
        drawPolyline: false,
        drawRectangle: false,
        drawPolygon: false,
        drawCircle: false,
        editMode: false,
        dragMode: false,
        cutPolygon: false,
        removalMode: true
    }
    const noToolbar = {
        position:'topright',
        drawMarker: false,
        drawCircleMarker: false,
        drawPolyline: false,
        drawRectangle: false,
        drawPolygon: false,
        drawCircle: false,
        editMode: false,
        dragMode: false,
        cutPolygon: false,
        removalMode: false
    }
    const bboxToolbar = {
        position:'topright',
        drawMarker: false,
        drawCircleMarker: false,
        drawPolyline: false,
        drawRectangle: true,
        drawPolygon: false,
        drawCircle: false,
        editMode: false,
        dragMode: false,
        cutPolygon: false,
        removalMode: false
    }

    const [centralPoint, setCentralPoint] = useState(null);

    const [zoom, setzoom] = useState(6);

    const invalidateSize = () =>{
        //Invalidate Size
        glowglobe.current.invalidateSize(true);
    }

    const  secondsToHms = (d)=> {
        d = Number(d);
        var h = Math.floor(d / 3600);
        var m = Math.floor(d % 3600 / 60);
        var s = Math.floor(d % 3600 % 60);

        var hDisplay = h > 0 ? h + (h == 1 ? " hour, " : " hours, ") : "";
        var mDisplay = m > 0 ? m + (m == 1 ? " minute, " : " minutes, ") : "";
        var sDisplay = s > 0 ? s + (s == 1 ? " second" : " seconds") : "";
        return hDisplay + mDisplay + sDisplay;
    }

    const initializeMap = () =>{

        downloadList.current = L.featureGroup();

        //Basemap Layers
        const basemapLayers = {
            "ESRIWorldImagery": L.tileLayer.provider('Esri.WorldImagery'),
            "ESRIWorldStreet" : L.tileLayer.provider('Esri.WorldStreetMap'),
            "ESRIDeLorme" : L.tileLayer.provider('Esri.DeLorme'),
            "ESRIWorldTopo": L.tileLayer.provider('Esri.WorldTopoMap'),
            "ESRIWorldTerrain": L.tileLayer.provider('Esri.WorldTerrain'),
            "ESRIOcean": L.tileLayer.provider('Esri.OceanBasemap'),
            "ESRINaturalGeography": L.tileLayer.provider('Esri.NatGeoWorldMap'),

        };

        let latitude = 43.222;
        let longitude = 76.851;

        if(props.centralPoint !== undefined){
            setCentralPoint(centralPoint);
            latitude = props.centralPoint.coords.latitude;
            longitude = props.centralPoint.coords.longitude;
        }


        // create map
        let map = L.map("glowglobe",{
            zoomControl:false,
            condensedAttributionControl: false
        }).setView([latitude,longitude],props.zoom);

        L.Icon.Default.prototype.options.iconUrl = 'assets/layout/images/marker-icon.png'


        // set custom emblem and prefix
        L.control.condensedAttribution({
            emblem: '<div class="emblem-wrap" style="padding-top:5px"><img width="30" src="./assets/layout/images/small_trans.png"/></div>',
            prefix: ''
        }).addTo(map);


        if(props.centralPoint !== undefined){
            if(props.centralPoint.coords.marker !== false) {
                var marker = L.marker([latitude, longitude],
                    {
                        icon: L.divIcon({
                            html: '<i class="fas fa-map-marker-check fa-3x" style="color: yellow;"></i>',
                            className: 'homeDivIcon'
                        })
                    });
                marker.addTo(map).bindPopup("My Location");
            }

        }


        //Default Basemap
        var tileLayer = L.tileLayer.provider('Esri.WorldImagery');
        tileLayer.addTo(map);

        //Geoman
        if(props.toolbar === "simple")
        {
            map.pm.addControls(simpleToolbar);

        }else if(props.toolbar === "full")
        {

            var myIcon = L.icon({
                iconUrl: 'assets/layout/images/marker-icon.png',
                iconAnchor: [12, 40],
                popupAnchor: [-3, -76],
                shadowUrl: 'assets/layout/images/shadow.svg',
                shadowSize: [68, 95],
                shadowAnchor: [22, 94]
            });

            map.pm.addControls(fullToolbar);
            var routingControlOptions = {
                name:"Route",
                title:"Draw Route",
                className: "fal fa-road fa-lg",
                toggle: true,
                continueDrawing: true,
                cursorMarker:true,
                actions:[
                    'cancel',
                    {
                        text: 'Calculate Route',
                        onClick: () => {
                            var routeCoords = [];
                            map.pm.getGeomanDrawLayers(false).forEach(
                                (geomanLayer)=>{
                                    if(geomanLayer.pm._shape === "Route"){
                                        routeCoords.push(L.latLng(geomanLayer._latlng.lat,geomanLayer._latlng.lng))
                                    }
                                }
                            )

                            var routeLayer = L.Routing.control({
                                    waypoints: routeCoords,
                                    routeWhileDragging: true,
                                    showAlternatives:true,
                                    show:false,
                                    containerClassName: "noclass"
                                }).addTo(map);

                            map.eachLayer(
                                (layer)=>{
                                    if(!layer._drawnByGeoman){
                                        if(layer.options.pane ==="markerPane"){
                                            map.removeLayer(layer);
                                        }
                                    }
                                }
                            )

                            var elem = document.querySelector('.leaflet-routing-container');
                            elem.parentNode.removeChild(elem);

                        }
                    },
                    {
                        text: 'Show Route Summary',
                        onClick: () => {

                            var routeLayer = null;
                            map.eachLayer(
                                (layer)=>{
                                    if(!layer._drawnByGeoman){
                                        if(layer.options.pane ==="markerPane"){
                                            map.removeLayer(layer);
                                        }else if(layer._route){
                                            routeLayer = layer;
                                        }
                                    }
                                }
                            )

                            var kmDistance = Number(routeLayer._route.summary.totalDistance / 1000).toFixed(2)

                            routeDialog.current = L.control.dialog(
                                {
                                    size:[300,180],
                                    anchor:[50,50],
                                    position:'topleft'
                                }
                            ).setContent(
                                    "<h5>Route Summary</h5>" +
                                    "<p><strong>Total Distance: </strong>"+kmDistance+" km</p>"+
                                    "<p><strong>Total Time: </strong>"+secondsToHms(routeLayer._route.summary.totalTime)+"</p>"
                                )
                                .addTo(map);
                        }
                    },
                    {
                        text: 'Clear Route',
                        onClick: () => {

                            routeDialog.current.destroy();

                            map.pm.getGeomanDrawLayers(false).forEach(
                                (geomanLayer) => {
                                    if (geomanLayer.pm._shape === "Route") {
                                        map.removeLayer(geomanLayer);
                                    }
                                }
                            )

                            map.eachLayer(
                                (layer)=>{
                                    if(layer._waypoints){
                                        map.removeLayer(layer);
                                    }else if(layer._wpIndices){
                                        map.removeLayer(layer);
                                    }
                                }
                            )

                        }
                    }
                ]

            }
            var rectangleOptions = {
                name:"BBox",
                title:"Draw BBox",
                className: "fad fa-object-ungroup fa-lg",
                toggle: true,
                continueDrawing: true,
                cursorMarker:true,
                actions:[
                    'cancel'
                ]
            }
            var layersSelector = {
                name:"Selector",
                title:"Layers Selector",
                className: "fad fa-download fa-lg",
                toggle: true,
                continueDrawing: true,
                cursorMarker:true,
                actions:[
                    'cancel',
                    {
                        text: 'Download PDF',
                        onClick: () => {

                            const a4PageSize = {
                                height: 715,
                                width: 1045
                            }

                            const mapDimensions = {
                                mapWidth: map.getContainer().offsetWidth,
                                mapHeight: map.getContainer().offsetHeight,
                                zoom: map.getZoom(),
                                center: map.getCenter()

                            }

                            const scaleFactor = document.getElementsByClassName('leaflet-control-scalefactor')[0].innerText


                            var title = ''
                            var legendURL = '';
                            var srs = '';

                            map.eachLayer(
                                (layer)=>{
                                    if(layer.options){
                                        if(layer.options.index === 0){
                                            const geoserverLocation = "https://geonode.centralasiaclimateportal.org/";
                                            const cacipGeonode = new CacipGeonode();
                                            cacipGeonode.getGeoserverLayers(geoserverLocation,layer.options.layers).then(
                                                (res)=>{
                                                    let nabstract = res;
                                                    title = layer.options.layers;
                                                    legendURL = layer.options.legendUrl;

                                                    if(layer.wmsParams){
                                                        srs = layer.wmsParams.srs;
                                                    }

                                                    domtoimage.toPng(map.getContainer(), {
                                                        width: parseInt(mapDimensions.mapWidth),
                                                        height: parseInt(mapDimensions.mapHeight),
                                                        filter: function(node){
                                                            if((node.className !== "leaflet-control-container")&&
                                                                (node.className !== "leaflet-styleeditor")){
                                                                return node;
                                                            }
                                                        }
                                                    }).then(
                                                        (dataURL) =>{

                                                            props.pdfFunction( {
                                                                'image':dataURL,
                                                                'title':title,
                                                                'legendURL':legendURL,
                                                                'srs':srs,
                                                                'scaleFactor':scaleFactor,
                                                                'abstract':nabstract
                                                            })

                                                            /*const cg = new CacipGeonode();
                                                            cg.compileReport(server,dataURL,title,legendURL,srs,scaleFactor,nabstract).then(
                                                                (res)=>{
                                                                    console.log("OK")
                                                                }
                                                            )*/
                                                        }
                                                    )
                                                }
                                            )
                                        }
                                    }
                                }
                            )
                        }
                    },
                    /*{
                        text: 'Download Selected Data',
                        onClick: () => {
                            var data = downloadList.current.toGeoJSON();
                            var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data));
                            const element = document.createElement("a");
                            element.href = dataStr;
                            element.download = "mapviewer.geojson";
                            document.body.appendChild(element);
                            element.click();
                        }
                    },
                    {
                        text: 'Show Selected Data',
                        onClick: () => {

                            downloadList.current.eachLayer(function (layer) {
                                layer.setStyle({fillColor :'red'})
                            });

                        }
                    },
                    {
                        text: 'Clear Data',
                        onClick: () => {
                            downloadList.current.clearLayers();
                        }
                    }*/
                ]
            }

            map.pm.Toolbar.copyDrawControl("Marker",
                routingControlOptions
            )

            /*map.pm.Toolbar.copyDrawControl("Rectangle",
                rectangleOptions
            )*/

            map.pm.Toolbar.createCustomControl(
                layersSelector
            )

            map.on('pm:create', (e) => {
                if(
                    (e.shape !== "Marker")&&
                    (e.shape !== "CircleMarker")&&
                    (e.shape !== "Route")&&
                    (e.shape !== "Selector")
                ){
                    e.layer.showMeasurements();
                }
            })
            map.on('pm:drawstart', (e)=>{
                map.pm.getGeomanDrawLayers(false).forEach(
                    (geomanLayer)=>{
                        if(geomanLayer.pm._shape === "BBox"){
                            map.removeLayer(geomanLayer);
                        }
                    }
                )
            })

        }else if(props.toolbar === "no")
        {
            map.pm.addControls(noToolbar);

        }else if(props.toolbar === "marker")
        {
            map.pm.addControls(markerToolbar);
            initializeAdministratorSelector(map);
            map.on('pm:drawstart', (e)=>{
                map.pm.getGeomanDrawLayers(false).forEach(
                    (geomanLayer)=>{
                        map.removeLayer(geomanLayer);
                    }
                )
                map.eachLayer(
                    (item)=>{
                        if(item.glowglobeID !== undefined){
                            if(item.glowglobeID.functionality === "polygonShow"){

                                map.removeLayer(item);
                            }
                        }
                    }
                )
            })
            map.on('pm:create', (e) => {

                var markerPoint = point([e.layer._latlng.lng, e.layer._latlng.lat]);
                var layer = null;
                var currentGlowglobe = {};
                map.eachLayer(
                    (item)=>{
                        if(item.glowglobeID !== undefined){
                            if(item.glowglobeID.functionality === "administrationSelection"){
                                layer = item;
                                currentGlowglobe = item.glowglobeID;
                            }
                        }
                    }
                )


                var regionPolygon = null;
                if(layer.pm._layers[0].feature.geometry.type === "MultiPolygon"){
                    regionPolygon = multiPolygon(layer.pm._layers[0].feature.geometry.coordinates,{name:'selectedPolygon'});
                }else if(layer.pm._layers[0].feature.geometry.type === "Polygon"){
                    regionPolygon = polygon(layer.pm._layers[0].feature.geometry.coordinates,{name:'selectedPolygon'});
                }

                var validLayer = inside(markerPoint, regionPolygon.geometry);
                if(validLayer === false){
                    map.eachLayer(function(layer) {
                        if(layer._leaflet_id === e.layer._leaflet_id){
                            map.removeLayer(layer);
                        }
                    });
                }else{
                    const qvantumService = new QvantumService();
                    qvantumService.
                    getFullGADMPolygon(markerPoint,layer.glowglobeID.administrationLevel).
                    then(
                        function (response) {
                            var gadmGlow = {
                                functionality:"polygonShow"
                            }
                            loadRegion(response,gadmGlow,false)
                        }
                        )
                    currentGlowglobe.country = layer.pm._layers[0].feature.properties.GID_0;
                    currentGlowglobe.point = markerPoint;
                    if(layer.glowglobeID.administrationLevel === '1'){
                        currentGlowglobe.adminName = layer.pm._layers[0].feature.properties.GID_1;
                    }else if(layer.glowglobeID.administrationLevel === '2'){
                        currentGlowglobe.adminName = layer.pm._layers[0].feature.properties.GID_2;
                    }
                    currentGlowglobe.chosenPoint = markerPoint;
                    map.pm.disableDraw();
                    props.glowglobeOutput(currentGlowglobe);
                }
            });
        }else if(props.toolbar === "bbox"){
            map.pm.addControls(bboxToolbar);
            map.on('pm:drawstart', (e)=>{
                map.pm.getGeomanDrawLayers(false).forEach(
                    (geomanLayer)=>{
                        map.removeLayer(geomanLayer);
                    }
                )
            })
            map.on('pm:create', (e) => {

                const drawnBbox = map.pm.getGeomanDrawLayers(false).filter(
                    (geomanLayer)=>{
                        return geomanLayer.pm._shape === "Rectangle";
                    }
                )

                var minPoint = point([drawnBbox[0]._bounds._southWest.lng, drawnBbox[0]._bounds._southWest.lat]);
                var maxPoint = point([drawnBbox[0]._bounds._northEast.lng, drawnBbox[0]._bounds._northEast.lat]);
                var bbx = bbox(featureCollection([minPoint, maxPoint]));
                var pgn = bboxPolygon(bbx);
                props.glowglobeOutput(pgn);
            })
        }
        else{
            map.pm.addControls(simpleToolbar);
        }

        //Scale Factor
        L.control.scalefactor({position:"bottomright"}).addTo(map);

        var myIcon = L.icon({
            iconUrl: 'assets/layout/images/marker-icon.png',
            iconAnchor: [12, 40],
            popupAnchor: [-3, -76],
            shadowUrl: 'assets/layout/images/shadow.svg',
            shadowSize: [68, 95],
            shadowAnchor: [22, 94]
        });

        var gOptions = {
            markerStyle:{
                icon: myIcon,
                draggable: true,

            }
        }
        map.pm.setGlobalOptions(gOptions)

        //Mouse Position
        L.control.mousePosition().addTo(map);

        //Basemap
        var controlMinimap = L.control.layers.minimap(
            basemapLayers, {},
            {
                position: "bottomleft",
                topPadding: "0px",
                bottomPadding: "0px"
            });
        controlMinimap.addTo(map);
        basemapLayers.ESRIWorldImagery.addTo(map);


        //Style Editor
        if(props.styleEditor === true){
            map.addControl(L.control.styleEditor({
                position:'topright'
            }));
        }

        //Full Screen
        var fullscreenControl = L.control.fullscreen({
            position: 'topright', // change the position of the button can be topleft, topright, bottomright or bottomleft, defaut topleft
            title: 'Show me the fullscreen !', // change the title of the button, default Full Screen
            titleCancel: 'Exit fullscreen mode', // change the title of the button when fullscreen is on, default Exit Full Screen
            content: null, // change the content of the button, can be HTML, default null
            forceSeparateButton: true, // force seperate button to detach from zoom buttons, default false
            forcePseudoFullscreen: false, // force use of pseudo full screen even if full screen API is available, default false
            fullscreenElement: false // Dom element to render in full screen, false by default, fallback to map._container
        });
        fullscreenControl.addTo(map);

        L.control.pan().addTo(map);
        L.control.zoom().addTo(map);

        //Print Button
        /*L.control.browserPrint(
            {
                position:'topright'
            }
        ).addTo(map)
        L.control.pan().addTo(map);
        L.control.zoom().addTo(map);

        var printPlugin = L.easyPrint({
            hidden: true,
            sizeModes: ['A4Portrait']
        }).addTo(map);*/
        //printPlugin.printMap('A4Portrait', 'MyFileName');

        map.on("moveend", function () {
            map.pm.getGeomanDrawLayers(false).forEach(
                (geomanLayer)=>{
                    if(
                    (geomanLayer.pm._shape !== "Marker")&&
                    (geomanLayer.pm._shape !== "CircleMarker")&&
                    (geomanLayer.pm._shape !== "Route")&&
                    (geomanLayer.pm._shape !== "Selector")){
                        geomanLayer.updateMeasurements();
                    }
                }
            )
        });

        glowglobe.current = map;

    }

    const removeGlowGlobeLayer = (criterion) =>{
        if(criterion === 'administrationSelection'){
            var currentGlowGlobeID = {};
            var maskLayer = null;
            glowglobe.current.eachLayer(
                (item)=>{
                    if(item.glowglobeID !== undefined){
                        if(item.glowglobeID.functionality === "administrationSelection"){
                            glowglobe.current.removeLayer(item);
                            currentGlowGlobeID = item.glowglobeID;
                            if(item.glowglobeID.maskID){
                                maskLayer = item.glowglobeID.maskID;
                            }
                        }
                    }
                }
            )
            glowglobe.current.eachLayer(
                (item) => {
                    if(item._leaflet_id === maskLayer){
                        glowglobe.current.removeLayer(item);
                    }
                }
            )
            return currentGlowGlobeID;
        }
    }

    const initializeAdministratorSelector = (map) =>{
        const actions = [
            'cancel',
            {
                text: 'Admin Level 1',
                onClick: () => {

                    var currentGlowGlobe = removeGlowGlobeLayer('administrationSelection');
                    const qvantumService = new QvantumService();
                    qvantumService.getGADMPolygon(
                        currentGlowGlobe.country,
                        '1').then(
                        (response)=>{

                            const glowglobeID = {
                                functionality:'administrationSelection',
                                country:currentGlowGlobe.country,
                                administrationLevel: '1'
                            }

                            loadRegion(response,glowglobeID,true);
                        }
                    )

                    let classes = map.pm.Toolbar.getButtons().AdministrationLevelSelector.
                    buttonsDomNode.
                    firstChild.
                    firstChild.className.split(" ");

                    let filteredClasses = classes.filter(
                        (item)=>{
                            if(!item.startsWith("admin-level")){
                                return item
                            }
                        }
                    )

                    filteredClasses.push("admin-level-1");
                    map.pm.Toolbar.getButtons().AdministrationLevelSelector.
                        buttonsDomNode.
                        firstChild.
                        firstChild.className = filteredClasses.join(" ");
                },
            },
            {
                text: 'Admin Level 2',
                onClick: () => {

                    var currentGlowGlobe = removeGlowGlobeLayer('administrationSelection');
                    const qvantumService = new QvantumService();
                    qvantumService.getGADMPolygon(
                        currentGlowGlobe.country,
                        '2').then(
                        (response)=>{

                            const glowglobeID = {
                                functionality:'administrationSelection',
                                country:currentGlowGlobe.country,
                                administrationLevel: '2'
                            }

                            loadRegion(response,glowglobeID,true);
                        }
                    )

                    let classes = map.pm.Toolbar.getButtons().AdministrationLevelSelector.
                    buttonsDomNode.
                    firstChild.
                    firstChild.className.split(" ");

                    let filteredClasses = classes.filter(
                        (item)=>{
                            if(!item.startsWith("admin-level")){
                                return item
                            }
                        }
                    )

                    filteredClasses.push("admin-level-2");
                    map.pm.Toolbar.getButtons().AdministrationLevelSelector.
                        buttonsDomNode.
                        firstChild.
                        firstChild.className = filteredClasses.join(" ");

                }
            }
        ]
        let options = {
            name:'AdministrationLevelSelector',
            block: 'draw',
            title: 'Admin Level Selector',
            toggle: true,
            className: 'admin-level-1',
            actions: actions

        }
        map.pm.Toolbar.createCustomControl(options)

    }

    const loadRegion = (region,glowglobeID,withMask) =>{

        let regionLayer = L.geoJSON(region, {
            style: function (feature) {
                return {
                    color: 'black',
                    opacity: 1,
                    weight: 1,
                    fillOpacity: .1
                };
            }
        });
        if(withMask === true){
            let mask = L.mask(region.features[0], {})
            mask.addTo(glowglobe.current);
            glowglobeID.maskID = mask._leaflet_id;
            regionLayer.maskID = mask._leaflet_id;
            regionLayer.glowglobeID = glowglobeID;
            regionLayer.addTo(glowglobe.current);

            glowglobe.current.fitBounds(regionLayer.getBounds());
            glowglobe.current.setMaxBounds(regionLayer.getBounds());
            glowglobe.current.setMinZoom(glowglobe.current.getBoundsZoom(glowglobe.current.options.maxBounds ) );
        }else{
            regionLayer.glowglobeID = glowglobeID;
            regionLayer.addTo(glowglobe.current);
            glowglobe.current.fitBounds(regionLayer.getBounds());
        }
    }

    const loadLayers = () => {

        if(sidebyside.current !== undefined){
            sidebyside.current.remove();
        }

        if(legend.current !== undefined){
            legend.current.remove();
        }

        const layers = props.layers;
        const visibleLayers = layers.filter(
            (layer) => {
                return layer.visible == true
            }
        )
        var maskID = null;
        glowglobe.current.eachLayer(
            (item) => {
                if (item.removable == true) {
                    glowglobe.current.removeLayer(item);
                } else if (item.glowglobeID !== undefined) {
                    maskID = item.glowglobeID.maskID;
                    glowglobe.current.removeLayer(item);
                }
            }
        )
        glowglobe.current.eachLayer(
            (item) => {
                if (item._leaflet_id === maskID) {
                    glowglobe.current.removeLayer(item);
                }
            }
        )


        visibleLayers.map(
            (item) => {
                if (item.file_type === "geotiff") {
                    if(!Array.isArray(item.url)){
                        fetch(item.url)
                            .then(response => response.arrayBuffer())
                            .then(arrayBuffer => {
                                parse_georaster(arrayBuffer).then(georaster => {
                                    var pixelValuesLegend = [];
                                    //console.log(chroma.brewer);
                                    var scale = chroma.scale("RdGy");
                                    var minColor = 0;
                                    var rangeColor = 0;
                                    var maxColor = 0;

                                    var layer = new GeoRasterLayer({
                                        georaster: georaster,
                                        opacity: 1,
                                        pixelValuesToColorFn: function (pixelValues) {
                                            if (item.palette === 1) {
                                                if (pixelValues[0] === 1) {
                                                    return "#ed8f2f";
                                                } else if (pixelValues[0] === 2) {
                                                    return "#e05f2f";
                                                } else if (pixelValues[0] === 3) {
                                                    return "#d43333";
                                                } else if (pixelValues[0] === 0) {
                                                    return "#ffffff";
                                                }
                                            } else if (item.palette === 2) {
                                                if (pixelValues[0] === 1) {
                                                    return "#42b05c";
                                                } else if (pixelValues[0] === 2) {
                                                    return "#a0dc67";
                                                } else if (pixelValues[0] === 3) {
                                                    return "#c67f5f";
                                                } else if (pixelValues[0] === 4) {
                                                    return "#12AAB5";
                                                } else if (pixelValues[0] === 5) {
                                                    return "#5D7F99";
                                                } else if (pixelValues[0] === 6) {
                                                    return "#f5d680";
                                                } else if (pixelValues[0] === 7) {
                                                    return "#67b7dc";
                                                }
                                            } else {
                                                const min = georaster.mins[0];
                                                const max = georaster.maxs[0];
                                                const range = georaster.ranges[0];

                                                minColor = min;
                                                rangeColor = range;
                                                maxColor = max;

                                                var pixelValue = pixelValues[0]; // there's just one band in this raster

                                                // if there's zero wind, don't return a color
                                                if (pixelValue <= 0) return null;

                                                // scale to 0 - 1 used by chroma
                                                var scaledPixelValue = (pixelValue - min) / range;

                                                var color = scale(scaledPixelValue).hex();
                                                pixelValuesLegend.push(pixelValues);

                                            }

                                            return color;
                                        },
                                        resolution: 256 // optional parameter for adjusting display resolution
                                    });

                                    layer.removable = true;
                                    layer.addTo(glowglobe.current);

                                    //Legend
                                    if (item.palette === 1) {
                                        legend.current = L.control({position: "bottomright"});
                                        legend.current.onAdd = function () {
                                            var div = L.DomUtil.create("div", "legend");
                                            div.innerHTML += '<i style="background: #d43333"></i><span>Reverse & Reduce: Degraded areas with high risk</span><br>';
                                            div.innerHTML += '<i style="background: #e05f2f"></i><span>Reverse: Degraded areas with low risk</span><br>';
                                            div.innerHTML += '<i style="background: #ed8f2f"></i><span>Avoid: Stable areas with high risk</span><br>';

                                            return div;
                                        };
                                        legend.current.addTo(glowglobe.current);
                                    }if (item.palette === 2) {
                                        legend.current= L.control({position: "bottomright"});
                                        legend.current.onAdd = function () {
                                            var div = L.DomUtil.create("div", "legend");
                                            div.innerHTML += '<i style="background: #42b05c"></i><span>Tree-covered</span><br>';
                                            div.innerHTML += '<i style="background: #a0dc67"></i><span>Grassland</span><br>';
                                            div.innerHTML += '<i style="background: #c67f5f"></i><span>Cropland</span><br>';
                                            div.innerHTML += '<i style="background: #12AAB5"></i><span>Wetland</span><br>';
                                            div.innerHTML += '<i style="background: #5D7F99"></i><span>Artificial area</span><br>';
                                            div.innerHTML += '<i style="background: #f5d680"></i><span>Bare land</span><br>';
                                            div.innerHTML += '<i style="background: #67b7dc"></i><span>Water body</span><br>';

                                            return div;
                                        };
                                        legend.current.addTo(glowglobe.current);
                                    }else{

                                        /*var startColor = scale(0).hex();
                                        var endColor = scale((maxColor-minColor)/rangeColor).hex();


                                        legend.current = L.control({position: "bottomright"});
                                        legend.current.onAdd = function () {
                                            var div = L.DomUtil.create("div", "legend");
                                            div.style.width="200px"
                                            div.innerHTML += '<span>Legend</span><br>';

                                            var div2 = L.DomUtil.create("div", "legendColor");
                                            div2.style.backgroundImage="" +
                                                "linear-gradient(to left,"+startColor+","+endColor+")";
                                            div2.style.width="100%";
                                            div2.style.height="20px";
                                            div.appendChild(div2);

                                            return div;
                                        }
                                        legend.current.addTo(glowglobe.current);*/

                                    }

                                    if (item.point !== undefined) {
                                        let regionLayer = L.geoJSON(item.point, {
                                            style: function (feature) {
                                                return {
                                                    color: 'black',
                                                    opacity: 1,
                                                    weight: 2,
                                                    fillOpacity: .1
                                                };
                                            }
                                        });
                                        regionLayer.addTo(glowglobe.current);
                                        glowglobe.current.fitBounds(regionLayer.getBounds());
                                    } else {
                                        glowglobe.current.fitBounds(layer.getBounds());
                                    }
                                    glowglobe.current.setMaxBounds(layer.getBounds());
                                })
                            })
                    }
                    else{
                        fetch(item.url[0]).then(response => response.arrayBuffer())
                            .then(arrayBuffer => {
                                parse_georaster(arrayBuffer).then(georaster => {
                                    var palette = item.palette[0];
                                    var pixelValuesLegend = [];
                                    //console.log(chroma.brewer);
                                    var scale = chroma.scale("RdGy");

                                    var layer = new GeoRasterLayer({
                                        georaster: georaster,
                                        opacity: 1,
                                        pixelValuesToColorFn: function (pixelValues) {
                                            if (palette === 1) {
                                                if (pixelValues[0] === 1) {
                                                    return "#ed8f2f";
                                                } else if (pixelValues[0] === 2) {
                                                    return "#e05f2f";
                                                } else if (pixelValues[0] === 3) {
                                                    return "#d43333";
                                                } else if (pixelValues[0] === 0) {
                                                    return "#ffffff";
                                                }
                                            } else if (palette === 2) {
                                                if (pixelValues[0] === 1) {
                                                    return "#42b05c";
                                                } else if (pixelValues[0] === 2) {
                                                    return "#a0dc67";
                                                } else if (pixelValues[0] === 3) {
                                                    return "#c67f5f";
                                                } else if (pixelValues[0] === 4) {
                                                    return "#12AAB5";
                                                } else if (pixelValues[0] === 5) {
                                                    return "#5D7F99";
                                                } else if (pixelValues[0] === 6) {
                                                    return "#f5d680";
                                                } else if (pixelValues[0] === 7) {
                                                    return "#67b7dc";
                                                }
                                            } else if (palette === 3){
                                                if (pixelValues[0] === -1) {
                                                    return "#d43333";
                                                } else if (pixelValues[0] === 0) {
                                                    return "#fcdd90";
                                                } else if (pixelValues[0] === 1) {
                                                    return "#398e3b";
                                                }
                                            }else if (palette=== 4){
                                                if (pixelValues[0] === 0) {
                                                    return "#fcdd90";
                                                } else if (pixelValues[0] === 1) {
                                                    return "#d43333";
                                                } else if (pixelValues[0] === 2) {
                                                    return "#79a037";
                                                } else if (pixelValues[0] === 3) {
                                                    return "#398e3b";
                                                }
                                            }else {
                                                const min = georaster.mins[0];
                                                const max = georaster.maxs[0];
                                                const range = georaster.ranges[0];

                                                var pixelValue = pixelValues[0]; // there's just one band in this raster

                                                // if there's zero wind, don't return a color
                                                if (pixelValue <= 0) return null;

                                                // scale to 0 - 1 used by chroma
                                                var scaledPixelValue = (pixelValue - min) / range;

                                                var color = scale(scaledPixelValue).hex();
                                                pixelValuesLegend.push(pixelValues);

                                            }

                                            //console.log(color);

                                            return color;
                                        },
                                        resolution: 256 // optional parameter for adjusting display resolution
                                    });

                                    layer.removable = true;
                                    layer.addTo(glowglobe.current);

                                    //Legend
                                    if (palette === 1) {
                                        legend.current = L.control({position: "bottomleft"});
                                        legend.current.onAdd = function () {
                                            var div = L.DomUtil.create("div", "legend");
                                            div.innerHTML += '<i style="background: #d43333"></i><span>Reverse & Reduce: Degraded areas with high risk</span><br>';
                                            div.innerHTML += '<i style="background: #e05f2f"></i><span>Reverse: Degraded areas with low risk</span><br>';
                                            div.innerHTML += '<i style="background: #ed8f2f"></i><span>Avoid: Stable areas with high risk</span><br>';

                                            return div;
                                        };
                                        legend.current.addTo(glowglobe.current);
                                    }else if (palette === 2) {
                                        legend.current= L.control({position: "bottomleft"});
                                        legend.current.onAdd = function () {
                                            var div = L.DomUtil.create("div", "legend");
                                            div.innerHTML += '<i style="background: #42b05c"></i><span>Tree-covered</span><br>';
                                            div.innerHTML += '<i style="background: #a0dc67"></i><span>Grassland</span><br>';
                                            div.innerHTML += '<i style="background: #c67f5f"></i><span>Cropland</span><br>';
                                            div.innerHTML += '<i style="background: #12AAB5"></i><span>Wetland</span><br>';
                                            div.innerHTML += '<i style="background: #5D7F99"></i><span>Artificial area</span><br>';
                                            div.innerHTML += '<i style="background: #f5d680"></i><span>Bare land</span><br>';
                                            div.innerHTML += '<i style="background: #67b7dc"></i><span>Water body</span><br>';

                                            return div;
                                        };
                                        legend.current.addTo(glowglobe.current);
                                    }else if (palette === 4) {
                                        legend.current= L.control({position: "bottomleft"});
                                        legend.current.onAdd = function () {
                                            var div = L.DomUtil.create("div", "legend");
                                            div.innerHTML += '<i style="background: #398e3b"></i><span>Suitable</span><br>';
                                            div.innerHTML += '<i style="background: #79a037"></i><span>Partially Suitable</span><br>';
                                            div.innerHTML += '<i style="background: #fcdd90"></i><span>Neutral</span><br>';
                                            div.innerHTML += '<i style="background: #d43333"></i><span>Non Suitable</span><br>';
                                            return div;
                                        };
                                        legend.current.addTo(glowglobe.current);
                                    }

                                    if (item.point !== undefined) {
                                        let regionLayer = L.geoJSON(item.point, {
                                            style: function (feature) {
                                                return {
                                                    color: 'black',
                                                    opacity: 1,
                                                    weight: 2,
                                                    fillOpacity: .1
                                                };
                                            }
                                        });
                                        regionLayer.addTo(glowglobe.current);
                                        glowglobe.current.fitBounds(regionLayer.getBounds());
                                    } else {
                                        glowglobe.current.fitBounds(layer.getBounds());
                                    }
                                    fetch(item.url[1]).then(response => response.arrayBuffer())
                                        .then(arrayBuffer => {
                                            parse_georaster(arrayBuffer).then(georaster => {
                                                var palette = item.palette[1];
                                                var pixelValuesLegend = [];
                                                var scale = chroma.scale("RdGy");

                                                var layerR = new GeoRasterLayer({
                                                    georaster: georaster,
                                                    opacity: 1,
                                                    pixelValuesToColorFn: function (pixelValues) {
                                                        if(palette === 1) {
                                                            if (pixelValues[0] === 1) {
                                                                return "#ed8f2f";
                                                            } else if (pixelValues[0] === 2) {
                                                                return "#e05f2f";
                                                            } else if (pixelValues[0] === 3) {
                                                                return "#d43333";
                                                            } else if (pixelValues[0] === 0) {
                                                                return "#ffffff";
                                                            }
                                                        }else if (palette === 2) {
                                                            if (pixelValues[0] === 1) {
                                                                return "#42b05c";
                                                            } else if (pixelValues[0] === 2) {
                                                                return "#a0dc67";
                                                            } else if (pixelValues[0] === 3) {
                                                                return "#c67f5f";
                                                            } else if (pixelValues[0] === 4) {
                                                                return "#12AAB5";
                                                            } else if (pixelValues[0] === 5) {
                                                                return "#5D7F99";
                                                            } else if (pixelValues[0] === 6) {
                                                                return "#f5d680";
                                                            } else if (pixelValues[0] === 7) {
                                                                return "#67b7dc";
                                                            }
                                                        }else if (palette === 3){
                                                            if (pixelValues[0] === -1) {
                                                                return "#d43333";
                                                            } else if (pixelValues[0] === 0) {
                                                                return "#fcdd90";
                                                            } else if (pixelValues[0] === 1) {
                                                                return "#398e3b";
                                                            }
                                                        }else if (palette=== 4){
                                                            if (pixelValues[0] === 0) {
                                                                return "#fcdd90";
                                                            } else if (pixelValues[0] === 1) {
                                                                return "#d43333";
                                                            } else if (pixelValues[0] === 2) {
                                                                return "#79a037";
                                                            } else if (pixelValues[0] === 3) {
                                                                return "#398e3b";
                                                            }
                                                        }else {
                                                            const min = georaster.mins[0];
                                                            const max = georaster.maxs[0];
                                                            const range = georaster.ranges[0];

                                                            var pixelValue = pixelValues[0]; // there's just one band in this raster

                                                            // if there's zero wind, don't return a color
                                                            if (pixelValue <= 0) return null;

                                                            // scale to 0 - 1 used by chroma
                                                            var scaledPixelValue = (pixelValue - min) / range;

                                                            var color = scale(scaledPixelValue).hex();
                                                            pixelValuesLegend.push(pixelValues);

                                                        }

                                                        //console.log(color);

                                                        return color;
                                                    },
                                                    resolution: 256 // optional parameter for adjusting display resolution
                                                });


                                                //Legend
                                                if (palette === 1) {
                                                    legend.current = L.control({position: "bottomright"});
                                                    legend.current.onAdd = function () {
                                                        var div = L.DomUtil.create("div", "legend");
                                                        div.innerHTML += '<i style="background: #d43333"></i><span>Reverse & Reduce: Degraded areas with high risk</span><br>';
                                                        div.innerHTML += '<i style="background: #e05f2f"></i><span>Reverse: Degraded areas with low risk</span><br>';
                                                        div.innerHTML += '<i style="background: #ed8f2f"></i><span>Avoid: Stable areas with high risk</span><br>';

                                                        return div;
                                                    };
                                                    legend.current.addTo(glowglobe.current);
                                                }if (palette === 2) {
                                                    legend.current= L.control({position: "bottomright"});
                                                    legend.current.onAdd = function () {
                                                        var div = L.DomUtil.create("div", "legend");
                                                        div.innerHTML += '<i style="background: #42b05c"></i><span>Tree-covered</span><br>';
                                                        div.innerHTML += '<i style="background: #a0dc67"></i><span>Grassland</span><br>';
                                                        div.innerHTML += '<i style="background: #c67f5f"></i><span>Cropland</span><br>';
                                                        div.innerHTML += '<i style="background: #12AAB5"></i><span>Wetland</span><br>';
                                                        div.innerHTML += '<i style="background: #5D7F99"></i><span>Artificial area</span><br>';
                                                        div.innerHTML += '<i style="background: #f5d680"></i><span>Bare land</span><br>';
                                                        div.innerHTML += '<i style="background: #67b7dc"></i><span>Water body</span><br>';

                                                        return div;
                                                    };
                                                    legend.current.addTo(glowglobe.current);
                                                }if (palette === 4) {
                                                    legend.current= L.control({position: "bottomright"});
                                                    legend.current.onAdd = function () {
                                                        var div = L.DomUtil.create("div", "legend");
                                                        div.innerHTML += '<i style="background: #398e3b"></i><span>Suitable</span><br>';
                                                        div.innerHTML += '<i style="background: #79a037"></i><span>Partially Suitable</span><br>';
                                                        div.innerHTML += '<i style="background: #fcdd90"></i><span>Neutral</span><br>';
                                                        div.innerHTML += '<i style="background: #d43333"></i><span>Non Suitable</span><br>';
                                                        return div;
                                                    };
                                                    legend.current.addTo(glowglobe.current);
                                                }

                                                layerR.addTo(glowglobe.current);

                                                layerR.removable = true;
                                                sidebyside.current = L.control.sideBySide(layer, layerR);
                                                sidebyside.current.addTo(glowglobe.current);
                                            })
                                        })
                                    glowglobe.current.setMaxBounds(layer.getBounds());
                                })
                            })
                    }
                }
            })
    }

    const loadSimpleLayers = () => {

        glowglobe.current.eachLayer(
            (layer) => {
                if(layer.options.variant!== "World_Imagery"){
                    glowglobe.current.removeLayer(layer);
                }
            });

        if(legend.current){
            var elem = document.querySelector('.leaflet-control-wms-legend');
            elem.parentNode.removeChild(elem);
            glowglobe.current.removeControl(legend.current)
            legend.current = undefined;
        }


        let latitude = 43.222;
        let longitude = 76.851;

        if(props.centralPoint !== undefined){
            setCentralPoint(centralPoint);
            latitude = props.centralPoint.coords.latitude;
            longitude = props.centralPoint.coords.longitude;

            if(props.centralPoint.coords.marker !== false) {
                var marker = L.marker([latitude,longitude],
                    {icon:L.divIcon({
                            html: '<i class="fas fa-map-marker-check fa-3x" style="color: yellow;"></i>',
                            className: 'homeDivIcon'
                        })});
                marker.addTo(glowglobe.current).bindPopup("My Location");
            }
        }


        var overlays = [];
        let orderedLayers = [];

        let overallIndex = 0;

        if ((props.simpleLayers !== undefined) && (props.simpleLayers !== null)) {
            props.simpleLayers.forEach(
                (item, index) => {
                    glowglobe.current.createPane(item.label);
                    glowglobe.current.getPane(item.label).style.zIndex = 300 - (overallIndex+index);

                    var wmsLayer = L.tileLayer.betterWms(item.url, {
                        layers: item.layer,
                        transparent: true,
                        format: 'image/png',
                        pane: item.label,
                        index: overallIndex+index,
                        legendUrl: item.legendUrl
                    });

                    overlays[item.label] = wmsLayer;
                    orderedLayers[overallIndex+index] = wmsLayer;

                    if(item.bbox.minx){
                        wmsLayer.bbox = item.bbox;
                        var southWest  = L.latLng(parseFloat(item.bbox.minx), parseFloat(item.bbox.miny));
                        var northEast   = L.latLng(parseFloat(item.bbox.maxx), parseFloat(item.bbox.maxy));
                        var bounds = L.latLngBounds(southWest,northEast);
                        glowglobe.current.fitBounds(bounds);
                    }


                }
            )
            if (panel.current !== undefined) {
                glowglobe.current.removeControl(panel.current);
                orderedLayers.slice().reverse().forEach(
                    (item) => {
                        item.addTo(glowglobe.current);
                    }
                )
                orderedLayers.forEach(
                    (item, index) => {
                        if (index === 0) {
                            if(legend.current !== undefined){
                                glowglobe.current.removeControl(legend.current);
                            }
                            if (item.options.legendUrl !== "nolegend") {
                                legend.current = L.wmsLegend(item.options.legendUrl);
                            }
                            glowglobe.current.addControl(legend.current);
                        }
                    }
                )
                panel.current = L.control.appearance([], [], overlays, {
                    opacity: true,
                    remove: false,
                    color: false,
                    position: "topleft",
                    legendPanel: legend.current,
                    downloadList: downloadList.current
                });

                panel.current.addTo(glowglobe.current);
            } else {
                orderedLayers.slice().reverse().forEach(
                    (item) => {
                        item.addTo(glowglobe.current);
                    }
                )
                orderedLayers.forEach(
                    (item, index) => {
                        if (index === 0) {
                            legend.current = L.wmsLegend(item.options.legendUrl);
                            glowglobe.current.addControl(legend.current);
                        }
                    }
                )
                panel.current = L.control.appearance([], [], overlays, {
                    opacity: true,
                    remove: false,
                    color: false,
                    position: "topleft",
                    legendPanel: legend.current,
                    downloadList: downloadList.current
                });
                panel.current.addTo(glowglobe.current);
            }
            overallIndex = props.simpleLayers.length;
        }

        if ((props.customLayers !== undefined) && (props.customLayers !== null)) {
            props.customLayers.forEach(
                (item,index) => {
                    const cacipGeonode = new CacipGeonode();
                    if((item.file_type === "json")||(item.file_type === "geojson")){
                        cacipGeonode.loadFile(item.url+"."+item.file_type).then(
                            (res) => {

                                glowglobe.current.createPane(item.title.split(".")[0]);
                                glowglobe.current.getPane(item.title.split(".")[0]).style.zIndex = 300 - (overallIndex+index);

                                var geoJsonLayer = L.geoJSON(res.data,{
                                    onEachFeature: function (feature,layer) {
                                        if (feature.properties) {
                                            layer.bindPopup(JSON.stringify(feature.properties));
                                        }
                                        layer.on(
                                            {
                                                'dblclick':function(e){
                                                    downloadList.current.addLayer(e.sourceTarget);
                                                }
                                            }
                                        )
                                    }
                                }).addTo(glowglobe.current);
                                geoJsonLayer.options={
                                    pane: item.title.split(".")[0],
                                    index: overallIndex+index,
                                    legendUrl: "nolegend"
                                }
                                overlays[item.title.split(".")[0]] = geoJsonLayer;
                                orderedLayers[overallIndex+index] = geoJsonLayer;
                                glowglobe.current.fitBounds(geoJsonLayer.getBounds());

                                if (panel.current !== undefined) {
                                    glowglobe.current.removeControl(panel.current);
                                    orderedLayers.slice().reverse().forEach(
                                        (item) => {
                                            item.addTo(glowglobe.current);
                                        }
                                    )
                                    orderedLayers.forEach(
                                        (item, index) => {
                                            if (index === 0) {
                                                if(legend.current !== undefined){
                                                    glowglobe.current.removeControl(legend.current);
                                                }
                                                if(item.options.legendUrl !== undefined) {
                                                    if (item.options.legendUrl !== "nolegend") {
                                                        legend.current = L.wmsLegend(item.options.legendUrl);
                                                        glowglobe.current.addControl(legend.current);
                                                    }
                                                }

                                            }
                                        }
                                    )
                                    panel.current = L.control.appearance([], [], overlays, {
                                        opacity: true,
                                        remove: false,
                                        color: false,
                                        position: "topleft",
                                        legendPanel: legend.current
                                    });

                                    panel.current.addTo(glowglobe.current);
                                } else {
                                    orderedLayers.slice().reverse().forEach(
                                        (item) => {
                                            item.addTo(glowglobe.current);
                                        }
                                    )
                                    orderedLayers.forEach(
                                        (item, index) => {
                                            if (index === 0) {
                                                if(item.options.legendUrl !== undefined) {
                                                    if (item.options.legendUrl !== "nolegend") {
                                                        legend.current = L.wmsLegend(item.options.legendUrl);
                                                        glowglobe.current.addControl(legend.current);
                                                    }
                                                }
                                            }
                                        }
                                    )
                                    panel.current = L.control.appearance([], [], overlays, {
                                        opacity: true,
                                        remove: false,
                                        color: false,
                                        position: "topleft",
                                        legendPanel: legend.current
                                    });
                                    panel.current.addTo(glowglobe.current);
                                }
                            }
                        )
                    }else if(item.file_type === "kml"){
                        cacipGeonode.loadFile(item.url+"."+item.file_type).then(
                            (res) => {

                                glowglobe.current.createPane(item.title.split(".")[0]);
                                glowglobe.current.getPane(item.title.split(".")[0]).style.zIndex = 300 - (overallIndex+index);

                                const kmlFile =
                                    new DOMParser().parseFromString(res.data,'text/xml');

                                var convertedWithStyles = tj.kml(kmlFile);
                                var geoJsonLayer = L.geoJSON(convertedWithStyles,{
                                    onEachFeature: function (feature,layer) {
                                        if (feature.properties) {
                                            layer.bindPopup(JSON.stringify(feature.properties));
                                        }
                                        layer.on(
                                            {
                                                'dblclick':function(e){
                                                    downloadList.current.addLayer(e.sourceTarget);
                                                }
                                            }
                                        )
                                    }
                                }).addTo(glowglobe.current);
                                overlays[item.title.split(".")[0]] = geoJsonLayer;
                                orderedLayers[overallIndex+index] = geoJsonLayer;
                                glowglobe.current.fitBounds(geoJsonLayer.getBounds());

                                if (panel.current !== undefined) {
                                    glowglobe.current.removeControl(panel.current);
                                    orderedLayers.slice().reverse().forEach(
                                        (item) => {
                                            item.addTo(glowglobe.current);
                                        }
                                    )
                                    orderedLayers.forEach(
                                        (item, index) => {
                                            if (index === 0) {
                                                if(legend.current !== undefined){
                                                    glowglobe.current.removeControl(legend.current);
                                                }
                                                if(item.options.legendUrl !== undefined) {
                                                    if (item.options.legendUrl !== "nolegend") {
                                                        legend.current = L.wmsLegend(item.options.legendUrl);
                                                        glowglobe.current.addControl(legend.current);
                                                    }
                                                }

                                            }
                                        }
                                    )
                                    panel.current = L.control.appearance([], [], overlays, {
                                        opacity: true,
                                        remove: false,
                                        color: false,
                                        position: "topleft",
                                        legendPanel: legend.current
                                    });

                                    panel.current.addTo(glowglobe.current);
                                } else {
                                    orderedLayers.slice().reverse().forEach(
                                        (item) => {
                                            item.addTo(glowglobe.current);
                                        }
                                    )
                                    orderedLayers.forEach(
                                        (item, index) => {
                                            if (index === 0) {
                                                if(item.options.legendUrl !== undefined) {
                                                    if (item.options.legendUrl !== "nolegend") {
                                                        legend.current = L.wmsLegend(item.options.legendUrl);
                                                        glowglobe.current.addControl(legend.current);
                                                    }
                                                }
                                            }
                                        }
                                    )
                                    panel.current = L.control.appearance([], [], overlays, {
                                        opacity: true,
                                        remove: false,
                                        color: false,
                                        position: "topleft",
                                        legendPanel: legend.current
                                    });
                                    panel.current.addTo(glowglobe.current);
                                }
                            }
                        )
                    }else if(item.file_type === "kmz"){
                        JSZipUtils.getBinaryContent(item.url+"."+item.file_type).then(
                            (data)=>{
                                JSZip.loadAsync(data).then(
                                    (zip)=>{
                                        const files = zip.file(/\.kml$/);
                                        //let filess = files.async("text")
                                        for (const file of files) {
                                            file.async("text").then(
                                                (data)=>{
                                                    glowglobe.current.createPane(item.title.split(".")[0]);
                                                    glowglobe.current.getPane(item.title.split(".")[0]).style.zIndex = 300 - (overallIndex+index);

                                                    const kmlFile =
                                                        new DOMParser().parseFromString(data,'text/xml');

                                                    var convertedWithStyles = tj.kml(kmlFile);

                                                    var geoJsonLayer = L.geoJSON(convertedWithStyles,{
                                                        onEachFeature: function (feature,layer) {
                                                            if (feature.properties) {
                                                                layer.bindPopup(JSON.stringify(feature.properties));
                                                            }
                                                            layer.on(
                                                                {
                                                                    'dblclick':function(e){
                                                                        downloadList.current.addLayer(e.sourceTarget);
                                                                    }
                                                                }
                                                            )
                                                        }
                                                    }).addTo(glowglobe.current);

                                                    overlays[item.title.split(".")[0]] = geoJsonLayer;
                                                    orderedLayers[overallIndex+index] = geoJsonLayer;
                                                    glowglobe.current.fitBounds(geoJsonLayer.getBounds());

                                                    if (panel.current !== undefined) {
                                                        glowglobe.current.removeControl(panel.current);
                                                        orderedLayers.slice().reverse().forEach(
                                                            (item) => {
                                                                item.addTo(glowglobe.current);
                                                            }
                                                        )
                                                        orderedLayers.forEach(
                                                            (item, index) => {
                                                                if (index === 0) {
                                                                    if(legend.current !== undefined){
                                                                        glowglobe.current.removeControl(legend.current);
                                                                    }
                                                                    if(item.options.legendUrl !== undefined) {
                                                                        if (item.options.legendUrl !== "nolegend") {
                                                                            legend.current = L.wmsLegend(item.options.legendUrl);
                                                                            glowglobe.current.addControl(legend.current);
                                                                        }
                                                                    }

                                                                }
                                                            }
                                                        )
                                                        panel.current = L.control.appearance([], [], overlays, {
                                                            opacity: true,
                                                            remove: false,
                                                            color: false,
                                                            position: "topleft",
                                                            legendPanel: legend.current
                                                        });

                                                        panel.current.addTo(glowglobe.current);
                                                    } else {
                                                        orderedLayers.slice().reverse().forEach(
                                                            (item) => {
                                                                item.addTo(glowglobe.current);
                                                            }
                                                        )
                                                        orderedLayers.forEach(
                                                            (item, index) => {
                                                                if (index === 0) {
                                                                    if(item.options.legendUrl !== undefined) {
                                                                        if (item.options.legendUrl !== "nolegend") {
                                                                            legend.current = L.wmsLegend(item.options.legendUrl);
                                                                            glowglobe.current.addControl(legend.current);
                                                                        }
                                                                    }
                                                                }
                                                            }
                                                        )
                                                        panel.current = L.control.appearance([], [], overlays, {
                                                            opacity: true,
                                                            remove: false,
                                                            color: false,
                                                            position: "topleft",
                                                            legendPanel: legend.current
                                                        });
                                                        panel.current.addTo(glowglobe.current);
                                                    }
                                                }
                                            )
                                        }

                                    }
                                )
                            }
                        )
                    }
                    else if(item.file_type === "gpx"){
                        glowglobe.current.createPane(item.title.split(".")[0]);
                        glowglobe.current.getPane(item.title.split(".")[0]).style.zIndex = 300 - (overallIndex+index);

                        cacipGeonode.loadFile(item.url+"."+item.file_type).then(
                            (res) => {
                                const gpxFile = new DOMParser().parseFromString(res.data,'text/xml');
                                var convertedWithStyles = tj.gpx(gpxFile);
                                var geoJsonLayer = L.geoJSON(convertedWithStyles,{
                                    onEachFeature: function (feature,layer) {
                                        if (feature.properties) {
                                            layer.bindPopup(JSON.stringify(feature.properties));
                                        }
                                        layer.on(
                                            {
                                                'dblclick':function(e){
                                                    downloadList.current.addLayer(e.sourceTarget);
                                                }
                                            }
                                        )
                                    }
                                }).addTo(glowglobe.current);


                                overlays[item.title.split(".")[0]] = geoJsonLayer;
                                orderedLayers[overallIndex+index] = geoJsonLayer;
                                glowglobe.current.fitBounds(geoJsonLayer.getBounds());

                                if (panel.current !== undefined) {
                                    glowglobe.current.removeControl(panel.current);
                                    orderedLayers.slice().reverse().forEach(
                                        (item) => {
                                            item.addTo(glowglobe.current);
                                        }
                                    )
                                    orderedLayers.forEach(
                                        (item, index) => {
                                            if (index === 0) {
                                                if(legend.current !== undefined){
                                                    glowglobe.current.removeControl(legend.current);
                                                }
                                                if(item.options.legendUrl !== undefined) {
                                                    if (item.options.legendUrl !== "nolegend") {
                                                        legend.current = L.wmsLegend(item.options.legendUrl);
                                                        glowglobe.current.addControl(legend.current);
                                                    }
                                                }

                                            }
                                        }
                                    )
                                    panel.current = L.control.appearance([], [], overlays, {
                                        opacity: true,
                                        remove: false,
                                        color: false,
                                        position: "topleft",
                                        legendPanel: legend.current
                                    });

                                    panel.current.addTo(glowglobe.current);
                                } else {
                                    orderedLayers.slice().reverse().forEach(
                                        (item) => {
                                            item.addTo(glowglobe.current);
                                        }
                                    )
                                    orderedLayers.forEach(
                                        (item, index) => {
                                            if (index === 0) {
                                                if(item.options.legendUrl !== undefined) {
                                                    if (item.options.legendUrl !== "nolegend") {
                                                        legend.current = L.wmsLegend(item.options.legendUrl);
                                                        glowglobe.current.addControl(legend.current);
                                                    }
                                                }
                                            }
                                        }
                                    )
                                    panel.current = L.control.appearance([], [], overlays, {
                                        opacity: true,
                                        remove: false,
                                        color: false,
                                        position: "topleft",
                                        legendPanel: legend.current
                                    });
                                    panel.current.addTo(glowglobe.current);
                                }
                            }
                        )
                    }else if(item.file_type === "shp"){

                        glowglobe.current.createPane(item.title.split(".")[0]);
                        glowglobe.current.getPane(item.title.split(".")[0]).style.zIndex = 300 - (overallIndex+index);


                        shp(item.url).then(
                            (geojson)=>{
                                var geoJsonLayer = L.geoJSON(geojson,{
                                    onEachFeature: function (feature,layer) {
                                        if (feature.properties) {
                                            layer.bindPopup(JSON.stringify(feature.properties));
                                        }
                                        layer.on(
                                            {
                                                'dblclick':function(e){
                                                    downloadList.current.addLayer(e.sourceTarget);
                                                }
                                            }
                                        )
                                    }
                                }).addTo(glowglobe.current);
                                overlays[item.title.split(".")[0]] = geoJsonLayer;
                                orderedLayers[overallIndex+index] = geoJsonLayer;
                                glowglobe.current.fitBounds(geoJsonLayer.getBounds());

                                if (panel.current !== undefined) {
                                    glowglobe.current.removeControl(panel.current);
                                    orderedLayers.slice().reverse().forEach(
                                        (item) => {
                                            item.addTo(glowglobe.current);
                                        }
                                    )
                                    orderedLayers.forEach(
                                        (item, index) => {
                                            if (index === 0) {
                                                if(legend.current !== undefined){
                                                    glowglobe.current.removeControl(legend.current);
                                                }
                                                if(item.options.legendUrl !== undefined) {
                                                    if (item.options.legendUrl !== "nolegend") {
                                                        legend.current = L.wmsLegend(item.options.legendUrl);
                                                        glowglobe.current.addControl(legend.current);
                                                    }
                                                }

                                            }
                                        }
                                    )
                                    panel.current = L.control.appearance([], [], overlays, {
                                        opacity: true,
                                        remove: false,
                                        color: false,
                                        position: "topleft",
                                        legendPanel: legend.current
                                    });

                                    panel.current.addTo(glowglobe.current);
                                } else {
                                    orderedLayers.slice().reverse().forEach(
                                        (item) => {
                                            item.addTo(glowglobe.current);
                                        }
                                    )
                                    orderedLayers.forEach(
                                        (item, index) => {
                                            if (index === 0) {
                                                if(item.options.legendUrl !== undefined) {
                                                    if (item.options.legendUrl !== "nolegend") {
                                                        legend.current = L.wmsLegend(item.options.legendUrl);
                                                        glowglobe.current.addControl(legend.current);
                                                    }
                                                }
                                            }
                                        }
                                    )
                                    panel.current = L.control.appearance([], [], overlays, {
                                        opacity: true,
                                        remove: false,
                                        color: false,
                                        position: "topleft",
                                        legendPanel: legend.current
                                    });
                                    panel.current.addTo(glowglobe.current);
                                }
                            });
                    }else if(
                        (item.file_type === "tiff")
                        || (item.file_type === "geotiff")
                        || (item.file_type === "tif")
                        || (item.file_type === "geotif")
                    ) {
                        fetch(item.url+"."+item.file_type)
                            .then(response => response.arrayBuffer())
                            .then(arrayBuffer => {
                                parse_georaster(arrayBuffer).then(georaster => {
                                    var pixelValuesLegend = [];
                                    var scale = chroma.scale("RdGy");
                                    var minColor = 0;
                                    var rangeColor = 0;
                                    var maxColor = 0;

                                    var geoJsonLayer = new GeoRasterLayer({
                                        georaster: georaster,
                                        opacity: 1,
                                        pixelValuesToColorFn: function (pixelValues) {
                                            if (item.palette === 1) {
                                                if (pixelValues[0] === 1) {
                                                    return "#ed8f2f";
                                                } else if (pixelValues[0] === 2) {
                                                    return "#e05f2f";
                                                } else if (pixelValues[0] === 3) {
                                                    return "#d43333";
                                                } else if (pixelValues[0] === 0) {
                                                    return "#ffffff";
                                                }
                                            } else if (item.palette === 2) {
                                                if (pixelValues[0] === 1) {
                                                    return "#42b05c";
                                                } else if (pixelValues[0] === 2) {
                                                    return "#a0dc67";
                                                } else if (pixelValues[0] === 3) {
                                                    return "#c67f5f";
                                                } else if (pixelValues[0] === 4) {
                                                    return "#12AAB5";
                                                } else if (pixelValues[0] === 5) {
                                                    return "#5D7F99";
                                                } else if (pixelValues[0] === 6) {
                                                    return "#f5d680";
                                                } else if (pixelValues[0] === 7) {
                                                    return "#67b7dc";
                                                }
                                            } else {
                                                const min = georaster.mins[0];
                                                const max = georaster.maxs[0];
                                                const range = georaster.ranges[0];

                                                minColor = min;
                                                rangeColor = range;
                                                maxColor = max;

                                                var pixelValue = pixelValues[0]; // there's just one band in this raster

                                                // if there's zero wind, don't return a color
                                                if (pixelValue <= 0) return null;

                                                // scale to 0 - 1 used by chroma
                                                var scaledPixelValue = (pixelValue - min) / range;

                                                var color = scale(scaledPixelValue).hex();
                                                pixelValuesLegend.push(pixelValues);

                                            }
                                            return color;
                                        },
                                        resolution: 256 // optional parameter for adjusting display resolution
                                    });


                                    geoJsonLayer.addTo(glowglobe.current);

                                    glowglobe.current.createPane(item.title.split(".")[0]);
                                    glowglobe.current.getPane(item.title.split(".")[0]).style.zIndex = 300 - (overallIndex+index);

                                    overlays[item.title.split(".")[0]] = geoJsonLayer;
                                    orderedLayers[overallIndex+index] = geoJsonLayer;
                                    glowglobe.current.fitBounds(geoJsonLayer.getBounds());



                                    if (panel.current !== undefined) {
                                        glowglobe.current.removeControl(panel.current);
                                        orderedLayers.slice().reverse().forEach(
                                            (item) => {
                                                item.addTo(glowglobe.current);
                                            }
                                        )
                                        orderedLayers.forEach(
                                            (item, index) => {
                                                if (index === 0) {
                                                    if(legend.current !== undefined){
                                                        glowglobe.current.removeControl(legend.current);
                                                    }
                                                    if(item.options.legendUrl !== undefined){
                                                        if (item.options.legendUrl !== "nolegend") {
                                                            legend.current = L.wmsLegend(item.options.legendUrl);
                                                            glowglobe.current.addControl(legend.current);
                                                        }
                                                    }

                                                }
                                            }
                                        )
                                        panel.current = L.control.appearance([], [], overlays, {
                                            opacity: true,
                                            remove: false,
                                            color: false,
                                            position: "topleft",
                                            legendPanel: legend.current
                                        });

                                        panel.current.addTo(glowglobe.current);
                                    } else {
                                        orderedLayers.slice().reverse().forEach(
                                            (item) => {
                                                item.addTo(glowglobe.current);
                                            }
                                        )
                                        orderedLayers.forEach(
                                            (item, index) => {
                                                if (index === 0) {
                                                    if(item.options.legendUrl !== undefined){
                                                        if (item.options.legendUrl !== "nolegend") {
                                                            console.log("!");
                                                            legend.current = L.wmsLegend(item.options.legendUrl);
                                                            glowglobe.current.addControl(legend.current);
                                                        }
                                                    }
                                                }
                                            }
                                        )
                                        panel.current = L.control.appearance([], [], overlays, {
                                            opacity: true,
                                            remove: false,
                                            color: false,
                                            position: "topleft",
                                            legendPanel: legend.current
                                        });
                                        panel.current.addTo(glowglobe.current);
                                    }

                                })
                            })
                    }
                }
            )

        }

    }

    const loadSelectedRegion = ()=>{
        if (props.regionLayer.point !== undefined) {
            let regionLayer = L.geoJSON(props.regionLayer.point, {
                style: function (feature) {
                    return {
                        color: 'black',
                        opacity: 1,
                        weight: 2,
                        fillOpacity: .1
                    };
                }
            });
            regionLayer.addTo(glowglobe.current);
            glowglobe.current.fitBounds(regionLayer.getBounds());
        }
    }

    useEffect(() => {

        if(props.container !== undefined){
            setContainerName(props.container);
        }

        initializeMap();
        if(props.regionLayer !== undefined){
            loadSelectedRegion();
        }

        loadSimpleLayers();
    },[]);

    useEffect(() => {
        if((props.country !== undefined)&&(props.country !== null)){
            let requestCountry = "";
            if(props.country === "TN"){
                requestCountry = "TUN";
            }else if (props.country === "BF"){
                requestCountry = "BFA";
            }

            const glowglobeID = {
                functionality:'administrationSelection',
                country:requestCountry,
                administrationLevel: props.defaultAdminLevel
            }

            const qvantumService = new QvantumService();
            qvantumService.getGADMPolygon(requestCountry,props.defaultAdminLevel).then(
                (response)=>{
                    loadRegion(response,glowglobeID,true);
                }
            )

            let classes = glowglobe.current.pm.Toolbar.getButtons().AdministrationLevelSelector.
            buttonsDomNode.
            firstChild.
            firstChild.className.split(" ");

            let filteredClasses = classes.filter(
                (item)=>{
                    if(!item.startsWith("admin-level")){
                        return item
                    }
                }
            )
            if(props.defaultAdminLevel === '1'){
                filteredClasses.push("admin-level-1");
                glowglobe.current.pm.Toolbar.getButtons().AdministrationLevelSelector.
                    buttonsDomNode.
                    firstChild.
                    firstChild.className = filteredClasses.join(" ");
            }

        }
    },[props.country]);

    useEffect(() => {
        if((props.layers !== undefined)&&(props.layers !== null)){
            loadLayers();
        }
    },[props.layers]);

    useEffect(() => {
        console.log(props)
        if((props.simpleLayers !== undefined)&&(props.simpleLayers !== null)){
            loadSimpleLayers();
        }
        if((props.customLayers !== undefined)&&(props.customLayers !== null)){
            loadSimpleLayers();
        }
    },[props.simpleLayers,props.customLayers]);

    return (
        <div id={containerName} className="p-mb-4 p-mt-4"></div>
    );

}
