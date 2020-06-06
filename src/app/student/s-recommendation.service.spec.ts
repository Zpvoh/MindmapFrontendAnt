import { TestBed } from '@angular/core/testing';

import { SRecommendationService } from './s-recommendation.service';

describe('SRecommendationService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: SRecommendationService = TestBed.get(SRecommendationService);
    expect(service).toBeTruthy();
  });
});
