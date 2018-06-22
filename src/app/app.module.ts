import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { SignupComponent } from './signup/signup.component';
import { ForgotComponent } from './forgot/forgot.component';
import { ChatboxComponent } from './chatbox/chatbox.component';
import {AuthGuardService} from './auth-guard.service';
import { HeaderComponent } from './header/header.component';
import { InvitefriendsComponent } from './invitefriends/invitefriends.component';
import { ServiceService } from './service.service';
import { FilterPipe} from './filters/search_filter';
import { InboxComponent } from './inbox/inbox.component';
import { MDBBootstrapModule } from 'angular-bootstrap-md';
const appRoutes: Routes = [
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: 'signup',
    component: SignupComponent,
  },
  {
    path: 'forgot',
    component: ForgotComponent,
  },
  {
    path: 'chat',
    component: ChatboxComponent,
    canActivate: [AuthGuardService]
  },
  {
    path: 'inbox',
    component: InboxComponent,
    canActivate: [AuthGuardService]
  },
  {
    path: 'invitefriends',
    component: InvitefriendsComponent,
    canActivate: [AuthGuardService]
  },
  { path: '',
    redirectTo: '/login',
    pathMatch: 'full'
  },
  { path: '**', component: AppComponent }
];

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    SignupComponent,
    ForgotComponent,
    ChatboxComponent,
    HeaderComponent,
    InvitefriendsComponent,
    FilterPipe,
    InboxComponent
  ],
  imports: [
    BrowserModule,
    RouterModule.forRoot(
      appRoutes,
      { enableTracing: true } // <-- debugging purposes only
    ),
    FormsModule,
    HttpModule,
    MDBBootstrapModule.forRoot()
  ],
  providers: [AuthGuardService, ServiceService],
  bootstrap: [AppComponent]
})
export class AppModule { 



  
}
