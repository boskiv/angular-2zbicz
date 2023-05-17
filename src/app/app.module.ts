import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { TvChartContainerComponent } from '@app/dashboard/components/tv-chart-container/tv-chart-container.component';

import { AppComponent } from './app.component';

@NgModule({
  declarations: [AppComponent, TvChartContainerComponent],
  imports: [BrowserModule, HttpClientModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
