#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
// import { ApigwSqsCdkStack } from '../lib/apigw-sqs-cdk-stack';
import { ApigwSnsCdkStack } from '../lib/apigw-sns-cdk-stack';

const app = new cdk.App();
// new ApigwSqsCdkStack(app, 'ApigwSqsCdkStack', {});
new ApigwSnsCdkStack(app, 'ApigwSnsCdkStack', {});
