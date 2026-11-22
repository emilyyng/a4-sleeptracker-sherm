import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { SleepData } from '../data/sleep-data';
import { OvernightSleepData } from '../data/overnight-sleep-data';
import { StanfordSleepinessData } from '../data/stanford-sleepiness-data';

const OVERNIGHT_KEY = 'overnightData';
const SLEEPINESS_KEY = 'sleepinessData';
const TIMER_KEY = 'timerStart';

interface StoredOvernight { start: string; end: string; loggedAt: string; }
interface StoredSleepiness { value: number; loggedAt: string; }

@Injectable({
  providedIn: 'root'
})
export class SleepService {
	public static AllSleepData: SleepData[] = [];
	public static AllOvernightData: OvernightSleepData[] = [];
	public static AllSleepinessData: StanfordSleepinessData[] = [];

	public ready: Promise<void>;
	public timerStart: Date | null = null; // set while the timer is running

	constructor(private storage: Storage) {
		this.ready = this.init();
	}

	private async init() {
		await this.storage.create(); 

		const savedTimer: string | null = await this.storage.get(TIMER_KEY);
		this.timerStart = savedTimer ? new Date(savedTimer) : null;

		const overnight: StoredOvernight[] | null = await this.storage.get(OVERNIGHT_KEY);
		const sleepiness: StoredSleepiness[] | null = await this.storage.get(SLEEPINESS_KEY);

		if (overnight === null && sleepiness === null) {
			this.addDefaultData(); // delete this line to start with an empty app
			await this.save();
			return;
		}

		for (const o of overnight ?? []) {
			const data = new OvernightSleepData(new Date(o.start), new Date(o.end));
			data.loggedAt = new Date(o.loggedAt);
			this.addToMemory(data);
		}
		for (const s of sleepiness ?? []) {
			this.addToMemory(new StanfordSleepinessData(s.value, new Date(s.loggedAt)));
		}
	}

	private addToMemory(data: OvernightSleepData | StanfordSleepinessData) {
		SleepService.AllSleepData.push(data);
		if (data instanceof OvernightSleepData) {
			SleepService.AllOvernightData.push(data);
		} else {
			SleepService.AllSleepinessData.push(data);
		}
	}

	private async save() {
		const overnight: StoredOvernight[] = SleepService.AllOvernightData.map(o => ({
			start: o.sleepStart.toISOString(),
			end: o.sleepEnd.toISOString(),
			loggedAt: o.loggedAt.toISOString(),
		}));
		const sleepiness: StoredSleepiness[] = SleepService.AllSleepinessData.map(s => ({
			value: s.loggedValue,
			loggedAt: s.loggedAt.toISOString(),
		}));
		await this.storage.set(OVERNIGHT_KEY, overnight);
		await this.storage.set(SLEEPINESS_KEY, sleepiness);
	}

	private addDefaultData() {
		var goToBed = new Date();
		goToBed.setDate(goToBed.getDate() - 1); //set to yesterday
		goToBed.setHours(1, 3, 0); //1:03am
		var wakeUp = new Date();
		wakeUp.setTime(goToBed.getTime() + 8 * 60 * 60 * 1000); //Sleep for exactly eight hours, waking up at 9:03am
		this.addToMemory(new OvernightSleepData(goToBed, wakeUp));
		var sleepinessDate = new Date();
		sleepinessDate.setDate(sleepinessDate.getDate() - 1); //set to yesterday
		sleepinessDate.setHours(14, 38, 0); //2:38pm
		this.addToMemory(new StanfordSleepinessData(4, sleepinessDate));
		goToBed = new Date();
		goToBed.setDate(goToBed.getDate() - 1); //set to yesterday
		goToBed.setHours(23, 11, 0); //11:11pm
		wakeUp = new Date();
		wakeUp.setTime(goToBed.getTime() + 9 * 60 * 60 * 1000); //Sleep for exactly nine hours
		this.addToMemory(new OvernightSleepData(goToBed, wakeUp));
	}

	public async logOvernightData(sleepData: OvernightSleepData) {
		await this.ready; // don't add anything until saved data has loaded
		this.addToMemory(sleepData);
		await this.save();
	}

	public async logSleepinessData(sleepData: StanfordSleepinessData) {
		await this.ready;
		this.addToMemory(sleepData);
		await this.save();
	}

	public async startTimer() {
		await this.ready;
		this.timerStart = new Date();
		await this.storage.set(TIMER_KEY, this.timerStart.toISOString());
	}

	// public async stopTimer() {
	// 	await this.ready;
	// 	if (!this.timerStart) return;
	// 	const start = this.timerStart;
	// 	this.timerStart = null;
	// 	await this.storage.remove(TIMER_KEY);
	// 	await this.logOvernightData(new OvernightSleepData(start, new Date()));
	// }

	public async clearTimer() {
		await this.ready;
		this.timerStart = null;
		await this.storage.remove(TIMER_KEY);
	}

	public async deleteOvernightData(data: OvernightSleepData) {
		await this.ready;
		const all = SleepService.AllSleepData.indexOf(data);
		if (all !== -1) SleepService.AllSleepData.splice(all, 1);
		const overnight = SleepService.AllOvernightData.indexOf(data);
		if (overnight !== -1) SleepService.AllOvernightData.splice(overnight, 1);
		await this.save();
	}

	public async updateOvernightData(data: OvernightSleepData, start: Date, end: Date) {
		await this.ready;
		data.sleepStart = start;
		data.sleepEnd = end;
		await this.save();
	}

	public async deleteSleepinessData(data: StanfordSleepinessData) {
		await this.ready;
		const all = SleepService.AllSleepData.indexOf(data);
		if (all !== -1) SleepService.AllSleepData.splice(all, 1);
		const sleepiness = SleepService.AllSleepinessData.indexOf(data);
		if (sleepiness !== -1) SleepService.AllSleepinessData.splice(sleepiness, 1);
		await this.save();
	}

	public async updateSleepinessData(data: StanfordSleepinessData, value: number, loggedAt: Date) {
		await this.ready;
		data.loggedValue = value;
		data.loggedAt = loggedAt;
		await this.save();
	}
}
