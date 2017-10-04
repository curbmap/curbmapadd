import { Injectable } from '@angular/core';
import { Point } from './types';

@Injectable()
export class UserInformation {
    // This is a temporary in-memory storage for things about the user that can be created once and used in construction
    // of any of the other classes from their constructors
    private _username = '';
    private _userId = '';
    private _password = '';
    private _token = '';
    private _refreshToken = '';
    private _expiresIn = 0;
    private _csrf = '';
    private _mapDataUpdates = {
    };
    private _SESSION = '';

    getUsername(): string {
        return this._username;
    }

    setUsername(value: string) {
        this._username = value;
    }

    getUserId(): string {
        return this._userId;
    }

    setUserId(value: string) {
        this._userId = value;
    }

    getPassword(): string {
        return this._password;
    }

    setPassword(value: string) {
        this._password = value;
    }

    setToken(value: string) {
        this._token = value;
    }

    getToken(){
        return this._token;
    }

    setRefreshToken(value: string){
        this._refreshToken = value;
    }

    getRefreshToken() {
        return this._refreshToken;
    }

    setExpiresIn(value: number){
        this._expiresIn = value;
    }

    getExpiresIn(){
        return this._expiresIn;
    }

    getCsrf(): string {
        return this._csrf;
    }

    setCsrf(value: string) {
        this._csrf = value;
    }

    addPoint(key: string, value: Point) {
        this._mapDataUpdates[key] = value;
    }

    setSESSION(value: string) {
        this._SESSION = value;
    }

    getSESSION() {
        return this._SESSION;
    }
}
