import { Component, OnInit } from '@angular/core';
import { NavInformation } from '../shared/nav-information.service';
import { sendGet, sendPost } from '../shared/http.resources';
import { Http, Response } from '@angular/http';
import { UserInformation } from '../shared/user-information.service';
import * as $ from 'jquery';
import { Router } from '@angular/router';

let frontend: string = location.hostname === 'localhost' ? 'http://localhost:8080' : 'https://curbmap.com:443';

@Component({
    selector: 'my-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

    constructor(
        private navInformation: NavInformation,
        private http: Http,
        private router: Router,
        private userInformation: UserInformation,
    ) {
            // Do stuff
            this.navInformation.setNavLinks('Login');
            sendGet(this.http,
                {'Access-Control-Allow-Origin': '*'},
                frontend + '/token',
                this.getToken.bind(this),
                this.gotError).subscribe(response => {
                if (response != []) {
                    let headers = {
                        'content-type': 'application/x-www-form-urlencoded',
                        'Access-Control-Allow-Origin': '*',
                        'X-XSRF-TOKEN': response,
                        'withCredentials': true
                    };
                    let testUser = {
                        'username': 'curbmaptest',
                        'password': 'TestCurbm@p1'
                    };
                    sendPost(this.http,
                        headers,
                        $.param(testUser),
                        frontend + '/login',
                        this.getLoginResponse,
                        this.gotError).subscribe(loginResult => {
                            console.log(loginResult);
                            if (loginResult !== []) {
                                this.userInformation.setUsername('curbmaptest');
                                this.userInformation.setPassword('TestCurbm@p1');
                                this.userInformation.setSESSION(loginResult[1]);
                                this.router.navigate(['/in'], {skipLocationChange: true})
                            }
                        }
                    );
                }
            });
        }
        getLoginResponse(r: Response) {
            if (r.url.toString().endsWith('error')) {
                return [];
            } else {
                let loginContent = r.json();
                return [true, loginContent['session']];
            }
        }

        getToken(r: Response) {
            this.userInformation.setCsrf(r.text());
            return [true];
        }

        gotError(e: Response) {
            console.log(e);
            return [];
        }

        gotUser(r: Response) {
            let userContent = r.json();
            return [true, userContent['session']];
        }

        gotNotLoggedIn(e: Response) {
            console.log('ERROR: '+e);
            return [];
        }

        ngOnInit() {
            sendGet(this.http, {}, frontend + '/user', this.gotUser, this.gotNotLoggedIn).subscribe((getUser)=>{
                if (getUser !== [] && this.userInformation.getUsername() !== '') {
                    console.log("USER");
                    console.log(getUser);
                    this.userInformation.setSESSION(getUser[1]);
                    this.router.navigate(['/in'], {skipLocationChange: true});
                }
            })

        }

    }
