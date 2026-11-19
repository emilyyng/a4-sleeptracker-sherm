import { Component, Input, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import {
  IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonContent, IonDatetime,
  IonModal, AlertController, ModalController,
} from '@ionic/angular/standalone';
import { SleepService } from '../services/sleep.service';
import { OvernightSleepData } from '../data/overnight-sleep-data';

// ion-datetime wants local time with no timezone suffix
function toLocalISO(d: Date): string {
  const off = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - off).toISOString().slice(0, 19);
}

type Key = 'start' | 'end';
type Mode = 'date' | 'time';

@Component({
  selector: 'app-record-sleep-modal',
  templateUrl: './record-sleep-modal.component.html',
  styleUrls: ['./record-sleep-modal.component.scss'],
  imports: [DatePipe, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonContent,
            IonDatetime, IonModal],
})
export class RecordSleepModalComponent implements OnInit {
  @Input() editing?: OvernightSleepData;
  start = toLocalISO(new Date(Date.now() - 8 * 3600000)); // default: 8 hrs ago
  end = toLocalISO(new Date());
  lastRecorded?: Date;
  formatOptions = {
    date: { month: 'short', day: '2-digit', year: 'numeric' },
    time: { hour: '2-digit', minute: '2-digit' },
  } as const;

  constructor(
    private sleep: SleepService,
    private modalCtrl: ModalController,
    private alertCtrl: AlertController
  ) {}

  async ngOnInit() {
    if (this.editing) {
      this.start = toLocalISO(this.editing.sleepStart);
      this.end = toLocalISO(this.editing.sleepEnd);
    }
    await this.sleep.ready;
    const logs = SleepService.AllOvernightData;
    if (logs.length > 0) {
      this.lastRecorded = logs.reduce((latest, l) =>
        l.sleepEnd > latest ? l.sleepEnd : latest, logs[0].sleepEnd);
    }
  }

  async save() {
    const start = new Date(this.start);
    const end = new Date(this.end);

    if (start >= end) {
      const alert = await this.alertCtrl.create({
        header: 'Cannot Save Event',
        message: 'The start time must be before the end time.',
        buttons: ['OK'],
      });
      return alert.present();
    }
    if (this.editing) {
      await this.sleep.updateOvernightData(this.editing, start, end);
    } else {
      await this.sleep.logOvernightData(new OvernightSleepData(start, end));
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

  rows: { key: Key; label: string }[] = [
    { key: 'start', label: 'Start' },
    { key: 'end', label: 'End' },
  ];

  open: { key: Key; mode: Mode } | null = null;

  value(key: Key): string {
    return key === 'start' ? this.start : this.end;
  }

  isOpen(key: Key, mode: Mode): boolean {
    return this.open?.key === key && this.open?.mode === mode;
  }

  toggle(key: Key, mode: Mode) {
    this.open = this.isOpen(key, mode) ? null : { key, mode };
  }

  onPick(key: Key, mode: Mode, picked: string) {
    const current = this.value(key); // "YYYY-MM-DDTHH:mm:ss"
    const [curDate, curTime] = current.split('T');
    const [pickDate, pickTime] = picked.includes('T') ? picked.split('T') : [picked, picked];

    const date = mode === 'date' ? pickDate : curDate;
    const time = mode === 'time' ? pickTime.slice(0, 8) : curTime;
    const merged = `${date}T${time}`;

    if (key === 'start') this.start = merged;
    else this.end = merged;
  }
}