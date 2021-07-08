import React, { useState, useEffect, useRef } from 'react';
import { useParams, useLocation  } from "react-router-dom";
import {Browser} from "./Browser";
import {Glowglobe} from "./Glowglobe";
import { Toolbar } from 'primereact/toolbar';
import {Button} from "primereact/components/button/Button";
import {Search} from "./Search";
import {Import} from "./Import";
import {OverlayPanel} from "primereact/components/overlaypanel/OverlayPanel";
import {DataTable} from "primereact/components/datatable/DataTable";
import {Column} from "primereact/components/column/Column";
import { Image, PDFDownloadLink, Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';

import {TranslateProvider, useTranslate} from "./translate";



import CacipGeonode from "../service/CacipGeonode";
import {Dialog} from "primereact/components/dialog/Dialog";
import {ProgressSpinner} from "primereact/components/progressspinner/ProgressSpinner";




export const MapDashboard = () => {

    const geoserverLocation = "https://geonode.centralasiaclimateportal.org/geoserver/";

    const [userPosition, setPosition] = useState(null);

    const [searchWidget, setSearchWidget] = useState(true);
    const [browseWidget, setBrowseWidget] = useState(true);
    const [importWidget, setImportWidget] = useState(true);

    const [globalList,setGlobalList] = useState([]);

    //Layers Data
    const [layersData, setLayersData] = useState(null);
    const [customLayersData, setCustomLayersData] = useState(null);

    const [expandedRows, setExpandedRows] = useState([]);
    const [selectedCustomers1, setSelectedCustomers1] = useState(0);

    const [pdfDocument,setPdfDocument] = useState(null)
    const [pdfDialog,setPdfDialog] = useState(false)

    const [loadingScreen,setLoadingScreen] = useState(false);
    const i18n = useTranslate();
    const { t } = i18n;


    const dt = useRef(null);
    const op2 = useRef(null);

    const toggleDataTable = (event) => {
        op2.current.toggle(event);
    };

    //Get URL
    const location = useLocation();

    const toggleWidget = (widget) =>{


        if(widget === 'search'){
            setSearchWidget(false);
            setBrowseWidget(true);
            setImportWidget(true);
        }else if(widget === 'browse'){
            setSearchWidget(true);
            setBrowseWidget(false);
            setImportWidget(true);
        }else if(widget === 'import'){
            setSearchWidget(true);
            setBrowseWidget(true);
            setImportWidget(false);

        }

    }

    const bodyTemplate = (layersList, props) => {
        return (
            <>
                {layersList[props.field]}
            </>
        );
    };

    const imageBodyTemplate = (layersList) => {
        var imageURL = "";
        if(layersList.thumbnail){
            imageURL = layersList.thumbnail;
        }else{
            imageURL = layersList.thumbnailURL;
        }

        return (
            <>
                <img
                    height="100"
                    id={layersList.name}
                    src={imageURL}
                    alt={layersList.name}
                    className="product-image"
                    onError={(e) => e.target.src='assets/layout/images/small_logo_new.png'}
                />
            </>
        );
    };

    const rowExpansionTemplate = (layersList) => {
        return (
            <div className="orders-subtable">
                <h5>Attributes of {layersList.name}</h5>
                <DataTable value={layersList.attributes}>
                    <Column field="name" header={t(`Application.attribute`)} sortable body={bodyTemplate}></Column>
                    <Column field="dataType" header={t(`Application.datatype`)} sortable body={bodyTemplate}></Column>
                </DataTable>
            </div>
        );
    };

    const removeLayer = (event,name)=>{
        const reducedDownloadList = globalList.filter((layer) => layer.name !== name);
        setGlobalList(reducedDownloadList);
    }

    const removeButton = (localLayersList) =>{
        return (
            <div>
                <Button
                    tooltip={t(`Application.removeFromSelection`)}
                    icon="fad fa-layer-minus"
                    className={"p-button-danger "+localLayersList.name}
                    onClick={
                        (e)=>{
                            removeLayer(e,localLayersList.name)
                        }
                    }
                    >
                </Button>
            </div>
        )
    }

    const loadLayers = ()=>{

        const locaLayersData = globalList.map(
            (layer) => {
                var bbox = [];

                if(layer.boundingBox){
                    if(Array.isArray(layer.boundingBox)){
                        const layerBbox = layer.boundingBox.filter(
                            (item) =>{
                                return item["$"].CRS === "EPSG:4326"
                            }
                        )

                        bbox['maxx'] = layerBbox[0].$.maxx;
                        bbox['maxy'] = layerBbox[0].$.maxy;
                        bbox['minx'] = layerBbox[0].$.minx;
                        bbox['miny'] = layerBbox[0].$.miny;
                    }else {
                        bbox['maxx'] = layer.boundingBox.bbox[2];
                        bbox['maxy'] = layer.boundingBox.bbox[3];
                        bbox['minx'] = layer.boundingBox.bbox[0];
                        bbox['miny'] = layer.boundingBox.bbox[1];
                    }

                }

                const leafletLayer = {
                    label: layer.name,
                    file_type:"wms",
                    url: layer.wmsService,
                    layer:layer.name,
                    visible:true,
                    legendUrl: layer.legendUrl,
                    bbox: bbox
                }
                return leafletLayer;
            }
        )

        setLayersData(locaLayersData);
    }

    const leftContents = (
        <React.Fragment>
            <Button
                label={t(`Application.search`)}
                icon="fad fa-telescope"
                className="p-button-secondary p-button-text"
                onClick={()=>{
                    toggleWidget('search')
                }}
            />
            <Button
                label={t(`Application.browse`)}
                icon="fad fa-atlas"
                className="p-button-secondary p-button-text"
                onClick={()=>{
                    toggleWidget('browse')
                }}
            />
            <Button
                label={t(`Application.import`)}
                icon="fad fa-layer-plus"
                className="p-button-secondary p-button-text"
                onClick={()=>{
                    toggleWidget('import')
                }}
            />
        </React.Fragment>
    );
    const rightContents = (
        <React.Fragment>
            <div>
                <Button tooltip={t(`Application.clickToProceed`)} type="button" label={t(`Application.selectedLayers`)+": "+globalList.length}
                        onClick={toggleDataTable} className="p-button-outlined p-button-success"
                />
                <OverlayPanel ref={op2} appendTo={document.body} showCloseIcon id="overlay_panel" style={{ width: '450px' }}>
                    <DataTable
                        ref={dt}
                        value={globalList}
                        expandedRows={expandedRows}
                        className="p-datatable-customers"
                        dataKey="name"
                        onRowToggle={(e) => setExpandedRows(e.data)}
                        selection={selectedCustomers1}
                        onSelectionChange={(e) => setSelectedCustomers1(e.value)}
                        rowExpansionTemplate={rowExpansionTemplate}
                        paginator
                        rows={5}
                        autoLayout={true}
                    >

                        <Column field="name" header={t(`Application.name`)} body={bodyTemplate}></Column>
                        <Column header={t(`Application.image`)} body={imageBodyTemplate}></Column>
                        <Column field="button" body={removeButton}></Column>
                    </DataTable>
                    <div className="p-mt-2 p-grid p-col-12 p-justify-center">
                        <Button
                            tooltip={t(`Application.clickToProceed`)}
                            label={t(`Application.addToMap`)}
                            type="button"
                            icon="fad fa-truck-loading"
                            onClick={(e)=>{
                                loadLayers(e);
                            }}
                        />
                    </div>

                </OverlayPanel>
            </div>
        </React.Fragment>
    );

    const Parameters = () =>{

        const search = useLocation().search;
        const layer = new URLSearchParams(search).get('layer');


        if(layer!==null){
            const cg = new CacipGeonode();
            cg.buildDataOGC(geoserverLocation,layer).then(
                (result)=>{
                    Promise.all(result).then(
                        (list)=>{

                            const found = list.filter(
                                (item)=>{
                                    if(item.name === layer.replace("geonode:","")){
                                        return item;
                                    }
                                }
                            )
                            updateGlobaList(found)
                        }
                    )
                }
            )
        }
    }

    useEffect(() => {
        navigator.geolocation.getCurrentPosition((position) =>{
            setPosition(position);
        },
        (error)=>{
            setPosition({
                coords:{
                    latitude:43.222,
                    longitude:76.851,
                    marker:false
                }
            });

        });

    }, []);

    const closeBrowser = (shouldClose) => {
        if(shouldClose == true){
            setBrowseWidget(!browseWidget);
        }
    }

    const closeImport = (shouldClose) => {
        if(shouldClose == true){
            setImportWidget(!importWidget);
        }
    }

    const chosenLayers = (layers) => {

        const locaLayersData = layers.map(
            (layer) => {
                var bbox = [];

                if(layer.boundingBox){
                    if(Array.isArray(layer.boundingBox)){
                        const layerBbox = layer.boundingBox.filter(
                            (item) =>{
                                return item["$"].CRS === "EPSG:4326"
                            }
                        )

                        bbox['maxx'] = layerBbox[0].$.maxx;
                        bbox['maxy'] = layerBbox[0].$.maxy;
                        bbox['minx'] = layerBbox[0].$.minx;
                        bbox['miny'] = layerBbox[0].$.miny;
                    }else {
                        bbox['maxx'] = layer.boundingBox.bbox[2];
                        bbox['maxy'] = layer.boundingBox.bbox[3];
                        bbox['minx'] = layer.boundingBox.bbox[0];
                        bbox['miny'] = layer.boundingBox.bbox[1];
                    }

                }

                const leafletLayer = {
                    label: layer.name,
                    file_type:"wms",
                    url: layer.wmsService,
                    layer:layer.name,
                    visible:true,
                    legendUrl: layer.legendUrl,
                    bbox: bbox
                }
                return leafletLayer;
            }
        )

        setLayersData(locaLayersData);
    }

    const customLayers = (layers)=>{
        const locaLayersData = layers.map(
            (layer) => {
                return layer;
            }
        )
        setCustomLayersData(locaLayersData);
    }

    const updateGlobaList = (updatedList) =>{
        if(Array.isArray(updatedList)){
            if(updatedList.length>0){
                var itemsArray = [];
                updatedList.forEach(
                    (item)=>{
                        var exists = false;
                        globalList.forEach(
                            (layer)=>{
                                if(layer.name === item.name){
                                    exists = true;
                                }
                            }
                        )
                        if(exists === false){
                            itemsArray.push(item);
                        }
                    }
                )
                if(itemsArray.length>0){
                    var tempg = [...globalList];
                    tempg.push(...itemsArray);
                    setGlobalList(tempg);
                }
            }
        }else if(updatedList.value){
            if(updatedList.value.length>0){
                var itemsArray = [];
                updatedList.value.forEach(
                    (item)=>{
                        var exists = false;
                        globalList.forEach(
                            (layer)=>{
                                if(layer.name === item.name){
                                    exists = true;
                                }
                            }
                        )
                        if(exists === false){
                            itemsArray.push(item);
                        }
                    }
                )
                if(itemsArray.length>0){
                    var tempg = [...globalList];
                    tempg.push(...itemsArray);
                    setGlobalList(tempg);
                }
            }
        }else{
            var exists = false;
            globalList.forEach(
                (layer)=>{
                    if(layer.name === updatedList.name){
                        exists = true;
                    }
                }
            )
            if(exists === false){
                setGlobalList([...globalList,updatedList]);
            }
        }
    }

    const removeGlobalList = (layerName) =>{
        if(Array.isArray(layerName)){
            var reducedDownloadList = globalList;
            var removeIndices = [];
            if(layerName.length>0){
                layerName.forEach(
                    (item)=>{
                        globalList.forEach(
                            (layer,index)=>{
                                if(layer.name === item.name){
                                    removeIndices.push(index);
                                }
                            }
                        )
                    }
                )
            }
            removeIndices.forEach(
                (pointer)=>{
                    const pointerIndex = reducedDownloadList.indexOf(pointer)
                    if(pointer > -1){
                        reducedDownloadList.splice(pointerIndex,1);
                    }
                }
            )
            setGlobalList([...reducedDownloadList]);
        }else{
            var reducedDownloadList = globalList.filter((layer) => layer.name !== layerName);
            setGlobalList(reducedDownloadList);
        }


    }

    const styles = StyleSheet.create({
        page: {
            flexDirection: 'row',
            backgroundColor: '#E4E4E4',
            orientation:'landscape'
        },
        section: {
            margin: 10,
            padding: 10,
            flexGrow: 1
        },
        image:{

        }
    });


    const compileReport = (value) =>{
        setPdfDialog(true)
        const MyDocument = () => (
            <Document>
                <Page orientation='landscape'>

                    <View style={{ width: '100%'}} wrap={false}>
                        <Image src={value.image} style={{ width: '100%',maxHeight:'60%'}}>
                        </Image>
                        <Text style={{flexDirection: 'row',display:"flex",textAlign:"center"}}>
                            {value.title}
                        </Text>
                        <View style={{flexDirection: 'row',display:"flex",width:"100%"}}>
                            <View style={{textAlign:"center",width:"25%",maxHeight:'50%'}}>
                                <Text >Legend</Text>
                                <Image src={value.legendURL}
                                       style=
                                           {{
                                               maxWidth:"15px",
                                           }}
                                >
                                </Image>
                            </View>
                            <View style={{textAlign:"center",width:"50%"}}>
                                <Text >Abstract</Text>
                                <Text>{value.abstract}</Text>
                            </View>
                            <View style={{textAlign:"center",width:"25%"}}>
                                <Text>Details</Text>
                                <Text style={{paddingTop:"10px"}}>
                                    Coordinate System: {value.srs}
                                </Text>
                                <Text style={{paddingTop:"10px"}}>
                                    Scale Factor: {value.scaleFactor}
                                </Text>
                            </View>
                        </View>
                    </View>


                </Page>
            </Document>
        );

        setPdfDocument(MyDocument)


    }


    const onHide = (name) => {
        setPdfDialog(false)
    }

    const onHide2 = () => {

    }


    //const position = [51.505, -0.09]
    return (
        <div className="p-grid">
            {
                Parameters()
            }
            <div className="card p-shadow-8 p-col-12">
                <div className="p-col-12">
                    <Toolbar
                        left={leftContents}
                        right={rightContents}
                    />
                </div>
                <div className="p-col-12" hidden={searchWidget}>
                    <Search
                        layersList={chosenLayers}
                        gList={updateGlobaList}
                        rList = {removeGlobalList}
                    />
                </div>
                <div className="p-col-12" hidden={browseWidget}>
                    <Browser
                        layersList={chosenLayers}
                        close={closeBrowser}
                        gList={updateGlobaList}
                        rList = {removeGlobalList}
                    />
                </div>
                <div className="p-col-12" hidden={importWidget}>
                    <Import
                        layersList={chosenLayers}
                        customLayersList ={customLayers}
                        close={closeImport}
                        gList={updateGlobaList}
                        rList = {removeGlobalList}
                    />
                </div>
            </div>

            <div className="card p-col">
                {
                    userPosition?
                        <Glowglobe
                            toolbar="full"
                            styleEditor={true}
                            zoom={8}
                            centralPoint={userPosition}
                            simpleLayers={layersData}
                            customLayers={customLayersData}
                            pdfFunction={compileReport}
                        />
                        :console.log()
                }
            </div>


            <Dialog header="Compiling Report..."
                    visible={pdfDialog}
                    style={{width: '50vw'}}
                    modal
                    onHide={onHide}
            >
                <PDFDownloadLink
                    document={pdfDocument}
                    fileName="report.pdf">
                    {({ blob, url, loading, error }) =>loading ? 'Loading document...' : 'Download now!'}
                </PDFDownloadLink>
            </Dialog>

            <div className="simple-loading-spinner">
                <Dialog showHeader={false}
                        style={{ width: '50vw' }}
                        visible={loadingScreen}
                        onHide={onHide2}
                >
                    <div className="p-grid p-justify-center p-align-center vertical-container">
                        <ProgressSpinner/>
                    </div>
                </Dialog>
            </div>



        </div>



    );
}
