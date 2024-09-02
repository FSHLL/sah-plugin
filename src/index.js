'use strict';

const { addAliases, addAPIGatewayConfig, addEventRuleConfig, addEventSourceConfig } = require("./cloudFormationBuilder");

// Lifecycle events Cheat sheet: https://gist.github.com/HyperBrain/50d38027a8f57778d5b0f135d80ea406
const PLUGIN_CONFIG_KEY = 'sam';
const PLUGIN_NAME = 'sam-plugin';

const DEFAULT_CONFIG = {
    activeAliasName: 'INACTIVE',
    useActiveAliasInEvents: false,
    makeLambdasActive: false,
    aliases: [],
};

class SAMPlugin {
    constructor(serverless) {
        this.serverless = serverless;

        this.validateConfig();

        this.hooks = {
            'before:package:finalize': this.updateCloudFormation.bind(this),
        };
    }

    validateConfig() {
        const customConfig = this.serverless.service.custom;
        if (!customConfig) {
            this.throwError('Missing custom configuration object');
        }

        const config = customConfig[PLUGIN_CONFIG_KEY];

        if (!config) {
            this.throwError(`Missing custom.${PLUGIN_CONFIG_KEY} configuration object`);
        }

        const newConfig = { ...DEFAULT_CONFIG, ...config };

        if (!newConfig.activeAliasName) {
            this.throwError(`Missing custom.${PLUGIN_CONFIG_KEY}.activeAliasName property`);
        }
    }

    updateCloudFormation() {
        const config = { ...DEFAULT_CONFIG, ...this.serverless.service.custom[PLUGIN_CONFIG_KEY] };

        if (config.makeLambdasActive) {
            config.aliases.push(config.activeAliasName);
        }

        const cfResources = this.serverless.service.provider.compiledCloudFormationTemplate;
        const compiledResources = cfResources.Resources;

        cfResources.Resources = {
            ...cfResources.Resources,
            ...addAliases(config.aliases, compiledResources, config.activeAliasName),
        };

        if (config.useActiveAliasInEvents) {
            cfResources.Resources = {
                ...cfResources.Resources,
                ...addAPIGatewayConfig(compiledResources),
                ...addEventSourceConfig(compiledResources),
                ...addEventRuleConfig(compiledResources),
            };
        }
    }

    throwError(msg) {
        const err_msg = `${PLUGIN_NAME}: ERROR: ${msg}`;
        throw new this.serverless.classes.Error(err_msg);
    }
}

module.exports = SAMPlugin