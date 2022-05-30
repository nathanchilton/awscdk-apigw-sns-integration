import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as sns from "aws-cdk-lib/aws-sns";
import * as apigw from "aws-cdk-lib/aws-apigateway";
import { SNSIntegration } from './constructs/sns-integration.construct';
import { SNSApiGatewayRole } from './constructs/sns-api-gateway-role.construct';
import { ApiMethodOptions } from './constructs/api-method-options.construct';

export class ApigwSnsCdkStack extends Stack {

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    //Create the SNS Topic
    const snsTopic = new sns.Topic(this, "PeopleTopic", {
      displayName: "People",
      topicName: "People"
    });

    //Create a role assumed by the APIGW Principal with Allow send message to the SQS Queue
    const snsApiGatewayRole = new SNSApiGatewayRole(
      this,
      "Api Gateway Role Construct",
      {
        snsTopic: snsTopic
      }
    );

    //Create an integration that allows the API to expose the SQS Queue
    const sqsIntegration = new SNSIntegration(
      this,
      "SQS Integration Construct",
      {
        snsTopic: snsTopic,
        apiGatewayRole: snsApiGatewayRole.role,
      }
    );

    //create the API in ApiGateway
    const restApi = new apigw.RestApi(this, "API Endpoint", {
      deployOptions: {
        stageName: "dev",
      },
      restApiName: "APIGWtoSNSTopic",
    });

    //Create a method options object with validations and transformations
    const apiMethodOptions = new ApiMethodOptions(
      this,
      "API Method Options Construct",
      {
        restApi: restApi,
      }
    );

    //Create a Resource Method, that combines the sqs integration, message validation and transformation
    const toTopic = restApi.root.addResource('to-topic');

    // restApi.root.addMethod(
    toTopic.addMethod(
      "POST",
      sqsIntegration.integration,
      apiMethodOptions.methodOptions
    );
  }
}
