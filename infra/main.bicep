@description('Name of the the environment which is used to generate a short unique hash used in all resources.')
@minLength(1)
@maxLength(64)
param name string

@description('Optional. The location to which the resources are deployed.')
param location string = resourceGroup().location

@description('Azure OpenAI API Key')
@minLength(1)
@maxLength(64)
param openaiApiKey string

@description('Azure OpenAI Instance Name e.g. my-openai-instance')
@minLength(1)
@maxLength(64)
param openaiInstanceName string

@description('Azure OpenAI Deployment Name e.g. gpt3-turbo')
@minLength(1)
@maxLength(64)
param openaiDeploymentName string

@description('Azure OpenAI API Version e.g. 2021-08-04-preview')
@minLength(1)
@maxLength(64)
param openaiApiVersion string

param azureAdTenantId string

@secure()
param azureAdClientSecret string

param azureAdClientId string

var resourceToken = toLower(uniqueString(subscription().id, name, location))

module nested_resources './resources.bicep' = {
  name: 'resources-${resourceToken}'
  params: {
    name: name
    location: location
    openaiApiKey: openaiApiKey
    openaiName: openaiInstanceName
    openaiDeploymentName: openaiDeploymentName
    openaiApiVersion: openaiApiVersion
    azureAdTenantId: azureAdTenantId
    azureAdClientSecret: azureAdClientSecret
    azureAdClientId: azureAdClientId
  }
}
