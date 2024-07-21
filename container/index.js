const { S3Client, GetObjectCommand, PutObjectCommandconst  } = require("@aws-sdk/client-s3");
const fs = require("node:fs/promises");
const path = require("node:path");
const ffmpeg = require("fluent-ffmpeg");
const { log } = require("node:console");

const RESOLUTIONS = [
    {"name": "360p", width: 480, height: 360},
    {"name": "480p", width: 858, height: 480},
    {"name": "720p", width: 1280, height: 720}
]

const S3Client = new S3({
    region: "",
    credentials: {
        accessKeyId: "",
        secretAccessKey: ""
    }
});

const BUCKET_NAME = process.env.BUCKET_NAME;
const KEY = process.env.KEY;

async function init() {

    // download the original video
    const command = GetObjectCommand({
        Bucket: BUCKET_NAME,
        Key: KEY
    });

    const result = await S3Client.send(command);
    const originalFilePath = `videos/original-video.mp4`;
    await fs.writeFile(originalFilePath, result.Body);
    const originalVideoPath = path.resolve(originalFilePath);


    // start the transcoder
    const promises = RESOLUTIONS.map(resolution => {
        const output = `transcoded/video-${resolution.name}.mp4`;

        return new Promise((resolve) => {
            ffmpeg(originalVideoPath).output(output).withVideoCodec("libx264").withAspect("aac").withSize(`${resolution.width}x${resolution.height}`).on('end', async () => {
                // upload the video
                const putCommand = new PutObjectCommandconst({
                    Bucket: "production.arjimo",
                    Key: output
                });
                await S3Client.send(putCommand);
                console.log(`Uploaded ${output}`);
                resolve();
            }).format("mp4").run();
        });
    });

    await Promise.all(promises);

}

init().finally(() => process.exit(0));



