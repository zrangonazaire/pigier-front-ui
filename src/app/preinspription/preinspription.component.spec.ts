import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PreinspriptionComponent } from './preinspription.component';

describe('PreinspriptionComponent', () => {
  let component: PreinspriptionComponent;
  let fixture: ComponentFixture<PreinspriptionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PreinspriptionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PreinspriptionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
