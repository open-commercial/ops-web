import { Rol } from './../../../../models/rol';
import { AuthService } from './../../../../services/auth.service';
import { UsuarioFormComponent } from './../../../../components/usuario-form/usuario-form.component';
import { MensajeService } from './../../../../services/mensaje.service';
import { finalize } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';
import { Component, OnInit, ViewChild } from '@angular/core';
import { Usuario } from 'src/app/models/usuario';
import { UsuariosService } from 'src/app/services/usuarios.service';
import { MensajeModalType } from 'src/app/components/mensaje-modal/mensaje-modal.component';
import { Location } from '@angular/common';

@Component({
  selector: 'app-usuario',
  templateUrl: './usuario.component.html',
})
export class UsuarioComponent implements OnInit {
  usuario: Usuario;
  loading = false;
  saving = false;

  @ViewChild('usuarioForm') usuarioForm: UsuarioFormComponent;

  allowedRolesToCreateOrEdit: Rol[] = [Rol.ADMINISTRADOR];

  hasRoleToCreateOrEdit = false;

  constructor(private route: ActivatedRoute,
              private location: Location,
              private mensajeService: MensajeService,
              private usuariosService: UsuariosService,
              private authService: AuthService) { }

  ngOnInit(): void {
    this.hasRoleToCreateOrEdit = this.authService.userHasAnyOfTheseRoles(this.allowedRolesToCreateOrEdit);

    if (!this.hasRoleToCreateOrEdit) {
      this.mensajeService.msg('Ud no posee permisos para crear o editar usuarios.', MensajeModalType.ERROR);
      this.volverAlListado();
      return;
    }

    if (this.route.snapshot.paramMap.has('id')) {
      const id = Number(this.route.snapshot.paramMap.get('id'));
      this.loading = true;
      this.usuariosService.getUsuario(id)
        .pipe(finalize(() => this.loading = false))
        .subscribe({
          next: u => this.usuario = u,
          error: err => {
            this.volverAlListado();
            this.mensajeService.msg(err.error, MensajeModalType.ERROR);
          }
        })
      ;
    }
  }

  volverAlListado() {
    this.location.back();
  }

  submit() {
    this.usuarioForm.submit();
  }

  onUserSaved() {
    this.mensajeService.msg('Los datos de usuario se guardaron correctamente.', MensajeModalType.INFO).then(() => {
      this.volverAlListado();
    })
  }
}
