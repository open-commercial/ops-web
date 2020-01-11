import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Usuario } from '../../models/usuario';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { UsuariosService } from '../../services/usuarios.service';
import { finalize } from 'rxjs/operators';
import { Pagination } from '../../models/pagination';
import { Rol } from '../../models/rol';

@Component({
  selector: 'app-usuario-modal',
  templateUrl: './usuario-modal.component.html',
  styleUrls: ['./usuario-modal.component.scss']
})
export class UsuarioModalComponent implements OnInit {
  usuarios: Usuario[] = [];
  clearLoading = false;
  loading = false;
  busqueda = '';
  usuarioSeleccionado: Usuario;
  roles: Array<Rol> = [];

  page = 0;
  totalElements = 0;
  totalPages = 0;
  size = 0;

  @ViewChild('searchInput', { static: false }) searchInput: ElementRef;

  constructor(public activeModal: NgbActiveModal,
              private usuariosService: UsuariosService) { }

  ngOnInit() {
  }

  getUsuarios(clearResults = false) {
    this.page += 1;
    if (clearResults) {
      this.clearLoading = true;
      this.page = 0;
      this.usuarios = [];
    } else {
      this.loading = true;
    }

    this.usuariosService.getUsuarios(this.busqueda, this.page, this.roles)
      .pipe(
        finalize(() => {
          this.loading = false;
          this.clearLoading = false;
        })
      )
      .subscribe((p: Pagination) => {
        p.content.forEach((e) => this.usuarios.push(e));
        this.totalElements = p.totalElements;
        this.totalPages = p.totalPages;
        this.size = p.size;
      })
    ;
  }

  buscar() {
    this.getUsuarios(true);
  }

  loadMore() {
    this.getUsuarios();
  }

  select(u: Usuario) {
    this.usuarioSeleccionado = u;
  }

  seleccionarUsuario() {
    if (this.usuarioSeleccionado) {
      this.activeModal.close(this.usuarioSeleccionado);
    }
  }
}
