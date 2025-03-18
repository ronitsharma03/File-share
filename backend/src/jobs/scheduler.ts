import cron from 'node-cron';
import cleanup from './cleanup';
import notification from './notification';
// import notificationJob from './notification';

class JobScheduler{
    startJobs(): void {
        console.log(`Starting the Job scheduler`);

        // Run cleanup every hour
        cron.schedule('0 * * * *', async () => {
            console.log(`Running the cleanup job`);
            await cleanup.cleanExpiredTransfers();
        });

        // Run the notificatoion job every 6 hours
        cron.schedule('0 */6 * * *', async () => {
            console.log(`Runnig the notification job`);
            await notification.sendExpirationReminders();
        })
    }
}
export default new JobScheduler();

