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
  orderId!: any;
  timesReceived = 1;

  constructor(private route: ActivatedRoute, private router: Router, private http: HttpClient) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.token = params['token'];
      this.payerId = params['payerId'];
      this.orderId = params['orderId'];
      
      console.log(`ORDER received in front end!**###**##***###*3##*********####*####*********####******** ${this.orderId}, times this function has been called received: ${this.timesReceived}`);
      this.timesReceived++;
    
      if(this.token && this.orderId){
        this.http.post(`http://localhost:3000/capturePayment`, {token: this.token, orderId: this.orderId})
        .subscribe({
          next:(data: any)=>{
            if (data.success){
              console.log(` ${data.message}`);
            
              this.router.navigateByUrl('/dashboard');
            } else{
              alert(data.message);
            }
          },error : (error: any) =>{
            console.error('error: ', error);
          }
        });
      }

    });

   


  }


    

}
