//src/utils/dbconn.ts

import path from 'path';
import sqlite3 from 'sqlite3';
import { app } from 'electron';
import { open } from 'sqlite';

let db: any;


export async function initDB() {
	if (db) return db;

	const dbPath = path.join(app.getPath("userData"), "nb.db");

	db = await open({
		filename: dbPath,
		driver: sqlite3.Database
	});

	await db.exec(`
		CREATE TABLE IF NOT EXISTS history (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		timestamp TEXT,
		event TEXT,
		inputVoltage REAL,
		outputVoltage REAL,
		battery REAL,
		frequency REAL,
		temperature REAL,
		status TEXT)
	`);

	await db.exec(`
		CREATE TABLE IF NOT EXISTS cfg (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		id_nb TEXT,
		shutdown_failure REAL,
		shutdown_low REAL,
		ups_shutdown REAL,
		ups_down_after INTEGER,
		after_backup INTEGER,
		beep INTEGER,
		auto_start INTEGER)
	`);

	return db;
}

// salva um estado
export async function saveEvent(evn: {event: string;inputVoltage?: number;outputVoltage?: number;battery?: number;frequency?: number;temperature?: number;status?: string;}){
	
	const cnn = await initDB();
	const tm  = new Date().toISOString();

	await cnn.run(
		`INSERT INTO history (timestamp, event, inputVoltage, outputVoltage, battery, frequency, temperature, status)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
		[
			tm,
			evn.event,
			evn.inputVoltage || 0,
			evn.outputVoltage || 0,
			evn.battery || 0,
			evn.frequency || 0,
			evn.temperature || 0,
			evn.status || null
		]
	);
	//await cnn.close();
}

export async function getLastEvents(limit = 20){
	const cnn = await initDB();
	return await cnn.all(
		`SELECT * FROM history ORDER BY id DESC LIMIT ?`, [limit]
	);
}

export async function cleanDatabase(){
	const cnn = await initDB();
	await cnn.run(`DELETE FROM cfg`);
	return await cnn.run(`DELETE FROM history`);
}

export async function closeDB() {
	if (db) {
		await db.close();
		db = null;
	}
}

export async function setConfig(lnp: {id_nb: string; sf?: number; sl?: number; ups?: number; psd?: number; afb?: number; beep?: number; astart?: number}){
	const cnn = await initDB();
	let chk = await getConfig();
	if(!chk || chk.length === 0){
		await cnn.run(`
			INSERT INTO cfg (id_nb, shutdown_failure, shutdown_low, ups_shutdown, ups_down_after, after_backup, beep, auto_start)
			values (?, ?, ?, ?, ?, ?, ?, ?)`,
			[
				'1',
				lnp.sf ?? 0,
				lnp.sl ?? 0,
				lnp.ups ?? 0,
				lnp.psd ?? 0,
				lnp.afb ?? 0,
				lnp.beep ?? 0,
				lnp.astart ?? 0
		]);
	}else{
		await cnn.run(
			`
			UPDATE cfg 
			SET 
				id_nb = ?, shutdown_failure = ?, shutdown_low = ?, ups_shutdown = ?, ups_down_after = ?, after_backup = ?, beep = ?, auto_start = ?
			WHERE id = ?;
			`,
			[
				'1',
				lnp.sf ?? chk[0].shutdown_failure,
				lnp.sl ?? chk[0].shutdown_low,
				lnp.ups ?? chk[0].ups_shutdown,
				lnp.psd ?? chk[0].ups_down_after,
				lnp.afb ?? chk[0].after_backup,
				lnp.beep ?? chk[0].beep,
				lnp.astart ?? chk[0].auto_start,
				chk[0].id // id atual no banco
			]
		);
	}
}

export async function getConfig(){
	const cnn = await initDB();
	let sl = await cnn.all(
		`SELECT * FROM cfg WHERE id_nb = '1'`
	);

	if(sl.length <= 0){
		await cnn.run(`
			INSERT INTO cfg (id_nb, shutdown_failure, shutdown_low, ups_shutdown, ups_down_after, after_backup, beep, auto_start)
			values (?, ?, ?, ?, ?, ?, ?, ?)`,['1',0,0,0,0,0,0,0]);
		sl = await cnn.all(
			`SELECT * FROM cfg WHERE id_nb = '1'`
		);
	}
	return sl;
}



