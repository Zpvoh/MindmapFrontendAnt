import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TMindmapCytoComponent } from './t-mindmap-cyto.component';

describe('SMindmapCytoComponent', () => {
  let component: TMindmapCytoComponent;
  let fixture: ComponentFixture<TMindmapCytoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TMindmapCytoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TMindmapCytoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
