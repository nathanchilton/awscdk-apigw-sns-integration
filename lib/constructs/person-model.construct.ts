//Create an IAM Role for API Gateway to assume
import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import * as apigw from "aws-cdk-lib/aws-apigateway";

/**
 * These are the properties expected by the PersonModel Construct
 */
export interface IPersonModelProps {
  restApi: apigw.RestApi;
}

/**
 * This Construct creates the validation schema for the Api Gateway Request
 */
export class PersonModel extends Construct {
  readonly model: apigw.Model;

  constructor(scope: Construct, id: string, props: IPersonModelProps) {
    super(scope, id);

    /**
     * This model defines standard "person" JSON validation using JSON Schema
     * https://json-schema.org/learn/examples/geographical-location.schema.json
     *
     * https://json-schema.org/
     */
    const personModel = new apigw.Model(this, "person-model-validator", {
      restApi: props.restApi,
      contentType: "application/json",
      description: "Validates information about a person",
      modelName: "personModel",
      schema: {
        type: apigw.JsonSchemaType.OBJECT,
        required: ["firstName", "lastName"],
        properties: {
          dob: {
            type: apigw.JsonSchemaType.STRING,
            format: "date",
          },
          firstName: {
            type: apigw.JsonSchemaType.STRING,
            maxLength: 50,
          },
          lastName: {
            type: apigw.JsonSchemaType.STRING,
            maxLength: 50,
          },
          middleInitial: {
            type: apigw.JsonSchemaType.STRING,
            maxLength: 1,
          },
          aliases: {
            type: apigw.JsonSchemaType.ARRAY,
            maxLength: 3,
            items: {
              type: apigw.JsonSchemaType.STRING,
              maxLength: 50,
            }
          },
          phoneNumber: {
            type: apigw.JsonSchemaType.STRING,
            pattern: "^[+]?[(]?[0-9]{3}[)]?[-s.]?[0-9]{3}[-s.]?[0-9]{4,6}$",
          },
        },
      },
    });

    this.model = personModel;
  }
}
