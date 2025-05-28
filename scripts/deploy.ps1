param (
    [Parameter(Mandatory=$true)]
    [string]$CloudProvider,
    
    [Parameter(Mandatory=$true)]
    [string]$ClusterName,
    
    [Parameter(Mandatory=$false)]
    [string]$ResourceGroup = "",
    
    [Parameter(Mandatory=$false)]
    [string]$Region = "us-west-2"
)

# Base directory for all kubernetes files
$KubernetesDir = "infrastructure/kubernetes"

function Deploy-AWS {
    Write-Host "Deploying to AWS EKS cluster: $ClusterName in region $Region" -ForegroundColor Green
    
    # Verify AWS CLI is installed
    try {
        aws --version
    } catch {
        Write-Host "AWS CLI is not installed. Please install it first: https://aws.amazon.com/cli/" -ForegroundColor Red
        exit 1
    }

    # Configure AWS CLI to use the cluster
    Write-Host "Configuring AWS CLI for EKS cluster..." -ForegroundColor Yellow
    aws eks update-kubeconfig --name $ClusterName --region $Region

    # Deploy secrets first
    Write-Host "Deploying secrets..." -ForegroundColor Yellow
    aws eks apply -f "$KubernetesDir/data-warehouse-secrets.yaml"
    aws eks apply -f "$KubernetesDir/blockchain-secrets.yaml"
    
    # Deploy data warehouse
    Write-Host "Deploying data warehouse..." -ForegroundColor Yellow
    aws eks apply -f "$KubernetesDir/data-warehouse.yaml"
    
    # Deploy cron job
    Write-Host "Deploying data sync job..." -ForegroundColor Yellow
    aws eks apply -f "$KubernetesDir/jobs/data-sync.yaml"
    
    # Deploy main application
    Write-Host "Deploying main application..." -ForegroundColor Yellow
    aws eks apply -f "$KubernetesDir/deployment.yaml"
    
    Write-Host "AWS EKS deployment completed!" -ForegroundColor Green
}

function Deploy-Azure {
    Write-Host "Deploying to Azure AKS cluster: $ClusterName in resource group $ResourceGroup" -ForegroundColor Green
    
    # Verify Azure CLI is installed
    try {
        az --version
    } catch {
        Write-Host "Azure CLI is not installed. Please install it first: https://docs.microsoft.com/en-us/cli/azure/install-azure-cli" -ForegroundColor Red
        exit 1
    }

    # Configure Azure CLI to use the cluster
    Write-Host "Configuring Azure CLI for AKS cluster..." -ForegroundColor Yellow
    az aks get-credentials --resource-group $ResourceGroup --name $ClusterName
    
    # Since az CLI doesn't have direct k8s apply, use kubectl if it's installed from az
    # Otherwise, convert k8s YAML to ARM templates and deploy
    $KubectlPath = Join-Path -Path $env:USERPROFILE -ChildPath ".azure-kubectl\kubectl.exe"
    
    if (Test-Path $KubectlPath) {
        Write-Host "Using Azure's managed kubectl..." -ForegroundColor Yellow
        
        # Deploy secrets first
        & $KubectlPath apply -f "$KubernetesDir/data-warehouse-secrets.yaml"
        & $KubectlPath apply -f "$KubernetesDir/blockchain-secrets.yaml"
        
        # Deploy data warehouse
        & $KubectlPath apply -f "$KubernetesDir/data-warehouse.yaml"
        
        # Deploy cron job
        & $KubectlPath apply -f "$KubernetesDir/jobs/data-sync.yaml"
        
        # Deploy main application
        & $KubectlPath apply -f "$KubernetesDir/deployment.yaml"
    } else {
        Write-Host "Azure CLI's kubectl not found. Using az CLI commands instead..." -ForegroundColor Yellow
        
        # Deploy using az CLI commands
        # This is a simplified approach. In a real scenario, you'd convert K8s YAML to ARM templates
        az aks command invoke --resource-group $ResourceGroup --name $ClusterName --command "kubectl apply -f $KubernetesDir/data-warehouse-secrets.yaml"
        az aks command invoke --resource-group $ResourceGroup --name $ClusterName --command "kubectl apply -f $KubernetesDir/blockchain-secrets.yaml"
        az aks command invoke --resource-group $ResourceGroup --name $ClusterName --command "kubectl apply -f $KubernetesDir/data-warehouse.yaml"
        az aks command invoke --resource-group $ResourceGroup --name $ClusterName --command "kubectl apply -f $KubernetesDir/jobs/data-sync.yaml"
        az aks command invoke --resource-group $ResourceGroup --name $ClusterName --command "kubectl apply -f $KubernetesDir/deployment.yaml"
    }
    
    Write-Host "Azure AKS deployment completed!" -ForegroundColor Green
}

function Deploy-GCP {
    Write-Host "Deploying to GCP GKE cluster: $ClusterName in region $Region" -ForegroundColor Green
    
    # Verify Google Cloud SDK is installed
    try {
        gcloud --version
    } catch {
        Write-Host "Google Cloud SDK is not installed. Please install it first: https://cloud.google.com/sdk/docs/install" -ForegroundColor Red
        exit 1
    }

    # Configure gcloud to use the cluster
    Write-Host "Configuring gcloud for GKE cluster..." -ForegroundColor Yellow
    gcloud container clusters get-credentials $ClusterName --region $Region
    
    # Use gcloud to apply Kubernetes manifests
    Write-Host "Deploying components using gcloud..." -ForegroundColor Yellow
    
    # Deploy using gcloud container commands
    gcloud container clusters get-credentials $ClusterName --region $Region
    
    # Use the downloaded kubectl from gcloud
    $GcloudKubectlPath = Join-Path -Path $env:APPDATA -ChildPath "gcloud\bin\kubectl.exe"
    
    if (Test-Path $GcloudKubectlPath) {
        Write-Host "Using gcloud's kubectl..." -ForegroundColor Yellow
        
        # Deploy secrets first
        & $GcloudKubectlPath apply -f "$KubernetesDir/data-warehouse-secrets.yaml"
        & $GcloudKubectlPath apply -f "$KubernetesDir/blockchain-secrets.yaml"
        
        # Deploy data warehouse
        & $GcloudKubectlPath apply -f "$KubernetesDir/data-warehouse.yaml"
        
        # Deploy cron job
        & $GcloudKubectlPath apply -f "$KubernetesDir/jobs/data-sync.yaml"
        
        # Deploy main application
        & $GcloudKubectlPath apply -f "$KubernetesDir/deployment.yaml"
    } else {
        Write-Host "GCP's kubectl not found. Using remote execution instead..." -ForegroundColor Yellow
        
        # Create a Cloud Shell script to apply the configs
        $TempScript = New-TemporaryFile
        Add-Content -Path $TempScript.FullName -Value "kubectl apply -f $KubernetesDir/data-warehouse-secrets.yaml"
        Add-Content -Path $TempScript.FullName -Value "kubectl apply -f $KubernetesDir/blockchain-secrets.yaml"
        Add-Content -Path $TempScript.FullName -Value "kubectl apply -f $KubernetesDir/data-warehouse.yaml"
        Add-Content -Path $TempScript.FullName -Value "kubectl apply -f $KubernetesDir/jobs/data-sync.yaml"
        Add-Content -Path $TempScript.FullName -Value "kubectl apply -f $KubernetesDir/deployment.yaml"
        
        # Upload and execute the script in Cloud Shell
        gcloud cloud-shell scp $TempScript.FullName cloudshell:~/deploy.sh
        gcloud cloud-shell ssh --command="bash ~/deploy.sh"
        
        # Clean up
        Remove-Item $TempScript.FullName
    }
    
    Write-Host "GCP GKE deployment completed!" -ForegroundColor Green
}

function Deploy-MLModels {
    Write-Host "Deploying machine learning models to SageMaker..." -ForegroundColor Yellow
    
    # Verify that AWS CLI is installed (required for SageMaker deployment)
    try {
        aws --version
    } catch {
        Write-Host "AWS CLI is not installed. Please install it first: https://aws.amazon.com/cli/" -ForegroundColor Red
        return
    }
    
    # Deploy using the SageMaker deployment script
    try {
        python scripts/sagemaker-deployment.py
        Write-Host "ML models deployed successfully!" -ForegroundColor Green
    } catch {
        Write-Host "Failed to deploy ML models: $_" -ForegroundColor Red
    }
}

function Deploy-Blockchain {
    Write-Host "Deploying blockchain smart contracts..." -ForegroundColor Yellow
    
    # Verify that Node.js is installed
    try {
        node --version
    } catch {
        Write-Host "Node.js is not installed. Please install it first: https://nodejs.org/" -ForegroundColor Red
        return
    }
    
    # Install required dependencies if not already installed
    try {
        npm list ethers || npm install ethers@5.7.2
    } catch {
        Write-Host "Installing ethers.js dependency..." -ForegroundColor Yellow
        npm install ethers@5.7.2
    }
    
    # Deploy the smart contracts
    try {
        node scripts/deploy-contracts.js
        Write-Host "Blockchain contracts deployed successfully!" -ForegroundColor Green
    } catch {
        Write-Host "Failed to deploy blockchain contracts: $_" -ForegroundColor Red
    }
}

# Main execution
switch ($CloudProvider.ToLower()) {
    "aws" { 
        Deploy-AWS
        Deploy-MLModels
    }
    "azure" { 
        Deploy-Azure
        # For Azure, we still need to deploy ML models if using AWS SageMaker
        $DeployML = Read-Host "Do you want to deploy ML models to AWS SageMaker? (y/n)"
        if ($DeployML -eq "y") {
            Deploy-MLModels
        }
    }
    "gcp" { 
        Deploy-GCP
        # For GCP, we still need to deploy ML models if using AWS SageMaker
        $DeployML = Read-Host "Do you want to deploy ML models to AWS SageMaker? (y/n)"
        if ($DeployML -eq "y") {
            Deploy-MLModels
        }
    }
    default { 
        Write-Host "Unsupported cloud provider. Supported providers: aws, azure, gcp" -ForegroundColor Red 
        exit 1
    }
}

# Always deploy blockchain contracts regardless of cloud provider
Deploy-Blockchain

Write-Host "Deployment completed successfully!" -ForegroundColor Green
Write-Host "----------------------------------------------------------------" -ForegroundColor Cyan
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Verify all services are running properly" -ForegroundColor Cyan
Write-Host "2. Check SageMaker endpoints are active (if using AWS)" -ForegroundColor Cyan
Write-Host "3. Confirm blockchain contracts are deployed correctly" -ForegroundColor Cyan
Write-Host "4. Run an initial data sync to populate the data warehouse" -ForegroundColor Cyan
Write-Host "   Command: node scripts/data-sync.js" -ForegroundColor Cyan
Write-Host "----------------------------------------------------------------" -ForegroundColor Cyan
