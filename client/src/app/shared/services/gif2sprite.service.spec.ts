import { TestBed, inject } from '@angular/core/testing';

import { Gif2spriteService } from './gif2sprite.service';

describe('Gif2spriteService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [Gif2spriteService]
    });
  });

  it('should be created', inject([Gif2spriteService], (service: Gif2spriteService) => {
    expect(service).toBeTruthy();
  }));
});
