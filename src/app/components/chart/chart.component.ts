import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ChartConfiguration, ChartOptions, ChartType } from "chart.js";
import { ChartService } from 'src/app/services/chart.service';

@Component({
  selector: 'app-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.scss']
})
export class ChartComponent implements OnInit {

  constructor(private chartData: ChartService,
              private cdr: ChangeDetectorRef) { }

  public barChartLegend = true;
  public barChartPlugins = [];

  public barChartData: ChartConfiguration<'bar'>['data'] = {
    labels: [],
    datasets: [
      { data: [], label: '' }
    ]
  };

  public barChartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    aspectRatio: 1.5
  };

  ngOnInit(): void {
    this.loadChartData();
  }

  loadChartData () {
    this.chartData.getChartData().subscribe(data => {
      this.barChartData.labels = data.labels;
      this.barChartData.datasets = data.datasets;
      this.cdr.detectChanges();
      console.log(data)
    })
  }
}
