import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SGraphComponent } from './s-graph.component';

describe('SGraphComponent', () => {
  let component: SGraphComponent;
  let fixture: ComponentFixture<SGraphComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SGraphComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SGraphComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
