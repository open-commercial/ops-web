import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Observable, of, Subject } from 'rxjs';
import { Producto } from '../../models/producto';
import { catchError, debounceTime, distinctUntilChanged, finalize, map, switchMap, tap } from 'rxjs/operators';
import { Pagination } from '../../models/pagination';
import { ProductosService } from '../../services/productos.service';
import { SucursalesService } from '../../services/sucursales.service';
import { CantidadEnSucursal } from '../../models/cantidad-en-sucursal';

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
  input$  = new Subject<string>();

  productoSeleccionado: Producto = null;

  page = 0;
  totalElements = 0;
  totalPages = 0;
  size = 0;

  @ViewChild('searchInput', { static: false }) searchInput: ElementRef;

  constructor(public activeModal: NgbActiveModal,
              private productosService: ProductosService,
              private sucursalesService: SucursalesService) { }

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

    this.productosService.getProductos(this.busqueda, this.page)
      .pipe(
        finalize(() => {
          this.loading = false; this.clearLoading = false;
          if (clearResults) {
            setTimeout(() => this.searchInput.nativeElement.focus(), 300);
          }
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

  getCantOtrasSucursales(p: Producto) {
    const aux: Array<CantidadEnSucursal> = p.cantidadEnSucursales.filter(
      c => c.idSucursal === Number(this.sucursalesService.getIdSucursal())
    );
    const cant = aux.length ? aux[0].cantidad : 0;
    return p.cantidadTotalEnSucursales - cant;
  }
}
