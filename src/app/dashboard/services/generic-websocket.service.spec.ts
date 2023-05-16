import { TestBed } from '@angular/core/testing';

import { GenericWebsocketService } from './generic-websocket.service';

describe('GenericWebsocketService', () => {
  let service: GenericWebsocketService<any>;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GenericWebsocketService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
