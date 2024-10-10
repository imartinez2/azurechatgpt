
param name string

param openaiApiKey string

param openaiName string

param openaiDeploymentName string

param openaiApiVersion string

param location string = resourceGroup().location

param serverFarmSKU object = {
  name: 'P1v3'
  tier: 'Premium1V3'
  size: 'P1v3'
  family: 'Pv3'
  capacity: 1
}

param serverFarmKind string = 'linux'

param siteLinuxFxVersion string = 'node|18-lts'

param siteAlwaysOn bool = true

param siteAppCommandLine string = 'node server.js'

param azureAdTenantId string

@secure()
param azureAdClientSecret string

param azureAdClientId string

resource name_cosmos_resourceToken 'Microsoft.DocumentDB/databaseAccounts@2023-04-15' = {
  name: '${name}-cosmosdb'
  location: location
  kind: 'GlobalDocumentDB'
  properties: {
    databaseAccountOfferType: 'Standard'
    locations: [
      {
        locationName: location
        failoverPriority: 0
      }
    ]
  }
}

resource name_app_resourceToken 'Microsoft.Web/serverfarms@2020-06-01' = {
  name: '${name}-app-plan'
  location: location
  properties: {
    reserved: true
  }
  sku: serverFarmSKU
  kind: serverFarmKind
}

resource Microsoft_Web_sites_name_app_resourceToken 'Microsoft.Web/sites@2020-06-01' = {
  name: '${name}-app'
  location: location
  properties: {
    serverFarmId: name_app_resourceToken.id
    siteConfig: {
      linuxFxVersion: siteLinuxFxVersion
      alwaysOn: siteAlwaysOn
      appCommandLine: siteAppCommandLine
      appSettings: [
        {
          name: 'AZURE_OPENAI_API_KEY'
          value: openaiApiKey
        }
        {
          name: 'AZURE_OPENAI_API_INSTANCE_NAME'
          value: openaiName
        }
        {
          name: 'AZURE_OPENAI_API_DEPLOYMENT_NAME'
          value: openaiDeploymentName
        }
        {
          name: 'AZURE_OPENAI_API_VERSION'
          value: openaiApiVersion
        }
        {
          name: 'AZURE_COSMOSDB_URI'
          value: name_cosmos_resourceToken.properties.documentEndpoint
        }
        {
          name: 'AZURE_COSMOSDB_KEY'
          value: name_cosmos_resourceToken.listKeys().primaryMasterKey
        }
        {
          name: 'AZURE_AD_CLIENT_ID'
          value: azureAdClientId
        }
        {
          name: 'AZURE_AD_CLIENT_SECRET'
          value: azureAdClientSecret
        }
        {
          name: 'AZURE_AD_TENANT_ID'
          value: azureAdTenantId
        }
      ]
    }
  }
}
