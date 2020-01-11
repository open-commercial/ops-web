import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { finalize } from 'rxjs/operators';
import { Pagination } from '../../models/pagination';
import { HelperService } from '../../services/helper.service';
import { Cliente } from '../../models/cliente';
import { ClientesService } from '../../services/clientes.service';

@Component({
  selector: 'app-cliente-modal',
  templateUrl: './cliente-modal.component.html',
  styleUrls: ['./cliente-modal.component.scss']
})
export class ClienteModalComponent implements OnInit {
  clientes: Cliente[] = [];
  clearLoading = false;
  loading = false;
  busqueda = '';
  clienteSeleccionado: Cliente = null;
  helper = HelperService;

  page = 0;
  totalElements = 0;
  totalPages = 0;
  size = 0;

  @ViewChild('searchInput', { static: false }) searchInput: ElementRef;

  constructor(public activeModal: NgbActiveModal,
              private clientesService: ClientesService) { }

  ngOnInit() {}

  getClientes(clearResults = false) {
    this.page += 1;
    if (clearResults) {
      this.clearLoading = true;
      this.page = 0;
      this.clientes = [];
    } else {
      this.loading = true;
    }

    this.clientesService.getClientes(this.busqueda, this.page)
      .pipe(
        finalize(() => {
          this.loading = false;
          this.clearLoading = false;
        })
      )
      .subscribe((p: Pagination) => {
        p.content.forEach((e) => this.clientes.push(e));
        this.totalElements = p.totalElements;
        this.totalPages = p.totalPages;
        this.size = p.size;
      })
    ;
  }

  buscar() {
    this.getClientes(true);
  }

  loadMore() {
    this.getClientes();
  }

  select(c: Cliente) {
    this.clienteSeleccionado = c;
  }

  seleccionarCliente() {
    if (this.clienteSeleccionado) {
      this.activeModal.close(this.clienteSeleccionado);
    }
  }
}
