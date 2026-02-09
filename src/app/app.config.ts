import {
  ApplicationConfig,
  importProvidersFrom,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { ApiModule, Configuration } from '../api-client';
import {
  provideHttpClient,
  withInterceptorsFromDi,
  withInterceptors
} from '@angular/common/http';
import { JwtInterceptor } from './core/interceptor';
import { provideToastr } from 'ngx-toastr';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import {provideAnimations} from '@angular/platform-browser/animations';

export const appConfig: ApplicationConfig = {
  providers: [
    provideAnimations(),
    provideToastr({
      positionClass: 'toast-top-center',
      timeOut: 3000,
      closeButton: true,
      progressBar: true,
      tapToDismiss: true,

    }),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptorsFromDi()),
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
    importProvidersFrom(
      ApiModule.forRoot(
        () => new Configuration({ basePath: 'http://192.168.0.135:8084/api/v1' })
      )
    ),
  ],

};
