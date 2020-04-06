import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SMindmapCytoComponent } from './s-mindmap-cyto.component';

describe('SMindmapCytoComponent', () => {
  let component: SMindmapCytoComponent;
  let fixture: ComponentFixture<SMindmapCytoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SMindmapCytoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SMindmapCytoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
