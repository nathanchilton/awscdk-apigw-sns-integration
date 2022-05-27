//Create an IAM Role for API Gateway to assume
import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import * as sns from "aws-cdk-lib/aws-sns";
import * as iam from "aws-cdk-lib/aws-iam";
import * as apigw from "aws-cdk-lib/aws-apigateway";
import { snsResponseTemplate } from "../templates/sns-response.template";

/**
 * These are the properties expected by the SQSIntegration Construct
 */
export interface ISNSIntegrationProps {
  snsTopic: sns.Topic;
  apiGatewayRole: iam.IRole;
}

/**
 * This Construct creates the integration options needed to attach to a REST API Method
 */
export class SNSIntegration extends Construct {
  integration: apigw.AwsIntegration; // this will be used by the parent stack to combine with other Constructs

  constructor(scope: Construct, id: string, props: ISNSIntegrationProps) {
    super(scope, id);

    /**
     * Create an integration response for SQS that transforms the output
     * this is the handling of the response from SQS prior to REST endpoint handling.
     * When the response calls for application/json, use VTL to transform the output
     */
    const integrationResponse: apigw.IntegrationResponse = {
      statusCode: "200",
      responseTemplates: {
        "application/json": snsResponseTemplate,
      },
    };

    /**
     * Create integration options for API Method, declaring the role APIGW should assume
     * Only mapped content types will pass through (x-www-form-urlencoded), on the receipt of
     * messages in the format of "application/json", transform the input to form url encoded
     */
    const integrationOptions: apigw.IntegrationOptions = {
      credentialsRole: props.apiGatewayRole,
      passthroughBehavior: apigw.PassthroughBehavior.NEVER,
      requestParameters: {
        "integration.request.header.Content-Type":
          "'application/x-www-form-urlencoded'",
      },
      requestTemplates: {
        // "application/json": `Action=SendMessage&MessageBody=$input.body`,
        "application/json": `Action=Publish&TargetArn=Folks&Message=$input.body`,
        // "application/json": "#set ($root=$input.path('$')) { \"stage\": \"$root.name\", \"user-id\": \"$root.key\" }",

      },
      integrationResponses: [integrationResponse],
    };

    /**
     * Create the SQS Integration that allows POST method calls from Api Gateway to enqueue messages
     * in the message queue. *Note the use of "Stack.of" as Constructs do not have the "account" property
     * that you would find on the Stack object.
     */
    this.integration = new apigw.AwsIntegration({
      service: "sns",
      path: `${Stack.of(this).account}/${props.snsTopic.topicName}`,
      integrationHttpMethod: "POST",
      options: integrationOptions,
    });
  }
}
