import axios from 'axios';

const AWS = require('aws-sdk/global');
const S3 = require('aws-sdk/clients/s3');

const qvantumGeospatialAPI = "http://192.168.122.218:5000";


export default class QvantumService {

    async getAWSData(bucket,key) {

        AWS.config.update(
            {
                accessKeyId: '',
                secretAccessKey: '',
                region: ''
            }
        );
        const s3 = new AWS.S3();

        const params = {
            Bucket: bucket,
            Key: key
        };

        const awsData = await s3.getObject(params).promise();
        return awsData.Body;
    }

    async getSDGFromAPI(identifier,country){

        //http://192.168.122.218:5000/gethistoricalstatistics?identifier=IDN&country=TUN



    }

    async getSDGData(bucket,key) {

        return this.getAWSData(bucket,key).then(

            res => {
                const sdgData = JSON.parse(res.toString());
                const result = sdgData.subindicators.map(

                    (subindicator)=>{

                        const historyData = {};

                        if(subindicator.subindicator === "land_cover"){
                            let treemapPerYear = [];
                            subindicator.classes.forEach(
                                (land_cover_class) => {
                                    let label = land_cover_class.class;
                                    let complexData = land_cover_class.data;

                                    let color = "#FFFFF";

                                    switch(label) {
                                        case "Tree-covered":
                                            color = "#42b05c"
                                            break;
                                        case "Grassland":
                                            color = "#a0dc67"
                                            break;
                                        case "Cropland":
                                            color = "#c67f5f"
                                            break;
                                        case "Wetland":
                                            color = "#12AAB5"
                                            break;
                                        case "Artificial":
                                            color = "#5D7F99"
                                            break;
                                        case "Bare land":
                                            color = "#f5d680"
                                            break;
                                        case "Water body":
                                            color = "#67b7dc"
                                            break;
                                        default:
                                            color = "#ff0000";
                                    }

                                    complexData.forEach(
                                        (data_instance) => {

                                            let instance = {
                                                name: label,
                                                tval: data_instance.absolute_value.toFixed(2),
                                                tperc: data_instance.percentage_value.toFixed(2),
                                                color: color
                                            }

                                            let year = data_instance.year.toString();

                                            if(treemapPerYear[year] == undefined){
                                                treemapPerYear[year] = [];
                                                treemapPerYear[year].push(instance);
                                            }else{
                                                treemapPerYear[year].push(instance);
                                            }
                                        }
                                    );
                                }
                            );
                            historyData.landCover = treemapPerYear;
                        }else if(subindicator.subindicator === "ndvi"){
                            let rangePerYear = [];
                            subindicator.data.forEach(
                                (data_instance) => {
                                    let instance = {
                                        year: data_instance.year,
                                        roi: parseInt(data_instance.value)/10000,
                                        country: parseInt(data_instance.value)/10000,
                                    }
                                    rangePerYear.push(instance);
                                }
                            )
                            historyData.ndvi = rangePerYear;
                        }else if(subindicator.subindicator === "soc"){
                            const soc_data = {
                                geo:"COUNTRY",
                                max: subindicator.max,
                                upperquartile: subindicator.max_quartile,
                                median: subindicator.mean,
                                lowerquartile: subindicator.min_quartile,
                                min: subindicator.min
                            }
                            historyData.soilCarbon = soc_data;

                        }
                        return historyData;
                    }
                )

                const sdgPeriodData = sdgData.sustainable_development_goals.data.map(
                    (sdg_period)=>{

                        let start_date = sdg_period.period.start_year;
                        let end_date = sdg_period.period.end_year;

                        const instance = {
                            degradation: sdg_period.Degradation.absolute_value,
                            improvement: sdg_period.Improvement.absolute_value,
                            stable: sdg_period.Stable.absolute_value,
                            category: "from "+start_date+" to "+end_date
                        }

                        return instance;
                    }
                )

                result.push({sdg15:sdgPeriodData});
                return result;
            }

        );
    }

    async getLDRiskLayerData(country){


        //const ldRiskURL = "https://trends-earth-15-3-1.s3.eu-central-1.amazonaws.com/precalculated_data/land_cover/single_bands/TUN_ld_risk.tif"
        const ldRiskURL = ""

        let historyLayers = [];
        const landCoverLayer = {
            label:"Land Risk",
            file_type:"geotiff",
            url:ldRiskURL,
            visible:true,
            palette:1
        }
        historyLayers.push(landCoverLayer);
        return historyLayers;
    }

    async getSuitabilityData(country){

        var scountry = "";
        if(country === "TYN"){
            scountry = "TUN";
        }else if(country === "BFA"){
            scountry = "BFA";
        }


        var suitabilityURLs = [];
        var landCoverURL = ""
        var suitabilityURL = ""

        suitabilityURLs.push(landCoverURL);
        suitabilityURLs.push(suitabilityURL);

        let suitabilityLayers = [];
        const landCoverUsabilityLayer = {
            label:"Land Suitability",
            file_type:"geotiff",
            url:suitabilityURLs,
            visible:true,
            palette:[2,4],
            removable:true
        }


        suitabilityLayers.push(landCoverUsabilityLayer);

        return suitabilityLayers;

    }

    async getLayerData(country,year){

        var sdgCountry;
        if(country === "TYN"){
            sdgCountry = "tun";
        }else if(country === "BFA"){
            sdgCountry = "bfa";
        }


        var socURL = "";
        var ndviURL = "";
        var sdgURL = [];
        sdgURL.push("");
        sdgURL.push("");

        const landCoverURL = ""

        let historyLayers = [];


        const landCoverLayer = {
            label:"Land Cover",
            file_type:"geotiff",
            url:landCoverURL,
            visible:false,
            palette:2,
            removable:true
        }

        const socLayer = {
            label:"Soil Carbon",
            file_type:"geotiff",
            url:socURL,
            visible:false,
            palette:0,
            removable:true
        }

        const ndviLayer = {
            label:"NDVI",
            file_type:"geotiff",
            url:ndviURL,
            visible:false,
            palette:0,
            removable:true
        }

        const sdgLayer = {
            label:"SDG",
            file_type:"geotiff",
            url:sdgURL,
            visible:false,
            palette:[3,3],
            removable:true
        }

        historyLayers.push(landCoverLayer);
        historyLayers.push(socLayer);
        historyLayers.push(ndviLayer);
        historyLayers.push(sdgLayer);

        return historyLayers;

    }

    async getGADMPolygon(country,adminLevel){
        var data = new FormData();
        data.append('country',country);
        data.append('adminLevel',adminLevel);
        data.append('type','simple');


        const headers = {
            'Authorization': '',
            'accept': 'application/json',
            'Content-Type' : 'multipart/form-data',
            'Access-Control-Allow-Origin': "*"
        };

        return axios.post(
            '',
            data,
            { headers }
            )
            .then(response =>
                {
                    return response.data
                }
            );

    }

    async getFullGADMPolygon(point,adminLevel){

        var lon = point.geometry.coordinates[0];
        var lat = point.geometry.coordinates[1];

        var FormData = require('form-data');
        var data = new FormData();
        data.append('lat', lat);
        data.append('lon', lon);
        data.append('adminLevel', adminLevel);

        var config = {
            method: 'post',
            url: '',
            headers: {
                'accept': 'application/json',
                'authorization': '',
                'Content-Type': 'multipart/form-data'
            },
            data : data
        };

        return axios(config)
            .then(function (response) {
                return response.data;
            })

    }

    async calculateRegionData(regionDetails){

        var identifier = regionDetails.country+"_"+
            regionDetails.administrationLevel;

        var country = regionDetails.country;
        var adminLevel = regionDetails.administrationLevel;

        return this.getFullGADMPolygon(regionDetails.chosenPoint,adminLevel).then(
            (response) => {

                if(adminLevel === '2'){
                    identifier = identifier+"_"+response.properties.GID_2
                }else if(adminLevel === '1'){
                    identifier = identifier+"_"+response.properties.GID_1
                }

                const params={
                    identifier: identifier,
                    country: country,
                    geojson: response
                }
                return axios.get(qvantumGeospatialAPI+"/clipbyregion",{params}).then(
                    (responseFlask) => {
                        if(responseFlask.data.result === "complete"){
                            return axios.get(qvantumGeospatialAPI+"/getregionlandtypes",{params}).then(
                                (landTypesStats)=>{
                                    return landTypesStats.data
                                }
                            )
                        }
                    }
                );
            }
        )

    }

    async calculateScenario(regionDetails,scenario){

        var identifier = regionDetails.country+"_"+
            regionDetails.administrationLevel;

        const params={
            identifier: identifier,
            scenario: scenario
        }
        return axios.get(qvantumGeospatialAPI+"/calculateScenario",{params}).then(
            (responseFlask) => {
                return responseFlask
            }
        );

    }

    async getHistoricalStatistics(regionDetails){

        var identifier = regionDetails.country+"_"+
            regionDetails.administrationLevel;

        var country = regionDetails.country;
        var adminLevel = regionDetails.administrationLevel;

        return this.getFullGADMPolygon(regionDetails.chosenPoint,adminLevel).then(
            (response) => {
                if(adminLevel === '2'){
                    identifier = identifier+"_"+response.properties.GID_2
                }else if(adminLevel === '1'){
                    identifier = identifier+"_"+response.properties.GID_1
                }

                const params={
                    identifier: identifier,
                    country: country
                }

                return axios.get(qvantumGeospatialAPI+"/gethistoricalstatistics",{params}).then(
                    (responseFlask) => {

                        const sdgData = responseFlask.data;
                        const result = sdgData.subindicators.map(

                            (subindicator)=>{

                                const historyData = {};

                                if(subindicator.subindicator === "land_cover"){
                                    let treemapPerYear = [];
                                    subindicator.classes.forEach(
                                        (land_cover_class) => {
                                            let label = land_cover_class.class;
                                            let complexData = land_cover_class.data;

                                            let color = "#FFFFF";
                                            console.log(label);

                                            switch(label) {
                                                case "Tree covered":
                                                    color = "#42b05c"
                                                    break;
                                                case "Grassland":
                                                    color = "#a0dc67"
                                                    break;
                                                case "Cropland":
                                                    color = "#c67f5f"
                                                    break;
                                                case "Wetland":
                                                    color = "#12AAB5"
                                                    break;
                                                case "Artificial":
                                                    color = "#5D7F99"
                                                    break;
                                                case "Bare land":
                                                    color = "#f5d680"
                                                    break;
                                                case "Water body":
                                                    color = "#67b7dc"
                                                    break;
                                                default:
                                                    color = "#ff0000";
                                            }

                                            complexData.forEach(
                                                (data_instance) => {

                                                    let instance = {
                                                        name: label,
                                                        tval: data_instance.absolute_value.toFixed(2),
                                                        tperc: data_instance.percentage_value.toFixed(2),
                                                        color: color
                                                    }

                                                    let year = data_instance.year.toString();

                                                    if(treemapPerYear[year] == undefined){
                                                        treemapPerYear[year] = [];
                                                        treemapPerYear[year].push(instance);
                                                    }else{
                                                        treemapPerYear[year].push(instance);
                                                    }
                                                }
                                            );
                                        }
                                    );
                                    historyData.landCover = treemapPerYear;
                                }else if(subindicator.subindicator === "ndvi"){
                                    let rangePerYear = [];
                                    subindicator.data.forEach(
                                        (data_instance) => {
                                            let instance = {
                                                year: data_instance.year,
                                                roi: parseInt(data_instance.value)/10000,
                                                country: parseInt(data_instance.value)/10000,
                                            }
                                            rangePerYear.push(instance);
                                        }
                                    )
                                    historyData.ndvi = rangePerYear;
                                }else if(subindicator.subindicator === "soc"){
                                    const soc_data = {
                                        geo:"ROI",
                                        max: subindicator.max,
                                        upperquartile: subindicator.max_quantile,
                                        median: subindicator.mean,
                                        lowerquartile: subindicator.min_quantile,
                                        min: subindicator.min
                                    }
                                    historyData.soilCarbon = soc_data;

                                }

                                return historyData;
                            }
                        )

                        const sdgPeriodData = sdgData.sustainable_development_goals.data.map(
                            (sdg_period)=>{

                                let start_date = sdg_period.period.start_year;
                                let end_date = sdg_period.period.end_year;

                                const instance = {
                                    degradation: sdg_period.Degradation.absolute_value,
                                    improvement: sdg_period.Improvement.absolute_value,
                                    stable: sdg_period.Stable.absolute_value,
                                    category: "from "+start_date+" to "+end_date
                                }

                                return instance;
                            }
                        )

                        result.push({sdg15:sdgPeriodData});

                        if(country === "TUN"){
                            this.getSDGData("trends-earth-15-3-1","precalculated_data/tun_hist_stats.json")
                                .then(
                                    (data) => {
                                        data[1].ndvi.forEach(
                                            (ndviCountry,index)=>{
                                                result[1].ndvi[index].country=ndviCountry.country;

                                            }
                                        )
                                        var soilCarbonArray = [result[2].soilCarbon,data[2].soilCarbon]
                                        result[2].soilCarbon = soilCarbonArray;
                                    }
                                )
                        }else if(country === "BFA"){
                            this.getSDGData("trends-earth-15-3-1","precalculated_data/bfa_hist_stats.json")
                                .then(
                                    (data) => {
                                        data[1].ndvi.forEach(
                                            (ndviCountry,index)=>{
                                                result[1].ndvi[index].country=ndviCountry.country;

                                            }
                                        )
                                        var soilCarbonArray = [result[2].soilCarbon,data[2].soilCarbon]
                                        result[2].soilCarbon = soilCarbonArray;
                                    }
                                )
                        }

                        return result;
                    }
                );
            }
        )

    }

    async calculateSOCScenario(regionDetails,scenario){
        var identifier = regionDetails.country+"_"+
            regionDetails.administrationLevel;

        const params={
            identifier: identifier,
            socscenario: scenario
        }
        return axios.get(qvantumGeospatialAPI+"/calculateSOCScenario",{params}).then(
            (responseFlask) => {
                return responseFlask
            }
        );

    }
}
