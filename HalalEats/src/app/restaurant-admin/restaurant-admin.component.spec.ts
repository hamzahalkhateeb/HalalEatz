import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RestaurantAdminComponent } from './restaurant-admin.component';

describe('RestaurantAdminComponent', () => {
  let component: RestaurantAdminComponent;
  let fixture: ComponentFixture<RestaurantAdminComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RestaurantAdminComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RestaurantAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
