

var express = require('express');
var app = express();
var multer = require('multer')
var cors = require('cors');
var bodyParser = require('body-parser')
const axios = require('axios');


app.use(cors())
app.use('/static',express.static('staticdata'))
app.use(bodyParser.json({limit: '120mb'})); // <--- Here
app.use(bodyParser.urlencoded({extended: true}));



var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'staticdata')
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname )
    }
})

var upload = multer({ storage: storage }).array('file')

app.post('/upload',function(req, res) {

    upload(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            return res.status(500).json(err)
        } else if (err) {
            return res.status(500).json(err)
        }
        return res.status(200).send(req.file)

    })

});


app.post('/connectToWMS', async function (req, res) {

    //var wmsQuery = req.query.wmsURL;
    var xml2js = require('xml2js');
    var parser = new xml2js.Parser


    const wmsResponse = await axios.get("https://data.fao.org/maps/wms?SERVICE=WMS&VERSION=1.3.0&SLD_VERSION=1.1.0&REQUEST=GetCapabilities")
        .then(
            (result) =>{
                return result;
            }
        )
        .catch(
            (error)=>{
                console.log(error);

            }
        )

    Promise.resolve(wmsResponse)
        .then(
            (result)=>{
                return res.status(200).send(result.data.toString());
            }
        )
        .catch(
            (error)=>{
                console.log(error);
            }
        )

});

app.post('/buildReport', async function (req, res) {
    const PDFDocument = require('pdfkit');
    const getStream = require('get-stream');
    const fetch = require("node-fetch");

    // Create a document
    const doc = new PDFDocument(
        {
            layout : 'landscape',
            size:'A4',
        }
    );

    //console.log(req.body.params.image);

    var img = new Buffer(req.body.params.image.split(',')[1], 'base64');
    var title = req.body.params.title;
    var legendURL = req.body.params.legendURL;
    var srs = req.body.params.srs;
    var scaleFactor = req.body.params.scaleFactor;
    var nabstract = req.body.params.abstract;



    var legendImage = undefined
    if(legendURL!==''){
        const legend = await fetch(legendURL);
        legendImage = await legend.buffer();

    }

    // Embed a font, set the font size, and render some text
    // Add an image, constrain it to a given size, and center it vertically and horizontally
    doc.image(img,17,0,
        {
            height:425,
            align: 'center',
            valign: 'center'
        }
        );

    if(legendImage !== undefined){
        doc.image(legendImage,17,450,
            {
                height:130,
                align: 'center',
                valign: 'center'
            }
        );
    }

    // Pipe its output somewhere, like to a file or HTTP response
    // See below for browser usage

    doc.fontSize(15).text(title, 0, 430,
        {
            align:'center'
        })

    doc.lineWidth(2);

    doc.lineCap('butt')
        .moveTo(0, 425)
        .lineTo(841, 425)
        .stroke();

    const abstractLayer = nabstract;

    doc.text(abstractLayer,200,450, {
        columns: 1,
        columnGap: 15,
        height: 130,
        width: 400,
        align: 'justify'
    });

    var label = "Coordinate System: "+srs
    doc.fontSize(10).text(label,610,450, {
        align:'right'
    });

    var scaleLabel = "Scale Factor: "+scaleFactor
    doc.fontSize(10).text(scaleLabel,610,470, {
        align:'right'
    });
    //coords



    doc.end();
    const document = await getStream.buffer(doc);
    return res.status(200).send(document);


    //return res.status(200);

})


app.listen(8000, function() {

    console.log('App running on port 8000');

});
