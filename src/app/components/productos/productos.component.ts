import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { SucursalesService } from '../../services/sucursales.service';
import { ActivatedRoute, Router } from '@angular/router';
import { BusquedaProductoCriteria } from '../../models/criterias/busqueda-producto-criteria';
import { Rubro } from '../../models/rubro';
import { RubrosService } from '../../services/rubros.service';
import { LoadingOverlayService } from '../../services/loading-overlay.service';
import { finalize, map } from 'rxjs/operators';
import { MensajeService } from '../../services/mensaje.service';
import { MensajeModalType } from '../mensaje-modal/mensaje-modal.component';
import { Producto } from '../../models/producto';
import { Pagination } from '../../models/pagination';
import { ProductosService } from '../../services/productos.service';
import { Observable } from 'rxjs';
import { Proveedor } from '../../models/proveedor';
import { ProveedoresService } from '../../services/proveedores.service';
import { CantidadEnSucursal } from '../../models/cantidad-en-sucursal';

@Component({
  selector: 'app-productos',
  templateUrl: './productos.component.html',
  styleUrls: ['./productos.component.scss']
})
export class ProductosComponent implements OnInit {
  productos: Producto[] = [];
  isFiltersCollapsed = true;

  page = 0;
  totalElements = 0;
  totalPages = 0;
  size = 0;

  filterForm: FormGroup;
  applyFilters = [];

  ordenarPorOptions = [
    { val: 'descripcion', text: 'Descripción' },
    { val: 'codigo', text: 'Código' },
    { val: 'cantidadTotalEnSucursales', text: 'Total Sucursales' },
    { val: 'bulto', text: 'Venta x Cantidad' },
    { val: 'precioCosto', text: 'Precio Costo' },
    { val: 'gananciaPorcentaje', text: '% Ganancia' },
    { val: 'precioLista', text: 'Precio Lista' },
    { val: 'fechaAlta', text: 'Fecha Alta' },
  ];

  sentidoOptions = [
    { val: 'DESC', text: 'Descendente' },
    { val: 'ASC',  text: 'Ascendente' },
  ];

  ordenarPorAplicado = '';
  sentidoAplicado = '';

  rubros: Rubro[] = [];
  visibilidades = ['público', 'privado'];

  constructor(private fb: FormBuilder,
              private rubrosService: RubrosService,
              private sucursalesService: SucursalesService,
              private route: ActivatedRoute,
              private router: Router,
              public loadingOverlayService: LoadingOverlayService,
              private mensajeService: MensajeService,
              private productosService: ProductosService,
              private proveedoresService: ProveedoresService) { }

  ngOnInit() {
    this.getRubros();
    this.createFilterForm();
    this.sucursalesService.sucursal$.subscribe(() => this.getProductosFromQueryParams());
    this.route.queryParamMap.subscribe(params => this.getProductosFromQueryParams(params));
  }

  getRubros() {
    this.loadingOverlayService.activate();
    this.rubrosService.getRubros()
      .pipe(finalize(() => this.loadingOverlayService.deactivate()))
      .subscribe(
        (rubros: Rubro[]) => this.rubros = rubros,
        err => this.mensajeService.msg(err.error, MensajeModalType.ERROR)
      )
    ;
  }

  getTerminosFromQueryParams(params = null) {
    const terminos: BusquedaProductoCriteria = {
      pagina: 0,
    };

    this.resetFilterForm();
    const ps = params ? params.params : this.route.snapshot.queryParams;

    if (ps.codODes) {
      this.filterForm.get('codODes').setValue(ps.codODes);
      terminos.codigo = ps.codODes;
      terminos.descripcion = ps.codODes;
    }

    if (ps.idRubro && !isNaN(ps.idRubro)) {
      this.filterForm.get('idRubro').setValue(Number(ps.idRubro));
      terminos.idRubro = Number(ps.idRubro);
    }

    if (ps.idProveedor && !isNaN(ps.idProveedor)) {
      this.filterForm.get('idProveedor').setValue(Number(ps.idProveedor));
      terminos.idProveedor = Number(ps.idProveedor);
    }

    if (this.visibilidades.indexOf(ps.visibilidad) >= 0) {
      this.filterForm.get('visibilidad').setValue(ps.visibilidad);
      if (ps.visibilidad === 'público') { terminos.publico = true; }
      if (ps.visibilidad === 'privado') { terminos.publico = false; }
    }

    if (ps.oferta) {
      this.filterForm.get('oferta').setValue(true);
      terminos.oferta = true;
    }

    if (ps.ordenarPor) {
      this.filterForm.get('ordenarPor').setValue(ps.ordenarPor);
      terminos.ordenarPor = ps.ordenarPor;
    }

    if (ps.sentido) {
      this.filterForm.get('sentido').setValue(ps.sentido);
      terminos.sentido = ps.sentido;
    }

    return terminos;
  }

  getProductosFromQueryParams(params = null, clearResults = true) {
    const terminos = this.getTerminosFromQueryParams(params);
    this.getProductos(clearResults, terminos);
  }

  createFilterForm() {
    this.filterForm = this.fb.group({
      codODes: '',
      idRubro: null,
      idProveedor: null,
      visibilidad: null,
      oferta: false,
      ordenarPor: this.ordenarPorOptions.length ? this.ordenarPorOptions[0].val : '',
      sentido: this.sentidoOptions.length ? this.sentidoOptions[0].val : '',
    });
  }

  resetFilterForm() {
    this.filterForm.reset({
      codODes: '',
      idRubro: null,
      idProveedor: null,
      visibilidad: null,
      oferta: false,
      ordenarPor: this.ordenarPorOptions.length ? this.ordenarPorOptions[0].val : '',
      sentido: this.sentidoOptions.length ? this.sentidoOptions[0].val : '',
    });
  }

  getProductos(clearResults: boolean = false, terminos = null) {
    terminos = terminos || this.getFormValues();
    terminos.idSucursal = Number(this.sucursalesService.getIdSucursal());
    this.page += 1;
    this.loadingOverlayService.activate();
    if (clearResults) {
      this.page = 0;
      this.productos = [];
    }
    this.getApplyFilters();
    terminos.pagina = this.page;
    this.productosService.buscar(terminos)
      .pipe(finalize(() => this.loadingOverlayService.deactivate()))
      .subscribe((p: Pagination) => {
        p.content.forEach((e) => this.productos.push(e));
        this.totalElements = p.totalElements;
        this.totalPages = p.totalPages;
        this.size = p.size;
      })
    ;
  }

  filter() {
    const qParams = this.getFormValues();
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: qParams,
    });
    this.isFiltersCollapsed = true;
  }

  reset() {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: [],
    });
  }

  getFormValues() {
    const values = this.filterForm.value;
    const ret: {[k: string]: any} = {};

    if (values.codODes) { ret.codODes = values.codODes; }
    if (values.idRubro) { ret.idRubro = values.idRubro; }
    if (values.idProveedor) { ret.idProveedor = values.idProveedor; }
    if (values.visibilidad) { ret.visibilidad = values.visibilidad; }
    if (values.oferta) { ret.oferta = values.oferta; }
    if (values.ordenarPor) { ret.ordenarPor = values.ordenarPor; }
    if (values.sentido) { ret.sentido = values.sentido; }

    return ret;
  }

  getApplyFilters() {
    const values = this.filterForm.value;
    this.applyFilters = [];

    if (values.codODes) {
      this.applyFilters.push({ label: 'Código o descripción', value: values.codODes });
    }

    if (values.idRubro) {
      this.applyFilters.push({ label: 'Rubro', value: values.idRubro, asyncFn: this.getRubroInfoAsync(values.idRubro) });
    }

    if (values.idProveedor) {
      this.applyFilters.push({ label: 'Proveedor', value: values.idProveedor, asyncFn: this.getProveedorInfoAsync(values.idProveedor) });
    }

    if (values.visibilidad) {
      this.applyFilters.push({ label: 'Visibilidad', value: values.visibilidad });
    }

    if (values.oferta) {
      this.applyFilters.push({ label: 'Ofertas', value: 'Sí' });
    }
    this.ordenarPorAplicado = this.getTextoOrdenarPor();
    this.sentidoAplicado = this.getTextoSentido();
  }

  loadMore() {
    this.getProductosFromQueryParams(null, false);
  }

  getTextoOrdenarPor() {
    if (this.filterForm && this.filterForm.get('ordenarPor')) {
      const val = this.filterForm.get('ordenarPor').value;
      const aux = this.ordenarPorOptions.filter(e => e.val === val);
      return aux.length ? aux[0].text : '';
    }
    return '';
  }

  getTextoSentido() {
    if (this.filterForm && this.filterForm.get('sentido')) {
      const val = this.filterForm.get('sentido').value;
      const aux = this.sentidoOptions.filter(e => e.val === val);
      return aux.length ? aux[0].text : '';
    }
    return '';
  }

  getRubroInfoAsync(id: number): Observable<string> {
    return this.rubrosService.getRubro(id).pipe(map((r: Rubro) => r.nombre));
  }

  getProveedorInfoAsync(id: number): Observable<string> {
    return this.proveedoresService.getProveedor(id).pipe(map((p: Proveedor) => p.razonSocial));
  }

  getCantidad(p: Producto) {
    const aux: Array<CantidadEnSucursal> = p.cantidadEnSucursales.filter(
      c => c.idSucursal === Number(this.sucursalesService.getIdSucursal())
    );
    return aux.length ? aux[0].cantidad : 0;
  }

  getCantOtrasSucursales(p: Producto) {
    const aux: Array<CantidadEnSucursal> = p.cantidadEnSucursales.filter(
      c => c.idSucursal !== Number(this.sucursalesService.getIdSucursal())
    );
    let cant = 0;
    aux.forEach((ces: CantidadEnSucursal) => cant += ces.cantidad);
    return cant;
  }

  estaBonificado(p: Producto) {
    return p && p.precioBonificado && p.precioBonificado < p.precioLista;
  }

  verProducto(producto: Producto) {
    this.router.navigate(['/productos/ver', producto.idProducto]);
  }
}
