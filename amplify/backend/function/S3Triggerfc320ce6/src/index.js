const { S3Client, GetObjectCommand } = require("@aws-sdk/client-s3");
const { RDSDataClient, ExecuteStatementCommand } = require("@aws-sdk/client-rds-data");
const exif = require('exif-reader');

const streamToBuffer = (stream) =>
  new Promise((resolve, reject) => {
    const chunks = [];
    stream.on("data", (chunk) => chunks.push(chunk));
    stream.on("error", reject);
    stream.on("end", () => resolve(Buffer.concat(chunks)));
  });

function ConvertDMSToDD(degrees, minutes, seconds, direction) {
  let dd = degrees + minutes/60 + seconds/(60*60);
  if (direction === "S" || direction === "W") {
      dd = dd * -1;
  } // Don't do anything for N or E
  return dd;
}

// eslint-disable-next-line
exports.handler = async function (event) {
  if (event.Records[0].eventName === 'ObjectCreated:Put') {
    const Bucket = event.Records[0].s3.bucket.name; //eslint-disable-line
    const Key = event.Records[0].s3.object.key; //eslint-disable-line
    const s3Client = new S3Client({ region: 'eu-central-1' });
    try {
      const result = await s3Client.send(new GetObjectCommand({
        Bucket,
        Key,
      }));
      const body = await streamToBuffer(result.Body);
      console.log(exif(body));
    } catch (e) {
      console.log('Error: ' + e.message)
    }
  }
  // console.log('Received S3 event:', JSON.stringify(event, null, 2));
  // // Get the object from the event and show its content type
  // const bucket = event.Records[0].s3.bucket.name; //eslint-disable-line
  // const key = event.Records[0].s3.object.key; //eslint-disable-line
  // console.log(`Bucket: ${bucket}`, `Key: ${key}`);
};
