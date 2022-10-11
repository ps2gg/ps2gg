# ps2.gg

A monorepo of microservices used to serve ps2.gg

<br>

## Development

This project was generated using [Nx](https://nx.dev). <br>
You'll need a solid understanding of Nx to work with this project.

`bash deploy.sh [dev/prod]` will deploy the whole stack to Docker Swarm.

## Requirements

Nothing but [Docker](https://www.docker.com/) in Swarm Mode.

## Containers

| Name     | Description                             | Internal | External | Domain |
| -------- | --------------------------------------- | -------- | -------- | ------ |
| census   | Relays Census data to internal services | -/-      | -/-      | -/-    |
| registry | Hosts Docker images                     | :5000    | -/-      | -/-    |

## Code Conventions

Our code-style is fully managed by eslint and prettier, so you needn't think too much about it. For commits, please use the [Conventional Commit](https://www.conventionalcommits.org/en/v1.0.0/) format.
