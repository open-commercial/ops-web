import { Component, ElementRef, ViewChild } from '@angular/core';
import { Proveedor } from '../../models/proveedor';
import { Subject } from 'rxjs';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ProveedoresService } from '../../services/proveedores.service';
import { finalize } from 'rxjs/operators';
import { Pagination } from '../../models/pagination';

@Component({
  selector: 'app-proveedor-modal',
  templateUrl: './proveedor-modal.component.html',
  styleUrls: ['./proveedor-modal.component.scss']
})
export class ProveedorModalComponent {
  proveedores: Proveedor[] = [];
  clearLoading = false;
  loading = false;
  busqueda = '';
  input$  = new Subject<string>();

  proveedorSeleccionado: Proveedor = null;

  page = 0;
  totalElements = 0;
  totalPages = 0;
  size = 0;

  @ViewChild('searchInput') searchInput: ElementRef;

  constructor(public activeModal: NgbActiveModal,
              private proveedoresService: ProveedoresService) { }

  getProveedores(clearResults = false) {
    this.page += 1;
    if (clearResults) {
      this.clearLoading = true;
      this.page = 0;
      this.proveedores = [];
    } else {
      this.loading = true;
    }

    this.proveedoresService.getProveedores(this.busqueda, this.page)
      .pipe(
        finalize(() => {
          this.loading = false;
          this.clearLoading = false;
        })
      )
      .subscribe((p: Pagination) => {
        p.content.forEach((e) => this.proveedores.push(e));
        this.totalElements = p.totalElements;
        this.totalPages = p.totalPages;
        this.size = p.size;
      })
    ;
  }

  buscar() {
    this.getProveedores(true);
  }

  loadMore() {
    this.getProveedores();
  }

  select(c: Proveedor) {
    this.proveedorSeleccionado = c;
  }

  seleccionarProveedor() {
    if (this.proveedorSeleccionado) {
      this.activeModal.close(this.proveedorSeleccionado);
    }
  }
}
