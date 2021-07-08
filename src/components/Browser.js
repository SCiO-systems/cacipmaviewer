import React, {useState, useEffect, useRef} from 'react';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import {Toast} from "primereact/components/toast/Toast";
import {DataTable} from "primereact/components/datatable/DataTable";
import {InputText} from "primereact/components/inputtext/InputText";
import {Dialog} from "primereact/components/dialog/Dialog";
import {Toolbar} from "primereact/components/toolbar/Toolbar";
import {SplitButton} from "primereact/components/splitbutton/SplitButton";
import {InputSwitch} from "primereact/components/inputswitch/InputSwitch";
import {DataView, DataViewLayoutOptions} from "primereact/components/dataview/DataView";
import {Dropdown} from "primereact/components/dropdown/Dropdown";
import {Fieldset} from "primereact/components/fieldset/Fieldset";
import CacipGeonode from '../service/CacipGeonode';
import {ProgressSpinner} from "primereact/components/progressspinner/ProgressSpinner";

import {TranslateProvider, useTranslate} from "./translate";


export const Browser = (props) => {

    const [displayBasic, setDisplayBasic] = useState(false);
    const [displayTitle, setDisplayTitle] = useState(false);

    const i18n = useTranslate();
    const { t } = i18n;

    const [globalFilter1, setGlobalFilter1] = useState('');
    const [loading1, setLoading1] = useState(true);

    const [expandedRows, setExpandedRows] = useState([]);

    const [imageDialog, setImage] = useState("");
    const [switchValue, setSwitchValue] = useState(false);
    const [dataGrid, setDataGrid] = useState(false);
    const [dataviewLabel, setdataviewLabel] = useState('');
    const [layout, setLayout] = useState('grid');
    const [sortKey, setSortKey] = useState(null);
    const [sortOrder, setSortOrder] = useState(null);
    const [sortField, setSortField] = useState(null);
    const [closeBrowser, setCloseBrowser] = useState(false);
    const [layersList, setLayersList] = useState(null);

    const [browserList,setBrowserList] = useState([]);
    const [browseReady,setBrowseReady] = useState(false);
    const [loadingScreen,setLoadingScreen] = useState(false);
    const [downloadScreen,setDownloadScreen] = useState(false);

    const dt = useRef(null);
    const toast = useRef();


    const geoserverLocation = "https://geonode.centralasiaclimateportal.org/geoserver/";

    const itemsVector = [
        {
            label: 'SHP',
            icon: 'fad fa-globe',
            command: (e) => {

                var layerName = '';

                if(e.originalEvent.nativeEvent.path[5].classList[3] === undefined){
                    layerName =  e.originalEvent.nativeEvent.path[4].classList[3];
                }else{
                    layerName = e.originalEvent.nativeEvent.path[5].classList[3];
                }

                const layerToDownload = layersList.filter(
                    (item)=>{
                        if(item.name === layerName){
                            return item;
                        }
                    }
                )

                setDownloadScreen(true);
                const cacipGeonode = new CacipGeonode();
                cacipGeonode.downloadData(geoserverLocation,layerToDownload[0],"SHP")
                    .then(
                        (result)=>{
                            setDownloadScreen(false);
                        })
                    .catch(
                        (error)=>{
                            setDownloadScreen(false);
                        })
                    .finally(
                        ()=> {
                            setDownloadScreen(false)
                        })

            }
        },
        {
            label: 'CSV',
            icon: 'fad fa-file-csv',
            command: (e) => {
                var layerName = '';

                if(e.originalEvent.nativeEvent.path[5].classList[3] === undefined){
                    layerName =  e.originalEvent.nativeEvent.path[4].classList[3];
                }else{
                    layerName = e.originalEvent.nativeEvent.path[5].classList[3];
                }

                const layerToDownload = layersList.filter(
                    (item)=>{
                        if(item.name === layerName){
                            return item;
                        }
                    }
                )
                setDownloadScreen(true);
                const cacipGeonode = new CacipGeonode();
                cacipGeonode.downloadData(geoserverLocation,layerToDownload[0],"CSV")
                    .then(
                        (result)=>{
                            setDownloadScreen(false);
                        })
                    .catch(
                        (error)=>{
                            setDownloadScreen(false);
                        })
                    .finally(
                        ()=> {
                            setDownloadScreen(false)
                        });
            }
        },
        {
            label: 'PNG',
            icon: 'fad fa-file-image',
            command: (e) => {

                var layerName = '';

                if(e.originalEvent.nativeEvent.path[5].classList[3] === undefined){
                    layerName =  e.originalEvent.nativeEvent.path[4].classList[3];
                }else{
                    layerName = e.originalEvent.nativeEvent.path[5].classList[3];
                }

                const layerToDownload = layersList.filter(
                    (item)=>{
                        if(item.name === layerName){
                            return item;
                        }
                    }
                )
                setDownloadScreen(true);

                const cacipGeonode = new CacipGeonode();
                cacipGeonode.downloadData(geoserverLocation,layerToDownload[0],"PNG")
                    .then(
                        (result)=>{
                            setDownloadScreen(false);
                        })
                    .catch(
                        (error)=>{
                            setDownloadScreen(false);
                        })
                    .finally(
                        ()=> {
                            setDownloadScreen(false)
                        });
            }
        },
        {
            label: 'JPG',
            icon: 'fad fa-file-image',
            command: (e) => {

                var layerName = '';

                if(e.originalEvent.nativeEvent.path[5].classList[3] === undefined){
                    layerName =  e.originalEvent.nativeEvent.path[4].classList[3];
                }else{
                    layerName = e.originalEvent.nativeEvent.path[5].classList[3];
                }

                const layerToDownload = layersList.filter(
                    (item)=>{
                        if(item.name === layerName){
                            return item;
                        }
                    }
                )

                setDownloadScreen(true);
                const cacipGeonode = new CacipGeonode();
                cacipGeonode.downloadData(geoserverLocation,layerToDownload[0],"JPG")
                    .then(
                        (result)=>{
                            setDownloadScreen(false);
                        })
                    .catch(
                        (error)=>{
                            setDownloadScreen(false);
                        })
                    .finally(
                        ()=> {
                            setDownloadScreen(false)
                        });
            }
        },
        {
            label: 'XLS',
            icon: 'fad fa-file-spreadsheet',
            command: (e) => {

                var layerName = '';

                if(e.originalEvent.nativeEvent.path[5].classList[3] === undefined){
                    layerName =  e.originalEvent.nativeEvent.path[4].classList[3];
                }else{
                    layerName = e.originalEvent.nativeEvent.path[5].classList[3];
                }

                const layerToDownload = layersList.filter(
                    (item)=>{
                        if(item.name === layerName){
                            return item;
                        }
                    }
                )

                setDownloadScreen(true);
                const cacipGeonode = new CacipGeonode();
                cacipGeonode.downloadData(geoserverLocation,layerToDownload[0],"XLS")
                    .then(
                        (result)=>{
                            setDownloadScreen(false);
                        })
                    .catch(
                        (error)=>{
                            setDownloadScreen(false);
                        })
                    .finally(
                        ()=> {
                            setDownloadScreen(false)
                        });
            }
        },
        {
            label: 'JSON',
            icon: 'fad fa-brackets-curly',
            command: (e) => {
                var layerName = '';

                if(e.originalEvent.nativeEvent.path[5].classList[3] === undefined){
                    layerName =  e.originalEvent.nativeEvent.path[4].classList[3];
                }else{
                    layerName = e.originalEvent.nativeEvent.path[5].classList[3];
                }

                const layerToDownload = layersList.filter(
                    (item)=>{
                        if(item.name === layerName){
                            return item;
                        }
                    }
                )
                setDownloadScreen(true);
                const cacipGeonode = new CacipGeonode();
                cacipGeonode.downloadData(geoserverLocation,layerToDownload[0],"JSON")
                    .then(
                        (result)=>{
                            setDownloadScreen(false);
                        })
                    .catch(
                        (error)=>{
                            setDownloadScreen(false);
                        })
                    .finally(
                        ()=> {
                            setDownloadScreen(false)
                        });
            }
        },
        {
            label: 'KML',
            icon: 'fad fa-vector-square',
            command: (e) => {

                var layerName = '';

                if(e.originalEvent.nativeEvent.path[5].classList[3] === undefined){
                    layerName =  e.originalEvent.nativeEvent.path[4].classList[3];
                }else{
                    layerName = e.originalEvent.nativeEvent.path[5].classList[3];
                }

                const layerToDownload = layersList.filter(
                    (item)=>{
                        if(item.name === layerName){
                            return item;
                        }
                    }
                )

                setDownloadScreen(true);
                const cacipGeonode = new CacipGeonode();
                cacipGeonode.downloadData(geoserverLocation,layerToDownload[0],"KML")
                    .then(
                        (result)=>{
                            setDownloadScreen(false);
                        })
                    .catch(
                        (error)=>{
                            setDownloadScreen(false);
                        })
                    .finally(
                        ()=> {
                            setDownloadScreen(false)
                        });
            }
        },
        {
            label: 'GML',
            icon: 'fad fa-file-code',
            command: (e) => {

                var layerName = '';

                if(e.originalEvent.nativeEvent.path[5].classList[3] === undefined){
                    layerName =  e.originalEvent.nativeEvent.path[4].classList[3];
                }else{
                    layerName = e.originalEvent.nativeEvent.path[5].classList[3];
                }

                const layerToDownload = layersList.filter(
                    (item)=>{
                        if(item.name === layerName){
                            return item;
                        }
                    }
                )

                setDownloadScreen(true);
                const cacipGeonode = new CacipGeonode();
                cacipGeonode.downloadData(geoserverLocation,layerToDownload[0],"GMLV")
                    .then(
                        (result)=>{
                            setDownloadScreen(false);
                        })
                    .catch(
                        (error)=>{
                            setDownloadScreen(false);
                        })
                    .finally(
                        ()=> {
                            setDownloadScreen(false)
                        });
            }
        },
        {
            label: 'PDF',
            icon: 'fad fa-file-pdf',
            command: (e) => {

                var layerName = '';

                if(e.originalEvent.nativeEvent.path[5].classList[3] === undefined){
                    layerName =  e.originalEvent.nativeEvent.path[4].classList[3];
                }else{
                    layerName = e.originalEvent.nativeEvent.path[5].classList[3];
                }

                const layerToDownload = layersList.filter(
                    (item)=>{
                        if(item.name === layerName){
                            return item;
                        }
                    }
                )


                setDownloadScreen(true);
                const cacipGeonode = new CacipGeonode();
                cacipGeonode.downloadData(geoserverLocation,layerToDownload[0],"PDF")
                    .then(
                        (result)=>{
                            setDownloadScreen(false);
                        })
                    .catch(
                        (error)=>{
                            setDownloadScreen(false);
                        })
                    .finally(
                        ()=> {
                            setDownloadScreen(false)
                        });
            }
        }
    ];

    const itemsRaster = [
        {
            label: 'PNG',
            icon: 'fad fa-file-image',
            command: (e) => {

                var layerName = '';

                if(e.originalEvent.nativeEvent.path[5].classList[3] === undefined){
                    layerName =  e.originalEvent.nativeEvent.path[4].classList[3];
                }else{
                    layerName = e.originalEvent.nativeEvent.path[5].classList[3];
                }

                const layerToDownload = layersList.filter(
                    (item)=>{
                        if(item.name === layerName){
                            return item;
                        }
                    }
                )

                setDownloadScreen(true);
                const cacipGeonode = new CacipGeonode();
                cacipGeonode.downloadData(geoserverLocation,layerToDownload[0],"PNG")
                    .then(
                        (result)=>{
                            setDownloadScreen(false);
                        })
                    .catch(
                        (error)=>{
                            setDownloadScreen(false);
                        })
                    .finally(
                        ()=> {
                            setDownloadScreen(false)
                        });
            }
        },
        {
            label: 'JPG',
            icon: 'fad fa-file-image',
            command: (e) => {

                var layerName = '';

                if(e.originalEvent.nativeEvent.path[5].classList[3] === undefined){
                    layerName =  e.originalEvent.nativeEvent.path[4].classList[3];
                }else{
                    layerName = e.originalEvent.nativeEvent.path[5].classList[3];
                }

                const layerToDownload = layersList.filter(
                    (item)=>{
                        if(item.name === layerName){
                            return item;
                        }
                    }
                )

                setDownloadScreen(true);
                const cacipGeonode = new CacipGeonode();
                cacipGeonode.downloadData(geoserverLocation,layerToDownload[0],"JPG")
                    .then(
                        (result)=>{
                            setDownloadScreen(false);
                        })
                    .catch(
                        (error)=>{
                            setDownloadScreen(false);
                        })
                    .finally(
                        ()=> {
                            setDownloadScreen(false)
                        });
            }
        },
        {
            label: 'PDF',
            icon: 'fad fa-file-pdf',
            command: (e) => {

                var layerName = '';

                if(e.originalEvent.nativeEvent.path[5].classList[3] === undefined){
                    layerName =  e.originalEvent.nativeEvent.path[4].classList[3];
                }else{
                    layerName = e.originalEvent.nativeEvent.path[5].classList[3];
                }

                const layerToDownload = layersList.filter(
                    (item)=>{
                        if(item.name === layerName){
                            return item;
                        }
                    }
                )


                setDownloadScreen(true);
                const cacipGeonode = new CacipGeonode();
                cacipGeonode.downloadData(geoserverLocation,layerToDownload[0],"PDF")
                    .then(
                        (result)=>{
                            setDownloadScreen(false);
                        })
                    .catch(
                        (error)=>{
                            setDownloadScreen(false);
                        })
                    .finally(
                        ()=> {
                            setDownloadScreen(false)
                        });
            }
        },
        {
            label: 'GeoTIFF',
            icon: 'fad fa-file-pdf',
            command: (e) => {

                var layerName = '';

                if(e.originalEvent.nativeEvent.path[5].classList[3] === undefined){
                    layerName =  e.originalEvent.nativeEvent.path[4].classList[3];
                }else{
                    layerName = e.originalEvent.nativeEvent.path[5].classList[3];
                }

                const layerToDownload = layersList.filter(
                    (item)=>{
                        if(item.name === layerName){
                            return item;
                        }
                    }
                )

                setDownloadScreen(true);
                const cacipGeonode = new CacipGeonode();
                cacipGeonode.downloadData(geoserverLocation,layerToDownload[0],"GEOTIFFR")
                    .then(
                        (result)=>{
                            setDownloadScreen(false);
                        })
                    .catch(
                        (error)=>{
                            setDownloadScreen(false);
                        })
                    .finally(
                        ()=> {
                            setDownloadScreen(false)
                        });
            }
        }
    ];

    const onSortChange = (event) => {
        const value = event.value;

        if (value.indexOf('!') === 0) {
            setSortOrder(-1);
            setSortField(value.substring(1, value.length));
            setSortKey(value);
        }
        else {
            setSortOrder(1);
            setSortField(value);
            setSortKey(value);
        }
    };

    const sortOptions = [
        { label: 'A -> Z', value: 'name' },
        { label: 'Z -> A', value: '!name' }
    ];


    const rowClick = (event) => {
        if(event.originalEvent.target.nodeName === "IMG"){
            setImage(event.originalEvent.target.src);
            setDisplayTitle(t(`Application.thumbnail`)+" "+event.originalEvent.target.id);
            setDisplayBasic(true);
        }

    };
    const changeDataView = (event) => {
        setSwitchValue(!switchValue);
        setDataGrid(!dataGrid);

        if(switchValue == true){
            setdataviewLabel(t(`Application.advanced`));
        }else if (switchValue == false){
            setdataviewLabel(t(`Application.simple`));
        }

    };

    const onRowExpand = (event) => {

    };

    const onRowCollapse = (event) => {

    };

    const basicDialogFooter =
        <Button type="button"
                label="OK"
                onClick={() => setDisplayBasic(false)}
                icon="pi pi-check" className="p-button-text" />;

    const customer1TableHeader = (
        <div className="table-header">
            <span className="p-input-icon-left">
                <i className="fal fa-filter" />
                <InputText value={globalFilter1} onChange={(e) => setGlobalFilter1(e.target.value)} placeholder={t(`Application.filter`)} />
            </span>
        </div>
    );


    const bodyTemplate = (layersList, props) => {

        var fieldValue = ""

        if(props.header === t(`Application.attribute`)){
            fieldValue = layersList[props.field];
        }else{
            if(props.field === "name"){
                fieldValue = <a href={"https://centralasiaclimateportal.org/geonode/layers/geonode:"+layersList[props.field]} target="_blank">{layersList["title"]}</a>
            }else{
                fieldValue = layersList[props.field];
            }
        }

        return (
            <>
                <span className="p-column-title" title={layersList[props.field]}>{props.header}</span>
                {fieldValue}
            </>
        );
    };

    const imageBodyTemplate = (layersList) => {
        return (
            <>
                <img height="100"
                     id={layersList.name}
                     src={layersList.thumbnail}
                     alt={layersList.name}
                     className="product-image"
                     onError={
                         (e) => e.target.src='assets/layout/images/missing_thumb.png'
                     }
                />
            </>
        );
    };

    const srsBodyTemplate = (layersList,props) => {
        return (
            <>
                <span className="p-column-title">{props.header}</span>
                {layersList.srs}
            </>
        );
    };

    const rowExpansionTemplate = (layersList) => {
        return (
            <div className="orders-subtable">
                <h5>{t(`Application.attributesOf`)+" "} {layersList.name}</h5>
                <DataTable value={layersList.attributes}>
                    <Column field="name" header={t(`Application.attribute`)} sortable body={bodyTemplate}></Column>
                    <Column field="dataType" header={t(`Application.datatype`)} sortable body={bodyTemplate}></Column>
                </DataTable>
            </div>
        );
    };

    const rightToolbarTemplate = () => {
        return (
            <React.Fragment>
            </React.Fragment>
        )
    }

    const leftUpperToolbarTemplate = () => {
        return (
            <React.Fragment>
                <span className="p-mr-2">{dataviewLabel}</span>
                <InputSwitch
                    tooltip={t(`Application.clickToProceed`)}
                    className="p-mr-6"
                    checked={switchValue}
                    onChange={(e) => changeDataView(e)}
                    disabled = {!browseReady}
                />
            </React.Fragment>
        )
    }

    const rightUpperToolbarTemplate = () => {
        return (
            <React.Fragment>
                <Button
                    className="p-mr-2 p-button-outlined"
                    tooltip={t(`Application.clickToProceed`)}
                    label={t(`Application.exportList`)}
                    icon="fad fa-file-csv"
                    onClick={exportCSV}
                    disabled = {!browseReady}
                />
            </React.Fragment>
        )
    }

    const exportCSV = () => {
        dt.current.exportCSV();
    }

    const dataviewHeader = (
        <div className="p-grid p-nogutter">
            <div className="p-col-6" style={{ textAlign: 'left' }}>
                <Dropdown value={sortKey} options={sortOptions} optionLabel="label"
                          placeholder={t(`Application.sortByTitle`)}
                          onChange={onSortChange} />
            </div>
            <div className="p-col-6" style={{ textAlign: 'right' }}>
                <DataViewLayoutOptions layout={layout} onChange={(e) => setLayout(e.value)} />
            </div>
        </div>
    );

    const sendList = ()=>{
        props.layersList(browserList);
    }

    const itemTemplate = (data, layout) => {
        if (!data) {
            return;
        }
        if (layout === 'list') {
            return dataviewListItem(data);
        }
        else if (layout === 'grid') {
            return dataviewGridItem(data);
        }
    };


    const dataviewListItem = (localLayersList) => {
        if(layersList.abstract === "No abstract provided"){
            layersList.abstract = "";
        }

        var items = "";
        if(localLayersList.type=="VECTOR"){
            items = itemsVector;
        }else if(localLayersList.type=="RASTER"){
            items = itemsRaster;
        }

        return (
            <div className="p-col-12">
                <div className="product-list-item">
                    <img height="131"
                         id={localLayersList.name}
                         src={localLayersList.thumbnail}
                         alt={localLayersList.thumbnail}
                         onError={
                             (e) => e.target.src='assets/layout/images/missing_thumb.png'
                         }
                    />
                    <div className="product-list-detail">
                        <div className="product-name">
                            <a title={localLayersList.title} target="_blank"
                               href={"https://centralasiaclimateportal.org/geonode/layers/"+localLayersList.name}>
                                {localLayersList.name}
                            </a>

                            </div>
                        <div className="product-description">{layersList.abstract}</div>
                        <i className="pi pi-tag product-category-icon"></i><span className="product-category">{localLayersList.type}</span>
                    </div>
                    <div className="product-list-action">
                        <Button
                            icon="fad fa-layer-plus"
                            data={JSON.stringify(localLayersList)}
                            onClick={(e) => {
                                let tempLayers = [...layersList];
                                localLayersList.disable = !localLayersList.disable;
                                tempLayers[localLayersList.index] = localLayersList;
                                setLayersList(tempLayers);
                                updateDownloadList(e)
                            }
                            }

                            label={t(`Application.selectLayer`)}
                            disabled = {localLayersList.disable}
                        >
                        </Button>
                        <Button
                            className="p-button-danger"
                            icon = "fad fa-layer-minus"
                            data={JSON.stringify(localLayersList)}
                            onClick={(e) =>{
                                let tempLayers = [...layersList];
                                localLayersList.disable = !localLayersList.disable;
                                tempLayers[localLayersList.index] = localLayersList;
                                setLayersList(tempLayers);
                                removeDownloadList(e);
                            }
                            }
                            label={t(`Application.removeFromSelection`)}
                            disabled = {!localLayersList.disable}
                        >
                        </Button>
                        <SplitButton
                            tooltip={t(`Application.clickToProceed`)}
                            label={t(`Application.downloadLayer`)}
                            icon="fad fa-download"
                            model={items}
                            className={"p-button-secondary "+localLayersList.name}>
                            disabled = {!browseReady}
                        </SplitButton>
                    </div>
                </div>
            </div>
        );
    };

    const dataviewGridItem = (localLayersList) => {
        let title = localLayersList.name;

        if(localLayersList.name.length>15){
            title = title.substr(0,13)+". . . ";
        }
        if(localLayersList.abstract === "No abstract provided"){
            localLayersList.abstract = "";
        }

        var items = "";
        if(localLayersList.type=="VECTOR"){
            items = itemsVector;
        }else if(localLayersList.type=="RASTER"){
            items = itemsRaster;
        }

        return (
            <div className="p-col-12 p-md-4">
                <div className="product-grid-item card">
                    <div className="product-grid-item-top">
                        <div>
                            <i className="pi pi-tag product-category-icon"></i>
                            <span className="product-category">{localLayersList.type}</span>
                        </div>
                    </div>
                    <div className="product-grid-item-content">
                        <img height="131"
                             id={localLayersList.name}
                             src={localLayersList.thumbnail}
                             alt={localLayersList.thumbnail}
                             onError={
                                 (e) => e.target.src='assets/layout/images/missing_thumb.png'
                             }

                        />
                        <div className="product-name">
                            <a title={localLayersList.name} target="_blank"
                               href={"https://centralasiaclimateportal.org/geonode/layers/geonode:"+localLayersList.title}>
                                {title}
                            </a>
                        </div>
                        <div className="product-description">{localLayersList.abstract}</div>
                    </div>
                    <div className="product-grid-item-bottom">
                        <div className="p-col-12">
                            <div className="p-toolbar p-component" role="toolbar" style={{backgroundColor:"white"}}>
                                <div className="p-toolbar-group-left">
                                    <Button
                                        tooltip={t(`Application.removeFromSelection`)}
                                        icon = "fad fa-layer-plus"
                                        data={JSON.stringify(localLayersList)}
                                        onClick={(e) => {
                                            let tempLayers = [...layersList];
                                            localLayersList.disable = !localLayersList.disable;
                                            tempLayers[localLayersList.index] = localLayersList;
                                            setLayersList(tempLayers);
                                            updateDownloadList(e)
                                        }
                                        }

                                    >
                                    </Button>
                                    <Button
                                        tooltip={t(`Application.selectLayer`)}
                                        className="p-button-danger p-ml-2"
                                        icon = "fad fa-layer-minus"
                                        data={JSON.stringify(localLayersList)}
                                        onClick={(e) =>{
                                            let tempLayers = [...layersList];
                                            localLayersList.disable = !localLayersList.disable;
                                            tempLayers[localLayersList.index] = localLayersList;
                                            setLayersList(tempLayers);
                                            removeDownloadList(e);
                                        }
                                        }
                                    >
                                    </Button>
                                </div>
                                <div className="p-toolbar-group-right">
                                    <SplitButton
                                        tooltip={t(`Application.downloadFormat`)}
                                        icon="fad fa-download"
                                        model={items}
                                        data = {localLayersList.name}
                                        className={"p-button-secondary "+localLayersList.name}>
                                    </SplitButton>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        );
    };

    const updateDownloadList = (event) => {
        if("value" in event){
            props.gList(event);
            setBrowserList(event.value);
        }else if(event.target.className.includes("fad") ||
            event.target.className.includes("p-button")){
            if(event.target.offsetParent.getAttribute("data") !== null){
                props.gList(JSON.parse(event.target.offsetParent.getAttribute("data")));
                setBrowserList([...browserList, JSON.parse(event.target.offsetParent.getAttribute("data"))]);
            }else if(event.target.getAttribute("data") !== null){
                props.gList(JSON.parse(event.target.getAttribute("data")));
                setBrowserList([...browserList,JSON.parse(event.target.getAttribute("data"))]);
            }
        }
    }

    const removeDownloadList = (event) => {
        let layerName = "";
        if("value" in event){
            props.rList(event.value.name);
        }else if(event.target.className.includes("fad") ||
            event.target.className.includes("p-button")){
            if(event.target.offsetParent.getAttribute("data") !== null){
                let layer = JSON.parse(event.target.offsetParent.getAttribute("data"));
                layerName = layer.name;
                props.rList(layerName);
            }else if(event.target.getAttribute("data") !== null){
                let layer = JSON.parse(event.target.getAttribute("data"));
                layerName = layer.name;
                props.rList(layerName);
            }
        }
        const reducedDownloadList = browserList.filter((layer) => layer.name !== layerName);
        setBrowserList(reducedDownloadList);
    }

    const downloadButton = (localLayersList) =>{

        var items = "";
        if(localLayersList.type=="VECTOR"){
            items = itemsVector;
        }else if(localLayersList.type=="RASTER"){
            items = itemsRaster;
        }

        return (
            <div>
                <SplitButton
                    tooltip={t(`Application.clickToProceed`)}
                    icon="fad fa-download"
                    model={items}
                    className={"p-button-secondary "+localLayersList.name}
                >

                </SplitButton>
            </div>
        )
    }

    const onHide = () => {

    }

    useEffect(() => {

        setdataviewLabel(t(`Application.advanced`))


        const cacipGeonode = new CacipGeonode();
        cacipGeonode.fetchApprovedResources(geoserverLocation).then(
            (res)=>{
                cacipGeonode.buildDataOGC(geoserverLocation,res).then(
                    data => {
                        Promise.all(data)
                            .then(
                                (values) => {
                                    const approved = values.filter(
                                        (item)=>{
                                            if(item.approved === true){
                                                return item;
                                            }
                                        }
                                    )
                                    setLayersList(approved);
                                    setLoading1(false);
                                    setBrowseReady(true);
                                }

                            )
                            .catch(
                                (error)=>{
                                    console.log(error)
                                }
                            )
                    }
                )
            }
        )

    }, [t(`Application.advanced`)]);

    return (


        <div hidden={closeBrowser}>
            <div className="simple-loading-spinner">
                <Dialog showHeader={false}
                        style={{ width: '50vw' }}
                        visible={loadingScreen}
                        onHide={onHide}
                >
                    <div className="p-grid p-justify-center p-align-center vertical-container">
                        <ProgressSpinner/>
                    </div>
                </Dialog>
            </div>
            <Fieldset legend={t(`Application.browse`)} toggleable>
            <Toast ref={toast} />
            <Toolbar className="p-mb-4"
                     left={leftUpperToolbarTemplate} right={rightUpperToolbarTemplate}></Toolbar>
            <div className="table-demo" hidden={dataGrid}>
                <DataTable
                    value={layersList}
                    expandedRows={expandedRows}
                    className="p-datatable-customers"
                    dataKey="name"
                    onRowToggle={(e) => setExpandedRows(e.data)}
                    onRowExpand={onRowExpand}
                    onRowCollapse={onRowCollapse}
                    selection={browserList}
                    onSelectionChange={(e) => updateDownloadList(e)}
                    rowExpansionTemplate={rowExpansionTemplate}
                    exportable
                    rowHover
                    globalFilter={globalFilter1}
                    header={customer1TableHeader}
                    onRowClick={rowClick}
                    paginator
                    rows={5}
                    rowsPerPageOptions={[5, 10, 25]}
                    loading={loading1}
                    autoLayout={true}
                    ref={dt}
                >

                    <Column expander headerStyle={{ width: '3rem' }} />
                    <Column selectionMode="multiple" headerStyle={{ width: '3em' }}></Column>
                    <Column field="name" style={{width:"50px"}} header={t(`Application.name`)} sortable body={bodyTemplate}></Column>
                    <Column header={t(`Application.image`)} style={{width:"50px"}} body={imageBodyTemplate}></Column>
                    <Column field="srs" header={t(`Application.srs`)}  sortable body={srsBodyTemplate}></Column>
                    <Column field="type" header={t(`Application.type`)}  sortable body={bodyTemplate}></Column>
                    <Column field="download" style={{width:"50px"}} body={downloadButton}/>
                </DataTable>
            </div>

            <div className="list-demo" hidden={!dataGrid}>
                <DataView
                    value={layersList}
                    layout={layout}
                    paginator
                    rows={5}
                    rowsPerPageOptions={[5, 10, 25]}
                    sortOrder={sortOrder}
                    sortField={sortField}
                    itemTemplate={itemTemplate}
                    header={dataviewHeader}
                    globalFilter={globalFilter1}
                    loading={loading1}
                >

                </DataView>
            </div>

            <Toolbar className="p-mb-4" right={rightToolbarTemplate}></Toolbar>
            </Fieldset>

            <Dialog id="image-dialog"
                    header={displayTitle}
                    visible={displayBasic}
                    footer={basicDialogFooter}
                    modal={false}
                    closable = {false}
                    onHide={() => setDisplayBasic(false)}
            >
                <div class="p-col-12">
                    <img src={imageDialog}/>
                </div>
            </Dialog>

            <div>
                <Dialog
                    header="Your files are being prepared! Please wait ..."
                    visible={downloadScreen}
                    style={{width: '50vw'}}
                    modal
                    onHide={onHide}
                    closeOnEscape = {false}
                    closable = {false}
                >
                    <div className="p-grid p-justify-center p-align-center vertical-container">
                        <ProgressSpinner/>
                    </div>
                </Dialog>
            </div>

        </div>
    )
}
