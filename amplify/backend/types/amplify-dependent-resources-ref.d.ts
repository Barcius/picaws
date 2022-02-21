export type AmplifyDependentResourcesAttributes = {
    "function": {
        "test": {
            "Name": "string",
            "Arn": "string",
            "Region": "string",
            "LambdaExecutionRole": "string"
        },
        "imagesLambda": {
            "Name": "string",
            "Arn": "string",
            "Region": "string",
            "LambdaExecutionRole": "string"
        }
    },
    "api": {
        "test": {
            "RootUrl": "string",
            "ApiName": "string",
            "ApiId": "string"
        },
        "images": {
            "RootUrl": "string",
            "ApiName": "string",
            "ApiId": "string"
        }
    }
}