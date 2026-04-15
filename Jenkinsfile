pipeline {
    // ใช้ agent ไหนก็ได้ (node ใดก็ได้ใน Jenkins)
    agent any

    // กำหนด environment variables ที่ใช้ใน pipeline
    environment {
        DOCKER_HUB_CREDENTIALS_ID = 'dockerhub-cred' // Jenkins credential สำหรับ login Docker Hub
        DOCKER_REPO               = "phoom005/express-app" // ชื่อ repo บน Docker Hub
        APP_NAME                  = "express-app" // ชื่อ container ที่จะ run
        PATH                      = "/usr/local/bin:/opt/homebrew/bin:$PATH" // path สำหรับ mac/linux (แก้ปัญหา docker/npm หาไม่เจอ)
    }

    stages {

        // Stage 1: ดึง source code ล่าสุดจาก Git repository
        stage('Checkout') {
            steps {
                echo "Checking out code..."
                checkout scm // ใช้ Jenkins SCM config ที่ตั้งไว้ (เช่น GitHub)
            }
        }

        // Stage 2: ติดตั้ง dependencies และ run test
        stage('Install & Test') {
            steps {
                sh '''
                    npm install   # ติดตั้ง dependencies
                    npm test      # run test (ช่วย ensure ว่า code ใช้งานได้ก่อน build)
                '''
            }
        }

        // Stage 3: Build Docker image
        stage('Build Docker Image') {
            steps {
                sh """
                    echo "Building Docker image: ${DOCKER_REPO}:${BUILD_NUMBER}"
                    
                    # build image โดยใช้ multi-stage (--target production)
                    # tag 2 แบบ:
                    # 1. BUILD_NUMBER (version)
                    # 2. latest (ใช้ deploy)
                    docker build --target production \
                        -t ${DOCKER_REPO}:${BUILD_NUMBER} \
                        -t ${DOCKER_REPO}:latest .
                """
            }
        }

        // Stage 4: Push image ไป Docker Hub
        stage('Push Docker Image') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: env.DOCKER_HUB_CREDENTIALS_ID,
                    usernameVariable: 'DOCKER_USER',
                    passwordVariable: 'DOCKER_PASS'
                )]) {
                    sh """
                        # login Docker Hub แบบ secure (ไม่ expose password)
                        echo "${DOCKER_PASS}" | docker login -u "${DOCKER_USER}" --password-stdin
                        
                        # push image ทั้ง version และ latest
                        docker push ${DOCKER_REPO}:${BUILD_NUMBER}
                        docker push ${DOCKER_REPO}:latest
                        
                        # logout เพื่อลด security risk
                        docker logout
                    """
                }
            }
        }

        // Stage 5: ลบ image ที่ build ออกจากเครื่อง Jenkins (cleanup space)
        stage('Cleanup Docker') {
            steps {
                sh """
                    # ลบ image ที่ build
                    docker image rm -f ${DOCKER_REPO}:${BUILD_NUMBER} || true
                    docker image rm -f ${DOCKER_REPO}:latest || true

                    # ลบ unused images / cache
                    docker image prune -af || true
                    docker builder prune -af || true
                """
            }
        }

        // Stage 6: Deploy container บนเครื่อง local (ใช้ latest image)
        stage('Deploy Local') {
            steps {
                sh """
                    echo "Deploying container ${APP_NAME}..."

                    # pull image ล่าสุดจาก Docker Hub
                    docker pull ${DOCKER_REPO}:latest

                    # stop container เดิม (ถ้ามี)
                    docker stop ${APP_NAME} || true

                    # ลบ container เดิม
                    docker rm ${APP_NAME} || true

                    # run container ใหม่
                    docker run -d \
                        --name ${APP_NAME} \
                        -p 3000:3000 \
                        ${DOCKER_REPO}:latest

                    # แสดงสถานะ container
                    docker ps --filter name=${APP_NAME} \
                        --format "table {{.Names}}\\t{{.Image}}\\t{{.Status}}"
                """
            }
        }
    }

    // ส่วน post ใช้ handle หลัง pipeline run เสร็จ
    post {
        always {
            // run ทุกครั้ง ไม่ว่าจะ success หรือ fail
            echo "Pipeline finished with status: ${currentBuild.currentResult}"
        }
        success {
            // run เมื่อ pipeline สำเร็จ
            echo "Pipeline succeeded!"
        }
        failure {
            // run เมื่อ pipeline ล้มเหลว
            echo "Pipeline failed!"
        }
    }
}