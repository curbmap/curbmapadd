import { Http, Headers, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';

export function sendPost(http: Http, type: Object, body: string, address: string, extractData: Function, handleError: Function): Observable<any> {
  let reqHeaders = new Headers(type);
  let reqOptions = new RequestOptions({headers: reqHeaders});
  return http.post(address, body, reqOptions).map(value => extractData(value)).catch(error => handleError(error));
}

export function sendGet(http: Http, type: Object, address: string, extractData: Function, handleError: Function): Observable<any> {
  let reqHeaders = new Headers(type);
  let reqOptions = new RequestOptions({headers: reqHeaders});
  return http.get(address, reqOptions).map(value => extractData(value)).catch(error => handleError(error));
}
