import { TestBed } from '@angular/core/testing';

import { TickIndexService } from './tick-index.service';

describe('TickIndexService', () => {
  let service: TickIndexService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TickIndexService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
