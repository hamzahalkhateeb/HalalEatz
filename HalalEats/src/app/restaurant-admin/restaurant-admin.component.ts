import { HttpClient } from '@angular/common/http';
import { Component, OnInit, PLATFORM_ID } from '@angular/core';
import {Router} from '@angular/router';

@Component({
  selector: 'app-restaurant-admin',
  standalone: true,
  imports: [],
  templateUrl: './restaurant-admin.component.html',
  styleUrl: './restaurant-admin.component.css'
})
export class RestaurantAdminComponent implements OnInit {

  //declare all data variable that you need!
  //a list of orders
  //a list meals, drinks and deserts


  constructor(private http: HttpClient, private router: Router ) {}
  ngOnInit(): void {

    
      
  }

  LoadRestaurantAdminPackage(response:any)  {
    //this.http.post('http://localhost:3000/LoadRestaurantAdminPackage', )
  }

}
