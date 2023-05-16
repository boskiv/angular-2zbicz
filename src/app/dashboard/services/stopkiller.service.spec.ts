import { TestBed } from '@angular/core/testing';

import { StopKillerService } from './stopkiller.service';

describe('StopkillerService', () => {
  let service: StopKillerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StopKillerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
