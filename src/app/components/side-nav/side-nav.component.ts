import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {AuthService} from '../../services/auth.service';
import {Rol} from '../../models/rol';

@Component({
  selector: 'app-side-nav',
  templateUrl: './side-nav.component.html',
  styleUrls: ['./side-nav.component.scss']
})
export class SideNavComponent implements OnInit {
  tieneRolAdministrador = false;
  tieneRolAdminOEncargado = false;
  tieneRolVendedor = false;

  @Output() menuOptionClick = new EventEmitter<void>();

  constructor(private authService: AuthService) { }

  ngOnInit() {
    this.tieneRolAdministrador = this.authService.userHasAnyOfTheseRoles([Rol.ADMINISTRADOR]);
    this.tieneRolAdminOEncargado = this.authService.userHasAnyOfTheseRoles([Rol.ADMINISTRADOR, Rol.ENCARGADO]);
    this.tieneRolVendedor = this.authService.userHasAnyOfTheseRoles([Rol.VENDEDOR]);
  }

  optionClick() {
    this.menuOptionClick.emit();
  }
}
