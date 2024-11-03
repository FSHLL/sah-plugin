# SAH Plugin

[![serverless][sls-image]][sls-url]

A Serverless plugin to create AWS Lambda aliases without imposing a way-of-working with them.

### This plugin is based in [serverless-simple-alias](https://github.com/digio/serverless-simple-alias), we only add support to other events apart from api gateway and specific functionalities to integrate with [SAH](https://github.com/FSHLL/sah)

## Motivation

This plugin assists with two use cases:
1. Creating an "active" alias, and using that alias in API Gateway Event Sources and Event Rules.

## Installation

```
npm install --save-dev sah-plugin
```

Add the plugin to serverless.yml:

```yaml
plugins:
  - sah-plugin
```

**Note**: Node 10.x or higher runtime required.

## Usage

Inside your Serverless config, include this plugin and define a `custom.sah` object and specify the activeAliasName

```yaml
plugins:
  - sah-plugin
  ...

custom:
  sah:
    activeAliasName: 'ACTIVE'  # Default: 'ACTIVE'
    useActiveAliasInEvents: true   # Default: false. Whether to change API Gateway to target the active alias or not
    makeLambdasActive: true  # Default: false. Whether to apply the active alias to the lambdas that are being deployed now. Could vary per environment.
    sahUrl: 'http://{app_url}/api/projects/{project_id}/deployments' # Default: null. It is not mandatory but you can use it if you wish to synchronize your displays with your SAH application.
    sahToken: '1|fZH1G7lyRZZKcK4AD8PaaQlXlTeeM7bc2XdjOsqBeecfb75f' # Default: null. It is not mandatory but you can use it if you wish to synchronize your displays with your SAH application.
```

In practice, different environments have different deployment requirements. For example, in production it
may be preferable to not deploy the new versions of the Lambdas with the active tag.

## How it works

This plugin changes the following generated AWS CloudFormation templates:
- Adds an `AWS::Lambda::Alias` resource for each alias, per function, and links each resource to the corresponding `AWS::Function::Version` resource.
- Changes the existing `AWS::ApiGatewayV2::Integration` resources (that have `Property.IntegrationType` of `AWS_PROXY`) to
  include the active-alias name in the `Property.IntegrationUri`
- Changes the existing `AWS::Lambda::EventSourceMapping` resources to include the active-alias name in the `Property.FunctionName`
- Changes the existing `AWS::Events::Rule` resources to include the active-alias name in the `Property.Targets`
- Changes the existing `AWS::Lambda::Permission` resources to point the `Properties.FunctionName` to the `AWS::Lambda::Alias` resource.

[sls-image]: http://public.serverless.com/badges/v3.svg
[sls-url]: http://www.serverless.com
