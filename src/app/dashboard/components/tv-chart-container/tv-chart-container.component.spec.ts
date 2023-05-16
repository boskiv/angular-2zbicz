import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TvChartContainerComponent } from './tv-chart-container.component';

describe('TvChartContainerComponent', () => {
  let component: TvChartContainerComponent;
  let fixture: ComponentFixture<TvChartContainerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TvChartContainerComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TvChartContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
