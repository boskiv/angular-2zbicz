import { TestBed } from '@angular/core/testing';

import { MarketRatioService } from './market-ratio.service';

describe('MarketRatioService', () => {
  let service: MarketRatioService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MarketRatioService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
