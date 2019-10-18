import { Component, Input } from '@angular/core';
import { RenglonPedido } from '../../models/renglon-pedido';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-eliminar-renglo-pedido-modal',
  templateUrl: './eliminar-renglo-pedido-modal.component.html',
  styleUrls: ['./eliminar-renglo-pedido-modal.component.scss']
})
export class EliminarRengloPedidoModalComponent {
  @Input() rp: RenglonPedido;

  constructor(public activeModal: NgbActiveModal) {}
}
