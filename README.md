# ps2.gg

Ps2.gg creates a ranked mode for Planetside. With 1v1-elo-based skill brackets, seasonal leaderboards and an in-game overlay to see how you perform in real-time. This monorepo includes all microservices used to serve the website and overlay.

<br>

## Development

This project was generated using [Nx](https://nx.dev). <br>
You'll need a solid understanding of Nx to work with this project.

`bash deploy.sh [dev/prod]` will deploy the whole stack to Docker Swarm.

## Requirements

- [Docker](https://www.docker.com/) in Swarm Mode.
- [Node](https://nodejs.org) with [yarn](https://www.npmjs.com/package/yarn)
- A discord token as docker secret<br>
  Add with `printf '<token>' | docker secret create discord_token -`

## Containers

| Name     | Description                             | Internal | External | Domain |
| -------- | --------------------------------------- | -------- | -------- | ------ |
| census   | Relays Census data to internal services | -/-      | -/-      | -/-    |
| registry | Hosts Docker images                     | :5000    | -/-      | -/-    |

## Code Conventions

Our code-style is fully managed by eslint and prettier, so you needn't think too much about it. For commits, please use the [Conventional Commit](https://www.conventionalcommits.org/en/v1.0.0/) format.
