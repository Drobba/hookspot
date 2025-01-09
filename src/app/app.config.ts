import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { routes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { provideHttpClient } from '@angular/common/http';

const firebaseConfig = {
  apiKey: 'AIzaSyDF0LoafBGd3KTjbG2ZanbjDp1j-z1Bs_Y',
  authDomain: 'hookspot-fishing-app.firebaseapp.com',
  projectId: 'hookspot-fishing-app',
  storageBucket: 'hookspot-fishing-app.firebasestorage.app',
  messagingSenderId: '456259938405',
  appId: '1:456259938405:web:14749766eb75fc28ff7e8c',
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withComponentInputBinding()),
    provideAnimationsAsync(),
    provideHttpClient(),
    provideFirebaseApp(() => initializeApp(firebaseConfig)), // Initiera Firebase App
    provideAuth(() => getAuth()), // Lägg till Auth-tjänsten
  ],
};
