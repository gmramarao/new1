import { Component, OnInit } from '@angular/core';
import { Http } from '@angular/http';
import {Router} from '@angular/router';
@Component({
  selector: 'app-forgot',
  templateUrl: './forgot.component.html',
  styleUrls: ['./forgot.component.css']
})
export class ForgotComponent implements OnInit {
  email: any;
  otp: any;
  pwd: any;
  otp_flag: Boolean;
  otp_ver_flag: Boolean;
  err: any;
  constructor(private http: Http, private router: Router) { }

  ngOnInit() {
    // localStorage.clear();
    var data = {
      user: localStorage.getItem('user') 
    }
    if(localStorage.getItem('user')) {
      this.http.post('login/logout', data).subscribe((res: any)=>{
        console.log(res);
        localStorage.clear();
      })
    }
  }
  gen_otp(){
    var data = {
      email: this.email
    }
    if(data.email){
      this.http.post('login/gen-otp', data).subscribe((res:any)=>{
        res = res.json();
        if(res.success){
         this.err = '';
         this.otp_flag = true;
        } else {
          this.err = res.msg;
        }
      })
    } else {
      this.err = 'please enter your email';
    }
    
  }

  forgot_password(){
    var data = {
      email: this.email,
      otp: this.otp,
      password: this.pwd

    }
    if(data.otp && data.password){
      this.http.post('login/forgot-password', data).subscribe((res:any)=>{
        res = res.json();
        console.log(res);
        if(res.success){
          this.router.navigate(['login']);
        } else {
          this.err = res.msg;
        }
      })
    } else {
      this.err = 'All fields required';
    }
    
  }

}
