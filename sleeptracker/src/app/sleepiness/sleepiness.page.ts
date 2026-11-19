import { Component } from '@angular/core';
import { DatePipe } from '@angular/common';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonIcon,
  IonList, IonItem, IonLabel, IonFab, IonFabButton,
  IonItemSliding, IonItemOptions, IonItemOption,
  IonThumbnail, IonNote,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { add, trashOutline, createOutline } from 'ionicons/icons';
import { SleepService } from '../services/sleep.service';
import { StanfordSleepinessData } from '../data/stanford-sleepiness-data';

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
  constructor(public sleep: SleepService) {
    addIcons({ add, trashOutline, createOutline });
  }

  get logs(): StanfordSleepinessData[] {
    return [...SleepService.AllSleepinessData].sort(
      (a, b) => b.loggedAt.getTime() - a.loggedAt.getTime()
    );
  }

  catFor(log: StanfordSleepinessData): string {
    const v = log.loggedValue;
    const file = v === 1 ? '1' : v <= 3 ? '2-3' : v <= 5 ? '4-5' : '6-7';
    return `assets/sleepiness_scale/${file}.svg`;
  }

  // stubs so the template compiles; we'll fill these in later
  async openRecordModal() {}
  async openEditModal(log: StanfordSleepinessData, slider: IonItemSliding) { await slider.close(); }
  async confirmDelete(log: StanfordSleepinessData, slider: IonItemSliding) { await slider.close(); }
}