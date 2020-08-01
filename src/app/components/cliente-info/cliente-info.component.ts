import {Component, Input, OnInit} from '@angular/core';
import { Cliente } from '../../models/cliente';
import {HelperService} from '../../services/helper.service';

@Component({
  selector: 'app-cliente-info',
  templateUrl: './cliente-info.component.html',
  styleUrls: ['./cliente-info.component.scss']
})
export class ClienteInfoComponent implements OnInit {
  private pCliente: Cliente;
  @Input() set cliente(value: Cliente) { this.pCliente = value; }
  get cliente(): Cliente { return this.pCliente; }

  helper = HelperService;

  constructor() { }

  ngOnInit() {
  }
}
