import React, {useState, useEffect, useRef} from 'react';
import {Fieldset} from "primereact/components/fieldset/Fieldset";
import {InputText} from "primereact/components/inputtext/InputText";
import {Button} from "primereact/components/button/Button";
import {MultiSelect} from "primereact/components/multiselect/MultiSelect";

import "../assets/flags/flags.css"
import {Glowglobe} from "./Glowglobe";
import {InputTextarea} from "primereact/components/inputtextarea/InputTextarea";
import CacipGeonode from "../service/CacipGeonode";
import {DataTable} from "primereact/components/datatable/DataTable";
import {Column} from "primereact/components/column/Column";
import {Accordion, AccordionTab} from "primereact/components/accordion/Accordion";
import {Dialog} from "primereact/components/dialog/Dialog";
import {ProgressSpinner} from "primereact/components/progressspinner/ProgressSpinner";
import {Calendar} from "primereact/components/calendar/Calendar";
import {InputSwitch} from "primereact/components/inputswitch/InputSwitch";
import {TranslateProvider, useTranslate} from "./translate";

import continents from 'countries-list'
import {SplitButton} from "primereact/components/splitbutton/SplitButton";



export const Search = (props) => {

    //const geoserverLocation = "https://geonode.centralasiaclimateportal.org/geoserver/";
    const geoserverLocation = "https://geonode.centralasiaclimateportal.org/geoserver/";


    const [userPosition, setPosition] = useState(null);
    const [keywords, setKeywords] = useState('');
    const [searchedKeywords, setSearchedKeywords] = useState('');
    const [keywordsResults, setKeywordsResults] = useState(null);
    const [loadingScreen,setLoadingScreen] = useState(false);
    const [downloadScreen,setDownloadScreen] = useState(false);

    const [keywordsDocumentResults, setKeywordsDocumentResults] = useState(null);
    const [keywordsLayerResults, setKeywordsLayerResults] = useState(null);
    const [keywordsMapResults, setKeywordsMapResults] = useState(null);
    const [keywordSearchButton, setKeywordSearchButton] = useState(true);
    const [keywordSearchResults, setKeywordSearchResults] = useState(true);
    const [keywordCounterDocuments, setKeywordCounterDocuments] = useState(0);
    const [keywordCounterLayers, setKeywordCounterLayers] = useState(0);
    const [keywordCounterMaps, setKeywordCounterMaps] = useState(0);
    const [keywordLayerToMap, setKeywordLayerToMap] = useState([]);
    const [loadingKeywords, setLoadingKeywords] = useState(true);


    const [selectedCountries, setSelectedCountries] = useState(null);
    const [countriesDocumentResults, setCountriesDocumentResults] = useState(null);
    const [countriesLayerResults, setCountriesLayerResults] = useState(null);
    const [countriesMapResults, setCountriesMapResults] = useState(null);
    const [countriesCounterDocuments, setCountriesCounterDocuments] = useState(0);
    const [countriesCounterLayers, setCountriesCounterLayers] = useState(0);
    const [countriesCounterMaps, setCountriesCounterMaps] = useState(0);
    const [countriesSearchResults, setCountriesSearchResults] = useState(true);
    const [searchedCountries, setSearchedCountries] = useState('');
    const [countriesLayerToMap, setCountriesLayerToMap] = useState([]);
    const [loadingCountries, setLoadingCountries] = useState(true);


    const [selectedBoundingBox, setSelectedBoundingBox] = useState('');
    const [bboxDocumentResults, setBboxDocumentResults] = useState(null);
    const [bboxLayerResults, setBboxLayerResults] = useState(null);
    const [bboxMapResults, setBboxMapResults] = useState(null);
    const [bboxCounterDocuments, setBboxCounterDocuments] = useState(0);
    const [bboxCounterLayers, setBboxCounterLayers] = useState(0);
    const [bboxCounterMaps, setBboxCounterMaps] = useState(0);
    const [bboxSearchResults, setBboxSearchResults] = useState(true);
    const [searchedBbox, setSearchedBbox] = useState('');
    const [bboxLayerToMap, setBboxLayerToMap] = useState([]);
    const [loadingBbox, setLoadingBbox] = useState(true);


    const [countrySearchButton, setCountrySearchButton] = useState(true);
    const [bboxSearchButton, setBboxSearchButton] = useState(true);

    const [layersList, setLayersList] = useState([]);

    const [switchValue, setSwitchValue] = useState(false);
    const [fromStatus, setFromStatus] = useState(true);
    const [toStatus, setToStatus] = useState(true);
    const [fromKeywordDate, setFromKeywordDate] = useState(null);
    const [toKeywordDate, setToKeywordDate] = useState(null);

    const [switchCountryValue, setSwitchCountryValue] = useState(false);
    const [fromCountryStatus, setFromCountryStatus] = useState(true);
    const [toCountryStatus, setToCountryStatus] = useState(true);
    const [fromCountryDate, setFromCountryDate] = useState(null);
    const [toCountryDate, setToCountryDate] = useState(null);

    const [switchBboxValue, setSwitchBboxValue] = useState(false);
    const [fromBboxStatus, setFromBboxStatus] = useState(true);
    const [toBboxStatus, setToBboxStatus] = useState(true);
    const [fromBboxDate, setFromBboxDate] = useState(null);
    const [toBboxDate, setToBboxDate] = useState(null);


    const [countryList, setCountryList] = useState(null);
    const [foundLayers, setFoundLayers] = useState([]);


    const i18n = useTranslate();
    const { t } = i18n;


    const countries = [
        {name: 'Central Asia', code: 'CA'},
        {name: 'Afghanistan', code: 'AF'},
        {name: 'Kazakhstan', code: 'KZ'},
        {name: 'Kyrgyzstan', code: 'KG'},
        {name: 'Tajikistan', code: 'TJ'},
        {name: 'Turkmenistan', code: 'TM'},
        {name: 'Uzbekistan', code: 'UZ'},
        {name: 'Mongolia', code: 'MN'},
        {name: 'Other', code: 'OT'},
    ];

    const itemsVector = [
        {
            label: 'SHP',
            icon: 'fad fa-globe',
            command: (e) => {

                var layerName = '';
                var list = '';

                if(e.originalEvent.nativeEvent.path[5].classList[3] === undefined){
                    layerName =  e.originalEvent.nativeEvent.path[4].classList[3];
                    list = e.originalEvent.nativeEvent.path[4].classList[4];
                }else{
                    layerName = e.originalEvent.nativeEvent.path[5].classList[3];
                    list = e.originalEvent.nativeEvent.path[5].classList[4];
                }

                let layerToDownload = undefined;
                let mapToDownload = undefined;
                if(list === "keywords"){
                    layerToDownload = keywordsLayerResults.filter(
                        (item)=>{
                            if(item.name === layerName){
                                return item;
                            }
                        }
                    )
                }else if(list === "countries"){
                    layerToDownload = countriesLayerResults.filter(
                        (item)=>{
                            if(item.name === layerName){
                                return item;
                            }
                        }
                    )
                }else if(list === "bbox"){
                    layerToDownload = bboxLayerResults.filter(
                        (item)=>{
                            if(item.name === layerName){
                                return item;
                            }
                        }
                    )
                }else if(list === "keywordsmap"){
                    mapToDownload = keywordsMapResults.filter(
                        (item) =>{
                            if(item.name === layerName){
                                return item;
                            }
                        }
                    )
                }else if(list === "countriesmap"){
                    mapToDownload = countriesMapResults.filter(
                        (item) =>{
                            if(item.name === layerName){
                                return item;
                            }
                        }
                    )
                }else if(list === "bboxmap"){
                    mapToDownload = bboxMapResults.filter(
                        (item) =>{
                            if(item.name === layerName){
                                return item;
                            }
                        }
                    )
                }

                setDownloadScreen(true);
                if (layerToDownload !== undefined){
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
                            });
                }else if(mapToDownload !== undefined){
                    const cacipGeonode = new CacipGeonode();
                    cacipGeonode.fetchDataOGC(geoserverLocation,mapToDownload).then(
                        (layers)=>{
                            layers.forEach(
                                (item)=>{
                                    cacipGeonode.downloadData(geoserverLocation,item,"SHP")
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
                            )
                        }
                    )

                }

            }
        },
        {
            label: 'CSV',
            icon: 'fad fa-file-csv',
            command: (e) => {
                var layerName = '';
                var list = '';

                if(e.originalEvent.nativeEvent.path[5].classList[3] === undefined){
                    layerName =  e.originalEvent.nativeEvent.path[4].classList[3];
                    list = e.originalEvent.nativeEvent.path[4].classList[4];
                }else{
                    layerName = e.originalEvent.nativeEvent.path[5].classList[3];
                    list = e.originalEvent.nativeEvent.path[5].classList[4];
                }

                let layerToDownload = undefined;
                let mapToDownload = undefined;
                if(list === "keywords"){
                    layerToDownload = keywordsLayerResults.filter(
                        (item)=>{
                            if(item.name === layerName){
                                return item;
                            }
                        }
                    )
                }else if(list === "countries"){
                    layerToDownload = countriesLayerResults.filter(
                        (item)=>{
                            if(item.name === layerName){
                                return item;
                            }
                        }
                    )
                }else if(list === "bbox"){
                    layerToDownload = bboxLayerResults.filter(
                        (item)=>{
                            if(item.name === layerName){
                                return item;
                            }
                        }
                    )
                }else if(list === "keywordsmap"){
                    mapToDownload = keywordsMapResults.filter(
                        (item) =>{
                            if(item.name === layerName){
                                return item;
                            }
                        }
                    )
                }else if(list === "countriesmap"){
                    mapToDownload = countriesMapResults.filter(
                        (item) =>{
                            if(item.name === layerName){
                                return item;
                            }
                        }
                    )
                }else if(list === "bboxmap"){
                    mapToDownload = bboxMapResults.filter(
                        (item) =>{
                            if(item.name === layerName){
                                return item;
                            }
                        }
                    )
                }

                setDownloadScreen(true);
                if (layerToDownload !== undefined){
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
                }else if(mapToDownload !== undefined){
                    const cacipGeonode = new CacipGeonode();
                    cacipGeonode.fetchDataOGC(geoserverLocation,mapToDownload).then(
                        (layers)=>{
                            layers.forEach(
                                (item)=>{
                                    cacipGeonode.downloadData(geoserverLocation,item,"CSV")
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
                            )
                        }
                    )

                }
            }
        },
        {
            label: 'PNG',
            icon: 'fad fa-file-image',
            command: (e) => {

                var layerName = '';
                var list = '';

                if(e.originalEvent.nativeEvent.path[5].classList[3] === undefined){
                    layerName =  e.originalEvent.nativeEvent.path[4].classList[3];
                    list = e.originalEvent.nativeEvent.path[4].classList[4];
                }else{
                    layerName = e.originalEvent.nativeEvent.path[5].classList[3];
                    list = e.originalEvent.nativeEvent.path[5].classList[4];
                }

                let layerToDownload = undefined;
                let mapToDownload = undefined;
                if(list === "keywords"){
                    layerToDownload = keywordsLayerResults.filter(
                        (item)=>{
                            if(item.name === layerName){
                                return item;
                            }
                        }
                    )
                }else if(list === "countries"){
                    layerToDownload = countriesLayerResults.filter(
                        (item)=>{
                            if(item.name === layerName){
                                return item;
                            }
                        }
                    )
                }else if(list === "bbox"){
                    layerToDownload = bboxLayerResults.filter(
                        (item)=>{
                            if(item.name === layerName){
                                return item;
                            }
                        }
                    )
                }else if(list === "keywordsmap"){
                    mapToDownload = keywordsMapResults.filter(
                        (item) =>{
                            if(item.name === layerName){
                                return item;
                            }
                        }
                    )
                }else if(list === "countriesmap"){
                    mapToDownload = countriesMapResults.filter(
                        (item) =>{
                            if(item.name === layerName){
                                return item;
                            }
                        }
                    )
                }else if(list === "bboxmap"){
                    mapToDownload = bboxMapResults.filter(
                        (item) =>{
                            if(item.name === layerName){
                                return item;
                            }
                        }
                    )
                }
                setDownloadScreen(true);

                if (layerToDownload !== undefined){
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
                }else if(mapToDownload !== undefined){
                    const cacipGeonode = new CacipGeonode();
                    cacipGeonode.fetchDataOGC(geoserverLocation,mapToDownload).then(
                        (layers)=>{
                            layers.forEach(
                                (item)=>{
                                    cacipGeonode.downloadData(geoserverLocation,item,"PNG")
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
                            )
                        }
                    )

                }
            }
        },
        {
            label: 'JPG',
            icon: 'fad fa-file-image',
            command: (e) => {

                var layerName = '';
                var list = '';

                if(e.originalEvent.nativeEvent.path[5].classList[3] === undefined){
                    layerName =  e.originalEvent.nativeEvent.path[4].classList[3];
                    list = e.originalEvent.nativeEvent.path[4].classList[4];
                }else{
                    layerName = e.originalEvent.nativeEvent.path[5].classList[3];
                    list = e.originalEvent.nativeEvent.path[5].classList[4];
                }

                let layerToDownload = undefined;
                let mapToDownload = undefined;
                if(list === "keywords"){
                    layerToDownload = keywordsLayerResults.filter(
                        (item)=>{
                            if(item.name === layerName){
                                return item;
                            }
                        }
                    )
                }else if(list === "countries"){
                    layerToDownload = countriesLayerResults.filter(
                        (item)=>{
                            if(item.name === layerName){
                                return item;
                            }
                        }
                    )
                }else if(list === "bbox"){
                    layerToDownload = bboxLayerResults.filter(
                        (item)=>{
                            if(item.name === layerName){
                                return item;
                            }
                        }
                    )
                }else if(list === "keywordsmap"){
                    mapToDownload = keywordsMapResults.filter(
                        (item) =>{
                            if(item.name === layerName){
                                return item;
                            }
                        }
                    )
                }else if(list === "countriesmap"){
                    mapToDownload = countriesMapResults.filter(
                        (item) =>{
                            if(item.name === layerName){
                                return item;
                            }
                        }
                    )
                }else if(list === "bboxmap"){
                    mapToDownload = bboxMapResults.filter(
                        (item) =>{
                            if(item.name === layerName){
                                return item;
                            }
                        }
                    )
                }

                setDownloadScreen(true);
                if (layerToDownload !== undefined){
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
                }else if(mapToDownload !== undefined){
                    const cacipGeonode = new CacipGeonode();
                    cacipGeonode.fetchDataOGC(geoserverLocation,mapToDownload).then(
                        (layers)=>{
                            layers.forEach(
                                (item)=>{
                                    cacipGeonode.downloadData(geoserverLocation,item,"JPG")
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
                            )
                        }
                    )

                }
            }
        },
        {
            label: 'XLS',
            icon: 'fad fa-file-spreadsheet',
            command: (e) => {

                var layerName = '';
                var list = '';

                if(e.originalEvent.nativeEvent.path[5].classList[3] === undefined){
                    layerName =  e.originalEvent.nativeEvent.path[4].classList[3];
                    list = e.originalEvent.nativeEvent.path[4].classList[4];
                }else{
                    layerName = e.originalEvent.nativeEvent.path[5].classList[3];
                    list = e.originalEvent.nativeEvent.path[5].classList[4];
                }

                let layerToDownload = undefined;
                let mapToDownload = undefined;
                if(list === "keywords"){
                    layerToDownload = keywordsLayerResults.filter(
                        (item)=>{
                            if(item.name === layerName){
                                return item;
                            }
                        }
                    )
                }else if(list === "countries"){
                    layerToDownload = countriesLayerResults.filter(
                        (item)=>{
                            if(item.name === layerName){
                                return item;
                            }
                        }
                    )
                }else if(list === "bbox"){
                    layerToDownload = bboxLayerResults.filter(
                        (item)=>{
                            if(item.name === layerName){
                                return item;
                            }
                        }
                    )
                }else if(list === "keywordsmap"){
                    mapToDownload = keywordsMapResults.filter(
                        (item) =>{
                            if(item.name === layerName){
                                return item;
                            }
                        }
                    )
                }else if(list === "countriesmap"){
                    mapToDownload = countriesMapResults.filter(
                        (item) =>{
                            if(item.name === layerName){
                                return item;
                            }
                        }
                    )
                }else if(list === "bboxmap"){
                    mapToDownload = bboxMapResults.filter(
                        (item) =>{
                            if(item.name === layerName){
                                return item;
                            }
                        }
                    )
                }

                setDownloadScreen(true);
                if (layerToDownload !== undefined){
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
                }else if(mapToDownload !== undefined){
                    const cacipGeonode = new CacipGeonode();
                    cacipGeonode.fetchDataOGC(geoserverLocation,mapToDownload).then(
                        (layers)=>{
                            layers.forEach(
                                (item)=>{
                                    cacipGeonode.downloadData(geoserverLocation,item,"XLS")
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
                            )
                        }
                    )

                }
            }
        },
        {
            label: 'JSON',
            icon: 'fad fa-brackets-curly',
            command: (e) => {
                var layerName = '';
                var list = '';

                if(e.originalEvent.nativeEvent.path[5].classList[3] === undefined){
                    layerName =  e.originalEvent.nativeEvent.path[4].classList[3];
                    list = e.originalEvent.nativeEvent.path[4].classList[4];
                }else{
                    layerName = e.originalEvent.nativeEvent.path[5].classList[3];
                    list = e.originalEvent.nativeEvent.path[5].classList[4];
                }

                let layerToDownload = undefined;
                let mapToDownload = undefined;
                if(list === "keywords"){
                    layerToDownload = keywordsLayerResults.filter(
                        (item)=>{
                            if(item.name === layerName){
                                return item;
                            }
                        }
                    )
                }else if(list === "countries"){
                    layerToDownload = countriesLayerResults.filter(
                        (item)=>{
                            if(item.name === layerName){
                                return item;
                            }
                        }
                    )
                }else if(list === "bbox"){
                    layerToDownload = bboxLayerResults.filter(
                        (item)=>{
                            if(item.name === layerName){
                                return item;
                            }
                        }
                    )
                }else if(list === "keywordsmap"){
                    mapToDownload = keywordsMapResults.filter(
                        (item) =>{
                            if(item.name === layerName){
                                return item;
                            }
                        }
                    )
                }else if(list === "countriesmap"){
                    mapToDownload = countriesMapResults.filter(
                        (item) =>{
                            if(item.name === layerName){
                                return item;
                            }
                        }
                    )
                }else if(list === "bboxmap"){
                    mapToDownload = bboxMapResults.filter(
                        (item) =>{
                            if(item.name === layerName){
                                return item;
                            }
                        }
                    )
                }

                setDownloadScreen(true);
                if (layerToDownload !== undefined){
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
                }else if(mapToDownload !== undefined){
                    const cacipGeonode = new CacipGeonode();
                    cacipGeonode.fetchDataOGC(geoserverLocation,mapToDownload).then(
                        (layers)=>{
                            layers.forEach(
                                (item)=>{
                                    cacipGeonode.downloadData(geoserverLocation,item,"JSON")
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
                            )
                        }
                    )

                }
            }
        },
        {
            label: 'KML',
            icon: 'fad fa-vector-square',
            command: (e) => {

                var layerName = '';
                var list = '';

                if(e.originalEvent.nativeEvent.path[5].classList[3] === undefined){
                    layerName =  e.originalEvent.nativeEvent.path[4].classList[3];
                    list = e.originalEvent.nativeEvent.path[4].classList[4];
                }else{
                    layerName = e.originalEvent.nativeEvent.path[5].classList[3];
                    list = e.originalEvent.nativeEvent.path[5].classList[4];
                }

                let layerToDownload = undefined;
                let mapToDownload = undefined;
                if(list === "keywords"){
                    layerToDownload = keywordsLayerResults.filter(
                        (item)=>{
                            if(item.name === layerName){
                                return item;
                            }
                        }
                    )
                }else if(list === "countries"){
                    layerToDownload = countriesLayerResults.filter(
                        (item)=>{
                            if(item.name === layerName){
                                return item;
                            }
                        }
                    )
                }else if(list === "bbox"){
                    layerToDownload = bboxLayerResults.filter(
                        (item)=>{
                            if(item.name === layerName){
                                return item;
                            }
                        }
                    )
                }else if(list === "keywordsmap"){
                    mapToDownload = keywordsMapResults.filter(
                        (item) =>{
                            if(item.name === layerName){
                                return item;
                            }
                        }
                    )
                }else if(list === "countriesmap"){
                    mapToDownload = countriesMapResults.filter(
                        (item) =>{
                            if(item.name === layerName){
                                return item;
                            }
                        }
                    )
                }else if(list === "bboxmap"){
                    mapToDownload = bboxMapResults.filter(
                        (item) =>{
                            if(item.name === layerName){
                                return item;
                            }
                        }
                    )
                }

                setDownloadScreen(true);
                if (layerToDownload !== undefined){
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
                }else if(mapToDownload !== undefined){
                    const cacipGeonode = new CacipGeonode();
                    cacipGeonode.fetchDataOGC(geoserverLocation,mapToDownload).then(
                        (layers)=>{
                            layers.forEach(
                                (item)=>{
                                    cacipGeonode.downloadData(geoserverLocation,item,"KML")
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
                            )
                        }
                    )

                }
            }
        },
        {
            label: 'GML',
            icon: 'fad fa-file-code',
            command: (e) => {

                var layerName = '';
                var list = '';

                if(e.originalEvent.nativeEvent.path[5].classList[3] === undefined){
                    layerName =  e.originalEvent.nativeEvent.path[4].classList[3];
                    list = e.originalEvent.nativeEvent.path[4].classList[4];
                }else{
                    layerName = e.originalEvent.nativeEvent.path[5].classList[3];
                    list = e.originalEvent.nativeEvent.path[5].classList[4];
                }

                let layerToDownload = undefined;
                let mapToDownload = undefined;
                if(list === "keywords"){
                    layerToDownload = keywordsLayerResults.filter(
                        (item)=>{
                            if(item.name === layerName){
                                return item;
                            }
                        }
                    )
                }else if(list === "countries"){
                    layerToDownload = countriesLayerResults.filter(
                        (item)=>{
                            if(item.name === layerName){
                                return item;
                            }
                        }
                    )
                }else if(list === "bbox"){
                    layerToDownload = bboxLayerResults.filter(
                        (item)=>{
                            if(item.name === layerName){
                                return item;
                            }
                        }
                    )
                }else if(list === "keywordsmap"){
                    mapToDownload = keywordsMapResults.filter(
                        (item) =>{
                            if(item.name === layerName){
                                return item;
                            }
                        }
                    )
                }else if(list === "countriesmap"){
                    mapToDownload = countriesMapResults.filter(
                        (item) =>{
                            if(item.name === layerName){
                                return item;
                            }
                        }
                    )
                }else if(list === "bboxmap"){
                    mapToDownload = bboxMapResults.filter(
                        (item) =>{
                            if(item.name === layerName){
                                return item;
                            }
                        }
                    )
                }

                setDownloadScreen(true);
                if (layerToDownload !== undefined){
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
                }else if(mapToDownload !== undefined){
                    const cacipGeonode = new CacipGeonode();
                    cacipGeonode.fetchDataOGC(geoserverLocation,mapToDownload).then(
                        (layers)=>{
                            layers.forEach(
                                (item)=>{
                                    cacipGeonode.downloadData(geoserverLocation,item,"GMLV")
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
                            )
                        }
                    )

                }
            }
        },
        {
            label: 'PDF',
            icon: 'fad fa-file-pdf',
            command: (e) => {

                var layerName = '';
                var list = '';

                if(e.originalEvent.nativeEvent.path[5].classList[3] === undefined){
                    layerName =  e.originalEvent.nativeEvent.path[4].classList[3];
                    list = e.originalEvent.nativeEvent.path[4].classList[4];
                }else{
                    layerName = e.originalEvent.nativeEvent.path[5].classList[3];
                    list = e.originalEvent.nativeEvent.path[5].classList[4];
                }

                let layerToDownload = undefined;
                let mapToDownload = undefined;
                if(list === "keywords"){
                    layerToDownload = keywordsLayerResults.filter(
                        (item)=>{
                            if(item.name === layerName){
                                return item;
                            }
                        }
                    )
                }else if(list === "countries"){
                    layerToDownload = countriesLayerResults.filter(
                        (item)=>{
                            if(item.name === layerName){
                                return item;
                            }
                        }
                    )
                }else if(list === "bbox"){
                    layerToDownload = bboxLayerResults.filter(
                        (item)=>{
                            if(item.name === layerName){
                                return item;
                            }
                        }
                    )
                }else if(list === "keywordsmap"){
                    mapToDownload = keywordsMapResults.filter(
                        (item) =>{
                            if(item.name === layerName){
                                return item;
                            }
                        }
                    )
                }else if(list === "countriesmap"){
                    mapToDownload = countriesMapResults.filter(
                        (item) =>{
                            if(item.name === layerName){
                                return item;
                            }
                        }
                    )
                }else if(list === "bboxmap"){
                    mapToDownload = bboxMapResults.filter(
                        (item) =>{
                            if(item.name === layerName){
                                return item;
                            }
                        }
                    )
                }


                setDownloadScreen(true);
                if (layerToDownload !== undefined){
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
                }else if(mapToDownload !== undefined){
                    const cacipGeonode = new CacipGeonode();
                    cacipGeonode.fetchDataOGC(geoserverLocation,mapToDownload).then(
                        (layers)=>{
                            layers.forEach(
                                (item)=>{
                                    cacipGeonode.downloadData(geoserverLocation,item,"PDF")
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
                            )
                        }
                    )

                }
            }
        }
    ];

    const itemsRaster = [
        {
            label: 'PNG',
            icon: 'fad fa-file-image',
            command: (e) => {

                var layerName = '';
                var list = '';

                if(e.originalEvent.nativeEvent.path[5].classList[3] === undefined){
                    layerName =  e.originalEvent.nativeEvent.path[4].classList[3];
                    list = e.originalEvent.nativeEvent.path[4].classList[4];
                }else{
                    layerName = e.originalEvent.nativeEvent.path[5].classList[3];
                    list = e.originalEvent.nativeEvent.path[5].classList[4];
                }

                let layerToDownload = undefined;
                let mapToDownload = undefined;
                if(list === "keywords"){
                    layerToDownload = keywordsLayerResults.filter(
                        (item)=>{
                            if(item.name === layerName){
                                return item;
                            }
                        }
                    )
                }else if(list === "countries"){
                    layerToDownload = countriesLayerResults.filter(
                        (item)=>{
                            if(item.name === layerName){
                                return item;
                            }
                        }
                    )
                }else if(list === "bbox"){
                    layerToDownload = bboxLayerResults.filter(
                        (item)=>{
                            if(item.name === layerName){
                                return item;
                            }
                        }
                    )
                }else if(list === "keywordsmap"){
                    mapToDownload = keywordsMapResults.filter(
                        (item) =>{
                            if(item.name === layerName){
                                return item;
                            }
                        }
                    )
                }else if(list === "countriesmap"){
                    mapToDownload = countriesMapResults.filter(
                        (item) =>{
                            if(item.name === layerName){
                                return item;
                            }
                        }
                    )
                }else if(list === "bboxmap"){
                    mapToDownload = bboxMapResults.filter(
                        (item) =>{
                            if(item.name === layerName){
                                return item;
                            }
                        }
                    )
                }

                setDownloadScreen(true);

                if (layerToDownload !== undefined){
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
                }else if(mapToDownload !== undefined){
                    const cacipGeonode = new CacipGeonode();
                    cacipGeonode.fetchDataOGC(geoserverLocation,mapToDownload).then(
                        (layers)=>{
                            layers.forEach(
                                (item)=>{
                                    cacipGeonode.downloadData(geoserverLocation,item,"PNG")
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
                            )
                        }
                    )

                }



            }
        },
        {
            label: 'JPG',
            icon: 'fad fa-file-image',
            command: (e) => {

                var layerName = '';
                var list = '';

                if(e.originalEvent.nativeEvent.path[5].classList[3] === undefined){
                    layerName =  e.originalEvent.nativeEvent.path[4].classList[3];
                    list = e.originalEvent.nativeEvent.path[4].classList[4];
                }else{
                    layerName = e.originalEvent.nativeEvent.path[5].classList[3];
                    list = e.originalEvent.nativeEvent.path[5].classList[4];
                }

                let layerToDownload = undefined;
                let mapToDownload = undefined;
                if(list === "keywords"){
                    layerToDownload = keywordsLayerResults.filter(
                        (item)=>{
                            if(item.name === layerName){
                                return item;
                            }
                        }
                    )
                }else if(list === "countries"){
                    layerToDownload = countriesLayerResults.filter(
                        (item)=>{
                            if(item.name === layerName){
                                return item;
                            }
                        }
                    )
                }else if(list === "bbox"){
                    layerToDownload = bboxLayerResults.filter(
                        (item)=>{
                            if(item.name === layerName){
                                return item;
                            }
                        }
                    )
                }else if(list === "keywordsmap"){
                    mapToDownload = keywordsMapResults.filter(
                        (item) =>{
                            if(item.name === layerName){
                                return item;
                            }
                        }
                    )
                }else if(list === "countriesmap"){
                    mapToDownload = countriesMapResults.filter(
                        (item) =>{
                            if(item.name === layerName){
                                return item;
                            }
                        }
                    )
                }else if(list === "bboxmap"){
                    mapToDownload = bboxMapResults.filter(
                        (item) =>{
                            if(item.name === layerName){
                                return item;
                            }
                        }
                    )
                }

                setDownloadScreen(true);
                if (layerToDownload !== undefined){
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
                }else if(mapToDownload !== undefined){
                    const cacipGeonode = new CacipGeonode();
                    cacipGeonode.fetchDataOGC(geoserverLocation,mapToDownload).then(
                        (layers)=>{
                            layers.forEach(
                                (item)=>{
                                    cacipGeonode.downloadData(geoserverLocation,item,"JPG")
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
                            )
                        }
                    )

                }
            }
        },
        {
            label: 'PDF',
            icon: 'fad fa-file-pdf',
            command: (e) => {

                var layerName = '';
                var list = '';

                if(e.originalEvent.nativeEvent.path[5].classList[3] === undefined){
                    layerName =  e.originalEvent.nativeEvent.path[4].classList[3];
                    list = e.originalEvent.nativeEvent.path[4].classList[4];
                }else{
                    layerName = e.originalEvent.nativeEvent.path[5].classList[3];
                    list = e.originalEvent.nativeEvent.path[5].classList[4];
                }

                let layerToDownload = undefined;
                let mapToDownload = undefined;
                if(list === "keywords"){
                    layerToDownload = keywordsLayerResults.filter(
                        (item)=>{
                            if(item.name === layerName){
                                return item;
                            }
                        }
                    )
                }else if(list === "countries"){
                    layerToDownload = countriesLayerResults.filter(
                        (item)=>{
                            if(item.name === layerName){
                                return item;
                            }
                        }
                    )
                }else if(list === "bbox"){
                    layerToDownload = bboxLayerResults.filter(
                        (item)=>{
                            if(item.name === layerName){
                                return item;
                            }
                        }
                    )
                }else if(list === "keywordsmap"){
                    mapToDownload = keywordsMapResults.filter(
                        (item) =>{
                            if(item.name === layerName){
                                return item;
                            }
                        }
                    )
                }else if(list === "countriesmap"){
                    mapToDownload = countriesMapResults.filter(
                        (item) =>{
                            if(item.name === layerName){
                                return item;
                            }
                        }
                    )
                }else if(list === "bboxmap"){
                    mapToDownload = bboxMapResults.filter(
                        (item) =>{
                            if(item.name === layerName){
                                return item;
                            }
                        }
                    )
                }


                setDownloadScreen(true);
                if (layerToDownload !== undefined){
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
                }else if(mapToDownload !== undefined){
                    const cacipGeonode = new CacipGeonode();
                    cacipGeonode.fetchDataOGC(geoserverLocation,mapToDownload).then(
                        (layers)=>{
                            layers.forEach(
                                (item)=>{
                                    cacipGeonode.downloadData(geoserverLocation,item,"PDF")
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
                            )
                        }
                    )

                }
            }
        },
        {
            label: 'GeoTIFF',
            icon: 'fad fa-file-pdf',
            command: (e) => {

                var layerName = '';
                var list = '';

                if(e.originalEvent.nativeEvent.path[5].classList[3] === undefined){
                    layerName =  e.originalEvent.nativeEvent.path[4].classList[3];
                    list = e.originalEvent.nativeEvent.path[4].classList[4];
                }else{
                    layerName = e.originalEvent.nativeEvent.path[5].classList[3];
                    list = e.originalEvent.nativeEvent.path[5].classList[4];
                }

                let layerToDownload = undefined;
                let mapToDownload = undefined;
                if(list === "keywords"){
                    layerToDownload = keywordsLayerResults.filter(
                        (item)=>{
                            if(item.name === layerName){
                                return item;
                            }
                        }
                    )
                }else if(list === "countries"){
                    layerToDownload = countriesLayerResults.filter(
                        (item)=>{
                            if(item.name === layerName){
                                return item;
                            }
                        }
                    )
                }else if(list === "bbox"){
                    layerToDownload = bboxLayerResults.filter(
                        (item)=>{
                            if(item.name === layerName){
                                return item;
                            }
                        }
                    )
                }else if(list === "keywordsmap"){
                    mapToDownload = keywordsMapResults.filter(
                        (item) =>{
                            if(item.name === layerName){
                                return item;
                            }
                        }
                    )
                }else if(list === "countriesmap"){
                    mapToDownload = countriesMapResults.filter(
                        (item) =>{
                            if(item.name === layerName){
                                return item;
                            }
                        }
                    )
                }else if(list === "bboxmap"){
                    mapToDownload = bboxMapResults.filter(
                        (item) =>{
                            if(item.name === layerName){
                                return item;
                            }
                        }
                    )
                }

                setDownloadScreen(true);
                if (layerToDownload !== undefined){
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
                }else if(mapToDownload !== undefined){
                    const cacipGeonode = new CacipGeonode();
                    cacipGeonode.fetchDataOGC(geoserverLocation,mapToDownload).then(
                        (layers)=>{
                            layers.forEach(
                                (item)=>{
                                    cacipGeonode.downloadData(geoserverLocation,item,"GEOTIFFR")
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
                            )
                        }
                    )

                }
            }
        }
    ];

    const panelFooterTemplate = () => {
        const length = selectedCountries ? selectedCountries.length : 0;
        return (
            <div className="p-py-2 p-px-3">
                <b>{length}</b> item{length > 1 ? 's' : ''} selected.
            </div>
        );
    }

    const countryTemplate = (option) => {
        return (
            <div className="country-item">
                <div>{option.name}</div>
            </div>
        );
    }

    const removeChip = (e,name) =>{
        const newSelectedCountries = selectedCountries.filter(
            (item)=>{
                return item.name!== name
            }
        )
        setSelectedCountries(newSelectedCountries);
    }

    const selectedCountriesTemplate = (option) => {
        if (option) {
            return (
                <div className="country-item country-item-value">
                    <div className="p-multiselect-token">
                        <span className="p-multiselect-token-label p-mr-1">{option.name}</span>
                        <span className="p-multiselect-token-icon fad fa-times-circle" onClick={(e)=>removeChip(e,option.name)}></span>
                    </div>

                </div>
            );
        }

        return t(`Application.selectCountries`);
    }

    const setBBox = (bbox) =>{
        setSelectedBoundingBox(JSON.stringify(bbox));
        setBboxSearchButton(false);
    }

    const enableKeywordSearch = (e) =>{

        if(e.target.value.length>2){
            setKeywordSearchButton(false);
        }else {
            setKeywordSearchButton(true);
        }

        setKeywords(e.target.value)

    }

    const enableCountrySearch = (e) =>{
        if(e.value.length>0){
            setCountrySearchButton(false);
        }else{
            setCountrySearchButton(true);
        }
        setSelectedCountries(e.value);
    }

    const enableBBoxSearch = (event) =>{

        if(event.target.value.length>0){
            setBboxSearchButton(false);
        }else{
            setBboxSearchButton(true);
        }

        setSelectedBoundingBox(event.target.value);

    }

    const searchByKeyword = () =>{
        setLoadingScreen(true);

        if((fromKeywordDate !== null)
        &&(toKeywordDate !== null)
            &&(switchValue === true))
        {
            const cg = new CacipGeonode();
            cg.queryGeonodeKeywordsDate(keywords,fromKeywordDate,toKeywordDate).then(
                (result) =>{
                    let counterDocuments = 0;
                    let counterLayers = 0;
                    let counterMaps = 0;

                    let allResults = [];
                    Promise.all(result).then(
                        (allresources) =>{
                            allresources.forEach(
                                (item,index) =>{

                                    if(index === 0){
                                        allResults = item;
                                    }else{
                                        allResults = allResults.concat(item);
                                    }
                                }
                            )
                            Promise.all(allResults).then(
                                (full)=>{
                                    const documents = full.filter(
                                        (item)=>{
                                            if(item.dataType === "document"){
                                                counterDocuments = counterDocuments + 1;
                                            }
                                            return item.dataType === "document";
                                        }
                                    )

                                    const layers = full.filter(
                                        (item)=>{
                                            if(item.dataType === "layer"){
                                                counterLayers = counterLayers + 1;
                                            }
                                            return item.dataType === "layer";
                                        }
                                    )

                                    const maps = full.filter(
                                        (item)=>{
                                            if(item.dataType === "map"){
                                                counterMaps = counterMaps + 1;
                                            }
                                            return item.dataType === "map";
                                        }
                                    )

                                    setKeywordsLayerResults(layers);
                                    setKeywordsMapResults(maps);
                                    setKeywordsDocumentResults(documents);

                                    setKeywordCounterDocuments(counterDocuments);
                                    setKeywordCounterLayers(counterLayers);
                                    setKeywordCounterMaps(counterMaps);

                                    setSearchedKeywords(keywords);

                                    setKeywordSearchResults(false);
                                    setLoadingKeywords(false);
                                    setLoadingScreen(false);
                                }
                            )

                        }
                    )
                }
            )

        }else{
            const cg = new CacipGeonode();
            cg.queryGeonodeKeywords(keywords).then(
                (result)=>{
                    let counterDocuments = 0;
                    let counterLayers = 0;
                    let counterMaps = 0;

                    let allResults = [];
                    Promise.all(result).then(
                        (allresources) =>{
                            allresources.forEach(
                                (item,index) =>{
                                    if(index === 0){
                                        allResults = item;
                                    }
                                }
                            )
                            Promise.all(allResults).then(
                                (full)=>{
                                    const documents = full.filter(
                                        (item)=>{
                                            if(item.dataType === "document"){
                                                counterDocuments = counterDocuments + 1;
                                            }
                                            return item.dataType === "document";

                                        }
                                    )

                                    const layers = full.filter(
                                        (item)=>{
                                            if(item.dataType === "layer"){
                                                counterLayers = counterLayers + 1;
                                            }

                                            return item.dataType === "layer";
                                        }
                                    )

                                    const maps = full.filter(
                                        (item)=>{
                                            if(item.dataType === "map"){
                                                counterMaps = counterMaps + 1;
                                            }

                                            return item.dataType === "map";
                                        }
                                    )

                                    setKeywordsDocumentResults(documents);
                                    setKeywordCounterDocuments(counterDocuments);
                                    setKeywordsLayerResults(layers);
                                    setKeywordsMapResults(maps);
                                    setKeywordCounterLayers(counterLayers);
                                    setKeywordCounterMaps(counterMaps);

                                    setSearchedKeywords(keywords);

                                    setKeywordSearchResults(false);
                                    setLoadingKeywords(false);
                                    setLoadingScreen(false);

                                }
                            )

                        }
                    )
                }
            )
        }
    }

    const searchByCountry = () =>{
        setLoadingScreen(true);

        if((fromCountryDate !== null)
            &&(toCountryDate !== null)
            &&(switchCountryValue === true)
        ){
            const cg = new CacipGeonode();
            cg.queryGeonodeCountryDate(selectedCountries,fromCountryDate,toCountryDate).then(
                (results)=>{
                    let counterDocuments = 0;
                    let counterLayers = 0;
                    let counterMaps = 0;

                    let allResults = [];
                    Promise.all(results).then(
                        (allresources) =>{

                            allresources.forEach(
                                (item,index) =>{

                                    if(index === 0){
                                        allResults = item;
                                    }else{
                                        allResults = allResults.concat(item);
                                    }
                                }
                            )

                            Promise.all(allResults).then(
                                (full) =>{
                                    const documents = full.filter(
                                        (item)=>{
                                            if(item.dataType === "document"){
                                                counterDocuments = counterDocuments + 1;
                                            }
                                            return item.dataType === "document";
                                        }
                                    )

                                    const layers = full.filter(
                                        (item)=>{
                                            if(item.dataType === "layer"){
                                                counterLayers = counterLayers + 1;
                                            }
                                            return item.dataType === "layer";
                                        }
                                    )

                                    const maps = full.filter(
                                        (item)=>{
                                            if(item.dataType === "map"){
                                                counterMaps = counterMaps + 1;
                                            }
                                            return item.dataType === "map";
                                        }
                                    )


                                    setCountriesDocumentResults(documents);
                                    setCountriesLayerResults(layers);
                                    setCountriesMapResults(maps);

                                    setCountriesCounterDocuments(counterDocuments);
                                    setCountriesCounterLayers(counterLayers);
                                    setCountriesCounterMaps(counterMaps);

                                    let stringCountries = selectedCountries.map(
                                        (item)=>{
                                            return item['name'];
                                        }
                                    );

                                    setSearchedCountries(stringCountries.join());
                                    setCountriesSearchResults(false);
                                    setLoadingCountries(false);
                                    setLoadingScreen(false);
                                }
                            )
                        }
                    )
                }
            )
        }else {
            const cg = new CacipGeonode();
            cg.queryGeonodeCountry(selectedCountries).then(
                (results) => {

                    let counterDocuments = 0;
                    let counterLayers = 0;
                    let counterMaps = 0;

                    let allResults = [];
                    Promise.all(results).then(
                        (allresources) => {
                            allresources.forEach(
                                (item, index) => {
                                    if (index === 0) {
                                        allResults = item;
                                    } else {
                                        console.log(allResults)
                                        allResults = allResults.concat(item);
                                    }
                                }
                            )

                            Promise.all(allResults).then(
                                (full) => {
                                    const documents = full.filter(
                                        (item) => {
                                            if (item.dataType === "document") {
                                                counterDocuments = counterDocuments + 1;
                                            }
                                            return item.dataType === "document";
                                        }
                                    )

                                    const layers = full.filter(
                                        (item) => {
                                            if (item.dataType === "layer") {
                                                counterLayers = counterLayers + 1;
                                            }
                                            return item.dataType === "layer";
                                        }
                                    )

                                    const maps = full.filter(
                                        (item) => {
                                            if (item.dataType === "map") {
                                                counterMaps = counterMaps + 1;
                                            }
                                            return item.dataType === "map";
                                        }
                                    )


                                    setCountriesDocumentResults(documents);
                                    setCountriesLayerResults(layers);
                                    setCountriesMapResults(maps);

                                    setCountriesCounterDocuments(counterDocuments);
                                    setCountriesCounterLayers(counterLayers);
                                    setCountriesCounterMaps(counterMaps);

                                    let stringCountries = selectedCountries.map(
                                        (item) => {
                                            return item['name'];
                                        }
                                    );

                                    setSearchedCountries(stringCountries.join());
                                    setCountriesSearchResults(false);
                                    setLoadingCountries(false);
                                    setLoadingScreen(false);

                                }
                            )

                        }
                    )
                }
            )
        }
    }

    const searchByBoundingBox = () =>{
        setLoadingScreen(true);

        if((fromBboxDate !== null)
            &&(toBboxDate !== null)
            &&(switchBboxValue === true)
        ){

            const cg = new CacipGeonode();
            cg.queryGeonodeBBoxDate(selectedBoundingBox,fromBboxDate,toBboxDate).then(

                (results) => {
                    let counterDocuments = 0;
                    let counterLayers = 0;
                    let counterMaps = 0;

                    let allResults = [];
                    Promise.all(results).then(
                        (allresources) => {
                            allresources.forEach(
                                (item, index) => {
                                    if (index === 0) {
                                        allResults = item;
                                    } else {
                                        allResults = allResults.concat(item);
                                    }
                                }
                            )

                            Promise.all(allResults).then(
                                (full) => {
                                    const documents = full.filter(
                                        (item)=>{
                                            if(item.dataType === "document"){
                                                counterDocuments = counterDocuments + 1;
                                            }
                                            return item.dataType === "document";
                                        }
                                    )

                                    const layers = full.filter(
                                        (item)=>{
                                            if(item.dataType === "layer"){
                                                counterLayers = counterLayers + 1;
                                            }
                                            return item.dataType === "layer";
                                        }
                                    )

                                    const maps = full.filter(
                                        (item)=>{
                                            if(item.dataType === "map"){
                                                counterMaps = counterMaps + 1;
                                            }
                                            return item.dataType === "map";
                                        }
                                    )

                                    setBboxDocumentResults(documents);
                                    setBboxLayerResults(layers);
                                    setBboxMapResults(maps);

                                    setBboxCounterDocuments(counterDocuments);
                                    setBboxCounterLayers(counterLayers);
                                    setBboxCounterMaps(counterMaps);

                                    let selectedBBox = JSON.parse(selectedBoundingBox);
                                    setSearchedBbox(selectedBBox.bbox.join());

                                    setBboxSearchResults(false);
                                    setLoadingBbox(false);
                                    setLoadingScreen(false);

                                }
                            )

                        }
                    )
                }
            )

        }else {
            const cg = new CacipGeonode();
            cg.queryGeonodeBBox(selectedBoundingBox).then(
                (results) => {
                    let counterDocuments = 0;
                    let counterLayers = 0;
                    let counterMaps = 0;

                    let allResults = [];
                    Promise.all(results).then(
                        (allresources) => {

                            allresources.forEach(
                                (item, index) => {
                                    if (index === 0) {
                                        allResults = item;
                                    } else {
                                        allResults = allResults.concat(item);
                                    }
                                }
                            )

                            Promise.all(allResults).then(
                                (full) => {
                                    const documents = full.filter(
                                        (item)=>{
                                            if(item.dataType === "document"){
                                                counterDocuments = counterDocuments + 1;
                                            }
                                            return item.dataType === "document";
                                        }
                                    )

                                    const layers = full.filter(
                                        (item)=>{
                                            if(item.dataType === "layer"){
                                                counterLayers = counterLayers + 1;
                                            }
                                            return item.dataType === "layer";
                                        }
                                    )

                                    const maps = full.filter(
                                        (item)=>{
                                            if(item.dataType === "map"){
                                                counterMaps = counterMaps + 1;
                                            }
                                            return item.dataType === "map";
                                        }
                                    )

                                    setBboxDocumentResults(documents);
                                    setBboxLayerResults(layers);
                                    setBboxMapResults(maps)

                                    setBboxCounterDocuments(counterDocuments);
                                    setBboxCounterLayers(counterLayers);
                                    setBboxCounterMaps(counterMaps);

                                    let selectedBBox = JSON.parse(selectedBoundingBox);
                                    setSearchedBbox(selectedBBox.bbox.join());

                                    setBboxSearchResults(false);
                                    setLoadingBbox(false);
                                    setLoadingScreen(false);

                                }
                            )
                        }
                    )
                }
            )
        }

    }

    const titleTemplate = (data, props) => {
        return (
            <>
                <span className="p-column-title">{props.header}</span>
                <a href={data.url} target="_blank">{data[props.field]}</a>
            </>
        );
    };

    const bodyTemplate = (data, props) => {
        return (
            <>
                <span className="p-column-title">{props.header}</span>
                {data[props.field]}
            </>
        );
    };

    const abstractBodyTemplate = (data) => {

        let abstractText = data.abstract;

        if(abstractText.length>200){
            abstractText = abstractText.substr(0,200)+"...";
        }
        return (
            <>
                <span className="p-column-title">Abstract</span>
                <span><a href={data.url} target="_blank">{abstractText}</a></span>
            </>
        );
    };

    const headerRowGroup = (data) => {
        return (
            <>
                <img alt={data.dataType} />
                <span style={{ marginLeft: '.5em', verticalAlign: 'middle' }} className="image-text">{data.dataType}</span>
            </>
        );
    };

    const footerRowGroup = (data) => {
        return (
            <>
                <td colSpan="4" style={{ textAlign: 'right' }}><strong>Total {data.dataType}:</strong></td>
                <td><strong>{calculateCustomerTotal(data.dataType)}</strong></td>
            </>
        )
    };

    const calculateCustomerTotal = (dataType) => {
        let total = 0;

        if (keywordsResults) {
            for (let result of keywordsResults) {
                if (result.dataType === dataType) {
                    total++;
                }
            }
        }

        return total;
    }

    const addLayerToList = (e,data) =>{
        setLoadingScreen(true)
        setLayersList(data)

        const cacipGeonode = new CacipGeonode();
        cacipGeonode.fetchDataOGC(geoserverLocation,[data]).then(
            (res)=>{
                if(res.length === 1){
                    props.gList(res[0])
                    setLoadingScreen(false)
                }else{
                    props.gList(res)
                    setLoadingScreen(false)
                }

            }
        )

    }

    const removeFromMap = (e,data) =>{
        setLayersList(data)
    }

    const sendList = (listType)=>{
        if(listType === "keywords"){
            const layerIds = keywordsLayerResults.filter(
                (item)=>{
                    return item.disabled === true
                }
            )
            const cacipGeonode = new CacipGeonode();
            cacipGeonode.fetchDataOGC(geoserverLocation,layerIds).then(
                (res)=>{
                    props.layersList(res);
                }
            )
        }else if(listType === "country"){
            const layerIds = countriesLayerResults.filter(
                (item)=>{
                    return item.disabled === true
                }
            )

            const cacipGeonode = new CacipGeonode();
            cacipGeonode.fetchDataOGC(geoserverLocation,layerIds).then(
                (res)=>{
                    props.layersList(res);
                }
            )
        }else if(listType === "bbox"){
            const layerIds = bboxLayerResults.filter(
                (item)=>{
                    return item.disabled === true
                }
            )
            const cacipGeonode = new CacipGeonode();
            cacipGeonode.fetchDataOGC(geoserverLocation,layerIds).then(
                (res)=>{
                    props.layersList(res);
                }
            )
        }
    }

    const addLayerButton = (data,props) => {

        var items = "";
        if(data.mapType==="RASTER"){
            items = itemsRaster;
        }else if(data.mapType==="VECTOR"){
            items = itemsVector;
        }

        return (
            <div className="p-col-12">
                <div>
                    <Button
                        tooltip={t(`Application.selectLayer`)}
                        icon="fad fa-layer-plus"
                        onClick={
                            (e)=>{
                                if(data.searchType==="keywords"){
                                    let tempLayers = [...keywordsLayerResults];
                                    data.disabled = !data.disabled;
                                    tempLayers[data.index] = data;
                                    setKeywordsLayerResults(keywordsLayerResults);
                                }else if(data.searchType==="country"){
                                    let tempLayers = [...countriesLayerResults];
                                    data.disabled = !data.disabled;
                                    tempLayers[data.index] = data;
                                    setCountriesLayerToMap(countriesLayerResults);
                                }else if(data.searchType==="bbox"){
                                    let tempLayers = [...bboxLayerResults];
                                    data.disabled = !data.disabled;
                                    tempLayers[data.index] = data;
                                    setBboxLayerToMap(bboxLayerResults);
                                }
                                addLayerToList(e,data);
                            }}
                        >
                    </Button>
                </div>
                <div className="p-mt-2">
                    <Button
                        tooltip={t(`Application.removeFromSelection`)}
                        icon="fad fa-layer-minus"
                        className="p-button-danger"
                        onClick={
                            (e)=>{
                                if(data.searchType==="keywords"){
                                    let tempLayers = [...keywordsLayerResults];
                                    data.disabled = !data.disabled;
                                    tempLayers[data.index] = data;
                                    setKeywordsLayerResults([...keywordsLayerResults]);
                                }else if(data.searchType==="country"){
                                    let tempLayers = [...countriesLayerResults];
                                    data.disabled = !data.disabled;
                                    tempLayers[data.index] = data;
                                    setCountriesLayerToMap([...countriesLayerResults]);
                                }else if(data.searchType==="bbox"){
                                    let tempLayers = [...bboxLayerResults];
                                    data.disabled = !data.disabled;
                                    tempLayers[data.index] = data;
                                    bboxLayerToMap([...bboxLayerResults]);
                                }
                                removeFromMap(e,data);
                            }}
                    >
                    </Button>
                </div>
                <div className="p-mt-2">
                    <SplitButton
                        tooltip={t(`Application.clickToProceed`)}
                        icon="fad fa-download"
                        className={"p-button-secondary "+data.name + " "+props.field}
                        model={items}
                        >
                    </SplitButton>
                </div>
            </div>
        );
    };

    const imageBodyTemplate = (data) => {
        if(data.dataType === "map"){
            data.thumbnailUrl = data.thumbnailUrl.replace("https://centralasiaclimateportal.org/","https://geonode.centralasiaclimateportal.org/")
        }

        return (
            <>
                <span className="p-column-title">{t(`Application.image`)}</span>
                <img src={data.thumbnailUrl} alt={data.title} className="product-image" />
            </>
        );
    };

    const onHide = () => {

    }

    useEffect(() => {
        var countryItems = [];

        for (var property in continents.continents) {
            if (Object.prototype.hasOwnProperty.call(continents.continents, property)) {
                countryItems.push(
                    {name:continents.continents[property],code:property}
                )
            }
        }

       for (var property in continents.countries) {
            if (Object.prototype.hasOwnProperty.call(continents.countries, property)) {
                countryItems.push({
                    name:continents.countries[property].name,
                    code:property
                });
            }
        }
        setCountryList(countryItems);
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

    return (
        <div>
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
            <div>
                <Fieldset legend={t(`Application.byKeyword`)} toggleable>
                    <div className="p-col-12">
                        <div className="p-inputgroup">
                            <InputText
                                id="keywords"
                                placeholder={t(`Application.keyword`)}
                                value={keywords}
                                onChange={(e) => enableKeywordSearch(e)}
                            />
                            <Button
                                label={t(`Application.search`)}
                                className="p-button-raised"
                                icon="fad fa-search-location"
                                disabled={keywordSearchButton}
                                onClick={searchByKeyword}
                            />
                        </div>
                        <div className="p-mt-4">
                            <div className="p-grid
                            p-align-center vertical-container">
                                <div className="p-col-4 p-mt-2">
                                    <div className="p-grid p-align-center vertical-container">
                                        <span className="p-ml-3 p-mr-2">{t(`Application.filterByDate`)+": "}</span>
                                        <InputSwitch checked={switchValue}
                                                     onChange={
                                                         (e) => {
                                                             setSwitchValue(e.value);
                                                             setFromStatus(!fromStatus)
                                                             setToStatus(!toStatus)
                                                         }

                                                     }
                                        />
                                    </div>
                                </div>
                                <div className="p-col-4" hidden={fromStatus}>
                                    <label htmlFor="from" >{t(`Application.from`)+": "}</label>
                                    <Calendar id="from"
                                              value={fromKeywordDate}
                                              onChange={(e) => setFromKeywordDate(e.value)}
                                              showIcon
                                              disabled={fromStatus}
                                              dateFormat="yy/mm/dd"
                                              monthNavigator
                                              yearNavigator
                                              yearRange="1970:2030"
                                    />
                                </div>
                                <div className="p-col-4" hidden={fromStatus}>
                                    <label htmlFor="to">{t(`Application.to`)+": "}</label>
                                    <Calendar id="to"
                                              value={toKeywordDate}
                                              onChange={(e) => setToKeywordDate(e.value)}
                                              showIcon
                                              disabled={toStatus}
                                              dateFormat="yy/mm/dd"
                                              monthNavigator
                                              yearNavigator
                                              yearRange="1970:2030"
                                    />
                                </div>

                            </div>
                        </div>
                    </div>
                    <div className="table-demo p-col-12" hidden={keywordSearchResults}>
                        <div className="card no-gutter widget-overview-box widget-overview-box-1">
                            <h5>{t(`Application.searchResults`)}: <mark>{searchedKeywords}</mark></h5>
                            <div className="p-grid overview-detail">
                                <div className="p-col-4" style={{borderRight:"1px solid #dee2e6"}}>
                                    <div className="overview-number">{keywordCounterDocuments}</div>
                                    <div className="overview-subtext">{t(`Application.documents`)}</div>
                                </div>
                                <div className="p-col-4" style={{borderRight:"1px solid #dee2e6"}}>
                                    <div className="overview-number">{keywordCounterLayers}</div>
                                    <div className="overview-subtext">{t(`Application.layers`)}</div>
                                </div>
                                <div className="p-col-4">
                                    <div className="overview-number">{keywordCounterMaps}</div>
                                    <div className="overview-subtext">{t(`Application.maps`)}</div>
                                </div>
                            </div>
                        </div>
                        <Accordion multiple>
                            <AccordionTab
                                header={
                                    <React.Fragment><i className="fad fa-file"></i>
                                    <span> {t(`Application.documents`)}</span></React.Fragment>}>
                                <DataTable value={keywordsDocumentResults}

                                           className="p-datatable-customers p-datatable-striped p-datatable-lg"
                                           rowGroupHeaderTemplate={headerRowGroup}
                                           rowGroupFooterTemplate={footerRowGroup}
                                           loading={loadingKeywords}
                                           paginator
                                           style={{width:"100%"}}
                                           rows={5}
                                           rowsPerPageOptions={[5,10,20,50]}
                                           removableSort
                                           sortField="category"
                                           sortOrder={-1}
                                           rowHover
                                >

                                    <Column field="title" header={t(`Application.title`)} body={titleTemplate}
                                            style={{width:"20%"}} sortable></Column>
                                    <Column field="abstract" header={t(`Application.abstract`)} body={abstractBodyTemplate} sortable></Column>
                                    <Column field="category" header={t(`Application.category`)} body={bodyTemplate} style={{width:"15%"}} sortable></Column>
                                </DataTable>

                            </AccordionTab>
                            <AccordionTab header={
                                <React.Fragment><i className="fad fa-layer-group"></i>
                                    <span> {t(`Application.layers`)}</span></React.Fragment>}>
                                <DataTable value={keywordsLayerResults}

                                           className="p-datatable-customers p-datatable-striped p-datatable-lg"
                                           rowGroupHeaderTemplate={headerRowGroup}
                                           rowGroupFooterTemplate={footerRowGroup}
                                           loading={loadingKeywords}
                                           paginator
                                           style={{width:"100%"}}
                                           rows={5}
                                           rowsPerPageOptions={[5,10,20,50]}
                                           removableSort
                                           sortField="category"
                                           sortOrder={-1}
                                           rowHover
                                >

                                    <Column field="title" header={t(`Application.title`)} body={titleTemplate}
                                            style={{width:"25%"}} sortable></Column>
                                    <Column field="thumbnail" header={t(`Application.thumbnail`)} body={imageBodyTemplate}
                                            style={{width:"20%"}}></Column>

                                    <Column field="abstract" header={t(`Application.abstract`)} body={abstractBodyTemplate} style={{width:"25%"}} sortable></Column>
                                    <Column field="category" header={t(`Application.category`)} body={bodyTemplate} style={{width:"20"}} sortable></Column>
                                    <Column field="keywords" header="" body={addLayerButton} style={{width:"10%"}}></Column>
                                </DataTable>
                                <div className="p-grid p-justify-center p-mt-4">

                                </div>
                            </AccordionTab>
                            <AccordionTab header={
                                <React.Fragment><i className="fad fa-map"></i>
                                    <span> {t(`Application.maps`)}</span></React.Fragment>}>
                                <DataTable value={keywordsMapResults}

                                           className="p-datatable-customers p-datatable-striped p-datatable-lg"
                                           rowGroupHeaderTemplate={headerRowGroup}
                                           rowGroupFooterTemplate={footerRowGroup}
                                           loading={loadingKeywords}
                                           paginator
                                           style={{width:"100%"}}
                                           rows={5}
                                           rowsPerPageOptions={[5,10,20,50]}
                                           removableSort
                                           sortField="category"
                                           sortOrder={-1}
                                           rowHover
                                >

                                    <Column field="title" header={t(`Application.title`)} body={titleTemplate}
                                            style={{width:"25%"}} sortable></Column>
                                    <Column field="thumbnail" header={t(`Application.thumbnail`)} body={imageBodyTemplate}
                                            style={{width:"20%"}}></Column>

                                    <Column field="abstract" header={t(`Application.abstract`)} body={abstractBodyTemplate} style={{width:"25%"}} sortable></Column>
                                    <Column field="category" header={t(`Application.category`)} body={bodyTemplate} style={{width:"20"}} sortable></Column>
                                    <Column field="keywordsmap" header="" body={addLayerButton} style={{width:"10%"}}></Column>
                                </DataTable>
                                <div className="p-grid p-justify-center p-mt-4">

                                </div>
                            </AccordionTab>
                        </Accordion>
                    </div>
                </Fieldset>
            </div>
            <div className="p-mt-4">
                <Fieldset legend={t(`Application.byCountry`)} toggleable>
                    <div className="p-col-12">
                        <div className="p-inputgroup">
                            <div className="multiselect-demo1 " style={{width:"100%"}}>
                                <MultiSelect
                                    value={selectedCountries}
                                    options={countries}
                                    onChange={(e) =>
                                        enableCountrySearch(e)}
                                    optionLabel="name"
                                    placeholder={t(`Application.selectCountries`)}
                                    filter
                                    className="multiselect-custom"
                                    itemTemplate={countryTemplate}
                                    selectedItemTemplate={selectedCountriesTemplate}
                                    panelFooterTemplate={panelFooterTemplate}
                                    display="chip"
                                    maxSelectedLabels = {8}
                                    selectionLimit = {8}

                                />
                            </div>
                            <Button
                                label={t(`Application.search`)}
                                className="p-button-raised"
                                icon="fad fa-search-location"
                                disabled={countrySearchButton}
                                onClick={searchByCountry}
                            />
                        </div>
                        <div className="p-mt-4">
                            <div className="p-grid
                            p-align-center vertical-container">
                                <div className="p-col-4 p-mt-2">
                                    <div className="p-grid p-align-center vertical-container">
                                        <span className="p-ml-3 p-mr-2">{t(`Application.filterByDate`)+": "} </span>
                                        <InputSwitch checked={switchCountryValue}
                                                     onChange={
                                                         (e) => {
                                                             setSwitchCountryValue(e.value);
                                                             setFromCountryStatus(!fromCountryStatus)
                                                             setToCountryStatus(!toCountryStatus)
                                                         }

                                                     }
                                        />
                                    </div>
                                </div>
                                <div className="p-col-4" hidden={fromCountryStatus}>
                                    <label htmlFor="from" >{t(`Application.from`)+": "} </label>
                                    <Calendar id="from"
                                              value={fromCountryDate}
                                              onChange={(e) => setFromCountryDate(e.value)}
                                              showIcon
                                              disabled={fromCountryStatus}
                                              dateFormat="yy/mm/dd"
                                              monthNavigator
                                              yearNavigator
                                              yearRange="1970:2030"
                                    />
                                </div>
                                <div className="p-col-4" hidden={fromCountryStatus}>
                                    <label htmlFor="to">{t(`Application.to`)+": "}</label>
                                    <Calendar id="to"
                                              value={toCountryDate}
                                              onChange={(e) => setToCountryDate(e.value)}
                                              showIcon
                                              disabled={toCountryStatus}
                                              dateFormat="yy/mm/dd"
                                              monthNavigator
                                              yearNavigator
                                              yearRange="1970:2030"
                                    />
                                </div>

                            </div>
                        </div>
                    </div>
                    <div className="table-demo p-col-12" hidden={countriesSearchResults}>
                        <div className="card no-gutter widget-overview-box widget-overview-box-2">
                            <h5>{t(`Application.searchResults`)+": "} <mark>{searchedCountries}</mark></h5>
                            <div className="p-grid overview-detail">
                                <div className="p-col-4" style={{borderRight:"1px solid #dee2e6"}}>
                                    <div className="overview-number">{countriesCounterDocuments}</div>
                                    <div className="overview-subtext">{t(`Application.documents`)}</div>
                                </div>
                                <div className="p-col-4" style={{borderRight:"1px solid #dee2e6"}}>
                                    <div className="overview-number">{countriesCounterLayers}</div>
                                    <div className="overview-subtext">{t(`Application.layers`)}</div>
                                </div>
                                <div className="p-col-4">
                                    <div className="overview-number">{countriesCounterMaps}</div>
                                    <div className="overview-subtext">{t(`Application.maps`)}</div>
                                </div>
                            </div>
                        </div>
                        <Accordion multiple>
                        <AccordionTab
                            header={
                                <React.Fragment><i className="fad fa-file"></i>
                                    <span> {t(`Application.documents`)}</span></React.Fragment>}>
                            <DataTable value={countriesDocumentResults}

                                       className="p-datatable-customers p-datatable-striped p-datatable-lg"
                                       rowGroupHeaderTemplate={headerRowGroup}
                                       rowGroupFooterTemplate={footerRowGroup}
                                       loading={loadingCountries}
                                       paginator
                                       style={{width:"100%"}}
                                       rows={5}
                                       rowsPerPageOptions={[5,10,20,50]}
                                       removableSort
                                       sortField="category"
                                       sortOrder={-1}
                                       rowHover
                            >

                                <Column field="title" header={t(`Application.title`)} body={titleTemplate}
                                        style={{width:"20%"}} sortable></Column>
                                <Column field="abstract" header={t(`Application.abstract`)} body={abstractBodyTemplate} sortable></Column>
                                <Column field="category" header={t(`Application.category`)} body={bodyTemplate} style={{width:"15%"}} sortable></Column>
                            </DataTable>

                        </AccordionTab>
                        <AccordionTab header={
                            <React.Fragment><i className="fad fa-layer-group"></i>
                                <span> {t(`Application.layers`)}</span></React.Fragment>}>
                            <DataTable value={countriesLayerResults}

                                       className="p-datatable-customers p-datatable-striped p-datatable-lg"
                                       rowGroupHeaderTemplate={headerRowGroup}
                                       rowGroupFooterTemplate={footerRowGroup}
                                       loading={loadingCountries}
                                       paginator
                                       style={{width:"100%"}}
                                       rows={5}
                                       rowsPerPageOptions={[5,10,20,50]}
                                       removableSort
                                       sortField="category"
                                       sortOrder={-1}
                                       rowHover
                            >

                                <Column field="title" header={t(`Application.title`)} body={titleTemplate}
                                        style={{width:"25%"}} sortable></Column>
                                <Column field="thumbnail"  header={t(`Application.thumbnail`)} body={imageBodyTemplate}
                                        style={{width:"20%"}}></Column>

                                <Column field="abstract" header={t(`Application.abstract`)} body={abstractBodyTemplate} style={{width:"25%"}} sortable></Column>
                                <Column field="category"  header={t(`Application.category`)} body={bodyTemplate} style={{width:"20"}} sortable></Column>
                                <Column field="countries" header="" body={addLayerButton} style={{width:"10%"}}></Column>
                            </DataTable>
                            <div className="p-grid p-justify-center p-mt-4">

                            </div>
                        </AccordionTab>
                            <AccordionTab header={
                                <React.Fragment><i className="fad fa-map"></i>
                                    <span> {t(`Application.maps`)}</span></React.Fragment>}>
                                <DataTable value={countriesMapResults}

                                           className="p-datatable-customers p-datatable-striped p-datatable-lg"
                                           rowGroupHeaderTemplate={headerRowGroup}
                                           rowGroupFooterTemplate={footerRowGroup}
                                           loading={loadingCountries}
                                           paginator
                                           style={{width:"100%"}}
                                           rows={5}
                                           rowsPerPageOptions={[5,10,20,50]}
                                           removableSort
                                           sortField="category"
                                           sortOrder={-1}
                                           rowHover
                                >

                                    <Column field="title" header={t(`Application.title`)} body={titleTemplate}
                                            style={{width:"25%"}} sortable></Column>
                                    <Column field="thumbnail" header={t(`Application.thumbnail`)} body={imageBodyTemplate}
                                            style={{width:"20%"}}></Column>

                                    <Column field="abstract" header={t(`Application.abstract`)} body={abstractBodyTemplate} style={{width:"25%"}} sortable></Column>
                                    <Column field="category" header={t(`Application.category`)} body={bodyTemplate} style={{width:"20"}} sortable></Column>
                                    <Column field="countriesmap" header="" body={addLayerButton} style={{width:"10%"}}></Column>
                                </DataTable>
                                <div className="p-grid p-justify-center p-mt-4">

                                </div>
                            </AccordionTab>
                    </Accordion>
                    </div>
                </Fieldset>
            </div>
            <div className="p-mt-4">
                <Fieldset
                    legend={t(`Application.byBoundingBox`)}
                    toggleable
                    collapsed={true}
                >

                    <div className="p-grid p-align-center">
                        <div className="p-col-12 justify-content-end">
                            <div className="p-grid p-justify-center p-col-12"><h5>{t(`Application.drawYourbbox`)}</h5></div>
                            <Glowglobe
                                toolbar="bbox"
                                styleEditor={false}
                                zoom={3}
                                container="bbox_selector"
                                glowglobeOutput={setBBox}
                                centralPoint={userPosition}
                            />
                        </div>
                    </div>

                    <div className="p-grid p-col-12">
                        <InputTextarea
                            rows={15}
                            cols={70}
                            value={selectedBoundingBox}
                            onChange={(event) => enableBBoxSearch(event)}
                        />
                        <div className="p-col">
                            <div className="p-grid p-col-12 p-justify-center p-align-center vertical-container">
                                <span className="p-mr-2">{t(`Application.filterByDate`)+": "} </span>
                                <InputSwitch checked={switchBboxValue}
                                             onChange={
                                                 (e) => {
                                                     setSwitchBboxValue(e.value);
                                                     setFromBboxStatus(!fromBboxStatus)
                                                     setToBboxStatus(!toBboxStatus)
                                                 }

                                             }
                                />
                            </div>
                            <div className="p-col-12">
                                <div className="p-col-12" hidden={fromBboxStatus}>
                                    <label htmlFor="from" >{t(`Application.from`)+": "}</label>
                                    <Calendar id="from"
                                              value={fromBboxDate}
                                              onChange={(e) => setFromBboxDate(e.value)}
                                              showIcon
                                              disabled={fromBboxStatus}
                                              dateFormat="yy/mm/dd"
                                              monthNavigator
                                              yearNavigator
                                              yearRange="1970:2030"
                                    />
                                </div>
                                <div className="p-col-12" hidden={fromBboxStatus}>
                                    <label htmlFor="to">{t(`Application.to`)+": "} </label>
                                    <Calendar id="to"
                                              value={toBboxDate}
                                              onChange={(e) => setToBboxDate(e.value)}
                                              showIcon
                                              disabled={toBboxStatus}
                                              dateFormat="yy/mm/dd"
                                              monthNavigator
                                              yearNavigator
                                              yearRange="1970:2030"
                                    />
                                </div>
                            </div>
                            <div className="p-grid p-col-12 p-justify-center">
                                <Button
                                    label={t(`Application.search`)}
                                    className="p-button-raised "
                                    icon="fad fa-search-location"
                                    disabled={bboxSearchButton}
                                    onClick = {searchByBoundingBox}
                                />
                            </div>
                        </div>
                    </div>


                    <div className="table-demo p-col-12" hidden={bboxSearchResults}>
                        <div className="card no-gutter widget-overview-box widget-overview-box-3">
                            <h5>{t(`Application.searchResults`)+": "} <mark>{searchedBbox}</mark></h5>
                            <div className="p-grid overview-detail">
                                <div className="p-col-4" style={{borderRight:"1px solid #dee2e6"}}>
                                    <div className="overview-number">{bboxCounterDocuments}</div>
                                    <div className="overview-subtext">{t(`Application.documents`)}</div>
                                </div>
                                <div className="p-col-4" style={{borderRight:"1px solid #dee2e6"}}>
                                    <div className="overview-number">{bboxCounterLayers}</div>
                                    <div className="overview-subtext">{t(`Application.layers`)}</div>
                                </div>
                                <div className="p-col-4">
                                    <div className="overview-number">{bboxCounterMaps}</div>
                                    <div className="overview-subtext">{t(`Application.maps`)}</div>
                                </div>
                            </div>
                        </div>
                        <Accordion multiple>
                            <AccordionTab
                                header={
                                    <React.Fragment><i className="fad fa-file"></i>
                                        <span> {t(`Application.documents`)}</span></React.Fragment>}>
                                <DataTable value={bboxDocumentResults}

                                           className="p-datatable-customers p-datatable-striped p-datatable-lg"
                                           rowGroupHeaderTemplate={headerRowGroup}
                                           rowGroupFooterTemplate={footerRowGroup}
                                           loading={loadingBbox}
                                           paginator
                                           style={{width:"100%"}}
                                           rows={5}
                                           rowsPerPageOptions={[5,10,20,50]}
                                           removableSort
                                           sortField="category"
                                           sortOrder={-1}
                                           rowHover
                                >

                                    <Column field="title" header={t(`Application.title`)} body={titleTemplate}
                                            style={{width:"20%"}} sortable></Column>
                                    <Column field="abstract" header={t(`Application.abstract`)} body={abstractBodyTemplate} sortable></Column>
                                    <Column field="category" header={t(`Application.category`)} body={bodyTemplate} style={{width:"15%"}} sortable></Column>
                                </DataTable>

                            </AccordionTab>
                            <AccordionTab header={
                                <React.Fragment><i className="fad fa-layer-group"></i>
                                    <span> {t(`Application.layers`)}</span></React.Fragment>}>
                                <DataTable value={bboxLayerResults}

                                           className="p-datatable-customers p-datatable-striped p-datatable-lg"
                                           rowGroupHeaderTemplate={headerRowGroup}
                                           rowGroupFooterTemplate={footerRowGroup}
                                           loading={loadingBbox}
                                           paginator
                                           style={{width:"100%"}}
                                           rows={5}
                                           rowsPerPageOptions={[5,10,20,50]}
                                           removableSort
                                           sortField="category"
                                           sortOrder={-1}
                                           rowHover
                                >

                                    <Column field="title" header={t(`Application.title`)} body={titleTemplate}
                                            style={{width:"25%"}} sortable></Column>
                                    <Column field="thumbnail" header={t(`Application.thumbnail`)} body={imageBodyTemplate}
                                            style={{width:"20%"}}></Column>

                                    <Column field="abstract" header={t(`Application.abstract`)} body={abstractBodyTemplate} style={{width:"25%"}} sortable></Column>
                                    <Column field="category" header={t(`Application.category`)} body={bodyTemplate} style={{width:"20"}} sortable></Column>
                                    <Column field="bbox" header="" body={addLayerButton} style={{width:"10%"}}></Column>
                                </DataTable>

                                <div className="p-grid p-justify-center p-mt-4">

                                </div>
                            </AccordionTab>
                            <AccordionTab header={
                                <React.Fragment><i className="fad fa-map"></i>
                                    <span> {t(`Application.maps`)}</span></React.Fragment>}>
                                <DataTable value={bboxMapResults}

                                           className="p-datatable-customers p-datatable-striped p-datatable-lg"
                                           rowGroupHeaderTemplate={headerRowGroup}
                                           rowGroupFooterTemplate={footerRowGroup}
                                           loading={loadingBbox}
                                           paginator
                                           style={{width:"100%"}}
                                           rows={5}
                                           rowsPerPageOptions={[5,10,20,50]}
                                           removableSort
                                           sortField="category"
                                           sortOrder={-1}
                                           rowHover
                                >

                                    <Column field="title" header={t(`Application.title`)} body={titleTemplate}
                                            style={{width:"25%"}} sortable></Column>
                                    <Column field="thumbnail" header={t(`Application.thumbnail`)} body={imageBodyTemplate}
                                            style={{width:"20%"}}></Column>

                                    <Column field="abstract" header={t(`Application.abstract`)} body={abstractBodyTemplate} style={{width:"25%"}} sortable></Column>
                                    <Column field="category" header={t(`Application.category`)} body={bodyTemplate} style={{width:"20"}} sortable></Column>
                                    <Column field="bboxmap" header="" body={addLayerButton} style={{width:"10%"}}></Column>
                                </DataTable>

                                <div className="p-grid p-justify-center p-mt-4">

                                </div>
                            </AccordionTab>
                        </Accordion>
                    </div>

                </Fieldset>
            </div>
        </div>

    )

}
