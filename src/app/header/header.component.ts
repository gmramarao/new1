import { Component, OnInit } from '@angular/core';
import {ServiceService} from '../service.service';
@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  active: any;
  constructor(private service: ServiceService) { 
    console.log(ServiceService);
    this.service.logInAnnouncement$.subscribe(active => {
        console.log(active);
        this.active = active;
    });
  }

  ngOnInit() {
  }

}