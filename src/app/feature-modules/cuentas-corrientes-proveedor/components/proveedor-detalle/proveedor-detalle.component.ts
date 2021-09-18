import {Component, Input} from '@angular/core';
import {HelperService} from '../../../../services/helper.service';
import {Proveedor} from '../../../../models/proveedor';

@Component({
  selector: 'app-proveedor-detalle',
  templateUrl: './proveedor-detalle.component.html'
})
export class ProveedorDetalleComponent {
  private pProveedor: Proveedor;
  @Input() set proveedor(value: Proveedor) { this.pProveedor = value; }
  get proveedor(): Proveedor { return this.pProveedor; }
  helper = HelperService;
}
