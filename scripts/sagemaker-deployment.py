import boto3
import json
from datetime import datetime

sagemaker = boto3.client('sagemaker')

# Define model configurations
model_configs = {
    'churn-prediction': {
        'model_data': 's3://climabill-models/churn-prediction/model.tar.gz',
        'instance_type': 'ml.m5.large',
        'instance_count': 1
    }
}

# Create and deploy models
for model_name, config in model_configs.items():
    # Create model
    create_model_response = sagemaker.create_model(
        ModelName=f"climabill-{model_name}-{datetime.now().strftime('%Y%m%d%H%M%S')}",
        PrimaryContainer={
            'Image': '123456789012.dkr.ecr.us-west-2.amazonaws.com/sagemaker-scikit-learn:latest',
            'ModelDataUrl': config['model_data']
        },
        ExecutionRoleArn='arn:aws:iam::123456789012:role/SageMakerExecutionRole'
    )
    
    # Create endpoint configuration
    endpoint_config_response = sagemaker.create_endpoint_config(
        EndpointConfigName=f"climabill-{model_name}-config-{datetime.now().strftime('%Y%m%d%H%M%S')}",
        ProductionVariants=[
            {
                'VariantName': 'AllTraffic',
                'ModelName': create_model_response['ModelName'],
                'InitialInstanceCount': config['instance_count'],
                'InstanceType': config['instance_type']
            }
        ]
    )
    
    # Create endpoint
    endpoint_response = sagemaker.create_endpoint(
        EndpointName=f"climabill-{model_name}-{datetime.now().strftime('%Y%m%d%H%M%S')}",
        EndpointConfigName=endpoint_config_response['EndpointConfigName']
    )
    
    print(f"Endpoint creation initiated for {model_name}: {endpoint_response['EndpointArn']}")
