declare var google: any;

import { Injectable } from '@angular/core';
import { environment } from '../environments/environment';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GoogleAuthService {

  //declare a variable that holds the credential response from google sign in!
  private credentialResponseObject = new BehaviorSubject<any>(null);

  constructor() { }

  //initilize google sign in
  initilizeGoogleAuth(): void {
    google.accounts.id.initialize({
          client_id: environment.google_Oauth2_key,
          callback: (res: any)=>this.handleCredentialResponse(res)
    });
  }

  //render the google button sign in
  renderGoogleBtn(buttonId: string): void {
    const btnElement = document.getElementById(buttonId);

    if(btnElement){
      google.accounts.id.renderButton( btnElement , {
        theme: 'filled_black',
        size: 'large',
        shape: 'pill',
        width: 350,
      });
    } else {
      console.log('google btn element not found')
    }
  }

  //assign the response to the empty object we declared in the beginning
  private handleCredentialResponse(response: any){
    console.log('Google credential response: ', response);
    this.credentialResponseObject.next(response);

    this.credentialResponseObject.next(null);
  }

  getCredentialResponse(): Observable<any>{
    return this.credentialResponseObject.asObservable();
  }


  signOut(): void {
    google.accounts.id.disableAutoSelect();
    this.credentialResponseObject.next(null);
    
    //idk add more logic here
    console.log('Logged out');
  }


}
