import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import { Model } from "objection";
import Knex from "knex";
import {CronJob} from "cron";

import routes from "./routes";
import dbConfig from "./config/database";

import registerBotCommands from './tasks/register-bot-commands';
import botLoginAndReadyUp from './tasks/bot-login-and-ready-up';
import { periodicSiloDataTracker } from './tasks/periodic-silo-data-tracker';

let corsOptions = {
  origin: 'http://localhost:3000',
}

dotenv.config();

// DB
const knex = Knex(dbConfig);
Model.knex(knex);

const app = express();
const port = process.env.PORT || 8000;

app.use(cors(corsOptions))
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

routes(app);

app.listen(port);

console.log(`----- ⚡ SERVER LISTENING ⚡ -----`);
console.log(`-------- ⚡ PORT: ${port} ⚡ --------`);

registerBotCommands();
let discordClient = botLoginAndReadyUp();

const runMinutelyDataTracker = new CronJob(
	'0 */1 * * * *',
	function() {
    let useTimestampUnix = Math.floor(new Date().setSeconds(0) / 1000);
    let startTime = new Date().getTime();
    // periodicSiloDataTracker(useTimestampUnix, startTime);
	},
	null,
	true,
	'Etc/UTC'
);

runMinutelyDataTracker.start();