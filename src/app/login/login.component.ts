import { Component, OnInit, HostListener } from '@angular/core';
import { Http} from '@angular/http';
import { Router } from '@angular/router';
import {FormControl, Validators} from '@angular/forms';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  constructor(private http: Http, private router: Router) { }
  uname: any;
  psw: any;
  err: any;
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

  login(){
    var data = {
      user: this.uname, 
      password: this.psw 
    }
    if(data.user && data.password){
      this.http.post('login/login', data).subscribe((res: any)=>{
        res = res.json();
        console.log(res);
        if(res.success){
          this.err = '';
          localStorage.setItem('id', res.msg.id);
          localStorage.setItem('user', this.uname);
          localStorage.setItem('token', res.msg.token);
          this.router.navigate(['chat']);
        } else {
          this.err = res.msg;
        }
      })
    } else {
      this.err = 'All fields required';
    }
    
  }

  

}
