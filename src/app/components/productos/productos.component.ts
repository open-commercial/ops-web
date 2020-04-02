import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { SucursalesService } from '../../services/sucursales.service';
import { ActivatedRoute } from '@angular/router';
import { BusquedaProductoCriteria } from '../../models/criterias/busqueda-producto-criteria';
import { Rubro } from '../../models/rubro';
import { RubrosService } from '../../services/rubros.service';

@Component({
  selector: 'app-productos',
  templateUrl: './productos.component.html',
  styleUrls: ['./productos.component.scss']
})
export class ProductosComponent implements OnInit {
  // productos: Producto[] = [];

  isFiltersCollapsed = true;

  page = 0;
  totalElements = 0;
  totalPages = 0;
  size = 0;

  filterForm: FormGroup;
  applyFilters = [];

  ordenarPorOptions = [
    { val: 'fecha', text: 'Fecha' },
    { val: 'proveedor.razonSocial', text: 'Proveedor' },
    { val: 'total', text: 'Total' },
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
              private route: ActivatedRoute) { }

  ngOnInit() {
    this.getRubros();
    this.createFilterForm();
    this.sucursalesService.sucursal$.subscribe(() => this.getFacturasFromQueryParams());
    this.route.queryParamMap.subscribe(params => this.getFacturasFromQueryParams(params));
  }

  getRubros() {
    this.rubrosService.getRubros()
      .subscribe((rubros: Rubro[]) => this.rubros = rubros);
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
      terminos.publico = ps.visibilidad === 'público';
    }

    if (ps.ofertas) {
      this.filterForm.get('ofertas').setValue(true);
    }

  }

  getFacturasFromQueryParams(params = null, clearResults = true) {
    const terminos = this.getTerminosFromQueryParams(params);
    // this.getFacturas(clearResults, terminos);
  }

  createFilterForm() {
    this.filterForm = this.fb.group({
      codODes: '',
      idRubro: null,
      proveedor: null,
      visibilidad: null,
      ofertas: false,
      ordenarPor: this.ordenarPorOptions.length ? this.ordenarPorOptions[0].val : '',
      sentido: this.sentidoOptions.length ? this.sentidoOptions[0].val : '',
    });
  }

  resetFilterForm() {
    this.filterForm.reset({
      codODes: '',
      idRubro: null,
      proveedor: null,
      visibilidad: null,
      ofertas: null,
      ordenarPor: this.ordenarPorOptions.length ? this.ordenarPorOptions[0].val : '',
      sentido: this.sentidoOptions.length ? this.sentidoOptions[0].val : '',
    });
  }

  filter() {
  }
}
