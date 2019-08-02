/**
 * Main start script for docker container
 * @author Ksu
 */
module.paths.push('/usr/lib/node_modules');

try {
    console.log('Microtrustee Cron started...');
    if (process.env.MICROTRUSTEE_IS_PROD > 0) {
        require('./libs/InitTasks').init();
    }
    require('./libs/CronTasks').init();
} catch (err) {
    console.log(err);
}
