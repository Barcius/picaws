const { RDSDataClient, ExecuteStatementCommand } = require("@aws-sdk/client-rds-data");

const region = 'eu-central-1';
const rdsClient = new RDSDataClient({ region });

const rdsParams = {
  // resourceArn: 'arn:aws:rds:eu-central-1:691517806851:db:picaws-db', /* required */
  // secretArn: 'arn:aws:secretsmanager:eu-central-1:691517806851:secret:picawsDbCreds-7yuTmq', /* required */
  resourceArn: 'arn:aws:rds:eu-central-1:691517806851:cluster:picaws-cluster', /* required */
  secretArn: 'arn:aws:secretsmanager:eu-central-1:691517806851:secret:picawsClusterCreds-uNZpLw', /* required */
  database: 'picaws',
  includeResultMetadata: true,
}

const parseRDSdata = (input) => {
  let columns = input.columnMetadata.map(c => { return { name: c.name, typeName: c.typeName }; });

  let parsedData = input.records.map(row => {
    let response = {};

    row.map((v, i) => {
      if ((columns[i].typeName == 'VARCHAR' || columns[i].typeName == 'CHAR') && Object.keys(v)[0] == 'isNull' && Object.values(v)[0] == true)
        response[columns[i].name] = '';
      else
        response[columns[i].name] = Object.values(v)[0];
    });
    return response;
  });
  return parsedData;
}

  /**
   * @type {import('@types/aws-lambda').APIGatewayProxyHandler}
   */
  exports.handler = async (event) => {
    switch (event.httpMethod) {
      case 'GET':
        const sql = 'select * from Images';
        const command = new ExecuteStatementCommand({ ...rdsParams, sql });
        let data;
        try {
          data = await rdsClient.send(command);
        } catch (e) {
          return {
            statusCode: 500,
            headers: {
              "Access-Control-Allow-Origin": "*",
              "Access-Control-Allow-Headers": "*"
            },
            body: JSON.stringify(e.toString()),
          };
        }
        return {
          statusCode: 200,
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "*"
          },
          body: JSON.stringify(parseRDSdata(data)),
        };
      case 'POST':
        let result;
        try {
          const body = JSON.parse(event.body);
          const sql = 'insert into Images (name, s3bucket, s3path) values (:name, :bucket, :path)';
          const command = new ExecuteStatementCommand({
            ...rdsParams,
            sql,
            parameters: [
              {
                name: 'name',
                value: { stringValue: body.name }
              },
              {
                name: 'bucket',
                value: { stringValue: body.bucket }
              },
              {
                name: 'path',
                value: { stringValue: body.path }
              },
            ]
          });
          result = await rdsClient.send(command);
          // result = await s3Client.send(new PutObjectCommand({
          //   ...s3Params,
          //   Key: 'images/test.txt',
          //   Body: 'test test'
          // }));
        } catch (e) {
          return {
            statusCode: 500,
            headers: {
              "Access-Control-Allow-Origin": "*",
              "Access-Control-Allow-Headers": "*"
            },
            body: JSON.stringify(e.toString()),
          };
        }
        return {
          statusCode: 200,
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "*"
          },
          body: JSON.stringify(result),
        };
      default:
        return {
          statusCode: 501,
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "*"
          }
        };
    }
  };
