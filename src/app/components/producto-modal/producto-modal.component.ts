import { Component } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Producto } from '../../models/producto';
import { finalize } from 'rxjs/operators';
import { Pagination } from '../../models/pagination';
import { ProductosService } from '../../services/productos.service';
import { BusquedaProductoCriteria } from '../../models/criterias/busqueda-producto-criteria';
import { Sucursal } from '../../models/sucursal';
import { LoadingOverlayService } from '../../services/loading-overlay.service';
import { SucursalesService} from '../../services/sucursales.service';
import { Cliente } from '../../models/cliente';
import { Movimiento } from '../../models/movimiento';
import { ItemSelectionModalDirective } from '../../directives/item-selection-modal.directive';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-producto-modal',
  templateUrl: './producto-modal.component.html',
  styleUrls: ['./producto-modal.component.scss']
})
export class ProductoModalComponent extends ItemSelectionModalDirective {
  cantidadesInicialesPedido: { [idProducto: number]: number } = {};
  cantidadesActualesPedido: { [idProducto: number]: number } = {};

  sucursal: Sucursal = null;

  cliente: Cliente = null;
  movimiento: Movimiento = null;

  private pIdSucursal: number = null;
  set idSucursal(value: number) {
    this.pIdSucursal = value;
    if (value) {
      this.loadingOverlayService.activate();
      this.sucursalesService.getSucursal(value)
        .pipe(finalize(() => this.loadingOverlayService.deactivate()))
        .subscribe(s => this.sucursal = s, () => this.sucursal = null)
      ;
    }
  }
  get idSucursal(): number { return this.pIdSucursal; }

  constructor(public activeModal: NgbActiveModal,
              public productosService: ProductosService,
              private sucursalesService: SucursalesService,
              private loadingOverlayService: LoadingOverlayService) {
    super(activeModal);
    this.searchInputPlaceholder = 'Buscar Producto...';
  }

  getCantidadDisponible(p: Producto) {
    const c = this.productosService.getCantidadDisponible(p, this.pIdSucursal);
    const ci = this.cantidadesInicialesPedido[p.idProducto] || 0;
    const ca = this.cantidadesActualesPedido[p.idProducto] || 0;
    const res = c - (ca - ci);
    return res > 0 ? res : 0;
  }

  getCantDisponibleOtrasSucursales(p: Producto) {
    const c = this.productosService.getCantidadDisponible(p, this.pIdSucursal);
    const cos = this.productosService.getCantDisponibleOtrasSucursales(p, this.pIdSucursal);
    const ci = this.cantidadesInicialesPedido[p.idProducto] || 0;
    const ca = this.cantidadesActualesPedido[p.idProducto] || 0;

    let left = c - (ca - ci);
    left = left >= 0 ? 0 : left * -1;

    const ret = cos - left;
    return ret >= 0 ? ret : 0;
  }

  getItemsObservable(): Observable<Pagination> {
    const criteria: BusquedaProductoCriteria = {
      codigo: this.searchTerm,
      descripcion: this.searchTerm,
      pagina: this.page,
    };

    return this.productosService.buscar(criteria, this.cliente ? this.cliente.idCliente : null, this.movimiento);
  }
}
