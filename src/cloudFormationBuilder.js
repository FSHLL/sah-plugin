
'use strict';

function addAliases(aliases, compiledResources, activeAliasName) {
    const functionEntries = getResources(compiledResources, 'AWS::Lambda::Function');

    const lambdaVersionEntries = getResources(compiledResources, 'AWS::Lambda::Version');

    const functionNames = functionEntries.map((f) => f[0]);

    const aliasConfig = functionNames
        .map((lambdaName) => {
            const functionVersion = getActualFunctionVersion(lambdaName, lambdaVersionEntries);

            if (!functionVersion) {
                return;
            }

            return aliases.reduce((acc, alias, index) => {
                acc[`${lambdaName}Alias${alias === activeAliasName ? '' : index}`] = {
                    Type: 'AWS::Lambda::Alias',
                    Properties: {
                        Name: alias.replace(/[^\w\-_]/g, '-'),
                        FunctionName: {
                            'Fn::GetAtt': [lambdaName, 'Arn'],
                        },
                        FunctionVersion: functionVersion,
                    },
                    DependsOn: [lambdaName],
                };
                return acc;
            }, {});
        })
        .filter((item) => Boolean(item))
        .reduce((acc, curr) => ({ ...acc, ...curr }), {});

    return aliasConfig;
}

function addAPIGatewayConfig(compiledResources) {
    const apiGatewayMethods = getResources(compiledResources, 'AWS::ApiGatewayV2::Integration').filter(
        ([, resource]) => resource.Properties.IntegrationType === 'AWS_PROXY'
    );

    apiGatewayMethods.forEach(([resourceName]) => {
        compiledResources[resourceName].Properties.IntegrationUri['Fn::GetAtt'][0] += 'Alias';
        compiledResources[resourceName].Properties.IntegrationUri['Fn::GetAtt'][1] = 'AliasArn';
    });

    return compiledResources;
}

function addEventSourceConfig(compiledResources) {
    const eventSourceMethods = getResources(compiledResources, 'AWS::Lambda::EventSourceMapping');

    eventSourceMethods.forEach(([resourceName,]) => {
        compiledResources[resourceName].Properties.FunctionName['Fn::GetAtt'][0] += 'Alias';
        compiledResources[resourceName].Properties.FunctionName['Fn::GetAtt'][1] = 'AliasArn';
    });

    return compiledResources;
}

function addEventRuleConfig(compiledResources) {
    const eventRuleMethods = getResources(compiledResources, 'AWS::Events::Rule');

    eventRuleMethods.forEach(([resourceName,]) => {
        compiledResources[resourceName].Properties.Targets.forEach((target) => {
            target.Arn['Fn::GetAtt'][0] += 'Alias'
            target.Arn['Fn::GetAtt'][1] = 'AliasArn'
        });
    });

    const lambdaPermissions = getResources(compiledResources, 'AWS::Lambda::Permission').filter(
        ([, resource]) => resource.Properties.Principal === 'events.amazonaws.com'
    );

    lambdaPermissions.forEach(([resourceName, resource]) => {
        const existingLambdaName = resource.Properties.FunctionName['Fn::GetAtt'][0];

        compiledResources[resourceName].Properties.FunctionName = {
            Ref: `${existingLambdaName}Alias`,
        };
        compiledResources[resourceName].DependsOn = [`${existingLambdaName}Alias`];
    });

    return compiledResources;
}

function getResources(compiledResources, type) {
    return Object.entries(compiledResources).filter(([, resource]) => resource.Type === type);
}

function getActualFunctionVersion(arn, lambdaVersionResourceEntries) {
    const key = getFunctionKey(arn, lambdaVersionResourceEntries);
    return key && { 'Fn::GetAtt': [key, 'Version'] };
}

function getFunctionKey(arn, lambdaVersionResourceEntries) {
    const [key] = lambdaVersionResourceEntries.find(([, resource]) => resource.Properties.FunctionName.Ref === arn) || [];
    return key;
}

module.exports = {
    addAliases,
    addAPIGatewayConfig,
    addEventSourceConfig,
    addEventRuleConfig,
}