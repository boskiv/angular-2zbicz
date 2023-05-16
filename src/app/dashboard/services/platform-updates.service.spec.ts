import { TestBed } from '@angular/core/testing';

import { PlatformUpdatesService } from './platform-updates.service';

describe('PlatformUpdatesService', () => {
  let service: PlatformUpdatesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PlatformUpdatesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
