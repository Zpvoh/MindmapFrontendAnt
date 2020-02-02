import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SLearningSituationComponent } from './s-learning-situation.component';

describe('SLearningSituationComponent', () => {
  let component: SLearningSituationComponent;
  let fixture: ComponentFixture<SLearningSituationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SLearningSituationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SLearningSituationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
