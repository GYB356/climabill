const { DataPipelineService } = require('../dist/lib/analytics/data-pipeline');

// Setup error handling
process.on('unhandledRejection', (error) => {
  console.error('Unhandled rejection:', error);
  process.exit(1);
});

async function main() {
  console.log('Starting data warehouse sync process...');
  
  try {
    const dataPipeline = new DataPipelineService();
    await dataPipeline.runFullSync();
    console.log('Data warehouse sync completed successfully');
  } catch (error) {
    console.error('Error during data sync:', error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
