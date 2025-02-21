import { TestBed } from '@angular/core/testing';

import { MockItemsService } from './mock-items.service';

describe('MockItemsService', () => {
  let service: MockItemsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MockItemsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
