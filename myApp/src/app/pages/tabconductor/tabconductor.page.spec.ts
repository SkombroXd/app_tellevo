import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TabconductorPage } from './tabconductor.page';

describe('TabconductorPage', () => {
  let component: TabconductorPage;
  let fixture: ComponentFixture<TabconductorPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(TabconductorPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
