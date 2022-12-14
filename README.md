# ps2.gg

This is the home of PS2.gg, the inofficial ranked mode for Planetside.
See how you perform in real-time with 1v1-elo-based skill brackets and seasonal leaderboards. All in an in-game overlay that feels like it's part of the game itself! 

This monorepo includes all microservices used to serve the website and overlay.

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
| discord  | Big Peepo on Discord                    | :5000    | -/-      | -/-    |
| registry | Hosts Docker images                     | :5000    | -/-      | -/-    |

## Code Conventions

Our code-style is fully managed by eslint and prettier, so you needn't think too much about it. For commits, please use the [Conventional Commit](https://www.conventionalcommits.org/en/v1.0.0/) format.
