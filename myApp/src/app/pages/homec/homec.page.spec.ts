import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HomecPage } from './homec.page';

describe('HomecPage', () => {
  let component: HomecPage;
  let fixture: ComponentFixture<HomecPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(HomecPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
