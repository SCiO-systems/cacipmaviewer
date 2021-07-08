import axios from 'axios';
import { point,polygon,inside,multiPolygon,featureCollection,bbox,bboxPolygon } from '@turf/turf'
import CapabilitiesUtil from "@terrestris/ol-util/dist/CapabilitiesUtil/CapabilitiesUtil";


export default class CacipGeonode {

    async fetchApprovedResources(geoserverLocation){
        var layerResources = [];
        await axios.get(geoserverLocation.replace("/geoserver","")
            +"/api/layers/?title__contains=").then(
            (res) =>{
                res.data.objects.forEach(
                    (item)=>{
                        var published = false;
                        if((item.is_approved===true)&&
                            (item.is_published===true))
                        {
                            published = true;
                        }else{
                            published = false;

                        }
                        layerResources[item.typename]= published
                    }
                )
            }
        )

        return layerResources;

    }

    async resourceStatus(geoserverLocation,name){
        return axios.get(geoserverLocation.replace("/geoserver","")
            +"/api/base/?title__contains="
            +name).then(
            (res) => {
                if(res.data.objects.length>0){
                    if((res.data.objects[0].is_approved===true)&&
                        (res.data.objects[0].is_published===true))
                    {
                        return true;
                    }else{
                        return false;
                    }
                }else{
                    return false;
                }
            }
        )
    }

    async downloadData(geoserverLocation,layer,type){

        let outputFormat = '';
        let extension = '';
        let mime = '';
        let service = '';

        if(type === 'CSV'){
            outputFormat = 'csv';
            extension =  '.csv';
            mime = 'text/csv;charset=utf-8';
            service = 'WFS';
        }else if(type === 'XLS'){
            outputFormat = 'excel2007';
            extension =  '.xlsx';
            mime = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
            service = 'WFS';
        }else if(type === 'JSON'){
            outputFormat = 'application/json';
            extension = '.json';
            mime = 'text/plain;charset=utf-8';
            service = 'WFS';
        }else if(type === 'JPG'){
            outputFormat = 'image/jpeg';
            extension =  '.jpg';
            mime = 'image/jpeg';
            service = 'WMS';
        }else if(type === 'PNG'){
            outputFormat = 'image/png';
            extension =  '.png';
            mime = 'image/png';
            service = 'WMS';
        }else if(type === 'PDF'){
            outputFormat = 'application/pdf';
            extension =  '.pdf';
            mime = 'application/pdf';
            service = 'WMS';
        }else if(type === 'KML'){
            outputFormat = 'KML';
            extension =  '.kml';
            mime = 'application/vnd.google-earth.kml+xml;';
            service = 'WFS';
        }else if(type === 'GMLV'){
            outputFormat = 'GML2';
            extension =  '.gml';
            mime = 'application/gml+xml';
            service = 'WFS';
        }else if(type === 'GMLR'){
            outputFormat = 'GML2';
            extension =  '.gml';
            mime = 'application/gml+xml';
            service = 'WCS';
        }else if(type === 'SHP'){
            outputFormat = 'SHAPE-ZIP';
            extension =  '.zip';
            mime = 'application/zip';
            service = 'WFS';
        }else if(type === 'GEOTIFFR'){
            outputFormat = 'image/tiff';
            extension =  '.tif';
            mime = 'image/tiff';
            service = 'WCS';
        }

        if(service === 'WMS'){
            let workingBbox = undefined;
            let maxx = undefined;
            let maxy = undefined;
            let minx = undefined;
            let miny = undefined;


            if(Array.isArray(layer.boundingBox)){
                workingBbox = layer.boundingBox.filter(
                    (item)=>{
                        if(item.$){
                            if(item.$.CRS === "EPSG:4326"){
                                return item;
                            }
                        }
                    }
                )
                maxx = workingBbox[0].$.maxx;
                maxy = workingBbox[0].$.maxy;
                minx = workingBbox[0].$.minx;
                miny = workingBbox[0].$.miny;

            }else{
                maxx = layer.boundingBox.bbox[2]
                maxy = layer.boundingBox.bbox[3]
                minx = layer.boundingBox.bbox[0]
                miny = layer.boundingBox.bbox[1]
            }

            if(layer.name.startsWith("geonode:")){
                layer.name  = layer.name.replace("geonode:","")
            }

            let crs = layer.crs;


            let width = 1024;
            let height = 1024;
            let bbox = parseFloat(miny)+","+parseFloat(minx)+","+parseFloat(maxy)+","+parseFloat(maxx);


            //let epsg = require('epsg');
            //toWgs84(layer.boundingBox, undefined, epsg);

            let crsString = "";
            if(crs){
                crsString = "&CRS="+crs
            }


            await axios.get(
                geoserverLocation+'/wms?' +
                'request=GetMap&service=wms&version=1.0.0&' +
                'layers=geonode:'+layer.name+'&' +
                'format='+outputFormat+'&' +
                'bbox='+bbox+'&'+
                'width='+width+"&"+
                'height='+height+crsString,
                {
                    responseType: 'arraybuffer'
                }
            ).then(
                (response) => {
                    let blob = new Blob([response.data],{type:mime});
                    const element = document.createElement("a");
                    element.href = URL.createObjectURL(blob);
                    element.download = layer.name+extension;
                    document.body.appendChild(element);
                    element.click();
                }
            )
        }else if(service === 'WFS'){

            var responseType = 'blob';

            if(outputFormat === 'excel2007'){
                responseType = 'arraybuffer';
            }

            if(layer.name.startsWith("geonode:")){
                layer.name  = layer.name.replace("geonode:","")
            }

            await axios.get(
                geoserverLocation+'/wfs?' +
                'request=GetFeature&service=wfs&version=1.0.0&' +
                'typename=geonode:'+layer.name+'&' +
                'outputformat='+outputFormat,
                {
                    responseType: responseType
                }
            ).then(
                (response) => {

                    var data = response.data;
                    if(outputFormat === 'application/json'){
                        //console.log(data);
                        //data = JSON.stringify(data);
                    }
                    let blob = new Blob([data],{type:mime});
                    const element = document.createElement("a");
                    element.href = URL.createObjectURL(blob);
                    element.download = layer.name+extension;
                    document.body.appendChild(element);
                    element.click();
                }
            )

        }else if(service === 'WCS'){

            var responseType = 'blob';

            if(layer.name.startsWith("geonode:")){
                layer.name  = layer.name.replace("geonode:","")
            }

            await axios.get(
                geoserverLocation+'/wcs?' +
                'request=GetCoverage&service=WCS&version=2.0.1&' +
                'coverageid=geonode:'+layer.name+'&' +
                'outputformat='+outputFormat,
                {
                    responseType: responseType
                }
            ).then(
                (response) => {

                    var data = response.data;
                    let blob = new Blob([data],{type:mime});
                    const element = document.createElement("a");
                    element.href = URL.createObjectURL(blob);
                    element.download = layer.name+extension;
                    document.body.appendChild(element);
                    element.click();
                }
            )

        }

        return "OK";

    }

    async getLayers(geoserverLocation,title){
        return await axios.get(
            geoserverLocation+'api/maps?title__contains='+title,
            {headers:{'Content-Type':'application/json'}}
        ).then(
            (res) =>{

                const names = res.data.objects[0].layers.map(
                    (item)=>{
                        return item.name;
                    }
                )

                const finalList = names.filter(
                    (item)=>{
                        if(item.startsWith("geonode")) {
                            return item;
                        }
                    }
                )

                return finalList
            }
        )
    }

    async getGeoserverLayers(geoserverLocation,title){
        if(title.startsWith === "geonode:"){
            title=title.replace("geonode:","")
        }

        return await axios.get(
            geoserverLocation+'api/layers?name__icontains='+title,
            {headers:{'Content-Type':'application/json'}}
        ).then(
            (res) =>{
                const nabstract = res.data.objects[0].abstract;
                return nabstract
            }
        )
    }

    async fetchDataOGC(geoserverLocation,layerIdList){

        var xml2js = require('xml2js');
        var parser = new xml2js.Parser;
        if(layerIdList[0].dataType === "map"){
            var mapLayers = []
            await this.getLayers(geoserverLocation.replace('geoserver/',''),layerIdList[0].title).then(
                (res)=>{
                    mapLayers = res;
                }
            )
            var wmsResponse = await axios.get(
                geoserverLocation+'/wms?service=WMS&request=GetCapabilities&outputFormat=application/json',
                {headers:{'Content-Type':'application/json'}})
                .then(
                    async (res) => {
                        const response = await parser.parseStringPromise(res.data).then(
                            (result) =>{
                                var foundLayers = [];
                                var layers = result.WMS_Capabilities.Capability[0].Layer[0].Layer;
                                layers.forEach(
                                    (layer,index) => {
                                        for(let i=0;i<mapLayers.length;i++){
                                            if(mapLayers[i]===layer.Name[0]){

                                                const layerName = layer.Name;
                                                const layerAbstract = layer.Abstract;
                                                const layerBoundingBox = layer.BoundingBox;
                                                const layerCRS = layer.CRS[0];
                                                const layerKeywords = layer.KeywordList;
                                                const layerURL = geoserverLocation+'/wms';
                                                let legendURL="nolegend";

                                                if(layer.Style){
                                                    legendURL =
                                                        layer
                                                            .Style[0]
                                                            .LegendURL[0]
                                                            .OnlineResource[0]
                                                            .$["xlink:href"];
                                                }

                                                const attributes = {
                                                    attributeList:[]
                                                }

                                                const fullLayerObject = {
                                                    name: layerName[0].split(":")[1],
                                                    title: layerName[0],
                                                    type: attributes.layerType,
                                                    abstract: layerAbstract[0],
                                                    attributes: attributes.attributeList,
                                                    keywords: layerKeywords,
                                                    srs: layerCRS,
                                                    boundingBox: layerBoundingBox,
                                                    thumbnail: geoserverLocation +
                                                    "/wms/reflect?layers=" + layerName,
                                                    disabled: false,
                                                    index: index,
                                                    wmsService: layerURL,
                                                    legendUrl:legendURL
                                                }


                                                foundLayers = foundLayers.concat(fullLayerObject);
                                                break;
                                            }
                                        }
                                    }
                                )
                                return foundLayers;
                            }
                        )
                        return response;
                    }
                )
            return wmsResponse;

        }else{

            var wmsResponse = await axios.get(
                geoserverLocation+'/wms?service=WMS&request=GetCapabilities&outputFormat=application/json',
                {headers:{'Content-Type':'application/json'}})
                .then(
                    async (res) => {
                        const response = await parser.parseStringPromise(res.data).then(
                            (result) =>{
                                var foundLayers = [];
                                var layers = result.WMS_Capabilities.Capability[0].Layer[0].Layer;
                                layers.forEach(
                                    (layer,index) => {
                                        for(let i=0;i<layerIdList.length;i++){

                                            if(layerIdList[i].url.split(":")[2]===layer.Name[0].replace("geonode:","")){


                                                const layerName = layer.Name;
                                                const layerAbstract = layer.Abstract;
                                                const layerBoundingBox = layer.BoundingBox;
                                                const layerCRS = layer.CRS[0];
                                                const layerKeywords = layer.KeywordList;
                                                const layerURL = geoserverLocation+'/wms';
                                                let legendURL="nolegend";

                                                const attributes = {
                                                    attributeList:[]
                                                }

                                                if(layer.Style){
                                                    legendURL =
                                                        layer
                                                            .Style[0]
                                                            .LegendURL[0]
                                                            .OnlineResource[0]
                                                            .$["xlink:href"];
                                                }

                                                const fullLayerObject = {
                                                    name: layerName[0].split(":")[1],
                                                    title: layerName[0],
                                                    type: attributes.layerType,
                                                    abstract: layerAbstract[0],
                                                    attributes: attributes.attributeList,
                                                    keywords: layerKeywords,
                                                    srs: layerCRS,
                                                    boundingBox: layerBoundingBox,
                                                    thumbnail: geoserverLocation +
                                                    "/wms/reflect?layers=" + layerName,
                                                    disabled: false,
                                                    index: index,
                                                    wmsService: layerURL,
                                                    legendUrl:legendURL
                                                }


                                                foundLayers = foundLayers.concat(fullLayerObject);
                                                break;
                                            }
                                        }
                                    }
                                )
                                return foundLayers;
                            }
                        )
                        return response;
                    }
                )

            return wmsResponse;
        }
    }

    async buildDataOGC(geoserverLocation,approved){

        var xml2js = require('xml2js');
        var parser = new xml2js.Parser

        var vectorList = await axios.get(
            geoserverLocation+'/wfs?service=WFS&request=GetCapabilities&outputFormat=application/json',
            {headers:{'Content-Type':'application/json'}})
            .then(
                async (res) => {
                    const response = await parser.parseStringPromise(res.data).then(
                        (result) =>{
                            var features = result["wfs:WFS_Capabilities"].FeatureTypeList[0]
                                .FeatureType.map(
                                    (item)=>{
                                        return item.Name[0];
                                    }
                                );
                            return features;
                        }
                    )
                    return response;
                }
            )
        var wmsResponse = await axios.get(
            geoserverLocation+'/wms?service=WMS&request=GetCapabilities&outputFormat=application/json',
            {headers:{'Content-Type':'application/json'}})
            .then(
                async (res) => {
                    const response = await parser.parseStringPromise(res.data).then(
                        async (result) => {
                            var layers = result.WMS_Capabilities.Capability[0].Layer[0].Layer;
                            var vectorLayers = layers.filter(
                                (item) => {
                                    if (vectorList.includes(item.Name[0])) {
                                        return item;
                                    }
                                }
                            )

                            var rasterLayers = layers.filter(
                                (item) => {
                                    if (!vectorList.includes(item.Name[0])) {
                                        return item;
                                    }
                                }
                            )

                            const fullVectorLayers = vectorLayers.map(
                                  async (layer, index) => {
                                    const layerName = layer.Name;
                                    const layerTitle = layer.Title[0];
                                    const layerAbstract = layer.Abstract;
                                    const layerBoundingBox = layer.BoundingBox;
                                    const layerCRS = layer.CRS[0];
                                    const layerKeywords = layer.KeywordList;
                                    const layerURL = geoserverLocation+'/wms';
                                    const legendURL =
                                        layer.Style[0].LegendURL[0].OnlineResource[0].$["xlink:href"];


                                    var approvedPublished = true;

                                    if(approved[layer.Name[0]] === undefined){
                                        approvedPublished = false;

                                    }else if(approved[layer.Name[0]] === true){
                                        approvedPublished = true;
                                    }




                                    /*const approvedPublished =
                                          await this
                                              .resourceStatus(geoserverLocation, layerTitle)
                                              .then(
                                                  (res) => {
                                                      return res;
                                                  }
                                              )*/

                                    var attributes = await axios.get(
                                        geoserverLocation + '/wfs?' +
                                        'service=WFS&' +
                                        'request=DescribeFeatureType&' +
                                        'outputFormat=application/json&' +
                                        'typeName=' + layerName,
                                        {headers: {'Content-Type': 'application/json'}})
                                        .then(
                                             (res) => {
                                                const layerType = "VECTOR";
                                                if(res.data.featureTypes){
                                                    const attributeList =  res.data.featureTypes[0].properties.map(
                                                        (item) => {
                                                            const attributeName = item.name;

                                                            let dataType = "Other"
                                                            if (item.localType = "int") {
                                                                dataType = "Integer";
                                                            } else if (item.localType = "number") {
                                                                dataType = "Double";
                                                            } else if (item.localType = "string") {
                                                                dataType = "String";
                                                            } else {
                                                                dataType = item.localType;
                                                            }
                                                            const attribute = {
                                                                name: attributeName,
                                                                dataType: dataType
                                                            }

                                                            return attribute;
                                                        }
                                                    );

                                                    return {
                                                        layerType: layerType,
                                                        attributeList: attributeList
                                                    }
                                                }else{
                                                    return {
                                                        layerType: layerType,
                                                        attributeList: []
                                                    }

                                                }

                                            }
                                        )

                                    const fullLayerObject = {
                                        name: layerName[0].split(":")[1],
                                        title: layerTitle,
                                        type: attributes.layerType,
                                        abstract: layerAbstract[0],
                                        attributes: attributes.attributeList,
                                        keywords: layerKeywords,
                                        srs: layerCRS,
                                        boundingBox: layerBoundingBox,
                                        thumbnail: geoserverLocation +
                                        "/wms/reflect?layers=" + layerName,
                                        disabled: false,
                                        index: index,
                                        wmsService: layerURL,
                                        legendUrl:legendURL,
                                        approved:approvedPublished
                                    }
                                    return fullLayerObject;
                                }
                            )

                            const fullRasterLayers = rasterLayers.map(
                                async (layer, index) => {

                                    const layerName = layer.Name;
                                    const layerTitle = layer.Title[0];
                                    const layerAbstract = layer.Abstract;
                                    const layerBoundingBox = layer.BoundingBox;
                                    const layerCRS = layer.CRS[0];
                                    const layerKeywords = layer.KeywordList;
                                    const layerURL = geoserverLocation+'/wms';
                                    const layerType = "RASTER";
                                    let legendURL="nolegend";

                                    var approvedPublished = true;

                                    if(approved[layer.Name[0]] === undefined){
                                        approvedPublished = false;

                                    }else if(approved[layer.Name[0]] === true){
                                        approvedPublished = true;
                                    }

                                    /*const approvedPublished =
                                        await this
                                            .resourceStatus(geoserverLocation, layerTitle)
                                            .then(
                                                (res) => {
                                                    return res;
                                                }
                                            )*/

                                    if(layer.Style){
                                        legendURL =
                                            layer
                                                .Style[0]
                                                .LegendURL[0]
                                                .OnlineResource[0]
                                                .$["xlink:href"];
                                    }

                                    const attributes = {
                                        attributeList:[]
                                    }
                                    const layerAttributes = attributes;


                                    /*var attributes = await axios.get(
                                        geoserverLocation + '/wcs?' +
                                        'service=WCS&' +
                                        'request=DescribeCoverage&' +
                                        'outputFormat=application/json&' +
                                        'version=2.0.1&'+
                                        'coverageid=' + layerName,
                                        {headers: {'Content-Type': 'application/json'}})
                                        .then(
                                            async (res) => {
                                                const response = await parser.parseStringPromise(res.data).then(
                                                    (result) =>{
                                                        const layerType = "RASTER";
                                                        const wcs = result["wcs:CoverageDescriptions"];

                                                        const attribute1Name = "Lower Corner Coordinate";
                                                        const dataType1 = wcs["wcs:CoverageDescription"][0]
                                                            ["gml:boundedBy"][0]["gml:Envelope"][0]
                                                            ["gml:lowerCorner"][0];
                                                        const attribute2Name = "Upper Corner";

                                                        const dataType2 = wcs["wcs:CoverageDescription"][0]
                                                            ["gml:boundedBy"][0]["gml:Envelope"][0]
                                                            ["gml:upperCorner"][0];

                                                        const attribute1 = {
                                                            name: attribute1Name,
                                                            dataType: dataType1
                                                        }

                                                        const attribute2 = {
                                                            name: attribute2Name,
                                                            dataType: dataType2
                                                        }

                                                        return {
                                                            layerType: layerType,
                                                            attributeList: [attribute1,attribute2]
                                                        }
                                                    }
                                                )
                                                return response;
                                            }
                                        )*/

                                    const fullLayerObject = {
                                        name: layerName[0].split(":")[1],
                                        title: layerTitle,
                                        type: layerType,
                                        abstract: layerAbstract[0],
                                        attributes: layerAttributes,
                                        keywords: layerKeywords,
                                        srs: layerCRS,
                                        boundingBox: layerBoundingBox,
                                        thumbnail: geoserverLocation +
                                        "/wms/reflect?layers=" + layerName,
                                        disabled: false,
                                        index: index,
                                        wmsService: layerURL,
                                        legendUrl:legendURL,
                                        approved:approvedPublished
                                    }
                                    return fullLayerObject;
                                }
                            )

                            let fullLayers =  fullVectorLayers.concat(fullRasterLayers);
                            return fullLayers;

                        })
                    return response;
                }

            );
        return wmsResponse;
    }

    async buildData(geoserverLocation){

        const layersList = await axios.get(
            geoserverLocation+'/rest/layers.json',
            {headers:{'Content-Type':'application/json'}})
            .then((res) => res.data);

        const layers = layersList.layers.layer;

        const data = await Promise.all(layers.map(
            async (layer,index) => {
                const href = layer.href
                const layerName = layer.name

                try{

                    const layerResource = geoserverLocation+"/rest/workspaces/" +
                        "geonode/datastores/cacip_data/featuretypes/" +
                        layerName.split(":")[1];


                    //Fetch Feature Types
                    const layerFeatureTypes = await axios.get(
                        layerResource,
                        {headers: {'Content-Type': 'application/json'}})
                        .then((res) => res.data);

                    //Construct Full Layer
                    if(layerFeatureTypes.featureType !== undefined){

                        const attributes = layerFeatureTypes.featureType.attributes.attribute;

                        const attributesList = attributes.map(
                            (value) => {
                                let dataType = "Other";
                                if(value.binding.includes("Double")){
                                    dataType = "Double";
                                }else if(value.binding.includes("Integer")){
                                    dataType = "Integer";
                                }else if(value.binding.includes("Long")){
                                    dataType = "Long";
                                }else if(value.binding.includes("String")){
                                    dataType = "String";
                                }else if(value.binding.includes("MultiPolygon")){
                                    dataType = "MultiPolygon";
                                }

                                const attribute = {
                                    name: value.name,
                                    dataType: dataType
                                }
                                return attribute;
                            }
                        )

                        const fullLayerObject = {
                            name : layerName,
                            type: "TYPE",
                            abstract: layerFeatureTypes.featureType.abstract,
                            attributes: attributesList,
                            keywords: layerFeatureTypes.featureType.keywords,
                            srs: layerFeatureTypes.featureType.srs,
                            boundingBox: layerFeatureTypes.featureType.nativeBoundingBox,
                            thumbnail: geoserverLocation +
                            "/wms/reflect?layers="+layerName,
                            disabled: false,
                            index: index
                        }
                        return fullLayerObject;
                    }
                }catch(err){
                    console.log(err);
                }
            }
        ))

        const fullLayersList = data.filter(function( element ) {
            return element !== undefined;
        });

        return fullLayersList;
    }

    async resolveDataType(geoserverLocation,name){
        var xml2js = require('xml2js');
        var parser = new xml2js.Parser

        var vectorList = await axios.get(
            geoserverLocation+'/wfs?service=WFS&request=GetCapabilities&outputFormat=application/json',
            {headers:{'Content-Type':'application/json'}})
            .then(
                async (res) => {
                    const response = await parser.parseStringPromise(res.data).then(
                        (result) =>{
                            var features = result["wfs:WFS_Capabilities"].FeatureTypeList[0]
                                .FeatureType.map(
                                    (item)=>{
                                        return item.Name[0];
                                    }
                                );
                            return features;
                        }
                    )
                    return response;
                }
            )
        if (vectorList.includes(name)) {
            return "VECTOR";
        }else{
            return "RASTER";
        }
    }


    //https://test.geonode.centralasiaclimateportal.org/geoserver/rest/workspaces/geonode/datastores/cacip_data/featuretypes/Agricultural_Lands_Aksuu.json
    getThumbnail(){
        return axios.get('https://geonode.centralasiaclimateportal.org/geoserver/wms/reflect?layers=Kvartals_Aksuu').then((res) => res.data.data);
    }

    async queryGeonodeKeywords(keywords){

        const geonodeLocation = "https://geonode.centralasiaclimateportal.org";
        const geoserverLocation = "https://geonode.centralasiaclimateportal.org/geoserver/";
        let res = keywords.split(" ");

        const searchResults = await res.map(
            async (item) => {
                return await this.getKeywordResults(geoserverLocation, geonodeLocation, item)
                    .then(
                        (result) => {
                            return result;
                        }
                    );
            }
        )

        return searchResults;

    }

    async getKeywordResults(geoserverLocation,geonodeLocation,keyword){
        return axios.get(geonodeLocation+"/api/base?title__icontains="+keyword)
            .then(
                async (result) => {

                    const resultSet = result.data.objects;

                    const results = await resultSet.map(
                        async (item, index) => {
                            let title = item.title;
                            let abstract = item.abstract;
                            let category = item.category__gn_description;
                            let url = geonodeLocation + item.detail_url;
                            let thumbnail = geoserverLocation +
                                "/wms/reflect?layers=" + item.detail_url.split("/")[2];


                            let dataType = "document";
                            if (item.detail_url.startsWith("/layers")) {
                                dataType = "layer";
                            } else if (item.detail_url.startsWith("/maps")) {
                                dataType = "map";
                                thumbnail = item.thumbnail_url;
                            }

                            if (item.detail_url.startsWith("/layers")
                                || item.detail_url.startsWith("/maps")) {

                                let mapType = "";
                                await this.resolveDataType(geoserverLocation, item.detail_url.split("/")[2]).then(
                                    (res) => {
                                        mapType = res;
                                    }
                                )

                                let minLat = parseFloat(item.bbox_x0);
                                let maxLat = parseFloat(item.bbox_x1);

                                let minLng = parseFloat(item.bbox_y0);
                                let maxLng = parseFloat(item.bbox_y1);


                                let minPoint = point([minLng, minLat]);
                                let maxPoint = point([maxLng, maxLat]);
                                let bbx = bbox(featureCollection([minPoint, maxPoint]));

                                let boundingBox = bboxPolygon(bbx);
                                let thumbnailUrl = item.thumbnail_url;
                                let crs = item.srid;

                                let record = {
                                    title: title,
                                    name: item.detail_url.split("/")[2],
                                    abstract: abstract,
                                    category: category,
                                    url: url,
                                    boundingBox: boundingBox,
                                    thumbnailUrl: thumbnail,
                                    crs: crs,
                                    dataType: dataType,
                                    disabled: false,
                                    index: index,
                                    searchType: "keywords",
                                    mapType: mapType
                                }

                                return record;
                            } else {
                                let record = {
                                    title: title,
                                    abstract: abstract,
                                    category: category,
                                    url: url,
                                    dataType: dataType,
                                    disabled: false,
                                    index: index,
                                    searchType: "keywords"
                                }
                                return record;
                            }
                        }
                    )
                    return results;
                }
            );

    }

    convertDate(str) {
        var date = new Date(str),
            mnth = ("0" + (date.getMonth() + 1)).slice(-2),
            day = ("0" + date.getDate()).slice(-2);
        return [date.getFullYear(), mnth, day].join("-");
    }

    async queryGeonodeKeywordsDate(keywords,from,to){

        from = this.convertDate(from);
        to = this.convertDate(to);

        const geonodeLocation = "https://geonode.centralasiaclimateportal.org";
        const geoserverLocation = "https://geonode.centralasiaclimateportal.org/geoserver/";
        let res = keywords.split(" ");

        const searchResults = res.map(
            (item) => {


                return this.getKeywordDateResults(geoserverLocation,geonodeLocation,item,from,to)
                    .then(
                        (result)=> {
                            return result;
                        }
                    );
            }
        )

        return searchResults;

    }

    async getKeywordDateResults(geoserverLocation,geonodeLocation,keyword,from,to){
        return axios.get(geonodeLocation+"/api/base?title__icontains="+keyword+"&date__range="+from+","+to)
            .then(
                (result)=>{
                    const resultSet = result.data.objects;

                    const results = resultSet.map(
                        async (item, index) => {

                            let title = item.title;
                            let abstract = item.abstract;
                            let category = item.category__gn_description;
                            let url = geonodeLocation + item.detail_url;
                            let thumbnail = geoserverLocation +
                                "/wms/reflect?layers=" + item.detail_url.split("/")[2];

                            let dataType = "document";
                            if (item.detail_url.startsWith("/layers")) {
                                dataType = "layer";
                            } else if (item.detail_url.startsWith("/maps")) {
                                dataType = "map";
                                thumbnail = item.thumbnail_url;
                            }

                            if (item.detail_url.startsWith("/layers")
                                || item.detail_url.startsWith("/maps")) {

                                let mapType = "";
                                await this.resolveDataType(geoserverLocation, "geonode:" + item.title).then(
                                    (res) => {
                                        mapType = res;
                                    }
                                )

                                let minLat = parseFloat(item.bbox_x0);
                                let maxLat = parseFloat(item.bbox_x1);

                                let minLng = parseFloat(item.bbox_y0);
                                let maxLng = parseFloat(item.bbox_y1);


                                let minPoint = point([minLng, minLat]);
                                let maxPoint = point([maxLng, maxLat]);
                                let bbx = bbox(featureCollection([minPoint, maxPoint]));

                                let boundingBox = bboxPolygon(bbx);
                                let thumbnailUrl = item.thumbnail_url;
                                let crs = item.srid;

                                let record = {
                                    title: title,
                                    name: item.detail_url.split("/")[2],
                                    abstract: abstract,
                                    category: category,
                                    url: url,
                                    boundingBox: boundingBox,
                                    thumbnailUrl: thumbnail,
                                    crs: crs,
                                    dataType: dataType,
                                    disabled: false,
                                    index: index,
                                    searchType: "keywords",
                                    mapType: mapType
                                }

                                return record;
                            } else {
                                let record = {
                                    title: title,
                                    abstract: abstract,
                                    category: category,
                                    url: url,
                                    dataType: dataType,
                                    disabled: false,
                                    index: index,
                                    searchType: "keywords"
                                }
                                return record;
                            }
                        }
                    )
                    return results;
                }
            );

    }

    async queryGeonodeCountry(countries){
        const geonodeLocation = "https://geonode.centralasiaclimateportal.org";
        const geoserverLocation = "https://geonode.centralasiaclimateportal.org/geoserver/";
        let filterPreparation = ""

        countries.forEach(
            (country)=>{
                filterPreparation = "regions__name__in="+country.name+"&"+filterPreparation;
            }
        )

        return [axios.get(geonodeLocation+"/api/base?"+filterPreparation).then(
            async (result) => {

                const resultSet = result.data.objects;

                const results = await resultSet.map(
                    async (item, index) => {

                        let title = item.title;
                        let abstract = item.abstract;
                        let category = item.category__gn_description;
                        let url = geonodeLocation + item.detail_url;
                        let thumbnail = geoserverLocation +
                            "/wms/reflect?layers=" + item.detail_url.split("/")[2];

                        let dataType = "document";
                        if (item.detail_url.startsWith("/layers")) {
                            dataType = "layer";
                        } else if (item.detail_url.startsWith("/maps")) {
                            dataType = "map";
                            thumbnail = item.thumbnail_url;
                        }

                        if (item.detail_url.startsWith("/layers")
                            || item.detail_url.startsWith("/maps")) {

                            let mapType = "";
                            await this.resolveDataType(geoserverLocation, item.detail_url.split("/")[2]).then(
                                (res) => {
                                    mapType = res;
                                }
                            )

                            let minLat = parseFloat(item.bbox_x0);
                            let maxLat = parseFloat(item.bbox_x1);

                            let minLng = parseFloat(item.bbox_y0);
                            let maxLng = parseFloat(item.bbox_y1);


                            let minPoint = point([minLng, minLat]);
                            let maxPoint = point([maxLng, maxLat]);
                            let bbx = bbox(featureCollection([minPoint, maxPoint]));

                            let boundingBox = bboxPolygon(bbx);
                            let thumbnailUrl = item.thumbnail_url;
                            let crs = item.srid;

                            let record = {
                                title: title,
                                name: item.detail_url.split("/")[2],
                                abstract: abstract,
                                category: category,
                                url: url,
                                boundingBox: boundingBox,
                                thumbnailUrl: thumbnail,
                                crs: crs,
                                dataType: dataType,
                                disabled: false,
                                index: index,
                                searchType: "country",
                                mapType: mapType
                            }

                            return record;
                        } else {
                            let record = {
                                title: title,
                                abstract: abstract,
                                category: category,
                                url: url,
                                dataType: dataType,
                                disabled: false,
                                index: index,
                                searchType: "country"
                            }
                            return record;
                        }
                    }
                )
                return results;
            }
        )]
    }

    async queryGeonodeCountryDate(countries,from,to){

        from = this.convertDate(from);
        to = this.convertDate(to);

        const geonodeLocation = "https://geonode.centralasiaclimateportal.org";
        const geoserverLocation = "https://geonode.centralasiaclimateportal.org/geoserver/";
        let filterPreparation = ""

        countries.forEach(
            (country)=>{
                filterPreparation = "regions__name__in="+country.name+"&"+filterPreparation;
            }
        )
        return [axios.get(geonodeLocation+"/api/base?"+filterPreparation+"date__range="+from+","+to).then(
            (result) =>{

                const resultSet = result.data.objects;

                const results = resultSet.map(
                    async (item, index) => {

                        let title = item.title;
                        let abstract = item.abstract;
                        let category = item.category__gn_description;
                        let url = geonodeLocation + item.detail_url;
                        let thumbnail = geoserverLocation +
                            "/wms/reflect?layers=" + item.detail_url.split("/")[2];

                        let dataType = "document";
                        if (item.detail_url.startsWith("/layers")) {
                            dataType = "layer";
                        } else if (item.detail_url.startsWith("/maps")) {
                            dataType = "map";
                            thumbnail = item.thumbnail_url;
                        }

                        if (item.detail_url.startsWith("/layers")
                            || item.detail_url.startsWith("/maps")) {

                            let mapType = "";
                            await this.resolveDataType(geoserverLocation, item.detail_url.split("/")[2]).then(
                                (res) => {
                                    mapType = res;
                                }
                            )

                            let minLat = parseFloat(item.bbox_x0);
                            let maxLat = parseFloat(item.bbox_x1);

                            let minLng = parseFloat(item.bbox_y0);
                            let maxLng = parseFloat(item.bbox_y1);


                            let minPoint = point([minLng, minLat]);
                            let maxPoint = point([maxLng, maxLat]);
                            let bbx = bbox(featureCollection([minPoint, maxPoint]));

                            let boundingBox = bboxPolygon(bbx);
                            let thumbnailUrl = item.thumbnail_url;
                            let crs = item.srid;

                            let record = {
                                title: title,
                                name: item.detail_url.split("/")[2],
                                abstract: abstract,
                                category: category,
                                url: url,
                                boundingBox: boundingBox,
                                thumbnailUrl: thumbnail,
                                crs: crs,
                                dataType: dataType,
                                disabled: false,
                                index: index,
                                searchType: "country",
                                mapType: mapType
                            }

                            return record;
                        } else {
                            let record = {
                                title: title,
                                abstract: abstract,
                                category: category,
                                url: url,
                                dataType: dataType,
                                disabled: false,
                                index: index,
                                searchType: "country"
                            }
                            return record;
                        }
                    }
                )
                return results;
            }
        )]

    }

    async queryGeonodeBBox(bboxInput){
        const geonodeLocation = "https://geonode.centralasiaclimateportal.org";
        const geoserverLocation = "https://geonode.centralasiaclimateportal.org/geoserver/";
        let selectedBBox = JSON.parse(bboxInput);
        let bboxFilter = "extent="+selectedBBox.bbox.join();

        return [axios.get(geonodeLocation+"/api/base?"+bboxFilter).then(
            (result) => {
                const resultSet = result.data.objects;
                const results = resultSet.map(
                    async (item, index) => {
                        let title = item.title;
                        let abstract = item.abstract;
                        let category = item.category__gn_description;
                        let url = geonodeLocation + item.detail_url;
                        let thumbnail = geoserverLocation +
                            "/wms/reflect?layers=" + item.detail_url.split("/")[2];

                        let dataType = "document";
                        if (item.detail_url.startsWith("/layers")) {
                            dataType = "layer";
                        } else if (item.detail_url.startsWith("/maps")) {
                            dataType = "map";
                            thumbnail = item.thumbnail_url;
                        }

                        if (item.detail_url.startsWith("/layers")
                            || item.detail_url.startsWith("/maps")) {

                            let mapType = "";
                            await this.resolveDataType(geoserverLocation, item.detail_url.split("/")[2]).then(
                                (res) => {
                                    mapType = res;
                                }
                            )

                            let minLat = parseFloat(item.bbox_x0);
                            let maxLat = parseFloat(item.bbox_x1);

                            let minLng = parseFloat(item.bbox_y0);
                            let maxLng = parseFloat(item.bbox_y1);


                            let minPoint = point([minLng, minLat]);
                            let maxPoint = point([maxLng, maxLat]);
                            let bbx = bbox(featureCollection([minPoint, maxPoint]));

                            let boundingBox = bboxPolygon(bbx);
                            let thumbnailUrl = item.thumbnail_url;
                            let crs = item.srid;

                            let record = {
                                title: title,
                                name: item.detail_url.split("/")[2],
                                abstract: abstract,
                                category: category,
                                url: url,
                                boundingBox: boundingBox,
                                thumbnailUrl: thumbnail,
                                crs: crs,
                                dataType: dataType,
                                disabled: false,
                                index: index,
                                searchType: "bbox",
                                mapType: mapType
                            }

                            return record;
                        } else {
                            let record = {
                                title: title,
                                abstract: abstract,
                                category: category,
                                url: url,
                                dataType: dataType,
                                disabled: false,
                                index: index,
                                searchType: "bbox"
                            }
                            return record;
                        }
                    }
                )
                return results;
            }
        )]

    }

    async queryGeonodeBBoxDate(bboxInput,from,to){

        from = this.convertDate(from);
        to = this.convertDate(to);

        const geonodeLocation = "https://geonode.centralasiaclimateportal.org";
        const geoserverLocation = "https://geonode.centralasiaclimateportal.org/geoserver/";
        let selectedBBox = JSON.parse(bboxInput);
        let bboxFilter = "extent="+selectedBBox.bbox.join();

        return [axios.get(geonodeLocation+"/api/base?"+bboxFilter+"&date__range="+from+","+to).then(
            (result) => {
                const resultSet = result.data.objects;
                const results = resultSet.map(
                    async (item, index) => {

                        let title = item.title;
                        let abstract = item.abstract;
                        let category = item.category__gn_description;
                        let url = geonodeLocation + item.detail_url;
                        let thumbnail = geoserverLocation +
                            "/wms/reflect?layers=" + item.detail_url.split("/")[2];

                        let dataType = "document";
                        if (item.detail_url.startsWith("/layers")) {
                            dataType = "layer";
                        } else if (item.detail_url.startsWith("/maps")) {
                            dataType = "map";
                            thumbnail = item.thumbnail_url;
                        }

                        if (item.detail_url.startsWith("/layers")
                            || item.detail_url.startsWith("/maps")) {

                            let mapType = "";
                            await this.resolveDataType(geoserverLocation, item.detail_url.split("/")[2]).then(
                                (res) => {
                                    mapType = res;
                                }
                            )

                            let minLat = parseFloat(item.bbox_x0);
                            let maxLat = parseFloat(item.bbox_x1);

                            let minLng = parseFloat(item.bbox_y0);
                            let maxLng = parseFloat(item.bbox_y1);


                            let minPoint = point([minLng, minLat]);
                            let maxPoint = point([maxLng, maxLat]);
                            let bbx = bbox(featureCollection([minPoint, maxPoint]));

                            let boundingBox = bboxPolygon(bbx);
                            let thumbnailUrl = item.thumbnail_url;
                            let crs = item.srid;

                            let record = {
                                title: title,
                                name: item.detail_url.split("/")[2],
                                abstract: abstract,
                                category: category,
                                url: url,
                                boundingBox: boundingBox,
                                thumbnailUrl: thumbnail,
                                crs: crs,
                                dataType: dataType,
                                disabled: false,
                                index: index,
                                searchType: "bbox",
                                mapType: mapType
                            }

                            return record;
                        } else {
                            let record = {
                                title: title,
                                abstract: abstract,
                                category: category,
                                url: url,
                                dataType: dataType,
                                disabled: false,
                                index: index,
                                searchType: "bbox"
                            }
                            return record;
                        }
                    }
                )
                return results;
            }
        )]

    }

    async uploadData(server,files){
        const uploadedLayers = files.map(
            (item)=>{
                const data = new FormData()
                data.append('file', item);
                return axios.post(server+"/upload", data, { // receive two parameter endpoint url ,form data
                }).then(res => { // then print response status
                    if(res.statusText === "OK"){
                        let name = item.name;
                        let internalName = item.name;
                        let url = server+"/static/"+name.split('.')[0];
                        let extension = name.split('.').pop();

                        const customLayer = {
                            name: name,
                            title: name,
                            url:url,
                            file_type:extension
                        }

                        return customLayer;
                    }

                })
            }
        )
        return uploadedLayers;

    }

    async connectToWMS(server,url){

        return CapabilitiesUtil.parseWmsCapabilities(server+"static/wms/FAO_WMS_Capabilities.xml")
            .then(CapabilitiesUtil.getLayersFromWmsCapabilities)
            .then(
                layers => {
                    const instances = layers.map(
                        (layer)=>{

                            var thumbnailParameters = "" +
                                "SERVICE=WMS&VERSION=1.1.0&" +
                                "REQUEST=GetMap&" +
                                "LAYERS="+layer.values_.name+"&" +
                                "SRS=EPSG:4326&" +
                                "BBOX=-180,-90,180,90&" +
                                "FORMAT=image/png&" +
                                "width=200&" +
                                "height=200";

                            var thumbnailUrl = layer.values_.getFeatureInfoUrl+thumbnailParameters;

                            var legendUrl = "";

                            if(layer.values_.legendUrl !== undefined){
                                var splittedURL = layer.values_.legendUrl.split('&');

                                var positionToRectifyLayerName = 0;
                                var positionToRectifyHeight = 0;
                                var positionToRectifyWidth = 0;

                                splittedURL.forEach(
                                    (item,index)=>{

                                        if(item.startsWith("layer=")){
                                            positionToRectifyLayerName = index;
                                        }else if(item.startsWith("height=")){
                                            positionToRectifyHeight = index;
                                        }else if(item.startsWith("width=")){
                                            positionToRectifyWidth = index;
                                        }
                                    }
                                )

                                if(positionToRectifyLayerName>0){
                                    splittedURL[positionToRectifyLayerName] = "layer="+layer.values_.name
                                }
                                if(positionToRectifyHeight>0){
                                    splittedURL.splice(positionToRectifyHeight,1);
                                }
                                if(positionToRectifyWidth>0){
                                    splittedURL.splice(positionToRectifyWidth,1);
                                }
                                legendUrl = splittedURL.join('&');
                            }


                            if(layer.values_.name === undefined){
                                layer.values_.name = layer.values_.title;
                            }

                            var instance = {
                                name: layer.values_.name,
                                abstract: layer.values_.abstract,
                                title:layer.values_.title,
                                legend: layer.values_.legendUrl,
                                baseURL: layer.values_.getFeatureInfoUrl,
                                wmsService: layer.values_.getFeatureInfoUrl,
                                thumbnailURL:thumbnailUrl,
                                legendUrl:legendUrl
                            }
                            return instance;
                        }
                    )
                    return instances;
                }
            )

    }

    async loadFile(url){
        return axios.get(url).then(res => {
            return res;
        })
    }

    async compileReport(server,report,title,legendURL,srs,scaleFactor,nabstract){

        return axios.post(server+"/buildReport",
            {
                params:
                    {
                        'image':report,
                        'title':title,
                        'legendURL':legendURL,
                        'srs':srs,
                        'scaleFactor':scaleFactor,
                        'abstract':nabstract
                    }
                    },
            {
                responseType : 'arraybuffer'
            })
            .then(res => { // then print response status


            let blob = new Blob([res.data],{ type: 'application/pdf' });

            const element = document.createElement("a");
            element.href = URL.createObjectURL(blob);
            element.download = title+".pdf";
            document.body.appendChild(element);
            element.click();

        })
    }

}
