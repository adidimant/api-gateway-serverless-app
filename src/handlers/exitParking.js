
const DynamoDBApi = require('../lib/dynamoApi');
const tableName = process.env.SAMPLE_TABLE; //TODO - move to pipline, and improve general consts!
const dynamoApi = new DynamoDBApi(tableName);
const { STATUSES, PRICE_PER_QUARTER_HOUR } = require('../lib/consts');

/**
 * A simple example includes a HTTP post method to add one item to a DynamoDB table.
 */
exports.handler = async (event) => {
    const { body, httpMethod, path, pathParameters } = event; //TODO - remove if not necassary!
    if (httpMethod !== 'POST') {
        throw new Error(`postMethod only accepts POST method, you tried: ${httpMethod} method.`);
    }
    console.log('received:', JSON.stringify(event));

    const { ticketId } = pathParameters;
    const Item = await dynamoApi.getItemById(ticketId);

    const currentTime = new Date();
    const quarterHoursAmount = Math.abs(currentTime - Item.entryDate) / 36e5 / 4;

    await dynamoApi.updateAfterExit(id, STATUSES.FINISHED, currentTime);

    const response = {
        statusCode: 200,
        body: {
            plate: Item.plate,
            totalParkingTimeInHours: quarterHoursAmount * 4,
            parkingLot: Item.parkingLot,
            charge: quarterHoursAmount * PRICE_PER_QUARTER_HOUR
        },
    };

    console.log(`response from: ${path} statusCode: ${response.statusCode} body: ${response.body}`);
    return response;
};
