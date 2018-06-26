import { Component, OnInit } from '@angular/core';
import { Http} from '@angular/http';
import { Router } from '@angular/router';
import {FormControl, Validators} from '@angular/forms';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  email = new FormControl('', [Validators.required]);
  
    getErrorMessage() {
      return this.email.hasError('required') ? 'You must enter a value' :
          this.email.hasError('email') ? 'Not a valid email' :
              '';
    }
  constructor(private http: Http, private router: Router) { }
  uname: any;
  psw: any;
  err: any;
  ngOnInit() {
    localStorage.clear();
    
    // regular expression

    const name = 'ramaraogaddam';
    console.log(name.search('\d'));
  }

  login(){
    var data = {
      user: this.uname, 
      password: this.psw 
    }
    if(data.user && data.password){
      this.http.post('http://localhost:7777/login/login', data).subscribe((res: any)=>{
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
