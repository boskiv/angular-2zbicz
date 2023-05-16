import { TestBed } from '@angular/core/testing';

import { DecryptorService } from './decryptor.service';

describe('DecryptorService', () => {
  let service: DecryptorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DecryptorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
