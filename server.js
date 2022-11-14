const express = require('express')
const cors = require('cors')
const multer = require('multer')
const ffmpeg = require('ffmpeg');
const fs = require('fs');

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, './videos')
    },
    filename: function(req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, uniqueSuffix + '.' + file.originalname.split('.').pop())
    }
})

const upload = multer({ storage: storage })

const app = express();
const port = 3000;


app.post('/thumbnail', upload.single('video'), async(req, res) => {
    let filePath = req.file.path

    let uniqueSuffix = req.file.filename.split('-')[0]

    try {
        var process = new ffmpeg(filePath);
        process.then(function(video) {
            video.fnExtractFrameToJPG('./thumbnails', {
                start_time: '00:00:00',
                frame_rate: 1,
                number: 1,
                file_name: uniqueSuffix + '_%t_%s'
            }).then((files) => {
                files.map((file) => {
                    if (file.includes(uniqueSuffix, 0)) {
                        let outputFile = fs.readFileSync(file, 'binary');
                        res.writeHead(200, {
                            'Content-Type': 'image/jpg',
                            'Content-Disposition': `attachment;filename=${file}`,
                            'Content-Length': outputFile.length
                        });
                        res.end(Buffer.from(outputFile, 'binary'));
                    }
                })
            })
        }, function(err) {
            console.log('Error: ' + err);
        });
    } catch (e) {
        console.log(e.code);
        console.log(e.msg);
    }
});



app.use(cors());

app.listen(port, () => {
    console.log(`o-------------------------------------------------------------o`);
    console.log(`|        FDL PROGRAM RUNNING AT http://localhost:${port}         |`);
    console.log(`o-------------------------------------------------------------o`);
});