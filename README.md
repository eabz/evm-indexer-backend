<h1 align="center">
<strong>EVM Indexer API</strong>
</h1>

Welcome to the repository for the backend API code for Cloudflare Workers! This repository contains the source code for the serverless backend API that powers the EVM Indexer API.

## Requirements

- [Node](https://nodejs.org/en/)
- [Wrangler](https://github.com/cloudflare/wrangler2)

Before starting, you must have logged in into cloudflare using wrangler.

## Installation

1. Clone the repository

```
git clone https://github.com/kindynosmx/evm-indexer-backend && cd evm-indexer-backend
```

2. Start de worker in local mode.

```
yarn start
```

for production

```
yarn deploy
```

## Commands

- `start`: runs your application on `localhost:8787`.
- `deploy`: deploys the application to production.
- `format`: runs the prettier fixes for all the files.
- `lint`: runs the linter in all components and pages.

Check [package.json](./package.json) for other useful scripts.

## Contribution Guidelines

Developers are expected to follow contribution guidelines to keep the codebase efficient, readable, and standardized. Contribution guidelines are clearly laid out so developers and contributors can submit their work without much revision, resulting in faster development and more useful contributions. These guideliness are specified through the `eslint` modules.
