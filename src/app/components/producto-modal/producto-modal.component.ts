import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Observable, of, Subject } from 'rxjs';
import { Producto } from '../../models/producto';
import { catchError, debounceTime, distinctUntilChanged, map, switchMap, tap } from 'rxjs/operators';
import { Pagination } from '../../models/pagination';
import { ProductosService } from '../../services/productos.service';

@Component({
  selector: 'app-producto-modal',
  templateUrl: './producto-modal.component.html',
  styleUrls: ['./producto-modal.component.scss']
})
export class ProductoModalComponent implements OnInit {
  productos: Producto[] = [];
  loading = false;
  input$  = new Subject<string>();

  productoSeleccionado: Producto = null;

  @ViewChild('searchInput', null) searchInput: ElementRef;

  constructor(public activeModal: NgbActiveModal,
              private productosService: ProductosService) { }

  ngOnInit() {
    this.loadProductos();
  }

  loadProductos() {
    this.input$.pipe(
      debounceTime(700),
      distinctUntilChanged(),
      tap(() => this.loading = true),
      switchMap(term => this.productosService.getProductos(term).pipe(
        map((v: Pagination) => v.content),
        catchError(() => of([])), // empty list on error
        tap(() => this.loading = false)
      ))
    ).subscribe(data => this.productos = data);
  }

  onSearchInputKeyUp($event) {
    this.input$.next($event.target.value);
  }

  rbFocus($event) {
    console.log($event);
  }

  select(p: Producto) {
    this.productoSeleccionado = p;
  }

  seleccionarProducto() {
    if (this.productoSeleccionado) {
      this.activeModal.close(this.productoSeleccionado);
    }
  }

  clearInput() {
    this.searchInput.nativeElement.value = '';
    this.productos = [];
    this.productoSeleccionado = null;
    this.searchInput.nativeElement.focus();
  }
}
