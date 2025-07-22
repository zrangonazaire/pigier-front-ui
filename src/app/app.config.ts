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

export const appConfig: ApplicationConfig = {
  providers: [
 
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptorsFromDi()),
    { provide: 'HTTP_INTERCEPTORS', useClass: JwtInterceptor, multi: true },
    importProvidersFrom(
      ApiModule.forRoot(
        () => new Configuration({ basePath: 'http://192.168.0.134:8084/api/v1' })
      )
    ),
  ],
};
