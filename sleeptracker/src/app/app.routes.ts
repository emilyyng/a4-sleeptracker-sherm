import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'tabs',
    loadComponent: () => import('./tabs/tabs.page').then(m => m.TabsPage),
    children: [
      {
        path: 'home',
        loadComponent: () => import('./home/home.page').then(m => m.HomePage),
      },
      {
        path: 'overnight',
        loadComponent: () => import('./overnight/overnight.page').then(m => m.OvernightPage),
      },
      {
        path: 'sleepiness',
        loadComponent: () => import('./sleepiness/sleepiness.page').then(m => m.SleepinessPage),
      },
      { path: '', redirectTo: 'home', pathMatch: 'full' },
    ],
  },
  { path: '', redirectTo: 'tabs', pathMatch: 'full' },
];