import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { HelperService } from '../../services/helper.service';
import { Cliente } from '../../models/cliente';
import { ClienteModalComponent } from '../cliente-modal/cliente-modal.component';

@Component({
  selector: 'app-busqueda-cliente',
  templateUrl: './busqueda-cliente.component.html',
  styleUrls: ['./busqueda-cliente.component.scss']
})
export class BusquedaClienteComponent implements OnInit {
  private pReadOnly = false;
  private pCliente: Cliente = null;
  helper = HelperService;

  @Input()
  set cliente(c: Cliente) { this.pCliente = c; }
  get cliente(): Cliente { return this.pCliente; }

  @Output() select = new EventEmitter<Cliente>();

  @Input()
  set readOnly(ro: boolean) { this.pReadOnly = ro; }
  get readOnly() { return this.pReadOnly; }

  constructor(private modalService: NgbModal) { }

  ngOnInit() {}

  showClienteModal() {
    const modalRef = this.modalService.open(ClienteModalComponent, { scrollable: true });
    modalRef.result.then((c: Cliente) => {
      this.cliente = c;
      this.select.emit(this.cliente);
    }, (reason) => {});
  }

  clearCliente() { this.cliente = null; }
}
