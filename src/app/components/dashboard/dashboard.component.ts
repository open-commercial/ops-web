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

  loadingData = true;
  rol = Rol;
  allowedRolesToView = [Rol.ADMINISTRADOR, Rol.ENCARGADO];

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
    else {
      this.loadingData = true;
      this.cdr.detectChanges();

      const currentYear = new Date().getFullYear();
      const currentMonth = new Date().getMonth() + 1;

      const componentPromises = [
        lastValueFrom(this.chartService.getChartDataPurchaseAnnual()),
        lastValueFrom(this.chartService.getChartDataPurchaseAnnualSupplier(currentYear)),
        lastValueFrom(this.chartService.getChartDataPurchaseMonth(currentYear)),
        lastValueFrom(this.chartService.getChartDataPurchaseMonthSupplier(currentYear, currentMonth)),
        lastValueFrom(this.chartService.getChartDataSalesAnnual()),
        lastValueFrom(this.chartService.getChartDataSalesAnnualSupplier(currentYear)),
        lastValueFrom(this.chartService.getChartDataSalesMonth(currentYear)),
        lastValueFrom(this.chartService.getChartDataSalesMonthSupplier(currentYear, currentMonth)),
      ];

      const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

      Promise.all(componentPromises).then(() => {
        return delay(300);
      }).then(() => {
        this.loadingData = false;
        this.cdr.detectChanges();
      }).catch(error => {
        console.error('Error loading data:', error);
        this.loadingData = false;
        this.cdr.detectChanges();
      });
    }
  }

}
