const { S3Client, GetObjectCommand } = require("@aws-sdk/client-s3");
const { RDSDataClient, ExecuteStatementCommand } = require("@aws-sdk/client-rds-data");
const exif = require('exifreader');

const rdsClient = new RDSDataClient({ region: 'eu-central-1' });
const s3Client = new S3Client({ region: 'eu-central-1' });

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

const rdsParams = {
  // resourceArn: 'arn:aws:rds:eu-central-1:691517806851:db:picaws-db', /* required */
  // secretArn: 'arn:aws:secretsmanager:eu-central-1:691517806851:secret:picawsDbCreds-7yuTmq', /* required */
  resourceArn: 'arn:aws:rds:eu-central-1:691517806851:cluster:picaws-cluster', /* required */
  secretArn: 'arn:aws:secretsmanager:eu-central-1:691517806851:secret:picawsClusterCreds-uNZpLw', /* required */
  database: 'picaws',
}

// eslint-disable-next-line
exports.handler = async function (event) {
  if (event.Records[0].eventName === 'ObjectCreated:Put') {
    const Bucket = event.Records[0].s3.bucket.name; //eslint-disable-line
    const Key = event.Records[0].s3.object.key; //eslint-disable-line
    try {
      let result = await s3Client.send(new GetObjectCommand({
        Bucket,
        Key,
      }));
      const body = await streamToBuffer(result.Body);
      const exifData = exif.load(body);
      if (exifData.GPSLongitude && exifData.GPSLatitude && exifData.GPSAltitudeRef) {
        const sql = 'select id from Images WHERE s3path = :path and s3bucket = :bucket';
        const parameters = [
          {
            name: 'path',
            value: { stringValue: Key.replace(/^public\//, '') }
          },
          {
            name: 'bucket',
            value: { stringValue: Bucket }
          }
        ]
        const command = new ExecuteStatementCommand({ ...rdsParams, sql, parameters });
        result = await rdsClient.send(command);
        const imageId = result.records[0][0].longValue;
        const insertSql = 'insert into Metadatas (latitude, longitude, altitude, image_id) values (:lat, :lon, :alt, :imgid)';
        const insertParams = [
          {
            name: 'lat',
            value: { longValue: +exifData.GPSLatitude.description }
          },
          {
            name: 'lon',
            value: { longValue: +exifData.GPSLongitude.description }
          },
          {
            name: 'alt',
            value: { longValue: +exifData.GPSLatitude.description }
          },
          {
            name: 'imgid',
            value: { longValue: +imageId }
          }
        ]
        console.log(JSON.stringify(insertParams, null, 2));
        return await rdsClient.send(new ExecuteStatementCommand({ ...rdsParams, sql: insertSql, parameters: insertParams }));
      }
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
