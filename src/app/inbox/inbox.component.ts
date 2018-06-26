import { Component, OnInit } from '@angular/core';
import { Http } from '@angular/http';
import { ServiceService } from '../service.service';
import { Router } from '@angular/router';
@Component({
  selector: 'app-inbox',
  templateUrl: './inbox.component.html',
  styleUrls: ['./inbox.component.css']
})
export class InboxComponent implements OnInit {
  id: any;
  token: any;
  user: any;
  response: any;
  constructor(private service: ServiceService, private http: Http, private router: Router) { }

  ngOnInit() {
    this.service.header_satus_change('inbox');
    this.id = localStorage.getItem('id');
    this.token = localStorage.getItem('token');
    this.user = localStorage.getItem('user');
    // this.img = this.user == 'Rama Rao Gaddam' ? '../../assets/images/Ian-felligan-bondi-computer-guy.jpg': '../../assets/images/mahesh-babu-new-photos-feature-image-2dOlvuKIKIs2gmCQkw0e8O.jpg';
    var data = {
      user: this.user,
      id: this.id,
      token: this.token
    }
    this.http.post('get/get-users-data', data).subscribe((res: any) => {
      res = res.json();
      console.log(res);
      if (res.success) {
        this.response = res.msg;
        console.log(this.response);
      } else {

      }
    })
  }

  reply_to_user(reply_to_user){
    localStorage.setItem('reply_to_user', reply_to_user);
    this.router.navigate(['/chat']);
  }

}
