import { Component, OnInit } from '@angular/core';
import { Http} from '@angular/http';
import {Router} from '@angular/router';
@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit {
  email: any;
  uname: any;
  psw: any;
  err: any;
  constructor(private http: Http, private router: Router) { }

  ngOnInit() {
  }
  signup(){
    const data = {
      email: this.email,
      user: this.uname,
      password: this.psw
    }
    if(data.email && data.user && data.password){
      this.http.post('http://localhost:7777/login/signup', data).subscribe((res: any)=>{
        console.log(res);
        res = res.json();
        if(res.success){
          this.router.navigate(['login']);
        } else {
          this.err = res.msg;
        }
      })
    } else {
      this.err = "All fields required";
    }
    
  }
}
