import { Injectable } from '@angular/core';
import { Headers, Http, Response } from '@angular/http';
import 'rxjs/add/operator/toPromise';
import { Observable } from 'rxjs';
import { Subject }    from 'rxjs/Subject';
@Injectable()
export class ServiceService {
  private status = new Subject<string>();
  logInAnnouncement$ = this.status.asObservable();
  constructor() { }
  header_satus_change(status: string) {
    this.status.next(status);
}
}
