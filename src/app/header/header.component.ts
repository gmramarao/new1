import { Component, OnInit } from '@angular/core';
import {ServiceService} from '../service.service';
@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {

  constructor(private service: ServiceService) { 
    console.log(ServiceService);
    this.service.logInAnnouncement$.subscribe(active => {
        console.log(active);
    });
  }

  ngOnInit() {
  }

}