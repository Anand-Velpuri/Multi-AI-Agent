pipeline{
    agent any

    environment {
        SONAR_PROJECT_KEY = 'LLMOPS'
		SONAR_SCANNER_HOME = tool 'Sonarqube'
        AWS_REGION = 'us-east-1'
        ECR_REPO = 'my-repo'
        IMAGE_TAG = 'latest'
	}

    stages{
        stage('Cloning Github repo to Jenkins'){
            steps{
                script{
                    echo 'Cloning Github repo to Jenkins............'
                    checkout scmGit(branches: [[name: '*/main']], extensions: [], userRemoteConfigs: [[credentialsId: 'github-token', url: 'https://github.com/Anand-Velpuri/Multi-AI-Agent.git']])
                }
            }
        }
        
    }
}