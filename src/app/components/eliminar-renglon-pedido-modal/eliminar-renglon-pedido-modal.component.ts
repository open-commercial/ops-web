import { Component, Input } from '@angular/core';
import { RenglonPedido } from '../../models/renglon-pedido';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-eliminar-renglo-pedido-modal',
  templateUrl: './eliminar-renglon-pedido-modal.component.html',
  styleUrls: ['./eliminar-renglon-pedido-modal.component.scss']
})
export class EliminarRenglonPedidoModalComponent {
  @Input() rp: RenglonPedido;

  constructor(public activeModal: NgbActiveModal) {}
}
