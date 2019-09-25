/*  Copyright (c) 2019 AT&T Intellectual Property.                             #
#                                                                              #
#   Licensed under the Apache License, Version 2.0 (the "License");            #
#   you may not use this file except in compliance with the License.           #
#   You may obtain a copy of the License at                                    #
#                                                                              #
#       http://www.apache.org/licenses/LICENSE-2.0                             #
#                                                                              #
#   Unless required by applicable law or agreed to in writing, software        #
#   distributed under the License is distributed on an "AS IS" BASIS,          #
#   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.   #
#   See the License for the specific language governing permissions and        #
#   limitations under the License.                                             #
##############################################################################*/


import { HttpClient, HttpHeaders } from "@angular/common/http";
import { AppGlobals } from "../../app.global";
import { ParamsService } from "./params.service";
import { Observable, observable, from } from "rxjs";
import { CookieService } from "ngx-cookie-service";
import { FeathersService } from "./feathers.service";
import { Injectable } from "@angular/core";

Injectable({
    providedIn: 'root'
})
export class ModelService {

    protected path;
    protected http: HttpClient;
    protected Params: ParamsService;
    protected cookie: CookieService;
    protected feathers: FeathersService;
    private authenticated: Boolean = false;

    constructor(endpoint: String, http: HttpClient, Params: ParamsService, cookie: CookieService, feathers: FeathersService) {
        this.http = http;
        this.Params = Params;
        this.path = AppGlobals.baseAPIUrl + endpoint;
        this.cookie = cookie;
        this.feathers = feathers;
    }

    checkAuth(): Observable<Object>{
        return this.feathers.auth;
    }

    call(method, data?, path?){
        if(!path){
            path = this.path;
        }
        return new Observable(observer => {
            var init = null;
            if(data.params && data.params.events){
                delete data.params.events;
                this.feathers.service(path)
                    .on('created', data => {
                        if(init){
                            if(init.data){
                                (init.data as Array<Object>).unshift(data);
                                observer.next(init);
                            }else{
                                (init as Array<Object>).unshift(data);
                                observer.next(init);
                            }
                        }
                    })
                    .on('removed', data => {
                        if(init){
                            if(init.data){
                                init.data = (init.data as Array<Object>).filter(item => item['_id'] != data._id);
                                observer.next(init);
                            }else{
                                init  = (init as Array<Object>).filter(item => item['_id'] != data._id);
                                observer.next(init);
                            }
                        }
                    })
                    .on('updated', data => {
                        if(init){
                            if(init.data){
                                (init.data as Array<Object>).forEach((elem, val) => {
                                    if(elem['_id'] == data._id){
                                        (init.data as Array<Object>).splice(val, 1, data);
                                        return;
                                    }
                                })
                                observer.next(init);
                            }else{
                                (init as Array<Object>).forEach((elem, val) => {
                                    if(elem['_id'] == data._id){
                                        (init as Array<Object>).splice(val, 1, data);
                                        return;
                                    }
                                })
                                observer.next(init);
                            }
                        }
                    });
                
            }
            this.checkAuth().subscribe(res => {
                if(data.data){
                    
                    //UPDATE & PATCH
                    if(method == 'update' || method == 'patch'){
                        let id = data.data._id;
                        delete data.data._id;
                        this.feathers.service(path)[method](id, data.data, {query: data.params}).then(result =>{
                            if(!init){
                                init = result;
                            }
                            observer.next(result)
                        }).catch(err => {
                            observer.error(err)}
                            );
                    }else{
                        this.feathers.service(path)[method](data.data, {query: data.params}).then(result =>{
                            if(!init){
                                init = result;
                            }
                            observer.next(result)
                        }).catch(err => {
                            observer.error(err)
                        });
                    }
                }else{
                    this.feathers.service(path)[method]({query: data.params}).then(result =>{
                        if(!init){
                            init = result;
                        }
                        observer.next(result)
                    }).catch(err => observer.error(err));
                }

            }, err => {
                
                this.feathers.authenticate().subscribe(res => {
                    observer.next(this.call(method, data, path));
                })
            });
        })  
    }

    on(event){
        return new Observable(observer => {
            this.feathers.service(this.path).on(event, (data) => {
                observer.next(data);
            });
        })
    }

    // sfind(params = []): Observable<Object> {
    //     return this.http.get(this.path + this.Params.toString(params), this.getHttpOptions());
    // }

    find(params?): Observable<Object> {

        return this.call('find', {params: params})
    }

    // sget(id, params = []): Observable<Object> {
    //     return from(this.http.get(this.path + '/' + id + this.Params.toString(params), this.getHttpOptions()));
    // }

    get(id, params?): Observable<Object> {
        return this.call('get', {data: id, params: params})
    }

    // create(data, params = []): Observable<Object> {
    //     return this.http.post(this.path + this.Params.toString(params), data, this.getHttpOptions());
    // }

    create(data, params?): Observable<Object> {
        return this.call('create', {data: data, params: params})
    }

    // update(data, params = []): Observable<Object> {
    //     return this.http.put(this.path + '/' + data._id + this.Params.toString(params), data, this.getHttpOptions());
    // }

    update(data, params?): Observable<Object> {
        return this.call('update', {data: data, params: params})
    }

    // patch(data, params = []): Observable<Object> {
    //     return this.http.patch(this.path + '/' + data._id + this.Params.toString(params), data, this.getHttpOptions());
    // }

    patch(data, params?): Observable<Object> {
        return this.call('patch', {data: data, params: params})
    }

    // delete(id, params = []): Observable<Object> {
    //     return this.http.delete(this.path + '/' + id + this.Params.toString(params), this.getHttpOptions());
    // }

    delete(id, params?): Observable<Object> {
        return this.call('remove', {data: id, params: params})
    }

    protected getHttpOptions() {
        return {
            headers: new HttpHeaders({
                'Authorization': 'Bearer ' + JSON.parse(this.cookie.get('access_token'))
            })
        };
    }

}