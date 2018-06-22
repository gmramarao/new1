import { Component, OnInit } from '@angular/core';
import {ServiceService} from '../service.service';
import {Http} from '@angular/http';
import { Router } from '@angular/router';
@Component({
  selector: 'app-invitefriends',
  templateUrl: './invitefriends.component.html',
  styleUrls: ['./invitefriends.component.css']
})
export class InvitefriendsComponent implements OnInit {
  id: any;
  token: any;
  email: any;
  user: any;
  status: Boolean = false;
  constructor(private service: ServiceService, private http: Http, private router: Router) { }

  ngOnInit() {
    this.id = localStorage.getItem('id');
    this.token = localStorage.getItem('token');
    this.user = localStorage.getItem('user');
    this.service.header_satus_change('invite_friends');
  }

  invite_friends(){
    const data = {
      user_id: this.id,
      token: this.token,
      email: this.email,
      user: this.user
    }
    this.http.post('http://localhost:7777/get/invitefriends', data).subscribe((res: any)=>{
      res = res.json();
      if(res.success){
        this.status = true;
        var that = this;
        setTimeout(function(){ 
          that.router.navigate(['/chat']);
         }, 5000);
        this.email = '';
      } else {
        this.status = false;
        this.email = '';
      }
    })
  }
}
