import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ViajesconductorPage } from './viajesconductor.page';

describe('ViajesconductorPage', () => {
  let component: ViajesconductorPage;
  let fixture: ComponentFixture<ViajesconductorPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ViajesconductorPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
