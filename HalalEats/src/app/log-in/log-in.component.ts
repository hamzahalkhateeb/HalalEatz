declare var google: any;
import { Component, OnInit, Inject, PLATFORM_ID, OnDestroy } from '@angular/core';
import { HttpClient, } from '@angular/common/http';
import { Router } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Subscription } from 'rxjs';
import { GoogleAuthService } from '../google-auth.service';


@Component({
  selector: 'app-log-in',
  standalone: true,
  imports: [
    CommonModule, 
    ],
  templateUrl: './log-in.component.html',
  styleUrl: './log-in.component.css'
})

export class LogInComponent implements OnInit {

  private credentialSubscription!: Subscription;
  constructor(@Inject(PLATFORM_ID) private platformId: Object, private http: HttpClient, private router: Router, private gooogleAuthService: GoogleAuthService) {}

  ngOnInit(): void {

    if (isPlatformBrowser(this.platformId)){
      (window as any)['OpenListingForm'] = this.OpenListingForm.bind(this);
    }

    this.gooogleAuthService.initilizeGoogleAuth();
    this.gooogleAuthService.renderGoogleBtn('googlebtn');

    this.credentialSubscription = this.gooogleAuthService
     .getCredentialResponse()
     .subscribe((response) => {
      if (response) {
        console.log('Received credentiuals in the ccomponent:', response);
        this.sendCredentialsToBackend(response);
      }
     })
    

     //more initialization functions here!



  }

  ngOnDestroy(): void{
    if (this.credentialSubscription){
      this.credentialSubscription.unsubscribe();
    }
  }

  sendCredentialsToBackend(response: any): void {

    console.log('sin in attempt initiated: to back end the log in details!');
    console.log("sign in attemp initiated! *****************************************");
    
    const auth_token = response.credential;
    this.http.post('http://localhost:3000/login', {auth_token})
      .subscribe({
        next: (data:any) =>{
          if (data.success){
            alert(data.message);
            const rurl = `${data.redirectUrl}?userId=${data.userId}`;
            this.router.navigateByUrl(rurl);
          } else {
            console.log("unexpected json format! ", data);
          }
          
        },
        error: (error: any) =>{
          console.error('Error: ', error);
        }
      });
  }

  

  OpenListingForm(response: any): void{
    console.log("Listing form requested!");
    this.router.navigateByUrl("/listing-form");
    
  }

  
}




