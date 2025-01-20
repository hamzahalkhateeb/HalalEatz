import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

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
  orderId!: any;
  private isCapturedSubject = new BehaviorSubject<boolean>(false);
  isCaptured$ = this.isCapturedSubject.asObservable();

  constructor(private route: ActivatedRoute, private router: Router, private http: HttpClient) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.token = params['token'];
      this.payerId = params['payerId'];
      this.orderId = params['orderId'];
      
      console.log(`paymentId aka token in successful payment page: ${this.token}`);
      console.log(`orderId in successfil payment page: ${this.orderId}`);
    
      if(this.token && this.orderId){
        console.log(`paymentId aka token: ${this.token}`);
        console.log(`orderId: ${this.orderId}`);
        console.log('about to send capture payment request');
        this.http.post(`http://localhost:3000/capturePayment`, {token: this.token, orderId: this.orderId})
        .subscribe({
          next:(data: any)=>{
            if (data.success){
              console.log(` ${data.message}`);
              this.isCapturedSubject.next(true);
            } else{
              alert(data.message);
            }
          },error : (error: any) =>{
            console.error('error: ', error);
          }
        }); 
        console.log('sent capture payment request successfully'); 
      }
      

    });

   


  }

  toDashboard(): void {

    console.log('proceed btn clicked')
    this.router.navigateByUrl('/dashboard');
    
  }

    

}
