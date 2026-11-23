import { AlertController } from '@ionic/angular/standalone';

export async function confirmDiscard(alertCtrl: AlertController): Promise<boolean> {
  const alert = await alertCtrl.create({
    header: 'Discard Entry?',
    message: "This entry hasn't been saved. Your entry will be lost.",
    buttons: [
      { text: 'Cancel', role: 'cancel' },
      { text: 'Delete', role: 'destructive' },
    ],
  });
  await alert.present();
  const { role } = await alert.onDidDismiss();
  return role === 'destructive';
}

// swipe-down and backdrop taps arrive with these roles; our own dismiss() calls don't
export function guardDismiss(alertCtrl: AlertController) {
  return async (_data?: any, role?: string): Promise<boolean> => {
    if (role !== 'gesture' && role !== 'backdrop') return true;
    return confirmDiscard(alertCtrl);
  };
}