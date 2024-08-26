// const AWS = require('aws-sdk');
import AWS from 'aws-sdk'
// const fs = require('fs');
import fs from 'fs'
// const path = require('path');
import path from 'path'
const s3 = new AWS.S3();

export const handler = async (event) => {
    const bucketName = process.env.BUCKET_NAME;
    const filePath = 'example.txt'; // The path to the local file
    const objectKey = 'example.txt'; // The file name/key in the S3 bucket

    try {
        // Write some content to the local file as an example
        // const writeStream = fs.createWriteStream(filePath);
        // writeStream.write('This is the content to be uploaded to S3.');
        // writeStream.end();

        // Wait for the file to be written
        // await new Promise((resolve, reject) => {
        //     writeStream.on('finish', resolve);
        //     writeStream.on('error', reject);
        // });

        // Create a read stream from the local file
        const readStream = fs.createReadStream(filePath);

        // Set up the S3 upload parameters
        const params = {
            Bucket: bucketName,
            Key: objectKey,
            Body: readStream
        };

        // Upload the file to S3
        await s3.upload(params).promise();

        console.log(`File uploaded successfully to ${bucketName}/${objectKey}`);
        return {
            statusCode: 200,
            body: JSON.stringify({
                message: `File uploaded successfully to ${bucketName}/${objectKey}`,
            }),
        };
    } catch (err) {
        console.error(`Error uploading file: ${err.message}`);
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: `Error uploading file: ${err.message}`,
            }),
        };
    }
};
