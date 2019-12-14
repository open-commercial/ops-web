import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Usuario } from '../../models/usuario';
import { AuthService } from '../../services/auth.service';
import { Rol } from '../../models/rol';

@Component({
  selector: 'app-side-nav',
  templateUrl: './side-nav.component.html',
  styleUrls: ['./side-nav.component.scss']
})
export class SideNavComponent implements OnInit {
  usuario: Usuario;

  @Output() menuOptionClick = new EventEmitter<void>();

  constructor(private authService: AuthService) { }

  ngOnInit() {
    this.authService.getLoggedInUsuario()
      .subscribe((u: Usuario) => this.usuario = u)
    ;
  }

  optionClick() {
    this.menuOptionClick.emit();
  }

  usuarioTieneRol(r: Rol) {
    return this.usuario.roles.filter(x => x === r).length > 0;
  }

  tieneRolAdminOEncargado() {
    return this.usuarioTieneRol(Rol.ADMINISTRADOR) || this.usuarioTieneRol(Rol.ENCARGADO);
  }
}
