import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({});
const ddbDocClient = DynamoDBDocumentClient.from(client);
const tableName = process.env.SAMPLE_TABLE;

export const query = async (event) => {
    if (event.httpMethod !== 'GET') {
        throw new Error(`getAllItems only accept GET method, you tried: ${event.httpMethod}`);
    }
    // All log statements are written to CloudWatch
    console.info('received:', event);

    // get all items from the table (only first 1MB data, you can use `LastEvaluatedKey` to get the rest of data)
    // https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB/DocumentClient.html#scan-property
    // https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_Scan.html
    var params = {
        TableName : tableName
    };

    try {
        const data = await ddbDocClient.send(new ScanCommand(params));
        var items = data.Items;
    } catch (err) {
        console.log("Error", err);
    }

    const response = buildResponse(event, items);
    return response;
}

function buildResponse(event, items) {
    const response = {
        statusCode: 200,
        headers: {
          "Access-Control-Allow-Headers" : "*",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "*"
        },
        body: JSON.stringify(items)
    };
  
    console.info(`response from: ${event.path} statusCode: ${response.statusCode} body: ${response.body}`);
  
    return response;
  }
