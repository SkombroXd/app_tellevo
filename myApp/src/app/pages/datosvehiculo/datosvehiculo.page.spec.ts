import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DatosvehiculoPage } from './datosvehiculo.page';

describe('DatosvehiculoPage', () => {
  let component: DatosvehiculoPage;
  let fixture: ComponentFixture<DatosvehiculoPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(DatosvehiculoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
