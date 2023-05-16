import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from '@app/app.module';
import { environment } from '@environments/environment.development';

import * as Sentry from '@sentry/angular-ivy';

if (environment.production) {
  Sentry.init({
    dsn: environment.sentryDSN,
    environment: 'production',
    integrations: [
      new Sentry.Replay(),
      new Sentry.BrowserTracing({
        tracePropagationTargets: ['localhost', 'https://spreadfighter.web.app'],
        routingInstrumentation: Sentry.routingInstrumentation,
      }),
    ],
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,

    tracesSampleRate: 1.0,
  });
}

platformBrowserDynamic()
  .bootstrapModule(AppModule)
  .catch((err) => console.error(err));
