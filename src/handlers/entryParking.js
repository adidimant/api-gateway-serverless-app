
const uuid = require('uuid');
const DynamoDBApi = require('../lib/dynamoApi');
const tableName = process.env.SAMPLE_TABLE;
const dynamoApi = new DynamoDBApi(tableName);
const { STATUSES } = require('../lib/consts');


// Get the DynamoDB table name from environment variables

/**
 * A simple example includes a HTTP post method to add one item to a DynamoDB table.
 */
exports.handler = async (event) => {
    const { body, httpMethod, path, pathParameters } = event;
    if (httpMethod !== 'POST') {
        throw new Error(`postMethod only accepts POST method, you tried: ${httpMethod} method.`);
    }

    console.log('received:', JSON.stringify(event));

    const { plate, parkingLot } = pathParameters;

    const dynamoItem = {
        id: uuid(),
        plate,
        parkingLot,
        entryDate: new Date(),
        exitDate: null,
        status: STATUSES.PARKING
    };

    console.log(`Dynamo item to put - ${JSON.stringify(dynamoItem)}`);

    await dynamoApi.putItem(dynamoItem);

    const response = {
        statusCode: 200,
        body: {
            ticketId: dynamoItem.id
        },
    };

    console.log(`response from: ${path} statusCode: ${response.statusCode} body: ${response.body}`);
    return response;
};
