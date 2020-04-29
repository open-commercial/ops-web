import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
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
import { ListadoBaseComponent } from '../listado-base.component';
import { FiltroOrdenamientoComponent } from '../filtro-ordenamiento/filtro-ordenamiento.component';

@Component({
  selector: 'app-productos',
  templateUrl: './productos.component.html',
  styleUrls: ['./productos.component.scss']
})
export class ProductosComponent extends ListadoBaseComponent implements OnInit {
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
    { val: 'ASC', text: 'Ascendente' },
    { val: 'DESC', text: 'Descendente' },
  ];

  ordenarPorAplicado = '';
  sentidoAplicado = '';
  @ViewChild('ordernarPor', { static: false }) ordenarPorElement: FiltroOrdenamientoComponent;
  @ViewChild('sentido', { static: false }) sentidoElement: FiltroOrdenamientoComponent;

  rubros: Rubro[] = [];
  visibilidades = ['público', 'privado'];

  constructor(protected route: ActivatedRoute,
              protected router: Router,
              protected sucursalesService: SucursalesService,
              private fb: FormBuilder,
              private rubrosService: RubrosService,
              public loadingOverlayService: LoadingOverlayService,
              private mensajeService: MensajeService,
              public productosService: ProductosService,
              private proveedoresService: ProveedoresService) {
    super(route, router, sucursalesService);
  }

  ngOnInit() {
    super.ngOnInit();
    this.getRubros();
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

    let ordenarPorVal = this.ordenarPorOptions.length ? this.ordenarPorOptions[0].val : '';
    if (ps.ordenarPor) { ordenarPorVal = ps.ordenarPor; }
    this.filterForm.get('ordenarPor').setValue(ordenarPorVal);
    terminos.ordenarPor = ordenarPorVal;

    const sentidoVal = ps.sentido ? ps.sentido : 'ASC';
    this.filterForm.get('sentido').setValue(sentidoVal);
    terminos.sentido = sentidoVal;

    return terminos;
  }

  getItems(terminos) {
    this.loadingOverlayService.activate();
    this.productosService.buscar(terminos)
      .pipe(finalize(() => this.loadingOverlayService.deactivate()))
      .subscribe((p: Pagination) => {
        p.content.forEach((e) => this.items.push(e));
        this.totalElements = p.totalElements;
        this.totalPages = p.totalPages;
        this.size = p.size;
      })
    ;
  }

  createFilterForm() {
    this.filterForm = this.fb.group({
      codODes: '',
      idRubro: null,
      idProveedor: null,
      visibilidad: null,
      oferta: false,
      ordenarPor: '',
      sentido: '',
    });
  }

  resetFilterForm() {
    this.filterForm.reset({
      codODes: '',
      idRubro: null,
      idProveedor: null,
      visibilidad: null,
      oferta: false,
      ordenarPor: '',
      sentido: '',
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

  getAppliedFilters() {
    const values = this.filterForm.value;
    this.appliedFilters = [];

    if (values.codODes) {
      this.appliedFilters.push({ label: 'Código o descripción', value: values.codODes });
    }

    if (values.idRubro) {
      this.appliedFilters.push({ label: 'Rubro', value: values.idRubro, asyncFn: this.getRubroInfoAsync(values.idRubro) });
    }

    if (values.idProveedor) {
      this.appliedFilters.push({ label: 'Proveedor', value: values.idProveedor, asyncFn: this.getProveedorInfoAsync(values.idProveedor) });
    }

    if (values.visibilidad) {
      this.appliedFilters.push({ label: 'Visibilidad', value: values.visibilidad });
    }

    if (values.oferta) {
      this.appliedFilters.push({ label: 'Ofertas', value: 'Sí' });
    }

    setTimeout(() => {
      this.ordenarPorAplicado = this.ordenarPorElement ? this.ordenarPorElement.getTexto() : '';
      this.sentidoAplicado = this.sentidoElement ? this.sentidoElement.getTexto() : '';
    }, 500);
  }

  getRubroInfoAsync(id: number): Observable<string> {
    return this.rubrosService.getRubro(id).pipe(map((r: Rubro) => r.nombre));
  }

  getProveedorInfoAsync(id: number): Observable<string> {
    return this.proveedoresService.getProveedor(id).pipe(map((p: Proveedor) => p.razonSocial));
  }

  verProducto(producto: Producto) {
    this.router.navigate(['/productos/ver', producto.idProducto]);
  }
}
