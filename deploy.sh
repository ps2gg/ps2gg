clear

if [ -z ${1+x} ]; then 
  echo "Please pass the environment name to this script (dev/prod)"
  exit 1
fi

# Create private image registry on our swarm
echo "Setting up private docker registry..."
docker service create -d \
  --name registry \
  -p 5000:5000 \
  --mount type=volume,source=registry,destination=/var/lib/registry,volume-driver=local \
  registry:latest

# Custom overlay network to connect new and legacy stack
echo "Setting up overlay network"
docker network create --driver overlay --attachable ps2gg_internal

# Cleanup
echo "Cleaning up unused images and containers..."
docker image prune -a -f
docker rm $(docker ps -a -q)
clear

# node_modules
yarn
clear

# create db directory
mkdir -p .data

# Build to local registry
docker build . \
  -t "127.0.0.1:5000/ps2gg:prod" \
  -f "docker/Dockerfile"
docker push "127.0.0.1:5000/ps2gg:prod"

docker build . \
  -t "127.0.0.1:5000/ps2gg:dev" \
  -f "docker/Dockerfile.dev"
docker push "127.0.0.1:5000/ps2gg:dev"

# Generate config
docker-compose \
  -f "docker/compose/docker-compose.base.yml" \
  -f "docker/compose/docker-compose.$1.yml" \
  config > "docker/compose/out/docker-compose.$1.out.yml"

# Deploy
docker stack deploy \
  --prune \
  --compose-file "docker/compose/out/docker-compose.$1.out.yml" \
  "ps2gg"

echo "🙏 dev garanty no ban you too the circle of paffdaddy 🙏"
echo 'For logs, run "docker service log ps2gg_<service> -f --tail 100"'