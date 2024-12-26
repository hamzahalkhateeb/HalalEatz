import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-succesfull-payment',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './succesfull-payment.component.html',
  styleUrl: './succesfull-payment.component.css'
})
export class SuccesfullPaymentComponent implements OnInit{

  token! : any;
  payerId!: any;

  constructor(private route: ActivatedRoute, private router: Router, private http: HttpClient) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.token = params['token'];
      this.payerId = params['payerId'];
    });

    console.log(this.token);

    this.http.post(`http://localhost:3000/capturePayment`, {token: this.token})
    .subscribe({
      next:(data: any)=>{
        if (data.success){
          alert(data.message);
        } else{
          alert(data.message);
        }
      },error : (error: any) =>{
        console.error('error: ', error);
      }
    });

  }


    

}
