import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { lastValueFrom } from 'rxjs';
import { Rol } from 'src/app/models/rol';
import { AuthService } from 'src/app/services/auth.service';
import { ChartService } from 'src/app/services/chart.service';
import { NgbAccordionConfig } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent implements OnInit {

  loadingPurchaseData = true;
  loadingSalesData = true;
  rol = Rol;
  allowedRolesToView = [Rol.ADMINISTRADOR];

  purchaseData: any = null;
  salesData: any = null;

  constructor(private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private chartService: ChartService,
    accordionConfig: NgbAccordionConfig) {

    accordionConfig.type = 'dark';
  }

  ngOnInit(): void {
    if (!this.authService.userHasAnyOfTheseRoles(this.allowedRolesToView)) {
      this.router.navigate(['/pedidos']);
    }
  }

  loadPurchaseData(): void {
    if (this.purchaseData) return

    this.loadingPurchaseData = true;
    this.cdr.detectChanges();
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
    if (this.salesData) return

    this.loadingSalesData = true;
    this.cdr.detectChanges();
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
  
}
