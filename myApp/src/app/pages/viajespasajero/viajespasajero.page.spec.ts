import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ViajespasajeroPage } from './viajespasajero.page';

describe('ViajespasajeroPage', () => {
  let component: ViajespasajeroPage;
  let fixture: ComponentFixture<ViajespasajeroPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ViajespasajeroPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
