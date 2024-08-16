import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { NgbAccordion, NgbPanelChangeEvent } from '@ng-bootstrap/ng-bootstrap';
import { Rol } from 'src/app/models/rol';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  menuOpened = false;
  rol = Rol;
  allowedRolesToView = [Rol.ADMINISTRADOR, Rol.ENCARGADO]

  constructor(private authService: AuthService,
              private router: Router  ) { }

  ngOnInit(): void {
    if (!this.authService.userHasAnyOfTheseRoles(this.allowedRolesToView)) {
       this.router.navigate(['/pedidos']);
    }
  }
}
