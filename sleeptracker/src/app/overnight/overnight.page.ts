import { Component, OnDestroy, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonIcon,
  IonList, IonItem, IonLabel, IonFab, IonFabButton,
  IonItemSliding, IonItemOptions, IonItemOption,
  ModalController, AlertController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { play, pause, add, trashOutline, createOutline } from 'ionicons/icons';
import { SleepService } from '../services/sleep.service';
import { OvernightSleepData } from '../data/overnight-sleep-data';
import { RecordSleepModalComponent } from '../record-sleep-modal/record-sleep-modal.component';

@Component({
  selector: 'app-overnight',
  templateUrl: 'overnight.page.html',
  styleUrls: ['overnight.page.scss'],
  imports: [DatePipe, IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonIcon,
          IonList, IonItem, IonLabel, IonFab, IonFabButton,
          IonItemSliding, IonItemOptions, IonItemOption],
})
export class OvernightPage implements OnInit, OnDestroy {
  private now = Date.now();
  private interval?: any;

  constructor(
    public sleep: SleepService,
    private modalCtrl: ModalController,
    private alertCtrl: AlertController
  ) {
    addIcons({ play, pause, add, trashOutline, createOutline });
  }

  async confirmDelete(log: OvernightSleepData, slider: IonItemSliding) {
    const alert = await this.alertCtrl.create({
      header: 'Delete Overnight Log?',
      message: 'This action will permanently delete this log from your device.',
      buttons: [
        { text: 'Cancel', role: 'cancel', handler: () => slider.close() },
        {
          text: 'Delete',
          role: 'destructive',
          handler: () => this.sleep.deleteOvernightData(log),
        },
      ],
    });
    await alert.present();
  }

  ngOnInit() {
    this.interval = setInterval(() => (this.now = Date.now()), 1000);
  }

  ngOnDestroy() {
    clearInterval(this.interval);
  }

  get timerRunning(): boolean {
    return this.sleep.timerStart !== null;
  }

  get display(): string {
    const start = this.sleep.timerStart;
    const ms = start ? this.now - start.getTime() : 0;
    const totalSec = Math.max(0, Math.floor(ms / 1000));
    const pad = (n: number) => String(n).padStart(2, '0');
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    return `${pad(h)}:${pad(m)}:${pad(s)}`;
  }

  // newest first
  get logs(): OvernightSleepData[] {
    return [...SleepService.AllOvernightData].sort(
      (a, b) => b.sleepStart.getTime() - a.sleepStart.getTime()
    );
  }

  duration(log: OvernightSleepData): string {
    const mins = Math.round((log.sleepEnd.getTime() - log.sleepStart.getTime()) / 60000);
    return `${Math.floor(mins / 60)}hrs ${mins % 60}min`;
  }

  toggleTimer() {
    this.timerRunning ? this.sleep.stopTimer() : this.sleep.startTimer();
  }

  async openRecordModal() {
    const modal = await this.modalCtrl.create({
      component: RecordSleepModalComponent,
      breakpoints: [0, 1],
      initialBreakpoint: 1,
      handle: true,
    });
    await modal.present();
  }
}