import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PerfilconductorPage } from './perfilconductor.page';

describe('PerfilconductorPage', () => {
  let component: PerfilconductorPage;
  let fixture: ComponentFixture<PerfilconductorPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(PerfilconductorPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
