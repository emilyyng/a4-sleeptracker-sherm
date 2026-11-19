import { Component, Input, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import {
  IonHeader, IonToolbar, IonButtons, IonButton, IonContent, IonRange,
  AlertController, ModalController,
} from '@ionic/angular/standalone';
import { SleepService } from '../services/sleep.service';
import { StanfordSleepinessData } from '../data/stanford-sleepiness-data';

@Component({
  selector: 'app-record-sleepiness-modal',
  templateUrl: './record-sleepiness-modal.component.html',
  styleUrls: ['./record-sleepiness-modal.component.scss'],
  imports: [DatePipe, IonHeader, IonToolbar, IonButtons, IonButton, IonContent, IonRange],
})
export class RecordSleepinessModalComponent implements OnInit {
  @Input() editing?: StanfordSleepinessData;
  level = 4;                 // starts in the middle of the 1-7 scale
  lastRecorded?: Date;

  constructor(
    private sleep: SleepService,
    private modalCtrl: ModalController,
    private alertCtrl: AlertController
  ) {}

  async ngOnInit() {
    if (this.editing) {
      this.level = this.editing.loggedValue;
    }
    await this.sleep.ready;
    const logs = SleepService.AllSleepinessData;
    if (logs.length > 0) {
      this.lastRecorded = logs.reduce((latest, l) =>
        l.loggedAt > latest ? l.loggedAt : latest, logs[0].loggedAt);
    }
  }

  get description(): string {
    return StanfordSleepinessData.ScaleValues[this.level] ?? '';
  }

  // 1 -> 1.svg, 2-3 -> 2-3.svg, 4-5 -> 4-5.svg, 6-7 -> 6-7.svg
  catFor(level: number): string {
    const file = level === 1 ? '1' : level <= 3 ? '2-3' : level <= 5 ? '4-5' : '6-7';
    return `assets/sleepiness_scale/${file}.svg`;
  }

  async save() {
    if (this.editing) {
      // keep the original time when editing
      await this.sleep.updateSleepinessData(this.editing, this.level, this.editing.loggedAt);
    } else {
      // new entries are logged at the moment Save is pressed
      await this.sleep.logSleepinessData(new StanfordSleepinessData(this.level));
    }
    this.modalCtrl.dismiss(null, 'saved');
  }

  async cancel() {
    if (this.editing) {
      this.modalCtrl.dismiss(null, 'cancelled');
      return;
    }

    const alert = await this.alertCtrl.create({
      header: 'Discard Entry?',
      message: "This entry hasn't been saved. Your entry will be lost.",
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        { text: 'Delete', role: 'destructive', handler: () => {this.modalCtrl.dismiss(null, 'discarded');}, },
      ],
    });
    await alert.present();
  }
}