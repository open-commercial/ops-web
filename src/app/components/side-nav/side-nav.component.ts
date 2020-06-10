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
  tieneRolAdminOEncargado = false;
  tieneRolVendedor = false;

  @Output() menuOptionClick = new EventEmitter<void>();

  constructor(private authService: AuthService) { }

  ngOnInit() {
    this.authService.getLoggedInUsuario()
      .subscribe((u: Usuario) => {
        this.usuario = u;
        this.tieneRolAdminOEncargado = this.usuarioTieneRol(Rol.ADMINISTRADOR) || this.usuarioTieneRol(Rol.ENCARGADO);
        this.tieneRolVendedor = this.usuarioTieneRol(Rol.VENDEDOR);
      })
    ;
  }

  optionClick() {
    this.menuOptionClick.emit();
  }

  usuarioTieneRol(r: Rol) {
    return this.usuario && this.usuario.roles.filter(x => x === r).length > 0;
  }
}
