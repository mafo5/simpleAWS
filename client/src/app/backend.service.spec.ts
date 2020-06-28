import { TestBed } from '@angular/core/testing';

import { BackendService } from './backend.service';
import { HttpClient } from '@angular/common/http';

describe('BackendService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [
      { provide: HttpClient, useValue: {} }
    ]
  }));

  it('should be created', () => {
    const service: BackendService = TestBed.get(BackendService);
    expect(service).toBeTruthy();
  });
});
