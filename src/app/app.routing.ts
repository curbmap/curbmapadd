import { RouterModule, Routes } from '@angular/router';

import { LoginComponent } from './login/login.component';
import { InComponent } from './in/in.component';

const routes: Routes = [
    { path: '', component: LoginComponent },
    { path: 'in', component: InComponent }
];

export const routing = RouterModule.forRoot(routes);
