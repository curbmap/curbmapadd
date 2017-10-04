import { NgModule, ApplicationRef } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpModule } from '@angular/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NavInformation } from './shared/nav-information.service';
import { UserInformation } from './shared/user-information.service';
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { routing } from './app.routing';
import { removeNgStyles, createNewHosts } from '@angularclass/hmr';
import { AgmCoreModule } from '@agm/core';
import { InComponent } from './in/in.component';
import { ImageUploadModule } from 'angular2-image-upload';
import { AccordionModule, ModalModule, TimepickerModule, ButtonsModule} from 'ngx-bootstrap';
@NgModule({
    imports: [
        BrowserModule,
        HttpModule,
        FormsModule,
        ReactiveFormsModule,
        routing,
        ImageUploadModule.forRoot(),
        AgmCoreModule.forRoot({
            apiKey: 'AIzaSyDQMDcunrJ_DWL9vPXz5Zl3owJ0HdxOT00'
        }),
        ModalModule.forRoot(),
        AccordionModule.forRoot(),
        TimepickerModule.forRoot(),
        ButtonsModule.forRoot()
    ],
    declarations: [
        AppComponent,
        LoginComponent,
        InComponent
    ],
    providers: [
        NavInformation,
        UserInformation
    ],
    bootstrap: [AppComponent]
})
export class AppModule {
    constructor(public appRef: ApplicationRef) {}
    hmrOnInit(store) {
        console.log('HMR store', store);
    }
    hmrOnDestroy(store) {
        let cmpLocation = this.appRef.components.map(cmp => cmp.location.nativeElement);
        // recreate elements
        store.disposeOldHosts = createNewHosts(cmpLocation);
        // remove styles
        removeNgStyles();
    }
    hmrAfterDestroy(store) {
        // display new elements
        store.disposeOldHosts();
        delete store.disposeOldHosts;
    }
}
