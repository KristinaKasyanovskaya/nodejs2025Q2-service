#!/bin/bash

# Script to push Docker images to Docker Hub
# Usage: ./push-to-dockerhub.sh [your-dockerhub-username]

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Get Docker Hub username
if [ -z "$1" ]; then
    echo -e "${RED}Error: Docker Hub username is required${NC}"
    echo "Usage: ./push-to-dockerhub.sh [your-dockerhub-username]"
    exit 1
fi

DOCKER_USERNAME=$1

echo -e "${GREEN}=== Pushing Images to Docker Hub ===${NC}\n"

# Check if user is logged in
if ! docker info | grep -q "Username"; then
    echo -e "${YELLOW}Please login to Docker Hub first:${NC}"
    echo "  docker login"
    exit 1
fi

# Tag images
echo -e "${YELLOW}Tagging images...${NC}"
docker tag home-library-app:latest ${DOCKER_USERNAME}/home-library-app:latest
docker tag home-library-postgres:latest ${DOCKER_USERNAME}/home-library-postgres:latest

echo -e "${GREEN}Images tagged successfully!${NC}\n"

# Push images
echo -e "${YELLOW}Pushing application image...${NC}"
docker push ${DOCKER_USERNAME}/home-library-app:latest

echo -e "\n${YELLOW}Pushing PostgreSQL image...${NC}"
docker push ${DOCKER_USERNAME}/home-library-postgres:latest

echo -e "\n${GREEN}=== Images pushed successfully! ===${NC}"
echo -e "\n${YELLOW}Your images are available at:${NC}"
echo "  https://hub.docker.com/r/${DOCKER_USERNAME}/home-library-app"
echo "  https://hub.docker.com/r/${DOCKER_USERNAME}/home-library-postgres"

