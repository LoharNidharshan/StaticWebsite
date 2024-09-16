# Static Website Hosting and File Upload Service
## Overview
This project demonstrates a serverless application for hosting a static website on Amazon S3 and uploading files to the S3 bucket using a Lambda function. The application uses AWS SAM (Serverless Application Model) to define and deploy the infrastructure.

## Key Components:
### Static Website Hosting: 
The website is hosted in an S3 bucket configured for static website hosting.
### File Upload Lambda Function: 
A Lambda function that uploads files from the local environment to the S3 bucket.
Public Access via S3 Bucket Policy: The S3 bucket allows public access to files for read-only access.
## Features
### Static Website Hosting: 
The S3 bucket is configured to serve files for a website, with an index and error document set to index.html.
### File Upload API: 
A POST request API endpoint uploads a file to the S3 bucket using a Lambda function.
### Public Access: 
A bucket policy allows public read access to the files in the S3 bucket.
## Architecture
### S3 Bucket: 
Hosts the static website and stores uploaded files.
### Lambda Function: 
Handles file uploads to the S3 bucket when invoked via an API Gateway endpoint.
### API Gateway: 
Provides an endpoint (/add) to trigger the Lambda function to upload files.
## SAM Template Details
The SAM template (template.yaml) defines the following resources:

## StaticWebsiteBucket:

An S3 bucket configured for static website hosting with public access for reading files.
The bucket serves the website files via an endpoint, with index.html set as the main page.
## BucketPolicy:

A policy that allows public read access (s3:GetObject) to all files in the S3 bucket.
## UploadFunction:

A Lambda function that uploads files to the S3 bucket.
The function is triggered via an API Gateway POST request at /add.
## SAM Template
```yaml
AWSTemplateFormatVersion: '2010-09-09'
Transform: AWS::Serverless-2016-10-31
Resources:
  StaticWebsiteBucket:
    Type: AWS::S3::Bucket
    Properties:
      WebsiteConfiguration:
        IndexDocument: index.html
        ErrorDocument: index.html
      PublicAccessBlockConfiguration:
        BlockPublicPolicy: false
        RestrictPublicBuckets: false

  BucketPolicy:
    Type: AWS::S3::BucketPolicy
    Properties:
      Bucket: !Ref StaticWebsiteBucket
      PolicyDocument:
        Version: "2012-10-17"
        Statement:
          - Sid: PublicReadGetObject
            Effect: Allow
            Principal: "*"
            Action: "s3:GetObject"
            Resource: !Sub "${StaticWebsiteBucket.Arn}/*"

  UploadFunction:
    Type: AWS::Serverless::Function
    Properties:
      Handler: index.handler
      Runtime: nodejs18.x
      CodeUri: ./src
      Environment:
        Variables:
          BUCKET_NAME: !Ref StaticWebsiteBucket
      Policies:
        - S3WritePolicy:
            BucketName: !Ref StaticWebsiteBucket
      Events:
        HelloWorld:
          Type: Api
          Properties:
            Path: /add
            Method: post

Outputs:
  WebsiteURL:
    Description: "URL for the static website"
    Value: !GetAtt StaticWebsiteBucket.WebsiteURL

  UploadFunctionName:
    Description: "Name of the Lambda function to upload data to S3"
    Value: !Ref UploadFunction
```
## Lambda Function Code
The UploadFunction is responsible for uploading a file from the local environment to the S3 bucket.

## File Upload (index.js)
```javascript
import AWS from 'aws-sdk';
import fs from 'fs';
import path from 'path';

const s3 = new AWS.S3();

export const handler = async (event) => {
    const bucketName = process.env.BUCKET_NAME;
    const filePath = 'example.txt'; // The path to the local file
    const objectKey = 'example.txt'; // The file name/key in the S3 bucket

    try {
        // Create a read stream from the local file
        const readStream = fs.createReadStream(filePath);

        // Set up the S3 upload parameters
        const params = {
            Bucket: bucketName,
            Key: objectKey,
            Body: readStream,
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
```
## API Endpoints
POST /add: Uploads a file to the S3 bucket.
The file path and object key can be customized in the Lambda function code.

## Example Response:

```json
{
  "message": "File uploaded successfully to <bucket-name>/example.txt"
}
```
## Setup & Deployment
## Prerequisites
### AWS Account: 
You need an AWS account with sufficient privileges to create Lambda functions, S3 buckets, and API Gateway routes.
### Node.js: 
Ensure Node.js is installed for local development.
### AWS SAM CLI: 
Install the AWS SAM CLI to build and deploy the application.
## Steps to Deploy
### Build the application:

```bash
sam build
```
## Deploy the application:

```bash
sam deploy --guided
```
Follow the prompts to specify parameters like stack name, region, etc.

## Access the endpoints:

## Static Website URL: 
After deployment, the URL for the hosted static website will be available as output.
### File Upload API: Use the /add API endpoint to upload files to the S3 bucket.
Accessing the Static Website
Once the deployment is complete, the S3 bucket will host the static website at a publicly accessible URL, which is output as WebsiteURL.

To upload content dynamically, use the file upload API (POST /add) to upload files from the local environment to the S3 bucket.
