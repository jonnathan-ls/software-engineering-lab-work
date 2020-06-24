import { Injectable } from '@angular/core';
import { User } from '../model-interfaces/user';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { API } from '../api/api-endpoint';
import { ErrorMessages } from 'src/assets/error-messages';

const TOKEN = "token";

@Injectable({ providedIn: 'root' })
export class AuthenticationService {

  	constructor(private http: HttpClient){}

	authenticate = (user: User): Promise<string> => {
		if (!user.username) throw new Error('Authentication Service : authentication method requires a user to be informed.');
		
		const auth = btoa(`${user.username}:${user.password}`);

		let headers: HttpHeaders = new HttpHeaders();

		headers = headers.append("Authorization", `Basic ${auth}`);
		headers = headers.append("Content-Type", "application/json");

		return new Promise( (resolve, reject) => {
			this.http.get(API.authenticate, { headers, observe: 'response' }).subscribe(
				response => {
					if(response.status === 200) 
						if (response.body.hasOwnProperty("data"))
							sessionStorage.setItem(TOKEN, auth);
					resolve(ErrorMessages.authenticate.valid);
				},
				error => {
					reject(new Error(ErrorMessages.authenticate.invalid));				
				}
			);
		})

	}
	
	isAuthenticated = (): boolean => !!sessionStorage.getItem(TOKEN);
	getAuthorization = (): string => sessionStorage.getItem(TOKEN);    
}