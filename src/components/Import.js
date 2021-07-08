import React, {useState, useEffect, useRef} from 'react';
import validator from 'validator'
import CapabilitiesUtil from '@terrestris/ol-util/dist/CapabilitiesUtil/CapabilitiesUtil';
import {Fieldset} from "primereact/components/fieldset/Fieldset";
import {Toolbar} from "primereact/components/toolbar/Toolbar";
import {PickList} from "primereact/components/picklist/PickList";
import {Button} from "primereact/components/button/Button";
import {ProgressSpinner} from "primereact/components/progressspinner/ProgressSpinner";
import {Dialog} from "primereact/components/dialog/Dialog";
import {InputText} from "primereact/components/inputtext/InputText";
import { RadioButton } from 'primereact/radiobutton';
import {FileUpload} from "primereact/components/fileupload/FileUpload";

import {TranslateProvider, useTranslate} from "./translate";


import CacipGeonode from "../service/CacipGeonode";

export const Import = (props) => {

    const server = " https://mapviewer.centralasiaclimateportal.org:8000"
    //const server = "http://localhost:8000"

    const [floatValue, setFloatValue] = useState('');
    const [city, setCity] = useState(null);

    const [preselectedSources, setpreselectedSources] = useState(null);


    const [errorState, setErrorState] = useState(true);
    const [connectState, setConnectState] = useState(true);
    const [invalidClass,setInvalidClass] = useState('');

    const [loadingWMS, setLoadingWMS] = useState(false);
    const [enablePickList, setEnablePickList] = useState(true);

    const [layersList, setLayersList] = useState([]);
    const [chosenLayersList, setchosenLayersList] = useState([]);
    const [customLayersList, setCustomLayersList] = useState([]);
    const [customLoadButton, setCustomLoadButton] = useState(true);

    const [valueRadio, setValueRadio] = useState(true);
    const fileUploadRef = useRef(null);

    const i18n = useTranslate();
    const { t } = i18n;

    useEffect(() => {

    }, []);

    const validateURL = (e) =>{
        if(validator.isURL(e.target.value) == true){
            setConnectState(false);
            setErrorState(true);
            setInvalidClass("");
        }else if(e.target.value ===""){
            setErrorState(true);
            setInvalidClass("");
        }else{
            setConnectState(true);
            setErrorState(false);
            setInvalidClass("p-error");
        }
        setFloatValue(e.target.value);
    }

    const loadWMSLayers = () =>{

        setLoadingWMS(true);

        let wmsGetCapabilitiesLink = "";
        if(floatValue.toLowerCase().includes("service=wms")){
            wmsGetCapabilitiesLink = floatValue;
        }else{
            wmsGetCapabilitiesLink = floatValue+"?SERVICE=WMS&VERSION=1.3.0&SLD_VERSION=1.1.0&REQUEST=GetCapabilities";
        }

        CapabilitiesUtil.parseWmsCapabilities(wmsGetCapabilitiesLink)
            .then(CapabilitiesUtil.getLayersFromWmsCapabilities)
            .then(layers => {
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


                        var layerWMS = ""

                        if(layer.values_.getFeatureInfoUrl !== undefined){
                            layerWMS = layer.values_.getFeatureInfoUrl;
                        }else{
                            layerWMS = layer.values_.source.url_;
                        }

                        var instance = {
                            name: layer.values_.name,
                            abstract: layer.values_.abstract,
                            title:layer.values_.title,
                            legend: layer.values_.legendUrl,
                            baseURL: layer.values_.getFeatureInfoUrl,
                            wmsService: layerWMS,
                            thumbnailURL:thumbnailUrl,
                            legendUrl:legendUrl
                        }
                        return instance;
                    }
                )
                setLayersList(instances);
                setEnablePickList(false);
                setLoadingWMS(false);
            })
            .catch((e) => {
                setLoadingWMS(false);
                console.log("error");
                console.log(e);
            });

    }

    const itemTemplate = (item) => {
        return (
            <div className="product-item">
                <div className="image-container">
                    <img src={`${item.thumbnailURL}`}
                         onError={(e) =>
                             e.target.src='https://www.primefaces.org/wp-content/uploads/2020/05/placeholder.png'}
                         alt={item.name}
                    />
                </div>
                <div className="product-list-detail">
                    <span className="p-ml-4">{item.title}</span>
                </div>
            </div>
        );
    }

    const onChange = (event) => {
        setLayersList(event.source);
        setchosenLayersList(event.target);

        props.rList(event.source);
        props.gList(event.target);
    }

    const sendList = ()=>{
        props.layersList(chosenLayersList);
    }

    const sendCustomList = ()=>{
        props.customLayersList(customLayersList);
        fileUploadRef.current.clear()
        setCustomLoadButton(true);
    }


    const closeSignal = ()=>{
        props.close(true);
    }

    const leftUpperToolbarTemplate = () => {
        return (
            <React.Fragment>
                <div>
                    <RadioButton
                        value={t(`Application.predefined`)}
                        inputId="s1"
                        name="import_type"
                        onChange={(e) =>
                            {
                                setValueRadio(e.value);
                                setpreselectedSources(false);
                                setFloatValue('');
                                setConnectState(true);
                            }

                        }
                        checked={valueRadio === t(`Application.predefined`)}
                    />
                    <label htmlFor="s1">{t(`Application.predefined`)}</label>
                    <RadioButton
                        value={t(`Application.customData`)}
                        inputId="s2"
                        name="import_type"
                        onChange={(e) =>
                            {
                                setValueRadio(e.value);
                                setpreselectedSources(true);
                                setFloatValue('');
                                setConnectState(true);
                            }
                        }
                        checked={valueRadio === t(`Application.customData`)}
                        className="p-ml-2"
                    />
                    <label htmlFor="s2">{t(`Application.customData`)}</label>

                </div>
                <Dialog
                    visible = {loadingWMS}
                    modal
                    position = "center"
                    closeOnEscape = {false}
                    closable = {false}
                    baseZIndex = {1000}
                    showHeader = {false}
                    onHide = {()=>setLoadingWMS(false)}
                >
                    <ProgressSpinner className="spinner-background" animationDuration="15s"/>
                </Dialog>

            </React.Fragment>
        )
    }

    const rightUpperToolbarTemplate = () => {
        return (
            <React.Fragment>

            </React.Fragment>
        )
    }

    const radioSelection = (selection)=>{
        setCity(selection);
        setConnectState(false);
        if(selection === "NSIDC"){
            setFloatValue(server+"/static/wms/NSIDC_WMS_Capabilities.xml");
        }else if(selection === "FIRMS"){
            setFloatValue(server+"/static/wms/FIRMS_WMS_Capabilities.xml");
        }else if(selection === "ISRIC"){
            setFloatValue("https://maps.isric.org/mapserv?map=/map/wrb.map&SERVICE=WMS&VERSION=1.3.0&SLD_VERSION=1.1.0&REQUEST=GetCapabilities");
        }else if(selection === "GIBS"){
            setFloatValue(server+"/static/wms/GIBS_WMS_Capabilities.xml");
        }
    }

    const uploadFiles = (event)=>{

        const cacipGeonode = new CacipGeonode();
        cacipGeonode.uploadData(server,event.files).then(
            (res)=>{
                res.forEach(
                    (item)=>{
                        item.then(
                            (fullfilled)=>{
                                let currentChosenLayers = customLayersList;
                                currentChosenLayers.push(fullfilled);
                                setCustomLayersList([...currentChosenLayers]);
                            }
                        )
                    }
                )
                setCustomLoadButton(false);
            }
        )


    }

    const chooseOptions = {label: t(`Application.choose`), icon: 'pi pi-fw pi-plus'};
    const uploadOptions = {label: t(`Application.upload`), icon: 'pi pi-upload', className: 'p-button-success'};
    const cancelOptions = {label: t(`Application.cancel`), icon: 'pi pi-times', className: 'p-button-danger'};

    return (
        <div>
            <div>
                <Fieldset legend={t(`Application.importFromExternal`)} toggleable>

                    <Toolbar className="p-mb-4"
                             left={leftUpperToolbarTemplate}
                             right={rightUpperToolbarTemplate}
                    >
                    </Toolbar>
                    <div hidden={preselectedSources} className="p-col-12">
                        <div className="p-field-radiobutton">
                            <RadioButton inputId="datasource1" name="dataSource" value="NSIDC"
                                         onChange={
                                             (e)=>radioSelection(e.value)
                                         }
                                         checked={city === 'NSIDC'}
                            />
                            <label htmlFor="datasource1">
                                National Snow & Ice Data Center
                                ( <a href="https://nsidc.org/">NSIDC</a> )
                            </label>
                        </div>
                        <div className="p-field-radiobutton">
                            <RadioButton inputId="datasource2" name="dataSource" value="FIRMS"
                                         onChange={
                                             (e)=>radioSelection(e.value)
                                         }
                                         checked={city === 'FIRMS'} />
                            <label htmlFor="datasource2">
                                Fire Information for Resource Management System
                                ( <a href="https://firms.modaps.eosdis.nasa.gov/">FIRMS</a> )
                            </label>
                        </div>
                        <div className="p-field-radiobutton">
                            <RadioButton inputId="datasource3" name="dataSource" value="ISRIC"
                                         onChange={
                                             (e)=>radioSelection(e.value)
                                         }
                                         checked={city === 'ISRIC'} />
                            <label htmlFor="datasource3">
                                World Soil Information
                                ( <a href="https://www.isric.org/">ISRIC</a> )
                            </label>
                        </div>
                        <div className="p-field-radiobutton">
                            <RadioButton inputId="datasource4" name="dataSource" value="GIBS"
                                         onChange={
                                             (e)=>radioSelection(e.value)
                                         }
                                         checked={city === 'GIBS'}
                            />
                            <label htmlFor="datasource4">
                                Global Imagery Browse Services
                                ( <a href="https://gibs.earthdata.nasa.gov">GIBS</a> )
                            </label>
                        </div>
                        <Button
                            icon="fad fa-plug"
                            label={t(`Application.connect`)}
                            disabled={connectState}
                            onClick={loadWMSLayers}
                            className="p-button-raised"
                        >
                        </Button>
                    </div>
                    <div hidden={!preselectedSources} >
                        <div className="p-inputgroup">
                            <span className="p-float-label">
                                <InputText
                                    id="wms"
                                    type="text"
                                    value={floatValue}
                                    onChange={(e) => validateURL(e)}
                                    className={invalidClass}
                                />
                                <label htmlFor="wms">WMS Service URL</label>
                            </span>
                            <div className="p-mt-2 p-ml-1" hidden={errorState}>
                                <small id="username2-help" className="p-error p-d-block">
                                    Not Valid URL form.
                                </small>
                            </div>
                            <Button
                                icon="fad fa-plug"
                                label={t(`Application.connect`)}
                                disabled={connectState}
                                onClick={loadWMSLayers}
                                className="p-button-raised"
                            />
                        </div>
                    </div>
                    <div className="col-p p-mt-6" hidden={enablePickList}>
                        <div className="picklist-demo" >
                            <PickList
                                source={layersList}
                                target={chosenLayersList}
                                sourceHeader={t(`Application.available`)}
                                targetHeader={t(`Application.selectedLayers`)}
                                itemTemplate={itemTemplate}
                                onChange={onChange}
                                sourceStyle={{ height: '200px'}}
                                targetStyle={{ height: '200px'}}
                            >
                            </PickList>
                        </div>
                    </div>
                </Fieldset>
            </div>
            <div className="p-mt-4">
                <Fieldset legend={t(`Application.customData`)} toggleable>
                    <FileUpload
                        ref={fileUploadRef}
                        name="demo[]"
                        url="http://localhost:8000/upload"
                        multiple
                        accept=".tiff,.geotiff,.kml,.geojson,.json"
                        maxFileSize={100000000}
                        customUpload
                        uploadHandler={(event)=>uploadFiles(event)}
                        emptyTemplate={<p className="p-m-0">{t(`Application.dragandrop`)}</p>}
                        chooseOptions={chooseOptions}
                        uploadOptions={uploadOptions}
                        cancelOptions={cancelOptions}
                        chooseLabel={t(`Application.choose`)}
                        uploadLabel={t(`Application.upload`)}
                        cancelLabel={t(`Application.cancel`)}
                    />

                    <div className="p-col-12 p-mt-4"
                         hidden={customLoadButton}>
                        <Button
                            tooltip={t(`Application.clickToProceed`)}
                            label={t(`Application.addToMap`)}
                            type="button"
                            icon="fad fa-truck-loading"
                            onClick={sendCustomList}
                            disabled = {customLayersList.length === 0}
                        />
                    </div>
                </Fieldset>
            </div>
        </div>
    );


}
