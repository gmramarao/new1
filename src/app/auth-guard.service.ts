import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

@Injectable()
export class AuthGuardService {

  constructor(private router: Router) {
    
    }
    
    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        if (localStorage.getItem('token')) {
            return true;
        }
        else {
            this.router.navigate(['/login']);
        }
        return false;
    }

}
