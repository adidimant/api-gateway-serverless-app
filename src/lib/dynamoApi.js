// Create clients and set shared const values outside of the handler
// Create a DocumentClient that represents the query to add an item
const dynamodb = require('aws-sdk/clients/dynamodb');
const docClient = new dynamodb.DocumentClient();

const { STATUSES } = require('./consts');

class DynamoDBApi {
    constructor(tableName) {
        this.tableName = tableName;
    }
    async putItem(dynamoItem) {
        try {
            const params = {
                TableName: this.tableName,
                Item: dynamoItem,
            };
            await docClient.put(params).promise();
        } catch (err) {
            const errorMsg = `Unable to put parking item. Error JSON:: ${err.message}`;
            throw new Error(errorMsg);
        }
    }

    async getAllItems() {
        try {
            const params = { TableName: this.tableName };
            const { Items } = await docClient.scan(params).promise();

            return Items;
        } catch (err) {
            const errorMsg = `Unable to get all items item. Error JSON:: ${err.message}`;
            throw new Error(errorMsg);
        }
    }

    async getItemById(id) {
        const params = {
            TableName: this.tableName,
            Key: { id },
        };
        try {
            const { Item } = await docClient.get(params).promise();
            return Item;
        } catch (err) {
            const errorMsg = `Unable to get parking item. params - ${JSON.stringify(params)}, Error JSON:: ${err.message}`;
            throw new Error(errorMsg);
        }
    }

    async getItemsByPlate(plate) {
        try {
            const params = {
                TableName: this.tableName,
                IndexName: indexName,
                KeyConditionExpression: '#plate = :plate_val',
                ExpressionAttributeNames: {
                    '#plate': 'plate',
                },
                ExpressionAttributeValues: {
                    ':plate_val': plate,
                },
            };

            return await docClient.query(params).promise();
        } catch (err) {
            const errorMsg = `Unable to get parking item. Error JSON:: ${err.message}`;
            throw new Error(errorMsg);
        }
    }

    async getCarLatestParkingByPlate(plate) {
        try {
            const parkingObjects = await this.getItemsByPlate(plate);
            if (_.isEmpty(parkingObjects)) {
                return {};
            }
            return _.orderBy(_.filter(parkingObjects, ({ status }) => status === STATUSES.PARKING), ['parkingDate'], ['desc'])[0];
        } catch (err) {
            const errorMsg = `Unable to get latest parking. Error JSON:: ${err.message}`;
            throw new Error(errorMsg);
        }
    }

    async updateAfterExit(id, newStatus, exitDate) {
        try {
            const params = {
                TableName: this.tableName,
                Key: {
                    id
                },
                UpdateExpression: 'set #status = :status_val, #exitDate = :exitDate_val',
                ExpressionAttributeNames: {
                    '#status': 'status',
                    '#exitDate': 'exitDate',
                },
                ExpressionAttributeValues: {
                    ':status_val': newStatus,
                    ':exitDate_val': exitDate,
                },
                ReturnValues: 'UPDATED_NEW',
            };
            await docClient.update(params).promise();
        } catch (err) {
            const errorMsg = `Unable to update item. Error JSON:: ${err.message}`;
            throw new Error(errorMsg);
        }
    }
}


module.exports = DynamoDBApi;