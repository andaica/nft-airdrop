#!/bin/bash
SERVICE_NAME="nftairdrop"
CONTAINER_REGISTRY="registry.gitlab.com/dare-dev/dare-chain/nftairdrop"
PORT=3131

usage() { echo "Usage: $0 [-e <stage | pre | prod>]" 1>&2; exit 1; }

migrate() { docker exec -w /code/admin ${SERVICE_NAME} python manage.py migrate; }

run() {    
    envName=$1
    docker rm -f ${SERVICE_NAME} || true
    docker pull ${CONTAINER_REGISTRY}:${envName}_latest
    docker run -d --restart always \
        -p ${PORT}:3000 --name ${SERVICE_NAME} \
        ${CONTAINER_REGISTRY}:${envName}_latest
    docker image prune -f
}

while getopts ":e:" o; do
    case ${o} in
        e)
            e=${OPTARG}
            if [ "$e" == "stage" ] || [ "$e" == "pre" ] || [ "$e" == "prod" ]; then
                echo "ENV = ${e}"
                run ${e}
            else
                usage
            fi
        ;;        
        *)
            usage
        ;;
    esac
done
shift $((OPTIND-1))
echo "Done."