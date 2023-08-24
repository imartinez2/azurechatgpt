
let appInsights = require('applicationinsights');

if (process.env.APPLICATIONINSIGHTS_CONNECTION_STRING !== undefined) {

  try {
    appInsights
      .setup(process.env.APPLICATIONINSIGHTS_CONNECTION_STRING)
      .setAutoCollectConsole(true)
      .setAutoCollectDependencies(true)
      .setAutoCollectExceptions(true)
      .setAutoCollectHeartbeat(true)
      .setAutoCollectPerformance(true, true)
      .setAutoCollectPreAggregatedMetrics(true)
      .setAutoCollectRequests(true)
      .setAutoDependencyCorrelation(true)
      .setDistributedTracingMode(appInsights.DistributedTracingModes.AI_AND_W3C)
      .setSendLiveMetrics(true)
      .setUseDiskRetryCaching(true)
      .enableWebInstrumentation(true);

    appInsights.start();

    console.info('Started Application Insights telemetry collection');
  } catch (error) {
    console.error('Failed to start Application Insights telemetry collection', error);
  }

} else {
  console.warn('Required environment variable for Application Insights telemetry collection "APPLICATIONINSIGHTS_CONNECTION_STRING" is not defined');
}
