import { Component } from '@angular/core';
import '../style/app.scss';
import { NavInformation } from './shared/nav-information.service';

@Component({
    selector: 'my-app', // <my-app></my-app>
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
})
export class AppComponent {
    navLinks = [];

    constructor(private navInformation: NavInformation) {
        this.navInformation.getLocationEmitter().subscribe((item: string) => {
            if (item === 'nav') {
                this.navLinks = this.getNavLinks();
            }
        });
    }

    getNavLinks() {
        return this.navInformation.getNavLinks();
    }
}
