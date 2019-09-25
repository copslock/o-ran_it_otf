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


import {CommonModule} from '@angular/common';
import {HTTP_INTERCEPTORS, HttpClient, HttpClientModule} from '@angular/common/http';
import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {TranslateLoader, TranslateModule} from '@ngx-translate/core';
import {TranslateHttpLoader} from '@ngx-translate/http-loader';
import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {AuthGuard, AdminGuard, SharedPipesModule, PageHeaderModule} from './shared';
import {FormsModule} from '@angular/forms';
import {ListService} from './shared/services/list.service';
import {MatButtonModule, MatDatepickerModule, MatDialogModule, MatIconModule, MatInputModule, MatRadioModule, MatMenu, MatMenuModule} from '@angular/material';
import {AppGlobals} from './app.global';
import {ErrorInterceptor} from './error.interceptor';
import {CookieService} from 'ngx-cookie-service';
import {NgxMaterialTimepickerModule} from 'ngx-material-timepicker';
import { SocketIoModule, SocketIoConfig } from 'ngx-socket-io';
import { FeathersService } from './shared/services/feathers.service';
import { CoreModule } from './core/core.module';
import { AbilityModule } from '@casl/angular'


const config: SocketIoConfig = { url: '/', options: {transports: ['websocket']} };

// AoT requires an exported function for factories
export const createTranslateLoader = (http: HttpClient) => {
    /* for development
    return new TranslateHttpLoader(
        http,
        '/start-angular/SB-Admin-BS4-Angular-6/master/dist/assets/i18n/',
        '.json'
    ); */
    return new TranslateHttpLoader(http, './assets/i18n/', '.json');
};

@NgModule({
    imports: [
        CommonModule,
        BrowserModule,
        FormsModule,
        PageHeaderModule,
        BrowserAnimationsModule,
        HttpClientModule,
        TranslateModule.forRoot({
            loader: {
                provide: TranslateLoader,
                useFactory: createTranslateLoader,
                deps: [HttpClient]
            }
        }),
        AppRoutingModule,
        SharedPipesModule,
        NgxMaterialTimepickerModule.forRoot(),
        MatButtonModule,
        MatDialogModule,
        MatRadioModule,
        MatInputModule,
        MatIconModule,
        MatDatepickerModule,
        SocketIoModule.forRoot(config),
        CoreModule,
        MatMenuModule,
        AbilityModule.forRoot()
    ],
    declarations: [
        AppComponent,
    ],
    providers: [
        FeathersService, {provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true}, AuthGuard, AdminGuard, ListService, AppGlobals, CookieService],
    bootstrap: [AppComponent]
})
export class AppModule {
}
