import { TestBed } from '@angular/core/testing';

import { StructureMapService } from './structure-map.service';

describe('StructureMapService', () => {
  let service: StructureMapService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StructureMapService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
