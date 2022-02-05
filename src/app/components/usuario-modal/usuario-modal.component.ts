import {Component, OnInit} from '@angular/core';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {UsuariosService} from '../../services/usuarios.service';
import {Rol} from '../../models/rol';
import {ItemSelectionModalDirective} from '../../directives/item-selection-modal.directive';
import {Observable} from 'rxjs';
import {Pagination} from '../../models/pagination';

@Component({
  selector: 'app-usuario-modal',
  templateUrl: './usuario-modal.component.html',
  styleUrls: ['./usuario-modal.component.scss']
})
export class UsuarioModalComponent extends ItemSelectionModalDirective implements OnInit {
  roles: Array<Rol> = [];
  constructor(public activeModal: NgbActiveModal,
              private usuariosService: UsuariosService) {
    super(activeModal);
  }

  ngOnInit(): void {
    this.searchInputPlaceholder = this.roles && this.roles.includes(Rol.VIAJANTE) ? 'Buscar Viajante...' : 'Buscar Usuario...';
  }

  getItemsObservable(): Observable<Pagination> {
    return this.usuariosService.getUsuarios(this.searchTerm, this.page, this.roles);
  }
}
