import { Component, OnDestroy, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import {
  IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent,
  IonButton, IonIcon, IonList, IonItem, IonLabel,
  ModalController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { moon, bed } from 'ionicons/icons';
import { SleepService } from '../services/sleep.service';
import { RecordSleepModalComponent } from '../record-sleep-modal/record-sleep-modal.component';
import { RecordSleepinessModalComponent } from '../record-sleepiness-modal/record-sleepiness-modal.component';

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

  constructor(public sleepService: SleepService, private modalCtrl: ModalController) {
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

  async recordSleep() {
    const modal = await this.modalCtrl.create({
      component: RecordSleepModalComponent,
      breakpoints: [0, 1],
      initialBreakpoint: 1,
      handle: true,
    });
    await modal.present();
  }

  async recordSleepiness() {
    const modal = await this.modalCtrl.create({
      component: RecordSleepinessModalComponent,
      breakpoints: [0, 1],
      initialBreakpoint: 1,
      handle: true,
    });
    await modal.present();
  }
}