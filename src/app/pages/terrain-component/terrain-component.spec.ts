import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TerrainComponent } from './terrain-component';

describe('TerrainComponent', () => {
  let component: TerrainComponent;
  let fixture: ComponentFixture<TerrainComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TerrainComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TerrainComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
