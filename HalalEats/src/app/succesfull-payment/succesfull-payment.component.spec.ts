import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SuccesfullPaymentComponent } from './succesfull-payment.component';

describe('SuccesfullPaymentComponent', () => {
  let component: SuccesfullPaymentComponent;
  let fixture: ComponentFixture<SuccesfullPaymentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SuccesfullPaymentComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SuccesfullPaymentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
