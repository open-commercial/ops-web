import {Component, Input} from '@angular/core';
import {Cliente} from '../../models/cliente';
import {HelperService} from '../../services/helper.service';

@Component({
  selector: 'app-cliente-detalle',
  templateUrl: './cliente-detalle.component.html'
})
export class ClienteDetalleComponent {
  private pCliente: Cliente;
  @Input() set cliente(value: Cliente) { this.pCliente = value; }
  get cliente(): Cliente { return this.pCliente; }
  helper = HelperService;
}
