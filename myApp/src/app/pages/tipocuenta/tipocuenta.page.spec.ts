import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TipocuentaPage } from './tipocuenta.page';

describe('TipocuentaPage', () => {
  let component: TipocuentaPage;
  let fixture: ComponentFixture<TipocuentaPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(TipocuentaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
