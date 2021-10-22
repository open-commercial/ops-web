import {Component, Input } from '@angular/core';
import { Cliente } from '../../models/cliente';
import {HelperService} from '../../services/helper.service';

@Component({
  selector: 'app-cliente-info',
  templateUrl: './cliente-info.component.html',
  styleUrls: ['./cliente-info.component.scss']
})
export class ClienteInfoComponent {
  private pCliente: Cliente;
  @Input() set cliente(value: Cliente) { this.pCliente = value; }
  get cliente(): Cliente { return this.pCliente; }

  helper = HelperService;
}
