import './src/db';
import * as http from 'http';
import { logger } from './src/utils';
import { config } from './src/config'
import { app } from './src/app';
import { exit } from 'process';

async function main(): Promise<void> {;
    const httpServer = http.createServer(app);
    httpServer.listen(config.get('web.port') as number, () => {
        logger.debug(`start the web server at port: ${config.get('web.port')}`)
    });
}

process.on('SIGINT', function () {
    logger.debug('exit properly');
    exit();
})

main();