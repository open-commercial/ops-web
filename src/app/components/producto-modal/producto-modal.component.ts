import { Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Producto } from '../../models/producto';
import { finalize } from 'rxjs/operators';
import { Pagination } from '../../models/pagination';
import { ProductosService } from '../../services/productos.service';
import { BusquedaProductoCriteria } from '../../models/criterias/busqueda-producto-criteria';
import {Sucursal} from '../../models/sucursal';
import {LoadingOverlayService} from '../../services/loading-overlay.service';
import {SucursalesService} from '../../services/sucursales.service';

@Component({
  selector: 'app-producto-modal',
  templateUrl: './producto-modal.component.html',
  styleUrls: ['./producto-modal.component.scss']
})
export class ProductoModalComponent implements OnInit {
  productos: Producto[] = [];
  clearLoading = false;
  loading = false;
  busqueda = '';

  productoSeleccionado: Producto = null;

  page = 0;
  totalElements = 0;
  totalPages = 0;
  size = 0;

  cantidadesInicialesPedido: { [idProducto: number]: number } = {};
  cantidadesActualesPedido: { [idProducto: number]: number } = {};

  sucursal: Sucursal = null;

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

  @ViewChild('searchInput', { static: false }) searchInput: ElementRef;

  constructor(public activeModal: NgbActiveModal,
              public productosService: ProductosService,
              private sucursalesService: SucursalesService,
              private loadingOverlayService: LoadingOverlayService) { }

  ngOnInit() {}

  getProductos(clearResults = false) {
    this.page += 1;
    if (clearResults) {
      this.clearLoading = true;
      this.page = 0;
      this.productos = [];
    } else {
      this.loading = true;
    }

    const criteria: BusquedaProductoCriteria = {
      codigo: this.busqueda,
      descripcion: this.busqueda,
      pagina: this.page,
    };
    this.productosService.buscar(criteria)
      .pipe(
        finalize(() => {
          this.loading = false;
          this.clearLoading = false;
        })
      )
      .subscribe((p: Pagination) => {
        p.content.forEach((e) => this.productos.push(e));
        this.totalElements = p.totalElements;
        this.totalPages = p.totalPages;
        this.size = p.size;
      })
    ;
  }

  buscar() {
    this.getProductos(true);
  }

  loadMore() {
    this.getProductos();
  }

  select(p: Producto) {
    this.productoSeleccionado = p;
  }

  seleccionarProducto() {
    if (this.productoSeleccionado) {
      this.activeModal.close(this.productoSeleccionado);
    }
  }

  getCantidad(p: Producto) {
    const c = this.productosService.getCantidad(p, this.idSucursal);
    const ci = this.cantidadesInicialesPedido[p.idProducto] || 0;
    const ca = this.cantidadesActualesPedido[p.idProducto] || 0;

    const res = c - (ca - ci);

    return res > 0 ? res : 0;
  }

  getCantOtrasSucursales(p: Producto) {
    const c = this.productosService.getCantidad(p, this.idSucursal);
    const cos = this.productosService.getCantOtrasSucursales(p, this.idSucursal);
    const ci = this.cantidadesInicialesPedido[p.idProducto] || 0;
    const ca = this.cantidadesActualesPedido[p.idProducto] || 0;

    let left = c - (ca - ci);
    left = left >= 0 ? 0 : left * -1;

    return cos - left;
  }
}
