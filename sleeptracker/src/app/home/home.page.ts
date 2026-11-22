import { Component, OnDestroy, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import {
  IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent,
  IonButton, IonIcon, IonList, IonItem, IonLabel,
  ModalController, AlertController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { moon, bed } from 'ionicons/icons';
import { SleepService } from '../services/sleep.service';
import { RecordSleepModalComponent } from '../record-sleep-modal/record-sleep-modal.component';
import { RecordSleepinessModalComponent } from '../record-sleepiness-modal/record-sleepiness-modal.component';
import { guardDismiss } from '../shared/confirm-discard';

interface ChartBar { label: string; value: number | null; isToday: boolean; }

interface ChartConfig {
  title: string;
  bars: ChartBar[];
  max: number;
  ticks: number[];
  average: number | null;
  format: (v: number) => string;
}

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [DatePipe, RouterLink, IonContent, IonCard, IonCardHeader, IonCardTitle,
            IonCardSubtitle, IonCardContent, IonButton, IonIcon, IonList, IonItem, IonLabel],
})
export class HomePage implements OnInit, OnDestroy {
  userName = 'Sharty Pants';   // change to whatever name you want shown
  now = new Date();
  private interval?: any;

  constructor(
    public sleepService: SleepService,
    private modalCtrl: ModalController,
    private alertCtrl: AlertController
  ) {
    addIcons({ moon, bed });
  }

  ngOnInit() {
    // keep the date/time under the greeting current
    this.interval = setInterval(() => (this.now = new Date()), 30000);
  }

  ngOnDestroy() {
    clearInterval(this.interval);
  }

  /* Ionic doesn't allow bindings to static variables, so this getter can be used instead. */
  get allSleepData() {
    return SleepService.AllSleepData;
  }

  // logs from the last 7 days
  private get recentOvernight() {
    const cutoff = Date.now() - 7 * 24 * 3600 * 1000;
    return SleepService.AllOvernightData.filter(l => l.sleepEnd.getTime() >= cutoff);
  }

  private get recentSleepiness() {
    const cutoff = Date.now() - 7 * 24 * 3600 * 1000;
    return SleepService.AllSleepinessData.filter(l => l.loggedAt.getTime() >= cutoff);
  }

  // e.g. "7h 39m", or "--" when there are no logs yet
  get avgSleep(): string {
    const logs = this.recentOvernight;
    if (logs.length === 0) return '--';
    const total = logs.reduce((sum, l) => sum + (l.sleepEnd.getTime() - l.sleepStart.getTime()), 0);
    const mins = Math.round(total / logs.length / 60000);
    return `${Math.floor(mins / 60)}h ${mins % 60}m`;
  }

  // rounded average of the 1-7 ratings, or "--" when there are no logs yet
  get avgSleepiness(): string {
    const level = this.avgLevel;
    return level === null ? '--' : String(level);
  }

  private get avgLevel(): number | null {
    const logs = this.recentSleepiness;
    if (logs.length === 0) return null;
    const total = logs.reduce((sum, l) => sum + l.loggedValue, 0);
    return Math.round(total / logs.length);
  }

  // cat for the average level (falls back to the middle cat when there's no data)
  get avgCat(): string {
    const v = this.avgLevel ?? 4;
    const file = v === 1 ? '1' : v <= 3 ? '2-3' : v <= 5 ? '4-5' : '6-7';
    return `assets/sleepiness_scale/${file}.svg`;
  }

  private async openRecordModal(component: any) {
    const modal = await this.modalCtrl.create({
      component,
      breakpoints: [0, 1],
      initialBreakpoint: 1,
      handle: true,
      canDismiss: guardDismiss(this.alertCtrl),
    });
    await modal.present();

    const { role } = await modal.onDidDismiss();
    if (role === 'saved') await this.showSavedAlert();   // not shown for Cancel or discard
  }

  recordSleep() {
    return this.openRecordModal(RecordSleepModalComponent);
  }

  recordSleepiness() {
    return this.openRecordModal(RecordSleepinessModalComponent);
  }

  private async showSavedAlert() {
    const alert = await this.alertCtrl.create({
      header: 'Entry Recorded',
      buttons: [],
      cssClass: 'saved-alert',
    });
    await alert.present();
    setTimeout(() => alert.dismiss(), 800); 
  }

  activeChart = 0;

  onScroll(e: Event) {
    const el = e.target as HTMLElement;
    this.activeChart = Math.round(el.scrollLeft / el.clientWidth);
  }

  private lastSevenDays(): Date[] {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const days: Date[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      days.push(d);
    }
    return days;
  }

  private sameDay(a: Date, b: Date): boolean {
    return a.toDateString() === b.toDateString();
  }

  private mean(bars: ChartBar[]): number | null {
    const vals = bars.filter(b => b.value !== null).map(b => b.value as number);
    return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null;
  }

  // hours slept, grouped by the day you woke up
  private get overnightBars(): ChartBar[] {
    return this.lastSevenDays().map((day, i) => {
      const logs = SleepService.AllOvernightData.filter(l => this.sameDay(l.sleepEnd, day));
      const value = logs.length
        ? logs.reduce((s, l) => s + (l.sleepEnd.getTime() - l.sleepStart.getTime()), 0) / logs.length / 3600000
        : null;
      return { label: day.toLocaleDateString('en-US', { weekday: 'narrow' }), value, isToday: i === 6 };
    });
  }

  // average 1-7 rating per day
  private get sleepinessBars(): ChartBar[] {
    return this.lastSevenDays().map((day, i) => {
      const logs = SleepService.AllSleepinessData.filter(l => this.sameDay(l.loggedAt, day));
      const value = logs.length ? logs.reduce((s, l) => s + l.loggedValue, 0) / logs.length : null;
      return { label: day.toLocaleDateString('en-US', { weekday: 'narrow' }), value, isToday: i === 6 };
    });
  }

  get charts(): ChartConfig[] {
    const sleep = this.overnightBars;
    const sleepy = this.sleepinessBars;
    const tallest = Math.max(0, ...sleep.map(b => b.value ?? 0));
    const sleepMax = Math.max(8, Math.ceil(tallest / 2) * 2); // grows if someone sleeps 10+ hrs

    return [
      {
        title: 'Overnight Sleep',
        bars: sleep,
        max: sleepMax,
        ticks: [0, sleepMax / 2, sleepMax],
        average: this.mean(sleep),
        format: v => `${v}h`,
      },
      {
        title: 'Sleepiness',
        bars: sleepy,
        max: 7,
        ticks: [0, 4, 7],
        average: this.mean(sleepy),
        format: v => String(v),
      },
    ];
  }
}