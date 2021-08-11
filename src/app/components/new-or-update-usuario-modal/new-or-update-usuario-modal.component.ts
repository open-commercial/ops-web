import {Component, ViewChild} from '@angular/core';
import {Usuario} from '../../models/usuario';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {UFProfile, UsuarioFormComponent} from '../usuario-form/usuario-form.component';

@Component({
  selector: 'app-new-or-update-usuario-modal',
  templateUrl: './new-or-update-usuario-modal.component.html',
  styleUrls: ['./new-or-update-usuario-modal.component.scss']
})
export class NewOrUpdateUsuarioModalComponent {
  usuario: Usuario;
  ufProfile = UFProfile.USUARIO;

  @ViewChild('usuarioForm') usuarioForm: UsuarioFormComponent;
  constructor(public activeModal: NgbActiveModal) { }

  submit() {
    this.usuarioForm.submit();
  }

  onUserSaved(u: Usuario) {
    this.activeModal.close(u);
  }
}
