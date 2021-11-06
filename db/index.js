const AWS = require('aws-sdk');

const dynamoClient = new AWS.DynamoDB.DocumentClient({
  region: process.env.AWS_DEFAULT_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  sessionToken: process.env.AWS_SESSION_TOKEN
});

module.exports = dynamoClient;