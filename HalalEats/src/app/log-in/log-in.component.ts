import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient, } from '@angular/common/http';
import { Router } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';




@Component({
  selector: 'app-log-in',
  standalone: true,
  imports: [
    CommonModule
    
  ],
  templateUrl: './log-in.component.html',
  styleUrl: './log-in.component.css'
})

export class LogInComponent implements OnInit {

  constructor(@Inject(PLATFORM_ID) private platformId: Object, private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)){
      (window as any)['handleCredentialResponse'] = this.handleCredentialResponse.bind(this);
    }
  }

  handleCredentialResponse(response: any): void {
    console.log("handle credentials invoked");
    const idToken = response.credential;
    this.http.post('http://localhost:3000/login', { id_token: idToken })
      .subscribe({
        next: (data:any) =>{
          if (data.success){
            console.log('success: ', data.message);
            this.router.navigateByUrl(data.redirectUrl);
          } else {
            console.log("unexpected json format! ", data);
          }
          
        },
        error: (error: any) =>{
          console.error('Error: ', error);
        }
      });
  }

}




