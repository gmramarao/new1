import { Component, OnInit, HostListener } from '@angular/core';
import { Http } from '@angular/http';
import { ServiceService } from '../service.service';
import * as io from 'socket.io-client';
declare var jquery: any;
declare var $: any;
@Component({
  selector: 'app-chatbox',
  templateUrl: './chatbox.component.html',
  styleUrls: ['./chatbox.component.css']
})
export class ChatboxComponent implements OnInit {
  msg: any;
  user: any;
  id: any;
  token: any;
  chat_box: any = [];
  img: any;
  users: any = [];
  to_user: any;
  socket;
  to_user_pic;
  url = 'http://localhost:7777';
  pic = '';
  constructor(private http: Http, private service: ServiceService) {
    this.socket = io.connect();
  }

  ngOnInit() {
    this.service.header_satus_change('chat');
    var that = this;

    this.socket.on('new-message', function (data) {
      // data = JSON.parse(data);
      console.log(data);
      if (that.user === data.user || that.user === data.to_user) {
        console.log('i am calling');
        that.get_chat_box();
      }
    });

    this.socket.on('users-status', function (data) {
      console.log(data);
      that.get_users();
    });

    this.socket.emit('clientEvent', 'Sent an event from the client!');
    this.id = localStorage.getItem('id');
    this.token = localStorage.getItem('token');
    this.user = localStorage.getItem('user');
    this.pic = localStorage.getItem('pic');
    this.get_user(localStorage.getItem('reply_to_user'), '');
    localStorage.setItem('reply_to_user', '');
    this.img = this.user == 'Rama Rao Gaddam' ? '../../assets/images/Ian-felligan-bondi-computer-guy.jpg' : '../../assets/images/mahesh-babu-new-photos-feature-image-2dOlvuKIKIs2gmCQkw0e8O.jpg';
    this.get_users();

    // const data = {
    //   user: this.user,
    //   id: this.id,
    //   token: this.token
    // }
    // this.http.post('http://localhost:7777/get/get-msg', data).subscribe((res: any)=>{
    //   res = res.json();
    //   if(res.success){
    //     this.chat_box = res.msg;
    //     console.log(this.chat_box);
    //   } else {

    //   }
    // })
  }

  submit() {
    const data = {
      msg: this.msg,
      user: this.user,
      id: this.id,
      token: this.token,
      to_user: this.to_user,
      date: new Date().toLocaleString(),
      img: this.img
    }
    this.http.post('get/msg-post', data).subscribe((res: any) => {
      res = res.json();
      if (res.success) {
        this.msg = '';
        // this.get_chat_box();
      } else {

      }
    })
  }

  get_chat_box() {
    const data = {
      user: this.user,
      id: this.id,
      token: this.token,
      to_user: this.to_user,
    }
    this.http.post('get/get-msg', data).subscribe((res: any) => {
      res = res.json();
      console.log(res);
      if (res.success) {
        this.chat_box = res.msg;
        console.log(this.chat_box);
      } else {

      }
    })
  }
  get_users() {
    var data = {
      user: this.user,
      id: this.id,
      token: this.token
    }
    this.http.post('get/get-users', data).subscribe((res: any) => {
      res = res.json();
      console.log(res);
      if (res.success) {
        this.users = res.msg;
      } else {

      }
    })
  }




  get_user(user, pic) {
    this.to_user = user;
    this.get_chat_box();
    this.to_user_pic = pic;
    // setInterval(() => {
    //   this.get_chat_box(); 
    //   }, 5000);
  }

  @HostListener('window:beforeunload', ['$event'])
  beforeunloadHandler(event) {
    console.log(event);
    // var data = {
    //   user: this.user, 
    // }
    // localStorage.clear();
    // this.http.post('login/logout', data).subscribe((res: any)=>{
    //   console.log(res);
    // })
  }


}


