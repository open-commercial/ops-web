import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { lastValueFrom, Subscription } from 'rxjs';
import { Rol } from 'src/app/models/rol';
import { AuthService } from 'src/app/services/auth.service';
import { ChartService } from 'src/app/services/chart.service';
import { NgbAccordionConfig } from '@ng-bootstrap/ng-bootstrap';
import { SucursalesService } from 'src/app/services/sucursales.service';
import { Sucursal } from 'src/app/models/sucursal';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent implements OnInit {
  loadingPurchaseData = true;
  loadingSalesData = true;
  purchaseData: any[] = [];
  salesData: any[] = [];
  rol = Rol;
  allowedRolesToView = [Rol.ADMINISTRADOR];
  sucursalSeleccionada: Sucursal = null;
  subscription: Subscription;

  constructor(private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private chartService: ChartService,
    private sucursalesService: SucursalesService,

    accordionConfig: NgbAccordionConfig) {

    accordionConfig.type = 'dark';
    this.subscription = new Subscription();
  }

  ngOnInit(): void {
    if (!this.authService.userHasAnyOfTheseRoles(this.allowedRolesToView)) {
      this.router.navigate(['pedidos']);
    }
    
    this.subscription.add(
      this.sucursalesService.sucursal$.subscribe((sucursal: Sucursal) => {
      this.sucursalSeleccionada = sucursal;
      this.resetData();
      this.loadPurchaseData();
      this.loadSalesData();
      this.cdr.detectChanges()
    })
   )
    this.loadPurchaseData();
    this.loadSalesData();
  }

  loadPurchaseData(): void {
    if(this.purchaseData.length > 0) {
      this.loadingPurchaseData = false;
      return;
    }

    this.loadingPurchaseData = true;
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;

    const componentPromises = [
      lastValueFrom(this.chartService.getChartDataPurchaseAnnual()),
      lastValueFrom(this.chartService.getChartDataPurchaseAnnualSupplier(currentYear)),
      lastValueFrom(this.chartService.getChartDataPurchaseMonth(currentYear)),
      lastValueFrom(this.chartService.getChartDataPurchaseMonthSupplier(currentYear, currentMonth)),
    ];

    Promise.all(componentPromises).then((data) => {
      this.purchaseData = data;
      this.loadingPurchaseData = false;
      this.cdr.detectChanges();
    }).catch(error => {
      console.error('Error cargando datos de compra:', error);
      this.loadingPurchaseData = false;
      this.cdr.detectChanges();
    })
  }

  loadSalesData(): void {
    if(this.salesData.length > 0) {
      this.loadingSalesData = false;
      return;
    }
    this.loadingSalesData = true;
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;

    const componentPromises = [
      lastValueFrom(this.chartService.getChartDataSalesAnnual()),
      lastValueFrom(this.chartService.getChartDataSalesAnnualSupplier(currentYear)),
      lastValueFrom(this.chartService.getChartDataSalesMonth(currentYear)),
      lastValueFrom(this.chartService.getChartDataSalesMonthSupplier(currentYear, currentMonth)),
    ];
    Promise.all(componentPromises).then((data) => {
      this.salesData = data;
      this.loadingSalesData = false;
      this.cdr.detectChanges();
    }).catch(error => {
      console.error('Error cargando datos de venta:', error);
      this.loadingSalesData = false;

      this.cdr.detectChanges();
    })
  }

  resetData(): void {
    this.purchaseData = [];
    this.salesData = [];
    this.loadingPurchaseData = true;
    this.loadingSalesData = true;
  }

  ngOnDestroy(): void {
      this.subscription.unsubscribe();
    }
}
  
