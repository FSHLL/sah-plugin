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

// export const config = {
//     service: "app-demo",
//     provider: {
//         name: "aws",
//         region: "us-east-1",
//         environment: {
//             APP_ENV: "production",
//             QUEUE_CONNECTION: "sqs",
//             SQS_QUEUE: "${construct:jobs.queueUrl}",
//         },
//     },
//     package: {
//         patterns: [
//             "!node_modules/**",
//             "!public/storage",
//             "!resources/assets/**",
//             "!storage/**",
//             "!tests/**",
//         ],
//     },
//     functions: {
//         web: {
//             handler: "public/index.php",
//             runtime: "php-81-fpm",
//             timeout: 28,
//             events: [
//                 {
//                     httpApi: "*",
//                 },
//             ],
//         },
//         artisan: {
//             handler: "artisan",
//             runtime: "php-81-console",
//             timeout: 720,
//             events: [
//                 {
//                     schedule: {
//                         rate: "rate(1 minute)",
//                         input: '"schedule:run"',
//                     },
//                 },
//             ],
//         },
//     },
//     plugins: ["./vendor/bref/bref", "serverless-lift", "sam-plugin"],
//     constructs: {
//         jobs: {
//             type: "queue",
//             worker: {
//                 handler: "Bref\\LaravelBridge\\Queue\\QueueHandler",
//                 runtime: "php-81",
//                 timeout: 60,
//             },
//         },
//     },
//     custom: {
//         sam: {
//             activeAliasName: "ACTIVE",
//             useActiveAliasInEvents: true,
//             makeLambdasActive: true,
//         },
//     },
// };
