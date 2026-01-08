import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StatistiqueComponent } from './statistique-component';

describe('StatistiqueComponent', () => {
  let component: StatistiqueComponent;
  let fixture: ComponentFixture<StatistiqueComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatistiqueComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StatistiqueComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
