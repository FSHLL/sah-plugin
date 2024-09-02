const path = require('path');
const process = require('process');

const baseConfig = {
    service: "app",
    provider: {
        name: "aws",
        region: "us-east-1"
    },
    package: {
        patterns: [
            "./**",
        ],
    },
    functions: {
        web: {
            handler: "src/index",
            runtime: "nodejs20.x",
            timeout: 28,
            events: [
                {
                    httpApi: "*",
                },
                {
                    schedule: {
                        rate: "rate(1 minute)",
                        input: '"schedule:run"',
                    },
                },
                {
                    sqs: "arn:aws:sqs:region:XXXXXX:MyQueue"
                }
            ],
        },
    },
    plugins: [path.join(process.cwd(), "src/index.js")],
};

module.exports = {
    baseConfig
}