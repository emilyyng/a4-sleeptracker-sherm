import { Component } from '@angular/core';
import { DatePipe } from '@angular/common';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonIcon,
  IonList, IonItem, IonLabel, IonFab, IonFabButton,
  IonItemSliding, IonItemOptions, IonItemOption,
  IonThumbnail, IonNote,
  ModalController, AlertController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { add, trashOutline, createOutline } from 'ionicons/icons';
import { SleepService } from '../services/sleep.service';
import { StanfordSleepinessData } from '../data/stanford-sleepiness-data';
import { RecordSleepinessModalComponent } from '../record-sleepiness-modal/record-sleepiness-modal.component';
import { guardDismiss } from '../shared/confirm-discard';

@Component({
  selector: 'app-sleepiness',
  templateUrl: './sleepiness.page.html',
  styleUrls: ['./sleepiness.page.scss'],
  imports: [DatePipe, IonHeader, IonToolbar, IonTitle, IonContent, IonIcon,
            IonList, IonItem, IonLabel, IonFab, IonFabButton,
            IonItemSliding, IonItemOptions, IonItemOption,
            IonThumbnail, IonNote],
})
export class SleepinessPage {
  constructor(
    public sleep: SleepService,
    private modalCtrl: ModalController,
    private alertCtrl: AlertController
  ) {
    addIcons({ add, trashOutline, createOutline });
  }

  async confirmDelete(log: StanfordSleepinessData, slider: IonItemSliding) {
    const alert = await this.alertCtrl.create({
      header: 'Delete Sleepiness Log?',
      message: 'This action will permanently delete this log from your device.',
      buttons: [
        { text: 'Cancel', role: 'cancel', handler: () => slider.close() },
        {
          text: 'Delete',
          role: 'destructive',
          handler: () => this.sleep.deleteSleepinessData(log),
        },
      ],
    });
    await alert.present();
  }

  // newest first
  get logs(): StanfordSleepinessData[] {
    return [...SleepService.AllSleepinessData].sort(
      (a, b) => b.loggedAt.getTime() - a.loggedAt.getTime()
    );
  }

  // 1 -> 1.svg, 2-3 -> 2-3.svg, 4-5 -> 4-5.svg, 6-7 -> 6-7.svg
  catFor(log: StanfordSleepinessData): string {
    const v = log.loggedValue;
    const file = v === 1 ? '1' : v <= 3 ? '2-3' : v <= 5 ? '4-5' : '6-7';
    return `assets/sleepiness_scale/${file}.svg`;
  }

  async openRecordModal() {
    console.log('plus clicked');
    try {
      const modal = await this.modalCtrl.create({
        component: RecordSleepinessModalComponent,
        breakpoints: [0, 1],
        initialBreakpoint: 1,
        handle: true,
        canDismiss: guardDismiss(this.alertCtrl),
      });
      await modal.present();
      const { role } = await modal.onDidDismiss();
      if (role === 'saved') await this.showSavedAlert();
      console.log('modal presented');
    } catch (e) {
      console.error('modal failed', e);
    }
  }

  async openEditModal(log: StanfordSleepinessData, slider: IonItemSliding) {
    await slider.close();
    const modal = await this.modalCtrl.create({
      component: RecordSleepinessModalComponent,
      componentProps: { editing: log },
      breakpoints: [0, 1],
      initialBreakpoint: 1,
      handle: true,
    });
    await modal.present();
    const { role } = await modal.onDidDismiss();
    if (role === 'saved') await this.showSavedAlert();
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
  
}