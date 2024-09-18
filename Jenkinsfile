import groovy.transform.Field

@Field def branchConfig = [
    'main': [host: "52.23.246.36", env: 'stage', secrets: 'nftairdrop-stage'],
    'prod': [host: "125.212.226.160", env: 'prod', secrets: 'nftairdrop-prod']
]

def getHostFromBranch(branch) {
    return branchConfig.get(branch, [host: 'unknown']).host
}

def getEnvNameFromBranch(branch) {
    return branchConfig.get(branch, [env: 'unknown']).env
}

def getSecretsNameFromBranch(branch) {
    return branchConfig.get(branch, [secrets: 'unknown']).secrets
}

def getProjectName() {
    return 'nftairdrop'
}

pipeline {
    agent any

    environment {
        REGISTRY_URL = 'https://registry.gitlab.com'
        CONTAINER_REGISTRY = 'registry.gitlab.com/dare-dev/dare-chain/nftairdrop'
        DOCKER_CREDENTIALS = 'gitlab-protocol'
    }

    stages {
        stage('Build STAGING') {
            when {
                branch 'main'
            }
            environment {
                ENV_NAME = getEnvNameFromBranch(env.BRANCH_NAME)
                AWS_SECRET_ID = getSecretsNameFromBranch(env.BRANCH_NAME)
            }
            options {
                withAWS(region:'us-east-1', credentials:'aws-dev')
            }
            steps {
                echo 'Building..'
                script {
                    docker.withRegistry("${REGISTRY_URL}", "${DOCKER_CREDENTIALS}") {
                        echo 'Build & push docker image....'
                        // sh "AWS_SECRET_ID=${AWS_SECRET_ID} ./aws_get_secrets.sh" // get aws secrets
                        
                        def customImage = docker.build("${CONTAINER_REGISTRY}:${ENV_NAME}_${env.BUILD_ID}")
                        customImage.push("${ENV_NAME}_latest")
                    }
                }
            }
        }

        stage('Build PROD') {
            when {
                branch 'prod'
            }
            environment {
                ENV_NAME = getEnvNameFromBranch(env.BRANCH_NAME)
                AWS_SECRET_ID = getSecretsNameFromBranch(env.BRANCH_NAME)
            }
            options {
                withAWS(region:'us-east-1', credentials:'aws-prod')
            }
            steps {
                echo 'Building..'
                script {
                    docker.withRegistry("${REGISTRY_URL}", "${DOCKER_CREDENTIALS}") {
                        echo 'Build & push docker image....'
                        // sh "AWS_SECRET_ID=${AWS_SECRET_ID} ./aws_get_secrets.sh" // get aws secrets
                        
                        def customImage = docker.build("${CONTAINER_REGISTRY}:${ENV_NAME}_${env.BUILD_ID}")
                        customImage.push("${ENV_NAME}_latest")
                    }
                }
            }
        }

        stage('Deploy STAGE') {
            when {
                branch 'main'
            }
            environment {
                ENV_NAME = getEnvNameFromBranch(env.BRANCH_NAME)
                PROJECT_FOLDER = getProjectName()
                HOST = getHostFromBranch(env.BRANCH_NAME)
            }
            options {
                withAWS(region:'us-east-1', credentials:'aws-dev')
            }
            steps {
                echo 'Deploying STAGING....'
                //sh 'NAMESPACE=stage . ./deploy.sh'

                script {                
                    withCredentials ([sshUserPrivateKey(credentialsId: 'ssh-deploy', keyFileVariable: 'identity', passphraseVariable: '', usernameVariable: 'userName')]) {
                        def remote = [:]
                        remote.name = 'remote'
                        remote.identityFile = identity
                        remote.host = HOST
                        remote.user = userName
                        remote.allowAnyHosts = true

                        sshCommand remote: remote, command: "cd ~/projects/${PROJECT_FOLDER}; git checkout main; git pull; ./start_docker_ci.sh -e ${ENV_NAME}"                    
                    }
                }
            }
        }

        stage('Deploy PROD') {
            when {
                branch 'prod'
            }
            environment {
                ENV_NAME = getEnvNameFromBranch(env.BRANCH_NAME)
                PROJECT_FOLDER = getProjectName()
                HOST = getHostFromBranch(env.BRANCH_NAME)
            }
            options {
                withAWS(region:'us-east-1', credentials:'aws-prod')
            }
            steps {                
                echo 'Deploying to PROD....'

                script {                
                    withCredentials ([sshUserPrivateKey(credentialsId: 'ssh-deploy', keyFileVariable: 'identity', passphraseVariable: '', usernameVariable: 'userName')]) {
                        def remote = [:]
                        remote.name = 'remote'
                        remote.identityFile = identity
                        remote.host = HOST
                        remote.user = userName
                        remote.allowAnyHosts = true

                        sshCommand remote: remote, command: "cd ~/projects/${PROJECT_FOLDER}; git checkout prod; git pull; ./start_docker_ci.sh -e ${ENV_NAME}"                    
                    }
                }
            }
        }
    }

    post {
        success {
            slackSend (color: '#00FF00', message: "SUCCESSFUL: Job '${env.JOB_NAME} [${env.BUILD_NUMBER}]' (${env.BUILD_URL})")
        }

        failure {
            slackSend (color: '#FF0000', message: "FAILED: Job '${env.JOB_NAME} [${env.BUILD_NUMBER}]' (${env.BUILD_URL})")
        }
    }
}