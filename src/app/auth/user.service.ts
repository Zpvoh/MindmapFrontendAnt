import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {User} from './user';
import {Observable} from 'rxjs';
import {RegisterUser} from './register-user';
import {environment} from '../../environments/environment';


const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json'
  })
};

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private loginUrl = '';
  private sendCodeUrl = '';
  private registerUrl = '';
  private modifyPwdUrl = '';

  constructor(
    private http: HttpClient
  ) {
    const url = environment.apiUrl;

    this.loginUrl = url + 'login';
    this.sendCodeUrl = url + 'register';
    this.registerUrl = url + 'transfer';
    this.modifyPwdUrl = url + 'modify_password';
  }

  login(user: User): Observable<boolean> {
    // console.log(user);
    return this.http.post<boolean>(this.loginUrl, user, httpOptions);
  }

  sendCode(user: RegisterUser): Observable<boolean> {
    return this.http.post<boolean>(this.sendCodeUrl, user, httpOptions);
  }

  register(user: RegisterUser): Observable<boolean> {
    // return this.http.post<boolean>(this.registerUrl, user, httpOptions);
    return this.http.post<boolean>(environment.apiUrl + 'register', user, httpOptions);
  }

  modifyPassword(user: User): Observable<boolean> {
    return this.http.post<boolean>(this.modifyPwdUrl, user, httpOptions);
  }
}
