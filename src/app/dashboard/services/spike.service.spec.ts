import { TestBed } from '@angular/core/testing';

import { SpikeService } from './spike.service';

describe('SpikeService', () => {
  let service: SpikeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SpikeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
