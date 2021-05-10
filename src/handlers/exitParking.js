
const DynamoDBApi = require('../lib/dynamoApi');
const tableName = process.env.SAMPLE_TABLE;
const dynamoApi = new DynamoDBApi(tableName);
const { STATUSES, PRICE_PER_QUARTER_HOUR } = require('../lib/consts');


exports.handler = async (event) => {
    const { httpMethod, path, pathParameters } = event;
    if (httpMethod !== 'POST') {
        throw new Error(`postMethod only accepts POST method, you tried: ${httpMethod} method.`);
    }
    console.log('received:', JSON.stringify(event));

    const { ticketId } = pathParameters;
    const Item = await dynamoApi.getItemById(ticketId);

    if (Item.exitDate) {
        throw new Error(`Car already left the parking. exit date - ${Item.exitDate}`);
    }

    console.log(`Item to update - ${JSON.stringify(Item)}`);

    const currentTime = new Date().getTime();
    const hoursAmount = (currentTime - Item.entryDate) / 3600000;

    await dynamoApi.updateAfterExit(ticketId, STATUSES.FINISHED, currentTime);

    const response = {
        statusCode: 200,
        body: {
            plate: Item.plate,
            totalParkingTimeInHours: hoursAmount,
            parkingLot: Item.parkingLot,
            charge: hoursAmount * 4 * PRICE_PER_QUARTER_HOUR
        },
    };

    console.log(`response from: ${path} statusCode: ${response.statusCode} body: ${JSON.stringify(response.body)}`);
    return response;
};
